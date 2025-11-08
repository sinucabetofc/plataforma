-- ============================================================
-- FIX: Tornar password_hash NULLABLE
-- Data: 05/11/2025
-- Motivo: Com Supabase Auth, senhas ficam em auth.users
--         public.users não precisa mais de password_hash obrigatório
-- ============================================================

-- Tornar password_hash opcional
ALTER TABLE public.users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.users.password_hash IS 
  'Hash de senha (DEPRECADO - usar Supabase Auth). Mantido apenas para compatibilidade.';

-- Verificar alteração
SELECT 
  column_name,
  is_nullable,
  data_type,
  col_description('public.users'::regclass, ordinal_position) as description
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'password_hash';






