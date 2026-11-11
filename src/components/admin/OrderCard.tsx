"use client";

import { Bicycle, Storefront } from "@phosphor-icons/react";
import { useLang } from "@/components/LangProvider";
import { fill } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import type { OrderView } from "@/lib/types";

export function minutesAgo(iso: string, now: number) {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
}

export function OrderLines({ order, large = false }: { order: OrderView; large?: boolean }) {
  const { lang, t } = useLang();
  return (
    <ul className={large ? "space-y-2 text-xl" : "space-y-1 text-sm"}>
      {order.lines.map((l, i) => (
        <li key={i}>
          <span className="font-semibold tabular-nums">{l.qty}x</span> {lang === "de" ? l.name_de : l.name_en}
          {l.extras.length > 0 ? (
            <span className="block pl-6 text-muted">+ {l.extras.map((e) => (lang === "de" ? e.name_de : e.name_en)).join(", ")}</span>
          ) : null}
          {l.combo ? (
            <span className="block pl-6 text-muted">{fill(t.cart.comboWith, { drink: l.combo_drink ?? "" })}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function OrderCard(props: {
  order: OrderView;
  now: number;
  fresh: boolean;
  onAdvance: (to: OrderView["status"]) => void;
  onCancel: () => void;
  onSeen: () => void;
}) {
  const { lang, t } = useLang();
  const { order } = props;
  const nextTo: Partial<Record<OrderView["status"], OrderView["status"]>> = {
    new: "preparing",
    preparing: "ready",
    ready: order.mode === "delivery" ? "out" : "done",
    out: "done",
  };
  const next = nextTo[order.status];
  const nextLabel =
    order.status === "ready" && order.mode === "delivery"
      ? t.admin.orders.readyDelivery
      : t.admin.orders.next[order.status as keyof typeof t.admin.orders.next];

  return (
    <article
      onMouseEnter={props.onSeen}
      onFocus={props.onSeen}
      className={`rounded-[var(--radius-card)] bg-card p-4 shadow-[0_1px_0_var(--line)] transition-shadow ${
        props.fresh ? "ring-2 ring-ketchup" : ""
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-bold tracking-wide">#{order.code}</p>
          <p className="text-sm text-muted">
            {minutesAgo(order.created_at, props.now)} min · {order.customer_name}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            order.mode === "delivery" ? "bg-ketchup/12 text-ketchup" : "bg-line text-ink"
          }`}
        >
          {order.mode === "delivery" ? <Bicycle size={14} weight="bold" /> : <Storefront size={14} weight="bold" />}
          {order.mode === "delivery" ? t.admin.orders.delivery : t.admin.orders.pickup}
        </span>
      </header>

      <div className="mt-3">
        <OrderLines order={order} />
      </div>
      {order.note ? <p className="mt-3 rounded-[var(--radius-field)] bg-paper p-2 text-sm">{order.note}</p> : null}
      {order.mode === "delivery" ? (
        <p className="mt-3 text-sm">
          {order.address}, {order.postcode}
        </p>
      ) : null}
      <p className="mt-1 text-sm text-muted">{order.phone}</p>

      <footer className="mt-4 flex items-center gap-2">
        <span className="mr-auto font-semibold tabular-nums">{formatPrice(order.total_cents, lang)}</span>
        {order.status !== "out" ? (
          <button
            type="button"
            onClick={props.onCancel}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-line hover:text-ink"
          >
            {t.admin.orders.cancel}
          </button>
        ) : null}
        {next ? (
          <button type="button" onClick={() => props.onAdvance(next)} className="btn btn-primary px-4 py-2 text-sm">
            {nextLabel}
          </button>
        ) : null}
      </footer>
    </article>
  );
}
