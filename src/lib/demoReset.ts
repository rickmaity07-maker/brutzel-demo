import "server-only";
import seed from "../../db/seed.json";
import { sql } from "./db";

/**
 * Puts the public demo back to its seeded state: prices, availability, opening hours,
 * combo and delivery settings, and removes orders older than a few hours. Only the
 * values the admin portal can change are restored, so this is safe to run at any time.
 */
export async function resetDemo() {
  // At most one reset every 10 minutes, so an open endpoint can't be used to hammer the database.
  const claimed = await sql`
    INSERT INTO settings (key, value) VALUES ('demo_reset_at', to_jsonb(now()))
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    WHERE (settings.value #>> '{}')::timestamptz < now() - interval '10 minutes'
    RETURNING key`;
  if (claimed.length === 0) return null;

  const items = JSON.stringify(seed.items.map((i) => ({ slug: i.slug, price_cents: i.price_cents })));
  const extras = JSON.stringify(seed.extras.map((e) => ({ slug: e.slug, price_cents: e.price_cents })));

  const [itemRows, extraRows, , orderRows] = await Promise.all([
    sql`UPDATE menu_items m SET price_cents = s.price_cents, available = true
        FROM jsonb_to_recordset(${items}::jsonb) AS s(slug text, price_cents int)
        WHERE m.slug = s.slug RETURNING m.id`,
    sql`UPDATE extras e SET price_cents = s.price_cents, available = true
        FROM jsonb_to_recordset(${extras}::jsonb) AS s(slug text, price_cents int)
        WHERE e.slug = s.slug RETURNING e.id`,
    sql`INSERT INTO settings (key, value)
        SELECT key, value FROM jsonb_each(${JSON.stringify(seed.settings)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    // Orders hold names and phone numbers that visitors typed in; keep them only briefly.
    sql`DELETE FROM orders WHERE created_at < now() - interval '6 hours' RETURNING id`,
    sql`DELETE FROM login_attempts WHERE at < now() - interval '1 day'`,
  ]);

  return { items: itemRows.length, extras: extraRows.length, ordersRemoved: orderRows.length };
}
