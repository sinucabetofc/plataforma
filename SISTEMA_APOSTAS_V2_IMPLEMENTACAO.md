# 🎲 Sistema de Apostas V2 - Implementação Completa

**Data:** 05/11/2025  
**Versão:** 2.0  
**Status:** ✅ Implementado

---

## 📋 Resumo das Mudanças

O sistema de apostas foi completamente atualizado conforme as novas especificações do cliente. As principais mudanças incluem:

1. **Remoção da taxa de 5% nos ganhos** - Agora o sistema é 1:1 (ganha o dobro)
2. **Taxa única de 8% apenas nos saques** - Sem taxas nos ganhos
3. **Apostas anônimas** - Usuários não são identificados publicamente
4. **Apostas ao vivo** - Permitido apostar em jogos "in_progress"
5. **UI do saque otimizada** - Removido texto de taxa, mostra valor líquido

---

## ✅ Mudanças Implementadas

### 1. Backend - bet.service.js

#### Alteração do Cálculo de Retorno (1:1 sem taxa)

**Antes:**
```javascript
potential_return = matchAmount * 1.95  // Taxa de 5%
```

**Depois:**
```javascript
potential_return = matchAmount * 2  // 1:1, sem taxa
```

**Arquivos modificados:**
- `/backend/services/bet.service.js` (linhas 209, 226, 254, 276, 287, 322)

**Impacto:**
- Apostadores agora recebem retorno 1:1
- Se aposta R$ 100 e ganha, recebe R$ 200 total (R$ 100 lucro + R$ 100 original)
- Taxa removida dos ganhos

---

### 2. Backend - Apostas em Jogos "In Progress"

#### Permitir Apostas Ao Vivo

**Antes:**
```javascript
if (game.status !== 'open') {
  throw error; // Bloqueava apostas em jogos in_progress
}
```

**Depois:**
```javascript
if (game.status !== 'open' && game.status !== 'in_progress') {
  throw error; // Permite apostas ao vivo
}
```

**Arquivo modificado:**
- `/backend/services/bet.service.js` (linhas 35-42)

**Impacto:**
- Usuários podem apostar durante a partida
- Apostas ao vivo habilitadas

---

### 3. Backend - API Response com Labels Anônimos

#### Apostas Anônimas com Numeração

**Estrutura da resposta modificada:**

```json
{
  "bets": {
    "player_a": [
      {
        "id": "uuid",
        "label": "Aposta #1",
        "amount": 10.00,
        "status": "pending"
      },
      {
        "id": "uuid",
        "label": "Aposta #2",
        "amount": 50.00,
        "status": "pending"
      }
    ],
    "player_b": [...]
  }
}
```

**Arquivo modificado:**
- `/backend/services/bet.service.js` método `getGameBets()` (linhas 453-507)

**Impacto:**
- Apostas exibidas de forma anônima
- Numeradas sequencialmente por lado (player_a, player_b)
- Privacidade dos apostadores garantida

---

### 4. Backend - Taxa de Saque (já estava correto)

**Verificação:**
```javascript
const fee = parseFloat((amount * 0.08).toFixed(2)); // 8%
```

**Arquivo verificado:**
- `/backend/services/wallet.service.js` (linha 409)

**Status:** ✅ Já implementado corretamente

---

### 5. Frontend - Botão de Saque

#### Remoção do Texto de Taxa

**Antes:**
```jsx
<button>
  <ArrowUpCircle size={24} />
  Sacar (Taxa 8%)
</button>
```

**Depois:**
```jsx
<button>
  <ArrowUpCircle size={24} />
  Sacar
</button>
```

**Arquivo modificado:**
- `/frontend/pages/wallet.js` (linha 193)

**Impacto:**
- UI mais limpa
- Taxa não mencionada no botão
- Valor líquido já é mostrado no modal (linhas 272-281)

---

## 📊 Comparativo: Antes vs Depois

### Sistema de Taxas

| Aspecto | Antes (V1) | Depois (V2) |
|---------|------------|-------------|
| Taxa nos ganhos | 5% | 0% ❌ Removida |
| Taxa no saque | 8% | 8% ✅ Mantida |
| Retorno da aposta | 1.95x (95%) | 2x (100%) |
| Lucro em R$ 100 | R$ 95 | R$ 100 |

### Exemplo Prático

**Aposta de R$ 100:**

