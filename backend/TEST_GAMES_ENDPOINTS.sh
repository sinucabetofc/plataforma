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
# 1. Fazer Login para obter o token
# ============================================================

echo -e "${YELLOW}1. Fazendo login...${NC}"
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
# 2. Criar Jogo 1 (Sinuca Livre)
# ============================================================

echo -e "${YELLOW}2. Criando Jogo 1 - Sinuca Livre...${NC}"
echo ""

GAME1_RESPONSE=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "advantages": "Nenhuma",
    "series": 3,
    "bet_limit": 500.00
  }')

echo "$GAME1_RESPONSE" | jq .

GAME1_ID=$(echo "$GAME1_RESPONSE" | jq -r '.data.id')
SUCCESS=$(echo "$GAME1_RESPONSE" | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
  echo ""
  echo -e "${GREEN}✅ Jogo 1 criado com sucesso!${NC}"
  echo "ID: $GAME1_ID"
else
  echo ""
  echo -e "${RED}❌ Erro ao criar jogo 1${NC}"
fi

echo ""
echo "============================================================"

# ============================================================
# 3. Criar Jogo 2 (Sinuca Brasileira)
# ============================================================

echo -e "${YELLOW}3. Criando Jogo 2 - Sinuca Brasileira...${NC}"
echo ""

GAME2_RESPONSE=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "player_a": "Maria Oliveira",
    "player_b": "Ana Costa",
    "modality": "Sinuca Brasileira",
    "advantages": "Jogador A tem 2 bolas de vantagem",
    "series": 5
  }')

echo "$GAME2_RESPONSE" | jq .

GAME2_ID=$(echo "$GAME2_RESPONSE" | jq -r '.data.id')

echo ""
echo -e "${GREEN}✅ Jogo 2 criado!${NC}"
echo "ID: $GAME2_ID"
echo ""
echo "============================================================"

# ============================================================
# 4. Criar Jogo 3 (Sinuca Americana - Pool 8)
# ============================================================

echo -e "${YELLOW}4. Criando Jogo 3 - Pool 8...${NC}"
echo ""

GAME3_RESPONSE=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "player_a": "Carlos Mendes",
    "player_b": "Lucas Ferreira",
    "modality": "Pool 8 (8-Ball)",
    "series": 1,
    "bet_limit": 1000.00
  }')

echo "$GAME3_RESPONSE" | jq .

GAME3_ID=$(echo "$GAME3_RESPONSE" | jq -r '.data.id')

echo ""
echo -e "${GREEN}✅ Jogo 3 criado!${NC}"
echo "ID: $GAME3_ID"
echo ""
echo "============================================================"

# ============================================================
# 5. Listar TODOS os jogos
# ============================================================

echo -e "${YELLOW}5. Listando TODOS os jogos...${NC}"
echo ""

ALL_GAMES=$(curl -s -X GET "$BASE_URL/games")

echo "$ALL_GAMES" | jq .

TOTAL=$(echo "$ALL_GAMES" | jq -r '.data.pagination.total')

echo ""
echo -e "${BLUE}Total de jogos: $TOTAL${NC}"
echo ""
echo "============================================================"

# ============================================================
# 6. Listar apenas jogos ABERTOS (status=open)
# ============================================================

echo -e "${YELLOW}6. Listando apenas jogos ABERTOS (status=open)...${NC}"
echo ""

OPEN_GAMES=$(curl -s -X GET "$BASE_URL/games?status=open")

echo "$OPEN_GAMES" | jq .

OPEN_COUNT=$(echo "$OPEN_GAMES" | jq -r '.data.pagination.total')

echo ""
echo -e "${BLUE}Jogos abertos: $OPEN_COUNT${NC}"
echo ""
echo "============================================================"

# ============================================================
# 7. Buscar jogo específico por ID
# ============================================================

echo -e "${YELLOW}7. Buscando jogo específico (Jogo 1)...${NC}"
echo ""

