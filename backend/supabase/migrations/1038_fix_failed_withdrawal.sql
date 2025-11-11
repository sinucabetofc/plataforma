-- =====================================================
-- Migration: 1038_fix_failed_withdrawal
-- Description: Devolver saldo do saque que falhou
-- Created: 2025-11-10
-- =====================================================

-- 1. Ver o saque que falhou
SELECT 
    'Saque que falhou' as info,
    id,
    user_id,
    amount / 100.0 as valor_reais,
    status,
    created_at
FROM transactions
WHERE id = 'de920289-0443-405b-9dcc-782c70f3c1ec';

-- 2. Ver saldo atual do usuário
SELECT 
    'Saldo atual' as info,
    user_id,
    balance / 100.0 as saldo_atual_reais
FROM wallet
WHERE user_id = (
    SELECT user_id FROM transactions 
    WHERE id = 'de920289-0443-405b-9dcc-782c70f3c1ec'
);

-- 3. Devolver o valor do saque para a carteira
UPDATE wallet
SET balance = balance + (
    SELECT amount FROM transactions 
    WHERE id = 'de920289-0443-405b-9dcc-782c70f3c1ec'
)
WHERE user_id = (
    SELECT user_id FROM transactions 
    WHERE id = 'de920289-0443-405b-9dcc-782c70f3c1ec'
);

-- 4. Verificar novo saldo
SELECT 
    'Novo saldo (após devolução)' as info,
    user_id,
    balance / 100.0 as saldo_reais
FROM wallet
WHERE user_id = (
    SELECT user_id FROM transactions 
    WHERE id = 'de920289-0443-405b-9dcc-782c70f3c1ec'
);

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

