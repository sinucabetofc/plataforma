-- =====================================================
-- Migration: 1024_verificar_debito_duplo
-- Description: Verificar se há dois débitos sendo feitos
-- Created: 2025-11-07
-- =====================================================

-- Ver última aposta de R$ 15 criada
SELECT 
  '🎯 ÚLTIMA APOSTA' as info,
  b.id as bet_id,
  b.amount / 100.0 as valor_aposta,
  b.status,
  b.created_at,
  w.balance / 100.0 as saldo_atual_wallet
FROM bets b
JOIN wallet w ON w.user_id = b.user_id
ORDER BY b.created_at DESC
LIMIT 1;

-- Ver TODAS as transações desta aposta (deve ter apenas 1 débito)
SELECT 
  '📋 TRANSAÇÕES' as info,
  ROW_NUMBER() OVER (ORDER BY created_at) as ordem,
  type,
  amount / 100.0 as valor,
  balance_before / 100.0 as saldo_antes,
  balance_after / 100.0 as saldo_depois,
  description,
  status,
  created_at
FROM transactions
WHERE bet_id = (
  SELECT id FROM bets ORDER BY created_at DESC LIMIT 1
)
ORDER BY created_at;

-- Contar quantas transações de débito existem para esta aposta
SELECT 
  '❌ PROBLEMA: DÉBITOS DUPLICADOS?' as alerta,
  COUNT(*) as total_transacoes,
  COUNT(*) FILTER (WHERE type = 'aposta' AND amount < 0) as debitos,
  COUNT(*) FILTER (WHERE type = 'ganho') as ganhos,
  COUNT(*) FILTER (WHERE type = 'reembolso') as reembolsos,
  SUM(amount) / 100.0 as soma_total_reais
FROM transactions
WHERE bet_id = (
  SELECT id FROM bets ORDER BY created_at DESC LIMIT 1
);

-- Ver se validate_bet_on_insert tem algum comentário sobre débito
SELECT 
  '📝 FUNÇÃO validate_bet_on_insert' as info,
  pg_get_functiondef(oid) as codigo
FROM pg_proc
WHERE proname = 'validate_bet_on_insert';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================




