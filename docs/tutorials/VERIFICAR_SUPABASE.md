# 🔍 VERIFICAÇÃO URGENTE - Supabase

## 🚨 ERRO IDENTIFICADO

```
AuthApiError: Database error checking email
Status: 500
Code: unexpected_failure
```

**Localização:** Dentro do `Supabase Auth` ao tentar criar usuário

---

## ✅ PASSOS PARA RESOLVER

### 1️⃣ Verificar Supabase Status

Acesse: **https://status.supabase.com**

Veja se há algum incidente ativo.

---

### 2️⃣ Verificar Variáveis no Render

No Render Dashboard → sinucabet-backend → Environment:

Confirme que estas variáveis existem e estão CORRETAS:

```env
SUPABASE_URL=https://[seu-projeto].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (chave COMPLETA)
SUPABASE_ANON_KEY=eyJ... (chave COMPLETA)
```

**⚠️ IMPORTANTE:**
- Use `SUPABASE_SERVICE_ROLE_KEY` (não a anon key!)
- A chave deve começar com `eyJ`
- A chave deve ter ~250+ caracteres

---

### 3️⃣ Pegar Chaves Corretas do Supabase

**Acesse:**
1. https://supabase.com/dashboard
2. Selecione seu projeto
3. **Settings** (ícone engrenagem) → **API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **service_role (secret)** → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public** → `SUPABASE_ANON_KEY`

---

### 4️⃣ Atualizar no Render

1. No Render: **Environment** tab
2. Clique em **Edit** em cada variável
3. Cole os valores corretos do Supabase
4. Clique **Save Changes**
5. O Render vai fazer **re-deploy automático**

---

### 5️⃣ Aguardar Re-Deploy

Após salvar as variáveis:
- ⏳ Render faz re-deploy (~2-3 min)
- ✅ Variáveis são aplicadas
- 🧪 Testar cadastro novamente

---

## 🧪 TESTAR SE AS CHAVES ESTÃO CORRETAS

Execute este comando no terminal:

```bash
# Substitua pelas suas chaves reais
SUPABASE_URL="https://seu-projeto.supabase.co"
SERVICE_KEY="eyJ..."

curl -X POST "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"senha123"}'
```

**Resultado esperado:**
- ✅ Se retornar JSON com `user`: Chaves estão OK
- ❌ Se retornar erro 401/403: Chaves erradas
- ❌ Se retornar erro 500: Problema no Supabase

---

## 📋 CHECKLIST

- [ ] Supabase Status está OK (sem incidentes)
- [ ] `SUPABASE_URL` está correta no Render
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está correta (~250 chars, começa com eyJ)
- [ ] `SUPABASE_ANON_KEY` está correta
- [ ] Re-deploy do Render completou
- [ ] Testei cadastro novamente

---

## ⚠️ PROBLEMA SECUNDÁRIO IDENTIFICADO

```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Solução:** Adicionar no `server.js`:

```javascript
// Após criar o app Express
app.set('trust proxy', 1);
```

Isso resolve o warning do rate-limit.

---

## 🎯 AÇÃO IMEDIATA

**O MAIS PROVÁVEL:** As chaves do Supabase no Render estão erradas ou incompletas.

**Faça agora:**
1. Pegue as chaves no Supabase Dashboard
2. Atualize no Render Environment
3. Aguarde re-deploy
4. Teste novamente

---

**Precisa de ajuda?** Me avise qual erro aparece ao verificar as chaves!

