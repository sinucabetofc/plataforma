# 💰 Implementação do Endpoint de Saque (Withdraw)

## 📋 Resumo da Implementação

Data: 04/11/2025

### ✅ Funcionalidades Implementadas

O endpoint **POST /api/wallet/withdraw** foi implementado com sucesso, permitindo que usuários solicitem saques via PIX com as seguintes características:

---

## 🎯 Características Principais

### 1. **Taxa de 8%**
- Taxa automática calculada sobre o valor solicitado
- Valor líquido é transferido para o usuário
- Taxa é debitada separadamente

### 2. **Débito Imediato**
- O saldo é debitado imediatamente ao criar a solicitação
- Garante que o valor está reservado para o saque
- Previne problemas de saldo insuficiente

### 3. **Aprovação do Admin**
- Status inicial: `pending`
- Aguarda confirmação do administrador
- Sistema preparado para aprovação/rejeição

### 4. **Duas Transações**
- **Transação de Saque**: type `withdraw`, status `pending`
- **Transação de Taxa**: type `fee`, status `completed`
- Facilita rastreamento e auditoria

### 5. **Validações Robustas**
- Valor mínimo: R$ 20,00
- Valor máximo: R$ 50.000,00
- Chave PIX obrigatória
- Verificação de saldo disponível (balance - blocked_balance)

### 6. **Segurança**
- Rate limit: 3 saques por hora por IP
- Autenticação JWT obrigatória
- Rollback automático em caso de erro
- Chave PIX armazenada no metadata da transação

---

## 📁 Arquivos Modificados/Criados

### 1. **Backend - Service Layer**
**Arquivo:** `backend/services/wallet.service.js`

**Método adicionado:** `createWithdraw(userId, amount, pixKey, description)`

**Responsabilidades:**
- Validar usuário e carteira
- Calcular taxa de 8%
- Verificar saldo disponível
- Atualizar saldo da carteira
- Criar transações (withdraw + fee)
- Realizar rollback em caso de erro

### 2. **Backend - Controller Layer**
**Arquivo:** `backend/controllers/wallet.controller.js`

**Método adicionado:** `createWithdraw(req, res)`

**Responsabilidades:**
- Validar request body usando Zod
- Chamar o service layer
- Tratar erros específicos
- Retornar resposta padronizada

**Import adicionado:**
```javascript
const { depositSchema, withdrawSchema, wooviWebhookSchema } = require('../validators/wallet.validator');
```

### 3. **Backend - Routes**
**Arquivo:** `backend/routes/wallet.routes.js`

**Rota adicionada:**
```javascript
router.post('/withdraw', authenticateToken, withdrawLimiter, walletController.createWithdraw);
```

**Rate Limiter adicionado:**
```javascript
const withdrawLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: {
    success: false,
    message: 'Você atingiu o limite de saques por hora. Tente novamente mais tarde.'
  }
});
```

### 4. **Validator**
**Arquivo:** `backend/validators/wallet.validator.js`

**Observação:** O schema `withdrawSchema` já existia e foi reutilizado.

### 5. **Documentação**

**Arquivos criados/atualizados:**
- ✅ `backend/docs/WITHDRAW_API.md` - Documentação completa do endpoint
- ✅ `backend/TEST_WITHDRAW_ENDPOINT.sh` - Script de testes
- ✅ `backend/docs/WALLET_API.md` - Atualizado com informações de saque
- ✅ `backend/WITHDRAW_IMPLEMENTATION.md` - Este arquivo (resumo)

---

## 🔄 Fluxo de Funcionamento

