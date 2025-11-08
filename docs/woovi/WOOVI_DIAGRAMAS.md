# 📊 DIAGRAMAS VISUAIS - INTEGRAÇÃO WOOVI PIX

## 🎯 Arquitetura Geral do Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                         SINUCABET SYSTEM                          │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│                 │         │                  │         │             │
│   FRONTEND      │◄───────▶│     BACKEND      │◄───────▶│  DATABASE   │
│   (React)       │  JWT    │   (Node.js)      │  SQL    │ (Supabase)  │
│                 │         │                  │         │             │
└────────┬────────┘         └────────┬─────────┘         └─────────────┘
         │                           │
         │                           │
         │                  ┌────────▼─────────┐
         │                  │                  │
         │                  │   WOOVI API      │
         │                  │  (OpenPix)       │
         │                  │                  │
         │                  └────────┬─────────┘
         │                           │
         │                           │ Webhook
         │                           │ (HTTPS POST)
         │                           │
         └───────────────────────────┘
           Polling/WebSocket
          (Status Update)
```

---

## 🔄 Fluxo de Depósito Completo

```
┌───────────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO DE DEPÓSITO PIX                     │
└───────────────────────────────────────────────────────────────────────┘

👤 USUÁRIO                 💻 FRONTEND              🖥️  BACKEND             🏦 WOOVI            💾 BANCO
    │                          │                       │                      │                  │
    │ 1. Clica "Depositar"     │                       │                      │                  │
    ├─────────────────────────▶│                       │                      │                  │
    │                          │                       │                      │                  │
    │ 2. Informa R$ 50         │                       │                      │                  │
    ├─────────────────────────▶│                       │                      │                  │
    │                          │                       │                      │                  │
    │                          │ 3. POST /deposit      │                      │                  │
    │                          ├──────────────────────▶│                      │                  │
    │                          │   {amount: 50}        │                      │                  │
    │                          │                       │                      │                  │
    │                          │                       │ 4. Valida valor      │                  │
    │                          │                       │    (≥10, múlt. 10)   │                  │
    │                          │                       │                      │                  │
    │                          │                       │ 5. Gera UUID         │                  │
    │                          │                       │    correlationID     │                  │
    │                          │                       │                      │                  │
    │                          │                       │ 6. INSERT transaction│                  │
    │                          │                       ├─────────────────────────────────────────▶│
    │                          │                       │    status: pending   │                  │
    │                          │                       │                      │                  │
    │                          │                       │ 7. POST /charge      │                  │
    │                          │                       ├─────────────────────▶│                  │
    │                          │                       │ {value: 5000,        │                  │
    │                          │                       │  correlationID}      │                  │
    │                          │                       │                      │                  │
    │                          │                       │                      │ 8. Cria cobrança │
    │                          │                       │                      │    Gera QR Code  │
    │                          │                       │                      │                  │
    │                          │                       │ 9. Retorna dados     │                  │
    │                          │                       │◀─────────────────────│                  │
    │                          │                       │ {qrCode, image}      │                  │
    │                          │                       │                      │                  │
    │                          │ 10. Retorna QR        │                      │                  │
    │                          │◀──────────────────────│                      │                  │
    │                          │ {pix: {...}}          │                      │                  │
    │                          │                       │                      │                  │
    │ 11. Exibe QR Code        │                       │                      │                  │
    │◀─────────────────────────┤                       │                      │                  │
    │    ┌──────────┐          │                       │                      │                  │
    │    │ QR CODE  │          │                       │                      │                  │
    │    │  █████   │          │                       │                      │                  │
    │    │  ████    │          │                       │                      │                  │
    │    └──────────┘          │                       │                      │                  │
    │                          │                       │                      │                  │
    │ 12. Abre banco           │                       │                      │                  │
    ├──────────┐               │                       │                      │                  │
    │          │               │                       │                      │                  │
    │ 13. Paga PIX             │                       │                      │                  │
    ├──────────┴───────────────┴───────────────────────┴─────────────────────▶│                  │
    │                          │                       │                      │                  │
    │                          │                       │                      │ 14. Detecta PIX  │
    │                          │                       │                      │                  │
    │                          │                       │ 15. POST /webhook    │                  │
    │                          │                       │◀─────────────────────┤                  │
    │                          │                       │ event: COMPLETED     │                  │
    │                          │                       │                      │                  │
    │                          │                       │ 16. Busca transaction│                  │
    │                          │                       ├─────────────────────────────────────────▶│
    │                          │                       │ WHERE correlation_id │                  │
    │                          │                       │                      │                  │
    │                          │                       │ 17. UPDATE status    │                  │
    │                          │                       ├─────────────────────────────────────────▶│
    │                          │                       │    completed         │                  │
    │                          │                       │                      │                  │
    │                          │                       │ 18. UPDATE balance   │                  │
    │                          │                       ├─────────────────────────────────────────▶│
    │                          │                       │    balance + 50      │                  │
    │                          │                       │                      │                  │
    │                          │                       │ 19. Retorna 200 OK   │                  │
    │                          │                       ├─────────────────────▶│                  │
    │                          │                       │                      │                  │
    │                          │ 20. Polling detecta   │                      │                  │
    │                          │     mudança           │                      │                  │
    │                          │◀──────────────────────┤                      │                  │
    │                          │                       │                      │                  │
    │ 21. Exibe sucesso ✅     │                       │                      │                  │
    │◀─────────────────────────┤                       │                      │                  │
    │    Saldo: R$ 150,00      │                       │                      │                  │
    │                          │                       │                      │                  │
