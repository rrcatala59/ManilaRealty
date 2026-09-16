import { Client } from "pg";
import { readdir, readFile } from "fs/promises";
import path from "path";

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  const dir = path.join(process.cwd(), "supabase/migrations");
  const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();

  if (!connectionString) {
    console.log(
      "No SUPABASE_DB_URL set. Skipping remote apply. Local Prisma already has properties, inquiries, and reservations."
    );
    console.log("To run this against Supabase, add SUPABASE_DB_URL and retry: npm run db:migrate:supabase");
    process.exit(0);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    for (const file of files) {
      const sql = await readFile(path.join(dir, file), "utf8");
      await client.query(sql);
      console.log(`Applied ${file}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
