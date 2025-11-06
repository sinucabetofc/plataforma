-- ============================================================
-- Script para Verificar e Criar Admin no SinucaBet
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- =====================================================
-- PASSO 1: CRIAR TIPO ENUM E COLUNA ROLE (SE NÃO EXISTIR)
-- =====================================================
DO $$ 
BEGIN
  -- Verificar se o tipo já existe
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('apostador', 'admin', 'parceiro', 'influencer');
    RAISE NOTICE '✅ Tipo user_role criado!';
  ELSE
    RAISE NOTICE '⚠️ Tipo user_role já existe!';
  END IF;
END $$;

-- Adicionar coluna role à tabela users (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    -- Adicionar coluna com default 'apostador'
    ALTER TABLE users 
    ADD COLUMN role user_role DEFAULT 'apostador' NOT NULL;
    
    -- Criar índice para performance
    CREATE INDEX idx_users_role ON users(role);
    
    RAISE NOTICE '✅ Coluna role adicionada com sucesso!';
  ELSE
    RAISE NOTICE '⚠️ Coluna role já existe!';
  END IF;
END $$;

-- =====================================================
-- PASSO 2: VERIFICAR se o usuário existe
-- =====================================================

-- 2.1. VERIFICAR na tabela public.users
SELECT 
  id,
  email,
  role,
  name,
  is_active,
  email_verified,
  created_at
FROM public.users
WHERE email = 'vini@admin.com';

-- 2.2. VERIFICAR no auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'vini@admin.com';

-- =====================================================
-- PASSO 3: ATUALIZAR USUÁRIO PARA ADMIN
-- =====================================================

-- 3.1. Se o usuário EXISTE na public.users, atualizar role
UPDATE public.users 
SET role = 'admin'
WHERE email = 'vini@admin.com';

-- 3.2. VERIFICAR se foi atualizado
SELECT 
  id,
  email,
  role,
  name,
  is_active,
  '✅ ROLE ATUALIZADO PARA ADMIN' as status
FROM public.users
WHERE email = 'vini@admin.com';

-- =====================================================
-- PASSO 4: CRIAR USUÁRIO (SE NÃO EXISTIR na public.users)
-- =====================================================

-- 4.1. CRIAR registro na tabela public.users
-- NOTA: Só executa se o usuário não existir
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  phone,
  cpf,
  pix_key,
  pix_type,
  email_verified,
  is_active
)
SELECT 
  au.id,
  au.email,
  'Vinicius Ambrozio (Admin)' as name,
  'admin' as role,
  '+5511999999999' as phone,
  '000.000.000-00' as cpf,
  au.email as pix_key,
  'email' as pix_type,
  true as email_verified,
  true as is_active
FROM auth.users au
WHERE au.email = 'vini@admin.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.email = 'vini@admin.com'
  );

-- 4.2. CRIAR carteira para o admin (se não existir)
INSERT INTO public.wallet (
  user_id,
  balance,
  blocked_balance,
  total_deposited,
  total_withdrawn
)
SELECT 
  au.id,
  0.00,
  0.00,
  0.00,
  0.00
FROM auth.users au
WHERE au.email = 'vini@admin.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.wallet w 
    WHERE w.user_id = au.id
  );

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- 7. VERIFICAR tudo está OK
SELECT 
  u.id,
  u.email,
  u.name,
  u.role as "ROLE (deve ser 'admin')",
  u.is_active as "ATIVO",
  u.email_verified as "EMAIL_VERIFICADO",
  CASE 
    WHEN w.user_id IS NOT NULL THEN 'SIM' 
    ELSE 'NÃO' 
  END as "TEM_CARTEIRA",
  w.balance as "SALDO"
FROM public.users u
LEFT JOIN public.wallet w ON w.user_id = u.id
WHERE u.email = 'vini@admin.com';

-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
-- | email             | ROLE  | ATIVO | EMAIL_VERIFICADO | TEM_CARTEIRA | SALDO |
-- |-------------------|-------|-------|------------------|--------------|-------|
-- | vini@admin.com    | admin | true  | true             | SIM          | 0.00  |
-- ============================================================