```

**⏱️ Tempo total:** 5-15 segundos após pagamento

---

## 🏛️ Arquitetura de Componentes Frontend

```
┌────────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENTS                        │
└────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        pages/dashboard.js                         │
│                                                                   │
│  ┌─────────────────┐    ┌──────────────────┐                    │
│  │  BalanceCard    │    │  ActionButtons   │                    │
│  │  R$ 100,00      │    │  [Depositar]     │                    │
│  └─────────────────┘    └────────┬─────────┘                    │
│                                   │                              │
│                                   │ onClick                      │
│                                   ▼                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            DepositModal (componente)                     │   │
│  │                                                           │   │
│  │  Step 1: Informar Valor                                  │   │
│  │  ┌────────────────────────────────────┐                  │   │
│  │  │  R$ [____]                         │                  │   │
│  │  │  [10] [20] [50] [100]              │                  │   │
│  │  │  [Continuar]                       │                  │   │
│  │  └────────────────────────────────────┘                  │   │
│  │                    │                                      │   │
│  │                    ▼                                      │   │
│  │  Step 2: Exibir QR Code                                  │   │
│  │  ┌────────────────────────────────────┐                  │   │
│  │  │  ┌──────────┐                      │                  │   │
│  │  │  │ QR CODE  │  R$ 50,00            │                  │   │
│  │  │  │  █████   │                      │                  │   │
│  │  │  └──────────┘                      │                  │   │
│  │  │  [📋 Copiar Código]                │                  │   │
│  │  │  [📱 Abrir no App]                 │                  │   │
│  │  │  ⏳ Aguardando pagamento...        │                  │   │
│  │  └────────────────────────────────────┘                  │   │
│  │                    │                                      │   │
│  │                    ▼                                      │   │
│  │  Step 3: Sucesso                                         │   │
│  │  ┌────────────────────────────────────┐                  │   │
│  │  │      ✅ Pagamento Confirmado!      │                  │   │
│  │  │      + R$ 50,00                    │                  │   │
│  │  └────────────────────────────────────┘                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  pages/transactions.js                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TransactionHistory                                       │   │
│  │                                                           │   │
│  │  [Todas] [Depósitos] [Saques]                            │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ 08/11 10:30 - Depósito      + R$ 50,00  ✅ Concluído│  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │ 08/11 09:15 - Aposta        - R$ 20,00  ✅ Concluído│  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │ 07/11 18:45 - Depósito      + R$ 100,00 ✅ Concluído│  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🗃️ Estrutura de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE STRUCTURE                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                          USERS TABLE                              │
├──────────────────────────────────────────────────────────────────┤
│  id                 │ UUID (PK)                                   │
│  name               │ VARCHAR(255)                                │
│  email              │ VARCHAR(255) UNIQUE                         │
│  password_hash      │ VARCHAR(255)                                │
│  balance            │ DECIMAL(10,2)  ◄─── Atualizado pelo webhook│
│  created_at         │ TIMESTAMP                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      TRANSACTIONS TABLE                           │
├──────────────────────────────────────────────────────────────────┤
│  id                      │ UUID (PK)                              │
│  user_id                 │ UUID (FK → users.id)                   │
│  type                    │ VARCHAR(20)                            │
│                          │   ├─ deposit                           │
│                          │   ├─ withdrawal                        │
│                          │   ├─ bet                               │
│                          │   └─ win                               │
│  amount                  │ DECIMAL(10,2)                          │
│  status                  │ VARCHAR(20)                            │
│                          │   ├─ pending                           │
│                          │   ├─ completed                         │
│                          │   ├─ failed                            │
│                          │   └─ cancelled                         │
│  ─────────────────────── │ ────────────────────────────────────  │
│  🔑 WOOVI FIELDS         │                                        │
│  ─────────────────────── │ ────────────────────────────────────  │
│  correlation_id          │ VARCHAR(255) UNIQUE                    │
│                          │   └─ ID gerado pelo backend            │
│  woovi_transaction_id    │ VARCHAR(255)                           │
│                          │   └─ ID retornado pela Woovi           │
│  woovi_charge_id         │ VARCHAR(255)                           │
│  woovi_paid_at           │ TIMESTAMP                              │
│  woovi_fee               │ INTEGER (em centavos)                  │
│  woovi_end_to_end_id     │ VARCHAR(255)                           │
│                          │   └─ ID único do PIX bancário          │
│  ─────────────────────── │ ────────────────────────────────────  │
│  created_at              │ TIMESTAMP                              │
│  completed_at            │ TIMESTAMP                              │
│  expires_at              │ TIMESTAMP                              │
└──────────────────────────────────────────────────────────────────┘

