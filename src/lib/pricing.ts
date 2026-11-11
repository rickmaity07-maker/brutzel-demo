import { COMBO_CATEGORIES, EXTRA_CATEGORIES, type CartLine, type Extra, type MenuItem } from "./types";

export type PricedLine = {
  item: MenuItem;
  qty: number;
  extras: Extra[];
  combo: boolean;
  comboDrink: MenuItem | null;
  unitCents: number;
  lineCents: number;
};

export type PriceError = "unknown_item" | "unavailable" | "bad_extra" | "bad_combo" | "empty";
export type PriceResult = { ok: true; lines: PricedLine[]; subtotalCents: number } | { ok: false; error: PriceError };

/**
 * Single source of truth for prices. The client uses it for display;
 * the server re-runs it on submit with fresh DB data, so a tampered cart can't change prices.
 */
export function priceCart(
  cart: Pick<CartLine, "itemId" | "qty" | "extras" | "combo" | "comboDrink">[],
  menu: MenuItem[],
  extras: Extra[],
  comboCents: number,
): PriceResult {
  if (cart.length === 0) return { ok: false, error: "empty" };
  const byId = new Map(menu.map((m) => [m.id, m]));
  const bySlug = new Map(menu.map((m) => [m.slug, m]));
  const extraBySlug = new Map(extras.map((e) => [e.slug, e]));

  const lines: PricedLine[] = [];
  let subtotalCents = 0;
  for (const c of cart) {
    const item = byId.get(c.itemId);
    if (!item) return { ok: false, error: "unknown_item" };
    if (!item.available) return { ok: false, error: "unavailable" };

    const chosenExtras: Extra[] = [];
    if (c.extras.length > 0) {
      if (!EXTRA_CATEGORIES.includes(item.category)) return { ok: false, error: "bad_extra" };
      for (const slug of new Set(c.extras)) {
        const e = extraBySlug.get(slug);
        if (!e || !e.available) return { ok: false, error: "bad_extra" };
        chosenExtras.push(e);
      }
    }

    let comboDrink: MenuItem | null = null;
    if (c.combo) {
      if (!COMBO_CATEGORIES.includes(item.category)) return { ok: false, error: "bad_combo" };
      const drink = c.comboDrink ? bySlug.get(c.comboDrink) : undefined;
      if (!drink || drink.category !== "drinks" || !drink.available) return { ok: false, error: "bad_combo" };
      comboDrink = drink;
    }

    const unitCents =
      item.price_cents + chosenExtras.reduce((s, e) => s + e.price_cents, 0) + (c.combo ? comboCents : 0);
    const lineCents = unitCents * c.qty;
    subtotalCents += lineCents;
    lines.push({ item, qty: c.qty, extras: chosenExtras, combo: c.combo, comboDrink, unitCents, lineCents });
  }
  return { ok: true, lines, subtotalCents };
}

export function formatPrice(cents: number, lang: "de" | "en") {
  return new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-IE", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}
