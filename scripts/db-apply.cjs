// Jalankan migrations + seed ke Supabase cloud.
// Guna: DB_URL="postgresql://postgres:PWD@db.<ref>.supabase.co:5432/postgres" node scripts/db-apply.cjs
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const files = [
  "supabase/migrations/0001_schema.sql",
  "supabase/migrations/0002_rls.sql",
  "supabase/migrations/0003_views.sql",
  "supabase/seed.sql",
];

(async () => {
  const client = process.env.DB_URL
    ? new Client({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: false } })
    : new Client({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || "postgres",
        ssl: { rejectUnauthorized: false },
      });
  await client.connect();
  console.log("Connected.");
  for (const f of files) {
    const sql = fs.readFileSync(path.join(process.cwd(), f), "utf8");
    process.stdout.write(`→ ${f} … `);
    try {
      await client.query(sql);
      console.log("OK");
    } catch (e) {
      console.log("RALAT");
      console.error(`\n[${f}] ${e.message}\n`);
      await client.end();
      process.exit(1);
    }
  }
  await client.end();
  console.log("\n✅ Semua migration + seed berjaya dipakai.");
})();
