"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Users,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  X,
  Loader2,
  ShoppingBag,
  Star,
  Wand2,
  Copy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "alert" | "opportunity" | "trend";
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  whatsappMessage?: string;
  severity: "high" | "medium" | "low";
  cta?: { label: string; pulse?: boolean };
  dismissed?: boolean;
}

const mockInsights: Insight[] = [
  {
    id: "1",
    type: "alert",
    title: "Clientes inativas em Vestidos",
    description:
      "Detectamos que 18 clientes compraram Vestidos nos últimos 6 meses, mas não realizam novas compras há mais de 60 dias. Reengajá-las pode gerar R$ 3.420 em receita estimada.",
    metric: "18",
    metricLabel: "clientes inativas",
    severity: "high",
    cta: { label: "Enviar Promoção no WhatsApp", pulse: true },
    whatsappMessage:
      "Oi, [NOME]! 👗✨ Sentimos sua falta na Bella Trama! Temos novidades incríveis em Vestidos que combinam com você. Que tal dar uma olhadinha no nosso catálogo? Aproveite: frete grátis nessa semana para clientes especiais! 💕",
  },
  {
    id: "2",
    type: "opportunity",
    title: "Alta demanda por Blusas",
    description:
      "Blusas é a categoria mais visualizada do catálogo nos últimos 7 dias (47 acessos), mas o estoque está em apenas 8 unidades. Considere reabastecer para não perder vendas.",
    metric: "47",
    metricLabel: "acessos esta semana",
    severity: "medium",
    cta: { label: "Reabastecer estoque" },
  },
  {
    id: "3",
    type: "trend",
    title: "Ticket médio crescendo",
    description:
      "O ticket médio subiu 22% em comparação ao mês passado (de R$ 189 para R$ 230). Clientes estão comprando mais itens por pedido. Considere criar combos ou kits para potencializar esse comportamento.",
    metric: "+22%",
    metricLabel: "ticket médio mensal",
    severity: "low",
    cta: { label: "Criar combo promocional" },
  },
  {
    id: "4",
    type: "alert",
    title: "Pico de pedidos nas sextas-feiras",
    description:
      "Analisamos os últimos 30 dias e 38% dos pedidos são feitos nas sextas-feiras entre 18h e 21h. Programe posts e ofertas para esse horário para maximizar conversões.",
    metric: "38%",
    metricLabel: "dos pedidos nas sextas",
    severity: "medium",
    cta: { label: "Agendar campanha sexta", pulse: true },
    whatsappMessage:
      "Oi, [NOME]! 🌟 Sexta já chegou e a Bella Trama preparou algo especial pra você! Confira nossas novas peças — perfeitas para o fim de semana. Acesse nosso catálogo e aproveite! 👇",
  },
  {
    id: "5",
    type: "opportunity",
    title: "Ana Paula é sua cliente mais valiosa",
    description:
      "Ana Paula Rodrigues realizou 3 compras no último mês, totalizando R$ 569. Clientes fiéis como ela merecem um programa de fidelidade. Um desconto exclusivo pode aumentar ainda mais a retenção.",
    metric: "R$ 569",
    metricLabel: "em compras no mês",
    severity: "low",
    cta: { label: "Enviar cupom VIP" },
    whatsappMessage:
      "Oi, Ana Paula! 💎 Você é uma das nossas clientes mais especiais! Como agradecimento, preparamos um cupom exclusivo AMIGA15 com 15% de desconto na sua próxima compra. Válido até domingo! 🎁",
  },
];

const typeConfig = {
  alert: {
    icon: AlertTriangle,
    label: "Alerta",
    color: "text-amber-700",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
  },
  opportunity: {
    icon: TrendingUp,
    label: "Oportunidade",
    color: "text-brand-indigo-700",
    bg: "bg-brand-indigo-50",
    iconBg: "bg-brand-indigo-100",
  },
  trend: {
    icon: Star,
    label: "Tendência",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
  },
};

const severityDot: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

