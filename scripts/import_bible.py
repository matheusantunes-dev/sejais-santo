#!/usr/bin/env python3
"""
Importa a Bíblia Ave-Maria para o Supabase a partir do dump PostgreSQL.

Uso:
    python scripts/import_bible.py

Requer variáveis de ambiente:
    SUPABASE_URL
    SUPABASE_SERVICE_KEY (service_role, não anon key)

Estratégia:
    1. Cria tabelas via SQL (executar create_bible_schema.sql primeiro)
    2. Insere versão padrão (Ave-Maria)
    3. Insere 73 livros
    4. Insere 1.334 capítulos (batch de 500)
    5. Insere 35.450 versículos (batch de 500)
"""
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
load_dotenv(dotenv_path)

from api.supabase_client import get_supabase_client


BOOKS_DATA = [
    # (testament, abbreviation, slug, name, position, chapters_count)
    ("AT", "Gn", "genesis", "Gênesis", 1, 50),
    ("AT", "Ex", "exodo", "Êxodo", 2, 40),
    ("AT", "Lv", "levitico", "Levítico", 3, 27),
    ("AT", "Nm", "numeros", "Números", 4, 36),
    ("AT", "Dt", "deuteronomio", "Deuteronômio", 5, 34),
    ("AT", "Js", "josue", "Josué", 6, 24),
    ("AT", "Jz", "juizes", "Juízes", 7, 21),
    ("AT", "Rt", "rute", "Rute", 8, 4),
    ("AT", "1Sm", "1-samuel", "1 Samuel", 9, 31),
    ("AT", "2Sm", "2-samuel", "2 Samuel", 10, 24),
    ("AT", "1Rs", "1-reis", "1 Reis", 11, 22),
    ("AT", "2Rs", "2-reis", "2 Reis", 12, 25),
    ("AT", "1Cr", "1-cronicas", "1 Crônicas", 13, 29),
    ("AT", "2Cr", "2-cronicas", "2 Crônicas", 14, 36),
    ("AT", "Ed", "esdras", "Esdras", 15, 10),
    ("AT", "Ne", "neemias", "Neemias", 16, 13),
    ("AT", "Tb", "tobias", "Tobias", 17, 14),
    ("AT", "Jt", "judite", "Judite", 18, 16),
    ("AT", "Est", "ester", "Ester", 19, 16),
    ("AT", "1Mc", "1-macabeus", "1 Macabeus", 20, 16),
    ("AT", "2Mc", "2-macabeus", "2 Macabeus", 21, 15),
    ("AT", "Jó", "job", "Jó", 22, 42),
    ("AT", "Sl", "salmos", "Salmos", 23, 150),
    ("AT", "Pr", "proverbios", "Provérbios", 24, 31),
    ("AT", "Ecl", "eclesiastes", "Eclesiastes", 25, 12),
    ("AT", "Ct", "cantico", "Cântico dos Cânticos", 26, 8),
    ("AT", "Sb", "sabedoria", "Sabedoria", 27, 19),
    ("AT", "Sir", "eclesiastico", "Eclesiástico", 28, 51),
    ("AT", "Is", "isaias", "Isaías", 29, 66),
    ("AT", "Jr", "jeremias", "Jeremias", 30, 52),
    ("AT", "Lm", "lamentacoes", "Lamentações", 31, 5),
    ("AT", "Bar", "baruc", "Baruc", 32, 6),
    ("AT", "Ez", "ezequiel", "Ezequiel", 33, 48),
    ("AT", "Dn", "daniel", "Daniel", 34, 14),
    ("AT", "Os", "oseias", "Oseias", 35, 14),
    ("AT", "Jl", "joel", "Joel", 36, 4),
    ("AT", "Am", "amos", "Amós", 37, 9),
    ("AT", "Ab", "abdias", "Abdias", 38, 1),
    ("AT", "Jn", "jonas", "Jonas", 39, 4),
    ("AT", "Mq", "miqueias", "Miqueias", 40, 7),
    ("AT", "Na", "naum", "Naum", 41, 3),
    ("AT", "Hc", "habacuque", "Habacuque", 42, 3),
    ("AT", "Sf", "sofonias", "Sofonias", 43, 3),
    ("AT", "Ag", "ageu", "Ageu", 44, 2),
    ("AT", "Zc", "zacarias", "Zacarias", 45, 14),
    ("AT", "Ml", "malaquias", "Malaquias", 46, 3),
    ("NT", "Mt", "mateus", "Mateus", 47, 28),
    ("NT", "Mc", "marcos", "Marcos", 48, 16),
    ("NT", "Lc", "lucas", "Lucas", 49, 24),
    ("NT", "Jo", "joao", "João", 50, 21),
    ("NT", "At", "atos", "Atos dos Apóstolos", 51, 28),
    ("NT", "Rm", "romanos", "Romanos", 52, 16),
    ("NT", "1Cor", "1-corintios", "1 Coríntios", 53, 16),
    ("NT", "2Cor", "2-corintios", "2 Coríntios", 54, 13),
    ("NT", "Gl", "galatas", "Gálatas", 55, 6),
    ("NT", "Ef", "efesios", "Efésios", 56, 6),
    ("NT", "Fl", "filipenses", "Filipenses", 57, 4),
    ("NT", "Cl", "colossenses", "Colossenses", 58, 4),
    ("NT", "1Ts", "1-tessalonicenses", "1 Tessalonicenses", 59, 5),
    ("NT", "2Ts", "2-tessalonicenses", "2 Tessalonicenses", 60, 3),
    ("NT", "1Tm", "1-timoteo", "1 Timóteo", 61, 6),
    ("NT", "2Tm", "2-timoteo", "2 Timóteo", 62, 4),
    ("NT", "Tt", "tito", "Tito", 63, 3),
    ("NT", "Fm", "filemom", "Filemom", 64, 1),
    ("NT", "Hb", "hebreus", "Hebreus", 65, 13),
    ("NT", "Tg", "tiago", "Tiago", 66, 5),
    ("NT", "1Pd", "1-pedro", "1 Pedro", 67, 5),
    ("NT", "2Pd", "2-pedro", "2 Pedro", 68, 3),
    ("NT", "1Jo", "1-joao", "1 João", 69, 5),
    ("NT", "2Jo", "2-joao", "2 João", 70, 1),
    ("NT", "3Jo", "3-joao", "3 João", 71, 1),
    ("NT", "Jd", "judas", "Judas", 72, 1),
    ("NT", "Ap", "apocalipse", "Apocalipse", 73, 22),
]


