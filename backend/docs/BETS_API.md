

# 🎲 API de Apostas (Bets)

Documentação completa dos endpoints de apostas com **casamento automático** da plataforma SinucaBet.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Sistema de Matching](#sistema-de-matching)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [POST /api/bets](#post-apibets)
  - [GET /api/bets/game/:game_id](#get-apibetsgamegame_id)
- [Fluxo de Apostas](#fluxo-de-apostas)
- [Exemplos de Uso](#exemplos-de-uso)
- [Códigos de Erro](#códigos-de-erro)

---

## 🔍 Visão Geral

A API de Apostas permite:
- Criar apostas em jogos abertos
- Sistema de **casamento automático** (matching) 1x1 ou emparceirado
- Bloqueio automático de saldo
- Consultar apostas e totais de um jogo
- Taxa de 5% da casa (retorno de 95%)

**Base URL:** `http://localhost:5000/api/bets`

**Formato de Resposta:** JSON

---

## 🎯 Sistema de Matching

### Como Funciona

O sistema realiza **casamento automático** de apostas em lados opostos:

```
Player A: R$ 100 (pendente)
    +
Player B: R$ 100 (nova aposta)
    ↓
MATCH! Ambas ficam "matched"
Retorno potencial: R$ 95 cada (95% do total)
```

### Tipos de Matching

#### 1. **Match Completo (1x1)**
```
Aposta 1: Player A - R$ 100 (pending)
Aposta 2: Player B - R$ 100 (nova)
         ↓
Resultado: Ambas matched completamente
```

#### 2. **Match Parcial (Emparceirado)**
```
Aposta 1: Player A - R$ 100 (pending)
Aposta 2: Player B - R$ 30  (nova)
         ↓
Resultado:
- R$ 30 de ambos ficam matched
- R$ 70 da Aposta 1 ficam pending
```

#### 3. **Match Múltiplo**
```
Pending: A=R$50, A=R$30, A=R$20
Nova:    B=R$80
        ↓
R$ 50 match com primeira
R$ 30 match com segunda
```

### Regras de Matching

- ✅ Matching é automático e imediato
- ✅ Apostas são pareadas em ordem FIFO (First In, First Out)
- ✅ Saldo é bloqueado ao criar aposta
- ✅ Saldo é liberado após matching
- ✅ Taxa da casa: 5% (retorno de 95%)

---

## 🔐 Autenticação

### Endpoints públicos (sem autenticação):
- `GET /api/bets/game/:game_id` - Ver apostas do jogo

### Endpoints protegidos (com autenticação):
- `POST /api/bets` - Criar aposta

**Como autenticar:**
```bash
Authorization: Bearer SEU_TOKEN_JWT
```

---

## 📌 Endpoints

### POST /api/bets

Cria uma nova aposta com matching automático.

#### 🔒 Requer Autenticação: Sim

#### Request:

```bash
curl -X POST http://localhost:5000/api/bets \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "side": "player_a",
    "amount": 100
  }'
```

#### Request Body:

| Campo | Tipo | Obrigatório | Descrição | Validação |
|-------|------|-------------|-----------|-----------|
| `game_id` | string (UUID) | Sim | ID do jogo | UUID válido |
| `side` | string | Sim | Lado da aposta | `player_a` ou `player_b` |
| `amount` | number | Sim | Valor da aposta | Múltiplo de 10, min: R$ 10, max: R$ 100.000 |

#### Response (201 Created):

```json
{
  "success": true,
  "message": "Aposta criada com sucesso",
  "data": {
    "bet": {
      "id": "bet-uuid",
      "game_id": "game-uuid",
      "side": "player_a",
      "amount": 100.00,
      "status": "matched",
      "matched": true,
      "potential_return": 95.00,
      "created_at": "2025-11-04T20:00:00.000Z"
    },
    "matching": {
      "status": "matched",
      "matched_bets": 1,
      "pending_amount": 0,
      "message": "Aposta totalmente matchada!"
    },
    "wallet": {
      "balance": 400.00,
      "blocked_balance": 0.00,
      "available_balance": 400.00
    },
    "game": {
      "player_a": "João Silva",
      "player_b": "Pedro Santos",
      "modality": "Sinuca Livre"
    }
  }
}
```

#### Campos da Resposta:

| Campo | Descrição |
|-------|-----------|
| `bet.id` | ID único da aposta |
| `bet.status` | `pending`, `matched`, `partially_matched` |
| `bet.matched` | `true` se houve matching |
| `bet.potential_return` | Retorno potencial (95% do valor) |
| `matching.status` | Status do matching |
| `matching.matched_bets` | Quantidade de apostas matchadas |
| `matching.message` | Mensagem descritiva |
| `wallet` | Saldo atualizado após a aposta |

#### Rate Limit:
- 30 apostas por hora

---

### GET /api/bets/game/:game_id

Lista apostas de um jogo específico e totais por lado.

#### 🔒 Requer Autenticação: Não

#### Request:

```bash
curl -X GET http://localhost:5000/api/bets/game/GAME_ID
```

#### Response (200 OK):

```json
{
  "success": true,
  "message": "Apostas do jogo obtidas com sucesso",
  "data": {
    "game": {
      "id": "game-uuid",
      "player_a": "João Silva",
      "player_b": "Pedro Santos",
      "modality": "Sinuca Livre",
      "status": "open"
    },
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
      },
      "total": 250.00,
      "total_bets_count": 5
    },
    "bets": [
      {
        "id": "bet-uuid",
        "user": {
          "id": "user-uuid",
          "name": "João"
        },
        "side": "player_a",
        "amount": 100.00,
        "potential_return": 95.00,
        "status": "matched",
        "matched_at": "2025-11-04T20:01:00.000Z",
        "created_at": "2025-11-04T20:00:00.000Z"
      }
    ]
  }
}
```

#### Rate Limit:
- 60 requisições por minuto

---

## 🔄 Fluxo de Apostas

### Fluxo Completo

```
1. Usuário cria aposta
   ↓
2. Sistema valida:
   - Jogo existe e está open?
   - Valor é múltiplo de 10?
   - Usuário tem saldo?
   ↓
3. Bloqueia saldo na carteira
   ↓
4. Cria aposta com status pending
   ↓
5. Busca apostas pendentes do lado oposto
   ↓
6. Realiza matching automático:
   ├─ Match total → libera saldo
   ├─ Match parcial → mantém parte bloqueada
   └─ Sem match → saldo fica bloqueado
   ↓
7. Atualiza totais do jogo
   ↓
8. Retorna resultado com status
```

### Diagrama de Matching

```
┌─────────────────────────────────────────────────────────┐
│              SISTEMA DE MATCHING AUTOMÁTICO             │
└─────────────────────────────────────────────────────────┘

CENÁRIO 1: Match Completo (1x1)
─────────────────────────────
  Aposta A: R$ 100 (pending) ←┐
                              ├→ MATCH!
  Aposta B: R$ 100 (nova)    ←┘
  
  Resultado:
  • Ambas: status = matched
  • Ambas: potential_return = R$ 95
  • Saldo liberado


CENÁRIO 2: Match Parcial
─────────────────────────
  Aposta A: R$ 100 (pending)
  Aposta B: R$  30 (nova)
  
  Resultado:
  • R$ 30 matched de ambas
  • R$ 70 da Aposta A ficam pending
  • Aposta B: status = matched
  • Nova aposta A criada: R$ 70 pending


CENÁRIO 3: Sem Match
────────────────────
  Aposta A: R$ 100 (pending)
  Aposta B: (não existe)
  
  Resultado:
  • Aposta A: status = pending
  • Saldo fica bloqueado
  • Aguarda apostas do lado oposto
```

---

## 💰 Cálculo de Retorno

### Taxa da Casa

- **Taxa:** 5%
- **Retorno:** 95% do valor apostado

### Exemplo:

```
Aposta: R$ 100,00
Taxa (5%): R$ 5,00
Retorno potencial: R$ 95,00

Se ganhar: recebe R$ 95,00 + R$ 100,00 = R$ 195,00
Se perder: perde R$ 100,00
```

---

## 💡 Exemplos de Uso

### JavaScript (Fetch)

```javascript
// Criar aposta
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/bets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    game_id: 'game-uuid',
    side: 'player_a',
    amount: 100
  })
});

const result = await response.json();

if (result.data.bet.matched) {
  console.log('✅ Aposta matchada!');
  console.log('Retorno potencial:', result.data.bet.potential_return);
} else {
  console.log('⏳ Aposta aguardando match');
}

// Listar apostas do jogo
const betsResponse = await fetch(`http://localhost:5000/api/bets/game/${gameId}`);
const bets = await betsResponse.json();
console.log('Totais:', bets.data.totals);
```

### Python (Requests)

```python
import requests

token = 'seu-token-jwt'
url = 'http://localhost:5000/api/bets'

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Criar aposta
data = {
    'game_id': 'game-uuid',
    'side': 'player_a',
    'amount': 100
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

print(f"Status: {result['data']['matching']['status']}")
print(f"Matched: {result['data']['bet']['matched']}")

# Listar apostas
game_id = 'game-uuid'
bets_response = requests.get(f'{url}/game/{game_id}')
print(bets_response.json())
```

---

## ⚠️ Códigos de Erro

### 400 - Validação

```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": [
    {
      "field": "amount",
      "message": "O valor da aposta deve ser múltiplo de 10"
    }
  ]
}
```

### 400 - Jogo não Disponível

```json
{
  "success": false,
  "message": "Este jogo não está mais aceitando apostas",
  "details": {
    "status": "in_progress"
  }
}
```

### 400 - Saldo Insuficiente

```json
{
  "success": false,
  "message": "Saldo insuficiente",
  "details": {
    "available": 50.00,
    "required": 100.00
  }
}
```

### 401 - Não Autorizado

```json
{
  "success": false,
  "message": "Token de autenticação não fornecido"
}
```

### 404 - Jogo não Encontrado

```json
{
  "success": false,
  "message": "Jogo não encontrado"
}
```

### 429 - Rate Limit Excedido

```json
{
  "success": false,
  "message": "Você atingiu o limite de apostas por hora. Tente novamente mais tarde."
}
```

---

## 🎯 Casos de Uso Comuns

### 1. Apostar no jogo

```bash
POST /api/bets
{
  "game_id": "uuid",
  "side": "player_a",
  "amount": 100
}
```

### 2. Ver totais das apostas

```bash
GET /api/bets/game/:game_id
```

### 3. Verificar se aposta foi matchada

Checar campo `bet.matched` na resposta da criação.

---

## 📊 Status das Apostas

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando matching com aposta oposta |
| `matched` | Matchada com aposta(s) do lado oposto |
| `partially_matched` | Parcialmente matchada (resto pending) |
| `won` | Aposta vencedora (após finalização do jogo) |
| `lost` | Aposta perdedora (após finalização do jogo) |
| `cancelled` | Aposta cancelada (jogo cancelado) |

---

## 🧪 Testando a API

Execute o script de testes:

```bash
chmod +x TEST_BETS_ENDPOINTS.sh
./TEST_BETS_ENDPOINTS.sh
```

O script testa:
1. ✅ Criação de apostas
2. ✅ Matching automático 1x1
3. ✅ Matching parcial
4. ✅ Bloqueio e liberação de saldo
5. ✅ Atualização de totais
6. ✅ Listagem de apostas
7. ✅ Validações
8. ✅ Autenticação

---

## 🔐 Segurança

- ✅ **Autenticação JWT** obrigatória para criar apostas
- ✅ **Bloqueio de saldo** automático
- ✅ **Validação robusta** com Zod
- ✅ **Rate limiting** configurado
- ✅ **Transações atômicas** no matching
- ✅ **Rollback automático** em caso de erro

---

## 📚 Recursos Adicionais

- [Documentação de Jogos](./GAMES_API.md)
- [Documentação da Carteira](./WALLET_API.md)
- [Documentação de Autenticação](./AUTH_FLOW.md)
- [Schema do Banco de Dados](../../database/schema.sql)
- [Script de Teste](../TEST_BETS_ENDPOINTS.sh)

---

## 🚀 Próximas Implementações Sugeridas

1. **Finalização de Apostas** - Processar ganhos/perdas quando jogo finalizar
2. **Histórico de Apostas** - `GET /api/bets/user` - Apostas do usuário
3. **Cancelamento** - Cancelar aposta pending (antes de match)
4. **Limites por usuário** - Limite de aposta por usuário por jogo
5. **Estatísticas** - Endpoint com estatísticas das apostas
6. **Notificações** - Notificar quando aposta é matchada
7. **WebSocket** - Atualização em tempo real de matches

---

**Última Atualização:** 04/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Completamente Funcional








