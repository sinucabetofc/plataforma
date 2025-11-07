# 🔧 Troubleshooting - Erro "Usuário não encontrado" na Página de Perfil

## 🐛 Problema

Ao acessar `/profile`, a API retorna:
```
Erro: "Usuário não encontrado"
```

Mesmo com o usuário logado (header mostra dados corretamente).

---

## ✅ Verificações Já Realizadas

### 1. Rotas ✅
- ✅ `GET /api/auth/profile` existe em `auth.routes.js` (linha 65)
- ✅ Middleware `authenticateToken` está aplicado
- ✅ Controller `getProfile` está implementado (linha 126)

### 2. Controller ✅
- ✅ Método `getProfile` existe
- ✅ Extrai `userId` de `req.user.id`
- ✅ Chama `authService.getProfile(userId)`
- ✅ Trata erro `NOT_FOUND` corretamente

### 3. Service ✅
- ✅ Método `getProfile` existe (linha 279)
- ✅ Busca usuário no Supabase
- ✅ Retorna erro `NOT_FOUND` se não encontrar

### 4. Middleware ✅
- ✅ Foi CORRIGIDO para usar `decoded.user_id`
- ✅ Seta `req.user.id` corretamente
- ✅ Verifica token JWT

---

## 🔍 Possíveis Causas

### 1. **ID do Usuário Incorreto** ⚠️
O middleware pode estar setando um ID que não existe no banco.

**Como Verificar:**
```javascript
// Adicionar log temporário no controller (linha 128)
async getProfile(req, res) {
  try {
    const userId = req.user.id;
    console.log('🔍 DEBUG - User ID recebido:', userId);
    console.log('🔍 DEBUG - req.user completo:', req.user);
    // ...
  }
}
```

### 2. **Usuário Não Foi Criado no Supabase** ⚠️
O cadastro pode ter falhado silenciosamente.

**Como Verificar:**
1. Acessar Supabase Dashboard
2. Ir para Table Editor > users
3. Buscar pelo email: `joao.teste@sinucabet.com`
4. Verificar se o usuário existe

### 3. **Campo ID com Nome Diferente** ⚠️
A tabela pode usar `user_id` em vez de `id`.

**Como Verificar:**
```sql
-- No Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### 4. **Problema de Cache no Frontend** ⚠️
O ID salvo nos cookies pode estar incorreto.

**Como Verificar:**
```javascript
// No Console do Browser (F12)
import Cookies from 'js-cookie';
console.log('Token:', Cookies.get('sinucabet_token'));
console.log('User:', Cookies.get('sinucabet_user'));
```

---

## 🛠️ Soluções Propostas

### Solução 1: Adicionar Logs de Debug

```javascript
// backend/controllers/auth.controller.js
async getProfile(req, res) {
  try {
    const userId = req.user.id;
    
    console.log('=== DEBUG GET PROFILE ===');
    console.log('req.user:', req.user);
    console.log('userId:', userId);
    console.log('=========================');
    
    const result = await authService.getProfile(userId);
    return successResponse(res, 200, 'Perfil obtido com sucesso', result);
  } catch (error) {
    console.error('❌ ERRO getProfile:', error);
    // ...
  }
}
```

```javascript
// backend/services/auth.service.js
async getProfile(userId) {
  try {
    console.log('=== DEBUG SERVICE getProfile ===');
    console.log('Buscando usuário com ID:', userId);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, created_at')
      .eq('id', userId)
      .single();
    
    console.log('Resultado Supabase:', { user, error });
    console.log('================================');
    
    if (error || !user) {
      throw {
        code: 'NOT_FOUND',
        message: 'Usuário não encontrado'
      };
    }
    
    return user;
  } catch (error) {
    // ...
  }
}
```

### Solução 2: Verificar Schema do Supabase

```sql
-- Verificar estrutura da tabela users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Verificar se o usuário existe
SELECT id, name, email, created_at
FROM users
WHERE email = 'joao.teste@sinucabet.com';

