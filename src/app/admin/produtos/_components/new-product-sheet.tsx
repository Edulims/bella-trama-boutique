"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createProduct } from "../actions";
import {
  TOP_CATEGORIES,
  productInputSchema,
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

const initialState: FormState = {
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

/**
 * Sheet lateral direita disparado pelo botão "Novo produto" no header da
 * página de produtos.
 *
 * Estratégia:
 * - useState para o form (sem react-hook-form — não está instalado e este
 *   form tem poucos campos).
 * - useTransition para o submit, mantendo a UI responsiva durante o action.
 * - Validação client com o MESMO schema Zod do server: feedback instantâneo
 *   sem round-trip. O server revalida mesmo assim (boundary trust).
 * - fieldErrors guarda tanto erros do client quanto do server.
 */
export function NewProductSheet() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);
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

  function resetForm() {
    setForm(initialState);
    setFieldErrors({});
  }

  function handleOpenChange(next: boolean) {
    // Bloqueia fechar enquanto está salvando para evitar perda de estado.
    if (isPending && !next) return;
    setOpen(next);
    if (!next) resetForm();
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
      const result = await createProduct(parsed.data);
      if (result.ok) {
        toast.success("Produto criado", {
          description: `${parsed.data.name} adicionado ao catálogo.`,
        });
        setOpen(false);
        resetForm();
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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="bg-brand-rose-700 hover:bg-brand-rose-800 text-white border-0 shadow-sm">
          <Plus size={15} className="mr-1" />
          Novo produto
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-stone-100">
          <SheetTitle className="font-serif text-2xl text-stone-900 tracking-tight">
            Novo produto
          </SheetTitle>
          <SheetDescription className="text-sm text-stone-500">
            Adicione uma peça ao catálogo da Bella Trama. Você poderá editar
            depois.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="np-name" className={labelClass}>
                Nome <span className="text-brand-rose-600">*</span>
              </label>
              <input
                id="np-name"
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
              <label htmlFor="np-category" className={labelClass}>
                Categoria <span className="text-brand-rose-600">*</span>
              </label>
              <select
                id="np-category"
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
              <label htmlFor="np-subcategory" className={labelClass}>
                Subcategoria
              </label>
              <input
                id="np-subcategory"
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
                <label htmlFor="np-price" className={labelClass}>
                  Preço (R$) <span className="text-brand-rose-600">*</span>
                </label>
                <input
                  id="np-price"
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
                <label htmlFor="np-stock" className={labelClass}>
                  Estoque <span className="text-brand-rose-600">*</span>
                </label>
                <input
                  id="np-stock"
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
              <label htmlFor="np-image" className={labelClass}>
                URL da imagem
              </label>
              <input
                id="np-image"
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
              <label htmlFor="np-description" className={labelClass}>
                Descrição
              </label>
              <textarea
                id="np-description"
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
              htmlFor="np-active"
              className="flex items-center gap-2.5 pt-2 cursor-pointer select-none"
            >
              <input
                id="np-active"
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
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-brand-rose-700 hover:bg-brand-rose-800 text-white border-0 shadow-sm min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="mr-1.5 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus size={15} className="mr-1" />
                  Criar produto
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
