#!/bin/bash

# ============================================================
# Script de Teste - Endpoints de Jogos (Games)
# ============================================================

BASE_URL="http://localhost:5000/api"

echo "============================================================"
echo "🎱 TESTE DOS ENDPOINTS DE JOGOS (GAMES)"
echo "============================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# 1. Health Check
# ============================================================

echo -e "${YELLOW}1. Health Check do serviço de jogos...${NC}"
echo ""

HEALTH_RESPONSE=$(curl -s -X GET "$BASE_URL/games/health")
echo "$HEALTH_RESPONSE" | jq .

echo ""
echo "============================================================"

# ============================================================
# 2. Fazer Login para obter o token
# ============================================================

echo -e "${YELLOW}2. Fazendo login...${NC}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }')

echo "$LOGIN_RESPONSE" | jq .

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro ao fazer login. Token não obtido.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso!${NC}"
echo "Token: $TOKEN"
echo ""
echo "============================================================"

# ============================================================
# 3. Criar novo jogo
# ============================================================

echo -e "${YELLOW}3. Criando novo jogo...${NC}"
echo ""

CREATE_GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "player_a": "João Silva",
    "player_b": "Maria Santos",
    "modality": "Bola 8",
    "advantages": "João começa com vantagem de 1 bola",
    "series": 3,
    "bet_limit": 1000.00
  }')

echo "$CREATE_GAME_RESPONSE" | jq .

SUCCESS=$(echo "$CREATE_GAME_RESPONSE" | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
  echo ""
  echo -e "${GREEN}✅ Jogo criado com sucesso!${NC}"
  
  GAME_ID=$(echo "$CREATE_GAME_RESPONSE" | jq -r '.data.id')
  PLAYER_A=$(echo "$CREATE_GAME_RESPONSE" | jq -r '.data.player_a')
  PLAYER_B=$(echo "$CREATE_GAME_RESPONSE" | jq -r '.data.player_b')
  MODALITY=$(echo "$CREATE_GAME_RESPONSE" | jq -r '.data.modality')
  STATUS=$(echo "$CREATE_GAME_RESPONSE" | jq -r '.data.status')
  
  echo ""
  echo "📋 Detalhes do Jogo:"
  echo "  - ID: $GAME_ID"
  echo "  - Jogador A: $PLAYER_A"
  echo "  - Jogador B: $PLAYER_B"
  echo "  - Modalidade: $MODALITY"
  echo "  - Status: $STATUS"
else
  echo ""
  echo -e "${RED}❌ Erro ao criar jogo${NC}"
  echo ""
  echo "Tentando novamente com dados mínimos..."
  
  # Tentar com dados mínimos
  CREATE_GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/games" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "player_a": "João",
      "player_b": "Maria",
      "modality": "Bola 8",
      "series": 1
    }')
  
  echo "$CREATE_GAME_RESPONSE" | jq .
  GAME_ID=$(echo "$CREATE_GAME_RESPONSE" | jq -r '.data.id')
fi

echo ""
echo "============================================================"

# ============================================================
# 4. Listar todos os jogos
# ============================================================

echo -e "${YELLOW}4. Listando todos os jogos...${NC}"
echo ""

LIST_ALL_GAMES=$(curl -s -X GET "$BASE_URL/games")
echo "$LIST_ALL_GAMES" | jq .

TOTAL_GAMES=$(echo "$LIST_ALL_GAMES" | jq -r '.data.pagination.total')
echo ""
echo -e "${BLUE}Total de jogos: $TOTAL_GAMES${NC}"

echo ""
echo "============================================================"

# ============================================================
# 5. Listar apenas jogos abertos
# ============================================================

echo -e "${YELLOW}5. Listando jogos abertos (status=open)...${NC}"
echo ""

LIST_OPEN_GAMES=$(curl -s -X GET "$BASE_URL/games?status=open")
echo "$LIST_OPEN_GAMES" | jq .

OPEN_GAMES=$(echo "$LIST_OPEN_GAMES" | jq -r '.data.pagination.total')
echo ""
echo -e "${BLUE}Jogos abertos: $OPEN_GAMES${NC}"

echo ""
echo "============================================================"

# ============================================================
# 6. Buscar jogo específico por ID
# ============================================================

echo -e "${YELLOW}6. Buscando jogo por ID...${NC}"
echo ""

if [ "$GAME_ID" != "null" ] && [ -n "$GAME_ID" ]; then
  GET_GAME=$(curl -s -X GET "$BASE_URL/games/$GAME_ID")
  echo "$GET_GAME" | jq .
else
  echo -e "${RED}ID do jogo não disponível${NC}"
fi

