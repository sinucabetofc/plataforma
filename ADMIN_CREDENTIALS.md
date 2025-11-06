# 🔐 Credenciais de Acesso - Painel Admin

## 📍 URL de Acesso

**Painel Admin**: http://localhost:3000/admin/login

## 👤 Credenciais de Admin

### Opção 1: Criar Admin via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** > **Users**
3. Clique em **Add User**
4. Preencha:
   - Email: `admin@sinucabet.com`
   - Password: `Admin@2024` (ou sua preferência)
   - Auto Confirm: ✅ Yes
5. Após criar, vá em **Database** > **SQL Editor**
6. Execute o SQL abaixo para definir o role como admin:

```sql
-- Atualizar role do usuário para admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@sinucabet.com';

-- Criar registro na tabela players (se necessário)
INSERT INTO public.players (id, email, name, role)
SELECT 
  id,
  email,
  'Administrador' as name,
  'admin' as role
FROM auth.users
WHERE email = 'admin@sinucabet.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Opção 2: Usar Credenciais de Teste

Se você já criou um usuário com email/senha durante os testes, você precisa:

1. **Verificar se o usuário existe** no Supabase (Authentication > Users)
2. **Atualizar o role para admin** usando o SQL acima (substituindo o email)

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

Certifique-se de que as variáveis do Supabase estão configuradas:

**Backend** (`backend/.env`):
```env
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_anonima_supabase
SUPABASE_SERVICE_KEY=sua_chave_service_supabase
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔄 Problemas de Autenticação?

Se você encontrar erros de "Token inválido ou expirado":

1. **Limpe os cookies**: A página de login agora limpa automaticamente cookies antigos
2. **Recarregue a página**: Pressione `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac)
3. **Tente fazer login novamente**

## 🧪 Testando o Login

1. Acesse: http://localhost:3000/admin/login
2. Digite as credenciais do admin
3. Clique em "Entrar no Painel"
4. Você será redirecionado para: http://localhost:3000/admin/dashboard

## 📝 Notas Importantes

- **Sistema de Autenticação**: O projeto usa **Supabase Auth** (migrado em 05/11/2025)
- **Tokens antigos**: Tokens do sistema JWT manual anterior foram invalidados
- **Role Admin**: O campo `role` deve estar em `user_metadata` do Supabase Auth
- **Auto-limpeza**: A página de login limpa automaticamente cookies expirados

## 🆘 Suporte

Se ainda tiver problemas:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do backend (terminal rodando `npm run dev`)
3. Confirme que o Supabase está configurado corretamente
4. Verifique se o role está definido corretamente no user_metadata


