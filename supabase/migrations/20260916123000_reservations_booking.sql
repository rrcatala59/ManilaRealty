-- Booking windows: guests may read blocked dates and request pending stays.
alter table public.reservations
  add column if not exists guest_name text not null default '';

alter table public.reservations
  add column if not exists guest_email text not null default '';

drop policy if exists "Admins manage reservations" on public.reservations;
drop policy if exists "Public can read reservation windows" on public.reservations;
drop policy if exists "Public can request stays" on public.reservations;

create policy "Public can read reservation windows" on public.reservations
  for select using (status in ('pending', 'confirmed', 'blocked'));

create policy "Public can request stays" on public.reservations
  for insert with check (
    status = 'pending'
    and end_date > start_date
    and char_length(guest_name) between 2 and 80
    and char_length(guest_email) between 5 and 120
  );

create policy "Admins manage reservations" on public.reservations
  for all using (public.is_admin()) with check (public.is_admin());
