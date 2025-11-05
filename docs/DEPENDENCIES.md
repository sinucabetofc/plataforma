# 📦 Dependências Instaladas - SinucaBet

Este documento lista todas as dependências instaladas no projeto.

## ✅ Status da Instalação

| Componente | Status | Pacotes | Versão Node |
|------------|--------|---------|-------------|
| **Backend** | ✅ Instalado | 628 pacotes | >=18.0.0 |
| **Frontend** | ✅ Instalado | 476 pacotes | >=18.0.0 |
| **Admin** | ✅ Instalado | 513 pacotes | >=18.0.0 |

---

## 🔧 Backend

### Dependências de Produção

#### Framework & Core
- `express@4.18.2` - Framework web
- `cors@2.8.5` - CORS middleware
- `helmet@7.1.0` - Security headers
- `compression@1.7.4` - Compressão de respostas
- `morgan@1.10.0` - HTTP request logger

#### Database & Auth
- `@supabase/supabase-js@2.39.0` - Cliente Supabase
- `jsonwebtoken@9.0.2` - JWT tokens
- `bcrypt@5.1.1` - Hash de senhas
- `uuid@9.0.1` - Geração de UUIDs

#### Validação & Segurança
- `zod@3.22.4` - Schema validation
- `express-rate-limit@7.1.5` - Rate limiting

#### Utilitários
- `dotenv@16.3.1` - Variáveis de ambiente
- `axios@1.6.2` - HTTP client

### Dependências de Desenvolvimento
- `nodemon@3.0.2` - Auto-restart
- `jest@29.7.0` - Testing framework
- `supertest@6.3.3` - HTTP testing
- `eslint@8.55.0` - Linter
- `prettier@3.1.1` - Code formatter

### Scripts Disponíveis
```bash
npm start          # Inicia servidor (produção)
npm run dev        # Inicia servidor (desenvolvimento)
npm test           # Executa testes
npm run lint       # Executa linter
npm run format     # Formata código
```

---

## 🎨 Frontend

### Dependências de Produção

#### Framework & Core
- `next@14.0.4` - Next.js framework
- `react@18.2.0` - React library
- `react-dom@18.2.0` - React DOM

#### Supabase & API
- `@supabase/supabase-js@2.39.0` - Cliente Supabase
- `axios@1.6.2` - HTTP client
- `@tanstack/react-query@5.14.2` - Data fetching & caching

#### State Management
- `zustand@4.4.7` - State management

#### Forms & Validation
- `react-hook-form@7.49.2` - Form handling
- `zod@3.22.4` - Schema validation
- `@hookform/resolvers@3.3.3` - Form resolvers

#### UI Components (Radix UI)
- `@radix-ui/react-dialog@1.0.5`
- `@radix-ui/react-dropdown-menu@2.0.6`
- `@radix-ui/react-label@2.0.2`
- `@radix-ui/react-select@2.0.0`
- `@radix-ui/react-separator@1.0.3`
- `@radix-ui/react-slot@1.0.2`
- `@radix-ui/react-tabs@1.0.4`
- `@radix-ui/react-toast@1.1.5`

#### Styling
- `tailwindcss@3.4.0` - CSS framework
- `tailwindcss-animate@latest` - Animações
- `clsx@2.0.0` - Class names utility
- `tailwind-merge@2.2.0` - Merge Tailwind classes
- `class-variance-authority@0.7.0` - Variant management

#### Icons & UI
- `lucide-react@0.303.0` - Icon library
- `react-hot-toast@2.4.1` - Toast notifications

#### Utilitários
- `date-fns@3.0.6` - Date utilities

### Dependências de Desenvolvimento
- `typescript@5.3.3` - TypeScript
- `@types/node@20.10.6` - Node types
- `@types/react@18.2.46` - React types
- `@types/react-dom@18.2.18` - React DOM types
- `eslint@8.56.0` - Linter
- `eslint-config-next@14.0.4` - Next.js ESLint config
- `prettier@3.1.1` - Code formatter
- `prettier-plugin-tailwindcss@0.5.9` - Tailwind formatter
- `postcss@8.4.32` - CSS processor
- `autoprefixer@10.4.16` - CSS prefixer

### Scripts Disponíveis
```bash
npm run dev        # Inicia em desenvolvimento (porta 3000)
npm run build      # Build para produção
npm start          # Inicia build de produção
npm run lint       # Executa linter
npm run format     # Formata código
```

---

## 👨‍💼 Admin Panel

### Dependências de Produção

#### Framework & Core
- `next@14.0.4` - Next.js framework
- `react@18.2.0` - React library
- `react-dom@18.2.0` - React DOM

#### Supabase & API
- `@supabase/supabase-js@2.39.0` - Cliente Supabase
- `axios@1.6.2` - HTTP client
- `@tanstack/react-query@5.14.2` - Data fetching