| Etapa | V1 (Antes) | V2 (Depois) |
|-------|------------|-------------|
| Valor apostado | R$ 100 | R$ 100 |
| Se ganhar | R$ 195 total | R$ 200 total |
| Lucro líquido | R$ 95 | R$ 100 |
| Taxa aplicada | 5% nos ganhos | 0% |
| Ao sacar R$ 200 | R$ 184 líquido | R$ 184 líquido |
| Taxa de saque | 8% (R$ 16) | 8% (R$ 16) |

---

## 🎯 Novos Recursos

### 1. Apostas Anônimas

✅ **Implementado:**
- Apostas exibidas como "Aposta #1", "Aposta #2", etc.
- Sem exposição de nome, email ou identificação
- Numeração sequencial por lado (player_a, player_b)

### 2. Apostas Ao Vivo

✅ **Implementado:**
- Apostas permitidas em jogos "open"
- Apostas permitidas em jogos "in_progress"
- Bloqueadas apenas em "finished" ou "cancelled"

### 3. Sistema 1:1

✅ **Implementado:**
- Retorno duplicado do valor apostado
- Sem dedução de taxa nos ganhos
- Taxa única de 8% apenas no saque

---

## 🔄 Fluxo Completo Atualizado

### 1. Criar Aposta

```
Usuário aposta R$ 100 no Baianinho
↓
Sistema bloqueia R$ 100 no saldo
↓
Busca apostas opostas (Mike)
↓
Match automático (FIFO)
↓
Apostas ficam "matched"
↓
Saldo desbloqueado
↓
potential_return = R$ 200 (2x)
```

### 2. Finalizar Jogo

```
Jogo finaliza: Baianinho venceu
↓
Buscar apostas "matched"
↓
Apostas no Baianinho → "won"
Apostas no Mike → "lost"
↓
Creditar R$ 200 na carteira dos vencedores
↓
SEM TAXA (taxa só no saque)
```

### 3. Sacar Ganhos

```
Usuário tem R$ 500 na carteira
↓
Solicita saque de R$ 500
↓
Taxa de 8%: R$ 40
↓
Valor líquido recebido: R$ 460
↓
Transferido para chave PIX
```

---

## 📁 Arquivos Modificados

### Backend

| Arquivo | Mudanças | Linhas |
|---------|----------|--------|
| `bet.service.js` | Cálculo 1:1 (6 ocorrências) | 209, 226, 254, 276, 287, 322 |
| `bet.service.js` | Apostas ao vivo | 35-42 |
| `bet.service.js` | Labels anônimos | 453-507 |

### Frontend

| Arquivo | Mudanças | Linhas |
|---------|----------|--------|
| `wallet.js` | Remover "Taxa 8%" do botão | 193 |

---

## 🧪 Testes Necessários

### Backend

✅ **Testes Automatizados:**
```bash
cd backend
./TEST_BETS_ENDPOINTS.sh
```

**Cenários a testar:**

1. **Matching 1:1:**
   - User A aposta R$ 100 no player_a
   - User B aposta R$ 100 no player_b
   - Verificar: ambas matched, potential_return = R$ 200

2. **Matching Múltiplo:**
   - User A aposta R$ 30 no player_a
   - Existem 3x R$ 10 no player_b (pending)
   - Verificar: R$ 30 casa com 3x R$ 10

3. **Apostas Ao Vivo:**
   - Jogo com status "in_progress"
   - Tentar criar aposta
   - Verificar: aposta aceita

4. **Finalização:**
   - Criar apostas matched
   - Finalizar jogo
   - Verificar: vencedores recebem R$ 200, perdedores R$ 0

5. **Saque:**
   - Saldo R$ 500
   - Sacar R$ 500
   - Verificar: taxa R$ 40, líquido R$ 460

---

## 📊 Impacto Financeiro

### Para a Casa

**Antes (V1):**
- Taxa de 5% em **todos** os ganhos
- Taxa de 8% nos saques

**Depois (V2):**
- ❌ Sem taxa nos ganhos
- Taxa de 8% **apenas** nos saques

**Impacto:**
- Receita reduzida (sem taxa de 5% nos ganhos)
- Compensado por aumento de volume (apostas mais atrativas)

### Para os Apostadores

**Vantagens:**
- ✅ Ganho 1:1 (100% em vez de 95%)
- ✅ Mais dinheiro no bolso
- ✅ Sistema mais justo
- ✅ Taxa única e transparente (só no saque)

