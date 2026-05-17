"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createProduct, updateProduct } from "../actions";
import {
  TOP_CATEGORIES,
  productInputSchema,
  type ProductInput,
  type TopCategory,
} from "../_lib/product-schema";

// Estado do form: tudo string (mesmo números) porque inputs HTML retornam string.
// O Zod faz coerção no parse, então não precisamos converter manualmente.
type FormState = {
  name: string;
  category: TopCategory | "";
  subcategory: string;
  price: string;
  stock: string;
  imageUrl: string;
  description: string;
  active: boolean;
};

const emptyState: FormState = {
  name: "",
  category: "",
  subcategory: "",
  price: "",
  stock: "0",
  imageUrl: "",
  description: "",
  active: true,
};

// Reutiliza os tokens visuais da barra de filtros do page.tsx para coesão.
const inputClass =
  "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-rose-400 focus:outline-none focus:ring-2 focus:ring-brand-rose-200 transition-colors disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed";

const labelClass =
  "block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-1.5";

const fieldErrorClass = "mt-1 text-xs text-red-600";

interface ProductFormProps {
  mode: "create" | "edit";
  /** Valores pré-preenchidos. Usados apenas no modo edit (mas o tipo aceita
   *  parcial para flexibilidade). Campos opcionais que vêm `undefined` ou
   *  `null` do banco devem ser mapeados para "" antes de chegar aqui — os
   *  inputs HTML precisam de string. */
  initialValues?: Partial<ProductInput>;
  /** ID do produto sendo editado. Obrigatório quando `mode === "edit"`. */
  productId?: string;
  /** Callback após sucesso — usado pelo Sheet wrapper para fechar. */
  onSuccess: () => void;
}

/**
 * Form compartilhado entre criar e editar produto.
 *
 * Encapsula:
 * - estado dos campos (useState)
 * - validação client com `productInputSchema` (Zod v4)
 * - fieldErrors (client + server)
 * - submit via Server Action (`createProduct` ou `updateProduct`)
 * - toasts de sucesso/erro com mensagem contextual por modo
 *
 * Wrappers (`new-product-sheet`, `edit-product-sheet`) cuidam apenas do
 * Sheet, trigger, header e do estado `open`. O footer (Cancelar/Salvar)
 * vive aqui porque o conteúdo do botão muda por modo e seu disabled está
 * acoplado ao `isPending` local do form.
 */
