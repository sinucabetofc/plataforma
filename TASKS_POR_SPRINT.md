# 📋 Tasks Organizadas por Sprint - SinucaBet
## Guia Prático de Implementação

**Versão:** 1.0  
**Data:** 05/11/2025  
**Baseado em:** PRD_SINUCABET.md

---

## 📖 Como Usar Este Documento

Este documento organiza **TODO o trabalho** em tasks acionáveis, organizadas por sprint.

**Legenda de Status:**
- ✅ **Concluído**
- 🔄 **Em andamento**
- 📋 **A fazer**
- ⏭️ **Backlog**
- ❌ **Bloqueado**

**Prioridades:**
- 🔴 **Alta** - Crítico para o sprint
- 🟡 **Média** - Importante mas não bloqueante
- 🟢 **Baixa** - Nice to have

---

## 🎯 FASE 1: MVP CORE (Semanas 1-4)

---

### 📅 SPRINT 1: Database & Models (Semana 1)
**Objetivo:** Criar toda a estrutura de dados no Supabase

#### **DIA 1-2: Tabela Players** 🔴 Alta

- [ ] **TASK-1.1:** Criar migration `004_create_players_table.sql`
  - **Descrição:** Criar tabela `players` com campos: id, name, nickname, photo_url, bio, active, estatísticas
  - **Arquivo:** `backend/supabase/migrations/004_create_players_table.sql`
  - **Acceptance Criteria:**
    - ✅ Tabela criada com todos os campos
    - ✅ Índices em `active` e `name`
    - ✅ RLS ativado (SELECT público, INSERT/UPDATE admin)
    - ✅ Trigger `updated_at`
  - **Estimativa:** 2h
  - **Código:**
```sql
-- Ver PROXIMO_PASSO_DESENVOLVIMENTO.md seção "Sprint 1"
```

- [ ] **TASK-1.2:** Aplicar migration no Supabase
  - **Descrição:** Executar migration via Supabase Dashboard ou CLI
  - **Passos:**
    1. Acessar Supabase Dashboard
    2. SQL Editor → New Query
    3. Colar conteúdo da migration
    4. Execute
    5. Validar na Table Editor
  - **Estimativa:** 30min

- [ ] **TASK-1.3:** Criar service `players.service.js`
  - **Descrição:** Service com métodos CRUD para players
  - **Arquivo:** `backend/services/players.service.js`
  - **Métodos:**
    - `create(playerData)` → Criar jogador
    - `list(filters)` → Listar jogadores (com busca)
    - `getById(id)` → Buscar por ID
    - `update(id, updates)` → Atualizar jogador
    - `updateStats(playerId, { matchPlayed, won })` → Atualizar estatísticas
  - **Estimativa:** 3h
  - **Código:** Ver PROXIMO_PASSO_DESENVOLVIMENTO.md

- [ ] **TASK-1.4:** Testar CRUD via MCP Supabase
  - **Descrição:** Validar que RLS e operações funcionam
  - **Passos:**
    1. Criar 3 jogadores via MCP
    2. Listar jogadores
    3. Atualizar estatísticas
    4. Validar RLS (tentar sem permissão admin)
  - **Estimativa:** 1h

- [ ] **TASK-1.5:** Popular com dados de teste
  - **Descrição:** Inserir 10 jogadores fictícios para desenvolvimento
  - **Arquivo:** `backend/supabase/seed/001_players.sql` (novo)
  - **Estimativa:** 1h

---

#### **DIA 3-4: Tabela Matches** 🔴 Alta

- [ ] **TASK-1.6:** Criar migration `005_create_matches_table.sql`
  - **Descrição:** Tabela `matches` com relações para players
  - **Campos:**
    - Básicos: id, scheduled_at, location, sport, status
    - Transmissão: youtube_url, stream_active
    - Jogadores: player1_id, player2_id (FK players)
    - Regras: game_rules (JSONB)
  - **Constraints:**
    - CHECK: player1_id != player2_id
  - **Estimativa:** 2h

- [ ] **TASK-1.7:** Aplicar migration
  - **Estimativa:** 30min

- [ ] **TASK-1.8:** Criar service `matches.service.js`
  - **Métodos:**
    - `create(matchData)`
    - `list(filters)` → Com JOIN de players
    - `getById(id)` → Com players e series
    - `update(id, updates)`
  - **Estimativa:** 4h

- [ ] **TASK-1.9:** Testar relações (JOIN com players)
  - **Query esperada:**
```sql
SELECT 
  m.*,
  p1.name as player1_name,
  p2.name as player2_name
FROM matches m
JOIN players p1 ON m.player1_id = p1.id
JOIN players p2 ON m.player2_id = p2.id;
```
  - **Estimativa:** 1h

- [ ] **TASK-1.10:** Criar 5 partidas de teste
  - **Estimativa:** 1h

---

#### **DIA 5: Tabelas Series, Bets, Transactions** 🔴 Alta

- [ ] **TASK-1.11:** Criar migration `006_create_series_table.sql`
  - **Descrição:** Tabela de séries vinculada a matches
  - **Campos:** id, match_id, serie_number, status, scores, winner
  - **Constraint:** UNIQUE(match_id, serie_number)
  - **Estimativa:** 2h

- [ ] **TASK-1.12:** Criar migration `007_create_bets_table.sql`
  - **Descrição:** Tabela de apostas
  - **Campos:** id, user_id, serie_id, chosen_player_id, amount, status
  - **Constraint:** CHECK amount >= 1000 (R$ 10,00)
  - **Estimativa:** 2h

- [ ] **TASK-1.13:** Criar migration `008_create_transactions_table.sql`
  - **Descrição:** Histórico de transações da carteira
  - **Campos:** id, wallet_id, bet_id, type, amount, balances
  - **Estimativa:** 2h

- [ ] **TASK-1.14:** Aplicar todas as migrations
  - **Estimativa:** 30min

- [ ] **TASK-1.15:** Testar integridade referencial
  - **Testes:**
    - ✅ Criar match → series → bets (cascata)
    - ✅ Deletar match → series deletadas (ON DELETE CASCADE)
    - ✅ Tentar aposta com saldo insuficiente (deve falhar)
  - **Estimativa:** 2h

---

#### **RETROSPECTIVA SPRINT 1**
- [ ] **RETRO-1:** Documentar decisões arquiteturais
- [ ] **RETRO-2:** Validar com stakeholder
- [ ] **RETRO-3:** Preparar demo (seeds + queries)

---

### 📅 SPRINT 2: Backend APIs (Semana 2)
**Objetivo:** Criar toda a camada de serviços e controllers

#### **DIA 1-2: Services** 🔴 Alta

- [ ] **TASK-2.1:** Finalizar `players.service.js`
  - **Se não foi feito no Sprint 1**
  - **Estimativa:** 2h

- [ ] **TASK-2.2:** Finalizar `matches.service.js`
  - **Incluir:**
    - Filtros avançados (sport, status, date range)
    - Ordenação (scheduled_at ASC/DESC)
    - Paginação (offset/limit)
  - **Estimativa:** 3h

- [ ] **TASK-2.3:** Criar `series.service.js`
  - **Métodos:**
    - `createForMatch(matchId, count)` → Criar N séries
    - `getByMatchId(matchId)`
    - `updateStatus(serieId, status)`
    - `updateScore(serieId, { player1Score, player2Score })`
    - `finishSerie(serieId, winnerId)` → Encerrar e definir vencedor
  - **Estimativa:** 4h

- [ ] **TASK-2.4:** Criar `bets.service.js`
  - **Métodos:**
    - `create(userId, serieId, playerId, amount)` → Com validações
    - `getByUserId(userId)` → Histórico do usuário
    - `getBySerieId(serieId)` → Todas as apostas da série (admin)
    - `cancel(betId, userId)` → Cancelar antes de iniciar
    - `resolve(serieId)` → Resolver apostas ao encerrar série
  - **Validações:**
    - ✅ Saldo suficiente
    - ✅ Série está "liberada"
    - ✅ Betting_enabled = true
    - ✅ Usuário não apostou ainda nesta série
  - **Estimativa:** 5h

- [ ] **TASK-2.5:** Criar `wallet.service.js`
  - **Métodos:**
    - `getBalance(userId)`
    - `deposit(userId, amount, metadata)` → Via PIX (futuro)
    - `withdraw(userId, amount, pixKey)` → Saque
    - `debit(userId, amount, description, betId)` → Débito (aposta)
    - `credit(userId, amount, description, betId)` → Crédito (ganho)
  - **Transaction safety:** Usar Supabase RPC ou transações SQL
  - **Estimativa:** 4h

---

#### **DIA 3-4: Controllers** 🔴 Alta

- [ ] **TASK-2.6:** Criar `players.controller.js`
  - **Rotas:**
    - GET /api/players → list
    - GET /api/players/:id → getById
    - POST /api/players → create (admin)
    - PUT /api/players/:id → update (admin)
  - **Middleware:** authMiddleware, adminMiddleware
  - **Estimativa:** 3h

- [ ] **TASK-2.7:** Criar `matches.controller.js`
  - **Rotas:**
    - GET /api/matches → list (public)
    - GET /api/matches/:id → getById (public)
    - POST /api/matches → create (admin/gerente)
    - PUT /api/matches/:id → update (admin/gerente)
    - DELETE /api/matches/:id → delete (admin)
  - **Estimativa:** 4h

- [ ] **TASK-2.8:** Criar `series.controller.js`
  - **Rotas:**
    - GET /api/matches/:matchId/series → list
    - POST /api/series/:id/release → Liberar para apostas (admin/gerente)
    - PUT /api/series/:id/score → Atualizar placar (admin/gerente)
    - POST /api/series/:id/finish → Encerrar série (admin/gerente)
  - **Estimativa:** 4h

- [ ] **TASK-2.9:** Criar `bets.controller.js`
  - **Rotas:**
    - GET /api/bets/my → Minhas apostas (autenticado)
    - POST /api/bets → Criar aposta (autenticado)
    - DELETE /api/bets/:id → Cancelar (autenticado, owner)
  - **Validações completas:**
    - Saldo, série liberada, valor mínimo
  - **Estimativa:** 4h

- [ ] **TASK-2.10:** Criar `wallet.controller.js`
  - **Rotas:**
    - GET /api/wallet/balance → Saldo atual
    - GET /api/wallet/transactions → Histórico
    - POST /api/wallet/deposit → Depósito (PIX - fase 2)
    - POST /api/wallet/withdraw → Saque (PIX - fase 2)
  - **Estimativa:** 3h

---

#### **DIA 5: Routes & Testing** 🔴 Alta

- [ ] **TASK-2.11:** Criar arquivo de rotas `backend/routes/index.js`
  - **Organizar:**
```javascript
import playersRouter from './players.routes.js';
import matchesRouter from './matches.routes.js';
import seriesRouter from './series.routes.js';
import betsRouter from './bets.routes.js';
import walletRouter from './wallet.routes.js';

app.use('/api/players', playersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/series', seriesRouter);
app.use('/api/bets', betsRouter);
app.use('/api/wallet', walletRouter);
```
  - **Estimativa:** 2h

- [ ] **TASK-2.12:** Testar todas as rotas com Insomnia/Postman
  - **Criar collection:**
    - Players: CRUD completo
    - Matches: Criar, listar, detalhes
    - Series: Liberar, atualizar placar, encerrar
    - Bets: Criar, listar minhas
    - Wallet: Saldo, transações
  - **Validar:**
    - ✅ Autenticação funciona (Bearer token)
    - ✅ RLS bloqueia acessos indevidos
    - ✅ Validações de negócio (saldo, série liberada, etc)
  - **Estimativa:** 4h

- [ ] **TASK-2.13:** Documentar APIs (README ou Swagger)
  - **Opcional:** Usar swagger-jsdoc
  - **Estimativa:** 2h

---

#### **RETROSPECTIVA SPRINT 2**
- [ ] **RETRO-2:** Revisar código (code review)
- [ ] **RETRO-2:** Testar fluxo completo E2E (Playwright)
- [ ] **RETRO-2:** Atualizar PRD com decisões tomadas

---

### 📅 SPRINT 3: Frontend - Dashboard (Semana 3)
**Objetivo:** Criar interface para listar partidas

#### **DIA 1-2: Configuração & Layout Base** 🔴 Alta

- [ ] **TASK-3.1:** Configurar ambiente Next.js (se ainda não)
  - **Verificar:**
    - ✅ TailwindCSS configurado
    - ✅ Shadcn UI instalado
    - ✅ Fontes (Inter)
    - ✅ ESLint + Prettier
  - **Estimativa:** 1h

- [ ] **TASK-3.2:** Criar layout base `app/layout.tsx`
  - **Incluir:**
    - Fonts (Inter)
    - Metadata (SEO)
    - Theme provider (dark mode - opcional)
    - Toaster (notificações)
  - **Estimativa:** 2h

- [ ] **TASK-3.3:** Criar componente `Header`
  - **Arquivo:** `components/layout/header.tsx`
  - **Elementos:**
    - Logo (link para home)
    - Saldo do usuário (clicável → extrato)
    - Ícone de notificações (badge)
    - Menu de usuário (dropdown)
      - Perfil
      - Depositar
      - Sacar
      - Histórico
      - Logout
  - **Estimativa:** 4h

- [ ] **TASK-3.4:** Criar componente `Footer`
  - **Arquivo:** `components/layout/footer.tsx`
  - **Conteúdo:** Copyright, links (Termos, Privacidade, Suporte)
  - **Estimativa:** 1h

---

#### **DIA 3-4: Dashboard & MatchList** 🔴 Alta

- [ ] **TASK-3.5:** Criar página `app/dashboard/page.tsx`
  - **Layout:**
    - Header (sticky)
    - Título "Próximas Partidas"
    - Filtros (Sinuca/Futebol, Data)
    - Lista de partidas (MatchList)
    - Footer
  - **Estimativa:** 3h

- [ ] **TASK-3.6:** Criar componente `MatchFilters`
  - **Arquivo:** `components/matches/match-filters.tsx`
  - **Filtros:**
    - Tabs: Sinuca, Futebol, Todas
    - DatePicker: Hoje, Amanhã, Data específica
    - Estado: URL query params (?sport=sinuca&date=2025-11-05)
  - **Estimativa:** 3h

- [ ] **TASK-3.7:** Criar componente `MatchCard`
  - **Arquivo:** `components/matches/match-card.tsx`
  - **Design:** Ver wireframe em ANALISE_VAGBET.md
  - **Elementos:**
    - Horário, localização
    - Fotos dos jogadores (Avatar ou Image)
    - Nomes dos jogadores
    - VS (separador grande)
    - Tipo de jogo e regras (Badge)
    - Link "Assistir ao vivo" (YouTube icon)
    - Card clicável → /partidas/:id
  - **Estados:**
    - Agendada (cinza)
    - Ao vivo (verde pulsante)
    - Finalizada (cinza escuro)
  - **Estimativa:** 5h

- [ ] **TASK-3.8:** Criar componente `MatchList`
  - **Arquivo:** `components/matches/match-list.tsx`
  - **Funcionalidades:**
    - Buscar partidas via API (`/api/matches`)
    - Filtrar baseado em query params
    - Loading state (Skeleton)
    - Empty state (sem partidas)
    - Grid responsivo (1 col mobile, 2 tablet, 3 desktop)
  - **Estimativa:** 4h

---

#### **DIA 5: Data Fetching & Polish** 🟡 Média

- [ ] **TASK-3.9:** Configurar SWR ou React Query
  - **Escolher biblioteca:**
    - SWR (recomendado - Vercel)
    - React Query (mais features)
  - **Criar hook:** `hooks/useMatches.ts`
  - **Estimativa:** 2h

- [ ] **TASK-3.10:** Implementar useMatches hook
  - **Funcionalidades:**
    - Fetch de `/api/matches`
    - Cache automático
    - Revalidação on focus
    - Loading/Error states
  - **Estimativa:** 2h

- [ ] **TASK-3.11:** Adicionar Skeleton loaders
  - **Componente:** `components/ui/skeleton.tsx` (Shadcn)
  - **Usar em:** MatchList (enquanto carrega)
  - **Estimativa:** 1h

- [ ] **TASK-3.12:** Adicionar Empty states
  - **Componente:** `components/matches/empty-matches.tsx`
  - **Mensagem:** "Nenhuma partida agendada para hoje"
  - **Estimativa:** 1h

