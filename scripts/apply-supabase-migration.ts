import { Client } from "pg";
import { readFile } from "fs/promises";
import path from "path";

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  const file = path.join(process.cwd(), "supabase/migrations/20260916120000_init_brisa.sql");
  const sql = await readFile(file, "utf8");

  if (!connectionString) {
    console.log(
      "No SUPABASE_DB_URL set. Skipping remote apply. Local Prisma already has properties, inquiries, and reservations."
    );
    console.log("To run this against Supabase, add SUPABASE_DB_URL (Project Settings → Database) and retry:");
    console.log("  npm run db:migrate:supabase");
    process.exit(0);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log("Applied supabase/migrations/20260916120000_init_brisa.sql");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
