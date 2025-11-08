-- =====================================================
-- Migration: 1018_fix_cancel_double_credit
-- Description: Corrigir crédito duplo ao cancelar aposta
-- PROBLEMA: Aposta de R$60 cancelada → credita R$120
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO: Ver última aposta cancelada
-- =====================================================

-- Ver última aposta cancelada
SELECT 
  '🔍 ÚLTIMA APOSTA CANCELADA - ANÁLISE COMPLETA' as info,
  b.id as bet_id,
  b.user_id,
  b.amount / 100.0 as aposta_reais,
  b.resolved_at,
  w.balance / 100.0 as saldo_atual_reais,
  -- Contar transações
  (SELECT COUNT(*) FROM transactions t WHERE t.bet_id = b.id) as total_transacoes,
  (SELECT COUNT(*) FROM transactions t WHERE t.bet_id = b.id AND t.type = 'aposta') as debitos,
  (SELECT COUNT(*) FROM transactions t WHERE t.bet_id = b.id AND t.type = 'reembolso' AND t.status = 'completed') as reembolsos,
  (SELECT COUNT(*) FROM transactions t WHERE t.bet_id = b.id AND t.type = 'ganho') as ganhos,
  -- Valores
  (SELECT COALESCE(SUM(t.amount), 0) / 100.0 FROM transactions t WHERE t.bet_id = b.id AND t.type = 'aposta') as total_debitado,
  (SELECT COALESCE(SUM(t.amount), 0) / 100.0 FROM transactions t WHERE t.bet_id = b.id AND t.type = 'reembolso' AND t.status = 'completed') as total_reembolsado,
  (SELECT COALESCE(SUM(t.amount), 0) / 100.0 FROM transactions t WHERE t.bet_id = b.id AND t.type = 'ganho') as total_ganho
FROM bets b
JOIN wallet w ON w.user_id = b.user_id
WHERE b.status = 'cancelada'
ORDER BY b.resolved_at DESC
LIMIT 1;

-- Ver transações individuais da última aposta cancelada
SELECT 
  '📜 TRANSAÇÕES INDIVIDUAIS DA ÚLTIMA APOSTA CANCELADA' as info,
  t.type,
  t.amount / 100.0 as valor_reais,
  t.balance_before / 100.0 as saldo_antes,
  t.balance_after / 100.0 as saldo_depois,
  t.status,
  t.description,
  t.created_at
FROM bets b
JOIN transactions t ON t.bet_id = b.id
WHERE b.status = 'cancelada'
  AND b.id = (SELECT id FROM bets WHERE status = 'cancelada' ORDER BY resolved_at DESC LIMIT 1)
ORDER BY t.created_at;

-- =====================================================
-- SOLUÇÃO: Adicionar condição para NÃO creditar em canceladas
-- =====================================================

-- Função credit_winnings CORRIGIDA para NUNCA executar em canceladas
CREATE OR REPLACE FUNCTION credit_winnings()
RETURNS TRIGGER AS $$
DECLARE
  return_amount INTEGER;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  -- ⚠️ IMPORTANTE: Só executar se mudou PARA 'ganha'
  -- NÃO executar se mudou para 'cancelada', 'perdida', etc
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    
    -- REGRA: Retorno total = 2x o valor apostado
    return_amount := NEW.amount * 2;
    
    -- Log de debug
    RAISE NOTICE '✅ [GANHO] Creditando R$% para user_id=%', 
      return_amount / 100.0,
      NEW.user_id;
    
    -- Buscar wallet e saldo atual
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM wallet
    WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Wallet não encontrada para user_id=%', NEW.user_id;
    END IF;
    
    -- Creditar saldo
    UPDATE wallet
    SET balance = balance + return_amount,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE user_id = NEW.user_id;
    
    -- Criar transação de crédito
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
      'Ganho na aposta da série ' || (
        SELECT serie_number FROM series WHERE id = NEW.serie_id
      ),
      'completed'
    );
    
    -- Atualizar actual_return
    UPDATE bets
    SET 
      actual_return = return_amount,
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.id;
    
  -- ⚠️ IMPORTANTE: Se mudou para 'cancelada', NÃO fazer nada aqui
  -- O reembolso é feito pelo SERVICE (bets.service.js)
  ELSIF NEW.status = 'cancelada' AND OLD.status != 'cancelada' THEN
    RAISE NOTICE '🚫 [CANCELADA] Aposta cancelada - reembolso feito pelo service';
    -- NÃO creditar nada aqui!
    
  ELSIF NEW.status = 'perdida' AND OLD.status != 'perdida' THEN
    RAISE NOTICE '❌ [PERDIDA] Aposta perdida - SEM reembolso';
    -- NÃO creditar nada aqui!
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger com condição WHEN para segurança extra
DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;
CREATE TRIGGER trigger_credit_winnings
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (
    (NEW.status = 'ganha' AND OLD.status != 'ganha') OR
    (NEW.status = 'cancelada' AND OLD.status != 'cancelada') OR
    (NEW.status = 'perdida' AND OLD.status != 'perdida')
  )
  EXECUTE FUNCTION credit_winnings();

