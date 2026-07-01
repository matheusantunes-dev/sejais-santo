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


def resolve_date(d: date) -> dict:
    """Main resolver — port of LiturgicalCalendar::resolve()
    Returns {key, season, week, cycle, ferial, color}
    """
    d_start = d
    start_year = liturgical_start_year(d)
    cal_year = start_year + 1
    cycle = sunday_cycle(start_year)
    ferial = ferial_cycle(start_year)

    advent0 = first_sunday_of_advent(start_year)
    xmas = date(start_year, 12, 25)
    new_year = date(cal_year, 1, 1)
    epiphany = date(cal_year, 1, 6)
    baptism = baptism_of_lord(cal_year)
    ash = ash_wednesday(cal_year)
    easter_date = easter(cal_year)
    ascension = easter_date + timedelta(days=42)
    pentecost_date = pentecost(cal_year)
    next_advent = first_sunday_of_advent(cal_year)
    trinity = pentecost_date + timedelta(days=7)
    christ_king = next_advent - timedelta(days=7)
    palm_sunday = easter_date - timedelta(days=7)

    is_sunday = d_start.weekday() == 6

    def r(key, season, week_val):
        color = liturgical_color(d_start, season, is_fixed_solemnity=key is not None and key in (
            "CHRISTMAS", "EPIPHANY", "MARY_MOTHER_GOD",
            "ASSUMPTION", "ALL_SAINTS", "IMMACULATE_CONCEPTION",
            "JOHN_BAPTIST_BIRTH", "PETER_PAUL", "EASTER_SUNDAY",
            "PENTECOST", "ALL_SOULS",
        ))
        return {
            "key": key,
            "season": season,
            "week": week_val,
            "cycle": cycle,
            "ferial": ferial,
            "color": color,
        }

    # Fixed-date solemnities
    if d_start == xmas:
        return r("CHRISTMAS", "natal", None)
    if d_start == epiphany:
        return r("EPIPHANY", "natal", None)
    if d_start == new_year:
        return r("MARY_MOTHER_GOD", "natal", None)

    if d_start.month == 8 and d_start.day == 15:
        return r("ASSUMPTION", "comum", None)
    if d_start.month == 11 and d_start.day == 1:
        return r("ALL_SAINTS", "comum", None)
    if d_start.month == 12 and d_start.day == 8:
        return r("IMMACULATE_CONCEPTION", "natal", None)
    if d_start.month == 6 and d_start.day == 24:
        return r("JOHN_BAPTIST_BIRTH", "comum", None)
    if d_start.month == 6 and d_start.day == 29:
        return r("PETER_PAUL", "comum", None)
    if d_start.month == 11 and d_start.day == 2:
        return r("ALL_SOULS", "comum", None)

    # Relative-to-Easter solemnities
    if d_start == easter_date:
        return r("EASTER_SUNDAY", "pascal", 1)
    if d_start == ash:
        return r("ASH_WEDNESDAY", "quaresma", None)
    if d_start == pentecost_date:
        return r("PENTECOST", "pascal", None)
    if d_start == baptism:
        return r(f"BAPTISM_{cycle}", "natal", None)

    if is_sunday:
        if d_start == palm_sunday:
            return r(f"PALM_{cycle}", "quaresma", 6)
        if d_start == ascension:
            return r(f"ASCENSION_{cycle}", "pascal", 7)
        if d_start == trinity:
            return r(f"TRINITY_{cycle}", "comum", None)
        if d_start == christ_king:
            return r(f"CHRIST_KING_{cycle}", "comum", 34)

    # Advent
    if advent0 <= d_start < xmas:
        if is_sunday:
            week = min(_weeks_between(advent0, d_start) + 1, 4)
            return r(f"ADVENT_{week}_{cycle}", "advento", week)
        return r(None, "advento", None)

    # Christmas season (Dec 26 → Baptism of the Lord)
    is_christmas = (xmas < d_start <= epiphany) or (d_start.year == cal_year and d_start < baptism and d_start > epiphany)
    if is_christmas or (d_start.year == cal_year and d_start < baptism):
        if is_sunday:
            octave_start = xmas + timedelta(days=1)
            octave_end = new_year
            if octave_start <= d_start <= octave_end:
                return r(f"HOLY_FAMILY_{cycle}", "natal", None)
            if d_start.month == 1 and 2 <= d_start.day <= 5:
                return r("CHRISTMAS_2ND", "natal", None)
        return r(None, "natal", None)

    # Lent
    if ash < d_start < easter_date:
        if is_sunday:
            first_lent_sun = ash + timedelta(days=(6 - ash.weekday()) % 7)
            week = min(_weeks_between(first_lent_sun, d_start) + 1, 5)
            return r(f"LENT_{week}_{cycle}", "quaresma", week)
        return r(None, "quaresma", None)

    # Easter season (2nd – 6th Sundays)
    if easter_date < d_start < pentecost_date and is_sunday:
        week = _weeks_between(easter_date, d_start) + 1
        if 2 <= week <= 6:
            return r(f"EASTER_{week}_{cycle}", "pascal", week)

    # Ordinary Time I: Baptism+1 → Ash Wednesday
    if baptism < d_start < ash and is_sunday:
        week = _ot_week(d_start, start_year, pentecost_date, christ_king, baptism)
        return r(f"OT_{week}_{cycle}", "comum", week)

    # Ordinary Time II: after Pentecost → before Advent
    if pentecost_date < d_start < next_advent and is_sunday:
        week = _ot_week(d_start, start_year, pentecost_date, christ_king, baptism)
        return r(f"OT_{week}_{cycle}", "comum", week)

    # Season for non-Sunday weekdays
    if advent0 <= d_start < xmas:
        season = "advento"
    elif xmas < d_start < baptism:
        season = "natal"
    elif ash <= d_start < easter_date:
        season = "quaresma"
    elif easter_date <= d_start <= pentecost_date:
        season = "pascal"
    else:
        season = "comum"

    return r(None, season, None)


