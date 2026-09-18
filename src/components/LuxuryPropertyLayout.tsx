import { Bath, BedDouble, MapPin, Maximize } from "lucide-react";
import { InquiryForm } from "@/src/components/InquiryForm";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyMap } from "@/components/property-map";
import { formatPHP, offeringLabel, statusLabel, typeLabel } from "@/lib/format";
import { BookingCalendar } from "@/src/components/BookingCalendar";
import { isSaleOffering, isStayOffering, type PropertyRecord, type ReservationWindow } from "@/src/types";

export function LuxuryPropertyLayout({
  property,
  windows,
}: {
  property: PropertyRecord;
  windows: ReservationWindow[];
}) {
  const listingRef = property.id.slice(-6).toUpperCase();
  const staysOpen = isStayOffering(property.offering) && property.isAvailable && property.status === "AVAILABLE";
  const forSale = isSaleOffering(property.offering);

  return (
    <article className="bg-background">
      <header className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-10">
        <h1 className="font-heading max-w-4xl text-3xl md:text-5xl">{property.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" /> {property.address}
          </span>
          <span>· {property.city}</span>
          <span>· {typeLabel(property.type)}</span>
          <span>· {offeringLabel(property.offering)}</span>
          {property.status !== "AVAILABLE" ? <span>· {statusLabel(property.status)}</span> : null}
        </p>
      </header>

      <section className="mx-auto mt-6 max-w-7xl px-5 md:px-8">
        <PropertyGallery images={property.images} title={property.title} />
      </section>

      <div className="mx-auto mt-10 grid max-w-7xl gap-12 px-5 pb-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-6 text-sm">
            <Spec icon={<BedDouble className="size-4" />} label={property.beds > 0 ? `${property.beds} bedrooms` : "Live / work"} />
            <Spec icon={<Bath className="size-4" />} label={`${property.baths} bathrooms`} />
            <Spec icon={<Maximize className="size-4" />} label={`${property.sqm} sqm`} />
          </dl>

          <section className="mt-10 max-w-2xl">
            <h2 className="font-heading text-3xl md:text-4xl">The home</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">{property.description}</p>
          </section>

          {property.amenities.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-heading text-3xl md:text-4xl">What this place offers</h2>
              <ul className="mt-6 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                {property.amenities.map((item) => (
                  <li key={item} className="rounded-xl border border-border bg-card px-3 py-2.5">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-12">
            <h2 className="font-heading text-3xl md:text-4xl">On the map</h2>
            <p className="mt-3 mb-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {property.address}, {property.city}.
            </p>
            <PropertyMap coordinates={property.coordinates} title={property.title} />
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          {staysOpen ? (
            <div>
              <h2 className="font-heading mb-4 text-3xl">Stay calendar</h2>
              <BookingCalendar
                propertyId={property.id}
                propertyTitle={property.title}
                isOpen={staysOpen}
                windows={windows}
                nightlyRate={property.nightlyRate}
              />
            </div>
          ) : null}

          {forSale ? (
            <div className="rounded-xl border border-border bg-card p-6 shadow-[0_20px_60px_-40px_rgba(28,25,23,0.45)]">
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
                {property.offering === "BOTH" ? "Also for sale" : "For sale"}
              </p>
              <p className="font-heading mt-1 text-3xl">{formatPHP(property.price)}</p>
              <p className="mt-2 mb-6 text-sm text-muted-foreground">
                Private inquiry for listing {listingRef}. A Brisa advisor replies with viewing times and papers.
              </p>
              <InquiryForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Questions</p>
              <h2 className="font-heading mt-1 text-2xl">Ask about this stay</h2>
              <p className="mt-2 mb-6 text-sm text-muted-foreground">Listing {listingRef}.</p>
              <InquiryForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
  );
}
