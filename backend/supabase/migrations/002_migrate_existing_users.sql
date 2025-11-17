-- ============================================================
-- MIGRAÇÃO: Usuários Existentes → auth.users
-- Data: 05/11/2025
-- Descrição: Migra usuários que já existem em public.users
--            para auth.users (executar MANUALMENTE apenas 1x)
-- ============================================================

-- ⚠️ IMPORTANTE: Este script deve ser executado APENAS UMA VEZ
-- ⚠️ Após migração, os usuários precisarão usar "Esqueci a Senha"
--    para redefinir suas senhas

-- OPÇÃO 1: Migração SEM senha (usuários precisam resetar)
-- Cria usuários em auth.users sem senha (eles receberão email para criar senha)

DO $$
DECLARE
  user_record RECORD;
  new_user_id UUID;
BEGIN
  -- Para cada usuário em public.users que NÃO existe em auth.users
  FOR user_record IN 
    SELECT u.* 
    FROM public.users u
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE au.id IS NULL
  LOOP
    -- Inserir em auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',  -- instance_id padrão
      user_record.id,
      'authenticated',
      'authenticated',
      user_record.email,
      '',  -- Senha vazia (usuário precisa resetar)
      CASE 
        WHEN user_record.email_verified THEN user_record.created_at
        ELSE NULL
      END,
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      jsonb_build_object(
        'name', user_record.name,
        'phone', user_record.phone,
        'cpf', user_record.cpf,
        'pix_key', user_record.pix_key,
        'pix_type', user_record.pix_type
      ),
      user_record.created_at,
      NOW(),
      encode(gen_random_bytes(32), 'hex'),
      encode(gen_random_bytes(32), 'hex')
    );

    RAISE NOTICE 'Usuário migrado: % (%)', user_record.name, user_record.email;
  END LOOP;
END $$;

-- Verificar migração
SELECT 
  'Total em public.users' as tabela,
  COUNT(*) as total
FROM public.users
UNION ALL
SELECT 
  'Total em auth.users' as tabela,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
  'Migrados com sucesso' as tabela,
  COUNT(*) as total
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id;

-- ============================================================
-- SCRIPT ALTERNATIVO: Copiar senha hash (NÃO RECOMENDADO)
-- ============================================================
-- 
-- ⚠️ Este método é arriscado pois Supabase Auth pode usar
--    configuração de hash diferente do bcrypt manual
--
-- USE APENAS SE NECESSÁRIO e teste com 1 usuário primeiro!
--
-- DO $$
-- DECLARE
--   user_record RECORD;
-- BEGIN
--   FOR user_record IN 
--     SELECT u.* 
--     FROM public.users u
--     LEFT JOIN auth.users au ON u.id = au.id
--     WHERE au.id IS NULL
--   LOOP
--     INSERT INTO auth.users (
--       instance_id,
--       id,
--       aud,
--       role,
--       email,
--       encrypted_password,
--       email_confirmed_at,
--       raw_app_meta_data,
--       raw_user_meta_data,
--       created_at,
--       updated_at
--     )
--     VALUES (
--       '00000000-0000-0000-0000-000000000000',
--       user_record.id,
--       'authenticated',
--       'authenticated',
--       user_record.email,
--       user_record.password_hash,  -- ⚠️ PODE NÃO FUNCIONAR
--       CASE WHEN user_record.email_verified THEN user_record.created_at ELSE NULL END,
--       jsonb_build_object('provider', 'email'),
--       jsonb_build_object(
--         'name', user_record.name,
--         'phone', user_record.phone,
--         'cpf', user_record.cpf,
--         'pix_key', user_record.pix_key,
--         'pix_type', user_record.pix_type
--       ),
--       user_record.created_at,
--       NOW()
--     );
--   END LOOP;
-- END $$;








