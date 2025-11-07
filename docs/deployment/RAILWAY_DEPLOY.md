# 🚂 Deploy do Backend na Railway

## 📋 Passo a Passo Completo

### 1️⃣ Preparar o Projeto Railway

1. Acesse: https://railway.app/
2. Faça login com GitHub (recomendado)
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha o repositório: **sinucabetofc/plataforma**
6. Railway vai detectar o projeto

### 2️⃣ Configurar o Root Directory

Como temos múltiplas pastas, precisamos especificar o backend:

1. Após selecionar o repositório
2. Clique em **"Settings"** (⚙️)
3. Em **"Root Directory"**, digite: `backend`
4. Clique em **"Save"**

### 3️⃣ Adicionar Variáveis de Ambiente

Clique em **"Variables"** e adicione:

```env
# Porta (Railway define automaticamente, mas pode especificar)
PORT=3001

# JWT Secret (crie uma string aleatória segura)
JWT_SECRET=sua-chave-secreta-muito-forte-aqui-128-caracteres

# Supabase
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_ANON_KEY=sua-chave-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-key

# Node Environment
NODE_ENV=production

# CORS (URL do frontend na Vercel)
FRONTEND_URL=https://plataforma-hazel.vercel.app
```

**⚠️ Importante sobre JWT_SECRET:**
Gere uma chave segura usando:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4️⃣ Deploy Automático

1. Railway vai iniciar o deploy automaticamente
2. Aguarde a build completar (1-3 minutos)
3. Quando aparecer "Success", seu backend está no ar! 🎉

### 5️⃣ Obter a URL do Backend

1. Na página do projeto, clique em **"Settings"**
2. Em **"Domains"**, clique em **"Generate Domain"**
3. Railway vai criar uma URL tipo: `https://seu-projeto-production.up.railway.app`
4. **Copie essa URL** - você vai precisar dela!

### 6️⃣ Testar o Backend

Teste se está funcionando:

```bash
# Teste básico
curl https://seu-projeto-production.up.railway.app/health

# Deve retornar algo como:
# {"status":"ok","timestamp":"..."}
```

### 7️⃣ Atualizar Frontend na Vercel

Agora atualize a variável de ambiente no frontend:

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Edite `NEXT_PUBLIC_API_URL` para:
   ```
   https://seu-projeto-production.up.railway.app/api
   ```
4. **Importante:** Adicione `/api` no final!
5. Clique em **Save**
6. Vá em **Deployments** → **Redeploy**

---

## 🔄 Deploy Automático

Configurado! Agora sempre que você fizer push para `main`:

- Railway faz rebuild automático do backend
- Vercel faz rebuild automático do frontend

---

## 📊 Monitoramento

Na Railway você pode:

- **Ver logs em tempo real**: Aba "Logs"
- **Métricas de uso**: CPU, memória, rede
- **Restart manual**: Se necessário

---

## 🐛 Troubleshooting

### Build falhou?

1. Verifique os logs na Railway
2. Confirme que `Root Directory` está como `backend`
3. Verifique se todas as variáveis estão configuradas

### Erro 500 nas requisições?

1. Verifique os logs na Railway
2. Confirme que `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretos
3. Teste as credenciais do Supabase

### CORS Error?

1. Verifique se `FRONTEND_URL` está correto
2. Deve ser a URL do Vercel sem barra no final
3. Pode precisar adicionar em `server.js` se necessário

---

## 💰 Custos

Railway oferece:

- **$5 grátis/mês** para começar
- Depois: **$0.000231/GB-hora** + **$0.000463/vCPU-hora**
- Para tráfego baixo/médio: ~$5-10/mês

---

## 🔐 Segurança

✅ **Já configurado:**
- Helmet.js (headers de segurança)
- CORS
- Rate limiting
- Validação de dados (Zod)

⚠️ **Lembre-se:**
- Nunca commite o arquivo `.env`
- Use JWT_SECRET forte
- Mantenha as chaves do Supabase seguras

---

## 📝 Checklist Final

- [ ] Root Directory configurado como `backend`
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] JWT_SECRET gerado com crypto
- [ ] Domain gerado na Railway
- [ ] Backend testado (endpoint /health)
- [ ] NEXT_PUBLIC_API_URL atualizado na Vercel
- [ ] Frontend redesployado na Vercel
- [ ] Teste completo do sistema

---

## 🎉 Pronto!

Seu backend estará rodando 24/7 na Railway!

**Próximos passos:**
1. Teste todas as funcionalidades
2. Configure domínio personalizado (opcional)
3. Configure alertas de erro (opcional)
4. Setup CI/CD avançado (opcional)



