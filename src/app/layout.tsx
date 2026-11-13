import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist } from "next/font/google";
import { BRAND } from "@/brand.config";
import { LangProvider } from "@/components/LangProvider";
import { MotionToggle } from "@/components/MotionToggle";
import { getLang } from "@/lib/lang";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const shoulders = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: `${BRAND.name} | ${BRAND.seo.title.de}`, template: `%s | ${BRAND.name}` },
  description: BRAND.seo.description.de,
};

/** brand colours from brand.config.ts override the defaults in globals.css */
const brandVars = {
  "--ketchup": BRAND.colors.accent,
  "--ketchup-ink": BRAND.colors.accentInk,
  "--pickle": BRAND.colors.fresh,
} as React.CSSProperties;

export const viewport: Viewport = {
  themeColor: "#0f1112",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      className={`${geist.variable} ${shoulders.variable} antialiased`}
      style={brandVars}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh">
        <LangProvider lang={lang}>
          {children}
          <MotionToggle />
        </LangProvider>
      </body>
    </html>
  );
}
