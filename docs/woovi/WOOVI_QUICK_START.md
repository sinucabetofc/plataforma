# 🚀 WOOVI PIX - GUIA RÁPIDO DE IMPLEMENTAÇÃO

## ⚡ TL;DR - Resumo Executivo

**O que é:** Integração do provedor de pagamento PIX Woovi no SinucaBet.

**Como funciona:**
1. Usuário solicita depósito (ex: R$ 10)
2. Backend cria cobrança na API Woovi
3. Frontend exibe QR Code PIX
4. Usuário paga no banco
5. Woovi envia webhook confirmando pagamento
6. Backend atualiza saldo automaticamente

**Tempo estimado de implementação:** 4-6 horas

---

## 📦 O que você precisa

### Credenciais Woovi
- [ ] Conta criada em https://woovi.com
- [ ] AppID gerado (API Key)
- [ ] Webhook configurado no painel

### Backend
- [ ] Node.js + Express/Fastify
- [ ] Supabase/PostgreSQL
- [ ] Axios (para requisições HTTP)

### Frontend
- [ ] React/Next.js
- [ ] Biblioteca QR Code (opcional: `react-qr-code`)
- [ ] Toast notifications (opcional: `react-toastify`)

---

## 🔧 Passo a Passo Rápido

### 1️⃣ Configurar Ambiente (.env)

```bash
# Backend .env
WOOVI_APP_ID=seu_app_id_aqui
WOOVI_API_URL=https://api.woovi.com/api/v1
```

### 2️⃣ Criar Tabela no Banco

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  provider VARCHAR(50) DEFAULT 'woovi',
  correlation_id VARCHAR(255) UNIQUE,
  woovi_transaction_id VARCHAR(255),
  woovi_charge_id VARCHAR(255),
  woovi_paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### 3️⃣ Criar Serviço Woovi (Backend)

**Arquivo:** `backend/services/wooviService.js`

```javascript
const axios = require('axios');

class WooviService {
  constructor() {
    this.baseURL = process.env.WOOVI_API_URL;
    this.appId = process.env.WOOVI_APP_ID;
  }

  async createCharge(value, correlationID) {
    const response = await axios.post(
      `${this.baseURL}/charge`,
      { value, correlationID },
      { headers: { 'Authorization': this.appId } }
    );
    return response.data;
  }
}

module.exports = new WooviService();
```

### 4️⃣ Criar Endpoint de Depósito (Backend)

**Arquivo:** `backend/controllers/depositController.js`

```javascript
const wooviService = require('../services/wooviService');
const { v4: uuidv4 } = require('uuid');

exports.createDeposit = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  // Validar
  if (amount < 10 || amount % 10 !== 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  const correlationID = `USER_${userId}_${Date.now()}_${uuidv4()}`;
  const valueInCents = Math.round(amount * 100);

  // Criar transação no banco
  const transaction = await db.insert('transactions', {
    user_id: userId,
    type: 'deposit',
    amount,
    status: 'pending',
    correlation_id: correlationID,
  });

  // Criar cobrança na Woovi
  const result = await wooviService.createCharge(valueInCents, correlationID);

  // Retornar QR Code
  res.json({
    success: true,
    pix: {
      qrCode: result.charge.brCode,
      qrCodeImage: result.charge.qrCodeImage,
      paymentLink: result.charge.paymentLinkUrl,
    },
  });
};
```

### 5️⃣ Criar Endpoint de Webhook (Backend)

**Arquivo:** `backend/controllers/webhookController.js`

```javascript
exports.handleWooviWebhook = async (req, res) => {
  const { event, charge } = req.body;

  if (event !== 'OPENPIX:CHARGE_COMPLETED') {
    return res.status(200).json({ received: true });
  }

  // Buscar transação
  const transaction = await db.findOne('transactions', {
    correlation_id: charge.correlationID,
  });

  if (!transaction || transaction.status === 'completed') {
    return res.status(200).json({ received: true });
  }

  // Atualizar transação
  await db.update('transactions', transaction.id, {
    status: 'completed',
    completed_at: new Date(),
  });

  // Atualizar saldo
  await db.increment('users', transaction.user_id, 'balance', transaction.amount);

  console.log(`✅ Depósito confirmado: R$ ${transaction.amount}`);
  
  return res.status(200).json({ success: true });
};
```

