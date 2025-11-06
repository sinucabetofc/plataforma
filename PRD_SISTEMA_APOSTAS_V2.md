# Sistema de Apostas Peer-to-Peer com Matching Inteligente - Product Requirements Document

## Introduction

### Product Overview
Sistema de apostas em partidas de sinuca onde usuários apostam uns contra os outros (P2P). As apostas ficam expostas de forma anônima e são automaticamente pareadas (matching) quando há apostas no lado oposto. O sistema permite apostas ao vivo durante as partidas e cobra taxa única de 8% apenas nos saques.

### Target Audience
Usuários da plataforma SinucaBet que desejam apostar em partidas de sinuca ao vivo. Inclui apostadores casuais e frequentes que buscam transparência nas apostas disponíveis e facilidade no processo de apostas peer-to-peer.

---

## Core Features

### 1. Apostas Anônimas
**Descrição:** Usuários podem apostar sem expor identidade. Apostas aparecem como "Aposta #1", "Aposta #2", etc.

**Requisitos:**
- Não exibir nome, email ou qualquer identificação do apostador
- Numerar apostas sequencialmente
- Manter privacidade total dos apostadores

### 2. Matching Automático Inteligente
**Descrição:** Sistema pareia automaticamente apostas opostas usando FIFO, podendo casar uma aposta com múltiplas apostas menores.

**Exemplo:**
```
Apostas pendentes no Baianinho:
- Aposta #1: R$ 10
- Aposta #2: R$ 10  
- Aposta #3: R$ 10

Nova aposta no Mike: R$ 30
↓
Match automático: R$ 30 vs (R$ 10 + R$ 10 + R$ 10)
Resultado: 4 apostas matched
```

**Requisitos:**
- Matching em ordem FIFO (First In, First Out)
- Uma aposta pode casar com múltiplas apostas menores
- Match imediato e automático quando há apostas opostas

### 3. Apostas Ao Vivo
**Descrição:** Permite criar apostas mesmo durante a partida (status 'in_progress'), não apenas antes de começar.

**Requisitos:**
- Aceitar apostas em jogos com status "open"
- Aceitar apostas em jogos com status "in_progress"
- Bloquear apostas em jogos "finished" ou "cancelled"

### 4. Taxa Única de 8% no Saque
**Descrição:** Sem taxas nos ganhos. Taxa aplicada apenas quando usuário saca dinheiro.

**Requisitos:**
- ❌ Remover taxa de 5% nos ganhos (sistema antigo)
- ✅ Aplicar taxa de 8% apenas nos saques
- Na UI: mostrar apenas "Sacar" sem mencionar taxa
- Mostrar valor líquido que o usuário vai receber

**Exemplo:**
```
Saldo: R$ 1.000,00
Usuário quer sacar: R$ 500,00
Taxa (8%): R$ 40,00
Valor líquido recebido: R$ 460,00
```

### 5. Visualização de Apostas Individuais
**Descrição:** Mostra cada aposta separadamente com valor, não apenas total agregado por jogador.

**Interface esperada:**
```
╔════════════════════════════════════════════════╗
║  BAIANINHO vs MIKE                             ║
╠════════════════════════════════════════════════╣
║  💰 BAIANINHO - Total: R$ 100,00               ║
║  ┌──────────────────────────────────────────┐  ║
║  │ Aposta #1  │ R$ 10,00                    │  ║
║  │ Aposta #2  │ R$ 10,00                    │  ║
║  │ Aposta #3  │ R$ 10,00                    │  ║
║  │ Aposta #4  │ R$ 50,00                    │  ║
║  │ Aposta #5  │ R$ 20,00                    │  ║
║  └──────────────────────────────────────────┘  ║
╠════════════════════════════════════════════════╣
║  💰 MIKE - Total: R$ 0,00                      ║
║  └─ Nenhuma aposta ainda                       ║
╚════════════════════════════════════════════════╝
```

### 6. Sistema de Retorno 1:1
**Descrição:** Se apostar R$ 100 e ganhar, recebe R$ 100 de lucro (sem dedução de taxa nos ganhos).

