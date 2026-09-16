import { prisma } from "../lib/prisma";

/**
 * SQLite cannot HTTP-post from a trigger. This installs an AFTER INSERT
 * trigger on Inquiry that writes InquiryNotificationOutbox; the app flushes
 * that outbox through src/utils/inquiry-notification.ts.
 */
async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("file:")) {
    console.log("Skipping SQLite inquiry-notify trigger (DATABASE_URL is not a file database).");
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER IF NOT EXISTS inquiry_notify_admins
    AFTER INSERT ON Inquiry
    FOR EACH ROW
    BEGIN
      INSERT INTO InquiryNotificationOutbox (id, inquiryId, payload, status, createdAt)
      VALUES (
        lower(hex(randomblob(12))),
        NEW.id,
        json_object(
          'inquiryId', NEW.id,
          'propertyId', NEW.propertyId,
          'propertyTitle', coalesce((SELECT title FROM Property WHERE id = NEW.propertyId), 'Listing'),
          'name', NEW.name,
          'email', NEW.email,
          'phone', NEW.phone,
          'message', NEW.message,
          'createdAt', NEW.createdAt
        ),
        'pending',
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      );
    END;
  `);

  console.log("SQLite trigger inquiry_notify_admins is in place.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
