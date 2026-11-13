import { Quotes, Star } from "@phosphor-icons/react/dist/ssr";
import type { Lang } from "@/lib/types";

/** Sample reviews for the demo. They are labelled as samples on the page. */
const REVIEWS = [
  { name: "Leonie K.", stars: 5, de: "Die Ränder vom Brutzler sind genau so knusprig wie versprochen. Bestellt, 18 Minuten später abgeholt.", en: "The Brutzler's edges are exactly as crispy as promised. Ordered, picked up 18 minutes later." },
  { name: "Emre Y.", stars: 5, de: "Rotlicht mit extra Jalapeños. Scharf, aber nicht dumm scharf. Komme wieder.", en: "Red Light with extra jalapeños. Hot, but not stupid hot. I'll be back." },
  { name: "Aylin D.", stars: 4, de: "Gartenburger ist für Veggies endlich mal kein Notnagel. Pommes hätten heißer sein können.", en: "The garden burger is finally not an afterthought for veggies. Fries could have been hotter." },
  { name: "Jonas W.", stars: 5, de: "Der Keks-Shake ist gefährlich. Den Statusbalken beim Warten fand ich witzig.", en: "The cookie shake is dangerous. Loved watching the status bar while I waited." },
  { name: "Marek P.", stars: 5, de: "Lieferung in die Altstadt in 30 Minuten, alles noch warm. Die Tüte war sauber verschlossen.", en: "Delivered to the old town in 30 minutes, everything still warm. The bag was sealed neatly." },
  { name: "Sophie T.", stars: 4, de: "Doppeldecker ist ein Brett. Beim nächsten Mal teile ich ihn.", en: "The double decker is a monster. Next time I'm sharing it." },
  { name: "Dimitri A.", stars: 5, de: "Knusperhähnchen mit Honig-Senf ist mein neuer Freitagabend.", en: "Crispy chicken with honey mustard is my new Friday night." },
];

export function ReviewWall({ lang, title, note }: { lang: Lang; title: string; note: string }) {
  return (
    <section
      className="py-28 md:py-40"
      style={{ background: "radial-gradient(60% 50% at 85% 0%, rgb(224 65 47 / 0.12), transparent 70%), var(--paper)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-[clamp(2.6rem,5vw,4.6rem)]">{title}</h2>
          <p className="text-sm text-muted">{note}</p>
        </div>
        <ul className="mt-12 columns-1 gap-3 sm:columns-2 lg:columns-3">
          {REVIEWS.map((r) => (
            <li key={r.name} className="mb-3 break-inside-avoid rounded-[var(--radius-card)] border border-line bg-card p-6">
              <Quotes size={28} weight="fill" className="text-ketchup" aria-hidden />
              <p className="mt-3 text-lg leading-snug">{r[lang]}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="font-semibold">{r.name}</span>
                <span className="flex gap-0.5" role="img" aria-label={`${r.stars}/5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={15} weight="fill" className={i < r.stars ? "text-ketchup" : "text-line"} aria-hidden />
                  ))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
