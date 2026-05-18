import { Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  getTierMeta,
  type CustomerMetrics,
  type CustomerTier,
} from "../_lib/customer-tier";
import { WhatsappSheet } from "./whatsapp-sheet";

/**
 * Card de cliente — Server Component.
 *
 * Sem interatividade própria: as únicas partes interativas (links wa.me /
 * mailto e Sheet de WhatsApp) já são auto-suficientes. O Sheet é Client e é
 * importado como filho — Next 15 cuida da fronteira.
 */
interface CustomerCardProps {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  tier: CustomerTier;
  metrics: CustomerMetrics;
}

export function CustomerCard({
  name,
  phone,
  email,
  tier,
  metrics,
}: CustomerCardProps) {
  const tierMeta = getTierMeta(tier);
  const hasOrders = metrics.orderCount > 0;

  // Mesma validação do OrderDetailSheet: link wa.me só com >=10 dígitos.
  const phoneDigits = phone?.replace(/\D/g, "") ?? "";
  const phoneIsValid = phoneDigits.length >= 10;

  return (
    <Card className="border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {/* Linha 1: nome + tier */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl text-stone-900 leading-tight truncate">
            {name}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold border px-2 py-0.5 whitespace-nowrap flex-shrink-0",
              tierMeta.badgeClassName
            )}
          >
            {tierMeta.label}
          </Badge>
        </div>

        {/* Linha 2: contato */}
        {(phone || email) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            {phone && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Phone size={13} className="text-stone-400 flex-shrink-0" />
                {phoneIsValid ? (
                  <a
                    href={`https://wa.me/${phoneDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-rose-700 hover:underline truncate"
                  >
                    {phone}
                  </a>
                ) : (
                  <span className="text-stone-600 truncate">{phone}</span>
                )}
              </div>
            )}
            {email && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Mail size={13} className="text-stone-400 flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-stone-700 hover:underline truncate"
                >
                  {email}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Linha 3: mini-métricas */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-stone-50/80 border border-stone-100 p-3">
          <MiniMetric
            label="Pedidos"
            value={hasOrders ? String(metrics.orderCount) : "—"}
          />
          <MiniMetric
            label="Ticket médio"
            value={hasOrders ? formatCurrency(metrics.averageTicket) : "—"}
          />
          <MiniMetric
            label="Última compra"
            value={
              hasOrders && metrics.lastOrderAt
                ? formatDate(metrics.lastOrderAt)
                : "—"
            }
            sub={
              hasOrders && metrics.daysSinceLastOrder !== null
                ? metrics.daysSinceLastOrder === 0
                  ? "hoje"
                  : `há ${metrics.daysSinceLastOrder} ${
                      metrics.daysSinceLastOrder === 1 ? "dia" : "dias"
                    }`
                : undefined
            }
          />
        </div>

        {/* Footer: CTA WhatsApp */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <WhatsappSheet
            customerName={name}
            customerPhone={phone}
            tier={tier}
            lastOrderAt={metrics.lastOrderAt}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 truncate">
        {label}
      </p>
      <p className="text-sm font-semibold text-stone-900 mt-1 truncate tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-stone-500 mt-0.5 truncate">{sub}</p>
      )}
    </div>
  );
}
