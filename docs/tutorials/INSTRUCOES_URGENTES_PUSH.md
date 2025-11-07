# 🚨 INSTRUÇÕES URGENTES - PUSH E DEPLOY

## ✅ STATUS ATUAL
- ✅ Commit realizado localmente com sucesso
- ⏳ **AGUARDANDO:** Push para GitHub

---

## 📋 PASSO A PASSO

### 1️⃣ Fazer Push para GitHub

**Execute no terminal:**
```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet
git push origin main
```

**Ou, se tiver problema de autenticação, use SSH:**
```bash
git remote set-url origin git@github.com:sinucabetofc/plataforma.git
git push origin main
```

---

### 2️⃣ Aguardar Deploy Automático Vercel

Após o push, o Vercel vai automaticamente:
1. Detectar o novo commit
2. Iniciar o build
3. Aplicar as correções do `.vercelignore`
4. Deploy será concluído com sucesso ✅

**Acompanhar deploy:**
- Acesse: https://vercel.com/dashboard
- Ou: https://vercel.com/sinucabetofc/plataforma

**Tempo estimado:** 2-3 minutos

---

### 3️⃣ Re-Deploy Manual no Render (Backend)

**⚠️ IMPORTANTE:** O backend no Render precisa de re-deploy manual!

**Acesse:**
1. https://dashboard.render.com
2. Selecione o serviço: `sinucabet-backend`
3. Clique em **"Manual Deploy"** (botão azul no topo direito)
4. Selecione **"Deploy latest commit"**
5. Aguarde ~2-3 minutos

**Por quê?**
- Aplicar correções no `auth.service.js`
- Atualizar placeholders de imagens
- Melhorar logs de erro

---

### 4️⃣ Verificar Variáveis de Ambiente (Render)

**No Render Dashboard:**
1. Clique no serviço `sinucabet-backend`
2. Vá em **Environment**
3. **Verifique** se estas variáveis existem:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (chave completa, não a anon_key)
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=sua_chave_secreta
NODE_ENV=production
PORT=3001
```

**⚠️ SE A VARIÁVEL `SUPABASE_SERVICE_ROLE_KEY` ESTIVER FALTANDO OU ERRADA:**

Pegue a chave correta no Supabase:
1. https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings → API
4. Copie **service_role key** (⚠️ não a anon key!)
5. Cole no Render

---

### 5️⃣ Testar Sistema

Após ambos os deploys:

**Frontend (Vercel):**
- [ ] Acessar site principal
- [ ] Tentar fazer cadastro
- [ ] Verificar se modal abre
- [ ] Verificar se não há erros de imagens

**Backend (Render):**
- [ ] Testar health check: 
  ```bash
  curl https://sinucabet-backend.onrender.com/api/auth/health
  ```
- [ ] Testar cadastro completo
- [ ] Verificar logs no Render Dashboard

**Painel Admin:**
- [ ] Acessar `/admin/login`
- [ ] Fazer login
- [ ] Verificar se jogadores aparecem com foto
- [ ] Criar nova partida (testar upload de imagem)

---

## 🐛 SE DER ERRO NO CADASTRO

### Verificar Logs no Render:
1. Acesse Render Dashboard
2. Clique no serviço backend
3. Clique em **Logs** (menu lateral)
4. Procure por:
   - `❌ [REGISTER] Erro ao verificar CPF`
   - `❌ [REGISTER] Erro no Supabase Auth`
   - `❌ [REGISTER] Erro ao criar usuário`

### Erros Comuns:

**1. "Database error checking email"**
- ✅ **JÁ CORRIGIDO** na nova versão
- Se ainda aparecer, verifique `SUPABASE_SERVICE_ROLE_KEY`

**2. "Auth error creating user"**
- Verifique se `SUPABASE_URL` está correta
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correta
- Verifique se o projeto Supabase está ativo

**3. "Network error"**
- Servidor Render pode estar hibernando (primeiro acesso após 15min)
- Aguarde 30 segundos e tente novamente

---

## 📊 Resumo das Correções Aplicadas

### ✅ Deploy Vercel
- Corrigido `.vercelignore` para não remover componentes admin
- Build vai funcionar agora!

### ✅ Cadastro de Usuários
- Removida verificação dupla de email (Supabase já faz isso)
- Melhorado tratamento de erros com try-catch
- Adicionados logs detalhados para debug
- Melhor detecção de emails duplicados

### ✅ Imagens Placeholder
- Substituído `via.placeholder.com` (não funciona mais)
- Novo: `ui-avatars.com` (gratuito, confiável)
- Cores personalizadas (#27E502 - verde do site)
- Fallback automático em caso de erro

---

## 🎯 Resultado Esperado

Após seguir todos os passos:

### ✅ Frontend
- Site carrega normalmente
- Modal de cadastro abre
- Imagens dos jogadores aparecem
- Painel admin funciona

### ✅ Backend
- API responde corretamente
- Cadastro funciona sem erros
- Logs mostram processo completo
- Imagens placeholder carregam

### ✅ Banco de Dados
- Usuários são criados corretamente
- Carteiras são criadas automaticamente
- CPF duplicado é detectado
- Email duplicado é detectado

---

## 📞 Se Precisar de Ajuda

**Logs para compartilhar:**
1. Logs do Render (no dashboard)
2. Console do navegador (F12)
3. Network tab do navegador (para ver requisições)

**Informações úteis:**
- URL do frontend Vercel
- URL do backend Render
- Projeto Supabase

---

**Criado em:** 06/11/2025  
**Status:** ⏳ Aguardando push e deploys  
**Prioridade:** 🚨 URGENTE

