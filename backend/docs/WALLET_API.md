# API de Carteira (Wallet)

Documentação completa dos endpoints de carteira digital da plataforma SinucaBet.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [GET /api/wallet](#get-apiwallet)
  - [POST /api/wallet/deposit](#post-apiwalletdeposit)
  - [POST /api/wallet/withdraw](#post-apiwalletwithdraw)
  - [POST /api/wallet/webhook/woovi](#post-apiwalletwebhookwoovi)
- [Códigos de Erro](#códigos-de-erro)
- [Fluxo de Depósito](#fluxo-de-depósito)
- [Fluxo de Saque](#fluxo-de-saque)

---

## 🔍 Visão Geral

A API de Carteira permite que usuários:
- Consultem saldo e histórico de transações
- Realizem depósitos via Pix (com QR Code)
- Solicitem saques via Pix (com taxa de 8%)
- Recebam confirmações automáticas de pagamento via webhook

**Base URL:** `http://localhost:3001/api/wallet`

**Formato de Resposta:** JSON

---

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT Bearer Token.

### Como autenticar:

1. Faça login em `/api/auth/login` para obter o token
2. Inclua o token no header de todas as requisições:

```bash
Authorization: Bearer SEU_TOKEN_JWT
```

---

## 📌 Endpoints

### GET /api/wallet

Retorna informações da carteira do usuário autenticado.

#### 🔒 Requer Autenticação: Sim

#### Request:

```bash
curl -X GET http://localhost:3001/api/wallet \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

#### Response (200 OK):

```json
{
  "success": true,
  "message": "Dados da carteira obtidos com sucesso",
  "data": {
    "wallet": {
      "balance": 1500.00,
      "blocked_balance": 200.00,
      "total_deposited": 2000.00,
      "total_withdrawn": 500.00,
      "available_balance": 1300.00,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-11-04T15:45:00.000Z"
    },
    "recent_transactions": [
      {
        "id": "uuid-transaction-1",
        "type": "deposit",
        "amount": 500.00,
        "fee": 0.00,
        "net_amount": 500.00,
        "status": "completed",
        "description": "Depósito via Pix",
        "created_at": "2025-11-04T15:30:00.000Z",
        "processed_at": "2025-11-04T15:31:20.000Z"
      },
      {
        "id": "uuid-transaction-2",
        "type": "bet",
        "amount": 100.00,
        "fee": 0.00,
        "net_amount": 100.00,
        "status": "completed",
        "description": "Aposta no jogo #123",
        "created_at": "2025-11-04T14:00:00.000Z",
        "processed_at": "2025-11-04T14:00:01.000Z"
      }
    ]
  }
}
```

#### Campos da Resposta:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `balance` | number | Saldo total da carteira |
| `blocked_balance` | number | Saldo bloqueado em apostas pendentes |
| `available_balance` | number | Saldo disponível (balance - blocked_balance) |
| `total_deposited` | number | Total acumulado de depósitos |
| `total_withdrawn` | number | Total acumulado de saques |
| `recent_transactions` | array | Últimas 10 transações |

#### Rate Limit:
- 30 requisições por minuto

---

### POST /api/wallet/deposit

Cria um novo depósito via Pix e gera QR Code para pagamento.

#### 🔒 Requer Autenticação: Sim

#### Request:

```bash
curl -X POST http://localhost:3001/api/wallet/deposit \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "description": "Depósito para apostas"
  }'
```

#### Request Body:

| Campo | Tipo | Obrigatório | Descrição | Validação |
|-------|------|-------------|-----------|-----------|
| `amount` | number | Sim | Valor do depósito em reais | Min: 10.00, Max: 10000.00 |
| `description` | string | Não | Descrição personalizada | Max: 255 caracteres |

#### Response (201 Created):

```json
{
  "success": true,
  "message": "QR Code Pix gerado com sucesso",
  "data": {
    "transaction_id": "uuid-transaction",
    "amount": 100.00,
    "status": "pending",
    "qr_code": {
      "url": "https://api.woovi.com/qrcode/image/...",
      "brcode": "00020126580014br.gov.bcb.pix0136...",
      "expires_at": "2025-11-04T16:30:00.000Z"
    },
    "created_at": "2025-11-04T16:00:00.000Z",
    "message": "QR Code gerado com sucesso. Aguardando confirmação do pagamento."
  }
}
```

#### Campos da Resposta:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `transaction_id` | string | ID único da transação |
| `amount` | number | Valor do depósito |
| `status` | string | Status da transação (sempre "pending" inicialmente) |
| `qr_code.url` | string | URL da imagem do QR Code |
| `qr_code.brcode` | string | Código Pix copia e cola (linha digitável) |
| `qr_code.expires_at` | string | Data/hora de expiração do QR Code (30 minutos) |

#### Rate Limit:
- 5 requisições por hora por IP

#### Erros Comuns:

| Status | Código | Descrição |
|--------|--------|-----------|
| 400 | VALIDATION_ERROR | Valor inválido (menor que R$ 10 ou maior que R$ 10.000) |
| 401 | UNAUTHORIZED | Token inválido ou não fornecido |
| 503 | EXTERNAL_API_ERROR | Erro ao gerar QR Code na API Woovi |

---

### POST /api/wallet/withdraw

Cria uma solicitação de saque via Pix com taxa de 8%.

#### 🔒 Requer Autenticação: Sim

#### Request:

```bash
curl -X POST http://localhost:3001/api/wallet/withdraw \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "pix_key": "usuario@email.com",
    "description": "Saque de prêmio"
  }'
```

#### Request Body:

| Campo | Tipo | Obrigatório | Descrição | Validação |
|-------|------|-------------|-----------|-----------|
| `amount` | number | Sim | Valor líquido do saque | Min: 20.00, Max: 50000.00 |
| `pix_key` | string | Sim | Chave PIX para recebimento | Max: 255 caracteres |
| `description` | string | Não | Descrição personalizada | Max: 255 caracteres |

#### Response (201 Created):

```json
{
  "success": true,
  "message": "Solicitação de saque criada com sucesso",
  "data": {
    "transaction_id": "uuid-transaction",
    "status": "pending",
    "amount_requested": 100.00,
    "fee": 8.00,
    "total_debited": 108.00,
    "net_to_receive": 100.00,
    "new_balance": 392.00,
    "pix_key": "usuario@email.com",
    "created_at": "2025-11-04T16:00:00.000Z",
    "message": "Solicitação de saque criada com sucesso. Aguardando confirmação do administrador.",
    "note": "O valor líquido será transferido para sua chave PIX após aprovação do admin."
  }
}
```

#### Campos da Resposta:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `transaction_id` | string | ID único da transação de saque |
| `status` | string | Status da solicitação (sempre "pending" inicialmente) |
| `amount_requested` | number | Valor líquido solicitado |
| `fee` | number | Taxa de 8% cobrada |
| `total_debited` | number | Valor total debitado (amount + fee) |
| `net_to_receive` | number | Valor líquido a receber via PIX |
| `new_balance` | number | Novo saldo após o débito |
| `pix_key` | string | Chave PIX para recebimento |

#### Cálculo da Taxa:

- **Taxa:** 8% sobre o valor solicitado
- **Exemplo:**
  - Saque solicitado: R$ 100,00
  - Taxa (8%): R$ 8,00
  - Total debitado: R$ 108,00
  - Valor a receber: R$ 100,00

#### Rate Limit:
- 3 requisições por hora por IP

#### Erros Comuns:

| Status | Código | Descrição |
|--------|--------|-----------|
| 400 | VALIDATION_ERROR | Valor inválido ou chave PIX ausente |
| 400 | INSUFFICIENT_BALANCE | Saldo insuficiente para saque + taxa |
| 401 | UNAUTHORIZED | Token inválido ou não fornecido |
| 404 | NOT_FOUND | Carteira não encontrada |

#### ⚠️ Observações Importantes:

1. O saldo é **debitado imediatamente** ao criar a solicitação
2. O status inicial é sempre `pending` (aguardando aprovação do admin)
3. Duas transações são criadas:
   - Transação de saque (`withdraw`) - status `pending`
   - Transação de taxa (`fee`) - status `completed`
4. O administrador deve aprovar a transferência para o PIX
5. Em caso de rejeição, o valor é estornado automaticamente

📖 **Documentação completa:** [WITHDRAW_API.md](./WITHDRAW_API.md)

---

### POST /api/wallet/webhook/woovi

Webhook da Woovi para confirmação automática de pagamentos Pix.

#### 🔒 Requer Autenticação: Não

**⚠️ Este endpoint é chamado automaticamente pela Woovi quando um pagamento é confirmado.**

#### Request (enviado pela Woovi):

```json
{
  "event": "OPENPIX:CHARGE_COMPLETED",
  "charge": {
    "status": "COMPLETED",
    "correlationID": "DEPOSIT-user-123-1699120000-abc123",
    "value": 10000,
    "transactionID": "txn_woovi_123",
    "time": "2025-11-04T16:05:00.000Z"
  }
}
```

#### Response (200 OK):

```json
{
  "success": true,
  "message": "Depósito confirmado com sucesso",
  "data": {
    "transaction_id": "uuid-transaction",
    "user_id": "uuid-user",
    "amount": 100.00,
    "new_balance": 1600.00,
    "status": "completed",
    "message": "Depósito confirmado com sucesso"
  }
}
```

#### Comportamento:

1. Recebe notificação da Woovi
2. Valida o payload
3. Busca a transação pelo `correlationID`
4. Atualiza o saldo da carteira do usuário
5. Marca a transação como "completed"
6. Retorna confirmação

#### Rate Limit:
- 100 requisições por minuto

---

## ⚠️ Códigos de Erro

### Erros de Validação (400)

```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": [
    {
      "field": "amount",
      "message": "O valor mínimo de depósito é R$ 10,00"
    }
  ]
}
```

### Não Autorizado (401)

```json
{
  "success": false,
  "message": "Token de autenticação não fornecido"
}
```

### Não Encontrado (404)

```json
{
  "success": false,
  "message": "Carteira não encontrada"
}
```

### Erro do Servidor (500)

```json
{
  "success": false,
  "message": "Erro interno ao processar depósito",
  "details": "Descrição técnica do erro"
}
```

### Serviço Indisponível (503)

```json
{
  "success": false,
  "message": "Erro ao gerar QR Code Pix",
  "details": "API Woovi temporariamente indisponível"
}
```

---

## 🔄 Fluxo de Depósito

```
1. Usuário faz login
   ↓
2. POST /api/wallet/deposit
   ↓
3. Sistema gera QR Code Pix via Woovi
   ↓
4. Retorna QR Code + brcode
   ↓
5. Usuário paga via Pix
   ↓
6. Woovi confirma pagamento
   ↓
7. Webhook atualiza saldo automaticamente
   ↓
8. Saldo disponível na carteira
```

### Diagrama de Sequência:

```
Usuário          Frontend          Backend          Woovi API         Database
   |                |                  |                |                |
   |-- Login ------>|                  |                |                |
   |<-- Token ------|                  |                |                |
   |                |                  |                |                |
   |-- Depositar -->|                  |                |                |
   |                |-- POST deposit ->|                |                |
   |                |                  |-- Gerar QR --->|                |
   |                |                  |<-- QR Code ----|                |
   |                |                  |-- Create Txn ----------------->|
   |                |<-- QR Code ------|                |                |
   |<-- Exibir QR --|                  |                |                |
   |                |                  |                |                |
   |-- Paga Pix ------------------->|  |                |                |
   |                |                  |<-- Webhook -----|                |
   |                |                  |-- Update Balance ------------->|
   |                |                  |-- Complete Txn --------------->|
   |<-- Notificação (Push/WebSocket) --|                |                |
```

---

## 🔄 Fluxo de Saque

```
1. Usuário solicita saque
   ↓
2. POST /api/wallet/withdraw
   ↓
3. Sistema valida saldo disponível
   ↓
4. Calcula taxa de 8%
   ↓
5. Debita valor total (saque + taxa)
   ↓
6. Cria transações (withdraw + fee)
   ↓
7. Admin recebe notificação
   ↓
8. Admin aprova/rejeita
   ↓
9a. Se aprovado: Transfere via PIX
9b. Se rejeitado: Estorna valor
```

### Diagrama de Sequência (Saque):

```
Usuário          Frontend          Backend          Admin          Database
   |                |                  |                |                |
   |-- Solicitar -->|                  |                |                |
   |                |-- POST withdraw >|                |                |
   |                |                  |-- Verificar Saldo ----------->|
   |                |                  |<-- Saldo OK ------------------|
   |                |                  |-- Calcular Taxa (8%)          |
   |                |                  |-- Debitar Total ------------->|
   |                |                  |-- Create Txn (withdraw) ----->|
   |                |                  |-- Create Txn (fee) ---------->|
   |                |<-- Pending ------|                |                |
   |<-- Aguardando --|                  |                |                |
   |                |                  |-- Notificar -->|                |
   |                |                  |                |-- Aprovar -->  |
   |                |                  |<-- Confirmar --|                |
   |                |                  |-- Update Status ------------->|
   |                |                  |-- Transfer PIX                 |
   |<-- Notificação (Saque Aprovado) --|                |                |
```

---

## 🔧 Configuração

### Variáveis de Ambiente Necessárias:

Adicione ao arquivo `.env`:

```bash
# Woovi API
WOOVI_API_URL=https://api.woovi.com/api/v1
WOOVI_APP_ID=seu_app_id_woovi

# JWT
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=24h

# Supabase (já configurado)
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_supabase
```

---

## 🧪 Testando a API

### 1. Criar depósito:

```bash
# Primeiro, faça login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'

# Copie o token retornado

# Criar depósito
curl -X POST http://localhost:3001/api/wallet/deposit \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00
  }'
```

### 2. Consultar carteira:

```bash
curl -X GET http://localhost:3001/api/wallet \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. Criar saque:

```bash
curl -X POST http://localhost:3001/api/wallet/withdraw \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "pix_key": "usuario@email.com",
    "description": "Saque de prêmio"
  }'
```

### 4. Testar webhook (desenvolvimento):

```bash
curl -X POST http://localhost:3001/api/wallet/webhook/woovi \
  -H "Content-Type: application/json" \
  -d '{
    "event": "OPENPIX:CHARGE_COMPLETED",
    "charge": {
      "status": "COMPLETED",
      "correlationID": "SEU_CORRELATION_ID",
      "value": 10000,
      "transactionID": "test_123"
    }
  }'
```

---

## 📚 Recursos Adicionais

- [Documentação Completa de Saque](./WITHDRAW_API.md)
- [Documentação Woovi](https://developers.woovi.com)
- [API de Autenticação](./AUTH_FLOW.md)
- [Schema do Banco de Dados](../../database/schema.sql)
- [Script de Teste de Saque](../TEST_WITHDRAW_ENDPOINT.sh)

---

**Última Atualização:** 04/11/2025




