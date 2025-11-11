# 🔄 Sistema de Matching Fracionado - SinucaBet

## 📋 Visão Geral

O **Sistema de Matching Fracionado** permite que uma aposta seja casada com múltiplas apostas opostas, e vice-versa. Isso aumenta a liquidez da plataforma e garante que apostadores sempre tenham a oportunidade de ter suas apostas aceitas, mesmo com valores diferentes.

### **Exemplo Prático**

```
Baianinho: 1 aposta de R$ 20,00
    ↓ CASA COM ↓
Ambrozio: 2 apostas de R$ 10,00 (usuários diferentes)

Resultado:
✅ Baianinho: R$ 20 totalmente casado (100%)
✅ Ambrozio User 1: R$ 10 totalmente casado (100%)
✅ Ambrozio User 2: R$ 10 totalmente casado (100%)

Se Baianinho ganhar: recebe R$ 40 (R$ 20 x 2)
Se Ambrozio ganhar: cada usuário recebe R$ 20 (R$ 10 x 2)
```

---

## 🎯 Princípios Fundamentais

### 1. **FIFO (First In, First Out)**
As apostas são casadas por ordem de chegada. A aposta mais antiga sempre tem prioridade.

```javascript
// Ordem de processamento
1. Aposta A - R$ 10 (12:00:00)
2. Aposta B - R$ 15 (12:00:05)
3. Aposta C - R$ 20 (12:00:10) ← Nova aposta

Matching: C casa primeiro com A (R$ 10), depois com B (R$ 10 dos R$ 15)
Resultado: B fica com R$ 5 pendentes
```

### 2. **Ganho Sempre o Dobro do Valor Casado**
O retorno é sempre **2x o valor casado**, independente de quantas pessoas casaram do lado oposto.

```javascript
// Exemplos
Apostou R$ 10 → Casou R$ 10 → Ganha R$ 20
Apostou R$ 20 → Casou R$ 15 → Ganha R$ 30 (se ganhar)
Apostou R$ 50 → Casou R$ 50 → Ganha R$ 100
```

### 3. **Matching Fracionado**
Uma aposta pode ser casada parcialmente, ficando parte aceita e parte pendente.

```javascript
Status possíveis:
- pendente: 0% casada
- parcialmente_aceita: 1-99% casada
- aceita: 100% casada
```

---

## 🗄️ Estrutura do Banco de Dados

### **Nova Tabela: `bet_matches`**

```sql
CREATE TABLE bet_matches (
    id UUID PRIMARY KEY,
    serie_id UUID NOT NULL,
    bet_a_id UUID NOT NULL,  -- Aposta A
    bet_b_id UUID NOT NULL,  -- Aposta B (oposta)
    matched_amount INTEGER NOT NULL, -- Valor casado (centavos)
    created_at TIMESTAMP
);
```

### **Campos Adicionados em `bets`**

```sql
ALTER TABLE bets 
ADD COLUMN matched_amount INTEGER DEFAULT 0,    -- Valor já casado
ADD COLUMN remaining_amount INTEGER;            -- Valor pendente
```

### **Novo Status: `parcialmente_aceita`**

```sql
ALTER TYPE bet_status_enum ADD VALUE 'parcialmente_aceita';
```

---

## 🔄 Fluxo de Matching

### **1. Nova Aposta Entra**

```
Usuario cria aposta de R$ 30
         ↓
Sistema debita R$ 30 da wallet
         ↓
Cria aposta com status 'pendente'
         ↓
Inicia processo de matching
```

### **2. Busca Apostas Opostas (FIFO)**

```sql
SELECT * FROM bets
WHERE serie_id = :serie_id
  AND chosen_player_id = :opponent_id
  AND remaining_amount > 0
  AND status IN ('pendente', 'parcialmente_aceita')
ORDER BY placed_at ASC -- FIFO!
```

### **3. Matching Fracionado**

```javascript
let remainingToMatch = R$ 30; // Nova aposta
const matches = [];

// Aposta oposta 1: R$ 10 disponível
matches.push({ bet: oposta1, amount: R$ 10 });
remainingToMatch -= R$ 10; // Restam R$ 20

// Aposta oposta 2: R$ 15 disponível
matches.push({ bet: oposta2, amount: R$ 15 });
remainingToMatch -= R$ 15; // Restam R$ 5

// Aposta oposta 3: R$ 10 disponível
matches.push({ bet: oposta3, amount: R$ 5 }); // Casa só R$ 5
remainingToMatch -= R$ 5; // Restam R$ 0

// Status final: ACEITA (100% casada)
```

### **4. Salvar Matches**

