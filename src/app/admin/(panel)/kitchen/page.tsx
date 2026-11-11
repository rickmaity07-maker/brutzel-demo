import { requireAdmin } from "@/lib/session";
import type { Metadata } from "next";
import { KitchenScreen } from "@/components/admin/KitchenScreen";
import { getActiveOrders } from "@/lib/data";

export const metadata: Metadata = { title: "Küche", robots: { index: false } };

export default async function KitchenPage() {
  await requireAdmin();
  const orders = await getActiveOrders();
  return <KitchenScreen initial={orders} />;
}
