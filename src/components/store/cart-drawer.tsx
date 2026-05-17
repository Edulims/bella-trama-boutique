"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  Trash2,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { useCart } from "./cart-context";
import { formatCurrency } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CartDrawerProps {
  storeSlug: string;
}

export function CartDrawer({ storeSlug }: CartDrawerProps) {
  const { items, isOpen, total, toggle, remove, increment, decrement, clear } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  async function handleCheckout() {
    if (!customerName.trim()) {
      toast.error("Informe seu nome para continuar");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Informe seu WhatsApp para finalizar");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/loja/${storeSlug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, customerPhone, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setWhatsappUrl(data.whatsappUrl);
      setSuccess(true);
      toast.success("Pedido registrado!", {
        description: "Clique em abrir WhatsApp para enviar à boutique.",
      });
      clear();
    } catch {
      toast.error("Erro ao enviar pedido", {
        description: "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      toggle();
      // Reset success state when closing manually
      if (success) {
        setTimeout(() => {
          setSuccess(false);
          setWhatsappUrl(null);
          setCustomerName("");
          setCustomerPhone("");
        }, 300);
      }
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-stone-50"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-stone-200 bg-white space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-rose-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-brand-rose-700" size={15} />
            </div>
            <div className="text-left">
              <SheetTitle className="font-serif text-lg text-stone-900 leading-tight">
                Meu Carrinho
              </SheetTitle>
              <SheetDescription className="text-xs text-stone-400">
                {items.length === 0
                  ? "Vazio por enquanto"
                  : `${items.reduce((s, i) => s + i.quantity, 0)} ite${
                      items.reduce((s, i) => s + i.quantity, 0) > 1 ? "ns" : "m"
                    } selecionado${
                      items.reduce((s, i) => s + i.quantity, 0) > 1 ? "s" : ""
                    }`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {success ? (
          /* Success view */
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-emerald-600" size={32} />
            </div>
            <h3 className="font-serif text-2xl text-stone-900 mb-2">Pedido Registrado!</h3>
            <p className="text-stone-500 text-sm mb-6 max-w-xs">
              Toque no botão abaixo para abrir o WhatsApp e enviar seu pedido para a Bella Trama.
            </p>
            {whatsappUrl && (
              <Button
                asChild
                size="lg"
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base rounded-2xl shadow-sm"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={20} />
                  Abrir no WhatsApp
                </a>
              </Button>
            )}
            <button
              onClick={handleClose}
              className="mt-3 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingBag className="text-stone-200 mb-3" size={56} strokeWidth={1.2} />
                  <p className="font-serif text-lg text-stone-700">Seu carrinho está vazio</p>
                  <p className="text-stone-400 text-sm mt-1">Adicione produtos para continuar</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white border border-stone-200/70 rounded-xl p-3 flex gap-3 items-start"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon size={20} className="text-stone-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base text-stone-900 leading-tight line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-brand-rose-700 text-sm font-semibold mt-1">
                        {formatCurrency(item.price)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-stone-100 rounded-full">
                          <button
                            onClick={() => decrement(item.productId)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors text-stone-600"
                            aria-label="Diminuir"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increment(item.productId)}
                            className="w-7 h-7 rounded-full flex items-center justify-center bg-brand-rose-700 text-white hover:bg-brand-rose-800 transition-colors"
                            aria-label="Aumentar"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.productId)}
                          className="ml-auto p-1.5 text-stone-300 hover:text-rose-500 transition-colors"
                          aria-label="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout (Thumb Zone) */}
            {items.length > 0 && (
              <div className="bg-white border-t border-stone-200 px-5 pt-4 pb-5 space-y-3 shadow-[0_-6px_20px_-12px_rgba(0,0,0,0.08)]">
                {/* Total */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Total
                    </p>
                    <p className="font-serif text-2xl text-stone-900 leading-none">
                      {formatCurrency(total)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-brand-rose-50 text-brand-rose-700 border-brand-rose-100 text-[10px] uppercase tracking-wider font-semibold"
                  >
                    Frete grátis
                  </Badge>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose-300 focus:border-transparent placeholder:text-stone-400"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (ex: 11999990000)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose-300 focus:border-transparent placeholder:text-stone-400"
                  />
                </div>

                {/* CTA — thumb-zone, large, easy to tap */}
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  size="lg"
                  className="w-full h-14 bg-brand-rose-700 hover:bg-brand-rose-800 text-white font-semibold text-base rounded-2xl shadow-md disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      Finalizar pelo WhatsApp
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-stone-400 text-center">
                  Você será redirecionada para o WhatsApp da boutique
                </p>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
