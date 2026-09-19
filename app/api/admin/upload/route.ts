import { NextResponse } from "next/server";
import { getAdminOrNull } from "@/src/lib/auth-guard";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PROPERTY_IMAGE_BYTES,
  sanitizeStorageFilename,
  storageObjectPath,
} from "@/src/utils/storage";

export const runtime = "nodejs";

// Initialize the AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWZ_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWZ_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWZ_SECRET_ACCESS_KEY || "",
  },
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function uploadedBlob(value: FormDataEntryValue | null): Blob | null {
  if (!value || typeof value === "string") return null;
  return value;
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
    // This generates your "listings/filename.jpg" path pattern
    const objectPath = storageObjectPath(filename); 
    const bytes = Buffer.from(await file.arrayBuffer());

    const bucketName = process.env.AWZ_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("AWZ_S3_BUCKET_NAME environment variable is not defined.");
    }

    // Upload files straight to AWS S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectPath,
        Body: bytes,
        ContentType: mimeType,
      })
    );

    // Build the clean public access S3 URL structure
    const url = `https://${bucketName}.s3.${process.env.AWZ_REGION || "ap-southeast-1"}://{objectPath}`;

    return NextResponse.json({ url, bucket: bucketName, path: objectPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return jsonError(message, 500);
  }
}
