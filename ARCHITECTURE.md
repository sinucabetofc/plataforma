# 🏗️ Arquitetura do Projeto SinucaBet

**Data de Atualização:** 07/11/2025  
**Versão:** 2.0  
**Status:** ✅ Produção

---

## 📚 Índice de Documentação

Este documento serve como guia principal para navegar pela documentação completa do projeto.

---

## 📁 Estrutura de Pastas

```
SinucaBet/
├── 📄 README.md                          # Documento principal do projeto
├── 📄 ARCHITECTURE.md                    # Este arquivo
├── 📄 INICIAR_LOCALHOST.sh              # Script para iniciar projeto localmente
│
├── 📂 docs/                              # Documentação Geral
│   ├── 📂 admin/                         # Painel Administrativo
│   ├── 📂 analysis/                      # Análises e Diagnósticos
│   ├── 📂 api/                           # Documentação de APIs
│   ├── 📂 architecture/                  # Arquitetura do Sistema
│   ├── 📂 auth/                          # Sistema de Autenticação
│   ├── 📂 database/                      # Banco de Dados
│   ├── 📂 deployment/                    # Deploy e Infraestrutura
│   ├── 📂 features/                      # Features Implementadas
│   ├── 📂 fixes/                         # Correções Aplicadas
│   ├── 📂 guides/                        # Guias e Tutoriais
│   ├── 📂 migration/                     # Migrações de Dados
│   ├── 📂 sessions/                      # Resumos de Sessões
│   ├── 📂 sprints/                       # Sprints de Desenvolvimento
│   ├── 📂 tests/                         # Testes e Validações
│   └── 📄 INDEX.md                       # Índice completo da documentação
│
├── 📂 backend/                           # Backend (Node.js + Express)
│   ├── 📂 config/                        # Configurações
│   ├── 📂 controllers/                   # Controllers (Lógica de Rotas)
│   ├── 📂 docs/                          # Documentação do Backend
│   │   ├── 📂 api/                       # Documentação de APIs
│   │   ├── 📂 deployment/                # Deploy do Backend
│   │   ├── 📂 implementation/            # Implementações
│   │   └── 📂 testing/                   # Scripts de Teste
│   ├── 📂 middlewares/                   # Middlewares (Auth, Error Handler)
│   ├── 📂 routes/                        # Rotas da API
│   ├── 📂 services/                      # Services (Lógica de Negócio)
│   ├── 📂 supabase/                      # Configuração Supabase
│   │   └── 📂 migrations/                # Migrations SQL
│   ├── 📂 utils/                         # Utilitários
│   ├── 📂 validators/                    # Validadores
│   ├── 📄 server.js                      # Servidor Principal
│   ├── 📄 package.json                   # Dependências do Backend
│   └── 📄 README.md                      # Documentação do Backend
│
├── 📂 frontend/                          # Frontend (Next.js + React)
│   ├── 📂 components/                    # Componentes React
│   │   ├── 📂 admin/                     # Componentes Admin
│   │   ├── 📂 partidas/                  # Componentes de Partidas
│   │   ├── 📂 wallet/                    # Componentes de Carteira
│   │   └── ...
│   ├── 📂 contexts/                      # Context API (Auth, etc)
│   ├── 📂 docs/                          # Documentação do Frontend
│   │   ├── 📂 components/                # Docs de Componentes
│   │   ├── 📂 pages/                     # Docs de Páginas
│   │   └── 📂 styling/                   # Docs de Estilo/UI
│   ├── 📂 hooks/                         # Custom Hooks
│   ├── 📂 pages/                         # Páginas Next.js
│   │   ├── 📂 admin/                     # Páginas Admin
│   │   ├── 📂 partidas/                  # Páginas de Partidas
│   │   └── ...
│   ├── 📂 public/                        # Assets Públicos
│   ├── 📂 styles/                        # Estilos CSS
│   ├── 📂 utils/                         # Utilitários Frontend
│   ├── 📄 package.json                   # Dependências do Frontend
│   └── 📄 README.md                      # Documentação do Frontend
│
├── 📂 database/                          # Schemas e Documentação DB
│   ├── 📄 schema.sql                     # Schema PostgreSQL
│   ├── 📄 seed.sql                       # Dados de Teste
│   ├── 📄 queries.sql                    # Queries Úteis
│   ├── 📄 diagram.md                     # Diagrama ER
│   ├── 📄 README.md                      # Docs do Banco
│   └── 📄 SETUP.md                       # Setup do Banco
│
├── 📂 scripts/                           # Scripts Úteis
│   ├── 📂 database/                      # Scripts SQL
│   └── 📂 tests/                         # Scripts de Teste
│
└── 📂 admin/ (Deprecated)                # Admin Panel Antigo
```

