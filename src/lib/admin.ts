import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { getServiceSupabase, getSupabase } from "@/src/lib/supabase";
import { createServerSupabase } from "@/src/lib/supabase/server";
import { listProperties, getPropertyById } from "@/src/lib/listings";
import { normalizeProperty, type PropertyRecord } from "@/src/types";

export type AdminInquiry = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
};

export type DashboardStats = {
  listings: number;
  available: number;
  inquiries: number;
  recent: AdminInquiry[];
};

async function writeClient() {
  return getServiceSupabase() ?? (await createServerSupabase()) ?? getSupabase();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await writeClient();
  if (supabase) {
    const [{ data: properties }, { data: inquiries }] = await Promise.all([
      supabase.from("properties").select("id, status"),
      supabase
        .from("inquiries")
        .select("id, property_id, name, email, phone, message, created_at, properties(title)")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);
    const list = properties ?? [];
    const recent = inquiriesFromJoin(inquiries ?? []);
    const { count } = await supabase.from("inquiries").select("id", { count: "exact", head: true });
    return {
      listings: list.length,
      available: list.filter((item) => item.status === "AVAILABLE").length,
      inquiries: count ?? recent.length,
      recent,
    };
  }

  const [listings, available, inquiries, recentRows] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.inquiry.count(),
    prisma.inquiry.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { property: { select: { title: true } } },
    }),
  ]);

  return {
    listings,
    available,
    inquiries,
    recent: recentRows.map((row) => ({
      id: row.id,
      propertyId: row.propertyId,
      propertyTitle: row.property.title,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function listAdminProperties(): Promise<PropertyRecord[]> {
  return listProperties({ sort: "newest" });
}

export async function listAdminInquiries(): Promise<AdminInquiry[]> {
  const supabase = await writeClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("inquiries")
      .select("id, property_id, name, email, phone, message, created_at, properties(title)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (inquiriesFromJoin(data ?? []));
  }

  const rows = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    propertyId: row.propertyId,
    propertyTitle: row.property.title,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  }));
}

function inquiriesFromJoin(
  data: Array<{
    id: unknown;
    property_id: unknown;
    name: unknown;
    email: unknown;
    phone: unknown;
    message: unknown;
    created_at: unknown;
    properties?: { title?: string } | { title?: string }[] | null;
  }>
): AdminInquiry[] {
  return data.map((row) => ({
    id: String(row.id),
    propertyId: String(row.property_id),
    propertyTitle: Array.isArray(row.properties)
      ? String(row.properties[0]?.title ?? "Listing")
      : String(row.properties?.title ?? "Listing"),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone),
    message: String(row.message),
    createdAt: String(row.created_at),
  }));
}

function parsePropertyPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const type = String(formData.get("type") ?? "CONDO");
  const status = String(formData.get("status") ?? "AVAILABLE");
  const price = Number(formData.get("price") ?? 0);
  const beds = Number(formData.get("beds") ?? 0);
  const baths = Number(formData.get("baths") ?? 0);
  const sqm = Number(formData.get("sqm") ?? 0);
  const lat = Number(formData.get("lat") ?? 14.5547);
  const lng = Number(formData.get("lng") ?? 121.0244);
  const offering = String(formData.get("offering") ?? "BOTH");
  const nightlyRaw = String(formData.get("nightlyRate") ?? "").trim();
  const nightlyRate = nightlyRaw === "" ? null : Number(nightlyRaw);
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
    offering: offering === "SALE" || offering === "RENTAL" || offering === "BOTH" ? offering : "BOTH",
    nightlyRate: nightlyRate != null && Number.isFinite(nightlyRate) && nightlyRate >= 0 ? Math.round(nightlyRate) : null,
    price,
    beds,
    baths,
    sqm,
    lat,
    lng,
    amenities,
    images,
    isAvailable,
    isFeatured,
  };
}

export async function upsertProperty(id: string | null, formData: FormData): Promise<PropertyRecord> {
  const payload = parsePropertyPayload(formData);
  const supabase = await writeClient();

  if (supabase) {
    const row = {
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      city: payload.city,
      address: payload.address,
      type: payload.type,
      status: payload.status,
      offering: payload.offering,
      nightly_rate: payload.nightlyRate,
      price: payload.price,
      beds: payload.beds,
      baths: payload.baths,
      sqm: payload.sqm,
      lat: payload.lat,
      lng: payload.lng,
      amenities: payload.amenities,
      images: payload.images,
      is_available: payload.isAvailable,
      is_featured: payload.isFeatured,
    };

    if (id) {
      const existing = await getPropertyById(id);
      if (existing) row.slug = existing.slug;
      const { data, error } = await supabase.from("properties").update(row).eq("id", id).select("*").single();
      if (error) throw new Error(error.message);
      return normalizeProperty(data as Record<string, unknown>);
    }

    const clash = await supabase.from("properties").select("id").eq("slug", row.slug).maybeSingle();
    if (clash.data) row.slug = `${row.slug}-${Date.now().toString(36)}`;
    const { data, error } = await supabase.from("properties").insert(row).select("*").single();
    if (error) throw new Error(error.message);
    return normalizeProperty(data as Record<string, unknown>);
  }

  if (id) {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) throw new Error("Listing not found.");
    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...payload,
        slug: existing.slug,
        amenities: JSON.stringify(payload.amenities),
        images: JSON.stringify(payload.images),
        type: payload.type as "CONDO" | "HOUSE" | "COMMERCIAL",
        status: payload.status as "AVAILABLE" | "RENTED" | "SOLD",
      },
    });
    return normalizeProperty(updated as unknown as Record<string, unknown>);
  }

  let slug = payload.slug;
  const existing = await prisma.property.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;
  const created = await prisma.property.create({
    data: {
      ...payload,
      slug,
      amenities: JSON.stringify(payload.amenities),
      images: JSON.stringify(payload.images),
      type: payload.type as "CONDO" | "HOUSE" | "COMMERCIAL",
      status: payload.status as "AVAILABLE" | "RENTED" | "SOLD",
    },
  });
  return normalizeProperty(created as unknown as Record<string, unknown>);
}

export async function removeProperty(id: string) {
  const supabase = await writeClient();
  if (supabase) {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await prisma.property.delete({ where: { id } });
}
