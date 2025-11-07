-- ============================================================
-- MIGRAÇÃO: Remover constraint UNIQUE de CPF
-- Data: 06/11/2025
-- Motivo: Permitir múltiplos usuários com mesmo CPF
--         Reduz erros de cadastro e simplifica o sistema
-- ============================================================

-- 1. Remover constraint UNIQUE de CPF se existir
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_cpf_key;

-- 2. Remover índice UNIQUE de CPF se existir
DROP INDEX IF EXISTS public.users_cpf_key;
DROP INDEX IF EXISTS public.idx_users_cpf;

-- 3. Recriar índice CPF sem UNIQUE (para performance de consultas)
CREATE INDEX IF NOT EXISTS idx_users_cpf_non_unique ON public.users(cpf);

-- 4. Comentário documentando a mudança
COMMENT ON COLUMN public.users.cpf IS 
  'CPF do usuário - Formato: XXX.XXX.XXX-XX (CPF duplicado é permitido)';

-- 5. Verificação final
DO $$
BEGIN
  RAISE NOTICE 'Constraint UNIQUE de CPF removida com sucesso!';
  RAISE NOTICE 'Sistema agora permite CPF duplicado';
END $$;

