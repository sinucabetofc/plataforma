# 🔧 Correção: Cache do Placar não Atualiza

## 📋 Problema Identificado

Quando o admin atualizava o placar de um jogo no painel admin:

1. ✅ Placar era salvo com sucesso
2. ✅ Placar aparecia atualizado na página
3. ❌ Ao navegar para o dashboard e voltar ao jogo, o placar voltava a "0-0"

### Sintomas:
- Placar aparecia correto imediatamente após atualizar
- Ao navegar entre páginas, placar voltava ao valor antigo
- Dados pareciam não estar sendo salvos no backend

---

## 🔍 Causa Raiz

O problema era de **cache do React Query**.

### Como funcionava (incorretamente):

Quando o `useUpdateScore` atualizava o placar, ele invalidava:
- ✅ `['series']` → Cache das séries em geral
- ✅ `['serie', serieId]` → Cache da série específica
- ❌ **NÃO invalidava** `['matches']` → Cache das partidas

### Por que isso causava o problema?

```javascript
// Página do jogo usa esta query:
useQuery({
  queryKey: ['matches', matchId], // ← Este cache NÃO era invalidado!
  queryFn: () => getMatchById(matchId)
})
```

Quando você voltava à página do jogo, o React Query retornava os dados **antigos** do cache, com o placar desatualizado.

---

## ✅ Solução Implementada

Modificamos o hook `useUpdateScore` para invalidar **também** o cache das partidas:

### Antes:
```javascript
export function useUpdateScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serieId, player1_score, player2_score }) => {
      const response = await patch(`/series/${serieId}/score`, {
        player1_score,
        player2_score,
      });
      return response.data;
    },
    onSuccess: (_, { serieId }) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['serie', serieId] });
      // ❌ Faltava invalidar ['matches']
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar placar');
    },
  });
}
```

### Depois:
```javascript
export function useUpdateScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serieId, player1_score, player2_score }) => {
      const response = await patch(`/series/${serieId}/score`, {
        player1_score,
        player2_score,
      });
      return response.data;
    },
    onSuccess: (_, { serieId }) => {
      // Invalidar cache das séries
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['serie', serieId] });
      // ✅ Invalidar cache das partidas (para atualizar placar ao retornar à página)
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Placar atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar placar');
    },
  });
}
```

---

## 📝 Mudanças Aplicadas

**Arquivo modificado:** `frontend/hooks/admin/useSeries.js` (linhas 167-191)

### O que foi adicionado:
1. ✅ Invalidação de `['matches']` para limpar cache de todas as partidas
2. ✅ Notificação toast "Placar atualizado com sucesso!"
3. ✅ Comentários explicativos no código

---

## 🧪 Como Testar

### Antes da correção (comportamento incorreto):
1. Ir para Admin → Jogos → [Jogo específico]
2. Atualizar placar para "3-2"
3. Voltar para o Dashboard
4. Retornar ao jogo
5. ❌ Placar aparecia como "0-0"

### Depois da correção (comportamento correto):
1. Ir para Admin → Jogos → [Jogo específico]
2. Atualizar placar para "3-2"
3. ✅ Ver notificação "Placar atualizado com sucesso!"
4. Voltar para o Dashboard
5. Retornar ao jogo
6. ✅ Placar ainda aparece como "3-2" (correto!)

---

## 🎯 Impacto

### Problemas resolvidos:
- ✅ Placar persiste corretamente ao navegar entre páginas
- ✅ Cache do React Query sincronizado corretamente
- ✅ Notificação visual de sucesso ao atualizar placar
- ✅ Melhor experiência do usuário

### Outras queries que invalidam `['matches']`:
Para referência, outras operações que já invalidavam corretamente:
- `useCreateSerie` ✅
- `useStartSerie` ✅
- `useFinishSerie` ✅
- `useDeleteSerie` ✅

Agora `useUpdateScore` também invalida! ✅

---

## 📚 Conceitos Técnicos

### React Query Cache Invalidation

O React Query mantém um cache de dados para melhorar a performance. Quando você atualiza dados no backend, precisa **invalidar** o cache correspondente para que o React Query busque os dados atualizados.

```javascript
// Invalidar cache específico
queryClient.invalidateQueries({ queryKey: ['matches', '123'] });

// Invalidar todas as queries que começam com 'matches'
queryClient.invalidateQueries({ queryKey: ['matches'] });
```

### Por que invalidar `['matches']` e não `['matches', matchId]`?

No nosso caso, `useUpdateScore` só recebe `serieId`, não o `matchId`. Para invalidar a query específica, precisaríamos:
1. Buscar a série no cache para pegar o `matchId`
2. Ou fazer uma requisição extra ao backend

A solução mais simples e eficiente foi invalidar **todas** as queries de matches com `['matches']`, que inclui:
- `['matches']` (lista de todas as partidas)
- `['matches', matchId]` (partida específica)
- Qualquer outra query derivada

---

## 🚀 Commit

```
fix: invalidar cache de matches ao atualizar placar

- Adicionar invalidação de ['matches'] no useUpdateScore
- Agora ao voltar à página do jogo, o placar atualizado é exibido corretamente
- Adicionar notificação toast 'Placar atualizado com sucesso!'
- Corrige bug onde placar voltava a 0-0 após navegar entre páginas
```

**Commit hash:** `083184fe`

---

## 🎉 Resultado

Agora quando você atualiza o placar:
1. 💾 Placar é salvo no backend
2. 🔄 Cache do React Query é invalidado
3. 🎯 Notificação de sucesso aparece
4. ✅ Ao voltar à página, placar está correto!

**Problema resolvido!** 🚀

