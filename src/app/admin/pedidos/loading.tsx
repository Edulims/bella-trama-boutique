// Skeleton da página /admin/pedidos — exibido enquanto o Server Component
// busca dados no Prisma. Reproduz o layout: header, mini-cards, filtros e
// lista vertical de cards de pedido.
export default function Loading() {
  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="h-9 w-44 rounded-lg bg-stone-200 animate-pulse" />
          <div className="h-4 w-64 rounded bg-stone-200 animate-pulse" />
        </div>
      </div>

      {/* Mini-cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-stone-200/80 bg-white shadow-sm p-4"
          >
            <div className="h-8 w-8 rounded-lg bg-stone-200 animate-pulse mb-3" />
            <div className="h-7 w-12 rounded bg-stone-200 animate-pulse" />
            <div className="h-3 w-20 rounded bg-stone-200 animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="rounded-xl border border-stone-200/80 bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 space-y-1.5">
            <div className="h-3 w-28 rounded bg-stone-200 animate-pulse" />
            <div className="h-10 rounded-lg bg-stone-200 animate-pulse" />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <div className="h-3 w-16 rounded bg-stone-200 animate-pulse" />
            <div className="h-10 rounded-lg bg-stone-200 animate-pulse" />
          </div>
          <div className="md:col-span-2 flex items-end">
            <div className="h-10 w-full rounded-lg bg-stone-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cards skeleton — lista vertical */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-stone-200/80 bg-white shadow-sm p-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-20 rounded-full bg-stone-200 animate-pulse" />
              <div className="h-4 w-24 rounded bg-stone-200 animate-pulse" />
              <div className="h-3 w-20 rounded bg-stone-200 animate-pulse" />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div className="h-6 w-44 rounded bg-stone-200 animate-pulse" />
              <div className="h-7 w-24 rounded bg-stone-200 animate-pulse" />
            </div>
            <div className="mt-2 h-4 w-3/4 rounded bg-stone-200 animate-pulse" />
            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between">
              <div className="h-7 w-28 rounded bg-stone-200 animate-pulse" />
              <div className="h-7 w-28 rounded bg-stone-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
