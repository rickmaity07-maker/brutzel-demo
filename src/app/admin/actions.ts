"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken } from "@/lib/auth";
import { sql } from "@/lib/db";
import { clientIpHash, requireAdmin } from "@/lib/session";
import type { OrderStatus } from "@/lib/types";

const MAX_ATTEMPTS = 8;

export type LoginState = { error: "wrong" | "locked" | null };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const ipHash = await clientIpHash();
  const [{ n }] = (await sql`
    SELECT count(*)::int AS n FROM login_attempts
    WHERE ip_hash = ${ipHash} AND at > now() - interval '15 minutes'`) as { n: number }[];
  if (n >= MAX_ATTEMPTS) return { error: "locked" };

  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!(await checkPassword(password))) {
    await sql`INSERT INTO login_attempts (ip_hash) VALUES (${ipHash})`;
    return { error: n + 1 >= MAX_ATTEMPTS ? "locked" : "wrong" };
  }

  await sql`DELETE FROM login_attempts WHERE ip_hash = ${ipHash} OR at < now() - interval '1 day'`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/** Allowed moves: every target lists the statuses it can be reached from. */
const FROM: Record<OrderStatus, OrderStatus[]> = {
  new: [],
  preparing: ["new"],
  ready: ["preparing"],
  out: ["ready"],
  done: ["ready", "out"],
  cancelled: ["new", "preparing", "ready"],
};

const StatusInput = z.object({
  id: z.number().int().positive(),
  to: z.enum(["preparing", "ready", "out", "done", "cancelled"]),
});

export async function setOrderStatus(id: number, to: OrderStatus) {
  await requireAdmin();
  const input = StatusInput.safeParse({ id, to });
  if (!input.success) return { ok: false };
  const from = FROM[input.data.to];
  // Pickup orders never go "out"; delivery orders go out before done.
  const rows = await sql`
    UPDATE orders SET status = ${input.data.to}, updated_at = now()
    WHERE id = ${input.data.id} AND status = ANY(${from})
      AND NOT (${input.data.to} = 'out' AND mode = 'pickup')
      AND NOT (${input.data.to} = 'done' AND mode = 'delivery' AND status = 'ready')
    RETURNING id`;
  return { ok: rows.length === 1 };
}

const ItemInput = z.object({
  id: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0).max(999),
  available: z.boolean(),
});

export async function saveItem(form: FormData) {
  await requireAdmin();
  const input = ItemInput.safeParse({
    id: form.get("id"),
    price: String(form.get("price") ?? "").replace(",", "."),
    available: form.get("available") === "on",
  });
  if (!input.success) return { ok: false };
  const cents = Math.round(input.data.price * 100);
  const table = form.get("kind") === "extra" ? "extras" : "menu_items";
  if (table === "extras") {
    await sql`UPDATE extras SET price_cents = ${cents}, available = ${input.data.available} WHERE id = ${input.data.id}`;
  } else {
    await sql`UPDATE menu_items SET price_cents = ${cents}, available = ${input.data.available} WHERE id = ${input.data.id}`;
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveCombo(form: FormData) {
  await requireAdmin();
  const price = z.coerce.number().min(0).max(50).safeParse(String(form.get("price") ?? "").replace(",", "."));
  if (!price.success) return { ok: false };
  const value = JSON.stringify({ price_cents: Math.round(price.data * 100) });
  await sql`INSERT INTO settings (key, value) VALUES ('combo', ${value}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  revalidatePath("/", "layout");
  return { ok: true };
}

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const HoursInput = z
  .array(z.object({ day: z.number().int().min(0).max(6), open: time, close: time, closed: z.boolean() }))
  .length(7);

export async function saveHours(form: FormData) {
  await requireAdmin();
  const days = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: String(form.get(`open-${day}`) ?? ""),
    close: String(form.get(`close-${day}`) ?? ""),
    closed: form.get(`closed-${day}`) === "on",
  }));
  const input = HoursInput.safeParse(days);
  if (!input.success) return { ok: false };
  await sql`INSERT INTO settings (key, value) VALUES ('hours', ${JSON.stringify(input.data)}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  revalidatePath("/", "layout");
  return { ok: true };
}