```
1. Usuário autenticado faz POST /api/wallet/withdraw
   ↓
2. Controller valida dados com Zod (withdrawSchema)
   ↓
3. Service verifica:
   - Usuário existe?
   - Carteira existe?
   - Saldo suficiente?
   ↓
4. Calcula taxa de 8%:
   - amount = 100.00
   - fee = 8.00
   - totalAmount = 108.00
   ↓
5. Atualiza carteira no Supabase:
   - balance = balance - 108.00
   - total_withdrawn = total_withdrawn + 100.00
   ↓
6. Cria transação WITHDRAW (pending)
   - type: 'withdraw'
   - amount: 100.00
   - fee: 8.00
   - status: 'pending'
   - metadata: { pix_key, total_debited, awaiting_admin_confirmation }
   ↓
7. Cria transação FEE (completed)
   - type: 'fee'
   - amount: 8.00
   - status: 'completed'
   - metadata: { related_transaction_id, fee_percentage: 8 }
   ↓
8. Retorna resposta ao usuário
   - transaction_id
   - status: 'pending'
   - valores calculados
   - mensagem de aguardo
   ↓
9. Admin recebe notificação (a implementar)
   ↓
10. Admin aprova/rejeita (a implementar)
```

---

## 💡 Detalhes Técnicos

### Cálculo da Taxa

```javascript
const fee = parseFloat((amount * 0.08).toFixed(2));
const totalAmount = parseFloat((amount + fee).toFixed(2));
const netAmount = parseFloat(amount.toFixed(2));
```

**Exemplo:**
- Saque solicitado: R$ 100,00
- Taxa (8%): R$ 8,00
- Total debitado: R$ 108,00
- Valor a receber: R$ 100,00

### Verificação de Saldo

```javascript
const availableBalance = parseFloat(wallet.balance) - parseFloat(wallet.blocked_balance);

if (availableBalance < totalAmount) {
  throw {
    code: 'INSUFFICIENT_BALANCE',
    message: 'Saldo insuficiente para realizar o saque',
    details: { available, required, amount, fee }
  };
}
```

### Rollback em Caso de Erro

```javascript
if (withdrawError) {
  // Reverter atualização da carteira
  await supabase
    .from('wallet')
    .update({
      balance: wallet.balance,
      total_withdrawn: wallet.total_withdrawn
    })
    .eq('user_id', userId);

  throw { code: 'DATABASE_ERROR', message: 'Erro ao criar transação de saque' };
}
```

---

## 🧪 Testes

### Script de Teste Automatizado

**Arquivo:** `TEST_WITHDRAW_ENDPOINT.sh`

**Testes incluídos:**
1. ✅ Login e obtenção do token
2. ✅ Consulta de saldo antes do saque
3. ✅ Criação de saque válido
4. ✅ Verificação do saldo após saque
5. ✅ Teste com saldo insuficiente
6. ✅ Validação de valor mínimo
7. ✅ Validação de chave PIX obrigatória

**Como executar:**
```bash
cd backend
chmod +x TEST_WITHDRAW_ENDPOINT.sh
./TEST_WITHDRAW_ENDPOINT.sh
```

### Teste Manual com cURL

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@example.com", "password": "senha123"}'

# 2. Criar Saque
curl -X POST http://localhost:5000/api/wallet/withdraw \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "pix_key": "usuario@email.com",
    "description": "Saque de prêmio"
  }'
