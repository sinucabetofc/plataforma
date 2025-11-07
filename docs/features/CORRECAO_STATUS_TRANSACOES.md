# 🔧 CORREÇÃO: Status de Transações de Apostas

**Problema Identificado:** 07/11/2025  
**Status:** ✅ Correção Pronta  
**Urgência:** ALTA (lógica de negócio incorreta)

---

## ⚠️ **PROBLEMA IDENTIFICADO**

### **Situação Atual (INCORRETA):**

**Na tela de Apostas:**
- Aposta do Kaique: **"AGUARDANDO EMPARCEIRAMENTO"** 🟡

**Na tela de Transações:**
- Mesma aposta: **"Concluída"** 🟢 ← **ERRADO!**

### **O que está acontecendo:**
Quando um usuário faz uma aposta que está **aguardando emparelhamento** (status `pendente`), a transação é criada com `status='completed'`, o que está **logicamente incorreto**.

---

## 🎯 **LÓGICA CORRETA**

### **Status da Transação DEVE refletir Status da Aposta:**

| Status da Aposta | Status da Transação | Badge | Significado |
|------------------|---------------------|-------|-------------|
| `pendente` | `pending` | 🟡 Aguardando emparelhamento | Aposta não casada ainda |
| `aceita` | `completed` | 🔵 Aposta casada | Aposta emparelhada |
| `ganha` | `completed` | 🟢 Concluída | Aposta resolvida |
| `perdida` | `completed` | 🟢 Concluída | Aposta resolvida |
| `cancelada` | `cancelled` | 🔴 Cancelada | Aposta cancelada |
| `reembolsada` | `completed` | 🟢 Concluída | Valor devolvido |

---

## 🔄 **FLUXO CORRETO**

### **Exemplo: Aposta do Kaique (R$ 60,00)**

```
1. Usuário cria aposta
   ├─ Bet status: 'pendente'
   └─ Transaction status: 'pending' 🟡
   └─ Badge: "Aguardando emparelhamento"

2. Aposta é emparelhada
   ├─ Bet status: 'aceita'
   └─ Transaction status: 'completed' 🔵
   └─ Badge: "Aposta casada"

3. Usuário ganha/perde
   ├─ Bet status: 'ganha' ou 'perdida'
   └─ Transaction status: 'completed' 🟢
   └─ Badge: "Concluída"
```

---

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **1. Trigger de Criação Atualizado**

```sql
-- Status dinâmico baseado na aposta
transaction_status := CASE 
  WHEN NEW.status = 'pendente' THEN 'pending'
  WHEN NEW.status = 'aceita' THEN 'completed'
  ELSE 'completed'
END;

INSERT INTO transactions (..., status) 
VALUES (..., transaction_status);
```

### **2. Novo Trigger de Atualização**

Quando o status da aposta mudar, **atualiza automaticamente** o status da transação:

```sql
CREATE TRIGGER trigger_update_bet_transaction_status
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_bet_transaction_status();
```

### **3. Correção de Dados Existentes**

Atualiza todas as transações antigas para refletir o status correto da aposta:

```sql
UPDATE transactions t
SET status = CASE 
  WHEN b.status = 'pendente' THEN 'pending'
  WHEN b.status = 'aceita' THEN 'completed'
  -- ... outros status
END
FROM bets b
WHERE t.bet_id = b.id AND t.type = 'aposta';
```

---

## 🚀 **COMO APLICAR A CORREÇÃO**

### **Executar Migration no Supabase:**

1. Abra **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute: `backend/supabase/migrations/1010_fix_transaction_status_logic.sql`
4. Aguarde confirmação
5. Recarregue a página de transações

**OU execute direto o arquivo completo:**
📄 `backend/FIX_TRANSACTIONS_USER_ID.sql` (já inclui tudo)

---

## 📊 **RESULTADO ESPERADO**

### **ANTES da correção:**
```
╔═════════════╦═══════╦═════════╦═══════════╗
║ USUÁRIO     ║ TIPO  ║ VALOR   ║ STATUS    ║
╠═════════════╬═══════╬═════════╬═══════════╣
║ Kaique      ║Aposta ║-R$ 60,00║Concluída  ║ ← ERRADO
╚═════════════╩═══════╩═════════╩═══════════╝
```

### **DEPOIS da correção:**
```
╔═════════════╦═══════╦═════════╦════════════════════════════╗
║ USUÁRIO     ║ TIPO  ║ VALOR   ║ STATUS                     ║
╠═════════════╬═══════╬═════════╬════════════════════════════╣
║ Kaique      ║Aposta ║-R$ 60,00║Aguardando emparelhamento🟡 ║ ← CORRETO
╚═════════════╩═══════╩═════════╩════════════════════════════╝
```

---

## 🎨 **BADGES QUE VÃO APARECER**

### **Para Transações de Apostas:**

| Situação da Aposta | Status da Transação | Badge |
|-------------------|---------------------|-------|
| Aposta criada, sem par | `pending` | 🟡 **Aguardando emparelhamento** |
| Aposta emparelhada | `completed` | 🔵 **Aposta casada** |
| Aposta resolvida (ganhou/perdeu) | `completed` | 🟢 **Concluída** |
| Aposta cancelada pelo usuário | `cancelled` | 🔴 **Cancelada** |
| Aposta reembolsada (série cancelada) | `completed` | 🟢 **Concluída** |

### **Para Outros Tipos de Transação:**

| Tipo | Status | Badge |
|------|--------|-------|
| Depósito (QR Code gerado) | `pending` | 🟡 **Pendente** |
| Depósito (pago) | `completed` | 🟢 **Concluída** |
| Ganho | `completed` | 🟢 **Concluída** |
| Reembolso | `completed` | 🟢 **Concluída** |
| Saque (solicitado) | `pending` | 🟡 **Pendente** |
| Saque (aprovado) | `completed` | 🟢 **Concluída** |

---

## 🔄 **SINCRONIZAÇÃO AUTOMÁTICA**

Com o novo trigger, o status da transação **sempre acompanha** o status da aposta:

```
1. Aposta criada → Status: pendente
   └─ Transação: status='pending' 🟡

2. Aposta emparelhada → Status: aceita
   └─ Transação atualiza: status='completed' 🔵

3. Resultado definido → Status: ganha/perdida
   └─ Transação permanece: status='completed' 🟢
```

---

## 📁 **ARQUIVOS CRIADOS**

```
backend/supabase/migrations/
└── 1010_fix_transaction_status_logic.sql  ← Nova migration

docs/
└── CORRECAO_STATUS_TRANSACOES.md          ← Esta documentação
```

---

## ⚡ **AÇÃO IMEDIATA NECESSÁRIA**

**Para corrigir:**

1. **Abra Supabase Dashboard** → SQL Editor
2. **Execute:** `backend/supabase/migrations/1010_fix_transaction_status_logic.sql`
3. **Aguarde:** Confirmação de execução
4. **Recarregue:** Página de transações
5. **Valide:** Status "Aguardando emparelhamento" 🟡 deve aparecer

**Após executar:**
- ✅ Aposta do Kaique aparecerá como "Aguardando emparelhamento" 🟡
- ✅ Futuras apostas terão status correto desde a criação
- ✅ Status sincroniza automaticamente quando aposta mudar

---

**Criado em:** 07/11/2025  
**Prioridade:** ALTA  
**Impacto:** Lógica de negócio  
**Status:** ✅ Migration pronta para executar

