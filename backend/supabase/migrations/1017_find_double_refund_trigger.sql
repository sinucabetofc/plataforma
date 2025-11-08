-- =====================================================
-- Migration: 1017_find_double_refund_trigger
-- Description: Encontrar trigger causando dobro no reembolso
-- Created: 2025-11-07
-- =====================================================

-- Listar TODOS os triggers na tabela bets com suas funções
SELECT 
  '🔍 TODOS OS TRIGGERS NA TABELA BETS' as info,
  t.tgname as trigger_name,
  CASE
    WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
    ELSE 'AFTER'
  END as timing,
  CASE
    WHEN t.tgtype & 4 = 4 THEN 'INSERT'
    WHEN t.tgtype & 8 = 8 THEN 'DELETE'
    WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
    ELSE 'OTHER'
  END as event,
  p.proname as function_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgrelid = 'bets'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Ver código da função credit_winnings
SELECT 
  '📝 CÓDIGO DA FUNÇÃO credit_winnings()' as info,
  pg_get_functiondef(oid) as definicao
FROM pg_proc
WHERE proname = 'credit_winnings';

-- Ver código da função update_bet_transaction_status
SELECT 
  '📝 CÓDIGO DA FUNÇÃO update_bet_transaction_status()' as info,
  pg_get_functiondef(oid) as definicao
FROM pg_proc
WHERE proname = 'update_bet_transaction_status';

-- Verificar a última aposta cancelada em detalhes
WITH last_cancelled AS (
  SELECT id, user_id, amount, status, created_at, resolved_at
  FROM bets
  WHERE status = 'cancelada'
  ORDER BY resolved_at DESC
  LIMIT 1
)
SELECT 
  '💰 DETALHES DA ÚLTIMA APOSTA CANCELADA' as info,
  b.id as bet_id,
  b.user_id,
  b.amount / 100.0 as aposta_reais,
  b.created_at,
  b.resolved_at,
  -- Saldo do usuário atual
  w.balance / 100.0 as saldo_atual_reais,
  -- Transações relacionadas
  (
    SELECT json_agg(
      json_build_object(
        'tipo', t.type,
        'valor', t.amount / 100.0,
        'saldo_antes', t.balance_before / 100.0,
        'saldo_depois', t.balance_after / 100.0,
        'status', t.status,
        'created_at', t.created_at
      ) ORDER BY t.created_at
    )
    FROM transactions t
    WHERE t.bet_id = b.id
  ) as todas_transacoes
FROM last_cancelled b
JOIN wallet w ON w.user_id = b.user_id;

-- Verificar se há triggers executando em UPDATE para 'cancelada'
SELECT 
  '⚠️ TRIGGERS QUE EXECUTAM EM UPDATE' as alerta,
  t.tgname,
  p.proname as funcao,
  CASE 
    WHEN pg_get_triggerdef(t.oid) LIKE '%WHEN%' THEN 
      substring(pg_get_triggerdef(t.oid) from 'WHEN \((.*?)\)')
    ELSE 'SEM CONDIÇÃO (executa sempre)'
  END as condicao
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgrelid = 'bets'::regclass
  AND NOT t.tgisinternal
  AND t.tgtype & 16 = 16 -- UPDATE
ORDER BY t.tgname;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


