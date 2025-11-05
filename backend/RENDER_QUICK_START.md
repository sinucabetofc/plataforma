# ⚡ Render.com - Guia Ultra Rápido

## 🎯 Em 5 Minutos

### 1. Criar Conta
👉 https://render.com/ → **"Sign up with GitHub"**

### 2. Novo Web Service
Dashboard → **"New +"** → **"Web Service"** → Conectar `sinucabetofc/plataforma`

### 3. Configuração Básica

```
Name: sinucabet-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend    👈 IMPORTANTE!
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

### 4. Variáveis de Ambiente

**Gere JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Adicione as variáveis:**
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=cole_a_chave_gerada_acima
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
FRONTEND_URL=https://sinucabet.vercel.app
```

### 5. Deploy!
Clique em **"Create Web Service"** → Aguarde 3-5 min

---

## ✅ Depois do Deploy

### Copie a URL:
```
https://seu-servico.onrender.com
```

### Atualize no Frontend (Vercel):
```
NEXT_PUBLIC_API_URL=https://seu-servico.onrender.com/api
```

### Teste:
```bash
curl https://seu-servico.onrender.com/health
```

---

## 🎉 Pronto!

Backend rodando grátis 24/7! 🚀

**⚠️ Lembre-se:** Primeira requisição após 15min pode demorar ~1min (plano free).

---

📚 **Guia Completo:** Veja `RENDER_DEPLOY.md`

