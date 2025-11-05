# SinucaBet - Plataforma de Apostas de Sinuca ao Vivo
## Product Requirements Document (PRD)

**Versão:** 1.0  
**Data:** 05/11/2025  
**Status:** Draft → Review  
**Autor:** Equipe SinucaBet

---

## 1. Introduction

### 1.1 Purpose
Este documento define os requisitos completos do produto **SinucaBet**, uma plataforma moderna de apostas em partidas de sinuca ao vivo. Serve como fonte definitiva de especificações para todos os stakeholders envolvidos no desenvolvimento.

### 1.2 Product Overview
**SinucaBet** é uma plataforma web moderna de apostas em partidas de sinuca ao vivo, inspirada na VagBet (líder de mercado) mas com:
- ✨ **UX/UI superior** - Design moderno com Shadcn UI
- 🚀 **Tecnologia de ponta** - Next.js 14, Supabase, Real-time
- 🔒 **Transparência total** - Transmissões ao vivo, auditoria completa
- 📱 **Mobile-first** - PWA instalável

**Diferenciais principais:**
- Apostas por **série individual** (não na partida completa)
- Transmissão ao vivo via **YouTube integrado**
- Notificações push em tempo real
- Sistema de saldo e carteira digital
- Painel administrativo completo

### 1.3 Target Audience

**Público Primário:**
- **Apostadores de sinuca** (18+ anos)
- Localização: Brasil (foco inicial)
- Dispositivo: 70% mobile, 30% desktop
- Perfil: Classe B/C, fãs de sinuca, busca entretenimento

**Público Secundário:**
- **Gerentes de casas de sinuca** - Organizam partidas
- **Parceiros/Afiliados** - Promovem a plataforma

**Características:**
- Familiaridade com apostas online
- Uso frequente de WhatsApp e YouTube
- Valorizam transparência e facilidade
- Buscam apostas de valor baixo (R$ 10-100)

### 1.4 Problem Statement

**Problemas atuais no mercado:**

1. **Falta de transparência** - Muitas plataformas não mostram as partidas ao vivo
2. **UX ruim** - Interfaces antigas, difíceis de usar no mobile
3. **Apostas engessadas** - Apenas aposta na partida completa, sem granularidade
4. **Falta de confiança** - Sem auditoria, sem histórico transparente
5. **Suporte precário** - Dificuldade de contato, resolução lenta

**Impacto:**
- Baixa retenção de usuários
- Desconfiança do público
- Experiência frustrante
- Mercado subutilizado

### 1.5 Solution Overview

**Como o SinucaBet resolve:**

1. **Transparência Total**
   - ✅ Transmissão ao vivo integrada
   - ✅ Histórico completo de partidas e apostas
   - ✅ Auditoria de transações

2. **UX Excepcional**
   - ✅ Interface mobile-first moderna
   - ✅ Design limpo com Shadcn UI
   - ✅ Onboarding simplificado (3 etapas)
   - ✅ PWA instalável

3. **Apostas Granulares**
   - ✅ Sistema de séries individual
   - ✅ Aposta série por série
   - ✅ Múltiplas oportunidades por partida

4. **Real-time**
   - ✅ Placar ao vivo (WebSockets)
   - ✅ Notificações push
   - ✅ Atualização instantânea de saldo

5. **Segurança e Confiança**
   - ✅ KYC obrigatório
   - ✅ PIX integrado (Mercado Pago)
   - ✅ Criptografia de dados
   - ✅ RLS no banco de dados

---

## 2. Target Users

### 2.1 User Personas

#### **Persona 1: João - O Apostador Regular**
- **Idade:** 28 anos
- **Ocupação:** Vendedor
- **Localização:** São Paulo, SP
- **Dispositivo:** Smartphone Android
- **Comportamento:**
  - Assiste partidas de sinuca no YouTube
  - Aposta R$ 20-50 por série
  - Usa WhatsApp para grupos de apostas
  - Busca transparência e facilidade
- **Dores:**
  - Plataformas antigas difíceis de usar
  - Falta de transmissão ao vivo
  - Demora no suporte
- **Objetivos:**
  - Apostar de forma fácil e rápida
  - Ver a partida ao vivo
  - Sacar ganhos rapidamente

#### **Persona 2: Carlos - O Gerente de Casa**
- **Idade:** 45 anos
- **Ocupação:** Dono de casa de sinuca
- **Localização:** Campinas, SP
- **Dispositivo:** Notebook + Smartphone
- **Comportamento:**
  - Organiza partidas semanais
  - Transmite no YouTube
  - Gerencia apostas localmente
- **Dores:**
  - Gestão manual de apostas (papel/WhatsApp)
  - Risco de inadimplência
  - Trabalho operacional alto
