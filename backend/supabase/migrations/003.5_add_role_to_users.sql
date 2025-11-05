-- =====================================================
-- Migration: 003.5_add_role_to_users
-- Description: Adicionar campo role à tabela users
-- Created: 2025-11-05
-- IMPORTANTE: Aplicar ANTES da migration 004
-- =====================================================

-- =====================================================
-- PARTE 1: Criar tipo ENUM para roles
-- =====================================================
DO $$ 
BEGIN
  -- Verificar se o tipo já existe
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('apostador', 'admin', 'parceiro', 'influencer');
  END IF;
END $$;

-- =====================================================
-- PARTE 2: Adicionar coluna role à tabela users
-- =====================================================
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
    
    -- Adicionar comentário
    COMMENT ON COLUMN users.role IS 'Tipo de usuário: apostador (padrão), admin, parceiro ou influencer';
  END IF;
END $$;

-- =====================================================
-- PARTE 3: Tornar primeiro usuário ADMIN (OPCIONAL)
-- =====================================================

-- OPÇÃO 1: Tornar o primeiro usuário criado como admin
-- DESCOMENTE a linha abaixo se quiser:
/*
UPDATE users 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM users 
  ORDER BY created_at ASC 
  LIMIT 1
);
*/

-- OPÇÃO 2: Tornar um usuário específico admin (RECOMENDADO)
-- SUBSTITUA o email pelo seu:
/*
UPDATE users 
SET role = 'admin' 
WHERE email = 'tavaresambroziovinicius@gmail.com';
*/

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se a coluna foi criada corretamente
DO $$
DECLARE
  role_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) INTO role_exists;
  
  IF role_exists THEN
    RAISE NOTICE '✅ Coluna role adicionada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Erro: Coluna role não foi criada!';
  END IF;
END $$;

-- Exibir resultado
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'role';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
