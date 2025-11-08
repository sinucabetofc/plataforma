# 🎱 SinucaBet - Frontend Usuário

Interface web responsiva para usuários da plataforma SinucaBet, permitindo cadastro, login, visualização de jogos, apostas, gerenciamento de carteira digital e perfil.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com SSR e SSG
- **React 18** - Biblioteca JavaScript para interfaces
- **TailwindCSS** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e sem estilo
- **React Query** - Gerenciamento de estado assíncrono
- **Zustand** - State management global
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos
- **React Hot Toast** - Notificações elegantes
- **date-fns** - Manipulação de datas

## 📁 Estrutura do Projeto

```
frontend/
├── components/          # Componentes reutilizáveis
│   ├── Header.js       # Menu de navegação
│   ├── Footer.js       # Rodapé
│   ├── Loader.js       # Componentes de loading
│   ├── GameCard.js     # Card de jogo
│   ├── BetButton.js    # Botões de aposta
│   └── TransactionCard.js # Card de transação
├── pages/              # Páginas Next.js
│   ├── _app.js        # Configuração global
│   ├── _document.js   # HTML base
│   ├── index.js       # Home
│   ├── login.js       # Login
│   ├── register.js    # Cadastro em 3 etapas
│   ├── wallet.js      # Carteira digital
│   ├── games.js       # Lista de jogos
│   ├── profile.js     # Perfil do usuário
│   └── game/
│       └── [id].js    # Detalhes e apostas do jogo
├── utils/              # Utilitários
│   ├── api.js         # Funções de API
│   └── auth.js        # Gerenciamento de autenticação
├── styles/
│   └── globals.css    # Estilos globais
└── public/            # Arquivos estáticos

```

## 🎨 Design System

### Cores

- **Fundo:** `#000000` (Preto)
- **Verde Principal:** `#1b4d3e`
- **Verde Claro:** `#2d6d56`
- **Verde Escuro:** `#0f3529`
- **Sucesso:** `#22c55e`
- **Aviso:** `#eab308`
- **Erro:** `#ef4444`

### Tipografia

- **Fonte:** Sans-serif (system fonts)
- **Tamanhos:** 18-20px (base), 16px (mobile)
- **Acessibilidade:** Mobile-first, público 40+

## 🔧 Instalação

1. **Clone o repositório:**
```bash
cd frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. **Execute em desenvolvimento:**
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o ESLint
- `npm run format` - Formata código com Prettier

## 🎯 Páginas e Funcionalidades

### 1. **Home (index.js)**
- Tela de boas-vindas
- Botões para Login e Cadastro
- Features da plataforma

### 2. **Cadastro (register.js)**
**Etapa 1:** Dados Básicos
- Nome, Email, Senha

**Etapa 2:** Documentos
- Telefone, CPF

**Etapa 3:** Chave Pix
- Tipo de chave (Email, CPF, Telefone, Aleatória)
- Chave Pix para receber saques

### 3. **Login (login.js)**
- Email e Senha
- Autenticação JWT
- Redirecionamento para Wallet

### 4. **Carteira (wallet.js)**
- Saldo disponível e bloqueado
- Depósito via Pix (integração Woovi)
- Saque com taxa de 8%
- Histórico de transações

### 5. **Jogos (games.js)**
- Lista de jogos abertos
- Jogos em andamento
- Atualização automática (10s)
- Estatísticas gerais

### 6. **Jogo Individual (game/[id].js)**
- Detalhes completos do jogo
- Players, modalidade, séries, vantagens
- Botões de aposta (R$10, R$20, R$50, customizado)
- Atualização automática (5s)
- Feedback visual em tempo real

### 7. **Perfil (profile.js)**
- Visualização de dados
- Edição de informações
- Nome, Telefone, Chave Pix
- Logout

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Token) armazenado no `localStorage`:

- **Token:** Armazenado em `sinucabet_token`
- **Usuário:** Armazenado em `sinucabet_user`
- **Interceptor:** Adiciona token automaticamente nas requisições
- **Proteção:** Páginas protegidas redirecionam para login

## 🌐 API Integration

Todas as chamadas à API são feitas através do arquivo `utils/api.js`:

### Auth
- `POST /register` - Cadastro
- `POST /login` - Login
- `GET /profile` - Obter perfil
- `PUT /profile` - Atualizar perfil

### Wallet
- `GET /wallet` - Obter saldo
- `GET /wallet/transactions` - Listar transações
- `POST /wallet/deposit` - Criar depósito
- `POST /wallet/withdraw` - Solicitar saque

### Games
- `GET /games` - Listar jogos
- `GET /games/:id` - Detalhes do jogo

### Bets
- `POST /bets` - Criar aposta
- `GET /bets` - Listar apostas do usuário
- `GET /bets/:id` - Detalhes da aposta

## 🎨 Componentes Reutilizáveis

### Header
Menu de navegação fixo com links e logout

### Footer
Rodapé com links institucionais

### Loader
Feedback de carregamento (inline, page, full-page)

### GameCard
Card de jogo com informações resumidas

### BetButton
Botões de aposta com valores pré-definidos e customizados

### TransactionCard
Card de transação da carteira

## 📱 Responsividade

- **Mobile-first:** Design otimizado para mobile
- **Breakpoints:** Utiliza breakpoints do Tailwind
- **Touch-friendly:** Botões grandes e espaçamento adequado
- **Acessibilidade:** Foco visível, aria-labels, contraste

## 🔒 Segurança

- Validação de formulários com Zod
- Sanitização de inputs
- Token JWT seguro
- HTTPS em produção
- Proteção CSRF

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Conecte o repositório na Vercel
3. Configure a variável de ambiente `NEXT_PUBLIC_API_URL`
4. Deploy automático!

### Outros

```bash
npm run build
npm run start
```

## 📝 Boas Práticas

- ✅ Componentes funcionais
- ✅ Hooks customizados
- ✅ TypeScript-ready (JSDoc)
- ✅ Validação de forms
- ✅ Loading states
- ✅ Error handling
- ✅ Código limpo e documentado
- ✅ Mobile-first
- ✅ Acessibilidade

## 🐛 Troubleshooting

### Erro de conexão com API

Verifique se:
- O backend está rodando
- A URL da API está correta no `.env.local`
- Não há bloqueio de CORS

### Token expirado

- Faça logout e login novamente
- Verifique a validade do token no backend

### Estilos não aplicados

```bash
npm run build
rm -rf .next
npm run dev
```

## 📄 Licença

Este projeto é propriedade de SinucaBet. Todos os direitos reservados.

## 👥 Suporte

Para dúvidas ou problemas, entre em contato:
- Email: suporte@sinucabet.com.br
- Telefone: (11) 99999-9999

---

**Desenvolvido com ❤️ para a comunidade de sinuca** 🎱