- **Objetivos:**
  - Automatizar gestão de apostas
  - Aumentar receita da casa
  - Atrair mais apostadores

#### **Persona 3: Maria - A Afiliada**
- **Idade:** 32 anos
- **Ocupação:** Influencer de sinuca
- **Localização:** Rio de Janeiro, RJ
- **Dispositivo:** Smartphone iOS + Desktop
- **Comportamento:**
  - 50k seguidores no Instagram
  - Cria conteúdo sobre sinuca
  - Busca monetização
- **Dores:**
  - Falta de programas de afiliados em sinuca
  - Dificuldade de trackear conversões
- **Objetivos:**
  - Gerar renda passiva
  - Oferecer valor aos seguidores
  - Comissões justas

### 2.2 User Needs

| Necessidade | Prioridade | Solução SinucaBet |
|-------------|-----------|-------------------|
| Transparência nas apostas | 🔴 Alta | Transmissão ao vivo + histórico |
| Facilidade de uso mobile | 🔴 Alta | Mobile-first + PWA |
| Saques rápidos | 🔴 Alta | PIX automático (D+1) |
| Apostas de baixo valor | 🟡 Média | Mínimo R$ 10,00 |
| Suporte rápido | 🟡 Média | WhatsApp + Chat ao vivo |
| Variedade de partidas | 🟡 Média | Múltiplas casas + horários |
| Notificações | 🟢 Baixa | Push notifications |
| Estatísticas | 🟢 Baixa | Histórico de jogadores |

### 2.3 Use Cases

#### **UC-001: Fazer uma Aposta**
**Ator:** Apostador (João)  
**Pré-condição:** Usuário logado com saldo ≥ R$ 10,00  
**Fluxo:**
1. João acessa o dashboard
2. Vê lista de partidas ao vivo
3. Clica em uma partida de interesse
4. Visualiza transmissão ao vivo e séries
5. Aguarda série ser liberada para apostas
6. Seleciona o jogador em quem quer apostar
7. Define o valor (ex: R$ 20,00)
8. Confirma a aposta
9. Sistema debita saldo e registra aposta
10. João recebe confirmação e acompanha ao vivo

**Pós-condição:** Aposta registrada, saldo debitado, notificação enviada  
**Fluxos alternativos:**
- 6a. Saldo insuficiente → Sistema exibe mensagem e sugere depósito
- 8a. Aposta já encerrada → Sistema bloqueia e exibe mensagem

#### **UC-002: Depositar Saldo via PIX**
**Ator:** Apostador (João)  
**Pré-condição:** Usuário logado e verificado (KYC)  
**Fluxo:**
1. João clica em "Depositar" no header
2. Informa valor desejado (mín. R$ 20,00)
3. Sistema gera QR Code PIX
4. João paga via app do banco
5. Sistema recebe confirmação (webhook Mercado Pago)
6. Saldo é creditado automaticamente
7. João recebe notificação de crédito

**Pós-condição:** Saldo atualizado, transação registrada  
**Tempo esperado:** < 30 segundos

#### **UC-003: Gerente Cria uma Partida**
**Ator:** Gerente (Carlos)  
**Pré-condição:** Usuário com role "gerente" ou "admin"  
**Fluxo:**
1. Carlos acessa painel administrativo
2. Clica em "Nova Partida"
3. Preenche formulário:
   - Jogador 1 e Jogador 2
   - Data e hora
   - Link do YouTube
   - Tipo de jogo e regras
4. Define quantas séries (ex: 3 séries)
5. Salva a partida
6. Sistema cria partida + 3 séries pendentes
7. Partida aparece no dashboard público

**Pós-condição:** Partida criada e visível para apostadores

---

## 3. Core Features and Requirements

### 3.1 Autenticação e Perfil

**FR-001: Cadastro de Usuário**
- ✅ Formulário em 3 etapas (dados pessoais, contato, segurança)
- ✅ Validação de CPF único e válido
- ✅ Validação de email único
- ✅ Senha forte (8+ caracteres, maiúscula, número, especial)
- ✅ Telefone em formato E.164
- ✅ Criação automática de carteira digital (saldo R$ 0,00)
- ✅ Integração com Supabase Auth

**FR-002: Login**
- ✅ Login via email + senha
- ✅ Tokens JWT gerenciados pelo Supabase
- ✅ Refresh token automático
- ✅ Sessão persistente (localStorage)
- ✅ Logout com limpeza de sessão

**FR-003: Recuperação de Senha**
- 📋 Envio de email com link de reset
- 📋 Token temporário (válido por 1h)
- 📋 Redefinição de senha

