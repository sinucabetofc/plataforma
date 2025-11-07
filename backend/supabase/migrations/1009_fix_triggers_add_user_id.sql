-- =====================================================
-- Migration: 1009_fix_triggers_add_user_id
-- Description: Atualizar triggers para SEMPRE incluir user_id
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- TRIGGER: Criar transação de aposta com user_id
-- =====================================================

CREATE OR REPLACE FUNCTION create_bet_transaction()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  wallet_id_val UUID;
BEGIN
  -- Buscar saldo atual e ID da wallet (após débito)
  SELECT w.id, w.balance 
  INTO wallet_id_val, user_balance
  FROM wallet w
  WHERE w.user_id = NEW.user_id;
  
  -- Criar transação de débito COM user_id
  INSERT INTO transactions (
    wallet_id,
    user_id,              -- ← ADICIONADO
    bet_id,
    type,
    amount,
    balance_before,
    balance_after,
    description,
    status                -- ← ADICIONADO
  ) VALUES (
    wallet_id_val,
    NEW.user_id,          -- ← ADICIONADO
    NEW.id,
    'aposta',
    -NEW.amount,
    user_balance + NEW.amount,
    user_balance,
    'Aposta na série ' || (
      SELECT serie_number FROM series WHERE id = NEW.serie_id
    ),
    'completed'           -- ← ADICIONADO
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Creditar ganhos com user_id
-- =====================================================

CREATE OR REPLACE FUNCTION credit_winnings()
RETURNS TRIGGER AS $$
DECLARE
  return_amount INTEGER;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    -- Calcular retorno (por enquanto 2x o valor, depois implementar odds)
    return_amount := NEW.amount * 2;
    
    -- Buscar wallet e saldo atual
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM wallet
    WHERE user_id = NEW.user_id;
    
    -- Creditar saldo
    UPDATE wallet
    SET balance = balance + return_amount
    WHERE user_id = NEW.user_id;
    
    -- Criar transação de crédito COM user_id
    INSERT INTO transactions (
      wallet_id,
      user_id,            -- ← ADICIONADO
      bet_id,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      status              -- ← ADICIONADO
    ) VALUES (
      user_wallet_id,
      NEW.user_id,        -- ← ADICIONADO
      NEW.id,
      'ganho',
      return_amount,
      current_balance,
      current_balance + return_amount,
      'Ganho na aposta da série ' || (
        SELECT serie_number FROM series WHERE id = NEW.serie_id
      ),
      'completed'         -- ← ADICIONADO
    );
    
    -- Atualizar actual_return
    UPDATE bets
    SET actual_return = return_amount
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Reembolso com user_id
-- =====================================================

CREATE OR REPLACE FUNCTION auto_refund_pending_bets_on_serie_cancel()
RETURNS TRIGGER AS $$
DECLARE
  bet_record RECORD;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  IF NEW.status = 'cancelada' AND OLD.status != 'cancelada' THEN
    -- Iterar sobre todas as apostas pendentes ou aceitas
    FOR bet_record IN 
      SELECT * FROM bets 
      WHERE serie_id = NEW.id 
      AND status IN ('pendente', 'aceita')
    LOOP
      -- Buscar wallet e saldo atual
      SELECT id, balance INTO user_wallet_id, current_balance
      FROM wallet
      WHERE user_id = bet_record.user_id;
      
      -- Creditar o valor de volta
      UPDATE wallet
      SET balance = balance + bet_record.amount
      WHERE user_id = bet_record.user_id;
      
      -- Criar transação de reembolso COM user_id
      INSERT INTO transactions (
        wallet_id,
        user_id,          -- ← ADICIONADO
        bet_id,
        type,
        amount,
        balance_before,
        balance_after,
        description,
        status            -- ← ADICIONADO
      ) VALUES (
        user_wallet_id,
        bet_record.user_id, -- ← ADICIONADO
        bet_record.id,
        'reembolso',
        bet_record.amount,
        current_balance,
        current_balance + bet_record.amount,
        'Reembolso - Série cancelada',
        'completed'       -- ← ADICIONADO
      );
      
      -- Atualizar status da aposta
      UPDATE bets
      SET status = 'reembolsada',
          resolved_at = TIMEZONE('utc'::text, NOW())
      WHERE id = bet_record.id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar triggers
DROP TRIGGER IF EXISTS trigger_create_bet_transaction ON bets;
CREATE TRIGGER trigger_create_bet_transaction
  AFTER INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION create_bet_transaction();

DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;
CREATE TRIGGER trigger_credit_winnings
  AFTER UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION credit_winnings();

DROP TRIGGER IF EXISTS trigger_auto_refund_on_cancel ON series;
CREATE TRIGGER trigger_auto_refund_on_cancel
  AFTER UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION auto_refund_pending_bets_on_serie_cancel();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 'Triggers atualizados com user_id!' as status;

-- Verificar se há transações sem user_id
SELECT 
  COUNT(*) as total,
  COUNT(user_id) as with_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as missing_user_id
FROM transactions;