-- =====================================================
-- CORREÇÃO: Reverter créditos duplicados em cancelamentos
-- =====================================================

DO $$
DECLARE
  cancel_record RECORD;
  excess_amount INTEGER;
  transaction_count INTEGER;
BEGIN
  RAISE NOTICE '🔄 Buscando cancelamentos com crédito duplicado...';
  
  -- Buscar apostas canceladas onde o crédito foi maior que a aposta
  FOR cancel_record IN
    SELECT 
      b.id as bet_id,
      b.user_id,
      b.amount as bet_amount,
      b.resolved_at,
      -- Somar créditos (ignorando débito da aposta)
      COALESCE((
        SELECT SUM(t.amount)
        FROM transactions t
        WHERE t.bet_id = b.id
          AND t.type IN ('reembolso', 'ganho')
          AND t.status = 'completed'
      ), 0) as total_credited
    FROM bets b
    WHERE b.status = 'cancelada'
      AND b.resolved_at > NOW() - INTERVAL '24 hours' -- últimas 24h
  LOOP
    -- Se creditou mais que a aposta original
    IF cancel_record.total_credited > cancel_record.bet_amount THEN
      excess_amount := cancel_record.total_credited - cancel_record.bet_amount;
      
      RAISE NOTICE '⚠️ Aposta % tem crédito EXCESSIVO: apostou R$%, creditou R$%, excesso R$%',
        cancel_record.bet_id,
        cancel_record.bet_amount / 100.0,
        cancel_record.total_credited / 100.0,
        excess_amount / 100.0;
      
      -- Reverter o excesso
      UPDATE wallet
      SET balance = balance - excess_amount
      WHERE user_id = cancel_record.user_id;
      
      -- Criar transação de ajuste
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
      )
      SELECT
        w.id,
        cancel_record.user_id,
        cancel_record.bet_id,
        'admin_debit',
        -excess_amount,
        w.balance + excess_amount,
        w.balance,
        'Correção: Reembolso duplicado em cancelamento (excesso: R$' || (excess_amount / 100.0) || ')',
        'completed'
      FROM wallet w
      WHERE w.user_id = cancel_record.user_id;
      
      RAISE NOTICE '✅ Corrigido: R$% removido do saldo', excess_amount / 100.0;
    END IF;
  END LOOP;
  
  RAISE NOTICE '🎉 Correção concluída!';
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
  '📊 APOSTAS CANCELADAS - Verificação' as info,
  COUNT(*) as total,
  COUNT(*) FILTER (
    WHERE (
      SELECT COALESCE(SUM(t.amount), 0)
      FROM transactions t
      WHERE t.bet_id = b.id
        AND t.type IN ('reembolso', 'ganho')
        AND t.status = 'completed'
    ) = b.amount
  ) as corretas,
  COUNT(*) FILTER (
    WHERE (
      SELECT COALESCE(SUM(t.amount), 0)
      FROM transactions t
      WHERE t.bet_id = b.id
        AND t.type IN ('reembolso', 'ganho')
        AND t.status = 'completed'
    ) > b.amount
  ) as com_excesso
FROM bets b
WHERE b.status = 'cancelada';

-- =====================================================
-- LOG FINAL
-- =====================================================

SELECT '✅ [MIGRATION 1018] Correção de dobro em cancelamento concluída!' as status;
SELECT '📌 Ações realizadas:' as info;
SELECT '  1. Função credit_winnings() atualizada para NÃO executar em canceladas' as acao1;
SELECT '  2. Trigger atualizado com condição WHEN explícita' as acao2;
SELECT '  3. Créditos duplicados em cancelamentos foram revertidos' as acao3;
SELECT '  4. Logs de debug adicionados para monitoramento' as acao4;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

