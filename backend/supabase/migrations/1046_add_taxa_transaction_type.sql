-- =====================================================
-- Migration: 1046_add_taxa_transaction_type
-- Description: Adiciona tipo 'taxa' ao enum transaction_type
--              para contabilizar taxas de saque como lucro da plataforma
-- Created: 2025-11-11
-- =====================================================

-- Adicionar 'taxa' ao enum transaction_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'taxa' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')
  ) THEN
    ALTER TYPE transaction_type ADD VALUE 'taxa';
    RAISE NOTICE '✅ Tipo "taxa" adicionado ao enum transaction_type';
  ELSE
    RAISE NOTICE 'ℹ️ Tipo "taxa" já existe no enum transaction_type';
  END IF;
END $$;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


