# ✅ Checklist de Validação - PRD SinucaBet

**Data:** 05/11/2025  
**Versão PRD:** 1.0  
**Revisor:** ___________________  
**Status:** Em Revisão

---

## 📋 Como Usar Este Checklist

Revise cada seção e marque:
- ✅ **Aprovado** - Está perfeito, pode seguir
- ⚠️ **Ajustar** - Precisa de pequenas alterações
- ❌ **Revisar** - Precisa de mudanças significativas
- 💬 **Discutir** - Precisa de alinhamento com equipe

---

## 1️⃣ VISÃO DO PRODUTO

### **1.1 Objetivo Principal**
- [ ] ✅ O objetivo está claro: "Plataforma de apostas de sinuca ao vivo"?
- [ ] ✅ Os diferenciais estão bem definidos (vs VagBet)?
- [ ] ✅ A proposta de valor faz sentido?

**Notas:**
```
_____________________________________________
_____________________________________________
```

---

### **1.2 Público-Alvo**

- [ ] ✅ **Persona 1 (João - Apostador)** representa bem o público?
- [ ] ✅ **Persona 2 (Carlos - Gerente)** é relevante para o MVP?
- [ ] ✅ **Persona 3 (Maria - Afiliada)** deve estar no MVP ou pode ser Fase 2?

**Decisão sobre Personas:**
- [ ] Manter as 3 personas no MVP
- [ ] Focar só em "Apostador" no MVP
- [ ] Adicionar outra persona

**Notas:**
```
_____________________________________________
_____________________________________________
```

---

### **1.3 Problem Statement**

- [ ] ✅ Os problemas listados são reais/validados?
  - Falta de transparência
  - UX ruim
  - Apostas engessadas
  - Falta de confiança
  - Suporte precário

- [ ] ✅ Algum problema importante está faltando?

**Problemas adicionais:**
```
_____________________________________________
_____________________________________________
```

---

## 2️⃣ FEATURES E FUNCIONALIDADES

### **2.1 Features Essenciais (MVP)**

Revise cada feature e decida: **MVP ou Fase 2?**

#### **Autenticação** (FR-001 a FR-005)
- [ ] ✅ FR-001: Cadastro (3 etapas) → **MVP**
- [ ] ✅ FR-002: Login → **MVP**
- [ ] ⏭️ FR-003: Recuperação de senha → MVP ou Fase 2?
- [ ] ✅ FR-004: Perfil do usuário → **MVP**
- [ ] ⏭️ FR-005: KYC → MVP ou Fase 2?

**Decisão KYC:**
- [ ] KYC completo no MVP (upload documento + validação)
- [ ] KYC simplificado (apenas CPF) no MVP
- [ ] KYC apenas na Fase 2

---

#### **Dashboard e Partidas** (FR-006 a FR-008)
- [ ] ✅ FR-006: Dashboard principal → **MVP**
- [ ] ✅ FR-007: Detalhes da partida → **MVP**
- [ ] ✅ FR-008: Transmissão YouTube → **MVP**

**Comentários:**
```
_____________________________________________
```

---

#### **Sistema de Séries** (FR-009 a FR-011)
- [ ] ✅ FR-009: Séries da partida → **MVP**
- [ ] ✅ FR-010: Liberação de série → **MVP**
- [ ] ✅ FR-011: Atualização de placar → **MVP**

**Comentários:**
```
_____________________________________________
```

---

#### **Sistema de Apostas** (FR-012 a FR-015)
- [ ] ✅ FR-012: Criar aposta → **MVP**
- [ ] ⏭️ FR-013: Matching de apostas → MVP ou Fase 2?
- [ ] ✅ FR-014: Resolução de apostas → **MVP**
- [ ] ✅ FR-015: Cancelamento de apostas → **MVP**

**Decisão Matching:**
- [ ] Sistema de matching completo no MVP
- [ ] Matching manual (admin casa apostas) no MVP
- [ ] Apenas apostas diretas (sem matching) no MVP

---

#### **Carteira e Financeiro** (FR-016 a FR-020)
- [ ] ✅ FR-016: Carteira digital → **MVP** (já existe!)
- [ ] ⏭️ FR-017: Depósitos via PIX → MVP ou Fase 2?
- [ ] ⏭️ FR-018: Saques via PIX → MVP ou Fase 2?
- [ ] ✅ FR-019: Transações → **MVP**
- [ ] ✅ FR-020: Extrato → **MVP**

**Decisão Financeiro:**
- [ ] PIX completo no MVP (Sprint 6)
- [ ] Créditos manuais (admin) no MVP, PIX na Fase 2
- [ ] Usar "saldo fictício" no MVP para testes

---

#### **Notificações** (FR-021 a FR-022)
- [ ] ⏭️ FR-021: Sistema de notificações → MVP ou Fase 2?
- [ ] ⏭️ FR-022: Push notifications → MVP ou Fase 2?

**Decisão:**
- [ ] Notificações completas no MVP (Sprint 5)
- [ ] Apenas notificações in-app (sem push) no MVP
- [ ] Notificações apenas na Fase 2

---

#### **Painel Administrativo** (FR-023 a FR-028)
- [ ] ✅ FR-023: Dashboard admin → **MVP**
- [ ] ✅ FR-024: Gestão de jogadores → **MVP**
- [ ] ✅ FR-025: Gestão de partidas → **MVP**
- [ ] ✅ FR-026: Gestão de séries → **MVP**
- [ ] ⏭️ FR-027: Gestão financeira → MVP ou Fase 2?
- [ ] ⏭️ FR-028: Gestão de usuários → MVP ou Fase 2?

**Comentários:**
```
_____________________________________________
```

---

## 3️⃣ REQUISITOS NÃO-FUNCIONAIS

### **3.1 Performance**
- [ ] ✅ Tempo de resposta API < 500ms é realista?
- [ ] ✅ Suporte a 1.000 usuários simultâneos é suficiente para MVP?
- [ ] ✅ Uptime 99.9% é necessário desde o início?

**Ajustes necessários:**
```
_____________________________________________
```

---

### **3.2 Segurança**
- [ ] ✅ RLS em todas as tabelas está correto?
- [ ] ✅ Criptografia de dados sensíveis (CPF) é obrigatória?
- [ ] ✅ Auditoria de transações financeiras está adequada?

**Questões de compliance:**
- [ ] Temos advogado para consultar sobre licenciamento?
- [ ] LGPD: Temos política de privacidade pronta?
- [ ] KYC: Qual nível de validação é obrigatório?

**Ações necessárias:**
```
_____________________________________________
```

---

### **3.3 Escalabilidade**
- [ ] ✅ Estimativa de crescimento (10k → 100k usuários) é realista?
- [ ] ✅ Infraestrutura Supabase + Vercel suporta esse crescimento?

**Comentários:**
```
_____________________________________________
```

---

## 4️⃣ CONSTRAINTS E LIMITAÇÕES

### **4.1 Legal**
⚠️ **CRÍTICO:** Resolver antes do desenvolvimento!

- [ ] ❓ Precisamos de licença para operar apostas?
- [ ] ❓ Qual o status legal de apostas de sinuca no Brasil?
- [ ] ❓ Precisamos de parceria com casa regulamentada?
- [ ] ❓ Como funciona a tributação dos ganhos (IR)?

**Status:**
- [ ] Consultar advogado especializado agendado
- [ ] Aguardando resposta
- [ ] Resolução em andamento
- [ ] Não aplicável (justificar):

```
_____________________________________________
```

---

### **4.2 Orçamento**
- [ ] ✅ R$ 0-500/mês de infraestrutura é suficiente?
  - Supabase Free → Pro (R$ 150/mês)
  - Vercel Free → Pro (R$ 100/mês)
  - Mercado Pago: 2.99% por transação

- [ ] ✅ Há budget para:
  - [ ] Domínio (R$ 40/ano)
  - [ ] SSL (incluído no Vercel)
  - [ ] Sentry (R$ 26/mês)
  - [ ] Serviços de email (R$ 50/mês)

**Budget aprovado:** R$ __________ /mês

---

