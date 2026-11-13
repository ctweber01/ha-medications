"""Medications: storage, schedules, reminders and notification actions."""

from __future__ import annotations

import logging
import re
import secrets
from collections.abc import Callable
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_time_change
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import recurrence
from .const import (
    FAKE_ANDROID,
    RELEASE_DATE,
    REPO_URL,
    VERSION,
    ACTION_PREFIX,
    COLLECTIONS,
    DEFAULT_SETTINGS,
    DEFAULT_SLOTS,
    NOTIFY_GROUP,
    PANEL_PATH,
    STORAGE_KEY,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

KEEP_REMINDER_DAYS = 8
DEMO_NAME = "Pill Popper Penelope"
MAX_HISTORY = 5000
OPEN_STATES = ("pending", "snoozed", "waiting_home", "scheduled")

# Fields each collection keeps; anything else from the UI is dropped.
_FIELDS = {
    "pharmacies": ("name", "phone", "address", "website", "login_url", "username", "lookup_url", "notes", "demo"),
    "medications": (
        "name", "strength", "form", "instructions", "pharmacy_id", "rx_number",
        "prescriber", "quantity", "notes", "reorder", "last_ordered", "source", "color", "demo",
    ),
    "users": ("name", "person", "notify", "slots", "color", "demo"),
    "assignments": ("user_id", "medication_id", "dose", "times", "schedule", "paused", "paused_at", "notes", "source", "demo"),
}


def _new_id() -> str:
    return secrets.token_hex(4)


def _hhmm(value: Any, default: str = "08:00") -> str:
    try:
        parts = str(value).split(":")
        h, m = int(parts[0]), int(parts[1]) if len(parts) > 1 else 0
        if 0 <= h <= 23 and 0 <= m <= 59:
            return f"{h:02d}:{m:02d}"
    except (TypeError, ValueError, IndexError):
        pass
    return default


def _s(value: Any, limit: int = 500) -> str:
    return ("" if value is None else str(value)).strip()[:limit]


class MedManager:
    """Holds all data and runs the reminder loop."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data: dict[str, Any] = {}
        self._listeners: set[Callable[[], None]] = set()
        self._unsubs: list[Callable[[], None]] = []
        self._fake_recent: set[str] = set()  # test tags last delivered to the fake Android phone

    # ------------------------------------------------------------------ lifecycle
    async def async_load(self) -> None:
        stored = await self._store.async_load() or {}
        self.data = self._from_stored(stored)
        self._snap_store: Store[dict[str, Any]] = Store(self.hass, 1, f"{STORAGE_KEY}.backups")
        self._snaps: list[dict[str, Any]] = list(((await self._snap_store.async_load()) or {}).get("items") or [])

    @staticmethod
    def _from_stored(stored: dict[str, Any]) -> dict[str, Any]:
        return {
            **{c: list(stored.get(c) or []) for c in COLLECTIONS},
            "settings": _merge_settings(stored.get("settings") or {}),
            "reminders": dict(stored.get("reminders") or {}),
            "reorders": dict(stored.get("reorders") or {}),
            "history": list(stored.get("history") or []),
            "fake_inbox": list(stored.get("fake_inbox") or []),
        }

    # ------------------------------------------------------------------ app backups
    # Small copies of just the Medications data: nightly (kept 14 days), by hand, and before every
    # restore/import, so a restore can itself be undone. Home Assistant's own backups include them too.
    def _counts(self, data: dict[str, Any]) -> dict[str, int]:
        return {c: len(data.get(c) or []) for c in COLLECTIONS}

    def backup(self, reason: str) -> dict[str, Any]:
        import copy

        data = copy.deepcopy({k: v for k, v in self.data.items() if k != "fake_inbox"})
        snap = {"id": secrets.token_hex(4), "ts": dt_util.now().isoformat(timespec="seconds"), "reason": reason,
                "counts": self._counts(data), "data": data}
        self._snaps.insert(0, snap)
        nightly = [x for x in self._snaps if x["reason"] == "nightly"][14:]
        others = [x for x in self._snaps if x["reason"] != "nightly"][16:]
        drop = {x["id"] for x in nightly + others}
        self._snaps = [x for x in self._snaps if x["id"] not in drop]
        self._snap_store.async_delay_save(lambda: {"items": self._snaps}, 1)
        return snap

    def list_snapshots(self) -> list[dict[str, Any]]:
        return [{k: v for k, v in x.items() if k != "data"} for x in self._snaps]

    def delete_snapshot(self, snap_id: str) -> None:
        self._snaps = [x for x in self._snaps if x["id"] != snap_id]
        self._snap_store.async_delay_save(lambda: {"items": self._snaps}, 1)

    def restore_snapshot(self, snap_id: str) -> dict[str, Any]:
        snap = next((x for x in self._snaps if x["id"] == snap_id), None)
        if not snap:
            raise ValueError("backup not found")
        self.backup("before restore")
        self._replace_data(snap["data"])
        return snap

    def export_data(self) -> dict[str, Any]:
        import copy

        return {"app": "med_manager", "version": VERSION, "exported": dt_util.now().isoformat(timespec="seconds"),
                "data": copy.deepcopy({k: v for k, v in self.data.items() if k != "fake_inbox"})}

    def import_data(self, payload: dict[str, Any]) -> dict[str, int]:
        data = payload.get("data") if isinstance(payload.get("data"), dict) else payload
        if not isinstance(data, dict) or not any(isinstance(data.get(c), list) for c in COLLECTIONS):
            raise ValueError("this file isn't a Medications export")
        self.backup("before import")
        self._replace_data(data)
        return self._counts(self.data)

    def _replace_data(self, data: dict[str, Any]) -> None:
        import copy

        self.data = self._from_stored(copy.deepcopy(data))
        self._save()

    @callback
    def _nightly_cb(self, _now: datetime) -> None:
        self.backup("nightly")

    @callback
    def async_start(self) -> None:
        self._unsubs.append(async_track_time_change(self.hass, self._tick_cb, second=3))
        self._unsubs.append(async_track_time_change(self.hass, self._nightly_cb, hour=3, minute=0, second=20))
        self._unsubs.append(self.hass.bus.async_listen("mobile_app_notification_action", self._action_cb))
        self.hass.async_create_task(self._tick())

    @callback
    def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()

    def _save(self) -> None:
        self._store.async_delay_save(lambda: self.data, 2)
        for listener in list(self._listeners):
            try:
                listener()
            except Exception:  # noqa: BLE001
                _LOGGER.exception("listener failed")

    @callback
    def subscribe(self, listener: Callable[[], None]) -> Callable[[], None]:
        self._listeners.add(listener)
        return lambda: self._listeners.discard(listener)

    # ------------------------------------------------------------------ lookups
    def _get(self, collection: str, item_id: str | None) -> dict[str, Any] | None:
        if not item_id:
            return None
        return next((x for x in self.data[collection] if x.get("id") == item_id), None)

    def _today(self) -> date:
        return dt_util.now().date()

    # ------------------------------------------------------------------ editing
    def _clean(self, collection: str, item: dict[str, Any], old: dict[str, Any] | None) -> dict[str, Any]:
        today = self._today()
        out: dict[str, Any] = {k: v for k, v in (old or {}).items()}
        for key in _FIELDS[collection]:
            if key in item:
                out[key] = item[key]
        out["id"] = (old or {}).get("id") or _new_id()
        out["demo"] = bool(out.get("demo"))

        if collection == "pharmacies":
            for key in _FIELDS[collection]:
                out[key] = _s(out.get(key), 2000 if key == "notes" else 500)
            out["name"] = out["name"] or "Pharmacy"

        elif collection == "medications":
            for key in ("name", "strength", "form", "instructions", "rx_number", "prescriber", "quantity", "notes", "source"):
                out[key] = _s(out.get(key), 2000 if key == "notes" else 200)
            out["name"] = out["name"] or "Medication"
            if not self._get("pharmacies", out.get("pharmacy_id")):
                out["pharmacy_id"] = None
            ro = dict(out.get("reorder") or {})
            out["reorder"] = {
                "enabled": bool(ro.get("enabled")),
                "schedule": recurrence.normalize(ro.get("schedule") or {"freq": "monthly"}, today),
                "time": _hhmm(ro.get("time"), "09:00"),
                "user_ids": [u for u in ro.get("user_ids") or [] if self._get("users", u)],
            }
            out["last_ordered"] = _s(out.get("last_ordered"), 10) or None
            out["color"] = _color(out.get("color"))

        elif collection == "users":
            out["name"] = _s(out.get("name"), 80) or "Person"
            person = _s(out.get("person"), 120)
            out["person"] = person if person.startswith("person.") else None
            out["notify"] = [_s(n, 120).removeprefix("notify.") for n in out.get("notify") or [] if _s(n)]
            slots = []
            for slot in out.get("slots") or DEFAULT_SLOTS:
                slots.append({"id": _s(slot.get("id"), 40) or _new_id(), "name": _s(slot.get("name"), 40) or "Reminder",
                              "time": _hhmm(slot.get("time"))})
            out["slots"] = sorted(slots, key=lambda s: s["time"])
            out["color"] = _color(out.get("color"))

        elif collection == "assignments":
            if not self._get("users", out.get("user_id")) or not self._get("medications", out.get("medication_id")):
                raise ValueError("unknown person or medication")
            out["dose"] = _s(out.get("dose"), 80)
            times = []
            for t in out.get("times") or []:
                if t.get("slot"):
                    times.append({"slot": _s(t["slot"], 40)})
                elif t.get("time"):
                    times.append({"time": _hhmm(t["time"])})
            out["times"] = times
            out["schedule"] = recurrence.normalize(out.get("schedule"), today)
            was_paused = bool((old or {}).get("paused"))
            out["paused"] = bool(out.get("paused"))
            if out["paused"] and not was_paused:
                out["paused_at"] = today.isoformat()
            elif not out["paused"]:
                out["paused_at"] = None
            out["notes"] = _s(out.get("notes"), 1000)
        return out

    def save_item(self, collection: str, item: dict[str, Any]) -> dict[str, Any]:
        items = self.data[collection]
        old = self._get(collection, item.get("id"))
        new = self._clean(collection, item, old)
        if old:
            items[items.index(old)] = new
        else:
            items.append(new)
        self._save()
        return new

    def delete_item(self, collection: str, item_id: str) -> None:
        self.data[collection] = [x for x in self.data[collection] if x.get("id") != item_id]
        if collection == "users":
            self.data["assignments"] = [a for a in self.data["assignments"] if a.get("user_id") != item_id]
        elif collection == "medications":
            self.data["assignments"] = [a for a in self.data["assignments"] if a.get("medication_id") != item_id]
        elif collection == "pharmacies":
            for med in self.data["medications"]:
                if med.get("pharmacy_id") == item_id:
                    med["pharmacy_id"] = None
        self._save()

    def save_settings(self, settings: dict[str, Any]) -> None:
        self._apply_settings(self.data["settings"], settings)
        self._sync_demo()
        self._save()

    # ------------------------------------------------------------------ demo mode
    def _sync_demo(self) -> None:
        """Create or remove the demo person and their medications to match the Demo setting."""
        demo = self.data["settings"].get("demo") or {}
        users = [u for u in self.data["users"] if u.get("demo")]
        if not demo.get("enabled"):
            for u in users:
                self.data["reminders"] = {k: r for k, r in self.data["reminders"].items() if r.get("user_id") != u["id"]}
                self.data["history"] = [h for h in self.data["history"] if h.get("user_id") != u["id"]]
            demo_meds = {m["id"] for m in self.data["medications"] if m.get("demo")}
            self.data["reorders"] = {k: r for k, r in self.data["reorders"].items() if r.get("medication_id") not in demo_meds}
            self.data["assignments"] = [a for a in self.data["assignments"] if not a.get("demo")]
            self.data["users"] = [u for u in self.data["users"] if not u.get("demo")]
            self.data["medications"] = [m for m in self.data["medications"] if not m.get("demo")]
            self.data["pharmacies"] = [p for p in self.data["pharmacies"] if not p.get("demo")]
            self.data["fake_inbox"] = []
            return
        target = _s(demo.get("notify"), 120).removeprefix("notify.")
        notify = [target] if target else []
        if users:
            for u in users:
                name = DEMO_NAME if u.get("name") == "Demo Dana" else u.get("name")
                if u.get("notify") != notify or name != u.get("name"):
                    self.save_item("users", {**u, "notify": notify, "name": name})
            return
        self._create_demo(notify)

    def _create_demo(self, notify: list[str]) -> None:
        today = self._today().isoformat()
        wednesday = (self._today() + timedelta(days=(2 - self._today().weekday()) % 7)).isoformat()
        pharm = self.save_item("pharmacies", {
            "demo": True, "name": "Totally Legit Pharmacy", "phone": "(555) 010-0199", "website": "https://example.com",
            "login_url": "https://example.com", "address": "123 Placebo Lane, Nowhere", "username": "pill.popper",
            "notes": "Open 25 hours a day, 8 days a week."})
        user = self.save_item("users", {
            "demo": True, "name": DEMO_NAME, "notify": notify, "color": "#ff7a14",
            "slots": [{"id": "morning", "name": "Morning", "time": "08:00"}, {"id": "lunch", "name": "Lunch", "time": "12:30"},
                      {"id": "evening", "name": "Evening", "time": "19:00"}, {"id": "bedtime", "name": "Bedtime", "time": "22:00"}]})
        meds = [
            ("Chill Pills", "10 mg", "tablet", "#4e8ea2", "take 2 when the kids get loud", "1 tablet",
             [{"slot": "evening"}], {"freq": "daily"}, {"enabled": False}),
            ("Unicorn Sparkles", "500 mg", "capsule", "#9b59b6", "shake well, sparkle responsibly", "2 capsules",
             [{"slot": "morning"}], {"freq": "daily"}, {"enabled": True, "schedule": {"freq": "monthly", "start": today}, "time": "09:00"}),
            ("Vitamin Sea", "1000 IU", "capsule", "#35bbca", "best taken at the beach", "1 capsule",
             [{"slot": "lunch"}], {"freq": "weekly", "weekdays": [5, 6]}, {"enabled": False}),
            ("Procrastinol", "5 mg", "tablet", "#e2b33f", "take tomorrow", "1 tablet",
             [{"slot": "morning"}, {"slot": "bedtime"}], {"freq": "daily"}, {"enabled": False}),
            ("Coffee-ine Booster", "8 oz", "liquid", "#c08a55", "before talking to anyone", "1 mug",
             [{"slot": "morning"}], {"freq": "daily"}, {"enabled": False}),
            ("Groan-B-Gone", "200 mg", "injection", "#e74c3c", "dad-joke suppressant", "1 pen",
             [{"slot": "evening"}], {"freq": "weekly", "interval": 2, "weekdays": [2], "start": wednesday},
             {"enabled": True, "schedule": {"freq": "weekly", "interval": 2, "weekdays": [2], "start": wednesday}, "time": "18:00"}),
        ]
        for i, (name, strength, form, color, instr, dose, times, sched, reorder) in enumerate(meds):
            med = self.save_item("medications", {
                "demo": True, "name": name, "strength": strength, "form": form, "color": color, "instructions": instr,
                "pharmacy_id": pharm["id"], "rx_number": f"DEMO-{4200 + i}", "prescriber": "Dr. Feelgood", "quantity": "30",
                "reorder": {**reorder, "user_ids": [user["id"]]}})
            self.save_item("assignments", {"demo": True, "user_id": user["id"], "medication_id": med["id"], "dose": dose,
                                           "times": times, "schedule": {"start": today, **sched}})

    async def with_settings(self, settings: dict[str, Any] | None, func: Callable[[], Any]) -> Any:
        """Run a test send using unsaved settings from the Settings screen, then put the saved ones back."""
        if not settings:
            return await func()
        saved = self.data["settings"]
        trial = {k: (dict(v) if isinstance(v, dict) else v) for k, v in saved.items()}
        self._apply_settings(trial, settings)
        self.data["settings"] = trial
        try:
            return await func()
        finally:
            self.data["settings"] = saved

    def _apply_settings(self, cur: dict[str, Any], settings: dict[str, Any]) -> None:
        for key, default in DEFAULT_SETTINGS.items():
            if key not in settings:
                continue
            val = settings[key]
            if key == "custom_schemes":
                cur[key] = _clean_schemes(val)
                continue
            if isinstance(default, dict):
                cur[key] = _clean_nested(default, val, cur.get(key) or {})
            elif isinstance(default, bool):
                cur[key] = bool(val)
            elif isinstance(default, list):
                opts = sorted({int(v) for v in (val or []) if str(v).strip().isdigit() and 0 < int(v) <= 720})
                cur[key] = opts[:4] or default
            else:
                try:
                    cur[key] = max(0, int(val))
                except (TypeError, ValueError):
                    pass

    # ------------------------------------------------------------------ schedule
    def _slot(self, user: dict[str, Any], slot_id: str) -> dict[str, Any] | None:
        return next((s for s in user.get("slots") or [] if s["id"] == slot_id), None)

    def schedule_for(self, user: dict[str, Any], day: date) -> list[dict[str, Any]]:
        """Reminder groups for one person on one day: [{time, label, ids}] sorted by time."""
        groups: dict[str, dict[str, Any]] = {}
        for a in self.data["assignments"]:
            if a.get("user_id") != user["id"] or a.get("paused"):
                continue
            if not recurrence.occurs_on(a.get("schedule") or {}, day):
                continue
            for t in a.get("times") or []:
                label = None
                if t.get("slot"):
                    slot = self._slot(user, t["slot"])
                    if not slot:
                        continue
                    hhmm, label = slot["time"], slot["name"]
                else:
                    hhmm = t["time"]
                g = groups.setdefault(hhmm, {"time": hhmm, "label": None, "ids": []})
                if label and not g["label"]:
                    g["label"] = label
                if a["id"] not in g["ids"]:
                    g["ids"].append(a["id"])
        for g in groups.values():
            slot = next((s for s in user.get("slots") or [] if s["time"] == g["time"]), None)
            g["label"] = g["label"] or (slot["name"] if slot else None) or _fmt_time(g["time"])
        return [groups[k] for k in sorted(groups)]

    @staticmethod
    def make_key(user_id: str, day: date, hhmm: str) -> str:
        return f"{user_id}.{day:%Y%m%d}.{hhmm.replace(':', '')}"

    def _due(self, day: date, hhmm: str) -> datetime:
        h, m = (int(x) for x in hhmm.split(":"))
        return dt_util.as_local(datetime(day.year, day.month, day.day, h, m, tzinfo=dt_util.get_default_time_zone()))

    def _new_reminder(self, user: dict[str, Any], day: date, group: dict[str, Any]) -> dict[str, Any]:
        key = self.make_key(user["id"], day, group["time"])
        rem = {
            "key": key, "user_id": user["id"], "date": day.isoformat(), "time": group["time"],
            "label": group["label"], "items": {aid: "pending" for aid in group["ids"]},
            "status": "scheduled", "next_at": None, "sent": 0, "snoozes": 0,
        }
        self.data["reminders"][key] = rem
        return rem

    # ------------------------------------------------------------------ the loop
    @callback
    def _tick_cb(self, _now: datetime) -> None:
        self.hass.async_create_task(self._tick())

    async def _tick(self) -> None:
        try:
            await self._tick_inner()
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Medications reminder loop failed")

    async def _tick_inner(self) -> None:
        now = dt_util.now()
        today = now.date()
        settings = self.data["settings"]
        catch_up = timedelta(minutes=int(settings.get("catch_up_minutes") or 90))
        changed = False

        # 1. New reminders that are due now.
        for user in self.data["users"]:
            for day in (today - timedelta(days=1), today):
                for group in self.schedule_for(user, day):
                    due = self._due(day, group["time"])
                    if due > now or now - due > catch_up:
                        continue
                    key = self.make_key(user["id"], day, group["time"])
                    rem = self.data["reminders"].get(key)
                    if rem is None:
                        rem = self._new_reminder(user, day, group)
                    if rem["status"] == "scheduled":
                        if any(v == "pending" for v in rem["items"].values()):
                            rem["status"] = "pending"
                            await self._send_reminder(rem)
                        else:
                            rem["status"] = "done"
                        changed = True

        # 2. Repeats, snoozes and "when I get home".
        for rem in list(self.data["reminders"].values()):
            status = rem.get("status")
            if status in ("pending", "snoozed") and rem.get("next_at"):
                if dt_util.parse_datetime(rem["next_at"]) <= now:
                    rem["status"] = "pending"
                    await self._send_reminder(rem)
                    changed = True
            elif status == "waiting_home":
                user = self._get("users", rem["user_id"])
                person = user and user.get("person")
                if person and self.hass.states.is_state(person, "home"):
                    rem["status"] = "pending"
                    rem["sent"] = 0
                    await self._send_reminder(rem, arrived=True)
                    changed = True

        # 3. Reorder reminders.
        for med in self.data["medications"]:
            ro = med.get("reorder") or {}
            if not ro.get("enabled"):
                continue
            if recurrence.occurs_on(ro.get("schedule") or {}, today):
                due = self._due(today, ro.get("time") or "09:00")
                key = f"rx.{med['id']}.{today:%Y%m%d}"
                if due <= now and now - due <= catch_up and key not in self.data["reorders"]:
                    # A new refill date replaces an older one that was never answered.
                    for old in self.data["reorders"].values():
                        if old["medication_id"] == med["id"] and old.get("status") in ("pending", "later"):
                            old["status"] = "superseded"
                            old["next_at"] = None
                    self.data["reorders"][key] = {"key": key, "medication_id": med["id"], "date": today.isoformat(),
                                                  "status": "pending", "next_at": None}
                    await self._send_reorder(self.data["reorders"][key])
                    changed = True
        # Unanswered or snoozed reorder reminders come back (every day until Ordered / Not needed).
        for rx in list(self.data["reorders"].values()):
            if rx.get("status") in ("pending", "later") and rx.get("next_at") and dt_util.parse_datetime(rx["next_at"]) <= now:
                rx["status"] = "pending"
                await self._send_reorder(rx)
                changed = True

        # 4. Close out old days.
        changed |= self._close_old_days(today)
        if changed:
            self._save()

    def _close_old_days(self, today: date) -> bool:
        changed = False
        for key, rem in list(self.data["reminders"].items()):
            day = date.fromisoformat(rem["date"])
            if day < today and rem.get("status") in OPEN_STATES:
                due = self._due(day, rem["time"])
                if day < today - timedelta(days=1) or dt_util.now() - due > timedelta(hours=12):
                    for aid, state in rem["items"].items():
                        if state == "pending":
                            rem["items"][aid] = "missed"
                            self._log(rem, aid, "missed", "system")
                    rem["status"] = "done"
                    rem["next_at"] = None
                    changed = True
            if day < today - timedelta(days=KEEP_REMINDER_DAYS):
                del self.data["reminders"][key]
                changed = True
        for key, rx in list(self.data["reorders"].items()):
            if date.fromisoformat(rx["date"]) < today - timedelta(days=60):
                del self.data["reorders"][key]
                changed = True
        keep_after = (dt_util.now() - timedelta(days=int(self.data["settings"].get("history_days") or 365))).isoformat()
        hist = self.data["history"]
        if hist and (hist[0]["ts"] < keep_after or len(hist) > MAX_HISTORY):
            self.data["history"] = [h for h in hist if h["ts"] >= keep_after][-MAX_HISTORY:]
            changed = True
        return changed

    def _log(self, rem: dict[str, Any], aid: str, action: str, source: str) -> None:
        a = self._get("assignments", aid) or {}
        med = self._get("medications", a.get("medication_id")) or {}
        self.data["history"].append({
            "ts": dt_util.now().isoformat(timespec="seconds"), "user_id": rem["user_id"], "assignment_id": aid,
            "medication": " ".join(x for x in (med.get("name"), med.get("strength")) if x) or "?",
            "dose": a.get("dose") or "", "date": rem["date"], "time": rem["time"], "action": action, "source": source,
        })

    # ------------------------------------------------------------------ notifications
    def _notify_targets(self, user: dict[str, Any]) -> list[str]:
        services = self.hass.services.async_services_for_domain("notify")
        return [n for n in user.get("notify") or [] if n in services or (n == FAKE_ANDROID and user.get("demo"))]

    def platforms(self) -> dict[str, str]:
        """notify service -> "android" / "ios", from each Companion app's registration."""
        from homeassistant.util import slugify

        out = {FAKE_ANDROID: "android"}
        for entry in self.hass.config_entries.async_entries("mobile_app"):
            name = entry.data.get("device_name") or entry.title or ""
            os_name = str(entry.data.get("os_name") or "").lower()
            out[f"mobile_app_{slugify(name)}"] = "android" if "android" in os_name else "ios" if os_name else "other"
        return out

    def _for_platform(self, payload: dict[str, Any], platform: str) -> dict[str, Any]:
        """The notification as a given phone gets it. iPhones get it exactly as built; Android phones
        get their chosen (at most 3) buttons, high priority and their own channel."""
        data = dict(payload.get("data") or {})
        actions = [dict(a) for a in data.get("actions") or []]
        if platform == "android" and payload.get("message") != "clear_notification":
            a = self.data["settings"].get("android") or {}
            is_refill = any(x.get("_id") in ("ordered", "not_needed", "call", "site") for x in actions) or \
                str(data.get("tag", "")).startswith(("medmgr_rx.", "medmgr_test.rx_"))
            chosen = a.get("reorder_buttons" if is_refill else "dose_buttons") or []
            if actions:
                picked = [x for x in actions if x.get("_id") in chosen]
                if "home" in chosen and not any(x.get("_id") == "home" for x in actions):
                    # At home there's no "when I get home" button: let another one take its slot.
                    spare = [x for x in actions if x.get("_id") not in chosen]
                    spare.sort(key=lambda x: ["skip", "snooze1", "snooze0", "taken"].index(x["_id"])
                               if x.get("_id") in ("skip", "snooze1", "snooze0", "taken") else 9)
                    picked += spare[:1]
                actions = picked[:3]
            if a.get("priority", True):
                data["priority"] = "high"
                data["ttl"] = 0
            if a.get("channel"):
                data["channel"] = a["channel"]
            data.pop("push", None)  # iPhone-only
        for x in actions:
            x.pop("_id", None)
        if "actions" in data:
            data["actions"] = actions
        return {**payload, "data": data}

    async def _notify(self, services: list[str], payload: dict[str, Any]) -> list[str]:
        """Send to each service; returns the ones that failed."""
        failed = []
        plats = self.platforms() if services else {}
        for svc in services:
            msg = self._for_platform(payload, plats.get(svc, "ios"))
            if svc == FAKE_ANDROID:
                self._fake_deliver(msg)
                continue
            try:
                await self.hass.services.async_call("notify", svc, msg, blocking=True)
            except Exception as err:  # noqa: BLE001
                failed.append(svc)
                _LOGGER.warning("Medications: notify.%s failed: %s", svc, err)
        return failed

    def _fake_deliver(self, msg: dict[str, Any]) -> None:
        """The demo's pretend Android phone: keep the notification for the app to show."""
        inbox = self.data.setdefault("fake_inbox", [])
        tag = (msg.get("data") or {}).get("tag")
        if tag and msg.get("message") != "clear_notification":
            self._fake_recent.add(tag)
        if tag:
            inbox[:] = [n for n in inbox if n.get("tag") != tag]
        if msg.get("message") != "clear_notification":
            inbox.insert(0, {"ts": dt_util.now().isoformat(timespec="seconds"), "tag": tag, "title": msg.get("title", ""),
                             "message": msg.get("message", ""), "data": msg.get("data") or {}})
            del inbox[15:]
        self._save()

    def _fake_tag_seen(self, tag: str) -> bool:
        return tag in self._fake_recent

    def fake_inbox_op(self, op: str, tag: str | None = None) -> None:
        inbox = self.data.setdefault("fake_inbox", [])
        if op == "clear":
            inbox.clear()
        elif op == "dismiss" and tag:
            inbox[:] = [n for n in inbox if n.get("tag") != tag]
        self._save()

    async def _clear(self, services: list[str], tag: str) -> None:
        await self._notify(services, {"message": "clear_notification", "data": {"tag": tag}})

    def _med_line(self, aid: str) -> str:
        a = self._get("assignments", aid) or {}
        med = self._get("medications", a.get("medication_id")) or {}
        n = self.data["settings"].get("dose_notice") or {}
        name = " ".join(x for x in (med.get("name"), med.get("strength") if n.get("show_strength", True) else "") if x) or "Medication"
        extra = [x for x, on in ((a.get("dose"), n.get("show_dose", True)),
                                 (med.get("instructions"), n.get("show_instructions", True)),
                                 (a.get("notes"), n.get("show_notes", False))) if x and on]
        return f"• {name}" + (f" — {', '.join(extra)}" if extra else "")

    def _dose_message(self, user: dict[str, Any], label: str, ids: list[str]) -> str:
        """The list of medications, or just a summary line when the list is turned off."""
        n = self.data["settings"].get("dose_notice") or {}
        if n.get("show_list", True):
            return "\n".join(self._med_line(aid) for aid in ids)
        count = f"{len(ids)} medication{'s' if len(ids) != 1 else ''}"
        return _fill(n.get("summary") or "{count} to take", count=count, label=label, person=user["name"]) or count

    def _dose_title(self, user: dict[str, Any], when: str, count: int) -> str:
        n = self.data["settings"].get("dose_notice") or {}
        title = _fill(n.get("title") or "💊 {label} medication", label=when, person=user["name"], count=str(count))
        show = n.get("show_person", "auto")
        if "{person}" not in (n.get("title") or "") and (show == "always" or (show == "auto" and len(self.data["users"]) > 1)):
            # put the name after a leading emoji, e.g. "💊 Alex: Morning medication"
            head, _, rest = title.partition(" ")
            title = f"{head} {user['name']}: {rest}" if rest and not head[:1].isalnum() else f"{user['name']}: {title}"
        return title

    async def _send_reminder(self, rem: dict[str, Any], arrived: bool = False) -> None:
        user = self._get("users", rem["user_id"])
        if not user:
            return
        settings = self.data["settings"]
        pending = [aid for aid, st in rem["items"].items() if st == "pending" and self._get("assignments", aid)]
        if not pending:
            rem["status"] = "done"
            rem["next_at"] = None
            return
        now = dt_util.now()
        rem["sent"] = int(rem.get("sent") or 0) + 1
        nag_count = int(settings.get("nag_count") or 0)
        nag_interval = max(1, int(settings.get("nag_interval") or 15))
        rem["next_at"] = (now + timedelta(minutes=nag_interval)).isoformat() if rem["sent"] <= nag_count else None
        rem["last_sent"] = now.isoformat()

        key = rem["key"]
        person = user.get("person")
        away = bool(person and self.hass.states.get(person) and not self.hass.states.is_state(person, "home"))
        actions = self._dose_actions(key, len(pending), away)

        day = date.fromisoformat(rem["date"])
        when = rem["label"] if day == self._today() else f"{rem['label']} ({day:%a})"
        title = self._dose_title(user, when, len(pending))
        if arrived:
            title = f"🏠 Welcome home — {when.lower()} medication"
        message = self._dose_message(user, rem["label"], pending)
        data: dict[str, Any] = {
            "tag": f"medmgr_{key}", "group": NOTIFY_GROUP, "actions": actions,
            "url": f"/{PANEL_PATH}", "clickAction": f"/{PANEL_PATH}",
        }
        if settings.get("time_sensitive"):
            data["push"] = {"interruption-level": "time-sensitive"}
        await self._notify(self._notify_targets(user), {"title": title, "message": message, "data": data})
        self.hass.bus.async_fire("med_manager_reminder", {"key": key, "user_id": user["id"], "user": user["name"],
                                                         "label": rem["label"], "count": len(pending)})

    def _dose_actions(self, key: str, count: int, away: bool) -> list[dict[str, Any]]:
        settings = self.data["settings"]
        b = settings.get("dose_buttons") or {}
        actions: list[dict[str, Any]] = []
        if _btn_on(b, "taken"):
            label = _btn_label(b, "taken")
            if count == 1 and label == DEFAULT_SETTINGS["dose_buttons"]["taken"]["label"]:
                label = "✅ I've taken it"
            actions.append({"_id": "taken", "action": f"{ACTION_PREFIX}TAKEN.{key}", "title": label})
        if _btn_on(b, "snooze"):
            for i, minutes in enumerate(settings.get("snooze_options") or []):
                actions.append({"_id": f"snooze{i}", "action": f"{ACTION_PREFIX}SNOOZE{int(minutes)}.{key}",
                                "title": _fill(_btn_label(b, "snooze"), time=_fmt_minutes(int(minutes)))})
        if _btn_on(b, "home") and away:
            actions.append({"_id": "home", "action": f"{ACTION_PREFIX}HOME.{key}", "title": _btn_label(b, "home")})
        if _btn_on(b, "skip"):
            actions.append({"_id": "skip", "action": f"{ACTION_PREFIX}SKIP.{key}", "title": _btn_label(b, "skip")})
        return actions

    def _reorder_users(self, med: dict[str, Any]) -> list[dict[str, Any]]:
        ids = (med.get("reorder") or {}).get("user_ids") or []
        if not ids:
            ids = {a["user_id"] for a in self.data["assignments"] if a.get("medication_id") == med["id"]}
        users = [u for u in self.data["users"] if u["id"] in ids]
        return users or list(self.data["users"])

    async def send_test_reorder(self, med_id: str, fake: bool = False) -> dict[str, Any]:
        """The real reorder notification with working buttons, marked as a test; changes nothing."""
        med = self._get("medications", med_id)
        if not med:
            raise ValueError("unknown medication")
        rx = {"key": f"test.rx_{med_id}", "medication_id": med_id, "date": self._today().isoformat()}
        targets = [FAKE_ANDROID] if fake else self._reorder_targets(med)
        if not fake:
            self._fake_recent.discard(f"medmgr_test.rx_{med_id}")
        failed = await self._send_reorder(rx, test=True, targets=targets)
        return {"sent": len(targets) - len(failed or []), "targets": targets, "failed": failed or []}

    async def _send_reorder(self, rx: dict[str, Any], test: bool = False, targets: list[str] | None = None) -> list[str] | None:
        med = self._get("medications", rx["medication_id"])
        if not med:
            return
        pharm = self._get("pharmacies", med.get("pharmacy_id")) or {}
        name = " ".join(x for x in (med.get("name"), med.get("strength")) if x)
        site = pharm.get("login_url") or pharm.get("website")
        phone = pharm.get("phone")
        if pharm.get("name") and not (site and phone):
            # Known chains / mail-order pharmacies fill what the saved pharmacy is missing.
            from .lookup import _chain

            chain = _chain(pharm["name"]) or {}
            site = site or chain.get("login_url") or chain.get("website")
            phone = phone or chain.get("phone")
        rx_no = (med.get("rx_number") or "").strip()
        n = self.data["settings"].get("reorder_notice") or {}
        b = self.data["settings"].get("reorder_buttons") or {}
        # Rx number and phone first, so they are on screen when calling the pharmacy.
        lines = []
        if rx_no and n.get("show_rx", True):
            lines.append(f"Rx # {rx_no}")
        parts = [pharm.get("name") if n.get("show_pharmacy", True) else "",
                 f"📞 {phone}" if phone and n.get("show_phone", True) else ""]
        if any(parts):
            lines.append(" · ".join(x for x in parts if x))
        takers = sorted({(self._get("users", a["user_id"]) or {}).get("name", "") for a in self.data["assignments"]
                         if a.get("medication_id") == med["id"]} - {""})
        if takers and n.get("show_for", True):
            lines.append("For " + ", ".join(takers))
        key = rx["key"]
        if not test:
            rx["sent"] = int(rx.get("sent") or 0) + 1
            rx["last_sent"] = dt_util.now().isoformat()
            # Ask again tomorrow (same time) unless it gets marked Ordered or Not needed.
            rx["next_at"] = ((dt_util.now() + timedelta(days=1)).isoformat()
                             if self.data["settings"].get("reorder_repeat_daily", True) else None)
        if int(rx.get("sent") or 0) > 1:
            first = date.fromisoformat(rx["date"])
            lines.insert(0, f"Reminder since {first:%a %b} {first.day}")
        actions = []
        for btn, verb in (("ordered", "ORDERED"), ("snooze", "LATER"), ("not_needed", "NOTNEEDED")):
            if _btn_on(b, btn):
                actions.append({"_id": btn, "action": f"{ACTION_PREFIX}{verb}.{key}", "title": _btn_label(b, btn, "reorder_buttons")})
        if phone and _btn_on(b, "call"):
            digits = "".join(c for c in phone if c.isdigit() or c == "+")
            # The button names the Rx number too, so it is in view while dialing.
            # With an Rx number, open the app's call screen (Rx # stays visible during the call);
            # without one, dial straight away.
            actions.append({"_id": "call", "action": "URI", "title": _fill(_btn_label(b, "call", "reorder_buttons"),
                                                           rx=f" (Rx {rx_no})" if rx_no else ""),
                            "uri": f"/{PANEL_PATH}?call={med['id']}" if rx_no else f"tel:{digits}"})
        if site and _btn_on(b, "site"):
            actions.append({"_id": "site", "action": "URI", "title": _btn_label(b, "site", "reorder_buttons"), "uri": site})
        data: dict[str, Any] = {"tag": f"medmgr_{key}", "group": NOTIFY_GROUP, "actions": actions,
                                "url": site or f"/{PANEL_PATH}", "clickAction": site or f"/{PANEL_PATH}"}
        title = _fill(n.get("title") or "📦 Time to reorder {medication}", medication=name)
        if test:
            title = f"🧪 Test — {title}"
            lines.append("This is only a test: Ordered / Snooze / Not needed won't change anything.")
        payload = {"title": title, "message": "\n".join(lines) or "Reorder reminder", "data": data}
        return await self._notify(targets if targets is not None else self._reorder_targets(med), payload)

    def _reorder_targets(self, med: dict[str, Any]) -> list[str]:
        targets: list[str] = []
        for user in self._reorder_users(med):
            targets += [t for t in self._notify_targets(user) if t not in targets]
        return targets

    # ------------------------------------------------------------------ actions
    @callback
    def _action_cb(self, event: Event) -> None:
        action = str(event.data.get("action") or "")
        if action.startswith(ACTION_PREFIX):
            self.hass.async_create_task(self.handle_action(action[len(ACTION_PREFIX):], "notification"))

    async def handle_action(self, action: str, source: str) -> None:
        verb, _, key = action.partition(".")
        if key.startswith("test."):
            await self._test_action(verb, key[5:])
            return
        if key.startswith("rx."):
            await self._reorder_action(verb, key)
            return
        rem = self.data["reminders"].get(key)
        if not rem:
            return
        user = self._get("users", rem["user_id"]) or {}
        targets = self._notify_targets(user) if user else []
        tag = f"medmgr_{key}"
        now = dt_util.now()
        if verb in ("TAKEN", "SKIP"):
            state = "taken" if verb == "TAKEN" else "skipped"
            for aid, st in rem["items"].items():
                if st == "pending":
                    rem["items"][aid] = state
                    self._log(rem, aid, state, source)
            rem["status"] = "done"
            rem["next_at"] = None
            await self._clear(targets, tag)
        elif verb.startswith("SNOOZE"):
            minutes = int(verb[6:] or 15)
            rem["status"] = "snoozed"
            rem["snoozes"] = int(rem.get("snoozes") or 0) + 1
            rem["sent"] = 0
            rem["next_at"] = (now + timedelta(minutes=minutes)).isoformat()
        elif verb == "HOME":
            person = user.get("person")
            if person and self.hass.states.is_state(person, "home"):
                rem["status"] = "snoozed"
                rem["next_at"] = (now + timedelta(minutes=15)).isoformat()
            else:
                rem["status"] = "waiting_home"
                rem["next_at"] = None
            rem["sent"] = 0
        self._save()

    async def _reorder_action(self, verb: str, key: str) -> None:
        rx = self.data["reorders"].get(key)
        if not rx:
            return
        med = self._get("medications", rx["medication_id"])
        if verb == "ORDERED":
            rx["status"] = "ordered"
            rx["next_at"] = None
            if med:
                med["last_ordered"] = self._today().isoformat()
        elif verb == "NOTNEEDED":
            rx["status"] = "skipped"
            rx["next_at"] = None
        elif verb == "LATER":
            rx["status"] = "later"
            rx["next_at"] = (dt_util.now() + timedelta(days=1)).isoformat()
        if verb in ("ORDERED", "NOTNEEDED") and med:
            await self._clear(self._reorder_targets(med), f"medmgr_{key}")
        self._save()

    async def reorder_panel_action(self, med_id: str, action: str) -> None:
        """Ordered / snooze / not needed from the panel, for the medication's open reorder reminder."""
        open_rx = [rx for rx in self.data["reorders"].values()
                   if rx["medication_id"] == med_id and rx.get("status") in ("pending", "later")]
        verb = {"ordered": "ORDERED", "snooze": "LATER", "skip": "NOTNEEDED"}[action]
        for rx in open_rx:
            await self._reorder_action(verb, rx["key"])
        if action == "ordered" and not open_rx:
            await self.reorder_mark(med_id, True)

    async def dose_action(self, user_id: str, day: date, hhmm: str, assignment_id: str | None, action: str) -> None:
        """Mark one item (or the whole group) from the panel. action: taken | skipped | undo."""
        user = self._get("users", user_id)
        if not user:
            raise ValueError("unknown person")
        key = self.make_key(user_id, day, hhmm)
        rem = self.data["reminders"].get(key)
        if rem is None:
            group = next((g for g in self.schedule_for(user, day) if g["time"] == hhmm), None)
            if not group:
                raise ValueError("nothing scheduled then")
            rem = self._new_reminder(user, day, group)
        ids = [assignment_id] if assignment_id else list(rem["items"])
        for aid in ids:
            if aid not in rem["items"]:
                rem["items"][aid] = "pending"
            if action == "undo":
                if rem["items"][aid] != "pending":
                    rem["items"][aid] = "pending"
                    self._log(rem, aid, "undo", "panel")
            elif rem["items"][aid] != action:
                rem["items"][aid] = action
                self._log(rem, aid, action, "panel")
        open_items = any(v == "pending" for v in rem["items"].values())
        due_passed = self._due(day, hhmm) <= dt_util.now()
        if not open_items:
            if rem["status"] in ("pending", "snoozed", "waiting_home"):
                await self._clear(self._notify_targets(user), f"medmgr_{key}")
            rem["status"] = "done"
            rem["next_at"] = None
        elif rem["status"] == "done":
            rem["status"] = "pending" if due_passed else "scheduled"
        self._save()

    async def reorder_mark(self, med_id: str, ordered: bool) -> None:
        med = self._get("medications", med_id)
        if med:
            med["last_ordered"] = self._today().isoformat() if ordered else None
            self._save()

    async def send_test(self, user_id: str, fake: bool = False) -> dict[str, Any]:
        """A test reminder with working buttons; pressing one sends a confirmation back."""
        user = self._get("users", user_id)
        if not user:
            raise ValueError("unknown person")
        targets = [FAKE_ANDROID] if fake else self._notify_targets(user)
        missing = [] if fake else [n for n in user.get("notify") or [] if n not in targets]
        key = f"test.{user_id}"
        if not fake:
            self._fake_recent.discard(f"medmgr_{key}")
        b = self.data["settings"].get("dose_buttons") or {}
        actions = []
        if _btn_on(b, "taken"):
            actions.append({"_id": "taken", "action": f"{ACTION_PREFIX}TAKEN.{key}", "title": _btn_label(b, "taken")})
        if _btn_on(b, "snooze"):
            actions.append({"_id": "snooze0", "action": f"{ACTION_PREFIX}SNOOZE1.{key}", "title": _fill(_btn_label(b, "snooze"), time="1 minute")})
        if _btn_on(b, "home"):
            actions.append({"_id": "home", "action": f"{ACTION_PREFIX}HOME.{key}", "title": _btn_label(b, "home") + " (shown when away)"})
        if _btn_on(b, "skip"):
            actions.append({"_id": "skip", "action": f"{ACTION_PREFIX}SKIP.{key}", "title": _btn_label(b, "skip")})
        data = {"tag": f"medmgr_{key}", "group": NOTIFY_GROUP, "actions": actions,
                "url": f"/{PANEL_PATH}", "clickAction": f"/{PANEL_PATH}"}
        if self.data["settings"].get("time_sensitive"):
            data["push"] = {"interruption-level": "time-sensitive"}
        failed = await self._notify(targets, {
            "title": "💊 Test reminder",
            "message": "This is only a test. Long-press (or pull down) this notification and tap a button to check they work.",
            "data": data})
        return {"sent": len(targets) - len(failed), "targets": targets, "failed": failed, "missing": missing}

    async def _test_reorder_action(self, verb: str, med_id: str) -> None:
        med = self._get("medications", med_id)
        if not med:
            return
        targets = self._reorder_targets(med) + ([FAKE_ANDROID] if self._fake_tag_seen(f"medmgr_test.rx_{med_id}") else [])
        await self._clear(targets, f"medmgr_test.rx_{med_id}")
        if verb == "LATER":
            fake = self._fake_tag_seen(f"medmgr_test.rx_{med_id}")

            async def again(_now: Any) -> None:
                await self.send_test_reorder(med_id, fake=fake)

            async_call_later(self.hass, 60, again)
            text = "“Snooze 1 day” works. A real reminder would come back tomorrow; this test comes back in 1 minute."
        else:
            text = {"ORDERED": "“Ordered” works. A real one would record today as the last order date and stop reminding.",
                    "NOTNEEDED": "“Not needed this time” works. A real one would stop until the next reorder date."}.get(verb, f"{verb} works.")
        self._test_result(text)

    def _test_result(self, text: str) -> None:
        """Note a test button press for the app to show (no extra notification on the phone)."""
        _LOGGER.info("Medications test button: %s", text)
        self.data["last_test"] = {"ts": dt_util.now().isoformat(), "text": text}
        self._save()

    async def _test_action(self, verb: str, user_id: str) -> None:
        if user_id.startswith("rx_"):
            await self._test_reorder_action(verb, user_id[3:])
            return
        user = self._get("users", user_id)
        if not user:
            return
        targets = self._notify_targets(user) + ([FAKE_ANDROID] if self._fake_tag_seen(f"medmgr_test.{user_id}") else [])
        if verb.startswith("SNOOZE"):
            await self._clear(targets, f"medmgr_test.{user_id}")

            fake = self._fake_tag_seen(f"medmgr_test.{user_id}")

            async def again(_now: Any) -> None:
                await self.send_test(user_id, fake=fake)

            async_call_later(self.hass, 60, again)
            text = "Snooze works: the test reminder will come back in 1 minute."
        else:
            await self._clear(targets, f"medmgr_test.{user_id}")
            text = {"TAKEN": "“Taken” works.", "SKIP": "“Skip” works.",
                    "HOME": "“When I get home” works (a real one waits until you arrive)."}.get(verb, f"{verb} works.")
        self._test_result(text)

    async def send_now(self, user_id: str, day: date, hhmm: str) -> None:
        """Send a group's reminder right away (panel 'Send now', for testing)."""
        user = self._get("users", user_id)
        if not user:
            raise ValueError("unknown person")
        key = self.make_key(user_id, day, hhmm)
        rem = self.data["reminders"].get(key)
        if rem is None:
            group = next((g for g in self.schedule_for(user, day) if g["time"] == hhmm), None)
            if not group:
                raise ValueError("nothing scheduled then")
            rem = self._new_reminder(user, day, group)
        rem["status"] = "pending"
        rem["sent"] = 0
        await self._send_reminder(rem)
        self._save()

    # ------------------------------------------------------------------ views
    def snapshot(self) -> dict[str, Any]:
        """Everything the panel needs, except history."""
        today = self._today()
        meds = []
        for med in self.data["medications"]:
            ro = med.get("reorder") or {}
            nxt = recurrence.next_dates(ro["schedule"], today, 1) if ro.get("enabled") and ro.get("schedule") else []
            meds.append({**med, "next_reorder": nxt[0].isoformat() if nxt else None,
                         "reorder_text": recurrence.describe(ro["schedule"]) if ro.get("schedule") else ""})
        assignments = [{**a, "schedule_text": recurrence.describe(a.get("schedule") or {})} for a in self.data["assignments"]]
        notify = sorted(self.hass.services.async_services_for_domain("notify"))
        persons = [{"entity_id": s.entity_id, "name": s.name, "state": s.state,
                    "picture": s.attributes.get("entity_picture"), "phones": self._person_phones(s, notify)}
                   for s in self.hass.states.async_all("person")]
        open_rx = [rx for rx in self.data["reorders"].values() if rx.get("status") in ("pending", "later")]
        return {
            "pharmacies": self.data["pharmacies"], "medications": meds, "users": self.data["users"],
            "assignments": assignments, "settings": self.data["settings"], "notify_services": notify,
            "persons": persons, "today": today.isoformat(), "open_reorders": open_rx,
            "medtrack_available": bool(self.hass.config_entries.async_entries("medtrack")),
            "last_test": self.data.get("last_test"),
            "default_settings": DEFAULT_SETTINGS,
            "about": {"version": VERSION, "date": RELEASE_DATE, "repo": REPO_URL},
            "platforms": self.platforms(),
            "fake_inbox": self.data.get("fake_inbox", []),
        }

    def day_view(self, day: date) -> list[dict[str, Any]]:
        """Per person: the day's reminder groups with each item's state."""
        now = dt_util.now()
        out = []
        for user in self.data["users"]:
            groups = []
            seen = set()
            for g in self.schedule_for(user, day):
                key = self.make_key(user["id"], day, g["time"])
                seen.add(key)
                rem = self.data["reminders"].get(key)
                ids = list(dict.fromkeys(g["ids"] + (list(rem["items"]) if rem else [])))
                groups.append(self._group_view(user, day, g["time"], g["label"], ids, rem, now))
            # Reminders that already went out for times no longer on the schedule.
            for key, rem in self.data["reminders"].items():
                if rem["user_id"] == user["id"] and rem["date"] == day.isoformat() and key not in seen:
                    groups.append(self._group_view(user, day, rem["time"], rem["label"], list(rem["items"]), rem, now))
            groups.sort(key=lambda g: g["time"])
            out.append({"user_id": user["id"], "groups": groups})
        return out

    def _group_view(self, user, day, hhmm, label, ids, rem, now) -> dict[str, Any]:
        due = self._due(day, hhmm)
        items = []
        for aid in ids:
            a = self._get("assignments", aid)
            if not a:
                continue
            med = self._get("medications", a.get("medication_id")) or {}
            state = (rem or {}).get("items", {}).get(aid) or ("due" if due <= now else "scheduled")
            if state == "pending" and due > now:
                state = "scheduled"
            items.append({"assignment_id": aid, "medication_id": med.get("id"), "name": med.get("name", "?"),
                          "strength": med.get("strength", ""), "dose": a.get("dose", ""),
                          "instructions": med.get("instructions", ""), "state": state})
        status = (rem or {}).get("status") or ("due" if due <= now else "scheduled")
        if status == "scheduled" and due <= now:
            status = "due"  # marked early in the app, time has now passed, not all taken
        return {"time": hhmm, "label": label, "status": status, "next_at": (rem or {}).get("next_at"), "items": items}

    def _person_phones(self, person_state: Any, notify: list[str]) -> list[str]:
        """Companion app notify services for a person's phones.

        The notify service is named after the device ("Sam's iPhone" -> mobile_app_sams_iphone),
        not after the tracker entity, so go tracker -> device -> name. Phones first; tablets, Macs,
        wall panels and watches only when there is no phone.
        """
        from homeassistant.helpers import device_registry as dr, entity_registry as er
        from homeassistant.util import slugify

        ent_reg, dev_reg = er.async_get(self.hass), dr.async_get(self.hass)
        phones, others = [], []
        for tracker in person_state.attributes.get("device_trackers") or []:
            entry = ent_reg.async_get(tracker)
            if not entry or entry.platform != "mobile_app" or not entry.device_id:
                continue
            device = dev_reg.async_get(entry.device_id)
            if not device:
                continue
            service = f"mobile_app_{slugify(device.name or '')}"
            if service not in notify:
                continue
            model = f"{device.model or ''} {device.name or ''}".lower()
            if "watch" in model or "tv" in model.split() or any(k in model for k in ("panel", "portal", "display", "kiosk")):
                continue
            (phones if any(k in model for k in ("iphone", "pixel", "galaxy", "sm-", "android", "phone")) else others).append(service)
        return phones or others

    def history(self, days: int, user_id: str | None) -> list[dict[str, Any]]:
        since = (dt_util.now() - timedelta(days=days)).isoformat()
        return [h for h in self.data["history"] if h["ts"] >= since and (not user_id or h["user_id"] == user_id)][::-1]

    # ------------------------------------------------------------------ MedTrack import
    def import_medtrack(self) -> dict[str, Any]:
        imported, skipped = [], []
        for entry in self.hass.config_entries.async_entries("medtrack"):
            targets = [str(t).removeprefix("notify.") for t in (entry.options.get("notify_targets") or entry.data.get("notify_targets") or [])]
            user = next((u for u in self.data["users"] if set(targets) & set(u.get("notify") or [])), None)
            if user is None:
                user = next((u for u in self.data["users"] if u["name"].lower() == entry.title.lower()), None)
            if user is None:
                person = next((s.entity_id for s in self.hass.states.async_all("person")
                               if s.name.split()[0].lower() == entry.title.split()[0].lower()), None)
            # Give every MedTrack time a named reminder time (Morning, Evening...) so they group nicely.
            all_times = sorted({_hhmm(t) for sub in getattr(entry, "subentries", {}).values()
                                if getattr(sub, "subentry_type", "") == "medication" for t in sub.data.get("times") or []})
            if user is None:
                slots = [{"id": _new_id(), "name": _part_of_day(t), "time": t} for t in all_times] or None
                user = self.save_item("users", {"name": entry.title, "notify": targets, "person": person, "slots": slots})
            slots = list(user.get("slots") or [])
            for hhmm in all_times:
                if any(s["time"] == hhmm for s in slots):
                    continue
                name = _part_of_day(hhmm)
                if any(s["name"] == name for s in slots):
                    name = f"{name} {_fmt_time(hhmm)}"
                slots.append({"id": _new_id(), "name": name, "time": hhmm})
            if slots != user.get("slots"):
                user = self.save_item("users", {**user, "slots": slots})
            for sub in getattr(entry, "subentries", {}).values():
                if getattr(sub, "subentry_type", "") != "medication":
                    continue
                source = f"medtrack:{sub.subentry_id}"
                if any(a.get("source") == source for a in self.data["assignments"]):
                    skipped.append(sub.title)
                    continue
                d = dict(sub.data)
                med = next((m for m in self.data["medications"] if m["name"].lower() == sub.title.lower()), None)
                if med is None:
                    med = self.save_item("medications", {"name": sub.title, "instructions": d.get("instructions") or "",
                                                         "source": "medtrack"})
                amount = d.get("dose_amount", 1)
                amount = int(amount) if float(amount).is_integer() else amount
                unit = d.get("unit") or "tablet"
                dose = f"{amount} {unit}{'' if amount == 1 or unit.endswith('s') else 's'}"
                times = []
                for t in d.get("times") or []:
                    hhmm = _hhmm(t)
                    slot = next((s for s in user["slots"] if s["time"] == hhmm), None)
                    times.append({"slot": slot["id"]} if slot else {"time": hhmm})
                days = [i for i, k in enumerate(("mon", "tue", "wed", "thu", "fri", "sat", "sun")) if k in (d.get("days") or [])]
                schedule = {"freq": "daily"} if not days or len(days) == 7 else {"freq": "weekly", "weekdays": days}
                self.save_item("assignments", {"user_id": user["id"], "medication_id": med["id"], "dose": dose, "times": times,
                                               "schedule": schedule, "paused": not d.get("active", True), "source": source})
                imported.append(f"{sub.title} → {user['name']}")
        return {"imported": imported, "skipped": skipped}


def _fmt_time(hhmm: str) -> str:
    h, m = (int(x) for x in hhmm.split(":"))
    return f"{(h % 12) or 12}:{m:02d} {'AM' if h < 12 else 'PM'}"


def _part_of_day(hhmm: str) -> str:
    h = int(hhmm.split(":")[0])
    return "Morning" if h < 11 else "Midday" if h < 14 else "Afternoon" if h < 17 else "Evening" if h < 21 else "Bedtime"


def _fmt_minutes(minutes: int) -> str:
    if minutes % 60 == 0:
        hours = minutes // 60
        return "1 hour" if hours == 1 else f"{hours} hours"
    return f"{minutes} minutes"


def _fill(text: str, **values: str) -> str:
    """Replace {name} placeholders without str.format (user text may contain other braces)."""
    for k, v in values.items():
        text = text.replace("{" + k + "}", v)
    return text


def _color(value: Any) -> str | None:
    v = _s(value, 20)
    return v if re.fullmatch(r"#[0-9a-fA-F]{6}", v) else None


def _btn_on(buttons: dict[str, Any], name: str) -> bool:
    return bool((buttons.get(name) or {}).get("on", True))


def _btn_label(buttons: dict[str, Any], name: str, group: str = "dose_buttons") -> str:
    label = _s((buttons.get(name) or {}).get("label"), 60)
    return label or DEFAULT_SETTINGS[group][name]["label"]


def _clean_nested(default: dict[str, Any], val: Any, cur: dict[str, Any]) -> dict[str, Any]:
    """Merge a settings section from the UI, keeping only known keys with the right types."""
    out = {**default, **cur}
    if not isinstance(val, dict):
        return out
    for k, d in default.items():
        if k not in val:
            continue
        v = val[k]
        if isinstance(d, dict):
            out[k] = _clean_nested(d, v, cur.get(k) or {})
        elif isinstance(d, bool):
            out[k] = bool(v)
        elif isinstance(d, list):
            out[k] = [_s(x, 40) for x in (v or []) if _s(x)][:10]
        else:
            out[k] = _s(v, 120)
    return out


def _merge_settings(stored: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for k, d in DEFAULT_SETTINGS.items():
        if isinstance(d, dict):
            out[k] = _clean_nested(d, stored.get(k) or {}, {})
        else:
            out[k] = stored.get(k, d)
    # Older versions had separate on/off switches for these two buttons.
    if "dose_buttons" not in stored:
        out["dose_buttons"]["home"]["on"] = bool(stored.get("home_button", True))
        out["dose_buttons"]["skip"]["on"] = bool(stored.get("skip_button", True))
    return out


def _clean_schemes(val: Any) -> list[dict[str, Any]]:
    out = []
    for sch in (val if isinstance(val, list) else [])[:30]:
        if not isinstance(sch, dict) or not _s(sch.get("name")):
            continue
        colors = sch.get("colors") if isinstance(sch.get("colors"), dict) else {}
        out.append({
            "id": re.sub(r"[^a-z0-9]", "", _s(sch.get("id"), 20).lower()) or secrets.token_hex(3),
            "name": _s(sch.get("name"), 40),
            "base": _s(sch.get("base"), 40) or "auto",
            "card": _s(sch.get("card"), 10) or "raised",
            "colors": {k: (_color(colors.get(k)) or "") for k in ("accent", "bg", "card", "text")},
        })
    return out
