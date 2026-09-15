import { CITIES, PROPERTY_TYPES, PRICE_RANGES, BEDROOM_OPTIONS, SORT_OPTIONS, selectClassName } from "@/lib/constants";
import type { ListingFilters } from "@/lib/properties";
import { cn } from "@/lib/utils";

export function ListingFilters({ defaults }: { defaults: ListingFilters }) {
  return (
    <form method="get" className="space-y-5">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Filter</p>
        <h2 className="font-heading mt-1 text-2xl">Refine the list</h2>
      </div>
      <label className="block text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
        Location
        <select name="city" defaultValue={defaults.city ?? ""} className={cn(selectClassName, "mt-1.5")}>
          <option value="">All Manila</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
        Type
        <select name="type" defaultValue={defaults.type ?? ""} className={cn(selectClassName, "mt-1.5")}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
        Price
        <select name="price" defaultValue={defaults.price ?? ""} className={cn(selectClassName, "mt-1.5")}>
          {PRICE_RANGES.map((range) => (
            <option key={range.value || "any"} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
        Bedrooms
        <select name="beds" defaultValue={defaults.beds ?? ""} className={cn(selectClassName, "mt-1.5")}>
          {BEDROOM_OPTIONS.map((option) => (
            <option key={option.value || "any"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
        Sort
        <select name="sort" defaultValue={defaults.sort ?? "newest"} className={cn(selectClassName, "mt-1.5")}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="h-11 w-full bg-primary text-sm tracking-[0.16em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
      >
        Apply
      </button>
    </form>
  );
}
