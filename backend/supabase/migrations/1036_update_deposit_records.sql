-- =====================================================
-- Migration: 1036_update_deposit_records
-- Description: Atualizar transações de 'deposito' para 'deposit'
-- Created: 2025-11-10
-- IMPORTANTE: Execute APÓS a migration 1035_fix_deposit_type.sql
-- =====================================================

-- PARTE 2: Atualizar todas as transações que usam 'deposito' para usar 'deposit'

-- Mostrar quantas transações serão atualizadas
SELECT 
  'Transações a serem atualizadas:' as status,
  COUNT(*) as total
FROM transactions
WHERE type = 'deposito';

-- Atualizar as transações
UPDATE transactions
SET type = 'deposit'
WHERE type = 'deposito';

-- Mostrar resultado final
SELECT 
  'Transações de depósito corrigidas!' as status,
  COUNT(*) as total_updated
FROM transactions
WHERE type = 'deposit';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

