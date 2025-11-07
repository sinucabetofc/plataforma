#!/bin/bash

# Script para testar se há duplicação de reembolso

BASE_URL="${API_URL:-https://sinucabet-backend-production.up.railway.app}"

echo "🔍 Testando duplicação de reembolso..."
echo ""

# Login
echo "1. Fazendo login..."
LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}')

TOKEN=$(echo $LOGIN | jq -r '.data.token')
echo "✅ Token obtido"
echo ""

# Saldo inicial
echo "2. Consultando saldo inicial..."
WALLET1=$(curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN")
BALANCE1=$(echo $WALLET1 | jq -r '.data.balance')
echo "Saldo: $BALANCE1 centavos (R$ $(echo "scale=2; $BALANCE1 / 100" | bc))"
echo ""

# Buscar série
echo "3. Buscando série disponível..."
SERIES=$(curl -s -X GET "$BASE_URL/api/series?status=liberada&limit=1" \
  -H "Authorization: Bearer $TOKEN")
SERIE_ID=$(echo $SERIES | jq -r '.data.series[0].id')
PLAYER_ID=$(echo $SERIES | jq -r '.data.series[0].match.player1.id')
echo "Série: $SERIE_ID"
echo "Jogador: $PLAYER_ID"
echo ""

# Criar aposta
echo "4. Criando aposta de R$ 10,00..."
BET=$(curl -s -X POST "$BASE_URL/api/bets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"serie_id\":\"$SERIE_ID\",\"chosen_player_id\":\"$PLAYER_ID\",\"amount\":1000}")
BET_ID=$(echo $BET | jq -r '.data.bet.id')
echo "Aposta ID: $BET_ID"
echo ""

# Saldo após aposta
echo "5. Saldo após criar aposta..."
WALLET2=$(curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN")
BALANCE2=$(echo $WALLET2 | jq -r '.data.balance')
DIFF1=$((BALANCE1 - BALANCE2))
echo "Saldo: $BALANCE2 centavos (R$ $(echo "scale=2; $BALANCE2 / 100" | bc))"
echo "Debitado: $DIFF1 centavos (R$ $(echo "scale=2; $DIFF1 / 100" | bc))"
echo ""

sleep 1

# Cancelar aposta
echo "6. Cancelando aposta..."
CANCEL=$(curl -s -X DELETE "$BASE_URL/api/bets/$BET_ID" \
  -H "Authorization: Bearer $TOKEN")
REFUND=$(echo $CANCEL | jq -r '.data.refunded_amount')
echo "Valor reembolsado (response): $REFUND centavos (R$ $(echo "scale=2; $REFUND / 100" | bc))"
echo ""

sleep 2

# Saldo após cancelamento
echo "7. Saldo após cancelar..."
WALLET3=$(curl -s -X GET "$BASE_URL/api/wallet" \
  -H "Authorization: Bearer $TOKEN")
BALANCE3=$(echo $WALLET3 | jq -r '.data.balance')
DIFF2=$((BALANCE3 - BALANCE2))
echo "Saldo: $BALANCE3 centavos (R$ $(echo "scale=2; $BALANCE3 / 100" | bc))"
echo "Creditado: $DIFF2 centavos (R$ $(echo "scale=2; $DIFF2 / 100" | bc))"
echo ""

# Resultado
echo "========================================="
echo "📊 ANÁLISE"
echo "========================================="
echo "Saldo inicial:        $BALANCE1 centavos"
echo "Valor apostado:       1000 centavos (R$ 10,00)"
echo "Saldo após aposta:    $BALANCE2 centavos"
echo "Valor reembolsado:    $REFUND centavos"
echo "Saldo após cancelar:  $BALANCE3 centavos"
echo "Saldo final - inicial: $((BALANCE3 - BALANCE1)) centavos"
echo ""

if [ $((BALANCE3 - BALANCE2)) -eq 1000 ]; then
  echo "✅ Reembolso correto: R$ 10,00"
elif [ $((BALANCE3 - BALANCE2)) -eq 2000 ]; then
  echo "❌ ERRO: Reembolsou R$ 20,00 (DOBRO!)"
else
  echo "⚠️  Valor estranho: R$ $(echo "scale=2; $((BALANCE3 - BALANCE2)) / 100" | bc)"
fi

