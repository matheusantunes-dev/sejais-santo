-- ============================================================
-- Migration: Fix swapped book_id in bible_chapters & bible_verses
-- Version: 2026-07-10_001
--
-- Causa raiz:
--   O dump original (pg_dump) continha book_ids trocados entre
--   os pares (1-macabeus↔jó) e (2-macabeus↔salmos) nas tabelas
--   bible_chapters e bible_verses.
--
--   O script import_bible.py leu esses book_ids e mapeou via
--   slug_by_position[dump_book_id], copiando a troca para o
--   banco novo. Os nomes/slugs em bible_books estão corretos,
--   apenas os dados referenciados estão nos livros errados.
--
-- Estratégia:
--   1. Cria registros temporários em bible_books (para satisfazer
--      as FKs de bible_chapters e bible_verses durante o swap)
--   2. Move Jó → temp, 1-macabeus → Jó, temp → 1-macabeus
--   3. Move Salmos → temp, 2-macabeus → Salmos, temp → 2-macabeus
--   4. Remove registros temporários
--   5. Recalcula chapters_count e verses_count
--   6. Limpa cache das affectedos
-- ============================================================

BEGIN;

-- ============================================================
-- FASE 1: IDENTIFICAR IDs AFETADOS
-- ============================================================
DO $$
DECLARE
    id_1mac BIGINT;
    id_2mac BIGINT;
    id_job  BIGINT;
    id_sl   BIGINT;
    v_version_id BIGINT;
    id_tmp1 BIGINT;
    id_tmp2 BIGINT;
    cnt     BIGINT;
BEGIN
    -- Buscar IDs atuais dos livros
    SELECT id, version_id INTO id_1mac, v_version_id FROM public.bible_books WHERE slug = '1-macabeus';
    SELECT id INTO id_2mac FROM public.bible_books WHERE slug = '2-macabeus';
    SELECT id INTO id_job  FROM public.bible_books WHERE slug = 'job';
    SELECT id INTO id_sl   FROM public.bible_books WHERE slug = 'salmos';

    -- Sanity check
    IF id_1mac IS NULL OR id_2mac IS NULL OR id_job IS NULL OR id_sl IS NULL THEN
        RAISE EXCEPTION 'ERRO: Não foi possível encontrar todos os 4 livros afetados';
    END IF;

    IF id_1mac = id_job OR id_2mac = id_sl OR id_1mac = id_2mac THEN
        RAISE EXCEPTION 'ERRO: IDs duplicados inesperados';
    END IF;

    RAISE NOTICE 'IDs: 1-macabeus=%, 2-macabeus=%, job=%, salmos=%', id_1mac, id_2mac, id_job, id_sl;

    -- ============================================================
    -- FASE 2: CRIAR REGISTROS TEMPORÁRIOS (para FKs)
    -- ============================================================
    INSERT INTO public.bible_books (
        version_id, testament, abbreviation, slug, name, position, chapters_count
    ) VALUES (
        v_version_id, 'AT', 'TMP_JB', 'tmp-swap-job', 'TEMP - Job Swap', 0, 0
    )
    RETURNING id INTO id_tmp1;

    INSERT INTO public.bible_books (
        version_id, testament, abbreviation, slug, name, position, chapters_count
    ) VALUES (
        v_version_id, 'AT', 'TMP_SL', 'tmp-swap-sl', 'TEMP - Salmos Swap', 0, 0
    )
    RETURNING id INTO id_tmp2;

    RAISE NOTICE 'TEMP IDs: tmp_job=%, tmp_sl=%', id_tmp1, id_tmp2;

    -- ============================================================
    -- FASE 3: SWAP 1-MACABEUS ↔ JÓ
    -- ============================================================
    RAISE NOTICE 'Swapping 1-macabeus ↔ job...';

    -- 3a. Mover dados de Jó → temp
    UPDATE public.bible_chapters SET book_id = id_tmp1 WHERE book_id = id_job;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_chapters movidos job→tmp: %', cnt;

    UPDATE public.bible_verses SET book_id = id_tmp1 WHERE book_id = id_job;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_verses movidos job→tmp: %', cnt;

    -- 3b. Mover dados de 1-macabeus → Jó
    UPDATE public.bible_chapters SET book_id = id_job WHERE book_id = id_1mac;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_chapters movidos 1mac→job: %', cnt;

    UPDATE public.bible_verses SET book_id = id_job WHERE book_id = id_1mac;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_verses movidos 1mac→job: %', cnt;

    -- 3c. Mover dados de temp → 1-macabeus
    UPDATE public.bible_chapters SET book_id = id_1mac WHERE book_id = id_tmp1;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_chapters movidos tmp→1mac: %', cnt;

    UPDATE public.bible_verses SET book_id = id_1mac WHERE book_id = id_tmp1;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_verses movidos tmp→1mac: %', cnt;

    -- ============================================================
    -- FASE 4: SWAP 2-MACABEUS ↔ SALMOS
    -- ============================================================
    RAISE NOTICE 'Swapping 2-macabeus ↔ salmos...';

    -- 4a. Mover dados de Salmos → temp
    UPDATE public.bible_chapters SET book_id = id_tmp2 WHERE book_id = id_sl;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_chapters movidos sl→tmp: %', cnt;

    UPDATE public.bible_verses SET book_id = id_tmp2 WHERE book_id = id_sl;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_verses movidos sl→tmp: %', cnt;

    -- 4b. Mover dados de 2-macabeus → Salmos
    UPDATE public.bible_chapters SET book_id = id_sl WHERE book_id = id_2mac;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_chapters movidos 2mac→sl: %', cnt;

    UPDATE public.bible_verses SET book_id = id_sl WHERE book_id = id_2mac;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_verses movidos 2mac→sl: %', cnt;

    -- 4c. Mover dados de temp → 2-macabeus
    UPDATE public.bible_chapters SET book_id = id_2mac WHERE book_id = id_tmp2;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_chapters movidos tmp→2mac: %', cnt;

    UPDATE public.bible_verses SET book_id = id_2mac WHERE book_id = id_tmp2;
    GET DIAGNOSTICS cnt = ROW_COUNT;
    RAISE NOTICE '  bible_verses movidos tmp→2mac: %', cnt;

    -- ============================================================
    -- FASE 5: REMOVER REGISTROS TEMPORÁRIOS
    -- ============================================================
    -- Como todos os chapters/verses foram movidos, os temp books
    -- estão vazios. DELETE não cascateia nada.
    DELETE FROM public.bible_books WHERE id IN (id_tmp1, id_tmp2);
    RAISE NOTICE 'TEMP records deleted';

    -- ============================================================
    -- FASE 6: RECALCULAR chapters_count E verses_count
    -- ============================================================
    RAISE NOTICE 'Recalculating chapters_count...';
    UPDATE public.bible_books b
    SET chapters_count = sub.cnt,
        updated_at = now()
    FROM (
        SELECT bc.book_id, COUNT(*)::smallint AS cnt
        FROM public.bible_chapters bc
        GROUP BY bc.book_id
    ) sub
    WHERE b.id = sub.book_id;

    RAISE NOTICE 'Recalculating verses_count...';
    UPDATE public.bible_chapters bc
    SET verses_count = sub.cnt,
        updated_at = now()
    FROM (
        SELECT bv.chapter_id, COUNT(*)::smallint AS cnt
        FROM public.bible_verses bv
        GROUP BY bv.chapter_id
    ) sub
    WHERE bc.id = sub.chapter_id;

    RAISE NOTICE 'Migration completed successfully';
END $$;

-- ============================================================
-- FASE 7: LIMPAR CACHE DOS LIVROS AFETADOS
-- ============================================================
DELETE FROM public.bible_cache
WHERE book_slug IN ('1-macabeus', '2-macabeus', 'job', 'salmos');

-- ============================================================
-- FASE 8: COMMIT
-- ============================================================
COMMIT;

-- ============================================================
-- VALIDAÇÃO PÓS-MIGRAÇÃO
-- Execute as queries abaixo APÓS o COMMIT para verificar
-- a integridade dos dados.
-- ============================================================
-- Para copiar e colar no SQL Editor separadamente:

-- >>> INÍCIO DA VALIDAÇÃO >>>

-- 1. Contagem de capítulos por livro (deve bater com o esperado)
-- SELECT b.slug, b.name, b.chapters_count, COUNT(c.id) AS actual_chapters
-- FROM public.bible_books b
-- LEFT JOIN public.bible_chapters c ON c.book_id = b.id
-- WHERE b.slug IN ('1-macabeus', '2-macabeus', 'job', 'salmos')
-- GROUP BY b.slug, b.name, b.chapters_count
-- ORDER BY b.slug;

-- 2. Jó cap 1, versículo 1 (deve começar com "Havia, na terra de Hus")
-- SELECT v.number, v.text
-- FROM public.bible_verses v
-- JOIN public.bible_books b ON b.id = v.book_id
-- JOIN public.bible_chapters c ON c.id = v.chapter_id
-- WHERE b.slug = 'job' AND c.number = 1 AND v.number = 1;

-- 3. Salmos cap 1, versículo 1 (deve começar com "Feliz o homem")
-- SELECT v.number, v.text
-- FROM public.bible_verses v
-- JOIN public.bible_books b ON b.id = v.book_id
-- JOIN public.bible_chapters c ON c.id = v.chapter_id
-- WHERE b.slug = 'salmos' AND c.number = 1 AND v.number = 1;

-- 4. 1 Macabeus cap 1, versículo 1 (deve começar com "Seu filho Judas")
-- SELECT v.number, v.text
-- FROM public.bible_verses v
-- JOIN public.bible_books b ON b.id = v.book_id
-- JOIN public.bible_chapters c ON c.id = v.chapter_id
-- WHERE b.slug = '1-macabeus' AND c.number = 1 AND v.number = 1;

-- 5. 2 Macabeus cap 1, versículo 1 (deve começar com "Aos nossos irmãos")
-- SELECT v.number, v.text
-- FROM public.bible_verses v
-- JOIN public.bible_books b ON b.id = v.book_id
-- JOIN public.bible_chapters c ON c.id = v.chapter_id
-- WHERE b.slug = '2-macabeus' AND c.number = 1 AND v.number = 1;

-- 6. Sem capítulos órfãos (deve retornar 0)
-- SELECT COUNT(*) AS orphan_chapters
-- FROM public.bible_chapters c
-- LEFT JOIN public.bible_books b ON b.id = c.book_id
-- WHERE b.id IS NULL;

-- 7. Sem versículos órfãos (deve retornar 0)
-- SELECT COUNT(*) AS orphan_verses
-- FROM public.bible_verses v
-- LEFT JOIN public.bible_books b ON b.id = v.book_id
-- WHERE b.id IS NULL;

-- 8. Sem capítulos sem versículos (deve retornar 0)
-- SELECT COUNT(*) AS chapters_without_verses
-- FROM public.bible_chapters c
-- LEFT JOIN public.bible_verses v ON v.chapter_id = c.id
-- WHERE v.id IS NULL;

-- 9. Total de capítulos e versículos deve permanecer igual
-- SELECT 'chapters' AS entity, COUNT(*) AS total_before_and_after FROM public.bible_chapters
-- UNION ALL
-- SELECT 'verses', COUNT(*) FROM public.bible_verses;

-- 10. Contagem final dos 4 livros corrigidos
-- SELECT b.slug, b.name, b.chapters_count, COUNT(v.id) AS total_verses
-- FROM public.bible_books b
-- LEFT JOIN public.bible_chapters c ON c.book_id = b.id
-- LEFT JOIN public.bible_verses v ON v.chapter_id = c.id
-- WHERE b.slug IN ('1-macabeus', '2-macabeus', 'job', 'salmos')
-- GROUP BY b.slug, b.name, b.chapters_count
-- ORDER BY b.slug;

-- <<< FIM DA VALIDAÇÃO <<<