**FR-004: Perfil do Usuário**
- ✅ Visualização de dados
- 📋 Edição de nome, telefone, avatar
- 📋 Upload de foto de perfil (Supabase Storage)
- 📋 Histórico de apostas
- 📋 Estatísticas (total apostado, ganho, taxa de acerto)

**FR-005: KYC (Know Your Customer)**
- 📋 Upload de documento (RG ou CNH)
- 📋 Selfie com documento
- 📋 Validação manual ou automática (API)
- 📋 Status: pendente, aprovado, rejeitado
- 📋 Limite de R$ 100,00 sem KYC

### 3.2 Dashboard e Partidas

**FR-006: Dashboard Principal**
- ✅ Header com logo, saldo, notificações, menu
- 📋 Lista de partidas (próximas + ao vivo)
- 📋 Filtros: Modalidade (Sinuca/Futebol), Data, Status
- 📋 Card de partida com:
  - Horário e localização
  - Fotos e nomes dos jogadores
  - Link para YouTube
  - Tipo de jogo e regras
  - Status (Agendada, Ao vivo, Finalizada)

**FR-007: Detalhes da Partida**
- 📋 Informações completas da partida
- 📋 Player do YouTube embarcado
- 📋 Lista de séries (histórico + ativa)
- 📋 Placar em tempo real
- 📋 Formulário de aposta (série liberada)
- 📋 Chat ao vivo (opcional, fase 2)

**FR-008: Transmissão ao Vivo**
- 📋 Embed do YouTube responsivo
- 📋 Link para assistir no YouTube
- 📋 Indicador de "AO VIVO"
- 📋 Sincronização com status da série

### 3.3 Sistema de Séries

**FR-009: Séries da Partida**
- 📋 Cada partida tem N séries (definido pelo gerente)
- 📋 Séries numeradas (1, 2, 3...)
- 📋 Status: Pendente → Liberada → Em andamento → Encerrada
- 📋 Apenas 1 série "Liberada" por vez
- 📋 Placar independente por série
- 📋 Vencedor definido ao final

**FR-010: Liberação de Série**
- 📋 Gerente/Admin libera manualmente
- 📋 Sistema notifica todos os interessados
- 📋 Apostas habilitadas por 2-5 minutos (configurável)
- 📋 Após lock, nenhuma aposta é aceita

**FR-011: Atualização de Placar**
- 📋 Gerente atualiza placar em tempo real
- 📋 WebSocket/Realtime envia para todos os clientes
- 📋 Atualização instantânea na UI
- 📋 Log de alterações de placar

### 3.4 Sistema de Apostas

**FR-012: Criar Aposta**
- 📋 Usuário seleciona 1 jogador
- 📋 Define valor (mín. R$ 10,00)
- 📋 Botões de valor rápido: +10, +50, +100, +500, +1.000
- 📋 Validação de saldo disponível
- 📋 Confirmação visual antes de enviar
- 📋 Débito imediato do saldo
- 📋 Status: Pendente → Aceita → (Ganha/Perdida)

**FR-013: Matching de Apostas**
- 📋 Mostra "investimentos disponíveis do adversário"
- 📋 Sistema casa apostas opostas automaticamente
- 📋 Odds calculadas baseado em volume
- 📋 Taxa da casa: 5-10% do total

**FR-014: Resolução de Apostas**
- 📋 Ao encerrar série, sistema identifica vencedor
- 📋 Apostas ganhadoras recebem crédito
- 📋 Apostas perdedoras ficam como "perdida"
- 📋 Cálculo de retorno: (valor apostado × odds) - taxa
- 📋 Notificação de resultado

**FR-015: Cancelamento de Apostas**
- 📋 Apenas antes do início da série
- 📋 Reembolso total para o usuário
- 📋 Log de cancelamento

### 3.5 Carteira e Financeiro

**FR-016: Carteira Digital**
- ✅ Saldo em centavos (INTEGER)
- ✅ Tabela `wallet` vinculada a `users`
- 📋 Saldo sempre visível no header
- 📋 Histórico de transações

**FR-017: Depósitos via PIX**
- 📋 Integração com Mercado Pago
- 📋 Geração de QR Code PIX
- 📋 Webhook para confirmação automática
- 📋 Valor mínimo: R$ 20,00
- 📋 Crédito instantâneo após confirmação
- 📋 Registro de transação

**FR-018: Saques via PIX**
- 📋 Valor mínimo: R$ 50,00
- 📋 Validação de chave PIX cadastrada
- 📋 KYC obrigatório
- 📋 Processamento em até 24h (D+1)
- 📋 Limite de 1 saque por dia
- 📋 Taxa: R$ 0,00 (isento)

