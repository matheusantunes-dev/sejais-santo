from typing import Optional
from api.supabase_client import get_supabase_client


def get_books(testament: Optional[str] = None) -> list[dict]:
    supabase = get_supabase_client()
    query = supabase.table("bible_books").select("*").order("position")
    if testament:
        query = query.eq("testament", testament)
    result = query.execute()
    return result.data or []


def get_chapters(book_slug: str) -> list[dict]:
    supabase = get_supabase_client()
    result = (
        supabase.table("vw_bible_chapters")
        .select("*")
        .eq("book_slug", book_slug)
        .order("chapter_number")
        .execute()
    )
    return result.data or []


def get_chapter(book_slug: str, chapter_number: int) -> Optional[dict]:
    supabase = get_supabase_client()
    result = (
        supabase.table("vw_bible_verses")
        .select("*")
        .eq("book_slug", book_slug)
        .eq("chapter_number", chapter_number)
        .order("verse_number")
        .execute()
    )
    rows = result.data or []
    if not rows:
        return None
    return {
        "book": {
            "slug": rows[0]["book_slug"],
            "name": rows[0]["book_name"],
            "abbreviation": rows[0]["book_abbrev"].strip(),
        },
        "chapter": {
            "number": rows[0]["chapter_number"],
            "verses_count": rows[0]["chapter_verses"],
        },
        "verses": [
            {"number": r["verse_number"], "text": r["verse_text"]} for r in rows
        ],
    }


def get_verse_by_reference(
    book_slug: str,
    chapter: int,
    verse: Optional[int] = None,
) -> Optional[list[dict]]:
    supabase = get_supabase_client()
    query = (
        supabase.table("vw_bible_verses")
        .select("*")
        .eq("book_slug", book_slug)
        .eq("chapter_number", chapter)
    )
    if verse is not None:
        query = query.eq("verse_number", verse)
    result = query.order("verse_number").execute()
    return result.data or None


def get_nav_context(book_slug: str, chapter_number: int) -> dict:
    supabase = get_supabase_client()
    book_result = (
        supabase.table("bible_books")
        .select("*")
        .eq("slug", book_slug)
        .single()
        .execute()
    )
    book = book_result.data
    if not book:
        return {"prev": None, "next": None}

    chapters = (
        supabase.table("bible_chapters")
        .select("number")
        .eq("book_id", book["id"])
        .order("number")
        .execute()
    )
    chapter_nums = [c["number"] for c in (chapters.data or [])]

    prev_chapter = None
    next_chapter = None
    if chapter_number in chapter_nums:
        idx = chapter_nums.index(chapter_number)
        if idx > 0:
            prev_chapter = {"book_slug": book_slug, "chapter": chapter_nums[idx - 1]}
        if idx < len(chapter_nums) - 1:
            next_chapter = {"book_slug": book_slug, "chapter": chapter_nums[idx + 1]}

    prev_book = None
    next_book = None
    if not prev_chapter:
        prev_book = _adjacent_book(book["id"], -1)
    if not next_chapter:
        next_book = _adjacent_book(book["id"], 1)

    return {
        "prev": prev_chapter or prev_book,
        "next": next_chapter or next_book,
    }


def _adjacent_book(book_id: int, direction: int) -> Optional[dict]:
    """direction=-1: previous book, direction=1: next book"""
    supabase = get_supabase_client()
    op = "lt" if direction == -1 else "gt"
    result = (
        supabase.table("bible_books")
        .select("id, slug")
        .filter("id", op, book_id)
        .order("id", desc=(direction == -1))
        .limit(1)
        .execute()
    )
    rows = result.data or []
    if not rows:
        return None
    adj_book = rows[0]
    chapters = (
        supabase.table("bible_chapters")
        .select("number")
        .eq("book_id", adj_book["id"])
        .order("number", desc=(direction == -1))
        .limit(1)
        .execute()
    )
    ch_rows = chapters.data or []
    if not ch_rows:
        return None
    return {"book_slug": adj_book["slug"], "chapter": ch_rows[0]["number"]}
