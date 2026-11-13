"use client";

import { useLang } from "@/components/LangProvider";
import { pick } from "@/lib/i18n";
import { useShop } from "./ShopProvider";

/** Opens the item sheet for a menu item by slug. Renders nothing if the item is off the menu. */
export function OpenItemButton(props: {
  slug: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
  /** name the button after the dish (for tiles whose content is only a clip) */
  namedAfterItem?: boolean;
}) {
  const { menu, openItem } = useShop();
  const { t, lang } = useLang();
  const item = menu.find((m) => m.slug === props.slug);
  if (!item) return null;
  return (
    <button
      type="button"
      onClick={() => openItem(item)}
      className={props.className ?? "btn btn-primary"}
      aria-label={props.namedAfterItem ? pick(item, "name", lang) : undefined}
    >
      {props.children ?? props.label ?? t.item.add}
    </button>
  );
}
