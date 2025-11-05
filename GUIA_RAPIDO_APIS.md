# 📘 Guia Rápido - Novas APIs SinucaBet

## 🔗 Base URL
```
http://localhost:3001/api
```

---

## 🔐 Autenticação

Todas as rotas protegidas requerem token JWT no header:
```bash
Authorization: Bearer {seu_token}
```

### Login:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}

# Resposta:
{
  "success": true,
  "data": {
    "session": {
      "access_token": "eyJhbGc..."
    },
    "user": { ... }
  }
}
```

---

## 🎮 Players (Jogadores)

### Listar Jogadores
```bash
GET /api/players?active=true&limit=20
```

### Criar Jogador (Admin/Parceiro)
```bash
POST /api/players
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "nickname": "Joãozinho",
  "bio": "Jogador profissional",
  "photo_url": "https://..."
}
```

### Buscar Jogador
```bash
GET /api/players/{id}
```

### Atualizar Jogador (Admin/Parceiro)
```bash
PATCH /api/players/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva Jr.",
  "active": true
}
```

### Estatísticas
```bash
GET /api/players/stats
```

---

## 🏆 Matches (Partidas)

### Listar Partidas
```bash
GET /api/matches?status=agendada&limit=20
```

Filtros disponíveis:
- `status`: agendada, em_andamento, finalizada, cancelada
- `sport`: sinuca, futebol
- `player_id`: ID do jogador
- `created_by`: ID do criador
- `influencer_id`: ID do influencer

### Criar Partida (Admin/Parceiro)
```bash
POST /api/matches
Authorization: Bearer {token}
Content-Type: application/json

{
  "scheduled_at": "2025-11-06T20:00:00Z",
  "location": "São Paulo",
  "sport": "sinuca",
  "player1_id": "uuid-jogador-1",
  "player2_id": "uuid-jogador-2",
  "youtube_url": "https://youtube.com/watch?v=...",
  "game_rules": {
    "game_type": "JOGO DE BOLA NUMERADA",
    "rules": ["90 ESTOURA CONTINUA"],
    "total_series": 3
  },
  "total_series": 3
}

# Séries são criadas automaticamente!
```

### Buscar Partida (com séries)
```bash
GET /api/matches/{id}
```

### Atualizar Status
```bash
PATCH /api/matches/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "em_andamento"
}
```

---

## 🎯 Series (Séries)

### Buscar Séries de uma Partida
```bash
GET /api/series/match/{matchId}
```

### Buscar Série Específica
```bash
GET /api/series/{id}
```

### Liberar Série para Apostas (Admin/Parceiro)
```bash
POST /api/series/{id}/release
Authorization: Bearer {token}

# Status: pendente → liberada
# betting_enabled: true
```

### Iniciar Série (Admin/Parceiro)
```bash
POST /api/series/{id}/start
Authorization: Bearer {token}

# Status: liberada → em_andamento
# Apostas são aceitas e travadas
```

### Atualizar Placar (Admin/Parceiro)
```bash
PATCH /api/series/{id}/score
Authorization: Bearer {token}
Content-Type: application/json

{
  "player1_score": 3,
  "player2_score": 1
}
```

### Finalizar Série (Admin/Parceiro)
```bash
POST /api/series/{id}/finish
Authorization: Bearer {token}
Content-Type: application/json

{
  "winner_player_id": "uuid-jogador-vencedor",
  "player1_score": 5,
  "player2_score": 3
}

# Status: em_andamento → encerrada
# Apostas são resolvidas automaticamente (triggers)
# Ganhos são creditados automaticamente
```

### Cancelar Série (Admin/Parceiro)
```bash
POST /api/series/{id}/cancel
Authorization: Bearer {token}

# Apostas são reembolsadas automaticamente
```

---

## 💰 Bets (Apostas)

### Criar Aposta (Usuário)
```bash
POST /api/bets
Authorization: Bearer {token}
Content-Type: application/json

{
  "serie_id": "uuid-serie",
  "chosen_player_id": "uuid-jogador",
  "amount": 1000  # Em centavos (R$ 10,00)
}