export function ProductForm({
  mode,
  initialValues,
  productId,
  onSuccess,
}: ProductFormProps) {
  // Hidrata FormState a partir de initialValues (campos opcionais string vazia
  // por padrão para o input HTML não receber undefined → React warning).
  const [form, setForm] = useState<FormState>(() => {
    if (!initialValues) return emptyState;
    return {
      name: initialValues.name ?? "",
      category: (initialValues.category as TopCategory | undefined) ?? "",
      subcategory: initialValues.subcategory ?? "",
      // Números viram string para os inputs. "0" não fica vazio.
      price:
        initialValues.price !== undefined && initialValues.price !== null
          ? String(initialValues.price)
          : "",
      stock:
        initialValues.stock !== undefined && initialValues.stock !== null
          ? String(initialValues.stock)
          : "0",
      imageUrl: initialValues.imageUrl ?? "",
      description: initialValues.description ?? "",
      active: initialValues.active ?? true,
    };
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Limpa o erro do campo assim que o usuário começa a corrigi-lo.
    if (fieldErrors[key as string]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  }

  function handleCategoryChange(value: string) {
    const cat = value as TopCategory | "";
    setForm((prev) => ({
      ...prev,
      category: cat,
      // Acessórios não tem subcategoria: limpa sempre que muda para Acessórios.
      subcategory: cat === "Acessórios" ? "" : prev.subcategory,
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.category;
      delete next.subcategory;
      return next;
    });
  }

  function handleCancel() {
    if (isPending) return;
    onSuccess();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validação client antes de chamar a action — UX premium.
    const candidate = {
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      category: form.category,
      subcategory: form.subcategory,
      imageUrl: form.imageUrl,
      active: form.active,
    };
    const parsed = productInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setFieldErrors(
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
      toast.error("Confira os campos destacados");
      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProduct(parsed.data)
          : await updateProduct(productId as string, parsed.data);

      if (result.ok) {
        if (mode === "create") {
          toast.success("Produto criado", {
            description: `${parsed.data.name} adicionado ao catálogo.`,
          });
        } else {
          toast.success("Produto atualizado", {
            description: `${parsed.data.name} salvo com sucesso.`,
          });
        }
        onSuccess();
      } else {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  const isAccessory = form.category === "Acessórios";

  function getError(field: string) {
    return fieldErrors[field]?.[0];
  }

  const submitting = isPending;
  const submitLabel =
    mode === "create"
      ? submitting
        ? "Criando..."
        : "Criar produto"
      : submitting
        ? "Salvando..."
        : "Salvar alterações";

  const SubmitIcon = submitting ? Loader2 : mode === "create" ? Plus : Save;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col flex-1 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="pf-name" className={labelClass}>
            Nome <span className="text-brand-rose-600">*</span>
          </label>
          <input
            id="pf-name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex: Vestido midi linho"
            maxLength={120}
            disabled={isPending}
            className={cn(inputClass, getError("name") && "border-red-300")}
          />
          {getError("name") && (
            <p className={fieldErrorClass}>{getError("name")}</p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <label htmlFor="pf-category" className={labelClass}>
            Categoria <span className="text-brand-rose-600">*</span>
          </label>
          <select
            id="pf-category"
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={isPending}
            className={cn(
              inputClass,
              getError("category") && "border-red-300"
            )}
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {TOP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {getError("category") && (
            <p className={fieldErrorClass}>{getError("category")}</p>
          )}
        </div>

        {/* Subcategoria */}
        <div>
          <label htmlFor="pf-subcategory" className={labelClass}>
            Subcategoria
          </label>
          <input
            id="pf-subcategory"
            type="text"
            value={form.subcategory}
            onChange={(e) => update("subcategory", e.target.value)}
            placeholder={
              isAccessory
                ? "Não aplicável a Acessórios"
                : "Ex: Camisas, Vestidos..."
            }
            maxLength={60}
            disabled={isPending || isAccessory}
            className={cn(
              inputClass,
              getError("subcategory") && "border-red-300"
            )}
          />
          {getError("subcategory") && (
            <p className={fieldErrorClass}>{getError("subcategory")}</p>
          )}
        </div>

        {/* Preço + Estoque lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pf-price" className={labelClass}>
              Preço (R$) <span className="text-brand-rose-600">*</span>
            </label>
            <input
              id="pf-price"
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="0,00"
              disabled={isPending}
              className={cn(
                inputClass,
                getError("price") && "border-red-300"
              )}
            />
            {getError("price") && (
              <p className={fieldErrorClass}>{getError("price")}</p>
            )}
          </div>
          <div>
            <label htmlFor="pf-stock" className={labelClass}>
              Estoque <span className="text-brand-rose-600">*</span>
            </label>
            <input
              id="pf-stock"
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              disabled={isPending}
              className={cn(
                inputClass,
                getError("stock") && "border-red-300"
              )}
            />
            {getError("stock") && (
              <p className={fieldErrorClass}>{getError("stock")}</p>
            )}
          </div>
        </div>

        {/* URL da imagem */}
        <div>
          <label htmlFor="pf-image" className={labelClass}>
            URL da imagem
          </label>
          <input
            id="pf-image"
            type="url"
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            disabled={isPending}
            className={cn(
              inputClass,
              getError("imageUrl") && "border-red-300"
            )}
          />
          {getError("imageUrl") && (
            <p className={fieldErrorClass}>{getError("imageUrl")}</p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="pf-description" className={labelClass}>
            Descrição
          </label>
          <textarea
            id="pf-description"
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Detalhes da peça, composição, caimento..."
            maxLength={600}
            disabled={isPending}
            className={cn(
              inputClass,
              "h-auto py-2 resize-none",
              getError("description") && "border-red-300"
            )}
          />
          {getError("description") && (
            <p className={fieldErrorClass}>{getError("description")}</p>
          )}
        </div>

        {/* Ativo */}
        <label
          htmlFor="pf-active"
          className="flex items-center gap-2.5 pt-2 cursor-pointer select-none"
        >
          <input
            id="pf-active"
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
            disabled={isPending}
            className="h-4 w-4 rounded border-stone-300 text-brand-rose-600 focus:ring-2 focus:ring-brand-rose-200 focus:ring-offset-0"
          />
          <span className="text-sm text-stone-700">
            Disponível no catálogo público
          </span>
        </label>
      </div>

      <SheetFooter className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex-row sm:justify-end sm:space-x-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isPending}
          className="text-stone-600 hover:text-stone-900 hover:bg-stone-100"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-rose-700 hover:bg-brand-rose-800 text-white border-0 shadow-sm min-w-[160px]"
        >
          <SubmitIcon
            size={15}
            className={cn("mr-1.5", submitting && "animate-spin")}
          />
          {submitLabel}
        </Button>
      </SheetFooter>
    </form>
  );
}
