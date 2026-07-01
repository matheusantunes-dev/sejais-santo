-- ==========================================================
-- Migration: Enable RLS policies on all tables
-- Version: 2026-06-30_002
--
-- Aplica Row Level Security seguindo princípio do menor
-- privilégio para todas as tabelas públicas.
--
-- Politicas:
--   - Tabelas bíblicas (bible_versions, bible_books,
--     bible_chapters, bible_verses): leitura pública,
--     escrita apenas service_role
--   - daily_gospel: leitura pública, escrita service_role
--   - verses (conteúdo do usuário): acesso restrito ao
--     próprio usuário via auth.uid()
--   - bible_cache (legado): leitura pública, escrita
--     service_role (será removida futuramente)
-- ==========================================================

-- 1. BIBLE VERSIONS
alter table if exists public.bible_versions enable row level security;

drop policy if exists "Bible versions are publicly readable" on public.bible_versions;
create policy "Bible versions are publicly readable"
    on public.bible_versions for select
    using (true);

drop policy if exists "Only service role can manage bible versions" on public.bible_versions;
create policy "Only service role can manage bible versions"
    on public.bible_versions for all
    to service_role
    using (true)
    with check (true);

-- 2. BIBLE BOOKS
alter table if exists public.bible_books enable row level security;

drop policy if exists "Bible books are publicly readable" on public.bible_books;
create policy "Bible books are publicly readable"
    on public.bible_books for select
    using (true);

drop policy if exists "Only service role can manage bible books" on public.bible_books;
create policy "Only service role can manage bible books"
    on public.bible_books for all
    to service_role
    using (true)
    with check (true);

-- 3. BIBLE CHAPTERS
alter table if exists public.bible_chapters enable row level security;

drop policy if exists "Bible chapters are publicly readable" on public.bible_chapters;
create policy "Bible chapters are publicly readable"
    on public.bible_chapters for select
    using (true);

drop policy if exists "Only service role can manage bible chapters" on public.bible_chapters;
create policy "Only service role can manage bible chapters"
    on public.bible_chapters for all
    to service_role
    using (true)
    with check (true);

-- 4. BIBLE VERSES
alter table if exists public.bible_verses enable row level security;

drop policy if exists "Bible verses are publicly readable" on public.bible_verses;
create policy "Bible verses are publicly readable"
    on public.bible_verses for select
    using (true);

drop policy if exists "Only service role can manage bible verses" on public.bible_verses;
create policy "Only service role can manage bible verses"
    on public.bible_verses for all
    to service_role
    using (true)
    with check (true);

-- 5. DAILY GOSPEL
-- Substitui políticas antigas (sem role) por políticas com service_role
alter table if exists public.daily_gospel enable row level security;

drop policy if exists "Anyone can read daily gospel" on public.daily_gospel;
create policy "Anyone can read daily gospel"
    on public.daily_gospel for select
    using (true);

drop policy if exists "Service role can manage daily gospel" on public.daily_gospel;
drop policy if exists "Only service role can manage daily gospel" on public.daily_gospel;
create policy "Only service role can manage daily gospel"
    on public.daily_gospel for all
    to service_role
    using (true)
    with check (true);

-- 6. VERSES (conteúdo do usuário — cada um vê apenas o seu)
alter table if exists public.verses enable row level security;

drop policy if exists "Users can read own verses" on public.verses;
create policy "Users can read own verses"
    on public.verses for select
    using (auth.uid() = user_id::uuid);

drop policy if exists "Users can create own verses" on public.verses;
create policy "Users can create own verses"
    on public.verses for insert
    with check (auth.uid() = user_id::uuid);

drop policy if exists "Users can delete own verses" on public.verses;
create policy "Users can delete own verses"
    on public.verses for delete
    using (auth.uid() = user_id::uuid);

-- 7. BIBLE CACHE (legado, será removida)
-- Mantém as policies existentes (já foram criadas em migration anterior)
-- Apenas garantindo que RLS está ativo
alter table if exists public.bible_cache enable row level security;

drop policy if exists "Bible cache is publicly readable" on public.bible_cache;
create policy "Bible cache is publicly readable"
    on public.bible_cache for select
    using (true);

drop policy if exists "Only service role can manage bible cache" on public.bible_cache;
create policy "Only service role can manage bible cache"
    on public.bible_cache for all
    to service_role
    using (true)
    with check (true);
