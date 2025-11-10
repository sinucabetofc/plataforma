# 🚀 Deploy em Produção - SinucaBet

**Data**: 10/11/2025  
**Status**: ✅ Pronto para Deploy

---

## 📋 Pré-requisitos

### ✅ Checklist Antes do Deploy

- [x] Código testado localmente
- [x] Migrations do Supabase executadas
- [ ] Variáveis de ambiente configuradas
- [ ] Contas criadas (Vercel + Render)
- [ ] Domínios configurados (opcional)

---

## 🎯 Parte 1: Deploy do Backend (Render)

### Passo 1: Criar Conta no Render

1. Acesse: https://render.com
2. Crie uma conta (pode usar GitHub)
3. Conecte seu repositório GitHub

### Passo 2: Criar Web Service

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório do GitHub
3. Configure:
   - **Name**: `sinucabet-backend`
   - **Region**: `Oregon (US West)` (mais próximo do Brasil)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Passo 3: Configurar Variáveis de Ambiente

No Render, vá em **Environment** e adicione:

```bash
NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0anhteXJremN1bWlldWF5YXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjgxNTksImV4cCI6MjA3Nzg0NDE1OX0.zVHBA1mWH-jxRwK0TJYyVLdqj_aNNGFnsXQ8sdqC_Ss
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0anhteXJremN1bWlldWF5YXByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2ODE1OSwiZXhwIjoyMDc3ODQ0MTU5fQ.2U7ABS50PB6cU4imZxXfhb-JMKEg14PUNH5H0p7HPHM

# JWT
JWT_SECRET=[GERAR UMA CHAVE SEGURA]

# CORS
FRONTEND_URL=https://sinucabet.vercel.app

# Woovi PIX
WOOVI_APP_ID=[SUA_CHAVE_WOOVI]
WOOVI_API_URL=https://api.woovi.com/api/v1
```

**⚠️ IMPORTANTE**: Gere um JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Passo 4: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build (leva ~3-5 minutos)
3. Anote a URL gerada (ex: `https://sinucabet-backend.onrender.com`)

### Passo 5: Configurar Health Check

No Render:
- **Health Check Path**: `/api/health`
- Isso garante que o serviço seja reiniciado se cair

---

## 🎨 Parte 2: Deploy do Frontend (Vercel)

### Passo 1: Criar Conta na Vercel

1. Acesse: https://vercel.com
2. Crie uma conta (usar GitHub facilita)
3. Conecte seu repositório

### Passo 2: Importar Projeto

1. No dashboard, clique em **"Add New..."** → **"Project"**
2. Selecione seu repositório
3. Configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (detectado automaticamente)
   - **Output Directory**: `.next` (detectado automaticamente)

### Passo 3: Configurar Variáveis de Ambiente

Na Vercel, vá em **Settings** → **Environment Variables** e adicione:

```bash
NEXT_PUBLIC_API_URL=https://sinucabet-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0anhteXJremN1bWlldWF5YXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjgxNTksImV4cCI6MjA3Nzg0NDE1OX0.zVHBA1mWH-jxRwK0TJYyVLdqj_aNNGFnsXQ8sdqC_Ss
```

**⚠️ IMPORTANTE**: Substitua `https://sinucabet-backend.onrender.com` pela URL real do seu backend no Render!

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. Acesse a URL gerada (ex: `https://sinucabet.vercel.app`)

---

## 🗄️ Parte 3: Executar Migrations no Supabase

### ⚠️ CRÍTICO: Execute Todas as Migrations

Acesse: https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/editor

Execute **TODAS as migrations** em ordem:

#### Migration Crítica (EXECUTE PRIMEIRO):
```sql
-- 1033_fix_transactions_update_policy.sql
-- Corrige status dos depósitos
```

Copie e execute o arquivo: `backend/supabase/migrations/1033_fix_transactions_update_policy.sql`

#### Verificar Migrations Executadas:

```sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar RLS nas transactions
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'transactions';
```

---

## 🔧 Parte 4: Configurações Adicionais

### 1. Atualizar CORS no Backend

No arquivo `backend/server.js`, verifique se tem:

```javascript
const allowedOrigins = [
  'https://sinucabet.vercel.app',
  'http://localhost:3000',
];
```

### 2. Configurar Webhook da Woovi

No painel da Woovi, configure o webhook:

```
URL: https://sinucabet-backend.onrender.com/api/wallet/webhook/woovi
Método: POST
Eventos: OPENPIX:CHARGE_COMPLETED
```

### 3. Configurar Domínio Personalizado (Opcional)

**Na Vercel:**
1. Settings → Domains
2. Adicione seu domínio (ex: `sinucabet.com`)
3. Configure DNS conforme instruções

**No Render:**
1. Settings → Custom Domain
2. Adicione domínio da API (ex: `api.sinucabet.com`)
3. Configure DNS conforme instruções

---

## 🧪 Parte 5: Testes em Produção

### Checklist de Testes:

- [ ] **Frontend carrega**: Acessar `https://sinucabet.vercel.app`
- [ ] **Backend responde**: `https://seu-backend.onrender.com/api/health`
- [ ] **Login funciona**: Criar conta e fazer login
- [ ] **Depósito funciona**: Gerar QR Code PIX
- [ ] **Webhook funciona**: Pagar PIX e ver saldo atualizar
- [ ] **Apostas funcionam**: Criar e ver apostas
- [ ] **Painel admin funciona**: `/admin`
- [ ] **Painel parceiros funciona**: `/parceiros`

---

## 🆘 Problemas Comuns

### 1. "Rota não encontrada" em `/parceiros`

**Causa**: SSR tentando acessar localStorage  
**Solução**: Já corrigido no código (mounted check + getServerSideProps)

### 2. Backend não inicia no Render

