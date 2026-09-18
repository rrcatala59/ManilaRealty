-- Master administrator flag. Paste this SQL (not the filename) in the SQL Editor.
-- The first studio admin who opens Administrators becomes master if none exists.

alter table public.profiles
  add column if not exists is_master boolean not null default false;

create unique index if not exists profiles_one_master
  on public.profiles (is_master)
  where is_master;
