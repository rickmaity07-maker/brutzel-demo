import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BRAND } from "@/brand.config";
import { LangToggle } from "@/components/LangProvider";
import { FramePlayer } from "@/components/shop/FramePlayer";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Team-Login", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const demoPassword = process.env.DEMO_MODE === "1" ? (process.env.ADMIN_PASSWORD ?? null) : null;
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-grill px-4 text-grill-ink">
      <FramePlayer base="/frames/fries" count={199} bg="#0f1310" mode="play" focus={{ x: 0.5, y: 0.6, zoom: 1.1 }} />
      <div className="absolute inset-0 bg-grill/55" aria-hidden="true" />
      <div className="glass relative w-full max-w-sm rounded-[var(--radius-card)] p-7">
        <div className="mb-8 flex items-center justify-between">
          <p className="display text-5xl text-ketchup">{BRAND.name}</p>
          <LangToggle className="border-grill-ink/30" />
        </div>
        <LoginForm demoPassword={demoPassword} />
      </div>
    </div>
  );
}
