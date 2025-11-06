# 🔐 Fluxo de Autenticação - SinucaBet

Este documento descreve o fluxo completo de autenticação da API SinucaBet.

---

## 📊 Diagrama de Arquitetura

```
┌─────────────┐
│   Cliente   │
│  (Frontend) │
└──────┬──────┘
       │
       │ HTTP Request
       │
┌──────▼──────────────────────────────────────────────────┐
│                     Express Server                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Global Middlewares                     │   │
│  │  • CORS • Helmet • Body Parser • Rate Limit     │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐   │
│  │             Routes (auth.routes.js)             │   │
│  │  • POST /register                               │   │
│  │  • POST /login                                  │   │
│  │  • GET /health                                  │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐   │
│  │        Controller (auth.controller.js)          │   │
│  │  • Validação com Zod                            │   │
│  │  • Tratamento de erros                          │   │
│  │  • Resposta padronizada                         │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐   │
│  │         Service (auth.service.js)               │   │
│  │  • Lógica de negócio                            │   │
│  │  • Interação com banco                          │   │
│  │  • Geração de tokens                            │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐   │
│  │              Utilities                          │   │
│  │  • hash.util (bcrypt)                           │   │
│  │  • jwt.util (jsonwebtoken)                      │   │
│  │  • response.util (respostas)                    │   │
│  └─────────────────┬───────────────────────────────┘   │
└────────────────────┼───────────────────────────────────┘
                     │
                     │
          ┌──────────▼──────────┐
          │    Supabase         │
          │  (PostgreSQL)       │
          │  • Tabela users     │
          │  • Tabela wallet    │
          │  • Triggers         │
          └─────────────────────┘
```

---

## 🔄 Fluxo de Registro (POST /register)

```
┌──────────┐
│  Cliente │
└─────┬────┘
      │
      │ 1. POST /register
      │    Body: { name, email, password, phone, cpf, pix_key, pix_type }
      │
┌─────▼──────────────┐
│   Express Server   │
│                    │
│ ┌────────────────┐ │
│ │ Rate Limiter   │ │  → Verifica limite de requisições
│ └───────┬────────┘ │
│         │          │
│ ┌───────▼────────┐ │
│ │  Auth Routes   │ │  → Roteia para controller
│ └───────┬────────┘ │
│         │          │
│ ┌───────▼────────┐ │
│ │  Controller    │ │
│ │                │ │
│ │ 2. Validação   │ │  → Zod valida dados de entrada
│ │    com Zod     │ │     • Formato de email
│ │                │ │     • Senha forte
│ │                │ │     • CPF válido
│ │                │ │     • Telefone formato E.164
│ └───────┬────────┘ │
│         │          │
│         │ ✅ Dados válidos
│         │          │
│ ┌───────▼────────┐ │
│ │   Service      │ │
│ │                │ │
│ │ 3. Verificar   │ │  ──┐
│ │    duplicatas  │ │    │
│ └───────┬────────┘ │    │
│         │          │    │
└─────────┼──────────┘    │
          │               │
   ┌──────▼──────┐        │
   │  Supabase   │◄───────┘
   │             │   Query: SELECT * FROM users WHERE email = ?
   │             │   Query: SELECT * FROM users WHERE cpf = ?
   └──────┬──────┘
          │
          │ ✅ Email e CPF únicos
          │
┌─────────▼──────────┐
│   Service          │
│                    │
│ 4. Hash da senha   │  → bcrypt.hash(password, 10)
│                    │
│ 5. Inserir usuário │  ──┐
└─────────┬──────────┘    │
          │               │
   ┌──────▼──────┐        │
   │  Supabase   │◄───────┘
   │             │   INSERT INTO users (...)
   │             │   
   │   Trigger   │   ⚡ Cria wallet automaticamente
   │  automático │      INSERT INTO wallet (user_id)
   │             │
   └──────┬──────┘
          │
          │ ✅ Usuário criado
          │
┌─────────▼──────────┐
│   Service          │
│                    │
│ 6. Gerar JWT       │  → jwt.sign({ user_id, email })
│                    │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│   Controller       │
│                    │
│ 7. Resposta        │  → { success, message, data }
│    padronizada     │
│                    │
└─────────┬──────────┘
          │
          │ HTTP 201 Created
          │
    ┌─────▼────┐
    │  Cliente │
    │          │
    │ Recebe:  │
    │ • token  │
    │ • user   │
    │ • wallet │
    └──────────┘
```

---

## 🔓 Fluxo de Login (POST /login)

