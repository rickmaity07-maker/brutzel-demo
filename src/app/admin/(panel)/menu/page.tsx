import { requireAdmin } from "@/lib/session";
import type { Metadata } from "next";
import Image from "next/image";
import { saveCombo, saveItem } from "@/app/admin/actions";
import { SaveForm } from "@/components/admin/SaveForm";
import { getExtras, getMenu, getSettings } from "@/lib/data";
import { pick } from "@/lib/i18n";
import { getDict } from "@/lib/lang";
import { CATEGORIES, type Extra, type MenuItem } from "@/lib/types";

export const metadata: Metadata = { title: "Speisekarte bearbeiten", robots: { index: false } };

function PriceRow(props: { row: MenuItem | Extra; kind: "item" | "extra"; label: string; availableLabel: string }) {
  const { row, kind, label, availableLabel } = props;
  return (
    <SaveForm action={saveItem} className="flex flex-wrap items-center gap-4 py-3">
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="kind" value={kind} />
      {"image" in row ? (
        <span className="relative size-12 shrink-0 overflow-hidden rounded-[var(--radius-field)] bg-grill">
          {row.image ? <Image src={row.image} alt="" fill sizes="48px" className="object-cover" /> : null}
        </span>
      ) : null}
      <span className="min-w-40 flex-1 font-medium">{label}</span>
      <label className="flex items-center gap-2 text-sm">
        
        <span className="text-muted">EUR</span>
        <input
          name="price"
          inputMode="decimal"
          defaultValue={(row.price_cents / 100).toFixed(2)}
          className="field w-24 py-2 text-right tabular-nums"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="available" type="checkbox" defaultChecked={row.available} className="size-5 accent-[var(--pickle)]" />
        <span>{availableLabel}</span>
      </label>
    </SaveForm>
  );
}

export default async function MenuAdminPage() {
  await requireAdmin();
  const [{ lang, t }, menu, extras, settings] = await Promise.all([
    getDict(),
    getMenu({ includeUnavailable: true }),
    getExtras({ includeUnavailable: true }),
    getSettings(),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="display text-4xl">{t.admin.menu.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {t.admin.menu.price} · {t.admin.menu.available}
      </p>

      {CATEGORIES.map((c) => {
        const items = menu.filter((m) => m.category === c);
        if (items.length === 0) return null;
        return (
          <section key={c} className="mt-8">
            <h2 className="mb-1 font-semibold">{t.categories[c]}</h2>
            <div className="divide-y divide-line rounded-[var(--radius-card)] bg-card px-4">
              {items.map((m) => (
                <PriceRow key={m.id} row={m} kind="item" label={pick(m, "name", lang)} availableLabel={t.admin.menu.available} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-8">
        <h2 className="mb-1 font-semibold">{t.admin.menu.extras}</h2>
        <div className="divide-y divide-line rounded-[var(--radius-card)] bg-card px-4">
          {extras.map((x) => (
            <PriceRow key={x.id} row={x} kind="extra" label={pick(x, "name", lang)} availableLabel={t.admin.menu.available} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 font-semibold">{t.admin.menu.combo}</h2>
        <SaveForm action={saveCombo} className="flex items-center gap-4 rounded-[var(--radius-card)] bg-card px-4 py-3">
          <label className="flex flex-1 items-center gap-2 text-sm">
            <span className="text-muted">EUR</span>
            <input
              name="price"
              inputMode="decimal"
              defaultValue={(settings.combo.price_cents / 100).toFixed(2)}
              className="field w-24 py-2 text-right tabular-nums"
              aria-label={t.admin.menu.combo}
            />
          </label>
        </SaveForm>
      </section>
    </div>
  );
}
