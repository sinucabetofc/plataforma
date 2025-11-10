-- ============================================================
-- Script: Criar Parceiro de Teste
-- ============================================================
-- Execute no Supabase SQL Editor para criar um parceiro de teste

-- 1. Criar parceiro
INSERT INTO influencers (
    name,
    email,
    password_hash,
    phone,
    pix_key,
    pix_type,
    commission_percentage,
    is_active
) VALUES (
    'Parceiro Teste',
    'parceiro@teste.com',
    -- Senha: 123456 (hash bcrypt)
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '+5511999999999',
    '11999999999',
    'phone',
    10.00, -- 10% de comissão
    true
)
ON CONFLICT (email) DO NOTHING
RETURNING *;

-- 2. Criar registro de comissões (saldo inicial zerado)
INSERT INTO influencer_commissions (
    influencer_id,
    balance,
    total_earned,
    total_withdrawn,
    pending_amount
)
SELECT 
    id,
    0.00,
    0.00,
    0.00,
    0.00
FROM influencers
WHERE email = 'parceiro@teste.com'
ON CONFLICT (influencer_id) DO NOTHING;

-- ============================================================
-- Credenciais de Login:
-- Email: parceiro@teste.com
-- Senha: 123456
-- ============================================================

-- Para verificar se foi criado:
SELECT 
    id,
    name,
    email,
    phone,
    pix_key,
    commission_percentage,
    is_active,
    created_at
FROM influencers
WHERE email = 'parceiro@teste.com';

