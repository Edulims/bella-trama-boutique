import Link from "next/link";
import Image from "next/image";
import { ImageOff, PackageSearch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleActiveButton } from "./_components/toggle-active-button";
import { NewProductSheet } from "./_components/new-product-sheet";
import { EditProductSheet } from "./_components/edit-product-sheet";
import { DeleteProductButton } from "./_components/delete-product-button";
import { ProductFilters } from "./_components/product-filters";
import { TOP_CATEGORIES, type TopCategory } from "./_lib/product-schema";

// Filtros chegam pela URL — `ProductFilters` (client) navega via router.push
// e o servidor re-renderiza com base nestes searchParams.
// Suportados: ?q=texto&categoria=Masculino|Feminino|Acessorios&subcategoria=...&status=ativos|inativos|todos
type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  subcategoria?: string;
  status?: string;
}>;

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

  // Buscamos TODAS as subcategorias agrupadas por categoria — o componente
  // de filtros (client) precisa saber quais subcats existem por categoria
  // para mostrar/popular o select instantaneamente quando o usuário muda
  // a categoria, sem fazer round-trip pro servidor.
  const [products, allForCounts, subcatRowsAll] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ active: "desc" }, { category: "asc" }, { subcategory: "asc" }, { createdAt: "desc" }],
    }),
    prisma.product.findMany({
      where: { storeId: store.id },
      select: { active: true },
    }),
    prisma.product.findMany({
      where: { storeId: store.id, subcategory: { not: null } },
      distinct: ["category", "subcategory"],
      select: { category: true, subcategory: true },
      orderBy: [{ category: "asc" }, { subcategory: "asc" }],
    }),
  ]);

  const subcategoriesByCategory: Record<string, string[]> = {};
  for (const row of subcatRowsAll) {
    if (row.category && row.subcategory) {
      (subcategoriesByCategory[row.category] ??= []).push(row.subcategory);
    }
  }

  return {
    products,
    total: allForCounts.length,
    activeCount: allForCounts.filter((p) => p.active).length,
    subcategoriesByCategory,
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

  const { products, total, activeCount, subcategoriesByCategory, filters } = data;
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
        <NewProductSheet />
      </div>

      {/* Filtros — Client Component para o select de Subcategoria aparecer
          instantaneamente quando o usuário muda Categoria, sem submit. */}
      <ProductFilters
        initial={filters}
        subcategoriesByCategory={subcategoriesByCategory}
      />

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

                {/* Ações do card: Editar + Toggle ativo/inativo + Excluir */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex justify-end gap-1">
                  <EditProductSheet product={product} />
                  <ToggleActiveButton
                    productId={product.id}
                    productName={product.name}
                    active={product.active}
                  />
                  <DeleteProductButton
                    productId={product.id}
                    productName={product.name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