-- Ver todos os usuários (verificar IDs)
SELECT id, name, email
FROM users
ORDER BY created_at DESC
LIMIT 10;
```

### Solução 3: Endpoint de Debug Temporário

```javascript
// backend/routes/auth.routes.js
// Adicionar rota temporária de debug
router.get('/debug/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      req_user: req.user,
      jwt_decoded: req.user,
      timestamp: new Date().toISOString()
    }
  });
});
```

Testar: `GET http://localhost:3001/api/auth/debug/me`

### Solução 4: Verificar Token JWT

```javascript
// backend/utils/jwt.util.js
// Adicionar log temporário
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sinucabet-api',
      audience: 'sinucabet-users'
    });
    
    console.log('🔓 JWT Decoded:', decoded);
    
    return decoded;
  } catch (error) {
    // ...
  }
}
```

---

## 📊 Checklist de Diagnóstico

Siga esta ordem para diagnosticar:

- [ ] 1. Verificar logs do backend ao acessar `/profile`
- [ ] 2. Adicionar logs de debug no `getProfile` (controller e service)
- [ ] 3. Verificar se usuário existe no Supabase
- [ ] 4. Verificar estrutura da tabela `users`
- [ ] 5. Verificar token JWT decodificado
- [ ] 6. Verificar `req.user.id` no middleware
- [ ] 7. Testar endpoint de debug `/auth/debug/me`
- [ ] 8. Verificar cookies do browser

---

## 🎯 Ações Imediatas

### Para o Desenvolvedor:

1. **Iniciar Backend em Modo Debug:**
```bash
cd backend
node server.js
# Observar logs ao acessar /profile
```

2. **Abrir Supabase Dashboard:**
- Verificar se o usuário foi criado
- Copiar o ID do usuário
- Comparar com o ID que aparece nos logs

3. **Adicionar Logs:**
Adicionar os logs de debug sugeridos na Solução 1

4. **Testar Novamente:**
- Fazer login
- Acessar `/profile`
- Observar logs no backend
- Verificar qual ID está sendo passado

---

## 💡 Hipótese Mais Provável

Baseado na análise, a causa mais provável é:

**O usuário foi criado com sucesso, mas o ID retornado no login está diferente do ID real no banco.**

Isso pode acontecer se:
1. O `register` retorna o ID correto, mas o `login` retorna algo diferente
2. O campo `id` no Supabase tem um nome diferente (ex: `user_id`)
3. Há algum problema na query de seleção

---

## ✅ Solução Rápida (Workaround)

Enquanto debugamos, podemos fazer o `getProfile` buscar por email:

```javascript
// backend/services/auth.service.js
async getProfile(userId) {
  try {
    // WORKAROUND: Buscar por qualquer campo disponível
    let query = supabase
      .from('users')
      .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, created_at');
    
    // Tentar por ID primeiro
    let { data: user, error } = await query.eq('id', userId).single();
    
    // Se não encontrar, tentar por email (se userId for email)
    if (error && userId.includes('@')) {
      const result = await supabase
        .from('users')
        .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, created_at')
        .eq('email', userId)
        .single();
      user = result.data;
      error = result.error;
    }
    
    if (error || !user) {
      console.error('❌ Usuário não encontrado. userId:', userId, 'error:', error);
      throw {
        code: 'NOT_FOUND',
        message: 'Usuário não encontrado'
      };
    }
    
    return user;
  } catch (error) {
    // ...
  }
}
```

---

## 📞 Próximos Passos

1. ✅ Sistema de autenticação está funcionando (login persiste)
2. ⚠️ Endpoint de perfil precisa de debug
3. 🔧 Adicionar logs temporários
4. 🔍 Verificar banco de dados
5. ✅ Corrigir problema identificado
6. 🧹 Remover logs de debug

---

**Status:** Em investigação  
**Prioridade:** Média (não impede o funcionamento principal)  
**Impacto:** Página "Meu Perfil" não funciona  
**Solução:** Diagnosticar e corrigir mapeamento de ID






