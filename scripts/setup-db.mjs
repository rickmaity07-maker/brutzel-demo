// Creates the schema and seeds the demo menu. Uses the direct (unpooled) URL.
// Run: npm run db:setup          (keeps existing orders)
//      npm run db:setup -- --reset-orders   (also clears demo orders)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (see .env.local)");
const sql = neon(url);

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);
for (const s of statements) await sql.query(s);

// Menu, extras and settings live in db/seed.json (the nightly demo reset uses the same file).
const seed = JSON.parse(readFileSync(new URL("../db/seed.json", import.meta.url), "utf8"));

let sort = 0;
for (const { slug, category, name_de: nde, name_en: nen, desc_de: dde, desc_en: den, price_cents: cents, image, tag } of seed.items) {
  sort += 10;
  await sql`
    INSERT INTO menu_items (slug, category, name_de, name_en, desc_de, desc_en, price_cents, image, tag, sort)
    VALUES (${slug}, ${category}, ${nde}, ${nen}, ${dde}, ${den}, ${cents}, ${image}, ${tag}, ${sort})
    ON CONFLICT (slug) DO UPDATE SET
      category = EXCLUDED.category, name_de = EXCLUDED.name_de, name_en = EXCLUDED.name_en,
      desc_de = EXCLUDED.desc_de, desc_en = EXCLUDED.desc_en, image = EXCLUDED.image,
      tag = EXCLUDED.tag, sort = EXCLUDED.sort`;
}

sort = 0;
for (const { slug, name_de: nde, name_en: nen, price_cents: cents } of seed.extras) {
  sort += 10;
  await sql`
    INSERT INTO extras (slug, name_de, name_en, price_cents, sort)
    VALUES (${slug}, ${nde}, ${nen}, ${cents}, ${sort})
    ON CONFLICT (slug) DO UPDATE SET name_de = EXCLUDED.name_de, name_en = EXCLUDED.name_en, sort = EXCLUDED.sort`;
}

for (const [key, value] of Object.entries(seed.settings)) {
  await sql`INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb) ON CONFLICT (key) DO NOTHING`;
}

if (process.argv.includes("--reset-orders")) {
  await sql`TRUNCATE orders RESTART IDENTITY CASCADE`;
  console.log("Orders cleared.");
}

const [{ count }] = await sql`SELECT count(*)::int AS count FROM menu_items`;
console.log(`Schema ready. ${count} menu items, ${seed.extras.length} extras.`);