- [ ] **TASK-3.13:** Testar responsividade
  - **Dispositivos:**
    - Mobile: 375px (iPhone)
    - Tablet: 768px (iPad)
    - Desktop: 1440px
  - **Validar:** Layout, fontes, imagens
  - **Estimativa:** 2h

---

#### **RETROSPECTIVA SPRINT 3**
- [ ] **RETRO-3:** Testar UX com usuário real
- [ ] **RETRO-3:** Validar performance (Lighthouse)
- [ ] **RETRO-3:** Ajustes de design baseado em feedback

---

### 📅 SPRINT 4: Detalhes da Partida & Apostas (Semana 4)
**Objetivo:** Página completa de apostas com YouTube

#### **DIA 1-2: Página de Detalhes** 🔴 Alta

- [ ] **TASK-4.1:** Criar página `app/partidas/[id]/page.tsx`
  - **Layout:**
    - Header
    - Hero section (jogadores, info)
    - YouTube player (embed)
    - Lista de séries
    - Formulário de aposta (série ativa)
    - Footer
  - **Estimativa:** 3h

- [ ] **TASK-4.2:** Criar hook `useMatch(id)`
  - **Fetch:** `/api/matches/:id`
  - **Retornar:** match, players, series
  - **Estimativa:** 2h

- [ ] **TASK-4.3:** Criar componente `MatchHero`
  - **Arquivo:** `components/matches/match-hero.tsx`
  - **Conteúdo:**
    - Horário, localização, tipo de série
    - Fotos grandes dos jogadores
    - Nomes e apelidos
    - Regras do jogo
  - **Estimativa:** 3h

---

#### **DIA 3: YouTube Player & Séries** 🔴 Alta

- [ ] **TASK-4.4:** Criar componente `LivePlayer`
  - **Arquivo:** `components/matches/live-player.tsx`
  - **Usar:** YouTube iframe API ou componente `react-youtube`
  - **Features:**
    - Responsivo (aspect-ratio 16:9)
    - Autoplay (opcional)
    - Link externo "Assistir no YouTube"
  - **Estimativa:** 3h

- [ ] **TASK-4.5:** Criar componente `SerieCard`
  - **Arquivo:** `components/series/serie-card.tsx`
  - **Estados:**
    - **Encerrada:** Placar final, ícone de check
    - **Em andamento:** Placar ao vivo, badge "AO VIVO"
    - **Liberada:** Badge azul "LIBERADA PARA APOSTAS"
    - **Pendente:** Cinza, desabilitada
  - **Estimativa:** 4h

- [ ] **TASK-4.6:** Criar componente `SeriesList`
  - **Arquivo:** `components/series/series-list.tsx`
  - **Layout:**
    - Accordion (séries colapsáveis) ou Cards empilhados
    - Ordenação por número (1, 2, 3...)
    - Highlight na série ativa
  - **Estimativa:** 2h

---

#### **DIA 4-5: Formulário de Apostas** 🔴 Alta

- [ ] **TASK-4.7:** Criar componente `BettingForm`
  - **Arquivo:** `components/bets/betting-form.tsx`
  - **Props:** `serie` (série ativa)
  - **Layout:**
    - Placar atual da série
    - Dois botões "Selecionar" (um para cada jogador)
    - Campo de valor (input + botões rápidos)
    - Investimentos do adversário (após selecionar)
    - Ganho potencial (cálculo em tempo real)
    - Botão "Apostar" (CTA grande)
  - **Estimativa:** 6h

- [ ] **TASK-4.8:** Implementar seleção de jogador
  - **Comportamento:**
    - Clicar em "Selecionar" → Visual feedback (border verde)
    - Apenas 1 pode estar selecionado
    - Ao trocar, limpar valor da aposta
  - **Estimativa:** 2h

- [ ] **TASK-4.9:** Implementar campo de valor
  - **Funcionalidades:**
    - Input numérico (R$ formato)
    - Botões: +10, +50, +100, +500, +1.000
    - Botão "Limpar"
    - Validação: mínimo R$ 10,00, máximo = saldo
  - **Estimativa:** 3h

- [ ] **TASK-4.10:** Implementar cálculo de ganho potencial
  - **Fórmula:** (valor × odds) - taxa da casa
  - **Exibir:** "Em caso de vitória, você ganha: R$ XX,XX"
  - **Atualizar:** Em tempo real conforme digita valor
  - **Estimativa:** 2h

