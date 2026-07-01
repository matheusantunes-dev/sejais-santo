"""Testes exaustivos do parser de referência bíblica."""

import re
from unittest.mock import patch

import pytest

from api.bible_search import REF_PATTERN, parse_reference, _normalize_book_name


# ───────────────────────────── helpers ───────────────────────────── #

def _mock_normalize(name: str) -> str | None:
    """Versão mockada de _normalize_book_name que só usa os maps."""
    from api.bible_search import ABBREV_MAP, FULLNAME_MAP
    clean = re.sub(r"\s+", "", name.strip().lower().replace(":", ""))
    if not clean:
        return None
    if clean in ABBREV_MAP:
        return clean
    return FULLNAME_MAP.get(clean)


@pytest.fixture(autouse=True)
def _patch_normalize():
    """Substitui _normalize_book_name para não depender de Supabase."""
    with patch("api.bible_search._normalize_book_name", side_effect=_mock_normalize):
        yield


# ──────────────────────── REF_PATTERN (regex) ─────────────────────── #

class TestRegexMatch:
    """Cenários que DEVEM produzir match no regex."""

    @pytest.mark.parametrize(
        "query, exp_book, exp_ch, exp_vs, exp_ve, exp_extra", [
            # Básicos
            ("Jo 3",       "Jo",   "3", None, None, None),
            ("Jo 3,16",    "Jo",   "3", "16", None, None),
            ("Jo 3:16",    "Jo",   "3", "16", None, None),
            ("Jo 3,16-18", "Jo",   "3", "16", "18", None),
            # Números com prefixo
            ("1Cor 13",        "1Cor",  "13", None, None, None),
            ("1Cor 13,1-13",   "1Cor",  "13", "1",  "13", None),
            ("1 Cor 13,1-13",  "1 Cor", "13", "1",  "13", None),
            ("1Coríntios 13",  "1Coríntios", "13", None, None, None),
            ("1 Coríntios 13", "1 Coríntios", "13", None, None, None),
            # Cântico
            ("Cânticos 2,1", "Cânticos", "2", "1", None, None),
            ("Ct 2,1",       "Ct",       "2", "1", None, None),
            # Apocalipse
            ("Ap 21",      "Ap", "21", None, None, None),
            ("Ap 21,1-5",  "Ap", "21", "1",  "5",  None),
            # Gênesis
            ("Gn 1",   "Gn", "1", None, None, None),
            ("Gn 1,1", "Gn", "1", "1",  None, None),
            # Salmos
            ("Sl 23",     "Sl",   "23", None, None, None),
            ("Salmo 23",  "Salmo", "23", None, None, None),
            ("Salmos 23", "Salmos", "23", None, None, None),
            # Aliases
            ("Eclo 2,1", "Eclo", "2", "1", None, None),
            ("Ecl 3,1",  "Ecl",  "3", "1", None, None),
            ("Sb 3,1",   "Sb",   "3", "1", None, None),
            ("Fl 4,13",  "Fl",   "4", "13", None, None),
            ("Fil 4,13", "Fil",  "4", "13", None, None),
            # Texto extra
            ("Jo 3,16 Deus é amor", "Jo", "3", "16", None, "Deus é amor"),
        ]
    )
    def test_matches(self, query, exp_book, exp_ch, exp_vs, exp_ve, exp_extra):
        m = REF_PATTERN.match(query.strip())
        assert m is not None, f"Deveria fazer match: '{query}'"
        assert m.group(1).strip() == exp_book, f"book: '{query}'"
        assert m.group(2) == exp_ch, f"chapter: '{query}'"
        assert m.group(3) == exp_vs, f"verse_start: '{query}'"
        if m.group(4):
            assert m.group(4) == exp_ve, f"verse_end: '{query}'"
        else:
            assert exp_ve is None, f"verse_end: '{query}' (esperado {exp_ve})"
        actual_extra = m.group(5).strip() if m.group(5) else None
        assert actual_extra == exp_extra, f"extra: '{query}'"


class TestRegexNoMatch:
    """Cenários que NÃO DEVEM produzir match completo no regex."""

    @pytest.mark.parametrize("query", [
        "amor",
        "amor de Deus",
        "esperança",
        "misericórdia",
        "Jesus Cristo",
        "Bem-aventurados",
        "Gênesis",
        "Mateus",
        "João",
        "Jo",
        "abc123",
        "3,16",
        "",
    ])
    def test_no_match_as_reference(self, query):
        """O regex pode casar parcialmente, mas parse_reference deve rejeitar."""
        ref = parse_reference(query)
        assert ref is None, f"Não deveria ser referência: '{query}' -> {ref}"

    @pytest.mark.parametrize(
        "query, exp_slug, exp_ch, exp_vs, exp_ve", [
            ("João 999",   "jo", 999, None,    None),
            ("Jo 999,999", "jo", 999, 999,     None),
        ]
    )
    def test_valid_syntax_out_of_range(self, query, exp_slug, exp_ch, exp_vs, exp_ve):
        """Sintaxe válida, mas cap/vers inexistente — ainda é referência."""
        ref = parse_reference(query)
        assert ref is not None, f"Deveria ser referência: '{query}'"
        assert ref["slug"] == exp_slug
        assert ref["chapter"] == exp_ch
        assert ref["verse_start"] == exp_vs
        assert ref["verse_end"] == exp_ve


# ────────────────────── parse_reference (com mock) ─────────────────── #

