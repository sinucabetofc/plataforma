-- ============================================================
-- SOLUÇÃO ALTERNATIVA: Trigger com Permissões Corretas
-- Data: 05/11/2025
-- ============================================================
-- Esta versão funciona no Supabase sem erros de permissão
-- Usa o schema auth com permissões adequadas
-- ============================================================

-- PASSO 1: Garantir que a função seja executada pelo owner correto
ALTER TABLE public.users OWNER TO postgres;
ALTER TABLE public.wallet OWNER TO postgres;

-- PASSO 2: Criar a função com permissões corretas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
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
    COALESCE((NEW.raw_user_meta_data->>'pix_type')::text, 'email'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    true,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

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
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- PASSO 3: Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASSO 4: Função para email verificado
CREATE OR REPLACE FUNCTION public.handle_user_email_verified()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.users
  SET email_verified = true
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_user_email_verified: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- PASSO 5: Trigger para email verificado
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;

CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_user_email_verified();

-- PASSO 6: Grant permissões necessárias
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT ALL ON public.wallet TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.wallet TO authenticated;

-- PASSO 7: Verificar triggers criados
SELECT 
  t.tgname as trigger_name,
  t.tgrelid::regclass as table_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname IN ('on_auth_user_created', 'on_auth_user_email_verified')
ORDER BY t.tgname;








