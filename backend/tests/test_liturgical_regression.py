"""
Regression test — 7-year liturgical colour snapshot.

Generates a table of all dates whose colour changed relative to the
Fase 1 baseline (i.e. before saint integration and Rosa/Preto).

We build a *separate* old-style LITURGICAL_DAYS so that the baseline
is not affected by the new Rosa constants.
"""

from datetime import date, timedelta
from api.liturgical_lib import (
    resolve_liturgical_day,
    _identify_celebration,
    _color_for_key,
    liturgical_start_year,
    sunday_cycle,
    ferial_cycle,
    LITURGICAL_DAYS,
    SEASON_COLOR,
    ROXO,
    VERDE,
    VERMELHO,
    BRANCO,
    ROSA,
)


def _build_old_liturgical_days() -> dict[str, dict]:
    """Replicate the Fase 1 _build_liturgical_days (ADVENT_3/LENT_4 = ROXO)."""
    days: dict[str, dict] = {}

    def add(key, color, rank, season, celebration):
        days[key] = {
            "color": color,
            "rank": rank,
            "season": season,
            "celebration": celebration,
        }

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

    for cycle in ("A", "B", "C"):
        sfx = f"_{cycle}"
        add(f"BAPTISM{sfx}",      BRANCO,   "feast",     "natal",    "Batismo do Senhor")
        add(f"PALM{sfx}",         VERMELHO, "solemnity", "quaresma", "Domingo de Ramos")
        add(f"ASCENSION{sfx}",    BRANCO,   "solemnity", "pascal",   "Ascensão do Senhor")
        add(f"TRINITY{sfx}",      VERDE,    "solemnity", "comum",    "Santíssima Trindade")
        add(f"CHRIST_KING{sfx}",  VERDE,    "solemnity", "comum",    "Cristo Rei")
        add(f"HOLY_FAMILY{sfx}",  BRANCO,   "feast",     "natal",    "Sagrada Família")

        # OLD: ALL Advent = ROXO (no Rosa)
        for w in range(1, 5):
            add(f"ADVENT_{w}{sfx}", ROXO, "sunday", "advento", f"{w}º Domingo do Advento")

        # OLD: ALL Lent = ROXO (no Rosa)
        for w in range(1, 6):
            add(f"LENT_{w}{sfx}", ROXO, "sunday", "quaresma", f"{w}º Domingo da Quaresma")

        for w in range(2, 7):
            add(f"EASTER_{w}{sfx}", BRANCO, "sunday", "pascal", f"{w}º Domingo da Páscoa")

        for w in range(2, 34):
            add(f"OT_{w}{sfx}", VERDE, "sunday", "comum", f"{w}º Domingo do Tempo Comum")

    return days


_OLD_LITURGICAL_DAYS = _build_old_liturgical_days()


def _legacy_color(key: str | None, d: date, season: str) -> str:
    """Old-style color (Fase 1): lookup in old LITURGICAL_DAYS + legacy fallback."""
    if key and key in _OLD_LITURGICAL_DAYS:
        return _OLD_LITURGICAL_DAYS[key]["color"]
    # Same legacy fallback as _color_for_key, but using old constants
    year = d.year
    e = __import__("api.liturgical_lib", fromlist=["easter"]).easter
    easter_date = e(year)
    ash_wed = easter_date - timedelta(days=46)
    holy_sat = easter_date - timedelta(days=1)
    if ash_wed <= d <= holy_sat:
        return ROXO
    pent = easter_date + timedelta(days=49)
    if easter_date <= d < pent:
        return BRANCO
    if d == pent:
        return VERMELHO
    from api.liturgical_lib import first_sunday_of_advent, baptism_of_lord_color
    advent_start = first_sunday_of_advent(year)
    if advent_start <= d < date(year, 12, 25):
        return ROXO
    if (date(year, 12, 25) <= d <= date(year, 12, 31)) or \
       (date(year, 1, 1) <= d <= baptism_of_lord_color(year)):
        return BRANCO
    from api.liturgical_lib import _is_major_feast
    if _is_major_feast(d.month, d.day):
        return BRANCO
    if d.month == 11 and d.day == 1:
        return BRANCO
    if d.month == 11 and d.day == 2:
        return ROXO
    return SEASON_COLOR.get(season, VERDE)


def _legacy_resolve(d: date) -> str:
    """Simulate Fase 1 resolve_liturgical_day (no saint override, no Rosa)."""
    start_year = liturgical_start_year(d)
    cal_year = start_year + 1
    cycle = sunday_cycle(start_year)
    key, season, week = _identify_celebration(d, start_year, cal_year, cycle)
    return _legacy_color(key, d, season)


def _date_range(start: date, end: date):
    for i in range((end - start).days + 1):
        yield start + timedelta(days=i)


def run() -> list[dict]:
    rows = []
    start = date(2020, 1, 1)
    end = date(2026, 12, 31)
    total = (end - start).days + 1
    changed = 0

    for d in _date_range(start, end):
        new = resolve_liturgical_day(d)
        old_color = _legacy_resolve(d)
        new_color = new["color"]

        if old_color != new_color:
            changed += 1
            rows.append({
                "date": d.isoformat(),
                "weekday": d.strftime("%A"),
                "before": old_color,
                "after": new_color,
                "key": new["key"],
                "rank": new["rank"],
                "season": new["season"],
            })

    return {"total_days": total, "changed": changed, "rows": rows}


if __name__ == "__main__":
    result = run()
    print(f"Total days scanned: {result['total_days']}")
    print(f"Days with colour change: {result['changed']}")
    print()
    print(f"{'Date':<12} {'Weekday':<10} {'Before':<10} {'After':<10} {'Key':<22} {'Rank':<18} {'Season':<12}")
    print("-" * 94)
    for r in result["rows"]:
        print(f"{r['date']:<12} {r['weekday']:<10} {r['before']:<10} {r['after']:<10} {str(r['key']):<22} {r['rank']:<18} {r['season']:<12}")
    print()
    print(f"Report complete — {result['changed']} colour changes detected.")
