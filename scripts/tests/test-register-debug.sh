#!/bin/bash

echo "🧪 Testando endpoint de registro..."
echo ""

# Gerar CPF e email únicos
TIMESTAMP=$(date +%s)
EMAIL="teste${TIMESTAMP}@teste.com"
CPF="123456789${TIMESTAMP: -2}"

echo "📧 Email: $EMAIL"
echo "📄 CPF: $CPF"
echo ""

# Fazer requisição
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST https://sinucabet-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Teste Usuario\",
    \"email\": \"$EMAIL\",
    \"password\": \"Senha123!\",
    \"phone\": \"11999999999\",
    \"cpf\": \"$CPF\",
    \"pix_key\": \"$EMAIL\",
    \"pix_type\": \"email\"
  }")

# Extrair código HTTP
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "📊 Status HTTP: $HTTP_CODE"
echo ""
echo "📦 Resposta:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ SUCESSO! Cadastro funcionando!"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "❌ ERRO 500! Backend ainda com problema"
  echo ""
  echo "💡 Verifique no Render:"
  echo "   1. Se o deploy terminou completamente"
  echo "   2. Se pegou o commit 1d7c364 ou 7056424"
  echo "   3. Os logs do servidor"
else
  echo "⚠️  Código inesperado: $HTTP_CODE"
fi

