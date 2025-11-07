# 🚀 Deploy na Vercel - SinucaBet

## ⚙️ Configuração no Dashboard da Vercel

### 1. Configurações do Projeto

Acesse: **Project Settings** → **General**

- **Framework Preset**: `Next.js`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (padrão)
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install` (padrão)

### 2. Variáveis de Ambiente

Acesse: **Project Settings** → **Environment Variables**

Adicione as seguintes variáveis:

```env
NEXT_PUBLIC_API_URL=https://seu-backend-url.com/api
NEXT_PUBLIC_SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-supabase-anon-key
```

**Importante:** 
- Use as variáveis do seu arquivo `.env` local
- Para `NEXT_PUBLIC_API_URL`, você pode:
  - Hospedar o backend em outro lugar (Railway, Render, etc.)
  - Ou usar Serverless Functions na Vercel (requer adaptação)

### 3. Redesploy

Após configurar:

1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Marque **Use existing Build Cache** (opcional)
5. Clique em **Redeploy**

## 🔄 Deploy Automático

Agora, sempre que você fizer push para a branch `main`, a Vercel vai:
- Detectar as mudanças
- Construir a aplicação automaticamente
- Fazer deploy da nova versão

## 🌐 URL de Produção

Sua aplicação estará disponível em:
- **URL Atual**: https://plataforma-hazel.vercel.app
- **URL Personalizada**: Configure um domínio customizado em **Domains**

## ⚠️ Importante sobre o Backend

O backend **NÃO está hospedado** na Vercel. Você precisa:

1. **Hospedar o backend separadamente**:
   - Railway (recomendado para Node.js)
   - Render
   - DigitalOcean
   - Heroku
   - AWS/Google Cloud

2. **Atualizar a variável** `NEXT_PUBLIC_API_URL` com a URL do backend

## 🧪 Testando Localmente

Antes de fazer deploy, teste localmente:

```bash
cd frontend
npm install
npm run build
npm start
```

## 📝 Checklist de Deploy

- [ ] Root Directory configurado como `frontend`
- [ ] Variáveis de ambiente adicionadas
- [ ] Backend hospedado e acessível
- [ ] NEXT_PUBLIC_API_URL atualizado
- [ ] Teste da aplicação em produção
- [ ] Domínio personalizado configurado (opcional)

## 🐛 Troubleshooting

### Erro 404

Se ainda aparecer 404:
1. Confirme que o Root Directory está como `frontend`
2. Force um novo deploy
3. Limpe o cache de build

### Erro de Build

Verifique:
1. Logs do build na Vercel
2. Se todas as dependências estão no `package.json`
3. Se as variáveis de ambiente estão corretas

### API não responde

1. Verifique se o backend está rodando
2. Teste a URL do backend diretamente
3. Verifique CORS no backend
4. Confirme que `NEXT_PUBLIC_API_URL` está correto



