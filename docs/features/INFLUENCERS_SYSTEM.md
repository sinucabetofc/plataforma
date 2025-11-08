# Sistema de Influencers/Parceiros - SinucaBet

## 📋 Visão Geral

O Sistema de Influencers/Parceiros permite que streamers e criadores de conteúdo transmitam jogos de sinuca na plataforma e recebam comissões baseadas no lucro da casa.

**Data de Implementação**: 08/11/2025  
**Versão**: 1.0.0

---

## 🎯 Funcionalidades Principais

### 1. Gestão de Influencers (Admin)
- ✅ Cadastro completo de influencers
- ✅ Edição de dados e configurações
- ✅ Definição de % de comissão
- ✅ Ativação/desativação de contas
- ✅ Visualização de estatísticas

### 2. Associação de Influencers a Jogos
- ✅ Seleção de influencer ao criar partida
- ✅ Definição de comissão específica por jogo
- ✅ Override da comissão padrão quando necessário

### 3. Painel do Influencer (/parceiros)
- ✅ Sistema de login separado
- ✅ Dashboard com estatísticas
- ✅ Lista de jogos transmitidos
- ✅ Controles em tempo real

### 4. Controles de Jogo (Influencer)
- ✅ Iniciar partida
- ✅ Atualizar placar em tempo real
- ✅ Iniciar séries
- ✅ Liberar apostas
- ✅ Visualizar apostas confirmadas

### 5. Sistema de Comissões
- ✅ Cálculo automático após finalização do jogo
- ✅ Baseado no lucro da casa
- ✅ Registro em tabela específica
- ✅ Status (pendente/pago)

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `influencers`

```sql
CREATE TABLE influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    photo_url VARCHAR(500),
    social_media JSONB DEFAULT '{}',
    pix_key VARCHAR(255) NOT NULL,
    commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Campos Principais**:
- `name`: Nome completo do influencer
- `email`: Email (usado para login)
- `password_hash`: Senha criptografada com bcrypt
- `phone`: Telefone de contato
- `photo_url`: URL da foto de perfil (opcional)
- `social_media`: JSON com redes sociais (instagram, youtube, twitch, tiktok)
- `pix_key`: Chave PIX para recebimento de comissões
- `commission_percentage`: % de comissão padrão (0-100)
- `is_active`: Se a conta está ativa

### Tabela: `influencer_commissions`

```sql
CREATE TABLE influencer_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID NOT NULL,
    match_id UUID NOT NULL,
    commission_percentage DECIMAL(5, 2) NOT NULL,
    total_bets DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    house_profit DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    commission_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_commission_influencer FOREIGN KEY (influencer_id)
        REFERENCES influencers(id),
    CONSTRAINT fk_commission_match FOREIGN KEY (match_id)
        REFERENCES matches(id),
    CONSTRAINT unique_commission_per_match UNIQUE (influencer_id, match_id)
);
```

**Campos Principais**:
- `influencer_id`: ID do influencer
- `match_id`: ID da partida
- `commission_percentage`: % usado no cálculo
- `total_bets`: Total apostado no jogo
- `house_profit`: Lucro da casa no jogo
- `commission_amount`: Valor calculado da comissão
- `status`: `pending` ou `paid`
- `paid_at`: Data/hora do pagamento

### Tabela `matches` (campos adicionados)

```sql
ALTER TABLE matches
ADD COLUMN influencer_id UUID,
ADD COLUMN influencer_commission DECIMAL(5, 2);
```

**Novos Campos**:
- `influencer_id`: ID do influencer que transmite (nullable)
- `influencer_commission`: % específica deste jogo (override)

---

## 🔌 API Endpoints

### Admin - Gestão de Influencers

#### `POST /api/admin/influencers`
Criar novo influencer

**Body**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "phone": "+5511999999999",
  "photo_url": "https://...",
  "social_media": {
    "instagram": "@joaosilva",
    "youtube": "@joaosilva"
  },
  "pix_key": "joao@example.com",
  "commission_percentage": 5.0
}
```

#### `GET /api/admin/influencers`
Listar influencers

**Query Params**:
- `is_active`: true/false
- `search`: busca por nome ou email
- `limit`: limite de resultados
- `offset`: offset para paginação

#### `GET /api/admin/influencers/:id`
Buscar influencer específico (inclui estatísticas)

#### `PATCH /api/admin/influencers/:id`
Atualizar influencer

#### `DELETE /api/admin/influencers/:id`
Desativar influencer (soft delete)  
Query param: `permanent=true` para deletar permanentemente

---

### Influencer - Autenticação

#### `POST /api/influencers/auth/login`
Login do influencer

