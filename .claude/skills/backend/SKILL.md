---
name: backend
description: Use ao trabalhar em camada de servidor do Simplifica.IA — API Routes (App Router), Server Actions, queries Prisma, modelagem de dados, validação com Zod, transações, ou modificações no schema do banco. Acionar quando o usuário pedir nova rota /api, alteração no schema.prisma, server action ou queries de DB.
---

# Backend — Simplifica.IA

Stack do servidor: **Next.js 15 App Router** + **Prisma 5** + **SQLite** (dev) / **PostgreSQL** (produção planejada).

## Ferramentas e bibliotecas (best practices)

| Ferramenta | Para que | Já instalada? |
|---|---|---|
| **Prisma 5** | ORM, migrations, type safety | ✅ |
| **Zod** | Validação de input em runtime + inferência de tipos | ⏳ Instalar via `npm i zod` |
| **next-safe-action** | Server Actions tipadas com validação Zod | ⏳ Instalar quando usar Server Actions |
| **bcryptjs** | Hash de senhas (auth) | ⏳ Instalar quando implementar auth |
| **@upstash/ratelimit** | Rate limiting em rotas públicas | ⏳ Instalar quando necessário |

## Padrão de API Route (App Router)

Sempre usar este shape com Zod:

```ts
// src/app/api/<recurso>/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateBodySchema = z.object({
  name: z.string().min(1).max(120),
  price: z.number().positive(),
  storeId: z.string().cuid(),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = CreateBodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[api/produtos] POST erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

### Convenções

- **Status codes corretos**: 201 (criado), 200 (ok), 400 (validação), 401 (não autenticado), 403 (sem permissão), 404 (não encontrado), 500 (erro interno)
- **Logar erros no servidor**, **não vazar stack trace** para o cliente
- **Validar `params` também** quando vierem da URL (`/api/loja/[slug]/orders`)
- **Nunca confiar em `storeId` vindo do body** quando houver autenticação — pegar do contexto da sessão

## Padrão de Server Action (recomendado para forms)

Para forms do admin, prefira **Server Actions** com `next-safe-action`:

```ts
// src/app/actions/products.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  category: z.string().optional(),
});

export async function createProduct(formData: FormData) {
  const parsed = CreateProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, storeId: "..." },
  });

  revalidatePath("/admin/produtos");
  return { product };
}
```

Server Actions são preferíveis a API Routes quando:
- O dado é submetido **de dentro da própria app** (form + UI)
- Você quer cache invalidation automática via `revalidatePath`/`revalidateTag`
- Não precisa expor a operação para clientes externos

## Prisma — padrões obrigatórios

### Singleton (já existe em `src/lib/prisma.ts`)
**Nunca** instanciar `new PrismaClient()` em código de aplicação.

### Transações para operações multi-tabela
```ts
const order = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: { ... } });
  await tx.orderItem.createMany({ data: items.map(i => ({ ...i, orderId: order.id })) });
  return order;
});
```

### Sempre incluir `storeId` no `where` (multi-tenancy)
```ts
// ❌ ERRADO — vaza dados entre lojas
const products = await prisma.product.findMany({ where: { active: true } });

// ✅ CERTO
const products = await prisma.product.findMany({
  where: { active: true, storeId: currentStoreId },
});
```

### Paginação com cursor (não offset) para listas grandes
```ts
const products = await prisma.product.findMany({
  where: { storeId },
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: "desc" },
});
```

### Select apenas o que precisar
```ts
prisma.product.findMany({
  select: { id: true, name: true, price: true },  // não traz description, etc.
});
```

## Modificando o schema

```powershell
# 1. Editar prisma/schema.prisma
# 2. Aplicar no banco
npm run db:push

# 3. Regenerar client TypeScript
npm run db:generate

# 4. Visualizar
npm run db:studio
```

**Atenção:**
- SQLite **não suporta enum** — usar `String` (ex: `OrderStatus`)
- SQLite **não suporta arrays nativos** — usar tabela separada ou JSON string
- Para produção, migrar para Postgres antes de adotar features SQL avançadas

## Tratamento de erros — pattern

```ts
import { Prisma } from "@prisma/client";

try {
  // operação
} catch (err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Já existe um registro com esse valor" }, { status: 409 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
  }
  console.error(err);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}
```

## Quando adicionar nova rota

1. Definir schema Zod do input antes da implementação
2. Listar status codes possíveis e suas mensagens
3. Verificar se precisa de auth/rate limit
4. Implementar handler com try/catch
5. Testar com `curl` ou via UI antes de marcar como pronto:

```powershell
curl -X POST http://localhost:3000/api/produtos `
  -H "Content-Type: application/json" `
  -d '{"name":"Teste","price":99.9,"storeId":"..."}'
```
