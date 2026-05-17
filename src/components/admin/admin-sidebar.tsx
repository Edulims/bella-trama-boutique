"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Sparkles,
  Settings,
  Sparkle,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/insights",
    label: "Insights IA",
    icon: Sparkles,
    badge: "NOVO",
    accent: true,
  },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-stone-200 bg-white transition-all duration-300 ease-in-out flex-shrink-0",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-stone-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-brand-indigo-600 to-ai-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkle className="text-white" size={18} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-serif text-stone-900 text-base leading-tight tracking-tight">
              Simplifica.IA
            </p>
            <p className="text-stone-400 text-[10px] uppercase tracking-wider mt-0.5">
              Bella Trama
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge, accent }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                active
                  ? "bg-brand-indigo-50 text-brand-indigo-700"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-50",
                collapsed && "justify-center"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                size={18}
                className={cn(
                  "flex-shrink-0",
                  accent && !active && "text-ai-purple-500"
                )}
              />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1">{label}</span>
                  {badge && (
                    <Badge
                      className={cn(
                        "text-[9px] font-bold tracking-wider px-1.5 py-0",
                        accent
                          ? "bg-gradient-to-r from-ai-purple-500 to-pink-500 text-white border-0"
                          : "bg-brand-indigo-100 text-brand-indigo-700 border-0"
                      )}
                    >
                      {badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-stone-100 space-y-1">
        <Link
          href="/loja/bella-trama"
          target="_blank"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors text-xs",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Ver catálogo público" : undefined}
        >
          <ExternalLink size={14} className="flex-shrink-0" />
          {!collapsed && <span>Ver catálogo público</span>}
        </Link>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors text-xs w-full",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Configurações" : undefined}
        >
          <Settings size={14} className="flex-shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </button>

        {/* Profile + collapse toggle */}
        <div className="pt-3 mt-2 border-t border-stone-100 flex items-center gap-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-brand-rose-100 text-brand-rose-700 text-xs font-bold">
              BT
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-700 truncate">Bella Trama</p>
              <p className="text-[10px] text-stone-400 truncate">Plano Pro</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors flex-shrink-0"
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
