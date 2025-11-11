# 🎱 SinucaBet Backend API

API REST para a plataforma SinucaBet - Sistema de intermediação de apostas de sinuca.

## 📋 Índice

- [Instalação](#instalação)
- [Configuração](#configuração)
- [Iniciar Servidor](#iniciar-servidor)
- [Endpoints de Autenticação](#endpoints-de-autenticação)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## 🚀 Instalação

```bash
# Instalar dependências
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do diretório `backend` com as seguintes variáveis:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase

# JWT Configuration
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=24h

# Security
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

## 🏃 Iniciar Servidor

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start

# Testes
npm test

# Linting
npm run lint
```

O servidor estará disponível em `http://localhost:3001`

---

## 🔐 Endpoints de Autenticação

### Base URL
```
http://localhost:3001/api/auth
```

---

### 1️⃣ POST `/register`

Registra um novo usuário na plataforma.

#### Request Body

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "SenhaForte123",
  "phone": "+5511999999999",
  "cpf": "123.456.789-00",
  "pix_key": "joao@example.com",
  "pix_type": "email"
}
```

#### Campos Obrigatórios

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `name` | string | Nome completo | 3-255 caracteres |
| `email` | string | Email único | Formato válido de email |
| `password` | string | Senha forte | Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número |
| `phone` | string | Telefone internacional | Formato E.164 (ex: +5511999999999) |
| `cpf` | string | CPF único | Formato XXX.XXX.XXX-XX |

#### Campos Opcionais

| Campo | Tipo | Descrição | Valores |
|-------|------|-----------|---------|
| `pix_key` | string | Chave PIX | Qualquer chave PIX válida |
| `pix_type` | enum | Tipo da chave PIX | `email`, `cpf`, `phone`, `random` |

> **Nota:** Se `pix_key` for fornecida, `pix_type` é obrigatório, e vice-versa.

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user_id": "uuid-do-usuario",
    "user": {
      "id": "uuid-do-usuario",
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "+5511999999999",
      "cpf": "123.456.789-00",
      "pix_key": "joao@example.com",
      "pix_type": "email",
      "email_verified": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "wallet": {
      "balance": 0,
      "blocked_balance": 0
    }
  }
}
```

#### Possíveis Erros

| Status | Mensagem | Causa |
|--------|----------|-------|
| 400 | Erro de validação | Dados inválidos ou faltando |
| 409 | Email já cadastrado | Email já existe no banco |
| 409 | CPF já cadastrado | CPF já existe no banco |
| 500 | Erro interno | Erro no servidor |

---

### 2️⃣ POST `/login`

Realiza login de um usuário existente.

#### Request Body

```json
{
  "email": "joao@example.com",
  "password": "SenhaForte123"
}
```

#### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `email` | string | Email do usuário |
| `password` | string | Senha do usuário |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "+5511999999999",
      "cpf": "123.456.789-00",
      "pix_key": "joao@example.com",
      "pix_type": "email",
      "email_verified": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "wallet": {
      "balance": 150.50,
      "blocked_balance": 50.00,
      "total_deposited": 200.00,
      "total_withdrawn": 0.00
    }
  }
}
```

#### Possíveis Erros

| Status | Mensagem | Causa |
|--------|----------|-------|
| 400 | Erro de validação | Dados inválidos ou faltando |
| 401 | Email ou senha inválidos | Credenciais incorretas |
| 403 | Usuário desativado | Conta foi desativada |
| 500 | Erro interno | Erro no servidor |

---

### 3️⃣ GET `/health`

Verifica se o serviço de autenticação está funcionando.

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Serviço de autenticação está funcionando",
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "service": "auth"
  }
}
```

---

## 🔑 Autenticação JWT

Após login ou registro bem-sucedido, você receberá um token JWT que expira em **24 horas**.

### Como usar o token

Para endpoints protegidos (futuros), inclua o token no header:

```http
Authorization: Bearer seu-token-jwt-aqui
```

### Payload do Token

```json
{
  "user_id": "uuid-do-usuario",
  "email": "joao@example.com",
  "iat": 1642243800,
  "exp": 1642330200,
  "iss": "sinucabet-api",
  "aud": "sinucabet-users"
}
```

---

## 🛡️ Rate Limiting

Para proteger a API contra ataques, implementamos rate limiting:

### Limite Global
- **15 minutos**: 100 requisições por IP

### Limite de Login
- **15 minutos**: 5 tentativas de login por IP

### Limite de Registro
- **1 hora**: 3 registros por IP

---

## 📁 Estrutura do Projeto

```
backend/
├── config/
│   └── supabase.config.js       # Configuração do Supabase
├── controllers/
│   └── auth.controller.js       # Controller de autenticação
├── middlewares/
│   └── error-handler.middleware.js  # Tratamento global de erros
├── routes/
│   └── auth.routes.js           # Rotas de autenticação
├── services/
│   └── auth.service.js          # Lógica de negócio
├── utils/
│   ├── hash.util.js             # Utilitário de hashing (bcrypt)
│   ├── jwt.util.js              # Utilitário de JWT
│   └── response.util.js         # Respostas padronizadas
├── validators/
│   └── auth.validator.js        # Validação com Zod
├── .env.example                 # Exemplo de variáveis de ambiente
├── server.js                    # Servidor principal
├── package.json
└── README.md
```

---

## 🧪 Exemplo de Teste com cURL

### Registro

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "SenhaForte123",
    "phone": "+5511999999999",
    "cpf": "123.456.789-00",
    "pix_key": "joao@example.com",
    "pix_type": "email"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "SenhaForte123"
  }'
```

---

## 📦 Dependências Principais

- **express**: Framework web
- **@supabase/supabase-js**: Cliente Supabase (PostgreSQL)
- **bcrypt**: Hashing de senhas
- **jsonwebtoken**: Geração e verificação de JWT
- **zod**: Validação de schemas
- **helmet**: Segurança HTTP
- **cors**: CORS middleware
- **express-rate-limit**: Rate limiting
- **morgan**: Logger HTTP
- **compression**: Compressão de respostas

---

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ Tokens JWT com expiração de 24h
- ✅ Validação rigorosa de entrada com Zod
- ✅ Rate limiting contra ataques de força bruta
- ✅ Helmet para headers de segurança
- ✅ CORS configurado
- ✅ Validação de CPF com dígito verificador

---

## 📝 Notas Importantes

1. **CPF**: Deve estar no formato `XXX.XXX.XXX-XX` e ser válido
2. **Telefone**: Use formato internacional (ex: `+5511999999999`)
3. **Senha**: Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
4. **Email e CPF**: Devem ser únicos no sistema
5. **Carteira**: Criada automaticamente via trigger do banco ao registrar usuário

---

## 🐛 Troubleshooting

### Erro: "SUPABASE_URL não está definida"
- Certifique-se de ter criado o arquivo `.env` com as variáveis corretas

### Erro: "Email já cadastrado"
- O email fornecido já existe no banco de dados

### Erro: "CPF inválido"
- Verifique se o CPF está no formato correto e é válido

### Erro: "Token expirado"
- Faça login novamente para obter um novo token

---

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ pela equipe SinucaBet**











