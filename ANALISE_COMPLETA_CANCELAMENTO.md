# 🔍 ANÁLISE COMPLETA: Problema do Dobro no Cancelamento

**Data**: 07/11/2025  
**Status**: 🔴 EM INVESTIGAÇÃO

---

## 🎯 PROBLEMA CONFIRMADO

**Sintoma**: Ao cancelar aposta de R$ 10, recebe R$ 20 de volta (DOBRO)

---

## 🔎 POSSÍVEIS CAUSAS

### 1. ⚠️ Service Backend Creditando Dobro
**Localização**: `backend/services/bets.service.js` linha 457-463

**Código atual**:
```javascript
const { error: updateWalletError } = await supabase
  .from('wallet')
  .update({
    balance: wallet.balance + bet.amount  // ← SUSPEITO
  })
  .eq('user_id', userId);
```

**Possível problema**: 
- Se `wallet.balance` já incluir o débito
- Ou se `bet.amount` estiver multiplicado

---

### 2. ⚠️ Trigger na Tabela `wallet`
**Possível**: Trigger que executa ao UPDATE da wallet

**Verificação necessária**:
```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'wallet';
```

---

### 3. ⚠️ Trigger na Tabela `bets` 
**Possível**: Trigger executando em status 'cancelada'

**Triggers conhecidos**:
- `trigger_credit_winnings` (migration 1009)
- `trigger_credit_winnings_v2` (migration 1019)
- `trigger_update_bet_transaction_status`
- `trigger_create_bet_transaction`

---

### 4. ⚠️ Transação Duplicada
**Possível**: Service criando 2 transações de reembolso

**Código atual**: Linha 474-486
```javascript
const { error: transactionError } = await supabase
  .from('transactions')
  .insert({
    wallet_id: wallet.id,
    user_id: userId,
    bet_id: betId,
    type: 'reembolso',
    amount: bet.amount,  // ← Valor correto
    ...
  });
```

---

### 5. ⚠️ Frontend Chamando Duas Vezes
**Possível**: Duplo clique ou React rendering

**Código atual**: `frontend/pages/partidas/[id].js` linha 564-568
```javascript
const handleCancelBet = async (betId) => {
  await api.bets.cancel(betId);
  const response = await api.bets.getBySerie(serie.id);
  setBetsData(response);
};
```

---

### 6. ⚠️ Transação CREATE Trigger Duplicando
**Possível**: Trigger em INSERT na transactions

**Verificação necessária**:
```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'transactions';
```

---




