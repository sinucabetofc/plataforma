#!/bin/bash

# ============================================================
# Script de Teste - Endpoints de Carteira (Wallet)
# ============================================================
# Execute este script para testar os endpoints de carteira
# Certifique-se de que o servidor está rodando: npm run dev
# ============================================================

BASE_URL="http://localhost:3001"
CONTENT_TYPE="Content-Type: application/json"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🎱 SinucaBet - Teste de Endpoints Wallet         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================
# 1. Health Check
# ============================================================

echo -e "\n${YELLOW}[1] Testando Health Check do Wallet...${NC}\n"

curl -s -X GET "${BASE_URL}/api/wallet/health" \
  -H "${CONTENT_TYPE}" | jq .

# ============================================================
# 2. Login para obter token
# ============================================================

echo -e "\n${YELLOW}[2] Fazendo login para obter token...${NC}\n"
echo -e "${BLUE}Digite o email do usuário:${NC}"
read USER_EMAIL

echo -e "${BLUE}Digite a senha:${NC}"
read -s USER_PASSWORD

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "${CONTENT_TYPE}" \
  -d "{
    \"email\": \"${USER_EMAIL}\",
    \"password\": \"${USER_PASSWORD}\"
  }")

echo "$LOGIN_RESPONSE" | jq .

# Extrair token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "\n${RED}❌ Erro ao fazer login. Verifique as credenciais.${NC}\n"
  exit 1
fi

echo -e "\n${GREEN}✅ Login realizado com sucesso!${NC}"
echo -e "${BLUE}Token: ${TOKEN:0:50}...${NC}\n"

# ============================================================
# 3. Consultar Carteira
# ============================================================

echo -e "\n${YELLOW}[3] Consultando dados da carteira...${NC}\n"

WALLET_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/wallet" \
  -H "${CONTENT_TYPE}" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$WALLET_RESPONSE" | jq .

# Extrair saldo
BALANCE=$(echo "$WALLET_RESPONSE" | jq -r '.data.wallet.balance')
BLOCKED=$(echo "$WALLET_RESPONSE" | jq -r '.data.wallet.blocked_balance')
AVAILABLE=$(echo "$WALLET_RESPONSE" | jq -r '.data.wallet.available_balance')

echo -e "\n${GREEN}💰 Saldo Total: R$ ${BALANCE}${NC}"
echo -e "${YELLOW}🔒 Saldo Bloqueado: R$ ${BLOCKED}${NC}"
echo -e "${GREEN}✅ Saldo Disponível: R$ ${AVAILABLE}${NC}"

# ============================================================
# 4. Criar Depósito
# ============================================================

echo -e "\n${YELLOW}[4] Deseja criar um novo depósito? (s/n)${NC}"
read CREATE_DEPOSIT

if [ "$CREATE_DEPOSIT" == "s" ] || [ "$CREATE_DEPOSIT" == "S" ]; then
  echo -e "\n${BLUE}Digite o valor do depósito (mínimo R$ 10,00):${NC}"
  read DEPOSIT_AMOUNT

  echo -e "\n${BLUE}Digite uma descrição (opcional, pressione Enter para pular):${NC}"
  read DEPOSIT_DESCRIPTION

  DEPOSIT_BODY="{\"amount\": ${DEPOSIT_AMOUNT}"
  
  if [ ! -z "$DEPOSIT_DESCRIPTION" ]; then
    DEPOSIT_BODY="${DEPOSIT_BODY}, \"description\": \"${DEPOSIT_DESCRIPTION}\""
  fi
  
  DEPOSIT_BODY="${DEPOSIT_BODY}}"

  echo -e "\n${YELLOW}Criando depósito...${NC}\n"

  DEPOSIT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/wallet/deposit" \
    -H "${CONTENT_TYPE}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "${DEPOSIT_BODY}")

  echo "$DEPOSIT_RESPONSE" | jq .

  # Extrair QR Code
  QR_URL=$(echo "$DEPOSIT_RESPONSE" | jq -r '.data.qr_code.url')
  BR_CODE=$(echo "$DEPOSIT_RESPONSE" | jq -r '.data.qr_code.brcode')
  TRANSACTION_ID=$(echo "$DEPOSIT_RESPONSE" | jq -r '.data.transaction_id')

  if [ "$QR_URL" != "null" ]; then
    echo -e "\n${GREEN}✅ Depósito criado com sucesso!${NC}"
    echo -e "${BLUE}Transaction ID: ${TRANSACTION_ID}${NC}"
    echo -e "${BLUE}QR Code URL: ${QR_URL}${NC}"
    echo -e "\n${YELLOW}📱 Código Pix Copia e Cola (brcode):${NC}"
    echo -e "${GREEN}${BR_CODE}${NC}"
    
    echo -e "\n${YELLOW}Deseja simular a confirmação do pagamento via webhook? (s/n)${NC}"
    read SIMULATE_WEBHOOK

    if [ "$SIMULATE_WEBHOOK" == "s" ] || [ "$SIMULATE_WEBHOOK" == "S" ]; then
      # Extrair correlationID do metadata
      CORRELATION_ID=$(echo "$DEPOSIT_RESPONSE" | jq -r '.data.transaction_id' | xargs -I {} curl -s -X GET "${BASE_URL}/api/wallet" -H "Authorization: Bearer ${TOKEN}" | jq -r ".data.recent_transactions[] | select(.id == \"{}\") | .metadata.correlationID")
      
      echo -e "\n${YELLOW}Simulando webhook da Woovi...${NC}\n"
      
      # Calcular valor em centavos
      AMOUNT_CENTS=$(echo "${DEPOSIT_AMOUNT} * 100" | bc | cut -d. -f1)
      
      WEBHOOK_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/wallet/webhook/woovi" \
        -H "${CONTENT_TYPE}" \
        -d "{
          \"event\": \"OPENPIX:CHARGE_COMPLETED\",
          \"charge\": {
            \"status\": \"COMPLETED\",
            \"correlationID\": \"DEPOSIT-${USER_EMAIL}-$(date +%s)-test\",
            \"value\": ${AMOUNT_CENTS},
            \"transactionID\": \"test_txn_$(date +%s)\"
          }
        }")
      
      echo "$WEBHOOK_RESPONSE" | jq .
      
      # Consultar carteira novamente
      echo -e "\n${YELLOW}Consultando carteira atualizada...${NC}\n"
      sleep 2
      
      UPDATED_WALLET=$(curl -s -X GET "${BASE_URL}/api/wallet" \
        -H "${CONTENT_TYPE}" \
        -H "Authorization: Bearer ${TOKEN}")
      
      echo "$UPDATED_WALLET" | jq .
      
      NEW_BALANCE=$(echo "$UPDATED_WALLET" | jq -r '.data.wallet.balance')
      echo -e "\n${GREEN}✅ Novo Saldo: R$ ${NEW_BALANCE}${NC}"
    fi
  else
    echo -e "\n${RED}❌ Erro ao criar depósito${NC}"
  fi
fi

# ============================================================
# 5. Visualizar últimas transações
# ============================================================

echo -e "\n${YELLOW}[5] Últimas transações da carteira:${NC}\n"

curl -s -X GET "${BASE_URL}/api/wallet" \
  -H "${CONTENT_TYPE}" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data.recent_transactions'

# ============================================================
# Finalização
# ============================================================

echo -e "\n${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Testes Concluídos com Sucesso            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"








