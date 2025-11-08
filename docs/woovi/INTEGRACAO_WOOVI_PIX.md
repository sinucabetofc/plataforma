# 📘 INTEGRAÇÃO WOOVI PIX — DETALHES TÉCNICOS

## 📋 Índice

1. [Autenticação](#-autenticação)
2. [Criar Cobrança PIX](#-criar-cobrança-pix)
3. [Webhook de Confirmação](#-webhook-de-confirmação)
4. [Consulta de Status](#-consulta-de-status)
5. [Integração Backend](#-integração-backend)
6. [Modelo de Tabela](#-modelo-de-tabela)
7. [Fluxo Completo](#-fluxo-completo)

---

## 🔑 Autenticação

### Tipo
**Header-Based Authentication usando AppID**

### Como Obter o AppID
1. Acesse o painel Woovi
2. Vá para `Api/Plugins` na barra lateral
3. Clique em `Nova API/Plugin`
4. Selecione `API` para integrações backend
5. Salve e copie o **AppID** gerado

### Header
```
Authorization: <AppID>
```

### Exemplo de Requisição
```bash
curl --request GET \
  --url https://api.woovi.com/api/v1/charge \
  --header 'Authorization: SEU_APPID_AQUI'
```

### ⚠️ Segurança
- **NUNCA** compartilhe o AppID com terceiros
- **NÃO** reutilize chaves entre sistemas
- Armazene o AppID de forma segura (variáveis de ambiente)
- Todas as requisições devem usar **HTTPS**

---

## 💰 Criar Cobrança PIX

### Endpoint
```
POST https://api.woovi.com/api/v1/charge
```

### Método
`POST`

### Headers
```json
{
  "Authorization": "<AppID>",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Body (Campos Obrigatórios)
```json
{
  "value": 1000,
  "correlationID": "c782e0ac-833d-4a89-9e73-9b60b2b41d3a"
}
```

### Campos Importantes

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `value` | Integer | ✅ Sim | Valor em **centavos** (ex: 1000 = R$ 10,00) |
| `correlationID` | String (UUID) | ✅ Sim | Identificador único da cobrança (gerado pelo seu sistema) |
| `comment` | String | ❌ Não | Comentário/descrição da cobrança |
| `customer` | Object | ❌ Não | Dados do cliente (name, taxID) |

### Exemplo de Body Completo
```json
{
  "value": 1000,
  "correlationID": "550e8400-e29b-41d4-a716-446655440000",
  "comment": "Depósito SinucaBet",
  "customer": {
    "name": "João Silva",
    "taxID": {
      "taxID": "12345678900",
      "type": "BR:CPF"
    }
  }
}
```

### Resposta de Sucesso (Status 200)
```json
{
  "charge": {
    "customer": null,
    "value": 1000,
    "identifier": "996ed4b7cc1c...",
    "correlationID": "c782e0ac-833d-4a89-9e73-9b60b2b41d3a",
    "paymentLinkID": "86f574fb-73...",
    "transactionID": "996ed4b7cc1c...",
    "status": "ACTIVE",
    "giftbackAppliedValue": 0,
    "discount": 0,
    "valueWithDiscount": 1000,
    "expiresDate": "2023-02-25T20:09:06.141Z",
    "type": "DYNAMIC",
    "createdAt": "2023-02-24T20:09:06.141Z",
    "additionalInfo": [],
    "updatedAt": "2023-02-24T20:09:14.165Z",
    "expiresIn": 86400,
    "pixKey": "d65032a3-c0c...",
    "brCode": "0002010102...",
    "paymentLinkUrl": "http://url.com/pay/...",
    "qrCodeImage": "http://url.com/openpix/charge/brcode/image/...",
    "globalID": "Q2hhcmdlOjYzZjkxOTZhNjA3ODg1..."
  },
  "correlationID": "c782e0ac-833d-4a89-9e73-9b60b2b41d3a",
  "brCode": "0002010102..."
}
```

### Campos da Resposta Importantes para o Frontend

| Campo | Descrição | Uso |
|-------|-----------|-----|
| `brCode` | Código PIX copia e cola | Exibir no frontend para copiar |
| `qrCodeImage` | URL da imagem do QR Code | Exibir imagem para scan |
| `paymentLinkUrl` | Link de pagamento | Alternativa para abrir no app bancário |
| `correlationID` | ID único da cobrança | Identificar a transação |
| `transactionID` | ID da transação Woovi | Rastrear no painel Woovi |
| `status` | Status atual (`ACTIVE`, `COMPLETED`, `EXPIRED`) | Controlar estado |
| `expiresDate` | Data de expiração | Mostrar countdown |
| `value` | Valor em centavos | Exibir para o usuário |

---

## 🧾 Webhook de Confirmação

### O que é Webhook?
Webhook é uma notificação HTTP enviada automaticamente pela Woovi para o seu servidor quando um evento ocorre (ex: pagamento confirmado).

### Endpoint que você deve criar
```
POST https://seu-dominio.com/api/webhook/woovi
```

### Configuração no Painel Woovi
1. Acesse o painel Woovi
2. Vá para `Webhook` no menu
3. Clique em `Novo Webhook`
4. Insira a URL do seu endpoint: `https://seu-dominio.com/api/webhook/woovi`
5. Selecione o evento: `OPENPIX:CHARGE_COMPLETED`
6. Salve

### Evento Principal: `OPENPIX:CHARGE_COMPLETED`
Este evento é enviado quando uma cobrança PIX é **paga**.

### Exemplo de Payload Recebido
```json
{
  "event": "OPENPIX:CHARGE_COMPLETED",
  "charge": {
    "value": 1000,
    "comment": "",
    "identifier": "d983a07836cf48ed9a65764d3c184273",
    "transactionID": "d983a07836cf48ed9a65764d3c184273",
    "status": "COMPLETED",
    "additionalInfo": [],
    "fee": 85,
    "discount": 0,
    "valueWithDiscount": 1000,
    "expiresDate": "2025-09-25T15:08:12.278Z",
    "type": "DYNAMIC",
    "correlationID": "3f2a2690-8224-4aae-a1ba-ed26d4d61f81",
    "paymentLinkID": "788c8d0d-182b-468e-942e-546be6a621c2",
    "createdAt": "2025-09-24T15:07:47.334Z",
    "updatedAt": "2025-09-24T15:08:13.578Z",
    "customer": {
      "name": "Cliente Teste",
      "taxID": {
        "taxID": "44720743000101",
        "type": "BR:CNPJ"
      },
      "correlationID": "ecd41c3b-487c-4719-b9f7-53b6dd6759cb"
    },
    "paidAt": "2025-09-24T15:07:50.891Z",
    "payer": null,
    "ensureSameTaxID": false,
    "brCode": "00020101021226980014...",
    "expiresIn": 86424,
    "pixKey": "67856db0-ac6e-4276-8309-503a22a896dc",
    "paymentLinkUrl": "https://woovi-sandbox.com/pay/788c8d0d-182b-468e-942e-546be6a621c2",
    "qrCodeImage": "https://api.woovi-sandbox.com/openpix/charge/brcode/image/788c8d0d-182b-468e-942e-546be6a621c2.png",
    "globalID": "Q2hhcmdlOjY4ZDQwOTQzMDY5YTI4ZjgzMTEzOTVkZA==",
    "paymentMethods": {
      "pix": {
        "method": "PIX_COB",
        "txId": "d983a07836cf48ed9a65764d3c184273",
        "value": 1000,
        "status": "COMPLETED",
        "fee": 85,
        "brCode": "00020101021226980014...",
        "transactionID": "d983a07836cf48ed9a65764d3c184273",
        "identifier": "d983a07836cf48ed9a65764d3c184273",
        "qrCodeImage": "https://api.woovi-sandbox.com/openpix/charge/brcode/image/788c8d0d-182b-468e-942e-546be6a621c2.png"
      }
    }
  },
  "pix": {
    "customer": {
      "name": "Cliente Teste",
      "taxID": {
        "taxID": "44720743000101",
        "type": "BR:CNPJ"
      },
      "correlationID": "ecd41c3b-487c-4719-b9f7-53b6dd6759cb"
    },
    "payer": {
      "name": "Cliente Teste",
      "taxID": {
        "taxID": "44720743000101",
        "type": "BR:CNPJ"
      },
      "correlationID": "ecd41c3b-487c-4719-b9f7-53b6dd6759cb"
    },
    "charge": { ... },
    "value": 1000,
    "time": "2025-09-24T15:07:50.891Z",
    "endToEndId": "Efa8df7c628cf43d2af424696ea0c6444",
    "transactionID": "d983a07836cf48ed9a65764d3c184273",
    "infoPagador": "OpenPix testing",
    "status": "CONFIRMED",
    "type": "PAYMENT",
    "createdAt": "2025-09-24T15:07:50.915Z",
    "globalID": "UGl4VHJhbnNhY3Rpb246NjhkNDA5NDYwNjlhMjhmODMxMTM5NjU4"
  },
  "company": {
    "id": "6810ce3b892866f103d77ef2",
    "name": "Lucas Aprigio Sandbox",
    "taxID": "57437573000102"
  },
  "account": {
    "environment": "TESTING"
  }
}
```

### Campos Importantes do Webhook

| Campo | Descrição | Como Usar |
|-------|-----------|-----------|
| `event` | Tipo do evento | Verificar se é `OPENPIX:CHARGE_COMPLETED` |
| `charge.correlationID` | ID único que você criou | **Identificar qual usuário/transação** |
| `charge.value` | Valor em centavos | Valor a creditar no saldo |
| `charge.status` | Status (`COMPLETED`) | Confirmar que está pago |
| `charge.paidAt` | Data/hora do pagamento | Registrar quando foi pago |
| `charge.fee` | Taxa cobrada pela Woovi | Opcional: registrar para controle |
| `pix.endToEndId` | ID único do PIX no sistema bancário | Rastreamento |

### Como Identificar o Usuário
Use o campo `charge.correlationID` que você definiu ao criar a cobrança. Este ID deve conter informações para identificar o usuário e a transação no seu sistema.

**Exemplo de formato:**
```
correlationID: "USER_123_DEPOSIT_20250108"
```

Ou armazene em uma tabela de mapeamento:
```
correlationID -> userId
```

---

## 🔁 Consulta de Status (Opcional)

### Endpoint
```
GET https://api.woovi.com/api/v1/charge/{id}
```

### Método
`GET`

### Headers
```json
{
  "Authorization": "<AppID>"
}
```

### Parâmetros
- `{id}`: pode ser o `correlationID` ou `transactionID`

### Exemplo
```bash
curl --request GET \
  --url https://api.woovi.com/api/v1/charge/c782e0ac-833d-4a89-9e73-9b60b2b41d3a \
  --header 'Authorization: SEU_APPID_AQUI'
```

### Resposta
Retorna o mesmo formato da criação de cobrança com o status atualizado:
- `ACTIVE`: Aguardando pagamento
- `COMPLETED`: Pago
- `EXPIRED`: Expirado

---

## 🔧 Integração Backend

### Estrutura Sugerida

```
backend/
├── services/
│   ├── wooviService.js          # Serviço principal Woovi
│   └── transactionService.js    # Lógica de transações
├── controllers/
│   ├── depositController.js     # Controller de depósitos
│   └── webhookController.js     # Controller do webhook
├── routes/
│   ├── deposit.js               # Rotas de depósito
│   └── webhook.js               # Rota do webhook
└── middlewares/
    └── wooviWebhook.js          # Validação do webhook
```

### 1. Serviço Woovi (`services/wooviService.js`)

```javascript
const axios = require('axios');

class WooviService {
  constructor() {
    this.baseURL = process.env.WOOVI_API_URL || 'https://api.woovi.com/api/v1';
    this.appId = process.env.WOOVI_APP_ID;
  }

  /**
   * Cria uma cobrança PIX
   * @param {number} value - Valor em centavos (ex: 1000 = R$ 10,00)
   * @param {string} correlationID - ID único da transação
   * @param {string} comment - Comentário opcional
   * @returns {Promise<Object>} Dados da cobrança
   */
  async createCharge(value, correlationID, comment = null) {
    try {
      const payload = {
        value: parseInt(value),
        correlationID,
      };

      if (comment) {
        payload.comment = comment;
      }

      const response = await axios.post(
        `${this.baseURL}/charge`,
        payload,
        {
          headers: {
            'Authorization': this.appId,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Erro ao criar cobrança Woovi:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || 'Erro ao criar cobrança PIX',
      };
    }
  }

  /**
   * Consulta o status de uma cobrança
   * @param {string} correlationID - ID da cobrança
   * @returns {Promise<Object>} Dados da cobrança
   */
  async getCharge(correlationID) {
    try {
      const response = await axios.get(
        `${this.baseURL}/charge/${correlationID}`,
        {
          headers: {
            'Authorization': this.appId,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Erro ao consultar cobrança:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Erro ao consultar cobrança',
      };
    }
  }
}

module.exports = new WooviService();
```

### 2. Controller de Depósito (`controllers/depositController.js`)

```javascript
const wooviService = require('../services/wooviService');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');

exports.createDeposit = async (req, res) => {
  try {
    const { amount } = req.body; // Valor em reais (ex: 10.00)
    const userId = req.user.id; // ID do usuário autenticado

    // Validações
    if (!amount || amount < 10) {
      return res.status(400).json({
        error: 'Valor mínimo de depósito é R$ 10,00',
      });
    }

    // Validar múltiplos de 10
    if (amount % 10 !== 0) {
      return res.status(400).json({
        error: 'O valor deve ser múltiplo de 10',
      });
    }

    // Converter para centavos
    const valueInCents = Math.round(amount * 100);

    // Gerar correlationID único
    const correlationID = `USER_${userId}_DEPOSIT_${Date.now()}_${uuidv4()}`;

    // Criar transação no banco ANTES de criar a cobrança
    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount: amount,
        status: 'pending',
        provider: 'woovi',
        correlation_id: correlationID,
        created_at: new Date(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao criar transação:', dbError);
      return res.status(500).json({ error: 'Erro ao processar depósito' });
    }

    // Criar cobrança PIX na Woovi
    const result = await wooviService.createCharge(
      valueInCents,
      correlationID,
      `Depósito SinucaBet - ${amount.toFixed(2)}`
    );

    if (!result.success) {
      // Atualizar transação como falha
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      return res.status(500).json({
        error: result.error,
      });
    }

    const { charge } = result.data;

    // Atualizar transação com dados da Woovi
    await supabase
      .from('transactions')
      .update({
        woovi_transaction_id: charge.transactionID,
        woovi_charge_id: charge.identifier,
        expires_at: charge.expiresDate,
      })
      .eq('id', transaction.id);

    // Retornar dados para o frontend
    return res.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: amount,
        status: 'pending',
        expiresAt: charge.expiresDate,
      },
      pix: {
        qrCode: charge.brCode,
        qrCodeImage: charge.qrCodeImage,
        paymentLink: charge.paymentLinkUrl,
        expiresIn: charge.expiresIn,
      },
    });
  } catch (error) {
    console.error('Erro ao criar depósito:', error);
    return res.status(500).json({
      error: 'Erro interno ao processar depósito',
    });
  }
};
```

### 3. Controller do Webhook (`controllers/webhookController.js`)

```javascript
const { supabase } = require('../config/supabase');

exports.handleWooviWebhook = async (req, res) => {
  try {
    const payload = req.body;

    // Log do webhook recebido
    console.log('Webhook Woovi recebido:', JSON.stringify(payload, null, 2));

    // Verificar evento
    if (payload.event !== 'OPENPIX:CHARGE_COMPLETED') {
      console.log('Evento ignorado:', payload.event);
      return res.status(200).json({ received: true });
    }

    const { charge } = payload;

    // Validar campos obrigatórios
    if (!charge || !charge.correlationID || !charge.status) {
      console.error('Webhook inválido: campos obrigatórios faltando');
      return res.status(400).json({ error: 'Webhook inválido' });
    }

    // Verificar se está pago
    if (charge.status !== 'COMPLETED') {
      console.log('Status não é COMPLETED:', charge.status);
      return res.status(200).json({ received: true });
    }

    // Buscar transação no banco
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('*')
      .eq('correlation_id', charge.correlationID)
      .single();

    if (findError || !transaction) {
      console.error('Transação não encontrada:', charge.correlationID);
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Verificar se já foi processada
    if (transaction.status === 'completed') {
      console.log('Transação já processada:', transaction.id);
      return res.status(200).json({ received: true, message: 'Já processado' });
    }

    // Valor a creditar (em reais)
    const amountToCredit = transaction.amount;

    // Atualizar transação
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        completed_at: new Date(),
        woovi_paid_at: charge.paidAt,
        woovi_fee: charge.fee,
        woovi_end_to_end_id: payload.pix?.endToEndId,
      })
      .eq('id', transaction.id);

    if (updateTxError) {
      console.error('Erro ao atualizar transação:', updateTxError);
      return res.status(500).json({ error: 'Erro ao atualizar transação' });
    }

    // Atualizar saldo do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', transaction.user_id)
      .single();

    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      return res.status(500).json({ error: 'Erro ao atualizar saldo' });
    }

    const newBalance = parseFloat(user.balance) + parseFloat(amountToCredit);

    const { error: balanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', transaction.user_id);

    if (balanceError) {
      console.error('Erro ao atualizar saldo:', balanceError);
      return res.status(500).json({ error: 'Erro ao atualizar saldo' });
    }

    console.log(`✅ Depósito processado com sucesso!`);
    console.log(`   Usuário: ${transaction.user_id}`);
    console.log(`   Valor: R$ ${amountToCredit}`);
    console.log(`   Novo saldo: R$ ${newBalance.toFixed(2)}`);

    // Retornar sucesso (Woovi espera status 200)
    return res.status(200).json({
      success: true,
      message: 'Pagamento processado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({
      error: 'Erro interno ao processar webhook',
    });
  }
};
```

### 4. Rotas (`routes/webhook.js`)

```javascript
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Rota do webhook (SEM autenticação JWT)
router.post('/woovi', webhookController.handleWooviWebhook);

module.exports = router;
```

### 5. Rotas de Depósito (`routes/deposit.js`)

```javascript
const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const authMiddleware = require('../middlewares/auth');

// Criar depósito (COM autenticação JWT)
router.post('/create', authMiddleware, depositController.createDeposit);

module.exports = router;
```

---

## 📊 Modelo de Tabela `transactions`

### SQL (Supabase/PostgreSQL)

```sql
-- Tabela de transações
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet', 'win', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  provider VARCHAR(50) DEFAULT 'woovi',
  
  -- Campos Woovi
  correlation_id VARCHAR(255) UNIQUE,
  woovi_transaction_id VARCHAR(255),
  woovi_charge_id VARCHAR(255),
  woovi_paid_at TIMESTAMP,
  woovi_fee INTEGER, -- Taxa em centavos
  woovi_end_to_end_id VARCHAR(255),
  
  -- Metadados
  metadata JSONB,
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Índices
  INDEX idx_transactions_user_id (user_id),
  INDEX idx_transactions_correlation_id (correlation_id),
  INDEX idx_transactions_status (status),
  INDEX idx_transactions_type (type),
  INDEX idx_transactions_created_at (created_at DESC)
);

-- Comentários
COMMENT ON TABLE transactions IS 'Tabela de transações do sistema';
COMMENT ON COLUMN transactions.amount IS 'Valor em reais';
COMMENT ON COLUMN transactions.woovi_fee IS 'Taxa da Woovi em centavos';
COMMENT ON COLUMN transactions.correlation_id IS 'ID único usado na integração com Woovi';
```

### Descrição dos Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da transação |
| `user_id` | UUID | ID do usuário |
| `type` | VARCHAR | Tipo: `deposit`, `withdrawal`, `bet`, `win`, `refund` |
| `amount` | DECIMAL | Valor em reais (ex: 10.00) |
| `status` | VARCHAR | Status: `pending`, `completed`, `failed`, `cancelled` |
| `provider` | VARCHAR | Provedor: `woovi` |
| `correlation_id` | VARCHAR | ID único gerado pelo sistema para rastrear na Woovi |
| `woovi_transaction_id` | VARCHAR | ID da transação na Woovi |
| `woovi_charge_id` | VARCHAR | ID da cobrança na Woovi |
| `woovi_paid_at` | TIMESTAMP | Data/hora do pagamento confirmado |
| `woovi_fee` | INTEGER | Taxa cobrada pela Woovi (em centavos) |
| `woovi_end_to_end_id` | VARCHAR | ID único do PIX no sistema bancário |
| `metadata` | JSONB | Dados adicionais em JSON |
| `description` | TEXT | Descrição da transação |
| `created_at` | TIMESTAMP | Data/hora de criação |
| `completed_at` | TIMESTAMP | Data/hora de conclusão |
| `expires_at` | TIMESTAMP | Data/hora de expiração |

---

## 🔄 Fluxo Completo

### 1️⃣ Usuário Solicita Depósito (Frontend)

```javascript
// Frontend: components/DepositModal.js
const handleDeposit = async (amount) => {
  try {
    const response = await fetch('/api/deposit/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (data.success) {
      // Exibir QR Code
      setQrCode(data.pix.qrCode);
      setQrCodeImage(data.pix.qrCodeImage);
      setPaymentLink(data.pix.paymentLink);
      setExpiresIn(data.pix.expiresIn);
      
      // Iniciar polling para verificar pagamento
      startPolling(data.transaction.id);
    }
  } catch (error) {
    console.error('Erro ao criar depósito:', error);
  }
};
```

### 2️⃣ Backend Cria Cobrança na Woovi

```
POST /api/deposit/create
↓
depositController.createDeposit()
↓
1. Valida valor (mínimo R$ 10, múltiplo de 10)
2. Gera correlationID único
3. Cria registro na tabela transactions (status: pending)
4. Chama wooviService.createCharge()
5. Atualiza transaction com dados da Woovi
6. Retorna QR Code para o frontend
```

### 3️⃣ Usuário Paga o PIX

```
Usuário escaneia QR Code ou copia código
↓
Paga no app bancário
↓
Woovi detecta pagamento
```

### 4️⃣ Woovi Envia Webhook

```
Woovi envia POST para https://seu-dominio.com/api/webhook/woovi
↓
Payload: { event: "OPENPIX:CHARGE_COMPLETED", charge: {...}, pix: {...} }
```

### 5️⃣ Backend Processa Webhook

```
POST /api/webhook/woovi
↓
webhookController.handleWooviWebhook()
↓
1. Valida evento (OPENPIX:CHARGE_COMPLETED)
2. Busca transaction por correlationID
3. Verifica se já foi processada
4. Atualiza transaction (status: completed)
5. Busca saldo atual do usuário
6. Incrementa saldo: novo_saldo = saldo_atual + amount
7. Atualiza users.balance
8. Retorna 200 OK para Woovi
```

### 6️⃣ Frontend Detecta Pagamento

```
Polling ou WebSocket detecta mudança
↓
Atualiza saldo na interface
↓
Exibe mensagem de sucesso
↓
Fecha modal de depósito
```

---

## 🎯 Checklist de Implementação

### Backend
- [ ] Criar variável de ambiente `WOOVI_APP_ID`
- [ ] Criar serviço `wooviService.js`
- [ ] Criar controller `depositController.js`
- [ ] Criar controller `webhookController.js`
- [ ] Criar rotas `/api/deposit/create`
- [ ] Criar rota `/api/webhook/woovi`
- [ ] Criar tabela `transactions` no Supabase
- [ ] Adicionar coluna `balance` na tabela `users` (se não existir)
- [ ] Testar criação de cobrança
- [ ] Testar webhook (usar Ngrok ou domínio público)
- [ ] Adicionar logs detalhados
- [ ] Implementar tratamento de erros

### Frontend
- [ ] Criar modal de depósito
- [ ] Implementar input de valor (validar múltiplos de 10)
- [ ] Exibir QR Code (imagem)
- [ ] Exibir código copia e cola
- [ ] Adicionar botão "Abrir no app"
- [ ] Implementar countdown de expiração
- [ ] Implementar polling para verificar pagamento
- [ ] Atualizar saldo após pagamento
- [ ] Exibir notificação de sucesso
- [ ] Adicionar página de histórico de transações

### Configuração Woovi
- [ ] Criar conta na Woovi
- [ ] Gerar AppID
- [ ] Configurar webhook no painel
- [ ] Testar em ambiente de teste primeiro
- [ ] Migrar para produção

---

## 🧪 Ambiente de Teste

### URLs
- **API Teste**: `https://api.woovi-sandbox.com/api/v1`
- **API Produção**: `https://api.woovi.com/api/v1`

### Como Testar
1. Acesse o painel Woovi em modo teste
2. Crie um AppID de teste
3. Use o AppID de teste no backend
4. Crie uma cobrança
5. Use o "Pix de Teste" no painel para simular pagamento
6. Verifique se o webhook foi recebido

### Simulando Pagamento
No ambiente de teste, você pode simular um pagamento diretamente no painel da Woovi sem precisar pagar de verdade.

---

## 📝 Observações Importantes

1. **Taxas**: A Woovi cobra uma taxa por transação (ex: R$ 0,85 por PIX). Essa taxa já vem descontada no webhook (campo `fee`).

2. **Expiração**: Por padrão, cobranças expiram em 24h (86400 segundos). Configure conforme necessário.

3. **Webhook Retry**: A Woovi tenta reenviar o webhook várias vezes caso seu servidor não responda. Sempre retorne `200 OK`.

4. **Segurança**: 
   - Nunca exponha o AppID no frontend
   - Valide sempre o `correlationID` no webhook
   - Implemente verificação de assinatura (HMAC) se disponível

5. **Idempotência**: Sempre verifique se a transação já foi processada antes de creditar o saldo novamente.

6. **Logs**: Registre todos os webhooks recebidos para auditoria e debug.

---

## 🚀 Próximos Passos

1. Implementar os arquivos sugeridos no backend
2. Criar a UI de depósito no frontend
3. Testar em ambiente de desenvolvimento local (use Ngrok para expor o webhook)
4. Migrar para ambiente de teste da Woovi
5. Validar todo o fluxo
6. Configurar domínio de produção
7. Migrar para produção

---

## 📚 Referências

- [Documentação Woovi](https://developers.woovi.com/docs/intro/getting-started)
- [API Reference](https://developers.woovi.com/api)
- [Webhooks](https://developers.woovi.com/docs/category/webhook-1)
- [Tipos de Eventos](https://developers.woovi.com/docs/webhook/webhook-events-type)

---

## 💬 Suporte

Em caso de dúvidas sobre a API Woovi:
- Documentação: https://developers.woovi.com
- Suporte: Acessar painel Woovi

---

**Documento gerado em**: 08/11/2025  
**Versão**: 1.0  
**Autor**: AI Agent - Cursor
