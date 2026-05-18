// Catálogo central dos status de pedido. SQLite não suporta enum nativo, então
// `Order.status` é `String` no schema — esta constante é a fonte de verdade
// para validação no servidor e renderização na UI.
//
// `as const` garante que o tipo `OrderStatus` seja a união literal dos valores,
// não apenas `string`, permitindo exaustividade em switches/maps.
export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Metadados de cada status para a UI:
 * - `label`: tradução exibida no badge e dropdown.
 * - `badgeClassName`: classes Tailwind para colorir o badge (mantém paleta soft
 *   compatível com o tema stone do admin).
 * - `nextStatuses`: transições "naturais" do funil. É só sugestão de UX no
 *   `OrderStatusDropdown` — o servidor (`updateOrderStatus`) aceita qualquer
 *   transição válida, porque o lojista pode querer corrigir um erro (ex:
 *   marcou ENTREGUE por engano e quer voltar para ENVIADO).
 */
export interface OrderStatusMeta {
  label: string;
  badgeClassName: string;
  nextStatuses: OrderStatus[];
}

const STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  PENDING: {
    label: "Pendente",
    badgeClassName: "bg-amber-100 text-amber-800 border-amber-200",
    nextStatuses: ["CONFIRMED", "CANCELLED"],
  },
  CONFIRMED: {
    label: "Confirmado",
    badgeClassName: "bg-blue-100 text-blue-800 border-blue-200",
    nextStatuses: ["SHIPPED", "CANCELLED"],
  },
  SHIPPED: {
    label: "Enviado",
    badgeClassName: "bg-indigo-100 text-indigo-800 border-indigo-200",
    nextStatuses: ["DELIVERED"],
  },
  DELIVERED: {
    label: "Entregue",
    badgeClassName: "bg-emerald-100 text-emerald-800 border-emerald-200",
    nextStatuses: [],
  },
  CANCELLED: {
    label: "Cancelado",
    badgeClassName: "bg-rose-100 text-rose-800 border-rose-200",
    nextStatuses: [],
  },
};

export function getStatusMeta(status: string): OrderStatusMeta {
  if (isOrderStatus(status)) return STATUS_META[status];
  // Fallback defensivo: se o banco devolver algum valor estranho, mostramos
  // o próprio valor em cinza, em vez de quebrar a UI.
  return {
    label: status,
    badgeClassName: "bg-stone-100 text-stone-700 border-stone-200",
    nextStatuses: [],
  };
}

export function getStatusLabel(status: string): string {
  return getStatusMeta(status).label;
}
