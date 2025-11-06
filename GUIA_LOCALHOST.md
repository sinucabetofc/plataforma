# 🚀 Guia Completo - Rodar em Localhost

## 📋 Pré-requisitos

- ✅ Node.js 18+ instalado
- ✅ npm 9+ instalado
- ✅ Projeto Supabase ativo

---

## 🔧 SETUP INICIAL

### 1️⃣ Criar Arquivo `.env` no Backend

**Arquivo:** `backend/.env`

```env
# Supabase Configuration
SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui

# JWT Configuration
JWT_SECRET=sua_chave_secreta_super_forte_aqui_min_32_caracteres

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:** 
- Pegue as chaves do Supabase em: https://supabase.com/dashboard → Seu Projeto → Settings → API
- Use `service_role key` (não a anon key) para `SUPABASE_SERVICE_ROLE_KEY`

---

### 2️⃣ Criar Arquivo `.env.local` no Frontend

**Arquivo:** `frontend/.env.local`

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (apenas anon key para frontend)
NEXT_PUBLIC_SUPABASE_URL=https://atjxmyrkzcumieuayapr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

---

## 📦 INSTALAR DEPENDÊNCIAS

### Backend

```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/backend
npm install
```

**Dependências adicionais (se precisar da versão alternativa):**
```bash
npm install bcryptjs uuid
```

### Frontend

```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/frontend
npm install
```

---

## 🚀 RODAR O PROJETO

### Opção 1: Rodar Backend e Frontend Separadamente

**Terminal 1 - Backend:**
```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet/frontend
npm run dev
```

### Opção 2: Script Único (Recomendado)

Vou criar um script para rodar tudo de uma vez!

---

## 🌐 ACESSAR O SISTEMA

Após rodar os comandos acima:

- 🎨 **Frontend:** http://localhost:3000
- ⚙️ **Backend API:** http://localhost:3001
- 📊 **Admin Panel:** http://localhost:3000/admin/login

---

## 🔍 TESTAR SE ESTÁ FUNCIONANDO

### Teste 1: Backend Health Check

```bash
curl http://localhost:3001/api/auth/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Serviço de autenticação está funcionando",
  "data": {
    "timestamp": "2025-11-06T...",
    "service": "auth"
  }
}
```

### Teste 2: Frontend

Abra http://localhost:3000 e veja se a página inicial carrega.

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot connect to database"

**Solução:** Verifique se as chaves do Supabase estão corretas no `.env`

### Erro: "Port 3000 already in use"

**Solução:**
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
cd frontend
PORT=3001 npm run dev
```

### Erro: "Module not found"

**Solução:**
```bash
# Reinstalar dependências
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro: "CORS blocked"

**Solução:** Certifique-se que `FRONTEND_URL` no backend `.env` está como `http://localhost:3000`

---

## 🔐 CREDENCIAIS ADMIN (Localhost)

**Email:** `vini@admin.com`  
**Senha:** *(a que você configurou)*

Ou crie um novo admin via SQL no Supabase.

---

## 📝 SCRIPTS ÚTEIS

### Backend

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start

# Rodar testes
npm test

# Linter
npm run lint
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar produção local
npm run build && npm start

# Linter
npm run lint
```

---

## 🗄️ BANCO DE DADOS LOCAL (Opcional)

Se quiser rodar Supabase localmente:

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# Iniciar Supabase local
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet
supabase start

# Ver credenciais locais
supabase status
```

**Atualizar `.env` com URLs locais:**
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (da saída do supabase status)
```

---

## 🔄 SINCRONIZAR COM PRODUÇÃO

### Puxar Schema do Supabase (Produção)

```bash
# Fazer dump das migrations
npx supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.atjxmyrkzcumieuayapr.supabase.co:5432/postgres" -f backend/supabase/dump.sql
```

---

## ⚡ MODO DESENVOLVIMENTO RÁPIDO

Crie este script na raiz do projeto:

**Arquivo:** `dev.sh`

```bash
#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🎱 Iniciando SinucaBet em modo desenvolvimento...${NC}"

# Verificar se .env existe
if [ ! -f backend/.env ]; then
    echo -e "${BLUE}⚠️  Arquivo backend/.env não encontrado!${NC}"
    echo "Copie backend/.env.example para backend/.env e configure"
    exit 1
fi

# Função para matar processos ao sair
cleanup() {
    echo -e "\n${GREEN}🛑 Encerrando servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Iniciar backend
echo -e "${BLUE}🔧 Iniciando Backend...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 3

# Iniciar frontend
echo -e "${BLUE}🎨 Iniciando Frontend...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Servidores iniciados!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}⚙️  Backend:  http://localhost:3001${NC}"
echo -e "${GREEN}Pressione Ctrl+C para encerrar${NC}"

# Manter script rodando
wait
```

**Uso:**
```bash
chmod +x dev.sh
./dev.sh
```

---

**Dúvidas?** Consulte os arquivos de documentação na pasta `docs/`!

