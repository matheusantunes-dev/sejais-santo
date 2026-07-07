from datetime import date, timedelta
from typing import Optional

from api.supabase_client import get_supabase_client
import os


# =====================================================================
# LITURGICAL CALENDAR — port of Laravel LiturgicalCalendar.php
#
# Liturgical year N starts on the 1st Sunday of Advent of calendar year N-1
# and ends the day before 1st Sunday of Advent of year N.
# E.g. liturgical year 2026 = Advent 2025 → Christ the King Nov 2026.
#
# Sunday cycle anchor: 2025 = A, 2026 = B, 2027 = C, repeats.
# Ferial cycle: odd start-year = I, even = II.
# Brazil: Ascension transferred to 7th Sunday of Easter (Easter+42).
# =====================================================================


def easter(year: int) -> date:
    """Gauss/Meeus computus — faithful to LiturgicalColorService.php algorithm."""
    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month = (h + l - 7 * m + 114) // 31
    day = ((h + l - 7 * m + 114) % 31) + 1
    return date(year, month, day)


def first_sunday_of_advent(year: int) -> date:
    """1st Sunday of Advent = 4 Sundays before Christmas.
    port of LiturgicalCalendar::firstSundayOfAdvent()"""
    dec25 = date(year, 12, 25)
    last_sunday = dec25 - timedelta(days=(dec25.weekday() + 1) % 7)
    return last_sunday - timedelta(weeks=3)


def baptism_of_lord(year: int) -> date:
    """Sunday after Epiphany (Jan 6). If Jan 6 is Sunday → next Sunday.
    port of LiturgicalCalendar::baptismOfLord()"""
    jan6 = date(year, 1, 6)
    if jan6.weekday() == 6:
        return jan6 + timedelta(days=7)
    days_to_sunday = (6 - jan6.weekday()) % 7
    return jan6 + timedelta(days=days_to_sunday)


def baptism_of_lord_color(year: int) -> date:
    """Baptism of the Lord for color purposes.
    port of LiturgicalColorService::baptismOfTheLord()
    If Epiphany (Jan 6) is Sunday → returns Monday (Jan 7), otherwise next Sunday."""
    jan6 = date(year, 1, 6)
    if jan6.weekday() == 6:
        return jan6 + timedelta(days=1)
    days_to_sunday = (6 - jan6.weekday()) % 7
    return jan6 + timedelta(days=days_to_sunday)


def ash_wednesday(year: int) -> date:
    """Easter - 46 days. port of LiturgicalCalendar::ashWednesday()"""
    return easter(year) - timedelta(days=46)


def pentecost(year: int) -> date:
    """Easter + 49 days. port of LiturgicalCalendar::pentecost()"""
    return easter(year) + timedelta(days=49)


def liturgical_start_year(d: date) -> int:
    """Calendar year in which Advent for this liturgical year starts.
    port of LiturgicalCalendar::liturgicalStartYear()"""
    y = d.year
    advent = first_sunday_of_advent(y)
    return y if d >= advent else y - 1


def sunday_cycle(start_year: int) -> str:
    """port of LiturgicalCalendar::sundayCycle()"""
    return ["A", "B", "C"][(start_year - 2025) % 3]


def ferial_cycle(start_year: int) -> str:
    """port of LiturgicalCalendar::ferialCycle()"""
    return "I" if start_year % 2 != 0 else "II"


def _to_monday(d: date) -> date:
    """Return the Monday of the week containing d."""
    return d - timedelta(days=d.weekday())


def _weeks_between(d1: date, d2: date) -> int:
    """Number of weeks between two dates (rounded)."""
    return int(round((d2 - d1).days / 7))


# =====================================================================
# NEW ARCHITECTURE — Single source of truth
# =====================================================================

# ── Color constants ──

VERDE = "verde"
ROXO = "roxo"
BRANCO = "branco"
VERMELHO = "vermelho"
ROSA = "rosa"
PRETO = "preto"

_COLOR_LABELS = {
    VERDE: "Verde – Tempo Comum",
    ROXO: "Roxo – Advento/Quaresma",
    BRANCO: "Branco/Dourado – Festa",
    VERMELHO: "Vermelho – Pentecostes/Mártir",
    ROSA: "Rosa – Gaudete/Laetare",
    PRETO: "Preto – Finados",
}

SEASON_COLOR = {
    "advento": ROXO,
    "quaresma": ROXO,
    "pascal": BRANCO,
    "natal": BRANCO,
    "comum": VERDE,
}


