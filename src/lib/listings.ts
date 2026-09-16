import { prisma } from "@/lib/prisma";
import { PRICE_RANGES } from "@/lib/constants";
import type { ListingFilters } from "@/lib/properties";
import { getSupabase } from "@/src/lib/supabase";
import {
  buildSearchClauses,
  sanitizeSearchClauses,
  type SearchFilterClause,
} from "@/src/lib/search-filters";
import {
  inquiryInputSchema,
  normalizeProperty,
  toInquiryInsert,
  type InquiryInput,
  type PropertyRecord,
} from "@/src/types";
import type { Prisma } from "@prisma/client";

async function fromPrismaMany(where: Parameters<typeof prisma.property.findMany>[0]) {
  const rows = await prisma.property.findMany(where);
  return rows.map((row) => normalizeProperty(row as unknown as Record<string, unknown>));
}

function clausesFromListingFilters(filters: ListingFilters): SearchFilterClause[] {
  return buildSearchClauses({
    area: filters.area || filters.city || "",
    category: filters.category || filters.type || "",
    minSqm: filters.minSqm || filters.sqm || "",
  });
}

function prismaWhereFromClauses(clauses: SearchFilterClause[]): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {};
  for (const clause of clauses) {
    if (clause.column === "city" && clause.op === "eq") where.city = String(clause.value);
    if (clause.column === "type" && clause.op === "eq") {
      where.type = clause.value as "CONDO" | "HOUSE" | "COMMERCIAL";
    }
    if (clause.column === "sqm" && clause.op === "gte") where.sqm = { gte: Number(clause.value) };
  }
  return where;
}

export async function listPropertiesByClauses(clauses: SearchFilterClause[]): Promise<PropertyRecord[]> {
  const safe = sanitizeSearchClauses(clauses);
  const supabase = getSupabase();
  if (supabase) {
    let query = supabase.from("properties").select("*");
    for (const clause of safe) {
      query = clause.op === "gte" ? query.gte(clause.column, clause.value) : query.eq(clause.column, clause.value);
    }
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => normalizeProperty(row as Record<string, unknown>));
  }

  return fromPrismaMany({
    where: prismaWhereFromClauses(safe),
    orderBy: { createdAt: "desc" },
  });
}

export async function listProperties(filters: ListingFilters = {}): Promise<PropertyRecord[]> {
  const clauses = clausesFromListingFilters(filters);
  const supabase = getSupabase();
  if (supabase) {
    let query = supabase.from("properties").select("*");
    for (const clause of clauses) {
      query = clause.op === "gte" ? query.gte(clause.column, clause.value) : query.eq(clause.column, clause.value);
    }
    if (filters.beds) query = query.gte("beds", Number(filters.beds));
    if (filters.price) {
      const range = PRICE_RANGES.find((item) => item.value === filters.price);
      if (range?.min !== undefined) query = query.gte("price", range.min);
      if (range?.max !== undefined) query = query.lte("price", range.max);
    }
    if (filters.sort === "price-asc") query = query.order("price", { ascending: true });
    else if (filters.sort === "price-desc") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => normalizeProperty(row as Record<string, unknown>));
  }

  const rows = await fromPrismaMany({
    where: {
      ...prismaWhereFromClauses(clauses),
      ...(filters.beds ? { beds: { gte: Number(filters.beds) } } : {}),
      ...(filters.price
        ? (() => {
            const range = PRICE_RANGES.find((item) => item.value === filters.price);
            if (!range) return {};
            return {
              price: {
                ...(range.min !== undefined ? { gte: range.min } : {}),
                ...(range.max !== undefined ? { lte: range.max } : {}),
              },
            };
          })()
        : {}),
    },
    orderBy:
      filters.sort === "price-asc"
        ? { price: "asc" }
        : filters.sort === "price-desc"
          ? { price: "desc" }
          : { createdAt: "desc" },
  });
  return rows;
}

export async function listFeaturedProperties(): Promise<PropertyRecord[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .order("price", { ascending: false })
      .limit(6);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => normalizeProperty(row as Record<string, unknown>));
  }

  return fromPrismaMany({
    where: { isFeatured: true },
    orderBy: { price: "desc" },
    take: 6,
  });
}

export async function getPropertyById(id: string): Promise<PropertyRecord | null> {
  const supabase = getSupabase();
  if (supabase) {
    const byId = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
    if (byId.error) throw new Error(byId.error.message);
    if (byId.data) return normalizeProperty(byId.data as Record<string, unknown>);

    const bySlug = await supabase.from("properties").select("*").eq("slug", id).maybeSingle();
    if (bySlug.error) throw new Error(bySlug.error.message);
    if (bySlug.data) return normalizeProperty(bySlug.data as Record<string, unknown>);
    return null;
  }

  const row = await prisma.property.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  return row ? normalizeProperty(row as unknown as Record<string, unknown>) : null;
}

export async function createInquiry(raw: InquiryInput | Record<string, string>) {
  const parsed = inquiryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const property = await getPropertyById(parsed.data.propertyId);
  if (!property) {
    return { ok: false as const, error: "That listing is no longer available." };
  }

  const payload = toInquiryInsert(parsed.data);
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("inquiries").insert(payload);
    if (error) return { ok: false as const, error: "We could not send that inquiry just now." };
    return { ok: true as const };
  }

  await prisma.inquiry.create({
    data: {
      propertyId: payload.property_id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
    },
  });
  return { ok: true as const };
}
