# 🎨 Deploy do Backend no Render.com

## ✅ Por que Render?

- **100% Gratuito** para começar
- Não precisa de cartão de crédito
- Deploy automático do GitHub
- SSL/HTTPS grátis
- Fácil de usar

⚠️ **Limitações do Plano Gratuito:**
- O serviço "dorme" após 15 minutos sem uso
- Primeira requisição após dormir pode demorar ~1 minuto
- 750 horas/mês grátis (suficiente para 1 serviço 24/7)

---

## 🚀 Deploy em 5 Passos

### 1️⃣ Criar Conta no Render (1 minuto)

1. Acesse: https://render.com/
2. Clique em **"Get Started for Free"**
3. Escolha **"Sign up with GitHub"** (recomendado)
4. Autorize o Render a acessar seus repositórios

---

### 2️⃣ Criar Novo Web Service (2 minutos)

1. No Dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório:
   - Clique em **"Connect a repository"**
   - Procure por: `sinucabetofc/plataforma`
   - Clique em **"Connect"**

---

### 3️⃣ Configurar o Serviço (3 minutos)

Preencha os campos:

**Basic Settings:**
- **Name**: `sinucabet-backend` (ou qualquer nome)
- **Region**: `Oregon (US West)` (gratuito)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANTE!**
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Plan:**
- Selecione: **"Free"** (0$/mês)

---

### 4️⃣ Adicionar Variáveis de Ambiente (5 minutos)

Role até a seção **"Environment Variables"** e adicione:

#### Gere o JWT_SECRET primeiro:

Abra seu terminal e execute:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Agora adicione as variáveis:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=cole_a_chave_gerada_acima
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
FRONTEND_URL=https://sinucabet.vercel.app
```

**Como adicionar:**
- Clique em **"Add Environment Variable"**
- Digite a **Key** (nome da variável)
- Digite o **Value** (valor)
- Repita para todas as variáveis

**📍 Onde pegar as chaves do Supabase:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

---

### 5️⃣ Deploy! (1 clique)

1. Role até o final da página
2. Clique em **"Create Web Service"**
3. Aguarde o build (3-5 minutos)
4. Quando aparecer "Live" (bolinha verde), está no ar! 🎉

---

## 🔗 Obter a URL do Backend

Após o deploy finalizar:

1. No topo da página, você verá a URL do seu serviço:
   ```
   https://sinucabet-backend.onrender.com
   ```
   (O nome depende do que você escolheu)

2. **COPIE ESSA URL** - você vai precisar!

---

## 🧪 Testar o Backend

Teste se está funcionando:

```bash
# Substitua pela sua URL
curl https://sinucabet-backend.onrender.com/health

# Deve retornar:
# {"status":"ok","timestamp":"..."}
```

Ou abra no navegador:
```
https://sinucabet-backend.onrender.com/health
```

---

## 🔄 Atualizar o Frontend na Vercel

Agora atualize a URL da API no frontend:

1. Acesse: https://vercel.com/dashboard
2. Abra o projeto: **sinucabet**
3. Vá em **Settings** → **Environment Variables**
4. Encontre `NEXT_PUBLIC_API_URL`
5. Edite o valor para:
   ```
   https://sinucabet-backend.onrender.com/api
   ```
   ⚠️ **Importante:** Adicione `/api` no final!
6. Clique em **Save**
7. Vá em **Deployments** → Clique nos 3 pontinhos do último deploy → **Redeploy**

---

## ⚡ Deploy Automático

Configurado! Sempre que você fizer push para `main`:

✅ Render faz rebuild automático do backend  
✅ Vercel faz rebuild automático do frontend  

---

## 📊 Monitorar o Backend

No dashboard do Render:

- **Logs**: Ver logs em tempo real
- **Metrics**: CPU, memória, requisições
- **Shell**: Acesso ao terminal do container
- **Manual Deploy**: Forçar novo deploy

---

## 💰 Sobre o Plano Gratuito

**Incluído:**
- ✅ 750 horas/mês (suficiente para 1 serviço 24/7)
- ✅ SSL/HTTPS automático
- ✅ Deploy automático do GitHub
- ✅ 512 MB RAM
- ✅ CPU compartilhado

**Limitações:**
- ⚠️ Serviço "dorme" após 15 min de inatividade
- ⚠️ ~1 minuto para "acordar" na primeira requisição
- ⚠️ Não indicado para aplicações que precisam de resposta instantânea

**Como evitar o "sleep":**
- Use um serviço de ping (UptimeRobot, cron-job.org)
- Ou faça upgrade para plano pago ($7/mês)

---

## 🔧 Troubleshooting

### Build falhou?

1. Verifique os logs na aba "Logs"
2. Confirme que **Root Directory** = `backend`
3. Verifique se `package.json` tem o script `start`

### Erro 500 nas requisições?

1. Verifique os logs
2. Confirme que todas as variáveis estão configuradas
3. Teste as credenciais do Supabase

### Serviço muito lento?

- Normal na primeira requisição (acordando do sleep)
- Considere upgrade ou use serviço de ping

### CORS Error ainda?

1. Verifique se `FRONTEND_URL` está correto
2. Deve ser `https://sinucabet.vercel.app` (sem barra no final)

---

## 📝 Checklist Final

- [ ] Conta criada no Render
- [ ] Repositório conectado
- [ ] Root Directory = `backend`
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] JWT_SECRET gerado e configurado
- [ ] Deploy finalizado (status "Live")
- [ ] URL do backend copiada
- [ ] NEXT_PUBLIC_API_URL atualizado na Vercel
- [ ] Frontend redesployado
- [ ] Teste completo funcionando

---

## 🎉 Pronto!

Seu backend está rodando 24/7 no Render (gratuito)!

**Próximos passos:**
1. Configure um domínio personalizado (opcional)
2. Configure monitoramento com UptimeRobot
3. Configure alertas de erro

---

## 🆚 Render vs Railway

| Feature | Render (Free) | Railway (Free) |
|---------|---------------|----------------|
| Custo | $0/mês | $5 crédito (depois pago) |
| Limitações | Sleep após 15min | Só databases no free |
| SSL | ✅ Grátis | ✅ Grátis |
| Deploy Auto | ✅ Sim | ✅ Sim |
| Precisa Cartão | ❌ Não | ✅ Sim |

**Render é perfeito para começar!** 🚀

