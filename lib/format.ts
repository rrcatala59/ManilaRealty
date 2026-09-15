import type { PropertyStatus, PropertyType } from "@prisma/client";

export function formatPHP(price: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);
}

export function parseJsonList(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function typeLabel(type: PropertyType) {
  switch (type) {
    case "CONDO":
      return "Condo";
    case "HOUSE":
      return "House & Lot";
    case "COMMERCIAL":
      return "Commercial";
    default:
      return type;
  }
}

export function statusLabel(status: PropertyStatus) {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "RENTED":
      return "Rented";
    case "SOLD":
      return "Sold";
    default:
      return status;
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
