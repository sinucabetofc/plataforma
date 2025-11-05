# 🏗️ Estrutura do Projeto SinucaBet

## 📁 Visão Geral

```
SinucaBet/
├── 📂 backend/              # Backend API (Node.js + Express + Supabase)
├── 📂 frontend/             # Frontend Web App (Next.js)
├── 📂 admin/                # Painel Administrativo
├── 📂 database/             # Schemas e Queries SQL
├── 📄 README.md             # Documentação principal
├── 📄 TROUBLESHOOTING.md    # Guia de resolução de problemas
└── 📄 PROJECT-STRUCTURE.md  # Este arquivo
```

---

## 🔧 Backend

**Tecnologias:** Node.js, Express, Supabase, JWT

```
backend/
├── controllers/           # Controladores (lógica de negócio)
│   ├── authController.js        # Autenticação e registro
│   ├── walletController.js      # Gestão de carteira
│   ├── gameController.js        # Gestão de jogos
│   ├── betController.js         # Sistema de apostas
│   └── transactionController.js # Transações financeiras
│
├── models/                # Models/Schemas (Supabase)
│   ├── User.js                  # Modelo de usuário
│   ├── Wallet.js                # Modelo de carteira
│   ├── Game.js                  # Modelo de jogo
│   ├── Bet.js                   # Modelo de aposta
│   └── Transaction.js           # Modelo de transação
│
├── routes/                # Rotas da API
│   ├── authRoutes.js            # POST /api/auth/login, /register
│   ├── walletRoutes.js          # GET/PUT /api/wallet
│   ├── gameRoutes.js            # GET/POST /api/games
│   ├── betRoutes.js             # GET/POST /api/bets
│   └── transactionRoutes.js     # GET /api/transactions
│
├── services/              # Serviços externos e lógica complexa
│   ├── wooviService.js          # Integração Woovi (PIX)
│   └── betMatchingService.js    # Algoritmo de matching de apostas
│
├── utils/                 # Utilitários e helpers
│   ├── authMiddleware.js        # Middleware de autenticação JWT
│   └── validation.js            # Validações Zod
│
├── app.js                 # Configuração do Express
└── server.js              # Inicialização do servidor
```

### 🔗 Endpoints Principais

#### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado

#### Carteira
- `GET /api/wallet` - Buscar saldo
- `POST /api/wallet/deposit` - Iniciar depósito
- `POST /api/wallet/withdraw` - Solicitar saque
- `GET /api/wallet/transactions` - Histórico

#### Jogos
- `GET /api/games` - Listar jogos
- `GET /api/games/:id` - Detalhes do jogo
- `POST /api/games` - Criar jogo (admin)
- `PUT /api/games/:id` - Atualizar jogo (admin)

#### Apostas
- `POST /api/bets` - Fazer aposta
- `GET /api/bets` - Minhas apostas
- `GET /api/bets/:id` - Detalhes da aposta

---

## 🎨 Frontend

**Tecnologias:** Next.js 14, React, TailwindCSS, Shadcn UI

```
frontend/
├── pages/                 # Páginas (Next.js App Router)
│   ├── index.js                 # Home / Listagem de jogos
│   ├── login.js                 # Login
│   ├── register.js              # Cadastro
│   ├── wallet.js                # Carteira / Depósitos
│   ├── games.js                 # Listagem completa de jogos
│   ├── game/
│   │   └── [id].js              # Detalhes do jogo + apostar
│   └── profile.js               # Perfil do usuário
│
├── components/            # Componentes reutilizáveis
│   ├── Header.js                # Cabeçalho + navegação
│   ├── Footer.js                # Rodapé
│   ├── GameCard.js              # Card de jogo
│   ├── BetButton.js             # Botão de apostar
│   ├── TransactionCard.js       # Card de transação
│   └── Loader.js                # Loading spinner
│
├── styles/                # Estilos globais
│   └── globals.css              # CSS global + Tailwind
│
└── utils/                 # Utilitários frontend
    ├── api.js                   # Cliente API (axios/fetch)
    └── auth.js                  # Helpers de autenticação
```

### 📄 Páginas

| Página | Rota | Descrição |
|--------|------|-----------|
| **Home** | `/` | Listagem de jogos abertos |
| **Login** | `/login` | Autenticação |
| **Cadastro** | `/register` | Registro de novo usuário |
| **Carteira** | `/wallet` | Saldo, depósitos e saques |
| **Jogos** | `/games` | Lista completa de jogos |
| **Detalhes do Jogo** | `/game/[id]` | Informações + fazer aposta |
| **Perfil** | `/profile` | Dados do usuário e histórico |

---

## 👨‍💼 Admin

**Tecnologias:** Next.js, React Admin, TailwindCSS

