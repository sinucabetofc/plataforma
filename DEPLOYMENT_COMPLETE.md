# ✅ SinucaBet - Deploy Completo

## 🎉 Status Atual (05/11/2025 - 19:35)

### ✅ Frontend (Vercel)
- **URL Produção:** https://sinuca-bet.vercel.app/
- **Status:** ✅ ONLINE e funcionando
- **Plano:** Free
- **Root Directory:** `frontend`
- **Framework:** Next.js 14.2.33
- **Deploy Automático:** Ativado (branch `main`)

### ✅ Backend (Render.com)
- **URL API:** https://sinucabet-backend.onrender.com
- **Status:** ✅ ONLINE e funcionando
- **Plano:** Free
- **Runtime:** Node.js
- **Health Check:** `https://sinucabet-backend.onrender.com/health`
- **Deploy Automático:** Ativado (branch `main`)

### ✅ Repositório GitHub
- **URL:** https://github.com/sinucabetofc/plataforma
- **Branch:** `main`
- **Commits:** Atualizados

---

## 📝 Último Passo Pendente

### ⚠️ Configurar URL da API no Frontend

**Na Vercel Dashboard:**

1. Acesse: https://vercel.com/dashboard
2. Abra o projeto: **sinuca-bet**
3. Vá em: **Settings** → **Environment Variables**
4. Edite/Adicione: `NEXT_PUBLIC_API_URL`
5. **Valor correto:**
   ```
   https://sinucabet-backend.onrender.com/api
   ```
   ⚠️ **IMPORTANTE:** Termine com `/api`

6. **Save** e depois **Redeploy** em "Deployments"

---

## 🧪 Como Testar Depois do Redeploy

### 1. Teste Manual no Navegador

Acesse: **https://sinuca-bet.vercel.app/home**

**Você deve ver:**
- ✅ Interface carregando
- ✅ **Partidas aparecendo na tela**
- ✅ Jogadores: "Luciano Covas vs Ângelo Grego"
- ✅ Jogadores: "Baianinho de Mauá vs Rui Chapéu"

### 2. Verificar Console (F12)

Abra o DevTools (F12) e verifique:
- ❌ **Não deve ter** erros 404
- ✅ Requisições para `https://sinucabet-backend.onrender.com/api/...` com status 200

---

## 🔧 Variáveis de Ambiente

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://sinucabet-backend.onrender.com/api
NEXT_PUBLIC_SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key
```

### Backend (Render)

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=sua-chave-jwt-gerada
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
FRONTEND_URL=https://sinuca-bet.vercel.app
```

---

## 📊 Arquitetura Atual

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIO FINAL                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Frontend (Vercel)     │
         │  sinuca-bet.vercel.app │
         │  - Next.js             │
         │  - React               │
         │  - TailwindCSS         │
         └───────────┬────────────┘
                     │
                     │ HTTPS
                     │
                     ▼
      ┌──────────────────────────────┐
      │  Backend (Render.com)        │
      │  sinucabet-backend           │
      │  - Node.js + Express         │
      │  - API REST                  │
      └──────────────┬───────────────┘
                     │
                     │ PostgreSQL
                     │
                     ▼
           ┌─────────────────┐
           │  Supabase DB    │
           │  - PostgreSQL   │
           │  - Auth         │
           │  - Storage      │
           └─────────────────┘
```

---

## ⚠️ Limitações do Plano Free

### Vercel (Frontend)
- ✅ Deploy ilimitado
- ✅ HTTPS automático
- ✅ CDN global
- ⚠️ Limite de banda larga: 100GB/mês

### Render (Backend)
- ✅ 750 horas/mês (suficiente para 24/7)
- ✅ HTTPS automático
- ⚠️ **"Dorme" após 15min de inatividade**
- ⚠️ Primeira requisição após dormir: ~50s para acordar
- ⚠️ 512MB RAM

**Solução para o "sleep":**
- Upgrade para plano pago ($7/mês)
- Ou use serviço de ping (UptimeRobot, cron-job.org)

---

## 🚀 Deploy Automático Configurado

### Como Funciona:

1. Você faz alterações no código
2. Faz commit: `git commit -m "Sua mensagem"`
3. Faz push: `git push`
4. **Automático:**
   - ✅ Vercel detecta e faz rebuild do frontend
   - ✅ Render detecta e faz rebuild do backend

**Tempo total:** 3-5 minutos

---

## 📚 Documentação Criada

Arquivos de referência no repositório:

- `RAILWAY_DEPLOY.md` - Deploy alternativo (não usado)
- `RENDER_DEPLOY.md` - Guia completo Render ✅
- `VERCEL_DEPLOY.md` - Guia completo Vercel ✅
- `backend/RENDER_QUICK_START.md` - Guia rápido
- `backend/ENV_RAILWAY.md` - Variáveis (Railway)
- `render.yaml` - Configuração automática Render

---

## 🔗 Links Úteis

### Dashboards
- **Vercel:** https://vercel.com/dashboard
- **Render:** https://dashboard.render.com
- **Supabase:** https://supabase.com/dashboard
- **GitHub:** https://github.com/sinucabetofc/plataforma

### URLs da Aplicação
- **Frontend:** https://sinuca-bet.vercel.app
- **Backend API:** https://sinucabet-backend.onrender.com/api
- **Health Check:** https://sinucabet-backend.onrender.com/health

---

## 🎯 Próximos Passos Recomendados

### Imediato (Hoje)
- [ ] Configurar `NEXT_PUBLIC_API_URL` na Vercel
- [ ] Fazer Redeploy
- [ ] Testar aplicação completa

### Curto Prazo (Esta Semana)
- [ ] Configurar domínio personalizado
- [ ] Adicionar Google Analytics
- [ ] Configurar monitoramento de erros (Sentry)

### Médio Prazo (Este Mês)
- [ ] Configurar UptimeRobot para evitar backend dormir
- [ ] Adicionar mais testes automatizados
- [ ] Implementar CI/CD avançado

### Longo Prazo (Próximos Meses)
- [ ] Considerar upgrade de planos conforme crescimento
- [ ] Otimizar performance
- [ ] Implementar cache Redis

---

## 🐛 Troubleshooting Comum

### Frontend retorna 404
- ✅ Verificar Root Directory = `frontend`
- ✅ Verificar se não há `vercel.json` conflitante

### Backend retorna 404
- ✅ Verificar se URL termina com `/api`
- ✅ Verificar se backend está "acordado"

### CORS Error
- ✅ Verificar `FRONTEND_URL` no Render
- ✅ Verificar se backend está aceitando a origem

### Backend lento
- ✅ Normal na primeira requisição (acordando)
- ✅ Considere upgrade ou serviço de ping

---

## 📞 Suporte

**Se precisar de ajuda:**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs

---

## ✅ Checklist Final

- [x] Repositório no GitHub
- [x] Frontend na Vercel
- [x] Backend no Render
- [x] Banco de dados no Supabase
- [x] Root Directory configurado
- [x] Variáveis de ambiente (Backend)
- [ ] **NEXT_PUBLIC_API_URL configurado** ⚠️
- [ ] Redeploy frontend
- [ ] Teste completo da aplicação

---

**Última atualização:** 05/11/2025 às 19:35  
**Status:** Aguardando configuração final da URL da API na Vercel

🚀 **Você está a 1 passo de ter tudo funcionando!**

