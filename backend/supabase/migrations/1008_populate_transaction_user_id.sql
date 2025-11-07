-- =====================================================
-- Migration: 1008_populate_transaction_user_id
-- Description: Popular user_id em transactions onde está NULL
-- Created: 2025-11-07
-- =====================================================

-- Popular user_id baseado em wallet_id
UPDATE transactions t
SET user_id = w.user_id
FROM wallet w
WHERE t.wallet_id = w.id 
  AND t.user_id IS NULL;

-- Verificar quantas foram atualizadas
SELECT 
  'user_id populado com sucesso!' as status,
  COUNT(*) as total_transactions,
  COUNT(user_id) as with_user_id,
  COUNT(*) FILTER (WHERE user_id IS NULL) as missing_user_id
FROM transactions;

-- Mostrar exemplo das transações atualizadas
SELECT 
  t.id,
  t.user_id,
  u.name as user_name,
  u.email as user_email,
  t.type,
  t.amount / 100.0 as amount_reais,
  t.created_at
FROM transactions t
LEFT JOIN users u ON u.id = t.user_id
ORDER BY t.created_at DESC
LIMIT 10;

