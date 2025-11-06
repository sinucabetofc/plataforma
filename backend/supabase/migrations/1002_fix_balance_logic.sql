-- =====================================================
-- Migration: 1002_fix_balance_logic
-- Description: Corrigir lógica de saldo - NÃO debitar ao criar aposta
--              Saldo deve ser bloqueado virtualmente, não debitado
-- Created: 2025-11-06
-- =====================================================

-- =====================================================
-- NOVO TRIGGER: Validar aposta SEM debitar saldo
-- =====================================================

CREATE OR REPLACE FUNCTION validate_bet_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  serie_status_val serie_status;
  serie_betting_enabled BOOLEAN;
  user_balance INTEGER;
  blocked_balance_val INTEGER;
  available_balance INTEGER;
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
  
  -- 2. Verificar se usuário tem saldo suficiente (considerando apostas pendentes)
  SELECT w.balance INTO user_balance
  FROM wallet w
  WHERE w.user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Carteira não encontrada';
  END IF;
  
  -- Calcular saldo bloqueado (apostas pendentes e aceitas)
  SELECT COALESCE(SUM(amount), 0)
  INTO blocked_balance_val
  FROM bets
  WHERE user_id = NEW.user_id
  AND status IN ('pendente', 'aceita');
  
  -- Saldo disponível = saldo total - saldo bloqueado - nova aposta
  available_balance := user_balance - blocked_balance_val - NEW.amount;
  
  IF available_balance < 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente (disponível: R$ %, necessário: R$ %)',
      (user_balance - blocked_balance_val)::DECIMAL / 100,
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
  
  -- NÃO DEBITA O SALDO - Apenas valida
  -- O saldo será debitado apenas quando a aposta for resolvida (perdida)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NOVO TRIGGER: Debitar saldo apenas quando aposta é PERDIDA
-- =====================================================

CREATE OR REPLACE FUNCTION debit_balance_on_bet_lost()
RETURNS TRIGGER AS $$
DECLARE
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  -- Se aposta mudou para "perdida", debitar o valor
  IF NEW.status = 'perdida' AND OLD.status != 'perdida' THEN
    
    -- Buscar wallet do usuário
    SELECT id, balance 
    INTO user_wallet_id, current_balance
    FROM wallet
    WHERE user_id = NEW.user_id;
    
    -- Debitar saldo
    UPDATE wallet
    SET balance = balance - NEW.amount
    WHERE user_id = NEW.user_id;
    
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
      user_wallet_id,
      NEW.id,
      'aposta_perdida',
      -NEW.amount,
      current_balance,
      current_balance - NEW.amount,
      'Aposta perdida - Série ' || (
        SELECT serie_number FROM series WHERE id = NEW.serie_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para debitar quando perder
DROP TRIGGER IF EXISTS trigger_debit_balance_on_bet_lost ON bets;
CREATE TRIGGER trigger_debit_balance_on_bet_lost
  AFTER UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION debit_balance_on_bet_lost();

-- =====================================================
-- ATUALIZAR TRIGGER DE CANCELAMENTO: Não precisa reembolsar
-- =====================================================

-- Ao cancelar aposta pendente, não precisa reembolsar pois nunca debitou
-- Mas manteremos o registro na transação por histórico

-- =====================================================
-- CORRIGIR SALDOS EXISTENTES (Reembolsar apostas pendentes)
-- =====================================================

-- Reembolsar o valor de todas as apostas pendentes/aceitas
DO $$
DECLARE
  bet_record RECORD;
BEGIN
  FOR bet_record IN 
    SELECT b.id, b.user_id, b.amount, b.status
    FROM bets b
    WHERE b.status IN ('pendente', 'aceita')
  LOOP
    -- Creditar de volta o valor que foi debitado
    UPDATE wallet
    SET balance = balance + bet_record.amount
    WHERE user_id = bet_record.user_id;
    
    RAISE NOTICE 'Reembolsado R$ % para usuário %', 
      bet_record.amount::DECIMAL / 100, 
      bet_record.user_id;
  END LOOP;
END $$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 'Lógica de saldo corrigida! Apostas não debitam mais o saldo imediatamente.' as status;

-- Mostrar saldos atualizados
SELECT 
  u.email,
  w.balance / 100.0 as saldo_total,
  COALESCE(SUM(b.amount) FILTER (WHERE b.status IN ('pendente', 'aceita')), 0) / 100.0 as saldo_bloqueado,
  (w.balance - COALESCE(SUM(b.amount) FILTER (WHERE b.status IN ('pendente', 'aceita')), 0)) / 100.0 as saldo_disponivel
FROM users u
JOIN wallet w ON w.user_id = u.id
LEFT JOIN bets b ON b.user_id = u.id
GROUP BY u.id, u.email, w.balance;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

