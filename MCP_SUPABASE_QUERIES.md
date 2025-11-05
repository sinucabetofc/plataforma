# 🔍 Consultas Úteis - MCP Supabase

Este documento contém consultas úteis para monitorar e gerenciar o banco de dados via MCP Supabase.

---

## 📊 **Consultas de Monitoramento**

### **1. Ver Últimos Usuários Cadastrados**

```
GET /users?select=id,name,email,cpf,created_at&order=created_at.desc&limit=10
```

**O que retorna:** 10 usuários mais recentes com dados básicos

---

### **2. Verificar Carteiras**

```
GET /wallet?select=user_id,balance,blocked_balance,total_deposited,total_withdrawn&order=created_at.desc&limit=10
```

**O que retorna:** Saldos e transações das 10 carteiras mais recentes

---

### **3. Contar Total de Usuários**

```
GET /users?select=count()
```

**O que retorna:** Total de usuários cadastrados

---

### **4. Contar Total de Carteiras**

```
GET /wallet?select=count()
```

**O que retorna:** Total de carteiras criadas

---

### **5. Verificar Usuário Específico por Email**

```
GET /users?select=id,name,email,phone,cpf,pix_key,created_at&email=eq.seu@email.com
```

**Exemplo:**
```
GET /users?select=id,name,email,phone,cpf,pix_key,created_at&email=eq.maria.playwright.test@sinucabet.com
```

---

### **6. Ver Carteira de Usuário Específico**

```
GET /wallet?select=balance,blocked_balance,total_deposited,total_withdrawn,created_at&user_id=eq.SEU_USER_ID
```

---

### **7. Buscar Usuários Ativos**

```
GET /users?select=id,name,email,is_active&is_active=eq.true&limit=20
```

---

### **8. Verificar Password Hash (Deve ser NULL)**

```
GET /users?select=id,email,password_hash&limit=5
```

**Resultado esperado:** `password_hash: null` para todos os usuários

---

## 🔧 **Operações CRUD**

### **Criar Novo Usuário (NÃO RECOMENDADO - Use o endpoint de cadastro)**

```
POST /users
Body: {
  "id": "uuid-gerado",
  "name": "Nome",
  "email": "email@teste.com",
  "phone": "+5511999999999",
  "cpf": "123.456.789-00",
  "pix_key": "email@teste.com",
  "pix_type": "email",
  "is_active": true,
  "email_verified": false
}
```

---

### **Atualizar Usuário**

```
PATCH /users?id=eq.USER_ID
Body: {
  "name": "Novo Nome",
  "phone": "+5511888888888"
}
```

---

### **Desativar Usuário (Soft Delete)**

```
PATCH /users?id=eq.USER_ID
Body: {
  "is_active": false
}
```

---

### **Atualizar Saldo da Carteira**

```
PATCH /wallet?user_id=eq.USER_ID
Body: {
  "balance": 100.00,
  "total_deposited": 100.00
}
```

---

## 🎮 **Consultas de Jogos e Apostas**

### **Ver Jogos Ativos**

```
GET /games?select=id,player_a,player_b,status,created_at&status=eq.active&order=created_at.desc
```

---

### **Ver Apostas Recentes**

```
GET /bets?select=id,user_id,game_id,amount,chosen_player,status,created_at&order=created_at.desc&limit=20
```

---

### **Apostas de um Usuário Específico**

```
GET /bets?select=id,game_id,amount,chosen_player,status,created_at&user_id=eq.USER_ID&order=created_at.desc
```

---

## 📈 **Consultas Analíticas**

### **Usuários Cadastrados Hoje**

```
GET /users?select=id,name,email,created_at&created_at=gte.2025-11-05T00:00:00Z
```

---

### **Soma Total de Saldos**

```
GET /wallet?select=balance.sum()
```

---

### **Usuários com Saldo > 0**

```
GET /wallet?select=user_id,balance&balance=gt.0
```

---

## 🧹 **Limpeza de Dados de Teste**

### **Deletar Usuário de Teste (CUIDADO!)**