**FR-019: Transações**
- 📋 Tipos: depósito, saque, aposta, ganho, reembolso, bônus
- 📋 Cada transação registra: valor, saldo antes, saldo depois
- 📋 Descrição detalhada
- 📋 Timestamp preciso
- 📋 Imutável (não pode editar)

**FR-020: Extrato**
- 📋 Lista todas as transações do usuário
- 📋 Filtros: tipo, período, valor
- 📋 Exportação CSV/PDF
- 📋 Paginação (20 por página)

### 3.6 Notificações

**FR-021: Sistema de Notificações**
- 📋 Tabela `notifications` no banco
- 📋 Tipos:
  - Série liberada para apostas
  - Resultado de aposta (ganhou/perdeu)
  - Depósito confirmado
  - Saque processado
  - Partida favorita iniciando
- 📋 Badge no ícone de sino (contador)
- 📋 Lista de notificações (últimas 30 dias)
- 📋 Marcar como lida

**FR-022: Push Notifications**
- 📋 Service Worker (PWA)
- 📋 Permissão solicitada ao usuário
- 📋 Notificação de resultado de aposta (prioritário)
- 📋 Configurações: usuário pode desativar tipos

### 3.7 Painel Administrativo

**FR-023: Dashboard Admin**
- 📋 Acesso restrito (role: admin, gerente)
- 📋 Estatísticas:
  - Total de usuários
  - Total apostado hoje/semana/mês
  - Partidas ativas
  - Saldo total em carteiras
- 📋 Gráficos de crescimento

**FR-024: Gestão de Jogadores**
- 📋 CRUD completo
- 📋 Upload de foto
- 📋 Estatísticas (partidas, vitórias, win rate)
- 📋 Ativar/Desativar

**FR-025: Gestão de Partidas**
- 📋 CRUD completo
- 📋 Criar com jogadores selecionáveis
- 📋 Definir regras (JSON field)
- 📋 Link do YouTube
- 📋 Agendar data/hora
- 📋 Status (Agendada, Em andamento, Finalizada, Cancelada)

**FR-026: Gestão de Séries**
- 📋 Criar automaticamente ao criar partida
- 📋 Liberar série para apostas (botão)
- 📋 Atualizar placar em tempo real
- 📋 Encerrar série (define vencedor)
- 📋 Lock de apostas manual

**FR-027: Gestão Financeira**
- 📋 Visualizar todas as transações
- 📋 Aprovar/Rejeitar saques manualmente
- 📋 Relatório de faturamento
- 📋 Taxa da casa configurável

**FR-028: Gestão de Usuários**
- 📋 Listar todos os usuários
- 📋 Filtros: role, status, KYC
- 📋 Editar role (Jogador, Gerente, Admin)
- 📋 Bloquear/Desbloquear usuário
- 📋 Histórico de atividades

---

## 4. Non-Functional Requirements

### 4.1 Performance
- ⚡ **Tempo de resposta API:** < 500ms (p95)
- ⚡ **Tempo de carregamento página:** < 2s (FCP)
- ⚡ **Real-time latency:** < 100ms (WebSocket)
- ⚡ **Suporte concorrente:** 1.000+ usuários simultâneos
- ⚡ **Uptime:** 99.9% (SLA)

### 4.2 Scalability
- 📈 **Usuários:** 10k (ano 1) → 100k (ano 3)
- 📈 **Partidas/dia:** 50 (ano 1) → 500 (ano 3)
- 📈 **Apostas/hora:** 1k (pico) → 10k (pico futuro)
- 📈 **Database:** Supabase (escala automática)
- 📈 **Frontend:** Vercel Edge (global CDN)

### 4.3 Security
- 🔒 **Autenticação:** Supabase Auth (JWT)
- 🔒 **Autorização:** Row Level Security (RLS)
- 🔒 **Criptografia:** TLS 1.3 (transporte), AES-256 (dados sensíveis)
- 🔒 **Proteção CSRF:** Tokens CSRF em formulários
- 🔒 **Rate limiting:** 100 req/min por IP
- 🔒 **SQL Injection:** Prepared statements (Supabase)
- 🔒 **XSS:** Sanitização de inputs (Zod)
- 🔒 **Auditoria:** Logs de todas as transações financeiras
- 🔒 **Compliance:** LGPD (Lei Geral de Proteção de Dados)

### 4.4 Accessibility
- ♿ **WCAG 2.1:** Nível AA
- ♿ **Contraste:** Mínimo 4.5:1 (texto)
- ♿ **Navegação:** 100% teclado
- ♿ **Screen readers:** ARIA labels completos
- ♿ **Fontes:** Escaláveis (rem/em)
- ♿ **Focus visible:** Outline claro

