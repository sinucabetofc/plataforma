# 💰 Análise Completa: Cálculo do Lucro da Plataforma SinucaBet

**Data:** 11/11/2025  
**Versão:** 1.0  
**Status:** ✅ Documentação Completa

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Modelo de Negócio](#modelo-de-negócio)
3. [Fontes de Receita](#fontes-de-receita)
4. [Cálculo do Lucro](#cálculo-do-lucro)
5. [Implementação Técnica](#implementação-técnica)
6. [Fluxo de Dinheiro](#fluxo-de-dinheiro)
7. [Análise de Dados](#análise-de-dados)
8. [Pontos de Atenção](#pontos-de-atenção)
9. [Recomendações](#recomendações)

---

## 🎯 Visão Geral

A **SinucaBet** opera como uma **plataforma de intermediação de apostas peer-to-peer (P2P)**, onde apostadores apostam uns contra os outros, e não contra a casa. Este modelo é fundamental para entender a lógica de lucro.

### Princípios Fundamentais

1. ✅ **Sistema P2P (Peer-to-Peer)**
   - Apostadores apostam entre si
   - Plataforma apenas conecta apostadores de lados opostos
   - Matching automático 1:1

2. ✅ **Odds Fixas em 2.0 (1:1)**
   - Se você aposta R$ 100 e ganha, recebe R$ 200 (seu valor + o valor do perdedor)
   - Não há taxa nas apostas ou nos ganhos
   - Sistema justo e transparente

3. ✅ **Taxa APENAS nos Saques**
   - Única fonte de receita: **8% sobre saques**
   - Apostas são livres de taxa
   - Ganhos são creditados integralmente

---

## 💼 Modelo de Negócio

### Como Funciona na Prática

```
APOSTADOR A (aposta R$ 100 no Jogador 1)
              ⬇
       [PLATAFORMA]  ← Faz o matching
              ⬇
APOSTADOR B (aposta R$ 100 no Jogador 2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Resultado: Jogador 1 vence

APOSTADOR A:
  - Apostou: R$ 100
  - Ganhou: R$ 200 (seu R$ 100 + R$ 100 do perdedor)
  - Retorno líquido: +R$ 100

APOSTADOR B:
  - Apostou: R$ 100
  - Ganhou: R$ 0
  - Retorno líquido: -R$ 100

PLATAFORMA:
  - Receita nas apostas: R$ 0 (sem taxa)
  - Receita nos ganhos: R$ 0 (sem taxa)
  - Receita potencial: Quando Apostador A sacar os R$ 200
```

### Diferença de Casas de Apostas Tradicionais

| Aspecto | Casa Tradicional | SinucaBet (P2P) |
|---------|------------------|-----------------|
| **Quem paga os ganhos?** | A casa | O apostador perdedor |
| **Taxa nas apostas** | Embutida nas odds | Nenhuma |
| **Taxa nos ganhos** | Pode ter | Nenhuma |
| **Taxa no saque** | Geralmente não | **8%** |
| **Risco da casa** | Alto (pode perder muito) | Zero (apenas conecta) |
| **Odds** | Variáveis | Fixas em 2.0 |

---

## 💸 Fontes de Receita

### 1️⃣ **TAXA DE SAQUE - 8%** (Única Fonte Atual)

Esta é a **ÚNICA** fonte de receita da plataforma atualmente implementada.

#### Como Funciona

```javascript
// Exemplo de Cálculo de Saque

Valor solicitado pelo usuário: R$ 100,00
Taxa (8%): R$ 8,00
Total debitado da carteira: R$ 108,00
Valor líquido a receber (PIX): R$ 100,00
Lucro da plataforma: R$ 8,00
```

#### Implementação no Código

**Arquivo:** `backend/services/wallet.service.js` (linhas 482-485)

```javascript
// 3. Calcular taxa de 8% (VALORES EM CENTAVOS)
const amountInCents = Math.round(amount * 100); // R$ 50 = 5000 centavos
const feeInCents = Math.round(amountInCents * 0.08); // 8% do valor
const totalAmountInCents = amountInCents + feeInCents;
```

#### Transações Criadas

Quando um usuário solicita um saque, **2 transações** são criadas:

1. **Transação de Saque** (`type: 'saque'`)
   - Amount: Valor solicitado (ex: R$ 100)
   - Fee: R$ 8 (8%)
   - Status: `pending` (aguarda aprovação admin)
   - Descrição: "Solicitação de saque via Pix"

2. **Transação de Taxa** (`type: 'taxa'`)
   - Amount: Valor da taxa (ex: R$ 8)
   - Fee: R$ 0
   - Status: `completed` (já processada)
   - Descrição: "Taxa de saque (8%)"
   - Metadata: `{ fee_percentage: 8, related_transaction_id: ... }`

### 2️⃣ **OUTRAS FONTES (Potenciais - NÃO Implementadas)**

#### Comissão de Influencers

**Status:** 🔧 Estrutura pronta, não implementada

```sql
-- Tabela matches tem campo:
influencer_id UUID
influencer_commission DECIMAL(5,2) -- Porcentagem (0-100)
```

**Como funcionaria:**
- Influencer cria/divulga partida
- Recebe X% do volume de apostas ou das taxas geradas
- Pode sacar via painel próprio

#### Taxa de Inatividade

**Status:** ❌ Não implementado

- Cobrar taxa de usuários inativos por X dias
- Comum em outras plataformas de apostas

#### Premium/VIP

**Status:** ❌ Não implementado

- Redução ou isenção da taxa de saque
- Limites maiores de apostas
- Saques prioritários

---

## 📊 Cálculo do Lucro

### Como o Lucro é Calculado no Dashboard Admin

**Arquivo:** `backend/services/admin.service.js` (linhas 114-216)

#### Fórmula Principal

```
LUCRO = TOTAL_SAQUES_APROVADOS × 0.08
```

#### Períodos Calculados

1. **Lucro Hoje**
   ```javascript
   const platformProfitToday = totalWithdrawnToday * 0.08;
   ```

2. **Lucro na Semana (últimos 7 dias)**
   ```javascript
   const platformProfitWeek = totalWithdrawnWeek * 0.08;
   ```

3. **Lucro no Mês**
   ```javascript
   const platformProfitMonth = totalWithdrawnMonth * 0.08;
   ```

4. **Lucro Total (all-time)**
   ```javascript
   const platformProfitTotal = totalWithdrawnTotal * 0.08;
   ```

### Query de Busca de Saques

```javascript
const { data: completedWithdrawalsToday } = await supabase
  .from('transactions')
  .select('amount, created_at')
  .eq('type', 'saque')
  .eq('status', 'completed')
  .gte('created_at', today.toISOString());
```

#### Pontos Importantes:

1. ✅ Conta **APENAS saques com status `completed`**
2. ✅ Conta **APENAS transações do tipo `saque`**
3. ✅ **NÃO** conta saques `pending` ou `cancelled`
4. ✅ Valores armazenados em **centavos** (divide por 100)

---

## 🔧 Implementação Técnica

### Estrutura de Dados

#### Tabela `transactions`

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    wallet_id UUID,
    type transaction_type_enum NOT NULL,  -- 'deposit', 'bet', 'win', 'saque', 'taxa'
    amount DECIMAL(15, 2) NOT NULL,       -- Valor em centavos
    fee DECIMAL(15, 2) DEFAULT 0.00,      -- Taxa em centavos
    net_amount DECIMAL(15, 2) NOT NULL,   -- Valor líquido
    status transaction_status_enum,        -- 'pending', 'completed', 'failed'
    description TEXT,
    metadata JSONB,
    balance_before DECIMAL(15, 2),        -- Saldo antes da transação
    balance_after DECIMAL(15, 2),         -- Saldo depois
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);
```

### Endpoint de Estatísticas Admin

**Rota:** `GET /api/admin/dashboard/stats`  
**Arquivo:** `backend/controllers/admin.controller.js` (linhas 193-206)

```javascript
// Linha 193-206: Cálculo do lucro da plataforma

// Buscar transações de taxa (fee) já completadas
const withdrawalFees = realWithdrawals
  .filter(w => w.status === 'completed')
  .reduce((sum, w) => sum + parseFloat(w.fee || 0), 0) / 100;

// Buscar transações de lucro registradas
const lucroTransactions = transactionsData?.filter(
  t => t.type === 'lucro' && t.status === 'completed'
) || [];

const totalLucroInCents = lucroTransactions.reduce(
  (sum, t) => sum + parseFloat(t.amount || 0), 0
);
const totalLucro = totalLucroInCents / 100;

// Lucro total = taxas de saque + outras transações de lucro
const platformProfit = withdrawalFees + totalLucro;
```

### Hook Frontend (Dashboard Admin)

**Arquivo:** `admin/hooks/useDashboardStats.js`

```javascript
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};
```

**Dados Retornados:**

```json
{
  "platform": {
    "profit": 1234.56  // Lucro total
  },
  "withdrawals": {
    "real": {
      "total": 15432.10,
      "count": 87,
      "today": 234.56,
      "last7Days": 1567.89,
      "month": 5432.10
    }
  }
}
```

---

## 💵 Fluxo de Dinheiro

### 1. Depósito

```
USUÁRIO
  │
  │ PIX: R$ 100
  ↓
[WOOVI API] ← Gera QR Code
  │
  │ Confirmação webhook
  ↓
[WALLET]
  Balance: +R$ 100 (em centavos: +10000)
  Total_deposited: +R$ 100

TRANSAÇÃO CRIADA:
  - Type: 'deposit'
  - Amount: 10000 (centavos)
  - Fee: 0
  - Status: 'completed'

LUCRO PLATAFORMA: R$ 0
```

### 2. Aposta

```
USUÁRIO A aposta R$ 50 no Jogador 1

[WALLET DO USUÁRIO A]
  Balance: R$ 100 → R$ 50
  
[BET CRIADA]
  - Amount: R$ 50
  - Side: 'player_a'
  - Status: 'pending'
  
[MATCHING AUTOMÁTICO]
  Busca apostas do lado oposto (player_b) do mesmo valor
  
  Se encontrar USUÁRIO B:
    - Ambas apostas → Status: 'matched'
    - Potential_return: R$ 100 (2x o valor apostado)
    
[TRANSAÇÃO CRIADA]
  - Type: 'bet'
  - Amount: 5000 (centavos)
  - Fee: 0 ← SEM TAXA
  - Status: 'completed'

LUCRO PLATAFORMA: R$ 0
```

### 3. Vitória

```
Jogo termina: Jogador 1 vence

[USUÁRIO A - VENCEDOR]
  Wallet: +R$ 100 (seu R$ 50 + R$ 50 do perdedor)
  
[USUÁRIO B - PERDEDOR]
  Wallet: sem alteração (já foi debitado na aposta)
  
[BET A]
  Status: 'won'
  Payout_amount: 10000 (centavos)
  
[BET B]
  Status: 'lost'
  
[TRANSAÇÃO CRIADA]
  - Type: 'win'
  - Amount: 10000 (centavos)
  - Fee: 0 ← SEM TAXA
  - Status: 'completed'

LUCRO PLATAFORMA: R$ 0
```

### 4. Saque (AQUI ENTRA O LUCRO!)

```
USUÁRIO A solicita saque de R$ 100

[CÁLCULO]
  Valor solicitado: R$ 100,00
  Taxa (8%): R$ 8,00
  Total debitado: R$ 108,00
  
[WALLET DO USUÁRIO A]
  Balance: R$ 150 → R$ 42
  Total_withdrawn: +R$ 100
  
[TRANSAÇÃO 1 - SAQUE]
  - Type: 'saque'
  - Amount: 10000 (centavos)
  - Fee: 800 (centavos)
  - Net_amount: 10000
  - Status: 'pending' ← Aguarda admin
  - Metadata: { pix_key: '...' }
  
[TRANSAÇÃO 2 - TAXA]
  - Type: 'taxa'
  - Amount: 800 (centavos)
  - Fee: 0
  - Net_amount: -800
  - Status: 'completed' ← Já processada
  - Metadata: { 
      fee_percentage: 8,
      related_transaction_id: [id da transação 1]
    }

ADMIN APROVA O SAQUE:
  - Transação 1: Status → 'completed'
  - PIX enviado para o usuário: R$ 100,00

💰 LUCRO PLATAFORMA: R$ 8,00 ✅
```

---

## 📈 Análise de Dados

### Métricas Calculadas no Dashboard

#### 1. Estatísticas de Saques

```javascript
withdrawals: {
  pending: {
    count: 5,           // Saques aguardando aprovação
    total: 500.00       // Valor total pendente
  },
  completed: {
    total: 15432.10     // Total já pago
  },
  fake: {               // Saques de saldo fake (crédito admin)
    total: 234.56,
    count: 12
  },
  real: {               // Saques de saldo real (depósitos)
    total: 15197.54,
    count: 75,
    today: 234.56,
    last7Days: 1567.89,
    month: 5432.10
  }
}
```

#### 2. Lucro Detalhado

```javascript
platform: {
  profit: 1215.80      // 8% dos saques aprovados
}

// Cálculo interno (não exposto na API):
profitBreakdown: {
  today: 18.77,        // 8% de R$ 234,56
  week: 125.43,        // 8% de R$ 1.567,89
  month: 434.57,       // 8% de R$ 5.432,10
  total: 1215.80       // 8% de R$ 15.197,54
}
```

#### 3. Separação Saldo Fake vs Real

**IMPORTANTE:** A plataforma distingue entre:

1. **Saldo Real:** Depositado via PIX pelo usuário
2. **Saldo Fake:** Creditado manualmente pelo admin (para testes/promoções)

```javascript
wallets: {
  total_balance: 50000.00,      // Saldo total de todos usuários
  real_balance: 35000.00,        // Saldo real (depósitos - saques)
  fake_balance: 15000.00,        // Saldo fake (créditos admin)
  matched_bets_total: 20000.00   // Total em apostas casadas
}
```

**Saques de saldo fake NÃO geram lucro** - são apenas débitos de crédito promocional.

---

## ⚠️ Pontos de Atenção

### 1. Sistema de Valores em Centavos

**Problema:** Valores são armazenados em centavos no banco, mas exibidos em reais no frontend.

```javascript
// ❌ ERRO COMUM: Esquecer de converter
const amount = 5000;  // R$ 50,00 em centavos
console.log(amount);  // Exibe 5000 (ERRADO!)

// ✅ CORRETO: Sempre converter para reais na resposta
const amountInReais = amount / 100;  // 50
console.log(`R$ ${amountInReais.toFixed(2)}`);  // R$ 50.00
```

### 2. Status das Transações

**Crucial para cálculo de lucro:**

```javascript
// ✅ Apenas estas contam para o lucro:
status: 'completed' && type: 'saque'

// ❌ Estas NÃO contam:
status: 'pending'   // Ainda não aprovado
status: 'failed'    // Falhou
status: 'cancelled' // Cancelado
```

### 3. Timezone e Datas

**Problema:** O sistema usa UTC, mas relatórios são em horário local (Brasil).

```javascript
// Conversão correta no código:
const today = new Date();
today.setHours(0, 0, 0, 0);  // Início do dia

// Filtro de transações:
.gte('created_at', today.toISOString())
```

### 4. Saldo Bloqueado

**Conceito:** Apostas pendentes/matched "travam" saldo, mas **já foram debitadas**.

```javascript
// ANTES da correção (ERRADO):
available_balance = balance - blocked_balance

// DEPOIS da correção (CORRETO):
available_balance = balance  // Já foi debitado na aposta!
```

### 5. Matching 1:1

**Característica:** Apostas só "casam" se:
- Forem do mesmo valor
- Lados opostos
- FIFO (primeiro que apostou é pareado primeiro)

Se não encontrar par → Fica `pending` até alguém apostar no lado oposto.

---

## 🎯 Recomendações

### 1. Melhorias no Cálculo de Lucro

#### Implementar Previsão de Lucro

```javascript
// Lucro Projetado = Lucro já realizado + Lucro potencial de saques pendentes
const projectedProfit = {
  realized: platformProfitTotal,
  pending: pendingWithdrawalsTotal * 0.08,
  total: platformProfitTotal + (pendingWithdrawalsTotal * 0.08)
};
```

#### Dashboard Mais Detalhado

```javascript
profitDetails: {
  // Por período
  today: { amount: 18.77, withdrawals: 5, avgFee: 3.75 },
  week: { amount: 125.43, withdrawals: 32, avgFee: 3.92 },
  month: { amount: 434.57, withdrawals: 108, avgFee: 4.02 },
  
  // Por tipo de saldo
  fromRealBalance: 400.00,    // 8% de saques de saldo real
  fromFakeBalance: 34.57,     // Tracking separado (não é lucro real)
  
  // Projeções
  avgDailyProfit: 14.32,
  projectedMonthly: 429.60
}
```

### 2. Análise de Rentabilidade

#### Calcular Taxa de Conversão

```javascript
conversionMetrics: {
  totalDeposits: 50000.00,
  totalWithdrawals: 15197.54,
  retentionRate: 69.6%,        // 100 - (withdrawals/deposits * 100)
  platformProfit: 1215.80,
  profitMargin: 2.4%           // profit / deposits * 100
}
```

#### ROI por Usuário

```javascript
userMetrics: {
  totalUsers: 500,
  activeUsers: 287,            // Usuários com apostas no mês
  avgDepositPerUser: 100.00,
  avgWithdrawalPerUser: 52.95,
  avgProfitPerUser: 4.24       // Taxa de saque por usuário
}
```

### 3. Sistema de Comissões

#### Implementar Comissão de Influencers

```javascript
// Na criação da partida:
const match = {
  influencer_id: 'uuid-do-influencer',
  influencer_commission: 5.0,  // 5% do volume de apostas
  // OU
  influencer_commission: 2.0   // 2% do lucro gerado (taxa de saques)
};

// Ao calcular lucro:
const totalFees = totalWithdrawals * 0.08;
const influencerShare = (totalFees * match.influencer_commission) / 100;
const platformNet = totalFees - influencerShare;
```

### 4. Relatórios e Auditoria

#### Criar View SQL para Lucro

```sql
CREATE VIEW platform_profit_summary AS
SELECT 
  DATE_TRUNC('day', t.created_at) as date,
  COUNT(*) as total_withdrawals,
  SUM(t.amount) / 100 as total_withdrawn,
  SUM(t.fee) / 100 as platform_profit,
  AVG(t.fee) / 100 as avg_fee_per_withdrawal
FROM transactions t
WHERE t.type = 'saque'
  AND t.status = 'completed'
GROUP BY DATE_TRUNC('day', t.created_at)
ORDER BY date DESC;
```

#### Exportar Relatórios

```javascript
// Endpoint para exportar relatórios financeiros
GET /api/admin/reports/profit
  ?start_date=2025-01-01
  &end_date=2025-01-31
  &format=csv

// Retorna:
// Data, Saques, Total Sacado, Taxa (8%), Lucro
// 2025-01-15, 12, 1500.00, 120.00, 120.00
// 2025-01-16, 8, 980.00, 78.40, 78.40
```

### 5. Alertas e Monitoramento

```javascript
// Sistema de alertas
const alerts = {
  lowProfitDay: platformProfitToday < 50,
  highWithdrawalVolume: todayWithdrawalsCount > 50,
  suspiciousActivity: detectAnomalies(withdrawals)
};

if (alerts.lowProfitDay) {
  notifyAdmin('Lucro baixo hoje: R$ ' + platformProfitToday);
}
```

### 6. Otimização da Taxa

#### Teste A/B de Taxas

```javascript
// Implementar diferentes taxas por segmento
const withdrawalFee = calculateDynamicFee({
  userTier: 'premium',      // premium, regular, new
  withdrawalAmount: 100,
  withdrawalFrequency: 5,   // Saques por mês
  userLifetimeValue: 5000
});

// Exemplos:
// - Usuários premium: 5%
// - Usuários regulares: 8%
// - Novos usuários (primeiros 30 dias): 6%
// - Saques > R$ 1000: 7%
```

---

## 🔍 Queries Úteis

### Ver Lucro Diário

```sql
SELECT 
  DATE(created_at) as dia,
  COUNT(*) as total_saques,
  SUM(amount) / 100 as total_sacado,
  SUM(fee) / 100 as lucro
FROM transactions
WHERE type = 'saque'
  AND status = 'completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY dia DESC;
```

### Ver Top Usuários por Lucro Gerado

```sql
SELECT 
  u.name,
  u.email,
  COUNT(t.id) as total_saques,
  SUM(t.amount) / 100 as total_sacado,
  SUM(t.fee) / 100 as lucro_gerado
FROM users u
JOIN transactions t ON u.id = t.user_id
WHERE t.type = 'saque'
  AND t.status = 'completed'
GROUP BY u.id, u.name, u.email
ORDER BY lucro_gerado DESC
LIMIT 20;
```

### Comparar Lucro Mês a Mês

```sql
SELECT 
  TO_CHAR(created_at, 'YYYY-MM') as mes,
  COUNT(*) as total_saques,
  SUM(amount) / 100 as total_sacado,
  SUM(fee) / 100 as lucro,
  AVG(fee) / 100 as taxa_media
FROM transactions
WHERE type = 'saque'
  AND status = 'completed'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mes DESC;
```

---

## 📝 Conclusão

### Resumo da Lógica de Lucro

1. **Modelo P2P:** Plataforma apenas conecta apostadores, não assume risco
2. **Odd Fixa 2.0:** Sistema 1:1 justo e transparente
3. **Taxa de 8% no Saque:** Única fonte de receita atual
4. **Sem Taxas nas Apostas:** Incentiva volume de apostas
5. **Cálculo Simples:** Lucro = Total Saques Aprovados × 0.08

### Vantagens do Modelo

✅ **Baixo Risco:** Plataforma não perde dinheiro com apostas  
✅ **Escalável:** Quanto mais apostas, mais saques, mais lucro  
✅ **Transparente:** Usuários sabem exatamente quanto pagarão  
✅ **Competitivo:** Odds 2.0 são melhores que maioria das casas  

### Desvantagens do Modelo

⚠️ **Receita Tardia:** Só ganha quando usuário saca (pode demorar)  
⚠️ **Dependência de Volume:** Precisa de muitos saques para lucrar  
⚠️ **Saldo Bloqueado:** Usuários podem deixar dinheiro parado  

### Próximos Passos Sugeridos

1. **Implementar comissões de influencers** (aumenta volume de apostas)
2. **Sistema de assinatura premium** (receita recorrente)
3. **Taxa de inatividade** (incentiva atividade ou gera receita)
4. **Dashboard de lucro detalhado** (melhor visibilidade)
5. **Alertas de performance** (monitoramento em tempo real)

---

**Documentado por:** Análise Completa do Sistema  
**Data:** 11/11/2025  
**Versão:** 1.0  

🎱 **SinucaBet - Transparência em Primeiro Lugar**


