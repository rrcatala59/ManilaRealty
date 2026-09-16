import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/src/lib/auth-guard";
import { getServiceSupabase, isSupabaseConfigured } from "@/src/lib/supabase";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PROPERTY_IMAGE_BYTES,
  PROPERTY_IMAGES_BUCKET,
  sanitizeStorageFilename,
  storageObjectPath,
} from "@/src/utils/storage";

export async function POST(request: Request) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > MAX_PROPERTY_IMAGE_BYTES) {
    return NextResponse.json({ error: "Images must be 8 MB or smaller." }, { status: 400 });
  }
  if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use JPEG, PNG, WebP, AVIF, or GIF." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = sanitizeStorageFilename(file.name);
  const objectPath = storageObjectPath(filename);

  const service = getServiceSupabase();
  if (isSupabaseConfigured() && service) {
    const { error } = await service.storage.from(PROPERTY_IMAGES_BUCKET).upload(objectPath, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data } = service.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ url: data.publicUrl, bucket: PROPERTY_IMAGES_BUCKET, path: objectPath });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}`, bucket: null, path: filename });
}
