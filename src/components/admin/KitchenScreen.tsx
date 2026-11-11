"use client";

import { useEffect, useState, useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import { useLang } from "@/components/LangProvider";
import type { OrderView } from "@/lib/types";
import { OrderLines, minutesAgo } from "./OrderCard";
import { useLiveOrders } from "./useLiveOrders";

/** Big tickets for the grill: everything accepted and not yet ready, oldest first. */
export function KitchenScreen({ initial }: { initial: OrderView[] }) {
  const { t } = useLang();
  const { orders, setOrders, refresh } = useLiveOrders(initial);
  const [now, setNow] = useState(() => Date.now());
  const [, start] = useTransition();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const tickets = orders
    .filter((o) => o.status === "new" || o.status === "preparing")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  function done(o: OrderView) {
    const to = o.status === "new" ? "preparing" : "ready";
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: to } : x)));
    start(async () => {
      await setOrderStatus(o.id, to);
      await refresh();
    });
  }

  return (
    <div>
      <h1 className="display mb-5 text-4xl">{t.admin.kitchen.title}</h1>
      {tickets.length === 0 ? (
        <p className="grid min-h-[50dvh] place-items-center rounded-[var(--radius-card)] border-[1.5px] border-dashed border-line text-2xl text-muted">
          {t.admin.kitchen.empty}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tickets.map((o) => {
            const age = minutesAgo(o.created_at, now);
            return (
              <article key={o.id} className="flex flex-col rounded-[var(--radius-card)] bg-grill p-5 text-grill-ink">
                <header className="mb-4 flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-bold">#{o.code}</span>
                  <span className={`text-lg font-semibold tabular-nums ${age >= 15 ? "text-ketchup" : "opacity-70"}`}>
                    {age} min
                  </span>
                </header>
                <div className="flex-1">
                  <OrderLines order={o} large />
                  {o.note ? <p className="mt-4 rounded-[var(--radius-field)] bg-ketchup p-3 text-lg text-ketchup-ink">{o.note}</p> : null}
                </div>
                <button type="button" onClick={() => done(o)} className="btn btn-primary mt-5 py-4 text-lg">
                  {o.status === "new" ? t.admin.orders.next.new : t.admin.kitchen.done}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
