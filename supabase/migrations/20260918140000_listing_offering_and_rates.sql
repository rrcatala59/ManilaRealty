-- Sale vs rental offering, plus optional nightly stay rate.
alter table public.properties
  add column if not exists offering text not null default 'BOTH';

alter table public.properties
  drop constraint if exists properties_offering_check;

alter table public.properties
  add constraint properties_offering_check
  check (offering in ('SALE', 'RENTAL', 'BOTH'));

alter table public.properties
  add column if not exists nightly_rate integer;

alter table public.properties
  drop constraint if exists properties_nightly_rate_check;

alter table public.properties
  add constraint properties_nightly_rate_check
  check (nightly_rate is null or nightly_rate >= 0);
