-- =====================================================
-- Migration: 1025_verificar_aposta_10
-- Description: Verificar aposta de R$ 10 criada agora
-- Created: 2025-11-07
-- =====================================================

-- Ver as últimas 3 apostas criadas
SELECT 
  '📋 ÚLTIMAS 3 APOSTAS' as info,
  id as bet_id,
  amount / 100.0 as valor_salvo_reais,
  status,
  created_at
FROM bets
ORDER BY created_at DESC
LIMIT 3;

-- Ver transações das últimas 3 apostas
SELECT 
  '💰 TRANSAÇÕES DAS ÚLTIMAS 3 APOSTAS' as info,
  b.amount / 100.0 as aposta_reais,
  t.type,
  t.amount / 100.0 as transacao_reais,
  t.balance_before / 100.0 as antes,
  t.balance_after / 100.0 as depois,
  b.created_at
FROM bets b
JOIN transactions t ON t.bet_id = b.id
WHERE b.id IN (
  SELECT id FROM bets ORDER BY created_at DESC LIMIT 3
)
ORDER BY b.created_at DESC, t.created_at;

-- Ver saldo atual do usuário
SELECT
  '💳 SALDO ATUAL' as info,
  balance / 100.0 as saldo_reais,
  blocked_balance / 100.0 as bloqueado_reais
FROM wallet
WHERE user_id = (SELECT id FROM users WHERE email = 'vini@admin.com');

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================




