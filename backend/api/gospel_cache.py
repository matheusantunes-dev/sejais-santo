import time
import logging
from datetime import timezone, datetime
from typing import Optional
from api.supabase_client import get_supabase_client, get_service_client

logger = logging.getLogger(__name__)


def get_today_gospel() -> Optional[dict]:
    t0 = time.monotonic()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    supabase = get_supabase_client()

    result = (
        supabase
        .table("daily_gospel")
        .select("*")
        .eq("date", today)
        .limit(1)
        .execute()
    )

    t1 = time.monotonic()
    rows = result.data or []
    hit = len(rows) > 0
    logger.warning("GOSPEL_CACHE query=%.0fms hit=%s date=%s",
                   (t1 - t0) * 1000, hit, today)
    return rows[0] if rows else None


def save_today_gospel(
    referencia: str,
    texto: str,
    liturgical_season: Optional[str] = None,
    sunday_cycle: Optional[str] = None,
    ferial_cycle: Optional[str] = None,
    week_number: Optional[int] = None,
    pericope: Optional[str] = None,
    book_abbrev: Optional[str] = None,
    liturgical_key: Optional[str] = None,
):
    t0 = time.monotonic()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    supabase = get_service_client()

    record = {
        "date": today,
        "referencia": referencia,
        "texto": texto,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if liturgical_season is not None:
        record["liturgical_season"] = liturgical_season
    if sunday_cycle is not None:
        record["sunday_cycle"] = sunday_cycle
    if ferial_cycle is not None:
        record["ferial_cycle"] = ferial_cycle
    if week_number is not None:
        record["week_number"] = week_number
    if pericope is not None:
        record["pericope"] = pericope
    if book_abbrev is not None:
        record["book_abbrev"] = book_abbrev
    if liturgical_key is not None:
        record["liturgical_key"] = liturgical_key

    supabase.table("daily_gospel").upsert(record, on_conflict="date").execute()

    t1 = time.monotonic()
    logger.warning("GOSPEL_CACHE save=%.0fms date=%s",
                   (t1 - t0) * 1000, today)
