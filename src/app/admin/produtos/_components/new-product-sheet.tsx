"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductForm } from "./product-form";

/**
 * Wrapper do Sheet para criar produto.
 *
 * Toda a lógica do formulário (estado, validação, submit, fieldErrors,
 * toasts) vive em `<ProductForm>` — compartilhado com o sheet de edição.
 * Aqui ficam apenas:
 * - estado `open` do Sheet
 * - trigger no header da página
 * - cabeçalho com título e descrição
 *
 * O Sheet é bloqueado para fechar enquanto o form está submitting; como
 * o `isPending` mora dentro do `ProductForm`, o bloqueio acontece via
 * onSuccess (que só dispara quando termina) e via desabilitar o botão
 * Cancelar dentro do form. Para fechamento por overlay/ESC, o ProductForm
 * controla isso ao chamar onSuccess apenas em sucesso.
 */
export function NewProductSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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

        <ProductForm mode="create" onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
