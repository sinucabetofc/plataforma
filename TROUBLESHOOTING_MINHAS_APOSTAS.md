# 🔍 TROUBLESHOOTING: "Minhas Apostas" Vazia

**Problema:** Página mostra "Você ainda não fez apostas", mas sabemos que existem apostas do Kaique e Baianinho  
**Data:** 07/11/2025  

---

## ⚠️ POSSÍVEIS CAUSAS

### **1. Usuário Logado Diferente**

**Provável causa:** Você está logado com **Admin** (`vini@admin.com`), não com Kaique ou Baianinho!

**Solução:**
- Faça logout
- Faça login com: `kaique@example.com` ou `baianinho@example.com`
- Verifique apostas novamente

---

### **2. RLS (Row Level Security) Bloqueando**

**Causa:** Políticas de segurança podem estar impedindo o acesso

**Verificar no Supabase:**
```sql
-- Ver apostas do Kaique
SELECT * FROM bets 
WHERE user_id = (SELECT id FROM users WHERE email LIKE '%kaique%');

-- Ver apostas do Baianinho  
SELECT * FROM bets 
WHERE user_id = (SELECT id FROM users WHERE email LIKE '%baianinho%');
```

**Se retornar vazio:** Apostas não foram criadas  
**Se retornar dados:** Problema é RLS ou autenticação

---

### **3. Token JWT Incorreto**

**Causa:** Token no localStorage pode estar desatualizado

**Solução:**
1. Abrir DevTools (F12)
2. Ir em **Application** → **Local Storage**
3. Procurar por `token` ou `auth`
4. Deletar e fazer login novamente

---

### **4. Endpoint Retornando Vazio**

**Verificar no console do navegador:**
```javascript
// Abrir DevTools → Console
// Verificar requisição
Network → XHR/Fetch → /api/bets/user

// Deve retornar:
{
  "success": true,
  "data": {
    "bets": [ ... apostas aqui ... ],
    "stats": { ... }
  }
}
```

**Se retornar `bets: []`:** Usuário realmente não tem apostas  
**Se der erro 401/403:** Problema de autenticação

---

## ✅ VALIDAÇÕES RÁPIDAS

### **Verificar no SQL:**

```sql
-- 1. Listar TODOS os usuários com apostas
SELECT 
  u.name,
  u.email,
  COUNT(b.id) as total_apostas,
  SUM(b.amount) / 100.0 as total_apostado,
  array_agg(DISTINCT b.status) as status_das_apostas
FROM users u
LEFT JOIN bets b ON b.user_id = u.id
GROUP BY u.id, u.name, u.email
HAVING COUNT(b.id) > 0
ORDER BY COUNT(b.id) DESC;
```

**Resultado esperado:**
```
Kaique       | kaique@...    | 1 | 60.00 | {aceita}
Baianinho    | baianinho@... | 1 | 60.00 | {aceita}
```

---

### **Verificar Usuário Logado:**

**No Frontend (Console do navegador):**
```javascript
// Ver dados do usuário logado
const cookies = document.cookie;
console.log(cookies);

// OU ver no localStorage
console.log(localStorage.getItem('user'));
console.log(localStorage.getItem('token'));
```

**Deve retornar:** Dados do Kaique ou Baianinho

---

## 🚨 PROBLEMA PROVÁVEL

**90% de chance:** Você está logado como **ADMIN** (`vini@admin.com`), que NÃO fez apostas!

**Apostas existentes:**
- Kaique → 1 aposta de R$ 60 (aceita)
- Baianinho → 1 aposta de R$ 60 (aceita)
- **Admin → 0 apostas** ← Por isso aparece vazio!

---

## ✅ SOLUÇÃO RÁPIDA

### **Opção 1: Fazer Login como Kaique**
```
Email: kaique@example.com
Senha: (a senha do Kaique)
```

### **Opção 2: Fazer Login como Baianinho**
```
Email: baianinho@example.com  
Senha: (a senha do Baianinho)
```

### **Opção 3: Criar Aposta como Admin**
Se você estiver logado como admin e quiser testar:
1. Vá em alguma série ativa
2. Faça uma aposta
3. Verifique em "Minhas Apostas"

---

## 🔧 DEBUG AVANÇADO

### **Se continuar vazio após login correto:**

**1. Verificar endpoint:**
```bash
curl -X GET "http://localhost:3001/api/bets/user" \
  -H "Authorization: Bearer {seu-token-aqui}"
```

**2. Ver logs do backend:**
```bash
cd backend
# Verificar console para erros
```

**3. Verificar RLS:**
```sql
-- Desabilitar RLS temporariamente para testar
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;

-- Testar novamente

-- Reabilitar
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
```

---

## 📊 ENDPOINT DETALHES

### **GET /api/bets/user**

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params (opcionais):**
- `status`: filtrar por status
- `limit`: quantidade (default: 50)
- `offset`: paginação (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "bets": [
      {
        "id": "uuid",
        "serie": {...},
        "match": {...},
        "chosen_player": {...},
        "amount": 6000,
        "status": "aceita",
        "placed_at": "2025-11-07T..."
      }
    ],
    "stats": {
      "total_bets": 1,
      "pendente": 0,
      "aceita": 1,
      "ganha": 0,
      "perdida": 0
    }
  }
}
```

---

## 🎯 AÇÃO RECOMENDADA

**Mais provável:**
1. **Faça logout** do admin
2. **Faça login** como Kaique ou Baianinho
3. **Acesse** "Minhas Apostas"
4. **Deve aparecer** a aposta de R$ 60 🔵 "Casada"

**Se aparecer vazio ainda:**
- Me avise qual usuário está logado
- Veja os logs do console do navegador (F12)
- Verifique a aba Network → Response do /api/bets/user

---

**Criado em:** 07/11/2025  
**Probabilidade de causa:** 90% usuário errado  
**Tempo para resolver:** 1 minuto (fazer login correto)

