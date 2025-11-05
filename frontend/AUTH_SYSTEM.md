# 🔐 Sistema de Autenticação - SinucaBet

## 📋 Visão Geral

Sistema de autenticação robusto com JWT (JSON Web Tokens) que persiste corretamente entre recarregamentos de página e lida adequadamente com erros de rede.

---

## ✅ Correções Implementadas

### 1. **Backend - Middleware de Autenticação**

**Problema:** O JWT era gerado com `user_id` mas o middleware buscava `id`, causando falhas na autenticação.

**Solução:** Corrigido para usar `decoded.user_id` em ambas as funções (`authenticateToken` e `optionalAuth`).

```javascript
// backend/middlewares/auth.middleware.js
req.user = {
  id: decoded.user_id, // ✅ Corrigido
  email: decoded.email
};
```

---

### 2. **Frontend - Interceptores Axios**

**Problema:** O interceptor limpava a autenticação em **qualquer** erro 401, incluindo erros de rede temporários.

**Solução:** 
- Verifica se é realmente um erro de token inválido
- Não limpa autenticação em erros de rede
- Evita loops de redirecionamento

```javascript
// frontend/utils/api.js
if (error.response?.status === 401) {
  const errorMessage = error.response?.data?.message || '';
  
  // Apenas limpa auth se for erro de token do servidor
  if (
    errorMessage.includes('Token') || 
    errorMessage.includes('autenticação') ||
    errorMessage.includes('Unauthorized')
  ) {
    clearAuth();
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
}
```

---

### 3. **Frontend - AuthContext**

**Problema:** O `loadUser` limpava a autenticação ao menor erro, fazendo logout automático ao atualizar a página.

**Solução:**
- Carrega usuário do cache primeiro (UX instantâneo)
- Valida token em background
- Mantém usuário logado em erros de rede
- Apenas faz logout em erro 401 confirmado

```javascript
// frontend/contexts/AuthContext.js

// ✅ Carrega do cache primeiro
if (savedUser) {
  setUser(savedUser);
  setLoading(false);
  setInitialized(true);
}

// ✅ Valida em background
const result = await getProfile();

if (result.success) {
  // Atualiza com dados frescos
  setUser(userData);
  saveAuth(token, userData);
} else if (result.statusCode === 401) {
  // Apenas limpa em 401 confirmado
  setUser(null);
  clearAuth();
} else if (result.isNetworkError) {
  // Mantém usuário em erro de rede
  console.warn('Erro de rede, mantendo usuário logado');
}
```

---

## 🔄 Fluxo de Autenticação

### Login
```
1. Usuário preenche credenciais
2. POST /api/auth/login
3. Backend valida e retorna { token, user, wallet }
4. Frontend salva em cookies (js-cookie)
5. AuthContext atualiza estado global
6. Redirecionamento automático
```

### Verificação ao Carregar Página
```
1. AuthContext inicializa
2. Verifica cookies (token + user)
3. Se existe:
   a. Carrega usuário do cache (IMEDIATO)
   b. Valida token no backend (BACKGROUND)
   c. Se válido: atualiza dados
   d. Se inválido (401): faz logout
   e. Se erro de rede: MANTÉM login
4. Se não existe:
   a. Mantém como não autenticado
```

### Requisições Autenticadas
```
1. Interceptor adiciona: Authorization: Bearer {token}
2. Se 401 + mensagem de token inválido:
   a. Limpa autenticação
   b. Redireciona para /
3. Se erro de rede:
   a. Retorna erro ao usuário
   b. MANTÉM autenticação
```

---

## 🛡️ Segurança

### Cookies (js-cookie)
```javascript
const COOKIE_OPTIONS = {
  expires: 7,           // 7 dias
  secure: production,   // HTTPS em produção
  sameSite: 'strict',   // Proteção CSRF
  path: '/',            // Disponível em todo site
};
```

### JWT (Backend)
```javascript
{
  expiresIn: '24h',
  issuer: 'sinucabet-api',
  audience: 'sinucabet-users'
}
```

---

## 📦 Estrutura de Arquivos

