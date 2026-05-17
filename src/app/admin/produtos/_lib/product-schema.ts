import { z } from "zod";

/**
 * Categorias top-level fixas da boutique.
 *
 * Reutilizada pelo enum do Zod e pelos selects da UI (filtros em `page.tsx`
 * e formulário em `new-product-sheet.tsx`). Qualquer mudança aqui propaga
 * automaticamente para validação + UI.
 */
export const TOP_CATEGORIES = ["Masculino", "Feminino", "Acessórios"] as const;
export type TopCategory = (typeof TOP_CATEGORIES)[number];

/**
 * Schema único compartilhado entre validação client (form) e server (action).
 *
 * Notas:
 * - `z.coerce.number` para `price`/`stock`: inputs HTML devolvem string;
 *   coercimos antes das regras numéricas.
 * - `imageUrl`/`description`/`subcategory`: aceitam string vazia (UX "limpar
 *   campo") e são normalizadas para undefined antes de sair do schema.
 * - Regra de negócio para Acessórios (subcategoria forçada a null) é
 *   responsabilidade da Server Action, não do schema.
 *
 * Zod v4: mensagens passadas inline em cada validador. Type errors caem em
 * `error: "..."` no construtor (substitui `required_error` da v3).
 */
export const productInputSchema = z.object({
  name: z
    .string({ error: "Nome é obrigatório" })
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(120, "Nome deve ter no máximo 120 caracteres"),

  description: z
    .string()
    .trim()
    .max(600, "Descrição deve ter no máximo 600 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  price: z.coerce
    .number({ error: "Preço inválido" })
    .positive("Preço deve ser maior que zero"),

  stock: z.coerce
    .number({ error: "Estoque inválido" })
    .int("Estoque deve ser um número inteiro")
    .nonnegative("Estoque não pode ser negativo"),

  category: z.enum(TOP_CATEGORIES, { error: "Categoria é obrigatória" }),

  subcategory: z
    .string()
    .trim()
    .max(60, "Subcategoria deve ter no máximo 60 caracteres")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  imageUrl: z
    .string()
    .trim()
    .url("URL da imagem inválida")
    .or(z.literal(""))
    .optional(),

  active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productInputSchema>;
