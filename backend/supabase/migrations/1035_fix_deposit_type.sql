-- =====================================================
-- Migration: 1035_fix_deposit_type
-- Description: Adicionar 'deposit' ao enum e corrigir transações
-- Created: 2025-11-10
-- =====================================================

-- PARTE 1: Adicionar 'deposit' ao enum transaction_type
-- Nota: Execute esta parte primeiro, depois execute a PARTE 2

DO $$ 
BEGIN
    -- Verificar se o valor 'deposit' já existe no enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'deposit' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')
    ) THEN
        -- Adicionar 'deposit' ao enum
        ALTER TYPE transaction_type ADD VALUE 'deposit';
        RAISE NOTICE 'Valor "deposit" adicionado ao enum transaction_type';
    ELSE
        RAISE NOTICE 'Valor "deposit" já existe no enum transaction_type';
    END IF;
END $$;