```
DELETE /users?email=eq.teste@example.com
```

⚠️ **ATENÇÃO:** 
- Deleta apenas em `public.users`
- NÃO deleta em `auth.users` (precisa fazer via Dashboard)
- Pode causar inconsistências

### **Melhor Prática: Desativar em vez de Deletar**

```
PATCH /users?email=eq.teste@example.com
Body: { "is_active": false }
```

---

## 🔍 **Verificações de Integridade**

### **1. Verificar Usuários Sem Carteira**

```
GET /users?select=id,name,email&not.exists(wallet:user_id)
```

---

### **2. Verificar Carteiras Órfãs (Sem Usuário)**

Isso seria uma inconsistência - não deveria existir.

```
GET /wallet?select=user_id,balance&not.exists(users:id)
```

---

### **3. Verificar Campos NULL Importantes**

```
GET /users?select=id,email,name,cpf&or=(name.is.null,cpf.is.null)
```

---

## 📝 **Exemplos Práticos**

### **Exemplo 1: Verificar Cadastro Completo de um Usuário**

```bash
# 1. Buscar usuário
GET /users?select=*&email=eq.maria.playwright.test@sinucabet.com

# 2. Buscar carteira do usuário (usar o id retornado)
GET /wallet?select=*&user_id=eq.02dca8a6-9017-467e-b462-aeb7ea7d853b

# 3. Buscar apostas do usuário
GET /bets?select=*&user_id=eq.02dca8a6-9017-467e-b462-aeb7ea7d853b
```

---

### **Exemplo 2: Dashboard de Admin**

```bash
# Total de usuários
GET /users?select=count()

# Total de carteiras
GET /wallet?select=count()

# Soma total de saldos
GET /wallet?select=balance.sum()

# Usuários cadastrados hoje
GET /users?select=count()&created_at=gte.2025-11-05T00:00:00Z

# Jogos ativos
GET /games?select=count()&status=eq.active
```

---

## 🎯 **Filtros Úteis**

### **Operadores de Comparação:**
- `eq.valor` - Igual a
- `neq.valor` - Diferente de
- `gt.valor` - Maior que
- `gte.valor` - Maior ou igual
- `lt.valor` - Menor que
- `lte.valor` - Menor ou igual
- `like.*valor*` - Contém (case sensitive)
- `ilike.*valor*` - Contém (case insensitive)
- `is.null` - É nulo
- `not.is.null` - Não é nulo

### **Operadores Lógicos:**
- `and(cond1,cond2)` - E
- `or(cond1,cond2)` - OU
- `not.condição` - NÃO

### **Ordenação:**
- `order=campo.asc` - Ascendente
- `order=campo.desc` - Descendente

### **Paginação:**
- `limit=N` - Limitar resultados
- `offset=N` - Pular N resultados

---

## 🚨 **Verificações de Segurança**

### **1. Verificar se password_hash está NULL**

```
GET /users?select=id,email,password_hash&password_hash=not.is.null
```

**Resultado esperado:** Array vazio (todos devem ter password_hash = null)

---

### **2. Verificar Usuários Inativos**

```
GET /users?select=id,name,email,is_active&is_active=eq.false
```

---

### **3. Verificar Emails Não Verificados**

```
GET /users?select=id,name,email,email_verified&email_verified=eq.false
```

---

## 💡 **Dicas de Uso**

1. **Use `select` para escolher apenas os campos necessários** - melhora performance
2. **Use `limit` em consultas exploratórias** - evita retornar muitos dados
3. **Use `order` para organizar resultados** - facilita análise
4. **Combine filtros com `and` e `or`** - consultas mais específicas
5. **Sempre teste com `limit=1` primeiro** - verifica se a query está correta

---

## 🔗 **Links Úteis**

- [PostgREST Documentation](https://postgrest.org/en/stable/api.html)
- [Supabase Dashboard](https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr)
- [Supabase Auth Users](https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/auth/users)
- [Supabase Table Editor](https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/editor)

---

**Criado em:** 05/11/2025  
**Projeto:** SinucaBet  
**Autor:** Cursor AI



