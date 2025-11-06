# Ordenação e Limitação de Apostas - "Minhas Apostas"

## Data: 05/11/2025

### Requisitos Implementados

#### 1. **Ordenação por Prioridade de Status**

As apostas na seção "Minhas Apostas" da página Home são ordenadas conforme a seguinte prioridade:

| Prioridade | Status | Cor |
|------------|--------|-----|
| **1º** | Casadas (aceita/matched) | 🔵 Azul |
| **2º** | Ganhas (ganha/won) | 🟢 Verde |
| **3º** | Pendentes (pendente/pending) | 🟡 Amarelo |
| **4º** | Perdas (perdida/lost) | 🔴 Vermelho |
| **5º** | Canceladas (cancelada/cancelled) | 🔴 Vermelho |

#### 2. **Ordenação Secundária por Data**

Dentro da mesma prioridade, as apostas são ordenadas por data de criação, mostrando **as mais recentes primeiro**.

#### 3. **Limitação de Exibição**

Apenas as **5 primeiras apostas** (após ordenação) são exibidas na seção "Minhas Apostas" da página Home.

---

### Implementação Técnica

**Arquivo:** `frontend/pages/home.js`

#### Código de Ordenação

```javascript
// Ordenar apostas por prioridade: Casadas → Ganhas → Pendentes → Perdas
const sortedUserBets = [...userBets].sort((a, b) => {
  const priorityOrder = {
    'aceita': 1,
    'matched': 1,
    'ganha': 2,
    'won': 2,
    'pendente': 3,
    'pending': 3,
    'perdida': 4,
    'lost': 4,
    'cancelada': 5,
    'cancelled': 5
  };
  
  const priorityA = priorityOrder[a.status] || 999;
  const priorityB = priorityOrder[b.status] || 999;
  
  // Se mesma prioridade, ordenar por data (mais recentes primeiro)
  if (priorityA === priorityB) {
    return new Date(b.placed_at) - new Date(a.placed_at);
  }
  
  return priorityA - priorityB;
});
```

#### Aplicação da Ordenação

```javascript
// Exibir apenas as 5 primeiras apostas ordenadas
{sortedUserBets.length > 0 ? (
  <div className="space-y-4">
    {sortedUserBets.slice(0, 5).map((bet) => (
      // ... renderização do card de aposta
    ))}
  </div>
) : (
  // ... mensagem de sem apostas
)}
```

---

### Exemplo de Ordenação

**Cenário:** Usuário tem 7 apostas com os seguintes status:
1. Pendente (mais antiga)
2. Pendente
3. Ganha
4. Pendente
5. Perdida
6. Pendente (mais recente)
7. Casada

**Após ordenação (5 primeiras exibidas):**
1. ✓ **Casada** (Prioridade 1)
2. ✓ **Ganha** (Prioridade 2)
3. ⏳ **Pendente** (mais recente) - Prioridade 3
4. ⏳ **Pendente** (2ª mais recente) - Prioridade 3
5. ⏳ **Pendente** (3ª mais recente) - Prioridade 3

*As apostas "Perdida" e "Pendente (mais antiga)" não são exibidas por estarem além do limite de 5.*

---

### Benefícios da Implementação

1. **Priorização Visual:** Usuários veem primeiro as apostas mais importantes (casadas e ganhas)
2. **Redução de Clutter:** Apenas 5 apostas evitam sobrecarga visual
3. **Informação Relevante:** Apostas mais recentes de cada categoria são priorizadas
4. **Consistência:** Ordem lógica e intuitiva para o usuário

---

### Testes Realizados

✅ **Ordenação por Status:** Funcionando conforme esperado
✅ **Ordenação por Data:** Mais recentes primeiro dentro da mesma prioridade
✅ **Limite de 5 Apostas:** Apenas as 5 primeiras são exibidas
✅ **Fallback para Status Desconhecidos:** Status não mapeados vão para o final (prioridade 999)

---

### Arquivos Modificados

- **`frontend/pages/home.js`**
  - Adicionada função de ordenação `sortedUserBets`
  - Aplicada limitação `.slice(0, 5)`
  - Atualizado contador para usar `sortedUserBets.length`

---

### Status Final

🎉 **Ordenação e limitação implementadas com sucesso!**

- ✅ Prioridade: Casadas → Ganhas → Pendentes → Perdas
- ✅ Ordenação secundária por data (mais recentes primeiro)
- ✅ Limitação de 5 apostas exibidas
- ✅ Interface limpa e organizada



