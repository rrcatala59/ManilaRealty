import { ListingFilters } from "@/components/listing-filters";
import { MobileFilters } from "@/components/mobile-filters";
import { PropertyCard } from "@/src/components/PropertyCard";
import { SearchBar } from "@/components/search-bar";
import type { ListingFilters as Filters } from "@/lib/properties";
import { listProperties } from "@/src/lib/listings";

export const metadata = {
  title: "Listings",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const filters = await searchParams;
  const properties = await listProperties(filters);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">Catalogue</p>
      <h1 className="font-heading mt-2 text-4xl md:text-6xl">Find your space</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Condos, houses, and commercial floors across Metro Manila. Filter by district, type, and budget.
      </p>
      <div className="mt-8 lg:hidden">
        <SearchBar variant="page" defaults={filters} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 border border-border bg-card p-6">
            <ListingFilters defaults={filters} />
          </div>
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {properties.length} {properties.length === 1 ? "home" : "homes"}
            </p>
            <MobileFilters defaults={filters} />
          </div>
          {properties.length === 0 ? (
            <div className="border border-dashed border-border bg-card px-6 py-16 text-center">
              <h2 className="font-heading text-3xl">Nothing matches yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Try widening the city, dropping a price ceiling, or browsing the full list without filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
