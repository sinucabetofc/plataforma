# 🚀 Próximos Passos - Desenvolvimento SinucaBet
## Baseado na Análise da Plataforma VagBet

**Data:** 05/11/2025  
**Status Atual:** ✅ Sistema de autenticação funcionando  
**Próximo Objetivo:** Implementar funcionalidades core de apostas

---

## 📊 Status Atual do Projeto

### ✅ **Concluído**
- [x] Sistema de autenticação (Supabase Auth)
- [x] Cadastro de usuários (3 etapas)
- [x] Login/Logout
- [x] Gestão de perfil
- [x] Carteira digital (tabela criada)
- [x] Validações (Zod)
- [x] Interface básica (Next.js + TailwindCSS)

### ⏭️ **Próximas Etapas**
- [ ] Sistema de partidas
- [ ] Sistema de séries
- [ ] Apostas ao vivo
- [ ] Dashboard de partidas
- [ ] Transmissão ao vivo (YouTube)
- [ ] Real-time updates
- [ ] Sistema de notificações

---

## 🎯 Roadmap de Desenvolvimento

### **FASE 1: Core Features** (Sprints 1-4 / 4 semanas)

#### **Sprint 1: Models & Migrations** (Semana 1)

**Objetivo:** Criar estrutura de dados para partidas, jogadores e séries

**Tasks:**

1. **Criar Migration: Jogadores**
```sql
-- 004_create_players_table.sql
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  photo_url TEXT,
  bio TEXT,
  active BOOLEAN DEFAULT true,
  
  -- Estatísticas
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices
CREATE INDEX idx_players_active ON players(active);
CREATE INDEX idx_players_name ON players(name);

-- RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players são visíveis para todos" ON players
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem criar players" ON players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

2. **Criar Migration: Partidas**
```sql
-- 005_create_matches_table.sql
CREATE TYPE match_sport AS ENUM ('sinuca', 'futebol');
CREATE TYPE match_status AS ENUM ('agendada', 'em_andamento', 'finalizada', 'cancelada');

CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados básicos
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(100) DEFAULT 'Brasil',
  sport match_sport NOT NULL DEFAULT 'sinuca',
  status match_status NOT NULL DEFAULT 'agendada',
  
  -- Transmissão
  youtube_url TEXT,
  stream_active BOOLEAN DEFAULT false,
  
  -- Jogadores
  player1_id UUID REFERENCES players(id) NOT NULL,
  player2_id UUID REFERENCES players(id) NOT NULL,
  
  -- Regras do jogo (JSON)
  game_rules JSONB DEFAULT '{}',
  -- Ex: {
  --   "game_type": "JOGO DE BOLA NUMERADA",
  --   "rules": ["90 ESTOURA CONTINUA E TEM 1 BOLA MENOR"],
  --   "bet_type": "APOSTA POR SERIE",
  --   "serie_type": "BOLA CANTADA"
  -- }
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT different_players CHECK (player1_id != player2_id)
);

-- Índices
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);
CREATE INDEX idx_matches_sport ON matches(sport);
CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);

-- RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partidas são visíveis para todos" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem criar partidas" ON matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

3. **Criar Migration: Séries**
```sql
-- 006_create_series_table.sql
CREATE TYPE serie_status AS ENUM ('pendente', 'liberada', 'em_andamento', 'encerrada', 'cancelada');

CREATE TABLE series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relação com partida
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  serie_number INTEGER NOT NULL,
  
  -- Status e timing
  status serie_status NOT NULL DEFAULT 'pendente',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Apostas
  betting_enabled BOOLEAN DEFAULT false,
  betting_locked_at TIMESTAMP WITH TIME ZONE,
  
  -- Placar
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  
  -- Vencedor
  winner_player_id UUID REFERENCES players(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_match_serie UNIQUE (match_id, serie_number),
  CONSTRAINT valid_scores CHECK (player1_score >= 0 AND player2_score >= 0),
  CONSTRAINT winner_is_player CHECK (
    winner_player_id IS NULL OR 
    winner_player_id IN (
      SELECT player1_id FROM matches WHERE id = match_id
      UNION
      SELECT player2_id FROM matches WHERE id = match_id
    )
  )
);

-- Índices
CREATE INDEX idx_series_match ON series(match_id);
CREATE INDEX idx_series_status ON series(status);
CREATE INDEX idx_series_betting_enabled ON series(betting_enabled);

-- RLS
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Séries são visíveis para todos" ON series
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem criar séries" ON series
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

4. **Criar Migration: Apostas**
```sql
-- 007_create_bets_table.sql
CREATE TYPE bet_status AS ENUM ('pendente', 'aceita', 'ganha', 'perdida', 'cancelada', 'reembolsada');

CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relações
  user_id UUID REFERENCES users(id) NOT NULL,
  serie_id UUID REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  chosen_player_id UUID REFERENCES players(id) NOT NULL,
  
  -- Valor
  amount INTEGER NOT NULL, -- em centavos
  potential_return INTEGER, -- quanto pode ganhar
  
  -- Status
  status bet_status NOT NULL DEFAULT 'pendente',
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Matching (para apostas contra outros usuários)
  matched_bet_id UUID REFERENCES bets(id),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_amount CHECK (amount >= 1000) -- mínimo R$ 10,00
);

-- Índices
CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_serie ON bets(serie_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_placed_at ON bets(placed_at);

-- RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas suas próprias apostas" ON bets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar apostas" ON bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Apostas não podem ser atualizadas por usuários" ON bets
  FOR UPDATE USING (false);
```

5. **Criar Migration: Transações (Wallet)**
```sql
-- 008_create_transactions_table.sql
CREATE TYPE transaction_type AS ENUM ('deposito', 'saque', 'aposta', 'ganho', 'reembolso', 'bonus');

CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relações
  wallet_id UUID REFERENCES wallet(id) NOT NULL,
  bet_id UUID REFERENCES bets(id), -- NULL se não for relacionado a aposta
  
  -- Dados da transação
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL, -- positivo para crédito, negativo para débito
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- Detalhes
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem transações de sua carteira" ON transactions
  FOR SELECT USING (
    wallet_id IN (
      SELECT id FROM wallet WHERE user_id = auth.uid()
    )
  );
```

---

#### **Sprint 2: Backend APIs** (Semana 2)

**Objetivo:** Criar controllers e services para gestão de partidas

**Tasks:**

1. **Service: Players** (`backend/services/players.service.js`)
```javascript
import { supabase } from '../config/supabase.js';

export const playersService = {
  async create(playerData) {
    const { data, error } = await supabase
      .from('players')
      .insert(playerData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase
      .from('players')
      .select('*')
      .eq('active', true);
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,nickname.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('players')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStats(playerId, { matchPlayed, won }) {
    const player = await this.getById(playerId);
    
    const newTotal = player.total_matches + (matchPlayed ? 1 : 0);
    const newWins = player.total_wins + (won ? 1 : 0);
    const newWinRate = newTotal > 0 ? (newWins / newTotal) * 100 : 0;
    
    return this.update(playerId, {
      total_matches: newTotal,
      total_wins: newWins,
      win_rate: newWinRate.toFixed(2)
    });
  }
};
```

2. **Service: Matches** (`backend/services/matches.service.js`)
```javascript
import { supabase } from '../config/supabase.js';

export const matchesService = {
  async create(matchData) {
    const { data, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select(`
        *,
        player1:players!player1_id(*),
        player2:players!player2_id(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(filters = {}) {
    let query = supabase
      .from('matches')
      .select(`
        *,
        player1:players!player1_id(*),
        player2:players!player2_id(*),
        series(*)
      `);
    
    if (filters.sport) {
      query = query.eq('sport', filters.sport);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString());
    }
    
    const { data, error } = await query.order('scheduled_at');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:players!player1_id(*),
        player2:players!player2_id(*),
        series(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('matches')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

3. **Service: Series** (`backend/services/series.service.js`)
4. **Service: Bets** (`backend/services/bets.service.js`)
5. **Controller: Matches** (`backend/controllers/matches.controller.js`)
6. **Controller: Bets** (`backend/controllers/bets.controller.js`)
7. **Routes** em `backend/routes/`

---

#### **Sprint 3: Frontend - Dashboard** (Semana 3)

**Objetivo:** Criar interface para listar partidas

**Tasks:**

1. **Página: Dashboard** (`app/dashboard/page.tsx`)
```tsx
import { MatchList } from '@/components/matches/match-list';
import { MatchFilters } from '@/components/matches/match-filters';

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">SinucaBet</h1>
            <UserMenu />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Próximas Partidas</h2>
        
        <MatchFilters />
        
        <MatchList />
      </main>
    </div>
  );
}
```

2. **Componente: MatchCard** (`components/matches/match-card.tsx`)
```tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Youtube } from 'lucide-react';
import Link from 'next/link';

export function MatchCard({ match }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(match.scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{match.location}</span>
          </div>
          {match.youtube_url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={match.youtube_url} target="_blank" rel="noopener">
                <Youtube className="w-4 h-4 mr-1" />
                Assistir
              </a>
            </Button>
          )}
        </div>
        
        <Link href={`/partidas/${match.id}`}>
          <div className="flex items-center justify-between">
            <PlayerInfo player={match.player1} />
            
            <div className="text-4xl font-bold text-muted-foreground">
              X
            </div>
            
            <PlayerInfo player={match.player2} align="right" />
          </div>
        </Link>
        
        <div className="mt-4 space-y-2 text-sm">
          <Badge variant="secondary">
            {match.game_rules.game_type}
          </Badge>
          {match.game_rules.rules.map((rule, i) => (
            <p key={i} className="text-muted-foreground">
              <strong>{rule}</strong>
            </p>
          ))}
          <Badge>{match.game_rules.bet_type}</Badge>
        </div>
      </div>
    </Card>
  );
}
```

3. **Componente: MatchList** com filtros
4. **Componente: MatchFilters** (Sinuca/Futebol, Data)
5. **Hooks: useMatches** para fetch de dados

---

#### **Sprint 4: Frontend - Detalhes & Apostas** (Semana 4)

**Objetivo:** Página de detalhes da partida com apostas

**Tasks:**

1. **Página: Match Details** (`app/partidas/[id]/page.tsx`)
2. **Componente: SerieCard** com status e placar
3. **Componente: BettingForm** 
4. **Componente: LivePlayer** (YouTube embed)
5. **Service: API calls** (fetch, useSWR ou React Query)

---

### **FASE 2: Real-time & Notificações** (Sprints 5-6 / 2 semanas)

#### **Sprint 5: Real-time Updates**

1. **Supabase Realtime subscriptions**
2. **WebSocket para placar ao vivo**
3. **Atualização automática de séries**
4. **Atualização de status de apostas**

#### **Sprint 6: Notificações**

1. **Sistema de notificações (tabela)**
2. **Push notifications (web)**
3. **Notificações de:
   - Série liberada
   - Resultado de aposta
   - Início de partida favorita**

---

### **FASE 3: Administrativo** (Sprints 7-8 / 2 semanas)

#### **Sprint 7: Painel Admin**

1. **Dashboard administrativo**
2. **CRUD de jogadores**
3. **CRUD de partidas**
4. **Gestão de séries**
5. **Atualização de placares**

#### **Sprint 8: Financeiro**

1. **Integração PIX (Mercado Pago)**
2. **Depósitos e saques**
3. **Histórico de transações**
4. **Relatórios financeiros**

---

## 🛠️ Stack Tecnológico Confirmado

```yaml
Frontend:
  Framework: Next.js 14+ (App Router)
  Language: TypeScript
  Styling: TailwindCSS
  Components: Shadcn UI
  State: Zustand / React Context
  Data Fetching: SWR ou React Query
  Real-time: Supabase Realtime

Backend:
  Platform: Supabase
  Database: PostgreSQL
  Auth: Supabase Auth (JWT)
  API: Express.js (já existente)
  Real-time: Supabase Subscriptions

Infraestrutura:
  Hosting: Vercel (frontend)
  Database: Supabase (backend)
  Storage: Supabase Storage (imagens)
  CDN: Cloudflare

Integrações:
  - YouTube API (transmissões)
  - Mercado Pago (pagamentos)
  - WhatsApp Business API (suporte)
```

---

## 📋 Checklist Detalhado - Sprint 1

### Semana 1: Migrations e Models

- [ ] **Dia 1-2: Players**
  - [ ] Criar migration `004_create_players_table.sql`
  - [ ] Aplicar migration no Supabase
  - [ ] Criar service `players.service.js`
  - [ ] Testar CRUD via MCP Supabase
  - [ ] Popular tabela com jogadores de teste

- [ ] **Dia 3-4: Matches**
  - [ ] Criar migration `005_create_matches_table.sql`
  - [ ] Aplicar migration
  - [ ] Criar service `matches.service.js`
  - [ ] Testar relações (JOIN com players)
  - [ ] Criar partidas de teste

- [ ] **Dia 5: Series & Bets**
  - [ ] Criar migration `006_create_series_table.sql`
  - [ ] Criar migration `007_create_bets_table.sql`
  - [ ] Criar migration `008_create_transactions_table.sql`
  - [ ] Aplicar todas as migrations
  - [ ] Testar integridade referencial

---

## 🎨 Wireframes de Referência

### Dashboard
```
┌────────────────────────────────────┐
│ SinucaBet         R$ 150,00   👤  │
├────────────────────────────────────┤
│                                    │
│ Próximas Partidas                  │
│                                    │
│ [ SINUCA ] [ FUTEBOL ]             │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ ⏰ 09:19  📍 Brasil  ▶ Live │   │
│ │                              │   │
│ │  [Foto]   X   [Foto]         │   │
│ │  Player1     Player2         │   │
│ │                              │   │
│ │  JOGO DE BOLA NUMERADA       │   │
│ │  Regras...                   │   │
│ │  APOSTA POR SERIE            │   │
│ └──────────────────────────────┘   │
│                                    │
│ [Mais partidas...]                 │
└────────────────────────────────────┘
```

### Match Details
```
┌────────────────────────────────────┐
│ ← Detalhes da Partida              │
├────────────────────────────────────┤
│ ⏰ 09:19  📍 Brasil  🤝 Série     │
│                                    │
│ [Foto Player1]  X  [Foto Player2]  │
│                                    │
│ ───── SÉRIE 1 - ENCERRADA ─────   │
│ Placar: 7 X 6                      │
│                                    │
│ ───── SÉRIE 2 - ENCERRADA ─────   │
│ Placar: 5 X 7                      │
│                                    │
│ ─── SÉRIE 3 - LIBERADA APOSTAS ───│
│ Placar atual: 2 X 3                │
│                                    │
│ Escolha seu jogador:               │
│ [Selecionar] [Selecionar]          │
│                                    │
│ Valor: R$ [____]                   │
│ [+10] [+50] [+100] [Limpar]        │
│                                    │
│ [    APOSTAR    ]                  │
│                                    │
│ ┌──────────────────────────────┐   │
│ │  [YouTube Player]            │   │
│ └──────────────────────────────┘   │
└────────────────────────────────────┘
```

---

## 🚦 Critérios de Aceitação

### Para cada Sprint:

**Definição de Pronto (DoD):**
- [ ] Código implementado e testado
- [ ] Migrations aplicadas com sucesso
- [ ] Testes unitários (se aplicável)
- [ ] Teste E2E com Playwright
- [ ] Documentação atualizada
- [ ] Code review aprovado
- [ ] Deploy em staging
- [ ] Validação com usuário

---

## 📞 Próximos Passos Imediatos

### **Ação 1: Revisar Análise da VagBet** ✅
- [x] Documento `ANALISE_VAGBET.md` criado
- [x] Funcionalidades mapeadas
- [x] Screenshots capturados

### **Ação 2: Criar PRD (Product Requirements Document)**
- [ ] Usar MCP `prd-creator` (se disponível)
- [ ] Documentar requisitos funcionais
- [ ] Documentar requisitos não-funcionais
- [ ] Definir user stories

### **Ação 3: Iniciar Sprint 1**
- [ ] Criar branch `feature/players-matches-tables`
- [ ] Implementar migrations
- [ ] Aplicar no Supabase
- [ ] Testar via MCP

---

## 💡 Dicas Importantes

1. **Use o MCP Supabase** para testar queries rapidamente
2. **Valide RLS** antes de avançar
3. **Popule com dados de teste** realistas
4. **Documente decisões arquiteturais**
5. **Faça commits pequenos e frequentes**
6. **Teste em dispositivos móveis** desde o início

---

## 📚 Referências

- **Análise VagBet:** `ANALISE_VAGBET.md`
- **Status Atual:** `RESUMO_FINAL_CORRECAO.md`
- **Queries MCP:** `MCP_SUPABASE_QUERIES.md`
- **VagBet Live:** https://vagbet.com

---

**Criado:** 05/11/2025  
**Última atualização:** 05/11/2025  
**Próxima revisão:** Após Sprint 1

🚀 **Vamos construir o melhor sistema de apostas de sinuca do Brasil!**



