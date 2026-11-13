import { BRAND } from "@/brand.config";
import type { LegalBusiness } from "@/components/shop/Legal";

/** Fictional business details for the demo (".example" is a reserved, never-real domain). */
export const BUSINESS: LegalBusiness = {
  name: BRAND.legalName,
  owner: `Inhaber: ${BRAND.owner}`,
  street: BRAND.street,
  city: `${BRAND.postcode} ${BRAND.city.de}`,
  email: BRAND.email,
  phone: BRAND.phone,
  vatId: BRAND.vatId ?? undefined,
  authority: BRAND.dataAuthority,
  retention:
    process.env.DEMO_MODE === "1"
      ? {
          de: "In dieser Demo werden Testbestellungen nach spätestens 30 Stunden automatisch gelöscht.",
          en: "In this demo, test orders are deleted automatically within 30 hours.",
        }
      : {
          de: "Bestelldaten bewahren wir so lange auf, wie es Steuer- und Handelsrecht verlangen (in der Regel bis zu zehn Jahre für Buchungsbelege), danach werden sie gelöscht.",
          en: "Order records are kept as long as tax and commercial law require (usually up to ten years for accounting records) and are then deleted.",
        },
  data: {
    de: "Für eine Bestellung speichern wir deinen Namen, deine Telefonnummer, bei Lieferung deine Adresse und Postleitzahl, deine Anmerkung und was du bestellt hast.",
    en: "For an order we store your name, phone number, for delivery your address and postcode, your note and what you ordered.",
  },
};
