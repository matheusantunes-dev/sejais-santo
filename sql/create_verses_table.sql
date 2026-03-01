-- create_verses_table.sql
create table if not exists public.verses (
  id text primary key,
  text text,
  note text,
  author_email text,
  author_id text,
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  raw jsonb
);