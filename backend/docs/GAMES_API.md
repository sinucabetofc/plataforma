# 🎱 API de Jogos (Games)

Documentação completa dos endpoints de gerenciamento de jogos de sinuca da plataforma SinucaBet.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [POST /api/games](#post-apigames)
  - [GET /api/games](#get-apigames)
  - [GET /api/games/:id](#get-apigamesid)
  - [PATCH /api/games/:id/status](#patch-apigamesidstatus)
- [Status dos Jogos](#status-dos-jogos)
- [Exemplos de Uso](#exemplos-de-uso)
- [Códigos de Erro](#códigos-de-erro)

---

## 🔍 Visão Geral

A API de Jogos permite:
- Criar novos jogos de sinuca
- Listar jogos abertos para apostas
- Buscar detalhes de um jogo específico
- Atualizar status dos jogos (open → in_progress → finished)

**Base URL:** `http://localhost:5000/api/games`

**Formato de Resposta:** JSON

---

## 🔐 Autenticação

Apenas a criação e atualização de jogos requerem autenticação via JWT Bearer Token.

### Endpoints públicos (sem autenticação):
- `GET /api/games` - Listar jogos
- `GET /api/games/:id` - Ver detalhes do jogo

### Endpoints protegidos (com autenticação):
- `POST /api/games` - Criar jogo
- `PATCH /api/games/:id/status` - Atualizar status

**Como autenticar:**
```bash
Authorization: Bearer SEU_TOKEN_JWT
```

---

## 📌 Endpoints

### POST /api/games

Cria um novo jogo de sinuca.

#### 🔒 Requer Autenticação: Sim

#### Request:

```bash
curl -X POST http://localhost:5000/api/games \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "advantages": "Nenhuma",
    "series": 3,
    "bet_limit": 500.00
  }'
```

#### Request Body:

| Campo | Tipo | Obrigatório | Descrição | Validação |
|-------|------|-------------|-----------|-----------|
| `player_a` | string | Sim | Nome do jogador A | 3-255 caracteres |
| `player_b` | string | Sim | Nome do jogador B | 3-255 caracteres (diferente de A) |
| `modality` | string | Sim | Modalidade do jogo | 3-100 caracteres |
| `advantages` | string | Não | Vantagens/handicaps | Máx 1000 caracteres |
| `series` | number | Sim | Número de séries | 1-99 (padrão: 1) |
| `bet_limit` | number | Não | Limite de aposta por usuário | R$ 10 - R$ 100.000 |

#### Response (201 Created):

```json
{
  "success": true,
  "message": "Jogo criado com sucesso",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "advantages": "Nenhuma",
    "series": 3,
    "status": "open",
    "bet_limit": 500.00,
    "total_bet_player_a": 0.00,
    "total_bet_player_b": 0.00,
    "created_at": "2025-11-04T18:30:00.000Z",
    "updated_at": "2025-11-04T18:30:00.000Z"
  }
}
```

#### Características:

- ✅ Status inicial: `open`
- ✅ Totais de apostas iniciam em `0.00`
- ✅ Jogadores A e B devem ser diferentes
- ✅ Rate limit: 10 jogos por hora

---

### GET /api/games

Lista jogos com filtros opcionais.

#### 🔒 Requer Autenticação: Não

#### Query Parameters:

| Parâmetro | Tipo | Descrição | Valores Permitidos |
|-----------|------|-----------|-------------------|
| `status` | string | Filtrar por status | `open`, `in_progress`, `finished`, `cancelled` |
| `modality` | string | Filtrar por modalidade | Texto livre |
| `limit` | number | Itens por página | 1-100 (padrão: 20) |
| `offset` | number | Pular N itens | ≥ 0 (padrão: 0) |

#### Exemplos:

```bash
# Listar todos os jogos (primeiros 20)
GET /api/games

# Listar apenas jogos abertos
GET /api/games?status=open

# Listar jogos de uma modalidade específica
GET /api/games?modality=Sinuca%20Livre

# Listar com paginação
GET /api/games?limit=10&offset=20

# Combinar filtros
GET /api/games?status=open&modality=Pool&limit=5
```

#### Response (200 OK):

```json
{
  "success": true,
  "message": "Jogos listados com sucesso",
  "data": {
    "games": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "player_a": "João Silva",
        "player_b": "Pedro Santos",
        "modality": "Sinuca Livre",
        "advantages": "Nenhuma",
        "series": 3,
        "status": "open",
        "result": null,
        "bet_limit": 500.00,
        "total_bet_player_a": 150.00,
        "total_bet_player_b": 200.00,
        "started_at": null,
        "finished_at": null,
        "created_at": "2025-11-04T18:30:00.000Z",
        "updated_at": "2025-11-04T18:35:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

#### Rate Limit:
- 60 requisições por minuto

---

### GET /api/games/:id

Busca um jogo específico por ID.

#### 🔒 Requer Autenticação: Não

#### Request:

```bash
curl -X GET http://localhost:5000/api/games/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

#### Response (200 OK):

```json
{
  "success": true,
  "message": "Jogo encontrado",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "advantages": "Nenhuma",
    "series": 3,
    "status": "in_progress",
    "result": null,
    "bet_limit": 500.00,
    "total_bet_player_a": 350.00,
    "total_bet_player_b": 450.00,
    "started_at": "2025-11-04T19:00:00.000Z",
    "finished_at": null,
    "created_at": "2025-11-04T18:30:00.000Z",
    "updated_at": "2025-11-04T19:00:00.000Z"
  }
}
```

---

### PATCH /api/games/:id/status

Atualiza o status de um jogo.

#### 🔒 Requer Autenticação: Sim

**⚠️ Nota:** Este endpoint deveria ser restrito apenas a administradores (a implementar).

#### Request:

```bash
curl -X PATCH http://localhost:5000/api/games/GAME_ID/status \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

#### Request Body:

| Campo | Tipo | Obrigatório | Descrição | Valores Permitidos |
|-------|------|-------------|-----------|-------------------|
| `status` | string | Sim | Novo status | `open`, `in_progress`, `finished`, `cancelled` |
| `result` | string | Condicional | Vencedor (obrigatório se status=finished) | `player_a`, `player_b`, `draw` |

#### Regras de Validação:

- Se `status` é `finished`, `result` é **obrigatório**
- Se `status` não é `finished`, `result` deve ser **null**

#### Exemplos:

**Iniciar jogo:**
```json
{
  "status": "in_progress"
}
```

**Finalizar jogo:**
```json
{
  "status": "finished",
  "result": "player_a"
}
```

**Cancelar jogo:**
```json
{
  "status": "cancelled"
}
```

#### Response (200 OK):

```json
{
  "success": true,
  "message": "Status do jogo atualizado com sucesso",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "advantages": "Nenhuma",
    "series": 3,
    "status": "finished",
    "result": "player_a",
    "bet_limit": 500.00,
    "total_bet_player_a": 800.00,
    "total_bet_player_b": 650.00,
    "started_at": "2025-11-04T19:00:00.000Z",
    "finished_at": "2025-11-04T20:30:00.000Z",
    "created_at": "2025-11-04T18:30:00.000Z",
    "updated_at": "2025-11-04T20:30:00.000Z"
  }
}
```

#### Rate Limit:
- 20 atualizações por hora

---

## 🔄 Status dos Jogos

```
┌──────────┐
│   OPEN   │ ← Estado inicial (jogo criado, aceitando apostas)
└────┬─────┘
     │
     ↓
┌──────────────┐
│ IN_PROGRESS  │ ← Jogo iniciado (não aceita mais apostas)
└────┬─────────┘
     │
     ├────────────────┐
     ↓                ↓
┌──────────┐   ┌───────────┐
│ FINISHED │   │ CANCELLED │
└──────────┘   └───────────┘
```

### Estados:

| Status | Descrição | Apostas permitidas? | Resultado obrigatório? |
|--------|-----------|---------------------|------------------------|
| `open` | Jogo criado e aguardando início | ✅ Sim | ❌ Não |
| `in_progress` | Jogo em andamento | ❌ Não | ❌ Não |
| `finished` | Jogo finalizado | ❌ Não | ✅ Sim |
| `cancelled` | Jogo cancelado | ❌ Não | ❌ Não |

### Resultados Possíveis:

- `player_a` - Jogador A venceu
- `player_b` - Jogador B venceu
- `draw` - Empate

---

## 💡 Exemplos de Uso

### JavaScript (Fetch)

```javascript
// Criar jogo
const token = 'seu-token-jwt';

const response = await fetch('http://localhost:5000/api/games', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    player_a: 'João Silva',
    player_b: 'Pedro Santos',
    modality: 'Sinuca Livre',
    series: 3,
    bet_limit: 500.00
  })
});

const game = await response.json();
console.log(game);

// Listar jogos abertos
const openGames = await fetch('http://localhost:5000/api/games?status=open');
const games = await openGames.json();
console.log(games);
```

### Python (Requests)

```python
import requests

token = 'seu-token-jwt'
url = 'http://localhost:5000/api/games'

# Criar jogo
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

data = {
    'player_a': 'João Silva',
    'player_b': 'Pedro Santos',
    'modality': 'Sinuca Livre',
    'series': 3,
    'bet_limit': 500.00
}

response = requests.post(url, headers=headers, json=data)
print(response.json())

# Listar jogos abertos
params = {'status': 'open'}
games = requests.get(url, params=params)
print(games.json())
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
      "field": "player_b",
      "message": "Os jogadores A e B devem ser diferentes"
    }
  ]
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
  "message": "Você atingiu o limite de criação de jogos por hora. Tente novamente mais tarde."
}
```

### 500 - Erro Interno

```json
{
  "success": false,
  "message": "Erro ao criar jogo",
  "details": "Descrição técnica do erro"
}
```

---

## 🎯 Casos de Uso Comuns

### 1. Listar jogos abertos para apostas

```bash
GET /api/games?status=open
```

Use este endpoint para mostrar aos usuários quais jogos estão disponíveis para apostas.

### 2. Criar novo jogo

```bash
POST /api/games
{
  "player_a": "João Silva",
  "player_b": "Pedro Santos",
  "modality": "Sinuca Livre",
  "series": 3
}
```

### 3. Iniciar jogo (parar apostas)

```bash
PATCH /api/games/:id/status
{
  "status": "in_progress"
}
```

### 4. Finalizar jogo com vencedor

```bash
PATCH /api/games/:id/status
{
  "status": "finished",
  "result": "player_a"
}
```

---

## 🧪 Testando a API

Execute o script de testes:

```bash
chmod +x TEST_GAMES_ENDPOINTS.sh
./TEST_GAMES_ENDPOINTS.sh
```

O script testa:
1. ✅ Criação de jogos
2. ✅ Listagem de jogos
3. ✅ Filtros (status, modalidade)
4. ✅ Busca por ID
5. ✅ Atualização de status
6. ✅ Validações
7. ✅ Autenticação
8. ✅ Paginação

---

## 📊 Estrutura de Dados

### Jogo (Game)

```typescript
{
  id: string;              // UUID
  player_a: string;        // Nome do jogador A
  player_b: string;        // Nome do jogador B
  modality: string;        // Modalidade do jogo
  advantages: string | null; // Vantagens/handicaps
  series: number;          // Número de séries (1-99)
  status: 'open' | 'in_progress' | 'finished' | 'cancelled';
  result: 'player_a' | 'player_b' | 'draw' | null;
  bet_limit: number | null; // Limite de aposta
  total_bet_player_a: number; // Total apostado no jogador A
  total_bet_player_b: number; // Total apostado no jogador B
  started_at: string | null;  // Data/hora de início
  finished_at: string | null; // Data/hora de término
  created_at: string;      // Data/hora de criação
  updated_at: string;      // Data/hora de atualização
}
```

---

## 📚 Recursos Adicionais

- [Documentação de Autenticação](./AUTH_FLOW.md)
- [Documentação da Carteira](./WALLET_API.md)
- [Schema do Banco de Dados](../../database/schema.sql)
- [Script de Teste](../TEST_GAMES_ENDPOINTS.sh)

---

## 🚀 Próximas Implementações Sugeridas

1. **Middleware de Admin** - Restringir atualização de status apenas para admins
2. **Apostas** - Endpoints para criar apostas em jogos
3. **Estatísticas** - Endpoint com estatísticas dos jogos
4. **Notificações** - Notificar quando jogo inicia/finaliza
5. **Stream ao vivo** - Integração com streaming do jogo
6. **Histórico** - Endpoint com histórico completo de um jogo

---

**Última Atualização:** 04/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Completamente Funcional
