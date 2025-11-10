# 🔧 Correção: Normalização do API_URL

## 📋 Problema Identificado

Em produção, as rotas da API estavam sendo chamadas **sem o prefixo `/api`**, resultando em erros 404:

```
❌ GET https://sinucabet-backend.onrender.com/auth/profile (404)
❌ GET https://sinucabet-backend.onrender.com/matches (404)
❌ GET https://sinucabet-backend.onrender.com/wallet (404)
```

Quando deveriam ser:

```
✅ GET https://sinucabet-backend.onrender.com/api/auth/profile
✅ GET https://sinucabet-backend.onrender.com/api/matches
✅ GET https://sinucabet-backend.onrender.com/api/wallet
```

---

## 🔍 Causa Raiz

O problema era a **inconsistência** em como diferentes arquivos lidavam com a variável de ambiente `NEXT_PUBLIC_API_URL`:

### Antes da correção:
- **`api.js`**: Esperava que `NEXT_PUBLIC_API_URL` JÁ incluísse `/api`
- **`influencerStore.js`**: REMOVIA `/api` do final e depois adicionava manualmente
- **`useInfluencerMatches.js`**: Mesma lógica do `influencerStore.js`

Isso causava:
- ✅ Funcionava em **localhost** (porque o fallback tinha `/api`: `http://localhost:3001/api`)
- ❌ Quebrava em **produção** (porque `NEXT_PUBLIC_API_URL` era configurado como `https://sinucabet-backend.onrender.com`)

---

## ✅ Solução Implementada

Criamos uma função **`getApiBaseUrl()`** que **normaliza** a URL base em todos os arquivos:

```javascript
// Normalizar API_URL para garantir que termina com /api
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // Se já termina com /api, retorna como está
  if (baseUrl.endsWith('/api')) {
    return baseUrl;
  }
  // Se não, adiciona /api no final
  return `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();
```

### Arquivos modificados:
1. ✅ `frontend/utils/api.js`
2. ✅ `frontend/store/influencerStore.js`
3. ✅ `frontend/hooks/useInfluencerMatches.js`

---

## 📝 Configuração do Vercel

### ⚠️ IMPORTANTE: Configure `NEXT_PUBLIC_API_URL` **SEM** `/api` no final

No painel do Vercel, configure assim:

```bash
NEXT_PUBLIC_API_URL=https://sinucabet-backend.onrender.com
```

**❌ NÃO FAÇA ISSO:**
```bash
NEXT_PUBLIC_API_URL=https://sinucabet-backend.onrender.com/api
```

### Por quê?
Porque o código agora **adiciona automaticamente** o `/api` se não existir. Isso garante:
- ✅ Funciona se você colocar **com** ou **sem** `/api`
- ✅ Evita duplicações (`/api/api`)
- ✅ Consistência entre todos os arquivos

---

## 🧪 Como Testar Localmente

1. **Limpe o cache do Next.js:**
```bash
cd frontend
rm -rf .next node_modules/.cache
```

2. **Reinicie o servidor:**
```bash
npm run dev
```

**OU** use o script criado:
```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet
./REINICIAR_FRONTEND.sh
```

3. **Verifique no console do navegador:**
   - Abra DevTools → Network
   - As rotas devem aparecer como: `http://localhost:3001/api/matches` ✅

---

## 🚀 Deploy no Vercel

Após o push para o GitHub:

1. **Vercel detectará as mudanças automaticamente**
2. **Aguarde o build concluir**
3. **Teste as rotas:**
   - `/partidas` → Deve carregar as partidas ✅
   - `/wallet` → Deve carregar a carteira ✅
   - `/parceiros` → Dashboard de parceiros ✅

---

## 📊 Resultados Esperados

### Antes (❌ Com erro):
```
GET https://sinucabet-backend.onrender.com/wallet 404
GET https://sinucabet-backend.onrender.com/matches 404
```

### Depois (✅ Funcionando):
```
GET https://sinucabet-backend.onrender.com/api/wallet 200
GET https://sinucabet-backend.onrender.com/api/matches 200
```

---

## 🎯 Commit da Correção

```
fix: normalizar API_URL em todos os arquivos para evitar /api duplicado

- Modificado api.js, influencerStore.js e useInfluencerMatches.js
- getApiBaseUrl() garante que URL sempre termine com /api
- Remove /api duplicado de todas as rotas
- Adiciona script REINICIAR_FRONTEND.sh para limpar cache

Isso corrige os erros 404 em produção onde rotas eram chamadas sem /api
```

**Commit hash:** `0ce9271b`

---

## 📚 Referências

- **Frontend:** `/frontend/utils/api.js` (linha 8-19)
- **Influencer Store:** `/frontend/store/influencerStore.js` (linha 5-16)
- **Influencer Hooks:** `/frontend/hooks/useInfluencerMatches.js` (linha 5-16)
- **Script de reinicialização:** `/REINICIAR_FRONTEND.sh`

