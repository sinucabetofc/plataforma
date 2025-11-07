-- =====================================================
-- SCRIPT: Corrigir user_id em todas as transações
-- Executar via Supabase SQL Editor
-- =====================================================

-- PASSO 1: Popular user_id nas transações existentes
UPDATE transactions t
SET user_id = w.user_id
FROM wallet w
WHERE t.wallet_id = w.id 
  AND t.user_id IS NULL;

-- Verificar resultado
SELECT 
  '✅ PASSO 1: user_id populado!' as status,
  COUNT(*) as total_transactions,
  COUNT(user_id) as with_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as missing_user_id
FROM transactions;

-- Mostrar exemplos
SELECT 
  t.id,
  t.user_id,
  u.name as user_name,
  u.email,
  t.type,
  t.amount / 100.0 as valor_reais,
  t.created_at
FROM transactions t
LEFT JOIN users u ON u.id = t.user_id
ORDER BY t.created_at DESC
LIMIT 5;

-- =====================================================
-- PASSO 2: Atualizar trigger de criação de aposta
-- =====================================================

CREATE OR REPLACE FUNCTION create_bet_transaction()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  wallet_id_val UUID;
BEGIN
  -- Buscar saldo atual e ID da wallet
  SELECT w.id, w.balance 
  INTO wallet_id_val, user_balance
  FROM wallet w
  WHERE w.user_id = NEW.user_id;
  
  -- Criar transação COM user_id
  INSERT INTO transactions (
    wallet_id,
    user_id,              -- ← IMPORTANTE
    bet_id,
    type,
    amount,
    balance_before,
    balance_after,
    description,
    status
  ) VALUES (
    wallet_id_val,
    NEW.user_id,          -- ← IMPORTANTE
    NEW.id,
    'aposta',
    -NEW.amount,
    user_balance + NEW.amount,
    user_balance,
    'Aposta na série ' || (
      SELECT serie_number FROM series WHERE id = NEW.serie_id
    ),
    'completed'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ PASSO 2: Trigger de aposta atualizado!' as status;

-- =====================================================
-- PASSO 3: Atualizar trigger de ganhos
-- =====================================================

CREATE OR REPLACE FUNCTION credit_winnings()
RETURNS TRIGGER AS $$
DECLARE
  return_amount INTEGER;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    return_amount := NEW.amount * 2;
    
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM wallet
    WHERE user_id = NEW.user_id;
    
    UPDATE wallet
    SET balance = balance + return_amount
    WHERE user_id = NEW.user_id;
    
    -- Criar transação COM user_id
    INSERT INTO transactions (
      wallet_id,
      user_id,            -- ← IMPORTANTE
      bet_id,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      status
    ) VALUES (
      user_wallet_id,
      NEW.user_id,        -- ← IMPORTANTE
      NEW.id,
      'ganho',
      return_amount,
      current_balance,
      current_balance + return_amount,
      'Ganho na aposta da série ' || (
        SELECT serie_number FROM series WHERE id = NEW.serie_id
      ),
      'completed'
    );
    
    UPDATE bets
    SET actual_return = return_amount
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ PASSO 3: Trigger de ganhos atualizado!' as status;

-- =====================================================
-- PASSO 4: Atualizar trigger de reembolso
-- =====================================================

CREATE OR REPLACE FUNCTION auto_refund_pending_bets_on_serie_cancel()
RETURNS TRIGGER AS $$
DECLARE
  bet_record RECORD;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  IF NEW.status = 'cancelada' AND OLD.status != 'cancelada' THEN
    FOR bet_record IN 
      SELECT * FROM bets 
      WHERE serie_id = NEW.id 
      AND status IN ('pendente', 'aceita')
    LOOP
      SELECT id, balance INTO user_wallet_id, current_balance
      FROM wallet
      WHERE user_id = bet_record.user_id;
      
      UPDATE wallet
      SET balance = balance + bet_record.amount
      WHERE user_id = bet_record.user_id;
      
      -- Criar transação COM user_id
      INSERT INTO transactions (
        wallet_id,
        user_id,          -- ← IMPORTANTE
        bet_id,
        type,
        amount,
        balance_before,
        balance_after,
        description,
        status
      ) VALUES (
        user_wallet_id,
        bet_record.user_id, -- ← IMPORTANTE
        bet_record.id,
        'reembolso',
        bet_record.amount,
        current_balance,
        current_balance + bet_record.amount,
        'Reembolso - Série cancelada',
        'completed'
      );
      
      UPDATE bets
      SET status = 'reembolsada',
          resolved_at = TIMEZONE('utc'::text, NOW())
      WHERE id = bet_record.id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ PASSO 4: Trigger de reembolso atualizado!' as status;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
  '🎉 TODAS AS CORREÇÕES APLICADAS!' as status,
  COUNT(*) as total_transactions,
  COUNT(user_id) as with_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as missing_user_id,
  CASE 
    WHEN COUNT(*) FILTER (WHERE user_id IS NULL) = 0 
    THEN '✅ Tudo OK!' 
    ELSE '⚠️ Ainda há transações sem user_id' 
  END as resultado
FROM transactions;

-- Listar últimas 10 transações com usuário
SELECT 
  t.type,
  u.name as usuario,
  t.amount / 100.0 as valor_reais,
  t.status,
  t.created_at
FROM transactions t
LEFT JOIN users u ON u.id = t.user_id
ORDER BY t.created_at DESC
LIMIT 10;

