/**
 * ============================================================
 * Migration: Fix password_hash column
 * ============================================================
 * 
 * PROBLEMA: A tabela public.users tem password_hash NOT NULL
 * MAS: O novo sistema usa Supabase Auth (senha em auth.users)
 * SOLUÇÃO: Tornar password_hash NULLABLE
 * 
 * Data: 05/11/2025
 */

-- ============================================================
-- 1. Alterar coluna password_hash para NULLABLE
-- ============================================================

ALTER TABLE public.users 
ALTER COLUMN password_hash DROP NOT NULL;

-- ============================================================
-- 2. Atualizar registros existentes
-- ============================================================

-- Se houver registros com password_hash NULL, deixa NULL
-- Isso é OK porque a senha está em auth.users agora

-- ============================================================
-- 3. Adicionar comentário explicativo
-- ============================================================

COMMENT ON COLUMN public.users.password_hash IS 
'DEPRECATED: Senha agora é gerenciada por auth.users do Supabase Auth. Esta coluna é mantida apenas para compatibilidade e pode ser NULL.';

-- ============================================================
-- Verificação
-- ============================================================

-- Ver estrutura atualizada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'password_hash';








