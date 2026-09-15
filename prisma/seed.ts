import { PrismaClient, PropertyType, PropertyStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
}

const properties = [
  {
    title: "Sky Residences at One Ayala",
    slug: "sky-residences-one-ayala",
    description:
      "A calm, light-filled two-bedroom above Ayala Avenue, finished in pale oak, linen, and stone. Floor-to-ceiling glass opens onto the Makati skyline; the kitchen is fully integrated, and a discreet powder room makes hosting effortless. Brisa selected this home for buyers who want the CBD within walking distance — without the noise of it.",
    price: 28500000,
    city: "Makati",
    address: "One Ayala, Ayala Avenue, Makati",
    type: PropertyType.CONDO,
    beds: 2,
    baths: 2,
    sqm: 98,
    amenities: ["Concierge", "Pool", "Gym", "Parking", "City view", "24/7 Security"],
    lat: 14.5492,
    lng: 121.0273,
    images: [
      unsplash("photo-1545324418-cc1a3fa10c00"),
      unsplash("photo-1600210492486-724fe5c67fb0"),
      unsplash("photo-1600607687939-ce8a6c25118c"),
      unsplash("photo-1600566753086-00f18fb6b3ea"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: true,
  },
  {
    title: "High Street Penthouse",
    slug: "high-street-penthouse-bgc",
    description:
      "A rare full-floor penthouse on High Street, with a private terrace, sunset views toward McKinley, and interiors that feel more gallery than showroom. Three bedrooms, a chef's kitchen, and a separate staff room. For clients who want BGC's energy below and complete quiet above.",
    price: 45200000,
    city: "BGC",
    address: "High Street, Bonifacio Global City, Taguig",
    type: PropertyType.CONDO,
    beds: 3,
    baths: 3,
    sqm: 186,
    amenities: ["Pool", "Gym", "Concierge", "Parking", "City view", "Smart Home", "Maid's room"],
    lat: 14.5515,
    lng: 121.0497,
    images: [
      unsplash("photo-1512917774080-9991f1c4c750"),
      unsplash("photo-1600585152915-d208bec867a1"),
      unsplash("photo-1600607688969-a5bfcd646154"),
      unsplash("photo-1613977257363-707ba9348227"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: true,
  },
  {
    title: "Uptown Parksuites Two-Bedroom",
    slug: "uptown-parksuites-two-bedroom",
    description:
      "An efficient, beautifully kept 2BR facing the park — ideal as a first BGC home or a lock-and-leave pied-à-terre. Neutral finishes, a generous balcony, and building amenities that actually get used. Priced for buyers who value location over spectacle.",
    price: 18900000,
    city: "BGC",
    address: "Uptown Parksuites, 9th Avenue, BGC",
    type: PropertyType.CONDO,
    beds: 2,
    baths: 2,
    sqm: 76,
    amenities: ["Pool", "Gym", "Parking", "Garden view", "24/7 Security", "Pet-friendly"],
    lat: 14.5574,
    lng: 121.0542,
    images: [
      unsplash("photo-1502672260266-1c1ef2d93688"),
      unsplash("photo-1560448204-e02f11c3d0e2"),
      unsplash("photo-1493809842364-78817add7ffb"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: false,
  },
  {
    title: "Salcedo Village Garden House",
    slug: "salcedo-village-garden-house",
    description:
      "A low-rise house on a quiet Salcedo street, wrapped around a small courtyard garden. Four bedrooms, original terrazzo restored, and a kitchen that opens fully to the garden. Walking distance to the weekend market, Legazpi, and the office towers — the rare Makati house that still feels like a home.",
    price: 62000000,
    city: "Makati",
    address: "Salcedo Village, Makati",
    type: PropertyType.HOUSE,
    beds: 4,
    baths: 4,
    sqm: 312,
    amenities: ["Garden", "Parking", "Maid's room", "Backup power", "Pet-friendly", "24/7 Security"],
    lat: 14.5589,
    lng: 121.0247,
    images: [
      unsplash("photo-1600596542815-ffad4c1539a9"),
      unsplash("photo-1600585154526-990dced4db0d"),
      unsplash("photo-1600566753190-17f0baa2a6c3"),
      unsplash("photo-1580587771525-78b9dba3b914"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: true,
  },
  {
    title: "Eastwood Parkview Residence",
    slug: "eastwood-parkview-residence",
    description:
      "A bright 2BR overlooking Eastwood's central park — practical, well-managed, and close to offices, groceries, and late-night coffee. Recently refreshed interiors in warm plaster and oak. A strong hold for end-users who work in QC or want a simpler city rhythm than the south.",
    price: 12400000,
    city: "Quezon City",
    address: "Eastwood City, Bagumbayan, Quezon City",
    type: PropertyType.CONDO,
    beds: 2,
    baths: 1,
    sqm: 64,
    amenities: ["Pool", "Gym", "Parking", "Garden view", "24/7 Security"],
    lat: 14.6091,
    lng: 121.0805,
    images: [
      unsplash("photo-1522708323590-d24dbb6b0267"),
      unsplash("photo-1554995207-c18c203602cb"),
      unsplash("photo-1605276374104-dee2a0ed3cd6"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: false,
  },
  {
    title: "Rockwell Proscenium Corner Suite",
    slug: "rockwell-proscenium-corner-suite",
    description:
      "A corner 3BR at Proscenium with dual aspect light and a long balcony facing the Pasig. Rockwell's service culture, Power Plant downstairs, and a floor plan that actually works for a family. Quiet luxury without the penthouse premium.",
    price: 32800000,
    city: "Makati",
    address: "Proscenium at Rockwell, Makati",
    type: PropertyType.CONDO,
    beds: 3,
    baths: 3,
    sqm: 142,
    amenities: ["Pool", "Gym", "Concierge", "Parking", "City view", "Clubhouse", "24/7 Security"],
    lat: 14.5648,
    lng: 121.0366,
    images: [
      unsplash("photo-1512918728675-ed5a9ecdebfd"),
      unsplash("photo-1600607687920-4e2a09cf159d"),
      unsplash("photo-1484154218962-a197022b5858"),
      unsplash("photo-1600566752355-35792bedcfea"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: true,
  },
  {
    title: "Alabang Hills Family Home",
    slug: "alabang-hills-family-home",
    description:
      "A generous family house in Alabang Hills: five bedrooms, a covered lanai, and a garden large enough for weekend lunches. The neighbourhood is leafy and slow; the expressway is ten minutes. Built for clients leaving the CBD without leaving Metro Manila.",
    price: 38500000,
    city: "Muntinlupa",
    address: "Alabang Hills Village, Muntinlupa",
    type: PropertyType.HOUSE,
    beds: 5,
    baths: 4,
    sqm: 420,
    amenities: ["Garden", "Parking", "Pool", "Maid's room", "Backup power", "Pet-friendly", "Clubhouse"],
    lat: 14.4123,
    lng: 121.0388,
    images: [
      unsplash("photo-1564013799919-ab600027ffc6"),
      unsplash("photo-1600585154363-67eb9e2e2099"),
      unsplash("photo-1600047509782-20d39509f26d"),
      unsplash("photo-1570129477492-45c003edd2be"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: false,
  },
  {
    title: "Ortigas CBD Office Floor",
    slug: "ortigas-cbd-office-floor",
    description:
      "An entire mid-floor plate in a Grade-A Ortigas tower — raised floors, dual telecom risers, and unobstructed light on three sides. Suited to a professional firm or family office that wants presence without the BGC premium. Strata title, with two parking slots included.",
    price: 55000000,
    city: "Pasig",
    address: "Ortigas Center, Pasig",
    type: PropertyType.COMMERCIAL,
    beds: 0,
    baths: 2,
    sqm: 268,
    amenities: ["Parking", "24/7 Security", "Backup power", "City view", "Concierge"],
    lat: 14.5866,
    lng: 121.0614,
    images: [
      unsplash("photo-1497366216548-37526070297c"),
      unsplash("photo-1497366811353-6870744d04b2"),
      unsplash("photo-1486406146926-c627a92ad1ab"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: false,
  },
  {
    title: "Capitol Commons Townhouse",
    slug: "capitol-commons-townhouse",
    description:
      "A three-storey townhouse a short walk from Capitol Commons: four bedrooms, a roof deck, and a ground-floor living room that opens to a small yard. New enough to be easy, considered enough to feel finished. For households who want Pasig's parks without a village gate.",
    price: 24800000,
    city: "Pasig",
    address: "Capitol Commons, Pasig",
    type: PropertyType.HOUSE,
    beds: 4,
    baths: 3,
    sqm: 198,
    amenities: ["Parking", "Garden", "Pet-friendly", "24/7 Security", "Backup power"],
    lat: 14.5732,
    lng: 121.0648,
    images: [
      unsplash("photo-1600585152915-d208bec867a1"),
      unsplash("photo-1600566753376-12c8ab7fb75b"),
      unsplash("photo-1600210491892-03d54c0aaf87"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: false,
  },
  {
    title: "Newport City Sky Suite",
    slug: "newport-city-sky-suite",
    description:
      "A 1BR suite with a long city-and-runway view — minutes from NAIA, the theatres, and the shops. Fully furnished in a quiet palette, with hotel-grade building services. A smart hold for frequent travellers or a pied-à-terre that actually earns its keep.",
    price: 16800000,
    city: "Pasay",
    address: "Newport City, Pasay",
    type: PropertyType.CONDO,
    beds: 1,
    baths: 1,
    sqm: 52,
    amenities: ["Pool", "Gym", "Concierge", "Parking", "City view", "24/7 Security"],
    lat: 14.5194,
    lng: 121.0198,
    images: [
      unsplash("photo-1560448204-e02f11c3d0e2"),
      unsplash("photo-1502672023488-70e25813eb80"),
      unsplash("photo-1600607687939-ce8a6c25118c"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: false,
  },
  {
    title: "Tomas Morato Live-Work Loft",
    slug: "tomas-morato-live-work-loft",
    description:
      "A double-height commercial loft on a side street off Tomas Morato — studio below, private rooms above. High windows, raw concrete, and a small terrace. Licensed for mixed use: a gallery, a practice, or a studio with somewhere to sleep. QC character, not a tower template.",
    price: 19500000,
    city: "Quezon City",
    address: "Tomas Morato, Quezon City",
    type: PropertyType.COMMERCIAL,
    beds: 1,
    baths: 2,
    sqm: 145,
    amenities: ["Parking", "Balcony", "Backup power", "Pet-friendly"],
    lat: 14.6352,
    lng: 121.0348,
    images: [
      unsplash("photo-1493809842364-78817add7ffb"),
      unsplash("photo-1522708323590-d24dbb6b0267"),
      unsplash("photo-1554995207-c18c203602cb"),
    ],
    status: PropertyStatus.RENTED,
    isAvailable: false,
    isFeatured: false,
  },
  {
    title: "McKinley West Garden Villa",
    slug: "mckinley-west-garden-villa",
    description:
      "A contemporary villa on a quiet McKinley West cul-de-sac: five bedrooms, a 20-metre lap pool, and a garden designed to stay green through the dry season. Staff quarters, a basement garage, and a kitchen built for real cooking. The south's answer to a compound — without the compound.",
    price: 88000000,
    city: "Taguig",
    address: "McKinley West, Taguig",
    type: PropertyType.HOUSE,
    beds: 5,
    baths: 6,
    sqm: 580,
    amenities: ["Pool", "Garden", "Parking", "Maid's room", "Smart Home", "Backup power", "24/7 Security", "Gym"],
    lat: 14.5398,
    lng: 121.0412,
    images: [
      unsplash("photo-1507089947368-19c1da9775ae"),
      unsplash("photo-1600596542815-ffad4c1539a9"),
      unsplash("photo-1600585154526-990dced4db0d"),
      unsplash("photo-1600607688969-a5bfcd646154"),
    ],
    status: PropertyStatus.AVAILABLE,
    isAvailable: true,
    isFeatured: true,
  },
];

async function main() {
  await prisma.inquiry.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const password = process.env.ADMIN_PASSWORD ?? "brisa-admin-2026";
  const email = process.env.ADMIN_EMAIL ?? "admin@brisarealty.ph";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, passwordHash, role: "ADMIN" },
  });

  for (const property of properties) {
    await prisma.property.create({
      data: {
        ...property,
        amenities: JSON.stringify(property.amenities),
        images: JSON.stringify(property.images),
      },
    });
  }

  console.log(`Seeded ${properties.length} properties and admin ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
