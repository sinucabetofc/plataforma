-- =====================================================
-- Migration: 1015_diagnose_specific_bet
-- Description: Diagnosticar aposta específica com problema
-- Created: 2025-11-07
-- =====================================================

-- Buscar a última aposta cancelada
WITH last_cancelled_bet AS (
  SELECT id, user_id, amount, created_at, status
  FROM bets
  WHERE status = 'cancelada'
  ORDER BY resolved_at DESC
  LIMIT 1
)

-- Ver TODAS as transações relacionadas a essa aposta
SELECT 
  '💰 TODAS AS TRANSAÇÕES DA APOSTA CANCELADA' as info,
  t.id as transaction_id,
  t.type as tipo_transacao,
  t.amount / 100.0 as valor_reais,
  t.user_id,
  t.wallet_id,
  t.balance_before / 100.0 as saldo_antes,
  t.balance_after / 100.0 as saldo_depois,
  t.status as status_transacao,
  t.description,
  t.created_at,
  b.amount / 100.0 as valor_aposta_original
FROM last_cancelled_bet b
LEFT JOIN transactions t ON t.bet_id = b.id
ORDER BY t.created_at;

-- Ver o saldo atual do usuário
WITH last_cancelled_bet AS (
  SELECT id, user_id, amount
  FROM bets
  WHERE status = 'cancelada'
  ORDER BY resolved_at DESC
  LIMIT 1
)
SELECT 
  '💼 SALDO ATUAL DO USUÁRIO' as info,
  w.user_id,
  w.balance / 100.0 as saldo_atual_reais,
  u.name as nome_usuario,
  u.email
FROM last_cancelled_bet b
JOIN wallet w ON w.user_id = b.user_id
JOIN users u ON u.id = b.user_id;

-- Verificar se há problema de user_id NULL em transações
SELECT 
  '⚠️ TRANSAÇÕES SEM USER_ID' as alerta,
  COUNT(*) as quantidade,
  SUM(amount) / 100.0 as valor_total_reais
FROM transactions
WHERE user_id IS NULL
  AND created_at > NOW() - INTERVAL '24 hours';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================



