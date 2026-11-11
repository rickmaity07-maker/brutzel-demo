import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LangToggle } from "@/components/LangProvider";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Team-Login", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const demoPassword = process.env.DEMO_MODE === "1" ? (process.env.ADMIN_PASSWORD ?? null) : null;
  return (
    <div className="grid min-h-dvh place-items-center bg-grill px-4 text-grill-ink">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <p className="display text-5xl text-ketchup">Brutzel</p>
          <LangToggle className="border-grill-ink/30" />
        </div>
        <LoginForm demoPassword={demoPassword} />
      </div>
    </div>
  );
}
