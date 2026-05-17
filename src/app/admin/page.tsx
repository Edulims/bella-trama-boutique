import Link from "next/link";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

async function getDashboardData() {
  const store = await prisma.store.findUnique({ where: { slug: "bella-trama" } });
  if (!store) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [todayOrders, yesterdayOrders, allOrders, totalCustomers, activeProducts, recentOrders] =
    await Promise.all([
      prisma.order.findMany({
        where: { storeId: store.id, createdAt: { gte: today } },
      }),
      prisma.order.findMany({
        where: { storeId: store.id, createdAt: { gte: yesterday, lt: today } },
      }),
      prisma.order.findMany({ where: { storeId: store.id } }),
      prisma.customer.count({ where: { storeId: store.id } }),
      prisma.product.count({ where: { storeId: store.id, active: true } }),
      prisma.order.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      }),
    ]);

  const todayRevenue = todayOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const yesterdayRevenue = yesterdayOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const totalRevenue = allOrders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = allOrders.filter((o) => o.status === "PENDING").length;

  // Calcula variação percentual em relação a ontem
  const revenueDelta =
    yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : todayRevenue > 0
      ? 100
      : 0;

  return {
    todayRevenue,
    totalRevenue,
    revenueDelta,
    todayOrderCount: todayOrders.length,
    pendingOrders,
    totalCustomers,
    activeProducts,
    recentOrders,
  };
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pendente",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-brand-indigo-50 text-brand-indigo-700 border-brand-indigo-100",
    icon: CheckCircle2,
  },
  SHIPPED: {
    label: "Enviado",
    className: "bg-violet-50 text-violet-700 border-violet-100",
    icon: Truck,
  },
  DELIVERED: {
    label: "Entregue",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-rose-50 text-rose-700 border-rose-100",
    icon: AlertCircle,
  },
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400">
        Loja não encontrada
      </div>
    );
  }

  const {
    todayRevenue,
    totalRevenue,
    revenueDelta,
    todayOrderCount,
    pendingOrders,
    totalCustomers,
    activeProducts,
    recentOrders,
  } = data;

  const deltaPositive = revenueDelta >= 0;

  const cards = [
    {
      title: "Faturamento do Dia",
      value: formatCurrency(todayRevenue),
      delta: `${deltaPositive ? "+" : ""}${revenueDelta.toFixed(1)}%`,
      deltaPositive,
      sub: `Total: ${formatCurrency(totalRevenue)}`,
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pedidos Recebidos",
      value: String(todayOrderCount),
      delta: pendingOrders > 0 ? `${pendingOrders} pendentes` : "Em dia",
      deltaPositive: pendingOrders === 0,
      sub: "nas últimas 24h",
      icon: ShoppingCart,
      iconBg: "bg-brand-indigo-50",
      iconColor: "text-brand-indigo-600",
    },
    {
      title: "Clientes Ativos",
      value: String(totalCustomers),
      delta: "+2 esta semana",
      deltaPositive: true,
      sub: "cadastrados no total",
      icon: Users,
      iconBg: "bg-brand-rose-50",
      iconColor: "text-brand-rose-700",
    },
    {
      title: "Produtos Ativos",
      value: String(activeProducts),
      delta: "100% no ar",
      deltaPositive: true,
      sub: "no catálogo digital",
      icon: Package,
      iconBg: "bg-ai-purple-50",
      iconColor: "text-ai-purple-600",
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
            Visão Geral
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Resumo do desempenho da sua loja hoje
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-ai-purple-600 to-ai-purple-500 hover:from-ai-purple-700 hover:to-ai-purple-600 text-white border-0 shadow-sm"
        >
          <Link href="/admin/insights">
            <Sparkles className="mr-1.5" size={15} />
            Ver Insights da IA
          </Link>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ title, value, delta, deltaPositive, sub, icon: Icon, iconBg, iconColor }) => (
          <Card
            key={title}
            className="border-stone-200/80 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`${iconBg} p-2.5 rounded-xl`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold border-0 px-2 ${
                    deltaPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {delta}
                </Badge>
              </div>
              <p className="text-stone-500 text-xs font-medium uppercase tracking-wider mb-1">
                {title}
              </p>
              <p className="text-2xl font-bold text-stone-900 tracking-tight">{value}</p>
              <p className="text-xs text-stone-400 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders — takes 2 columns */}
        <Card className="border-stone-200/80 shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-stone-900">
                Pedidos Recentes
              </CardTitle>
              <p className="text-xs text-stone-400 mt-0.5">
                Acompanhe os últimos pedidos da sua loja
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-stone-500 -mr-2">
              <Link href="/admin/pedidos">
                Ver todos
                <ChevronRight size={14} className="ml-0.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-100">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-12 text-center text-stone-400 text-sm">
                  Nenhum pedido ainda
                </div>
              ) : (
                recentOrders.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.PENDING;
                  const StatusIcon = cfg.icon;
                  const itemNames = order.items
                    .map((i) => `${i.quantity}x ${i.product.name}`)
                    .join(", ");
                  const customerInitials = (order.customer?.name || "C C")
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <div
                      key={order.id}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-stone-50/50 transition-colors"
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="bg-stone-100 text-stone-600 text-xs font-semibold">
                          {customerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">
                          {order.customer?.name || "Cliente anônimo"}
                        </p>
                        <p className="text-xs text-stone-400 truncate">{itemNames}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                        <p className="text-sm font-semibold text-stone-900">
                          {formatCurrency(order.total)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0 border ${cfg.className}`}
                        >
                          <StatusIcon size={10} />
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Quick Insight — column 3 */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-ai-purple-600 via-ai-purple-500 to-pink-500 text-white overflow-hidden relative">
          {/* Decorative shimmer */}
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />

          <CardContent className="p-6 relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Sparkles size={16} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider">Insight da IA</p>
            </div>

            <p className="font-serif text-xl leading-tight mb-2">
              18 clientes inativas
            </p>
            <p className="text-white/85 text-sm leading-relaxed mb-6">
              Detectamos clientes que compraram vestidos mas não voltam há 60+ dias.
              Reengaje-as e estime{" "}
              <span className="font-semibold underline decoration-white/40">
                R$ 3.420
              </span>{" "}
              em receita potencial.
            </p>

            <Button
              asChild
              className="w-full bg-white hover:bg-white/95 text-ai-purple-700 font-semibold border-0 ai-pulse"
            >
              <Link href="/admin/insights">
                Ver e agir agora
                <ArrowUpRight size={15} className="ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