if [ "$GAME1_ID" != "null" ] && [ -n "$GAME1_ID" ]; then
  GAME_DETAIL=$(curl -s -X GET "$BASE_URL/games/$GAME1_ID")
  
  echo "$GAME_DETAIL" | jq .
  
  echo ""
  echo -e "${GREEN}✅ Jogo encontrado!${NC}"
else
  echo -e "${RED}❌ ID do jogo não disponível${NC}"
fi

echo ""
echo "============================================================"

# ============================================================
# 8. Listar jogos com paginação (limit=2)
# ============================================================

echo -e "${YELLOW}8. Listando jogos com paginação (limit=2)...${NC}"
echo ""

PAGINATED_GAMES=$(curl -s -X GET "$BASE_URL/games?limit=2&offset=0")

echo "$PAGINATED_GAMES" | jq .

echo ""
echo "============================================================"

# ============================================================
# 9. Filtrar por modalidade
# ============================================================

echo -e "${YELLOW}9. Filtrando por modalidade (Sinuca)...${NC}"
echo ""

FILTERED_GAMES=$(curl -s -X GET "$BASE_URL/games?modality=Sinuca")

echo "$FILTERED_GAMES" | jq .

echo ""
echo "============================================================"

# ============================================================
# 10. Atualizar status do jogo (iniciar jogo)
# ============================================================

echo -e "${YELLOW}10. Atualizando status do jogo 1 para 'in_progress'...${NC}"
echo ""

if [ "$GAME1_ID" != "null" ] && [ -n "$GAME1_ID" ]; then
  UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/games/$GAME1_ID/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "status": "in_progress"
    }')
  
  echo "$UPDATE_RESPONSE" | jq .
  
  echo ""
  echo -e "${GREEN}✅ Status atualizado!${NC}"
else
  echo -e "${RED}❌ ID do jogo não disponível${NC}"
fi

echo ""
echo "============================================================"

# ============================================================
# 11. Finalizar jogo com resultado
# ============================================================

echo -e "${YELLOW}11. Finalizando jogo 1 (resultado: player_a)...${NC}"
echo ""

if [ "$GAME1_ID" != "null" ] && [ -n "$GAME1_ID" ]; then
  FINISH_RESPONSE=$(curl -s -X PATCH "$BASE_URL/games/$GAME1_ID/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "status": "finished",
      "result": "player_a"
    }')
  
  echo "$FINISH_RESPONSE" | jq .
  
  echo ""
  echo -e "${GREEN}✅ Jogo finalizado!${NC}"
else
  echo -e "${RED}❌ ID do jogo não disponível${NC}"
fi

echo ""
echo "============================================================"

# ============================================================
# 12. Verificar jogos finalizados
# ============================================================

echo -e "${YELLOW}12. Listando jogos finalizados...${NC}"
echo ""

FINISHED_GAMES=$(curl -s -X GET "$BASE_URL/games?status=finished")

echo "$FINISHED_GAMES" | jq .

echo ""
echo "============================================================"

# ============================================================
# 13. Teste de validação - Jogadores iguais
# ============================================================

echo -e "${YELLOW}13. Testando validação (jogadores iguais)...${NC}"
echo ""

VALIDATION_ERROR=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "player_a": "João Silva",
    "player_b": "João Silva",
    "modality": "Sinuca Livre",
    "series": 3
  }')

echo "$VALIDATION_ERROR" | jq .

echo ""
echo "============================================================"

# ============================================================
# 14. Teste de validação - Série inválida
# ============================================================

echo -e "${YELLOW}14. Testando validação (série inválida)...${NC}"
echo ""

VALIDATION_ERROR2=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "series": 0
  }')

echo "$VALIDATION_ERROR2" | jq .

echo ""
echo "============================================================"

# ============================================================
# 15. Teste sem autenticação
# ============================================================

echo -e "${YELLOW}15. Testando criação sem autenticação...${NC}"
echo ""

NO_AUTH=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -d '{
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "series": 3
  }')

echo "$NO_AUTH" | jq .

echo ""
echo "============================================================"
echo -e "${GREEN}🎉 Testes concluídos!${NC}"
echo "============================================================"



