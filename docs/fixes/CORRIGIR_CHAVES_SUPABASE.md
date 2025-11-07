# 🔑 Como Corrigir o Erro "Invalid API Key"

## 🚨 Problema Identificado

O backend está retornando:
```
"Invalid API key" - Chave do Supabase incorreta ou expirada
```

---

## ✅ Solução: Atualizar as Chaves do Supabase

### Passo 1: Acessar o Dashboard do Supabase

1. Acesse: **https://supabase.com/dashboard**
2. Faça login na sua conta
3. Selecione o projeto: **atjxmyrkzcumieuayapr**

### Passo 2: Copiar as Chaves Corretas

1. No menu lateral, clique em **Settings** ⚙️
2. Clique em **API**
3. Copie as seguintes chaves:

   - ✅ **Project URL** (SUPABASE_URL)
   - ✅ **anon/public key** (SUPABASE_ANON_KEY)
   - ✅ **service_role key** (SUPABASE_SERVICE_ROLE_KEY) ⚠️ **IMPORTANTE!**

> ⚠️ **ATENÇÃO**: A `service_role` key tem poderes de administrador. Nunca compartilhe ou commit no Git!

### Passo 3: Atualizar o arquivo `.env` do Backend

Edite o arquivo:
```bash
/Users/viniciusambrozio/Downloads/MARKETING DIGITAL/PROGRAMAS/SinucaBet/backend/.env
```

Cole as chaves corretas:

```env
# Supabase Configuration
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_copiada_aqui
SUPABASE_ANON_KEY=sua_anon_key_copiada_aqui

# JWT Configuration (mantenha a que já existe)
JWT_SECRET=sua_chave_secreta_existente

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

### Passo 4: Atualizar o arquivo `.env.local` do Frontend

Edite o arquivo:
```bash
/Users/viniciusambrozio/Downloads/MARKETING DIGITAL/PROGRAMAS/SinucaBet/frontend/.env.local
```

Cole apenas a **anon key** (NÃO use service_role no frontend!):

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (apenas anon key para frontend)
NEXT_PUBLIC_SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_copiada_aqui
```

---

## 🔄 Passo 5: Reiniciar os Servidores

Após atualizar as chaves, reinicie tudo:

```bash
# Parar tudo
lsof -ti:3000,3001 | xargs kill -9

# Reiniciar o script
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet
./INICIAR_LOCALHOST.sh
```

Ou manualmente:

```bash
# Terminal 1 - Backend
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/backend
npm run dev

# Terminal 2 - Frontend
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/frontend
npm run dev
```

---

## 🧪 Testar se Funcionou

### Teste 1: Backend
```bash
curl http://localhost:3001/api/matches
```

**Resposta esperada:** Lista de partidas (não deve ter erro "Invalid API key")

### Teste 2: Frontend

Acesse: http://localhost:3000/partidas

Deve carregar as partidas sem erros no console.

---

## 🆘 Se o Erro Persistir

### Verificar se o Projeto Supabase está Ativo

1. No dashboard do Supabase
2. Verifique se o projeto **atjxmyrkzcumieuayapr** está **ACTIVE**
3. Se estiver pausado, clique em "Resume project"

### Verificar Permissões RLS (Row Level Security)

O backend usa a `service_role` key que **ignora RLS**. Se ainda assim não funcionar:

1. Vá em **Authentication** → **Policies**
2. Certifique-se que as políticas RLS estão corretas

### Logs do Backend

Verifique os logs do backend para mais detalhes:

```bash
tail -f /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/backend.log
```

---

## 📞 Precisa de Ajuda?

Se o erro persistir após seguir todos os passos:

1. Verifique se copiou a **service_role** key (não a anon key) no backend
2. Verifique se não há espaços extras nas chaves copiadas
3. Certifique-se que o projeto Supabase está ativo e não pausado
4. Tente gerar novas chaves no Supabase (Settings → API → Reset)

---

**Após seguir esses passos, o erro deve ser corrigido e você poderá ver as partidas com o player do YouTube funcionando! 🎱✨**

