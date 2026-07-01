-- ==========================================================
-- Função de limpeza para reimportação segura dos dados
-- Execute UMA VEZ no SQL Editor antes de rodar import_bible.py
-- ==========================================================

create or replace function public.cleanup_import()
returns void
language plpgsql
security definer
as $$
begin
    -- Limpa na ordem inversa das foreign keys
    delete from public.bible_verses where 1=1;
    delete from public.bible_chapters where 1=1;
    delete from public.bible_books where 1=1;
    delete from public.bible_versions where 1=1;
end;
$$;
