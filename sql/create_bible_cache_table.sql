create table if not exists public.bible_cache (
  id serial primary key,
  reference text not null unique,
  book_slug text not null,
  chapter smallint not null,
  data jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_bible_cache_reference on public.bible_cache (reference);

alter table public.bible_cache enable row level security;

create policy "Anyone can read bible cache"
  on public.bible_cache for select
  using (true);

create policy "Service role can manage bible cache"
  on public.bible_cache for all
  using (true)
  with check (true);
