import type { Metadata } from "next";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: "Admin",
  description: "Painel administrativo Bella Trama Boutique",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const formattedDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 px-8 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-semibold text-stone-900 text-[15px]">Bella Trama Boutique</h1>
            <p className="text-xs text-stone-400 capitalize">{formattedDate}</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
              <Search size={16} />
            </button>
            <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-rose-500 rounded-full" />
            </button>
            <Avatar className="h-8 w-8 ml-1">
              <AvatarFallback className="bg-gradient-to-br from-brand-rose-400 to-brand-rose-700 text-white text-xs font-bold">
                BT
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
