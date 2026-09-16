-- Optional Supabase schema for Brisa Realty.
-- Local development uses Prisma + SQLite until NEXT_PUBLIC_SUPABASE_URL is set.

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
  status text not null default 'placeholder',
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.reservations enable row level security;

create policy "Public can read listings" on public.properties
  for select using (true);

create policy "Public can submit inquiries" on public.inquiries
  for insert with check (
    char_length(name) between 2 and 80
    and char_length(email) between 5 and 120
    and char_length(phone) between 7 and 24
    and char_length(message) between 10 and 2000
  );
