# Roteiro de demonstração — Simplifica.IA

Pitch presencial (ou via screen share) de **~10 minutos** para dono(a) de boutique, comércio de moda ou pequeno varejo.

---

## ⏱️ Pré-pitch (5 minutos antes do cliente chegar)

Garanta que o ambiente está pronto:

```powershell
# 1. Reseed o banco para ter dados frescos (datas relativas a HOJE)
$env:TS_NODE_COMPILER_OPTIONS = '{"module":"CommonJS","types":["node"]}'
npx ts-node prisma/seed.ts

# 2. Sobe o dev limpo (script já garante .next zerado)
npm run dev:fresh
```

**Abra 2 abas no browser, lado a lado se possível:**
- Aba 1: http://localhost:3000/loja/bella-trama (loja do consumidor — mobile preview no DevTools fica ainda mais impactante)
- Aba 2: http://localhost:3000/admin (painel do lojista)

**Deixe o WhatsApp Web aberto** numa 3ª aba — você vai precisar mostrar uma mensagem chegando.

---

## 🎬 ATO 1 — "Sua cliente compra pelo celular" (1-2 min)

**Aba 1: catálogo público em modo mobile**

Frase de abertura:
> *"Imagina que a Mariana, sua cliente, viu uma peça nova no seu Instagram e quer comprar. Hoje ela manda mensagem perguntando o preço, você manda foto, calcula frete, ela responde, você cobra… leva 30 minutos pra fechar um pedido. Olha como fica com o Simplifica.IA."*

**Demonstre:**
1. Navegue pelo catálogo — destaque a **fonte serif** dos preços (premium, sem cara de Mercado Livre), os filtros por categoria
2. Adicione **2 produtos** ao carrinho — abra o Sheet do carrinho (FAB rosa flutuante)
3. Clique em "Finalizar pedido" → preencha **nome e telefone**
4. Clique em "Enviar via WhatsApp" — o link `wa.me` abre **com a mensagem pronta**, contendo: nome, telefone, lista de produtos, total

> *"Pronto. A cliente confirma no zap, você manda Pix ou maquininha. **Você ganha 25 minutos do seu dia** — e a Mariana achou a experiência 'igual de loja grande'."*

---

## 🎬 ATO 2 — "Você bate o olho e sabe como tá o negócio" (1 min)

**Aba 2: /admin (dashboard)**

> *"Agora é a sua vez. Você acabou de abrir a loja, tomou um café, e vai conferir como tá o dia."*

**Demonstre:**
- Os **4 cards de métrica** no topo: vendas do mês, ticket médio, pedidos pendentes, clientes ativos
- O **bloco de pedidos recentes** — clique em um pra mostrar que tudo é navegável
- Aponte pro **card destaque da IA** com gradient violeta:

> *"Esse card é onde a coisa começa a ficar interessante. Vamos entrar nele."*

---

## 🎬 ATO 3 — "A IA trabalha pra você" (2-3 min) — ⭐ momento "uau"

**Click no card → /admin/insights**

> *"Toda manhã, uma IA analisa seus pedidos, seus clientes, suas vendas e te entrega o que eu chamo de 'briefing do dia'. Olha o que ela achou hoje na sua loja."*

**Demonstre os cards de Insight:**
1. Aponte pro alerta **vermelho/laranja** de cliente inativo: *"Olha, a Beatriz comprou um vestido marsala caro com você há 75 dias. Não voltou. A IA já preparou um disparo de WhatsApp pra ela."*
2. Clique no **botão "Gerar mensagem"** com a animação `ai-pulse` → Sheet abre com mensagem pronta
3. Aponte pra oportunidade **verde** de cliente VIP: *"A Sofia gasta R$ 700 em média com você. A IA sugere oferecer a coleção nova em primeira mão."*

> *"Você nunca mais perde uma cliente sumida por esquecimento. Você nunca mais deixa de mostrar a coleção nova pras suas top compradoras. E você não precisou abrir planilha nenhuma."*

**Em seguida abra /admin/clientes:**

> *"E aqui é onde toda essa inteligência mora. Cada cliente sua, organizada por valor pra você."*

