# 🚀 Guia de Migração para Supabase Auth

**Data:** 05/11/2025  
**Objetivo:** Migrar de JWT manual para Supabase Auth completo  
**Tempo estimado:** 30-60 minutos

---

## 📋 O Que Vai Mudar?

### ❌ ANTES (JWT Manual)
```
Cadastro → public.users (SQL direto)
Login → JWT manual (bcrypt + jsonwebtoken)
Problemas:
- Não aparece no painel Authentication
- Sem refresh tokens
- Divergência entre auth.users e public.users
```

### ✅ DEPOIS (Supabase Auth)
```
Cadastro → auth.users (Supabase Auth)
        → Trigger automático → public.users
Login → Supabase Auth (signInWithPassword)
Benefícios:
- Aparece no painel Authentication ✅
- Refresh tokens automáticos ✅
- Sincronização perfeita ✅
- Mais seguro e robusto ✅
```

---

## 🎯 Passo a Passo da Migração

### **ETAPA 1: Executar Scripts SQL no Supabase** ⏱️ 5 min

1. **Abra o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
   ```

2. **Execute o Script de Trigger:**
   - Abra: `backend/supabase/migrations/001_sync_auth_users.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **RUN**
   - ✅ Deve mostrar: "Success. No rows returned"

3. **Execute o Script de Migração de Usuários:**
   - Abra: `backend/supabase/migrations/002_migrate_existing_users.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **RUN**
   - ✅ Deve mostrar quantos usuários foram migrados

4. **Verificar Migração:**
   - Vá em: **Authentication → Users**
   - ✅ Agora deve mostrar seus usuários!
   - Se ainda mostrar "No users", aguarde 30s e recarregue

---

### **ETAPA 2: Atualizar Backend** ⏱️ 10 min

1. **Fazer Backup dos Arquivos Atuais:**
   ```bash
   cd backend
   
   # Backup do service
   cp services/auth.service.js services/auth.service.OLD.js
   
   # Backup do middleware
   cp middlewares/auth.middleware.js middlewares/auth.middleware.OLD.js
   ```

2. **Substituir pelos Novos Arquivos:**
   ```bash
   # Substituir auth.service.js
   mv services/auth.service.NOVO.js services/auth.service.js
   
   # Substituir auth.middleware.js
   mv middlewares/auth.middleware.NOVO.js middlewares/auth.middleware.js
   ```

3. **Remover Dependências Antigas (Opcional):**
   ```bash
   # JWT manual não é mais necessário
   npm uninstall jsonwebtoken
   
   # bcryptjs não é mais necessário (Supabase Auth cuida disso)
   npm uninstall bcryptjs
   ```

4. **Reiniciar Backend:**
   ```bash
   npm run dev
   ```

---

### **ETAPA 3: Atualizar Frontend** ⏱️ 15 min

1. **Instalar Supabase Client:**
   ```bash
   cd frontend
   npm install @supabase/supabase-js@latest
   ```

2. **Criar Arquivo de Configuração do Supabase:**
   ```bash
   # Criar: frontend/lib/supabase.js
   ```

   Conteúdo:
   ```javascript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

