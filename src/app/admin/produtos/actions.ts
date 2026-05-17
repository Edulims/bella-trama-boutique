"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type ToggleResult =
  | { ok: true; active: boolean; name: string }
  | { ok: false; error: string };

/**
 * Inverte o flag `active` de um produto. É a única mutação implementada nesta
 * iteração — criar/editar/excluir vêm nas iterações 3, 4 e 5.
 *
 * Revalida tanto `/admin/produtos` (listagem com badge de status) quanto
 * `/loja/bella-trama` (catálogo público que filtra por `active`), pois o
 * estado de visibilidade afeta as duas rotas simultaneamente.
 */
export async function toggleProductActive(
  productId: string
): Promise<ToggleResult> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, active: true, name: true },
    });

    if (!product) {
      return { ok: false, error: "Produto não encontrado" };
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { active: !product.active },
      select: { active: true, name: true },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja/bella-trama");

    return { ok: true, active: updated.active, name: updated.name };
  } catch (err) {
    console.error("[toggleProductActive] erro:", err);
    return { ok: false, error: "Falha ao atualizar produto" };
  }
}
