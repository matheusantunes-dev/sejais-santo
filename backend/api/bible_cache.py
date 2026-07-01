import os
from typing import Optional

from api.supabase_client import get_supabase_client, get_service_client


def get_cached_chapter(book_slug: str, chapter: int) -> Optional[dict]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        return None

    reference = f"{book_slug}+{chapter}"
    supabase = get_supabase_client()

    result = (
        supabase
        .table("bible_cache")
        .select("data")
        .eq("reference", reference)
        .limit(1)
        .execute()
    )

    rows = result.data or []
    return rows[0]["data"] if rows else None


def cache_chapter(book_slug: str, chapter: int, data: dict):
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        return

    reference = f"{book_slug}+{chapter}"
    supabase = get_service_client()

    supabase.table("bible_cache").upsert(
        {
            "reference": reference,
            "book_slug": book_slug,
            "chapter": chapter,
            "data": data,
        },
        on_conflict="reference",
    ).execute()