```
admin/
├── pages/                 # Páginas administrativas
│   ├── index.js                 # Dashboard
│   ├── users.js                 # Gestão de usuários
│   ├── withdrawals.js           # Aprovação de saques
│   ├── games.js                 # Criar/editar jogos
│   └── transactions.js          # Monitorar transações
│
└── components/            # Componentes admin
    ├── UserCard.js              # Card de usuário
    ├── WithdrawalCard.js        # Card de saque pendente
    └── GameAdminCard.js         # Card de jogo (admin view)
```

### 🔐 Funcionalidades Admin

- ✅ Visualizar e gerenciar usuários
- ✅ Aprovar/rejeitar saques
- ✅ Criar e editar jogos
- ✅ Definir resultados de jogos
- ✅ Monitorar transações
- ✅ Estatísticas da plataforma
- ✅ Gestão de apostas

---

## 🗄️ Database

**Tecnologia:** PostgreSQL (via Supabase)

```
database/
├── schema.sql             # Schema completo do banco
├── seed.sql               # Dados de teste
├── queries.sql            # Queries úteis
├── diagram.md             # Diagrama ER
├── SETUP.md               # Guia de instalação
└── README.md              # Documentação do BD
```

### 📊 Tabelas Principais

1. **users** - Usuários da plataforma
2. **wallet** - Carteiras digitais
3. **games** - Jogos de sinuca
4. **bets** - Apostas realizadas
5. **transactions** - Histórico financeiro
6. **bet_matches** - Pareamento de apostas

Ver documentação completa em `database/README.md`

---

## 🚀 Fluxo de Trabalho

### 1️⃣ Setup Inicial

```bash
# 1. Clonar/entrar no projeto
cd SinucaBet

# 2. Configurar Supabase
# - Criar projeto no Supabase
# - Executar database/schema.sql
# - (Opcional) Executar database/seed.sql

# 3. Configurar Backend
cd backend
npm install
cp .env.example .env
# Configurar variáveis de ambiente
npm run dev

# 4. Configurar Frontend
cd ../frontend
npm install
cp .env.example .env
# Configurar variáveis de ambiente
npm run dev

# 5. Configurar Admin (opcional)
cd ../admin
npm install
cp .env.example .env
npm run dev
```

### 2️⃣ Desenvolvimento

```bash
# Backend (porta 3001)
cd backend && npm run dev

# Frontend (porta 3000)
cd frontend && npm run dev

# Admin (porta 3002)
cd admin && npm run dev
```

### 3️⃣ Build para Produção

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build

# Admin
cd admin && npm run build
```

---

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Woovi (PIX)
WOOVI_APP_ID=your-app-id
WOOVI_API_KEY=your-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Supabase (público)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Admin (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Auth
NEXT_PUBLIC_ADMIN_SECRET=your-admin-secret
```

---

## 📦 Dependências Principais

### Backend

```json
{
  "express": "^4.18.2",
  "@supabase/supabase-js": "^2.38.0",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "zod": "^3.22.4",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "axios": "^1.6.0"
}
```

### Frontend

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "tailwindcss": "^3.3.0",
  "@shadcn/ui": "latest",
  "axios": "^1.6.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0"
}
```

---

## 🧪 Testes

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E (Cypress)
cd frontend && npm run cypress
```

---

## 📝 Convenções de Código

### Nomenclatura

- **Arquivos:** camelCase para JS/TS, PascalCase para componentes
- **Componentes React:** PascalCase
- **Funções:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **Rotas API:** kebab-case

### Commits

Usar Conventional Commits:

```
feat: adiciona sistema de matching de apostas
fix: corrige cálculo de saldo bloqueado
docs: atualiza README com instruções de setup
refactor: reorganiza estrutura de pastas
test: adiciona testes para betController
```

---

## 🎯 Roadmap

### Fase 1 - MVP ✅
- [x] Estrutura de pastas
- [x] Schema de banco de dados
- [x] Documentação completa
- [ ] Backend API básico
- [ ] Frontend páginas principais
- [ ] Integração Supabase

### Fase 2 - Features Core
- [ ] Sistema de autenticação completo
- [ ] Sistema de matching de apostas
- [ ] Integração Woovi (PIX)
- [ ] Painel administrativo
- [ ] Notificações em tempo real

### Fase 3 - Melhorias
- [ ] Chat entre apostadores
- [ ] Sistema de ranking
- [ ] Histórico detalhado
- [ ] Análises e estatísticas
- [ ] Programa de afiliados

### Fase 4 - Mobile
- [ ] App React Native
- [ ] Push notifications
- [ ] Apostas offline (sync)

---

## 📚 Documentação Adicional

- [README.md](./README.md) - Visão geral do projeto
- [database/README.md](./database/README.md) - Documentação do banco
- [database/SETUP.md](./database/SETUP.md) - Setup do banco
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solução de problemas

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

- 📧 Email: dev@sinucabet.com
- 💬 Discord: [SinucaBet Community](#)
- 📖 Docs: [docs.sinucabet.com](#)

---

**Estrutura criada em:** Novembro 2025  
**Última atualização:** 04/11/2025

