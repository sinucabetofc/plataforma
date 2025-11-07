#!/bin/bash

# =====================================================
# Script de Teste: GET /api/admin/transactions
# =====================================================

API_URL="${API_URL:-http://localhost:3001}"
ADMIN_TOKEN="${ADMIN_TOKEN}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testando Endpoint de Transações${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar se o token foi fornecido
if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  ADMIN_TOKEN não fornecido!${NC}"
  echo -e "${YELLOW}Por favor, execute:${NC}"
  echo -e "${YELLOW}export ADMIN_TOKEN=\"seu-token-admin-aqui\"${NC}"
  echo ""
  exit 1
fi

echo -e "${BLUE}Usando API: ${API_URL}${NC}"
echo ""

# =====================================================
# Teste 1: Listar todas as transações (sem filtros)
# =====================================================
echo -e "${YELLOW}📋 Teste 1: Listar todas as transações${NC}"
echo -e "${BLUE}GET /api/admin/transactions${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  "${API_URL}/api/admin/transactions")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "$BODY" | jq '.'
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Teste 1 passou!${NC}"
else
  echo -e "${RED}❌ Teste 1 falhou!${NC}"
fi
echo ""

# =====================================================
# Teste 2: Filtrar por tipo (deposit)
# =====================================================
echo -e "${YELLOW}📋 Teste 2: Filtrar por tipo 'deposit'${NC}"
echo -e "${BLUE}GET /api/admin/transactions?type=deposit${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  "${API_URL}/api/admin/transactions?type=deposit")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "$BODY" | jq '.'
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Teste 2 passou!${NC}"
else
  echo -e "${RED}❌ Teste 2 falhou!${NC}"
fi
echo ""

# =====================================================
# Teste 3: Filtrar por status (pending)
# =====================================================
echo -e "${YELLOW}📋 Teste 3: Filtrar por status 'pending'${NC}"
echo -e "${BLUE}GET /api/admin/transactions?status=pending${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  "${API_URL}/api/admin/transactions?status=pending")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "$BODY" | jq '.'
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Teste 3 passou!${NC}"
else
  echo -e "${RED}❌ Teste 3 falhou!${NC}"
fi
echo ""

# =====================================================
# Teste 4: Paginação
# =====================================================
echo -e "${YELLOW}📋 Teste 4: Paginação (page=1, limit=5)${NC}"
echo -e "${BLUE}GET /api/admin/transactions?page=1&limit=5${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  "${API_URL}/api/admin/transactions?page=1&limit=5")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "$BODY" | jq '.'
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Teste 4 passou!${NC}"
else
  echo -e "${RED}❌ Teste 4 falhou!${NC}"
fi
echo ""

# =====================================================
# Teste 5: Múltiplos filtros
# =====================================================
echo -e "${YELLOW}📋 Teste 5: Múltiplos filtros (type=aposta, status=completed)${NC}"
echo -e "${BLUE}GET /api/admin/transactions?type=aposta&status=completed${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  "${API_URL}/api/admin/transactions?type=aposta&status=completed")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "$BODY" | jq '.'
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Teste 5 passou!${NC}"
else
  echo -e "${RED}❌ Teste 5 falhou!${NC}"
fi
echo ""

# =====================================================
# Teste 6: Sem autorização (deve falhar)
# =====================================================
echo -e "${YELLOW}📋 Teste 6: Sem token (deve retornar 401)${NC}"
echo -e "${BLUE}GET /api/admin/transactions (sem Authorization)${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Content-Type: application/json" \
  "${API_URL}/api/admin/transactions")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "$BODY" | jq '.'
echo ""

if [ "$HTTP_CODE" -eq 401 ]; then
  echo -e "${GREEN}✅ Teste 6 passou (401 esperado)!${NC}"
else
  echo -e "${RED}❌ Teste 6 falhou! Esperado 401, recebido $HTTP_CODE${NC}"
fi
echo ""

# =====================================================
# Resumo
# =====================================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Resumo dos Testes${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Todos os testes principais executados!${NC}"
echo ""
echo -e "${YELLOW}Tipos de transação esperados:${NC}"
echo "  - aposta (quando usuário faz uma aposta)"
echo "  - ganho (quando usuário ganha uma aposta)"
echo "  - deposit (depósito via Pix)"
echo "  - withdraw (saque solicitado)"
echo "  - admin_credit (crédito manual pelo admin)"
echo "  - admin_debit (débito manual pelo admin)"
echo "  - refund (reembolso)"
echo ""
echo -e "${YELLOW}Status esperados:${NC}"
echo "  - pending (aguardando processamento)"
echo "  - completed (processado com sucesso)"
echo "  - failed (falhou)"
echo "  - cancelled (cancelado)"
echo ""