Para cada match:
1. Cria registro em `bet_matches`
2. Atualiza `matched_amount` de ambas apostas
3. Atualiza `remaining_amount` automaticamente (via trigger)
4. Atualiza `status` baseado em porcentagem casada

---

## 💰 Cálculo de Ganhos

### **Quando Série Finaliza**

```javascript
// Para cada aposta da série
if (aposta.chosen_player_id === winner_player_id) {
    // GANHOU
    const ganho = aposta.matched_amount * 2;
    
    wallet.balance += ganho;
    aposta.status = 'ganha';
    aposta.actual_return = ganho;
    
    // Criar transação de ganho
    
} else {
    // PERDEU
    aposta.status = 'perdida';
    aposta.actual_return = 0;
}
```

### **Exemplo Completo**

```
Série 5 - Baianinho vs Ambrozio
Vencedor: Baianinho

Apostas:
1. João: R$ 20 em Baianinho (100% casada)
   → Ganha: R$ 20 x 2 = R$ 40 ✅

2. Maria: R$ 30 em Baianinho (60% casada = R$ 18)
   → Ganha: R$ 18 x 2 = R$ 36 ✅
   → R$ 12 não foram casados (reembolsado se cancelou)

3. Pedro: R$ 10 em Ambrozio (100% casada)
   → Perde: R$ 0 ❌

4. Ana: R$ 8 em Ambrozio (100% casada)
   → Perde: R$ 0 ❌
```

---

## 🚫 Cancelamento Inteligente

### **Regras**

✅ **Pode cancelar:** Valor ainda não casado (`remaining_amount`)  
❌ **Não pode cancelar:** Valor já casado (`matched_amount`)

### **Tipos de Cancelamento**

#### 1. **Cancelamento Total**
Aposta 100% pendente (matched_amount = 0)

```javascript
Aposta: R$ 20
Casado: R$ 0
Pendente: R$ 20

→ Reembolsa: R$ 20
→ Status: cancelada
```

#### 2. **Cancelamento Parcial**
Aposta parcialmente casada (matched_amount > 0)

```javascript
Aposta: R$ 20
Casado: R$ 12
Pendente: R$ 8

→ Reembolsa: R$ 8 (só o pendente)
→ Status: cancelada
→ Os R$ 12 casados permanecem válidos
```

#### 3. **Não Pode Cancelar**
Aposta totalmente casada (remaining_amount = 0)

```javascript
Aposta: R$ 20
Casado: R$ 20
Pendente: R$ 0

→ ERRO: "Aposta já foi totalmente casada"
```

---

## 📊 Endpoints da API

### **1. Criar Aposta**

```http
POST /api/bets
Authorization: Bearer TOKEN

{
  "serie_id": "uuid",
  "chosen_player_id": "uuid",
  "amount": 2000  // R$ 20,00 em centavos
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bet": {
      "id": "bet-uuid",
      "amount": 2000,
      "matched_amount": 1500,
      "remaining_amount": 500,
      "status": "parcialmente_aceita",
      "match_percentage": 75
    },
    "matching": {
      "success": true,
      "total_matches": 2,
      "matches": [
        {
          "bet_id": "bet-oposta-1",
          "user_id": "user-1",
          "amount": 1000
        },
        {
          "bet_id": "bet-oposta-2",
          "user_id": "user-2",
          "amount": 500
        }
      ],
      "message": "Aposta parcialmente casada (75%)"
    }
  }
}
```

### **2. Ver Apostas da Série**

```http
GET /api/bets/serie/:serieId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "serie": { ... },
    "stats": {
      "total_bets": 10,
      "total_amount": 15000,
      "total_matched": 12000,
      "total_remaining": 3000,
      "match_percentage": 80
    },
    "by_player": {
      "player1_id": {
        "total_bets": 5,
        "total_amount": 8000,
        "total_matched": 6500,
        "total_remaining": 1500
      },
      "player2_id": {
        "total_bets": 5,
        "total_amount": 7000,
        "total_matched": 5500,
        "total_remaining": 1500
      }
    }
  }
}
```

### **3. Ver Matches de uma Aposta**

```http
GET /api/bets/:betId/matches
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bet_id": "bet-uuid",
    "total_matches": 3,
    "total_matched": 2000,
    "matches": [
      {
        "id": "match-1",
        "matched_amount": 1000,
        "opposite_bet": {
          "id": "bet-oposta-1",
          "user_name": "João Silva",
          "amount": 1000
        },
        "created_at": "2025-11-11T10:00:00Z"
      },
      {
        "id": "match-2",
        "matched_amount": 500,
        "opposite_bet": {
          "id": "bet-oposta-2",
          "user_name": "Maria Santos",
          "amount": 1500
        },
        "created_at": "2025-11-11T10:00:05Z"
      },
      {
        "id": "match-3",
        "matched_amount": 500,
        "opposite_bet": {
          "id": "bet-oposta-3",
          "user_name": "Pedro Costa",
          "amount": 500
        },
        "created_at": "2025-11-11T10:00:10Z"
      }
    ]
  }
}
```

