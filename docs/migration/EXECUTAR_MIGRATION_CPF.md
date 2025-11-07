# 🔧 EXECUTAR MIGRATION - Remover CPF Único

## ⚡ **EXECUTAR AGORA NO SUPABASE**

### 📋 Passo a Passo:

1. Acesse: **https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/editor**

2. Clique em **SQL Editor** (menu lateral esquerdo)

3. Clique em **+ New Query**

4. **Cole este SQL:**

```sql
-- ============================================================
-- MIGRAÇÃO: Remover constraint UNIQUE de CPF
-- Data: 06/11/2025
-- Motivo: Permitir múltiplos usuários com mesmo CPF
-- ============================================================

-- 1. Remover constraint UNIQUE de CPF se existir
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_cpf_key;

-- 2. Remover índice UNIQUE de CPF se existir
DROP INDEX IF EXISTS public.users_cpf_key;
DROP INDEX IF EXISTS public.idx_users_cpf;

-- 3. Recriar índice CPF sem UNIQUE (para performance)
CREATE INDEX IF NOT EXISTS idx_users_cpf_non_unique ON public.users(cpf);

-- 4. Comentário documentando a mudança
COMMENT ON COLUMN public.users.cpf IS 
  'CPF do usuário - Formato: XXX.XXX.XXX-XX (CPF duplicado é permitido)';

-- 5. Verificação
SELECT 'Migration executada com sucesso!' as status;
```

5. Clique em **RUN** (ou pressione Ctrl/Cmd + Enter)

6. **Resultado esperado:**
```
status: "Migration executada com sucesso!"
```

---

## ✅ O Que Foi Alterado

### ANTES:
```sql
cpf VARCHAR(14) NOT NULL UNIQUE ← ❌ Não permitia duplicados
```

### DEPOIS:
```sql
cpf VARCHAR(14) NOT NULL ← ✅ Permite CPF duplicado
```

---

## 🎯 Benefícios

1. ✅ **Elimina erro de "CPF já cadastrado"**
2. ✅ **Simplifica o cadastro**
3. ✅ **Permite familiares usarem mesmo CPF**
4. ✅ **Reduz atrito no onboarding**
5. ✅ **Email continua único** (controle principal)

---

## 🔒 Segurança Mantida

- 🔐 **Email único**: Continua sendo a chave principal
- 🔐 **Senhas**: Gerenciadas pelo Supabase Auth
- 🔐 **Tokens JWT**: Validação completa
- 🔐 **Carteira**: Um usuário = uma carteira (único)

---

## 🧪 Testar Após Migration

```bash
# Testar cadastro com CPF duplicado
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@test.com",
    "password": "Senha123!",
    "phone": "+5511999887766",
    "cpf": "111.222.333-96"
  }'

# Testar outro usuário com MESMO CPF
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@test.com",
    "password": "Senha123!",
    "phone": "+5511999887777",
    "cpf": "111.222.333-96"
  }'
```

**Esperado:** Ambos devem ser cadastrados com sucesso! ✅

---

## 📝 Arquivos Alterados

1. ✅ `backend/services/auth.service.js` - Removida validação de CPF duplicado
2. ✅ `backend/validators/auth.validator.js` - CPF mantém validação de formato
3. ✅ `backend/supabase/migrations/1005_remove_cpf_unique_constraint.sql` - Migration criada
4. ⏳ **Supabase** - Execute a migration acima!

---

## 🚀 Após Executar a Migration

Reinicie o backend:
```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/backend
npm run dev
```

Ou use o script:
```bash
./INICIAR_LOCALHOST.sh
```

---

**⚡ Execute a migration no Supabase agora e depois me avise para testarmos! 🎱**

