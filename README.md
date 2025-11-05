# 🎱 SinucaBet - Plataforma de Apostas de Sinuca

> Intermediador de apostas de sinuca com sistema de matching peer-to-peer

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📖 Sobre o Projeto

**SinucaBet** é uma plataforma completa de intermediação de apostas em partidas de sinuca. O sistema permite que usuários apostem em jogadores específicos, com pareamento automático de apostas de lados opostos (matching), garantindo liquidez e justiça nas apostas.

### ✨ Características Principais

- 🎯 **Sistema de Matching Inteligente**: Pareamento automático de apostas opostas
- 💰 **Carteira Digital**: Gestão de saldo com bloqueio automático em apostas ativas
- 🔐 **Segurança**: UUIDs, criptografia de senhas, validação de dados
- 📊 **Auditoria Completa**: Histórico detalhado de todas as transações
- 💳 **Integração PIX**: Suporte a diferentes tipos de chave PIX
- 🎲 **Múltiplas Modalidades**: Bolas lisas, numeradas, sinuca brasileira, etc.
- 📈 **Estatísticas em Tempo Real**: Ranking, histórico, análises

## 🏗️ Arquitetura

```
SinucaBet/
├── database-schema.sql        # Schema completo do PostgreSQL
├── database-seed.sql          # Dados de teste/desenvolvimento
├── database-queries.sql       # Queries úteis e exemplos
├── database-diagram.md        # Diagrama ER visual
├── README-DATABASE.md         # Documentação técnica do BD
├── DATABASE-SETUP.md          # Guia de instalação
└── README.md                  # Este arquivo
```

## 🗄️ Modelo de Dados

### Tabelas Principais

1. **users** - Usuários da plataforma
2. **wallet** - Carteiras digitais (1:1 com users)
3. **games** - Partidas de sinuca
4. **bets** - Apostas realizadas
5. **transactions** - Histórico financeiro
6. **bet_matches** - Pareamento de apostas

### Relacionamentos

```
users (1) ──── (1) wallet
  │
  ├── (1:N) ──── bets
  │
  └── (1:N) ──── transactions

games (1) ──── (N) bets
  │
  └── (1:N) ──── bet_matches

bets (1) ──── (N) bet_matches
```

Para detalhes completos, consulte [README-DATABASE.md](README-DATABASE.md) e [database-diagram.md](database-diagram.md).

## 🚀 Quick Start

### Pré-requisitos

- PostgreSQL 14+
- Node.js 18+ (para backend)
- npm/yarn/pnpm

### Instalação do Banco de Dados

```bash
# 1. Criar database
createdb sinucabet

# 2. Executar schema
psql -d sinucabet -f database-schema.sql

# 3. (Opcional) Popular com dados de teste
psql -d sinucabet -f database-seed.sql
```

Para instruções detalhadas, consulte [DATABASE-SETUP.md](DATABASE-SETUP.md).

### Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sinucabet

# App
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=seu_secret_jwt_aqui
BCRYPT_ROUNDS=10

