#!/bin/bash

# ============================================================
# Script de Teste - Endpoints de Autenticação SinucaBet
# ============================================================
# 
# Este script testa os endpoints de autenticação da API
# Certifique-se de que o servidor está rodando em localhost:3001
#
# Uso: bash TEST_ENDPOINTS.sh
# ============================================================

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# URL base da API
API_URL="http://localhost:3001"

echo "============================================================"
echo "🎱 Testando Endpoints de Autenticação - SinucaBet"
echo "============================================================"
echo ""

# ============================================================
# Teste 1: Health Check da API
# ============================================================
echo -e "${BLUE}[1/4] Testando Health Check da API...${NC}"
echo ""

HEALTH_RESPONSE=$(curl -s -X GET ${API_URL}/)

if echo "$HEALTH_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ API está rodando!${NC}"
    echo "$HEALTH_RESPONSE" | jq '.'
else
    echo -e "${RED}❌ API não está respondendo!${NC}"
    echo "Certifique-se de que o servidor está rodando: npm run dev"
    exit 1
fi

echo ""
echo "============================================================"
echo ""

# ============================================================
# Teste 2: Registro de Usuário
# ============================================================
echo -e "${BLUE}[2/4] Testando Registro de Usuário...${NC}"
echo ""

# Gerar email único para evitar conflitos
TIMESTAMP=$(date +%s)
EMAIL="teste${TIMESTAMP}@example.com"

REGISTER_DATA=$(cat <<EOF
{
  "name": "Usuário Teste",
  "email": "${EMAIL}",
  "password": "SenhaForte123",
  "phone": "+5511999999999",
  "cpf": "123.456.789-09",
  "pix_key": "${EMAIL}",
  "pix_type": "email"
}
EOF
)

echo "Registrando usuário com email: ${EMAIL}"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Usuário registrado com sucesso!${NC}"
    echo "$REGISTER_RESPONSE" | jq '.'
    
    # Extrair token para usar no próximo teste
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user_id')
    
    echo ""
    echo -e "${YELLOW}Token JWT gerado:${NC}"
    echo "$TOKEN"
else
    echo -e "${RED}❌ Falha ao registrar usuário!${NC}"
    echo "$REGISTER_RESPONSE" | jq '.'
fi

echo ""
echo "============================================================"
echo ""

# ============================================================
# Teste 3: Login com Usuário Criado
# ============================================================
echo -e "${BLUE}[3/4] Testando Login...${NC}"
echo ""

LOGIN_DATA=$(cat <<EOF
{
  "email": "${EMAIL}",
  "password": "SenhaForte123"
}
EOF
)

echo "Fazendo login com email: ${EMAIL}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Login realizado com sucesso!${NC}"
    echo "$LOGIN_RESPONSE" | jq '.'
    
    # Extrair novo token
    LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
    
    echo ""
    echo -e "${YELLOW}Novo token JWT gerado:${NC}"
    echo "$LOGIN_TOKEN"
else
    echo -e "${RED}❌ Falha ao fazer login!${NC}"
    echo "$LOGIN_RESPONSE" | jq '.'
fi

echo ""
echo "============================================================"
echo ""

# ============================================================
# Teste 4: Tentativa de Login com Senha Incorreta
# ============================================================
echo -e "${BLUE}[4/4] Testando Login com Senha Incorreta...${NC}"
echo ""

WRONG_LOGIN_DATA=$(cat <<EOF
{
  "email": "${EMAIL}",
  "password": "SenhaErrada123"
}
EOF
)

WRONG_LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d "$WRONG_LOGIN_DATA")

if echo "$WRONG_LOGIN_RESPONSE" | grep -q "success.*false"; then
    echo -e "${GREEN}✅ Erro tratado corretamente!${NC}"
    echo "$WRONG_LOGIN_RESPONSE" | jq '.'
else
    echo -e "${RED}❌ Resposta inesperada!${NC}"
    echo "$WRONG_LOGIN_RESPONSE" | jq '.'
fi

echo ""
echo "============================================================"
echo ""

# ============================================================
# Resumo dos Testes
# ============================================================
echo -e "${YELLOW}📊 RESUMO DOS TESTES${NC}"
echo ""
echo -e "Usuário criado:"
echo -e "  Email: ${EMAIL}"
echo -e "  User ID: ${USER_ID}"
echo ""
echo -e "Endpoints testados:"
echo -e "  ✅ GET  / (health check)"
echo -e "  ✅ POST /api/auth/register"
echo -e "  ✅ POST /api/auth/login"
echo -e "  ✅ Validação de senha incorreta"
echo ""
echo -e "${GREEN}🎉 Todos os testes foram executados!${NC}"
echo ""
echo "============================================================"
echo ""

# ============================================================
# Testes Adicionais Recomendados
# ============================================================
echo -e "${YELLOW}📝 TESTES ADICIONAIS RECOMENDADOS:${NC}"
echo ""
echo "1. Testar registro com email duplicado:"
echo "   curl -X POST ${API_URL}/api/auth/register -H 'Content-Type: application/json' -d '{\"name\":\"Teste\",\"email\":\"${EMAIL}\",\"password\":\"Senha123\",\"phone\":\"+5511999999999\",\"cpf\":\"987.654.321-00\"}'"
echo ""
echo "2. Testar registro com CPF inválido:"
echo "   curl -X POST ${API_URL}/api/auth/register -H 'Content-Type: application/json' -d '{\"name\":\"Teste\",\"email\":\"outro@test.com\",\"password\":\"Senha123\",\"phone\":\"+5511999999999\",\"cpf\":\"000.000.000-00\"}'"
echo ""
echo "3. Testar registro com senha fraca:"
echo "   curl -X POST ${API_URL}/api/auth/register -H 'Content-Type: application/json' -d '{\"name\":\"Teste\",\"email\":\"fraca@test.com\",\"password\":\"123\",\"phone\":\"+5511999999999\",\"cpf\":\"111.222.333-96\"}'"
echo ""
echo "============================================================"









