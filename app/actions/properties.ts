"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PropertyStatus, PropertyType } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
}

function parsePropertyForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const type = String(formData.get("type") ?? "CONDO") as PropertyType;
  const status = String(formData.get("status") ?? "AVAILABLE") as PropertyStatus;
  const price = Number(formData.get("price") ?? 0);
  const beds = Number(formData.get("beds") ?? 0);
  const baths = Number(formData.get("baths") ?? 0);
  const sqm = Number(formData.get("sqm") ?? 0);
  const lat = Number(formData.get("lat") ?? 14.5547);
  const lng = Number(formData.get("lng") ?? 121.0244);
  const isAvailable = formData.get("isAvailable") === "on";
  const isFeatured = formData.get("isFeatured") === "on";
  const amenities = String(formData.get("amenities") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const images = String(formData.get("images") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!title || !description || !city || !address || !price || !sqm) {
    throw new Error("Please fill in title, description, city, address, price, and size.");
  }

  return {
    title,
    slug: slugify(title),
    description,
    city,
    address,
    type,
    status,
    price,
    beds,
    baths,
    sqm,
    lat,
    lng,
    isAvailable,
    isFeatured,
    amenities: JSON.stringify(amenities),
    images: JSON.stringify(images),
  };
}

export async function createProperty(formData: FormData) {
  await requireAdmin();
  const data = parsePropertyForm(formData);
  const existing = await prisma.property.findUnique({ where: { slug: data.slug } });
  if (existing) {
    data.slug = `${data.slug}-${Date.now().toString(36)}`;
  }
  await prisma.property.create({ data });
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/admin");
  redirect("/admin/properties");
}

export async function updateProperty(id: string, formData: FormData) {
  await requireAdmin();
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Listing not found.");
  }
  const data = parsePropertyForm(formData);
  data.slug = existing.slug;
  await prisma.property.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath(`/admin/properties/${id}`);
  redirect("/admin/properties");
}

export async function deleteProperty(id: string) {
  await requireAdmin();
  await prisma.property.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/admin");
  redirect("/admin/properties");
}