```

---

## 📊 Estrutura de Dados

### Request Body

```typescript
{
  amount: number;        // R$ 20.00 a R$ 50.000,00
  pix_key: string;       // Obrigatório, max 255 caracteres
  description?: string;  // Opcional, max 255 caracteres
}
```

### Response Body (Sucesso)

```typescript
{
  success: true,
  message: string,
  data: {
    transaction_id: string;
    status: 'pending';
    amount_requested: number;
    fee: number;
    total_debited: number;
    net_to_receive: number;
    new_balance: number;
    pix_key: string;
    created_at: string;
    message: string;
    note: string;
  }
}
```

### Transação de Saque (Database)

```typescript
{
  id: uuid,
  user_id: uuid,
  type: 'withdraw',
  amount: decimal,           // Valor líquido
  fee: decimal,              // Taxa de 8%
  net_amount: decimal,       // Igual ao amount
  status: 'pending',
  description: string,
  metadata: {
    pix_key: string,
    total_debited: number,
    awaiting_admin_confirmation: true,
    requested_at: timestamp
  },
  created_at: timestamp,
  processed_at: null
}
```

### Transação de Taxa (Database)

```typescript
{
  id: uuid,
  user_id: uuid,
  type: 'fee',
  amount: decimal,           // Valor da taxa
  fee: 0,
  net_amount: decimal,       // Negativo (-fee)
  status: 'completed',
  description: 'Taxa de saque (8%)',
  metadata: {
    related_transaction_id: uuid,
    fee_percentage: 8,
    base_amount: number
  },
  created_at: timestamp,
  processed_at: timestamp
}
```

---

## ⚠️ Observações Importantes

### Para Desenvolvedores

1. **Saldo é debitado imediatamente**
   - Não aguarda aprovação do admin para debitar
   - Garante que o valor está reservado

2. **Duas transações são criadas**
   - Facilita auditoria e rastreamento
   - Taxa é registrada separadamente

3. **Status inicial é sempre `pending`**
   - Aguarda ação do administrador
   - Sistema preparado para aprovação/rejeição

4. **Rollback automático**
   - Em caso de erro, o saldo é estornado
   - Garante consistência dos dados

### Para Administradores

1. **Aprovação necessária**
   - Todas as solicitações de saque iniciam como `pending`
   - Admin deve aprovar ou rejeitar manualmente

2. **Informações disponíveis**
   - Chave PIX está no `metadata` da transação
   - Valor líquido a transferir é o `net_amount`
   - Taxa já foi debitada

3. **Próximos passos (a implementar)**
   - Endpoint para listar saques pendentes
   - Endpoint para aprovar saque
   - Endpoint para rejeitar saque (com estorno)
   - Integração com API de transferência PIX

---

## 🚀 Próximas Implementações Sugeridas

### 1. **Admin - Listar Saques Pendentes**
```
GET /api/admin/withdrawals/pending
```

### 2. **Admin - Aprovar Saque**
```
POST /api/admin/withdrawals/:id/approve
```

### 3. **Admin - Rejeitar Saque**
```
POST /api/admin/withdrawals/:id/reject
Body: { reason: string }
```

### 4. **Notificações**
- Notificar admin quando saque é solicitado
- Notificar usuário quando saque é aprovado/rejeitado
- WebSocket ou Push Notifications

### 5. **Integração PIX**
- Integrar com API de transferência PIX (Woovi, PagSeguro, etc.)
- Automatizar transferências após aprovação
- Webhook para confirmação de transferência

### 6. **Histórico e Auditoria**
```
GET /api/wallet/withdrawals
GET /api/wallet/withdrawals/:id
```

---

## 📚 Documentação Relacionada

- [WITHDRAW_API.md](./docs/WITHDRAW_API.md) - Documentação completa da API
- [WALLET_API.md](./docs/WALLET_API.md) - Documentação geral da carteira
- [TEST_WITHDRAW_ENDPOINT.sh](./TEST_WITHDRAW_ENDPOINT.sh) - Script de testes
- [AUTH_FLOW.md](./docs/AUTH_FLOW.md) - Fluxo de autenticação

---

## ✅ Checklist de Implementação

- [x] Service layer (`wallet.service.js`)
- [x] Controller layer (`wallet.controller.js`)
- [x] Routes (`wallet.routes.js`)
- [x] Rate limiter (3 por hora)
- [x] Validação com Zod (reutilizou `withdrawSchema`)
- [x] Cálculo de taxa de 8%
- [x] Verificação de saldo disponível
- [x] Criação de transação de saque
- [x] Criação de transação de taxa
- [x] Rollback em caso de erro
- [x] Tratamento de erros padronizado
- [x] Documentação completa
- [x] Script de testes
- [x] Atualização do WALLET_API.md
- [ ] Endpoints de aprovação/rejeição (admin)
- [ ] Notificações (webhook/push)
- [ ] Integração com API PIX para transferência

---

## 🎉 Conclusão

O endpoint de saque foi implementado com sucesso, seguindo as melhores práticas de desenvolvimento:

- ✅ Código limpo e modular
- ✅ Validações robustas
- ✅ Tratamento de erros completo
- ✅ Documentação detalhada
- ✅ Testes automatizados
- ✅ Segurança (rate limit, autenticação)
- ✅ Rollback automático
- ✅ Auditoria (duas transações)

O sistema está pronto para receber solicitações de saque e aguardar aprovação do administrador.

---

**Implementado em:** 04/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Completo (Parte 1 - Solicitação de Saque)





