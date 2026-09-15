import { notFound } from "next/navigation";
import { Bath, BedDouble, MapPin, Maximize } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { InquiryForm } from "@/components/inquiry-form";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyMap } from "@/components/property-map";
import { formatPHP, parseJsonList, statusLabel, typeLabel } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await prisma.property.findUnique({ where: { slug } });
  return { title: property?.title ?? "Listing" };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await prisma.property.findUnique({ where: { slug } });
  if (!property) notFound();

  const images = parseJsonList(property.images);
  const amenities = parseJsonList(property.amenities);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">
        {property.city} · {typeLabel(property.type)} · {statusLabel(property.status)}
      </p>
      <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h1 className="font-heading text-4xl md:text-6xl">{property.title}</h1>
        <p className="text-xl font-medium md:text-2xl">{formatPHP(property.price)}</p>
      </div>
      <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" /> {property.address}
      </p>

      <div className="mt-8">
        <PropertyGallery images={images} title={property.title} />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap gap-6 border-y border-border py-6 text-sm">
            {property.beds > 0 ? (
              <span className="inline-flex items-center gap-2">
                <BedDouble className="size-4" /> {property.beds} bedrooms
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2">
              <Bath className="size-4" /> {property.baths} bathrooms
            </span>
            <span className="inline-flex items-center gap-2">
              <Maximize className="size-4" /> {property.sqm} sqm
            </span>
          </div>
          <div className="prose prose-stone mt-8 max-w-2xl">
            <h2 className="font-heading text-3xl">The home</h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">{property.description}</p>
          </div>
          {amenities.length > 0 ? (
            <div className="mt-10">
              <h2 className="font-heading text-3xl">Amenities</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                {amenities.map((item) => (
                  <li key={item} className="border border-border bg-card px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-10">
            <h2 className="font-heading text-3xl">On the map</h2>
            <p className="mt-2 mb-4 text-sm text-muted-foreground">
              Approximate location in {property.city}. Pin is a stub for a full mapping integration.
            </p>
            <PropertyMap lat={property.lat} lng={property.lng} title={property.title} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 h-fit border border-border bg-card p-6">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Private inquiry</p>
          <h2 className="font-heading mt-1 text-3xl">Request this home</h2>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">
            Tied to listing {property.id.slice(-6).toUpperCase()}. We reply within one business day.
          </p>
          <InquiryForm propertyId={property.id} propertyTitle={property.title} />
        </aside>
      </div>
    </div>
  );
}
