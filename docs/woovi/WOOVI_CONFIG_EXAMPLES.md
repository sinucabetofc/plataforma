# ⚙️ CONFIGURAÇÕES E EXEMPLOS - INTEGRAÇÃO WOOVI PIX

## 📋 Variáveis de Ambiente

### Backend (.env)

```bash
# =====================================
# WOOVI API
# =====================================
WOOVI_APP_ID=Q2hhcmdlOjY4ZDQwOTQzMDY5YTI4ZjgzMTEzOTVkZA==
WOOVI_API_URL=https://api.woovi.com/api/v1

# Ambiente de Teste (Sandbox)
# WOOVI_API_URL=https://api.woovi-sandbox.com/api/v1

# =====================================
# DATABASE (Supabase)
# =====================================
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-service-key-aqui

# =====================================
# JWT
# =====================================
JWT_SECRET=seu-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d

# =====================================
# SERVER
# =====================================
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001

# =====================================
# WEBHOOK
# =====================================
WEBHOOK_URL=https://seu-dominio.com/api/webhook/woovi
# Local com Ngrok: https://abc123.ngrok.io/api/webhook/woovi

# =====================================
# LOGS
# =====================================
LOG_LEVEL=debug
# production: error, warn, info
# development: debug

# =====================================
# LIMITES
# =====================================
MIN_DEPOSIT_AMOUNT=10
MAX_DEPOSIT_AMOUNT=10000
DEPOSIT_MULTIPLES_OF=10

# =====================================
# FEATURES FLAGS
# =====================================
ENABLE_DEPOSIT=true
ENABLE_WITHDRAWAL=true
ENABLE_PIX=true
```

### Frontend (.env.local)

