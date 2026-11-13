"""Medications: pharmacies, prescriptions, per-person schedules and actionable reminders."""

from __future__ import annotations

import hashlib
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from . import websocket
from .const import DOMAIN, PANEL_ELEMENT, PANEL_ICON, PANEL_PATH, PANEL_TITLE, STATIC_URL, VERSION
from .manager import MedManager

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
_PANEL_FILE = "med-manager-panel.js"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    hass.data.setdefault(DOMAIN, {})
    websocket.async_register(hass)
    return True


def _tag(path: Path) -> str:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()[:10]
    except OSError:
        return VERSION


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    domain_data = hass.data.setdefault(DOMAIN, {})
    mgr = MedManager(hass)
    await mgr.async_load()
    domain_data["manager"] = mgr

    frontend_dir = Path(__file__).parent / "frontend"
    if not domain_data.get("static"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(frontend_dir), cache_headers=False)]
        )
        domain_data["static"] = True
    tag = await hass.async_add_executor_job(_tag, frontend_dir / _PANEL_FILE)
    if PANEL_PATH not in hass.data.get("frontend_panels", {}):
        await panel_custom.async_register_panel(
            hass=hass,
            frontend_url_path=PANEL_PATH,
            webcomponent_name=PANEL_ELEMENT,
            module_url=f"{STATIC_URL}/{_PANEL_FILE}?v={tag}",
            sidebar_title=PANEL_TITLE,
            sidebar_icon=PANEL_ICON,
            require_admin=False,
            embed_iframe=False,
            config={"version": VERSION},
        )
    mgr.async_start()
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    mgr = hass.data[DOMAIN].pop("manager", None)
    if mgr:
        mgr.async_stop()
    frontend.async_remove_panel(hass, PANEL_PATH)
    return True