**Demonstre:**
- A ordenação automática — **VIPs no topo** com badge dourado
- Os 4 mini-cards no header: **10 clientes / 3 VIPs / 2 Inativas / 2 Novas**
- Click no mini-card **"Inativas"** → lista filtra na hora pra Beatriz e Larissa
- Click no botão **"Disparar WhatsApp"** num card → Sheet abre com mensagem template **diferente por tipo de cliente** ("Sentimos sua falta" pra Inativa, "Cliente VIP, queria te avisar em primeira mão" pra VIP)
- Click **"Abrir no WhatsApp"** → abre o `wa.me` com mensagem pronta

> *"Em 3 cliques você dispara uma campanha que normalmente levaria você 2 horas no zap copiando-colando."*

---

## 🎬 ATO 4 — "O dia a dia também é simples" (2 min)

**Volte pra /admin/pedidos**

> *"E quando os pedidos chegam, você gerencia tudo daqui — sem perder o histórico."*

**Demonstre:**
- Mini-cards de status no topo (**Pendentes / Confirmados / Enviados / Entregues 30d**)
- Pegue um pedido **PENDING** → click no badge de status → menu mostra "Avançar para Confirmado" em destaque → clica → toast verde, badge atualiza, contagem do mini-card "Pendentes" diminui em real-time
- Click "Ver detalhes" em qualquer pedido → Sheet abre com produtos, foto, total, telefone clicável da cliente

> *"Você tem o painel do iFood, mas pra sua boutique."*

**Pule rápido pra /admin/produtos:**

> *"E claro, você controla seu catálogo inteiro daqui."*

- Mostre o botão **"+ Novo produto"** → abra a Sheet → preencha campos rapidamente → salva → produto aparece na grid
- Mostre o botão de **toggle ativar/desativar** com Undo no toast
- Mostre o botão **"Excluir"** → AlertDialog de confirmação → **se o produto tem pedidos**, mostra toast "Este produto está em N pedidos. Desative em vez de excluir." (proteção de histórico)

> *"Tudo pensado pra você não perder dado, não perder venda, não perder cliente."*

---

## 🎯 Closing (1 min)

Frase de fechamento:

> *"O Simplifica.IA não é só um sistema. É uma forma da sua boutique competir com as grandes — usando a mesma inteligência que elas, mas no seu jeito: WhatsApp, sem complicação, sem mensalidade absurda."*

**Pergunte:**
1. *"Faz sentido pra como você opera hoje?"*
2. *"O que mais te dá trabalho no seu dia — atender no zap, controlar estoque, ou perder cliente que sumiu?"*

A resposta dela vai te dizer **qual módulo enfatizar** na proposta comercial.

---

## ❓ FAQ — Objeções comuns

| Pergunta | Resposta |
|---|---|
| *"Mas eu preciso de site, não disso."* | "É um catálogo público mobile-first, otimizado pra link de bio do Insta. Não precisa de domínio próprio nem hospedagem — em 1 dia tá no ar." |
| *"E se eu não souber mexer?"* | "Tudo é simples como mandar mensagem no WhatsApp. Em 2 horas de treino você opera sozinha. Tem suporte por WhatsApp pelos primeiros 30 dias." |
| *"Quanto custa?"* | (você define — sugestão de **R$ 197/mês** com 30 dias grátis pro Plano Essencial: catálogo + carrinho + dashboard + insights básicos; **R$ 397/mês** com IA real nos insights e disparos automatizados de WhatsApp pra Sprint C futura) |
| *"Já uso [outro sistema]."* | "Posso migrar seus produtos e clientes em 1 dia útil. Você não perde nada." |
| *"Funciona pra meu tipo de loja?"* | "É feito pra comércio de moda, beleza, decoração — qualquer coisa com catálogo visual. Quer que eu te mostre como ficaria com **as suas peças** numa proposta?" *(esse é o seu hook pra fechar a próxima reunião com mockup personalizado)* |

---

## 🎁 Próximos passos a oferecer no final

1. **Demo personalizada com a marca dele(a)** — 3 dias pra subir um setup com logo, paleta e 10 produtos reais
2. **Período de teste gratuito de 30 dias** — sem cartão de crédito
3. **Suporte de implantação** — você cuida do cadastro inicial dos produtos

---

## 🛠️ Reset do ambiente após a demo (volta ao estado limpo)

Se a cliente cadastrou produto/pedido durante a demo e você quer voltar ao estado de seed:

```powershell
$env:TS_NODE_COMPILER_OPTIONS = '{"module":"CommonJS","types":["node"]}'
npx ts-node prisma/seed.ts   # limpa e repopula
```
