# 🔧 Correção: Placar nos Detalhes do Jogo

## 📋 Problema Identificado

No painel de parceiros, ao atualizar o placar da série em andamento:
- ✅ O **LiveScoreManager** (componente de atualização) mostrava o placar correto (ex: 1-1)
- ❌ Os **detalhes do jogo** no topo da página mostravam 0-0
- ✅ Ao salvar, o placar era persistido corretamente no banco
- ❌ Mas a seção de detalhes continuava mostrando 0-0

---

## 🔍 Causa Raiz

A seção de "detalhes do jogo" (cards com JOGADOR 1 e JOGADOR 2) estava exibindo:
- ❌ `match.player1_score` e `match.player2_score` (placar da PARTIDA)

Mas o LiveScoreManager atualiza:
- ✅ `serie.player1_score` e `serie.player2_score` (placar da SÉRIE)

### Por que isso é diferente?

No sistema SinucaBet:
- **Partida** (match) = o jogo completo, com múltiplas séries
- **Série** = uma rodada/set individual dentro da partida

O placar é atualizado **por série**, não pela partida inteira. Cada série tem seu próprio placar.

---

## ✅ Solução Implementada

### Mudanças no arquivo:
`frontend/pages/parceiros/jogos/[id].js`

### 1. Criar variável para série atual:
```javascript
// Buscar série em andamento para exibir o placar atual
const currentSerie = series.find(s => s.status === 'em_andamento') || series[series.length - 1];
```

### 2. Substituir placar da partida por placar da série:

**ANTES:**
```javascript
<p className="text-5xl font-bold text-[#27E502] mt-4">
  {match.player1_score || 0}  // ❌ Placar da partida (sempre 0)
</p>
```

**DEPOIS:**
```javascript
<p className="text-5xl font-bold text-[#27E502] mt-4">
  {currentSerie.player1_score || 0}  // ✅ Placar da série atual
</p>
```

Mesma correção aplicada para `player2_score`.

---

## 🎯 Resultado

Agora quando você atualiza o placar:

### Antes da correção:
```
Detalhes do Jogo (topo):
  Jogador 1: 0  ❌ (errado)
  Jogador 2: 0  ❌ (errado)

LiveScoreManager:
  Jogador 1: 1  ✅ (correto)
  Jogador 2: 1  ✅ (correto)
```

### Depois da correção:
```
Detalhes do Jogo (topo):
  Jogador 1: 1  ✅ (correto)
  Jogador 2: 1  ✅ (correto)

LiveScoreManager:
  Jogador 1: 1  ✅ (correto)
  Jogador 2: 1  ✅ (correto)
```

---

## 🧪 Como Testar

1. **Acesse:** `/parceiros/jogos/{id}` (com série em andamento)
2. **Veja os detalhes no topo:** Deve mostrar o placar atual (ex: 1-1)
3. **Clique em `+` no LiveScoreManager** para mudar para 2-1
4. **Clique em "Salvar Placar"**
5. **Veja os detalhes no topo:** Deve mudar para 2-1 ✅
6. **Navegue para o dashboard e volte**
7. **Veja os detalhes:** Deve continuar mostrando 2-1 ✅

---

## 📦 Commit

```
fix: exibir placar da série atual nos detalhes do jogo (parceiros)

- Criar variável currentSerie para buscar série em andamento
- Trocar match.player1_score por currentSerie.player1_score
- Trocar match.player2_score por currentSerie.player2_score
- Agora os detalhes mostram o placar DA SÉRIE, não da partida geral
- Consistente com LiveScoreManager que atualiza placar da série

ANTES: Detalhes mostravam 0-0 (placar da partida)
DEPOIS: Detalhes mostram 1-1 (placar da série em andamento)
```

**Commit hash:** `9b89cc4b`

---

## 💡 Conceitos Importantes

### Estrutura de Dados:

```
Partida (Match)
├── player1_score: 0     ← Placar geral da partida (soma de todas as séries)
├── player2_score: 0
└── Séries []
    ├── Série 1
    │   ├── player1_score: 3  ← Placar específico da série 1
    │   └── player2_score: 2
    ├── Série 2 (em andamento)
    │   ├── player1_score: 1  ← Placar que está sendo atualizado AGORA
    │   └── player2_score: 1
    └── Série 3 (pendente)
        ├── player1_score: 0
        └── player2_score: 0
```

**O LiveScoreManager atualiza o placar da SÉRIE ATUAL**, não da partida inteira.

---

## ✅ Problema Resolvido!

Agora tanto o LiveScoreManager quanto a seção de detalhes mostram e atualizam o placar da **série em andamento** corretamente! 🎉

**Data da correção:** 10/11/2025

