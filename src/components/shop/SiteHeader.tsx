import Link from "next/link";
import { LangToggle } from "@/components/LangProvider";
import { getSettings, openNow } from "@/lib/data";
import { getDict } from "@/lib/lang";
import { CartButton } from "./CartDrawer";

/** Floating glass pill; fixed so the hero clip can run underneath it. */
export async function SiteHeader() {
  const [{ t }, settings] = await Promise.all([getDict(), getSettings()]);
  const isOpen = openNow(settings.hours);
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 px-3 sm:top-4 sm:px-6">
      <div className="glass pointer-events-auto mx-auto flex h-14 max-w-5xl items-center gap-3 rounded-full pl-5 pr-2 sm:gap-4">
        <Link href="/" className="display text-[1.7rem] leading-none text-ketchup" aria-label="Brutzel">
          Brutzel
        </Link>
        <span className="hidden items-center gap-2 text-xs font-medium text-muted lg:inline-flex">
          <span className={`size-1.5 rounded-full ${isOpen ? "bg-pickle shadow-[0_0_10px] shadow-pickle" : "bg-muted"}`} aria-hidden />
          {isOpen ? t.hero.openNow : t.hero.closedNow}
        </span>
        <nav className="ml-auto hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Main">
          <Link href="/menu" className="transition-colors hover:text-ketchup">
            {t.nav.menu}
          </Link>
          <Link href="/#visit" className="transition-colors hover:text-ketchup">
            {t.nav.hours}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <Link href="/menu" className="px-1 text-sm font-medium md:hidden">
            {t.nav.menu}
          </Link>
          <LangToggle />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
