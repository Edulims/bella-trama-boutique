import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { CartDrawer } from "@/components/store/cart-drawer";
import { CartFab } from "@/components/store/cart-fab";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({ where: { slug } });
  return {
    title: store ? `${store.name} — Catálogo` : "Loja",
    description: store?.description,
  };
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { category: "asc" },
      },
    },
  });

  if (!store) notFound();

  const categories = Array.from(new Set(store.products.map((p) => p.category || "Outros")));
  const whatsappLink = store.whatsapp ? `https://wa.me/${store.whatsapp}` : null;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* === Hero Header === */}
      <header className="bg-gradient-to-br from-brand-rose-50 via-stone-50 to-stone-50 border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-2 ring-white shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-brand-rose-400 to-brand-rose-700 text-white font-serif text-xl">
                  BT
                </AvatarFallback>
              </Avatar>
              <div>
                <Badge
                  variant="outline"
                  className="bg-white/70 backdrop-blur-sm border-brand-rose-200 text-brand-rose-700 text-[10px] uppercase tracking-wider font-semibold mb-1.5"
                >
                  <Sparkles size={10} className="mr-1" />
                  Boutique
                </Badge>
                <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 leading-none tracking-tight">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="text-sm text-stone-500 mt-1.5 max-w-md">{store.description}</p>
                )}
              </div>
            </div>

            {whatsappLink && (
              <Link
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <MessageCircle size={15} className="text-emerald-600" />
                Falar com a loja
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* === Catalog === */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-32 space-y-12">
        {categories.map((category) => {
          const categoryProducts = store.products.filter(
            (p) => (p.category || "Outros") === category
          );
          return (
            <section key={category}>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[10px] text-brand-rose-700 uppercase tracking-[0.2em] font-semibold mb-1">
                    Coleção
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
                    {category}
                  </h2>
                </div>
                <p className="text-xs text-stone-400 hidden sm:block">
                  {categoryProducts.length} pe
                  {categoryProducts.length > 1 ? "ças" : "ça"}
                </p>
              </div>

              {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}

        {store.products.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-serif text-lg text-stone-700">Nenhum produto disponível</p>
            <p className="text-sm">Volte em breve para ver as novidades.</p>
          </div>
        )}
      </main>

      <CartFab />
      <CartDrawer storeSlug={slug} />
    </div>
  );
}
