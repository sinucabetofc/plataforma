#!/bin/bash

# ============================================================
# Script de Teste - Cancelamento de Apostas
# ============================================================
# Testa se o cancelamento está reembolsando o saldo corretamente

BASE_URL="${API_URL:-https://sinucabet-backend-production.up.railway.app}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================================"
echo "🎱 TESTE DE CANCELAMENTO DE APOSTAS - SinucaBet"
echo "============================================================"
echo ""
echo "Base URL: $BASE_URL"
echo ""

# ============================================================
# 1. LOGIN
# ============================================================
echo -e "${BLUE}[1/5] Fazendo login...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test@123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user.id // empty')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro ao fazer login${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo "User ID: $USER_ID"
echo ""

# ============================================================
# 2. VERIFICAR SALDO INICIAL
# ============================================================
echo -e "${BLUE}[2/5] Verificando saldo inicial...${NC}"

WALLET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN")

BALANCE_BEFORE=$(echo $WALLET_RESPONSE | jq -r '.data.balance // 0')
BALANCE_BEFORE_REAIS=$(echo "scale=2; $BALANCE_BEFORE / 100" | bc)

echo -e "${GREEN}✅ Saldo inicial: R$ $BALANCE_BEFORE_REAIS${NC}"
echo "Balance (centavos): $BALANCE_BEFORE"
echo ""

# ============================================================
# 3. BUSCAR SÉRIE DISPONÍVEL
# ============================================================
echo -e "${BLUE}[3/5] Buscando série disponível para apostar...${NC}"

SERIES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/series?status=liberada&limit=1" \
  -H "Authorization: Bearer $TOKEN")

SERIE_ID=$(echo $SERIES_RESPONSE | jq -r '.data.series[0].id // empty')
SERIE_NUMBER=$(echo $SERIES_RESPONSE | jq -r '.data.series[0].serie_number // empty')
PLAYER_ID=$(echo $SERIES_RESPONSE | jq -r '.data.series[0].match.player1.id // empty')
PLAYER_NAME=$(echo $SERIES_RESPONSE | jq -r '.data.series[0].match.player1.name // empty')

if [ -z "$SERIE_ID" ]; then
  echo -e "${YELLOW}⚠️  Nenhuma série disponível para apostas${NC}"
  echo "Response: $SERIES_RESPONSE"
  exit 0
fi

echo -e "${GREEN}✅ Série encontrada: #$SERIE_NUMBER${NC}"
echo "Série ID: $SERIE_ID"
echo "Jogador escolhido: $PLAYER_NAME ($PLAYER_ID)"
echo ""

# ============================================================
# 4. CRIAR APOSTA
# ============================================================
echo -e "${BLUE}[4/5] Criando aposta de teste (R$ 10,00)...${NC}"

BET_AMOUNT=1000  # R$ 10,00 em centavos

BET_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"serie_id\": \"$SERIE_ID\",
    \"chosen_player_id\": \"$PLAYER_ID\",
    \"amount\": $BET_AMOUNT
  }")

BET_ID=$(echo $BET_RESPONSE | jq -r '.data.bet.id // empty')
BET_SUCCESS=$(echo $BET_RESPONSE | jq -r '.success // false')

if [ "$BET_SUCCESS" != "true" ]; then
  echo -e "${RED}❌ Erro ao criar aposta${NC}"
  echo "Response: $BET_RESPONSE"
  exit 1
fi

# Verificar saldo após aposta
WALLET_AFTER_BET=$(curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN")

BALANCE_AFTER_BET=$(echo $WALLET_AFTER_BET | jq -r '.data.balance // 0')
BALANCE_AFTER_BET_REAIS=$(echo "scale=2; $BALANCE_AFTER_BET / 100" | bc)

echo -e "${GREEN}✅ Aposta criada com sucesso${NC}"
echo "Aposta ID: $BET_ID"
echo "Saldo após aposta: R$ $BALANCE_AFTER_BET_REAIS (centavos: $BALANCE_AFTER_BET)"
echo ""

# Verificar se o saldo foi debitado corretamente
EXPECTED_BALANCE=$((BALANCE_BEFORE - BET_AMOUNT))
if [ "$BALANCE_AFTER_BET" -ne "$EXPECTED_BALANCE" ]; then
  echo -e "${RED}⚠️  ATENÇÃO: Saldo após aposta não está correto!${NC}"
  echo "Esperado: $EXPECTED_BALANCE centavos"
  echo "Recebido: $BALANCE_AFTER_BET centavos"
fi

# Aguardar 1 segundo
sleep 1

# ============================================================
# 5. CANCELAR APOSTA
# ============================================================
echo -e "${BLUE}[5/5] Cancelando aposta...${NC}"

CANCEL_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/bets/$BET_ID" \
  -H "Authorization: Bearer $TOKEN")

CANCEL_SUCCESS=$(echo $CANCEL_RESPONSE | jq -r '.success // false')
REFUNDED_AMOUNT=$(echo $CANCEL_RESPONSE | jq -r '.data.refunded_amount // 0')
REFUNDED_REAIS=$(echo "scale=2; $REFUNDED_AMOUNT / 100" | bc)

if [ "$CANCEL_SUCCESS" != "true" ]; then
  echo -e "${RED}❌ Erro ao cancelar aposta${NC}"
  echo "Response: $CANCEL_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Aposta cancelada com sucesso${NC}"
echo "Valor reembolsado: R$ $REFUNDED_REAIS (centavos: $REFUNDED_AMOUNT)"
echo ""

# Aguardar 1 segundo para o banco processar
sleep 1

# ============================================================
# 6. VERIFICAR SALDO FINAL
# ============================================================
echo -e "${BLUE}[6/6] Verificando saldo final...${NC}"

WALLET_FINAL=$(curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN")

BALANCE_FINAL=$(echo $WALLET_FINAL | jq -r '.data.balance // 0')
BALANCE_FINAL_REAIS=$(echo "scale=2; $BALANCE_FINAL / 100" | bc)

echo -e "${GREEN}✅ Saldo final: R$ $BALANCE_FINAL_REAIS${NC}"
echo "Balance (centavos): $BALANCE_FINAL"
echo ""

# ============================================================
# VERIFICAÇÃO FINAL
# ============================================================
echo "============================================================"
echo "📊 RESUMO DO TESTE"
echo "============================================================"
echo ""
echo "Saldo inicial:      R$ $BALANCE_BEFORE_REAIS ($BALANCE_BEFORE centavos)"
echo "Valor apostado:     R$ 10.00 ($BET_AMOUNT centavos)"
echo "Saldo após aposta:  R$ $BALANCE_AFTER_BET_REAIS ($BALANCE_AFTER_BET centavos)"
echo "Valor reembolsado:  R$ $REFUNDED_REAIS ($REFUNDED_AMOUNT centavos)"
echo "Saldo final:        R$ $BALANCE_FINAL_REAIS ($BALANCE_FINAL centavos)"
echo ""

# Verificar se o saldo voltou ao original
if [ "$BALANCE_FINAL" -eq "$BALANCE_BEFORE" ]; then
  echo -e "${GREEN}✅ TESTE PASSOU: Saldo foi reembolsado corretamente!${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ TESTE FALHOU: Saldo não voltou ao valor original!${NC}"
  echo "Diferença: $((BALANCE_FINAL - BALANCE_BEFORE)) centavos"
  echo ""
  exit 1
fi