# PIX (exemplo - integrar com gateway de pagamento)
PIX_API_KEY=sua_chave_api
PIX_API_URL=https://api.gateway.com
```

## 💡 Funcionalidades

### Para Usuários

- ✅ Cadastro e autenticação segura
- ✅ Depósitos via PIX
- ✅ Navegação de jogos disponíveis
- ✅ Apostas em múltiplos de R$ 10
- ✅ Acompanhamento de apostas ativas
- ✅ Histórico completo de transações
- ✅ Saques via PIX
- ✅ Estatísticas pessoais

### Para Administradores

- ✅ Criação e gestão de jogos
- ✅ Definição de resultados
- ✅ Monitoramento de apostas
- ✅ Controle financeiro
- ✅ Relatórios e analytics
- ✅ Gestão de usuários

## 🔒 Segurança

### Medidas Implementadas

- 🔐 Senhas criptografadas com bcrypt
- 🆔 UUIDs para prevenir enumeração
- ✅ Validação rigorosa de inputs
- 🛡️ Integridade referencial no BD
- 📝 Auditoria com timestamps
- 🔍 Constraints para regras de negócio
- 🚫 Proteção contra SQL injection (prepared statements)

### Compliance

- ✅ CPF validado e único
- ✅ Email validado e único
- ✅ Telefone no formato internacional
- ✅ Chave PIX validada por tipo
- ✅ Transações rastreáveis

## 📊 Regras de Negócio

### Apostas

- Valor mínimo: R$ 10,00
- Valores devem ser múltiplos de R$ 10
- Apostas bloqueiam saldo até resolução
- Matching automático de apostas opostas
- Taxa de 5% sobre ganhos

### Transações

- **Depósito**: Taxa de 2%
- **Aposta**: Sem taxa (taxa aplicada nos ganhos)
- **Ganho**: Taxa de 5%
- **Saque**: Taxa de 2%

### Jogos

- Status: open → in_progress → finished
- Resultado definido apenas quando finalizado
- Apostas aceitas apenas em jogos "open"
- Sistema de séries (melhor de N)

## 🧪 Testes

### Dados de Seed

O arquivo `database-seed.sql` inclui:

- 10 usuários de teste
- Carteiras pré-carregadas
- 10 jogos (abertos, em andamento, finalizados)
- ~30 apostas de exemplo
- Transações completas
- Pareamentos realizados

**Credenciais de teste:**
- Email: `joao.silva@sinucabet.com` (ou qualquer outro do seed)
- Senha: `senha123`

⚠️ **ATENÇÃO**: Não usar dados de seed em produção!

## 📈 Performance

### Índices Otimizados

- Campos únicos (email, cpf, user_id)
- Foreign keys (todas indexadas)
- Campos de busca frequente (status, created_at)
- Índices compostos para queries complexas
- GIN para busca em JSONB

### Estimativas

- Busca de usuário: O(log n)
- Listagem de jogos: O(log n)
- Matching de apostas: O(log n)
- Histórico: O(log n)

## 🛠️ Stack Tecnológica (Sugerida)

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Next.js 14+ (App Router)
- **ORM**: Prisma ou Drizzle
- **Validação**: Zod
- **Auth**: NextAuth.js

### Frontend
- **Framework**: Next.js 14+ (React)
- **Styling**: TailwindCSS
- **Components**: Shadcn UI + Radix UI
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod

### Database
- **SGBD**: PostgreSQL 14+
- **Migrations**: Prisma Migrate ou Drizzle Kit

### DevOps
- **Hosting**: Vercel (Frontend + API)
- **Database**: Supabase ou Neon
- **Monitoring**: Sentry, LogRocket

## 📁 Estrutura Sugerida do Projeto

```
SinucaBet/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rotas de autenticação
│   ├── (dashboard)/         # Área logada
│   ├── api/                 # API Routes
│   └── layout.tsx
├── components/              # Componentes React
│   ├── ui/                  # Shadcn UI
│   ├── auth/
│   ├── games/
│   ├── bets/
│   └── wallet/
├── lib/                     # Utilitários
│   ├── db/                  # Prisma client
│   ├── auth/                # Autenticação
│   ├── validations/         # Schemas Zod
│   └── utils/
├── prisma/                  # Schema Prisma
│   ├── schema.prisma
│   └── migrations/
├── public/                  # Assets estáticos
├── database-*.sql          # Arquivos SQL
└── *.md                    # Documentação
```

## 🚦 Roadmap

### v1.0 - MVP (Atual)
- [x] Schema de banco de dados
- [x] Documentação completa
- [x] Dados de seed
- [ ] API Backend
- [ ] Interface de usuário
- [ ] Sistema de autenticação
- [ ] Integração PIX

### v2.0 - Expansão
- [ ] Sistema de roles (Admin, Moderador)
- [ ] Notificações push
- [ ] Chat entre apostadores
- [ ] Live streaming de jogos
- [ ] Sistema de ranking
- [ ] Programa de afiliados

### v3.0 - Avançado
- [ ] App mobile (React Native)
- [ ] Apostas ao vivo
- [ ] Múltiplas moedas
- [ ] IA para análise de jogos
- [ ] Marketplace de dicas

## 📚 Documentação

### 📖 Documentação Principal
- **[docs/](./docs/)** - Pasta com toda a documentação
- [docs/QUICK-START.md](./docs/QUICK-START.md) ⚡ - Início rápido
- [docs/SETUP-COMPLETE.md](./docs/SETUP-COMPLETE.md) ✅ - Status do projeto
- [docs/PROJECT-STRUCTURE.md](./docs/PROJECT-STRUCTURE.md) 🏗️ - Estrutura detalhada
- [docs/SUPABASE-CONFIG.md](./docs/SUPABASE-CONFIG.md) 🔐 - Configuração Supabase
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) 🆘 - Solução de problemas
- [docs/DEPENDENCIES.md](./docs/DEPENDENCIES.md) 📦 - Dependências instaladas

### 🗄️ Documentação do Banco de Dados
- [database/README.md](./database/README.md) - Documentação técnica do BD
- [database/SETUP.md](./database/SETUP.md) - Guia de instalação do BD
- [database/diagram.md](./database/diagram.md) - Diagrama ER
- [database/queries.sql](./database/queries.sql) - Queries úteis

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 License

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **SinucaBet Development Team**

## 🙏 Agradecimentos

- Comunidade PostgreSQL
- Comunidade Next.js
- Shadcn UI
- Todos os contribuidores

## 📞 Contato

- Website: [sinucabet.com](https://sinucabet.com) (em breve)
- Email: contato@sinucabet.com
- Twitter: [@sinucabet](https://twitter.com/sinucabet)

---

**Feito com ❤️ e ☕ pela equipe SinucaBet**

🎱 *"Aposte com responsabilidade"*

