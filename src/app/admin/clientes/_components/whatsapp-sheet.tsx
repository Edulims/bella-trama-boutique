"use client";

import { useState } from "react";
import { Copy, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
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
import { cn, formatDate } from "@/lib/utils";
import {
  getTierMeta,
  type CustomerTier,
} from "../_lib/customer-tier";

/**
 * Sheet de "disparo" de WhatsApp.
 *
 * Esta entrega é MOCK: o textarea começa com um template parametrizado por
 * tier + nome e o usuário pode editar antes de copiar / abrir o WhatsApp. A
 * geração via Claude API fica para a Sprint C.
 *
 * O componente é Client porque precisa de:
 *  - `useState` no textarea (editável)
 *  - `navigator.clipboard` e `window.open` para as ações do footer
 *  - controle de abertura do Sheet
 *
 * O botão de trigger é parte deste componente: o pai (CustomerCard) é Server,
 * então passar o trigger pra cá evita a fronteira `"use client"` lá em cima.
 */
interface WhatsappSheetProps {
  customerName: string;
  customerPhone: string | null;
  tier: CustomerTier;
  lastOrderAt: Date | null;
}

function getDefaultMessage(name: string, tier: CustomerTier): string {
  const firstName = name.split(" ")[0];
  switch (tier) {
    case "INATIVO":
      return `Oi ${firstName}! Sentimos sua falta na Bella Trama 💕 Acabaram de chegar peças novas que combinam com seu estilo. Que tal dar uma olhada?`;
    case "VIP":
      return `Oi ${firstName}! Como cliente VIP, queria te avisar em primeira mão: lançamos uma coleção exclusiva. Posso te mandar fotos? ✨`;
    case "NOVO":
      return `Oi ${firstName}! Foi um prazer te receber na Bella Trama 🌸 Espero que tenha amado sua compra. Qualquer dúvida, estou por aqui!`;
    case "ATIVO":
      return `Oi ${firstName}! Novidades fresquinhas chegaram na boutique. Quer ver as peças que separamos pensando em você? 💖`;
    case "SEM_PEDIDO":
      return `Oi ${firstName}! Que bom ter você por aqui. Posso te mostrar nossas novidades?`;
  }
}

export function WhatsappSheet({
  customerName,
  customerPhone,
  tier,
  lastOrderAt,
}: WhatsappSheetProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(() =>
    getDefaultMessage(customerName, tier)
  );

  const tierMeta = getTierMeta(tier);

  // Mesma regra do OrderDetailSheet: só vira link wa.me se tiver >=10 dígitos
  // (DDD + número). Telefones inválidos quebram o link silenciosamente, então
  // melhor desabilitar o botão.
  const phoneDigits = customerPhone?.replace(/\D/g, "") ?? "";
  const phoneIsValid = phoneDigits.length >= 10;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Mensagem copiada");
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  function handleSend() {
    if (!phoneIsValid) {
      toast.error("Telefone inválido");
      return;
    }
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 h-9"
        >
          <MessageCircle size={14} className="mr-1.5" />
          Disparar WhatsApp
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-stone-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="font-serif text-2xl text-stone-900 tracking-tight">
                Mensagem para {customerName}
              </SheetTitle>
              <SheetDescription className="text-sm text-stone-500 mt-0.5">
                {lastOrderAt
                  ? `Última compra em ${formatDate(lastOrderAt)}`
                  : "Sem pedidos registrados"}
              </SheetDescription>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold border px-2.5 py-1 whitespace-nowrap",
                tierMeta.badgeClassName
              )}
            >
              {tierMeta.label}
            </Badge>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label
              htmlFor="whatsapp-message"
              className="block text-[10px] uppercase tracking-wider font-semibold text-stone-500 mb-2"
            >
              Mensagem sugerida
            </label>
            <div className="relative">
              <textarea
                id="whatsapp-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-rose-400 focus:outline-none focus:ring-2 focus:ring-brand-rose-200 transition-colors leading-relaxed"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-stone-400 tabular-nums">
                {message.length} caracteres
              </span>
            </div>
            <p className="mt-2 text-xs text-stone-500 leading-relaxed">
              Template gerado a partir do segmento{" "}
              <span className="font-medium text-stone-700">
                {tierMeta.label}
              </span>
              . Você pode editar antes de enviar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 px-6 py-4 bg-white flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="flex-1 border-stone-200 text-stone-700 hover:bg-stone-50 h-10"
          >
            <Copy size={14} className="mr-1.5" />
            Copiar
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!phoneIsValid}
            className="flex-1 bg-brand-rose-700 hover:bg-brand-rose-800 text-white border-0 h-10 disabled:opacity-60"
            title={phoneIsValid ? undefined : "Telefone inválido"}
          >
            <Send size={14} className="mr-1.5" />
            Abrir WhatsApp
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
