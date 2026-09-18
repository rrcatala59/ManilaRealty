"use client";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PROPERTY_IMAGE_BYTES,
} from "@/src/utils/storage";

/** Same-origin upload so the browser never CORS-posts to Storage. */
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
