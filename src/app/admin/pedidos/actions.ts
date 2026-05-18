"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isOrderStatus } from "./_lib/order-status";

export type UpdateOrderResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "INVALID_STATUS" | "UNKNOWN" };

/**
 * Atualiza o status de um pedido.
 *
 * Validação:
 * - `newStatus` deve estar em `ORDER_STATUSES` — usamos `isOrderStatus` em
 *   vez de Zod porque a única regra é "pertence à união literal".
 *
 * Regras de negócio:
 * - Verificamos existência antes do update para devolver `NOT_FOUND` amigável
 *   em vez de deixar o Prisma estourar P2025.
 * - NÃO validamos a "transição" PENDING→DELIVERED etc. A constraint no
 *   `OrderStatusDropdown` é só sugestão de UX; o lojista pode corrigir um erro
 *   (ex: marcou ENTREGUE por engano e quer voltar para ENVIADO).
 *
 * Revalida `/admin/pedidos` (esta listagem) e `/admin` (dashboard mostra
 * pedidos recentes com badge de status).
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<UpdateOrderResult> {
  if (!isOrderStatus(newStatus)) {
    return { ok: false, reason: "INVALID_STATUS" };
  }

  try {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, reason: "NOT_FOUND" };
    }

    await prisma.order.update({
      where: { id: existing.id },
      data: { status: newStatus },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");

    return { ok: true };
  } catch (err) {
    console.error("[updateOrderStatus] erro:", err);
    return { ok: false, reason: "UNKNOWN" };
  }
}
