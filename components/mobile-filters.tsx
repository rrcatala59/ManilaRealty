"use client";

import { ListingFilters } from "@/components/listing-filters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ListingFilters as Filters } from "@/lib/properties";
import { SlidersHorizontal } from "lucide-react";

export function MobileFilters({ defaults }: { defaults: Filters }) {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-3 text-sm lg:hidden">
        <SlidersHorizontal className="size-4" />
        Filters
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] bg-background p-6">
        <SheetHeader className="p-0">
          <SheetTitle className="font-heading text-2xl">Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ListingFilters defaults={defaults} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