**Causa**: Porta incorreta  
**Solução**: No `server.js`, use `process.env.PORT || 3001`

### 3. CORS bloqueando requests

**Solução**: Atualizar `allowedOrigins` com URL da Vercel

### 4. Webhook Woovi não funciona

**Solução**: 
1. Verificar URL do webhook na Woovi
2. Verificar logs no Render: **Logs** → filtrar por "webhook"
3. Executar migration `1033` para permitir UPDATE em transactions

### 5. Status do depósito não atualiza

**Solução**: Execute a migration `1033_fix_transactions_update_policy.sql` no Supabase

---

## 📊 Monitoramento

### Logs do Backend (Render)

```
Dashboard → Seu serviço → Logs
```

Filtros úteis:
- `CONFIRM_DEPOSIT` - Ver confirmações de depósito
- `ERROR` - Ver erros
- `webhook` - Ver chamadas do webhook

### Logs do Frontend (Vercel)

```
Dashboard → Seu projeto → Runtime Logs
```

### Analytics

```
Vercel → Analytics (gratuito no plano Hobby)
```

---

## 🎯 Comandos Úteis

### Atualizar Dependências (Cuidado!)

```bash
# Frontend
cd frontend
npm update @supabase/supabase-js axios recharts

# Backend  
cd backend
npm update @supabase/supabase-js axios
```

**⚠️ NÃO atualize**: `next`, `react`, `express`, `zod` (breaking changes)

### Testar Build Localmente

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
NODE_ENV=production npm start
```

---

## ✅ Deploy Checklist Final

### Backend (Render):
- [ ] Web Service criado
- [ ] Variáveis de ambiente configuradas
- [ ] Build completado com sucesso
- [ ] Health check respondendo
- [ ] Logs sem erros críticos

### Frontend (Vercel):
- [ ] Projeto importado
- [ ] Variáveis de ambiente configuradas
- [ ] Build completado com sucesso
- [ ] Rota `/parceiros` funcionando
- [ ] Todos os módulos carregando

### Supabase:
- [ ] Migration `1033` executada
- [ ] RLS configurado corretamente
- [ ] Tabelas criadas
- [ ] Políticas ativas

### Woovi:
- [ ] Webhook configurado
- [ ] URL correta do backend
- [ ] Evento `CHARGE_COMPLETED` ativo

---

## 🎉 Resultado Esperado

**URLs em Produção:**

- Frontend: `https://sinucabet.vercel.app`
- Backend: `https://sinucabet-backend.onrender.com`
- Admin: `https://sinucabet.vercel.app/admin`
- Parceiros: `https://sinucabet.vercel.app/parceiros`

**Funcionalidades:**

✅ Cadastro e login de usuários  
✅ Depósito via PIX (Woovi)  
✅ Apostas em séries  
✅ Casamento de apostas  
✅ Painel administrativo  
✅ Painel de parceiros/influencers  
✅ Sistema de carteira  
✅ Histórico de transações  

---

## 📞 Suporte

**Documentação Técnica:**
- `docs/` - Toda documentação do projeto
- `backend/docs/CORRECAO_STATUS_DEPOSITO.md` - Fix de depósitos
- `README.md` - Visão geral

**Logs em Tempo Real:**
```bash
# Render
Dashboard → Logs → Live tail

# Vercel  
Dashboard → Runtime Logs → Real-time
```

---

## 🔐 Segurança

### Depois do Deploy:

1. ✅ Mudar `JWT_SECRET` para valor seguro
2. ✅ Configurar HTTPS (automático na Vercel/Render)
3. ✅ Habilitar rate limiting (já configurado)
4. ✅ Revisar políticas RLS no Supabase
5. ✅ Configurar backup do banco (Supabase dashboard)

---

## 💡 Dicas de Otimização

### Performance:

1. **Vercel**: Automaticamente otimiza Next.js
2. **Render**: Considere upgrade para plan pago (não dorme)
3. **Supabase**: Configure índices (já feito nas migrations)

### Custos:

- **Vercel**: Grátis até 100GB bandwidth/mês
- **Render**: Grátis mas dorme após 15min inatividade
- **Supabase**: Grátis até 500MB storage

### Monitoramento:

- **Vercel Analytics**: Grátis
- **Render Metrics**: Grátis (CPU, Memória)
- **Supabase Logs**: 7 dias grátis

---

## 🚨 Problemas Conhecidos e Soluções

### 1. Render Free Tier dorme após 15min

**Sintoma**: Primeiro acesso lento (~30s)  
**Solução**: 
- Upgrade para plan pago ($7/mês)
- OU configurar ping automático (não recomendado)

### 2. Vercel Timeout em builds

**Sintoma**: Build falha por timeout  
**Solução**: 
```bash
cd frontend
rm -rf .next node_modules
npm install
```

### 3. CORS bloqueando requests

**Sintoma**: Erro "CORS policy" no console  
**Solução**: Adicionar URL da Vercel no `allowedOrigins`

---

## 📈 Próximos Passos Pós-Deploy

1. **Monitorar logs** nas primeiras 24h
2. **Fazer testes completos** de todas funcionalidades
3. **Configurar backup automático** do Supabase
4. **Adicionar analytics** (Google Analytics, Mixpanel, etc)
5. **Configurar alertas** de erro (Sentry, LogRocket)
6. **Documentar URLs** de produção no README

---

## 🎯 URLs Importantes

| Serviço | URL |
|---------|-----|
| **Frontend** | https://sinucabet.vercel.app |
| **Backend** | https://sinucabet-backend.onrender.com |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr |
| **Render Dashboard** | https://dashboard.render.com |
| **Vercel Dashboard** | https://vercel.com/dashboard |

---

Boa sorte com o deploy! 🚀

