import { Asterisk } from "@phosphor-icons/react/dist/ssr";

/** Endless band of words; the track is doubled so the loop has no seam. */
export function Marquee({ words }: { words: string[] }) {
  const track = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {[...words, ...words].map((w, i) => (
        <li key={i} className="flex items-center">
          <span className="display px-6 text-[clamp(2.4rem,5vw,4.5rem)]">{w}</span>
          <Asterisk size={34} weight="bold" className="text-grill" aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden bg-ketchup py-5 text-ketchup-ink">
      <div className="marquee">
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
