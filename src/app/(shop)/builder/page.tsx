import type { Metadata } from "next";
import { BurgerBuilder } from "@/components/shop/BurgerBuilder";
import { getDict } from "@/lib/lang";

export const metadata: Metadata = { title: "Burger-Baukasten" };

export default async function BuilderPage() {
  const { t } = await getDict();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pt-12">
      <p className="eyebrow">{t.builder.eyebrow}</p>
      <h1 className="display mt-2 text-[clamp(3rem,7vw,6rem)]">{t.builder.title}</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-ink/85">{t.builder.sub}</p>
      <div className="mt-12">
        <BurgerBuilder />
      </div>
    </div>
  );
}
