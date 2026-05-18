"use client";

import { useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateOrderStatus } from "../actions";
import {
  ORDER_STATUSES,
  getStatusMeta,
  type OrderStatus,
} from "../_lib/order-status";

interface OrderStatusDropdownProps {
  orderId: string;
  currentStatus: OrderStatus;
}

/**
 * Trigger inline no card de pedido: mostra o badge do status atual + chevron e
 * abre um menu com as próximas transições naturais em destaque + "Outros..."
 * (separador) com todos os demais status para correção de erro.
 *
 * Por que mostramos transições sugeridas no topo? UX: o fluxo PENDING →
 * CONFIRMED → SHIPPED → DELIVERED é a operação cotidiana; pular para CANCELLED
 * ou voltar atrás existe mas é exceção. Reduzir ruído ajuda o lojista a manter
 * ritmo.
 *
 * O servidor não valida transição (`updateOrderStatus` aceita qualquer status
 * válido), só impede strings fora do enum.
 */
export function OrderStatusDropdown({
  orderId,
  currentStatus,
}: OrderStatusDropdownProps) {
  const [isPending, startTransition] = useTransition();
  const currentMeta = getStatusMeta(currentStatus);

  // Sugeridos = transições naturais (sem o atual, claro).
  const suggested = currentMeta.nextStatuses;
  const suggestedSet = new Set<OrderStatus>(suggested);
  // "Outros" = todo o resto exceto o atual e os já sugeridos.
  const others = ORDER_STATUSES.filter(
    (s) => s !== currentStatus && !suggestedSet.has(s)
  );

  function changeTo(next: OrderStatus) {
    if (next === currentStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result.ok) {
        toast.success(`Status alterado para ${getStatusMeta(next).label}`);
        return;
      }
      if (result.reason === "NOT_FOUND") {
        toast.error("Pedido não encontrado", {
          description: "Talvez tenha sido removido. A página será atualizada.",
        });
        return;
      }
      if (result.reason === "INVALID_STATUS") {
        toast.error("Status inválido", {
          description: "Tente novamente ou recarregue a página.",
        });
        return;
      }
      toast.error("Erro ao atualizar status, tente novamente.");
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <button
          type="button"
          aria-label="Alterar status do pedido"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-stone-300",
            currentMeta.badgeClassName,
            isPending && "cursor-wait opacity-70"
          )}
        >
          {isPending ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <span>{currentMeta.label}</span>
              <ChevronDown size={12} className="opacity-70" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52">
        {suggested.length > 0 ? (
          <>
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
              Avançar para
            </DropdownMenuLabel>
            {suggested.map((s) => {
              const meta = getStatusMeta(s);
              return (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => changeTo(s)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold border mr-2",
                      meta.badgeClassName
                    )}
                  >
                    {meta.label}
                  </Badge>
                </DropdownMenuItem>
              );
            })}
          </>
        ) : (
          <DropdownMenuLabel className="text-[11px] font-normal text-stone-500 py-2">
            Sem próximos passos sugeridos
          </DropdownMenuLabel>
        )}

        {others.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
              Outros
            </DropdownMenuLabel>
            {others.map((s) => {
              const meta = getStatusMeta(s);
              return (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => changeTo(s)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold border mr-2",
                      meta.badgeClassName
                    )}
                  >
                    {meta.label}
                  </Badge>
                </DropdownMenuItem>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
