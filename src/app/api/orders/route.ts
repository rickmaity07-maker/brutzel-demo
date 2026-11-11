import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { getExtras, getMenu, getSettings, openNow } from "@/lib/data";
import { priceCart } from "@/lib/pricing";
import { clientIpHash } from "@/lib/session";

const LineSchema = z.object({
  itemId: z.number().int().positive(),
  qty: z.number().int().min(1).max(20),
  extras: z.array(z.string().max(40)).max(10),
  combo: z.boolean(),
  comboDrink: z.string().max(40).nullable(),
});

const OrderSchema = z
  .object({
    mode: z.enum(["pickup", "delivery"]),
    name: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .trim()
      .min(6)
      .max(30)
      .regex(/^[+\d][\d\s/()-]{5,}$/),
    address: z.string().trim().max(120).optional().default(""),
    postcode: z.string().trim().max(10).optional().default(""),
    note: z.string().trim().max(300).optional().default(""),
    lines: z.array(LineSchema).min(1).max(30),
  })
  .refine((o) => o.mode === "pickup" || o.address.length >= 4, { path: ["address"] });

type ErrorCode = "invalid" | "closed" | "changed" | "postcode" | "min" | "rate" | "server";
const fail = (error: ErrorCode, status: number, field?: string) =>
  NextResponse.json({ ok: false, error, field }, { status });

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function orderCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("invalid", 400);
  }
  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) return fail("invalid", 400, String(parsed.error.issues[0]?.path[0] ?? ""));
  const order = parsed.data;

  const ipHash = await clientIpHash();
  const [menu, extras, settings, recent] = await Promise.all([
    getMenu(),
    getExtras(),
    getSettings(),
    sql`SELECT count(*)::int AS n FROM orders WHERE ip_hash = ${ipHash} AND created_at > now() - interval '10 minutes'`,
  ]);
  if ((recent[0] as { n: number }).n >= 5) return fail("rate", 429);
  if (process.env.DEMO_MODE !== "1" && !openNow(settings.hours)) return fail("closed", 409);

  const priced = priceCart(order.lines, menu, extras, settings.combo.price_cents);
  if (!priced.ok) return fail("changed", 409);

  let deliveryCents = 0;
  if (order.mode === "delivery") {
    if (settings.delivery.postcodes.length > 0 && !settings.delivery.postcodes.includes(order.postcode))
      return fail("postcode", 422, "postcode");
    if (priced.subtotalCents < settings.delivery.min_cents) return fail("min", 422);
    deliveryCents = settings.delivery.fee_cents;
  }

  const lines = priced.lines.map((l) => ({
    item_id: l.item.id,
    name_de: l.item.name_de,
    name_en: l.item.name_en,
    qty: l.qty,
    unit_cents: l.unitCents,
    combo: l.combo,
    combo_drink: l.comboDrink ? l.comboDrink.name_de : null,
    extras: l.extras.map((e) => ({ slug: e.slug, name_de: e.name_de, name_en: e.name_en })),
    line_cents: l.lineCents,
  }));

  const code = orderCode();
  try {
    // One statement = one transaction: the order and its lines are written together or not at all.
    await sql`
      WITH o AS (
        INSERT INTO orders (code, mode, customer_name, phone, address, postcode, note,
                            subtotal_cents, delivery_cents, total_cents, ip_hash)
        VALUES (${code}, ${order.mode}, ${order.name}, ${order.phone},
                ${order.mode === "delivery" ? order.address : null},
                ${order.mode === "delivery" ? order.postcode : null},
                ${order.note || null}, ${priced.subtotalCents}, ${deliveryCents},
                ${priced.subtotalCents + deliveryCents}, ${ipHash})
        RETURNING id
      )
      INSERT INTO order_lines (order_id, item_id, name_de, name_en, qty, unit_cents, combo, combo_drink, extras, line_cents)
      SELECT o.id, l.item_id, l.name_de, l.name_en, l.qty, l.unit_cents, l.combo, l.combo_drink, l.extras, l.line_cents
      FROM o, jsonb_to_recordset(${JSON.stringify(lines)}::jsonb)
        AS l(item_id int, name_de text, name_en text, qty int, unit_cents int,
             combo boolean, combo_drink text, extras jsonb, line_cents int)`;
  } catch (err) {
    console.error("order insert failed", err instanceof Error ? err.message : err);
    return fail("server", 500);
  }

  return NextResponse.json({ ok: true, code }, { status: 201 });
}
