# ⚡ COMO ATIVAR O MATCHING AUTOMÁTICO

**Urgência:** ALTA  
**Tempo:** 5 minutos  
**Impacto:** Apostas do Kaique e Baianinho serão casadas  

---

## 🚀 PASSO A PASSO

### **1. Abrir Supabase Dashboard**
- Vá em: https://supabase.com
- Faça login
- Selecione o projeto **SinucaBet**

### **2. Ir para SQL Editor**
- No menu lateral esquerdo
- Clique em **"SQL Editor"** (ícone de terminal `</>`)

### **3. Executar Migration 1008**

**Clique em "New Query"** e cole:

```sql
-- =====================================================
-- Migration 1008: Popular user_id
-- =====================================================

UPDATE transactions t
SET user_id = w.user_id
FROM wallet w
WHERE t.wallet_id = w.id 
  AND t.user_id IS NULL;

SELECT 
  '✅ user_id populado!' as status,
  COUNT(*) as total,
  COUNT(user_id) as with_user_id
FROM transactions;
```

**Clique em "Run"** (ou Ctrl+Enter)

Deve retornar: `✅ user_id populado!`

---

### **4. Executar Migration 1009**

**Nova Query**, cole:

```sql
-- =====================================================
-- Migration 1009: Triggers com user_id
-- =====================================================

CREATE OR REPLACE FUNCTION create_bet_transaction()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  wallet_id_val UUID;
  transaction_status VARCHAR;
BEGIN
  SELECT w.id, w.balance 
  INTO wallet_id_val, user_balance
  FROM wallet w
  WHERE w.user_id = NEW.user_id;
  
  -- Status dinâmico
  transaction_status := CASE 
    WHEN NEW.status = 'pendente' THEN 'pending'
    WHEN NEW.status = 'aceita' THEN 'completed'
    ELSE 'completed'
  END;
  
  INSERT INTO transactions (
    wallet_id, user_id, bet_id, type, amount,
    balance_before, balance_after, description, status, metadata
  ) VALUES (
    wallet_id_val, NEW.user_id, NEW.id, 'aposta', -NEW.amount,
    user_balance + NEW.amount, user_balance,
    'Aposta na série ' || (SELECT serie_number FROM series WHERE id = NEW.serie_id),
    transaction_status,
    jsonb_build_object('bet_status', NEW.status)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_bet_transaction ON bets;
CREATE TRIGGER trigger_create_bet_transaction
  AFTER INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION create_bet_transaction();

SELECT '✅ Triggers atualizados!' as status;
```

**Clique em "Run"**

---

### **5. Executar Migration 1010** ⭐ **MAIS IMPORTANTE**

**Nova Query**, cole:

```sql
-- =====================================================
-- Migration 1010: Sincronizar status
-- =====================================================

-- Trigger para atualizar status da transação quando aposta mudar
CREATE OR REPLACE FUNCTION update_bet_transaction_status()
RETURNS TRIGGER AS $$
DECLARE
  transaction_status VARCHAR;
BEGIN
  transaction_status := CASE 
    WHEN NEW.status = 'pendente' THEN 'pending'
    WHEN NEW.status = 'aceita' THEN 'completed'
    WHEN NEW.status = 'ganha' THEN 'completed'
    WHEN NEW.status = 'perdida' THEN 'completed'
    WHEN NEW.status = 'cancelada' THEN 'cancelled'
    WHEN NEW.status = 'reembolsada' THEN 'completed'
    ELSE 'completed'
  END;
  
  UPDATE transactions
  SET 
    status = transaction_status,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('bet_status', NEW.status)
  WHERE bet_id = NEW.id AND type = 'aposta';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_bet_transaction_status ON bets;
CREATE TRIGGER trigger_update_bet_transaction_status
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_bet_transaction_status();

-- Atualizar transações existentes
UPDATE transactions t
SET 
  status = CASE 
    WHEN b.status = 'pendente' THEN 'pending'
    WHEN b.status = 'aceita' THEN 'completed'
    ELSE 'completed'
  END,
  metadata = COALESCE(t.metadata, '{}'::jsonb) || jsonb_build_object('bet_status', b.status)
FROM bets b
WHERE t.bet_id = b.id AND t.type = 'aposta';

SELECT '✅ Status sincronizado!' as status;
```

**Clique em "Run"**

---

### **6. Reiniciar Backend**

No terminal:

```bash
# Parar o servidor (Ctrl+C)

# Reiniciar
cd backend
npm run dev
```

---

## ✅ VALIDAR QUE FUNCIONOU

### **Opção 1: Criar Nova Aposta**

1. Cancele as apostas atuais do Kaique e Baianinho
2. Crie uma nova aposta pelo Kaique (R$ 60)
3. Crie aposta oposta pelo Baianinho (R$ 60)
4. **Veja o matching acontecer instantaneamente!** 🎉

### **Opção 2: Verificar Logs do Backend**

Busque no console:
```
✅ [MATCHING] PAR ENCONTRADO!
🎉 [MATCHING] APOSTAS CASADAS COM SUCESSO!
```

### **Opção 3: Verificar no Admin**

Recarregue `/admin/transactions`:
- ✅ Badges devem mostrar 🔵 "Aposta casada" 

---

## 🎯 RESULTADO FINAL

**Após executar:**

✅ Matching automático ATIVADO  
✅ Apostas com mesmo valor casam instantaneamente  
✅ Badges sincronizam automaticamente  
✅ Experiência profissional de casa de apostas  

---

**Total de migrations:** 3  
**Tempo estimado:** 5 minutos  
**Complexidade:** Baixa (copiar e colar)  
**Resultado:** 🎉 Sistema 100% funcional!

