// Betulkan kolum token NULL pada auth.users supaya GoTrue login berfungsi.
const { Client } = require("pg");
(async () => {
  const c = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const r = await c.query(`update auth.users set
    confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    phone_change = coalesce(phone_change, ''),
    phone_change_token = coalesce(phone_change_token, ''),
    reauthentication_token = coalesce(reauthentication_token, '')
  where confirmation_token is null or recovery_token is null or email_change is null`);
  console.log("Dikemaskini baris:", r.rowCount);
  await c.end();
})();
