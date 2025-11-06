-- =====================================================
-- Migration: 1003_revert_to_debit_on_bet
-- Description: Reverter para sistema que DEBITA o saldo ao criar aposta
--              Saldo bloqueado não deve aparecer (sempre R$ 0)
-- Created: 2025-11-06
-- =====================================================

-- =====================================================
-- TRIGGER: Debitar saldo AO CRIAR aposta (volta ao sistema original)
-- =====================================================

CREATE OR REPLACE FUNCTION validate_bet_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  serie_status_val serie_status;
  serie_betting_enabled BOOLEAN;
  user_balance INTEGER;
BEGIN
  -- 1. Verificar se série está liberada OU em andamento para apostas
  SELECT s.status, s.betting_enabled
  INTO serie_status_val, serie_betting_enabled
  FROM series s
  WHERE s.id = NEW.serie_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Série não encontrada';
  END IF;
  
  -- Permitir apostas em séries liberadas OU em andamento (apostas ao vivo)
  IF serie_status_val != 'liberada' AND serie_status_val != 'em_andamento' THEN
    RAISE EXCEPTION 'Série não está disponível para apostas (status: %)', serie_status_val;
  END IF;
  
  IF NOT serie_betting_enabled THEN
    RAISE EXCEPTION 'Apostas não estão habilitadas para esta série';
  END IF;
  
  -- 2. Verificar se usuário tem saldo suficiente (saldo REAL, sem apostas pendentes)
  SELECT w.balance INTO user_balance
  FROM wallet w
  WHERE w.user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Carteira não encontrada';
  END IF;
  
  IF user_balance < NEW.amount THEN
    RAISE EXCEPTION 'Saldo insuficiente (disponível: R$ %, necessário: R$ %)',
      user_balance::DECIMAL / 100,
      NEW.amount::DECIMAL / 100;
  END IF;
  
  -- 3. Verificar se chosen_player é da partida
  IF NOT EXISTS (
    SELECT 1 FROM series s
    JOIN matches m ON m.id = s.match_id
    WHERE s.id = NEW.serie_id
    AND NEW.chosen_player_id IN (m.player1_id, m.player2_id)
  ) THEN
    RAISE EXCEPTION 'Jogador escolhido não está nesta partida';
  END IF;
  
  -- 4. DEBITAR o saldo imediatamente
  UPDATE wallet
  SET balance = balance - NEW.amount
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Criar transação APÓS inserir aposta
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
  
  -- Criar transação de débito
  INSERT INTO transactions (
    wallet_id,
    bet_id,
    type,
    amount,
    balance_before,
    balance_after,
    description
  ) VALUES (
    wallet_id_val,
    NEW.id,
    'aposta',
    -NEW.amount,
    user_balance + NEW.amount,  -- Saldo antes do débito
    user_balance,               -- Saldo atual (após débito)
    'Aposta na série ' || (
      SELECT serie_number FROM series WHERE id = NEW.serie_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Creditar APENAS quando ganhar (não quando perder)
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
    
    -- Criar transação de crédito
    INSERT INTO transactions (
      wallet_id,
      bet_id,
      type,
      amount,
      balance_before,
      balance_after,
      description
    ) VALUES (
      user_wallet_id,
      NEW.id,
      'ganho',
      return_amount,
      current_balance,
      current_balance + return_amount,
      'Ganho na aposta da série ' || (
        SELECT serie_number FROM series WHERE id = NEW.serie_id
      )
    );
    
    -- Atualizar actual_return
    UPDATE bets
    SET actual_return = return_amount
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger de ganhos
DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;
CREATE TRIGGER trigger_credit_winnings
  AFTER UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION credit_winnings();

-- =====================================================
-- REMOVER TRIGGER QUE DEBITAVA QUANDO PERDIA
-- =====================================================

DROP TRIGGER IF EXISTS trigger_debit_balance_on_bet_lost ON bets;
DROP FUNCTION IF EXISTS debit_balance_on_bet_lost();

-- =====================================================
-- ATUALIZAR getWallet para NÃO calcular saldo bloqueado
-- =====================================================

-- O saldo bloqueado sempre será 0, pois o saldo já foi debitado

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 'Sistema revertido: saldo é debitado ao criar aposta!' as status;

-- Mostrar saldos
SELECT 
  u.email,
  w.balance / 100.0 as saldo_disponivel,
  COALESCE(SUM(b.amount) FILTER (WHERE b.status IN ('pendente', 'aceita')), 0) / 100.0 as valor_em_apostas
FROM users u
JOIN wallet w ON w.user_id = u.id
LEFT JOIN bets b ON b.user_id = u.id
GROUP BY u.id, u.email, w.balance;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

