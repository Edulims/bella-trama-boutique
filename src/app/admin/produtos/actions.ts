"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "./_lib/product-schema";

type ToggleResult =
  | { ok: true; active: boolean; name: string }
  | { ok: false; error: string };

type CreateResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Cria um novo produto na boutique Bella Trama.
 *
 * Validação:
 * - Mesmo `productInputSchema` usado pelo client (single source of truth).
 *   O client valida para UX, o server revalida porque action é boundary
 *   pública (skill /seguranca: nunca confiar em validação client-side).
 *
 * Regras de negócio:
 * - Categoria "Acessórios" não tem subcategorias → forçamos null no DB
 *   independente do que veio do form (defesa em profundidade).
 * - `imageUrl` vazio vira null no DB; o cast trata strings vazias do form.
 *
 * Revalida `/admin/produtos` (listagem) e `/loja/bella-trama` (catálogo
 * público) porque ambos refletem o estado de produtos imediatamente.
 */
export async function createProduct(input: unknown): Promise<CreateResult> {
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const store = await prisma.store.findFirst({
      where: { slug: "bella-trama" },
      select: { id: true },
    });
    if (!store) {
      return { ok: false, error: "Loja não encontrada" };
    }

    const data = parsed.data;
    const subcategory =
      data.category === "Acessórios" ? null : data.subcategory?.trim() || null;
    const imageUrl = data.imageUrl?.trim() ? data.imageUrl.trim() : null;
    const description = data.description?.trim() ? data.description.trim() : null;

    await prisma.product.create({
      data: {
        storeId: store.id,
        name: data.name,
        description,
        price: data.price,
        imageUrl,
        category: data.category,
        subcategory,
        stock: data.stock,
        active: data.active,
      },
    });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja/bella-trama");

    return { ok: true };
  } catch (err) {
    console.error("[createProduct] erro:", err);
    return { ok: false, error: "Falha ao criar produto" };
  }
}

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
