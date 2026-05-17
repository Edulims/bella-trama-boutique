---
name: frontend
description: Use ao trabalhar na camada de apresentação do Simplifica.IA — componentes React, páginas Next.js, design system, layouts responsivos, UX/UI, animações, tipografia. Acionar quando o usuário pedir nova tela, ajuste visual, novo componente, ou refatoração de UI.
---

# Frontend — Simplifica.IA

Stack: **Next.js 15 App Router** + **TypeScript** + **Tailwind CSS v3** + **Shadcn/ui** + **Lucide Icons** + **Sonner**.

## Filosofia de design

> "Premium feminino para a Bella Trama. SaaS moderno e confiável para o admin. Distintivo e ousado para componentes de IA."

Referências de mercado para mirar:
- **Linear** — densidade de informação no admin
- **Vercel/Resend** — minimalismo SaaS, tipografia
- **Stripe Dashboard** — hierarquia visual de métricas
- **Notion AI / Anthropic.com** — gradients e badges de IA
- **Aritzia / Reformation** — boutique editorial, fotos grandes, serifa

## Design tokens (tailwind.config.ts)

### Tipografia
```tsx
className="font-sans"   // Inter — body, UI, labels
className="font-serif"  // DM Serif Display — títulos, preços, headers nobres
```

Regra: **um único uso de `font-serif` por bloco visual**. Não serifar tudo.

### Paletas

| Token | Hex 700 | Uso |
|---|---|---|
| `brand-rose` | `#be123c` | CTA principal da boutique, accents femininos |
| `brand-indigo` | `#4338ca` | CTA do admin SaaS, navegação ativa |
| `ai-purple` | `#6d28d9` | Tudo relacionado a IA: badges, gradients, halos |
| `stone-50/100/200` | — | Fundos e bordas neutras (Bella Trama) |
| `zinc-50` | — | Fundo do admin |

### Gradients prontos
```tsx
className="bg-gradient-ai"          // ai-purple → fuchsia → pink (cards de IA)
className="bg-gradient-ai-soft"     // versão suave (fundos de hover)
className="bg-gradient-boutique"    // rose-300 → rose-700 (boutique)
```

### Utilities customizadas (globals.css)
- `ai-gradient-border` — borda gradient violeta-fuchsia-rosa para cards de IA
- `ai-pulse` — animação halo violeta em CTAs de IA
- `animate-shimmer` — brilho percorrendo cards premium

## Componentes Shadcn instalados

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";  // já no layout.tsx
```

Para adicionar mais:
```powershell
npx shadcn@latest add <componente> --yes
```

## Padrões de página

### Mobile-first sempre
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
```

### Estrutura de página do admin
```tsx
<div className="p-8 space-y-6 max-w-[1400px]">
  {/* Header */}
  <div className="flex items-start justify-between">
    <div>
      <h2 className="font-serif text-3xl text-stone-900 tracking-tight">Título</h2>
      <p className="text-stone-500 text-sm mt-1">Descrição curta</p>
    </div>
    <Button>Ação primária</Button>
  </div>

  {/* Conteúdo em cards */}
  <Card className="border-stone-200/80 shadow-sm">
    <CardContent>...</CardContent>
  </Card>
</div>
```

### Estrutura de página pública (boutique)
- Header hero com gradient `from-brand-rose-50 via-stone-50`
- Grid responsivo 1/2/3 colunas
- Cards de produto com `aspect-[3/4]`, título em `font-serif`, CTA `brand-rose-700`
- FAB de carrinho fixo + `<Sheet>` lateral direita

## UX patterns

### Thumb Zone (mobile)
Botões críticos sempre na parte **inferior** da tela com altura mínima `h-14` (56px) e padding generoso. Exemplo: o checkout do carrinho.

### Touch targets ≥ 44px
Botões e clicáveis devem ter pelo menos `h-11 w-11` (44×44px). Usar `size="lg"` do Button do Shadcn quando em dúvida.

### Hierarquia visual em 3 níveis
1. **Título** — `font-serif text-2xl/3xl text-stone-900`
2. **Subtítulo** — `text-sm text-stone-500`
3. **Microcópia** — `text-xs text-stone-400`

### Estados sempre cobertos
Para qualquer feature interativa: `loading`, `success`, `error`, `empty`, `disabled`. Usar Sonner para feedback transiente:

```tsx
import { toast } from "sonner";

toast.success("Salvo!", { description: "..." });
toast.error("Erro", { description: "..." });
toast.loading("Carregando...", { id: "x" });
toast.dismiss("x");
```

### Acessibilidade (WCAG AA)
- Sempre `aria-label` em botões com só ícone
- Contraste mínimo 4.5:1 (texto) e 3:1 (UI)
- `alt` significativo em imagens (não decorativas)
- `<button>` para ações, `<a>` para navegação
- Foco visível — Shadcn já cobre via `focus-visible:ring-*`

## Server vs Client Component

| Use Server Component (default) quando | Use `"use client"` quando |
|---|---|
| Apenas renderiza dados | Precisa de `useState`, `useEffect`, `useReducer` |
| Faz queries Prisma | Tem handlers de evento (`onClick`, `onChange`) |
| Não tem interatividade | Usa hooks do Sonner (`toast`) ou Context |

Regra: **client components o mais perto da folha possível**. Não envolver páginas inteiras em `"use client"`.

## Imagens

Sempre usar `next/image`:
```tsx
import Image from "next/image";

<Image
  src={url}
  alt="Descrição relevante"
  fill                              // ou width/height
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

Hosts externos permitidos (em `next.config.ts`): `images.unsplash.com`, `via.placeholder.com`. Adicionar mais via `remotePatterns`.

## Animações sutis

- **Hover em cards**: `transition-shadow hover:shadow-md` + `transition-transform group-hover:scale-105` em imagens
- **Slide in**: `animate-in slide-in-from-bottom-4 fade-in duration-300`
- **Pulse de IA**: classe `ai-pulse` (já existe)
- **Shimmer**: `animate-shimmer` (já existe)

Evitar: animações que duram mais de 400ms em interações, bouncing exagerado, parallax pesado.

## Checklist antes de declarar "pronto"

- [ ] Mobile (`375px`) renderiza bem
- [ ] Tablet (`768px`) renderiza bem
- [ ] Desktop (`1280px+`) renderiza bem
- [ ] Loading state implementado (skeleton ou spinner)
- [ ] Empty state implementado (mensagem + CTA)
- [ ] Error state implementado (toast ou inline)
- [ ] Contraste passa em texto sobre fundos coloridos
- [ ] Ícones com `aria-label` quando sozinhos
- [ ] Servidor `npm run dev` mostra a tela funcionando

## Quando criar nova tela

1. Decidir: público (boutique) ou admin? → escolhe paleta e layout base
2. Hierarquia de informação em 3 níveis (título / subtítulo / detalhes)
3. Estados: loading + success + error + empty
4. Componentes Shadcn primeiro, custom apenas se necessário
5. Mobile-first → adicionar breakpoints `sm: md: lg:`
6. Acessibilidade: `aria-*`, contraste, touch targets
