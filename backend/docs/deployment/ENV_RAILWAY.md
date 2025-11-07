# 🔐 Variáveis de Ambiente - Railway

## 📋 Copie e Cole na Railway

Vá em **Variables** no seu projeto Railway e adicione:

### Obrigatórias:

```
PORT=3001
NODE_ENV=production
```

### JWT (IMPORTANTE - Gere uma chave segura):

```bash
# Execute este comando no terminal para gerar:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Depois adicione:
```
JWT_SECRET=cole_a_chave_gerada_aqui
```

### Supabase:

```
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

### CORS:

```
FRONTEND_URL=https://plataforma-hazel.vercel.app
```

---

## 🔍 Onde encontrar as chaves do Supabase?

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantenha secreta!)

---

## ✅ Checklist:

- [ ] PORT definida
- [ ] NODE_ENV=production
- [ ] JWT_SECRET gerado com crypto (64+ caracteres)
- [ ] SUPABASE_URL configurado
- [ ] SUPABASE_ANON_KEY configurado
- [ ] SUPABASE_SERVICE_ROLE_KEY configurado
- [ ] FRONTEND_URL com URL da Vercel

---

## ⚠️ Segurança:

- ✅ Nunca compartilhe `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Gere `JWT_SECRET` único e forte
- ✅ Use HTTPS em produção (Railway faz automaticamente)