### 4.5 Browser/Device Compatibility
- 🌐 **Navegadores:**
  - Chrome 90+ ✅
  - Firefox 88+ ✅
  - Safari 14+ ✅
  - Edge 90+ ✅
  - Mobile browsers (iOS Safari, Chrome Android) ✅
- 📱 **Dispositivos:**
  - Mobile: 320px - 768px (prioridade)
  - Tablet: 768px - 1024px
  - Desktop: 1024px+
- 📱 **PWA:** Instalável (Android/iOS)

---

## 5. Constraints and Limitations

### 5.1 Legal e Compliance
- ⚖️ Compliance com legislação brasileira de apostas e jogos
- ⚖️ Licenciamento necessário (consultar advogado especializado)
- ⚖️ Implementação de KYC obrigatório (Lei 9.613/98 - Lavagem de dinheiro)
- ⚖️ LGPD: Consentimento explícito, direito ao esquecimento

### 5.2 Técnicas
- 🔧 Row Level Security (RLS) ativado em TODAS as tabelas do Supabase
- 🔧 Integração PIX deve seguir padrões do Banco Central
- 🔧 Valores monetários SEMPRE em centavos (INTEGER) para evitar arredondamento
- 🔧 Auditoria completa de todas as transações financeiras (imutável)

### 5.3 Performance
- ⏱️ Tempo de resposta de APIs < 500ms (requisito hard)
- ⏱️ Suporte a pelo menos 1.000 usuários simultâneos
- ⏱️ Sistema 100% responsivo e mobile-first

### 5.4 Segurança
- 🔐 Armazenamento seguro de dados financeiros com criptografia
- 🔐 Nenhuma senha em texto plano (Supabase Auth hash)
- 🔐 Logs de acesso e alterações críticas

### 5.5 Orçamento e Recursos
- 💰 **Orçamento inicial:** R$ 0 - 500/mês (infraestrutura)
  - Supabase: Plano gratuito → Pro (R$ 150/mês)
  - Vercel: Plano gratuito → Pro (R$ 100/mês)
  - Mercado Pago: Taxa por transação (2.99%)
- 👥 **Equipe:** 1-2 desenvolvedores fullstack
- ⏰ **Timeline:** 10 semanas (MVP)

---

## 6. User Interface

### 6.1 Design Guidelines
- 🎨 **Design System:** Shadcn UI + Radix UI
- 🎨 **Framework CSS:** TailwindCSS
- 🎨 **Ícones:** Lucide Icons
- 🎨 **Fontes:** Inter (sans-serif)
- 🎨 **Paleta de cores:**
  - Primary: Verde escuro (`#1a4d2e`)
  - Secondary: Amarelo/Laranja (`#ffa500`)
  - Background: Branco/Cinza claro
  - Cards: Cinza escuro (`#2d2d2d`)
  - Success: Verde (`#10b981`)
  - Error: Vermelho (`#ef4444`)

### 6.2 Key Screens/Interactions

**Tela 1: Dashboard**
- Header fixo com logo, saldo, notificações, menu
- Filtros de partidas (tabs: Sinuca, Futebol)
- Grid de cards de partidas (2 colunas mobile, 3+ desktop)
- Scroll infinito ou paginação

**Tela 2: Detalhes da Partida**
- Hero section com jogadores e info
- Player do YouTube (16:9 responsivo)
- Lista de séries (accordion ou cards)
- Formulário de aposta (sticky bottom em mobile)

**Tela 3: Perfil**
- Avatar, nome, saldo
- Tabs: Dados, Apostas, Transações, KYC
- Botões: Editar, Depositar, Sacar

**Tela 4: Admin - Dashboard**
- Cards com métricas (Usuários, Apostas, Faturamento)
- Gráficos (Chart.js ou Recharts)
- Lista de partidas ativas
- Ações rápidas

**Interações:**
- 🎯 **Aposta:** Selecionar jogador → Valor → Confirmar (2 cliques)
- 🎯 **Depósito:** Valor → QR Code → Aguardar (< 30s)
- 🎯 **Notificação:** Badge → Abrir lista → Marcar como lida

### 6.3 Mockups/Wireframes
- 📋 Ver `ANALISE_VAGBET.md` seção "Wireframes de Referência"
- 📋 Screenshots da VagBet em `.playwright-mcp/vagbet-*.png`
- 📋 Protótipos Figma (a criar - opcional)

---

## 7. Data Requirements

### 7.1 Data Models

**Principais entidades:**

