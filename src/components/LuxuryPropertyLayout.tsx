import { Bath, BedDouble, Compass, MapPin, Maximize } from "lucide-react";
import { InquiryForm } from "@/src/components/InquiryForm";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyMap } from "@/components/property-map";
import { formatPHP, statusLabel, typeLabel } from "@/lib/format";
import { BookingCalendar } from "@/src/components/BookingCalendar";
import type { PropertyRecord, ReservationWindow } from "@/src/types";

export function LuxuryPropertyLayout({
  property,
  windows,
}: {
  property: PropertyRecord;
  windows: ReservationWindow[];
}) {
  const { lat, lng } = property.coordinates;
  const listingRef = property.id.slice(-6).toUpperCase();

  return (
    <article className="bg-background">
      <header className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-14">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">
          {property.city} · {typeLabel(property.type)} · {statusLabel(property.status)}
        </p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h1 className="font-heading max-w-3xl text-4xl md:text-6xl">{property.title}</h1>
          <p className="text-xl font-medium md:text-2xl">{formatPHP(property.price)}</p>
        </div>
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" /> {property.address}
        </p>
      </header>

      <section className="mx-auto mt-8 max-w-7xl px-5 md:px-8">
        <div className="overflow-hidden rounded-sm ring-1 ring-border">
          <PropertyGallery images={property.images} title={property.title} />
        </div>
      </section>

      <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-5 pb-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-border sm:grid-cols-4">
            <Spec label="Bedrooms" value={property.beds > 0 ? String(property.beds) : "—"} icon={<BedDouble className="size-4" />} />
            <Spec label="Bathrooms" value={String(property.baths)} icon={<Bath className="size-4" />} />
            <Spec label="Size" value={`${property.sqm} sqm`} icon={<Maximize className="size-4" />} />
            <Spec
              label="Coordinates"
              value={`${lat.toFixed(4)}, ${lng.toFixed(4)}`}
              icon={<Compass className="size-4" />}
            />
          </dl>

          <section className="mt-12 max-w-2xl">
            <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">01</p>
            <h2 className="font-heading mt-2 text-3xl md:text-4xl">The home</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">{property.description}</p>
          </section>

          {property.amenities.length > 0 ? (
            <section className="mt-12">
              <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">02</p>
              <h2 className="font-heading mt-2 text-3xl md:text-4xl">Descriptive features</h2>
              <ul className="mt-6 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                {property.amenities.map((item) => (
                  <li key={item} className="border border-border bg-card px-3 py-2.5">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-12">
            <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">03</p>
            <h2 className="font-heading mt-2 text-3xl md:text-4xl">Stay calendar</h2>
            <p className="mt-3 mb-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Held nights are blocked from the reservations table. Check-out is the first free morning after the stay.
            </p>
            <BookingCalendar
              propertyId={property.id}
              propertyTitle={property.title}
              isOpen={property.isAvailable && property.status === "AVAILABLE"}
              windows={windows}
            />
          </section>

          <section className="mt-12">
            <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">04</p>
            <h2 className="font-heading mt-2 text-3xl md:text-4xl">On the map</h2>
            <p className="mt-3 mb-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Leaflet canvas centred on the listing coordinates ({lat.toFixed(5)}, {lng.toFixed(5)}) in{" "}
              {property.city}. OpenStreetMap tiles stand in for a later Google Maps key.
            </p>
            <PropertyMap lat={lat} lng={lng} title={property.title} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 h-fit border border-border bg-card p-6 shadow-[0_20px_60px_-40px_rgba(28,25,23,0.45)]">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Private inquiry</p>
          <h2 className="font-heading mt-1 text-3xl">Request this home</h2>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">
            Tied to listing {listingRef}. Name, email, phone, and message are validated before they leave the
            browser.
          </p>
          <InquiryForm propertyId={property.id} propertyTitle={property.title} />
        </aside>
      </div>
    </article>
  );
}

function Spec({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card px-4 py-5">
      <dt className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="font-heading mt-2 text-2xl">{value}</dd>
    </div>
  );
}
