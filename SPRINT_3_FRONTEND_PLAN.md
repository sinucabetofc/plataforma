# 🎨 Sprint 3 - Frontend Dashboard de Partidas
## Planejamento e Implementação

**Data de Início:** 05/11/2025  
**Duração Estimada:** 1-2 semanas  
**Status:** 🚀 **PRONTO PARA INICIAR**

---

## 🎯 Objetivo

Criar o **dashboard de partidas** no frontend, permitindo que usuários:
- Visualizem lista de partidas (agendadas, ao vivo, finalizadas)
- Filtrem partidas por status e modalidade
- Vejam detalhes de cada partida
- Naveguem para página de detalhes/apostas

---

## 📋 Pré-requisitos

### ✅ Backend Pronto:
- [x] API `/api/matches` (listar com filtros)
- [x] API `/api/matches/:id` (buscar partida específica)
- [x] API `/api/series/match/:matchId` (séries da partida)
- [x] API `/api/players` (jogadores)
- [x] Autenticação funcionando

### ✅ Frontend Base:
- [x] Next.js configurado
- [x] TailwindCSS instalado
- [x] AuthContext funcionando
- [x] Header/Layout prontos

---

## 🏗️ Estrutura a Criar

```
frontend/
├── pages/
│   ├── partidas/
│   │   ├── index.js          ← Lista de partidas (NOVO)
│   │   └── [id].js           ← Detalhes da partida (Sprint 4)
│   └── ...
├── components/
│   ├── partidas/
│   │   ├── MatchCard.js      ← Card de partida (NOVO)
│   │   ├── MatchFilters.js   ← Filtros (NOVO)
│   │   ├── MatchList.js      ← Lista (NOVO)
│   │   └── MatchSkeleton.js  ← Loading state (NOVO)
│   └── ...
├── lib/
│   └── api.js                ← Adicionar funções de API
└── utils/
    └── formatters.js         ← Formatações (data, moeda)
```

---

## 📝 Tasks do Sprint 3

### **Task 1: Configurar API Client** ⏱️ 30min
- [ ] Adicionar funções de API em `lib/api.js`:
  - `getMatches(filters)`
  - `getMatchById(id)`
  - `getSeriesByMatch(matchId)`
- [ ] Configurar interceptor para token JWT
- [ ] Tratamento de erros padrão

### **Task 2: Criar Componentes Base** ⏱️ 2h
- [ ] **MatchCard.js** - Card de partida
  - Player1 vs Player2
  - Status badge
  - Data/hora
  - Botão "Ver Detalhes"
  - Indicador de ao vivo (se em_andamento)
- [ ] **MatchFilters.js** - Filtros
  - Status (todas, agendadas, ao vivo, finalizadas)
  - Modalidade (sinuca, futebol)
  - Reset filters
- [ ] **MatchList.js** - Container da lista
  - Grid responsivo
  - Paginação
  - Empty state
- [ ] **MatchSkeleton.js** - Loading
  - Shimmer effect
  - 6 cards skeleton

### **Task 3: Criar Página `/partidas`** ⏱️ 2h
- [ ] `pages/partidas/index.js`
  - Fetch de partidas
  - Loading states
  - Error handling
  - Filtros funcionais
  - Paginação
  - SEO (meta tags)

### **Task 4: Estilização e UX** ⏱️ 1h
- [ ] Responsividade (mobile-first)
- [ ] Transições suaves
- [ ] Hover effects
- [ ] Empty states
- [ ] Error states

### **Task 5: Integrações** ⏱️ 1h
- [ ] Header: Link para /partidas
- [ ] Home: Seção de partidas em destaque
- [ ] Navegação entre páginas

### **Task 6: Testes** ⏱️ 1h
- [ ] Testar filtros
- [ ] Testar paginação
- [ ] Testar navegação
- [ ] Testar em mobile
- [ ] Validar performance

---

## 🎨 Design do MatchCard

```
┌─────────────────────────────────────────┐
│  🎱 JOGO DE BOLA NUMERADA    [AO VIVO] │
│                                         │
│     Luciano Covas  🆚  Ângelo Grego    │
│        (Covas)            (Grego)       │
│                                         │
│  Win Rate: 70%           Win Rate: 65% │
│                                         │
│  📍 São Paulo | 📅 05/11 às 20:00     │
│                                         │
│  Série 1: 5-3 (Covas) ✅               │
│  Série 2: Em andamento...              │
│  Série 3: Aguardando                   │
│                                         │
│         [Ver Detalhes e Apostar]       │
└─────────────────────────────────────────┘
```

### **Estados do Card:**
- **Agendada:** Badge cinza, data/hora em destaque
- **Ao Vivo:** Badge verde pulsando, placar em tempo real
- **Finalizada:** Badge azul, resultado final

---

## 🔌 API Endpoints a Usar

