# 🔧 Troubleshooting: Erro 401 em Rotas de Parceiros

## 🔍 Problema
Ao acessar rotas do painel de parceiros (como `/api/influencers/matches/:id`), retorna erro **401 (Unauthorized)**.

---

## ✅ Correções Aplicadas

### Commits:
- **`f93cc0f9`** - Corrigiu `influencer-withdrawals.routes.js`
- **`d877b1c6`** - Corrigiu `admin-withdrawals.routes.js`

Ambos estavam importando de `../middleware/auth.middleware` (sem 's'), quando o correto é `../middlewares/auth.middleware` (com 's').

---

## 🚀 Como Resolver

### 1️⃣ **Aguarde o Deploy Automático**

O Render demora alguns minutos para fazer o deploy. Aguarde até ver:
- ✅ **Build succeeded** no dashboard do Render
- ✅ **Live** (a bolinha verde) no status do serviço

**Dashboard do Render:**
```
https://dashboard.render.com/
```

---

### 2️⃣ **Limpe o LocalStorage e Faça Novo Login**

O token antigo pode estar inválido. Faça isso:

#### No Navegador (Chrome/Edge/Firefox):

1. Abra o **DevTools** (F12)
2. Vá em **Application** → **LocalStorage**
3. Selecione `https://plataforma-hazel.vercel.app`
4. **Delete** a entrada `influencer-store` (ou clear all)
5. **Recarregue a página** (F5)
6. **Faça login novamente** em `/parceiros/login`

#### Ou via Console:
```javascript
localStorage.removeItem('influencer-store');
location.reload();
```

---

### 3️⃣ **Verifique se o Token Está Sendo Enviado**

No **DevTools → Network**:

1. Acesse `/parceiros/jogos/{id}`
2. Encontre a requisição: `GET /api/influencers/matches/{id}`
3. Clique nela
4. Vá em **Headers**
5. Procure por: `Authorization: Bearer {token}`

#### ✅ Se o token ESTÁ lá:
- O problema é no backend (aguarde o deploy)

#### ❌ Se o token NÃO está:
- Limpe localStorage e faça login novamente
- Verifique se o `influencerStore` está persistindo o token

---

### 4️⃣ **Teste Direto no Backend**

Para confirmar que o backend está atualizado, teste direto:

```bash
# Obter token fazendo login
curl -X POST https://sinucabet-backend.onrender.com/api/influencers/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@exemplo.com","password":"sua-senha"}'

# Vai retornar algo como:
# {"success":true,"data":{"token":"eyJhbGc..."}}

# Copie o token e teste a rota protegida:
curl -X GET https://sinucabet-backend.onrender.com/api/influencers/dashboard \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Se retornar 200 ✅ = Backend está funcionando
# Se retornar 401 ❌ = Aguarde o deploy ou há outro problema
```

---

### 5️⃣ **Verifique os Logs do Backend**

No Render Dashboard:
1. Vá em **Logs**
2. Filtre por: `INFLUENCER AUTH`
3. Procure por:
   - ✅ `✅ [INFLUENCER AUTH] Token válido`
   - ❌ `❌ [INFLUENCER AUTH] Token inválido`
   - ❌ `❌ [INFLUENCER AUTH] Erro ao buscar influencer`

---

## 🔐 Como a Autenticação Funciona

### Fluxo Normal:
```
1. Usuário faz login em /parceiros/login
2. Backend retorna JWT token
3. Frontend salva em localStorage (influencer-store)
4. Em cada requisição, token é enviado no header:
   Authorization: Bearer {token}
5. Middleware authenticateInfluencer valida o token
6. Se válido: continua
7. Se inválido: retorna 401
```

### Arquivo Responsável:
```
backend/middlewares/influencer-auth.middleware.js
```

---

## 📋 Checklist de Verificação

- [ ] Deploy do Render concluído (status: Live)
- [ ] LocalStorage limpo
- [ ] Novo login realizado
- [ ] Token aparece no header das requisições
- [ ] Teste direto no backend retorna 200
- [ ] Logs do backend mostram token válido

---

## 🆘 Se Nada Funcionar

### Última opção:

1. **Force um restart do backend no Render:**
   - Dashboard → Settings → Manual Deploy → "Clear build cache & deploy"

2. **Limpe completamente o navegador:**
   - Ctrl + Shift + Delete
   - Limpar tudo (cache, cookies, localStorage)

3. **Tente em uma aba anônima:**
   - Para garantir que não há cache

4. **Verifique as variáveis de ambiente no Render:**
   - `JWT_SECRET` deve estar configurada
   - Deve ser a mesma usada para gerar os tokens

---

## 🎯 Resumo

**Problema:** Erro 401 ao acessar rotas de parceiros  
**Causa:** Import incorreto do middleware  
**Solução:** Commits `f93cc0f9` e `d877b1c6`  
**Ação Necessária:** 
1. Aguardar deploy do Render
2. Limpar localStorage e fazer novo login

---

**Última atualização:** 10/11/2025  
**Status:** ✅ Correções aplicadas e commitadas