```bash
# =====================================
# API
# =====================================
NEXT_PUBLIC_API_URL=http://localhost:3000
# Produção: https://api.sinucabet.com

# =====================================
# WEBSOCKET (Opcional)
# =====================================
NEXT_PUBLIC_WS_URL=ws://localhost:3000
# Produção: wss://ws.sinucabet.com

# =====================================
# FEATURES
# =====================================
NEXT_PUBLIC_ENABLE_DEPOSIT=true
NEXT_PUBLIC_MIN_DEPOSIT=10
NEXT_PUBLIC_MAX_DEPOSIT=10000

# =====================================
# ANALYTICS (Opcional)
# =====================================
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# =====================================
# SENTRY (Opcional)
# =====================================
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 📦 package.json - Backend

```json
{
  "name": "sinucabet-backend",
  "version": "1.0.0",
  "description": "Backend SinucaBet com integração Woovi PIX",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.1",
    "@supabase/supabase-js": "^2.38.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "eslint": "^8.55.0",
    "supertest": "^6.3.3"
  }
}
```

---

## 📦 package.json - Frontend

```json
{
  "name": "sinucabet-frontend",
  "version": "1.0.0",
  "description": "Frontend SinucaBet",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.4",
    "axios": "^1.6.0",
    "react-qr-code": "^2.0.12",
    "react-toastify": "^9.1.3",
    "zustand": "^4.4.7",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/react": "^18.2.45",
    "@types/node": "^20.10.6",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

---

## 🔒 .gitignore

```bash
# =====================================
# NODE
# =====================================
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# =====================================
# ENV
# =====================================
.env
.env.local
.env.production
.env.development
.env.test

# =====================================
# NEXT.JS
# =====================================
.next/
out/
build/
dist/

# =====================================
# LOGS
# =====================================
*.log
logs/
backend_debug.log
backend.log
server.log

# =====================================
# IDE
# =====================================
.vscode/
.idea/
*.swp
*.swo
*~

# =====================================
# OS
# =====================================
.DS_Store
Thumbs.db

# =====================================
# TESTING
# =====================================
coverage/
.nyc_output/

# =====================================
# OUTROS
# =====================================
*.pem
.cache/
temp/
tmp/
```

---

## 🗄️ Exemplo de Migração SQL

### Criação Completa da Estrutura

```sql
-- =====================================
-- EXTENSÕES
-- =====================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- TABELA USERS (se ainda não existe)
-- =====================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  phone VARCHAR(20),
  balance DECIMAL(10, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- TABELA TRANSACTIONS
-- =====================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet', 'win', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  provider VARCHAR(50) DEFAULT 'woovi',
  
  -- Campos Woovi
  correlation_id VARCHAR(255) UNIQUE,
  woovi_transaction_id VARCHAR(255),
  woovi_charge_id VARCHAR(255),
  woovi_paid_at TIMESTAMP,
  woovi_fee INTEGER,
  woovi_end_to_end_id VARCHAR(255),
  
  -- Metadados
  metadata JSONB,
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- ÍNDICES
-- =====================================
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_correlation_id ON transactions(correlation_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_woovi_transaction_id ON transactions(woovi_transaction_id);

-- =====================================
-- TRIGGER PARA UPDATED_AT
-- =====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- FUNÇÃO PARA ATUALIZAR SALDO
-- =====================================
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF NEW.type IN ('deposit', 'win', 'refund') THEN
      UPDATE users 
      SET balance = balance + NEW.amount 
      WHERE id = NEW.user_id;
    ELSIF NEW.type IN ('withdrawal', 'bet') THEN
      UPDATE users 
      SET balance = balance - NEW.amount 
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_balance
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance();

-- =====================================
-- VIEWS ÚTEIS
-- =====================================

-- View de transações com informações do usuário
CREATE OR REPLACE VIEW v_transactions_with_user AS
SELECT 
  t.*,
  u.name as user_name,
  u.email as user_email
FROM transactions t
JOIN users u ON t.user_id = u.id;

-- View de estatísticas de depósitos por usuário
CREATE OR REPLACE VIEW v_deposit_stats AS
SELECT 
  user_id,
  COUNT(*) as total_deposits,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  MIN(created_at) as first_deposit,
  MAX(created_at) as last_deposit
FROM transactions
WHERE type = 'deposit' AND status = 'completed'
GROUP BY user_id;

-- =====================================
-- COMENTÁRIOS
-- =====================================
COMMENT ON TABLE transactions IS 'Tabela de transações financeiras do sistema';
COMMENT ON COLUMN transactions.amount IS 'Valor em reais (ex: 10.00 = R$ 10,00)';
COMMENT ON COLUMN transactions.woovi_fee IS 'Taxa da Woovi em centavos';
COMMENT ON COLUMN transactions.correlation_id IS 'ID único usado na integração com Woovi';

-- =====================================
-- DADOS DE TESTE (Opcional)
-- =====================================
-- Usuário de teste
-- INSERT INTO users (name, email, password_hash, cpf, balance) 
-- VALUES ('Usuário Teste', 'teste@sinucabet.com', '$2a$10$...', '12345678900', 100.00);
```

---

## 🔧 Configuração do Axios (Backend)

```javascript
// backend/config/axios.js
const axios = require('axios');

const wooviAxios = axios.create({
  baseURL: process.env.WOOVI_API_URL,
  timeout: 10000,
  headers: {
    'Authorization': process.env.WOOVI_APP_ID,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para logs
wooviAxios.interceptors.request.use(
  (config) => {
    console.log(`[WOOVI] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[WOOVI] Request error:', error);
    return Promise.reject(error);
  }
);

