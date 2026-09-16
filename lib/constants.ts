export const CITIES = [
  "Makati",
  "BGC",
  "New Manila",
  "Quezon City",
  "Pasay",
  "Pasig",
  "Muntinlupa",
  "Taguig",
] as const;

export const PROPERTY_TYPES = [
  { value: "CONDO", label: "Condo" },
  { value: "HOUSE", label: "House & Lot" },
  { value: "COMMERCIAL", label: "Commercial" },
] as const;

export const PRICE_RANGES = [
  { value: "", label: "Any price", min: undefined, max: undefined },
  { value: "0-15000000", label: "Under ₱15M", min: 0, max: 15_000_000 },
  { value: "15000000-30000000", label: "₱15M – ₱30M", min: 15_000_000, max: 30_000_000 },
  { value: "30000000-50000000", label: "₱30M – ₱50M", min: 30_000_000, max: 50_000_000 },
  { value: "50000000-", label: "₱50M+", min: 50_000_000, max: undefined },
] as const;

export const BEDROOM_OPTIONS = [
  { value: "", label: "Any beds" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
] as const;

export const AMENITY_OPTIONS = [
  "Pool",
  "Gym",
  "Concierge",
  "Parking",
  "Garden",
  "24/7 Security",
  "Balcony",
  "Smart Home",
  "Clubhouse",
  "Pet-friendly",
  "City view",
  "Garden view",
  "Backup power",
  "Maid's room",
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

export const selectClassName =
  "h-11 w-full rounded-sm border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";
