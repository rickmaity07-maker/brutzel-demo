import "server-only";
import { cache } from "react";
import { sql } from "./db";
import type { DayHours, DeliverySettings, Extra, MenuItem, OrderView } from "./types";

export const getMenu = cache(async (opts: { includeUnavailable?: boolean } = {}) => {
  const rows = opts.includeUnavailable
    ? await sql`SELECT id, slug, category, name_de, name_en, desc_de, desc_en, price_cents, image, tag, available
                FROM menu_items ORDER BY sort, id`
    : await sql`SELECT id, slug, category, name_de, name_en, desc_de, desc_en, price_cents, image, tag, available
                FROM menu_items WHERE available ORDER BY sort, id`;
  return rows as MenuItem[];
});

export const getExtras = cache(async (opts: { includeUnavailable?: boolean } = {}) => {
  const rows = opts.includeUnavailable
    ? await sql`SELECT id, slug, name_de, name_en, price_cents, available FROM extras ORDER BY sort, id`
    : await sql`SELECT id, slug, name_de, name_en, price_cents, available FROM extras WHERE available ORDER BY sort, id`;
  return rows as Extra[];
});

export type Settings = { hours: DayHours[]; combo: { price_cents: number }; delivery: DeliverySettings };

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = (await sql`SELECT key, value FROM settings`) as { key: string; value: unknown }[];
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    hours: (map.hours as DayHours[]) ?? [],
    combo: (map.combo as Settings["combo"]) ?? { price_cents: 450 },
    delivery: (map.delivery as DeliverySettings) ?? { fee_cents: 250, min_cents: 1500, postcodes: [] },
  };
});

/** Is the shop open right now (Europe/Berlin)? */
export function openNow(hours: DayHours[], now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  const hm = `${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}`;
  const today = hours.find((h) => h.day === day);
  if (!today || today.closed) return false;
  return hm >= today.open && hm < today.close;
}

type OrderRow = Omit<OrderView, "lines" | "created_at"> & { created_at: string | Date };
type LineRow = OrderView["lines"][number] & { order_id: number };

async function attachLines(orders: OrderRow[]): Promise<OrderView[]> {
  if (orders.length === 0) return [];
  const ids = orders.map((o) => o.id);
  const lines = (await sql`
    SELECT order_id, name_de, name_en, qty, combo, combo_drink, extras, line_cents
    FROM order_lines WHERE order_id = ANY(${ids}) ORDER BY id`) as LineRow[];
  const byOrder = new Map<number, OrderView["lines"]>();
  for (const { order_id, ...l } of lines) {
    const list = byOrder.get(order_id) ?? [];
    list.push(l);
    byOrder.set(order_id, list);
  }
  return orders.map((o) => ({
    ...o,
    created_at: new Date(o.created_at).toISOString(),
    lines: byOrder.get(o.id) ?? [],
  }));
}

export async function getOrderByCode(code: string) {
  const rows = (await sql`
    SELECT id, code, mode, customer_name, phone, address, postcode, note, status,
           subtotal_cents, delivery_cents, total_cents, created_at
    FROM orders WHERE code = ${code}`) as OrderRow[];
  return (await attachLines(rows))[0] ?? null;
}

/** Orders still in play plus the last 12 hours of finished ones, newest first. */
export async function getActiveOrders() {
  const rows = (await sql`
    SELECT id, code, mode, customer_name, phone, address, postcode, note, status,
           subtotal_cents, delivery_cents, total_cents, created_at
    FROM orders
    WHERE status IN ('new', 'preparing', 'ready', 'out')
       OR created_at > now() - interval '12 hours'
    ORDER BY created_at DESC LIMIT 200`) as OrderRow[];
  return attachLines(rows);
}
