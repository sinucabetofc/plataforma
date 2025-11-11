# 🧪 TESTE: Aposta Parcialmente Casada

## 📊 Situação Atual

**Aposta ID:** `c53d2aae-f2ec-4ec1-a53c-70727e4aba0d`

```
Usuário: 248cee73-ff5c-494a-9699-ef0f4bb0a1a1
Série: 2 (ENCERRADA)
Vencedor: b674c5cb-b239-49b3-adf6-a55aab0f9e70

Aposta:
- Valor total: R$ 20,00
- Valor casado: R$ 10,00 (50%)
- Valor não casado: R$ 10,00
- Status: parcialmente_aceita ⚠️  (NÃO FOI RESOLVIDA!)
- Actual return: NULL

Jogador escolhido: c9150483-da8b-458c-8d23-100c3e6b795a
```

**Problema:** A série já encerrou mas o trigger antigo **NÃO RESOLVEU** apostas `parcialmente_aceita`!

---

## ✅ SOLUÇÃO

### **Passo 1: Verificar qual jogador ganhou**

```sql
SELECT 
    s.serie_number,
    s.winner_player_id,
    p.name as vencedor,
    b.chosen_player_id,
    p2.name as apostou_em,
    CASE 
        WHEN b.chosen_player_id = s.winner_player_id THEN 'GANHOU ✅'
        ELSE 'PERDEU ❌'
    END as resultado
FROM series s
JOIN players p ON p.id = s.winner_player_id
JOIN bets b ON b.serie_id = s.id
JOIN players p2 ON p2.id = b.chosen_player_id
WHERE b.id = 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d';
```

### **Passo 2: Executar migration 1043**

**Arquivo:** `1043_resolve_pending_partial_bets.sql`

```
SQL Editor > Colar > Run
```

**O que vai acontecer:**

**SE GANHOU:**
```
Ganho: R$ 10 × 2 = R$ 20
Reembolso: R$ 10
Total: R$ 30 ✅

Transação criada:
- Type: ganho
- Amount: R$ 30
- Metadata: { matched: 1000, refund: 1000, total: 3000 }
```

**SE PERDEU:**
```
Perde: R$ 10 (casado)
Reembolso: R$ 10
Total: R$ 10 ✅

Transação criada:
- Type: reembolso
- Amount: R$ 10
- Metadata: { matched: 1000, refund: 1000 }
```

### **Passo 3: Verificar resultado**

```sql
-- Ver aposta resolvida
SELECT 
    status,
    amount / 100.0 as apostou,
    matched_amount / 100.0 as casado,
    remaining_amount / 100.0 as nao_casado,
    actual_return / 100.0 as recebeu
FROM bets 
WHERE id = 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d';

-- Ver transação de ganho/reembolso
SELECT 
    type,
    amount / 100.0 as valor,
    description,
    metadata->'win_amount' as ganho,
    metadata->'refund_amount' as reembolso
FROM transactions
WHERE bet_id = 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d'
  AND type IN ('ganho', 'reembolso')
ORDER BY created_at DESC;

-- Ver saldo atualizado
SELECT balance / 100.0 as saldo
FROM wallet
WHERE user_id = '248cee73-ff5c-494a-9699-ef0f4bb0a1a1';
```

---

## 🐛 Sobre o R$ 80 que você mencionou

Você disse que recebeu R$ 80 ao invés de R$ 30. Isso indica que pode ter havido:

1. **Trigger duplicado** creditando 2x
2. **Aposta resolvida 2x** 
3. **Confusão com outra aposta**

### **Verificar triggers duplicados:**

```sql
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    tgtype as timing
FROM pg_trigger 
WHERE tgrelid = 'bets'::regclass
  AND tgname LIKE '%credit%';
```

Se tiver mais de 1 trigger `credit_winnings`, isso explica o dobro!

---

## 🔧 CORREÇÃO MANUAL (Se necessário)

Se a aposta já foi resolvida com valor errado:

```sql
-- 1. Ver quanto recebeu
SELECT 
    b.id,
    b.amount,
    b.matched_amount,
    b.remaining_amount,
    b.actual_return,
    b.status
FROM bets b
WHERE b.id = 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d';

-- 2. Calcular correção
-- Deveria: (1000 * 2) + 1000 = 3000 (R$ 30)
-- Recebeu: ??? 

-- 3. Aplicar correção manual se necessário
DO $$
DECLARE
    correct_amount INTEGER := 3000;  -- R$ 30
    current_return INTEGER;
    difference INTEGER;
    user_id UUID := '248cee73-ff5c-494a-9699-ef0f4bb0a1a1';
    wallet_id UUID;
    current_balance INTEGER;
BEGIN
    -- Buscar valor atual
    SELECT actual_return INTO current_return
    FROM bets WHERE id = 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d';
    
    difference := correct_amount - COALESCE(current_return, 0);
    
    RAISE NOTICE 'Deveria receber: R$ %', correct_amount::DECIMAL / 100;
    RAISE NOTICE 'Recebeu: R$ %', COALESCE(current_return, 0)::DECIMAL / 100;
    RAISE NOTICE 'Diferença: R$ %', difference::DECIMAL / 100;
    
    IF difference != 0 THEN
        -- Buscar wallet
        SELECT id, balance INTO wallet_id, current_balance
        FROM wallet WHERE user_id = user_id;
        
        -- Ajustar saldo
        UPDATE wallet
        SET balance = balance + difference
        WHERE user_id = user_id;
        
        -- Atualizar aposta
        UPDATE bets
        SET actual_return = correct_amount
        WHERE id = 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d';
        
        -- Criar transação de ajuste
        INSERT INTO transactions (
            wallet_id, user_id, bet_id, type, amount,
            balance_before, balance_after,
            description, status
        ) VALUES (
            wallet_id, user_id, 'c53d2aae-f2ec-4ec1-a53c-70727e4aba0d',
            'ajuste', difference,
            current_balance, current_balance + difference,
            'Correção manual de pagamento parcial', 'completed'
        );
        
        RAISE NOTICE 'Correção aplicada: R$ %', difference::DECIMAL / 100;
    END IF;
END$$;
```

---

## 📝 Execute Agora:

**1. Execute:** `1043_resolve_pending_partial_bets.sql`  
**2. Verifique:** queries acima  
**3. Se ainda estiver errado:** correção manual

Isso vai processar a aposta corretamente! 🚀

