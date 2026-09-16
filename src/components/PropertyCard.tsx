import Link from "next/link";
import { Bath, BedDouble, Maximize } from "lucide-react";
import { ImageCarousel } from "@/components/image-carousel";
import { PropertyCardImage } from "@/src/components/blocks/PropertyCard";
import { formatPHP, typeLabel } from "@/lib/format";
import { statusTone } from "@/lib/properties";
import { cn } from "@/lib/utils";
import type { PropertyRecord } from "@/src/types";

export function PropertyCard({ property }: { property: PropertyRecord }) {
  const images = property.images;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block transition-transform duration-300 hover:-translate-y-1"
    >
      <article className="overflow-hidden rounded-sm bg-card shadow-[0_1px_0_rgba(28,25,23,0.06)] ring-1 ring-border/80">
        <div className="relative aspect-[4/3]">
          {images.length > 1 ? (
            <ImageCarousel images={images} alt={property.title} className="absolute inset-0" />
          ) : (
            <PropertyCardImage src={images[0] ?? ""} title={property.title} />
          )}
          <span
            className={cn(
              "absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase",
              statusTone(property.status)
            )}
          >
            {property.status === "AVAILABLE" ? typeLabel(property.type) : property.status}
          </span>
        </div>
        <div className="space-y-3 p-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            {property.city}
          </p>
          <h3 className="font-heading text-2xl leading-tight text-foreground group-hover:opacity-80">
            {property.title}
          </h3>
          <p className="text-sm font-medium tracking-wide">{formatPHP(property.price)}</p>
          <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
            {property.beds > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="size-3.5" /> {property.beds} bed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">Live / work</span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Bath className="size-3.5" /> {property.baths} bath
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Maximize className="size-3.5" /> {property.sqm} sqm
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