wooviAxios.interceptors.response.use(
  (response) => {
    console.log(`[WOOVI] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[WOOVI] Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

module.exports = wooviAxios;
```

---

## 🔧 Configuração do Axios (Frontend)

```javascript
// frontend/lib/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🚀 Script de Inicialização Rápida

### setup.sh

```bash
#!/bin/bash

echo "🚀 Configurando Integração Woovi PIX..."

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função de log
log() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

error() {
  echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar Node.js
log "Verificando Node.js..."
if ! command -v node &> /dev/null; then
  error "Node.js não está instalado!"
  exit 1
fi
success "Node.js $(node -v) encontrado"

# Backend
log "Configurando backend..."
cd backend

if [ ! -f ".env" ]; then
  log "Criando arquivo .env..."
  cat > .env << EOF
WOOVI_APP_ID=
WOOVI_API_URL=https://api.woovi.com/api/v1
DATABASE_URL=
JWT_SECRET=
PORT=3000
NODE_ENV=development
EOF
  success "Arquivo .env criado. IMPORTANTE: Preencha as variáveis!"
else
  success "Arquivo .env já existe"
fi

log "Instalando dependências..."
npm install
success "Dependências instaladas"

cd ..

# Frontend
log "Configurando frontend..."
cd frontend

if [ ! -f ".env.local" ]; then
  log "Criando arquivo .env.local..."
  cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_DEPOSIT=true
NEXT_PUBLIC_MIN_DEPOSIT=10
NEXT_PUBLIC_MAX_DEPOSIT=10000
EOF
  success "Arquivo .env.local criado"
else
  success "Arquivo .env.local já existe"
fi

log "Instalando dependências..."
npm install
success "Dependências instaladas"

cd ..

# Finalização
echo ""
echo "=================================="
success "Configuração concluída!"
echo "=================================="
echo ""
echo "📋 Próximos passos:"
echo "1. Preencha o WOOVI_APP_ID no backend/.env"
echo "2. Configure o DATABASE_URL no backend/.env"
echo "3. Execute as migrações SQL no banco"
echo "4. Inicie o backend: cd backend && npm run dev"
echo "5. Inicie o frontend: cd frontend && npm run dev"
echo "6. Configure o webhook no painel Woovi"
echo ""
echo "📚 Documentação: docs/WOOVI_QUICK_START.md"
echo ""
```

---

## 🧪 Script de Teste Rápido

### test-integration.sh

```bash
#!/bin/bash

echo "🧪 Testando Integração Woovi..."

API_URL="http://localhost:3000"
TOKEN="seu-token-jwt-aqui"

# Teste 1: Criar depósito
echo "1. Criando depósito de R$ 50..."
RESPONSE=$(curl -s -X POST $API_URL/api/deposit/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}')

echo "Resposta:"
echo $RESPONSE | jq .

# Extrair IDs
TRANSACTION_ID=$(echo $RESPONSE | jq -r '.transaction.id')
QR_CODE=$(echo $RESPONSE | jq -r '.pix.qrCode')

echo ""
echo "✅ Depósito criado!"
echo "Transaction ID: $TRANSACTION_ID"
echo "QR Code: ${QR_CODE:0:50}..."

# Teste 2: Consultar transação
echo ""
echo "2. Consultando status da transação..."
curl -s -X GET $API_URL/api/transactions/$TRANSACTION_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "✅ Testes concluídos!"
echo ""
echo "Agora:"
echo "1. Simule o pagamento no painel Woovi"
echo "2. Verifique se o webhook foi recebido"
echo "3. Confirme se o saldo foi atualizado"
```

---

## 📊 Exemplo de Logs Estruturados

```javascript
// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sinucabet-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

module.exports = logger;

// Uso:
// logger.info('Depósito criado', { userId, amount, correlationID });
// logger.error('Erro ao processar webhook', { error, payload });
```

---

## ✅ Checklist de Segurança

```markdown
### Variáveis de Ambiente
- [ ] AppID nunca exposto no frontend
- [ ] JWT_SECRET forte e único
- [ ] DATABASE_URL seguro
- [ ] .env no .gitignore

### API
- [ ] Rate limiting implementado
- [ ] Validação de inputs
- [ ] CORS configurado
- [ ] Helmet.js ativado

### Webhook
- [ ] Endpoint público (sem JWT)
- [ ] Validação de origem (opcional: HMAC)
- [ ] Idempotência garantida
- [ ] Logs de auditoria

### Banco de Dados
- [ ] Prepared statements (evita SQL injection)
- [ ] Índices criados
- [ ] Constraints de integridade
- [ ] Backups configurados
```

---

**Arquivo criado em**: 08/11/2025  
**Versão**: 1.0  
**Parte de**: Documentação Integração Woovi PIX