```
frontend/
├── contexts/
│   └── AuthContext.js       # Estado global de autenticação
├── utils/
│   ├── auth.js              # Funções de persistência (cookies)
│   └── api.js               # Configuração Axios + interceptores
└── components/
    └── AuthModal.js         # Modal de login/cadastro

backend/
├── middlewares/
│   └── auth.middleware.js   # Validação JWT
├── utils/
│   └── jwt.util.js          # Geração/verificação JWT
└── services/
    └── auth.service.js      # Lógica de autenticação
```

---

## 🔧 Funções Principais

### Frontend - auth.js
```javascript
saveToken(token)      // Salva token nos cookies
getToken()            // Recupera token dos cookies
removeToken()         // Remove token

saveUser(user)        // Salva usuário nos cookies
getUser()             // Recupera usuário dos cookies
removeUser()          // Remove usuário

isAuthenticated()     // Verifica se está autenticado
clearAuth()           // Limpa tudo
doLogin(token, user)  // Salva token + user
doLogout()            // Limpa e redireciona
```

### Frontend - AuthContext
```javascript
// Estado
user                  // Dados do usuário
loading               // Carregando?
authenticated         // Boolean

// Funções
login(token, user)    // Fazer login
logout()              // Fazer logout
updateUser(user)      // Atualizar dados
refreshUser()         // Recarregar do backend
```

---

## 🐛 Tratamento de Erros

### Erros de Rede
```javascript
{
  success: false,
  message: 'Erro de conexão com o servidor. Verifique sua internet.',
  isNetworkError: true
}
```

**Comportamento:** Mantém usuário logado, exibe mensagem de erro.

---

### Erros 401 (Não Autorizado)
```javascript
{
  success: false,
  message: 'Token inválido ou expirado',
  statusCode: 401
}
```

**Comportamento:** Faz logout automático, redireciona para home.

---

### Erros 400/409/500
```javascript
{
  success: false,
  message: 'Mensagem específica do erro',
  errors: [...],
  statusCode: XXX
}
```

**Comportamento:** Exibe erro ao usuário, mantém estado de autenticação.

---

## 🚀 Como Testar

### 1. Login Persistente
```bash
1. Faça login
2. Atualize a página (F5)
✅ RESULTADO: Deve permanecer logado
```

### 2. Erro de Rede
```bash
1. Faça login
2. Desligue o backend
3. Atualize a página
✅ RESULTADO: Deve permanecer logado (dados em cache)
4. Tente fazer uma requisição
✅ RESULTADO: Erro de rede, mantém login
```

### 3. Token Expirado
```bash
1. Faça login
2. No backend, altere JWT_EXPIRES_IN para '1s'
3. Aguarde 2 segundos
4. Faça uma requisição autenticada
✅ RESULTADO: Logout automático + redirecionamento
```

### 4. Token Inválido
```bash
1. Faça login
2. No console: Cookies.set('sinucabet_token', 'token_invalido')
3. Atualize a página
✅ RESULTADO: Logout automático
```

---

## 📝 Variáveis de Ambiente

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h
```

---

## 🔒 Boas Práticas Implementadas

✅ **Persistência em Cookies** (mais seguro que localStorage)  
✅ **Validação em background** (não bloqueia UI)  
✅ **Cache-first** (UX instantâneo)  
✅ **Tratamento robusto de erros** (distingue rede vs auth)  
✅ **Evita loops de redirecionamento**  
✅ **Não faz logout em erros temporários**  
✅ **HTTPOnly ready** (pode migrar para cookies HTTP-only)  
✅ **CSRF Protection** (sameSite: strict)  
✅ **Expiration configurável**  

---

## 🎯 Próximas Melhorias (Opcional)

1. **Refresh Token** - Renovar token automaticamente
2. **HTTP-Only Cookies** - Maior segurança (requer mudança no backend)
3. **2FA** - Autenticação de dois fatores
4. **Session Management** - Gerenciar múltiplas sessões
5. **Rate Limiting** - Proteção contra força bruta

---

## 📚 Referências

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

**✨ Sistema de Autenticação Robusto e Testado**

Versão: 2.0  
Data: Novembro 2025  
Autor: SinucaBet Dev Team



