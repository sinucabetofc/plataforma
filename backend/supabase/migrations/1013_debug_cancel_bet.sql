-- =====================================================
-- Migration: 1013_debug_cancel_bet
-- Description: Debug cancelamento de apostas (duplo reembolso)
-- Created: 2025-11-07
-- =====================================================

-- Listar todos os triggers na tabela bets
SELECT 
  '🔍 TRIGGERS ATIVOS NA TABELA BETS' as info,
  trigger_name,
  event_manipulation as evento,
  action_timing as quando,
  action_statement as funcao
FROM information_schema.triggers
WHERE event_object_table = 'bets'
ORDER BY trigger_name;

-- Verificar transações de reembolso recentes
SELECT 
  '🔍 ÚLTIMAS TRANSAÇÕES DE REEMBOLSO' as info,
  t.id,
  t.user_id,
  t.amount / 100.0 as valor_reais,
  t.description,
  t.created_at,
  b.status as status_aposta
FROM transactions t
LEFT JOIN bets b ON b.id = t.bet_id
WHERE t.type = 'reembolso'
ORDER BY t.created_at DESC
LIMIT 10;

-- Verificar se há duplicação de reembolsos
SELECT 
  '⚠️ POSSÍVEIS DUPLICAÇÕES DE REEMBOLSO' as alerta,
  t.bet_id,
  COUNT(*) as quantidade_reembolsos,
  SUM(t.amount) / 100.0 as valor_total_reembolsado,
  b.amount / 100.0 as valor_original_aposta
FROM transactions t
JOIN bets b ON b.id = t.bet_id
WHERE t.type = 'reembolso'
  AND b.status = 'cancelada'
GROUP BY t.bet_id, b.amount
HAVING COUNT(*) > 1
ORDER BY quantidade_reembolsos DESC;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