**Body**:
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "influencer": { ... },
    "token": "JWT_TOKEN"
  }
}
```

#### `GET /api/influencers/auth/me`
Retorna dados do influencer autenticado

**Headers**: `Authorization: Bearer JWT_TOKEN`

#### `PATCH /api/influencers/auth/profile`
Atualizar próprio perfil

**Body**: Campos a atualizar (name, phone, photo_url, etc.)

---

### Influencer - Painel

#### `GET /api/influencers/dashboard`
Dashboard com estatísticas

**Headers**: `Authorization: Bearer JWT_TOKEN`

**Response**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_matches": 10,
      "active_matches": 2,
      "total_commissions": 500.00,
      "pending_commissions": 150.00
    },
    "recent_matches": [...]
  }
}
```

#### `GET /api/influencers/matches`
Listar partidas do influencer

**Query Params**:
- `status`: agendada, em_andamento, finalizada
- `limit`, `offset`: paginação

#### `GET /api/influencers/matches/:id`
Detalhes de uma partida + apostas confirmadas

#### `PATCH /api/influencers/matches/:id/start`
Iniciar partida

#### `PATCH /api/influencers/matches/:id/score`
Atualizar placar

**Body**:
```json
{
  "player1_score": 5,
  "player2_score": 3
}
```

#### `PATCH /api/influencers/series/:id/start`
Iniciar série

#### `PATCH /api/influencers/series/:id/enable-betting`
Liberar apostas para uma série

---

## 💰 Cálculo de Comissão

### Fórmula

```
Lucro da Casa = Total apostado pelos perdedores - Total pago aos ganhadores
Comissão = (% do influencer) × (Lucro da Casa)
```

### Exemplo

**Cenário**:
- Total apostado: R$ 1.000,00
- Total perdido pelos apostadores: R$ 600,00
- Total pago aos ganhadores: R$ 380,00
- % comissão do influencer: 5%

**Cálculo**:
```
Lucro da Casa = R$ 600,00 - R$ 380,00 = R$ 220,00
Comissão = 5% × R$ 220,00 = R$ 11,00
```

### Quando é Calculada

A comissão é calculada automaticamente quando:
1. A partida é finalizada (`status = 'finalizada'`)
2. Há um influencer associado ao jogo
3. Ainda não existe registro de comissão para aquela partida

### Service

```javascript
const { calculateCommissionForMatch } = require('./services/influencer-commission.service');

// Após finalizar jogo
await calculateCommissionForMatch(matchId);
```

---

## 🎨 Frontend

### Estrutura de Pastas

```
/admin
  /pages
    /influencers.js              # Página de gestão
  /components
    /InfluencerForm.js           # Formulário de criar/editar
    /MatchForm.js                # Inclui seleção de influencer
  /hooks
    /useInfluencers.js           # React Query hooks

/frontend
  /pages
    /parceiros
      /index.js                  # Redirect
      /login.js                  # Login do influencer
      /dashboard.js              # Dashboard do influencer
      /jogos
        /[id].js                 # Detalhes e controles do jogo
  /components
    /parceiros
      /InfluencerLayout.js       # Layout do painel
      /GameControlPanel.js       # Controles do jogo
      /BetsHistory.js            # Histórico de apostas
  /store
    /influencerStore.js          # Zustand store para auth
  /hooks
    /useInfluencerMatches.js     # Hooks para API
```

### Rotas Frontend

- `/parceiros` → Redireciona para login ou dashboard
- `/parceiros/login` → Login do influencer
- `/parceiros/dashboard` → Dashboard principal
- `/parceiros/jogos/[id]` → Detalhes e controles do jogo

### Autenticação Frontend

**Zustand Store**: Gerencia estado de autenticação
- `login(email, password)`: Faz login e armazena token
- `logout()`: Remove token e dados
- `fetchInfluencer()`: Busca dados atualizados
- `isAuthenticated`: Boolean se está autenticado
- `token`: JWT token

**InfluencerLayout**: Componente que envolve todas as páginas
- Verifica autenticação
- Redireciona para login se necessário
- Mostra sidebar e topbar

---

## 🔐 Segurança

### Backend

1. **Autenticação Separada**: Influencers usam JWT próprio, não Supabase Auth
2. **Middleware**: `authenticateInfluencer` valida token JWT
3. **Permissões**: Influencer só pode controlar jogos onde é o responsável
4. **RLS Policies**: Políticas no Supabase para acesso aos dados

### Senhas

- Hash com `bcryptjs` (10 rounds)
- Nunca retornadas nas respostas da API
- Podem ser atualizadas via endpoint de perfil

### Validações

- Email único para influencers
- Comissão entre 0-100%
- Telefone no formato internacional
- PIX obrigatório para recebimento

---

## 📊 Fluxo Completo

### 1. Admin Cadastra Influencer

1. Admin acessa `/admin/influencers`
2. Clica em "Novo Influencer"
3. Preenche formulário com dados completos
4. Define % de comissão padrão
5. Sistema cria conta e envia credenciais (manual)