# Validações automáticas:
# - Série liberada?
# - Saldo suficiente?
# - Jogador válido?
# 
# Saldo debitado automaticamente (trigger)
```

### Buscar Apostas de uma Série
```bash
GET /api/bets/serie/{serieId}

# Retorna:
# - Apostas agrupadas por jogador
# - Estatísticas (total, por jogador)
# - Lista completa de apostas
```

### Buscar Minhas Apostas (Usuário)
```bash
GET /api/bets/user?status=pendente&limit=50
Authorization: Bearer {token}

# Filtros:
# - status: pendente, aceita, ganha, perdida, cancelada
# - limit: máximo de resultados
# - offset: paginação
```

### Apostas Recentes (Público)
```bash
GET /api/bets/recent?limit=10
```

### Cancelar Aposta (Usuário)
```bash
DELETE /api/bets/{id}
Authorization: Bearer {token}

# Apenas apostas pendentes
# Série deve ainda estar liberada
# Valor reembolsado automaticamente
```

---

## 🔄 Fluxo Completo (Exemplo)

### 1. Admin cria jogadores
```bash
POST /api/players
{ "name": "Jogador A", "nickname": "JogadorA" }

POST /api/players
{ "name": "Jogador B", "nickname": "JogadorB" }
```

### 2. Admin cria partida
```bash
POST /api/matches
{
  "scheduled_at": "2025-11-06T20:00:00Z",
  "player1_id": "{id-jogador-a}",
  "player2_id": "{id-jogador-b}",
  "total_series": 3
}

# Retorna match_id e 3 séries criadas automaticamente
```

### 3. Admin libera Série 1
```bash
POST /api/series/{serie-1-id}/release
```

### 4. Usuários apostam
```bash
POST /api/bets
{
  "serie_id": "{serie-1-id}",
  "chosen_player_id": "{id-jogador-a}",
  "amount": 1000
}
```

### 5. Admin inicia Série 1
```bash
POST /api/series/{serie-1-id}/start
```

### 6. Admin atualiza placar
```bash
PATCH /api/series/{serie-1-id}/score
{ "player1_score": 3, "player2_score": 1 }
```

### 7. Admin finaliza Série 1
```bash
POST /api/series/{serie-1-id}/finish
{
  "winner_player_id": "{id-jogador-a}",
  "player1_score": 5,
  "player2_score": 3
}

# Apostas ganhadoras recebem ganhos automaticamente!
```

### 8. Repete para Série 2 e 3...

---

## 📊 Respostas Padrão

### Sucesso:
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### Erro:
```json
{
  "success": false,
  "message": "Descrição do erro",
  "details": { ... }
}
```

### Erro de Validação:
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    { "field": "email", "message": "Email inválido" }
  ]
}
```

---

## 🧪 Testar Tudo

Execute o script de teste completo:
```bash
cd backend
chmod +x TEST_NEW_APIS.sh
./TEST_NEW_APIS.sh
```

---

## 📝 Notas Importantes

### Valores Monetários
- **Sempre em centavos**: R$ 10,00 = 1000
- Mínimo de aposta: R$ 10,00 (1000 centavos)

### Status das Séries
- `pendente` → Ainda não liberada
- `liberada` → Aceitando apostas
- `em_andamento` → Apostas travadas, jogo rolando
- `encerrada` → Finalizada com vencedor
- `cancelada` → Cancelada e reembolsada

### Status das Apostas
- `pendente` → Aguardando série iniciar
- `aceita` → Série iniciou, aposta aceita
- `ganha` → Usuário ganhou (recebeu ganhos)
- `perdida` → Usuário perdeu
- `cancelada` → Usuário cancelou antes de iniciar
- `reembolsada` → Série foi cancelada

### Permissões
- **Público:** Ver jogadores, partidas, séries, apostas
- **Usuário:** Criar apostas, ver suas apostas, cancelar apostas
- **Admin/Parceiro:** Criar/editar jogadores, partidas, gerir séries

---

## 🚀 Próximos Passos

1. ✅ Backend 100% funcional
2. ⏭️ Integrar com Frontend (Sprint 3-4)
3. ⏭️ Implementar Realtime (placar ao vivo)
4. ⏭️ Painel Admin completo

---

**Desenvolvido com ❤️ para SinucaBet** 🎱