### **4.3 Timeline**
- [ ] ✅ 10 semanas para MVP é realista?
- [ ] ✅ Equipe de 1-2 devs fullstack está disponível?
- [ ] ✅ Dedicação: Full-time ou Part-time?

**Ajustes de timeline:**
- [ ] Manter 10 semanas
- [ ] Estender para: _____ semanas
- [ ] Reduzir escopo para: _____ semanas

---

## 5️⃣ STACK TECNOLÓGICO

### **5.1 Frontend**
- [ ] ✅ Next.js 14+ (App Router) → Aprovado?
- [ ] ✅ TypeScript → Aprovado?
- [ ] ✅ TailwindCSS → Aprovado?
- [ ] ✅ Shadcn UI → Aprovado?

**Alternativas consideradas:**
```
_____________________________________________
```

---

### **5.2 Backend**
- [ ] ✅ Supabase (Database + Auth + Realtime) → Aprovado?
- [ ] ✅ Express.js (APIs) → Aprovado?
- [ ] ⏭️ Considerar Supabase Edge Functions ao invés de Express?

**Decisão:**
- [ ] Manter Express.js
- [ ] Migrar para Supabase Edge Functions
- [ ] Híbrido (Edge Functions + Express para casos específicos)

---

### **5.3 Integrações**
- [ ] ✅ YouTube API → Aprovado?
- [ ] ✅ Mercado Pago → Aprovado ou considerar outra (Stripe, PagSeguro)?
- [ ] ⏭️ WhatsApp Business API → MVP ou Fase 2?

**Decisão Pagamentos:**
- [ ] Mercado Pago (PIX nativo no Brasil)
- [ ] Stripe (internacional)
- [ ] PagSeguro
- [ ] Outro: __________

---

## 6️⃣ DATA MODELS

### **6.1 Estrutura de Dados**

Revisar cada tabela:

- [ ] ✅ **users** - Campos suficientes?
- [ ] ✅ **wallet** - Estrutura adequada?
- [ ] ✅ **players** - Adicionar campos? (ex: ranking, categoria)
- [ ] ✅ **matches** - Campo `game_rules` (JSONB) é flexível o suficiente?
- [ ] ✅ **series** - Status corretos? (pendente, liberada, em_andamento, encerrada)
- [ ] ✅ **bets** - Sistema de matching está bem modelado?
- [ ] ✅ **transactions** - Auditoria completa?

**Campos adicionais necessários:**
```
Tabela: ___________
Campos: ___________
Motivo: ___________
```

---

## 7️⃣ PRIORIZAÇÃO DE SPRINTS

### **Revisão do Roadmap:**

#### **FASE 1: MVP Core (4 semanas)**
- [ ] ✅ Sprint 1: Database & Models → Prioridade correta?
- [ ] ✅ Sprint 2: Backend APIs → Prioridade correta?
- [ ] ✅ Sprint 3: Frontend Dashboard → Prioridade correta?
- [ ] ✅ Sprint 4: Detalhes & Apostas → Prioridade correta?

**Ajustes:**
```
_____________________________________________
```

---

#### **FASE 2: Real-time & Financeiro (2 semanas)**
- [ ] ⏭️ Sprint 5: Real-time → Necessário no MVP?
- [ ] ⏭️ Sprint 6: PIX → Necessário no MVP?

**Decisão:**
- [ ] Manter Fase 2 no MVP (10 semanas total)
- [ ] Mover Fase 2 para pós-MVP
- [ ] Fazer apenas Sprint 5 (Real-time), Sprint 6 depois

---

#### **FASE 3: Admin (2 semanas)**
- [ ] ✅ Sprint 7: Painel Admin → Essencial para operar
- [ ] ⏭️ Sprint 8: KYC & Relatórios → Pode ser pós-MVP?

**Decisão:**
- [ ] Manter Sprint 7 no MVP
- [ ] Fazer Sprint 7 simplificado (CRUD básico)
- [ ] Adiar toda Fase 3 para pós-MVP

---

## 8️⃣ SUCCESS METRICS

### **8.1 KPIs Definidos**

As métricas fazem sentido?

