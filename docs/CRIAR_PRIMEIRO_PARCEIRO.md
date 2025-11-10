# 🎯 Como Criar o Primeiro Parceiro

## 🚨 Problema
Erro 401 ao tentar fazer login em `/parceiros/login` significa que o parceiro não existe no banco de dados.

---

## ✅ Solução: Criar Parceiro no Supabase

### Opção 1: Via SQL Editor (Recomendado)

1. **Acesse o Supabase:**
   - https://supabase.com/dashboard
   - Selecione seu projeto
   - Vá em **SQL Editor**

2. **Cole e Execute este SQL:**

```sql
-- Criar parceiro de teste
INSERT INTO influencers (
    name,
    email,
    password_hash,
    phone,
    pix_key,
    pix_type,
    commission_percentage,
    is_active
) VALUES (
    'Parceiro Teste',
    'parceiro@teste.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '+5511999999999',
    '11999999999',
    'phone',
    10.00,
    true
)
ON CONFLICT (email) DO NOTHING
RETURNING *;

-- Criar registro de comissões (saldo inicial)
INSERT INTO influencer_commissions (
    influencer_id,
    balance,
    total_earned,
    total_withdrawn,
    pending_amount
)
SELECT 
    id,
    0.00,
    0.00,
    0.00,
    0.00
FROM influencers
WHERE email = 'parceiro@teste.com'
ON CONFLICT (influencer_id) DO NOTHING;
```

3. **Credenciais de Login:**
```
Email: parceiro@teste.com
Senha: 123456
```

4. **Teste o Login:**
   - Vá em: `/parceiros/login`
   - Use as credenciais acima
   - Deve funcionar! ✅

---

### Opção 2: Via Admin Panel (Futuro)

Você pode criar uma página no admin para cadastrar parceiros:
- `/admin/influencers` → Botão "Adicionar Parceiro"
- Formulário com: nome, email, telefone, chave PIX, comissão

---

## 🔐 Criar Parceiro com Outra Senha

Se quiser criar um parceiro com senha diferente, use este Node.js:

### 1. Criar arquivo `hash-password.js`:

```javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('Senha:', password);
  console.log('Hash:', hash);
}

// Troque pela senha desejada
hashPassword('suaSenhaForte123');
```

### 2. Execute:

```bash
cd backend
node hash-password.js
```

### 3. Use o hash gerado no SQL:

```sql
INSERT INTO influencers (
    name,
    email,
    password_hash,
    -- ... resto dos campos
) VALUES (
    'Nome do Parceiro',
    'email@parceiro.com',
    'COLE_O_HASH_AQUI',
    -- ... resto dos valores
);
```

---

## 📋 Verificar se Parceiro Existe

Execute no **Supabase SQL Editor**:

```sql
SELECT 
    id,
    name,
    email,
    phone,
    pix_key,
    commission_percentage,
    is_active,
    created_at
FROM influencers
ORDER BY created_at DESC;
```

Se retornar vazio = nenhum parceiro criado ainda.

---

## 🧪 Testar Login via cURL

Para testar direto no backend:

```bash
curl -X POST https://sinucabet-backend.onrender.com/api/influencers/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parceiro@teste.com",
    "password": "123456"
  }'
```

### ✅ Resposta esperada (sucesso):
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "influencer": {
      "id": "...",
      "name": "Parceiro Teste",
      "email": "parceiro@teste.com",
      ...
    },
    "token": "eyJhbGc..."
  }
}
```

### ❌ Resposta de erro (401):
```json
{
  "success": false,
  "message": "Email ou senha incorretos"
}
```

Significa que:
- Email não existe, OU
- Senha está incorreta

---

## 🔍 Troubleshooting

### Erro: "Email ou senha incorretos"
- **Causa:** Parceiro não existe ou senha errada
- **Solução:** Execute o SQL para criar o parceiro

### Erro: "Conta desativada"
- **Causa:** `is_active = false`
- **Solução:** 
```sql
UPDATE influencers 
SET is_active = true 
WHERE email = 'parceiro@teste.com';
```

### Erro: "duplicate key value"
- **Causa:** Parceiro já existe com esse email
- **Solução:** Use outro email ou atualize o existente

---

## 📦 Script Pronto

Arquivo criado em:
```
backend/supabase/scripts/create_test_influencer.sql
```

Você pode executar diretamente no Supabase SQL Editor.

---

## 🎉 Pronto!

Após criar o parceiro:
1. ✅ Limpe localStorage
2. ✅ Vá em `/parceiros/login`
3. ✅ Login: `parceiro@teste.com` / `123456`
4. ✅ Deve funcionar!

---

**Última atualização:** 10/11/2025

