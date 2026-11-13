"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Minus, Plus, ShoppingBag, Sparkle, X } from "@phosphor-icons/react";
import { useLang } from "@/components/LangProvider";
import { fill, pick } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import { COMBO_CATEGORIES } from "@/lib/types";
import { Dialog } from "./Dialog";
import { useShop } from "./ShopProvider";

export function CartDrawer() {
  const { lang, t } = useLang();
  const { drawerOpen, setDrawerOpen, cart, priced, setQty, add, menu, comboCents, delivery } = useShop();
  const lines = priced.ok ? priced.lines : [];
  const subtotal = priced.ok ? priced.subtotalCents : 0;

  // combo upgrade uses the first available drink; it can be changed in the item sheet
  const defaultDrink = menu.find((m) => m.category === "drinks" && m.available) ?? null;
  // add-ons: sides and shakes that aren't in the cart yet
  const inCart = new Set(cart.map((l) => l.itemId));
  const addOns = menu
    .filter((m) => (m.category === "sides" || m.category === "shakes") && m.available && !inCart.has(m.id))
    .slice(0, 3);
  const toMin = Math.max(0, delivery.min_cents - subtotal);
  const minProgress = Math.min(1, subtotal / Math.max(1, delivery.min_cents));

  return (
    <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} label={t.cart.title} side="right">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="display text-3xl">{t.cart.title}</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t.item.close}
            className="grid size-10 place-items-center rounded-full transition-colors hover:bg-raised"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-5">
            <p className="text-lg text-muted">{t.cart.empty}</p>
            <Link href="/menu" onClick={() => setDrawerOpen(false)} className="btn btn-ghost">
              {t.cart.toMenu}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto" data-lenis-prevent>
            <ul className="divide-y divide-line px-5">
              {lines.map((l, i) => {
                const key = cart[i].key;
                return (
                  <li key={key} className="flex gap-4 py-4">
                    <div className="flex-1">
                      <p className="font-semibold">{pick(l.item, "name", lang)}</p>
                      {l.extras.length > 0 ? (
                        <p className="text-sm text-muted">+ {l.extras.map((e) => pick(e, "name", lang)).join(", ")}</p>
                      ) : null}
                      {l.combo && l.comboDrink ? (
                        <p className="text-sm text-muted">
                          {fill(t.cart.comboWith, { drink: pick(l.comboDrink, "name", lang) })}
                        </p>
                      ) : null}
                      {!l.combo && defaultDrink && COMBO_CATEGORIES.includes(l.item.category) ? (
                        <button
                          type="button"
                          onClick={() => {
                            const line = cart[i];
                            setQty(key, 0);
                            add({ itemId: line.itemId, qty: line.qty, extras: line.extras, combo: true, comboDrink: defaultDrink.slug });
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ketchup/15 px-3 py-1.5 text-left text-xs font-semibold text-ink transition-colors hover:bg-ketchup/25"
                        >
                          <Sparkle size={13} weight="fill" className="shrink-0 text-ketchup" aria-hidden />
                          {fill(t.cartPlus.makeCombo, { drink: pick(defaultDrink, "name", lang) })}
                          <span className="tabular-nums text-muted">+{formatPrice(comboCents, lang)}</span>
                        </button>
                      ) : null}
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQty(key, l.qty - 1)}
                          className="grid size-8 place-items-center rounded-full border-[1.5px] border-line"
                          aria-label={l.qty === 1 ? t.cart.remove : "-1"}
                        >
                          <Minus size={14} weight="bold" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(key, l.qty + 1)}
                          className="grid size-8 place-items-center rounded-full border-[1.5px] border-line"
                          aria-label="+1"
                        >
                          <Plus size={14} weight="bold" />
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold tabular-nums">{formatPrice(l.lineCents, lang)}</p>
                  </li>
                );
              })}
            </ul>
            {addOns.length > 0 ? (
              <div className="border-t border-line px-5 py-5">
                <p className="text-sm font-semibold text-muted">{t.cartPlus.addOn}</p>
                <ul className="mt-3 grid gap-2">
                  {addOns.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => add({ itemId: m.id, qty: 1, extras: [], combo: false, comboDrink: null })}
                        className="group flex w-full items-center gap-3 rounded-[var(--radius-field)] bg-raised p-2 pr-3 text-left transition-colors hover:bg-line"
                      >
                        {m.image ? (
                          <Image src={m.image} alt="" width={48} height={48} className="size-12 rounded-lg object-cover" />
                        ) : null}
                        <span className="flex-1 text-sm font-semibold">{pick(m, "name", lang)}</span>
                        <span className="text-sm tabular-nums text-muted">{formatPrice(m.price_cents, lang)}</span>
                        <span className="grid size-7 place-items-center rounded-full bg-ketchup text-ketchup-ink transition-transform group-hover:rotate-90">
                          <Plus size={13} weight="bold" aria-hidden />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            </div>
            <div className="border-t border-line px-5 py-5">
              <div className="mb-4">
                <p className={`flex items-center gap-1.5 text-sm font-semibold ${toMin > 0 ? "text-muted" : "text-pickle"}`}>
                  {toMin > 0 ? (
                    fill(t.cartPlus.toMin, { amount: formatPrice(toMin, lang) })
                  ) : (
                    <>
                      <CheckCircle size={16} weight="fill" aria-hidden />
                      {t.cartPlus.minReached}
                    </>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${toMin > 0 ? "bg-ketchup" : "bg-pickle"}`}
                    style={{ width: `${minProgress * 100}%` }}
                  />
                </div>
              </div>
              <div className="mb-4 flex justify-between text-lg">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold tabular-nums">
                  {priced.ok ? formatPrice(priced.subtotalCents, lang) : "..."}
                </span>
              </div>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)} className="btn btn-primary w-full">
                {t.cart.checkout}
              </Link>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}

export function CartButton() {
  const { t, lang } = useLang();
  const { count, priced, setDrawerOpen } = useShop();
  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      className="btn btn-primary px-4 py-2.5 text-sm"
      aria-label={`${t.nav.cart}, ${count}`}
    >
      <ShoppingBag size={17} weight="bold" className="sm:hidden" aria-hidden />
      <span className="hidden sm:inline">{t.nav.cart}</span>
      <span className="rounded-full bg-ketchup-ink px-2 text-ketchup tabular-nums">{count}</span>
      {count > 0 && priced.ok ? (
        <span className="hidden tabular-nums sm:inline">{formatPrice(priced.subtotalCents, lang)}</span>
      ) : null}
    </button>
  );
}
