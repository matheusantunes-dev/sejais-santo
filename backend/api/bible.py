from fastapi import APIRouter, HTTPException, Query

from api.bible_repository import (
    get_books,
    get_chapter,
    get_nav_context,
    get_verse_by_reference,
)
from api.bible_search import search_verses

router = APIRouter(prefix="/api/bible", tags=["bible"])


@router.get("/books")
def list_books(testament: str = Query(None, regex="^(AT|NT)?$")):
    books = get_books(testament or None)
    return {
        "books": [
            {
                "slug": b["slug"],
                "name": b["name"],
                "abbreviation": b["abbreviation"].strip(),
                "chapters": b["chapters_count"],
                "testament": b["testament"],
            }
            for b in books
        ]
    }


@router.get("/{book_slug}/{chapter_number}")
def chapter(book_slug: str, chapter_number: int):
    data = get_chapter(book_slug, chapter_number)
    if not data:
        raise HTTPException(status_code=404, detail="Capítulo não encontrado")

    nav = get_nav_context(book_slug, chapter_number)
    book = data["book"]
    ch = data["chapter"]

    return {
        "book": {
            "slug": book["slug"],
            "name": book["name"],
            "abbreviation": book["abbreviation"].strip(),
        },
        "chapter": {
            "number": ch["number"],
            "verses_count": ch["verses_count"],
        },
        "verses": data["verses"],
        "navigation": nav,
    }


@router.get("/{book_slug}/{chapter_number}/{verse_number}")
def verse(book_slug: str, chapter_number: int, verse_number: int):
    data = get_verse_by_reference(book_slug, chapter_number, verse_number)
    if not data:
        raise HTTPException(status_code=404, detail="Versículo não encontrado")
    return {"verse": data[0]}


@router.get("/search")
def search(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    result = search_verses(q, limit=limit, offset=offset)
    return result