def _build_liturgical_days() -> dict[str, dict]:
    days: dict[str, dict] = {}

    def add(key, color, rank, season, celebration):
        days[key] = {
            "color": color,
            "rank": rank,
            "season": season,
            "celebration": celebration,
            "slug": None,
            "icon": None,
            "banner": None,
            "priority": None,
            "scope": None,
            "movable": None,
        }

    # ── Fixed solemnities ──
    add("CHRISTMAS",            BRANCO,    "solemnity", "natal",    "Natal do Senhor")
    add("EPIPHANY",             BRANCO,    "solemnity", "natal",    "Epifania do Senhor")
    add("MARY_MOTHER_GOD",      BRANCO,    "solemnity", "natal",    "Santa Mãe de Deus")
    add("ASSUMPTION",           BRANCO,    "solemnity", "comum",    "Assunção de Nossa Senhora")
    add("ALL_SAINTS",           BRANCO,    "solemnity", "comum",    "Todos os Santos")
    add("IMMACULATE_CONCEPTION", ROXO,     "solemnity", "natal",    "Imaculada Conceição")
    add("JOHN_BAPTIST_BIRTH",   BRANCO,    "solemnity", "comum",    "Natividade de São João Batista")
    add("PETER_PAUL",           BRANCO,    "solemnity", "comum",    "Santos Pedro e Paulo")
    add("ALL_SOULS",            ROXO,      "feast",     "comum",    "Finados")
    add("GOOD_FRIDAY",          VERMELHO,  "solemnity", "quaresma", "Sexta-feira da Paixão")
    add("EASTER_SUNDAY",        BRANCO,    "solemnity", "pascal",   "Domingo de Páscoa")
    add("ASH_WEDNESDAY",        ROXO,      "feast",     "quaresma", "Quarta-feira de Cinzas")
    add("PENTECOST",            VERMELHO,  "solemnity", "pascal",   "Pentecostes")
    add("CORPUS_CHRISTI",       BRANCO,    "solemnity", "comum",    "Corpus Christi")
    add("EXALTATION_CROSS",     VERMELHO,  "feast",     "comum",    "Exaltação da Santa Cruz")
    add("OUR_LADY_APARECIDA",   BRANCO,    "solemnity", "comum",    "Nossa Senhora Aparecida")
    add("CHRISTMAS_2ND",        BRANCO,    "feast",     "natal",    "2º Domingo do Natal")

    # ── Cycle-based entries (A, B, C) ──
    for cycle in ("A", "B", "C"):
        sfx = f"_{cycle}"

        add(f"BAPTISM{sfx}",      BRANCO,   "feast",     "natal",    "Batismo do Senhor")
        add(f"PALM{sfx}",         VERMELHO, "solemnity", "quaresma", "Domingo de Ramos")
        add(f"ASCENSION{sfx}",    BRANCO,   "solemnity", "pascal",   "Ascensão do Senhor")
        add(f"TRINITY{sfx}",      VERDE,    "solemnity", "comum",    "Santíssima Trindade")
        add(f"CHRIST_KING{sfx}",  VERDE,    "solemnity", "comum",    "Cristo Rei")
        add(f"HOLY_FAMILY{sfx}",  BRANCO,   "feast",     "natal",    "Sagrada Família")

        for w in range(1, 5):
            season = "advento"
            color = SEASON_COLOR[season]
            add(f"ADVENT_{w}{sfx}", color, "sunday", season, f"{w}º Domingo do Advento")

        for w in range(1, 6):
            season = "quaresma"
            color = SEASON_COLOR[season]
            add(f"LENT_{w}{sfx}", color, "sunday", season, f"{w}º Domingo da Quaresma")

        for w in range(2, 7):
            season = "pascal"
            color = SEASON_COLOR[season]
            add(f"EASTER_{w}{sfx}", color, "sunday", season, f"{w}º Domingo da Páscoa")

        for w in range(2, 34):
            season = "comum"
            color = SEASON_COLOR[season]
            add(f"OT_{w}{sfx}", color, "sunday", season, f"{w}º Domingo do Tempo Comum")

    return days


LITURGICAL_DAYS = _build_liturgical_days()


