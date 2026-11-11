export type Lang = "de" | "en";

export const CATEGORIES = ["burger", "chicken", "sides", "shakes", "drinks"] as const;
export type Category = (typeof CATEGORIES)[number];

/** Categories that can be upgraded to a combo (fries + drink). */
export const COMBO_CATEGORIES: readonly Category[] = ["burger", "chicken"];
/** Categories that accept extras (cheese, bacon...). */
export const EXTRA_CATEGORIES: readonly Category[] = ["burger"];

export type MenuItem = {
  id: number;
  slug: string;
  category: Category;
  name_de: string;
  name_en: string;
  desc_de: string;
  desc_en: string;
  price_cents: number;
  image: string | null;
  tag: "new" | "hot" | "veggie" | null;
  available: boolean;
};

export type Extra = {
  id: number;
  slug: string;
  name_de: string;
  name_en: string;
  price_cents: number;
  available: boolean;
};

export type DayHours = { day: number; open: string; close: string; closed: boolean };
export type DeliverySettings = { fee_cents: number; min_cents: number; postcodes: string[] };

export type CartLine = {
  key: string;
  itemId: number;
  qty: number;
  extras: string[];
  combo: boolean;
  comboDrink: string | null;
};

export const ORDER_STATUSES = ["new", "preparing", "ready", "out", "done", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderMode = "pickup" | "delivery";

export type OrderLineView = {
  name_de: string;
  name_en: string;
  qty: number;
  combo: boolean;
  combo_drink: string | null;
  extras: { slug: string; name_de: string; name_en: string }[];
  line_cents: number;
};

export type OrderView = {
  id: number;
  code: string;
  mode: OrderMode;
  customer_name: string;
  phone: string;
  address: string | null;
  postcode: string | null;
  note: string | null;
  status: OrderStatus;
  subtotal_cents: number;
  delivery_cents: number;
  total_cents: number;
  created_at: string;
  lines: OrderLineView[];
};
