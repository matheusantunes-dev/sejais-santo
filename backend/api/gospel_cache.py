import time
import logging
from datetime import timezone, datetime
from typing import Optional
from api.supabase_client import get_supabase_client, get_service_client

logger = logging.getLogger(__name__)


_supabase_client_instance = None
_table_row_count = None
_memory_cache: dict[str, dict] = {}


def _get_cached_client():
    global _supabase_client_instance, _table_row_count
    if _supabase_client_instance is None:
        t_init = time.monotonic()
        _supabase_client_instance = get_supabase_client()
        dt_init = (time.monotonic() - t_init) * 1000

        try:
            count_res = _supabase_client_instance.table("daily_gospel").select("*", count="exact").execute()
            _table_row_count = len(count_res.data) if count_res.data else 0
        except Exception:
            _table_row_count = "unknown"
        logger.warning(
            "GOSPEL_CACHE client_init=%.0fms table_rows=%s",
            dt_init, _table_row_count,
        )
    return _supabase_client_instance


def get_today_gospel() -> Optional[dict]:
    t0 = time.monotonic()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 1. Memory cache check
    if today in _memory_cache:
        dt_mem = (time.monotonic() - t0) * 1000
        logger.warning(
            "GOSPEL_CACHE source=memory hit=true dt=%.0fms date=%s",
            dt_mem, today,
        )
        return _memory_cache[today]

    dt_mem_miss = (time.monotonic() - t0) * 1000

    # 2. Supabase query
    supabase = _get_cached_client()
    t_client = time.monotonic()

    result = (
        supabase
        .table("daily_gospel")
        .select("*")
        .eq("date", today)
        .limit(1)
        .execute()
    )

    t_sql = time.monotonic()
    rows = result.data or []
    t_serialize = time.monotonic()
    hit = len(rows) > 0

    dt_client = (t_client - t0) * 1000
    dt_sql = (t_sql - t_client) * 1000
    dt_serialize = (t_serialize - t_sql) * 1000
    dt_total = (t_serialize - t0) * 1000

    logger.warning(
        "GOSPEL_CACHE source=supabase mem=%.0fms connection=%.0fms sql=%.0fms serialize=%.0fms total=%.0fms hit=%s rows=%d date=%s",
        dt_mem_miss, dt_client, dt_sql, dt_serialize, dt_total, hit, len(rows), today,
    )

    if rows:
        _memory_cache[today] = rows[0]
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
    supabase = _get_cached_client()

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

    _memory_cache[today] = record

    supabase.table("daily_gospel").upsert(record, on_conflict="date").execute()

    t1 = time.monotonic()
    logger.warning("GOSPEL_CACHE save=%.0fms date=%s mem_stored=true",
                   (t1 - t0) * 1000, today)
