import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/src/lib/auth-guard";
import { isSupabaseConfigured, supabaseAnonKey, supabaseProjectUrl } from "@/src/lib/supabase";
import { createServerSupabase } from "@/src/lib/supabase/server";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PROPERTY_IMAGE_BYTES,
  PROPERTY_IMAGES_BUCKET,
  publicUrlFromSupabase,
  sanitizeStorageFilename,
  storageObjectPath,
} from "@/src/utils/storage";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function uploadedBlob(value: FormDataEntryValue | null): Blob | null {
  if (!value || typeof value === "string") return null;
  return value;
}

async function sessionAccessToken() {
  const supabase = await createServerSupabase();
  if (!supabase) return "";
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

async function uploadToStorage(objectPath: string, bytes: Buffer, mimeType: string) {
  const origin = supabaseProjectUrl();
  const anonKey = supabaseAnonKey();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const userToken = await sessionAccessToken();
  const token = serviceKey || userToken || anonKey;
  if (!origin || !token) {
    throw new Error("Supabase Storage is not configured.");
  }

  const response = await fetch(`${origin}/storage/v1/object/${PROPERTY_IMAGES_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey || token,
      "Content-Type": mimeType,
    },
    body: new Uint8Array(bytes),
  });
  const text = await response.text();
  if (response.ok) {
    return publicUrlFromSupabase(origin, objectPath);
  }

  let detail = text.slice(0, 240) || `HTTP ${response.status}`;
  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    detail = parsed.message || parsed.error || detail;
  } catch {
    // Keep the raw body.
  }
  if (response.status === 400 && /not found|bucket/i.test(detail)) {
    throw new Error("The property-images bucket is missing. Recreate it from supabase/structure.sql.");
  }
  if ((response.status === 403 || response.status === 401) && !serviceKey) {
    throw new Error(
      `${detail} Add SUPABASE_SERVICE_ROLE_KEY on the host (.env.local and Vercel) so studio uploads can write to Storage.`
    );
  }
  throw new Error(detail);
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminOrNull();
    if (!admin) {
      return jsonError("Unauthorized. Sign in to the studio, then try again.", 401);
    }

    const formData = await request.formData();
    const file = uploadedBlob(formData.get("file"));
    if (!file || file.size === 0) {
      return jsonError("No file uploaded", 400);
    }
    if (file.size > MAX_PROPERTY_IMAGE_BYTES) {
      return jsonError("Images must be 8 MB or smaller.", 400);
    }
    const mimeType = file.type || "image/webp";
    if (mimeType && !ACCEPTED_IMAGE_TYPES.includes(mimeType)) {
      return jsonError("Use JPEG, PNG, WebP, AVIF, or GIF.", 400);
    }

    const filename = sanitizeStorageFilename("name" in file && typeof file.name === "string" ? file.name : "image.webp");
    const objectPath = storageObjectPath(filename);
    const bytes = Buffer.from(await file.arrayBuffer());

    if (isSupabaseConfigured()) {
      const url = await uploadToStorage(objectPath, bytes, mimeType);
      return NextResponse.json({ url, bucket: PROPERTY_IMAGES_BUCKET, path: objectPath });
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({ url: `/uploads/${filename}`, bucket: null, path: filename });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return jsonError(message, 500);
  }
}