```
┌──────────┐
│  Cliente │
└─────┬────┘
      │
      │ 1. POST /login
      │    Body: { email, password }
      │
┌─────▼──────────────┐
│   Express Server   │
│                    │
│ ┌────────────────┐ │
│ │ Rate Limiter   │ │  → Limite: 5 tentativas / 15 min
│ └───────┬────────┘ │
│         │          │
│ ┌───────▼────────┐ │
│ │  Auth Routes   │ │
│ └───────┬────────┘ │
│         │          │
│ ┌───────▼────────┐ │
│ │  Controller    │ │
│ │                │ │
│ │ 2. Validação   │ │  → Zod valida email e password
│ └───────┬────────┘ │
│         │          │
│ ┌───────▼────────┐ │
│ │   Service      │ │
│ │                │ │
│ │ 3. Buscar      │ │  ──┐
│ │    usuário     │ │    │
│ └───────┬────────┘ │    │
│         │          │    │
└─────────┼──────────┘    │
          │               │
   ┌──────▼──────┐        │
   │  Supabase   │◄───────┘
   │             │   Query: SELECT * FROM users WHERE email = ?
   │             │          (retorna password_hash)
   └──────┬──────┘
          │
          │ ✅ Usuário encontrado
          │
┌─────────▼──────────┐
│   Service          │
│                    │
│ 4. Verificar       │  → bcrypt.compare(password, hash)
│    senha           │
│                    │
│ ❌ Senha incorreta │  → Retorna erro 401
│ ✅ Senha correta   │  → Continua
│                    │
│ 5. Verificar       │  → Checa campo is_active
│    status ativo    │
│                    │
│ 6. Buscar wallet   │  ──┐
│                    │    │
└─────────┬──────────┘    │
          │               │
   ┌──────▼──────┐        │
   │  Supabase   │◄───────┘
   │             │   Query: SELECT * FROM wallet WHERE user_id = ?
   └──────┬──────┘
          │
          │ ✅ Dados completos
          │
┌─────────▼──────────┐
│   Service          │
│                    │
│ 7. Gerar JWT       │  → jwt.sign({ user_id, email })
│                    │     Expira em 24h
│                    │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│   Controller       │
│                    │
│ 8. Resposta        │  → { success, message, data }
│    padronizada     │     Remove password_hash
│                    │
└─────────┬──────────┘
          │
          │ HTTP 200 OK
          │
    ┌─────▼────┐
    │  Cliente │
    │          │
    │ Recebe:  │
    │ • token  │
    │ • user   │
    │ • wallet │
    └──────────┘
```

---

## 🔒 Estrutura do Token JWT

### Payload

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "iat": 1699096600,
  "exp": 1699183000,
  "iss": "sinucabet-api",
  "aud": "sinucabet-users"
}
```

### Campos

- **user_id**: UUID do usuário no banco
- **email**: Email do usuário
- **iat** (Issued At): Timestamp de criação
- **exp** (Expiration): Timestamp de expiração (24h)
- **iss** (Issuer): Emissor do token
- **aud** (Audience): Audiência do token

---

## 🛡️ Segurança

### Hash de Senha (bcrypt)

```javascript
// Registro
const hash = await bcrypt.hash(password, 10);
// Resultado: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// Login
const isValid = await bcrypt.compare(password, hash);
// Retorna: true ou false
```

### Rate Limiting

| Endpoint | Limite | Janela |
|----------|--------|--------|
| `/register` | 3 requisições | 1 hora |
| `/login` | 5 tentativas | 15 minutos |
| Global | 100 requisições | 15 minutos |

---

## ❌ Tratamento de Erros

### Registro

| Erro | Status | Mensagem |
|------|--------|----------|
| Email duplicado | 409 | "Email já cadastrado" |
| CPF duplicado | 409 | "CPF já cadastrado" |
| Validação falhou | 400 | "Erro de validação" + detalhes |
| Erro no banco | 500 | "Erro ao criar usuário" |

### Login

| Erro | Status | Mensagem |
|------|--------|----------|
| Credenciais inválidas | 401 | "Email ou senha inválidos" |
| Usuário desativado | 403 | "Usuário desativado" |
| Muitas tentativas | 429 | "Muitas tentativas de autenticação" |

---

## 📦 Dependências e Responsabilidades

### Camada de Rotas
- Definir endpoints
- Aplicar rate limiting específico
- Rotear para controllers

### Camada de Controllers
- Validar entrada com Zod
- Chamar services
- Formatar respostas
- Tratar erros do service

### Camada de Services
- Lógica de negócio
- Interação com banco de dados
- Verificações de duplicatas
- Geração de tokens

### Camada de Utils
- **hash.util**: Hashing e verificação de senhas
- **jwt.util**: Geração e verificação de tokens
- **response.util**: Respostas HTTP padronizadas

---

## 🔄 Próximos Passos

### Funcionalidades Futuras

1. **Middleware de Autenticação**
   - Verificar JWT em rotas protegidas
   - Extrair user_id do token
   - Adicionar dados do usuário ao req

2. **Refresh Tokens**
   - Tokens de longa duração
   - Renovação automática
   - Revogação de tokens

3. **Verificação de Email**
   - Envio de email de confirmação
   - Endpoint de verificação
   - Resend de email

4. **Recuperação de Senha**
   - Solicitação de reset
   - Token temporário
   - Redefinição de senha

5. **Autenticação de Dois Fatores (2FA)**
   - TOTP via app autenticador
   - SMS de confirmação
   - Códigos de backup

---

**🎱 SinucaBet - Documentação de Autenticação**