---

## 🎯 Stack Tecnológica

### **Backend**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth + JWT
- **ORM:** Supabase Client (SQL direto)
- **Validação:** Custom validators
- **Rate Limiting:** express-rate-limit

### **Frontend**
- **Framework:** Next.js 14 (Pages Router)
- **UI Library:** React 18
- **Styling:** TailwindCSS
- **State:** Context API + React Query
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **HTTP Client:** Axios

### **Database**
- **SGBD:** PostgreSQL 14+
- **Hosting:** Supabase
- **Migrations:** SQL Scripts
- **Triggers:** PostgreSQL Functions

### **DevOps**
- **Frontend Deploy:** Vercel
- **Backend Deploy:** Railway / Render
- **Database:** Supabase Cloud
- **CI/CD:** GitHub Actions (futuro)

---

## 🗄️ Arquitetura de Banco de Dados

### **Tabelas Principais**

#### **1. Autenticação e Usuários**
```
users (Supabase Auth)
  ↓
wallet (1:1)
```

#### **2. Jogos e Séries**
```
players
  ↓
matches (1:N)
  ↓
series (1:N)
  ↓
bets (1:N)
```

#### **3. Transações**
```
users
  ↓
wallet
  ↓
transactions (histórico completo)
```

### **Relacionamentos Chave**
- `users` → `wallet` (1:1)
- `users` → `bets` (1:N)
- `matches` → `series` (1:N)
- `series` → `bets` (1:N)
- `wallet` → `transactions` (1:N)

---

## 🔐 Sistema de Autenticação

### **Fluxo de Registro**
```
1. Frontend envia dados → /api/auth/register
2. Backend valida CPF, email, telefone
3. Cria usuário no Supabase Auth
4. Sincroniza com tabela users
5. Cria wallet automática
6. Retorna token JWT
```

### **Fluxo de Login**
```
1. Frontend envia email/senha → /api/auth/login
2. Backend autentica via Supabase Auth
3. Busca dados do usuário + wallet
4. Retorna token JWT + dados
```

### **Níveis de Acesso**
- **user:** Usuário padrão (apostas, carteira)
- **admin:** Acesso total ao painel administrativo
- **influencer:** Futuro (comissões)
- **parceiro:** Futuro (criar jogos)

---

## 🎮 Fluxo de Apostas

### **1. Usuário Cria Aposta**
```
POST /api/bets
↓
Valida saldo do usuário
↓
Debita valor da wallet
↓
Cria transação tipo 'aposta' (negativo)
↓
Cria bet com status 'pendente'
↓
Tenta matching automático
↓
Se encontrou par → status: 'aceita'
Se não → status: 'pendente'
```

### **2. Matching Automático**
```
Nova aposta criada
↓
Busca apostas pendentes:
  - Mesmo valor
  - Jogador oposto
  - FIFO (primeiro que apostou)
↓
Se encontrou:
  - Atualiza ambas para 'aceita'
  - Vincula matched_bet_id
```

### **3. Resolução (Série Finaliza)**
```
Admin define vencedor
↓
Trigger: resolve_bets_on_serie_end
↓
Apostas ganhadoras → status: 'ganha'
Apostas perdedoras → status: 'perdida'
↓
Trigger: credit_winnings
↓
Credita ganhos (2x valor) na wallet
↓
Cria transação tipo 'ganho' (positivo)
```

---

## 📊 Features Implementadas

### **✅ Sistema de Autenticação**
- Registro com validação completa
- Login/Logout
- Recuperação de senha
- JWT + Supabase Auth

### **✅ Painel Administrativo**
- Dashboard com métricas
- Gestão de jogadores
- Gestão de partidas
- Gestão de séries
- Gestão de apostas
- Gestão de transações
- Gestão de usuários

### **✅ Sistema de Apostas**
- Criar apostas (múltiplo de R$ 10)
- Matching automático
- Cancelamento de apostas pendentes
- Resolução automática ao finalizar
- Histórico completo

### **✅ Sistema de Carteira**
- Depósitos (futuro: PIX)
- Saques (futuro: PIX)
- Histórico de transações
- Saldo disponível em tempo real

