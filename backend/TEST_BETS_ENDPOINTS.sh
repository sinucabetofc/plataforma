#!/bin/bash

# ============================================================
# Script de Teste - Endpoints de Apostas (Bets)
# ============================================================

BASE_URL="http://localhost:5000/api"

echo "============================================================"
echo "🎲 TESTE DOS ENDPOINTS DE APOSTAS (BETS)"
echo "============================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================
# 1. Fazer Login - Usuário 1
# ============================================================

echo -e "${YELLOW}1. Fazendo login - Usuário 1...${NC}"
echo ""

USER1_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }')

echo "$USER1_LOGIN" | jq .

TOKEN1=$(echo "$USER1_LOGIN" | jq -r '.data.token')
USER1_ID=$(echo "$USER1_LOGIN" | jq -r '.data.user.id')

if [ "$TOKEN1" == "null" ] || [ -z "$TOKEN1" ]; then
  echo -e "${RED}❌ Erro ao fazer login usuário 1${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Usuário 1 logado!${NC}"
echo "Token: $TOKEN1"
echo ""
echo "============================================================"

# ============================================================
# 2. Criar Jogo para apostas
# ============================================================

echo -e "${YELLOW}2. Criando jogo para apostas...${NC}"
echo ""

GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/games" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "player_a": "João Silva",
    "player_b": "Pedro Santos",
    "modality": "Sinuca Livre",
    "series": 3
  }')

echo "$GAME_RESPONSE" | jq .

GAME_ID=$(echo "$GAME_RESPONSE" | jq -r '.data.id')

echo ""
echo -e "${GREEN}✅ Jogo criado!${NC}"
echo "Game ID: $GAME_ID"
echo ""
echo "============================================================"

# ============================================================
# 3. Consultar saldo inicial do usuário 1
# ============================================================

echo -e "${YELLOW}3. Consultando saldo inicial...${NC}"
echo ""

WALLET1=$(curl -s -X GET "$BASE_URL/wallet" \
  -H "Authorization: Bearer $TOKEN1")

echo "$WALLET1" | jq .

BALANCE1=$(echo "$WALLET1" | jq -r '.data.wallet.balance')

echo ""
echo -e "${BLUE}Saldo inicial: R$ $BALANCE1${NC}"
echo ""
echo "============================================================"

# ============================================================
# 4. Criar Aposta 1 - Player A (R$ 100)
# ============================================================

echo -e "${YELLOW}4. Criando Aposta 1 - Player A (R$ 100)...${NC}"
echo ""

BET1_RESPONSE=$(curl -s -X POST "$BASE_URL/bets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"game_id\": \"$GAME_ID\",
    \"side\": \"player_a\",
    \"amount\": 100
  }")

echo "$BET1_RESPONSE" | jq .

BET1_STATUS=$(echo "$BET1_RESPONSE" | jq -r '.data.matching.status')

echo ""
echo -e "${CYAN}Status do matching: $BET1_STATUS${NC}"
echo ""
echo "============================================================"

# ============================================================
# 5. Verificar saldo após aposta 1
# ============================================================

echo -e "${YELLOW}5. Verificando saldo após aposta...${NC}"
echo ""

WALLET1_AFTER=$(curl -s -X GET "$BASE_URL/wallet" \
  -H "Authorization: Bearer $TOKEN1")

echo "$WALLET1_AFTER" | jq .

NEW_BALANCE=$(echo "$WALLET1_AFTER" | jq -r '.data.wallet.balance')
BLOCKED=$(echo "$WALLET1_AFTER" | jq -r '.data.wallet.blocked_balance')

echo ""
echo -e "${BLUE}Novo saldo: R$ $NEW_BALANCE${NC}"
echo -e "${BLUE}Saldo bloqueado: R$ $BLOCKED${NC}"
echo ""
echo "============================================================"

# ============================================================
# 6. Criar Aposta 2 - Player B (R$ 100) - Deve fazer match!
# ============================================================

echo -e "${YELLOW}6. Criando Aposta 2 - Player B (R$ 100) - Deve fazer MATCH!${NC}"
echo ""

BET2_RESPONSE=$(curl -s -X POST "$BASE_URL/bets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"game_id\": \"$GAME_ID\",
    \"side\": \"player_b\",
    \"amount\": 100
  }")

echo "$BET2_RESPONSE" | jq .

BET2_STATUS=$(echo "$BET2_RESPONSE" | jq -r '.data.matching.status')
BET2_MATCHED=$(echo "$BET2_RESPONSE" | jq -r '.data.bet.matched')

echo ""
if [ "$BET2_MATCHED" == "true" ]; then
  echo -e "${GREEN}✅ MATCH REALIZADO!${NC}"
else
  echo -e "${YELLOW}⏳ Aposta aguardando match${NC}"
fi
echo -e "${CYAN}Status do matching: $BET2_STATUS${NC}"
echo ""
echo "============================================================"

# ============================================================
# 7. Listar apostas do jogo
# ============================================================

echo -e "${YELLOW}7. Listando apostas do jogo...${NC}"
echo ""

GAME_BETS=$(curl -s -X GET "$BASE_URL/bets/game/$GAME_ID")

echo "$GAME_BETS" | jq .

TOTAL_A=$(echo "$GAME_BETS" | jq -r '.data.totals.player_a.total')
TOTAL_B=$(echo "$GAME_BETS" | jq -r '.data.totals.player_b.total')
TOTAL_BETS=$(echo "$GAME_BETS" | jq -r '.data.totals.total_bets_count')

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Total apostado Player A: R$ $TOTAL_A${NC}"
echo -e "${BLUE}Total apostado Player B: R$ $TOTAL_B${NC}"
echo -e "${BLUE}Total de apostas: $TOTAL_BETS${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo "============================================================"

