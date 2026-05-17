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

type UpdateResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

type DeleteResult =
  | { ok: true }
  | { ok: false; reason: "HAS_ORDERS"; orderCount: number }
  | { ok: false; reason: "NOT_FOUND" }
  | { ok: false; reason: "UNKNOWN" };

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
 * Atualiza um produto existente da boutique Bella Trama.
 *
 * Mesmo contrato de validação/normalização do `createProduct`:
 * - `productInputSchema` (single source of truth client+server)
 * - Categoria "Acessórios" força `subcategory = null` (defesa em profundidade)
 * - Strings vazias em `description`/`imageUrl` viram `null` no DB
 *
 * Diferenças:
 * - Verifica existência do produto antes do update — `prisma.update` lançaria
 *   P2025 mas preferimos uma mensagem amigável e fluxo `{ ok: false }`.
 * - Não exige `storeId`: o id do produto já é suficiente para localizá-lo.
 *   (Em multi-tenancy real precisaria validar que o produto pertence à store
 *   do usuário autenticado — fica para a iteração de Auth.)
 */
export async function updateProduct(
  id: string,
  input: unknown
): Promise<UpdateResult> {
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, error: "Produto não encontrado" };
    }

    const data = parsed.data;
    const subcategory =
      data.category === "Acessórios" ? null : data.subcategory?.trim() || null;
    const imageUrl = data.imageUrl?.trim() ? data.imageUrl.trim() : null;
    const description = data.description?.trim() ? data.description.trim() : null;

    await prisma.product.update({
      where: { id: existing.id },
      data: {
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
    console.error("[updateProduct] erro:", err);
    return { ok: false, error: "Falha ao atualizar produto" };
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
/**
 * Exclui um produto definitivamente. Iteração 5 do CRUD.
 *
 * Decisão de design (alinhada com o usuário):
 * - Bloquear o delete se houver `OrderItem` referenciando o produto, em vez
 *   de cascatear/SetNull. O schema atual não tem onDelete configurado, então
 *   um `delete` direto estouraria FK constraint (P2003) no SQLite.
 * - Sugerir ao usuário usar "Desativar" quando há pedidos — preserva histórico
 *   sem snapshot/soft delete.
 *
 * Retorno discriminado:
 * - `HAS_ORDERS` carrega `orderCount` para a UI mostrar "está em N pedidos".
 * - `NOT_FOUND` quando o produto já foi removido (duplo clique etc).
 * - `UNKNOWN` é o fallback de qualquer falha inesperada do Prisma.
 */
export async function deleteProduct(id: string): Promise<DeleteResult> {
  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, reason: "NOT_FOUND" };
    }

    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderCount > 0) {
      return { ok: false, reason: "HAS_ORDERS", orderCount };
    }

    await prisma.product.delete({ where: { id: existing.id } });

    revalidatePath("/admin/produtos");
    revalidatePath("/loja/bella-trama");

    return { ok: true };
  } catch (err) {
    console.error("[deleteProduct] erro:", err);
    return { ok: false, reason: "UNKNOWN" };
  }
}

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
