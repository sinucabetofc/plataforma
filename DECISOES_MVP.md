# ✅ Decisões do MVP - SinucaBet
## Escopo Validado e Aprovado

**Data:** 05/11/2025  
**Status:** ✅ **APROVADO - INICIAR DESENVOLVIMENTO**  
**Versão PRD:** 1.1 (atualizado)

---

## 👥 PERSONAS CONFIRMADAS

### **Persona 1: João - O Apostador** 🎯
**Fluxo completo:**
1. ✅ Fazer cadastro
2. ✅ Depositar saldo (PIX)
3. ✅ Apostar em séries
4. ✅ Sacar ganhos (PIX ou manual)

**Features necessárias:**
- Cadastro (3 etapas)
- Login/Logout
- Dashboard de partidas
- Detalhes da partida + YouTube
- Formulário de aposta
- Carteira (saldo, depósito, saque, extrato)

---

### **Persona 2: Vinicius - O Administrador** 👨‍💼
**Responsabilidades:**
1. ✅ Subir todos os jogos (criar partidas)
2. ✅ Cadastrar jogadores
3. ✅ Adicionar link do YouTube (live)
4. ✅ Controlar e organizar tudo
5. ✅ Adicionar resultados das séries
6. ✅ Visualizar histórico de apostas
7. ✅ **NOVO:** Alterar saldo de usuários manualmente (adicionar/remover)
8. ✅ Aprovar saques manualmente (se necessário)

**Features necessárias:**
- Painel administrativo completo
- CRUD de jogadores
- CRUD de partidas
- Gestão de séries (liberar, atualizar placar, encerrar)
- Visualização de apostas por partida/série
- Gestão financeira (aprovar saques, ajustar saldos)
- Histórico completo de transações

**DIFERENCIAL:**
- Jogos podem ser cadastrados por **parceiros**
- Quando parceiro é selecionado → visualiza histórico de apostas e resultados

---

### **Persona 3: Maria - A Influencer/Youtuber** 📹
**Responsabilidades:**
1. ✅ Transmitir jogos no YouTube
2. ✅ Visualizar resultados das partidas
3. ✅ Ganhar % dos lucros dos jogos transmitidos

**Features necessárias:**
- Painel de influencer (dashboard customizado)
- Visualização de partidas e resultados
- Relatório de comissões (% dos lucros)
- Link para suas transmissões
- Estatísticas de apostas nas suas lives

**Modelo de comissão:**
- % sobre o total apostado nas partidas que ela transmite
- OU % sobre o lucro da casa nessas partidas
- Configurável por admin

---

## 🎯 FEATURES DO MVP (Confirmadas)

### ✅ **INCLUÍDAS NO MVP:**

#### **Autenticação** (Prioridade 1)
- ✅ **FR-001:** Cadastro (3 etapas)
- ✅ **FR-002:** Login/Logout
- ✅ **FR-004:** Perfil do usuário
- ⏭️ **FR-003:** Recuperação de senha → Fase 2
- ⏭️ **FR-005:** KYC → Fase 2

#### **Dashboard e Partidas** (Prioridade 1)
- ✅ **FR-006:** Dashboard principal
- ✅ **FR-007:** Detalhes da partida
- ✅ **FR-008:** Transmissão YouTube

#### **Sistema de Séries** (Prioridade 1)
- ✅ **FR-009:** Séries da partida
- ✅ **FR-010:** Liberação de série
- ✅ **FR-011:** Atualização de placar

#### **Sistema de Apostas** (Prioridade 1)
- ✅ **FR-012:** Criar aposta
- ✅ **FR-013:** Matching **MANUAL** (admin casa apostas)
- ✅ **FR-014:** Resolução de apostas
- ✅ **FR-015:** Cancelamento de apostas

#### **Carteira e Financeiro** (Prioridade 1)
- ✅ **FR-016:** Carteira digital
- ✅ **FR-017:** Depósitos via PIX
- ✅ **FR-018:** Saques via PIX (ou manual se complicado)
- ✅ **FR-019:** Transações
- ✅ **FR-020:** Extrato
- ✅ **NOVO:** Admin pode alterar saldo manualmente

