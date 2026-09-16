import { getServiceSupabase } from "@/src/lib/supabase";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PROPERTY_IMAGE_BYTES,
  PROPERTY_IMAGES_BUCKET,
} from "@/src/utils/storage";

async function main() {
  const supabase = getServiceSupabase();
  if (!supabase) {
    console.log(
      "No SUPABASE_SERVICE_ROLE_KEY. Skipping bucket create. Local uploads stay in public/uploads."
    );
    console.log("Apply SQL with npm run db:migrate:supabase when a project is linked.");
    process.exit(0);
  }

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const exists = (buckets ?? []).some((bucket) => bucket.id === PROPERTY_IMAGES_BUCKET);
  if (exists) {
    const { error } = await supabase.storage.updateBucket(PROPERTY_IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: String(MAX_PROPERTY_IMAGE_BYTES),
      allowedMimeTypes: [...ACCEPTED_IMAGE_TYPES],
    });
    if (error) throw error;
    console.log(`Updated public bucket ${PROPERTY_IMAGES_BUCKET} (public-read, 8 MB images).`);
    return;
  }

  const { error } = await supabase.storage.createBucket(PROPERTY_IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: String(MAX_PROPERTY_IMAGE_BYTES),
    allowedMimeTypes: [...ACCEPTED_IMAGE_TYPES],
  });
  if (error) throw error;
  console.log(`Created public bucket ${PROPERTY_IMAGES_BUCKET}. Run npm run db:migrate:supabase for RLS.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
