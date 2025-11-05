# 📁 Estrutura do Projeto - SinucaBet Backend

## 🌳 Árvore de Diretórios

```
backend/
│
├── 📄 server.js                          # Servidor principal Express
├── 📄 package.json                       # Dependências e scripts
├── 📄 package-lock.json                  # Lock de dependências
├── 📄 README.md                          # Documentação principal
├── 📄 IMPLEMENTATION_SUMMARY.md          # Sumário de implementação
├── 📄 PROJECT_STRUCTURE.md               # Este arquivo
│
├── 📁 config/
│   └── 📄 supabase.config.js             # Configuração cliente Supabase
│
├── 📁 controllers/
│   └── 📄 auth.controller.js             # Controller de autenticação
│
├── 📁 middlewares/
│   └── 📄 error-handler.middleware.js    # Tratamento global de erros
│
├── 📁 routes/
│   └── 📄 auth.routes.js                 # Rotas de autenticação
│
├── 📁 services/
│   └── 📄 auth.service.js                # Lógica de negócio
│
├── 📁 utils/
│   ├── 📄 hash.util.js                   # Hashing com bcrypt
│   ├── 📄 jwt.util.js                    # Geração/verificação JWT
│   └── 📄 response.util.js               # Respostas padronizadas
│
├── 📁 validators/
│   └── 📄 auth.validator.js              # Validação com Zod
│
└── 📁 docs/
    ├── 📄 API_EXAMPLES.md                # Exemplos de uso
    ├── 📄 AUTH_FLOW.md                   # Diagramas de fluxo
    └── 📄 QUICK_START.md                 # Guia de início rápido
```

---

## 📝 Descrição dos Arquivos

### 🔧 Raiz do Projeto

#### `server.js` (145 linhas)
- Servidor principal Express
- Configuração de middlewares globais
- Importação de rotas
- Health checks
- Tratamento de erros não capturados

**Middlewares configurados:**
- ✅ Helmet (segurança)
- ✅ CORS (cross-origin)
- ✅ Body Parser (JSON/URL-encoded)
- ✅ Compression (gzip)
- ✅ Morgan (logging)
- ✅ Rate Limiting (global)

---

### ⚙️ config/

#### `supabase.config.js` (24 linhas)
- Criação do cliente Supabase
- Validação de variáveis de ambiente
- Configuração de auth (sem persistência)

**Exports:**
- `supabase` - Cliente configurado

---

### 🎮 controllers/

#### `auth.controller.js` (118 linhas)
- Lida com requisições HTTP
- Valida entrada com Zod
- Chama services
- Formata respostas
- Trata erros

**Métodos:**
- `register(req, res)` - POST /register
- `login(req, res)` - POST /login
- `health(req, res)` - GET /health

---

### 🛡️ middlewares/

#### `error-handler.middleware.js` (68 linhas)
- Middleware global de erros
- Logs estruturados
- Tratamento específico por tipo de erro
- Respostas padronizadas

**Trata:**
- ✅ Erros do Zod
- ✅ Erros de JWT
- ✅ Erros de sintaxe JSON
- ✅ Erros genéricos

---

### 🛣️ routes/

#### `auth.routes.js` (60 linhas)
- Define endpoints da API
- Aplica rate limiting específico
- Documenta rotas com comentários

**Endpoints:**
- `POST /register` - Rate limit: 3/hora
- `POST /login` - Rate limit: 5/15min
- `GET /health` - Sem rate limit específico

---

### 💼 services/

#### `auth.service.js` (241 linhas)
- Lógica de negócio
- Interação com Supabase
- Verificações de duplicatas
- Geração de tokens

**Métodos:**
- `register(userData)` - Cria usuário
- `login(credentials)` - Autentica usuário
- `emailExists(email)` - Verifica email
- `cpfExists(cpf)` - Verifica CPF

**Fluxo de Registro:**
1. Verifica email duplicado
2. Verifica CPF duplicado
3. Gera hash da senha
4. Insere no banco
5. Verifica criação de wallet
6. Gera JWT
7. Retorna dados

**Fluxo de Login:**
1. Busca usuário por email
2. Verifica status ativo
3. Valida senha
4. Busca dados da wallet
5. Gera JWT
6. Retorna dados

---

### 🔧 utils/

#### `hash.util.js` (34 linhas)
- Hashing de senhas com bcrypt
- Salt rounds configurável

**Funções:**
- `hashPassword(password)` - Gera hash
- `verifyPassword(password, hash)` - Verifica hash

#### `jwt.util.js` (65 linhas)
- Geração de tokens JWT
- Verificação de tokens
- Decodificação

**Funções:**
- `generateToken(payload)` - Cria JWT
- `verifyToken(token)` - Valida JWT
- `decodeToken(token)` - Decodifica sem validar

**Configuração JWT:**
- Algoritmo: HS256
- Expiração: 24h
- Issuer: sinucabet-api
- Audience: sinucabet-users

#### `response.util.js` (79 linhas)
- Respostas HTTP padronizadas
- Códigos de status consistentes

**Funções:**
- `successResponse(res, status, message, data)` - 2xx
- `errorResponse(res, status, message, errors)` - 4xx/5xx
- `validationErrorResponse(res, errors)` - 400
- `notFoundResponse(res, message)` - 404
- `unauthorizedResponse(res, message)` - 401
- `conflictResponse(res, message)` - 409

---

### ✔️ validators/

#### `auth.validator.js` (174 linhas)
- Schemas de validação com Zod
- Validação customizada de CPF
- Regex para formatos