echo ""
echo "============================================================"

# ============================================================
# 7. Atualizar status para "in_progress"
# ============================================================

echo -e "${YELLOW}7. Iniciando jogo (status: in_progress)...${NC}"
echo ""

if [ "$GAME_ID" != "null" ] && [ -n "$GAME_ID" ]; then
  START_GAME=$(curl -s -X PATCH "$BASE_URL/games/$GAME_ID/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "status": "in_progress"
    }')
  
  echo "$START_GAME" | jq .
  
  SUCCESS=$(echo "$START_GAME" | jq -r '.success')
  if [ "$SUCCESS" == "true" ]; then
    echo ""
    echo -e "${GREEN}✅ Jogo iniciado com sucesso!${NC}"
  fi
else
  echo -e "${RED}ID do jogo não disponível${NC}"
fi

echo ""
echo "============================================================"

# ============================================================
# 8. Finalizar jogo com resultado
# ============================================================

echo -e "${YELLOW}8. Finalizando jogo (status: finished, resultado: player_a)...${NC}"
echo ""

if [ "$GAME_ID" != "null" ] && [ -n "$GAME_ID" ]; then
  FINISH_GAME=$(curl -s -X PATCH "$BASE_URL/games/$GAME_ID/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "status": "finished",
      "result": "player_a"
    }')
  
  echo "$FINISH_GAME" | jq .
  
  SUCCESS=$(echo "$FINISH_GAME" | jq -r '.success')
  if [ "$SUCCESS" == "true" ]; then
    echo ""
    echo -e "${GREEN}✅ Jogo finalizado com sucesso!${NC}"
    
    RESULT=$(echo "$FINISH_GAME" | jq -r '.data.result')
    FINISHED_AT=$(echo "$FINISH_GAME" | jq -r '.data.finished_at')
    
    echo ""
    echo "📊 Resultado:"
    echo "  - Vencedor: $RESULT"
    echo "  - Finalizado em: $FINISHED_AT"
  fi
else
  echo -e "${RED}ID do jogo não disponível${NC}"
fi

echo ""
echo "============================================================"

# ============================================================
# 9. Teste de validação (jogadores iguais)
# ============================================================

echo -e "${YELLOW}9. Testando validação (jogadores iguais)...${NC}"
echo ""

VALIDATION_TEST=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "player_a": "João",
    "player_b": "João",
    "modality": "Bola 8",
    "series": 1
  }')

echo "$VALIDATION_TEST" | jq .

echo ""
echo "============================================================"

# ============================================================
# 10. Teste de validação (nome muito curto)
# ============================================================

echo -e "${YELLOW}10. Testando validação (nome muito curto)...${NC}"
echo ""

SHORT_NAME_TEST=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "player_a": "Jo",
    "player_b": "Maria",
    "modality": "Bola 8",
    "series": 1
  }')

echo "$SHORT_NAME_TEST" | jq .

echo ""
echo "============================================================"

# ============================================================
# 11. Teste sem autenticação
# ============================================================

echo -e "${YELLOW}11. Testando criação sem autenticação...${NC}"
echo ""

NO_AUTH_TEST=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -d '{
    "player_a": "João",
    "player_b": "Maria",
    "modality": "Bola 8",
    "series": 1
  }')

echo "$NO_AUTH_TEST" | jq .

echo ""
echo "============================================================"

# ============================================================
# 12. Listar jogos finalizados
# ============================================================

echo -e "${YELLOW}12. Listando jogos finalizados...${NC}"
echo ""

LIST_FINISHED=$(curl -s -X GET "$BASE_URL/games?status=finished")
echo "$LIST_FINISHED" | jq .

FINISHED_GAMES=$(echo "$LIST_FINISHED" | jq -r '.data.pagination.total')
echo ""
echo -e "${BLUE}Jogos finalizados: $FINISHED_GAMES${NC}"

echo ""
echo "============================================================"

# ============================================================
# 13. Teste de paginação
# ============================================================

echo -e "${YELLOW}13. Testando paginação (limit=5, offset=0)...${NC}"
echo ""

PAGINATION_TEST=$(curl -s -X GET "$BASE_URL/games?limit=5&offset=0")
echo "$PAGINATION_TEST" | jq .

echo ""
echo "============================================================"

# ============================================================
# Resumo Final
# ============================================================

echo -e "${GREEN}🎉 Testes concluídos!${NC}"
echo ""
echo "📊 Resumo:"
echo "  - Total de jogos: $TOTAL_GAMES"
echo "  - Jogos abertos: $OPEN_GAMES"
echo "  - Jogos finalizados: $FINISHED_GAMES"
echo ""
echo "============================================================"