### 6️⃣ Configurar Rotas (Backend)

**Arquivo:** `backend/routes/index.js`

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const depositController = require('../controllers/depositController');
const webhookController = require('../controllers/webhookController');

// Depósito (requer autenticação)
router.post('/deposit/create', authMiddleware, depositController.createDeposit);

// Webhook (SEM autenticação)
router.post('/webhook/woovi', webhookController.handleWooviWebhook);

module.exports = router;
```

### 7️⃣ Criar Modal de Depósito (Frontend)

**Arquivo:** `frontend/components/DepositModal.js`

```javascript
import React, { useState } from 'react';
import axios from 'axios';

const DepositModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [pixData, setPixData] = useState(null);

  const handleDeposit = async () => {
    const response = await axios.post('/api/deposit/create', 
      { amount: parseFloat(amount) },
      { headers: { 'Authorization': `Bearer ${token}` }}
    );

    setPixData(response.data.pix);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      {!pixData ? (
        <>
          <h2>Depositar via PIX</h2>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor (mín. R$ 10)"
          />
          <button onClick={handleDeposit}>Continuar</button>
        </>
      ) : (
        <>
          <h2>Pague com PIX</h2>
          <img src={pixData.qrCodeImage} alt="QR Code" />
          <button onClick={() => navigator.clipboard.writeText(pixData.qrCode)}>
            Copiar Código
          </button>
          <p>Aguardando pagamento...</p>
        </>
      )}
    </div>
  );
};

export default DepositModal;
```

---

## 🎯 Fluxo Visual Simplificado

```
┌─────────────┐
│   USUÁRIO   │
│  Solicita   │
│  Depósito   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│       FRONTEND              │
│  POST /api/deposit/create   │
│  Body: { amount: 50 }       │
└──────────┬──────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│          BACKEND                   │
│  1. Valida valor                   │
│  2. Cria transaction (pending)     │
│  3. Chama Woovi API                │
│  4. Retorna QR Code                │
└──────────┬─────────────────────────┘
           │
           ▼
┌─────────────────────┐
│   FRONTEND          │
│  Exibe QR Code      │
│  Aguarda pagamento  │
└─────────────────────┘
           │
           │  (Usuário paga no banco)
           │
           ▼
┌──────────────────────────────┐
│       WOOVI                  │
│  Detecta pagamento           │
│  Envia Webhook               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│      BACKEND (Webhook)           │
│  POST /api/webhook/woovi         │
│  1. Valida evento                │
│  2. Busca transaction            │
│  3. Atualiza status: completed   │
│  4. Credita saldo do usuário     │
└──────────┬───────────────────────┘
           │
           ▼
┌─────────────────────┐
│   FRONTEND          │
│  Polling detecta    │
│  Atualiza saldo     │
│  Exibe sucesso ✅   │
└─────────────────────┘
```

---

## 🧪 Teste Rápido

### 1. Teste Local com Ngrok

```bash
# Terminal 1: Rodar backend
cd backend
npm run dev

# Terminal 2: Expor webhook com Ngrok
ngrok http 3000