**Cálculo:**
```javascript
// Sistema ANTIGO (será removido)
potential_return = amount * 1.95  // Taxa de 5%

// Sistema NOVO
potential_return = amount * 2  // 1:1, sem taxa
```

**Exemplo:**
```
Aposta: R$ 100,00
Se ganhar: R$ 100 (lucro) + R$ 100 (original) = R$ 200 total
Se perder: R$ 0
```

### 7. Apostas Irrevogáveis
**Descrição:** Uma vez criada, aposta não pode ser cancelada até match ou fim da série.

**Requisitos:**
- Não implementar funcionalidade de cancelamento
- Aposta permanece "pending" até:
  - Ser matched com aposta oposta, OU
  - Série finalizar (sem match)

### 8. Bloqueio de Saldo
**Descrição:** Valor apostado fica bloqueado na carteira até resolução.

**Fluxo:**
```
1. Criar aposta → Saldo bloqueado
2. Match → Saldo desbloqueado
3. Jogo finaliza → Ganhos creditados (se vencedor)
```

---

## Constraints and Limitations

| Constraint | Descrição |
|------------|-----------|
| Valor mínimo | R$ 10,00 |
| Múltiplos | Valores devem ser múltiplos de R$ 10 |
| Status do jogo | Apostas apenas em "open" ou "in_progress" |
| Cancelamento | Apostas não podem ser canceladas |
| Saldo | Usuário precisa ter saldo disponível |
| Taxa de saque | 8% fixo |
| Matching | FIFO (First In, First Out) |
| Permanência | Apostas permanecem até match ou fim da série |

---

## User Stories

### US-01: Criar Aposta
**Como** usuário da plataforma  
**Eu quero** criar uma aposta em um jogador  
**Para** tentar ganhar dinheiro apostando no resultado da partida

**Critérios de Aceitação:**
- Posso escolher jogador (player_a ou player_b)
- Posso escolher valor (múltiplo de R$ 10, mínimo R$ 10)
- Sistema valida se tenho saldo suficiente
- Saldo é bloqueado imediatamente
- Aposta aparece na lista de forma anônima
- Matching automático acontece se houver apostas opostas

### US-02: Ver Apostas do Jogo
**Como** usuário da plataforma  
**Eu quero** ver todas as apostas de um jogo  
**Para** entender como está a distribuição de apostas

**Critérios de Aceitação:**
- Vejo total apostado em cada jogador
- Vejo cada aposta individual (anônima)
- Apostas são listadas por jogador
- Interface é clara e fácil de entender

### US-03: Apostar Durante o Jogo
**Como** usuário da plataforma  
**Eu quero** criar apostas mesmo com jogo em andamento  
**Para** aproveitar oportunidades durante a partida

**Critérios de Aceitação:**
- Posso apostar em jogo "open"
- Posso apostar em jogo "in_progress"
- Não posso apostar em jogo "finished" ou "cancelled"

### US-04: Sacar Ganhos
**Como** usuário da plataforma  
**Eu quero** sacar meus ganhos  
**Para** receber o dinheiro na minha conta

**Critérios de Aceitação:**
- Botão mostra "Sacar" (sem mencionar taxa)
- Sistema calcula e mostra valor líquido que vou receber
- Taxa de 8% é aplicada automaticamente
- Vejo claramente quanto vou receber após a taxa

### US-05: Receber Ganhos
**Como** usuário que apostou  
**Eu quero** receber meus ganhos quando acertar o resultado  
**Para** aumentar meu saldo

**Critérios de Aceitação:**
- Ganho 1:1 (sem dedução de taxa)
- Se apostei R$ 100 e ganhei, recebo R$ 200 total (R$ 100 lucro + R$ 100 original)
- Ganhos são creditados automaticamente na carteira
- Taxa só é aplicada quando eu sacar

---

## Technical Requirements

### Backend Changes

#### 1. bet.service.js
```javascript
// ANTES
potential_return = amount * 1.95  // Taxa de 5%

// DEPOIS  
potential_return = amount * 2  // 1:1, sem taxa
```

#### 2. Validação de Status do Jogo
```javascript
// ANTES
if (game.status !== 'open') {
  throw error;
}

// DEPOIS
if (game.status !== 'open' && game.status !== 'in_progress') {
  throw error;
}
```

