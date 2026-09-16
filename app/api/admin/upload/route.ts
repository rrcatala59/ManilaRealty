import { auth } from "@/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/src/lib/supabase";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "") || "image.jpg";
  const filename = `${Date.now()}-${safeName}`;

  const service = getServiceSupabase();
  if (isSupabaseConfigured() && service) {
    const { error } = await service.storage.from("property-images").upload(filename, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data } = service.storage.from("property-images").getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