class TestParseReference:
    """Valida que parse_reference retorna o dict correto."""

    @pytest.mark.parametrize(
        "query, exp_slug, exp_ch, exp_vs, exp_ve, exp_text", [
            ("Jo 3",           "jo",  3,   None, None,  None),
            ("Jo 3,16",        "jo",  3,   16,   None,  None),
            ("Jo 3:16",        "jo",  3,   16,   None,  None),
            ("Jo 3,16-18",     "jo",  3,   16,   "18",  None),
            ("1Cor 13",        "1cor", 13, None, None,  None),
            ("1Cor 13,1-13",   "1cor", 13, 1,    "13",  None),
            ("1 Cor 13,1-13",  "1cor", 13, 1,    "13",  None),
            ("1Coríntios 13",  "1cor", 13, None, None,  None),
            ("1 Coríntios 13", "1cor", 13, None, None,  None),
            ("Cânticos 2,1",   "ct",   2,  1,    None,  None),
            ("Ct 2,1",         "ct",   2,  1,    None,  None),
            ("Ap 21",          "ap",   21, None, None,  None),
            ("Ap 21,1-5",      "ap",   21, 1,    "5",   None),
            ("Gn 1",           "gn",   1,  None, None,  None),
            ("Gn 1,1",         "gn",   1,  1,    None,  None),
            ("Sl 23",          "sl",   23, None, None,  None),
            ("Salmo 23",       "sl",   23, None, None,  None),
            ("Salmos 23",      "sl",   23, None, None,  None),
            ("Eclo 2,1",       "sir",  2,  1,    None,  None),
            ("Ecl 3,1",        "ecl",  3,  1,    None,  None),
            ("Sb 3,1",         "sb",   3,  1,    None,  None),
            ("Fl 4,13",        "fl",   4,  13,   None,  None),
            ("Fil 4,13",       "fl",   4,  13,   None,  None),
            ("Jo 3,16 Deus é amor", "jo", 3, 16, None, "Deus é amor"),
        ]
    )
    def test_valid_references(self, query, exp_slug, exp_ch, exp_vs, exp_ve, exp_text):
        ref = parse_reference(query)
        assert ref is not None, f"Deveria ser referência: '{query}'"
        assert ref["slug"] == exp_slug, f"slug: '{query}'"
        assert ref["chapter"] == exp_ch, f"chapter: '{query}'"
        assert ref["verse_start"] == exp_vs, f"verse_start: '{query}'"
        assert ref["verse_end"] == exp_ve, f"verse_end: '{query}'"
        assert ref["text"] == exp_text, f"text: '{query}'"

    @pytest.mark.parametrize("query", [
        "Jo",
        "amor",
        "amor de Deus",
        "esperança",
        "misericórdia",
        "Jesus Cristo",
        "Bem-aventurados",
        "abc123",
        "3,16",
        "",
    ])
    def test_invalid_references(self, query):
        assert parse_reference(query) is None, f"Não deveria ser referência: '{query}'"

    @pytest.mark.parametrize(
        "query, exp_slug, exp_ch, exp_vs, exp_ve", [
            ("João 999",   "jo", 999, None,    None),
            ("Jo 999,999", "jo", 999, 999,     None),
        ]
    )
    def test_out_of_range_syntax(self, query, exp_slug, exp_ch, exp_vs, exp_ve):
        """Sintaxe válida, referência para cap/vers inexistente."""
        ref = parse_reference(query)
        assert ref is not None
        assert ref["slug"] == exp_slug
        assert ref["chapter"] == exp_ch
        assert ref["verse_start"] == exp_vs
        assert ref["verse_end"] == exp_ve


# ────────────────────── book-only routing (sem DB) ─────────────────── #

class TestSearchVersesRouting:
    """Verifica se search_verses encaminha para o tipo correto.
    Os DB calls são mockados; testamos só a lógica de roteamento.
    """

    @patch("api.bible_search.get_supabase_client")
    def test_book_only_abbrev(self, mock_supabase):
        """Abreviação curta sem capítulo → book-only."""
        mock_client = mock_supabase.return_value
        mock_client.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
            {"number": 1, "verses_count": 50},
            {"number": 2, "verses_count": 52},
        ]

        from api.bible_search import search_verses
        result = search_verses("gn")
        assert result["type"] == "book"
        assert result["slug"] == "gn"
        assert len(result["chapters"]) == 2

    @patch("api.bible_search.get_supabase_client")
    def test_book_only_not_for_fullname(self, mock_supabase):
        """Nome completo sem capítulo → FTS, não book-only."""
        mock_client = mock_supabase.return_value
        mock_table = mock_client.table
        mock_table.return_value.select.return_value.text_search.return_value.order.return_value.order.return_value.order.return_value.limit.return_value.offset.return_value.execute.return_value.data = []

        from api.bible_search import search_verses
        result = search_verses("Gênesis")
        assert result["type"] == "fts"

    @patch("api.bible_search.get_supabase_client")
    def test_reference_routing(self, mock_supabase):
        """Referência com capítulo → busca por referência."""
        mock_client = mock_supabase.return_value
        mock_client.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.offset.return_value.execute.return_value.data = [
            {"verse_number": 16, "verse_text": "Porque Deus amou o mundo...",
             "book_slug": "jo", "book_name": "João", "book_abbrev": "Jo",
             "chapter_number": 3, "chapter_verses": 36},
        ]

        from api.bible_search import search_verses
        result = search_verses("Jo 3,16")
        assert result["type"] == "reference"
        assert result["slug"] == "jo"
        assert result["chapter"] == 3

    @patch("api.bible_search.get_supabase_client")
    def test_fts_routing(self, mock_supabase):
        """Texto livre → FTS."""
        mock_client = mock_supabase.return_value
        mock_client.table.return_value.select.return_value.text_search.return_value.order.return_value.order.return_value.order.return_value.limit.return_value.offset.return_value.execute.return_value.data = []

        from api.bible_search import search_verses
        result = search_verses("amor de Deus")
        assert result["type"] == "fts"
        assert result["query"] == "amor de Deus"
