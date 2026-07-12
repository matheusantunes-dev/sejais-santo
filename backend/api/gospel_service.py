import re
import logging
from typing import Optional
from api.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)


def parse_gospel_reference(ref: str) -> dict:
    ref = re.sub(r",\s+", ",", ref.strip())
    match = re.match(r"^(\S+)\s+(\d+),(\d[\d.,-]*)$", ref)
    if not match:
        logger.warning("GOSPEL_SERVICE failed to parse reference: %s", ref)
        raise ValueError(f"Não foi possível interpretar a referência: {ref}")

    book_abbrev = match.group(1)
    chapter = int(match.group(2))
    verses_str = match.group(3)
    groups = verses_str.split(".")
    verse_ranges = []
    for group in groups:
        if "-" in group:
            parts = group.split("-", 1)
            verse_ranges.append((int(parts[0]), int(parts[1])))
        else:
            v = int(group)
            verse_ranges.append((v, v))

    return {
        "book_abbrev": book_abbrev,
        "chapter": chapter,
        "verse_ranges": verse_ranges,
    }


def lookup_book_slug(abbrev: str) -> Optional[str]:
    supabase = get_supabase_client()
    result = (
        supabase.table("bible_books")
        .select("slug")
        .eq("abbreviation", abbrev)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    if not rows:
        logger.warning("GOSPEL_SERVICE book not found for abbrev: %s", abbrev)
        return None
    slug = rows[0]["slug"].strip()
    logger.info("GOSPEL_SERVICE book lookup %s -> %s", abbrev, slug)
    return slug


def fetch_gospel_verses(
    book_slug: str, chapter: int, verse_ranges: list[tuple[int, int]]
) -> list[dict]:
    supabase = get_supabase_client()
    allowed = set()
    for start, end in verse_ranges:
        allowed.update(range(start, end + 1))
    result = (
        supabase.table("vw_bible_verses")
        .select("verse_number, verse_text")
        .eq("book_slug", book_slug)
        .eq("chapter_number", chapter)
        .order("verse_number")
        .execute()
    )
    rows = result.data or []
    filtered = [r for r in rows if r["verse_number"] in allowed]
    if not filtered:
        logger.warning(
            "GOSPEL_SERVICE no verses found for %s cap %s ranges=%s",
            book_slug, chapter, verse_ranges,
        )
    else:
        logger.info(
            "GOSPEL_SERVICE fetched %d verses for %s cap %s", len(filtered), book_slug, chapter,
        )
    return filtered


def assemble_gospel_text(verses: list[dict]) -> str:
    return " ".join(f"{v['verse_number']}{v['verse_text']}" for v in verses)


def build_gospel_from_reference(ref: str) -> dict:
    parsed = parse_gospel_reference(ref)
    slug = lookup_book_slug(parsed["book_abbrev"])
    if not slug:
        raise ValueError(f"Livro não encontrado: {parsed['book_abbrev']}")
    verses = fetch_gospel_verses(slug, parsed["chapter"], parsed["verse_ranges"])
    if not verses:
        raise ValueError(
            f"Nenhum versículo encontrado para {ref} "
            f"(slug={slug}, cap={parsed['chapter']}, ranges={parsed['verse_ranges']})"
        )
    texto = assemble_gospel_text(verses)
    return {"referencia": ref, "texto": texto}
