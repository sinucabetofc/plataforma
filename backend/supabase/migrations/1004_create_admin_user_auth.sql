-- =====================================================
-- Migration: 1004_create_admin_user_auth
-- Description: Criar usuário admin no Supabase Auth
-- Created: 2025-11-06
-- =====================================================

-- Deletar usuário se já existir
DELETE FROM auth.identities WHERE user_id = '248cee73-ff5c-494a-9699-ef0f4bb0a1a1'::uuid;
DELETE FROM auth.users WHERE id = '248cee73-ff5c-494a-9699-ef0f4bb0a1a1'::uuid;

-- Inserir usuário no auth.users (tabela do Supabase Auth)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '248cee73-ff5c-494a-9699-ef0f4bb0a1a1'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'vini@admin.com',
  '$2b$10$2e0fXw6CFxQy7L/Idtipg.vgbnTkur4mFO./ubBuyzOLcZVEg8QTC', -- Hash de @Vini0608
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Vinicius ambrozio"}'::jsonb,
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Criar identidade para o usuário
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '248cee73-ff5c-494a-9699-ef0f4bb0a1a1'::uuid,
  '248cee73-ff5c-494a-9699-ef0f4bb0a1a1'::uuid,
  jsonb_build_object(
    'sub', '248cee73-ff5c-494a-9699-ef0f4bb0a1a1',
    'email', 'vini@admin.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW()
);

SELECT 'Usuário admin criado no Supabase Auth!' as status;

-- Verificar se foi criado
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'vini@admin.com';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


