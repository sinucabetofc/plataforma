# ⚡ EXECUTAR TODAS AS MIGRATIONS - GUIA COMPLETO

**Data:** 07/11/2025  
**Tempo Total:** 10 minutos  
**Resultado:** Sistema 100% funcional com matching e resolução automática  

---

## 🎯 MIGRATIONS A EXECUTAR (4 TOTAL)

Execute **nesta ordem exata** no **Supabase SQL Editor**:

---

### **1️⃣ Migration 1008: Popular user_id**

**Arquivo:** `backend/supabase/migrations/1008_populate_transaction_user_id.sql`

**O que faz:**
- Preenche `user_id` em transações antigas (baseado em wallet_id)
- Garante JOIN funcional com tabela users

**SQL:**
```sql
UPDATE transactions t
SET user_id = w.user_id
FROM wallet w
WHERE t.wallet_id = w.id 
  AND t.user_id IS NULL;

SELECT 
  'user_id populado com sucesso!' as status,
  COUNT(*) as total_transactions,
  COUNT(user_id) as with_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as missing_user_id
FROM transactions;
```

**Resultado esperado:** `✅ user_id populado com sucesso!`

---

### **2️⃣ Migration 1009: Triggers com user_id**

**Arquivo:** `backend/supabase/migrations/1009_fix_triggers_add_user_id.sql`

**O que faz:**
- Atualiza 3 triggers (aposta, ganho, reembolso)
- Garante que futuras transações sempre tenham `user_id` e `status`

**Copie e cole TODO o conteúdo do arquivo**

**Resultado esperado:** `✅ Triggers atualizados!`

---

### **3️⃣ Migration 1010: Sincronizar Status** ⭐

**Arquivo:** `backend/supabase/migrations/1010_fix_transaction_status_logic.sql`

**O que faz:**
- Cria trigger que atualiza transações quando apostas mudarem
- Sincroniza: `pendente` → `pending` 🟡, `aceita` → `completed` 🔵
- Atualiza transações antigas

**Copie e cole TODO o conteúdo do arquivo**

**Resultado esperado:** `✅ Status sincronizado!`

---

### **4️⃣ Migration 1011: Resolver Apostas** 🚨 **CRÍTICA**

**Arquivo:** `backend/supabase/migrations/1011_fix_resolve_bets_trigger.sql`

**O que faz:**
- Cria/atualiza trigger para resolver apostas ao finalizar série
- Resolve apostas antigas que ficaram travadas
- Atualiza 'aceita' → 'ganha'/'perdida' automaticamente

**Copie e cole TODO o conteúdo do arquivo (já corrigido!)**

**Resultado esperado:**
- `✅ Trigger de resolução de apostas criado/atualizado!`
- Tabela mostrando apostas resolvidas

---

## 🚀 PASSO A PASSO COMPLETO

### **1. Abrir Supabase**
- Vá em: https://supabase.com
- Faça login
- Selecione projeto **SinucaBet**

### **2. Abrir SQL Editor**
- Menu lateral esquerdo
- Clique em **"SQL Editor"** (`</>`)

### **3. Executar Cada Migration**

Para cada migration:
1. Clique em **"New Query"**
2. Abra o arquivo correspondente no VS Code
3. **Copie TODO o conteúdo**
4. Cole no SQL Editor
5. Clique em **"Run"** (ou Ctrl+Enter)
6. Aguarde confirmação (✅)
7. Verifique os resultados na aba "Results"

### **4. Reiniciar Backend** (já foi feito)

```bash
# Backend já está rodando com as alterações
# Se necessário:
cd backend
npm run dev
```

---

## ✅ VALIDAÇÃO PÓS-MIGRATIONS

### **1. Verificar Transações:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(user_id) as com_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as sem_user_id
FROM transactions;
```

**Esperado:** `sem_user_id = 0`

### **2. Verificar Apostas:**
```sql
SELECT 
  status,
  COUNT(*) as quantidade
FROM bets
GROUP BY status
ORDER BY status;
```

**Esperado:**
- `aceita: X` (apostas casadas aguardando resultado)
- `ganha: Y` (apostas vencedoras)
- `perdida: Z` (apostas perdidas)

### **3. Verificar Trigger:**
```sql
-- Listar triggers ativos
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%resolve%';
```

**Esperado:** `trigger_resolve_bets_on_serie_end ON series`

---

## 🧪 TESTAR RESOLUÇÃO AUTOMÁTICA

### **Finalizar uma série manualmente:**

```sql
-- Atualizar série para encerrada com vencedor
UPDATE series
SET 
  status = 'encerrada',
  winner_player_id = (
    SELECT player1_id FROM matches WHERE id = series.match_id LIMIT 1
  ),
  ended_at = NOW()
WHERE serie_number = 2
  AND status = 'em_andamento';

-- Verificar se apostas foram resolvidas
SELECT 
  b.id,
  u.name as apostador,
  b.status,
  b.amount / 100.0 as valor
FROM bets b
JOIN users u ON u.id = b.user_id
WHERE b.serie_id IN (SELECT id FROM series WHERE serie_number = 2)
ORDER BY b.status;
```

**Esperado:** Apostas mudaram de 'aceita' para 'ganha'/'perdida'

---

## 📋 CHECKLIST COMPLETO

### Migrations:
- [ ] 1008 - Popular user_id
- [ ] 1009 - Triggers com user_id
- [ ] 1010 - Sincronizar status
- [ ] 1011 - Resolver apostas ⭐

### Validação:
- [ ] user_id populado em todas transações
- [ ] Triggers ativos
- [ ] Apostas antigas resolvidas
- [ ] Testar com nova série

### Frontend:
- [ ] Recarregar /admin/transactions
- [ ] Verificar badges corretos
- [ ] Recarregar /apostas
- [ ] Verificar status "Ganha"/"Perdida"

---

## 🎉 RESULTADO FINAL

Após executar todas as migrations:

✅ **Transações** com user_id e status corretos  
✅ **Matching automático** funcionando  
✅ **Resolução automática** quando série finalizar  
✅ **Badges** sincronizados em tempo real  
✅ **Ganhos creditados** automaticamente  

**Sistema profissional completo!** 🚀

---

**Tempo estimado:** 10 minutos  
**Complexidade:** Baixa (copiar e colar)  
**Impacto:** CRÍTICO (sistema não funciona sem isso)  
**Status:** ✅ Pronto para executar!

