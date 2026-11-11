"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { fill, pick } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import type { OrderMode } from "@/lib/types";
import { useShop } from "./ShopProvider";

type FieldErrors = Partial<Record<"name" | "phone" | "address" | "postcode", string>>;

export function CheckoutForm() {
  const { lang, t } = useLang();
  const router = useRouter();
  const { cart, priced, delivery, clear } = useShop();
  const [mode, setMode] = useState<OrderMode>("pickup");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (cart.length === 0 || !priced.ok) {
    return (
      <div className="mt-10 flex flex-col items-start gap-5">
        <p className="text-lg text-muted">{t.cart.empty}</p>
        <Link href="/menu" className="btn btn-primary">
          {t.cart.toMenu}
        </Link>
      </div>
    );
  }

  const fee = mode === "delivery" ? delivery.fee_cents : 0;
  const missing = mode === "delivery" ? Math.max(0, delivery.min_cents - priced.subtotalCents) : 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      mode,
      name: String(f.get("name") ?? "").trim(),
      phone: String(f.get("phone") ?? "").trim(),
      address: String(f.get("address") ?? "").trim(),
      postcode: String(f.get("postcode") ?? "").trim(),
      note: String(f.get("note") ?? "").trim(),
    };
    const errs: FieldErrors = {};
    if (data.name.length < 2) errs.name = t.checkout.errors.name;
    if (!/^[+\d][\d\s/()-]{5,}$/.test(data.phone)) errs.phone = t.checkout.errors.phone;
    if (mode === "delivery" && data.address.length < 4) errs.address = t.checkout.errors.address;
    if (mode === "delivery" && delivery.postcodes.length > 0 && !delivery.postcodes.includes(data.postcode))
      errs.postcode = fill(t.checkout.errors.postcode, { list: delivery.postcodes.join(", ") });
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length > 0 || missing > 0) return;

    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lines: cart.map(({ itemId, qty, extras, combo, comboDrink }) => ({ itemId, qty, extras, combo, comboDrink })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        clear();
        router.push(`/status/${json.code}`);
        return;
      }
      const map: Record<string, string> = {
        closed: t.checkout.errors.closed,
        changed: t.checkout.errors.changed,
        rate: t.checkout.errors.rate,
        postcode: fill(t.checkout.errors.postcode, { list: delivery.postcodes.join(", ") }),
      };
      setFormError(map[json.error] ?? t.checkout.errors.generic);
    } catch {
      setFormError(t.checkout.errors.generic);
    }
    setSending(false);
  }

  const field = (name: keyof FieldErrors, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="flex flex-col gap-2">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        className="field"
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-err` : undefined}
        {...props}
      />
      {errors[name] ? (
        <span id={`${name}-err`} className="text-sm font-medium text-ketchup">
          {errors[name]}
        </span>
      ) : null}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-10 md:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-5">
        <div role="radiogroup" aria-label={t.checkout.title} className="grid grid-cols-2 gap-1 rounded-full bg-card p-1">
          {(["pickup", "delivery"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-2.5 font-semibold transition-colors ${
                mode === m ? "bg-ink text-paper" : "text-muted hover:text-ink"
              }`}
            >
              {m === "pickup" ? t.checkout.pickup : t.checkout.delivery}
            </button>
          ))}
        </div>

        {field("name", t.checkout.name, { autoComplete: "name", required: true })}
        {field("phone", t.checkout.phone, { autoComplete: "tel", type: "tel", inputMode: "tel", required: true })}
        {mode === "delivery" ? (
          <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
            {field("address", t.checkout.address, { autoComplete: "street-address", required: true })}
            {field("postcode", t.checkout.postcode, { autoComplete: "postal-code", inputMode: "numeric", required: true })}
          </div>
        ) : null}
        <label className="flex flex-col gap-2">
          <span className="font-medium">{t.checkout.note}</span>
          <textarea name="note" rows={3} maxLength={300} placeholder={t.checkout.notePh} className="field" />
        </label>
        <p className="text-sm text-muted">{t.checkout.pay}</p>
      </div>

      <aside className="h-fit rounded-[var(--radius-card)] bg-card p-6">
        <ul className="divide-y divide-line">
          {priced.lines.map((l, i) => (
            <li key={cart[i].key} className="flex justify-between gap-4 py-3">
              <span>
                <span className="font-medium">
                  {l.qty} x {pick(l.item, "name", lang)}
                </span>
                {l.extras.length > 0 || l.combo ? (
                  <span className="block text-sm text-muted">
                    {[
                      ...l.extras.map((e) => pick(e, "name", lang)),
                      l.combo && l.comboDrink
                        ? fill(t.cart.comboWith, { drink: pick(l.comboDrink, "name", lang) })
                        : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                ) : null}
              </span>
              <span className="tabular-nums">{formatPrice(l.lineCents, lang)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-4">
          <div className="flex justify-between">
            <dt>{t.cart.subtotal}</dt>
            <dd className="tabular-nums">{formatPrice(priced.subtotalCents, lang)}</dd>
          </div>
          {mode === "delivery" ? (
            <div className="flex justify-between">
              <dt>{t.checkout.deliveryFee}</dt>
              <dd className="tabular-nums">{formatPrice(fee, lang)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between pt-2 text-xl font-semibold">
            <dt>{t.checkout.total}</dt>
            <dd className="tabular-nums">{formatPrice(priced.subtotalCents + fee, lang)}</dd>
          </div>
        </dl>
        {missing > 0 ? (
          <p className="mt-4 text-sm font-medium text-ketchup">
            {fill(t.checkout.minOrder, { missing: formatPrice(missing, lang) })}
          </p>
        ) : null}
        {formError ? (
          <p role="alert" className="mt-4 rounded-[var(--radius-field)] bg-ketchup/10 p-3 text-sm font-medium text-ketchup">
            {formError}
          </p>
        ) : null}
        <button type="submit" disabled={sending || missing > 0} className="btn btn-primary mt-5 w-full text-lg">
          {sending ? t.checkout.placing : t.checkout.place}
        </button>
      </aside>
    </form>
  );
}
