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

-- Recriar trigger de crédito de ganhos E reembolso
CREATE OR REPLACE FUNCTION credit_winnings()
RETURNS TRIGGER AS $$
DECLARE
  win_amount INTEGER;
  refund_amount INTEGER;
  total_return INTEGER;
  user_wallet_id UUID;
  current_balance INTEGER;
  serie_num INTEGER;
BEGIN
  -- ============================================================
  -- CENÁRIO 1: GANHOU - Paga ganho + reembolsa não casado
  -- ============================================================
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    -- Calcular ganho do valor casado
    win_amount := COALESCE(NEW.matched_amount, NEW.amount) * 2;
    
    -- Calcular reembolso do valor não casado
    refund_amount := COALESCE(NEW.remaining_amount, 0);
    
    -- Total a creditar = ganho + reembolso
    total_return := win_amount + refund_amount;
    
    -- Buscar wallet
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM wallet
    WHERE user_id = NEW.user_id;
    
    SELECT serie_number INTO serie_num
    FROM series WHERE id = NEW.serie_id;
    
    -- Creditar total
    UPDATE wallet
    SET balance = balance + total_return
    WHERE user_id = NEW.user_id;
    
    -- Criar transação de ganho
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
      total_return,
      current_balance,
      current_balance + total_return,
      'Ganho na série ' || serie_num,
      jsonb_build_object(
        'total_bet', NEW.amount,
        'matched_amount', COALESCE(NEW.matched_amount, NEW.amount),
        'remaining_amount', refund_amount,
        'win_amount', win_amount,
        'refund_amount', refund_amount,
        'total_return', total_return
      )
    );
    
    -- Atualizar actual_return
    UPDATE bets
    SET actual_return = total_return
    WHERE id = NEW.id;
    
  -- ============================================================
  -- CENÁRIO 2: PERDEU - Reembolsa apenas não casado
  -- ============================================================
  ELSIF NEW.status = 'perdida' AND OLD.status != 'perdida' THEN
    refund_amount := COALESCE(NEW.remaining_amount, 0);
    
    -- Só processa se houver valor a reembolsar
    IF refund_amount > 0 THEN
      SELECT id, balance INTO user_wallet_id, current_balance
      FROM wallet
      WHERE user_id = NEW.user_id;
      
      SELECT serie_number INTO serie_num
      FROM series WHERE id = NEW.serie_id;
      
      -- Creditar reembolso
      UPDATE wallet
      SET balance = balance + refund_amount
      WHERE user_id = NEW.user_id;
      
      -- Criar transação de reembolso
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
        'reembolso',
        refund_amount,
        current_balance,
        current_balance + refund_amount,
        'Reembolso parcial - série ' || serie_num,
        jsonb_build_object(
          'total_bet', NEW.amount,
          'matched_amount', COALESCE(NEW.matched_amount, 0),
          'refund_amount', refund_amount,
          'reason', 'Valor não casado devolvido'
        )
      );
      
      -- Atualizar actual_return (só reembolso, sem ganho)
      UPDATE bets
      SET actual_return = refund_amount
      WHERE id = NEW.id;
    END IF;
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
  win_amt INTEGER;
  refund_amt INTEGER;
BEGIN
  -- Buscar apostas ganhas/perdidas parciais que foram pagas errado
  FOR bet_record IN 
    SELECT 
      b.id,
      b.user_id,
      b.amount,
      b.matched_amount,
      b.remaining_amount,
      b.actual_return,
      b.status,
      w.id as wallet_id,
      w.balance
    FROM bets b
    JOIN wallet w ON w.user_id = b.user_id
    WHERE b.status IN ('ganha', 'perdida')
      AND b.matched_amount > 0
      AND b.matched_amount < b.amount  -- Parcialmente casada
  LOOP
    -- Calcular valor correto baseado no status
    IF bet_record.status = 'ganha' THEN
      -- GANHOU: (matched * 2) + remaining
      win_amt := bet_record.matched_amount * 2;
      refund_amt := COALESCE(bet_record.remaining_amount, 0);
      correct_return := win_amt + refund_amt;
    ELSE
      -- PERDEU: apenas remaining
      correct_return := COALESCE(bet_record.remaining_amount, 0);
    END IF;
    
    diff := correct_return - COALESCE(bet_record.actual_return, 0);
    
    -- Se há diferença, corrigir
    IF diff != 0 THEN
      RAISE NOTICE 'Corrigindo aposta - ID: %, Status: %, Diferença: R$ %', 
        bet_record.id,
        bet_record.status,
        (diff::DECIMAL / 100);
      
      -- Atualizar actual_return
      UPDATE bets
      SET actual_return = correct_return
      WHERE id = bet_record.id;
      
      -- Ajustar saldo
      UPDATE wallet
      SET balance = balance + diff
      WHERE user_id = bet_record.user_id;
      
      -- Criar transação de ajuste
      INSERT INTO transactions (
        wallet_id, user_id, bet_id, type, amount,
        balance_before, balance_after,
        description, status
      ) VALUES (
        bet_record.wallet_id, bet_record.user_id, bet_record.id,
        CASE WHEN diff > 0 THEN 'ganho' ELSE 'ajuste' END,
        diff,
        bet_record.balance, bet_record.balance + diff,
        'Correção de pagamento parcial',
        'completed'
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Correção de apostas antigas concluída';
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
    RAISE NOTICE '   1. Trigger resolve_bets resolve parcialmente_aceita';
    RAISE NOTICE '   2. Trigger credit_winnings com lógica correta';
    RAISE NOTICE '   3. Reembolso automático do valor não casado';
    RAISE NOTICE '   4. Apostas antigas corrigidas';
    RAISE NOTICE '';
    RAISE NOTICE '💰 FÓRMULAS CORRETAS:';
    RAISE NOTICE '';
    RAISE NOTICE '   SE GANHAR:';
    RAISE NOTICE '     - Ganho = matched_amount * 2';
    RAISE NOTICE '     - Reembolso = remaining_amount';
    RAISE NOTICE '     - Total = (matched * 2) + remaining';
    RAISE NOTICE '';
    RAISE NOTICE '   SE PERDER:';
    RAISE NOTICE '     - Reembolso = remaining_amount';
    RAISE NOTICE '     - Total = remaining';
    RAISE NOTICE '';
    RAISE NOTICE '📊 EXEMPLO (R$ 20 apostados, R$ 10 casados):';
    RAISE NOTICE '';
    RAISE NOTICE '   GANHOU:';
    RAISE NOTICE '     - Ganho: R$ 10 * 2 = R$ 20';
    RAISE NOTICE '     - Reembolso: R$ 10 (não casado)';
    RAISE NOTICE '     - Total recebe: R$ 30 ✅';
    RAISE NOTICE '';
    RAISE NOTICE '   PERDEU:';
    RAISE NOTICE '     - Perde: R$ 10 (casado)';
    RAISE NOTICE '     - Reembolso: R$ 10 (não casado)';
    RAISE NOTICE '     - Total recebe: R$ 10 ✅';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END$$;