// === Message Sheet (lateral direita) — gerar mensagem WhatsApp via IA ===
function MessageSheet({
  open,
  message,
  insightTitle,
  onClose,
}: {
  open: boolean;
  message: string | null;
  insightTitle: string;
  onClose: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message || "");

  // Reset message when sheet opens with new content
  if (message && message !== currentMessage && !generating) {
    setCurrentMessage(message);
  }

  async function handleRegenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setCurrentMessage(
      currentMessage +
        "\n\n✨ PS: aproveite, vagas limitadas para essa oferta exclusiva!"
    );
    setGenerating(false);
    toast.success("Nova versão gerada", {
      description: "A IA ajustou o tom da mensagem.",
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(currentMessage);
    toast.success("Mensagem copiada!", {
      description: "Cole no WhatsApp para enviar.",
    });
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header — gradient */}
        <SheetHeader className="bg-gradient-to-br from-ai-purple-600 via-ai-purple-500 to-pink-500 text-white p-6 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Wand2 size={16} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider">
              Mensagem Gerada por IA
            </p>
          </div>
          <SheetTitle className="font-serif text-2xl text-white leading-tight">
            {insightTitle}
          </SheetTitle>
          <SheetDescription className="text-white/80 text-sm">
            Personalize e envie pelo WhatsApp em segundos.
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-2">
              Prévia da mensagem
            </p>
            <div className="bg-emerald-50/70 border-l-2 border-emerald-400 rounded-r-lg p-4 text-sm text-stone-700 whitespace-pre-line leading-relaxed">
              {currentMessage}
            </div>
            <p className="text-xs text-stone-400 mt-3 flex items-center gap-1.5">
              <Sparkles size={12} className="text-ai-purple-500" />
              Substitua [NOME] pelo nome da cliente antes de enviar.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-white border-t border-stone-200 p-5 space-y-2.5">
          <Button
            onClick={handleRegenerate}
            disabled={generating}
            variant="outline"
            className="w-full h-12 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl"
          >
            {generating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Wand2 size={15} />
            )}
            {generating ? "Gerando..." : "Regerar com IA"}
          </Button>
          <Button
            onClick={handleCopy}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
          >
            <Copy size={15} />
            Copiar para o WhatsApp
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function InsightsPage() {
  const [insights, setInsights] = useState(mockInsights);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function dismiss(id: string) {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, dismissed: true } : i)));
    toast.info("Insight arquivado", {
      description: "Você pode encontrá-lo no histórico depois.",
    });
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    toast.loading("Analisando seus dados...", { id: "analyze" });
    await new Promise((r) => setTimeout(r, 2000));
    setAnalyzing(false);
    toast.success("Análise atualizada!", {
      id: "analyze",
      description: "Nenhum novo insight encontrado no momento.",
    });
  }

  const active = insights.filter((i) => !i.dismissed);
  const dismissed = insights.filter((i) => i.dismissed);

  return (
    <div className="p-8 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-gradient-to-br from-ai-purple-500 to-pink-500 p-1.5 rounded-lg">
              <Sparkles className="text-white" size={14} />
            </div>
            <Badge
              variant="outline"
              className="bg-ai-purple-50 text-ai-purple-700 border-ai-purple-100 text-[10px] uppercase tracking-wider font-semibold"
            >
              IA Beta
            </Badge>
          </div>
          <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
            Insights da IA
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Análises inteligentes baseadas nos dados da sua loja. Atualizado hoje.
          </p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="bg-gradient-to-r from-ai-purple-600 to-ai-purple-500 hover:from-ai-purple-700 hover:to-ai-purple-600 text-white border-0 shadow-sm"
        >
          {analyzing ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Sparkles size={15} />
          )}
          {analyzing ? "Analisando..." : "Analisar agora"}
        </Button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Alertas",
            count: active.filter((i) => i.type === "alert").length,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Oportunidades",
            count: active.filter((i) => i.type === "opportunity").length,
            icon: TrendingUp,
            color: "text-brand-indigo-600",
            bg: "bg-brand-indigo-50",
          },
          {
            label: "Tendências",
            count: active.filter((i) => i.type === "trend").length,
            icon: Star,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <Card key={label} className="border-stone-200/80 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${bg} p-2.5 rounded-xl`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 leading-none">{count}</p>
                <p className="text-xs text-stone-500 mt-1">{label} ativ{count === 1 ? "o" : "os"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insight cards */}
      <div className="space-y-4">
        {active.map((insight) => {
          const cfg = typeConfig[insight.type];
          const TypeIcon = cfg.icon;
          const isAIRecommended = !!insight.whatsappMessage;

          return (
            <div
              key={insight.id}
              className={cn(
                "rounded-2xl bg-white shadow-sm overflow-hidden relative",
                isAIRecommended ? "ai-gradient-border" : "border border-stone-200/80"
              )}
            >
              {/* Top stripe — only on AI-recommended cards */}
              {isAIRecommended && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-ai pointer-events-none rounded-t-2xl" />
              )}

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(cfg.iconBg, "p-2.5 rounded-xl flex-shrink-0")}>
                    <TypeIcon size={18} className={cfg.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", cfg.color)}>
                        {cfg.label}
                      </span>
                      <span className={cn("w-1.5 h-1.5 rounded-full", severityDot[insight.severity])} />
                      {isAIRecommended && (
                        <Badge className="bg-gradient-to-r from-ai-purple-500 to-pink-500 text-white border-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0">
                          <Sparkles size={9} className="mr-0.5" />
                          IA
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-serif text-xl text-stone-900 leading-tight mb-2">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-stone-600 leading-relaxed">{insight.description}</p>

                    {/* Metric highlight */}
                    <div className="mt-3 inline-flex items-baseline gap-2 bg-stone-50 border border-stone-100 rounded-xl px-3 py-1.5">
                      <span className="font-serif text-xl text-stone-900 leading-none tracking-tight">
                        {insight.metric}
                      </span>
                      <span className="text-xs text-stone-500">{insight.metricLabel}</span>
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => dismiss(insight.id)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors flex-shrink-0 text-stone-300 hover:text-stone-500"
                    aria-label="Dispensar"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* CTA strip */}
                {insight.cta && (
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isAIRecommended ? (
                        <Users size={14} className="text-ai-purple-500 flex-shrink-0" />
                      ) : (
                        <ShoppingBag size={14} className="text-stone-400 flex-shrink-0" />
                      )}
                      <p className="text-xs text-stone-500 truncate">
                        {isAIRecommended
                          ? "IA gera uma mensagem personalizada para você"
                          : "Ação sugerida pela IA"}
                      </p>
                    </div>

                    <Button
                      onClick={() => isAIRecommended && setSelectedInsight(insight)}
                      size="sm"
                      className={cn(
                        "rounded-full font-semibold gap-1.5",
                        isAIRecommended
                          ? "bg-gradient-to-r from-ai-purple-600 to-pink-500 hover:from-ai-purple-700 hover:to-pink-600 text-white border-0 ai-pulse"
                          : "bg-stone-900 hover:bg-stone-800 text-white",
                        insight.cta.pulse && "ai-pulse"
                      )}
                    >
                      {isAIRecommended ? (
                        <MessageCircle size={14} />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      {insight.cta.label}
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dismissed counter */}
      {dismissed.length > 0 && (
        <p className="text-xs text-stone-400 text-center pt-2">
          {dismissed.length} insight{dismissed.length > 1 ? "s" : ""} arquivado
          {dismissed.length > 1 ? "s" : ""}
        </p>
      )}

      {/* Empty state */}
      {active.length === 0 && (
        <Card className="border-stone-200/80 shadow-sm">
          <CardContent className="text-center py-16">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-serif text-xl text-stone-700">Tudo em dia!</p>
            <p className="text-sm text-stone-400 mt-1">
              Nenhum insight ativo no momento. Volte mais tarde.
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Message Sheet */}
      <MessageSheet
        open={!!selectedInsight}
        message={selectedInsight?.whatsappMessage || null}
        insightTitle={selectedInsight?.title || ""}
        onClose={() => setSelectedInsight(null)}
      />
    </div>
  );
}