**Decisão Saques:**
- Tentar integração PIX OUT (Mercado Pago)
- Se complicado: Usuário solicita → Admin aprova → Transfere manualmente → Dá baixa no sistema

#### **Painel Administrativo** (Prioridade 2 - após usuário)
- ✅ **FR-023:** Dashboard admin
- ✅ **FR-024:** Gestão de jogadores (CRUD)
- ✅ **FR-025:** Gestão de partidas (CRUD)
- ✅ **FR-026:** Gestão de séries
- ✅ **FR-027:** Gestão financeira (aprovar saques, ajustar saldos)
- ✅ **FR-028:** Gestão de usuários

#### **Painel de Influencer** (Prioridade 2)
- ✅ Dashboard de resultados
- ✅ Relatório de comissões
- ✅ Estatísticas de suas transmissões

---

### ⏭️ **ADIADAS PARA FASE 2:**
- ❌ KYC completo (upload docs)
- ❌ Recuperação de senha
- ❌ Notificações push
- ❌ Chat ao vivo
- ❌ Gamificação (rankings, badges)
- ❌ PWA instalável
- ❌ Dark mode

---

## 🏗️ STACK TECNOLÓGICO (Aprovado)

### **Frontend** ✅
- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- Shadcn UI
- SWR ou React Query

### **Backend** ✅
- Supabase (Database + Auth + Realtime)
- Express.js (APIs customizadas)
- PostgreSQL
- Row Level Security (RLS)

### **Integrações** ✅
- YouTube iframe API
- Mercado Pago (PIX)
- Supabase Realtime (placares ao vivo)

---

## 📋 ROADMAP AJUSTADO

### **FASE 1: Core do Apostador** (3-4 semanas)

#### **Sprint 1: Database & Models** (Semana 1)
- Migrations: players, matches, series, bets, transactions
- RLS em todas as tabelas
- Seeds de teste

#### **Sprint 2: Backend APIs** (Semana 1-2)
- Services e Controllers
- Rotas de apostas
- Sistema de matching manual

#### **Sprint 3: Frontend - Dashboard** (Semana 2-3)
- Lista de partidas
- Filtros
- Cards de partidas

#### **Sprint 4: Frontend - Detalhes & Apostas** (Semana 3-4)
- Página de detalhes
- YouTube player
- Formulário de aposta
- Real-time (placar ao vivo)

#### **Sprint 5: Financeiro** (Semana 4)
- Depósitos PIX
- Saques PIX (ou manual)
- Extrato de transações

---

### **FASE 2: Painel Administrativo** (2-3 semanas)

#### **Sprint 6: Admin - CRUD** (Semana 5-6)
- Dashboard admin
- CRUD jogadores
- CRUD partidas
- Gestão de séries

#### **Sprint 7: Admin - Financeiro** (Semana 6-7)
- Aprovar/rejeitar saques
- Ajustar saldo manualmente
- Relatórios financeiros
- Gestão de transações

#### **Sprint 8: Admin - Parceiros** (Semana 7)
- Sistema de parceiros
- Permissões (parceiro cria partidas)
- Visualização de histórico (quando parceiro selecionado)

---

### **FASE 3: Painel de Influencer** (1-2 semanas)

#### **Sprint 9: Influencer** (Semana 8)
- Dashboard de resultados
- Sistema de comissões
- Relatórios de ganhos
- Estatísticas de transmissões

---

### **FASE 4: Testes & Deploy** (1 semana)

#### **Sprint 10: Launch** (Semana 9)
- Testes E2E
- Correções
- Deploy produção
- Monitoramento

---

## 📊 MODELS AJUSTADOS

### **Tabela: users**
Adicionar campo:
```sql
role ENUM('apostador', 'admin', 'parceiro', 'influencer') DEFAULT 'apostador'
```

### **Tabela: matches**
Adicionar campos:
```sql
created_by UUID REFERENCES users(id), -- Quem criou (admin ou parceiro)
influencer_id UUID REFERENCES users(id), -- Influencer transmitindo
influencer_commission DECIMAL(5,2) DEFAULT 0.00 -- % de comissão
```