- [ ] ✅ Novos cadastros/semana: 100+ (mês 1)
- [ ] ✅ DAU: > 20% da base
- [ ] ✅ Retenção D7: > 40%
- [ ] ✅ GMV: R$ 50k/mês (mês 3)

**Ajustar metas:**
```
_____________________________________________
```

---

### **8.2 Como Medir?**

- [ ] ✅ Google Analytics configurado?
- [ ] ✅ Mixpanel ou Amplitude para eventos?
- [ ] ✅ Dashboard de métricas (Metabase, Redash)?

**Ferramentas escolhidas:**
```
_____________________________________________
```

---

## 9️⃣ OPEN QUESTIONS

### **Questões a Resolver ANTES de Começar:**

#### **Legal** 🔴 CRÍTICO
- [ ] ❓ Licenciamento de apostas resolvido?
- [ ] ❓ Tributação esclarecida?
- [ ] ❓ Termos de uso revisados por advogado?

**Status:** ___________________

---

#### **Produto** 🟡 IMPORTANTE
- [ ] ❓ Chat ao vivo entre apostadores: MVP ou Fase 2?
- [ ] ❓ Gamificação (rankings): MVP ou Fase 2?
- [ ] ❓ Sistema de afiliados: MVP ou Fase 2?

**Decisões:**
```
_____________________________________________
```

---

#### **Técnico** 🟢 PODE DECIDIR DURANTE
- [ ] ❓ WebSocket próprio ou Supabase Realtime? → Usar Supabase
- [ ] ❓ Cache (Redis)? → Usar Edge Cache (Vercel)
- [ ] ❓ Testes: Jest ou Playwright? → Playwright E2E

---

#### **Financeiro** 🟡 IMPORTANTE
- [ ] ❓ Taxa da casa: 5%, 10%, variável?
- [ ] ❓ Bônus de boas-vindas: Sim ou Não?
- [ ] ❓ Programa de fidelidade: MVP ou Fase 2?

**Decisões:**
```
Taxa da casa: ____%
Bônus: Sim/Não - R$ _____
Fidelidade: MVP/Fase 2
```

---

## 🎯 RESUMO DA VALIDAÇÃO

### **Decisões Principais:**

1. **Escopo do MVP:**
   - [ ] Manter todas as 4 fases (10 semanas)
   - [ ] Reduzir para Fase 1 apenas (4 semanas)
   - [ ] Customizar: ___________________

2. **Features Removidas/Adiadas:**
```
- ___________________________________
- ___________________________________
- ___________________________________
```

3. **Features Adicionadas:**
```
- ___________________________________
- ___________________________________
```

4. **Mudanças de Prioridade:**
```
- ___________________________________
- ___________________________________
```

---

## ✅ APROVAÇÃO FINAL

### **Checklist Pré-Desenvolvimento:**

- [ ] ✅ PRD revisado e aprovado
- [ ] ✅ Tasks organizadas e priorizadas
- [ ] ✅ Questões legais esclarecidas (ou plano definido)
- [ ] ✅ Budget aprovado
- [ ] ✅ Timeline acordada
- [ ] ✅ Equipe alocada
- [ ] ✅ Stack tecnológico aprovado
- [ ] ✅ Métricas de sucesso definidas

---

### **Assinaturas:**

**Product Owner:** ___________________  
**Data:** ___/___/___

**Tech Lead:** ___________________  
**Data:** ___/___/___

**Stakeholder:** ___________________  
**Data:** ___/___/___

---

## 🚀 PRÓXIMO PASSO

Após aprovação:
1. Atualizar PRD com decisões tomadas (versão 1.1)
2. Ajustar TASKS_POR_SPRINT.md conforme mudanças
3. **Iniciar Sprint 1** 🎯

---

**Status Final:** 
- [ ] ✅ **APROVADO - Iniciar desenvolvimento**
- [ ] ⚠️ **APROVADO COM AJUSTES - Revisar PRD**
- [ ] ❌ **NÃO APROVADO - Refazer PRD**

**Observações finais:**
```
________________________________________________
________________________________________________
________________________________________________
________________________________________________
```

---

**Criado:** 05/11/2025  
**Versão:** 1.0





