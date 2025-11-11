-- ============================================================
-- Migration 1042: Corrige Pagamento de Apostas Parcialmente Casadas
-- ============================================================
-- PROBLEMA 1: Trigger resolve_bets não resolve 'parcialmente_aceita'
-- PROBLEMA 2: Trigger credit_winnings usa amount ao invés de matched_amount
-- SOLUÇÃO: Atualizar ambos os triggers
-- ============================================================

-- ============================================================
-- 1. CORRIGIR TRIGGER DE RESOLUÇÃO (resolver parcialmente_aceita)
-- ============================================================

CREATE OR REPLACE FUNCTION resolve_bets_on_serie_end()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se a série mudou para 'encerrada' e tem um vencedor
  IF NEW.status = 'encerrada' AND OLD.status != 'encerrada' AND NEW.winner_player_id IS NOT NULL THEN
    
    -- Atualizar apostas GANHADORAS (incluindo parcialmente_aceita)
    UPDATE bets
    SET 
      status = 'ganha',
      resolved_at = TIMEZONE('utc'::text, NOW()),
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE serie_id = NEW.id
      AND chosen_player_id = NEW.winner_player_id
      AND status IN ('pendente', 'aceita', 'parcialmente_aceita')  -- ✅ CORRIGIDO
      AND COALESCE(matched_amount, 0) > 0;  -- Só se tiver valor casado
    
    -- Atualizar apostas PERDEDORAS
    UPDATE bets
    SET 
      status = 'perdida',
      resolved_at = TIMEZONE('utc'::text, NOW()),
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE serie_id = NEW.id
      AND chosen_player_id != NEW.winner_player_id
      AND status IN ('pendente', 'aceita', 'parcialmente_aceita');  -- ✅ CORRIGIDO
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_resolve_bets_on_serie_end ON series;
CREATE TRIGGER trigger_resolve_bets_on_serie_end
  AFTER UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION resolve_bets_on_serie_end();

-- ============================================================
-- 2. CORRIGIR TRIGGER DE CRÉDITO (usar matched_amount)
-- ============================================================

-- Recriar trigger de crédito de ganhos com matched_amount
CREATE OR REPLACE FUNCTION credit_winnings()
RETURNS TRIGGER AS $$
DECLARE
  return_amount INTEGER;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    -- ✅ CORREÇÃO: Calcular retorno baseado em MATCHED_AMOUNT (valor casado)
    -- Para apostas parcialmente aceitas, só paga o que foi casado
    return_amount := COALESCE(NEW.matched_amount, NEW.amount) * 2;
    
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
      description,
      metadata
    ) VALUES (
      user_wallet_id,
      NEW.id,
      'ganho',
      return_amount,
      current_balance,
      current_balance + return_amount,
      'Ganho na aposta da série ' || (
        SELECT serie_number FROM series WHERE id = NEW.serie_id
      ),
      jsonb_build_object(
        'total_bet', NEW.amount,
        'matched_amount', COALESCE(NEW.matched_amount, NEW.amount),
        'return_amount', return_amount,
        'multiplier', 2
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

-- Recriar trigger
DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;
CREATE TRIGGER trigger_credit_winnings
  AFTER UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION credit_winnings();

-- ============================================================
-- 3. CORRIGIR APOSTAS JÁ RESOLVIDAS INCORRETAMENTE (se houver)
-- ============================================================

DO $$
DECLARE
  bet_record RECORD;
  correct_return INTEGER;
  diff INTEGER;
BEGIN
  -- Buscar apostas ganhas parcialmente aceitas que foram pagas errado
  FOR bet_record IN 
    SELECT 
      b.id,
      b.user_id,
      b.amount,
      b.matched_amount,
      b.actual_return,
      w.id as wallet_id,
      w.balance
    FROM bets b
    JOIN wallet w ON w.user_id = b.user_id
    WHERE b.status = 'ganha'
      AND b.matched_amount > 0
      AND b.matched_amount < b.amount  -- Parcialmente casada
      AND (b.actual_return != b.matched_amount * 2 OR b.actual_return IS NULL)
  LOOP
    -- Calcular valor correto
    correct_return := bet_record.matched_amount * 2;
    diff := correct_return - COALESCE(bet_record.actual_return, 0);
    
    -- Se há diferença, corrigir
    IF diff != 0 THEN
      RAISE NOTICE 'Corrigindo aposta % - Diferença: R$ %', 
        bet_record.id, 
        diff::DECIMAL / 100;
      
      -- Atualizar actual_return
      UPDATE bets
      SET actual_return = correct_return
      WHERE id = bet_record.id;
      
      -- Se pagou a mais, debitar diferença
      IF diff < 0 THEN
        UPDATE wallet
        SET balance = balance + diff  -- diff é negativo
        WHERE user_id = bet_record.user_id;
        
        INSERT INTO transactions (
          wallet_id, user_id, bet_id, type, amount,
          balance_before, balance_after,
          description, status
        ) VALUES (
          bet_record.wallet_id, bet_record.user_id, bet_record.id,
          'ajuste', diff,
          bet_record.balance, bet_record.balance + diff,
          'Ajuste de pagamento incorreto (parcial)', 'completed'
        );
      -- Se pagou a menos, creditar diferença
      ELSIF diff > 0 THEN
        UPDATE wallet
        SET balance = balance + diff
        WHERE user_id = bet_record.user_id;
        
        INSERT INTO transactions (
          wallet_id, user_id, bet_id, type, amount,
          balance_before, balance_after,
          description, status
        ) VALUES (
          bet_record.wallet_id, bet_record.user_id, bet_record.id,
          'ganho', diff,
          bet_record.balance, bet_record.balance + diff,
          'Correção de pagamento parcial', 'completed'
        );
      END IF;
    END IF;
  END LOOP;
END$$;

-- ============================================================
-- 4. VERIFICAÇÃO FINAL
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION 1042 CONCLUÍDA';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 CORREÇÕES APLICADAS:';
    RAISE NOTICE '   1. Trigger resolve_bets agora resolve parcialmente_aceita';
    RAISE NOTICE '   2. Trigger credit_winnings usa matched_amount';
    RAISE NOTICE '   3. Apostas antigas corrigidas (se houver)';
    RAISE NOTICE '';
    RAISE NOTICE '💰 FÓRMULA CORRETA:';
    RAISE NOTICE '   return_amount = matched_amount * 2';
    RAISE NOTICE '';
    RAISE NOTICE '📊 EXEMPLO:';
    RAISE NOTICE '   Aposta total: R$ 20,00';
    RAISE NOTICE '   Valor casado: R$ 10,00 (50%)';
    RAISE NOTICE '   Ganho correto: R$ 20,00 (10 x 2)';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END$$;