### **Tabela: transactions**
Tipo adicional:
```sql
type ENUM(... 'ajuste_manual_admin', 'comissao_influencer')
```

### **Nova Tabela: influencer_earnings**
```sql
CREATE TABLE influencer_earnings (
  id UUID PRIMARY KEY,
  influencer_id UUID REFERENCES users(id),
  match_id UUID REFERENCES matches(id),
  total_bets INTEGER, -- Total apostado na partida
  house_profit INTEGER, -- Lucro da casa
  commission_rate DECIMAL(5,2), -- % da comissão
  commission_amount INTEGER, -- Valor da comissão
  status ENUM('pendente', 'pago'),
  created_at TIMESTAMP
);
```

---

## 🎯 PRIORIDADE DE DESENVOLVIMENTO

### **ETAPA 1: Apostador (3-4 semanas)** 🔴 AGORA
1. Database completo
2. Backend APIs
3. Frontend Dashboard
4. Frontend Detalhes + Apostas
5. Financeiro (PIX)

**Resultado:** Apostador pode usar 100% da plataforma

---

### **ETAPA 2: Admin (2-3 semanas)** 🟡 DEPOIS
1. Painel admin
2. CRUD completo
3. Gestão financeira
4. Sistema de parceiros

**Resultado:** Admin pode gerenciar tudo

---

### **ETAPA 3: Influencer (1-2 semanas)** 🟢 POR ÚLTIMO
1. Painel de resultados
2. Sistema de comissões
3. Relatórios

**Resultado:** Influencer tem seu painel

---

## ✅ DECISÕES TÉCNICAS

### **Matching de Apostas:**
- ✅ **MANUAL** no MVP
- Admin casa apostas manualmente
- Interface: Ver todas as apostas da série → Casar manualmente
- Futuro (Fase 2): Automatizar com algoritmo

### **Saques PIX:**
- ✅ Tentar PIX OUT (Mercado Pago API)
- ✅ Se complicado: Fluxo manual
  1. Usuário solicita saque
  2. Status: "pendente_aprovacao"
  3. Admin aprova
  4. Admin transfere manualmente via Mercado Pago
  5. Admin marca como "pago" no sistema
  6. Sistema debita saldo

### **Ajuste Manual de Saldo:**
Nova feature no admin:
```
Botão: "Ajustar Saldo"
Input: Valor (positivo = adicionar, negativo = remover)
Motivo: Campo texto (obrigatório)
Confirmar → Cria transaction tipo "ajuste_manual_admin"
```

---

## 🚀 PRÓXIMAS AÇÕES

### **AGORA (Hoje):**
1. ✅ Decisões validadas
2. 📋 Atualizar PRD (versão 1.1)
3. 📋 Ajustar TASKS_POR_SPRINT.md
4. 🚀 **INICIAR SPRINT 1**

### **Sprint 1 - Semana 1:**
- [ ] Criar migrations (players, matches, series, bets, transactions, influencer_earnings)
- [ ] Aplicar no Supabase
- [ ] Criar services
- [ ] Popular com dados de teste

---

## 📝 OBSERVAÇÕES IMPORTANTES

### **Sistema de Parceiros:**
- Parceiro pode criar partidas
- Quando partida tem "parceiro" selecionado:
  - Parceiro visualiza histórico de apostas daquela partida
  - Parceiro visualiza resultados
  - Parceiro NÃO pode mexer em saldos/financeiro
- Admin vê tudo sempre

### **Sistema de Influencers:**
- Influencer vinculado a partida (campo `influencer_id`)
- Comissão configurável por partida
- Ao finalizar partida → Calcular comissão → Criar registro em `influencer_earnings`
- Influencer pode sacar suas comissões

---

## ✅ APROVAÇÃO FINAL

**Product Owner:** Vinicius Ambrozio  
**Data:** 05/11/2025  
**Status:** ✅ **APROVADO - SEGUIR PARA FASE 1**

---

**Próximo comando:** Iniciar Sprint 1 - Database & Models 🚀



