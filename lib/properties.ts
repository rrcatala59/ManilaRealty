import type { PropertyStatus } from "@/src/types";

export type ListingFilters = {
  city?: string;
  type?: string;
  price?: string;
  beds?: string;
  sort?: string;
};

export function statusTone(status: PropertyStatus) {
  if (status === "SOLD") return "bg-primary text-primary-foreground";
  if (status === "RENTED") return "bg-olive text-primary-foreground";
  return "bg-card/95 text-foreground";
}
