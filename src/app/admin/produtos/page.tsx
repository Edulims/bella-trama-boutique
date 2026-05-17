import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  ImageOff,
  PackageSearch,
  X,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Filtros vêm via querystring para funcionar sem JS (form GET).
// Suportados: ?q=texto&categoria=Masculino|Feminino|Acessorios&subcategoria=...&status=ativos|inativos|todos
type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  subcategoria?: string;
  status?: string;
}>;

// Top-level fixo — independente do banco para garantir ordem e i18n consistentes.
const TOP_CATEGORIES = ["Masculino", "Feminino", "Acessórios"] as const;
type TopCategory = (typeof TOP_CATEGORIES)[number];

async function getData(params: {
  q?: string;
  categoria?: string;
  subcategoria?: string;
  status?: string;
}) {
  const store = await prisma.store.findFirst({ where: { slug: "bella-trama" } });
  if (!store) return null;

  // Normalização — strings vazias viram undefined; "todas"/"todos" são sentinelas de "sem filtro"
  const q = params.q?.trim() || undefined;
  const categoriaRaw = params.categoria?.trim();
  const categoria =
    categoriaRaw && TOP_CATEGORIES.includes(categoriaRaw as TopCategory)
      ? (categoriaRaw as TopCategory)
      : undefined;
  const subcategoria = params.subcategoria?.trim() || undefined;
  const status = params.status?.trim() || "todos";

  const where: {
    storeId: string;
    name?: { contains: string };
    category?: string;
    subcategory?: string;
    active?: boolean;
  } = { storeId: store.id };

  if (q) where.name = { contains: q };
  if (categoria) where.category = categoria;
  // Subcategoria só faz sentido quando há categoria E não é "Acessórios"
  if (categoria && categoria !== "Acessórios" && subcategoria && subcategoria !== "todas") {
    where.subcategory = subcategoria;
  }
  if (status === "ativos") where.active = true;
  if (status === "inativos") where.active = false;

  const subcategoriesPromise = categoria && categoria !== "Acessórios"
    ? prisma.product.findMany({
        where: { storeId: store.id, category: categoria, subcategory: { not: null } },
        distinct: ["subcategory"],
        select: { subcategory: true },
        orderBy: { subcategory: "asc" },
      })
    : Promise.resolve([] as { subcategory: string | null }[]);

  const [products, allForCounts, subcategoriesRaw] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ active: "desc" }, { category: "asc" }, { subcategory: "asc" }, { createdAt: "desc" }],
    }),
    prisma.product.findMany({
      where: { storeId: store.id },
      select: { active: true },
    }),
    subcategoriesPromise,
  ]);

  const subcategories = subcategoriesRaw
    .map((s) => s.subcategory)
    .filter((s): s is string => !!s);

  return {
    products,
    total: allForCounts.length,
    activeCount: allForCounts.filter((p) => p.active).length,
    subcategories,
    filters: {
      q: q ?? "",
      categoria: categoria ?? "todas",
      subcategoria: subcategoria ?? "todas",
      status,
    },
  };
}

function stockColor(stock: number) {
  if (stock === 0) return "text-red-600";
  if (stock <= 3) return "text-amber-600";
  return "text-stone-600";
}

