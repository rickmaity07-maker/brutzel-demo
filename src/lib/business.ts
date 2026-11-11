import type { LegalBusiness } from "@/components/shop/Legal";

/** Fictional business details for the demo (".example" is a reserved, never-real domain). */
export const BUSINESS: LegalBusiness = {
  name: "Brutzel Burger (Demo)",
  owner: "Inhaber: Mats Oberländer",
  street: "Brückenstraße 14",
  city: "50667 Köln",
  email: "hallo@brutzel.example",
  phone: "0221 0000000",
  data: {
    de: "Für eine Bestellung speichern wir deinen Namen, deine Telefonnummer, bei Lieferung deine Adresse und Postleitzahl, deine Anmerkung und was du bestellt hast.",
    en: "For an order we store your name, phone number, for delivery your address and postcode, your note and what you ordered.",
  },
};
