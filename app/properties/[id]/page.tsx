import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LuxuryPropertyLayout } from "@/src/components/LuxuryPropertyLayout";
import { listReservationWindows } from "@/src/lib/bookings";
import { getSupabase } from "@/src/lib/supabase";
import { normalizeProperty } from "@/src/types";
import { optimizeImageList } from "@/src/utils/imageLoader";

type PropertyPageContext = {
  params: Promise<{ id: string }>;
};

const LISTING_ID = /^[a-zA-Z0-9_-]+$/;

async function fetchRawPropertyRow(id: string): Promise<Record<string, unknown> | null> {
  const supabase = getSupabase();
  if (supabase) {
    const byId = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
    if (byId.error) throw new Error(byId.error.message);
    if (byId.data) return byId.data as Record<string, unknown>;

    const bySlug = await supabase.from("properties").select("*").eq("slug", id).maybeSingle();
    if (bySlug.error) throw new Error(bySlug.error.message);
    return (bySlug.data as Record<string, unknown> | null) ?? null;
  }

  const row = await prisma.property.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  return row ? (row as unknown as Record<string, unknown>) : null;
}

export async function generateMetadata(context: PropertyPageContext) {
  const { id } = await context.params;
  if (!LISTING_ID.test(id)) return { title: "Listing" };
  const row = await fetchRawPropertyRow(id);
  return { title: typeof row?.title === "string" ? row.title : "Listing" };
}

export default async function PropertyByIdPage(context: PropertyPageContext) {
  const { id } = await context.params;
  if (!LISTING_ID.test(id)) notFound();

  const row = await fetchRawPropertyRow(id);
  if (!row) notFound();

  const property = normalizeProperty(row);
  const windows = await listReservationWindows(property.id);
  const images = optimizeImageList(property.images, 1600, 80);

  return <LuxuryPropertyLayout property={{ ...property, images }} windows={windows} />;
}
