"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, Phone, Mail, ImageOff, StickyNote } from "lucide-react";
import type { Order, OrderItem, Product, Customer } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getStatusMeta } from "../_lib/order-status";

// Shape esperado: Order + relations já hidratadas pelo Server Component.
// Mantemos o tipo amplo aqui (sem tudo Prisma-types) para o card poder
// chamar este componente sem precisar refletir o include exato.
export type OrderWithRelations = Order & {
  customer: Customer | null;
  items: (OrderItem & { product: Product })[];
};

interface OrderDetailSheetProps {
  order: OrderWithRelations;
}

/**
 * Sheet lateral com detalhes completos do pedido: cabeçalho com número/data/
 * status, cliente com link de WhatsApp, lista de itens com thumbs, notas
 * (se houver) e total destacado no rodapé.
 *
 * O número do pedido na UI é os primeiros 8 chars do cuid prefixados com `#` —
 * suficientemente único para conversa humana e mais legível que o cuid completo.
 */
export function OrderDetailSheet({ order }: OrderDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const statusMeta = getStatusMeta(order.status);
  const orderNumber = `#${order.id.slice(0, 8)}`;
  const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  // Telefone só vira link wa.me se tiver dígitos suficientes (>=10 cobre DDD+número).
  const phoneDigits = order.customer?.phone?.replace(/\D/g, "") ?? "";
  const phoneIsValid = phoneDigits.length >= 10;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Ver detalhes do pedido ${orderNumber}`}
          className="h-8 px-2.5 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100"
        >
          <Eye size={14} className="mr-1.5" />
          Ver detalhes
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="font-serif text-2xl text-stone-900 tracking-tight">
                Pedido {orderNumber}
              </SheetTitle>
              <SheetDescription className="text-sm text-stone-500 mt-0.5">
                Criado em {formatDate(order.createdAt)}
              </SheetDescription>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold border px-2.5 py-1 whitespace-nowrap",
                statusMeta.badgeClassName
              )}
            >
              {statusMeta.label}
            </Badge>
          </div>
        </SheetHeader>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Cliente */}
          <section>
            <h3 className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-2">
              Cliente
            </h3>
            {order.customer ? (
              <div className="space-y-2">
                <p className="font-serif text-lg text-stone-900 leading-tight">
                  {order.customer.name}
                </p>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-stone-400" />
                    {phoneIsValid ? (
                      <a
                        href={`https://wa.me/${phoneDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-rose-700 hover:underline"
                      >
                        {order.customer.phone}
                      </a>
                    ) : (
                      <span className="text-stone-600">{order.customer.phone}</span>
                    )}
                  </div>
                )}
                {order.customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-stone-400" />
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-stone-700 hover:underline"
                    >
                      {order.customer.email}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-400 italic">
                Cliente não identificado
              </p>
            )}
          </section>

          {/* Itens */}
          <section>
            <h3 className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-3">
              Itens ({itemsCount})
            </h3>
            <ul className="space-y-3">
              {order.items.map((item) => {
                const subtotal = item.unitPrice * item.quantity;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/50 p-2.5"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-stone-100">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                          <ImageOff size={18} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-stone-900 whitespace-nowrap">
                      {formatCurrency(subtotal)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Notas (se houver) */}
          {order.notes && (
            <section>
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-2 flex items-center gap-1.5">
                <StickyNote size={12} />
                Observações
              </h3>
              <p className="text-sm text-stone-600 bg-stone-50 border border-stone-100 rounded-lg p-3 leading-relaxed">
                {order.notes}
              </p>
            </section>
          )}
        </div>

        {/* Footer total */}
        <div className="border-t border-stone-100 px-6 py-4 bg-white">
          <div className="flex items-end justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
              Total
            </span>
            <span className="font-serif text-3xl text-brand-rose-700 tracking-tight leading-none">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
