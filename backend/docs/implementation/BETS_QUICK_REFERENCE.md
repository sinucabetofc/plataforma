# 🚀 Referência Rápida - API de Apostas

## 📌 Endpoints Principais

### Criar Aposta
```
POST /api/bets
🔒 Autenticação: Sim
⏱️ Rate Limit: 30/hora
```

**Body:**
```json
{
  "game_id": "uuid-do-jogo",
  "side": "player_a",
  "amount": 100
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "bet": {
      "id": "uuid",
      "status": "matched",
      "matched": true,
      "potential_return": 95.00
    },
    "matching": {
      "status": "matched",
      "message": "Aposta totalmente matchada!"
    },
    "wallet": {
      "balance": 400.00,
      "blocked_balance": 0.00
    }
  }
}
```

---

### Listar Apostas do Jogo
```
GET /api/bets/game/:game_id
🌍 Público (sem auth)
⏱️ Rate Limit: 60/minuto
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totals": {
      "player_a": {
        "total": 150.00,
        "bets_count": 3,
        "percentage": "60.00"
      },
      "player_b": {
        "total": 100.00,
        "bets_count": 2,
        "percentage": "40.00"
      }
    },
    "bets": [...]
  }
}
```

---

## 🎯 Sistema de Matching

```
MATCHING 1x1 (Completo)
─────────────────────────
Aposta A: R$ 100 (pending)
Aposta B: R$ 100 (nova)
         ↓
    ✅ MATCH!
         ↓
Ambas: matched
Retorno: R$ 95 cada
Saldo: liberado


MATCHING PARCIAL
────────────────
Aposta A: R$ 100 (pending)
Aposta B: R$  30 (nova)
         ↓
 ✅ MATCH de R$ 30
         ↓
R$ 30 matched
R$ 70 pending
```

---

## 📊 Validações

### Criar Aposta

| Campo | Regra |
|-------|-------|
| game_id | UUID válido, jogo open |
| side | `player_a` ou `player_b` |
| amount | Múltiplo de 10, R$ 10 - R$ 100.000 |

### Regras de Negócio

- ✅ Jogo deve estar `open`
- ✅ Usuário deve ter saldo
- ✅ Saldo é bloqueado ao apostar
- ✅ Saldo é liberado após match

---

## 💰 Taxa e Retorno

```
Aposta: R$ 100,00
Taxa (5%): R$ 5,00
─────────────────────
Retorno: R$ 95,00

Se ganhar: R$ 195 total
Se perder: R$ 0
```

---

## 🧪 Teste Rápido

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senha123"}' \
  | jq -r '.data.token')

# 2. Criar jogo
GAME_ID=$(curl -s -X POST http://localhost:5000/api/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"player_a":"João","player_b":"Pedro","modality":"Sinuca Livre","series":3}' \
  | jq -r '.data.id')

# 3. Criar aposta
curl -X POST http://localhost:5000/api/bets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"game_id\": \"$GAME_ID\",
    \"side\": \"player_a\",
    \"amount\": 100
  }" | jq .

# 4. Ver apostas do jogo
curl http://localhost:5000/api/bets/game/$GAME_ID | jq .
```

Ou execute o script completo:
```bash
./TEST_BETS_ENDPOINTS.sh
```

---

## 💡 Casos de Uso

### Frontend - Fazer Aposta

```javascript
const token = localStorage.getItem('token');
const gameId = 'game-uuid';

const response = await fetch('http://localhost:5000/api/bets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    game_id: gameId,
    side: 'player_a',
    amount: 100
  })
});

const result = await response.json();

if (result.data.bet.matched) {
  alert('✅ Aposta matchada! Retorno: R$ ' + result.data.bet.potential_return);
} else {
  alert('⏳ Aposta criada, aguardando matching');
}
```

### Frontend - Ver Totais

```javascript
const gameId = 'game-uuid';
const response = await fetch(`http://localhost:5000/api/bets/game/${gameId}`);
const data = await response.json();

console.log('Player A:', data.data.totals.player_a.total);
console.log('Player B:', data.data.totals.player_b.total);
```

---

## 🔄 Fluxo Simplificado

```
1. Usuário cria aposta
2. Sistema bloqueia saldo
3. Sistema busca apostas pendentes do lado oposto
4. Se encontrou: faz match e libera saldo
5. Se não encontrou: aposta fica pending
6. Retorna status e saldo atualizado
```

---

## 📚 Documentação Completa

- 📖 [BETS_API.md](./docs/BETS_API.md) - Documentação detalhada
- 📋 [BETS_IMPLEMENTATION.md](./BETS_IMPLEMENTATION.md) - Detalhes técnicos
- 🧪 [TEST_BETS_ENDPOINTS.sh](./TEST_BETS_ENDPOINTS.sh) - Testes automatizados

---

## ❌ Erros Comuns

| Código | Erro | Solução |
|--------|------|---------|
| 400 | Não múltiplo de 10 | Use valores: 10, 20, 30... |
| 400 | Jogo não open | Jogo já iniciou/finalizou |
| 400 | Saldo insuficiente | Depositar mais |
| 401 | Não autenticado | Fazer login |
| 404 | Jogo não encontrado | Verificar game_id |

---

## 📊 Status das Apostas

| Status | Descrição |
|--------|-----------|
| pending | Aguardando match |
| matched | Matchada com aposta oposta |
| won | Vencedora (após jogo finalizar) |
| lost | Perdedora (após jogo finalizar) |
| cancelled | Cancelada |

---

## ✅ Status da Implementação

- [x] POST /api/bets - Criar aposta
- [x] GET /api/bets/game/:id - Listar apostas
- [x] Matching automático 1x1
- [x] Matching parcial
- [x] Bloqueio de saldo
- [x] Liberação de saldo
- [x] Validações Zod
- [x] Rate limiting
- [x] Documentação
- [x] Testes
- [ ] Finalização (ganhos/perdas)
- [ ] Histórico do usuário
- [ ] WebSocket real-time

---

**Status:** ✅ 100% Funcional  
**Versão:** 1.0.0  
**Última Atualização:** 04/11/2025





