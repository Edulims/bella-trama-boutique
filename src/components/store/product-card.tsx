"use client";

import Image from "next/image";
import { Plus, ShoppingBag, Check, ImageIcon } from "lucide-react";
import { useCart } from "./cart-context";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  stock: number;
}

export function ProductCard({ product }: { product: Product }) {
  const { add, items } = useCart();

  const inCart = items.find((i) => i.productId === product.id);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  function handleAdd() {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  }

  return (
    <Card className="group overflow-hidden border-stone-200/70 shadow-sm hover:shadow-lg transition-all duration-300 p-0 bg-white rounded-2xl flex flex-col">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="text-stone-300" size={40} />
          </div>
        )}

        {/* Top-left category */}
        {product.category && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border-0 text-stone-700 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
          >
            {product.category}
          </Badge>
        )}

        {/* Top-right stock alert */}
        {lowStock && !outOfStock && (
          <Badge className="absolute top-3 right-3 bg-amber-500/95 text-white text-[10px] font-semibold border-0 px-2 py-0.5">
            Últimas {product.stock}
          </Badge>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <Badge className="bg-white text-stone-700 text-xs font-semibold border-0 px-3 py-1">
              Esgotado
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1 min-h-0">
          <h3 className="font-serif text-xl text-stone-900 leading-snug tracking-tight line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">A partir de</p>
            <p className="font-serif text-2xl text-stone-900 leading-none tracking-tight">
              {formatCurrency(product.price)}
            </p>
          </div>

          <Button
            onClick={handleAdd}
            disabled={outOfStock}
            size="sm"
            className={cn(
              "h-10 px-4 font-semibold transition-all rounded-full",
              outOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed hover:bg-stone-100"
                : inCart
                ? "bg-brand-rose-100 text-brand-rose-700 hover:bg-brand-rose-200"
                : "bg-brand-rose-700 text-white hover:bg-brand-rose-800 shadow-sm active:scale-95"
            )}
          >
            {inCart ? (
              <>
                <Check size={15} className="mr-1" />
                {inCart.quantity}
              </>
            ) : outOfStock ? (
              <ShoppingBag size={15} />
            ) : (
              <>
                <Plus size={15} className="mr-1" />
                Adicionar
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
