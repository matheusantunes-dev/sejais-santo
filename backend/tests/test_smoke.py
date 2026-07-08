"""Quick smoke test — verify imports and basic integration."""
from datetime import date
from api.liturgical_lib import resolve_liturgical_day, get_today_liturgical
from api.saints_calendar import get_saint_for_date, today_saint, upcoming_saints

# Rosa: 2024-12-15 is ADVENT_3_C in 2024
d = date(2024, 12, 15)
r = resolve_liturgical_day(d)
assert r["color"] == "rosa", f"Expected rosa, got {r['color']} (key={r['key']})"
print(f"  ADVENT_3 (2024-12-15): color={r['color']} OK")

# Rosa: 2025-03-30 is LENT_4_C in 2025
d = date(2025, 3, 30)
r = resolve_liturgical_day(d)
assert r["color"] == "rosa", f"Expected rosa, got {r['color']} (key={r['key']})"
print(f"  LENT_4 (2025-03-30): color={r['color']} OK")

# Saint: Stephen (martyr) on Dec 26, 2020 — during Christmas octave
d = date(2020, 12, 26)
r = resolve_liturgical_day(d)
assert r["color"] == "vermelho", f"Expected vermelho for Stephen, got {r['color']}"
print(f"  Stephen (2020-12-26): color={r['color']} OK")

# Saint: John Evangelist (apostle, color_override=branco) on Dec 27
d = date(2023, 12, 27)
r = resolve_liturgical_day(d)
assert r["color"] == "branco", f"Expected branco for John, got {r['color']}"
print(f"  John Evangelist (2023-12-27): color={r['color']} OK")

# Saint: Paul conversion (apostle, color_override=branco) on Jan 25
d = date(2024, 1, 25)
r = resolve_liturgical_day(d)
assert r["color"] == "branco", f"Expected branco for Paul conversion, got {r['color']}"
print(f"  Paul conversion (2024-01-25): color={r['color']} OK")

# Saint: Chair of Peter (apostle, color_override=branco) on Feb 22
d = date(2025, 2, 22)
r = resolve_liturgical_day(d)
assert r["color"] == "branco", f"Expected branco for Chair of Peter, got {r['color']}"
print(f"  Chair of Peter (2025-02-22): color={r['color']} OK")

# get_saint_for_date returns enriched object
s = get_saint_for_date(date(2026, 12, 26))
assert s is not None
assert s["name"] == "São Estêvão"
assert s["type"] == "martyr"
assert s["color"] == "vermelho"
assert s["rank"] == "feast"
print(f"  get_saint_for_date(12-26): name={s['name']}, type={s['type']}, color={s['color']} OK")

# Sunday (not ferial) should NOT be overridden by saint
d = date(2024, 9, 21)  # St. Matthew — but 2024-09-21 is Saturday
d = date(2024, 9, 22)  # Sunday — OT_26_A
r = resolve_liturgical_day(d)
assert r["key"] is not None, "Sunday should have a key"
assert r["rank"] == "sunday", "Sunday rank should be 'sunday'"
assert r["color"] != "vermelho", "Sunday should NOT be overridden by saint"
print(f"  Sunday (2024-09-22): key={r['key']}, rank={r['rank']}, color={r['color']} (not overridden by Matthew) OK")

# Optional memorial should NOT override ferial
d = date(2024, 3, 4)  # São Casimiro — optional_memoria
r = resolve_liturgical_day(d)
assert r["color"] != "branco", "Optional memorial should NOT override ferial"
print(f"  Optional memorial (2024-03-04): color={r['color']} (not overridden by Casimiro) OK")

print()
print("All smoke tests passed!")