- [ ] **TASK-4.11:** Implementar validações
  - **Validar:**
    - ✅ Jogador selecionado
    - ✅ Valor >= R$ 10,00
    - ✅ Saldo suficiente
    - ✅ Série está "liberada"
    - ✅ Betting_enabled = true
  - **Exibir erros:** Toast ou inline message
  - **Estimativa:** 2h

- [ ] **TASK-4.12:** Implementar submit da aposta
  - **Fluxo:**
    1. Validar formulário
    2. POST /api/bets { serieId, playerId, amount }
    3. Aguardar resposta
    4. Sucesso → Toast + Atualizar saldo + Limpar form
    5. Erro → Exibir mensagem
  - **Estimativa:** 3h

---

#### **RETROSPECTIVA SPRINT 4**
- [ ] **RETRO-4:** Testar fluxo completo de aposta (E2E Playwright)
- [ ] **RETRO-4:** Validar UX com beta testers
- [ ] **RETRO-4:** Preparar demo para stakeholders

---

#### **🎉 MILESTONE: MVP FUNCIONAL**
**Ao final do Sprint 4, você terá:**
- ✅ Sistema de autenticação completo
- ✅ Dashboard com lista de partidas
- ✅ Página de detalhes com YouTube
- ✅ Formulário de apostas funcionando
- ✅ Backend completo (APIs)
- ✅ Database estruturada

**Resultado:** Você pode fazer uma aposta de ponta a ponta! 🚀

---

## 🎯 FASE 2: REAL-TIME & FINANCEIRO (Semanas 5-6)

### 📅 SPRINT 5: Real-time & Notificações (Semana 5)

#### **Real-time Updates** 🔴 Alta

- [ ] **TASK-5.1:** Configurar Supabase Realtime
  - **Habilitar:** Realtime no Supabase Dashboard
  - **Tabelas:** series, bets
  - **Estimativa:** 1h

- [ ] **TASK-5.2:** Criar hook `useRealtimeSeries(matchId)`
  - **Subscribe:** Mudanças na tabela `series` (WHERE match_id = matchId)
  - **Eventos:** INSERT, UPDATE
  - **Atualizar:** Estado local quando placar muda
  - **Estimativa:** 3h

- [ ] **TASK-5.3:** Atualizar `SerieCard` para real-time
  - **Comportamento:**
    - Placar atualiza automaticamente (sem refresh)
    - Animação ao mudar placar
    - Badge "AO VIVO" pulsante
  - **Estimativa:** 2h

- [ ] **TASK-5.4:** Criar hook `useRealtimeBets(userId)`
  - **Subscribe:** Apostas do usuário
  - **Eventos:** UPDATE (quando aposta é resolvida)
  - **Atualizar:** Saldo + Lista de apostas
  - **Estimativa:** 3h

#### **Notificações** 🟡 Média

- [ ] **TASK-5.5:** Criar tabela `notifications`
  - **Migration:** `009_create_notifications_table.sql`
  - **Campos:** id, user_id, type, title, message, read, created_at
  - **Estimativa:** 2h

- [ ] **TASK-5.6:** Criar service `notifications.service.js`
  - **Métodos:**
    - `create(userId, type, title, message)`
    - `getByUserId(userId, limit)`
    - `markAsRead(notificationId)`
    - `markAllAsRead(userId)`
  - **Estimativa:** 3h

- [ ] **TASK-5.7:** Criar componente `NotificationBell`
  - **Arquivo:** `components/notifications/notification-bell.tsx`
  - **Features:**
    - Ícone de sino (Header)
    - Badge com contador (unread)
    - Dropdown com lista de notificações
    - "Marcar todas como lidas"
  - **Estimativa:** 4h

- [ ] **TASK-5.8:** Implementar envio de notificações
  - **Quando:**
    - Aposta ganha/perde
    - Depósito confirmado
    - Série liberada (match favorito)
  - **Usar:** Trigger SQL ou backend (após resolver aposta)
  - **Estimativa:** 3h

---

### 📅 SPRINT 6: Integração PIX (Semana 6)

