#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║           🎱 SinucaBet - Modo Desenvolvimento             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se está no diretório correto
if [ ! -f "GUIA_LOCALHOST.md" ]; then
    echo -e "${RED}❌ Execute este script da raiz do projeto!${NC}"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado! Instale Node.js 18+${NC}"
    exit 1
fi

echo -e "${BLUE}✓ Node.js versão: $(node -v)${NC}"

# Verificar arquivo .env do backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo backend/.env não encontrado!${NC}"
    echo -e "${BLUE}📝 Criando a partir do exemplo...${NC}"
    
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edite backend/.env e configure suas chaves do Supabase!${NC}"
        echo -e "${BLUE}   1. Abra: https://supabase.com/dashboard${NC}"
        echo -e "${BLUE}   2. Projeto → Settings → API${NC}"
        echo -e "${BLUE}   3. Copie as chaves para backend/.env${NC}"
        echo ""
        read -p "Pressione ENTER após configurar o .env..."
    else
        echo -e "${RED}❌ Arquivo .env.example não encontrado!${NC}"
        exit 1
    fi
fi

# Verificar arquivo .env.local do frontend
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Arquivo frontend/.env.local não encontrado!${NC}"
    echo -e "${BLUE}📝 Criando a partir do exemplo...${NC}"
    
    if [ -f "frontend/.env.local.example" ]; then
        cp frontend/.env.local.example frontend/.env.local
        echo -e "${YELLOW}⚠️  Configure frontend/.env.local com sua ANON_KEY${NC}"
        read -p "Pressione ENTER após configurar..."
    fi
fi

# Verificar e instalar dependências do backend
echo -e "${BLUE}📦 Verificando dependências do backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚙️  Instalando dependências do backend...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependências do backend OK${NC}"
fi
cd ..

# Verificar e instalar dependências do frontend
echo -e "${BLUE}📦 Verificando dependências do frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚙️  Instalando dependências do frontend...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependências do frontend OK${NC}"
fi
cd ..

# Função para limpar processos ao sair
cleanup() {
    echo -e "\n${YELLOW}🛑 Encerrando servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Servidores encerrados!${NC}"
    exit
}

trap cleanup EXIT INT TERM

echo ""
echo -e "${GREEN}🚀 Iniciando servidores...${NC}"
echo ""

# Iniciar backend
echo -e "${BLUE}🔧 Iniciando Backend (porta 3001)...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
echo -e "${YELLOW}⏳ Aguardando backend inicializar...${NC}"
sleep 5

# Testar se backend está rodando
if curl -s http://localhost:3001/api/auth/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend iniciado com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend ainda inicializando... (pode demorar alguns segundos)${NC}"
fi

# Iniciar frontend
echo -e "${BLUE}🎨 Iniciando Frontend (porta 3000)...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Aguardar frontend iniciar
echo -e "${YELLOW}⏳ Aguardando frontend inicializar...${NC}"
sleep 8

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  ✅ SinucaBet está rodando em modo desenvolvimento!       ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  🎨 Frontend:  ${BLUE}http://localhost:3000${GREEN}                      ║${NC}"
echo -e "${GREEN}║  ⚙️  Backend:   ${BLUE}http://localhost:3001${GREEN}                      ║${NC}"
echo -e "${GREEN}║  📊 Admin:     ${BLUE}http://localhost:3000/admin${GREEN}                ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  Logs:                                                     ║${NC}"
echo -e "${GREEN}║  • Backend:  tail -f backend.log                          ║${NC}"
echo -e "${GREEN}║  • Frontend: tail -f frontend.log                         ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  ${YELLOW}Pressione Ctrl+C para encerrar${GREEN}                         ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Tentar abrir o navegador
if command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 Abrindo navegador...${NC}"
    sleep 2
    open http://localhost:3000
fi

# Manter script rodando
wait

