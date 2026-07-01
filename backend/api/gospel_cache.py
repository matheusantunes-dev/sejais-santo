from datetime import timezone, datetime
from typing import Optional
import os

from api.supabase_client import get_supabase_client, get_service_client


def get_today_gospel() -> Optional[dict]:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_anon_key:
        return None

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

    rows = result.data or []
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
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_anon_key:
        return

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
