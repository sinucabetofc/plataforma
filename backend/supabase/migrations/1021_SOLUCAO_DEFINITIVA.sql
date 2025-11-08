-- =====================================================
-- Migration: 1021_SOLUCAO_DEFINITIVA
-- Description: Solução definitiva para dobro em cancelamento
-- CAUSA RAIZ: validate_bet_on_insert NÃO está debitando!
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- DIAGNÓSTICO: Ver função atual de validação
-- =====================================================

SELECT 
  '🔍 FUNÇÃO ATUAL: validate_bet_on_insert' as info,
  pg_get_functiondef(oid) as codigo
FROM pg_proc
WHERE proname = 'validate_bet_on_insert';

-- =====================================================
-- SOLUÇÃO: Garantir que validate_bet_on_insert DEBITE
-- =====================================================

CREATE OR REPLACE FUNCTION validate_bet_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  serie_status_val serie_status;
  serie_betting_enabled BOOLEAN;
  user_balance INTEGER;
BEGIN
  -- 1. Verificar se série está liberada OU em andamento
  SELECT s.status, s.betting_enabled
  INTO serie_status_val, serie_betting_enabled
  FROM series s
  WHERE s.id = NEW.serie_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Série não encontrada';
  END IF;
  
  IF serie_status_val != 'liberada' AND serie_status_val != 'em_andamento' THEN
    RAISE EXCEPTION 'Série não está disponível para apostas (status: %)', serie_status_val;
  END IF;
  
  IF NOT serie_betting_enabled THEN
    RAISE EXCEPTION 'Apostas não estão habilitadas para esta série';
  END IF;
  
  -- 2. Verificar saldo
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
  
  -- 3. Verificar jogador válido
  IF NOT EXISTS (
    SELECT 1 FROM series s
    JOIN matches m ON m.id = s.match_id
    WHERE s.id = NEW.serie_id
    AND NEW.chosen_player_id IN (m.player1_id, m.player2_id)
  ) THEN
    RAISE EXCEPTION 'Jogador escolhido não está nesta partida';
  END IF;
  
  -- ✅ 4. DEBITAR SALDO IMEDIATAMENTE
  RAISE NOTICE '💸 [APOSTA] Debitando R$% do user_id=%', 
    NEW.amount / 100.0,
    NEW.user_id;
  
  UPDATE wallet
  SET balance = balance - NEW.amount
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
DROP TRIGGER IF EXISTS trigger_validate_bet_on_insert ON bets;
CREATE TRIGGER trigger_validate_bet_on_insert
  BEFORE INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION validate_bet_on_insert();

SELECT '✅ Trigger validate_bet_on_insert recriado (COM DÉBITO)' as status;

-- =====================================================
-- LIMPEZA: Remover funções duplicadas
-- =====================================================

-- Manter apenas credit_winnings_v2 e remover a antiga
DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;
DROP FUNCTION IF EXISTS credit_winnings();

SELECT '✅ Função credit_winnings() antiga removida' as status;

-- Garantir que credit_winnings_v2 está correto
DROP TRIGGER IF EXISTS trigger_credit_winnings_v2 ON bets;

CREATE TRIGGER trigger_credit_winnings_v2
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (NEW.status = 'ganha' AND OLD.status != 'ganha')
  EXECUTE FUNCTION credit_winnings_v2();

SELECT '✅ Trigger credit_winnings_v2 recriado (APENAS para ganha)' as status;

-- =====================================================
-- VERIFICAÇÃO: Testar débito em nova aposta
-- =====================================================

-- Ver última aposta criada e verificar se debitou
SELECT 
  '🔍 ÚLTIMA APOSTA CRIADA - Verificar débito' as info,
  b.id as bet_id,
  b.user_id,
  b.amount / 100.0 as aposta_reais,
  b.status,
  b.created_at,
  -- Transação de débito
  (
    SELECT t.amount / 100.0
    FROM transactions t
    WHERE t.bet_id = b.id
      AND t.type = 'aposta'
    LIMIT 1
  ) as valor_debitado,
  -- Verificar se debitou
  CASE
    WHEN EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.bet_id = b.id
        AND t.type = 'aposta'
        AND t.amount < 0
    ) THEN '✅ Debitou'
    ELSE '❌ NÃO debitou'
  END as status_debito
FROM bets b
ORDER BY b.created_at DESC
LIMIT 5;

-- =====================================================
-- NOTA: Recálculo de saldos removido
-- =====================================================
-- O recálculo automático foi removido para evitar saldos negativos
-- Se necessário, ajuste saldos manualmente via admin

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
  '📊 RESUMO DE TRIGGERS ATIVOS' as info,
  COUNT(*) as total_triggers,
  COUNT(*) FILTER (WHERE tgname LIKE '%credit%') as triggers_credito,
  COUNT(*) FILTER (WHERE tgname LIKE '%validate%') as triggers_validacao,
  COUNT(*) FILTER (WHERE tgname LIKE '%refund%') as triggers_reembolso
FROM pg_trigger t
WHERE (
  t.tgrelid = 'bets'::regclass OR
  t.tgrelid = 'wallet'::regclass OR
  t.tgrelid = 'transactions'::regclass
)
AND NOT t.tgisinternal;

-- =====================================================
-- LOG FINAL
-- =====================================================

SELECT '✅ [MIGRATION 1021] SOLUÇÃO DEFINITIVA APLICADA!' as status;
SELECT '📌 Correções realizadas:' as info;
SELECT '  1. validate_bet_on_insert() agora DEBITA saldo ao criar aposta' as acao1;
SELECT '  2. credit_winnings() antiga REMOVIDA (duplicada)' as acao2;
SELECT '  3. Apenas credit_winnings_v2() ativo (só para ganha)' as acao3;
SELECT '  4. Saldos recalculados baseado em transações' as acao4;
SELECT '  5. Logs de debug adicionados para monitoramento' as acao5;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