```sql
-- Users (Auth)
auth.users (Supabase Auth - gerenciado)

-- Users (Profile)
public.users
  - id (UUID, FK auth.users)
  - name, email, cpf, phone
  - role (enum: jogador, gerente, admin)
  - kyc_status (enum: pendente, aprovado, rejeitado)

-- Wallet
public.wallet
  - id, user_id (FK users)
  - balance (INTEGER, centavos)

-- Players
public.players
  - id, name, nickname, photo_url
  - total_matches, total_wins, win_rate

-- Matches
public.matches
  - id, scheduled_at, location, sport
  - player1_id, player2_id (FK players)
  - status, youtube_url, game_rules (JSONB)

-- Series
public.series
  - id, match_id (FK matches), serie_number
  - status, betting_enabled
  - player1_score, player2_score, winner_player_id

-- Bets
public.bets
  - id, user_id, serie_id, chosen_player_id
  - amount, potential_return, status
  - placed_at, resolved_at

-- Transactions
public.transactions
  - id, wallet_id, bet_id (nullable)
  - type, amount, balance_before, balance_after
  - description, metadata (JSONB)

-- Notifications
public.notifications (futuro)
  - id, user_id, type, title, message
  - read, created_at
```

**Relacionamentos:**
- users 1:1 wallet
- users 1:N bets
- wallet 1:N transactions
- players N:M matches (via player1_id, player2_id)
- matches 1:N series
- series 1:N bets
- bets 1:1 transactions (tipo "aposta")

### 7.2 Data Storage
- **Database:** PostgreSQL (Supabase)
- **Storage de arquivos:** Supabase Storage (fotos, documentos KYC)
- **Cache:** Vercel Edge Cache (páginas estáticas)
- **Session:** localStorage (JWT token)
- **Logs:** Supabase Logs + Sentry (erros)

### 7.3 Data Privacy
- 🔒 **LGPD Compliance:**
  - Consentimento explícito no cadastro
  - Política de privacidade clara
  - Direito de acesso aos dados
  - Direito ao esquecimento (soft delete)
  - DPO (Data Protection Officer) designado

- 🔒 **Dados sensíveis:**
  - CPF: criptografado (AES-256)
  - Telefone: criptografado
  - Documentos KYC: Supabase Storage (privado, RLS)
  - Senhas: hash bcrypt (Supabase Auth)

- 🔒 **Retenção:**
  - Dados pessoais: até solicitação de exclusão
  - Transações financeiras: 5 anos (obrigação legal)
  - Logs de acesso: 6 meses

- 🔒 **Compartilhamento:**
  - Nenhum dado compartilhado com terceiros sem consentimento
  - APIs externas: apenas necessário (Mercado Pago = transações)

---

## 8. Integration Requirements

### 8.1 External Systems

**1. Supabase**
- Auth (autenticação JWT)
- Database (PostgreSQL)
- Storage (arquivos)
- Realtime (WebSocket)
- Edge Functions (serverless)

**2. Mercado Pago**
- API de pagamentos PIX
- Geração de QR Code
- Webhooks (confirmação de pagamento)
- Saques via transferência

**3. YouTube**
- YouTube iframe API (embed)
- Detecção de live streaming
- Player events (play, pause, end)

**4. WhatsApp Business API** (opcional, fase 2)
- Suporte via chat
- Notificações de transações
- Confirmação de apostas

**5. Sentry** (monitoramento)
- Error tracking
- Performance monitoring
- User feedback

### 8.2 APIs

**APIs a desenvolver:**

**Auth API**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

**Users API**
```
GET  /api/users/me
PUT  /api/users/me
GET  /api/users/:id (admin)
PUT  /api/users/:id/role (admin)
```

**Matches API**
```
GET  /api/matches (public)
GET  /api/matches/:id (public)
POST /api/matches (admin/gerente)
PUT  /api/matches/:id (admin/gerente)
DELETE /api/matches/:id (admin)
```

**Series API**
```
GET  /api/series/:matchId (public)
POST /api/series/:matchId (admin/gerente)
PUT  /api/series/:id/status (admin/gerente)
PUT  /api/series/:id/score (admin/gerente)
```

**Bets API**
```
GET  /api/bets/my (autenticado)
POST /api/bets (autenticado)
GET  /api/bets/:id (owner ou admin)
DELETE /api/bets/:id (owner, antes de iniciar)
```

**Wallet API**
```
GET  /api/wallet/balance (autenticado)
GET  /api/wallet/transactions (autenticado)
POST /api/wallet/deposit (autenticado)
POST /api/wallet/withdraw (autenticado)
```

**Admin API**
```
GET  /api/admin/stats (admin)
GET  /api/admin/users (admin)
GET  /api/admin/transactions (admin)
```

