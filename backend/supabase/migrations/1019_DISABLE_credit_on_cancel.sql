-- =====================================================
-- Migration: 1019_DISABLE_credit_on_cancel
-- Description: DESABILITAR crédito em cancelamento
-- PROBLEMA CRÍTICO: Cancelamento está creditando DOBRO
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- ANÁLISE: Ver se há transação de GANHO em cancelamento
-- =====================================================

SELECT 
  '⚠️ TRANSAÇÕES DE GANHO EM APOSTAS CANCELADAS (BUG!)' as alerta,
  b.id as bet_id,
  b.amount / 100.0 as aposta_reais,
  t.type as tipo_transacao,
  t.amount / 100.0 as valor_creditado,
  t.description,
  t.created_at
FROM bets b
JOIN transactions t ON t.bet_id = b.id
WHERE b.status = 'cancelada'
  AND t.type = 'ganho'
  AND t.created_at > NOW() - INTERVAL '1 hour'
ORDER BY t.created_at DESC
LIMIT 10;

-- =====================================================
-- SOLUÇÃO DRÁSTICA: Remover trigger temporariamente
-- =====================================================

-- Desabilitar trigger de crédito de ganhos
DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;

-- Criar função NOVA que NÃO executa em cancelamento
CREATE OR REPLACE FUNCTION credit_winnings_v2()
RETURNS TRIGGER AS $$
DECLARE
  return_amount INTEGER;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  -- ✅ APENAS executar para status 'ganha'
  -- ❌ NUNCA executar para 'cancelada', 'perdida', etc
  
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    
    RAISE NOTICE '✅ [GANHO] Processando ganho para aposta %', NEW.id;
    
    -- Retorno = 2x a aposta
    return_amount := NEW.amount * 2;
    
    -- Buscar wallet
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM wallet
    WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Wallet não encontrada';
    END IF;
    
    -- Creditar
    UPDATE wallet
    SET balance = balance + return_amount
    WHERE user_id = NEW.user_id;
    
    -- Criar transação
    INSERT INTO transactions (
      wallet_id,
      user_id,
      bet_id,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      status
    ) VALUES (
      user_wallet_id,
      NEW.user_id,
      NEW.id,
      'ganho',
      return_amount,
      current_balance,
      current_balance + return_amount,
      'Ganho na aposta da série ' || (SELECT serie_number FROM series WHERE id = NEW.serie_id),
      'completed'
    );
    
    -- Atualizar actual_return
    UPDATE bets
    SET actual_return = return_amount
    WHERE id = NEW.id;
    
    RAISE NOTICE '✅ [GANHO] Creditado R$% para user %', return_amount / 100.0, NEW.user_id;
    
  ELSE
    -- Log para qualquer outro status
    RAISE NOTICE '🔍 [DEBUG] Aposta % mudou de % para % - NÃO creditando', 
      NEW.id, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger APENAS para 'ganha' (condição explícita)
CREATE TRIGGER trigger_credit_winnings_v2
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (NEW.status = 'ganha' AND OLD.status != 'ganha')
  EXECUTE FUNCTION credit_winnings_v2();

SELECT '✅ Trigger de ganhos recriado (APENAS para status ganha)' as status;

-- =====================================================
-- CORREÇÃO: Reverter os R$ 120 indevidos
-- =====================================================

DO $$
DECLARE
  excess_records RECORD;
  total_corrected INTEGER := 0;
BEGIN
  RAISE NOTICE '🔄 Corrigindo cancelamentos com crédito duplicado...';
  
  -- Buscar apostas canceladas nas últimas 2 horas com ganho indevido
  FOR excess_records IN
    SELECT 
      b.id as bet_id,
      b.user_id,
      b.amount as bet_amount,
      t.id as transaction_id,
      t.amount as credited_amount
    FROM bets b
    JOIN transactions t ON t.bet_id = b.id
    WHERE b.status = 'cancelada'
      AND t.type = 'ganho'
      AND b.resolved_at > NOW() - INTERVAL '2 hours'
  LOOP
    total_corrected := total_corrected + 1;
    
    RAISE NOTICE '⚠️ Aposta % tem GANHO indevido em cancelamento: R$%',
      excess_records.bet_id,
      excess_records.credited_amount / 100.0;
    
    -- Reverter o crédito indevido (remover o dobro, manter apenas o reembolso)
    UPDATE wallet
    SET balance = balance - excess_records.credited_amount
    WHERE user_id = excess_records.user_id;
    
    -- Cancelar a transação de ganho
    UPDATE transactions
    SET 
      status = 'cancelled',
      description = description || ' [REVERTIDO - ganho indevido em cancelamento]'
    WHERE id = excess_records.transaction_id;
    
    RAISE NOTICE '✅ Revertido R$% do usuário %',
      excess_records.credited_amount / 100.0,
      excess_records.user_id;
  END LOOP;
  
  IF total_corrected > 0 THEN
    RAISE NOTICE '🎉 % transações de ganho indevidas corrigidas!', total_corrected;
  ELSE
    RAISE NOTICE '✅ Nenhum ganho indevido encontrado';
  END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
  '📊 VERIFICAÇÃO - Apostas Canceladas' as info,
  COUNT(*) as total_canceladas,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.bet_id = b.id 
        AND t.type = 'ganho' 
        AND t.status = 'completed'
    )
  ) as com_ganho_ativo,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.bet_id = b.id 
        AND t.type = 'ganho' 
        AND t.status = 'cancelled'
    )
  ) as com_ganho_revertido
FROM bets b
WHERE b.status = 'cancelada';

-- =====================================================
-- LOG FINAL
-- =====================================================

SELECT '✅ [MIGRATION 1019] Trigger desabilitado e corrigido!' as status;
SELECT '📌 Mudanças:' as info;
SELECT '  1. Trigger antigo REMOVIDO' as acao1;
SELECT '  2. Nova função credit_winnings_v2() criada (APENAS para ganha)' as acao2;
SELECT '  3. Novo trigger com condição WHEN explícita' as acao3;
SELECT '  4. Ganhos indevidos em cancelamentos revertidos' as acao4;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