### **✅ Partidas ao Vivo**
- Lista de partidas disponíveis
- Detalhes da partida
- Player YouTube integrado
- Séries com placar ao vivo
- Múltiplas vantagens

### **✅ Múltiplas Vantagens**
- Sistema dinâmico add/remove
- Compatibilidade com dados antigos
- Exibição em cards e detalhes

---

## 🔧 Configuração de Ambiente

### **Variáveis de Ambiente**

#### **Backend (.env)**
```env
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=seu_secret_jwt_aqui
BCRYPT_ROUNDS=10

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## 🚀 Como Iniciar o Projeto

### **1. Clone o Repositório**
```bash
git clone https://github.com/sinucabetofc/plataforma.git
cd plataforma
```

### **2. Configure as Variáveis de Ambiente**
```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais

# Frontend
cp frontend/.env.example frontend/.env.local
# Edite frontend/.env.local
```

### **3. Instale Dependências**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### **4. Execute Migrations (Supabase)**
Execute as migrations na ordem:
1. `1008_populate_transaction_user_id.sql`
2. `1009_fix_triggers_add_user_id.sql`
3. `1010_fix_transaction_status_logic.sql`
4. `1011_fix_resolve_bets_trigger.sql`

### **5. Inicie os Servidores**
```bash
# Script automático (recomendado)
./INICIAR_LOCALHOST.sh

# OU manualmente:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **6. Acesse a Aplicação**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Admin:** http://localhost:3000/admin

---

## 📖 Documentação Detalhada

### **Para Desenvolvedores**
- [Guia de Setup Completo](docs/guides/GUIA_LOCALHOST.md)
- [Estrutura do Projeto](backend/docs/PROJECT_STRUCTURE.md)
- [Documentação de APIs](backend/docs/api/)
- [Implementações](backend/docs/implementation/)

### **Para Administradores**
- [Painel Admin - Guia](docs/admin/ADMIN_PANEL_GUIA.md)
- [Como Criar Jogos](docs/admin/ADMIN_PANEL_GUIA.md)
- [Gestão de Usuários](docs/admin/API_USUARIOS_ADMIN_ESTRUTURA.md)

### **Banco de Dados**
- [Schema Completo](database/schema.sql)
- [Diagrama ER](database/diagram.md)
- [Queries Úteis](database/queries.sql)
- [Migrations](docs/database/)

### **Features Específicas**
- [Sistema de Apostas](docs/features/MATCHING_AUTOMATICO_IMPLEMENTADO.md)
- [Transações](docs/features/TRANSACOES_COMPLETO.md)
- [Múltiplas Vantagens](docs/features/VANTAGENS_MULTIPLAS.md)

---

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **Backend não inicia**
- Verificar variáveis de ambiente
- Verificar conexão com Supabase
- Verificar porta 3001 disponível

#### **Erro de Autenticação**
- Verificar SUPABASE_SERVICE_ROLE_KEY
- Verificar JWT_SECRET
- Ver: [docs/auth/](docs/auth/)

#### **Apostas não aparecem**
- Executar migrations pendentes
- Ver: [docs/features/TROUBLESHOOTING_MINHAS_APOSTAS.md](docs/features/TROUBLESHOOTING_MINHAS_APOSTAS.md)

#### **Erros de Transação**
- Verificar triggers no banco
- Ver: [docs/database/EXECUTAR_TODAS_MIGRATIONS.md](docs/database/EXECUTAR_TODAS_MIGRATIONS.md)

---

## 📈 Próximos Passos

### **🔄 Em Desenvolvimento**
- [ ] Integração com PIX (depósitos/saques)
- [ ] Notificações push
- [ ] Sistema de ranking
- [ ] Apostas ao vivo (durante jogo)

### **🎯 Roadmap**
- **v2.1:** Integração PIX completa
- **v2.2:** App Mobile (React Native)
- **v3.0:** Apostas ao vivo
- **v3.5:** Sistema de afiliados

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Contato e Suporte

- **GitHub:** https://github.com/sinucabetofc/plataforma
- **Documentação:** Este repositório
- **Issues:** https://github.com/sinucabetofc/plataforma/issues

---

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Última Atualização:** 07/11/2025  
**Versão do Sistema:** 2.0.0  
**Status:** ✅ Produção

---

**🎱 SinucaBet - Aposte com Responsabilidade**

