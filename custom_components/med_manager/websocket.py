"""WebSocket API used by the sidebar panel."""

from __future__ import annotations

from datetime import date
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import ACTION_PREFIX, COLLECTIONS, DOMAIN


def _ready(hass: HomeAssistant, connection, msg) -> Any:
    mgr = hass.data.get(DOMAIN, {}).get("manager")
    if mgr is None:
        connection.send_error(msg["id"], "not_loaded", "Medications is not set up")
    return mgr


@callback
def async_register(hass: HomeAssistant) -> None:
    for handler in (ws_get, ws_day, ws_save, ws_delete, ws_settings, ws_dose, ws_test, ws_send_now,
                    ws_history, ws_import, ws_reorder, ws_subscribe, ws_find_pharmacy, ws_test_reorder, ws_fake_inbox, ws_backups):
        websocket_api.async_register_command(hass, handler)


@websocket_api.websocket_command({vol.Required("type"): "med_manager/get"})
@callback
def ws_get(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        connection.send_result(msg["id"], mgr.snapshot())


@websocket_api.websocket_command({vol.Required("type"): "med_manager/day", vol.Optional("date"): str})
@callback
def ws_day(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        day = date.fromisoformat(msg["date"]) if msg.get("date") else mgr._today()
        connection.send_result(msg["id"], {"date": day.isoformat(), "people": mgr.day_view(day)})


@websocket_api.websocket_command({
    vol.Required("type"): "med_manager/save",
    vol.Required("collection"): vol.In(COLLECTIONS),
    vol.Required("item"): dict,
})
@callback
def ws_save(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        try:
            item = mgr.save_item(msg["collection"], msg["item"])
        except ValueError as err:
            connection.send_error(msg["id"], "invalid", str(err))
            return
        connection.send_result(msg["id"], item)


@websocket_api.websocket_command({
    vol.Required("type"): "med_manager/delete",
    vol.Required("collection"): vol.In(COLLECTIONS),
    vol.Required("item_id"): str,  # not "id": that key is the WebSocket message number
})
@callback
def ws_delete(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        mgr.delete_item(msg["collection"], msg["item_id"])
        connection.send_result(msg["id"], {})


@websocket_api.websocket_command({vol.Required("type"): "med_manager/settings", vol.Required("settings"): dict})
@callback
def ws_settings(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        mgr.save_settings(msg["settings"])
        connection.send_result(msg["id"], mgr.data["settings"])


@websocket_api.websocket_command({
    vol.Required("type"): "med_manager/dose",
    vol.Required("user_id"): str,
    vol.Required("date"): str,
    vol.Required("time"): str,
    vol.Optional("assignment_id"): vol.Any(str, None),
    vol.Required("action"): vol.In(("taken", "skipped", "undo")),
})
@websocket_api.async_response
async def ws_dose(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        try:
            await mgr.dose_action(msg["user_id"], date.fromisoformat(msg["date"]), msg["time"],
                                  msg.get("assignment_id"), msg["action"])
        except ValueError as err:
            connection.send_error(msg["id"], "invalid", str(err))
            return
        connection.send_result(msg["id"], {})


@websocket_api.websocket_command({vol.Required("type"): "med_manager/test", vol.Required("user_id"): str,
                                  vol.Optional("settings"): dict, vol.Optional("fake", default=False): bool})
@websocket_api.async_response
async def ws_test(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        try:
            result = await mgr.with_settings(msg.get("settings"), lambda: mgr.send_test(msg["user_id"], fake=msg["fake"]))
        except ValueError as err:
            connection.send_error(msg["id"], "invalid", str(err))
            return
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "med_manager/send_now",
    vol.Required("user_id"): str,
    vol.Required("date"): str,
    vol.Required("time"): str,
})
@websocket_api.async_response
async def ws_send_now(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        try:
            await mgr.send_now(msg["user_id"], date.fromisoformat(msg["date"]), msg["time"])
        except ValueError as err:
            connection.send_error(msg["id"], "invalid", str(err))
            return
        connection.send_result(msg["id"], {})


@websocket_api.websocket_command({
    vol.Required("type"): "med_manager/history",
    vol.Optional("days", default=30): int,
    vol.Optional("user_id"): vol.Any(str, None),
})
@callback
def ws_history(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        connection.send_result(msg["id"], mgr.history(msg["days"], msg.get("user_id")))


@websocket_api.websocket_command({vol.Required("type"): "med_manager/import_medtrack"})
@websocket_api.require_admin
@callback
def ws_import(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        connection.send_result(msg["id"], mgr.import_medtrack())


@websocket_api.websocket_command({
    vol.Required("type"): "med_manager/reorder",
    vol.Required("medication_id"): str,
    vol.Optional("ordered"): bool,
    vol.Optional("action"): vol.In(("ordered", "snooze", "skip")),
})
@websocket_api.async_response
async def ws_reorder(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        action = msg.get("action") or ("ordered" if msg.get("ordered", True) else None)
        if action:
            await mgr.reorder_panel_action(msg["medication_id"], action)
        else:
            await mgr.reorder_mark(msg["medication_id"], False)
        connection.send_result(msg["id"], {})


@websocket_api.websocket_command({vol.Required("type"): "med_manager/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):

        @callback
        def changed() -> None:
            connection.send_message(websocket_api.event_message(msg["id"], {"changed": True}))

        connection.subscriptions[msg["id"]] = mgr.subscribe(changed)
        connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "med_manager/find_pharmacy", vol.Optional("query", default=""): str})
@websocket_api.async_response
async def ws_find_pharmacy(hass, connection, msg):
    from .lookup import PharmacyFinder

    finder = hass.data.setdefault(DOMAIN, {}).get("finder")
    if finder is None:
        finder = hass.data[DOMAIN]["finder"] = PharmacyFinder(hass)
    connection.send_result(msg["id"], await finder.search(msg["query"]))


@websocket_api.websocket_command({vol.Required("type"): "med_manager/test_reorder", vol.Required("medication_id"): str,
                                  vol.Optional("settings"): dict, vol.Optional("fake", default=False): bool})
@websocket_api.async_response
async def ws_test_reorder(hass, connection, msg):
    if mgr := _ready(hass, connection, msg):
        try:
            result = await mgr.with_settings(msg.get("settings"), lambda: mgr.send_test_reorder(msg["medication_id"], fake=msg["fake"]))
        except ValueError as err:
            connection.send_error(msg["id"], "invalid", str(err))
            return
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "med_manager/fake_inbox",
    vol.Required("op"): vol.In(("action", "dismiss", "clear")),
    vol.Optional("action"): str,
    vol.Optional("tag"): str,
})
@websocket_api.async_response
async def ws_fake_inbox(hass, connection, msg):
    """Buttons pressed on the demo's pretend Android phone (shown in the app)."""
    if mgr := _ready(hass, connection, msg):
        if msg["op"] == "action" and msg.get("action", "").startswith(ACTION_PREFIX):
            await mgr.handle_action(msg["action"][len(ACTION_PREFIX):], "notification")
            if msg.get("tag"):
                mgr.fake_inbox_op("dismiss", msg["tag"])
        else:
            mgr.fake_inbox_op(msg["op"], msg.get("tag"))
        connection.send_result(msg["id"], {})


@websocket_api.websocket_command({
    vol.Required("type"): "med_manager/backups",
    vol.Required("op"): vol.In(("list", "now", "restore", "delete", "export", "import")),
    vol.Optional("backup_id"): str,
    vol.Optional("payload"): dict,
})
@websocket_api.require_admin
@callback
def ws_backups(hass, connection, msg):
    """The app's own small backups (Settings > Backups)."""
    if mgr := _ready(hass, connection, msg):
        op = msg["op"]
        try:
            if op == "now":
                mgr.backup("manual")
            elif op == "restore":
                mgr.restore_snapshot(msg.get("backup_id", ""))
            elif op == "delete":
                mgr.delete_snapshot(msg.get("backup_id", ""))
            elif op == "export":
                connection.send_result(msg["id"], mgr.export_data())
                return
            elif op == "import":
                mgr.import_data(msg.get("payload") or {})
        except ValueError as err:
            connection.send_error(msg["id"], "invalid", str(err))
            return
        connection.send_result(msg["id"], {"backups": mgr.list_snapshots()})
