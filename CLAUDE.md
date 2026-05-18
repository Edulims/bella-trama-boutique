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

## Onde paramos — MVP "Demo Local Polida" COMPLETO ✅

Decisão estratégica (2026-05-17): **rodar 100% local até primeiro cliente real**. Sem custos com Vercel/Neon/OAuth/Anthropic. Pitch acontece com `npm run dev` na frente do cliente. Roteiro completo em [`DEMO.md`](DEMO.md).

### Tudo entregue

✅ Landing premium (`/`) com gradient escuro
✅ Catálogo público mobile-first (`/loja/bella-trama`) com carrinho Sheet + checkout WhatsApp
✅ Dashboard `/admin` com métricas + pedidos recentes + card destaque IA
✅ **Insights da IA** (`/admin/insights`) com cards gradient + CTAs pulsantes + Sheet de mensagem (mock convincente — IA real fica pra "v2 quando houver cliente pagando")
✅ **CRUD completo de Produtos** (`/admin/produtos`) — 5 iterações: listagem read-only → toggle ativar/desativar → criar via Sheet+Zod → editar via Sheet pré-preenchida → excluir com AlertDialog que bloqueia se houver pedidos
✅ **Pedidos** (`/admin/pedidos`) — listagem real com 4 mini-cards de status, filtros, dropdown de mudança de status no card, Sheet de detalhe
✅ **Clientes** (`/admin/clientes`) — listagem real com segmentação automática VIP/Ativo/Inativo/Novo (calculada em memória dos pedidos), 4 mini-cards de stats, busca, Sheet "Disparar WhatsApp" com templates por tier
✅ **Seed enriquecido** — 31 produtos, 10 clientes com perfis intencionais, 28 pedidos espalhados em 90 dias
✅ Agente + 4 skills em `.claude/`
✅ Scripts dev preventivos: `typecheck`, `clean`, `dev:fresh` pra recuperar quando `.next` corromper
✅ **Publicado no GitHub:** https://github.com/Edulims/bella-trama-boutique

### Pendências cosméticas (atualizar quando o usuário fornecer)
- Placeholders no README: LinkedIn, email, site do autor estão como `_(adicione seu link)_`
- Screenshots de `/loja/bella-trama` e `/admin/insights` no README (opcional, alto impacto visual)
- GitHub topics: `nextjs typescript tailwindcss prisma claude-code saas portfolio`

## Quando reativar trabalho (gatilhos comerciais)

**NÃO investir tempo nessas frentes até ter sinal claro de demanda real:**

1. **Deploy Vercel + Postgres Neon + Google OAuth** — quando recrutador ou cliente pedir uma URL pública pra acessar sozinho
2. **Claude API real nos Insights** (substitui `mockInsights`) — quando primeiro cliente pagar (custo ~$5-20/mês)
3. **Multi-tenant real** (Membership, RLS, troca de loja) — quando aparecer 2º lojista
4. **Stripe billing + onboarding self-service** — quando alguém disser "tenho cartão, quero pagar agora"
5. **Robô WhatsApp** (Twilio/Z-API) — só se virar pitch enterprise
6. **Upload de imagem** (Vercel Blob) — quando lojista real precisar (hoje aceita URL externa)
7. **Kanban DnD em /pedidos** — quando lojista pedir explicitamente (dropdown atual vende a mesma demo)
8. **Testes amplos + CI** — quando começar a ter regressões reais em produção
