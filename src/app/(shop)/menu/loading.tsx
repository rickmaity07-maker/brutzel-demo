/** Skeleton in the shape of a menu page while a route loads. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Lädt …</span>
      <div className="skeleton aspect-[4/5] rounded-[var(--radius-card)] sm:aspect-[16/9] md:aspect-[2/1]" />
      <div className="mt-8 flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="skeleton mt-12 h-14 w-48 rounded-[var(--radius-field)]" />
      <div className="mt-6 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/3] rounded-[var(--radius-card)]" />
            <div className="mt-3 flex justify-between">
              <div className="skeleton h-7 w-40 rounded-md" />
              <div className="skeleton h-7 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
