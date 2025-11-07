# 💰 Implementação da API de Carteira (Wallet)

## 📋 Resumo da Implementação

Esta implementação adiciona funcionalidades completas de carteira digital ao SinucaBet, incluindo:
- Consulta de saldo e histórico de transações
- Depósitos via Pix com QR Code (integração Woovi)
- Confirmação automática de pagamentos via webhook
- Autenticação e proteção de rotas

---

## 📁 Arquivos Criados/Modificados

### ✅ Arquivos Criados

```
backend/
├── middlewares/
│   └── auth.middleware.js          # Middleware de autenticação JWT
├── validators/
│   └── wallet.validator.js         # Schemas Zod para validação
├── services/
│   └── wallet.service.js           # Lógica de negócio + integração Woovi
├── controllers/
│   └── wallet.controller.js        # Controllers dos endpoints
├── routes/
│   └── wallet.routes.js            # Rotas da API
├── docs/
│   └── WALLET_API.md               # Documentação completa da API
├── TEST_WALLET_ENDPOINTS.sh        # Script de teste interativo
├── .env.example                    # Exemplo de variáveis de ambiente
└── WALLET_IMPLEMENTATION.md        # Este arquivo
```

### 🔧 Arquivos Modificados

```
backend/
└── server.js                       # Adicionadas rotas /api/wallet
```

---

## 🚀 Funcionalidades Implementadas

### 1. **GET /api/wallet**
- Retorna saldo disponível e bloqueado
- Lista últimas 10 transações
- Protegido por autenticação JWT
- Rate limit: 30 req/min

### 2. **POST /api/wallet/deposit**
- Cria depósito via Pix
- Gera QR Code através da API Woovi
- Retorna QR Code (imagem + brcode)
- Cria transação pendente no banco
- Rate limit: 5 req/hora

### 3. **POST /api/wallet/webhook/woovi**
- Webhook para confirmação de pagamentos
- Processa notificações da Woovi
- Atualiza saldo automaticamente
- Marca transação como completada
- Sem autenticação (público)

---

## 🏗️ Arquitetura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────┐
│         Routes (wallet.routes.js)       │
│  - Rate Limiting                        │
│  - Auth Middleware                      │
└──────┬──────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│      Controller (wallet.controller.js)  │
│  - Validação de Input (Zod)            │
│  - Tratamento de Erros                  │
└──────┬──────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│       Service (wallet.service.js)       │
│  - Lógica de Negócio                   │
│  - Integração Woovi API                 │
│  - Operações de Banco de Dados          │
└──────┬──────────────────────────────────┘
       │
       ├──────────────────┬────────────────┐
       ↓                  ↓                ↓
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│  Supabase   │  │  Woovi API   │  │ Validações  │
│  (Database) │  │ (Pix/QRCode) │  │    (Zod)    │
└─────────────┘  └──────────────┘  └─────────────┘
```

---

## 🔄 Fluxo de Depósito

### Passo a Passo:

1. **Usuário solicita depósito**
   - POST /api/wallet/deposit com amount
   - Token JWT no header

2. **Backend processa**
   - Valida dados (Zod)
   - Verifica autenticação (JWT)
   - Gera correlationID único

3. **Integração Woovi**
   - Chama API Woovi
   - Recebe QR Code + brcode
   - Retorna dados para cliente

4. **Registro no banco**
   - Cria transação status: "pending"
   - Armazena metadata (correlationID, QR code)

5. **Cliente exibe QR Code**
   - Usuário paga via Pix
   - Aguarda confirmação

6. **Woovi confirma pagamento**
   - Envia webhook para /api/wallet/webhook/woovi
   - Payload com status: "COMPLETED"

7. **Backend confirma depósito**
   - Busca transação por correlationID
   - Atualiza wallet.balance
   - Marca transação como "completed"

8. **Saldo disponível**
   - Usuário pode consultar novo saldo
   - GET /api/wallet

---

## 🔐 Segurança

### Autenticação
- JWT Bearer Token obrigatório em rotas protegidas
- Token gerado no login (/api/auth/login)
- Expiração configurável (padrão: 24h)

### Rate Limiting
- **Depósito:** 5 requisições/hora por IP
- **Consulta:** 30 requisições/minuto
- **Webhook:** 100 requisições/minuto

### Validação
- Schemas Zod para todos os inputs
- Validação de valores (min/max)
- Sanitização de dados

### Tratamento de Erros
- Erros customizados por tipo
- Logs detalhados no servidor
- Mensagens genéricas ao cliente

---

## 🧪 Como Testar

### Opção 1: Script Automatizado

```bash
cd backend
./TEST_WALLET_ENDPOINTS.sh
```

### Opção 2: cURL Manual

#### 1. Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "sua_senha"
  }'
```