def import_bible():
    supabase = get_supabase_client()

    # 0. Limpar dados de execuções anteriores via RPC SQL (TRUNCATE seguro)
    print("🧹 Limpando dados existentes...")
    try:
        supabase.rpc("cleanup_import").execute()
        print("✅ Limpeza concluída")
    except Exception as e:
        print(f"⚠️  Erro na limpeza via RPC: {e}")
        print("   Execute sql/cleanup_function.sql no SQL Editor do Supabase primeiro")
        return

    # 1. Criar versão padrão
    now = datetime.now(timezone.utc).isoformat()
    version = supabase.table("bible_versions").insert({
        "slug": "ave-maria",
        "name": "Ave Maria",
        "language": "pt",
        "is_default": True,
        "description": "Tradução Ave-Maria — Edição do Santuário de Fátima",
        "created_at": now,
        "updated_at": now,
    }).execute()

    version_id = version.data[0]["id"] if version.data else 1
    print(f"✅ Versão criada: id={version_id}")

    # 2. Inserir livros (batch)
    now = datetime.now(timezone.utc).isoformat()
    book_records = [
        {
            "version_id": version_id,
            "testament": t,
            "abbreviation": ab,
            "slug": sl,
            "name": nm,
            "position": pos,
            "chapters_count": ch,
            "created_at": now,
            "updated_at": now,
        }
        for t, ab, sl, nm, pos, ch in BOOKS_DATA
    ]

    books = supabase.table("bible_books").insert(book_records).execute()
    book_ids = {}
    for b in (books.data or []):
        book_ids[b["slug"]] = b["id"]
    print(f"✅ {len(book_ids)} livros inseridos")

    # 3. Ler dados extraídos do dump e inserir capítulos + versículos
    dump_dir = os.path.join(os.path.dirname(__file__), "extracted")
    chapters_file = os.path.join(dump_dir, "bible_chapters.sql")
    verses_file = os.path.join(dump_dir, "bible_verses.sql")

    if not os.path.exists(chapters_file):
        print(f"⚠️ Arquivo de capítulos não encontrado: {chapters_file}")
        print("Execute: pg_restore --data-only --table=bible_chapters ... > scripts/extracted/bible_chapters.sql")
        return

    # Parse chapters
    print("📖 Importando capítulos...")
    chapter_count = 0
    slug_by_position = {pos: slug for _, _, slug, _, pos, _ in BOOKS_DATA}

    # dump_chapter_map: dump_chapter_id -> (slug, chapter_number)
    dump_chapter_map = {}
    chapter_records = []
    chapter_id_map = {}

    with open(chapters_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("--") or line.startswith("COPY") or line == "\\." or \
               line.startswith("SET ") or line.startswith("SELECT ") or line.startswith("\\restrict"):
                continue
            parts = line.split("\t")
            if len(parts) >= 4:
                try:
                    dump_chapter_id = int(parts[0])
                    dump_book_id = int(parts[1])
                    ch_num = int(parts[2])
                    ch_verses = int(parts[3])
                except ValueError:
                    continue

                slug = slug_by_position.get(dump_book_id)
                if not slug or slug not in book_ids:
                    continue

                dump_chapter_map[dump_chapter_id] = (slug, ch_num)
                chapter_records.append({
                    "book_id": book_ids[slug],
                    "number": ch_num,
                    "verses_count": ch_verses,
                    "created_at": now,
                    "updated_at": now,
                })

    # Deduplicate and batch insert chapters
    seen = set()
    unique_chapters = []
    for rec in chapter_records:
        key = (rec["book_id"], rec["number"])
        if key not in seen:
            seen.add(key)
            unique_chapters.append(rec)

    for i in range(0, len(unique_chapters), 500):
        batch = unique_chapters[i:i + 500]
        resp = supabase.table("bible_chapters").insert(batch).execute()
        for c in (resp.data or []):
            chapter_id_map[(c["book_id"], c["number"])] = c["id"]
        chapter_count += len(batch)
        print(f"  Capítulos: {chapter_count}/{len(unique_chapters)}")

    # 4. Parse verses
    print("📖 Importando versículos...")
    verse_count = 0
    verse_batch = []

    with open(verses_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("--") or line.startswith("COPY") or line == "\\." or \
               line.startswith("SET ") or line.startswith("SELECT ") or line.startswith("\\restrict"):
                continue
            parts = line.split("\t")
            if len(parts) >= 5:
                try:
                    dump_chapter_id = int(parts[2])
                    v_num = int(parts[3])
                    v_text = parts[4]
                except (ValueError, IndexError):
                    continue

                # Map dump_chapter_id -> (slug, chapter_number)
                mapped = dump_chapter_map.get(dump_chapter_id)
                if not mapped:
                    continue
                slug, ch_num = mapped
                bid = book_ids.get(slug)
                if not bid:
                    continue
                cid = chapter_id_map.get((bid, ch_num))
                if not cid:
                    continue

                verse_batch.append({
                    "book_id": bid,
                    "chapter_id": cid,
                    "number": v_num,
                    "text": v_text.replace("\\N", ""),
                    "created_at": now,
                    "updated_at": now,
                })

                if len(verse_batch) >= 500:
                    supabase.table("bible_verses").insert(verse_batch).execute()
                    verse_count += len(verse_batch)
                    print(f"  Versículos: {verse_count}")
                    verse_batch = []

    if verse_batch:
        supabase.table("bible_verses").insert(verse_batch).execute()
        verse_count += len(verse_batch)

    print(f"✅ Importação concluída: {chapter_count} capítulos, {verse_count} versículos")
    print(f"✅ Total: {len(book_ids)} livros, {chapter_count} capítulos, {verse_count} versículos")


if __name__ == "__main__":
    import_bible()
