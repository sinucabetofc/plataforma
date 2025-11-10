-- ============================================================
-- Script: Criar Saques de Teste
-- ============================================================
-- Execute no Supabase SQL Editor para criar saques de teste

-- 1. Criar saque de PARCEIRO (influencer_withdrawals)
INSERT INTO influencer_withdrawals (
    influencer_id,
    amount,
    pix_key,
    pix_type,
    status,
    requested_at,
    metadata
)
SELECT 
    id,
    150.00,
    pix_key,
    pix_type,
    'pending',
    NOW() - INTERVAL '2 hours',
    jsonb_build_object(
        'influencer_name', name,
        'influencer_phone', phone,
        'requested_from', 'test'
    )
FROM influencers
WHERE email = 'tavaresambroziovinicius@gmail.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 2. Criar saque de APOSTADOR (transactions com type='withdraw')
INSERT INTO transactions (
    user_id,
    type,
    amount,
    status,
    description,
    created_at,
    metadata
)
SELECT 
    id,
    'withdraw',
    10000, -- R$ 100,00 (em centavos)
    'pending',
    'Solicitação de saque via PIX',
    NOW() - INTERVAL '1 hour',
    jsonb_build_object(
        'pix_key', pix_key,
        'pix_type', pix_type,
        'requested_from', 'wallet'
    )
FROM users
WHERE email = 'vini@admin.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. Verificar saques criados
SELECT 
    'Parceiro' as tipo,
    id,
    amount as valor,
    pix_key,
    status,
    requested_at as data
FROM influencer_withdrawals
WHERE requested_at > NOW() - INTERVAL '1 day'

UNION ALL

SELECT 
    'Apostador' as tipo,
    id,
    amount / 100.0 as valor,
    metadata->>'pix_key' as pix_key,
    status,
    created_at as data
FROM transactions
WHERE type = 'withdraw'
AND created_at > NOW() - INTERVAL '1 day'

ORDER BY data DESC;

