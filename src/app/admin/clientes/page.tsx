import Link from "next/link";
import { Users, Crown, MoonStar, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerFilters } from "./_components/customer-filters";
import { CustomerCard } from "./_components/customer-card";
import {
  calculateCustomerMetrics,
  getCustomerTier,
  isCustomerTier,
  type CustomerTier,
} from "./_lib/customer-tier";

// Filtros pela URL — `CustomerFilters` (client) navega via router.push.
// Suportados: ?q=nome&tier=VIP|ATIVO|INATIVO|NOVO
type SearchParams = Promise<{
  q?: string;
  tier?: string;
}>;

async function getData(params: { q?: string; tier?: string }) {
  const store = await prisma.store.findFirst({ where: { slug: "bella-trama" } });
  if (!store) return null;

  const q = params.q?.trim() || undefined;
  const tierRaw = params.tier?.trim();
  const tierFilter =
    tierRaw && isCustomerTier(tierRaw) ? tierRaw : undefined;

  // Filtro `q` aplica direto no banco (Prisma `contains` no SQLite já é
  // case-insensitive pelo collation default). Filtro `tier` é derivado em
  // memória — não dá pra empurrar pro SQL porque depende do histórico.
  const customers = await prisma.customer.findMany({
    where: {
      storeId: store.id,
      ...(q ? { name: { contains: q } } : {}),
    },
    include: {
      orders: { select: { total: true, createdAt: true } },
    },
  });

  // Calcula métricas + tier de todos e já ordena por gasto desc — VIPs no
  // topo é a melhor narrativa de demo.
  const enriched = customers
    .map((c) => {
      const metrics = calculateCustomerMetrics(c.orders);
      const tier = getCustomerTier(metrics);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        metrics,
        tier,
      };
    })
    .sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);

  // Contagens por tier — sempre baseadas no universo COMPLETO (ignorando o
  // filtro `q` para os mini-cards mostrarem totais consistentes). Considerei
  // mostrar contagens do resultado filtrado, mas isso confunde quando o
  // usuário busca por "Ana" e o card "VIPs" muda de 3 pra 1.
  // Reconsiderar se virar feedback recorrente.
  const allEnriched = q
    ? (await prisma.customer.findMany({
        where: { storeId: store.id },
        include: { orders: { select: { total: true, createdAt: true } } },
      })).map((c) => getCustomerTier(calculateCustomerMetrics(c.orders)))
    : enriched.map((c) => c.tier);

  const counts: Record<CustomerTier, number> = {
    VIP: 0,
    ATIVO: 0,
    INATIVO: 0,
    NOVO: 0,
    SEM_PEDIDO: 0,
  };
  for (const t of allEnriched) counts[t]++;

  // Aplica filtro de tier por último, em memória.
  const visible = tierFilter
    ? enriched.filter((c) => c.tier === tierFilter)
    : enriched;

  return {
    customers: visible,
    counts,
    totalCustomers: enriched.length,
    filters: {
      q: q ?? "",
      tier: tierFilter ?? "todos",
    },
  };
}

// Mini-cards de stats no topo. Cada um filtra ao ser clicado.
const STAT_CARDS: {
  tier: CustomerTier;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    // O "Total" reusa o card visual mas navega sem filtro — tratamos como
    // caso especial no map abaixo.
    tier: "SEM_PEDIDO",
    label: "Total",
    icon: Users,
    iconBg: "bg-stone-100",
    iconColor: "text-stone-600",
  },
  {
    tier: "VIP",
    label: "VIPs",
    icon: Crown,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    tier: "INATIVO",
    label: "Inativas",
    icon: MoonStar,
    iconBg: "bg-stone-100",
    iconColor: "text-stone-500",
  },
  {
    tier: "NOVO",
    label: "Novas",
    icon: Sparkles,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

export default async function ClientesPage({
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

  const { customers, counts, totalCustomers, filters } = data;
  const hasActiveFilters = !!filters.q || filters.tier !== "todos";

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
            Clientes
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {customers.length} cliente{customers.length === 1 ? "" : "s"}
            {hasActiveFilters ? " encontrada" : " no total"}
            {customers.length === 1 || !hasActiveFilters ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Mini-cards de stats. O "Total" navega sem filtro; os demais filtram
          pelo respectivo tier. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ tier, label, icon: Icon, iconBg, iconColor }) => {
          const isTotal = label === "Total";
          const isActive = isTotal
            ? filters.tier === "todos" && !filters.q
            : filters.tier === tier;
          const href = isTotal
            ? "/admin/clientes"
            : `/admin/clientes?tier=${tier}`;
          const value = isTotal ? totalCustomers : counts[tier];

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
                isActive
                  ? "border-stone-900 ring-2 ring-stone-900/10"
                  : "border-stone-200/80"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn(iconBg, "p-2 rounded-lg")}>
                  <Icon size={16} className={iconColor} />
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-900 tracking-tight leading-none">
                {value}
              </p>
              <p className="text-xs text-stone-500 mt-1.5">{label}</p>
            </Link>
          );
        })}
      </div>

      {/* Filtros */}
      <CustomerFilters initial={filters} />

      {/* Empty state */}
      {customers.length === 0 ? (
        <Card className="border-stone-200/80 shadow-sm">
          <CardContent className="text-center py-20 px-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 mb-4">
              <Users size={26} className="text-stone-400" />
            </div>
            <p className="font-serif text-2xl text-stone-800">
              Nenhuma cliente encontrada
            </p>
            <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
              {hasActiveFilters
                ? "Não encontramos clientes com os filtros selecionados. Tente ajustar a busca."
                : "Sua boutique ainda não tem clientes cadastradas."}
            </p>
            {hasActiveFilters && (
              <Button
                asChild
                variant="outline"
                className="mt-5 border-stone-200 text-stone-700 hover:bg-stone-50"
              >
                <Link href="/admin/clientes">Limpar filtros</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Lista de cards (vertical, full-width — ordenada por gasto desc) */
        <div className="space-y-3">
          {customers.map((c) => (
            <CustomerCard
              key={c.id}
              id={c.id}
              name={c.name}
              phone={c.phone}
              email={c.email}
              tier={c.tier}
              metrics={c.metrics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