ÍNDICES:
  ├─ idx_transactions_user_id (user_id)
  ├─ idx_transactions_correlation_id (correlation_id) UNIQUE
  ├─ idx_transactions_status (status)
  ├─ idx_transactions_type (type)
  └─ idx_transactions_created_at (created_at DESC)
```

---

## 🔄 Estados de Transação

```
┌─────────────────────────────────────────────────────────────────┐
│                 TRANSACTION STATE MACHINE                        │
└─────────────────────────────────────────────────────────────────┘

                           ┌──────────┐
                           │  START   │
                           └────┬─────┘
                                │
                                │ Usuário cria depósito
                                ▼
                         ┌─────────────┐
                    ┌───▶│   PENDING   │
                    │    └──────┬──────┘
                    │           │
                    │           │ Webhook: CHARGE_COMPLETED
                    │           ▼
                    │    ┌─────────────┐
                    │    │  COMPLETED  │──────┐
                    │    └─────────────┘      │
                    │           │              │
                    │           │              │ Saldo atualizado
                    │           ▼              │ balance += amount
        Timeout     │    ┌─────────────┐      │
        (24h)       │    │   SUCCESS   │◀─────┘
                    │    └─────────────┘
                    │
                    │
                    │    ┌─────────────┐
                    ├───▶│   EXPIRED   │
                    │    └─────────────┘
                    │
                    │
         Erro API   │    ┌─────────────┐
                    └───▶│   FAILED    │
                         └─────────────┘

TRANSIÇÕES:
  PENDING → COMPLETED  ✅ Webhook recebido com sucesso
  PENDING → EXPIRED    ⏰ 24h sem pagamento
  PENDING → FAILED     ❌ Erro na API Woovi
  COMPLETED → SUCCESS  ✅ Saldo creditado
```

---

## 🔐 Segurança e Validações

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
└─────────────────────────────────────────────────────────────────┘

👤 USER INPUT
    │
    │ 1. Frontend Validation
    ▼
┌─────────────────────────────────────┐
│  ✓ Valor ≥ R$ 10                    │
│  ✓ Valor ≤ R$ 10.000                │
│  ✓ Múltiplo de 10                   │
│  ✓ Formato numérico válido          │
└────────────┬────────────────────────┘
             │
             │ 2. Backend Validation
             ▼
┌─────────────────────────────────────┐
│  ✓ JWT Token válido                 │
│  ✓ Usuário autenticado              │
│  ✓ Valores numéricos válidos        │
│  ✓ correlationID único              │
│  ✓ Rate limiting                    │
└────────────┬────────────────────────┘
             │
             │ 3. API Authentication
             ▼
┌─────────────────────────────────────┐
│  ✓ AppID válido no header           │
│  ✓ HTTPS obrigatório                │
│  ✓ Timeout configurado              │
└────────────┬────────────────────────┘
             │
             │ 4. Webhook Security
             ▼
┌─────────────────────────────────────┐
│  ✓ Endpoint público (sem JWT)       │
│  ✓ Validação de payload             │
│  ✓ Idempotência (não duplicar)      │
│  ✓ correlationID existe no banco    │
│  ✓ Status ainda é pending           │
│  ✓ Log de auditoria                 │
└────────────┬────────────────────────┘
             │
             │ 5. Database Integrity
             ▼
┌─────────────────────────────────────┐
│  ✓ Foreign key constraints          │
│  ✓ Unique constraints               │
│  ✓ Check constraints                │
│  ✓ Triggers para atualizar saldo    │
│  ✓ Transações ACID                  │
└─────────────────────────────────────┘
```

---

## 📊 Monitoramento e Logs

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOG FLOW                                    │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────┐
│  USER ACTION       │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐         ┌─────────────────────────┐
│  FRONTEND LOG      │         │  Browser Console        │
│  - Depósito init   │────────▶│  [DEBUG] Creating...    │
│  - Valor: R$ 50    │         │  [INFO] QR Code shown   │
└──────┬─────────────┘         └─────────────────────────┘
       │
       ▼
┌────────────────────┐         ┌─────────────────────────┐
│  BACKEND LOG       │         │  Server Logs            │
│  - POST /deposit   │────────▶│  [INFO] Deposit request │
│  - userId: 123     │         │  [DEBUG] Calling Woovi  │
│  - amount: 50      │         │  [INFO] QR Code created │
└──────┬─────────────┘         └─────────────────────────┘
       │
       ▼
┌────────────────────┐         ┌─────────────────────────┐
│  WOOVI API LOG     │         │  Request/Response       │
│  - POST /charge    │────────▶│  [DEBUG] Request sent   │
│  - Response: 200   │         │  [INFO] Charge created  │
└──────┬─────────────┘         └─────────────────────────┘
       │
       │ (Usuário paga)
       │
       ▼
