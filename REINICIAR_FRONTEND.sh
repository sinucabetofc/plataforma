#!/bin/bash

echo "🔄 Reiniciando frontend do SinucaBet..."

# Matar todos os processos Next.js
echo "⏹️  Encerrando processos antigos..."
pkill -9 -f "next dev" 2>/dev/null || pkill -9 -f "node.*next" 2>/dev/null || true

# Limpar cache
echo "🧹 Limpando cache..."
cd "$(dirname "$0")/frontend"
rm -rf .next node_modules/.cache

# Iniciar servidor
echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev

