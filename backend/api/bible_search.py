"""
Full Text Search + Reference parser for Bible verses.

Suporta:
- Referência: "Jo 3:16", "Jo 3,16", "Gn 1,1-5", "Mt 5"
- Nome do livro: "Gênesis", "Mateus"
- Abreviação: "Gn", "Mt", "1Cor"
- Texto livre: "amor de Deus", "fé"
- Combinado: "Jo 3,16 Deus é amor"
"""
import re
from typing import Optional

from api.supabase_client import get_supabase_client


# Abreviações curtas (slug -> nome completo).
# Apenas entradas desta tabela disparam o modo "book-only" (lista de capítulos).
ABBREV_MAP = {
    "gn": "Gênesis", "ex": "Êxodo", "lv": "Levítico", "nm": "Números",
    "dt": "Deuteronômio", "js": "Josué", "jz": "Juízes", "rt": "Rute",
    "1sm": "1 Samuel", "2sm": "2 Samuel", "1rs": "1 Reis", "2rs": "2 Reis",
    "1cr": "1 Crônicas", "2cr": "2 Crônicas", "ed": "Esdras", "ne": "Neemias",
    "tb": "Tobias", "jt": "Judite", "est": "Ester",
    "1mc": "1 Macabeus", "2mc": "2 Macabeus",
    "job": "Jó", "sl": "Salmos", "pr": "Provérbios", "ecl": "Eclesiastes",
    "ct": "Cântico dos Cânticos", "sb": "Sabedoria", "sir": "Eclesiástico",
    "is": "Isaías", "jr": "Jeremias", "lm": "Lamentações", "bar": "Baruc",
    "ez": "Ezequiel", "dn": "Daniel", "os": "Oseias", "jl": "Joel",
    "am": "Amós", "ab": "Abdias", "jn": "Jonas", "mq": "Miqueias",
    "na": "Naum", "hc": "Habacuque", "sf": "Sofonias", "ag": "Ageu",
    "zc": "Zacarias", "ml": "Malaquias",
    "mt": "Mateus", "mc": "Marcos", "lc": "Lucas", "jo": "João",
    "at": "Atos dos Apóstolos", "rm": "Romanos",
    "1cor": "1 Coríntios", "2cor": "2 Coríntios",
    "gl": "Gálatas", "ef": "Efésios", "fl": "Filipenses", "cl": "Colossenses",
    "1ts": "1 Tessalonicenses", "2ts": "2 Tessalonicenses",
    "1tm": "1 Timóteo", "2tm": "2 Timóteo",
    "tt": "Tito", "fm": "Filemom", "hb": "Hebreus",
    "tg": "Tiago", "1pe": "1 Pedro", "2pe": "2 Pedro",
    "1jo": "1 João", "2jo": "2 João", "3jo": "3 João",
    "jd": "Judas", "ap": "Apocalipse",
}

# Nomes completos e aliases comuns (slug -> slug_abreviado).
# Usados apenas para resolver referências; NÃO disparam modo book-only.
FULLNAME_MAP = {
    # Aliases de abreviações
    "eclo": "sir", "ecli": "sir",
    "fil": "fl",
    "salmo": "sl", "salmos": "sl",
    "cântico": "ct", "cânticos": "ct",
    "joão": "jo", "joao": "jo",
    "mateus": "mt", "marcos": "mc", "lucas": "lc",
    # Nomes completos do AT
    "gênesis": "gn", "genesis": "gn",
    "êxodo": "ex", "exodo": "ex",
    "levítico": "lv", "levitico": "lv",
    "números": "nm", "numeros": "nm",
    "deuteronômio": "dt", "deuteronomio": "dt",
    "josué": "js", "josue": "js",
    "juízes": "jz", "juizes": "jz",
    "rute": "rt",
    "1samuel": "1sm", "2samuel": "2sm",
    "1reis": "1rs", "2reis": "2rs",
    "1crônicas": "1cr", "1cronicas": "1cr",
    "2crônicas": "2cr", "2cronicas": "2cr",
    "esdras": "ed", "neemias": "ne",
    "tobias": "tb", "judite": "jt", "ester": "est",
    "1macabeus": "1mc", "2macabeus": "2mc",
    "jó": "job", "jo": "job",
    "provérbios": "pr", "proverbios": "pr",
    "eclesiastes": "ecl",
    "sabedoria": "sb",
    "eclesiástico": "sir", "eclesiastico": "sir",
    "isaías": "is", "isaias": "is",
    "jeremias": "jr",
    "lamentações": "lm", "lamentacoes": "lm",
    "baruc": "bar",
    "ezequiel": "ez", "daniel": "dn",
    "oseias": "os", "joel": "jl",
    "amós": "am", "amos": "am",
    "abdias": "ab", "jonas": "jn",
    "miqueias": "mq", "naum": "na",
    "habacuque": "hc", "sofonias": "sf",
    "ageu": "ag", "zacarias": "zc",
    "malaquias": "ml",
    # Nomes completos do NT
    "atos": "at",
    "romanos": "rm",
    "1coríntios": "1cor", "1corintios": "1cor",
    "2coríntios": "2cor", "2corintios": "2cor",
    "gálatas": "gl", "galatas": "gl",
    "efésios": "ef", "efesios": "ef",
    "filipenses": "fl",
    "colossenses": "cl",
    "1tessalonicenses": "1ts", "2tessalonicenses": "2ts",
    "1timóteo": "1tm", "1timoteo": "1tm",
    "2timóteo": "2tm", "2timoteo": "2tm",
    "tito": "tt", "filemom": "fm",
    "hebreus": "hb", "tiago": "tg",
    "1pedro": "1pe", "2pedro": "2pe",
    "1joão": "1jo", "1joao": "1jo",
    "2joão": "2jo", "2joao": "2jo",
    "3joão": "3jo", "3joao": "3jo",
    "judas": "jd",
    "apocalipse": "ap",
}

# Regex para referência bíblica:
#   Grupo 1: nome/abreviação do livro (ex: "Jo", "1Cor", "Cântico")
#   Grupo 2: capítulo (após espaço, separado por : ou ,)
#   Grupo 3: versículo inicial (após : ou ,)
#   Grupo 4: versículo final (após - ou —)
#   Grupo 5: texto extra (após espaço)
REF_PATTERN = re.compile(
    r"^(\d?\s*[A-Za-záéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]+[a-záéíóúâêôãõç]*)"
    r"(?:\s+(\d+))?"
    r"(?:\s*[:：,，]\s*(\d+[a-z]?))?"
    r"(?:\s*[-–—]\s*(\d+[a-z]?))?"
    r"(?:\s+(.*))?$",
    re.IGNORECASE,
)


def _normalize_book_name(name: str) -> Optional[str]:
    """Resolve nome ou abreviação → slug do livro."""
    name = re.sub(r"\s+", "", name.strip().lower().replace(":", ""))
    if not name:
        return None
    if name in ABBREV_MAP:
        return name
    full = FULLNAME_MAP.get(name)
    if full:
        return full
    supabase = get_supabase_client()
    result = (
        supabase.table("bible_books")
        .select("slug")
        .ilike("name", f"%{name}%")
        .limit(1)
        .execute()
    )
    rows = result.data or []
    return rows[0]["slug"] if rows else None


def parse_reference(query: str) -> Optional[dict]:
    """Tenta parsear query como referência bíblica.
    Retorna {slug, chapter, verse_start, verse_end, text} ou None."""
    m = REF_PATTERN.match(query.strip())
    if not m:
        return None

    book_raw = m.group(1).strip()
    slug = _normalize_book_name(book_raw)
    if not slug:
        return None

    chapter = int(m.group(2)) if m.group(2) else None
    verse_start = m.group(3)
    verse_end = m.group(4)
    text_extra = m.group(5).strip() if m.group(5) else ""

    if not chapter and not verse_start:
        # Só nome do livro, sem capítulo/versículo → não é referência
        return None

    return {
        "slug": slug,
        "chapter": chapter,
        "verse_start": int(re.sub(r"[a-z].*", "", verse_start)) if verse_start else None,
        "verse_end": verse_end,
        "text": text_extra or None,
    }


def search_verses(
    query: str,
    limit: int = 20,
    offset: int = 0,
) -> dict:
    """Busca unificada: referência, texto, ou ambos."""
    ref = parse_reference(query)

    if ref and ref["chapter"] and not ref["text"]:
        return _search_by_reference(ref, limit, offset)

    if ref and ref["chapter"] and ref["text"]:
        return _search_restricted(ref, limit, offset)

    query_stripped = query.strip().lower()
    if query_stripped in ABBREV_MAP:
        slug = _normalize_book_name(query_stripped)
        if slug:
            chapters = (
                get_supabase_client()
                .table("bible_chapters")
                .select("number, verses_count")
                .eq("book:book_id(slug)", slug)
                .order("number")
                .execute()
            )
            return {
                "type": "book",
                "slug": slug,
                "chapters": chapters.data or [],
                "total": len(chapters.data or []),
            }

    return _search_fts(query, limit, offset)


def _search_by_reference(ref: dict, limit: int, offset: int) -> dict:
    supabase = get_supabase_client()
    query = (
        supabase.table("vw_bible_verses")
        .select("*")
        .eq("book_slug", ref["slug"])
        .eq("chapter_number", ref["chapter"])
        .order("verse_number")
    )

    if ref.get("verse_start") is not None:
        query = query.gte("verse_number", ref["verse_start"])
    if ref.get("verse_end") is not None:
        v = re.sub(r"[a-z].*", "", ref["verse_end"])
        query = query.lte("verse_number", int(v))

    result = query.limit(limit).offset(offset).execute()
    rows = result.data or []
    return _format_search_result(rows, ref)


def _search_restricted(ref: dict, limit: int, offset: int) -> dict:
    supabase = get_supabase_client()
    q = ref["text"]
    result = (
        supabase.table("vw_bible_verses")
        .select("*")
        .eq("book_slug", ref["slug"])
        .eq("chapter_number", ref["chapter"])
        .text_search("search_vector", q, type_="websearch")
        .order("verse_number")
        .limit(limit)
        .offset(offset)
        .execute()
    )
    rows = result.data or []
    return _format_search_result(rows, ref)


def _search_fts(query: str, limit: int, offset: int) -> dict:
    supabase = get_supabase_client()

    result = (
        supabase.table("vw_bible_verses")
        .select("*")
        .text_search("search_vector", query, type_="websearch")
        .order("book_position")
        .order("chapter_number")
        .order("verse_number")
        .limit(limit)
        .offset(offset)
        .execute()
    )
    rows = result.data or []

    return {
        "type": "fts",
        "query": query,
        "results": [
            {
                "verse": r["verse_number"],
                "text": r["verse_text"],
                "chapter": r["chapter_number"],
                "book": {
                    "slug": r["book_slug"],
                    "name": r["book_name"],
                    "abbrev": r["book_abbrev"].strip(),
                },
            }
            for r in rows
        ],
        "total": len(rows),
        "limit": limit,
        "offset": offset,
    }


def _format_search_result(rows: list[dict], ref: dict) -> dict:
    return {
        "type": "reference",
        "slug": ref["slug"],
        "chapter": ref["chapter"],
        "verse_start": ref.get("verse_start"),
        "verse_end": ref.get("verse_end"),
        "results": [
            {
                "verse": r["verse_number"],
                "text": r["verse_text"],
                "book": {
                    "slug": r["book_slug"],
                    "name": r["book_name"],
                    "abbrev": r["book_abbrev"].strip(),
                },
            }
            for r in rows
        ],
        "total": len(rows),
    }
