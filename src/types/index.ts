import { z } from "zod";

/** Manila / Philippines bounding box used to reject nonsense map coordinates. */
export const PH_BOUNDS = {
  lat: { min: 4.2, max: 21.4 },
  lng: { min: 116.0, max: 127.0 },
} as const;

export const PROPERTY_TYPES = ["CONDO", "HOUSE", "COMMERCIAL"] as const;
export const PROPERTY_STATUSES = ["AVAILABLE", "RENTED", "SOLD"] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

const plainText = (max: number) =>
  z
    .string()
    .transform((value) => sanitizePlainText(value, max))
    .pipe(z.string().min(1).max(max));

export function sanitizePlainText(value: string, max = 2000) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export const coordinatesSchema = z.object({
  lat: z.number().min(PH_BOUNDS.lat.min).max(PH_BOUNDS.lat.max),
  lng: z.number().min(PH_BOUNDS.lng.min).max(PH_BOUNDS.lng.max),
});

export const propertyRecordSchema = z.object({
  id: z.string().min(1).max(128),
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(180),
  description: z.string().min(1).max(8000),
  price: z.number().int().nonnegative(),
  city: z.string().min(1).max(80),
  address: z.string().min(1).max(240),
  type: z.enum(PROPERTY_TYPES),
  beds: z.number().int().min(0).max(30),
  baths: z.number().int().min(0).max(30),
  sqm: z.number().int().positive().max(20000),
  amenities: z.array(z.string().max(80)).max(40),
  coordinates: coordinatesSchema,
  images: z.array(z.union([z.string().url(), z.string().startsWith("/")])).max(24),
  status: z.enum(PROPERTY_STATUSES),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.string().optional(),
});

export type PropertyRecord = z.infer<typeof propertyRecordSchema>;

export const INQUIRY_COLUMNS = ["property_id", "name", "email", "phone", "message"] as const;

export const inquiryInputSchema = z.object({
  propertyId: z
    .string()
    .trim()
    .min(8)
    .max(128)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid listing reference."),
  name: plainText(80).pipe(z.string().min(2)),
  email: z.string().trim().email().max(120).transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(24)
    .regex(/^[0-9+\s().-]+$/, "Use a valid phone number."),
  message: plainText(2000).pipe(z.string().min(10)),
});

export type InquiryInput = z.infer<typeof inquiryInputSchema>;

export type InquiryInsert = {
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

export function toInquiryInsert(input: InquiryInput): InquiryInsert {
  return {
    property_id: input.propertyId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
  };
}

export type ReservationWindow = {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
};

export const RESERVATION_STATUSES = ["pending", "confirmed", "blocked", "cancelled"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const bookingRequestSchema = z.object({
  propertyId: z
    .string()
    .trim()
    .min(8)
    .max(128)
    .regex(/^[a-zA-Z0-9_-]+$/),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestName: plainText(80).pipe(z.string().min(2)),
  guestEmail: z.string().trim().email().max(120).transform((value) => value.toLowerCase()),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export function toDateKey(value: Date | string) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && aEnd > bStart;
}

export function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function normalizeProperty(row: Record<string, unknown>): PropertyRecord {
  const lat = Number(row.lat ?? (row.coordinates as { lat?: number } | undefined)?.lat);
  const lng = Number(row.lng ?? (row.coordinates as { lng?: number } | undefined)?.lng);

  const candidate = {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    city: String(row.city ?? ""),
    address: String(row.address ?? ""),
    type: row.type,
    beds: Number(row.beds ?? 0),
    baths: Number(row.baths ?? 0),
    sqm: Number(row.sqm ?? 0),
    amenities: parseStringList(row.amenities),
    coordinates: { lat, lng },
    images: parseStringList(row.images),
    status: row.status,
    isAvailable: Boolean(row.isAvailable ?? row.is_available ?? true),
    isFeatured: Boolean(row.isFeatured ?? row.is_featured ?? false),
    createdAt: row.createdAt
      ? new Date(row.createdAt as string).toISOString()
      : row.created_at
        ? new Date(row.created_at as string).toISOString()
        : undefined,
  };

  return propertyRecordSchema.parse(candidate);
}
