-- =====================================================
-- Migration: 1022_diagnostico_debito_dobro
-- Description: Diagnosticar débito em dobro ao criar aposta
-- Created: 2025-11-07
-- =====================================================

-- Listar TODOS os triggers na tabela BETS
SELECT 
  '🔍 TODOS OS TRIGGERS EM BETS' as info,
  tgname as trigger_name,
  pg_get_triggerdef(oid) as definicao
FROM pg_trigger
WHERE tgrelid = 'bets'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- Ver código completo de validate_bet_on_insert
SELECT 
  '📝 FUNÇÃO: validate_bet_on_insert' as info,
  pg_get_functiondef(oid) as codigo
FROM pg_proc
WHERE proname = 'validate_bet_on_insert';

-- Ver função create_bet_transaction (pode estar debitando também)
SELECT 
  '📝 FUNÇÃO: create_bet_transaction' as info,
  pg_get_functiondef(oid) as codigo
FROM pg_proc
WHERE proname = 'create_bet_transaction';

-- Ver última aposta criada e suas transações
SELECT 
  '💰 ÚLTIMA APOSTA CRIADA' as info,
  b.id as bet_id,
  b.amount / 100.0 as aposta_reais,
  b.created_at,
  (
    SELECT balance / 100.0 
    FROM wallet 
    WHERE user_id = b.user_id
  ) as saldo_atual
FROM bets b
ORDER BY b.created_at DESC
LIMIT 1;

-- Ver TODAS as transações da última aposta
SELECT 
  '📋 TRANSAÇÕES DA ÚLTIMA APOSTA' as info,
  t.type,
  t.amount / 100.0 as valor_reais,
  t.balance_before / 100.0 as saldo_antes,
  t.balance_after / 100.0 as saldo_depois,
  t.created_at
FROM transactions t
WHERE t.bet_id = (
  SELECT id FROM bets ORDER BY created_at DESC LIMIT 1
)
ORDER BY t.created_at;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

