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
  data: {
    de: "Für eine Bestellung speichern wir deinen Namen, deine Telefonnummer, bei Lieferung deine Adresse und Postleitzahl, deine Anmerkung und was du bestellt hast.",
    en: "For an order we store your name, phone number, for delivery your address and postcode, your note and what you ordered.",
  },
};