def _identify_celebration(d: date, start_year: int, cal_year: int, cycle: str) -> tuple:
    """Identify liturgical celebration for a given date.
    Returns (key, season, week) — same logic as the original resolve_date().
    """
    advent0 = first_sunday_of_advent(start_year)
    xmas = date(start_year, 12, 25)
    new_year = date(cal_year, 1, 1)
    epiphany = date(cal_year, 1, 6)
    baptism = baptism_of_lord(cal_year)
    ash = ash_wednesday(cal_year)
    easter_date_val = easter(cal_year)
    good_friday = easter_date_val - timedelta(days=2)
    ascension = easter_date_val + timedelta(days=42)
    pentecost_date_val = pentecost(cal_year)
    next_advent = first_sunday_of_advent(cal_year)
    trinity = pentecost_date_val + timedelta(days=7)
    christ_king = next_advent - timedelta(days=7)
    palm_sunday = easter_date_val - timedelta(days=7)
    corpus_christi = trinity + timedelta(days=4)

    is_sunday = d.weekday() == 6

    # Fixed-date solemnities
    if d == xmas:
        return ("CHRISTMAS", "natal", None)
    if d == epiphany:
        return ("EPIPHANY", "natal", None)
    if d == new_year:
        return ("MARY_MOTHER_GOD", "natal", None)
    if d.month == 8 and d.day == 15:
        return ("ASSUMPTION", "comum", None)
    if d.month == 11 and d.day == 1:
        return ("ALL_SAINTS", "comum", None)
    if d.month == 12 and d.day == 8:
        return ("IMMACULATE_CONCEPTION", "natal", None)
    if d.month == 6 and d.day == 24:
        return ("JOHN_BAPTIST_BIRTH", "comum", None)
    if d.month == 6 and d.day == 29:
        return ("PETER_PAUL", "comum", None)
    if d.month == 11 and d.day == 2:
        return ("ALL_SOULS", "comum", None)
    if d.month == 9 and d.day == 14:
        return ("EXALTATION_CROSS", "comum", None)
    if d.month == 10 and d.day == 12:
        return ("OUR_LADY_APARECIDA", "comum", None)

    # Relative-to-Easter
    if d == easter_date_val:
        return ("EASTER_SUNDAY", "pascal", 1)
    if d == ash:
        return ("ASH_WEDNESDAY", "quaresma", None)
    if d == pentecost_date_val:
        return ("PENTECOST", "pascal", None)
    if d == baptism:
        return (f"BAPTISM_{cycle}", "natal", None)
    if d == good_friday:
        return ("GOOD_FRIDAY", "quaresma", None)
    if d == corpus_christi:
        return ("CORPUS_CHRISTI", "comum", None)

    if is_sunday:
        if d == palm_sunday:
            return (f"PALM_{cycle}", "quaresma", 6)
        if d == ascension:
            return (f"ASCENSION_{cycle}", "pascal", 7)
        if d == trinity:
            return (f"TRINITY_{cycle}", "comum", None)
        if d == christ_king:
            return (f"CHRIST_KING_{cycle}", "comum", 34)

    # Advent
    if advent0 <= d < xmas:
        if is_sunday:
            week = min(_weeks_between(advent0, d) + 1, 4)
            return (f"ADVENT_{week}_{cycle}", "advento", week)
        return (None, "advento", None)

    # Christmas season (Dec 26 → Baptism of the Lord)
    is_christmas = (xmas < d <= epiphany) or (d.year == cal_year and d < baptism and d > epiphany)
    if is_christmas or (d.year == cal_year and d < baptism):
        if is_sunday:
            octave_start = xmas + timedelta(days=1)
            octave_end = new_year
            if octave_start <= d <= octave_end:
                return (f"HOLY_FAMILY_{cycle}", "natal", None)
            if d.month == 1 and 2 <= d.day <= 5:
                return ("CHRISTMAS_2ND", "natal", None)
        return (None, "natal", None)

    # Lent
    if ash < d < easter_date_val:
        if is_sunday:
            first_lent_sun = ash + timedelta(days=(6 - ash.weekday()) % 7)
            week = min(_weeks_between(first_lent_sun, d) + 1, 5)
            return (f"LENT_{week}_{cycle}", "quaresma", week)
        return (None, "quaresma", None)

    # Easter season (2nd–6th Sundays)
    if easter_date_val < d < pentecost_date_val and is_sunday:
        week = _weeks_between(easter_date_val, d) + 1
        if 2 <= week <= 6:
            return (f"EASTER_{week}_{cycle}", "pascal", week)

    # Ordinary Time I
    if baptism < d < ash and is_sunday:
        week = _ot_week_legacy(d, start_year, pentecost_date_val, christ_king, baptism)
        return (f"OT_{week}_{cycle}", "comum", week)

    # Ordinary Time II
    if pentecost_date_val < d < next_advent and is_sunday:
        week = _ot_week_legacy(d, start_year, pentecost_date_val, christ_king, baptism)
        return (f"OT_{week}_{cycle}", "comum", week)

    # Season for non-Sunday weekdays
    if advent0 <= d < xmas:
        season = "advento"
    elif xmas < d < baptism:
        season = "natal"
    elif ash <= d < easter_date_val:
        season = "quaresma"
    elif easter_date_val <= d <= pentecost_date_val:
        season = "pascal"
    else:
        season = "comum"

    return (None, season, None)


