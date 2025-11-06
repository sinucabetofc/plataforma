/**
 * ============================================================
 * SinucaBet Backend API Server
 * ============================================================
 * Servidor principal da aplicação
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');

// Rotas antigas (manter por compatibilidade)
const gameRoutes = require('./routes/game.routes');
const betRoutes = require('./routes/bet.routes');

// Novas rotas (nova estrutura)
const playersRoutes = require('./routes/players.routes');
const matchesRoutes = require('./routes/matches.routes');
const seriesRoutes = require('./routes/series.routes');
const betsRoutes = require('./routes/bets.routes');

// Rotas admin
const adminRoutes = require('./routes/admin.routes');

// Rotas de upload
const uploadRoutes = require('./routes/upload.routes');

// Rota de teste (DEBUG)
// const testRoleRoutes = require('./routes/test-role.routes'); // COMENTADO - arquivo vazio

// Importar middlewares
const errorHandler = require('./middlewares/error-handler.middleware');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// Configuração para Render
// ============================================================

// Trust proxy (necessário para Render/Heroku/etc)
app.set('trust proxy', 1);

// ============================================================
// Middlewares Globais
// ============================================================

// Segurança
app.use(helmet());

// CORS - Permitir múltiplas origens
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002', // Admin panel
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002', // Admin panel
      'https://plataforma-hazel.vercel.app', // Frontend na Vercel
      process.env.FRONTEND_URL, // URL configurável via env
    ].filter(Boolean); // Remove valores undefined/null
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compressão
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting Global - DESABILITADO
// Removido para permitir múltiplas requisições do mesmo IP
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
//   message: {
//     success: false,
//     message: 'Muitas requisições deste IP, tente novamente mais tarde.'
//   }
// });
// app.use(limiter);

// ============================================================
// Health Check
// ============================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SinucaBet API está rodando!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// Rotas da API
// ============================================================

// Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

// Rotas antigas (manter por compatibilidade temporária)
app.use('/api/games', gameRoutes);
// app.use('/api/bets', betRoutes); // Comentado - substituído por betsRoutes

// Novas rotas (nova estrutura - prioridade)
app.use('/api/players', playersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/bets', betsRoutes); // Nova estrutura de apostas

// Rotas admin (requerem autenticação + role='admin')
app.use('/api/admin', adminRoutes);

// Rotas de upload (requerem autenticação)
app.use('/api/upload', uploadRoutes);

// Rota de teste (DEBUG - REMOVER EM PRODUÇÃO)
// app.use('/api/test', testRoleRoutes); // COMENTADO - arquivo vazio

// ============================================================
// Rota 404
// ============================================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// ============================================================
// Error Handler
// ============================================================

app.use(errorHandler);

// ============================================================
// Iniciar Servidor
// ============================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🎱 SinucaBet API Server                         ║
║                                                            ║
║   Servidor rodando em: http://localhost:${PORT}           ║
║   Ambiente: ${process.env.NODE_ENV || 'development'}                              ║
║   Timestamp: ${new Date().toLocaleString('pt-BR')}    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;