### 1. Listar Partidas
```javascript
GET /api/matches?status=agendada&limit=20&offset=0

Response:
{
  "success": true,
  "data": {
    "matches": [...],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

### 2. Buscar Partida
```javascript
GET /api/matches/{id}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "player1": {...},
    "player2": {...},
    "series": [...],
    "status": "em_andamento",
    ...
  }
}
```

---

## 📱 Responsividade

### Desktop (≥1024px):
- Grid 3 colunas
- Sidebar com filtros
- Cards maiores

### Tablet (≥768px):
- Grid 2 colunas
- Filtros em dropdown
- Cards médios

### Mobile (<768px):
- Grid 1 coluna
- Filtros em modal
- Cards compactos

---

## 🎯 User Stories

### **US1: Visualizar Partidas**
> "Como usuário, quero ver uma lista de todas as partidas disponíveis para poder escolher em qual apostar."

**Critérios de Aceitação:**
- [ ] Lista mostra partidas ordenadas por data
- [ ] Cada card mostra player1 vs player2
- [ ] Status da partida é visível
- [ ] Data/hora é exibida

### **US2: Filtrar Partidas**
> "Como usuário, quero filtrar partidas por status para encontrar rapidamente partidas ao vivo."

**Critérios de Aceitação:**
- [ ] Filtro de status funcional
- [ ] Filtro de modalidade funcional
- [ ] Botão "Limpar Filtros"
- [ ] URL atualiza com filtros (shareable)

### **US3: Ver Detalhes**
> "Como usuário, quero clicar em uma partida para ver mais detalhes e fazer apostas."

**Critérios de Aceitação:**
- [ ] Botão "Ver Detalhes" em cada card
- [ ] Navega para `/partidas/[id]`
- [ ] Transição suave

---

## 💡 Features Extras (Opcionais)

### **Nice to Have:**
- [ ] Badge "NOVA" em partidas recém-criadas
- [ ] Contador regressivo para partidas agendadas
- [ ] Busca por nome de jogador
- [ ] Ordenação (data, popularidade)
- [ ] Favoritar partidas

### **Para Fase 2:**
- [ ] Notificações quando partida inicia
- [ ] Feed de apostas recentes
- [ ] Estatísticas de apostas por partida

---

## 🚀 Implementação Sugerida

### **Dia 1: Setup e API**
- [ ] Criar estrutura de pastas
- [ ] Adicionar funções de API
- [ ] Testar endpoints

### **Dia 2-3: Componentes**
- [ ] MatchCard
- [ ] MatchFilters
- [ ] MatchList
- [ ] MatchSkeleton

### **Dia 4: Página Principal**
- [ ] pages/partidas/index.js
- [ ] Integrar componentes
- [ ] Lógica de filtros e paginação

### **Dia 5: Polish**
- [ ] Estilização final
- [ ] Responsividade
- [ ] Testes
- [ ] Ajustes de UX

---

## 📊 Métricas de Sucesso

- [ ] Tempo de carregamento < 2s
- [ ] 100% responsivo (mobile, tablet, desktop)
- [ ] Acessível (WCAG AA)
- [ ] SEO otimizado (meta tags, structured data)
- [ ] Zero erros no console
- [ ] Filtros funcionam perfeitamente
- [ ] Navegação fluida

---

## 🎨 Paleta de Cores

```css
/* Status Badges */
--agendada: #6B7280;      /* Cinza */
--ao-vivo: #10B981;       /* Verde */
--finalizada: #3B82F6;    /* Azul */
--cancelada: #EF4444;     /* Vermelho */

/* Destaque */
--primary: #16A34A;       /* Verde principal */
--secondary: #0EA5E9;     /* Azul */
```

---

## 📚 Referências

### **Inspirações de Design:**
- Bet365 (layout de partidas)
- ESPN (cards de jogos)
- FanDuel (filtros e navegação)

### **Bibliotecas Úteis:**
- `date-fns` - Formatação de datas
- `react-intersection-observer` - Infinite scroll
- `framer-motion` - Animações
- `react-hot-toast` - Notificações

---

## ✅ Checklist Final Sprint 3

### **Backend:**
- [x] APIs de partidas funcionando
- [x] APIs de séries funcionando
- [x] Autenticação OK

### **Frontend:**
- [ ] API client configurado
- [ ] Componentes criados
- [ ] Página /partidas funcional
- [ ] Responsivo
- [ ] Testado
- [ ] Documentado

---

## 🎯 Entregáveis

Ao final do Sprint 3:
1. ✅ Página `/partidas` funcional
2. ✅ Listagem de partidas com filtros
3. ✅ Cards responsivos e bonitos
4. ✅ Loading e error states
5. ✅ Navegação para detalhes (link)
6. ✅ Código limpo e organizado

**Pronto para Sprint 4:** Página de detalhes + apostas

---

**Sprint Owner:** Vinicius Ambrozio  
**Start Date:** 05/11/2025  
**Status:** 🚀 **READY TO START**

---

🎱 **"Partidas ao alcance de um clique!"** 🎱

