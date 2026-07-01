-- Add liturgical metadata columns to daily_gospel table
-- Run this after create_daily_gospel_table.sql

alter table public.daily_gospel add column if not exists liturgical_season varchar(20);
alter table public.daily_gospel add column if not exists sunday_cycle char(1);
alter table public.daily_gospel add column if not exists ferial_cycle char(2);
alter table public.daily_gospel add column if not exists week_number smallint;
alter table public.daily_gospel add column if not exists pericope varchar(40);
alter table public.daily_gospel add column if not exists book_abbrev varchar(10);
alter table public.daily_gospel add column if not exists liturgical_key varchar(30);

create index if not exists idx_daily_gospel_season on public.daily_gospel (liturgical_season);
create index if not exists idx_daily_gospel_cycle on public.daily_gospel (sunday_cycle);
