create table if not exists public.daily_gospel (
  id serial primary key,
  date text not null unique,
  referencia text not null,
  texto text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_daily_gospel_date on public.daily_gospel (date);

alter table public.daily_gospel enable row level security;

create policy "Anyone can read daily gospel"
  on public.daily_gospel for select
  using (true);

create policy "Service role can manage daily gospel"
  on public.daily_gospel for all
  using (true)
  with check (true);
