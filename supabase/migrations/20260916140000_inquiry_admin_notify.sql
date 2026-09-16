-- Auto-notify advisors when a guest submits public.inquiries.
-- AFTER INSERT writes inquiry_notification_outbox and, when pg_net is present
-- and notification_config.webhook_url is set, POSTs to /api/notify/inquiry.

create extension if not exists "pgcrypto";

do $ext$
begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net not available; inquiry trigger will write outbox only';
end
$ext$;

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

alter table public.inquiry_notification_outbox enable row level security;
alter table public.notification_config enable row level security;

drop policy if exists "Admins read inquiry notify outbox" on public.inquiry_notification_outbox;
create policy "Admins read inquiry notify outbox" on public.inquiry_notification_outbox
  for select using (public.is_admin());

drop policy if exists "Admins manage notification config" on public.notification_config;
create policy "Admins manage notification config" on public.notification_config
  for all using (public.is_admin()) with check (public.is_admin());

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
