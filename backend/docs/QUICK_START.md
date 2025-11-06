# ⚡ Guia de Início Rápido - SinucaBet Backend

Este guia vai te ajudar a colocar a API rodando em **5 minutos**.

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- ✅ **Node.js** (v18 ou superior)
- ✅ **npm** (v9 ou superior)
- ✅ Conta no **Supabase** (gratuita)

---

## 🚀 Passo a Passo

### 1. Configurar Banco de Dados no Supabase

#### a) Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: SinucaBet
   - **Database Password**: Escolha uma senha forte
   - **Region**: Selecione a mais próxima de você
4. Aguarde a criação (1-2 minutos)

#### b) Executar Schema SQL

1. No painel do Supabase, vá em **SQL Editor** (ícone de terminal)
2. Clique em **"New Query"**
3. Abra o arquivo `/database/schema.sql` do projeto
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Verifique se todas as tabelas foram criadas com sucesso ✅

#### c) Copiar Credenciais

1. Vá em **Settings** > **API**
2. Copie os seguintes valores:
   - **URL**: `https://seu-projeto.supabase.co`
   - **anon/public key**: `eyJhbG...`
   - **service_role key**: `eyJhbG...` (clique em "Reveal")

---

### 2. Configurar Backend

#### a) Instalar Dependências

```bash
cd backend
npm install
```

#### b) Criar arquivo .env

Crie um arquivo chamado `.env` na pasta `backend`:

```bash
# No terminal (Linux/Mac)
touch .env

# No Windows (PowerShell)
New-Item .env
```

#### c) Configurar variáveis de ambiente

Abra o arquivo `.env` e cole:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase (Cole suas credenciais aqui)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

# JWT Secret (Gere uma chave forte)
JWT_SECRET=mude-para-algo-secreto-e-aleatorio-em-producao
JWT_EXPIRES_IN=24h

# Security
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

**⚠️ IMPORTANTE**: Substitua os valores do Supabase pelas suas credenciais!

---

### 3. Iniciar Servidor

```bash
npm run dev
```

Você deve ver:

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🎱 SinucaBet API Server                         ║
║                                                            ║
║   Servidor rodando em: http://localhost:3001              ║
║   Ambiente: development                                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

✅ **Pronto! Seu servidor está rodando!**

---

## 🧪 Testar a API

### Teste 1: Health Check

Abra o navegador e acesse:

```
http://localhost:3001/
```

Deve retornar:

```json
{
  "success": true,
  "message": "SinucaBet API está rodando!",
  "version": "1.0.0",
  "timestamp": "2024-11-04T..."
}
```

---

### Teste 2: Registrar Usuário

#### Usando cURL

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario",
    "email": "teste@example.com",
    "password": "SenhaForte123",
    "phone": "+5511999999999",
    "cpf": "123.456.789-09"
  }'
```

#### Usando Postman/Insomnia

1. Método: **POST**
2. URL: `http://localhost:3001/api/auth/register`
3. Headers:
   - `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "name": "Teste Usuario",
  "email": "teste@example.com",
  "password": "SenhaForte123",
  "phone": "+5511999999999",
  "cpf": "123.456.789-09"
}
```

**Resposta esperada** (201 Created):

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user_id": "uuid-gerado",
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "wallet": {
      "balance": 0,
      "blocked_balance": 0
    }
  }
}
```

✅ **Copie o token para usar no próximo teste!**

---

### Teste 3: Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "SenhaForte123"
  }'
```

**Resposta esperada** (200 OK):

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "wallet": { ... }
  }
}
```

---

## ✅ Checklist de Verificação

- [ ] Node.js instalado
- [ ] Projeto do Supabase criado
- [ ] Schema SQL executado no Supabase
- [ ] Credenciais do Supabase copiadas
- [ ] Arquivo `.env` criado e configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Health check funcionando
- [ ] Registro de usuário funcionando
- [ ] Login funcionando

---

## 🐛 Problemas Comuns

### Erro: "SUPABASE_URL não está definida"

**Causa**: Arquivo `.env` não está configurado corretamente

**Solução**:
1. Verifique se o arquivo `.env` existe na pasta `backend`
2. Certifique-se de que as variáveis estão sem espaços: `SUPABASE_URL=valor`
3. Reinicie o servidor

---

### Erro: "Email já cadastrado"

**Causa**: O email já foi usado em um registro anterior

**Solução**:
- Use um email diferente, OU
- Delete o usuário no Supabase:
  1. Vá em **Table Editor** > **users**
  2. Encontre o registro e delete

---

### Erro: "CPF inválido"

**Causa**: CPF não está no formato correto ou é inválido

**Solução**:
- Use o formato: `XXX.XXX.XXX-XX`
- Use CPFs válidos de teste:
  - `123.456.789-09`
  - `987.654.321-00`
  - `111.222.333-96`

---

### Erro: "Senha deve conter..."

**Causa**: Senha não atende aos requisitos de segurança

**Solução**:
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número

Exemplo válido: `SenhaForte123`

---

### Servidor não inicia

**Possíveis causas**:

1. **Porta 3001 já está em uso**
   ```bash
   # Verificar processo usando a porta
   lsof -i :3001  # Mac/Linux
   netstat -ano | findstr :3001  # Windows
   
   # Mudar porta no .env
   PORT=3002
   ```

2. **Dependências não instaladas**
   ```bash
   npm install
   ```

3. **Node.js desatualizado**
   ```bash
   node --version  # Deve ser >= v18.0.0
   ```

---

## 📚 Próximos Passos

Agora que a API está funcionando:

1. 📖 Leia a [documentação completa](README.md)
2. 🔍 Veja os [exemplos de integração](docs/API_EXAMPLES.md)
3. 🔐 Entenda o [fluxo de autenticação](docs/AUTH_FLOW.md)
4. 🚀 Integre com seu frontend

---

## 🆘 Precisa de Ajuda?

- 📧 Email: suporte@sinucabet.com
- 💬 Discord: [Link do servidor]
- 📝 Issues: [GitHub Issues]

---

## 🎉 Tudo Funcionando?

Parabéns! 🎊 Você configurou com sucesso a API do SinucaBet!

Agora você pode:
- ✅ Registrar usuários
- ✅ Fazer login
- ✅ Gerar tokens JWT
- ✅ Começar a construir o frontend

**Bora codar! 💻🎱**

---

**🎱 SinucaBet - Guia de Início Rápido**









