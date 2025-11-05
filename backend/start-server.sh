#!/bin/bash

# ============================================================
# Script de Gerenciamento do Servidor Backend SinucaBet
# ============================================================

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BACKEND_DIR"

case "$1" in
  start)
    echo "🚀 Iniciando servidor backend..."
    npx pm2 start server.js --name "sinucabet-backend"
    ;;
  
  stop)
    echo "🛑 Parando servidor backend..."
    npx pm2 stop sinucabet-backend
    ;;
  
  restart)
    echo "🔄 Reiniciando servidor backend..."
    npx pm2 restart sinucabet-backend
    ;;
  
  status)
    echo "📊 Status do servidor:"
    npx pm2 status sinucabet-backend
    ;;
  
  logs)
    echo "📋 Logs do servidor (Ctrl+C para sair):"
    npx pm2 logs sinucabet-backend
    ;;
  
  dev)
    echo "🔧 Iniciando em modo desenvolvimento..."
    npm run dev
    ;;
  
  *)
    echo "Uso: $0 {start|stop|restart|status|logs|dev}"
    echo ""
    echo "Comandos:"
    echo "  start   - Inicia o servidor com PM2 (produção)"
    echo "  stop    - Para o servidor"
    echo "  restart - Reinicia o servidor"
    echo "  status  - Mostra status do servidor"
    echo "  logs    - Mostra logs em tempo real"
    echo "  dev     - Inicia em modo desenvolvimento (nodemon)"
    exit 1
    ;;
esac



