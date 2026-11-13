import { describe, expect, it } from "vitest";
import seed from "../db/seed.json";
import { pitchName } from "../src/lib/pitch";
import { priceCart } from "../src/lib/pricing";
import type { Extra, MenuItem } from "../src/lib/types";

// Fixtures come from the real seed, so these tests also catch a broken seed file.
const menu: MenuItem[] = seed.items.map((i, n) => ({ ...i, id: n + 1, available: true, sort: n }) as unknown as MenuItem);
const extras: Extra[] = seed.extras.map((e, n) => ({ ...e, id: n + 1, available: true }) as unknown as Extra);
const COMBO = seed.settings.combo.price_cents;
const id = (slug: string) => menu.find((m) => m.slug === slug)!.id;
const line = (slug: string, more: Partial<{ qty: number; extras: string[]; combo: boolean; comboDrink: string | null }> = {}) => ({
  itemId: id(slug),
  qty: 1,
  extras: [],
  combo: false,
  comboDrink: null,
  ...more,
});

describe("seed", () => {
  it("has unique slugs and positive prices", () => {
    expect(new Set(seed.items.map((i) => i.slug)).size).toBe(seed.items.length);
    expect(seed.items.every((i) => i.price_cents > 0)).toBe(true);
    expect(seed.settings.hours).toHaveLength(7);
  });
});

describe("priceCart", () => {
  it("adds base price, extras and quantity", () => {
    const r = priceCart([line("brutzler", { qty: 2, extras: ["bacon", "kaese"] })], menu, extras, COMBO);
    expect(r).toMatchObject({ ok: true, subtotalCents: 2 * (990 + 150 + 80) });
  });

  it("charges the combo price and needs a drink", () => {
    expect(priceCart([line("brutzler", { combo: true, comboDrink: "cola" })], menu, extras, COMBO)).toMatchObject({
      ok: true,
      subtotalCents: 990 + COMBO,
    });
    expect(priceCart([line("brutzler", { combo: true })], menu, extras, COMBO)).toEqual({ ok: false, error: "bad_combo" });
    // a burger is not a drink
    expect(priceCart([line("brutzler", { combo: true, comboDrink: "garten" })], menu, extras, COMBO)).toEqual({
      ok: false,
      error: "bad_combo",
    });
  });

  it("rejects extras on items that don't take them, and unknown extras", () => {
    expect(priceCart([line("pommes", { extras: ["bacon"] })], menu, extras, COMBO)).toEqual({ ok: false, error: "bad_extra" });
    expect(priceCart([line("brutzler", { extras: ["gold"] })], menu, extras, COMBO)).toEqual({ ok: false, error: "bad_extra" });
  });

  it("counts a duplicated extra once", () => {
    const r = priceCart([line("brutzler", { extras: ["bacon", "bacon"] })], menu, extras, COMBO);
    expect(r).toMatchObject({ ok: true, subtotalCents: 990 + 150 });
  });

  it("rejects unknown, unavailable and empty carts", () => {
    expect(priceCart([], menu, extras, COMBO)).toEqual({ ok: false, error: "empty" });
    expect(priceCart([{ ...line("brutzler"), itemId: 9999 }], menu, extras, COMBO)).toEqual({ ok: false, error: "unknown_item" });
    const off = menu.map((m) => (m.slug === "brutzler" ? { ...m, available: false } : m));
    expect(priceCart([line("brutzler")], off, extras, COMBO)).toEqual({ ok: false, error: "unavailable" });
  });
});

describe("pitchName", () => {
  it("keeps letters, umlauts and simple punctuation", () => {
    expect(pitchName("Burgerhaus Müller & Söhne")).toBe("Burgerhaus Müller & Söhne");
  });
  it("strips markup and caps the length", () => {
    expect(pitchName("<script>alert(1)</script>Bob")).toBe("scriptalert1scriptBob");
    expect(pitchName("x".repeat(80))).toHaveLength(40);
  });
  it("ignores missing, array and too-short values", () => {
    expect(pitchName(undefined)).toBeNull();
    expect(pitchName(["a", "b"])).toBeNull();
    expect(pitchName("a")).toBeNull();
  });
});
