import Link from "next/link";
import { getDict } from "@/lib/lang";

export async function SiteFooter() {
  const { t } = await getDict();
  return (
    <footer className="relative overflow-hidden border-t border-line bg-grill text-grill-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-16 sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm text-muted">{t.visit.address}</p>
          <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">
            <Link href="/menu" className="transition-colors hover:text-ketchup">
              {t.nav.menu}
            </Link>
            <Link href="/impressum" className="transition-colors hover:text-ketchup">
              {t.footer.imprint}
            </Link>
            <Link href="/datenschutz" className="transition-colors hover:text-ketchup">
              {t.footer.privacy}
            </Link>
            <Link href="/admin" className="transition-colors hover:text-ketchup">
              {t.footer.admin}
            </Link>
          </nav>
        </div>
        <p className="self-end text-xs text-muted md:text-right">{t.footer.demo}</p>
      </div>
      {/* oversized wordmark, cropped by the footer edge */}
      <p
        className="display pointer-events-none -mb-[0.18em] select-none text-center text-[clamp(6rem,24vw,22rem)] leading-[0.8] text-ketchup"
        aria-hidden="true"
      >
        Brutzel
      </p>
    </footer>
  );
}
