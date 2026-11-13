"""Repeat rules shared by dose schedules and reorder reminders.

A rule is a plain dict (stored as-is, mirrored in the panel's JS):

    {"freq": "daily" | "weekly" | "monthly",
     "interval": 1,               # every N days / weeks / months
     "weekdays": [0, 2],          # weekly only, Monday == 0
     "monthly_by": "day" | "weekday",  # monthly: same date, or e.g. "2nd Wednesday"
     "start": "2026-11-11",       # first possible date; also anchors every-N counting
     "end": None}                 # optional last date

Pure functions only, no Home Assistant imports, so they can be tested directly.
"""

from __future__ import annotations

import calendar
from datetime import date, timedelta
from typing import Any

FREQS = ("daily", "weekly", "monthly")


def _parse(value: Any, fallback: date) -> date:
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except (TypeError, ValueError):
        return fallback


def normalize(rule: dict[str, Any] | None, today: date) -> dict[str, Any]:
    """Fill defaults and clamp values so a rule from the UI is always valid."""
    rule = dict(rule or {})
    freq = rule.get("freq") if rule.get("freq") in FREQS else "daily"
    try:
        interval = max(1, min(int(rule.get("interval") or 1), 52))
    except (TypeError, ValueError):
        interval = 1
    start = _parse(rule.get("start"), today)
    weekdays = sorted({int(d) for d in rule.get("weekdays") or [] if str(d).isdigit() and 0 <= int(d) <= 6})
    if freq == "weekly" and not weekdays:
        weekdays = [start.weekday()]
    end_day = _parse(rule.get("end"), None) if rule.get("end") else None  # type: ignore[arg-type]
    end = end_day.isoformat() if end_day else None
    return {
        "freq": freq,
        "interval": interval,
        "weekdays": weekdays,
        "monthly_by": "weekday" if rule.get("monthly_by") == "weekday" else "day",
        "start": start.isoformat(),
        "end": end,
    }


def occurs_on(rule: dict[str, Any], day: date) -> bool:
    """Whether the rule includes this date."""
    start = _parse(rule.get("start"), day)
    if day < start:
        return False
    end = rule.get("end")
    if end and day > _parse(end, day):
        return False
    interval = max(1, int(rule.get("interval") or 1))
    freq = rule.get("freq", "daily")

    if freq == "daily":
        return (day - start).days % interval == 0

    if freq == "weekly":
        weekdays = rule.get("weekdays") or [start.weekday()]
        if day.weekday() not in weekdays:
            return False
        # Count whole weeks from the Monday of the start week.
        week0 = start - timedelta(days=start.weekday())
        return ((day - week0).days // 7) % interval == 0

    if freq == "monthly":
        months = (day.year - start.year) * 12 + (day.month - start.month)
        if months % interval:
            return False
        last = calendar.monthrange(day.year, day.month)[1]
        if rule.get("monthly_by") == "weekday":
            if day.weekday() != start.weekday():
                return False
            nth = (start.day - 1) // 7  # 0 = first ... 4 = fifth
            if nth >= 4:  # "last <weekday>" when the start was in the last week
                return day.day + 7 > last
            return (day.day - 1) // 7 == nth
        return day.day == min(start.day, last)

    return False


def next_dates(rule: dict[str, Any], after: date, count: int = 5, horizon_days: int = 800) -> list[date]:
    """The next `count` dates on or after `after`."""
    out: list[date] = []
    day = after
    for _ in range(horizon_days):
        if occurs_on(rule, day):
            out.append(day)
            if len(out) >= count:
                break
        day += timedelta(days=1)
    return out


_DAY_NAMES = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
_ORD = ("1st", "2nd", "3rd", "4th", "last")


def describe(rule: dict[str, Any]) -> str:
    """Short human summary, e.g. 'Every 2 weeks on Wed'."""
    freq = rule.get("freq", "daily")
    n = int(rule.get("interval") or 1)
    start = _parse(rule.get("start"), date.today())
    if freq == "daily":
        return "Every day" if n == 1 else f"Every {n} days"
    if freq == "weekly":
        days = rule.get("weekdays") or [start.weekday()]
        names = ", ".join(_DAY_NAMES[d] for d in days)
        if len(days) == 7 and n == 1:
            return "Every day"
        return (f"Weekly on {names}" if n == 1 else f"Every {n} weeks on {names}")
    if freq == "monthly":
        every = "Monthly" if n == 1 else f"Every {n} months"
        if rule.get("monthly_by") == "weekday":
            return f"{every} on the {_ORD[min((start.day - 1) // 7, 4)]} {_DAY_NAMES[start.weekday()]}"
        return f"{every} on day {start.day}"
    return ""
