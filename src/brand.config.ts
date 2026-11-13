/**
 * Everything that makes this demo "Brutzel". To rebrand it for another
 * restaurant, edit this file only: name, address, colours, social handle.
 * Menu items, prices and opening hours live in the database (admin panel).
 */
export const BRAND = {
  /** wordmark in the nav, footer and admin */
  name: "Brutzel",
  /** shown in the imprint */
  legalName: "Brutzel Burger (Demo)",
  owner: "Mats Oberländer",
  street: "Brückenstraße 14",
  postcode: "50667",
  city: { de: "Köln", en: "Cologne" },
  /** delivery area, used in the hero line and the marquee */
  area: { de: "Köln-Innenstadt", en: "central Cologne" },
  /** ".example" is a reserved, never-real domain */
  email: "hallo@brutzel.example",
  phone: "0221 0000000",
  instagram: "brutzel.koeln",
  /** USt-IdNr. for the Impressum, or null if the business has none */
  vatId: null as string | null,
  /** state data protection authority for the Datenschutz page (depends on the Bundesland) */
  dataAuthority: {
    name: "Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen",
    url: "https://www.ldi.nrw.de",
  },
  /** minutes from order to pickup / delivery, for the live status estimate */
  prepMinutes: { pickup: 20, delivery: 35 },
  colors: {
    /** the one accent: buttons, wordmark, highlights. Keep at least 4.5:1 contrast with accentInk (WCAG AA). */
    accent: "#d83c2a",
    accentInk: "#ffffff",
    /** state colour: open now, ready, veggie */
    fresh: "#a3c25a",
  },
  seo: {
    title: { de: "Smash-Burger in Köln", en: "Smash burgers in Cologne" },
    description: {
      de: "Smash-Burger, Chicken und Pommes. Online bestellen zum Abholen oder Liefern in Köln-Innenstadt.",
      en: "Smash burgers, chicken and fries. Order online for pickup or delivery in central Cologne.",
    },
  },
} as const;

export const brandAddress = (lang: "de" | "en") => `${BRAND.street}, ${BRAND.postcode} ${BRAND.city[lang]}`;
