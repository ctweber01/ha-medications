"""Constants for the Medications (med_manager) integration."""

from typing import Final

DOMAIN: Final = "med_manager"
VERSION: Final = "0.2.1"
RELEASE_DATE: Final = "2026-11-13"
# Set once the project is on GitHub; shown on Settings > About.
REPO_URL: Final = "https://github.com/ctweber01/ha-medications"
SUPPORT_URL: Final = "https://www.buymeacoffee.com/chrisweber"

STORAGE_KEY: Final = "med_manager.data"
STORAGE_VERSION: Final = 1

PANEL_PATH: Final = "medications"
PANEL_TITLE: Final = "Medications"
PANEL_ICON: Final = "mdi:pill"
PANEL_ELEMENT: Final = "med-manager-panel"
STATIC_URL: Final = "/med_manager_static"

ACTION_PREFIX: Final = "MEDMGR_"
FAKE_ANDROID: Final = "fake_android"  # demo-only pretend phone; its notifications show inside the app
NOTIFY_GROUP: Final = "medications"

COLLECTIONS: Final = ("pharmacies", "medications", "users", "assignments")

DEFAULT_SETTINGS: Final = {
    "snooze_options": [10, 60],   # minutes offered as "Remind me in ..."
    "nag_interval": 15,           # minutes between repeats of an unanswered reminder
    "nag_count": 3,               # repeats after the first reminder
    "home_button": True,          # "When I get home" when the person is away
    "skip_button": True,
    "time_sensitive": True,       # iOS time-sensitive interruption level
    "catch_up_minutes": 90,       # after a restart, still send reminders this late
    "history_days": 365,
    "reorder_repeat_daily": True,  # re-send reorder reminders daily until Ordered / Not needed
    # What a dose reminder says. Placeholders: {label} (Morning...), {person}, {count}.
    "dose_notice": {
        "title": "💊 {label} medication",
        "show_person": "auto",      # auto (when more than one person) | always | never
        "show_dose": True,
        "show_strength": True,
        "show_instructions": True,
        "show_notes": False,
        "show_list": True,          # list each medication; off = just the summary line below
        "summary": "{count} to take",  # used when the list is hidden. Placeholders: {count} {label} {person}
    },
    # Buttons on a dose reminder, in this order. snooze uses snooze_options; {time} = "10 minutes".
    "dose_buttons": {
        "taken": {"on": True, "label": "✅ I've taken them"},
        "snooze": {"on": True, "label": "⏰ Remind me in {time}"},
        "home": {"on": True, "label": "🏠 Remind me when I get home"},
        "skip": {"on": True, "label": "⏭️ Skip this time"},
    },
    # What a reorder reminder says. Placeholder: {medication}.
    "reorder_notice": {
        "title": "📦 Time to reorder {medication}",
        "show_rx": True,
        "show_pharmacy": True,
        "show_phone": True,
        "show_for": True,
    },
    # Buttons on a reorder reminder. {rx} = " (Rx 1234)" when there is an Rx number.
    "reorder_buttons": {
        "ordered": {"on": True, "label": "✅ Ordered"},
        "snooze": {"on": True, "label": "⏰ Snooze 1 day"},
        "not_needed": {"on": True, "label": "⏭️ Not needed this time"},
        "call": {"on": True, "label": "📞 Call pharmacy"},
        "site": {"on": True, "label": "🌐 Open pharmacy account"},
    },
    # Android phones only (iPhones are unaffected): Android shows at most 3 buttons, so pick them;
    # plus high priority (not held back by battery saving) and a notification channel of its own.
    # Button ids: taken, snooze0/snooze1/... (the "remind me later" delays in order), home, skip;
    # refills: ordered, snooze, not_needed, call, site.
    "android": {
        "dose_buttons": ["taken", "snooze0", "skip"],
        "reorder_buttons": ["ordered", "snooze", "call"],
        "priority": True,
        "channel": "Medications",
    },
    # Colour schemes saved by the user: [{id, name, base, card, colors: {accent, bg, card, text}}]
    "custom_schemes": [],
    # Demo mode: a made-up person with silly medications, to try reminders without real data.
    "demo": {"enabled": False, "notify": "", "only": True},  # only = hide real data in the app while demoing
    # Look of the app (shared by everyone using it).
    "appearance": {
        "theme": "auto",            # (older versions; replaced by scheme)
        "scheme": "Pastel",           # auto | light | dark | home (follow input_select.home_palette, if present) | a palette name
        "accent": "",               # "" = theme colour, else #rrggbb
        "card": "neu",              # raised | flat | glass | neu
        "neu_palette": "sage",      # neumorphism colours: sage | sky | stone | sand | night (from the Home dashboard)
        "glass_bg": "accent",       # glassmorphism backdrop: accent | aurora | sunset | ocean | forest | home | none
        "glass_tint": "auto",       # frosting: auto (theme) | light | dark | accent
        "glass_opacity": "clear",  # how see-through cards are: clear | medium | frosted
        "glass_blur": "medium",     # low | medium | high
        "glass_border": True,       # thin bright edge + highlight
        "density": "compact",       # comfortable | compact
        "text": "normal",           # normal | large
        "start_tab": "today",
        "hide_tabs": [],            # e.g. ["history", "pharmacies"]
        "med_icons": True,          # coloured pill icons next to medications
        # Colours picked on top of the scheme ("" = the scheme's own).
        "custom": {"accent": "", "bg": "", "card": "", "text": ""},
    },
}

DEFAULT_SLOTS: Final = [
    {"id": "morning", "name": "Morning", "time": "08:00"},
    {"id": "evening", "name": "Evening", "time": "20:00"},
]
