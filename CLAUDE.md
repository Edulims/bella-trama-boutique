# Simplifica.IA — Projeto de Portfolio

MVP de um SaaS de gestão para pequenos comércios. Cliente teste: **Bella Trama Boutique** (boutique de moda feminina).

## Comandos essenciais

```powershell
npm run dev              # Dev server em http://localhost:3000
npm run db:seed          # Repopula o banco com mocks da Bella Trama
npm run db:studio        # Abre o Prisma Studio (http://localhost:5555)
npm run db:push          # Aplica mudanças do schema ao SQLite
npm run db:generate      # Regenera o Prisma Client
npm run build            # Build de produção (não falha em type errors — `ignoreBuildErrors: true`)
```

Se a porta 3000 estiver ocupada por uma instância órfã do Next:
`Get-NetTCPConnection -LocalPort 3000 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v3**
- **Prisma v5** + **SQLite** (`prisma/dev.db`)
- **Shadcn/ui** (style: default, baseColor: stone) — `button card badge sheet avatar sonner` instalados
- **Lucide Icons**
- **Sonner** para toasts (importar `toast` de "sonner")

## Design System

| Token | Uso |
|---|---|
| `font-sans` (Inter) | Body / UI |
| `font-serif` (DM Serif Display) | Títulos nobres, preços, headers |
| `brand-rose-700` | CTA principal da boutique |
| `brand-indigo-600` | CTA principal do admin SaaS |
| `ai-purple-500` + gradients para pink | Componentes de IA (Insights) |
| `stone-50/100/200` | Fundos e bordas neutras |
| `zinc-50` | Fundo do admin |

Utilities customizadas em `src/app/globals.css`:
- `.ai-gradient-border` — borda gradient violeta→fuchsia→rosa para cards de IA
- `.ai-pulse` — animação halo violeta para CTAs sugeridos pela IA
- `.animate-shimmer` — brilho que atravessa cards premium

## Rotas implementadas

- `/` — Landing com gradient `stone-950 → indigo-950 → purple-950`
- `/loja/bella-trama` — Catálogo público mobile-first
- `/admin` — Dashboard com 4 cards de métricas + pedidos recentes + card-destaque IA
- `/admin/insights` — Insights da IA com cards de borda gradient + Sheet de mensagem WhatsApp
- `/admin/produtos` `pedidos` `clientes` — Placeholders `<ComingSoon />`
- `POST /api/loja/[slug]/orders` — Cria pedido + retorna URL do WhatsApp

## Estrutura

```
src/
├── app/
│   ├── layout.tsx            # Fontes Inter + DM Serif via next/font, <Toaster />
│   ├── page.tsx              # Landing
│   ├── globals.css           # CSS vars Shadcn + utilities .ai-*
│   ├── admin/
│   │   ├── layout.tsx        # AdminSidebar + topbar
│   │   ├── page.tsx          # Dashboard
│   │   ├── insights/         # Insights da IA (Client Component, mocks)
│   │   ├── produtos|pedidos|clientes/  # Placeholders
│   ├── loja/[slug]/
│   │   ├── layout.tsx        # <CartProvider>
│   │   └── page.tsx          # Catálogo
│   └── api/loja/[slug]/orders/route.ts
├── components/
│   ├── ui/                   # Shadcn (button, card, badge, sheet, avatar, sonner)
│   ├── admin/
│   │   ├── admin-sidebar.tsx # Sidebar escamoteável
│   │   └── coming-soon.tsx   # Placeholder de rotas pendentes
│   └── store/
│       ├── cart-context.tsx  # useReducer + Context
│       ├── cart-drawer.tsx   # <Sheet> lateral direita
│       ├── cart-fab.tsx      # FAB flutuante
│       └── product-card.tsx
├── lib/
│   ├── prisma.ts             # Singleton do Prisma Client
│   └── utils.ts              # cn() + formatCurrency() + formatDate()
└── prisma/
    ├── schema.prisma         # Store, Product, Customer, Order, OrderItem
    ├── seed.ts               # 6 produtos, 5 clientes, 6 pedidos
    └── dev.db                # SQLite local
```

## Decisões técnicas / armadilhas

- **Prisma v5** (não v7 — v7 mudou a API de datasource e quebra o schema atual)
- **Tailwind v3** (não v4 — formato de config diferente, `border-border` precisaria de adaptação)
- **SQLite não suporta enum** → `Order.status` é `String` ("PENDING" | "CONFIRMED" | ...)
- **TypeScript 6 + CSS side-effect imports**: `next.config.ts` tem `typescript.ignoreBuildErrors: true` e `eslint.ignoreDuringBuilds: true` (eslint-config-next v16 + ESLint v9 têm conflito de circular reference)
- **Seed** roda com `ts-node --compiler-options {"module":"CommonJS"}` (já está no `package.json` como `db:seed`)
- **Imagens externas**: `next.config.ts` permite `images.unsplash.com` e `via.placeholder.com`

## Agente e Skills disponíveis

O projeto tem um agente especializado e 4 skills configuradas em `.claude/`:

```
.claude/
├── agents/
│   └── simplifica-fullstack.md   # Engenheiro Fullstack Sênior do projeto
└── skills/
    ├── backend/SKILL.md          # Prisma, API Routes, Server Actions, Zod
    ├── frontend/SKILL.md         # Shadcn, Tailwind, UX/UI, tipografia, a11y
    ├── infraestrutura/SKILL.md   # Docker, Vercel, GitHub Actions, deploy
    └── seguranca/SKILL.md        # Vitest, Playwright, Auth.js, OWASP
```

### Como invocar

- **Agente fullstack** — peça "use o simplifica-fullstack para implementar X" ou eu acionarei automaticamente em tarefas multi-camada.
- **Skills** — digitar `/backend`, `/frontend`, `/infraestrutura` ou `/seguranca` (ou eu invoco automaticamente conforme o contexto da pergunta).

## Onde paramos

✅ MVP funcional completo (banco + 3 áreas: landing, catálogo, admin)
✅ Design system premium aplicado (fontes, paletas, Shadcn/ui)
✅ Carrinho com Sheet, finalização via WhatsApp funcionando
✅ Insights da IA com cards gradient + CTAs pulsantes + Sheet de mensagem com IA
✅ Placeholders para `/admin/{produtos,pedidos,clientes}`

## Próximos passos sugeridos (escolher um)

1. **CRUD real de Produtos** em `/admin/produtos`
   - Listagem com busca/filtro por categoria/status
   - Modal/Sheet de cadastro e edição (form + upload de imagem)
   - Toggle de ativar/desativar produto
   - Server Actions do Next 15

2. **Kanban de Pedidos** em `/admin/pedidos`
   - Drag-and-drop entre colunas (Pendente/Confirmado/Enviado/Entregue)
   - Detalhe lateral com Sheet
   - Histórico de mudanças de status

3. **Autenticação NextAuth** protegendo `/admin/*`
   - Login simples (Credentials + Google)
   - Middleware Next 15 para guard
   - Sessão associada à Store (multi-tenancy básico)

4. **Página de Clientes** com perfis e segmentação
   - Lista com ticket médio, última compra, status (VIP/Inativa)
   - Botão "Disparar WhatsApp" reutilizando o gerador de mensagem dos Insights

5. **Integração com OpenAI/Anthropic real** para os Insights
   - Substituir o array `mockInsights` por uma chamada de API
   - Função de geração de mensagem WhatsApp via Claude/GPT