### **4. Cancelar Aposta**

```http
DELETE /api/bets/:betId
Authorization: Bearer TOKEN
```

**Response (Cancelamento Parcial):**

```json
{
  "success": true,
  "message": "Aposta parcialmente cancelada (parte casada mantida)",
  "data": {
    "refunded_amount": 800,
    "cancellation_type": "partial",
    "details": {
      "total_amount": 2000,
      "matched_amount": 1200,
      "refunded_amount": 800
    }
  }
}
```

---

## 🧪 Cenários de Teste

### **Cenário 1: Matching Completo**

```
1. User A aposta R$ 20 em Baianinho
   → Status: pendente (0%)
   
2. User B aposta R$ 20 em Ambrozio
   → Match automático!
   → User A: aceita (100%)
   → User B: aceita (100%)
```

### **Cenário 2: Matching Fracionado (Imagem do Usuário)**

```
1. User A aposta R$ 20 em Baianinho
   → Status: pendente

2. User B aposta R$ 10 em Ambrozio
   → Match parcial
   → User A: parcialmente_aceita (50% = R$ 10 casado)
   → User B: aceita (100%)

3. User C aposta R$ 10 em Ambrozio
   → Completa o match
   → User A: aceita (100%)
   → User C: aceita (100%)
```

### **Cenário 3: Matching Múltiplo**

```
1. User A aposta R$ 50 em Baianinho
   → pendente

2. User B aposta R$ 15 em Ambrozio
   → User A: parcialmente_aceita (30%)
   → User B: aceita

3. User C aposta R$ 10 em Ambrozio
   → User A: parcialmente_aceita (50%)
   → User C: aceita

4. User D aposta R$ 25 em Ambrozio
   → User A: aceita (100%)
   → User D: aceita (100%)

Total: User A (R$ 50) casou com 3 usuários!
```

---

## 🔧 Funções Principais

### **Backend - bets.service.js**

```javascript
// Matching principal
_performAutoMatching(newBet, serie)
  → _findOppositeBets(serieId, opponentPlayerId)
  → _performFractionalMatching(newBet, oppositeBets)
  → _processBetMatches(newBet, matches)

// Outras
createBet(userId, betData)
cancelBet(betId, userId)
getSerieBets(serieId)
getBetMatches(betId)
getUserBets(userId)
```

### **Backend - series.service.js**

```javascript
// Resolução de ganhos
resolveSerieWinners(serieId, winnerPlayerId)
```

---

## 📈 Benefícios

### **Para Usuários**

✅ Maior chance de ter apostas aceitas  
✅ Não precisa esperar alguém com valor exato  
✅ Cancelamento inteligente (só valor não casado)  
✅ Transparência total (vê com quem casou)

### **Para Plataforma**

✅ Maior liquidez  
✅ Menos apostas pendentes  
✅ Melhor experiência do usuário  
✅ Sistema justo (FIFO)

---

## 🚀 Implementação

### **Migration**

```bash
# Aplicar migration
psql -U postgres -d sinucabet -f backend/supabase/migrations/1039_fractional_matching_system.sql
```

### **Verificar Funcionamento**

```sql
-- Ver matches de uma série
SELECT * FROM debug_serie_matching('serie-uuid');

-- Ver status das apostas
SELECT 
    id,
    amount / 100.0 as valor_total,
    matched_amount / 100.0 as valor_casado,
    remaining_amount / 100.0 as valor_pendente,
    ROUND((matched_amount::DECIMAL / amount) * 100, 2) as percentual,
    status
FROM bets
WHERE serie_id = 'serie-uuid';

-- Ver matches criados
SELECT 
    bm.id,
    bm.matched_amount / 100.0 as valor_match,
    u1.name as user_a,
    u2.name as user_b
FROM bet_matches bm
JOIN bets ba ON bm.bet_a_id = ba.id
JOIN bets bb ON bm.bet_b_id = bb.id
JOIN users u1 ON ba.user_id = u1.id
JOIN users u2 ON bb.user_id = u2.id
WHERE bm.serie_id = 'serie-uuid';
```

---

## 📚 Recursos Adicionais

- [Documentação da API de Apostas](./BETS_API.md)
- [Schema do Banco de Dados](../../database/schema.sql)
- [Migration de Matching Fracionado](../supabase/migrations/1039_fractional_matching_system.sql)

---

**Última Atualização:** 11/11/2025  
**Versão:** 2.0.0  
**Status:** ✅ Implementado e Funcional

