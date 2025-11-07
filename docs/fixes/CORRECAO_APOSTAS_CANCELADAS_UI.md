# 🔧 Correção: Ocultar Apostas Canceladas da Visualização

**Data**: 07/11/2025  
**Problema**: Apostas canceladas apareciam na lista em vez de sumirem  
**Status**: ✅ CORRIGIDO

---

## 📋 Descrição do Problema

Quando um usuário cancelava uma aposta, ela continuava aparecendo na lista de apostas da partida, apenas mudando o status para "CANCELADA" em vez de desaparecer.

### Comportamento Anterior (Incorreto)

```
Apostas no Baianinho:
  ⏳ Aposta #1 - R$ 110,00 - Aguardando
  ⏳ Aposta #2 - R$ 10,00 - Aguardando
  🚫 Aposta #3 - R$ 10,00 - CANCELADA ❌ ← Aparecia aqui
```

### Comportamento Esperado (Correto)

```
Apostas no Baianinho:
  ⏳ Aposta #1 - R$ 110,00 - Aguardando
  ⏳ Aposta #2 - R$ 10,00 - Aguardando
  (Aposta cancelada desaparece da lista) ✅
```

---

## 🔍 Causa do Problema

O código do frontend não estava filtrando apostas canceladas ou reembolsadas ao renderizar a lista. Todas as apostas eram exibidas, independentemente do status.

```javascript
// ANTES (sem filtro)
Object.values(betsData.by_player)
  .filter(p => p.player.id === match.player1.id)
  .flatMap(p => p.bets)
  .map((bet, index) => ( // ❌ Mostrava TODAS as apostas
    <BetItem bet={bet} />
  ))
```

---

## ✅ Solução Implementada

### 1. Filtrar Apostas Canceladas/Reembolsadas

Adicionado filtro para remover apostas com status `'cancelada'` ou `'reembolsada'`:

```javascript
// DEPOIS (com filtro)
Object.values(betsData.by_player)
  .filter(p => p.player.id === match.player1.id)
  .flatMap(p => p.bets)
  .filter(bet => bet.status !== 'cancelada' && bet.status !== 'reembolsada') // ✅ Oculta canceladas
  .map((bet, index) => (
    <BetItem bet={bet} />
  ))
```

### 2. Atualizar Condição de Exibição

A condição que verifica se existem apostas para mostrar também foi atualizada:

```javascript
// ANTES
betsData.by_player.some(p => 
  p.player.id === match.player1.id && 
  p.bets.length > 0 // ❌ Contava apostas canceladas
)

// DEPOIS
betsData.by_player.some(p => 
  p.player.id === match.player1.id && 
  p.bets.some(bet => bet.status !== 'cancelada' && bet.status !== 'reembolsada') // ✅ Ignora canceladas
)
```

### 3. Mensagem "Nenhuma aposta ainda"

Agora, se todas as apostas forem canceladas, a interface mostra corretamente:

```
💤 Nenhuma aposta ainda
```

Em vez de mostrar uma lista vazia.

---

## 🎯 Estados de Aposta Ocultados

Os seguintes status são **filtrados** (não aparecem):
- ✅ `'cancelada'` - Aposta cancelada pelo usuário
- ✅ `'reembolsada'` - Aposta reembolsada automaticamente (série cancelada/finalizada sem casar)

Os seguintes status são **mostrados**:
- ✅ `'pendente'` - Aguardando emparceiramento
- ✅ `'aceita'` - Aposta casada
- ✅ `'ganha'` - Aposta vencedora
- ✅ `'perdida'` - Aposta perdedora

---

## 📊 Fluxo Completo

### Cenário 1: Cancelar Aposta Única

```
1. Usuário tem 1 aposta de R$ 10 (pendente)
   → Lista mostra: ⏳ Aposta #1 - R$ 10,00

2. Usuário clica em "Cancelar Aposta"
   → Backend muda status para 'cancelada'
   → Saldo reembolsado: +R$ 10,00

3. Frontend atualiza (polling ou refresh)
   → Aposta é filtrada e desaparece
   → Lista mostra: 💤 Nenhuma aposta ainda
```

### Cenário 2: Cancelar Uma de Múltiplas Apostas

```
1. Usuário tem 3 apostas
   → ⏳ Aposta #1 - R$ 100
   → ⏳ Aposta #2 - R$ 50
   → ⏳ Aposta #3 - R$ 10

2. Usuário cancela Aposta #2
   → Backend: status = 'cancelada'
   → Saldo: +R$ 50,00

3. Frontend atualiza
   → ⏳ Aposta #1 - R$ 100
   → ⏳ Aposta #2 - R$ 10 (renumerada)
   → (Aposta cancelada desapareceu)
```

### Cenário 3: Série Finaliza Sem Casar

```
1. Usuário tem aposta pendente
   → ⏳ Aposta #1 - R$ 10

2. Admin finaliza série sem emparceiramentos
   → Trigger automático: status = 'reembolsada'
   → Saldo: +R$ 10,00

3. Frontend atualiza
   → Lista mostra: 💤 Nenhuma aposta ainda
   → (Aposta reembolsada desapareceu)
```

---

## 🧪 Como Testar

### Teste 1: Cancelar Aposta

1. Faça uma aposta em uma série liberada
2. Verifique que a aposta aparece na lista
3. Clique em "🚫 Cancelar Aposta"
4. Confirme o cancelamento
5. ✅ **Resultado esperado**: Aposta desaparece da lista

### Teste 2: Cancelar Todas as Apostas

1. Faça 2-3 apostas
2. Cancele todas uma por uma
3. ✅ **Resultado esperado**: Ao cancelar a última, aparece "💤 Nenhuma aposta ainda"

### Teste 3: Recarregar Página

1. Faça uma aposta e cancele
2. Recarregue a página (F5)
3. ✅ **Resultado esperado**: Aposta cancelada não aparece após recarregar

---

## 📝 Arquivos Modificados

### Frontend
- ✅ `frontend/pages/partidas/[id].js`
  - Linha ~782: Adicionado filtro para Player 1
  - Linha ~857: Adicionado filtro para Player 2
  - Linha ~778-781: Atualizada condição de exibição para Player 1
  - Linha ~850-853: Atualizada condição de exibição para Player 2

---

## 🎨 Benefícios da Correção

1. **UI mais limpa** - Remove poluição visual de apostas inativas
2. **Foco no relevante** - Usuário vê apenas apostas ativas
3. **Melhor UX** - Ação de cancelar tem feedback visual imediato
4. **Consistência** - Comportamento alinhado com expectativa do usuário
5. **Performance** - Menos elementos renderizados

---

## 💡 Considerações Futuras

### Opção: Seção de Histórico

Para usuários que queiram ver apostas canceladas, podemos adicionar:

```javascript
// Accordion colapsável "Apostas Canceladas"
<details className="mt-4">
  <summary className="cursor-pointer text-sm text-gray-500">
    Ver apostas canceladas (2)
  </summary>
  <div className="mt-2 space-y-2 opacity-50">
    {cancelledBets.map(bet => (
      <BetItem bet={bet} />
    ))}
  </div>
</details>
```

### Opção: Página de Histórico

Criar página `/apostas/historico` com todas as apostas, incluindo canceladas, com filtros.

---

## 🎱 SinucaBet - UI Limpa e Intuitiva

**Correção aplicada em:** 07/11/2025  
**Status:** ✅ PRONTO PARA PRODUÇÃO

