-- Brisa Realty: properties, inquiries, reservations, admin profiles, storage.
-- Apply with: npm run db:migrate:supabase
-- Requires SUPABASE_DB_URL (Postgres connection string from Project Settings → Database).

create extension if not exists "pgcrypto";

create table if not exists public.properties (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  title text not null,
  slug text not null unique,
  description text not null,
  price integer not null check (price >= 0),
  city text not null,
  address text not null,
  type text not null check (type in ('CONDO', 'HOUSE', 'COMMERCIAL')),
  beds integer not null default 0,
  baths integer not null default 0,
  sqm integer not null,
  amenities jsonb not null default '[]'::jsonb,
  lat double precision not null,
  lng double precision not null,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE', 'RENTED', 'SOLD')),
  is_available boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  guest_name text not null default '',
  guest_email text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_admin)
  values (new.id, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.reservations enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Public can read listings" on public.properties;
create policy "Public can read listings" on public.properties
  for select using (true);

drop policy if exists "Admins insert listings" on public.properties;
create policy "Admins insert listings" on public.properties
  for insert with check (public.is_admin());

drop policy if exists "Admins update listings" on public.properties;
create policy "Admins update listings" on public.properties
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins delete listings" on public.properties;
create policy "Admins delete listings" on public.properties
  for delete using (public.is_admin());

drop policy if exists "Public can submit inquiries" on public.inquiries;
create policy "Public can submit inquiries" on public.inquiries
  for insert with check (
    char_length(name) between 2 and 80
    and char_length(email) between 5 and 120
    and char_length(phone) between 7 and 24
    and char_length(message) between 10 and 2000
  );

drop policy if exists "Admins read inquiries" on public.inquiries;
create policy "Admins read inquiries" on public.inquiries
  for select using (public.is_admin());

drop policy if exists "Public can read reservation windows" on public.reservations;
create policy "Public can read reservation windows" on public.reservations
  for select using (status in ('pending', 'confirmed', 'blocked'));

drop policy if exists "Public can request stays" on public.reservations
  for insert with check (
    status = 'pending'
    and end_date > start_date
    and char_length(guest_name) between 2 and 80
    and char_length(guest_email) between 5 and 120
  );

drop policy if exists "Admins manage reservations" on public.reservations;
create policy "Admins manage reservations" on public.reservations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read property images" on storage.objects;
create policy "Public read property images" on storage.objects
  for select using (bucket_id = 'property-images');

drop policy if exists "Admins upload property images" on storage.objects;
create policy "Admins upload property images" on storage.objects
  for insert with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "Admins update property images" on storage.objects;
create policy "Admins update property images" on storage.objects
  for update using (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "Admins delete property images" on storage.objects;
create policy "Admins delete property images" on storage.objects
  for delete using (bucket_id = 'property-images' and public.is_admin());
