"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";
import { formatCurrency } from "@/lib/utils";

export function CartFab() {
  const { count, total, toggle } = useCart();

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none flex justify-center px-4 pb-5">
      <button
        onClick={toggle}
        className="pointer-events-auto bg-brand-rose-700 hover:bg-brand-rose-800 active:scale-[0.98] text-white shadow-lg shadow-brand-rose-700/25 rounded-full pl-4 pr-5 py-3 flex items-center gap-3 transition-all animate-in slide-in-from-bottom-4 fade-in duration-300"
        aria-label="Ver carrinho"
      >
        <div className="relative">
          <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
            <ShoppingBag size={18} />
          </div>
          <span className="absolute -top-1 -right-1 bg-white text-brand-rose-700 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {count}
          </span>
        </div>
        <span className="text-sm font-semibold tracking-tight">Ver carrinho</span>
        <span className="text-sm font-bold tabular-nums">{formatCurrency(total)}</span>
      </button>
    </div>
  );
}
