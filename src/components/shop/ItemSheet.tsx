"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, X } from "@phosphor-icons/react";
import { useLang } from "@/components/LangProvider";
import { fill, pick } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import { COMBO_CATEGORIES, EXTRA_CATEGORIES, type MenuItem } from "@/lib/types";
import { Dialog } from "./Dialog";
import { useShop } from "./ShopProvider";

export function ItemSheet() {
  const { sheetItem, closeItem } = useShop();
  const { t } = useLang();
  return (
    <Dialog open={sheetItem !== null} onClose={closeItem} label={t.item.add}>
      {/* key resets the form state for every item */}
      {sheetItem ? <ItemForm key={sheetItem.id} item={sheetItem} /> : null}
    </Dialog>
  );
}

function ItemForm({ item }: { item: MenuItem }) {
  const { lang, t } = useLang();
  const { extras, menu, comboCents, add, closeItem, setDrawerOpen } = useShop();
  const drinks = menu.filter((m) => m.category === "drinks");
  const canExtras = EXTRA_CATEGORIES.includes(item.category);
  const canCombo = COMBO_CATEGORIES.includes(item.category) && drinks.length > 0;

  const [chosen, setChosen] = useState<string[]>([]);
  const [combo, setCombo] = useState(false);
  const [drink, setDrink] = useState(drinks[0]?.slug ?? null);
  const [qty, setQty] = useState(1);

  const unit =
    item.price_cents +
    extras.filter((e) => chosen.includes(e.slug)).reduce((s, e) => s + e.price_cents, 0) +
    (combo ? comboCents : 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    add({ itemId: item.id, qty, extras: chosen, combo, comboDrink: combo ? drink : null });
    closeItem();
    setDrawerOpen(true);
  }

  return (
    <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
      <div className="relative aspect-[16/10] shrink-0 bg-grill">
        {item.image ? (
          <Image src={item.image} alt="" fill sizes="512px" className="object-cover" />
        ) : null}
        <button
          type="button"
          onClick={closeItem}
          aria-label={t.item.close}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-card text-ink"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-5">
        <h2 className="display text-4xl">{pick(item, "name", lang)}</h2>
        <p className="mt-2 text-muted">{pick(item, "desc", lang)}</p>

        {canExtras && extras.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="font-semibold">{t.item.extras}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {extras.map((x) => {
                const on = chosen.includes(x.slug);
                return (
                  <label
                    key={x.slug}
                    className={`cursor-pointer rounded-full border-[1.5px] px-3.5 py-2 text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ketchup ${
                      on ? "border-ink bg-ink text-paper" : "border-line"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => setChosen((c) => (on ? c.filter((s) => s !== x.slug) : [...c, x.slug]))}
                    />
                    {pick(x, "name", lang)} +{formatPrice(x.price_cents, lang)}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {canCombo ? (
          <div className="mt-6 rounded-[var(--radius-card)] border-[1.5px] border-line p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={combo}
                onChange={(e) => setCombo(e.target.checked)}
                className="mt-1 size-5 accent-[var(--ketchup)]"
              />
              <span>
                <span className="block font-semibold">{t.item.combo}</span>
                <span className="text-sm text-muted">
                  {fill(t.item.comboHint, { price: formatPrice(comboCents, lang) })}
                </span>
              </span>
            </label>
            {combo ? (
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium">{t.item.drink}</span>
                <select className="field" value={drink ?? ""} onChange={(e) => setDrink(e.target.value)}>
                  {drinks.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {pick(d, "name", lang)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 border-t border-line px-5 py-4">
        <div className="flex items-center gap-1" role="group" aria-label={t.item.qty}>
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-10 place-items-center rounded-full border-[1.5px] border-line"
            aria-label="-1"
          >
            <Minus size={16} weight="bold" />
          </button>
          <output className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
            {qty}
          </output>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            className="grid size-10 place-items-center rounded-full border-[1.5px] border-line"
            aria-label="+1"
          >
            <Plus size={16} weight="bold" />
          </button>
        </div>
        <button type="submit" className="btn btn-primary flex-1">
          {fill(t.item.addFor, { price: formatPrice(unit * qty, lang) })}
        </button>
      </div>
    </form>
  );
}
