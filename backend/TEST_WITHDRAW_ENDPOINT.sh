#!/bin/bash

# ============================================================
# Script de Teste - Endpoint de Saque (Withdraw)
# ============================================================

BASE_URL="http://localhost:5000/api"

echo "============================================================"
echo "🧪 TESTE DO ENDPOINT DE SAQUE (WITHDRAW)"
echo "============================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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
# 2. Consultar saldo atual
# ============================================================

echo -e "${YELLOW}2. Consultando saldo atual...${NC}"
echo ""

WALLET_RESPONSE=$(curl -s -X GET "$BASE_URL/wallet" \
  -H "Authorization: Bearer $TOKEN")

echo "$WALLET_RESPONSE" | jq .

BALANCE=$(echo "$WALLET_RESPONSE" | jq -r '.data.wallet.balance')
AVAILABLE=$(echo "$WALLET_RESPONSE" | jq -r '.data.wallet.available_balance')

echo ""
echo "Saldo atual: R$ $BALANCE"
echo "Saldo disponível: R$ $AVAILABLE"
echo ""
echo "============================================================"

# ============================================================
# 3. Criar solicitação de saque
# ============================================================

echo -e "${YELLOW}3. Criando solicitação de saque...${NC}"
echo ""

WITHDRAW_RESPONSE=$(curl -s -X POST "$BASE_URL/wallet/withdraw" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 100,
    "pix_key": "teste@email.com",
    "description": "Saque de teste"
  }')

echo "$WITHDRAW_RESPONSE" | jq .

SUCCESS=$(echo "$WITHDRAW_RESPONSE" | jq -r '.success')

if [ "$SUCCESS" == "true" ]; then
  echo ""
  echo -e "${GREEN}✅ Saque criado com sucesso!${NC}"
  
  TRANSACTION_ID=$(echo "$WITHDRAW_RESPONSE" | jq -r '.data.transaction_id')
  AMOUNT=$(echo "$WITHDRAW_RESPONSE" | jq -r '.data.amount_requested')
  FEE=$(echo "$WITHDRAW_RESPONSE" | jq -r '.data.fee')
  TOTAL=$(echo "$WITHDRAW_RESPONSE" | jq -r '.data.total_debited')
  NEW_BALANCE=$(echo "$WITHDRAW_RESPONSE" | jq -r '.data.new_balance')
  
  echo ""
  echo "📋 Detalhes do Saque:"
  echo "  - ID da Transação: $TRANSACTION_ID"
  echo "  - Valor solicitado: R$ $AMOUNT"
  echo "  - Taxa (8%): R$ $FEE"
  echo "  - Total debitado: R$ $TOTAL"
  echo "  - Novo saldo: R$ $NEW_BALANCE"
  echo "  - Chave PIX: teste@email.com"
  echo "  - Status: pending (aguardando admin)"
else
  echo ""
  echo -e "${RED}❌ Erro ao criar saque${NC}"
fi

echo ""
echo "============================================================"

# ============================================================
# 4. Verificar saldo após saque
# ============================================================

echo -e "${YELLOW}4. Verificando saldo após o saque...${NC}"
echo ""

WALLET_AFTER=$(curl -s -X GET "$BASE_URL/wallet" \
  -H "Authorization: Bearer $TOKEN")

echo "$WALLET_AFTER" | jq .

echo ""
echo "============================================================"

# ============================================================
# 5. Teste de saque com saldo insuficiente
# ============================================================

echo -e "${YELLOW}5. Testando saque com saldo insuficiente...${NC}"
echo ""

WITHDRAW_FAIL=$(curl -s -X POST "$BASE_URL/wallet/withdraw" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 999999,
    "pix_key": "teste@email.com"
  }')

echo "$WITHDRAW_FAIL" | jq .

echo ""
echo "============================================================"

# ============================================================
# 6. Teste de validação (valor muito baixo)
# ============================================================

echo -e "${YELLOW}6. Testando validação (valor abaixo do mínimo)...${NC}"
echo ""

WITHDRAW_INVALID=$(curl -s -X POST "$BASE_URL/wallet/withdraw" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 5,
    "pix_key": "teste@email.com"
  }')

echo "$WITHDRAW_INVALID" | jq .

echo ""
echo "============================================================"

# ============================================================
# 7. Teste sem chave PIX
# ============================================================

echo -e "${YELLOW}7. Testando sem chave PIX...${NC}"
echo ""

WITHDRAW_NO_PIX=$(curl -s -X POST "$BASE_URL/wallet/withdraw" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 50
  }')

echo "$WITHDRAW_NO_PIX" | jq .

echo ""
echo "============================================================"
echo -e "${GREEN}🎉 Testes concluídos!${NC}"
echo "============================================================"