┌────────────────────┐         ┌─────────────────────────┐
│  WEBHOOK LOG       │         │  Webhook Processor      │
│  - Event: COMPLETED│────────▶│  [INFO] Webhook received│
│  - correlationID   │         │  [DEBUG] Finding tx...  │
│  - Status updated  │         │  [INFO] Balance updated │
│  - Balance: +50    │         │  [SUCCESS] Completed    │
└────────────────────┘         └─────────────────────────┘
```

---

## 🧪 Ambiente de Teste vs Produção

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENTS                                  │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║                        🧪 SANDBOX (TEST)                       ║
╚═══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│  API URL: https://api.woovi-sandbox.com/api/v1                  │
│  AppID: TEST_xxxxxxxxxxxxxx                                     │
│  Webhook: https://abc123.ngrok.io/api/webhook/woovi             │
│                                                                  │
│  ✅ Simular pagamento no painel                                 │
│  ✅ Não precisa pagar de verdade                                │
│  ✅ Logs detalhados                                             │
│  ✅ Reset de dados                                              │
│                                                                  │
│  ⚠️  NÃO USE EM PRODUÇÃO!                                       │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║                     🚀 PRODUCTION                              ║
╚═══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│  API URL: https://api.woovi.com/api/v1                          │
│  AppID: PROD_xxxxxxxxxxxxxx                                     │
│  Webhook: https://api.sinucabet.com/api/webhook/woovi           │
│                                                                  │
│  ✅ PIX real                                                     │
│  ✅ Dinheiro real                                                │
│  ✅ Monitoramento ativo                                          │
│  ✅ SSL obrigatório                                              │
│                                                                  │
│  ⚠️  TESTAR TUDO NO SANDBOX ANTES!                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Checklist Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                  IMPLEMENTATION CHECKLIST                        │
└─────────────────────────────────────────────────────────────────┘

📋 PREPARAÇÃO
  ☐ Conta Woovi criada
  ☐ AppID gerado
  ☐ Webhook configurado
  ☐ Documentação lida

💻 BACKEND
  ☐ .env configurado
  ☐ Tabela transactions criada
  ☐ wooviService.js implementado
  ☐ depositController.js implementado
  ☐ webhookController.js implementado
  ☐ Rotas configuradas
  ☐ Logs adicionados
  ☐ Testes rodando

🎨 FRONTEND
  ☐ DepositModal criado
  ☐ Validações implementadas
  ☐ QR Code exibindo
  ☐ Polling funcionando
  ☐ Saldo atualizando
  ☐ Notificações exibindo
  ☐ Histórico criado

🧪 TESTES
  ☐ Teste local com Ngrok
  ☐ Depósito R$ 10 funciona
  ☐ Depósito R$ 50 funciona
  ☐ Webhook recebido
  ☐ Saldo atualizado
  ☐ Histórico exibido
  ☐ Validações funcionando
  ☐ Erros tratados

🚀 DEPLOY
  ☐ Backend em produção
  ☐ Frontend em produção
  ☐ Webhook configurado
  ☐ Testado em produção
  ☐ Monitoramento ativo
```

---

## 📈 Métricas e KPIs

```
┌─────────────────────────────────────────────────────────────────┐
│                      SUCCESS METRICS                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  PERFORMANCE         │
├──────────────────────┤
│  ⏱️  Tempo criação    │  < 2s
│  ⏱️  Tempo webhook    │  < 10s
│  ⏱️  Tempo total      │  < 15s
│  📊 Taxa de sucesso  │  > 95%
│  🔄 Uptime webhook   │  > 99%
└──────────────────────┘

┌──────────────────────┐
│  BUSINESS            │
├──────────────────────┤
│  💰 Ticket médio     │  R$ 50-100
│  📈 Taxa conversão   │  > 80%
│  🔁 Retenção         │  > 70%
│  ⭐ Satisfação       │  > 4.5/5
└──────────────────────┘

┌──────────────────────┐
│  TECHNICAL           │
├──────────────────────┤
│  🐛 Taxa de erro     │  < 5%
│  📝 Cobertura logs   │  100%
│  🔒 Segurança        │  A+
│  ⚡ Load time        │  < 3s
└──────────────────────┘
```

---

**Documento criado em**: 08/11/2025  
**Versão**: 1.0  
**Projeto**: SinucaBet - Integração Woovi PIX  
**Tipo**: Diagramas e Fluxos Visuais
