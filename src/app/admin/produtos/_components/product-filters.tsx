"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TOP_CATEGORIES } from "../_lib/product-schema";

/**
 * Filtros da listagem de produtos.
 *
 * Por que Client Component: o select de Subcategoria precisa aparecer/sumir
 * imediatamente quando o usuário muda Categoria, sem esperar submit. Com form
 * GET puro a UI só atualizaria depois de clicar "Filtrar".
 *
 * Modelo: estado local controla os campos; submit converte para querystring e
 * navega via `router.push` (URL continua sendo a fonte de verdade do server).
 */
interface ProductFiltersProps {
  initial: {
    q: string;
    categoria: string;
    subcategoria: string;
    status: string;
  };
  /** Map { Masculino: ["Camisas", "Calças", ...], Feminino: [...] }. Acessórios não tem entrada. */
  subcategoriesByCategory: Record<string, string[]>;
}

const baseInputClass =
  "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-rose-400 focus:outline-none focus:ring-2 focus:ring-brand-rose-200 transition-colors";

export function ProductFilters({
  initial,
  subcategoriesByCategory,
}: ProductFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initial.q);
  const [categoria, setCategoria] = useState(initial.categoria);
  const [subcategoria, setSubcategoria] = useState(initial.subcategoria);
  const [status, setStatus] = useState(initial.status);

  const availableSubcats = subcategoriesByCategory[categoria] ?? [];
  // Subcategoria só aparece para categoria principal com subcategorias (Acessórios é geral).
  const showSubcategoryFilter =
    categoria !== "todas" && categoria !== "Acessórios" && availableSubcats.length > 0;

  const hasActiveFilters =
    !!q.trim() ||
    categoria !== "todas" ||
    subcategoria !== "todas" ||
    status !== "todos";

  function handleCategoryChange(value: string) {
    setCategoria(value);
    // Reseta subcategoria se a nova categoria não contém a anterior
    if (value === "todas" || value === "Acessórios") {
      setSubcategoria("todas");
      return;
    }
    const newSubcats = subcategoriesByCategory[value] ?? [];
    if (!newSubcats.includes(subcategoria)) {
      setSubcategoria("todas");
    }
  }

  function buildUrl(): string {
    const params = new URLSearchParams();
    const trimmedQ = q.trim();
    if (trimmedQ) params.set("q", trimmedQ);
    if (categoria !== "todas") params.set("categoria", categoria);
    if (showSubcategoryFilter && subcategoria !== "todas") {
      params.set("subcategoria", subcategoria);
    }
    if (status !== "todos") params.set("status", status);
    const qs = params.toString();
    return qs ? `/admin/produtos?${qs}` : "/admin/produtos";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(buildUrl()));
  }

  function handleClear() {
    setQ("");
    setCategoria("todas");
    setSubcategoria("todas");
    setStatus("todos");
    startTransition(() => router.push("/admin/produtos"));
  }

  // Layout dinâmico do grid: quando subcategoria aparece, redistribui colunas.
  const searchColSpan = showSubcategoryFilter ? "md:col-span-4" : "md:col-span-5";
  const categoryColSpan = showSubcategoryFilter ? "md:col-span-2" : "md:col-span-3";

  return (
    <Card className="border-stone-200/80 shadow-sm">
      <CardContent className="p-4">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          {/* Busca por nome */}
          <div className={searchColSpan}>
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
                placeholder="Ex: Vestido midi..."
                className={cn(baseInputClass, "pl-9")}
              />
            </div>
          </div>

          {/* Categoria principal */}
          <div className={categoryColSpan}>
            <label
              htmlFor="filter-cat"
              className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5"
            >
              Categoria
            </label>
            <select
              id="filter-cat"
              value={categoria}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={baseInputClass}
            >
              <option value="todas">Todas</option>
              {TOP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategoria — aparece instantaneamente ao escolher categoria */}
          {showSubcategoryFilter && (
            <div className="md:col-span-2">
              <label
                htmlFor="filter-subcat"
                className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5"
              >
                Subcategoria
              </label>
              <select
                id="filter-subcat"
                value={subcategoria}
                onChange={(e) => setSubcategoria(e.target.value)}
                className={baseInputClass}
              >
                <option value="todas">Todas</option>
                {availableSubcats.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          <div className="md:col-span-2">
            <label
              htmlFor="filter-status"
              className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5"
            >
              Status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={baseInputClass}
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
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
