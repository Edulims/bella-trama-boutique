// Skeleton da página /admin/produtos — exibido enquanto o Server Component
// busca dados no Prisma. Reproduz o layout: header, barra de filtros e grid de cards.
export default function Loading() {
  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="h-9 w-44 rounded-lg bg-stone-200 animate-pulse" />
          <div className="h-4 w-64 rounded bg-stone-200 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-md bg-stone-200 animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="rounded-xl border border-stone-200/80 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 space-y-1.5">
            <div className="h-3 w-24 rounded bg-stone-200 animate-pulse" />
            <div className="h-10 rounded-lg bg-stone-200 animate-pulse" />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <div className="h-3 w-20 rounded bg-stone-200 animate-pulse" />
            <div className="h-10 rounded-lg bg-stone-200 animate-pulse" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <div className="h-3 w-16 rounded bg-stone-200 animate-pulse" />
            <div className="h-10 rounded-lg bg-stone-200 animate-pulse" />
          </div>
          <div className="md:col-span-2 flex items-end">
            <div className="h-10 w-full rounded-lg bg-stone-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-stone-200/80 bg-white shadow-sm overflow-hidden"
          >
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-stone-200 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-20 rounded-full bg-stone-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-stone-200 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-stone-200 animate-pulse" />
              </div>
              <div className="pt-4 border-t border-stone-100 flex items-end justify-between">
                <div className="h-7 w-24 rounded bg-stone-200 animate-pulse" />
                <div className="h-4 w-20 rounded bg-stone-200 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