def _ot_week_legacy(sunday: date, start_year: int, pentecost_date: date, christ_king: date, baptism: date) -> int:
    """Ordinary Time week computation — port of LiturgicalCalendar::otWeek()"""
    if sunday <= pentecost_date:
        first_ot_sunday = baptism + timedelta(days=(6 - baptism.weekday()) % 7)
        weeks = _weeks_between(first_ot_sunday, sunday)
        return max(2, weeks + 2)
    weeks = _weeks_between(sunday, christ_king)
    return max(2, 34 - weeks)


def _color_for_key(key: str | None, d: date, season: str) -> str:
    """Determine color: lookup in LITURGICAL_DAYS first, then legacy fallback."""
    if key and key in LITURGICAL_DAYS:
        return LITURGICAL_DAYS[key]["color"]

    # Legacy fallback for non-keyed days (matches old liturgical_color())
    year = d.year
    easter_date_val = easter(year)
    christmas = date(year, 12, 25)
    ash_wed = easter_date_val - timedelta(days=46)
    holy_sat = easter_date_val - timedelta(days=1)

    if ash_wed <= d <= holy_sat:
        return ROXO
    pent = easter_date_val + timedelta(days=49)
    if easter_date_val <= d < pent:
        return BRANCO
    if d == pent:
        return VERMELHO
    advent_start_date = first_sunday_of_advent(year)
    if advent_start_date <= d < christmas:
        return ROXO
    if (date(year, 12, 25) <= d <= date(year, 12, 31)) or (date(year, 1, 1) <= d <= baptism_of_lord_color(year)):
        return BRANCO
    if _is_major_feast(d.month, d.day):
        return BRANCO
    if d.month == 11 and d.day == 1:
        return BRANCO
    if d.month == 11 and d.day == 2:
        return ROXO

    return SEASON_COLOR.get(season, VERDE)


def resolve_liturgical_day(d: date) -> dict:
    """Single source of truth for liturgical data.
    Returns {
        key, season, color, week, cycle, ferial,
        rank, celebration, slug, icon, banner,
        priority, scope, movable
    }
    """
    start_year = liturgical_start_year(d)
    cal_year = start_year + 1
    cycle = sunday_cycle(start_year)
    ferial = ferial_cycle(start_year)

    key, season, week = _identify_celebration(d, start_year, cal_year, cycle)
    color = _color_for_key(key, d, season)

    entry = LITURGICAL_DAYS.get(key) if key else None

    result = {
        "key": key,
        "season": season,
        "color": color,
        "rank": entry["rank"] if entry else None,
        "celebration": entry["celebration"] if entry else None,
        "week": week,
        "cycle": cycle,
        "ferial": ferial,
        "slug": entry["slug"] if entry else None,
        "icon": entry["icon"] if entry else None,
        "banner": entry["banner"] if entry else None,
        "priority": entry["priority"] if entry else None,
        "scope": entry["scope"] if entry else None,
        "movable": entry["movable"] if entry else None,
    }
    return result


# =====================================================================
# Public API — thin wrappers (preserve exact signatures)
# =====================================================================

def resolve_date(d: date) -> dict:
    """Wrapper — delegates to resolve_liturgical_day.
    Returns {key, season, week, cycle, ferial, color}
    """
    info = resolve_liturgical_day(d)
    return {
        "key": info["key"],
        "season": info["season"],
        "week": info["week"],
        "cycle": info["cycle"],
        "ferial": info["ferial"],
        "color": info["color"],
    }


def _is_major_feast(month: int, day: int) -> bool:
    """port of LiturgicalColorService::isMajorFeast()"""
    return (
        (month == 1 and day == 1) or
        (month == 3 and day == 19) or
        (month == 3 and day == 25) or
        (month == 6 and day == 24) or
        (month == 6 and day == 29) or
        (month == 8 and day == 15) or
        (month == 11 and day == 1) or
        (month == 12 and day == 8)
    )


def liturgical_color(d: date, season_override: Optional[str] = None, is_fixed_solemnity: bool = False) -> str:
    """Wrapper — delegates to resolve_liturgical_day.
    Parameters season_override and is_fixed_solemnity kept for API compatibility.
    """
    return resolve_liturgical_day(d)["color"]


def color_label(theme: str) -> str:
    return _COLOR_LABELS.get(theme, _COLOR_LABELS[VERDE])


def get_today_liturgical() -> dict:
    """Returns full liturgical data for today (single call to resolve_liturgical_day)."""
    today = date.today()
    info = resolve_liturgical_day(today)

    return {
        "season": info["season"],
        "cycle": info["cycle"],
        "ferial": info["ferial"],
        "week": info["week"],
        "key": info["key"],
        "color": info["color"],
        "color_label": color_label(info["color"]),
    }
