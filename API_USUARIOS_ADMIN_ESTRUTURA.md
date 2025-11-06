# 📊 Estrutura da API de Usuários - Admin Panel

## 🔗 Endpoint
```
GET /api/admin/users
```

## 🔐 Autenticação
- **Requer:** Token JWT (role: admin)
- **Header:** `Authorization: Bearer {token}`

## 📥 Query Parameters (Filtros)
```javascript
{
  search: string,    // Busca por nome, email ou CPF
  status: string,    // 'active', 'inactive', ou vazio (todos)
  page: number,      // Número da página (padrão: 1)
  limit: number      // Itens por página (padrão: 10)
}
```

## 📤 Resposta da API

### Estrutura Completa
```json
{
  "success": true,
  "message": "Usuários obtidos com sucesso",
  "data": {
    "users": [
      {
        "id": "248cee73-ff5c-494a-9699-ef0f4bb0a1a1",
        "name": "Vinicius ambrozio",
        "email": "vini@admin.com",
        "cpf": "12345678900",
        "phone": "11999999999",
        "is_active": true,
        "role": "admin",
        "created_at": "2025-11-05T03:15:43.755696+00:00",
        "wallet": {
          "user_id": "248cee73-ff5c-494a-9699-ef0f4bb0a1a1",
          "balance": 0,           // Em centavos!
          "total_deposited": 0,
          "total_withdrawn": 0,
          "created_at": "...",
          "updated_at": "..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 6,
      "totalPages": 1
    }
  }
}
```

## 🔍 Como o Controller Processa

### 1. Validação
```javascript
// Verifica se é admin
if (req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Acesso negado.');
}
```

### 2. Query Supabase
```javascript
let query = supabase
  .from('users')
  .select('*', { count: 'exact' });

// Filtros aplicados:
if (search) {
  query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
}

if (status === 'active') {
  query = query.eq('is_active', true);
}

// Paginação
const offset = (page - 1) * limit;
query = query.range(offset, offset + limit - 1);

// Ordenação
query = query.order('created_at', { ascending: false });
```

### 3. Busca Wallets
```javascript
// Busca wallets de TODOS os usuários retornados
const userIds = users.map(u => u.id);
const { data: wallets } = await supabase
  .from('wallet')
  .select('*')
  .in('user_id', userIds);

// Mapeia wallets por user_id
const walletsMap = {};
wallets.forEach(wallet => {
  walletsMap[wallet.user_id] = wallet;
});
```

### 4. Formatação
```javascript
const formattedUsers = users.map(user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  cpf: user.cpf,
  phone: user.phone,
  is_active: user.is_active,
  role: user.role,
  created_at: user.created_at,
  wallet: walletsMap[user.id] || null  // Wallet associado ou null
}));
```

## 📊 Campos Retornados

| Campo | Tipo | Descrição | Origem |
|-------|------|-----------|--------|
| `id` | UUID | ID único do usuário | Tabela `users` |
| `name` | String | Nome completo | Tabela `users` |
| `email` | String | Email do usuário | Tabela `users` |
| `cpf` | String | CPF (sem máscara) | Tabela `users` |
| `phone` | String | Telefone (sem máscara) | Tabela `users` |
| `is_active` | Boolean | Status ativo/bloqueado | Tabela `users` |
| `role` | String | Papel (user/admin) | Tabela `users` |
| `created_at` | Timestamp | Data de cadastro | Tabela `users` |
| `wallet` | Object/null | Dados da carteira | Tabela `wallet` (JOIN) |

### Wallet Object
```javascript
{
  "user_id": UUID,
  "balance": number,         // ⚠️ Em centavos! (10000 = R$ 100,00)
  "total_deposited": number, // ⚠️ Em centavos!
  "total_withdrawn": number, // ⚠️ Em centavos!
  "created_at": timestamp,
  "updated_at": timestamp
}
```

## 🎯 Exemplo de Uso no Frontend

```javascript
// Hook
const { data, isLoading } = useUsers({ 
  search: '', 
  status: 'active', 
  page: 1, 
  limit: 10 
});

// data.users = array de usuários
// data.pagination = objeto de paginação

// Formatação de saldo
const saldoEmReais = (data.users[0].wallet?.balance || 0) / 100;
// saldoEmReais = 100.00 (se balance = 10000)
```

## ⚠️ Pontos Importantes

1. **Valores Monetários em Centavos**
   - `wallet.balance`: 10000 = R$ 100,00
   - Sempre dividir por 100 para exibir

2. **Wallet pode ser NULL**
   - Usuários podem não ter carteira criada
   - Sempre verificar: `user.wallet?.balance || 0`

3. **Paginação**
   - Padrão: 10 usuários por página
   - Frontend controla página atual

4. **Busca**
   - Case-insensitive (ilike)
   - Busca em: nome, email e CPF
   - Busca parcial (ex: "vini" encontra "Vinicius")

5. **Status**
   - `active`: apenas usuários ativos
   - `inactive`: apenas bloqueados
   - Vazio: todos os usuários

## 🔄 Fluxo Completo

```
Frontend                    Backend                    Supabase
   |                           |                           |
   |-- GET /api/admin/users -->|                           |
   |   + Token JWT             |                           |
   |                           |-- Valida admin ---------->|
   |                           |                           |
   |                           |-- SELECT users --------->|
   |                           |<-- users[] --------------|
   |                           |                           |
   |                           |-- SELECT wallets ------->|
   |                           |<-- wallets[] ------------|
   |                           |                           |
   |                           |-- Mapeia wallets         |
   |                           |-- Formata resposta       |
   |                           |                           |
   |<-- JSON com users + ------                           |
   |    pagination                                         |
```

## 📝 Logs de Exemplo

```javascript
// Requisição
GET http://localhost:3001/api/admin/users?page=1&limit=10

// Resposta
{
  "success": true,
  "message": "Usuários obtidos com sucesso",
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 6,
      "totalPages": 1
    }
  }
}
```

## ✅ Validações

- ✅ Token JWT válido
- ✅ Role = 'admin'
- ✅ Paginação (page >= 1, limit > 0)
- ✅ Filtros opcionais
- ✅ JOIN com wallet
- ✅ Ordenação por created_at DESC

---

**Arquivo gerado em:** 06/11/2025  
**Backend:** `backend/controllers/admin.controller.js`  
**Método:** `getUsers()`