### 2. Admin Cria Jogo com Influencer

1. Admin acessa `/admin/games`
2. Clica em "Nova Partida"
3. Preenche dados dos jogadores e partida
4. Seleciona influencer no campo "Influencer"
5. Opcionalmente, ajusta % de comissão específica
6. Salva partida

### 3. Influencer Faz Login

1. Influencer acessa `/parceiros`
2. É redirecionado para `/parceiros/login`
3. Insere email e senha
4. Sistema valida e gera JWT token
5. Redireciona para `/parceiros/dashboard`

### 4. Influencer Controla Jogo

1. No dashboard, vê lista de seus jogos
2. Clica em um jogo agendado
3. Clica em "Iniciar Partida"
4. Durante jogo:
   - Atualiza placar conforme pontos
   - Inicia cada série
   - Libera apostas quando apropriado
5. Vê apostas confirmadas em tempo real

### 5. Jogo Finaliza e Comissão é Calculada

1. Admin ou sistema finaliza a partida
2. Service `calculateCommissionForMatch` é chamado
3. Sistema:
   - Busca todas apostas confirmadas
   - Calcula lucro da casa
   - Aplica % do influencer
   - Registra na tabela `influencer_commissions`
4. Influencer vê comissão no dashboard (status: pendente)

### 6. Admin Paga Comissão

1. Admin vê comissões pendentes
2. Faz pagamento via PIX para chave cadastrada
3. Marca comissão como "paga" no sistema
4. Influencer vê status atualizado

---

## 🧪 Testes

### Testar Fluxo Completo

1. **Criar Influencer**:
   ```bash
   POST /api/admin/influencers
   ```

2. **Fazer Login**:
   ```bash
   POST /api/influencers/auth/login
   ```

3. **Criar Partida com Influencer**:
   ```bash
   POST /api/matches
   # Incluir: influencer_id, influencer_commission
   ```

4. **Controlar Jogo (Como Influencer)**:
   ```bash
   PATCH /api/influencers/matches/:id/start
   PATCH /api/influencers/matches/:id/score
   ```

5. **Finalizar e Calcular Comissão**:
   ```javascript
   const { calculateCommissionForMatch } = require('./services/influencer-commission.service');
   await calculateCommissionForMatch(matchId);
   ```

6. **Verificar Comissão**:
   ```bash
   GET /api/influencers/dashboard
   ```

---

## 🚀 Deploy

### Migrations

Executar migrations no Supabase SQL Editor:
1. `1026_create_influencers_table.sql`
2. `1027_create_influencer_commissions_table.sql`
3. `1028_add_influencer_to_matches.sql`

### Variáveis de Ambiente

```env
JWT_SECRET=sua_chave_secreta_aqui
```

### Dependências

**Backend**:
- `bcryptjs`: Hash de senhas
- `jsonwebtoken`: Geração de JWT

**Frontend**:
- `zustand`: State management
- `axios`: HTTP requests
- `react-query`: Data fetching

---

## 📝 Notas de Implementação

### Decisões Técnicas

1. **JWT Manual vs Supabase Auth**: Optamos por JWT manual para influencers para manter separação completa de autenticação

2. **Cálculo de Comissão**: Baseado no lucro da casa (não no total apostado) para ser justo com a plataforma

3. **Controle Dual**: Tanto admin quanto influencer podem controlar jogos (ambos têm permissão)

4. **Frontend Separado**: Painel do influencer em `/parceiros` para separar contextos

### Melhorias Futuras

- [ ] Sistema de notificações (email/SMS) para influencers
- [ ] Pagamento automático via PIX API
- [ ] Relatórios detalhados de performance
- [ ] Sistema de metas e bonificações
- [ ] Chat integrado entre admin e influencer
- [ ] Agendamento automático de jogos
- [ ] Integração com calendário

---

## 🐛 Troubleshooting

### Problema: Influencer não consegue fazer login

**Solução**: Verificar se:
- Email está correto
- Senha foi criada corretamente
- Conta está ativa (`is_active = true`)
- JWT_SECRET está configurado

### Problema: Comissão não é calculada

**Solução**: Verificar se:
- Partida está com `status = 'finalizada'`
- Há influencer associado (`influencer_id` não é null)
- Há apostas confirmadas no jogo
- Service foi chamado após finalização

### Problema: Influencer não vê seus jogos

**Solução**: Verificar se:
- Token JWT é válido
- Partidas têm `influencer_id` correto
- RLS policies permitem acesso

---

## 📞 Suporte

Para dúvidas ou problemas:
- Documentação completa: `/docs/features/INFLUENCERS_SYSTEM.md`
- Issues: Criar issue no repositório
- Email: suporte@sinucabet.com

---

**Última Atualização**: 08/11/2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e Testado

