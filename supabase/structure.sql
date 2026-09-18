-- Brisa Realty — schema only (no listing/inquiry/reservation rows).
-- For a new hosted Supabase project: SQL Editor → New query → paste this file → Run.
-- After apply: set webhook_url / webhook_secret on public.notification_config,
-- then mark studio users: update public.profiles set is_admin = true where id = '<auth uuid>';
-- Optional listings: npm run db:seed:supabase (needs SUPABASE_* env).

create extension if not exists "pgcrypto";

do $ext$
begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net not available; inquiry trigger will write outbox only';
end
$ext$;

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
  offering text not null default 'BOTH' check (offering in ('SALE', 'RENTAL', 'BOTH')),
  nightly_rate integer check (nightly_rate is null or nightly_rate >= 0),
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
  is_master boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_one_master
  on public.profiles (is_master)
  where is_master;

create table if not exists public.inquiry_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  payload jsonb not null,
  status text not null default 'pending',
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists inquiry_notification_outbox_status_idx
  on public.inquiry_notification_outbox (status, created_at desc);

create table if not exists public.notification_config (
  id boolean primary key default true check (id),
  webhook_url text not null default '',
  webhook_secret text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.notification_config (id, webhook_url, webhook_secret)
values (true, '', '')
on conflict (id) do nothing;

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
  insert into public.profiles (id, is_admin, is_master)
  values (new.id, false, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.notify_admins_on_inquiry()
returns trigger
language plpgsql
security definer
set search_path = public, net
as $$
declare
  listing_title text;
  admin_emails text[] := '{}';
  payload jsonb;
  endpoint text;
  secret text;
  headers jsonb;
begin
  select title into listing_title from public.properties where id = new.property_id;

  begin
    select coalesce(array_agg(u.email::text), '{}')
      into admin_emails
    from auth.users u
    join public.profiles p on p.id = u.id
    where p.is_admin = true
      and u.email is not null;
  exception when undefined_table then
    admin_emails := '{}';
  end;

  payload := jsonb_build_object(
    'inquiryId', new.id,
    'propertyId', new.property_id,
    'propertyTitle', coalesce(listing_title, 'Listing'),
    'name', new.name,
    'email', new.email,
    'phone', new.phone,
    'message', new.message,
    'createdAt', new.created_at,
    'adminEmails', to_jsonb(admin_emails)
  );

  insert into public.inquiry_notification_outbox (inquiry_id, payload, status)
  values (new.id, payload, 'pending');

  select webhook_url, webhook_secret into endpoint, secret
  from public.notification_config
  where id = true;

  if endpoint is not null and length(trim(endpoint)) > 0 then
    headers := jsonb_build_object('Content-Type', 'application/json');
    if secret is not null and length(trim(secret)) > 0 then
      headers := headers || jsonb_build_object('Authorization', 'Bearer ' || secret);
    end if;

    begin
      perform net.http_post(
        url := trim(endpoint),
        headers := headers,
        body := payload
      );
    exception when undefined_function then
      null;
    when others then
      update public.inquiry_notification_outbox
        set error = left(SQLERRM, 500)
        where inquiry_id = new.id
          and sent_at is null;
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists on_inquiry_submitted_notify_admins on public.inquiries;
create trigger on_inquiry_submitted_notify_admins
  after insert on public.inquiries
  for each row execute procedure public.notify_admins_on_inquiry();

alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.reservations enable row level security;
alter table public.profiles enable row level security;
alter table public.inquiry_notification_outbox enable row level security;
alter table public.notification_config enable row level security;

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

drop policy if exists "Public can request stays" on public.reservations;
create policy "Public can request stays" on public.reservations
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

drop policy if exists "Admins read inquiry notify outbox" on public.inquiry_notification_outbox;
create policy "Admins read inquiry notify outbox" on public.inquiry_notification_outbox
  for select using (public.is_admin());

drop policy if exists "Admins manage notification config" on public.notification_config;
create policy "Admins manage notification config" on public.notification_config
  for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read property images" on storage.objects;
create policy "Public read property images" on storage.objects
  for select
  using (bucket_id = 'property-images');

drop policy if exists "Allow public image transformation reads" on storage.objects;
create policy "Allow public image transformation reads"
on storage.objects for select
using (bucket_id = 'property-images');

drop policy if exists "Admins upload property images" on storage.objects;
create policy "Admins upload property images" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "Admins update property images" on storage.objects;
create policy "Admins update property images" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin())
  with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "Admins delete property images" on storage.objects;
create policy "Admins delete property images" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin());
