-- Public SELECT so the Image Transformation / render endpoint can read listing photos.
drop policy if exists "Allow public image transformation reads" on storage.objects;
create policy "Allow public image transformation reads"
on storage.objects for select
using (bucket_id = 'property-images');
