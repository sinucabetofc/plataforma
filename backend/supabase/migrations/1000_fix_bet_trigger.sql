-- =====================================================
-- Migration: 1000_fix_bet_trigger
-- Description: Corrigir trigger de validação de apostas
--              O trigger estava tentando inserir transação ANTES da aposta existir
-- Created: 2025-11-06
-- =====================================================

-- Recreate trigger: Validar aposta e debitar saldo (SEM criar transação)
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
  
  -- 2. Verificar se usuário tem saldo suficiente
  SELECT w.balance INTO user_balance
  FROM wallet w
  WHERE w.user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Carteira não encontrada';
  END IF;
  
  IF user_balance < NEW.amount THEN
    RAISE EXCEPTION 'Saldo insuficiente (saldo: R$ %, necessário: R$ %)',
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
  
  -- 4. Debitar saldo do usuário
  UPDATE wallet
  SET balance = balance - NEW.amount
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Novo trigger AFTER INSERT para criar transação
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

-- Criar o trigger AFTER INSERT
DROP TRIGGER IF EXISTS trigger_create_bet_transaction ON bets;
CREATE TRIGGER trigger_create_bet_transaction
  AFTER INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION create_bet_transaction();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 'Trigger de apostas corrigido com sucesso!' as status;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================



