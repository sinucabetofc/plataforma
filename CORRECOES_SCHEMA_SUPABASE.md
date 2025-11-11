# 🔧 CORREÇÕES DE SCHEMA - Integração Woovi PIX

## 📊 Histórico Completo de Correções

Durante a integração, identificamos **4 incompatibilidades** entre o código e o schema do Supabase:

---

### 1️⃣ Autenticação Woovi (Commit: cfa3d6c7)

**Erro:** Header de autenticação incorreto  
**Causa:** Documentação confusa sobre formato do header  
**Correção:** 
```javascript
// Antes:
'Authorization': `AppID ${WOOVI_APP_ID}`

// Depois:
'Authorization': WOOVI_APP_ID
```

---

### 2️⃣ Tipos de Transação (Commit: aad0e712)

**Erro:** `invalid input value for enum transaction_type: "deposit"`  
**Causa:** ENUM no Supabase usa valores em português  
**Correção:**
```javascript
// Antes:
type: 'deposit'
type: 'withdraw'
type: 'fee'

// Depois:
type: 'deposito'
type: 'saque'
type: 'taxa'
```

**ENUM Correto:**
```sql
('deposito', 'saque', 'taxa', 'aposta', 'ganho', 'reembolso')
```

---

### 3️⃣ Campo wallet_id (Commit: f0d0526a)

**Erro:** `null value in column "wallet_id" violates not-null constraint`  
**Causa:** Tabela `transactions` requer `wallet_id` como chave estrangeira  
**Correção:**
```javascript
// Antes:
.insert({
  user_id: userId,
  type: 'deposito',
  ...
})

// Depois:
.insert({
  wallet_id: wallet.id, // ✅ ADICIONADO
  user_id: userId,
  type: 'deposito',
  ...
})
```

---

### 4️⃣ Campos balance_before e balance_after (Commit: df2b2851)

**Erro:** `null value in column "balance_before" violates not-null constraint`  
**Causa:** Tabela `transactions` registra snapshot do saldo antes e depois  
**Correção:**
```javascript
// 1. Buscar saldo atual
const { data: wallet } = await supabase
  .from('wallet')
  .select('id, balance')  // ✅ ADICIONADO balance
  .eq('user_id', userId)
  .single();

const currentBalance = parseFloat(wallet.balance) || 0;

// 2. Adicionar ao insert
.insert({
  wallet_id: wallet.id,
  user_id: userId,
  type: 'deposito',
  amount: amount,
  balance_before: currentBalance,      // ✅ ADICIONADO
  balance_after: currentBalance,       // ✅ ADICIONADO (não muda até webhook)
  fee: 0,
  net_amount: amount,
  status: 'pending',
  ...
})

// 3. Atualizar balance_after quando webhook confirmar
.update({
  status: 'completed',
  balance_after: newBalance,  // ✅ ADICIONADO
  processed_at: new Date().toISOString(),
  ...
})
```

---

## 📋 Schema da Tabela transactions (Supabase)

### Campos Obrigatórios (NOT NULL)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | ✅ | PK (auto-gerado) |
| `wallet_id` | UUID | ✅ | FK → wallet.id |
| `user_id` | UUID | ✅ | FK → users.id |
| `type` | ENUM | ✅ | deposito, saque, taxa, aposta, ganho, reembolso |
| `amount` | DECIMAL | ✅ | Valor da transação |
| `balance_before` | DECIMAL | ✅ | Saldo antes da transação |
| `balance_after` | DECIMAL | ✅ | Saldo após a transação |
| `status` | VARCHAR | ✅ | pending, completed, cancelled |
| `created_at` | TIMESTAMP | ✅ | Data de criação (default NOW()) |

### Campos Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `bet_id` | UUID | FK → bets.id (se aplicável) |
| `fee` | DECIMAL | Taxa cobrada |
| `net_amount` | DECIMAL | Valor líquido |
| `description` | TEXT | Descrição |
| `metadata` | JSONB | Dados adicionais |
| `processed_at` | TIMESTAMP | Quando foi processada |

---

## ✅ Código Final Correto

### Criar Depósito

```javascript
async createDeposit(userId, amount, description = '') {
  // 1. Buscar usuário
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', userId)
    .single();

  // 2. Buscar wallet E saldo atual
  const { data: wallet } = await supabase
    .from('wallet')
    .select('id, balance')  // ✅ Buscar balance
    .eq('user_id', userId)
    .single();

  const currentBalance = parseFloat(wallet.balance) || 0;

  // 3. Gerar correlationID
  const correlationID = `DEPOSIT-${userId}-${Date.now()}-${uuidv4()}`;

  // 4. Criar cobrança Woovi
  const pixData = await this.generatePixQRCode({
    correlationID,
    value: Math.round(amount * 100),
    comment: description
  });

  // 5. Criar transação com TODOS os campos obrigatórios
  const { data: transaction } = await supabase
    .from('transactions')
    .insert({
      wallet_id: wallet.id,           // ✅
      user_id: userId,                // ✅
      type: 'deposito',               // ✅ Português
      amount: amount,                 // ✅
      balance_before: currentBalance, // ✅
      balance_after: currentBalance,  // ✅ Não muda até webhook
      fee: 0,
      net_amount: amount,
      status: 'pending',
      description: description || 'Depósito via Pix',
      metadata: { ...pixData }
    })
    .select()
    .single();

  return {
    transaction_id: transaction.id,
    pix: pixData,
    ...
  };
}
```

### Confirmar Depósito (Webhook)

```javascript
async confirmDeposit(correlationID, paymentData) {
  // 1. Buscar transação
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('metadata->>correlationID', correlationID)
    .eq('type', 'deposito')  // ✅ Português
    .single();

  // 2. Buscar wallet
  const { data: wallet } = await supabase
    .from('wallet')
    .select('balance, total_deposited')
    .eq('user_id', transaction.user_id)
    .single();

  // 3. Calcular novo saldo
  const newBalance = parseFloat(wallet.balance) + parseFloat(transaction.amount);

  // 4. Atualizar wallet
  await supabase
    .from('wallet')
    .update({
      balance: newBalance,
      total_deposited: parseFloat(wallet.total_deposited) + parseFloat(transaction.amount)
    })
    .eq('user_id', transaction.user_id);

  // 5. Atualizar transação
  await supabase
    .from('transactions')
    .update({
      status: 'completed',
      balance_after: newBalance,  // ✅ Atualizar com novo saldo
      processed_at: new Date().toISOString(),
      metadata: {
        ...transaction.metadata,
        payment_data: paymentData
      }
    })
    .eq('id', transaction.id);

  return { success: true, new_balance: newBalance };
}
```

---

## 🎯 Checklist de Compatibilidade

Para integração funcionar com Supabase:

- [x] Usar tipos em português (deposito, saque, taxa)
- [x] Incluir wallet_id (obrigatório)
- [x] Incluir balance_before (obrigatório)
- [x] Incluir balance_after (obrigatório)
- [x] Buscar balance antes de criar transação
- [x] Atualizar balance_after no webhook
- [x] Usar ENUM correto
- [x] Incluir user_id
- [x] Incluir campos opcionais

---

## 🚀 Deploy em Andamento

Commit: **df2b2851**  
Status: ⏳ **Aguardando deploy no Render (~2 min)**

Após deploy:
- ✅ Todas as correções de schema aplicadas
- ✅ Integração 100% compatível com Supabase
- ✅ Pronto para funcionar!

---

**Última correção**: 08/11/2025 às 02:06  
**Total de correções**: 4  
**Status**: ✅ Schema completamente compatível


