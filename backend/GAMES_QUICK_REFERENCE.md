# 🚀 Referência Rápida - API de Jogos

## 📌 Endpoints Principais

### Criar Jogo
```
POST /api/games
🔒 Autenticação: Sim
⏱️ Rate Limit: 10/hora
```

**Body:**
```json
{
  "player_a": "João Silva",
  "player_b": "Pedro Santos",
  "modality": "Sinuca Livre",
  "advantages": "Nenhuma",
  "series": 3,
  "bet_limit": 500.00
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "open",
    "total_bet_player_a": 0.00,
    "total_bet_player_b": 0.00
  }
}
```

---

### Listar Jogos
```
GET /api/games
🌍 Público (sem auth)
⏱️ Rate Limit: 60/minuto
```

**Query Params:**
```
?status=open           # Apenas jogos abertos
?modality=Sinuca       # Filtrar por modalidade
?limit=20&offset=0     # Paginação
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "games": [...],
    "pagination": {
      "total": 10,
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

---

### Buscar Jogo
```
GET /api/games/:id
🌍 Público (sem auth)
```

---

### Atualizar Status
```
PATCH /api/games/:id/status
🔒 Autenticação: Sim
⏱️ Rate Limit: 20/hora
```

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

---

## 🎯 Status do Jogo

```
open → in_progress → finished
  ↓
cancelled
```

| Status | Apostas? | Resultado? |
|--------|----------|------------|
| open | ✅ Sim | ❌ Não |
| in_progress | ❌ Não | ❌ Não |
| finished | ❌ Não | ✅ Sim |
| cancelled | ❌ Não | ❌ Não |

---

## 📊 Validações

### Criar Jogo

| Campo | Regra |
|-------|-------|
| player_a | 3-255 chars, obrigatório |
| player_b | 3-255 chars, diferente de A |
| modality | 3-100 chars, obrigatório |
| series | 1-99 (padrão: 1) |
| bet_limit | R$ 10 - R$ 100.000 |

### Finalizar Jogo

- `status`: `finished`
- `result`: `player_a` | `player_b` | `draw` (obrigatório)

---

## 🧪 Teste Rápido

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senha123"}' \
  | jq -r '.data.token')

# 2. Criar jogo
curl -X POST http://localhost:5000/api/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "series": 3
  }' | jq .

# 3. Listar jogos abertos
curl http://localhost:5000/api/games?status=open | jq .
```

Ou execute o script completo:
```bash
./TEST_GAMES_ENDPOINTS.sh
```

---

## 💡 Casos de Uso

### Frontend - Tela de Apostas
```javascript
// Buscar jogos disponíveis para apostas
const response = await fetch('http://localhost:5000/api/games?status=open');
const { data } = await response.json();
console.log(data.games); // Exibir na tela
```

### Admin - Criar Jogo
```javascript
const token = localStorage.getItem('token');

await fetch('http://localhost:5000/api/games', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    player_a: 'João Silva',
    player_b: 'Pedro Santos',
    modality: 'Sinuca Livre',
    series: 3
  })
});
```

### Admin - Iniciar Jogo
```javascript
await fetch(`http://localhost:5000/api/games/${gameId}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'in_progress'
  })
});
```

---

## 📚 Documentação Completa

- 📖 [GAMES_API.md](./docs/GAMES_API.md) - Documentação detalhada
- 📄 [GAMES_EXAMPLES.json](./docs/GAMES_EXAMPLES.json) - Exemplos práticos
- 📋 [GAMES_IMPLEMENTATION.md](./GAMES_IMPLEMENTATION.md) - Detalhes técnicos
- 🧪 [TEST_GAMES_ENDPOINTS.sh](./TEST_GAMES_ENDPOINTS.sh) - Testes automatizados

---

## ❌ Erros Comuns

| Código | Erro | Solução |
|--------|------|---------|
| 400 | Jogadores iguais | player_a ≠ player_b |
| 400 | Série inválida | 1 ≤ series ≤ 99 |
| 401 | Não autenticado | Fazer login primeiro |
| 404 | Jogo não encontrado | Verificar ID |
| 429 | Rate limit | Aguardar |

---

## 🔗 Integração com Outros Módulos

### Com Apostas (a implementar)
```javascript
// Criar aposta em um jogo
POST /api/bets
{
  "game_id": "uuid",
  "player_choice": "player_a",
  "amount": 100.00
}
```

### Com Carteira
```javascript
// Apostas debitam da carteira
// Ganhos creditam na carteira
```

---

## ✅ Status da Implementação

- [x] POST /api/games - Criar jogo
- [x] GET /api/games - Listar jogos
- [x] GET /api/games/:id - Buscar jogo
- [x] PATCH /api/games/:id/status - Atualizar status
- [x] Validações Zod
- [x] Rate limiting
- [x] Paginação
- [x] Filtros
- [x] Documentação
- [x] Testes
- [ ] Middleware admin (a fazer)
- [ ] Integração apostas (a fazer)
- [ ] WebSocket real-time (a fazer)

---

**Status:** ✅ 100% Funcional  
**Versão:** 1.0.0  
**Última Atualização:** 04/11/2025





