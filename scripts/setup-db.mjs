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

const items = [
  // slug, category, de, en, desc_de, desc_en, cents, image, tag
  ["brutzler", "burger", "Der Brutzler", "The Brutzler", "Doppelt gesmashtes Rind, Cheddar, Röstzwiebeln, Gurke, Haussoße.", "Double smashed beef, cheddar, crispy onions, pickles, house sauce.", 990, "/img/b1.jpg", null],
  ["garten", "burger", "Gartenburger", "Garden Burger", "Rind, Tomate, Eisbergsalat, rote Zwiebel, Mayo im Brioche.", "Beef, tomato, iceberg, red onion, mayo on brioche.", 890, "/img/b3.jpg", null],
  ["speckig", "burger", "Speckig", "Bacon Stack", "Rind, knuspriger Bacon, Cheddar, Salat, Tomate, Ketchup.", "Beef, crispy bacon, cheddar, lettuce, tomato, ketchup.", 1090, "/img/b6.jpg", null],
  ["doppeldecker", "burger", "Doppeldecker", "Double Decker", "Zwei Patties, doppelt Käse, sonst nichts. Für Puristen.", "Two patties, double cheese, nothing else. For purists.", 1190, "/img/b7.jpg", null],
  ["rotlicht", "burger", "Rotlicht", "Red Light", "Rind, Jalapeños, Pepper Jack, Chipotle-Mayo, rote Zwiebel.", "Beef, jalapeños, pepper jack, chipotle mayo, red onion.", 1090, "/img/b4.jpg", "hot"],
  ["feld", "burger", "Feldburger", "Field Burger", "Gegrilltes Bohnen-Patty, Avocado, Tomate, Kräutermayo.", "Grilled bean patty, avocado, tomato, herb mayo.", 950, "/img/b5.jpg", "veggie"],
  ["knusper", "chicken", "Knusperhähnchen", "Crispy Chicken", "Sechs Stücke, in Buttermilch eingelegt, mit Honig-Senf-Dip.", "Six pieces, buttermilk-brined, with honey mustard dip.", 890, "/img/n1.jpg", null],
  ["tenders", "chicken", "Tenders & Ranch", "Tenders & Ranch", "Hähnchenstreifen, Sellerie, hausgemachter Ranch-Dip.", "Chicken strips, celery, house ranch dip.", 790, "/img/g1.jpg", "new"],
  ["pommes", "sides", "Pommes", "Fries", "Dick geschnitten, zweimal frittiert, Meersalz.", "Thick cut, double fried, sea salt.", 390, "/img/f2.jpg", "veggie"],
  ["korbpommes", "sides", "Rosmarinpommes", "Rosemary Fries", "Mit Rosmarin, Knoblauch und Parmesan.", "With rosemary, garlic and parmesan.", 490, "/img/f3.jpg", "veggie"],
  ["burgerpommes", "sides", "Burger & Pommes Teller", "Burger & Fries Plate", "Brutzler mit großer Portion Pommes und zwei Dips.", "Brutzler with a large fries and two dips.", 1390, "/img/b8.jpg", null],
  ["keksshake", "shakes", "Keks-Shake", "Cookie Shake", "Vanilleeis, Schokokekse, Sahne.", "Vanilla ice cream, chocolate cookies, cream.", 550, "/img/s1.jpg", null],
  ["vanilleshake", "shakes", "Vanille-Shake", "Vanilla Shake", "Bourbon-Vanille, frische Vollmilch.", "Bourbon vanilla, fresh whole milk.", 490, null, null],
  ["limo", "drinks", "Zitronenlimo", "Lemonade", "Hausgemacht, 0,4 l.", "House-made, 0.4 l.", 350, null, null],
  ["eistee", "drinks", "Pfirsich-Eistee", "Peach Iced Tea", "Hausgemacht, 0,4 l.", "House-made, 0.4 l.", 350, null, null],
  ["cola", "drinks", "Cola", "Cola", "0,33 l Dose.", "0.33 l can.", 290, null, null],
  ["wasser", "drinks", "Wasser", "Water", "Still oder sprudelnd, 0,5 l.", "Still or sparkling, 0.5 l.", 250, null, null],
];
let sort = 0;
for (const [slug, category, nde, nen, dde, den, cents, image, tag] of items) {
  sort += 10;
  await sql`
    INSERT INTO menu_items (slug, category, name_de, name_en, desc_de, desc_en, price_cents, image, tag, sort)
    VALUES (${slug}, ${category}, ${nde}, ${nen}, ${dde}, ${den}, ${cents}, ${image}, ${tag}, ${sort})
    ON CONFLICT (slug) DO UPDATE SET
      category = EXCLUDED.category, name_de = EXCLUDED.name_de, name_en = EXCLUDED.name_en,
      desc_de = EXCLUDED.desc_de, desc_en = EXCLUDED.desc_en, image = EXCLUDED.image,
      tag = EXCLUDED.tag, sort = EXCLUDED.sort`;
}

const extras = [
  ["kaese", "Extra Käse", "Extra cheese", 80],
  ["bacon", "Bacon", "Bacon", 150],
  ["jalapenos", "Jalapeños", "Jalapeños", 60],
  ["patty", "Extra Patty", "Extra patty", 290],
  ["avocado", "Avocado", "Avocado", 120],
];
sort = 0;
for (const [slug, nde, nen, cents] of extras) {
  sort += 10;
  await sql`
    INSERT INTO extras (slug, name_de, name_en, price_cents, sort)
    VALUES (${slug}, ${nde}, ${nen}, ${cents}, ${sort})
    ON CONFLICT (slug) DO UPDATE SET name_de = EXCLUDED.name_de, name_en = EXCLUDED.name_en, sort = EXCLUDED.sort`;
}

const hours = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
  day,
  open: day === 0 ? "13:00" : "11:30",
  close: day === 5 || day === 6 ? "23:30" : "22:00",
  closed: day === 1,
}));
const defaults = {
  hours,
  combo: { price_cents: 450 },
  delivery: { fee_cents: 250, min_cents: 1500, postcodes: ["50667", "50668", "50670", "50672", "50674", "50676", "50677"] },
};
for (const [key, value] of Object.entries(defaults)) {
  await sql`INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb) ON CONFLICT (key) DO NOTHING`;
}

if (process.argv.includes("--reset-orders")) {
  await sql`TRUNCATE orders RESTART IDENTITY CASCADE`;
  console.log("Orders cleared.");
}

const [{ count }] = await sql`SELECT count(*)::int AS count FROM menu_items`;
console.log(`Schema ready. ${count} menu items, ${extras.length} extras.`);
