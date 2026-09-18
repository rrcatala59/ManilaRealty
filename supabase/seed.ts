import { PrismaClient, PropertyStatus, PropertyType } from "@prisma/client";
import { loadProjectEnv } from "../scripts/load-env";
import { getServiceSupabase } from "../src/lib/supabase";
import { STRUCTURAL_PROPERTY_ID } from "../src/lib/search-filters";

function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
}

export const STRUCTURAL_SEED_HOLD = {
  startDate: "2026-09-18",
  endDate: "2026-09-22",
} as const;

const structuralProperties = [
  {
    id: STRUCTURAL_PROPERTY_ID,
    title: "Laperal Loft at Salcedo",
    slug: "laperal-loft-salcedo",
    description:
      "A one-bedroom loft on a quiet Salcedo side street: double-height glazing, a stone kitchen, and a sleeping platform that still feels like a room. Brisa holds this home as the structural test listing for stay calendars — compact, exact, and walkable to the greenbelt of Legazpi.",
    price: 16800000,
    city: "Makati",
    address: "Laperal, Salcedo Village, Makati",
    type: PropertyType.CONDO,
    beds: 1,
    baths: 1,
    sqm: 68,
    amenities: ["Concierge", "Pool", "Gym", "Parking", "24/7 Security"],
    lat: 14.5601,
    lng: 121.0248,
    images: [
      unsplash("photo-1502672260266-1c1ef2d93688"),
      unsplash("photo-1560448204-e02f11c3d0e2"),
      unsplash("photo-1600210492486-724fe5c67fb0"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    title: "26th Street Gallery Residence",
    slug: "26th-street-gallery-residence",
    description:
      "A two-bedroom on 26th Street with gallery lighting, pale oak floors, and a balcony that faces the BGC skyline rather than the highway. Sized for a couple who entertain: a proper dining alcove, a powder room, and building amenities that stay in use after 8pm.",
    price: 31200000,
    city: "BGC",
    address: "26th Street, Bonifacio Global City, Taguig",
    type: PropertyType.CONDO,
    beds: 2,
    baths: 2,
    sqm: 112,
    amenities: ["Pool", "Gym", "Concierge", "Parking", "City view", "Pet-friendly"],
    lat: 14.5506,
    lng: 121.0478,
    images: [
      unsplash("photo-1512917774080-9991f1c4c750"),
      unsplash("photo-1600585152915-d208bec867a1"),
      unsplash("photo-1600607687939-ce8a6c25118c"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    title: "Hemady Garden House",
    slug: "hemady-garden-new-manila",
    description:
      "A three-bedroom house on a leafy New Manila street, with a north garden, a proper kitchen, and rooms that still have volume. For families who want Quezon City's older-tree quiet without giving up a Manila address. Staff room, two-car garage, and a dining hall that opens to the lawn.",
    price: 54800000,
    city: "New Manila",
    address: "Hemady Street, New Manila, Quezon City",
    type: PropertyType.HOUSE,
    beds: 3,
    baths: 3,
    sqm: 286,
    amenities: ["Garden", "Parking", "Maid's room", "Backup power", "24/7 Security"],
    lat: 14.6158,
    lng: 121.0334,
    images: [
      unsplash("photo-1507089947368-19c1da9775ae"),
      unsplash("photo-1600596542815-ffad4c1539a9"),
      unsplash("photo-1600585154526-990dced4db0d"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: true,
  },
];

function toSupabaseProperty(property: (typeof structuralProperties)[number]) {
  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    description: property.description,
    price: property.price,
    city: property.city,
    address: property.address,
    type: property.type,
    beds: property.beds,
    baths: property.baths,
    sqm: property.sqm,
    amenities: property.amenities,
    lat: property.lat,
    lng: property.lng,
    images: property.images,
    status: property.status,
    is_available: property.isAvailable,
    is_featured: property.isFeatured,
  };
}

export async function seedHostedSupabase() {
  const supabase = getServiceSupabase();
  if (!supabase) return false;

  for (const property of structuralProperties) {
    const { error } = await supabase.from("properties").upsert(toSupabaseProperty(property));
    if (error) throw new Error(error.message);
  }

  const { error: clearError } = await supabase
    .from("reservations")
    .delete()
    .eq("property_id", STRUCTURAL_PROPERTY_ID);
  if (clearError) throw new Error(clearError.message);

  const { error: holdError } = await supabase.from("reservations").insert({
    property_id: STRUCTURAL_PROPERTY_ID,
    start_date: STRUCTURAL_SEED_HOLD.startDate,
    end_date: STRUCTURAL_SEED_HOLD.endDate,
    guest_name: "Structural seed hold",
    guest_email: "seed@brisarealty.ph",
    status: "confirmed",
  });
  if (holdError) throw new Error(holdError.message);

  console.log(
    `Supabase seed: Makati, BGC, New Manila. Calendar hold ${STRUCTURAL_SEED_HOLD.startDate} → ${STRUCTURAL_SEED_HOLD.endDate} on ${STRUCTURAL_PROPERTY_ID}`
  );
  return true;
}

export async function seedStructuralRecords(client?: PrismaClient) {
  const db = client ?? new PrismaClient();
  for (const property of structuralProperties) {
    const data = {
      title: property.title,
      slug: property.slug,
      description: property.description,
      price: property.price,
      city: property.city,
      address: property.address,
      type: property.type,
      beds: property.beds,
      baths: property.baths,
      sqm: property.sqm,
      amenities: JSON.stringify(property.amenities),
      lat: property.lat,
      lng: property.lng,
      images: JSON.stringify(property.images),
      status: property.status,
      isAvailable: property.isAvailable,
      isFeatured: property.isFeatured,
    };

    await db.property.upsert({
      where: { id: property.id },
      create: { id: property.id, ...data },
      update: data,
    });
  }

  await db.reservation.deleteMany({ where: { propertyId: STRUCTURAL_PROPERTY_ID } });
  await db.reservation.create({
    data: {
      propertyId: STRUCTURAL_PROPERTY_ID,
      startDate: new Date(`${STRUCTURAL_SEED_HOLD.startDate}T00:00:00.000Z`),
      endDate: new Date(`${STRUCTURAL_SEED_HOLD.endDate}T00:00:00.000Z`),
      guestName: "Structural seed hold",
      guestEmail: "seed@brisarealty.ph",
      status: "confirmed",
    },
  });

  console.log(
    `Structural seed: Makati, BGC, New Manila. Calendar hold ${STRUCTURAL_SEED_HOLD.startDate} → ${STRUCTURAL_SEED_HOLD.endDate} on ${STRUCTURAL_PROPERTY_ID}`
  );

  if (!client) await db.$disconnect();
}

const isDirectRun = process.argv[1]?.includes("supabase/seed");
if (isDirectRun) {
  loadProjectEnv();
  (async () => {
    if (await seedHostedSupabase()) return;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "Set SUPABASE_SERVICE_ROLE_KEY to seed the hosted project, or DATABASE_URL for local Prisma."
      );
    }
    await seedStructuralRecords();
  })().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}