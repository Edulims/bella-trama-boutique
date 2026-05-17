---
name: seguranca
description: Use ao trabalhar em testes (unitários, integração, e2e), autenticação, autorização, validação de input, headers de segurança, ou auditoria de vulnerabilidades. Acionar quando o usuário pedir para escrever testes, configurar auth, revisar segurança ou auditar dependências.
---

# Segurança & Qualidade — Simplifica.IA

Objetivo: garantir que o Simplifica.IA seja **confiável (com testes)** e **seguro (validação + headers + auth + auditoria)** seguindo OWASP Top 10 e práticas consolidadas.

## Stack de testes e segurança recomendada

| Camada | Ferramenta | Para que |
|---|---|---|
| **Testes unitários** | **Vitest** | Funções puras, utils, schemas Zod |
| **Testes de componente** | **Testing Library + Vitest** | React components isolados |
| **Testes e2e** | **Playwright** | Fluxos completos (carrinho → checkout) |
| **API tests** | **Vitest + supertest-like** ou **Playwright** | Rotas /api |
| **Validação input** | **Zod** | Body, query, params, env vars |
| **Auth** | **Auth.js (NextAuth v5)** | Login + sessões + RBAC |
| **Rate limiting** | **@upstash/ratelimit** + **@upstash/redis** | Rotas públicas |
| **Headers segurança** | **next-secure-headers** ou custom | CSP, HSTS, X-Frame |
| **Audit** | **`npm audit`** + **Snyk** | Vulnerabilidades em deps |
| **Static analysis** | **TypeScript strict** + **ESLint** | Erros em tempo de build |

## Setup de testes — Vitest

```powershell
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

Adicionar no `package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:cov": "vitest run --coverage"
}
```

### Padrão de teste unitário (`lib/utils.test.ts`)
```ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formata BRL com 2 decimais", () => {
    expect(formatCurrency(189.9)).toBe("R$ 189,90");
  });

  it("aceita zero", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });
});
```

### Padrão de teste de componente
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "@/components/store/product-card";

vi.mock("@/components/store/cart-context", () => ({
  useCart: () => ({ add: vi.fn(), items: [] }),
}));

describe("ProductCard", () => {
  it("renderiza nome e preço", () => {
    render(<ProductCard product={{ ...mock }} />);
    expect(screen.getByText("Vestido Floral")).toBeInTheDocument();
    expect(screen.getByText("R$ 189,90")).toBeInTheDocument();
  });

  it("chama add ao clicar em Adicionar", async () => {
    render(<ProductCard product={{ ...mock }} />);
    await userEvent.click(screen.getByRole("button", { name: /adicionar/i }));
    // assert mock chamado
  });
});
```

## Setup de e2e — Playwright

```powershell
npm install -D @playwright/test
npx playwright install
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
```

### Padrão de teste e2e (`e2e/checkout.spec.ts`)
```ts
import { test, expect } from "@playwright/test";

test("usuário consegue adicionar produto e abrir o carrinho", async ({ page }) => {
  await page.goto("/loja/bella-trama");
  await page.getByRole("button", { name: /adicionar/i }).first().click();
  await page.getByRole("button", { name: /ver carrinho/i }).click();
  await expect(page.getByRole("heading", { name: /meu carrinho/i })).toBeVisible();
});
```

Adicionar:
```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

## Autenticação — Auth.js (NextAuth v5)

```powershell
npm install next-auth@beta @auth/prisma-adapter
```

### Schema Prisma (acrescentar)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  storeId       String?
  role          String    @default("OWNER")  // OWNER | ADMIN | VIEWER
  accounts      Account[]
  sessions      Session[]
  store         Store?    @relation(fields: [storeId], references: [id])
}
// + Account, Session, VerificationToken (boilerplate Auth.js)
```

### Configuração (`src/auth.ts`)
```ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        // valida com bcrypt e retorna user ou null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.storeId = token.storeId as string;
      return session;
    },
  },
});
```

### Middleware protegendo `/admin/*`
```ts
// src/middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  if (isAdmin && !req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

### Hash de senhas
```powershell
npm install bcryptjs && npm install -D @types/bcryptjs
```
```ts
import bcrypt from "bcryptjs";
const hash = await bcrypt.hash(plain, 12);
const valid = await bcrypt.compare(plain, hash);
```

## OWASP Top 10 — checklist aplicado ao projeto

| # | Risco | Como mitigar aqui |
|---|---|---|
| 1 | Broken access control | Sempre checar `session.user.storeId` antes de query, RBAC no middleware |
| 2 | Cryptographic failures | `NEXTAUTH_SECRET` ≥ 32 chars, bcrypt cost 12, HTTPS na Vercel |
| 3 | Injection | Prisma já parametriza queries; Zod valida body/params |
| 4 | Insecure design | Rate limit em login/checkout, threat model documentado |
| 5 | Security misconfiguration | Headers (CSP, HSTS), env vars não vazadas em client |
| 6 | Vulnerable components | `npm audit` no CI, Dependabot, Snyk |
| 7 | Identification & auth | Auth.js com JWT + adapter Prisma + MFA quando necessário |
| 8 | Software & data integrity | `package-lock.json` commitado, builds reproduzíveis |
| 9 | Logging & monitoring | Sentry + Vercel logs + alertas |
| 10 | SSRF | Validar URLs externas (next/image já bloqueia hosts não listados) |

## Headers de segurança

`next.config.ts`:
```ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: https://images.unsplash.com https://via.placeholder.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://vercel.live",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // ...
};
```

## Rate limiting (Upstash)

```powershell
npm install @upstash/ratelimit @upstash/redis
```
```ts
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),  // 10 req/min
});

// uso em route handler:
const { success } = await ratelimit.limit(`ip:${ip}`);
if (!success) return NextResponse.json({ error: "Many requests" }, { status: 429 });
```

## Auditoria de dependências

```powershell
npm audit                            # roda audit
npm audit fix                        # corrige automaticamente
npm audit --audit-level=high         # falha se alta/crítica

# Snyk (opcional, mais robusto)
npx snyk test
npx snyk monitor
```

Configurar **Dependabot** no GitHub via `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

## TypeScript strict mode (já ativo)

`tsconfig.json` já tem `"strict": true`. **Não** desabilitar `ignoreBuildErrors` em produção — está ativo apenas como workaround do TypeScript 6 com Next 15.

Antes de deploy, rodar manualmente:
```powershell
npx tsc --noEmit
```

## Checklist de "seguro o suficiente para produção"

- [ ] Todas as rotas `/api` validam input com Zod
- [ ] Todas as queries do admin filtram por `storeId` da sessão
- [ ] `NEXTAUTH_SECRET` definido e ≥ 32 chars
- [ ] Senhas com bcrypt cost 12+
- [ ] Headers de segurança configurados (CSP, HSTS, X-Frame)
- [ ] Rate limit em login, checkout e rotas públicas críticas
- [ ] `npm audit` sem vulnerabilidades altas/críticas
- [ ] Sentry capturando erros em produção
- [ ] Backups automáticos do banco (Neon já faz)
- [ ] `.env*` nunca commitado (verificar `.gitignore`)
- [ ] Testes cobrindo: utils, schemas Zod, fluxo de checkout, autenticação

## Quando adicionar testes

Mínimo viável para o MVP:
- **Unit**: `formatCurrency`, schemas Zod, cart reducer
- **Component**: ProductCard, CartDrawer
- **E2E**: fluxo do catálogo (entrar → adicionar produto → abrir carrinho → preencher form)

Estratégia: começar com 5-10 testes que cobrem o **fluxo principal de receita** (catálogo + checkout), depois expandir.
