import Link from "next/link";
import { getDict } from "@/lib/lang";

export async function SiteFooter() {
  const { t } = await getDict();
  return (
    <footer className="bg-grill text-grill-ink">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="display text-[clamp(4rem,14vw,11rem)] text-ketchup">Brutzel</p>
          <p className="mt-2 text-sm opacity-70">{t.visit.address}</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm md:items-end md:justify-end" aria-label="Footer">
          <Link href="/menu" className="hover:underline">
            {t.nav.menu}
          </Link>
          <Link href="/impressum" className="hover:underline">{t.footer.imprint}</Link>
          <Link href="/datenschutz" className="hover:underline">{t.footer.privacy}</Link>
          <Link href="/admin" className="hover:underline">
            {t.footer.admin}
          </Link>
          <span className="mt-4 text-xs opacity-60">{t.footer.demo}</span>
        </nav>
      </div>
    </footer>
  );
}