def _ot_week(sunday: date, start_year: int, pentecost_date: date, christ_king: date, baptism: date) -> int:
    """Ordinary Time week computation — port of LiturgicalCalendar::otWeek()"""
    if sunday <= pentecost_date:
        first_ot_sunday = baptism + timedelta(days=(6 - baptism.weekday()) % 7)
        weeks = _weeks_between(first_ot_sunday, sunday)
        return max(2, weeks + 2)
    weeks = _weeks_between(sunday, christ_king)
    return max(2, 34 - weeks)


# =====================================================================
# LITURGICAL COLOR SERVICE — port of LiturgicalColorService.php
# =====================================================================

VERDE = "verde"
ROXO = "roxo"
BRANCO = "branco"
VERMELHO = "vermelho"

COLOR_LABELS = {
    VERDE: "Verde – Tempo Comum",
    ROXO: "Roxo – Advento/Quaresma",
    BRANCO: "Branco/Dourado – Festa",
    VERMELHO: "Vermelho – Pentecostes/Mártir",
}


def liturgical_color(d: date, season_override: Optional[str] = None, is_fixed_solemnity: bool = False) -> str:
    """Determine liturgical color — faithful to LiturgicalColorService::forDate()"""
    year = d.year

    easter_date = easter(year)
    christmas = date(year, 12, 25)

    # Quaresma: Quarta-Feira de Cinzas até Sábado Santo
    ash_wed = easter_date - timedelta(days=46)
    holy_sat = easter_date - timedelta(days=1)
    if ash_wed <= d <= holy_sat:
        return ROXO

    # Tríduo Pascal + Tempo Pascal: Páscoa até dia antes de Pentecostes
    pent = easter_date + timedelta(days=49)
    if easter_date <= d < pent:
        return BRANCO

    # Pentecostes
    if d == pent:
        return VERMELHO

    # Advento: 1º domingo do Advento até 24/12
    advent_start_date = first_sunday_of_advent(year)
    if advent_start_date <= d < christmas:
        return ROXO

    # Natal: 25 dez até Batismo do Senhor (color boundary follows LiturgicalColorService)
    if (date(year, 12, 25) <= d <= date(year, 12, 31)) or (date(year, 1, 1) <= d <= baptism_of_lord_color(year)):
        return BRANCO

    # Festas principais: branco
    if _is_major_feast(d.month, d.day):
        return BRANCO

    # All Saints / All Souls
    if d.month == 11 and d.day == 1:
        return BRANCO
    if d.month == 11 and d.day == 2:
        return ROXO

    return VERDE


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


def color_label(theme: str) -> str:
    return COLOR_LABELS.get(theme, COLOR_LABELS[VERDE])


# =====================================================================
# TODAY helper
# =====================================================================

def get_today_liturgical() -> dict:
    """Returns full liturgical data for today."""
    today = date.today()
    resolved = resolve_date(today)
    color = liturgical_color(today)

    return {
        "season": resolved["season"],
        "cycle": resolved["cycle"],
        "ferial": resolved["ferial"],
        "week": resolved["week"],
        "key": resolved["key"],
        "color": color,
        "color_label": color_label(color),
    }
