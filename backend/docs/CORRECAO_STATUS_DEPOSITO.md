# 🔧 Correção: Status do Depósito Não Atualiza

**Problema**: O saldo é creditado corretamente, mas o status da transação não muda de `pending` para `completed`.

**Causa**: Falta de política de UPDATE no RLS (Row Level Security) da tabela `transactions`.

---

## 🚀 Solução Rápida

### Passo 1: Executar a Migration

**Opção A: Via Supabase Dashboard (Recomendado)**

1. Acesse: https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/editor
2. Vá em **SQL Editor**
3. Copie o conteúdo de `backend/supabase/migrations/1033_fix_transactions_update_policy.sql`
4. Cole no editor e clique em **RUN**

**Opção B: Via Terminal**

```bash
cd backend/supabase/migrations
psql -h db.atjxmyrkzcumieuayapr.supabase.co \
     -U postgres \
     -d postgres \
     -f 1033_fix_transactions_update_policy.sql
```

### Passo 2: Verificar

Após executar a migration, faça um novo depósito para testar:

1. Gere um QR Code PIX
2. Pague o PIX
3. Aguarde alguns segundos
4. Verifique se o status mudou para **"Concluída"** no painel

---

## 📊 O Que a Migration Faz

### ✅ Adiciona Política de UPDATE

```sql
CREATE POLICY "transactions_system_update"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

Isso permite que o **backend (via service role)** atualize o status das transações quando o webhook da Woovi confirma o pagamento.

### ✅ Mantém Outras Políticas

- **Admin**: Acesso total
- **Usuários**: Visualizam apenas suas transações
- **Sistema**: Pode inserir e atualizar (webhook)
- **Parceiros**: Veem transações das suas partidas

---

## 🔍 Logs Melhorados

O código agora tem logs detalhados:

```
🔍 [CONFIRM_DEPOSIT] Buscando transação com correlationID: ...
✅ [CONFIRM_DEPOSIT] Transação encontrada: { id, status, amount }
💰 [CONFIRM_DEPOSIT] Atualizando saldo da carteira...
✅ [CONFIRM_DEPOSIT] Novo saldo: 50.00 reais
📝 [CONFIRM_DEPOSIT] Atualizando status da transação para completed...
✅ [CONFIRM_DEPOSIT] Transação atualizada: { id, status: 'completed' }
```

Você pode acompanhar esses logs em tempo real:

```bash
cd backend
tail -f backend.log
```

---

## 🧪 Como Testar

### 1. Antes da Migration (Problema)
```
Status: pending ❌
Saldo: R$ 100,00 ✅ (creditado)
```

### 2. Depois da Migration (Corrigido)
```
Status: completed ✅
Saldo: R$ 100,00 ✅
```

---

## 🆘 Se Ainda Não Funcionar

### Verificar Logs do Backend

```bash
cd backend
tail -f backend.log | grep CONFIRM_DEPOSIT
```

### Verificar Políticas RLS

Execute no SQL Editor do Supabase:

```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'transactions'
ORDER BY policyname;
```

### Testar Atualização Manual

Execute no SQL Editor do Supabase:

```sql
-- Buscar transações pendentes
SELECT id, type, amount/100 as reais, status
FROM transactions
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- Atualizar manualmente (substitua o ID)
UPDATE transactions
SET status = 'completed'
WHERE id = 'SEU-TRANSACTION-ID';
```

Se o UPDATE manual funcionar, o problema está nas políticas RLS. Se não funcionar, pode ser uma constraint.

---

## ✅ Checklist

- [ ] Migration executada no Supabase
- [ ] Backend reiniciado
- [ ] Novo depósito testado
- [ ] Status muda para "completed"
- [ ] Logs verificados

---

## 📝 Notas Técnicas

**Por que o saldo atualiza mas o status não?**

O código faz 2 operações:

```javascript
// 1. Atualizar saldo (funciona)
await supabase.from('wallet').update({ balance: newBalance })

// 2. Atualizar status (era bloqueado por RLS)
await supabase.from('transactions').update({ status: 'completed' })
```

A tabela `wallet` não tem RLS ou tem políticas mais permissivas, então a atualização funciona. Mas `transactions` tinha RLS sem política de UPDATE, bloqueando a segunda operação.

A migration adiciona a política de UPDATE necessária.

---

## 🎯 Resultado Esperado

Depois da correção:

**No Painel do Usuário:**
```
Depósito - R$ 50,00
Status: ✅ Concluída
Data: há 2 minutos
```

**No Painel Admin:**
```
Depósito - Usuário: João Silva
Valor: R$ 50,00
Status: ✅ Completed
```

**Nos Logs do Backend:**
```
✅ [CONFIRM_DEPOSIT] Transação atualizada: completed
✅ [CONFIRM_DEPOSIT] Novo saldo: 150.00 reais
```

