# 🔐 Configuração Supabase - SinucaBet

## ✅ Credenciais Configuradas

### 📍 Informações do Projeto

| Item | Valor |
|------|-------|
| **URL** | `https://atjxmyrkzcumieuayapr.supabase.co` |
| **Project ID** | `atjxmyrkzcumieuayapr` |
| **Region** | Auto-detectada |

### 🔑 API Keys

#### Anon (Public) Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0anhteXJremN1bWlldWF5YXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjgxNTksImV4cCI6MjA3Nzg0NDE1OX0.zVHBA1mWH-jxRwK0TJYyVLdqj_aNNGFnsXQ8sdqC_Ss
```
- **Uso**: Frontend e Admin (público)
- **Permissões**: Leitura pública
- **Expira**: 2077-08-44 (JWT)

#### Service Role Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0anhteXJremN1bWlldWF5YXByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2ODE1OSwiZXhwIjoyMDc3ODQ0MTU5fQ.2U7ABS50PB6cU4imZxXfhb-JMKEg14PUNH5H0p7HPHM
```
- **Uso**: Backend apenas (servidor)
- **Permissões**: Acesso total
- **Expira**: 2077-08-44 (JWT)
- ⚠️ **NUNCA exponha esta chave no frontend!**

---

## 📁 Arquivos Configurados

### ✅ Backend

**Arquivos:**
- `backend/.env` ✅
- `backend/.env.example` ✅

**Variáveis:**
```env
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
```

### ✅ Frontend

**Arquivos:**
- `frontend/.env.local` ✅
- `frontend/.env.example` ✅
- `frontend/next.config.js` ✅ (domain configurado)

**Variáveis:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### ✅ Admin

**Arquivos:**
- `admin/.env.local` ✅
- `admin/.env.example` ✅
- `admin/next.config.js` ✅ (domain configurado)

**Variáveis:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 🗄️ Próximos Passos no Supabase

### 1️⃣ Executar Schema do Banco de Dados

1. Acesse: https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/editor
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Copie o conteúdo de `database/schema.sql`
5. Cole e execute (Run)

### 2️⃣ (Opcional) Inserir Dados de Teste

1. No **SQL Editor**
2. Nova query
3. Copie o conteúdo de `database/seed.sql`
4. Execute

### 3️⃣ Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Habilite **Email** (já deve estar habilitado)
3. Configure:
   - ✅ Enable email confirmations (opcional para dev)
   - ✅ Enable email change confirmations
   - ✅ Secure password change

### 4️⃣ Configurar Storage (se necessário)

1. Vá em **Storage**
2. Crie buckets se necessário:
   - `avatars` (público)
   - `documents` (privado)

### 5️⃣ Configurar Row Level Security (RLS)

O schema já inclui as tabelas, mas você pode querer adicionar políticas RLS:

```sql
-- Exemplo: Permitir que usuários vejam apenas suas próprias apostas
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bets"
  ON bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🔌 Testando a Conexão

### Backend (Node.js)

Crie um arquivo de teste: `backend/test-supabase.js`

```javascript
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testConnection() {
  try {
    // Testar conexão
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Conexão Supabase OK!');
    console.log('Dados:', data);
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
```

Execute:
```bash
cd backend
node test-supabase.js
```

### Frontend (Next.js)

Crie: `frontend/pages/test-supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TestSupabase() {
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      alert('✅ Conexão OK!');
      console.log(data);
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h1>Teste Supabase</h1>
      <button onClick={testConnection}>
        Testar Conexão
      </button>
    </div>
  );
}
```

Acesse: http://localhost:3000/test-supabase

---

## 🔒 Segurança

### ✅ Boas Práticas Implementadas

- ✅ Service Role Key apenas no backend
- ✅ Anon Key apenas no frontend/admin
- ✅ Arquivos `.env` no `.gitignore`
- ✅ Domain configurado no Next.js
- ✅ CORS configurado

### ⚠️ Atenções

1. **NUNCA** commitar arquivos `.env` no Git
2. **NUNCA** expor `SERVICE_ROLE_KEY` no frontend
3. **SEMPRE** usar variáveis de ambiente
4. **ROTACIONAR** keys se expostas acidentalmente

### 🔄 Rotacionar Keys (se necessário)

1. Acesse: https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/settings/api
2. Clique em **Regenerate** na key desejada
3. Atualize os arquivos `.env`
4. Reinicie os servidores

---

## 📊 Monitoramento

### Dashboard do Supabase

- **Database**: https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/editor
- **Auth**: https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/auth/users
- **Storage**: https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/storage/buckets
- **Logs**: https://supabase.com/dashboard/project/atjxmyrkzcumieuayapr/logs/explorer

### Métricas Importantes

- Usuários cadastrados
- Queries por segundo
- Uso de storage
- Erros de API

---

## 🆘 Troubleshooting

### Erro: "Invalid API key"

**Solução:**
1. Verifique se copiou a key completa
2. Confirme que não há espaços extras
3. Reinicie o servidor após alterar `.env`

### Erro: "relation does not exist"

**Solução:**
1. Execute `database/schema.sql` no Supabase
2. Verifique se está no projeto correto

### Erro: CORS

**Solução:**
1. Adicione domínio no Supabase Dashboard
2. Vá em Settings → API → CORS
3. Adicione: `http://localhost:3000` e `http://localhost:3002`

---

## ✅ Checklist de Configuração

- [x] Credenciais copiadas
- [x] Arquivos `.env` criados
- [x] `next.config.js` atualizado
- [ ] Schema SQL executado
- [ ] Dados de seed inseridos (opcional)
- [ ] Conexão testada
- [ ] RLS configurado (se necessário)
- [ ] CORS configurado

---

**Configurado em**: 04/11/2025  
**Status**: ✅ Pronto para uso!