**Schemas:**
- `registerSchema` - Validação completa de registro
- `loginSchema` - Validação de login

**Validações:**
- ✅ Email (formato + regex)
- ✅ Senha (8+ chars, maiúscula, minúscula, número)
- ✅ CPF (formato + dígito verificador)
- ✅ Telefone (formato E.164)
- ✅ PIX key e type (devem vir juntos)
- ✅ Nome (3-255 caracteres)

**Função Auxiliar:**
- `validateCPF(cpf)` - Validação completa de CPF

---

### 📚 docs/

#### `API_EXAMPLES.md` (651 linhas)
- Exemplos práticos de uso
- cURL, JavaScript, Axios
- React Hooks customizados
- Tratamento de erros
- Validação de CPF no frontend

**Conteúdo:**
- 📤 Exemplos de requisições
- 📥 Exemplos de respostas
- 🔧 Integração com frontend
- 🎣 React Hooks
- ⚠️ Tratamento de erros

#### `AUTH_FLOW.md` (502 linhas)
- Diagramas de arquitetura
- Fluxos de registro e login
- Estrutura do JWT
- Segurança implementada
- Tratamento de erros

**Conteúdo:**
- 📊 Diagrama de arquitetura
- 🔄 Fluxo de registro (passo a passo)
- 🔓 Fluxo de login (passo a passo)
- 🔒 Estrutura do token JWT
- 🛡️ Recursos de segurança
- 📦 Dependências

#### `QUICK_START.md` (421 linhas)
- Guia de início rápido (5 minutos)
- Passo a passo completo
- Configuração do Supabase
- Testes básicos
- Troubleshooting

**Conteúdo:**
- 📋 Pré-requisitos
- 🚀 Passo a passo
- 🧪 Testes da API
- ✅ Checklist
- 🐛 Problemas comuns

---

## 📊 Estatísticas do Projeto

### Linhas de Código

| Tipo | Linhas | Arquivos |
|------|--------|----------|
| JavaScript | ~950 | 10 |
| Markdown | ~2500 | 6 |
| **Total** | **~3450** | **16** |

### Distribuição por Camada

| Camada | Arquivos | Linhas | % |
|--------|----------|--------|---|
| Services | 1 | 241 | 25% |
| Validators | 1 | 174 | 18% |
| Server | 1 | 145 | 15% |
| Controllers | 1 | 118 | 12% |
| Utils | 3 | 178 | 19% |
| Routes | 1 | 60 | 6% |
| Middlewares | 1 | 68 | 7% |
| Config | 1 | 24 | 2% |

### Documentação

| Documento | Linhas | Propósito |
|-----------|--------|-----------|
| API_EXAMPLES.md | 651 | Exemplos práticos |
| AUTH_FLOW.md | 502 | Diagramas de fluxo |
| QUICK_START.md | 421 | Guia de início |
| README.md | 450 | Documentação geral |
| IMPLEMENTATION_SUMMARY.md | 500 | Sumário técnico |

---

## 🔗 Dependências entre Arquivos

```
server.js
├── routes/auth.routes.js
│   └── controllers/auth.controller.js
│       ├── validators/auth.validator.js
│       ├── services/auth.service.js
│       │   ├── config/supabase.config.js
│       │   ├── utils/hash.util.js
│       │   └── utils/jwt.util.js
│       └── utils/response.util.js
└── middlewares/error-handler.middleware.js
```

---

## 📈 Complexidade

### Cyclomatic Complexity (estimada)

| Arquivo | Funções | Complexidade |
|---------|---------|--------------|
| auth.service.js | 4 | Alta 🔴 |
| auth.validator.js | 3 | Média 🟡 |
| auth.controller.js | 3 | Baixa 🟢 |
| server.js | - | Baixa 🟢 |

---

## 🎯 Cobertura Funcional

### Implementado ✅

- [x] Registro de usuários
- [x] Login de usuários
- [x] Validação completa de dados
- [x] Hashing de senhas
- [x] Geração de JWT
- [x] Rate limiting
- [x] Tratamento de erros
- [x] Respostas padronizadas
- [x] Health checks
- [x] Documentação completa

### Não Implementado ❌

- [ ] Middleware de autenticação JWT
- [ ] Refresh tokens
- [ ] Verificação de email
- [ ] Recuperação de senha
- [ ] Logout (blacklist)
- [ ] 2FA
- [ ] Perfil do usuário
- [ ] Upload de avatar
- [ ] Autenticação social

---

## 🔄 Próximas Adições

Quando adicionar novos módulos, seguir a estrutura:

```
backend/
├── controllers/
│   └── [modulo].controller.js
├── routes/
│   └── [modulo].routes.js
├── services/
│   └── [modulo].service.js
├── validators/
│   └── [modulo].validator.js
└── models/ (se necessário)
    └── [modulo].model.js
```

---

## 📝 Convenções de Nomenclatura

### Arquivos
- **Controllers**: `nome.controller.js`
- **Services**: `nome.service.js`
- **Routes**: `nome.routes.js`
- **Utils**: `nome.util.js`
- **Validators**: `nome.validator.js`
- **Middlewares**: `nome.middleware.js`
- **Config**: `nome.config.js`

### Funções
- **camelCase**: `getUserById()`
- **Async**: sempre usar `async/await`
- **Exports**: usar `module.exports`

### Variáveis
- **camelCase**: `userName`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private**: prefixo `_` (por convenção)

---

**🎱 SinucaBet - Estrutura do Projeto Backend**

*Última atualização: 04/11/2025*