3. **Adicionar Variáveis de Ambiente:**
   ```bash
   # Editar: frontend/.env.local
   ```

   Adicionar:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
   ```

   ⚠️ **Onde encontrar essas chaves:**
   - Supabase Dashboard → Settings → API
   - URL: Project URL
   - Anon Key: Project API keys → anon/public

4. **Atualizar AuthContext:**
   - Vou criar um novo arquivo: `frontend/contexts/AuthContext.NOVO.js`
   - Você substitui o antigo depois de revisar

---

### **ETAPA 4: Testar Tudo** ⏱️ 10 min

1. **Teste de Cadastro:**
   ```
   1. Abra: http://localhost:3000
   2. Clique em "Registrar"
   3. Preencha os dados
   4. Clique em "Finalizar"
   5. ✅ Deve criar conta e fazer login automático
   ```

2. **Verificar no Supabase:**
   ```
   1. Vá em: Authentication → Users
   2. ✅ Novo usuário deve aparecer!
   3. Vá em: Table Editor → users
   4. ✅ Registro também deve estar lá
   ```

3. **Teste de Login:**
   ```
   1. Faça logout
   2. Faça login com as mesmas credenciais
   3. ✅ Deve funcionar normalmente
   ```

4. **Teste de Persistência:**
   ```
   1. Atualize a página (F5)
   2. ✅ Deve permanecer logado!
   ```

5. **Teste de Perfil:**
   ```
   1. Clique em "Perfil"
   2. ✅ Agora deve carregar os dados!
   ```

---

## 🔍 Troubleshooting

### Problema 1: "No users in your project"

**Solução:**
1. Verifique se o script SQL foi executado
2. Execute novamente o script de migração
3. Aguarde 1 minuto e recarregue

---

### Problema 2: Erro "Invalid JWT"

**Solução:**
1. Limpe cookies do browser
2. Faça logout e login novamente
3. Verifique se as chaves do Supabase estão corretas no `.env.local`

---

### Problema 3: Cadastro não funciona

**Solução:**
1. Verifique logs do backend
2. Certifique-se que o trigger foi criado:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. Se não existir, execute novamente o script `001_sync_auth_users.sql`

---

### Problema 4: Usuários migrados não conseguem logar

**Solução:**
Os usuários migrados precisam resetar a senha:

1. **Opção A:** Enviar email de reset para todos:
   ```sql
   -- No Supabase SQL Editor
   SELECT email FROM auth.users WHERE encrypted_password = '';
   ```
   Manualmente envie email para cada um via Supabase Auth

2. **Opção B:** Criar endpoint de reset temporário no backend

---

## ✅ Checklist de Migração

- [ ] Scripts SQL executados no Supabase
- [ ] Trigger `on_auth_user_created` criado
- [ ] Usuários migrados aparecem em Authentication
- [ ] Backend atualizado (auth.service.js)
- [ ] Middleware atualizado (auth.middleware.js)
- [ ] Backend reiniciado
- [ ] Frontend: Supabase client instalado
- [ ] Frontend: Variáveis de ambiente configuradas
- [ ] Frontend: AuthContext atualizado
- [ ] Frontend reiniciado
- [ ] Teste de cadastro ✅
- [ ] Teste de login ✅
- [ ] Teste de perfil ✅
- [ ] Teste de persistência ✅

---

## 🎉 Pós-Migração

### Vantagens que você terá agora:

1. ✅ **Painel de Authentication funciona**
   - Ver todos os usuários
   - Gerenciar permissões
   - Ver logins/sessões

2. ✅ **Refresh Tokens Automáticos**
   - Usuário não precisa fazer login toda hora
   - Sessão renova automaticamente

3. ✅ **Mais Seguro**
   - Supabase Auth é battle-tested
   - Proteção contra ataques
   - Rate limiting integrado

4. ✅ **Funcionalidades Extras Grátis**
   - Reset de senha por email
   - Confirmação de email
   - OAuth (Google, GitHub, etc) no futuro
   - 2FA disponível

---

## 📞 Próximos Passos (Opcional)

1. **Habilitar Confirmação de Email:**
   ```
   Supabase Dashboard → Authentication → Settings
   → Enable email confirmations
   ```

2. **Configurar Templates de Email:**
   ```
   Supabase Dashboard → Authentication → Email Templates
   → Personalizar mensagens
   ```

3. **Adicionar OAuth (Google, GitHub):**
   ```
   Supabase Dashboard → Authentication → Providers
   → Enable Google/GitHub
   ```

4. **Implementar 2FA:**
   ```
   Documentação: https://supabase.com/docs/guides/auth/auth-mfa
   ```

---

## 🆘 Precisa de Ajuda?

Se algo der errado:

1. **Reverta para versão antiga:**
   ```bash
   cd backend
   mv services/auth.service.OLD.js services/auth.service.js
   mv middlewares/auth.middleware.OLD.js middlewares/auth.middleware.js
   ```

2. **Verifique os logs:**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

3. **Entre em contato com suporte**

---

**🚀 Boa Migração!**

*Qualquer dúvida, consulte a documentação oficial do Supabase Auth:*  
https://supabase.com/docs/guides/auth





