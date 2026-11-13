"""Find pharmacies so their details don't have to be typed.

Sources (all free, no API key):
- OpenStreetMap Nominatim: pharmacies around the Home Assistant home location, or by name.
- US NPI registry (CMS NPPES): every licensed US pharmacy, with phone numbers OSM often lacks.
- CHAINS: chain and mail-order pharmacies with their website and account sign-in page,
  which no public service provides.

Only the search words and the home area are sent out.
"""

from __future__ import annotations

import asyncio
import logging
import math
import re
import time
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import VERSION

_LOGGER = logging.getLogger(__name__)

USER_AGENT = f"HomeAssistant-Medications/{VERSION} (Home Assistant custom integration)"
NOMINATIM = "https://nominatim.openstreetmap.org"
NPI = "https://npiregistry.cms.hhs.gov/api/"
RADIUS_KM = 15          # "nearby" (no search words)
SEARCH_RADIUS_KM = 40   # searching by name

# keywords (lower case, matched against the name) -> details. login_url is the page where you sign in
# (or the pharmacy page with a sign-in link when the chain has no stable login address).
CHAINS: list[dict[str, Any]] = [
    {"keys": ["cvs"], "name": "CVS Pharmacy", "website": "https://www.cvs.com/pharmacy", "login_url": "https://www.cvs.com/account/login"},
    {"keys": ["walgreen"], "name": "Walgreens", "website": "https://www.walgreens.com/pharmacy", "login_url": "https://www.walgreens.com/login.jsp"},
    {"keys": ["walmart"], "name": "Walmart Pharmacy", "website": "https://www.walmart.com/cp/pharmacy/5431", "login_url": "https://www.walmart.com/account/login"},
    {"keys": ["sam's club", "sams club"], "name": "Sam's Club Pharmacy", "website": "https://www.samsclub.com/pharmacy", "login_url": "https://www.samsclub.com/login"},
    {"keys": ["costco"], "name": "Costco Pharmacy", "website": "https://www.costco.com/pharmacy", "login_url": "https://www.costco.com/LogonForm"},
    {"keys": ["fred meyer"], "name": "Fred Meyer Pharmacy", "website": "https://www.fredmeyer.com/d/pharmacy", "login_url": "https://www.fredmeyer.com/signin"},
    {"keys": ["qfc"], "name": "QFC Pharmacy", "website": "https://www.qfc.com/d/pharmacy", "login_url": "https://www.qfc.com/signin"},
    {"keys": ["kroger"], "name": "Kroger Pharmacy", "website": "https://www.kroger.com/d/pharmacy", "login_url": "https://www.kroger.com/signin"},
    {"keys": ["ralphs"], "name": "Ralphs Pharmacy", "website": "https://www.ralphs.com/d/pharmacy", "login_url": "https://www.ralphs.com/signin"},
    {"keys": ["king soopers"], "name": "King Soopers Pharmacy", "website": "https://www.kingsoopers.com/d/pharmacy", "login_url": "https://www.kingsoopers.com/signin"},
    {"keys": ["smith's", "smiths food"], "name": "Smith's Pharmacy", "website": "https://www.smithsfoodanddrug.com/d/pharmacy", "login_url": "https://www.smithsfoodanddrug.com/signin"},
    {"keys": ["fry's"], "name": "Fry's Pharmacy", "website": "https://www.frysfood.com/d/pharmacy", "login_url": "https://www.frysfood.com/signin"},
    {"keys": ["safeway"], "name": "Safeway Pharmacy", "website": "https://www.safeway.com/pharmacy.html", "login_url": "https://www.safeway.com/pharmacy.html"},
    {"keys": ["albertsons"], "name": "Albertsons Pharmacy", "website": "https://www.albertsons.com/pharmacy.html", "login_url": "https://www.albertsons.com/pharmacy.html"},
    {"keys": ["vons"], "name": "Vons Pharmacy", "website": "https://www.vons.com/pharmacy.html", "login_url": "https://www.vons.com/pharmacy.html"},
    {"keys": ["jewel"], "name": "Jewel-Osco Pharmacy", "website": "https://www.jewelosco.com/pharmacy.html", "login_url": "https://www.jewelosco.com/pharmacy.html"},
    {"keys": ["publix"], "name": "Publix Pharmacy", "website": "https://www.publix.com/pharmacy", "login_url": "https://www.publix.com/pharmacy"},
    {"keys": ["h-e-b", "heb"], "name": "H-E-B Pharmacy", "website": "https://www.heb.com/pharmacy", "login_url": "https://www.heb.com/pharmacy"},
    {"keys": ["hy-vee", "hyvee"], "name": "Hy-Vee Pharmacy", "website": "https://www.hy-vee.com/my-pharmacy", "login_url": "https://www.hy-vee.com/my-pharmacy"},
    {"keys": ["meijer"], "name": "Meijer Pharmacy", "website": "https://www.meijer.com/pharmacy", "login_url": "https://www.meijer.com/pharmacy"},
    {"keys": ["wegmans"], "name": "Wegmans Pharmacy", "website": "https://www.wegmans.com/pharmacy", "login_url": "https://www.wegmans.com/pharmacy"},
    {"keys": ["target"], "name": "CVS Pharmacy in Target", "website": "https://www.cvs.com/pharmacy", "login_url": "https://www.cvs.com/account/login"},
    {"keys": ["kaiser"], "name": "Kaiser Permanente Pharmacy", "website": "https://healthy.kaiserpermanente.org/pharmacy", "login_url": "https://healthy.kaiserpermanente.org/sign-on"},
]
MAIL_ORDER: list[dict[str, Any]] = [
    {"keys": ["amazon"], "name": "Amazon Pharmacy", "website": "https://pharmacy.amazon.com", "login_url": "https://pharmacy.amazon.com", "phone": "(855) 745-5725"},
    {"keys": ["express scripts", "evernorth"], "name": "Express Scripts", "website": "https://www.express-scripts.com", "login_url": "https://www.express-scripts.com"},
    {"keys": ["optum"], "name": "Optum Rx", "website": "https://www.optumrx.com", "login_url": "https://www.optumrx.com"},
    {"keys": ["caremark"], "name": "CVS Caremark", "website": "https://www.caremark.com", "login_url": "https://www.caremark.com"},
    {"keys": ["centerwell", "humana"], "name": "CenterWell Pharmacy", "website": "https://www.centerwellpharmacy.com", "login_url": "https://www.centerwellpharmacy.com"},
    {"keys": ["lilly", "gifthealth", "gift health"], "name": "LillyDirect", "website": "https://www.lillydirect.com", "login_url": "https://www.lillydirect.com"},
    {"keys": ["cost plus", "cuban"], "name": "Mark Cuban Cost Plus Drugs", "website": "https://costplusdrugs.com", "login_url": "https://costplusdrugs.com"},
    {"keys": ["va ", "veteran", "myhealthevet"], "name": "VA Pharmacy (My HealtheVet)", "website": "https://www.myhealth.va.gov", "login_url": "https://www.myhealth.va.gov"},
]


