import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property-card";

export default async function NotFound() {
  const featured = await prisma.property.findMany({
    where: { isFeatured: true },
    take: 3,
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-24 text-center">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">404</p>
      <h1 className="font-heading mt-3 text-5xl">This page has moved on</h1>
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">
        The listing or page you wanted is not here. These homes are, if you would like somewhere to land.
      </p>
      <div className="mt-12 grid gap-8 text-left sm:grid-cols-3">
        {featured.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
