-- Seed three demo listings. Paste THIS SQL, not the filename.
-- If public.properties does not exist, run supabase/structure.sql first.

do $$
begin
  if to_regclass('public.properties') is null then
    raise exception 'public.properties does not exist. Run the structure.sql file in this editor first.';
  end if;
end $$;

do $$
begin
  if to_regclass('public.reservations') is not null then
    delete from public.reservations
    where property_id in (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003'
    );
  end if;
end $$;

delete from public.properties
where slug in (
  'laperal-loft-salcedo',
  '26th-street-gallery-residence',
  'hemady-garden-new-manila'
)
or id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

insert into public.properties (
  id, title, slug, description, price, city, address, type,
  beds, baths, sqm, amenities, lat, lng, images, status, is_available, is_featured
) values (
  '00000000-0000-0000-0000-000000000001',
  'Laperal Loft at Salcedo',
  'laperal-loft-salcedo',
  'A one-bedroom loft on a quiet Salcedo side street.',
  16800000,
  'Makati',
  'Laperal, Salcedo Village, Makati',
  'CONDO',
  1, 1, 68,
  '["Concierge","Pool","Gym","Parking"]'::jsonb,
  14.5601,
  121.0248,
  '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80"]'::jsonb,
  'AVAILABLE',
  true,
  true
);

insert into public.properties (
  id, title, slug, description, price, city, address, type,
  beds, baths, sqm, amenities, lat, lng, images, status, is_available, is_featured
) values (
  '00000000-0000-0000-0000-000000000002',
  '26th Street Gallery Residence',
  '26th-street-gallery-residence',
  'A two-bedroom on 26th Street facing the BGC skyline.',
  31200000,
  'BGC',
  '26th Street, Bonifacio Global City, Taguig',
  'CONDO',
  2, 2, 112,
  '["Pool","Gym","Concierge","Parking"]'::jsonb,
  14.5506,
  121.0478,
  '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80"]'::jsonb,
  'AVAILABLE',
  true,
  true
);

insert into public.properties (
  id, title, slug, description, price, city, address, type,
  beds, baths, sqm, amenities, lat, lng, images, status, is_available, is_featured
) values (
  '00000000-0000-0000-0000-000000000003',
  'Hemady Garden House',
  'hemady-garden-new-manila',
  'A three-bedroom house on a leafy New Manila street.',
  54800000,
  'New Manila',
  'Hemady Street, New Manila, Quezon City',
  'HOUSE',
  3, 3, 286,
  '["Garden","Parking","Backup power"]'::jsonb,
  14.6158,
  121.0334,
  '["https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80"]'::jsonb,
  'AVAILABLE',
  true,
  true
);
