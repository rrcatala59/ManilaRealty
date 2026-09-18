export const PROPERTY_IMAGES_BUCKET = "property-images";
export const PROPERTY_IMAGES_PREFIX = "listings";
export const MAX_PROPERTY_IMAGE_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export function sanitizeStorageFilename(originalName: string) {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "") || "image.jpg";
  return `${Date.now()}-${safe}`;
}

export function storageObjectPath(filename: string) {
  return `${PROPERTY_IMAGES_PREFIX}/${filename}`;
}

export function isPropertyImagePath(url: string) {
  return (
    url.startsWith("/") ||
    url.startsWith("https://") ||
    url.includes(`/${PROPERTY_IMAGES_BUCKET}/`)
  );
}

export function publicUrlFromSupabase(baseUrl: string, objectPath: string) {
  const origin = baseUrl.replace(/\/$/, "");
  return `${origin}/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/${objectPath}`;
}

/** Client-side transfer into the admin upload pipeline (Storage or local /uploads). */
export async function uploadPropertyImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_PROPERTY_IMAGE_BYTES) {
      throw new Error(`${file.name} is still larger than 8 MB after compression.`);
    }
    if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`${file.name} is not a supported image type.`);
    }
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body,
      credentials: "same-origin",
    });
    const text = await response.text();
    let data: { url?: string; error?: string } = {};
    if (text) {
      try {
        data = JSON.parse(text) as { url?: string; error?: string };
      } catch {
        throw new Error(`Upload failed (${response.status}).`);
      }
    }
    if (!response.ok || !data.url) {
      throw new Error(data.error || `Upload failed (${response.status}).`);
    }
    urls.push(data.url);
  }
  return urls;
}

export function mergeImagePaths(existing: string, incoming: string[]) {
  return [existing, ...incoming].filter(Boolean).join("\n");
}

export function parseImagePathList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
