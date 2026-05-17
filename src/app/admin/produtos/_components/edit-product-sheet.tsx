"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ProductForm } from "./product-form";
import type { ProductInput, TopCategory } from "../_lib/product-schema";

interface EditProductSheetProps {
  product: Product;
}

/**
 * Wrapper do Sheet para editar um produto existente.
 *
 * Trigger é um botão ghost discreto (mesmo estilo do `ToggleActiveButton`)
 * com ícone Pencil, posicionado ao lado do toggle no rodapé do card.
 *
 * Mapeia o `Product` do Prisma → `ProductInput` parcial:
 * - Campos opcionais que vêm `null` do banco viram `""` no form (o
 *   componente faz outra rodada de coerção, mas mantemos o contrato
 *   claro aqui).
 * - `category` no banco é `string | null` mas em produção sempre será uma
 *   `TopCategory`. Fazemos cast deliberado; se vier algo inválido, o select
 *   simplesmente não terá opção marcada e o usuário será forçado a escolher.
 */
export function EditProductSheet({ product }: EditProductSheetProps) {
  const [open, setOpen] = useState(false);

  const initialValues: Partial<ProductInput> = {
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    stock: product.stock,
    category: (product.category ?? undefined) as TopCategory | undefined,
    subcategory: product.subcategory ?? "",
    imageUrl: product.imageUrl ?? "",
    active: product.active,
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Editar ${product.name}`}
          className={cn(
            "h-8 px-2.5 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100"
          )}
        >
          <Pencil size={14} className="mr-1.5" />
          Editar
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-stone-100">
          <SheetTitle className="font-serif text-2xl text-stone-900 tracking-tight">
            Editar produto
          </SheetTitle>
          <SheetDescription className="text-sm text-stone-500 line-clamp-2">
            {product.name}
          </SheetDescription>
        </SheetHeader>

        <ProductForm
          mode="edit"
          productId={product.id}
          initialValues={initialValues}
          onSuccess={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
