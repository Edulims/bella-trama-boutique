import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-950 via-brand-indigo-950 to-ai-purple-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl text-center text-white">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-ai-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-ai-purple-500/30">
            <Sparkle size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <Badge
            variant="outline"
            className="bg-white/5 backdrop-blur-sm border-white/10 text-white/80 text-[10px] uppercase tracking-wider"
          >
            <Sparkles size={10} className="mr-1" />
            MVP — Portfolio
          </Badge>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl text-white mb-4 leading-none tracking-tight">
          Simplifica<span className="text-ai-purple-300">.</span>IA
        </h1>
        <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Gestão inteligente para pequenos comércios. Catálogo digital, pedidos via WhatsApp
          e <span className="text-ai-purple-300 font-medium">insights com IA</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <Button
            asChild
            size="lg"
            className="h-14 bg-brand-rose-700 hover:bg-brand-rose-800 text-white font-semibold rounded-2xl flex-1 shadow-lg shadow-brand-rose-700/30"
          >
            <Link href="/loja/bella-trama">
              <ShoppingBag size={18} />
              Ver Catálogo
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-semibold border-white/15 hover:border-white/30 rounded-2xl flex-1"
          >
            <Link href="/admin">
              <Sparkles size={18} />
              Painel Admin
            </Link>
          </Button>
        </div>

        <p className="text-xs text-white/40 mt-12">
          Cliente teste: <span className="text-white/60">Bella Trama Boutique</span>
        </p>
      </div>
    </main>
  );
}
