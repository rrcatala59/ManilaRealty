import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPHP } from "@/lib/format";
import { LuxuryPropertyLayout } from "@/src/components/LuxuryPropertyLayout";
import { listReservationWindows } from "@/src/lib/bookings";
import { getSupabase } from "@/src/lib/supabase";
import { normalizeProperty } from "@/src/types";
import { optimizeImageList } from "@/src/utils/imageLoader";

type PropertyPageContext = {
  params: Promise<{ id: string }>;
};

const LISTING_ID = /^[a-zA-Z0-9_-]+$/;
const OG_FALLBACK =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=630&q=80";

function siteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || "http://127.0.0.1:43123").replace(
    /\/$/,
    ""
  );
}

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

const notFoundMetadata: Metadata = {
  title: { absolute: "Property Not Found | Brisa Realty" },
  description: "The requested luxury property listing could not be found.",
  robots: { index: false, follow: false },
};

/**
 * Dynamic SEO Engine - Generates context-aware crawling rules for search bots.
 * Listing `city` is the location field; prices are localized as PHP.
 */
export async function generateMetadata({ params }: PropertyPageContext): Promise<Metadata> {
  const { id } = await params;
  if (!LISTING_ID.test(id)) return notFoundMetadata;

  const row = await fetchRawPropertyRow(id);
  if (!row) return notFoundMetadata;

  const property = normalizeProperty(row);
  const location = property.city;
  const formattedPrice = formatPHP(property.price);
  const cleanDescription =
    property.description.length > 155 ? `${property.description.slice(0, 155).trimEnd()}...` : property.description;
  const pageTitle = `${property.title} for Sale in ${location} | Brisa Realty`;
  const pageUrl = `${siteOrigin()}/properties/${property.id}`;
  const ogDescription =
    property.description.length > 200 ? property.description.slice(0, 200).trimEnd() : property.description;

  return {
    title: { absolute: pageTitle },
    description: `Discover this premium real estate listing: ${cleanDescription} Available at ${formattedPrice}.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: ogDescription,
      url: pageUrl,
      siteName: "Brisa Realty",
      locale: "en_PH",
      type: "video.other",
      images: [
        {
          url: property.images[0] || OG_FALLBACK,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function PropertyByIdPage({ params }: PropertyPageContext) {
  const { id } = await params;
  if (!LISTING_ID.test(id)) notFound();

  const row = await fetchRawPropertyRow(id);
  if (!row) notFound();

  const property = normalizeProperty(row);
  const windows = await listReservationWindows(property.id);
  const images = optimizeImageList(property.images, 1600, 80);

  return <LuxuryPropertyLayout property={{ ...property, images }} windows={windows} />;
}
