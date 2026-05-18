"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FILTERABLE_TIERS, getTierMeta } from "../_lib/customer-tier";

/**
 * Filtros da listagem de clientes — padrão idêntico ao `OrderFilters`.
 * URL é a fonte de verdade; o componente só espelha o estado e navega.
 *
 * O input de busca tem debounce de 300ms; o select de tier navega imediato.
 */
interface CustomerFiltersProps {
  initial: {
    q: string;
    tier: string;
  };
}

const baseInputClass =
  "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-rose-400 focus:outline-none focus:ring-2 focus:ring-brand-rose-200 transition-colors";

export function CustomerFilters({ initial }: CustomerFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initial.q);
  const [tier, setTier] = useState(initial.tier);

  // Debounce do search — `isMountedRef` evita disparar a navegação na primeira
  // renderização (que faria perder a URL inicial vinda do server).
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const handle = setTimeout(() => {
      startTransition(() => router.push(buildUrl(q, tier)));
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function buildUrl(nextQ: string, nextTier: string): string {
    const params = new URLSearchParams();
    const trimmedQ = nextQ.trim();
    if (trimmedQ) params.set("q", trimmedQ);
    if (nextTier !== "todos") params.set("tier", nextTier);
    const qs = params.toString();
    return qs ? `/admin/clientes?${qs}` : "/admin/clientes";
  }

  function handleTierChange(value: string) {
    setTier(value);
    startTransition(() => router.push(buildUrl(q, value)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl(q, tier)));
  }

  function handleClear() {
    setQ("");
    setTier("todos");
    startTransition(() => router.push("/admin/clientes"));
  }

  const hasActiveFilters = !!q.trim() || tier !== "todos";

  return (
    <Card className="border-stone-200/80 shadow-sm">
      <CardContent className="p-4">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          {/* Busca por nome */}
          <div className="md:col-span-7">
            <label
              htmlFor="filter-q"
              className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5"
            >
              Buscar por nome
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                id="filter-q"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ex: Ana, Mariana..."
                className={cn(baseInputClass, "pl-9")}
              />
            </div>
          </div>

          {/* Tier */}
          <div className="md:col-span-3">
            <label
              htmlFor="filter-tier"
              className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5"
            >
              Segmento
            </label>
            <select
              id="filter-tier"
              value={tier}
              onChange={(e) => handleTierChange(e.target.value)}
              className={baseInputClass}
            >
              <option value="todos">Todos</option>
              {FILTERABLE_TIERS.map((t) => (
                <option key={t} value={t}>
                  {getTierMeta(t).label}
                </option>
              ))}
            </select>
          </div>

          {/* Ações */}
          <div className="md:col-span-2 flex items-center gap-2">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white border-0 h-10 disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                <Filter size={14} className="mr-1.5" />
              )}
              Filtrar
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={isPending}
                className="h-10 px-3 text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                title="Limpar filtros"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
