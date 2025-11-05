# 🚀 Referência Rápida - Endpoint de Saque

## 📌 Endpoint

```
POST /api/wallet/withdraw
```

**Autenticação:** Obrigatória (Bearer Token)  
**Rate Limit:** 3 saques/hora

---

## 📥 Request

```json
{
  "amount": 100.00,
  "pix_key": "usuario@email.com",
  "description": "Saque de prêmio"
}
```

| Campo | Tipo | Obrigatório | Min | Max |
|-------|------|-------------|-----|-----|
| `amount` | number | ✅ | R$ 20 | R$ 50.000 |
| `pix_key` | string | ✅ | - | 255 chars |
| `description` | string | ❌ | - | 255 chars |

---

## 📤 Response (201)

```json
{
  "success": true,
  "message": "Solicitação de saque criada com sucesso",
  "data": {
    "transaction_id": "uuid",
    "status": "pending",
    "amount_requested": 100.00,
    "fee": 8.00,
    "total_debited": 108.00,
    "net_to_receive": 100.00,
    "new_balance": 392.00,
    "pix_key": "usuario@email.com",
    "created_at": "2025-11-04T16:30:00.000Z",
    "message": "Aguardando confirmação do administrador.",
    "note": "O valor líquido será transferido após aprovação."
  }
}
```

---

## 💰 Cálculo da Taxa

```
Valor solicitado:  R$ 100,00
Taxa (8%):         R$   8,00
─────────────────────────────
Total debitado:    R$ 108,00
Valor a receber:   R$ 100,00
```

**Fórmula:**
- `fee = amount × 0.08`
- `total_debited = amount + fee`
- `net_to_receive = amount`

---

## ⚡ Fluxo Resumido

```
1. POST /api/wallet/withdraw
2. Valida dados (Zod)
3. Verifica saldo disponível
4. Calcula taxa de 8%
5. Debita total (amount + fee)
6. Cria 2 transações:
   - withdraw (pending)
   - fee (completed)
7. Retorna resposta
8. Admin aprova/rejeita
```

---

## ❌ Erros Comuns

| Status | Erro | Solução |
|--------|------|---------|
| 400 | Saldo insuficiente | Depositar mais ou reduzir valor |
| 400 | Valor mínimo | Mínimo R$ 20,00 |
| 400 | Chave PIX ausente | Informar chave PIX |
| 401 | Não autenticado | Fazer login e obter token |
| 429 | Rate limit | Aguardar 1 hora |

---

## 🧪 Teste Rápido (cURL)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senha123"}' \
  | jq -r '.data.token')

# 2. Saque
curl -X POST http://localhost:5000/api/wallet/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "pix_key": "usuario@email.com",
    "description": "Saque de prêmio"
  }' | jq .
```

---

## 🔍 Verificar Transações

```bash
# Consultar carteira (inclui últimas transações)
curl -X GET http://localhost:5000/api/wallet \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 📊 O que acontece no Database

### Wallet (atualizada)
```sql
UPDATE wallet SET
  balance = balance - 108.00,
  total_withdrawn = total_withdrawn + 100.00
WHERE user_id = 'uuid';
```

### Transactions (2 criadas)

**1. Withdraw Transaction:**
```sql
INSERT INTO transactions (
  user_id, type, amount, fee, net_amount, 
  status, description, metadata
) VALUES (
  'uuid', 'withdraw', 100.00, 8.00, 100.00,
  'pending', 'Saque de prêmio',
  '{"pix_key":"usuario@email.com",...}'
);
```

**2. Fee Transaction:**
```sql
INSERT INTO transactions (
  user_id, type, amount, fee, net_amount,
  status, description, metadata
) VALUES (
  'uuid', 'fee', 8.00, 0.00, -8.00,
  'completed', 'Taxa de saque (8%)',
  '{"related_transaction_id":"...",...}'
);
```

---

## ⚙️ Configuração

Nenhuma variável de ambiente adicional necessária.  
Reutiliza configurações existentes:
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_KEY`

---

## 📚 Documentação Completa

- 📖 [WITHDRAW_API.md](./WITHDRAW_API.md)
- 📖 [WALLET_API.md](./WALLET_API.md)
- 📋 [WITHDRAW_IMPLEMENTATION.md](../WITHDRAW_IMPLEMENTATION.md)
- 🧪 [TEST_WITHDRAW_ENDPOINT.sh](../TEST_WITHDRAW_ENDPOINT.sh)
- 📄 [WITHDRAW_EXAMPLE.json](./WITHDRAW_EXAMPLE.json)

---

## ✅ Checklist Rápido

Antes de usar em produção:

- [x] Endpoint implementado
- [x] Validações configuradas
- [x] Rate limit ativado
- [x] Documentação criada
- [x] Testes escritos
- [ ] Endpoints de admin (aprovar/rejeitar)
- [ ] Notificações implementadas
- [ ] Integração PIX configurada
- [ ] Testes de carga realizados
- [ ] Logs configurados

---

## 🔐 Segurança

✅ Autenticação JWT obrigatória  
✅ Rate limit (3/hora)  
✅ Validação de entrada (Zod)  
✅ Verificação de saldo  
✅ Rollback em caso de erro  
✅ Chave PIX no metadata (não exposta)

---

## 💡 Dicas

1. **Saldo é debitado imediatamente** - mesmo com status `pending`
2. **Admin deve aprovar** - transferência só ocorre após aprovação
3. **Duas transações** - withdraw + fee (para auditoria)
4. **Rate limit rigoroso** - apenas 3 saques por hora
5. **Valor mínimo R$ 20** - evita micro-transações

---

**Última Atualização:** 04/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso



