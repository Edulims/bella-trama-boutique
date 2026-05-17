---
name: infraestrutura
description: Use ao trabalhar em deploy, Docker, CI/CD, variáveis de ambiente, banco em produção, ou qualquer configuração que envolva colocar o Simplifica.IA online. Acionar quando o usuário pedir para fazer deploy, dockerizar, configurar GitHub Actions, ou migrar de SQLite para Postgres.
---

# Infraestrutura & Cloud — Simplifica.IA

Objetivo: deixar o Simplifica.IA **rodando localmente, dockerizado e online em produção** com as ferramentas mais consolidadas do mercado.

## Stack de infraestrutura recomendada

| Camada | Ferramenta primária | Alternativas |
|---|---|---|
| **Hosting Next.js** | **Vercel** (best-fit) | Railway, Fly.io, AWS Amplify, self-hosted Docker |
| **Banco em produção** | **Neon** (Postgres serverless) | Supabase, Railway Postgres, PlanetScale |
| **CI/CD** | **GitHub Actions** | GitLab CI, CircleCI |
| **Container local** | **Docker** + **docker-compose** | — |
| **Secrets** | **Vercel env vars** + `.env.local` | Doppler, 1Password CLI |
| **Monitoramento** | **Sentry** (erros) + **Vercel Analytics** | LogRocket, Datadog |
| **CDN / Storage** | **Vercel Blob** ou **Cloudflare R2** | AWS S3, UploadThing |

## Rodar localmente (dev)

```powershell
npm install                # primeira vez
npm run db:push            # cria SQLite
npm run db:seed            # popula com mocks
npm run dev                # http://localhost:3000
npm run db:studio          # http://localhost:5555
```

Se a porta 3000 estiver presa:
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }
```

## Variáveis de ambiente

### Estrutura
```
.env                  # commitado, valores de dev (SQLite local)
.env.local            # ignorado pelo git, sobrescreve .env (use para secrets)
.env.production       # ignorado pelo git, para deploy local de produção
.env.example          # commitado, template sem valores secretos
```

### Adicionar nova env var:
1. Criar `.env.example` com a chave sem valor
2. Adicionar no `.env.local` com valor
3. **Configurar na Vercel** via dashboard ou `vercel env add`
4. Atualizar `next.config.ts` se for usada no client (`NEXT_PUBLIC_*`)

Sempre validar com Zod no boot:
```ts
// src/lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export const env = EnvSchema.parse(process.env);
```

## Docker — desenvolvimento e produção

### Dockerfile (produção, multi-stage)
Crie em `Dockerfile`:
```dockerfile
# === deps ===
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# === builder ===
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# === runner ===
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

**Habilitar standalone output em `next.config.ts`**:
```ts
const nextConfig: NextConfig = {
  output: "standalone",   // 👈 reduz a imagem
  // ...
};
```

### docker-compose.yml (dev com Postgres)
```yaml
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: simplifica
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: simplifica_ia
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://simplifica:dev@db:5432/simplifica_ia
    depends_on:
      - db

volumes:
  pgdata:
```

Comandos:
```powershell
docker compose up -d        # sobe ambiente
docker compose logs -f app  # tail dos logs
docker compose down -v      # derruba + apaga volumes
```

### Build/Run só do app
```powershell
docker build -t simplifica-ia .
docker run -p 3000:3000 --env-file .env.production simplifica-ia
```

## Deploy na Vercel (caminho mais fácil)

### Passos
1. Push para GitHub
2. `vercel login` (uma vez)
3. `vercel link` no diretório do projeto
4. Configurar env vars: `vercel env add DATABASE_URL production`
5. `vercel --prod` para deploy

**Importante para Prisma na Vercel**:
- Adicionar no `package.json`:
  ```json
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
  ```
- `DATABASE_URL` precisa ser do Postgres (Neon recomendado) — SQLite não funciona em serverless

### Migrar SQLite → Postgres (Neon)
1. Criar projeto em https://neon.tech
2. Copiar `DATABASE_URL` (formato `postgresql://...`)
3. Mudar `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // era sqlite
     url      = env("DATABASE_URL")
   }
   ```
4. **Cuidado**: SQLite usa `String` para enums — em Postgres pode trocar para `enum` real (opcional)
5. Rodar `npx prisma migrate dev --name init_postgres`
6. Rodar seed em produção: `DATABASE_URL=<neon> npm run db:seed`

## GitHub Actions (CI básico)

Crie `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint --if-present
      - run: npm test --if-present
      - run: npm run build
        env:
          DATABASE_URL: file:./dev.db
```

Para deploy automático na Vercel: instalar Vercel GitHub App, dispensa workflow.

## Monitoramento em produção

### Sentry (erros)
```powershell
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Vercel Analytics (Web Vitals)
```powershell
npm install --save @vercel/analytics
```
```tsx
// src/app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
// ...
<Analytics />
```

## Storage de imagens em produção

Hoje o projeto usa URLs do Unsplash (mock). Para uploads reais:

**Opção recomendada: Vercel Blob**
```powershell
npm install @vercel/blob
```
```ts
import { put } from "@vercel/blob";
const blob = await put(file.name, file, { access: "public" });
// blob.url
```

**Alternativa: Cloudflare R2** (mais barato em volume) ou **UploadThing** (mais simples).

## Checklist de "pronto para produção"

- [ ] DATABASE_URL apontando para Postgres (Neon)
- [ ] `output: "standalone"` em `next.config.ts` se for Docker
- [ ] Todas as env vars configuradas na Vercel/host
- [ ] `prisma generate` no `postinstall`
- [ ] Domínio customizado configurado (Vercel ou Cloudflare)
- [ ] HTTPS forçado (Vercel já faz por padrão)
- [ ] Headers de segurança (ver skill `seguranca`)
- [ ] Sentry capturando erros
- [ ] Analytics ativado
- [ ] Banco com backups automáticos (Neon já faz)
- [ ] Limite de rate em rotas públicas

## Custos estimados para MVP (mensal)

| Serviço | Free tier suficiente? | Quando começar a pagar |
|---|---|---|
| Vercel Hobby | ✅ Sim | Após 100GB bandwidth/mês ou uso comercial |
| Neon Free | ✅ Sim | 0.5GB storage, 1 branch — depois ~$19/mo |
| GitHub Actions | ✅ Sim | 2000 min/mês free em repo público |
| Sentry Developer | ✅ Sim | 5k erros/mês |
| Vercel Blob | ✅ Sim | 1GB inicial |

**Estimativa MVP rodando**: $0 por vários meses, depois ~$20-40/mês quando crescer.