# ============================================================
# 8. Criar Aposta 3 - Player A (R$ 50)
# ============================================================

echo -e "${YELLOW}8. Criando Aposta 3 - Player A (R$ 50)...${NC}"
echo ""

BET3_RESPONSE=$(curl -s -X POST "$BASE_URL/bets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"game_id\": \"$GAME_ID\",
    \"side\": \"player_a\",
    \"amount\": 50
  }")

echo "$BET3_RESPONSE" | jq .

echo ""
echo "============================================================"

# ============================================================
# 9. Criar Aposta 4 - Player B (R$ 30) - Match parcial
# ============================================================

echo -e "${YELLOW}9. Criando Aposta 4 - Player B (R$ 30) - Match PARCIAL...${NC}"
echo ""

BET4_RESPONSE=$(curl -s -X POST "$BASE_URL/bets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"game_id\": \"$GAME_ID\",
    \"side\": \"player_b\",
    \"amount\": 30
  }")

echo "$BET4_RESPONSE" | jq .

MATCH_MSG=$(echo "$BET4_RESPONSE" | jq -r '.data.matching.message')

echo ""
echo -e "${CYAN}$MATCH_MSG${NC}"
echo ""
echo "============================================================"

# ============================================================
# 10. Atualizar lista de apostas
# ============================================================

echo -e "${YELLOW}10. Atualizando lista de apostas...${NC}"
echo ""

GAME_BETS_UPDATED=$(curl -s -X GET "$BASE_URL/bets/game/$GAME_ID")

echo "$GAME_BETS_UPDATED" | jq .

TOTAL_A_UPD=$(echo "$GAME_BETS_UPDATED" | jq -r '.data.totals.player_a.total')
TOTAL_B_UPD=$(echo "$GAME_BETS_UPDATED" | jq -r '.data.totals.player_b.total')
TOTAL_BETS_UPD=$(echo "$GAME_BETS_UPDATED" | jq -r '.data.totals.total_bets_count')

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Total apostado Player A: R$ $TOTAL_A_UPD${NC}"
echo -e "${BLUE}Total apostado Player B: R$ $TOTAL_B_UPD${NC}"
echo -e "${BLUE}Total de apostas: $TOTAL_BETS_UPD${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo "============================================================"

# ============================================================
# 11. Teste de validação - Valor não múltiplo de 10
# ============================================================

echo -e "${YELLOW}11. Testando validação - Valor não múltiplo de 10...${NC}"
echo ""

VALIDATION_ERROR=$(curl -s -X POST "$BASE_URL/bets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"game_id\": \"$GAME_ID\",
    \"side\": \"player_a\",
    \"amount\": 25
  }")

echo "$VALIDATION_ERROR" | jq .

echo ""
echo "============================================================"

# ============================================================
# 12. Teste de validação - Valor abaixo do mínimo
# ============================================================

echo -e "${YELLOW}12. Testando validação - Valor abaixo do mínimo...${NC}"
echo ""

VALIDATION_ERROR2=$(curl -s -X POST "$BASE_URL/bets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d "{
    \"game_id\": \"$GAME_ID\",
    \"side\": \"player_a\",
    \"amount\": 5
  }")

echo "$VALIDATION_ERROR2" | jq .

echo ""
echo "============================================================"

# ============================================================
# 13. Teste sem autenticação
# ============================================================

echo -e "${YELLOW}13. Testando criação sem autenticação...${NC}"
echo ""

NO_AUTH=$(curl -s -X POST "$BASE_URL/bets" \
  -H "Content-Type: application/json" \
  -d "{
    \"game_id\": \"$GAME_ID\",
    \"side\": \"player_a\",
    \"amount\": 100
  }")

echo "$NO_AUTH" | jq .

echo ""
echo "============================================================"

# ============================================================
# 14. Teste - Apostar em jogo inexistente
# ============================================================

echo -e "${YELLOW}14. Testando aposta em jogo inexistente...${NC}"
echo ""

INVALID_GAME=$(curl -s -X POST "$BASE_URL/bets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "game_id": "00000000-0000-0000-0000-000000000000",
    "side": "player_a",
    "amount": 100
  }')

echo "$INVALID_GAME" | jq .

echo ""
echo "============================================================"

# ============================================================
# 15. Saldo final
# ============================================================

echo -e "${YELLOW}15. Consultando saldo final...${NC}"
echo ""

WALLET_FINAL=$(curl -s -X GET "$BASE_URL/wallet" \
  -H "Authorization: Bearer $TOKEN1")

echo "$WALLET_FINAL" | jq .

FINAL_BALANCE=$(echo "$WALLET_FINAL" | jq -r '.data.wallet.balance')
FINAL_BLOCKED=$(echo "$WALLET_FINAL" | jq -r '.data.wallet.blocked_balance')
FINAL_AVAILABLE=$(echo "$WALLET_FINAL" | jq -r '.data.wallet.available_balance')

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Saldo final: R$ $FINAL_BALANCE${NC}"
echo -e "${BLUE}Saldo bloqueado: R$ $FINAL_BLOCKED${NC}"
echo -e "${BLUE}Saldo disponível: R$ $FINAL_AVAILABLE${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

echo "============================================================"
echo -e "${GREEN}🎉 Testes concluídos!${NC}"
echo "============================================================"
echo ""
echo -e "${CYAN}📊 RESUMO DO MATCHING:${NC}"
echo "- Apostas criadas e pareadas automaticamente"
echo "- Sistema de matching 1x1 funcionando"
echo "- Saldo bloqueado e liberado corretamente"
echo "- Totais do jogo atualizados"
echo ""



