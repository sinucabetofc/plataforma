-- =====================================================
-- Migration: 1037_mark_paid_deposit
-- Description: Marcar depósito de R$ 10,00 como pago
-- Created: 2025-11-10
-- =====================================================

-- Atualizar o depósito de R$ 10,00 para status 'completed'
UPDATE transactions
SET 
    status = 'completed',
    processed_at = NOW()
WHERE id = '209b1b22-9b0e-40c5-92c5-63139e98558e'
AND type = 'deposit'
AND status = 'pending';

-- Verificar se foi atualizado
SELECT 
    'Depósito atualizado!' as resultado,
    id,
    user_id,
    amount / 100.0 as valor_reais,
    status,
    created_at AT TIME ZONE 'America/Sao_Paulo' as data_criacao,
    processed_at AT TIME ZONE 'America/Sao_Paulo' as data_processamento
FROM transactions
WHERE id = '209b1b22-9b0e-40c5-92c5-63139e98558e';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

