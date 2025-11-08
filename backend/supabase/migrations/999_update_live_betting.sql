-- =====================================================
-- Migration: 999_update_live_betting
-- Description: Atualizar sistema para permitir apostas ao vivo (em_andamento)
-- Created: 2025-11-06
-- =====================================================

-- =====================================================
-- 1. ATUALIZAR TRIGGER DE VALIDAÇÃO DE APOSTAS
-- =====================================================

-- Permitir apostas em séries liberadas OU em andamento
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
  
  -- 5. Criar transação de débito
  INSERT INTO transactions (
    wallet_id,
    bet_id,
    type,
    amount,
    balance_before,
    balance_after,
    description
  ) VALUES (
    (SELECT id FROM wallet WHERE user_id = NEW.user_id),
    NEW.id,
    'aposta',
    -NEW.amount,
    user_balance,
    user_balance - NEW.amount,
    'Aposta na série ' || (
      SELECT serie_number FROM series WHERE id = NEW.serie_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. ATUALIZAR TRIGGER DE INÍCIO DE SÉRIE
-- =====================================================

-- Trigger que mantém apostas abertas durante 'em_andamento'
CREATE OR REPLACE FUNCTION set_series_started_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'em_andamento' AND OLD.status != 'em_andamento' THEN
    NEW.started_at = TIMEZONE('utc'::text, NOW());
    -- MANTER apostas abertas durante o andamento (apostas ao vivo)
    -- Apenas registra quando começou, mas não trava
    -- NEW.betting_enabled permanece como está (não força false)
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. ATUALIZAR FUNÇÃO DE INICIAR SÉRIE
-- =====================================================

-- Função: Iniciar série (apostas continuam liberadas - apostas ao vivo)
CREATE OR REPLACE FUNCTION start_serie(p_serie_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE series
  SET status = 'em_andamento'
  WHERE id = p_serie_id
  AND status = 'liberada';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Série não encontrada ou não está liberada';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. MANTER betting_enabled = true EM SÉRIES EM ANDAMENTO
-- =====================================================

-- Garantir que séries em andamento continuem com apostas habilitadas
UPDATE series
SET betting_enabled = true
WHERE status = 'em_andamento'
AND betting_enabled = false;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'Sistema de apostas ao vivo atualizado com sucesso!' as status;

-- Mostrar séries em andamento com apostas habilitadas
SELECT 
  id,
  serie_number,
  status,
  betting_enabled,
  started_at
FROM series
WHERE status = 'em_andamento';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


