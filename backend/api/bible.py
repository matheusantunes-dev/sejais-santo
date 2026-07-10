from fastapi import APIRouter, HTTPException, Query

from api.bible_repository import (
    get_books,
    get_chapter,
    get_full_book,
    get_nav_context,
    get_verse_by_reference,
)
from api.bible_search import search_verses

SLUG_MAP = {
    "exodus": "exodo", "leviticus": "levitico", "numbers": "numeros",
    "deuteronomy": "deuteronomio", "joshua": "josue", "judges": "juizes",
    "ruth": "rute", "1samuel": "1-samuel", "2samuel": "2-samuel",
    "1kings": "1-reis", "2kings": "2-reis", "1chronicles": "1-cronicas",
    "2chronicles": "2-cronicas", "ezra": "esdras", "nehemiah": "neemias",
    "tobit": "tobias", "judith": "judite", "esther": "ester",
    "1maccabees": "1-macabeus", "2maccabees": "2-macabeus",
    "psalms": "salmos", "proverbs": "proverbios", "ecclesiastes": "eclesiastes",
    "songofsolomon": "cantico", "wisdom": "sabedoria", "sirach": "eclesiastico",
    "isaiah": "isaias", "jeremiah": "jeremias", "lamentations": "lamentacoes",
    "baruch": "baruc", "ezekiel": "ezequiel", "hosea": "oseias",
    "amos": "amos", "obadiah": "abdias", "jonah": "jonas", "micah": "miqueias",
    "habakkuk": "habacuque", "zephaniah": "sofonias", "haggai": "ageu",
    "zechariah": "zacarias", "malachi": "malaquias",
    "matthew": "mateus", "mark": "marcos", "luke": "lucas", "john": "joao",
    "acts": "atos", "romans": "romanos",
    "1corinthians": "1-corintios", "2corinthians": "2-corintios",
    "galatians": "galatas", "ephesians": "efesios",
    "philippians": "filipenses", "colossians": "colossenses",
    "1thessalonians": "1-tessalonicenses", "2thessalonians": "2-tessalonicenses",
    "1timothy": "1-timoteo", "2timothy": "2-timoteo",
    "titus": "tito", "philemon": "filemom", "hebrews": "hebreus",
    "james": "tiago", "1peter": "1-pedro", "2peter": "2-pedro",
    "1john": "1-joao", "2john": "2-joao", "3john": "3-joao",
    "jude": "judas", "revelation": "apocalipse",
}


def _normalize_slug(slug: str) -> str:
    return SLUG_MAP.get(slug, slug)


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


@router.get("/{book_slug}")
def full_book(book_slug: str):
    book_slug = _normalize_slug(book_slug)
    data = get_full_book(book_slug)
    if not data:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return data


@router.get("/{book_slug}/{chapter_number}")
def chapter(book_slug: str, chapter_number: int):
    book_slug = _normalize_slug(book_slug)
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
    book_slug = _normalize_slug(book_slug)
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
