# 🔧 Diagnóstico Completo e Solução - SinucaBet

## 📊 Resumo dos Problemas Encontrados

### 1️⃣ **Problema Inicial: Backend Não Estava Rodando**
**Erro:** `ERR_CONNECTION_REFUSED` na porta 3001

**Causa:** O servidor backend não foi iniciado.

**Solução Aplicada:**
- Instalado PM2 para gerenciamento robusto do processo
- Servidor iniciado com: `npx pm2 start server.js --name "sinucabet-backend"`

---

### 2️⃣ **Bug no Código: notFoundResponse Não Importado**
**Erro:** 
```
ReferenceError: notFoundResponse is not defined
at AuthController.getProfile (auth.controller.js:136:9)
```

**Causa:** A função `notFoundResponse` estava sendo usada mas não foi importada.

**Solução Aplicada:**
- Corrigido arquivo `/backend/controllers/auth.controller.js`
- Adicionada importação: `notFoundResponse` em `require('../utils/response.util')`

---

### 3️⃣ **Problema Atual: Token JWT Inválido**
**Erro:** `404 Not Found` - "Usuário não encontrado" / "Carteira não encontrada"

**Causa:** 
- O navegador tem um token JWT armazenado no localStorage
- Esse token contém um ID de usuário que não existe no banco de dados
- Provavelmente o banco foi resetado ou o usuário foi deletado

**Solução:**

#### Opção A - Limpar pelo Navegador (RECOMENDADO):
1. Abra o Console do Navegador (F12)
2. Vá para a aba **Application** (ou **Armazenamento** no Firefox)
3. Clique em **Local Storage** > `http://localhost:3000`
4. Clique com botão direito e escolha **Clear** ou delete as chaves:
   - `token`
   - `user`
5. Recarregue a página (F5)

#### Opção B - Usar a Página Helper:
1. Acesse: `http://localhost:3000/clear-storage.html`
2. Clique no botão para limpar
3. Volte para a home

#### Opção C - Via Console do Navegador:
```javascript
localStorage.clear();
location.reload();
```

---

## ✅ Status Atual do Sistema

### Backend
- **Status:** ✅ Online e estável
- **Porta:** 3001
- **Gerenciador:** PM2
- **Health Check:** `http://localhost:3001/health`

### Rotas Funcionando
- ✅ `GET /api/games` - Lista de jogos
- ✅ `GET /api/bets/recent` - Apostas recentes
- ✅ `POST /api/auth/login` - Login
- ✅ `POST /api/auth/register` - Registro

### Rotas com Autenticação (requerem login)
- 🔐 `GET /api/wallet` - Saldo da carteira
- 🔐 `GET /api/auth/profile` - Perfil do usuário
- 🔐 `POST /api/bets` - Criar aposta
- 🔐 `POST /api/wallet/deposit` - Fazer depósito

---

## 🚀 Comandos Úteis

### Gerenciar Backend com PM2

```bash
# Ver status
npx pm2 status

# Ver logs em tempo real
npx pm2 logs sinucabet-backend

# Reiniciar servidor
npx pm2 restart sinucabet-backend

# Parar servidor
npx pm2 stop sinucabet-backend

# Iniciar servidor
npx pm2 start server.js --name "sinucabet-backend"
```

### Usar o Script Helper (criado)

```bash
cd backend

# Iniciar servidor
./start-server.sh start

# Parar servidor
./start-server.sh stop

# Reiniciar servidor
./start-server.sh restart

# Ver status
./start-server.sh status

# Ver logs
./start-server.sh logs
```

---

## 🔄 Próximos Passos para o Usuário

1. **Limpar o localStorage** (use uma das opções acima)
2. **Criar uma nova conta** ou **fazer login** com usuário válido
3. **Testar as funcionalidades:**
   - Ver jogos disponíveis
   - Fazer depósito (gerará QR Code Pix)
   - Criar apostas
   - Ver saldo da carteira

---

## 📝 Notas Técnicas

### Por que aconteceu?

Durante o desenvolvimento, é comum que:
1. O banco de dados seja resetado com `seed.sql`
2. Os usuários antigos sejam deletados
3. O navegador mantenha tokens antigos no localStorage
4. Ao tentar usar esses tokens, o backend não encontra o usuário

### Prevenção Futura

Para evitar esse problema, o interceptor do Axios já está configurado para:
- Detectar erro 401 (não autorizado)
- Limpar automaticamente o localStorage
- Redirecionar para a página de login

No entanto, o erro 404 (não encontrado) não aciona essa limpeza automática, por isso é necessário fazer manualmente desta vez.

---

## ✅ Arquivos Modificados

1. `/backend/controllers/auth.controller.js` - Corrigida importação
2. `/backend/start-server.sh` - Script helper criado
3. `/backend/package.json` - PM2 adicionado como devDependency

---

## 🎯 Verificação Final

Execute estes comandos para confirmar que tudo está funcionando:

```bash
# Backend health check
curl http://localhost:3001/health

# Listar jogos (não requer autenticação)
curl http://localhost:3001/api/games

# Verificar que rotas protegidas retornam 401 sem token
curl http://localhost:3001/api/wallet
# Deve retornar: {"success":false,"message":"Token de autenticação não fornecido"}
```

---

**Data:** 04/11/2025  
**Status:** ✅ Backend funcionando - Aguardando limpeza do localStorage do frontend





