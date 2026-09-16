"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { PropertyCard } from "@/src/components/PropertyCard";
import { filterListings } from "@/app/actions/listings";
import {
  SEARCH_AREAS,
  SEARCH_CATEGORIES,
  SEARCH_MIN_SIZES,
  applyClausesLocal,
  buildSearchClauses,
  type SearchFilterClause,
} from "@/src/lib/search-filters";
import { selectClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PropertyRecord } from "@/src/types";

export function SearchFilterEngine({
  initialProperties,
}: {
  initialProperties: PropertyRecord[];
}) {
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [minSqm, setMinSqm] = useState("");
  const [remote, setRemote] = useState<{ key: string; rows: PropertyRecord[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const clauses: SearchFilterClause[] = useMemo(
    () => buildSearchClauses({ area, category, minSqm }),
    [area, category, minSqm]
  );
  const clauseKey = JSON.stringify(clauses);

  const localMatches = useMemo(
    () => applyClausesLocal(initialProperties, clauses),
    [initialProperties, clauses]
  );

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      try {
        const rows = await filterListings(clauses);
        if (!cancelled) {
          setRemote({ key: JSON.stringify(clauses), rows });
          setError(null);
        }
      } catch {
        if (!cancelled) setError("We could not refresh listings just now. Showing local matches.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [clauses]);

  const shown = remote?.key === clauseKey ? remote.rows : localMatches;

  return (
    <>
      <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-5 md:-mt-20 md:px-8">
        <form
          className="grid gap-3 bg-card p-4 shadow-xl ring-1 ring-border sm:grid-cols-2 lg:grid-cols-4 md:p-5"
          onSubmit={(event) => event.preventDefault()}
          data-search-clauses={JSON.stringify(clauses)}
        >
        <label className="block text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          Area
          <select
            value={area}
            onChange={(event) => setArea(event.target.value)}
            className={cn(selectClassName, "mt-1.5")}
            name="area"
          >
            <option value="">All Manila</option>
            {SEARCH_AREAS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={cn(selectClassName, "mt-1.5")}
            name="category"
          >
            <option value="">Any type</option>
            {SEARCH_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          Minimum size
          <select
            value={minSqm}
            onChange={(event) => setMinSqm(event.target.value)}
            className={cn(selectClassName, "mt-1.5")}
            name="minSqm"
          >
            {SEARCH_MIN_SIZES.map((item) => (
              <option key={item.value || "any"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <p className="self-end text-sm text-muted-foreground lg:pb-2">
          {pending ? "Refreshing…" : `${shown.length} ${shown.length === 1 ? "home" : "homes"}`}
        </p>
        </form>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28" data-search-results>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">Live catalogue</p>
            <h2 className="font-heading mt-2 text-4xl md:text-5xl">Homes currently in play</h2>
          </div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
            Area · category · size
          </p>
        </div>
        {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}
        {shown.length === 0 ? (
          <div className="mt-12 border border-dashed border-border bg-card px-6 py-16 text-center">
            <h3 className="font-heading text-3xl">Nothing matches yet</h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Try another area, a broader category, or a smaller minimum size.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