#### 2. Consultar Carteira:
```bash
curl -X GET http://localhost:3001/api/wallet \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### 3. Criar Depósito:
```bash
curl -X POST http://localhost:3001/api/wallet/deposit \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "description": "Teste de depósito"
  }'
```

#### 4. Simular Webhook:
```bash
curl -X POST http://localhost:3001/api/wallet/webhook/woovi \
  -H "Content-Type: application/json" \
  -d '{
    "event": "OPENPIX:CHARGE_COMPLETED",
    "charge": {
      "status": "COMPLETED",
      "correlationID": "SEU_CORRELATION_ID",
      "value": 10000
    }
  }'
```

---

## ⚙️ Configuração

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite `.env` e preencha:
```bash
# Obrigatório
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=...

# Para produção (depósitos reais)
WOOVI_APP_ID=...
```

### 3. Criar Conta Woovi (Produção)

1. Acesse [developers.woovi.com](https://developers.woovi.com)
2. Crie uma conta
3. Obtenha seu APP_ID
4. Configure webhook URL em produção

### 4. Iniciar Servidor
```bash
npm run dev
```

---

## 🐛 Modo Desenvolvimento

Em `NODE_ENV=development`, a integração Woovi usa dados MOCK:
- QR Code: Imagem placeholder
- brcode: Código fictício válido
- Não faz chamadas reais à API Woovi

Para testar em produção:
- Configure `WOOVI_APP_ID` válido
- Mude `NODE_ENV=production`

---

## 📊 Estrutura do Banco de Dados

### Tabela: wallet
```sql
- balance: DECIMAL(15,2)           -- Saldo total
- blocked_balance: DECIMAL(15,2)   -- Saldo bloqueado
- total_deposited: DECIMAL(15,2)   -- Total depositado
- total_withdrawn: DECIMAL(15,2)   -- Total sacado
```

### Tabela: transactions
```sql
- type: ENUM (deposit, bet, win, withdraw, fee, refund)
- status: ENUM (pending, completed, failed, cancelled)
- amount: DECIMAL(15,2)
- fee: DECIMAL(15,2)
- net_amount: DECIMAL(15,2)
- metadata: JSONB (correlationID, QR code, etc)
```

---

## 🚨 Troubleshooting

### Erro: "Token inválido ou expirado"
- Faça login novamente para obter novo token
- Verifique se JWT_SECRET está configurado

### Erro: "WOOVI_APP_ID não configurado"
- Em desenvolvimento: OK (usa dados mock)
- Em produção: Configure no .env

### Erro: "Carteira não encontrada"
- Verifique se usuário existe
- Trigger deve criar carteira automaticamente no registro

### Webhook não funciona em localhost
- Use ngrok ou similar para expor localhost
- Configure URL pública no painel Woovi

---

## 📚 Próximos Passos (Futuro)

- [ ] Implementar saques (POST /api/wallet/withdraw)
- [ ] Adicionar notificações push (WebSocket)
- [ ] Histórico completo de transações com paginação
- [ ] Exportar extrato em PDF
- [ ] Dashboard administrativo de transações
- [ ] Integração com outras formas de pagamento
- [ ] Sistema de cashback e promoções

---

## 📖 Documentação Adicional

- [API Completa](./docs/WALLET_API.md)
- [Fluxo de Autenticação](./docs/AUTH_FLOW.md)
- [Schema do Banco](../database/schema.sql)
- [Woovi Docs](https://developers.woovi.com)

---

## ✅ Checklist de Implementação

- [x] Middleware de autenticação JWT
- [x] Validators com Zod
- [x] Service com integração Woovi
- [x] Controllers dos endpoints
- [x] Rotas protegidas
- [x] Webhook para confirmação
- [x] Rate limiting
- [x] Tratamento de erros
- [x] Documentação completa
- [x] Script de testes
- [x] Variáveis de ambiente
- [x] Modo desenvolvimento (mock)

---

**Implementado por:** AI Assistant  
**Data:** 04/11/2025  
**Versão:** 1.0.0

---

## 📝 Notas de Desenvolvimento

### Decisões de Arquitetura:

1. **Uso de correlationID único:** Permite rastreamento preciso de cada transação entre sistema e Woovi

2. **Transação pendente antes do pagamento:** Garante registro de todas as tentativas de depósito

3. **Webhook sempre retorna 200:** Evita reenvios desnecessários da Woovi

4. **Dados mock em desenvolvimento:** Facilita testes sem depender da API Woovi

5. **Rate limiting diferenciado:** Protege contra abuso mantendo boa UX

### Melhorias Aplicadas:

- Validação robusta com Zod
- Tratamento de erros específico por tipo
- Logs detalhados para debugging
- Documentação completa em Markdown
- Script de teste interativo
- Suporte a ambiente de desenvolvimento

### Compatibilidade:

- ✅ Node.js 18+
- ✅ PostgreSQL 14+
- ✅ Supabase
- ✅ Woovi API v1