# Pegar URL do Ngrok (ex: https://abc123.ngrok.io)
# Configurar webhook no painel Woovi: https://abc123.ngrok.io/api/webhook/woovi
```

### 2. Criar Depósito de Teste

```bash
curl -X POST http://localhost:3000/api/deposit/create \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10}'
```

### 3. Simular Pagamento (Ambiente Teste)

1. Acesse o painel Woovi
2. Vá para "Transações"
3. Encontre a cobrança criada
4. Clique em "Pagar" (simulação)
5. Verifique se o webhook foi recebido nos logs

---

## ✅ Checklist Final

### Backend
- [ ] AppID configurado no `.env`
- [ ] Tabela `transactions` criada
- [ ] Serviço `wooviService.js` implementado
- [ ] Endpoint `/api/deposit/create` funcionando
- [ ] Endpoint `/api/webhook/woovi` funcionando
- [ ] Logs adicionados para debug
- [ ] Validações implementadas
- [ ] Tratamento de erros adicionado

### Frontend
- [ ] Modal de depósito criado
- [ ] Validação de valores (mín R$ 10, múltiplos de 10)
- [ ] Exibição de QR Code
- [ ] Botão copiar código
- [ ] Polling de status implementado
- [ ] Atualização de saldo funcionando
- [ ] Notificações de sucesso/erro
- [ ] Página de histórico criada

### Woovi
- [ ] Conta criada
- [ ] AppID gerado
- [ ] Webhook configurado
- [ ] Testado em ambiente sandbox
- [ ] Migrado para produção

---

## 🐛 Troubleshooting

### Erro: "AppID inválido"
- Verifique se o AppID está correto no `.env`
- Confirme que não há espaços extras
- Teste a autenticação manualmente com curl

### Webhook não chega
- Verifique a URL configurada no painel
- Use Ngrok para teste local
- Verifique logs do servidor
- Confirme que endpoint está público (sem JWT)

### Saldo não atualiza
- Verifique logs do webhook
- Confirme que `correlationID` está correto
- Verifique se transaction foi encontrada
- Teste query SQL manualmente

### QR Code não aparece
- Verifique resposta da API no console
- Confirme que `qrCodeImage` está na resposta
- Teste URL da imagem no navegador

---

## 📞 Suporte

### Documentação Completa
- [INTEGRACAO_WOOVI_PIX.md](./INTEGRACAO_WOOVI_PIX.md) - Detalhes técnicos completos
- [INTEGRACAO_WOOVI_FRONTEND_EXAMPLES.md](./INTEGRACAO_WOOVI_FRONTEND_EXAMPLES.md) - Exemplos de código frontend

### Links Úteis
- Documentação Woovi: https://developers.woovi.com
- Painel Woovi: https://woovi.com
- API Reference: https://developers.woovi.com/api

---

## 💡 Dicas Importantes

1. **Sempre use HTTPS** - Webhooks só funcionam com HTTPS em produção
2. **Idempotência** - Sempre verifique se a transação já foi processada
3. **Logs** - Registre todos os webhooks para auditoria
4. **Timeouts** - Configure timeouts adequados nas requisições HTTP
5. **Rate Limiting** - Implemente rate limiting no endpoint de depósito
6. **Validação** - Valide TODOS os inputs do usuário
7. **Segurança** - Nunca exponha o AppID no frontend
8. **Teste** - Teste tudo no ambiente sandbox antes de produção

---

## 🚀 Próximos Passos

Após implementação básica:

1. **Otimizações**
   - [ ] Implementar WebSocket em vez de polling
   - [ ] Adicionar cache de QR Codes
   - [ ] Implementar retry automático para falhas

2. **Funcionalidades Adicionais**
   - [ ] Notificações por email
   - [ ] Histórico detalhado com filtros
   - [ ] Exportação de extratos
   - [ ] Limites de depósito por usuário

3. **Melhorias de UX**
   - [ ] Animações na confirmação
   - [ ] Deep linking para apps bancários
   - [ ] Favoritar valores frequentes
   - [ ] Tutorial no primeiro depósito

4. **Monitoramento**
   - [ ] Dashboard de transações
   - [ ] Alertas de falhas
   - [ ] Métricas de conversão
   - [ ] Logs centralizados

---

## 📊 Métricas Esperadas

Após implementação bem-sucedida:

- **Tempo de confirmação**: 3-10 segundos (após pagamento)
- **Taxa de sucesso**: > 95%
- **Uptime do webhook**: > 99%
- **Conversão depósito**: Depende do seu produto

---

**Bom desenvolvimento! 🎉**

---

**Documento gerado em**: 08/11/2025  
**Versão**: 1.0  
**Parte de**: Documentação Integração Woovi PIX - SinucaBet
