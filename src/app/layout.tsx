import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist } from "next/font/google";
import { LangProvider } from "@/components/LangProvider";
import { getLang } from "@/lib/lang";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const shoulders = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: "Brutzel | Smash-Burger in Köln", template: "%s | Brutzel" },
  description: "Smash-Burger, Chicken und Pommes. Online bestellen zum Abholen oder Liefern in Köln-Innenstadt.",
};

export const viewport: Viewport = {
  themeColor: "#0f1112",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${geist.variable} ${shoulders.variable} antialiased`}>
      <body className="min-h-dvh">
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