def _chain(name: str) -> dict[str, Any] | None:
    low = f" {name.lower()} "
    for chain in CHAINS + MAIL_ORDER:
        if any(k in low for k in chain["keys"]):
            return chain
    return None


def _km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = math.radians
    a = math.sin(r(lat2 - lat1) / 2) ** 2 + math.cos(r(lat1)) * math.cos(r(lat2)) * math.sin(r(lon2 - lon1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(a))


def _fmt_phone(raw: str | None) -> str:
    if not raw:
        return ""
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return raw.strip()


_PLAIN_WORDS = {"THE", "AND", "OF", "AVE", "ST", "RD", "DR", "LN", "WAY", "PL", "CT", "HWY", "STE", "BLVD", "PKWY",
                "CIR", "TRL", "LOOP", "FWY", "SQ", "TER", "ALY", "BAY", "INC", "LLC", "CO"}
_DIRECTIONS = {"n", "s", "e", "w", "ne", "nw", "se", "sw", "north", "south", "east", "west",
               "northeast", "northwest", "southeast", "southwest"}


def _title(text: str) -> str:
    """NPI names are upper case: 'QFC PHARMACY #0883' -> 'QFC Pharmacy #0883', '560 W KATHLEEN AVE' -> '560 W Kathleen Ave'."""
    words = []
    for w in text.split():
        if len(w) <= 3 and w.isalpha() and w.upper() not in _PLAIN_WORDS:
            words.append(w)  # keep acronyms like CVS, QFC and directions like NE
        else:
            words.append(w.capitalize())
    return " ".join(words)


def _street_key(address: str) -> str:
    """'560 West Kathleen Avenue, ...' and '560 W KATHLEEN AVE' -> '560 kathleen'."""
    parts = re.findall(r"[a-z0-9]+", address.lower())
    if not parts or not parts[0].isdigit():
        return ""
    rest = [p for p in parts[1:4] if p not in _DIRECTIONS]
    return f"{parts[0]} {rest[0]}" if rest else ""


class PharmacyFinder:
    """Searches, with small caches so repeated searches don't hit the services again."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._area: dict[str, Any] | None = None
        self._cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}
        self._lock = asyncio.Lock()
        self._last_nominatim = 0.0

    async def _get(self, url: str, params: dict[str, Any]) -> Any:
        session = async_get_clientsession(self.hass)
        if url.startswith(NOMINATIM):
            # Nominatim usage policy: at most one request per second.
            wait = 1.1 - (time.monotonic() - self._last_nominatim)
            if wait > 0:
                await asyncio.sleep(wait)
            self._last_nominatim = time.monotonic()
        async with session.get(url, params=params, headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
                               timeout=aiohttp.ClientTimeout(total=20)) as resp:
            resp.raise_for_status()
            return await resp.json(content_type=None)

    async def _home_area(self) -> dict[str, Any]:
        """City/state/country of the home location (one reverse lookup, cached)."""
        if self._area is None:
            lat, lon = self.hass.config.latitude, self.hass.config.longitude
            area: dict[str, Any] = {"lat": lat, "lon": lon, "country": (self.hass.config.country or "").upper()}
            try:
                data = await self._get(f"{NOMINATIM}/reverse", {"lat": lat, "lon": lon, "format": "jsonv2", "zoom": 12,
                                                                 "addressdetails": 1})
                addr = data.get("address") or {}
                area["city"] = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("hamlet") or ""
                iso = addr.get("ISO3166-2-lvl4") or ""
                area["state"] = iso.split("-")[1] if iso.count("-") == 1 else ""
                area["country"] = area["country"] or (addr.get("country_code") or "").upper()
                area["postcode"] = (addr.get("postcode") or "")[:5]
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("reverse lookup failed: %s", err)
            self._area = area
        return self._area

    async def search(self, query: str) -> dict[str, Any]:
        query = (query or "").strip()[:80]
        key = query.lower()
        cached = self._cache.get(key)
        if cached and time.monotonic() - cached[0] < 600:
            return {"results": cached[1], "cached": True}
        async with self._lock:
            area = await self._home_area()
            results: list[dict[str, Any]] = []
            errors: list[str] = []
            try:
                results += await self._osm(query, area)
            except Exception as err:  # noqa: BLE001
                errors.append("OpenStreetMap")
                _LOGGER.warning("Pharmacy search (OpenStreetMap) failed: %s", err)
            if area.get("country") == "US" and area.get("state"):
                try:
                    results = self._merge(results, await self._npi(query, area))
                except Exception as err:  # noqa: BLE001
                    errors.append("NPI registry")
                    _LOGGER.warning("Pharmacy search (NPI) failed: %s", err)
            # Mail-order / online pharmacies have no storefront to find on a map.
            q = f" {key} "
            for mo in MAIL_ORDER:
                if not key or any(k in q for k in mo["keys"]) or key in mo["name"].lower():
                    results.append({"name": mo["name"], "address": "", "phone": mo.get("phone", ""), "website": mo["website"],
                                    "login_url": mo["login_url"], "distance_km": None, "sources": ["mail order"],
                                    "mail_order": True})
            for r in results:
                chain = _chain(r["name"])
                if chain:
                    r["website"] = chain["website"] if not r.get("website") or "store-locator" in r["website"] else r["website"]
                    r["login_url"] = r.get("login_url") or chain["login_url"]
                    r["chain"] = chain["name"]
            home_city = re.sub(r"[^a-z0-9]+", " ", (area.get("city") or "").lower()).strip()

            def order(r: dict[str, Any]) -> tuple:
                city = re.sub(r"[^a-z0-9]+", " ", (r.get("city") or "").lower()).strip()
                return (r.get("mail_order", False), r["distance_km"] is None, r["distance_km"] or 0,
                        city != home_city, city, r["name"])

            results.sort(key=order)
            seen: set[tuple[str, str]] = set()
            local = []
            for r in results:
                if r.get("mail_order"):
                    continue
                k = (_street_key(r["address"]) or r["address"].lower(), r["name"].lower()[:6])
                if k in seen:
                    continue
                seen.add(k)
                local.append(r)
            results = local[:40] + [r for r in results if r.get("mail_order")]
            self._cache[key] = (time.monotonic(), results)
            return {"results": results, "errors": errors, "area": {k: area.get(k) for k in ("city", "state", "country")}}

    async def _osm(self, query: str, area: dict[str, Any]) -> list[dict[str, Any]]:
        lat, lon = area["lat"], area["lon"]
        dlat = (SEARCH_RADIUS_KM if query else RADIUS_KM) / 111.0
        dlon = dlat / max(0.2, math.cos(math.radians(lat)))
        params = {"format": "jsonv2", "limit": 40, "extratags": 1, "addressdetails": 1, "bounded": 1,
                  "viewbox": f"{lon - dlon},{lat + dlat},{lon + dlon},{lat - dlat}", "q": query or "pharmacy"}
        data = await self._get(f"{NOMINATIM}/search", params)
        out = []
        for x in data:
            tags = x.get("extratags") or {}
            kind = x.get("type")
            is_pharmacy = kind in ("pharmacy", "chemist") or tags.get("healthcare") == "pharmacy" or tags.get("dispensing") == "yes"
            # Supermarkets/big-box stores often hold the pharmacy counter (Fred Meyer, Costco...).
            if not is_pharmacy and not (query and kind in ("supermarket", "department_store", "wholesale", "variety_store")):
                continue
            addr = x.get("address") or {}
            street = " ".join(p for p in (addr.get("house_number"), addr.get("road")) if p)
            city = addr.get("city") or addr.get("town") or addr.get("village") or ""
            state = (addr.get("ISO3166-2-lvl4") or "").split("-")[-1] if addr.get("ISO3166-2-lvl4") else addr.get("state", "")
            address = ", ".join(p for p in (street, city, " ".join(p for p in (state, addr.get("postcode")) if p)) if p)
            name = x.get("name") or tags.get("brand") or "Pharmacy"
            try:
                dist = round(_km(lat, lon, float(x["lat"]), float(x["lon"])), 1)
            except (KeyError, TypeError, ValueError):
                dist = None
            out.append({"name": name, "address": address, "phone": _fmt_phone(tags.get("phone") or tags.get("contact:phone")),
                        "website": tags.get("website") or tags.get("contact:website") or "", "login_url": "",
                        "distance_km": dist, "sources": ["OpenStreetMap"], "hours": tags.get("opening_hours", "")})
        return out

    async def _npi(self, query: str, area: dict[str, Any]) -> list[dict[str, Any]]:
        params = {"version": "2.1", "enumeration_type": "NPI-2", "taxonomy_description": "Pharmacy",
                  "state": area["state"], "limit": 200}
        zip3 = re.sub(r"\D", "", area.get("postcode") or "")[:3]
        if len(zip3) == 3:
            params["postal_code"] = f"{zip3}*"
        elif area.get("city"):
            params["city"] = re.sub(r"[^A-Za-z0-9 ]+", " ", area["city"]).strip()
        else:
            return []
        data = await self._get(NPI, params)
        words = [w for w in re.findall(r"[a-z0-9']+", query.lower()) if w not in ("pharmacy", "the", "rx")]
        out = []
        for r in data.get("results") or []:
            tax = " ".join(t.get("desc", "") for t in r.get("taxonomies") or [])
            if not re.search(r"Community/Retail|Mail Order|Clinic Pharmacy|Specialty", tax):
                continue
            dba = next((o["organization_name"] for o in r.get("other_names") or [] if o.get("organization_name")), "")
            name = _title(dba or (r.get("basic") or {}).get("organization_name", ""))
            loc = next((a for a in r.get("addresses") or [] if a.get("address_purpose") == "LOCATION"), None)
            if not loc:
                continue
            hay = f"{name} {(r.get('basic') or {}).get('organization_name', '')}".lower()
            if words and not all(w.rstrip("s") in hay for w in words):
                continue
            zip5 = (loc.get("postal_code") or "")[:5]
            address = ", ".join(p for p in (_title(loc.get("address_1", "")), _title(loc.get("city", "")),
                                            f"{loc.get('state', '')} {zip5}".strip()) if p)
            out.append({"name": name, "address": address, "phone": _fmt_phone(loc.get("telephone_number")), "website": "",
                        "login_url": "", "distance_km": None, "sources": ["NPI registry"], "npi": r.get("number"),
                        "city": _title(loc.get("city", ""))})
        return out

    @staticmethod
    def _merge(osm: list[dict[str, Any]], npi: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Fill OSM gaps (mostly phone) from the NPI entry at the same street address."""
        by_street: dict[str, dict[str, Any]] = {}
        for n in npi:
            k = _street_key(n["address"])
            if k:
                by_street.setdefault(k, n)
        used = set()
        for o in osm:
            n = by_street.get(_street_key(o["address"]))
            if n:
                used.add(id(n))
                # The registry lists the pharmacy counter's own number; the map often has the store's main line.
                o["phone"] = n["phone"] or o["phone"]
                if o["name"].lower() in n["name"].lower():
                    o["name"] = n["name"]  # "Costco" -> "Costco Pharmacy 773"
                o["sources"] = o["sources"] + ["NPI registry"]
                o["npi"] = n.get("npi")
                o["address"] = o["address"] if o["address"].count(",") >= 2 else n["address"]
        return osm + [n for n in npi if id(n) not in used]
