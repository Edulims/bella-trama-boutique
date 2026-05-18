import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, Truck, PackageCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderFilters } from "./_components/order-filters";
import { OrderStatusDropdown } from "./_components/order-status-dropdown";
import {
  OrderDetailSheet,
  type OrderWithRelations,
} from "./_components/order-detail-sheet";
import {
  ORDER_STATUSES,
  getStatusMeta,
  isOrderStatus,
  type OrderStatus,
} from "./_lib/order-status";

// Filtros pela URL — `OrderFilters` (client) navega via router.push.
// Suportados: ?q=cliente&status=PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED
type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

async function getData(params: { q?: string; status?: string }) {
  const store = await prisma.store.findFirst({ where: { slug: "bella-trama" } });
  if (!store) return null;

  const q = params.q?.trim() || undefined;
  const statusRaw = params.status?.trim();
  const status =
    statusRaw && isOrderStatus(statusRaw) ? statusRaw : undefined;

  const where: {
    storeId: string;
    status?: string;
    customer?: { name: { contains: string } };
  } = { storeId: store.id };

  if (status) where.status = status;
  if (q) where.customer = { name: { contains: q } };

  // SQLite via Prisma já é case-insensitive por padrão no `contains` quando o
  // collation default é nocase — não precisamos passar `mode: "insensitive"`
  // (que só existe no provider postgres/mysql).

  // Janela de 30 dias para os mini-cards de status. Usar UTC base via Date()
  // está OK porque o seed também usa createdAt local; relativo basta.
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);

  const [orders, statusCountsRaw] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { storeId: store.id, createdAt: { gte: last30 } },
      _count: { status: true },
    }),
  ]);

  // Mapear groupBy → contagens por status conhecido (zera os ausentes).
  const counts: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  for (const row of statusCountsRaw) {
    if (isOrderStatus(row.status)) {
      counts[row.status] = row._count.status;
    }
  }

  return {
    orders: orders as OrderWithRelations[],
    counts,
    filters: {
      q: q ?? "",
      status: status ?? "todos",
    },
  };
}

// Configuração dos 4 mini-cards de estatística no topo. Cada um filtra a
// listagem ao ser clicado.
const STAT_CARDS: {
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    status: "PENDING",
    label: "Pendentes",
    icon: Clock,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    status: "CONFIRMED",
    label: "Confirmados",
    icon: CheckCircle2,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    status: "SHIPPED",
    label: "Enviados",
    icon: Truck,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    status: "DELIVERED",
    label: "Entregues (30d)",
    icon: PackageCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default async function PedidosPage({
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

  const { orders, counts, filters } = data;
  const hasActiveFilters = !!filters.q || filters.status !== "todos";

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
            Pedidos
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {orders.length} pedido{orders.length === 1 ? "" : "s"}
            {hasActiveFilters ? " encontrado" : " no total"}
            {orders.length === 1 || !hasActiveFilters ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Mini-cards de status (últimos 30 dias para DELIVERED, total para os
          demais — cada um navega para a listagem filtrada). */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ status, label, icon: Icon, iconBg, iconColor }) => {
          const isActive = filters.status === status;
          return (
            <Link
              key={status}
              href={`/admin/pedidos?status=${status}`}
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
                {counts[status]}
              </p>
              <p className="text-xs text-stone-500 mt-1.5">{label}</p>
            </Link>
          );
        })}
      </div>

      {/* Filtros */}
      <OrderFilters initial={filters} />

      {/* Empty state */}
      {orders.length === 0 ? (
        <Card className="border-stone-200/80 shadow-sm">
          <CardContent className="text-center py-20 px-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-100 mb-4">
              <ClipboardList size={26} className="text-stone-400" />
            </div>
            <p className="font-serif text-2xl text-stone-800">
              Nenhum pedido encontrado
            </p>
            <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
              {hasActiveFilters
                ? "Não encontramos pedidos com os filtros selecionados. Tente ajustar a busca."
                : "Sua boutique ainda não tem pedidos registrados."}
            </p>
            {hasActiveFilters && (
              <Button
                asChild
                variant="outline"
                className="mt-5 border-stone-200 text-stone-700 hover:bg-stone-50"
              >
                <Link href="/admin/pedidos">Limpar filtros</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Lista de cards de pedido (vertical, full-width) */
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = getStatusMeta(order.status);
            const orderNumber = `#${order.id.slice(0, 8)}`;
            const itemsCount = order.items.reduce(
              (sum, i) => sum + i.quantity,
              0
            );
            // Resumo dos itens: lista primeiros nomes, truncado pelo CSS.
            const itemsSummary = order.items
              .map((i) => i.product.name)
              .join(", ");
            // Cast seguro: ORDER_STATUSES é union dos 5 valores; se vier algo
            // inesperado do banco o dropdown trata como fallback no `getStatusMeta`
            // mas pra UX precisamos passar como OrderStatus.
            const currentStatus = isOrderStatus(order.status)
              ? order.status
              : ("PENDING" as OrderStatus);

            return (
              <Card
                key={order.id}
                className="border-stone-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  {/* Linha 1: badge de status + número + data */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold border px-2 py-0.5",
                        meta.badgeClassName
                      )}
                    >
                      {meta.label}
                    </Badge>
                    <span className="text-sm font-mono text-stone-500">
                      {orderNumber}
                    </span>
                    <span className="text-xs text-stone-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Linha 2: cliente + total */}
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="font-serif text-xl text-stone-900 leading-tight truncate">
                      {order.customer?.name ?? "Cliente não identificado"}
                    </p>
                    <p className="font-serif text-2xl text-brand-rose-700 leading-none whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </p>
                  </div>

                  {/* Linha 3: resumo dos itens */}
                  <p className="mt-2 text-sm text-stone-500 truncate">
                    {itemsCount} {itemsCount === 1 ? "item" : "itens"}
                    {itemsSummary && `: ${itemsSummary}`}
                  </p>

                  {/* Linha 4 (footer): dropdown de status + ver detalhes */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <OrderStatusDropdown
                      orderId={order.id}
                      currentStatus={currentStatus}
                    />
                    <OrderDetailSheet order={order} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
