// Tier do cliente — derivado em memória a partir do histórico de pedidos.
//
// NÃO é persistido: calcular toda vez é barato (10 clientes no MVP, em
// produção um simples índice + paginação resolve) e evita ter que rodar job
// para reclassificar quando passa um pedido novo / a janela "inativo" rola.
//
// Precedência intencional: INATIVO > NOVO > VIP > ATIVO. Um cliente VIP que
// ficou >60 dias sem comprar precisa aparecer como INATIVO porque o ponto do
// pitch é "olha essa cliente que gastava muito e sumiu — manda WhatsApp".

export type CustomerTier = "VIP" | "ATIVO" | "INATIVO" | "NOVO" | "SEM_PEDIDO";

export type CustomerMetrics = {
  orderCount: number;
  totalSpent: number;
  averageTicket: number;
  lastOrderAt: Date | null;
  firstOrderAt: Date | null;
  daysSinceLastOrder: number | null;
};

// Limiares calibrados para o seed atual da Bella Trama. Se mudar o seed,
// re-validar olhando a distribuição (ver header do prompt da iteração).
const VIP_AVERAGE_TICKET_MIN = 500;
const INATIVO_DAYS_MIN = 60;
const NOVO_DAYS_MAX = 14;

/**
 * Calcula métricas agregadas a partir de uma lista de pedidos do cliente.
 * Aceita o shape mínimo `{ total, createdAt }` para que a query do Prisma
 * possa usar `select` enxuto (sem trazer items/notes que não vamos usar).
 *
 * Usa `Math.floor((Date.now() - t)/86400000)` em vez de comparar dias do
 * calendário porque queremos "dias completos passados", independente de fuso —
 * o seed cria pedidos com `setDate(today - n)` em horário local e o cálculo de
 * tier roda no servidor (Node), então qualquer comparação baseada em
 * `toDateString()` daria off-by-one perto da meia-noite.
 */
export function calculateCustomerMetrics(
  orders: { total: number; createdAt: Date }[]
): CustomerMetrics {
  if (orders.length === 0) {
    return {
      orderCount: 0,
      totalSpent: 0,
      averageTicket: 0,
      lastOrderAt: null,
      firstOrderAt: null,
      daysSinceLastOrder: null,
    };
  }

  let totalSpent = 0;
  let lastOrderAt = orders[0].createdAt;
  let firstOrderAt = orders[0].createdAt;
  for (const order of orders) {
    totalSpent += order.total;
    if (order.createdAt > lastOrderAt) lastOrderAt = order.createdAt;
    if (order.createdAt < firstOrderAt) firstOrderAt = order.createdAt;
  }

  const daysSinceLastOrder = Math.floor(
    (Date.now() - lastOrderAt.getTime()) / 86_400_000
  );

  return {
    orderCount: orders.length,
    totalSpent,
    averageTicket: totalSpent / orders.length,
    lastOrderAt,
    firstOrderAt,
    daysSinceLastOrder,
  };
}

export function getCustomerTier(metrics: CustomerMetrics): CustomerTier {
  if (metrics.orderCount === 0) return "SEM_PEDIDO";

  // INATIVO ganha de tudo: queremos sinalizar churn antes de qualquer outra
  // classificação. Cliente VIP que sumiu vira INATIVO de propósito.
  if (
    metrics.daysSinceLastOrder !== null &&
    metrics.daysSinceLastOrder > INATIVO_DAYS_MIN
  ) {
    return "INATIVO";
  }

  // NOVO antes de VIP: cliente que acabou de chegar e fez uma compra de R$ 600
  // é "novo cliente premium" para o pitch — queremos celebrar a chegada, não
  // já tratar como VIP recorrente.
  if (metrics.firstOrderAt) {
    const daysSinceFirstOrder = Math.floor(
      (Date.now() - metrics.firstOrderAt.getTime()) / 86_400_000
    );
    if (daysSinceFirstOrder < NOVO_DAYS_MAX) return "NOVO";
  }

  if (metrics.averageTicket >= VIP_AVERAGE_TICKET_MIN) return "VIP";

  return "ATIVO";
}

export interface CustomerTierMeta {
  label: string;
  badgeClassName: string;
  description: string;
}

const TIER_META: Record<CustomerTier, CustomerTierMeta> = {
  VIP: {
    label: "VIP",
    badgeClassName: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Ticket médio acima de R$ 500",
  },
  ATIVO: {
    label: "Ativo",
    badgeClassName: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Compra recente",
  },
  INATIVO: {
    label: "Inativo",
    badgeClassName: "bg-stone-200 text-stone-700 border-stone-300",
    description: "Sem comprar há mais de 60 dias",
  },
  NOVO: {
    label: "Novo",
    badgeClassName: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Primeira compra há menos de 14 dias",
  },
  SEM_PEDIDO: {
    label: "Sem pedido",
    badgeClassName: "bg-stone-100 text-stone-500 border-stone-200",
    description: "Cliente cadastrada, ainda sem compra",
  },
};

export function getTierMeta(tier: CustomerTier): CustomerTierMeta {
  return TIER_META[tier];
}

// Tiers expostos como filtro na UI (SEM_PEDIDO fica de fora porque o seed não
// produz nenhum, mas o renderer dos cards trata o caso normalmente).
export const FILTERABLE_TIERS: CustomerTier[] = [
  "VIP",
  "ATIVO",
  "INATIVO",
  "NOVO",
];

export function isCustomerTier(value: unknown): value is CustomerTier {
  return (
    typeof value === "string" &&
    (
      ["VIP", "ATIVO", "INATIVO", "NOVO", "SEM_PEDIDO"] as readonly string[]
    ).includes(value)
  );
}