#### Tables & Data
- `@tanstack/react-table@8.11.2` - Table component
- `recharts@2.10.3` - Gráficos e charts

#### State Management
- `zustand@4.4.7` - State management

#### Forms & Validation
- `react-hook-form@7.49.2` - Form handling
- `zod@3.22.4` - Schema validation
- `@hookform/resolvers@3.3.3` - Form resolvers

#### UI Components (Radix UI)
- `@radix-ui/react-dialog@1.0.5`
- `@radix-ui/react-dropdown-menu@2.0.6`
- `@radix-ui/react-label@2.0.2`
- `@radix-ui/react-select@2.0.0`
- `@radix-ui/react-separator@1.0.3`
- `@radix-ui/react-slot@1.0.2`
- `@radix-ui/react-tabs@1.0.4`
- `@radix-ui/react-toast@1.1.5`
- `@radix-ui/react-switch@1.0.3`

#### Styling
- `tailwindcss@3.4.0` - CSS framework
- `tailwindcss-animate@latest` - Animações
- `clsx@2.0.0` - Class names utility
- `tailwind-merge@2.2.0` - Merge Tailwind classes
- `class-variance-authority@0.7.0` - Variant management

#### Icons & UI
- `lucide-react@0.303.0` - Icon library
- `react-hot-toast@2.4.1` - Toast notifications

#### Utilitários
- `date-fns@3.0.6` - Date utilities

### Dependências de Desenvolvimento
- `typescript@5.3.3` - TypeScript
- `@types/node@20.10.6` - Node types
- `@types/react@18.2.46` - React types
- `@types/react-dom@18.2.18` - React DOM types
- `eslint@8.56.0` - Linter
- `eslint-config-next@14.0.4` - Next.js ESLint config
- `prettier@3.1.1` - Code formatter
- `prettier-plugin-tailwindcss@0.5.9` - Tailwind formatter
- `postcss@8.4.32` - CSS processor
- `autoprefixer@10.4.16` - CSS prefixer

### Scripts Disponíveis
```bash
npm run dev        # Inicia em desenvolvimento (porta 3002)
npm run build      # Build para produção
npm start          # Inicia build de produção (porta 3002)
npm run lint       # Executa linter
npm run format     # Formata código
```

---

## 🔧 Arquivos de Configuração Criados

### Backend
- ✅ `package.json` - Configuração do projeto
- ✅ `.env.example` - Template de variáveis de ambiente

### Frontend
- ✅ `package.json` - Configuração do projeto
- ✅ `tailwind.config.js` - Configuração do Tailwind
- ✅ `postcss.config.js` - Configuração do PostCSS
- ✅ `next.config.js` - Configuração do Next.js
- ✅ `tsconfig.json` - Configuração do TypeScript
- ✅ `.env.example` - Template de variáveis de ambiente

### Admin
- ✅ `package.json` - Configuração do projeto
- ✅ `tailwind.config.js` - Configuração do Tailwind
- ✅ `postcss.config.js` - Configuração do PostCSS
- ✅ `next.config.js` - Configuração do Next.js
- ✅ `tsconfig.json` - Configuração do TypeScript
- ✅ `.env.example` - Template de variáveis de ambiente

---

## 🚀 Próximos Passos

### 1. Configurar Variáveis de Ambiente

```bash
# Backend
cd backend
cp .env.example .env
# Editar .env com suas credenciais

# Frontend
cd ../frontend
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Admin
cd ../admin
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

### 2. Iniciar Servidores

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Admin (opcional)
cd admin && npm run dev
```

### 3. Acessar Aplicações

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3002

---

## 📊 Estatísticas

- **Total de Pacotes Instalados**: 1,617
- **Tempo Total de Instalação**: ~45 segundos
- **Espaço em Disco**: ~800 MB (node_modules)
- **Vulnerabilidades Encontradas**: 0 ✅

---

## ⚠️ Avisos de Deprecated

Alguns pacotes deprecated foram identificados mas não afetam o funcionamento:

- `inflight@1.0.6` - Usado internamente, será atualizado automaticamente
- `glob@7.2.3` - Usado internamente, será atualizado automaticamente
- `eslint@8.57.1` - Migrar para v9 no futuro
- `supertest@6.3.4` - Atualizar para v7.1.3+ quando necessário

**Nenhuma ação imediata é necessária.**

---

## 🔄 Manutenção

### Atualizar Dependências

```bash
# Verificar atualizações disponíveis
npm outdated

# Atualizar todas (cuidado!)
npm update

# Atualizar específica
npm install package@latest
```

### Auditoria de Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente (quando possível)
npm audit fix
```

---

**Última Verificação**: 04/11/2025  
**Status**: ✅ Todas as dependências instaladas com sucesso!

