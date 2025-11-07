# 🔧 CORREÇÃO: Nome de Usuário Vazio nas Transações

**Problema Identificado:** 07/11/2025  
**Status:** ⚠️ Requer execução de SQL  
**Urgência:** Média (visual, não afeta funcionalidade)

---

## ⚠️ **PROBLEMA**

Na tabela de transações do painel admin, a **coluna USUÁRIO está aparecendo vazia** em algumas transações:

```
╔═══════════╦═══════╦═════════╦═══════════╦════════╗
║ USUÁRIO   ║ TIPO  ║ VALOR   ║ STATUS    ║ DATA   ║
╠═══════════╬═══════╬═════════╬═══════════╬════════╣
║ (vazio)   ║Aposta ║-R$ 60,00║ Concluída ║07/11   ║ ← PROBLEMA
║ Vinicius  ║Ganho  ║ R$ 10,00║ Concluída ║06/11   ║ ← OK
╚═══════════╩═══════╩═════════╩═══════════╩════════╝
```

---

## 🔍 **CAUSA RAIZ**

### **Triggers antigos** criavam transações SEM o campo `user_id`:

```sql
-- ANTIGO (problema)
INSERT INTO transactions (
  wallet_id,
  bet_id,
  type,
  amount
  -- ❌ SEM user_id
) VALUES (...);
```

### **Resultado:**
- Campo `user_id` ficava NULL
- JOIN com tabela `users` não trazia dados
- Coluna aparece vazia no admin

---

## ✅ **SOLUÇÃO**

### **1. Popular user_id em transações antigas**
```sql
UPDATE transactions t
SET user_id = w.user_id
FROM wallet w
WHERE t.wallet_id = w.id 
  AND t.user_id IS NULL;
```

### **2. Atualizar triggers para incluir user_id**
```sql
-- NOVO (corrigido)
INSERT INTO transactions (
  wallet_id,
  user_id,    -- ✅ ADICIONADO
  bet_id,
  type,
  amount,
  status      -- ✅ ADICIONADO
) VALUES (
  wallet_id_val,
  NEW.user_id, -- ✅ ADICIONADO
  ...
);
```

---

## 🚀 **COMO APLICAR A CORREÇÃO**

### **Opção 1: Executar Script SQL Completo (RECOMENDADO)**

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo: `backend/FIX_TRANSACTIONS_USER_ID.sql`
4. Cole o conteúdo completo
5. Execute o script
6. Verifique os resultados

**Este script vai:**
- ✅ Popular `user_id` em todas as transações antigas
- ✅ Atualizar 3 triggers (aposta, ganho, reembolso)
- ✅ Garantir que futuras transações sempre tenham `user_id`
- ✅ Mostrar estatísticas de validação

---

### **Opção 2: Executar Migrations Individuais**

#### Passo 1: Popular user_id
```bash
# Via Supabase Dashboard → SQL Editor
backend/supabase/migrations/1008_populate_transaction_user_id.sql
```

#### Passo 2: Atualizar Triggers
```bash
# Via Supabase Dashboard → SQL Editor
backend/supabase/migrations/1009_fix_triggers_add_user_id.sql
```

---

## 📊 **VERIFICAÇÃO**

### **Antes da correção:**
```sql
SELECT COUNT(*) FILTER (WHERE user_id IS NULL) as sem_usuario
FROM transactions;
-- Resultado: 17 (ou mais)
```

### **Depois da correção:**
```sql
SELECT COUNT(*) FILTER (WHERE user_id IS NULL) as sem_usuario
FROM transactions;
-- Resultado esperado: 0 ✅
```

### **Testar no Admin:**
1. Abra `http://localhost:3000/admin/transactions`
2. Verifique se TODAS as linhas mostram nome e email do usuário
3. Nenhuma linha deve estar com coluna vazia

---

## 🎯 **RESULTADO ESPERADO**

### **Antes:**
```
╔═══════════╦═══════╦═════════╗
║ USUÁRIO   ║ TIPO  ║ VALOR   ║
╠═══════════╬═══════╬═════════╣
║ (vazio)   ║Aposta ║-R$ 60,00║ ← PROBLEMA
╚═══════════╩═══════╩═════════╝
```

### **Depois:**
```
╔════════════════════════╦═══════╦═════════╗
║ USUÁRIO                ║ TIPO  ║ VALOR   ║
╠════════════════════════╬═══════╬═════════╣
║ Kaique                 ║Aposta ║-R$ 60,00║ ← CORRIGIDO ✅
║ kaique@example.com     ║       ║         ║
╚════════════════════════╩═══════╩═════════╝
```

---

## 📁 **ARQUIVOS CRIADOS**

```
backend/
├── supabase/migrations/
│   ├── 1008_populate_transaction_user_id.sql  ← Popular user_id
│   └── 1009_fix_triggers_add_user_id.sql      ← Atualizar triggers
└── FIX_TRANSACTIONS_USER_ID.sql               ← Script completo

docs/
└── CORRECAO_TRANSACOES_USUARIO.md             ← Esta documentação
```

---

## ⚡ **AÇÃO NECESSÁRIA**

**Para corrigir o problema:**

1. **Abra o Supabase Dashboard**
2. **SQL Editor**
3. **Execute:** `backend/FIX_TRANSACTIONS_USER_ID.sql`
4. **Aguarde:** ~2 segundos
5. **Recarregue:** Página de transações no admin
6. **Valide:** Todos os usuários devem aparecer

**Após executar, todas as transações terão o nome do usuário visível!** ✅

---

**Criado em:** 07/11/2025  
**Prioridade:** Média  
**Impacto:** Visual (não afeta dados)  
**Tempo estimado:** 2 minutos

