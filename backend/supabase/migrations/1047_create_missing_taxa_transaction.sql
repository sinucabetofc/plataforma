-- =====================================================
-- Migration: 1047_create_missing_taxa_transaction  
-- Description: Cria transação de taxa para saque aprovado
--              antes do tipo 'taxa' existir no enum
-- Created: 2025-11-11
-- =====================================================

-- Criar transação de taxa para o saque já aprovado
INSERT INTO transactions (
  wallet_id,
  user_id,
  type,
  amount,
  balance_before,
  balance_after,
  fee,
  net_amount,
  status,
  description,
  metadata,
  created_at
)
SELECT
  t.wallet_id,
  t.user_id,
  'taxa' AS type,
  t.fee AS amount,  -- Taxa de R$ 8,00 (800 centavos)
  t.balance_after AS balance_before,  -- Saldo já foi debitado
  t.balance_after AS balance_after,   -- Taxa não altera saldo
  0 AS fee,
  -t.fee AS net_amount,
  'completed' AS status,
  'Taxa de saque (8%)' AS description,
  jsonb_build_object(
    'related_transaction_id', t.id,
    'fee_percentage', 8,
    'base_amount', (t.amount + t.fee),  -- Valor original solicitado
    'platform_profit', true
  ) AS metadata,
  t.created_at  -- Mesma data do saque
FROM transactions t
WHERE t.id = '0c2b4684-42e1-4ae6-8a9e-5e6c8639da36'  -- ID do saque aprovado
  AND t.type = 'saque'
  AND NOT EXISTS (
    SELECT 1 FROM transactions t2
    WHERE t2.metadata->>'related_transaction_id' = t.id::text
      AND t2.type = 'taxa'
  );

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


