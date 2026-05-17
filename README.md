<div align="center">

# Simplifica.IA

### Plataforma SaaS de gestão inteligente para pequenos comércios

Construída em **co-criação com IA** usando Claude Code (Anthropic) — uma demonstração prática do que é possível quando se combina engenharia sólida com agentes especializados.

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-default-000000?style=flat-square)](https://ui.shadcn.com)
[![Built with Claude](https://img.shields.io/badge/Built_with-Claude_Code-CC785C?style=flat-square&logo=anthropic&logoColor=white)](https://claude.com/claude-code)

</div>

---

## Visão geral

**Simplifica.IA** é uma plataforma multi-tenant que transforma pequenos comércios em negócios digitalmente competitivos. O cliente de demonstração — **Bella Trama Boutique** — é uma loja de moda feminina fictícia que usamos como vitrine completa do produto.

A proposta de valor é tripla:

| Para | Entrega |
|---|---|
| **Cliente final** | Catálogo digital mobile-first, com checkout via WhatsApp em 2 toques |
| **Lojista** | Painel SaaS premium com métricas em tempo real, gestão de produtos, pedidos e clientes |
| **Negócio** | **Insights gerados por IA** — alertas de clientes inativos, oportunidades de venda, mensagens personalizadas prontas para envio |

---

## Demonstração rápida

Após `npm run dev`, acesse:

| Rota | O que tem |
|---|---|
| [`/`](http://localhost:3000) | Landing page com gradient premium e dois CTAs |
| [`/loja/bella-trama`](http://localhost:3000/loja/bella-trama) | Catálogo público da boutique — mobile-first, carrinho com Sheet lateral, checkout direto no WhatsApp |
| [`/admin`](http://localhost:3000/admin) | Dashboard SaaS com KPIs do dia, pedidos recentes, card destaque de IA |
| [`/admin/insights`](http://localhost:3000/admin/insights) | A "joia da coroa" — Insights da IA com cards de borda gradiente, CTAs pulsantes, e geração de mensagens WhatsApp |
| [`/admin/produtos`](http://localhost:3000/admin/produtos), `/pedidos`, `/clientes` | Páginas placeholder elegantes com roadmap das features |

---

## Stack técnica

### Frontend
- **Next.js 15** com App Router (Server + Client Components)
- **TypeScript 6** em modo strict
- **Tailwind CSS 3** com design tokens customizados
- **shadcn/ui** (Button, Card, Badge, Sheet, Avatar, Sonner)
- **Lucide Icons** + **Sonner** (toasts)
- Fontes via `next/font`: **Inter** (sans) + **DM Serif Display** (serif)

### Backend
- **Next.js API Routes** (App Router)
- **Prisma 5** ORM
- **SQLite** local — preparado para migração transparente para **PostgreSQL** (Neon/Supabase)
- Modelagem multi-tenant: `Store`, `Product`, `Customer`, `Order`, `OrderItem`

### Design System

```
brand-rose       (#be123c)   →  Boutique (CTA principal da loja)
brand-indigo     (#4338ca)   →  SaaS Admin (CTAs do painel)
ai-purple        (#6d28d9)   →  Componentes de IA (gradients, halos pulsantes)
stone-50/100     (neutros)   →  Fundos da boutique
zinc-50          (neutro)    →  Fundo do admin
```

Tipografia hierárquica:
- **DM Serif Display** — títulos, preços, headers nobres (uma "respirada" editorial)
- **Inter** — body, UI, labels (legibilidade máxima)

---

## Desenvolvido com IA — o lado "Vibe Coding" do projeto

Este projeto não é apenas **sobre IA** (Insights Inteligentes para o lojista) — ele também foi **construído com IA** do começo ao fim, usando **[Claude Code](https://claude.com/claude-code)** da Anthropic.

A metodologia adotada:

### 1. Conversa estruturada como motor de produção
Cada feature foi negociada em linguagem natural com o agente, sempre com:
- **Trade-offs explícitos** (Server Component vs Client, API Route vs Server Action, SQLite vs Postgres)
- **Decisões versionadas em texto** (`CLAUDE.md`) para não perder contexto entre sessões

### 2. Agentes especializados como times virtuais
O projeto inclui um **agente fullstack** (`simplifica-fullstack`) e **4 skills** invocáveis, configurados em `.claude/`:

```
.claude/
├── agents/simplifica-fullstack.md   →  Engenheiro Fullstack Sênior do projeto
└── skills/
    ├── backend/         →  Prisma, API Routes, Server Actions, Zod
    ├── frontend/        →  Shadcn, Tailwind, UX/UI, acessibilidade WCAG AA
    ├── infraestrutura/  →  Docker, Vercel, GitHub Actions, deploy
    └── seguranca/       →  Vitest, Playwright, Auth.js, OWASP Top 10
```

Cada skill é um **manual operacional executável** — snippets, padrões, ferramentas e checklists. O agente as consulta automaticamente conforme o contexto da tarefa.

### 3. Memória persistente entre sessões
O arquivo `CLAUDE.md` na raiz funciona como **contrato técnico**:
- Stack e versões congeladas (Prisma v5, Tailwind v3) com justificativa
- "Onde paramos" sempre atualizado
- Próximos passos numerados e clicáveis

Resultado: a próxima sessão de desenvolvimento **começa exatamente onde a anterior terminou**, sem precisar reonboarding do agente.

### 4. Vibecoding com governança
"Vibe coding" — programar conversando — só funciona em produção se houver:
- **Versionamento de prompts** (skills no `.claude/skills/`)
- **Validação contínua** (servidor local + `tsc --noEmit` antes de declarar concluído)
- **Decisões reversíveis** (sempre 3-5 próximos passos como opções, não um caminho único)

Este projeto demonstra essa disciplina aplicada a um produto SaaS real.

---

## Estrutura do projeto

```
.
├── .claude/                        # Agente e skills do Claude Code
│   ├── agents/simplifica-fullstack.md
│   └── skills/{backend,frontend,infraestrutura,seguranca}/SKILL.md
├── prisma/
│   ├── schema.prisma               # Modelagem multi-tenant
│   └── seed.ts                     # Mocks da Bella Trama (6 produtos, 5 clientes, 6 pedidos)
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Fontes Inter + DM Serif via next/font
│   │   ├── page.tsx                # Landing
│   │   ├── globals.css             # CSS variables Shadcn + utilities .ai-*
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Sidebar escamoteável + topbar
│   │   │   ├── page.tsx            # Dashboard com KPIs
│   │   │   ├── insights/           # Insights da IA (cards gradient + CTAs pulsantes)
│   │   │   └── {produtos,pedidos,clientes}/  # Placeholders
│   │   ├── loja/[slug]/            # Catálogo público
│   │   └── api/loja/[slug]/orders/ # API: cria pedido + retorna URL WhatsApp
│   ├── components/
│   │   ├── ui/                     # shadcn/ui
│   │   ├── admin/                  # AdminSidebar, ComingSoon
│   │   └── store/                  # cart-*, product-card
│   └── lib/
│       ├── prisma.ts               # Singleton do Prisma Client
│       └── utils.ts                # cn(), formatCurrency(), formatDate()
├── CLAUDE.md                       # Contrato técnico para o agente
├── README.md                       # Você está aqui
├── components.json                 # Config shadcn/ui
├── next.config.ts
├── tailwind.config.ts              # Paletas brand-rose, brand-indigo, ai-purple
└── tsconfig.json
```

---

## Rodando localmente

### Pré-requisitos
- **Node.js 20+**
- **npm 10+** (ou pnpm/yarn)

### Setup em 4 comandos

```powershell
# 1. Clone e entre na pasta
git clone https://github.com/Edulims/bella-trama-boutique.git
cd bella-trama-boutique

# 2. Configure as variáveis de ambiente
Copy-Item .env.example .env

# 3. Instale dependências e prepare o banco
npm install
npm run db:push
npm run db:seed

# 4. Suba o servidor
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — pronto.

### Comandos úteis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (http://localhost:3000) |
| `npm run build` | Build de produção |
| `npm run db:push` | Sincroniza o schema com o banco SQLite |
| `npm run db:seed` | Popula o banco com dados da Bella Trama |
| `npm run db:studio` | Abre o Prisma Studio (http://localhost:5555) |
| `npm run db:generate` | Regenera o Prisma Client |
| `npm run lint` | Roda o ESLint |

---

## Decisões técnicas notáveis

| Decisão | Por quê |
|---|---|
| **Prisma 5 (não 7)** | Prisma 7 mudou a API de `datasource` — preservar v5 mantém o schema portável |
| **Tailwind 3 (não 4)** | Formato de config diferente; v3 documenta melhor para o público desta vitrine |
| **`Order.status` como String, não enum** | SQLite não suporta `enum`. Em produção (Postgres), pode migrar transparentemente |
| **Server Components por padrão** | Apenas componentes que precisam de estado/eventos recebem `"use client"` |
| **shadcn/ui em vez de uma UI lib fechada** | Os componentes vivem no repositório — totalmente customizáveis |
| **Sonner para toasts** | API minimalista; melhor performance que alternativas baseadas em portal |

---

## Roadmap

Próximas features documentadas em `CLAUDE.md`:

- [ ] **CRUD real de Produtos** com upload de imagem (Vercel Blob)
- [ ] **Kanban de Pedidos** com drag-and-drop e detalhes em Sheet lateral
- [ ] **Autenticação** com Auth.js (NextAuth v5) + RBAC multi-tenant
- [ ] **Página de Clientes** com segmentação automática (VIP, Inativas, Recorrentes)
- [ ] **Integração real com Claude/OpenAI** substituindo os Insights mockados
- [ ] **Migração para PostgreSQL** (Neon) para produção
- [ ] **Testes**: Vitest (unit) + Playwright (e2e) cobrindo o fluxo de checkout
- [ ] **Deploy na Vercel** com domínio customizado e CI/CD automático

---

## Sobre o autor

Este projeto faz parte do portfólio de **Eduardo Lima** ([@Edulims](https://github.com/Edulims)) e demonstra:

- Construção de SaaS modernos com **Next.js + Prisma + TypeScript**
- **Design Systems** consistentes baseados em tokens e componentes
- **Co-criação com IA** através de Claude Code (Anthropic) — incluindo configuração de agentes e skills especializadas
- **Disciplina arquitetural** mantida mesmo em desenvolvimento por linguagem natural

**Disponível para conversas com clientes e recrutadores.**

- LinkedIn: _https://www.linkedin.com/in/eduardolimapublic/_
- Email: _educmlima@gmail.com_
- Site: _"Em construção"_

---

<div align="center">

### Construído com Claude Code
**Anthropic** · 2026

*"O melhor código não é o mais inteligente — é o que comunica intenção com clareza, para humanos e máquinas."*

</div>
