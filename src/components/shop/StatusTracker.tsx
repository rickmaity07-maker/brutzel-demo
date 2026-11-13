"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** A clock that ticks every 15 s in the browser and is null on the server (no hydration mismatch). */
const TICK = 15000;
const subscribeClock = (cb: () => void) => {
  const id = setInterval(cb, TICK);
  return () => clearInterval(id);
};
const clockSnapshot = () => Math.floor(Date.now() / TICK) * TICK;
const serverClock = () => null;
import { CheckCircle, Clock, Moped } from "@phosphor-icons/react";
import { BRAND, brandAddress } from "@/brand.config";
import { useLang } from "@/components/LangProvider";
import { fill } from "@/lib/i18n";
import type { OrderMode, OrderStatus } from "@/lib/types";
import { FramePlayer } from "./FramePlayer";

/** How far the frying clip has got for each status (raw batter -> golden -> dip on the side). */
const CLIP_AT: Record<string, number> = { new: 0.3, preparing: 0.62, ready: 0.86, out: 0.86, done: 1 };

const POLL_MS = 4000;

export function StatusTracker(props: { code: string; mode: OrderMode; initial: OrderStatus; createdAt: string }) {
  const { t, lang } = useLang();
  const [status, setStatus] = useState<OrderStatus>(props.initial);
  // set after mount only, so server and client render the same markup
  const now = useSyncExternalStore(subscribeClock, clockSnapshot, serverClock);
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

  const dueAt = new Date(props.createdAt).getTime() + BRAND.prepMinutes[props.mode] * 60000;
  const minutesLeft = now === null ? null : Math.max(0, Math.ceil((dueAt - now) / 60000));

  // "ready" on a delivery order means it's waiting for the driver: show it as still preparing.
  const shown = props.mode === "delivery" && status === "ready" ? "preparing" : status;
  const current = steps.indexOf(shown);

  if (status === "cancelled") {
    return <p className="mt-8 rounded-[var(--radius-card)] bg-line p-5 text-lg font-semibold">{t.status.steps.cancelled}</p>;
  }

  return (
    <div className="mt-8">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-studio">
        <FramePlayer
          base="/frames/chicken"
          count={199}
          bg="#ecede5"
          mode="progress"
          progress={CLIP_AT[shown] ?? 0}
          focus={{ x: 0.53, y: 0.6, zoom: 1.3 }}
        />
      </div>
      <ol className="mt-6 grid grid-cols-4 gap-2" aria-label={t.status.live}>
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
      {(status === "ready" && props.mode === "pickup") || status === "out" || status === "done" ? (
        <div
          className="mt-6 flex items-start gap-4 rounded-[var(--radius-card)] border border-pickle/40 bg-pickle/10 p-5"
          aria-live="polite"
        >
          {status === "out" ? (
            <Moped size={34} weight="duotone" className="shrink-0 text-pickle" aria-hidden />
          ) : (
            <CheckCircle size={34} weight="duotone" className="shrink-0 text-pickle" aria-hidden />
          )}
          <div>
            <p className="display text-3xl">
              {status === "out" ? t.eta.outTitle : status === "done" ? t.eta.doneTitle : t.eta.readyTitle}
            </p>
            {status === "ready" ? (
              <p className="mt-1 text-ink/85">{fill(t.eta.readyBody, { address: brandAddress(lang) })}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3" aria-live="polite">
          <Clock size={22} weight="duotone" className="shrink-0 text-ketchup" aria-hidden />
          <p className="text-lg font-medium">
            {minutesLeft === null
              ? t.status.steps[shown]
              : minutesLeft <= 1
                ? t.eta.soon
                : fill(props.mode === "pickup" ? t.eta.pickup : t.eta.delivery, { min: minutesLeft })}
          </p>
        </div>
      )}
      {!finished ? <p className="mt-2 text-sm text-muted">{t.status.live}</p> : null}
    </div>
  );
}
