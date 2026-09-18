-- Master administrator flag.

alter table public.profiles
  add column if not exists is_master boolean not null default false;

create unique index if not exists profiles_one_master
  on public.profiles (is_master)
  where is_master;
