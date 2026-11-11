"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import type { OrderMode, OrderStatus } from "@/lib/types";

const POLL_MS = 4000;

export function StatusTracker(props: { code: string; mode: OrderMode; initial: OrderStatus }) {
  const { t } = useLang();
  const [status, setStatus] = useState<OrderStatus>(props.initial);
  const steps: OrderStatus[] =
    props.mode === "delivery" ? ["new", "preparing", "out", "done"] : ["new", "preparing", "ready", "done"];
  const finished = status === "done" || status === "cancelled";

  useEffect(() => {
    if (finished) return;
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/orders/${props.code}`, { cache: "no-store" });
        const json = await res.json();
        if (alive && json.ok) setStatus(json.status);
      } catch {
        /* offline for a moment: try again next tick */
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [props.code, finished]);

  // "ready" on a delivery order means it's waiting for the driver: show it as still preparing.
  const shown = props.mode === "delivery" && status === "ready" ? "preparing" : status;
  const current = steps.indexOf(shown);

  if (status === "cancelled") {
    return <p className="mt-8 rounded-[var(--radius-card)] bg-line p-5 text-lg font-semibold">{t.status.steps.cancelled}</p>;
  }

  return (
    <div className="mt-8">
      <ol className="grid grid-cols-4 gap-2" aria-label={t.status.live}>
        {steps.map((s, i) => {
          const reached = i <= current;
          return (
            <li key={s} aria-current={i === current ? "step" : undefined}>
              <span
                className={`block h-2 rounded-full transition-colors duration-500 ${
                  reached ? (i === current && !finished ? "bg-ketchup" : "bg-pickle") : "bg-line"
                }`}
              />
              <span className={`mt-2 block text-sm font-semibold ${reached ? "" : "text-muted"}`}>
                {t.status.steps[s]}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-lg font-medium" aria-live="polite">
        {status === "ready" && props.mode === "pickup" ? t.status.readyPickup : t.status.steps[shown]}
      </p>
      {!finished ? <p className="mt-1 text-sm text-muted">{t.status.live}</p> : null}
    </div>
  );
}
