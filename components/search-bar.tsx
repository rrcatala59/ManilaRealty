import { CITIES, PROPERTY_TYPES, PRICE_RANGES, BEDROOM_OPTIONS, selectClassName } from "@/lib/constants";
import type { ListingFilters } from "@/lib/properties";
import { cn } from "@/lib/utils";

export function SearchBar({
  variant = "hero",
  defaults = {},
}: {
  variant?: "hero" | "page";
  defaults?: ListingFilters;
}) {
  return (
    <form
      action="/properties"
      method="get"
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
        variant === "hero"
          ? "bg-card/95 p-4 shadow-xl backdrop-blur-sm md:p-5"
          : "bg-card p-4 ring-1 ring-border md:p-5"
      )}
    >
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
      <button
        type="submit"
        className="h-11 self-end bg-primary text-sm tracking-[0.18em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