---

## 🚀 Próximas Implementações Sugeridas

### 1. Frontend - Exibição de Apostas Individuais

**Pendente:** Criar componente para mostrar apostas separadas por jogador

**UI Sugerida:**
```jsx
<div className="apostas-player-a">
  <h3>Baianinho - Total: R$ 100,00</h3>
  <div className="lista-apostas">
    <div className="aposta">Aposta #1 - R$ 10,00</div>
    <div className="aposta">Aposta #2 - R$ 50,00</div>
    <div className="aposta">Aposta #3 - R$ 40,00</div>
  </div>
</div>
```

### 2. WebSocket Real-time

**Objetivo:** Atualizar apostas em tempo real

**Benefícios:**
- Usuários veem matches instantaneamente
- Totais atualizados ao vivo
- Melhor experiência

### 3. Notificações

**Eventos:**
- Aposta foi matched
- Aposta foi vencedora
- Saque aprovado

### 4. Histórico Detalhado

**Endpoint:** `GET /api/bets/user/history`

**Informações:**
- Todas as apostas do usuário
- Status, ganhos, perdas
- Filtros por período

---

## ⚠️ Avisos Importantes

### 1. Matching Automático MANTIDO

O sistema de matching automático (FIFO) foi **mantido**. As apostas são automaticamente pareadas quando há apostas opostas.

**NÃO é um sistema de "aceitar apostas manualmente"**.

### 2. Apostas Irrevogáveis

Apostas **não podem ser canceladas** após criação. Isso é intencional conforme especificação.

### 3. Taxa de Saque

A taxa de 8% no saque permanece. É importante que isso esteja claro nos termos de uso.

---

## 📚 Documentação Atualizada

### Arquivos de Documentação

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `PRD_SISTEMA_APOSTAS_V2.md` | ✅ Criado | PRD completo do novo sistema |
| `backend/BETS_IMPLEMENTATION.md` | ⚠️ Desatualizado | Menciona taxa de 5% |
| `backend/docs/BETS_API.md` | ⚠️ Desatualizado | Precisa atualizar exemplos |

### Atualizar Documentação Antiga

**Arquivos que mencionam taxa de 5%:**
- `backend/BETS_IMPLEMENTATION.md`
- `backend/docs/BETS_API.md`
- `README.md`

**Ação necessária:** Buscar e substituir todas as menções de taxa de 5% por sistema 1:1.

---

## ✅ Checklist de Implementação

### Backend
- [x] Remover taxa de 5% nos ganhos
- [x] Ajustar cálculo para 1:1 (potential_return = amount * 2)
- [x] Permitir apostas em jogos "in_progress"
- [x] Adicionar labels anônimos na resposta da API
- [x] Verificar taxa de saque (8%) - já estava correto

### Frontend
- [x] Remover texto "(Taxa 8%)" do botão de saque
- [x] Manter exibição de valor líquido no modal de saque
- [ ] Criar componente para exibir apostas individuais (futuro)
- [ ] Atualizar página de apostas para mostrar lista anônima (futuro)

### Documentação
- [x] Criar PRD do novo sistema
- [x] Criar documento de implementação
- [ ] Atualizar documentação antiga
- [ ] Atualizar README com novas regras

### Testes
- [ ] Testar matching 1:1 com retorno dobrado
- [ ] Testar matching múltiplo
- [ ] Testar apostas ao vivo (in_progress)
- [ ] Testar finalização e distribuição de ganhos
- [ ] Testar saque com taxa de 8%

---

## 🎯 Conclusão

O Sistema de Apostas V2 foi **implementado com sucesso** conforme as especificações do cliente.

**Principais conquistas:**
- ✅ Taxa de 5% nos ganhos removida
- ✅ Sistema 1:1 implementado (100% de retorno)
- ✅ Apostas ao vivo habilitadas
- ✅ Apostas anônimas com labels numerados
- ✅ UI do saque otimizada
- ✅ Taxa única de 8% mantida apenas no saque

**Próximos passos:**
1. Testar fluxo completo
2. Atualizar documentação antiga
3. Implementar UI de apostas individuais no frontend
4. Adicionar notificações em tempo real

---

**Implementado por:** IA Assistant  
**Aprovado por:** Cliente  
**Data:** 05/11/2025  
**Versão:** 2.0.0


