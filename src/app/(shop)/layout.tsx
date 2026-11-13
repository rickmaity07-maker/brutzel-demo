import { ShopProvider } from "@/components/shop/ShopProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ItemSheet } from "@/components/shop/ItemSheet";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { getExtras, getMenu, getSettings } from "@/lib/data";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [menu, extras, settings] = await Promise.all([getMenu(), getExtras(), getSettings()]);
  return (
    <ShopProvider menu={menu} extras={extras} comboCents={settings.combo.price_cents} delivery={settings.delivery}>
      <SiteHeader />
      <main id="main" className="w-full max-w-full overflow-x-clip pt-24">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <ItemSheet />
    </ShopProvider>
  );
}