const baseInputClass =
  "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-rose-400 focus:outline-none focus:ring-2 focus:ring-brand-rose-200 transition-colors";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const data = await getData(sp);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400">
        Loja não encontrada
      </div>
    );
  }

  const { products, total, activeCount, subcategories, filters } = data;
  const showSubcategoryFilter =
    filters.categoria !== "todas" && filters.categoria !== "Acessórios" && subcategories.length > 0;
  const hasActiveFilters =
    !!filters.q ||
    filters.categoria !== "todas" ||
    filters.subcategoria !== "todas" ||
    filters.status !== "todos";

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
            Produtos
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {total} produto{total === 1 ? "" : "s"} · {activeCount} ativo
            {activeCount === 1 ? "" : "s"} no catálogo
          </p>
        </div>
        {/* TODO (iteração 3): habilitar criação de produto via Sheet + Server Action */}
        <Button
          disabled
          className="bg-brand-rose-700 hover:bg-brand-rose-800 text-white border-0 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          title="Disponível em breve"
        >
          <Plus size={15} className="mr-1" />
          Novo produto
        </Button>
      </div>

      {/* Filtros — form GET para preservar acessibilidade e funcionar sem JS */}
      <Card className="border-stone-200/80 shadow-sm">
        <CardContent className="p-4">
          <form
            method="GET"
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            {/* Busca por nome */}
            <div className="md:col-span-5">
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
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Ex: Vestido midi..."
                  className={cn(baseInputClass, "pl-9")}
                />
              </div>
            </div>

            {/* Categoria principal */}
            <div className={showSubcategoryFilter ? "md:col-span-2" : "md:col-span-3"}>
              <label
                htmlFor="filter-cat"
                className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5"
              >
                Categoria
              </label>
              <select
                id="filter-cat"
                name="categoria"
                defaultValue={filters.categoria}
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

            {/* Subcategoria — só renderiza se uma categoria principal com subcategorias está selecionada */}
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
                  name="subcategoria"
                  defaultValue={filters.subcategoria}
                  className={baseInputClass}
                >
                  <option value="todas">Todas</option>
                  {subcategories.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status */}
            <div className="md:col-span-1">
              <label
                htmlFor="filter-status"
                className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5"
              >
                Status
              </label>
              <select
                id="filter-status"
                name="status"
                defaultValue={filters.status}
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
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white border-0 h-10"
              >
                <Filter size={14} className="mr-1.5" />
                Filtrar
              </Button>
              {hasActiveFilters && (
                <Button
                  asChild
                  type="button"
                  variant="ghost"
                  className="h-10 px-3 text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                  title="Limpar filtros"
                >
                  <Link href="/admin/produtos">
                    <X size={14} />
                  </Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Empty state */}
      {products.length === 0 ? (
        <Card className="border-stone-200/80 shadow-sm">
          <CardContent className="text-center py-20 px-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 mb-4">
              <PackageSearch size={26} className="text-stone-400" />
            </div>
            <p className="font-serif text-2xl text-stone-800">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
              {hasActiveFilters
                ? "Não encontramos produtos com os filtros selecionados. Tente ajustar a busca."
                : "Sua boutique ainda não tem produtos cadastrados."}
            </p>
            {hasActiveFilters && (
              <Button
                asChild
                variant="outline"
                className="mt-5 border-stone-200 text-stone-700 hover:bg-stone-50"
              >
                <Link href="/admin/produtos">Limpar filtros</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Grid de cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className={cn(
                "border-stone-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col",
                !product.active && "opacity-75"
              )}
            >
              {/* Imagem */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                {product.imageUrl ? (
                  // next/image lida com domínios permitidos em next.config.ts
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                    <ImageOff size={36} strokeWidth={1.5} />
                  </div>
                )}
                {/* Badge de status sobreposta */}
                <div className="absolute top-3 right-3">
                  {product.active ? (
                    <Badge className="bg-emerald-500/95 text-white border-0 text-[10px] font-semibold uppercase tracking-wider shadow-sm">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-stone-500/95 text-white border-0 text-[10px] font-semibold uppercase tracking-wider shadow-sm">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-5 flex flex-col flex-1">
                {/* Categoria + subcategoria (quando houver) */}
                {product.category && (
                  <Badge
                    variant="outline"
                    className="self-start mb-2 text-[10px] uppercase tracking-wider font-semibold text-stone-600 bg-stone-50 border-stone-200"
                  >
                    {product.subcategory
                      ? `${product.category} · ${product.subcategory}`
                      : product.category}
                  </Badge>
                )}

                {/* Nome */}
                <h3 className="font-sans text-base font-medium text-stone-900 leading-snug line-clamp-2">
                  {product.name}
                </h3>

                {/* Preço + estoque */}
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-end justify-between gap-3">
                  <p className="font-serif text-2xl text-stone-900 leading-none tracking-tight">
                    {formatCurrency(product.price)}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      stockColor(product.stock)
                    )}
                  >
                    {product.stock === 0
                      ? "Esgotado"
                      : `${product.stock} em estoque`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
