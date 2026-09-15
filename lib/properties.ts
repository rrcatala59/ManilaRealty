import type { Prisma, PropertyStatus, PropertyType } from "@prisma/client";
import { PRICE_RANGES } from "@/lib/constants";

export type ListingFilters = {
  city?: string;
  type?: string;
  price?: string;
  beds?: string;
  sort?: string;
};

export function buildPropertyWhere(filters: ListingFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {};

  if (filters.city) {
    where.city = filters.city;
  }

  if (filters.type && ["CONDO", "HOUSE", "COMMERCIAL"].includes(filters.type)) {
    where.type = filters.type as PropertyType;
  }

  if (filters.beds) {
    const beds = Number(filters.beds);
    if (!Number.isNaN(beds) && beds > 0) {
      where.beds = { gte: beds };
    }
  }

  if (filters.price) {
    const range = PRICE_RANGES.find((item) => item.value === filters.price);
    if (range && (range.min !== undefined || range.max !== undefined)) {
      where.price = {
        ...(range.min !== undefined ? { gte: range.min } : {}),
        ...(range.max !== undefined ? { lte: range.max } : {}),
      };
    }
  }

  return where;
}

export function buildPropertyOrder(sort?: string): Prisma.PropertyOrderByWithRelationInput {
  if (sort === "price-asc") return { price: "asc" };
  if (sort === "price-desc") return { price: "desc" };
  return { createdAt: "desc" };
}

export function statusTone(status: PropertyStatus) {
  if (status === "SOLD") return "bg-primary text-primary-foreground";
  if (status === "RENTED") return "bg-olive text-primary-foreground";
  return "bg-card/95 text-foreground";
}