#### **Mercado Pago Setup** 🔴 Alta

- [ ] **TASK-6.1:** Criar conta Mercado Pago (sandbox)
  - **Link:** https://www.mercadopago.com.br/developers
  - **Obter:** Access Token, Public Key
  - **Estimativa:** 1h

- [ ] **TASK-6.2:** Instalar SDK do Mercado Pago
  - **Comando:** `npm install mercadopago`
  - **Configurar:** Em `backend/config/mercadopago.js`
  - **Estimativa:** 1h

- [ ] **TASK-6.3:** Criar service `payments.service.js`
  - **Métodos:**
    - `createPixPayment(userId, amount)` → Retorna QR Code
    - `checkPaymentStatus(paymentId)`
  - **Estimativa:** 4h

#### **Depósitos** 🔴 Alta

- [ ] **TASK-6.4:** Criar rota POST `/api/wallet/deposit`
  - **Input:** { amount } (em reais)
  - **Processo:**
    1. Validar: amount >= R$ 20,00
    2. Criar pagamento PIX (Mercado Pago)
    3. Retornar: QR Code, payment_id
  - **Estimativa:** 3h

- [ ] **TASK-6.5:** Criar webhook POST `/api/webhooks/mercadopago`
  - **Processo:**
    1. Validar assinatura (segurança)
    2. Verificar status = "approved"
    3. Creditar saldo do usuário
    4. Criar transação (tipo: "deposito")
    5. Enviar notificação
  - **Estimativa:** 4h

- [ ] **TASK-6.6:** Criar página `app/depositar/page.tsx`
  - **Layout:**
    - Formulário: Valor do depósito
    - Botão "Gerar QR Code PIX"
    - QR Code (img + string copiável)
    - Status: Aguardando pagamento → Confirmado
  - **Estimativa:** 4h

#### **Saques** 🟡 Média

- [ ] **TASK-6.7:** Criar campo `pix_key` em `users`
  - **Migration:** `010_add_pix_key_to_users.sql`
  - **Estimativa:** 30min

- [ ] **TASK-6.8:** Criar rota POST `/api/wallet/withdraw`
  - **Input:** { amount, pixKey }
  - **Validações:**
    - ✅ KYC aprovado
    - ✅ amount >= R$ 50,00
    - ✅ Saldo suficiente
    - ✅ Limite 1 saque/dia
  - **Processo:**
    1. Criar solicitação (status: "pendente")
    2. Debitar saldo (congelado)
    3. Admin aprova manualmente → Transferir via Mercado Pago
  - **Estimativa:** 5h

- [ ] **TASK-6.9:** Criar página `app/sacar/page.tsx`
  - **Estimativa:** 3h

---

## 🎯 FASE 3: ADMIN & POLIMENTO (Semanas 7-8)

### 📅 SPRINT 7: Painel Admin (Semana 7)

#### **Dashboard Admin** 🔴 Alta

- [ ] **TASK-7.1:** Criar rota `/admin` (middleware: adminOnly)
  - **Estimativa:** 1h

- [ ] **TASK-7.2:** Criar página `app/admin/page.tsx`
  - **Cards de métricas:**
    - Total de usuários
    - Total apostado (hoje/semana/mês)
    - Saldo em carteiras
    - Partidas ativas
  - **Estimativa:** 4h

- [ ] **TASK-7.3:** Criar gráficos (Chart.js ou Recharts)
  - **Gráficos:**
    - Apostas por dia (linha)
    - Usuários novos (barra)
    - GMV (área)
  - **Estimativa:** 4h

#### **CRUD Jogadores** 🟡 Média

- [ ] **TASK-7.4:** Criar página `app/admin/jogadores/page.tsx`
  - **Lista:** Todos os jogadores
  - **Ações:** Criar, Editar, Desativar
  - **Estimativa:** 4h

- [ ] **TASK-7.5:** Criar modal `CreatePlayerModal`
  - **Form:** Nome, Apelido, Foto (upload)
  - **Estimativa:** 3h

#### **CRUD Partidas** 🔴 Alta

- [ ] **TASK-7.6:** Criar página `app/admin/partidas/page.tsx`
  - **Lista:** Todas as partidas
  - **Filtros:** Status, Data
  - **Ações:** Criar, Editar, Cancelar
  - **Estimativa:** 5h