#### 3. wallet.service.js
```javascript
// Taxa de saque
const WITHDRAW_FEE = 0.08; // 8%
```

#### 4. API Response - GET /api/bets/game/:id
```json
{
  "game": {
    "id": "uuid",
    "player_a": "Baianinho",
    "player_b": "Mike"
  },
  "totals": {
    "player_a": {
      "total": 100.00,
      "bets_count": 5
    },
    "player_b": {
      "total": 0.00,
      "bets_count": 0
    }
  },
  "bets": [
    {
      "id": "bet-uuid-1",
      "label": "Aposta #1",
      "side": "player_a",
      "amount": 10.00,
      "status": "pending",
      "created_at": "2025-11-05T..."
    },
    {
      "id": "bet-uuid-2",
      "label": "Aposta #2",
      "side": "player_a",
      "amount": 10.00,
      "status": "pending",
      "created_at": "2025-11-05T..."
    }
  ]
}
```

### Frontend Changes

#### 1. Exibição de Apostas
- Listar apostas individuais
- Usar label anônimo "Aposta #1", "Aposta #2"
- Mostrar total por jogador
- Design limpo e organizado

#### 2. Botão de Saque
```jsx
// ANTES
<Button>Sacar (Taxa de 8%)</Button>

// DEPOIS
<Button>Sacar</Button>
{/* Mostrar valor líquido abaixo */}
<p>Você receberá: R$ {netAmount}</p>
```

---

## Acceptance Criteria

### AC-01: Taxa Única no Saque
- [ ] Taxa de 5% nos ganhos foi removida
- [ ] Cálculo é 1:1 (potential_return = amount * 2)
- [ ] Taxa de 8% aplicada apenas nos saques
- [ ] UI do saque não menciona taxa explicitamente
- [ ] Valor líquido é mostrado claramente

### AC-02: Apostas Ao Vivo
- [ ] Sistema aceita apostas em jogos "open"
- [ ] Sistema aceita apostas em jogos "in_progress"
- [ ] Sistema rejeita apostas em jogos "finished"

### AC-03: Visualização Anônima
- [ ] Apostas são listadas individualmente
- [ ] Nenhuma identificação do apostador é mostrada
- [ ] Label "Aposta #N" é usado
- [ ] Total por jogador é exibido

### AC-04: Matching Inteligente
- [ ] Sistema continua usando FIFO
- [ ] Uma aposta pode casar com múltiplas menores
- [ ] Matching é automático e imediato
- [ ] Todas as apostas matched desbloqueiam saldo

---

## Timeline

**Fase 1 - Backend (Estimativa: 2-3 horas)**
- Remover taxa de 5% nos ganhos
- Ajustar cálculo para 1:1
- Permitir apostas em "in_progress"
- Atualizar taxa de saque para 8%
- Ajustar resposta da API para labels anônimos

**Fase 2 - Frontend (Estimativa: 3-4 horas)**
- Ajustar exibição de apostas individuais
- Implementar labels anônimos
- Atualizar UI do botão de saque
- Mostrar valor líquido do saque

**Fase 3 - Testes (Estimativa: 1-2 horas)**
- Testar fluxo completo
- Validar cálculos
- Verificar matching múltiplo
- Confirmar taxa de saque

---

## Success Metrics

| Métrica | Objetivo |
|---------|----------|
| Transparência | 100% das apostas visíveis individualmente |
| Taxa nos ganhos | 0% (removida) |
| Taxa no saque | 8% (aplicada corretamente) |
| Matching | Funciona com múltiplas apostas |
| Apostas ao vivo | Habilitadas em "in_progress" |

---

## Risks and Mitigation

| Risco | Mitigação |
|-------|-----------|
| Matching incorreto | Testes extensivos com múltiplos cenários |
| Cálculo errado de ganhos | Validar fórmula 1:1 em todos os endpoints |
| Taxa aplicada errado | Revisar wallet.service.js cuidadosamente |
| UI confusa | Feedback de usuários beta antes do lançamento |

---

**Data de Criação:** 05/11/2025  
**Versão:** 2.0  
**Status:** Em Implementação




