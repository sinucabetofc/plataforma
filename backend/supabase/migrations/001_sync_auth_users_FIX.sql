-- ============================================================
-- MIGRAÇÃO: Sincronização auth.users ↔ public.users (CORRIGIDO)
-- Data: 05/11/2025
-- Descrição: Trigger para criar automaticamente registro em 
--            public.users quando usuário é criado em auth.users
-- CORREÇÃO: Removido SECURITY DEFINER para evitar erro de permissão
-- ============================================================

-- 1. Função para criar usuário em public.users quando criado em auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Inserir novo usuário em public.users
  INSERT INTO public.users (
    id,
    email,
    name,
    phone,
    cpf,
    pix_key,
    pix_type,
    email_verified,
    is_active,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    COALESCE(NEW.raw_user_meta_data->>'pix_key', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'pix_type', 'email'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    true,
    NOW()
  );

  -- Criar carteira para o novo usuário
  INSERT INTO public.wallet (
    user_id,
    balance,
    blocked_balance,
    total_deposited,
    total_withdrawn,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    0.00,
    0.00,
    0.00,
    0.00,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- 2. Criar trigger para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Função para atualizar email_verified quando email é confirmado
CREATE OR REPLACE FUNCTION public.handle_user_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar email_verified em public.users
  UPDATE public.users
  SET email_verified = true
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- 4. Criar trigger para email verificado
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;

CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_user_email_verified();

-- 5. Comentários para documentação
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Cria automaticamente registro em public.users e wallet quando usuário é criado em auth.users';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
  'Sincroniza criação de usuário entre auth.users e public.users';

COMMENT ON FUNCTION public.handle_user_email_verified() IS 
  'Atualiza email_verified em public.users quando email é confirmado';

COMMENT ON TRIGGER on_auth_user_email_verified ON auth.users IS 
  'Sincroniza verificação de email entre auth.users e public.users';

-- 6. Verificar se os triggers foram criados
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname IN ('on_auth_user_created', 'on_auth_user_email_verified')
ORDER BY tgname;