- [ ] **TASK-7.7:** Criar formulário `CreateMatchForm`
  - **Campos:**
    - Jogador 1, Jogador 2 (select)
    - Data/Hora
    - YouTube URL
    - Tipo de jogo
    - Regras (textarea → JSON)
    - Quantidade de séries
  - **Estimativa:** 6h

#### **Gestão de Séries** 🔴 Alta

- [ ] **TASK-7.8:** Criar página `app/admin/partidas/[id]/page.tsx`
  - **Exibir:**
    - Detalhes da partida
    - Lista de séries (com controles admin)
  - **Ações por série:**
    - Liberar para apostas (botão)
    - Atualizar placar (inputs inline)
    - Encerrar série (modal)
  - **Estimativa:** 6h

---

### 📅 SPRINT 8: KYC & Relatórios (Semana 8)

#### **Sistema de KYC** 🟡 Média

- [ ] **TASK-8.1:** Criar tabela `kyc_documents`
  - **Campos:** id, user_id, doc_type, doc_url, selfie_url, status
  - **Estimativa:** 2h

- [ ] **TASK-8.2:** Criar página `app/perfil/kyc/page.tsx`
  - **Form:** Upload de documento + selfie
  - **Status:** Pendente, Aprovado, Rejeitado
  - **Estimativa:** 4h

- [ ] **TASK-8.3:** Criar página admin `app/admin/kyc/page.tsx`
  - **Lista:** Todos os KYCs pendentes
  - **Ações:** Aprovar, Rejeitar (com motivo)
  - **Estimativa:** 4h

#### **Relatórios** 🟡 Média

- [ ] **TASK-8.4:** Criar página `app/admin/relatorios/page.tsx`
  - **Relatórios:**
    - Transações financeiras (exportar CSV)
    - Apostas por partida
    - Usuários mais ativos
    - Taxa de retenção
  - **Estimativa:** 5h

---

## 🎯 FASE 4: LAUNCH (Semanas 9-10)

### 📅 SPRINT 9: Testes & Correções (Semana 9)

- [ ] **TASK-9.1:** Testes E2E com Playwright (5 fluxos principais)
- [ ] **TASK-9.2:** Teste de carga (Artillery ou k6)
- [ ] **TASK-9.3:** Correção de bugs críticos
- [ ] **TASK-9.4:** Otimização de performance
- [ ] **TASK-9.5:** Lighthouse score > 90

---

### 📅 SPRINT 10: Deploy & Monitoramento (Semana 10)

- [ ] **TASK-10.1:** Deploy frontend (Vercel)
- [ ] **TASK-10.2:** Deploy backend (validar Supabase Pro)
- [ ] **TASK-10.3:** Configurar domínio (`sinucabet.com`)
- [ ] **TASK-10.4:** Configurar Sentry (error tracking)
- [ ] **TASK-10.5:** Configurar Google Analytics
- [ ] **TASK-10.6:** Documentação final (README, API docs)
- [ ] **TASK-10.7:** 🚀 **LAUNCH!**

---

## 📊 Tracking de Progresso

### **Sprint Atual:** Sprint 1 - Database & Models

**Progresso Geral:**
- ✅ Autenticação: 100%
- 📋 Database: 0%
- 📋 Backend APIs: 0%
- 📋 Frontend Dashboard: 0%
- 📋 Detalhes & Apostas: 0%
- 📋 Real-time: 0%
- 📋 Financeiro: 0%
- 📋 Admin: 0%

**Total:** 12.5% (1/8 fases completas)

---

## 🎯 Próxima Ação

### **AGORA: Iniciar Sprint 1**

1. ✅ Ler este documento completo
2. ✅ Validar PRD com stakeholder
3. 📋 **Executar TASK-1.1:** Criar migration `004_create_players_table.sql`

**Comando:**
```bash
cd backend/supabase/migrations
# Criar arquivo 004_create_players_table.sql
# Copiar código de PROXIMO_PASSO_DESENVOLVIMENTO.md
```

---

**Criado:** 05/11/2025  
**Versão:** 1.0  
**Próxima atualização:** Após conclusão de cada Sprint

🚀 **Vamos começar a construir!**