**Webhooks**
```
POST /api/webhooks/mercadopago (confirmação PIX)
POST /api/webhooks/supabase (realtime events)
```

---

## 9. Deployment and Operations

### 9.1 Hosting Requirements

**Frontend (Next.js)**
- **Provider:** Vercel
- **Plano:** Hobby (dev) → Pro (prod)
- **Features:**
  - Edge Functions (serverless)
  - Global CDN
  - Automatic HTTPS
  - Preview deployments (PRs)
  - Analytics

**Backend (API + Database)**
- **Provider:** Supabase
- **Plano:** Free (dev) → Pro (prod)
- **Features:**
  - PostgreSQL 15+
  - Row Level Security
  - Real-time subscriptions
  - Storage (100GB)
  - Edge Functions (Deno)

**Domínio**
- `sinucabet.com` (a registrar)
- `app.sinucabet.com` (aplicação)
- `admin.sinucabet.com` (painel admin)

### 9.2 Monitoring

**Ferramentas:**
1. **Vercel Analytics** - Performance web vitals
2. **Supabase Dashboard** - Database metrics, queries
3. **Sentry** - Error tracking, stack traces
4. **LogRocket** (opcional) - Session replay
5. **Google Analytics** - Comportamento de usuário

**Alertas:**
- 🚨 Erro 500 (> 10 em 5 min)
- 🚨 Latência API > 1s (p95)
- 🚨 Database CPU > 80%
- 🚨 Saldo negativo em wallet (bug crítico)
- 🚨 Downtime > 1 min

**Dashboards:**
- Uptime e latência (Vercel)
- Queries lentas (Supabase)
- Erros por página (Sentry)
- Funil de conversão (GA)

### 9.3 Backup and Recovery

**Database Backup (Supabase Pro)**
- **Frequência:** Diário (automático)
- **Retenção:** 7 dias (point-in-time recovery)
- **Storage:** Replicado (multi-AZ)
- **Teste de restore:** Mensal

**Disaster Recovery Plan**
- 🔥 **RTO (Recovery Time Objective):** 4 horas
- 🔥 **RPO (Recovery Point Objective):** 1 hora (último backup)
- 🔥 **Procedimento:**
  1. Identificar incidente (monitoring alerta)
  2. Comunicar stakeholders
  3. Restore de backup (Supabase)
  4. Validar integridade dos dados
  5. Re-deploy aplicação (Vercel)
  6. Testar funcionalidades críticas
  7. Comunicar resolução

**Plano de Contingência:**
- 📋 Manter backup local semanal (dump SQL)
- 📋 Runbook documentado (Notion/Confluence)
- 📋 Contatos de emergência (Supabase, Vercel)

---

## 10. Timeline and Milestones

### **FASE 1: MVP Core** (Semanas 1-4)
**Objetivo:** Sistema funcional de apostas

| Sprint | Entregáveis | Status |
|--------|-------------|--------|
| **Sprint 1** (Sem 1) | Migrations (Players, Matches, Series, Bets, Transactions) | 📋 |
| **Sprint 2** (Sem 2) | Backend APIs (Services + Controllers) | 📋 |
| **Sprint 3** (Sem 3) | Frontend Dashboard (Lista de partidas) | 📋 |
| **Sprint 4** (Sem 4) | Detalhes da Partida + Apostas + YouTube | 📋 |

**Milestone:** MVP funcional (aposta de ponta a ponta)

---

### **FASE 2: Real-time & Financeiro** (Semanas 5-6)
**Objetivo:** Experiência em tempo real e pagamentos

| Sprint | Entregáveis | Status |
|--------|-------------|--------|
| **Sprint 5** (Sem 5) | Supabase Realtime (placares), Notificações | 📋 |
| **Sprint 6** (Sem 6) | Integração PIX (Mercado Pago), Depósitos, Saques | 📋 |

**Milestone:** Financeiro completo + Real-time

---

### **FASE 3: Admin & Polimento** (Semanas 7-8)
**Objetivo:** Painel administrativo e ajustes

| Sprint | Entregáveis | Status |
|--------|-------------|--------|
| **Sprint 7** (Sem 7) | Painel Admin (CRUD completo) | 📋 |
| **Sprint 8** (Sem 8) | KYC, Relatórios, Gestão de usuários | 📋 |

**Milestone:** Sistema completo para operação

---

### **FASE 4: Launch** (Semanas 9-10)
**Objetivo:** Preparar e lançar

| Sprint | Entregáveis | Status |
|--------|-------------|--------|
| **Sprint 9** (Sem 9) | Testes E2E, Correções, Performance | 📋 |
| **Sprint 10** (Sem 10) | Deploy produção, Monitoramento, Documentação | 📋 |

**Milestone:** 🚀 LAUNCH!

---

## 11. Success Metrics

### **Métricas de Produto (KPIs)**

**Aquisição**
- 📊 **Novos cadastros/semana:** Objetivo 100+ (mês 1)
- 📊 **Taxa de conversão (visita → cadastro):** > 5%
- 📊 **Custo de aquisição (CAC):** < R$ 20,00/usuário

**Engajamento**
- 📊 **Usuários ativos diários (DAU):** > 20% da base
- 📊 **Tempo médio na plataforma:** > 10 min/sessão
- 📊 **Apostas por usuário/semana:** > 3
- 📊 **Partidas assistidas:** > 50% dos usuários

**Retenção**
- 📊 **Retenção D7:** > 40%
- 📊 **Retenção D30:** > 20%
- 📊 **Churn mensal:** < 10%

**Financeiro**
- 📊 **GMV (Gross Merchandise Value):** R$ 50k/mês (mês 3)
- 📊 **Receita (taxa da casa):** R$ 5k/mês (mês 3)
- 📊 **LTV (Lifetime Value):** > R$ 100/usuário
- 📊 **LTV/CAC ratio:** > 3:1

**Técnico**
- 📊 **Uptime:** > 99.9%
- 📊 **Tempo de resposta API:** < 500ms (p95)
- 📊 **Erro rate:** < 0.1%
- 📊 **Page load:** < 2s (FCP)

### **Metas por Fase**

**Fim da Fase 1 (MVP):**
- ✅ 50 usuários beta testando
- ✅ 10 partidas cadastradas
- ✅ 100 apostas realizadas
- ✅ Uptime > 95%

**Fim da Fase 2 (Real-time):**
- ✅ 200 usuários ativos
- ✅ R$ 5k depositados
- ✅ Real-time funcionando (< 100ms latency)

**Fim da Fase 3 (Admin):**
- ✅ Painel admin completo
- ✅ 3 gerentes operando
- ✅ KYC de 50% dos usuários

**Launch (Fase 4):**
- 🚀 500 usuários cadastrados
- 🚀 R$ 20k GMV no primeiro mês
- 🚀 NPS > 50

---

## 12. Open Questions

### **Questões a Resolver:**

**Legal/Compliance**
- ❓ Qual licença é necessária para operar apostas no Brasil?
- ❓ Precisamos de parceria com casa de apostas regulamentada?
- ❓ Como funciona a tributação dos ganhos? (IR)

**Produto**
- ❓ Implementar chat ao vivo entre apostadores?
- ❓ Gamificação (rankings, badges)?
- ❓ Sistema de afiliados já no MVP?
- ❓ Suporte a múltiplas moedas (futuro internacional)?

**Técnico**
- ❓ Usar WebSocket próprio ou Supabase Realtime?
- ❓ Cache de queries (Redis) ou apenas Edge Cache?
- ❓ Testes: Jest + React Testing Library ou Playwright E2E?

**Financeiro**
- ❓ Qual a taxa da casa ideal? (5%, 10%, variável?)
- ❓ Bônus de boas-vindas? (ex: R$ 10 grátis)
- ❓ Programa de fidelidade?

**Operacional**
- ❓ Contratar suporte 24/7 ou apenas horário comercial?
- ❓ Validação KYC manual ou automática (API)?
- ❓ Quantos gerentes de casa inicialmente?

---

## 13. Appendix

### 13.1 Glossário
- **Série:** Subdivisão de uma partida de sinuca. Cada série tem placar independente.
- **Matching:** Casa de apostas automaticamente casa apostas opostas.
- **KYC:** Know Your Customer - validação de identidade.
- **GMV:** Gross Merchandise Value - valor total apostado.
- **LTV:** Lifetime Value - valor total que um usuário gera.
- **CAC:** Customer Acquisition Cost - custo para adquirir um usuário.

### 13.2 Referências
- **Análise da VagBet:** `ANALISE_VAGBET.md`
- **Roadmap de Desenvolvimento:** `PROXIMO_PASSO_DESENVOLVIMENTO.md`
- **Status Atual:** `RESUMO_FINAL_CORRECAO.md`
- **VagBet (Referência):** https://vagbet.com

### 13.3 Aprovações
- [ ] Product Owner: ___________________ Data: ___/___/___
- [ ] Tech Lead: ___________________ Data: ___/___/___
- [ ] Legal: ___________________ Data: ___/___/___

---

**Criado:** 05/11/2025  
**Versão:** 1.0  
**Próxima Revisão:** Após Sprint 2

🎯 **Este documento é vivo e será atualizado conforme o produto evolui.**



