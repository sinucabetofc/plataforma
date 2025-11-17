# Cores dos Status das Apostas

## Data: 05/11/2025

### Status Implementados e Suas Cores

#### 1. **"Ganhou" / "ganha" - ✅ VERDE**
- **Cor:** `bg-green-500/20 text-green-400 border-green-400/50`
- **Ícone:** 🏆 Trophy
- **Texto:** "Ganhou"
- **Quando aparece:** Quando o usuário venceu a aposta

#### 2. **"Pendente" / "pendente" - ⏳ AMARELO**
- **Cor:** `bg-yellow-500/20 text-yellow-400 border-yellow-400/50`
- **Ícone:** 🕐 Clock
- **Texto:** "Pendente"
- **Quando aparece:** Aposta ainda não foi aceita/casada com outra aposta oposta

#### 3. **"Perdeu" / "perdida" - ❌ VERMELHO**
- **Cor:** `bg-red-500/20 text-red-400 border-red-400/50`
- **Ícone:** ❌ XCircle
- **Texto:** "Perdeu"
- **Quando aparece:** Quando o usuário perdeu a aposta

#### 4. **"Cancelado" / "cancelada" - ❌ VERMELHO**
- **Cor:** `bg-red-500/20 text-red-400 border-red-400/50`
- **Ícone:** ❌ XCircle
- **Texto:** "Cancelado"
- **Quando aparece:** Quando a aposta foi cancelada

#### 5. **"Casada" / "aceita" / "matched" - 🔵 AZUL**
- **Cor:** `bg-blue-500/20 text-blue-400 border-blue-400/50`
- **Ícone:** ✓ CheckCircle
- **Texto:** "Casada"
- **Quando aparece:** Aposta foi aceita/casada com aposta oposta e está ativa

---

### Status da Série (Complementar)

#### 1. **"Liberada" - 🟢 VERDE**
- **Cor:** `text-verde-claro`
- **Ícone:** 🟢
- **Quando aparece:** Série está aberta para apostas

#### 2. **"Em Andamento" - 🟡 AMARELO**
- **Cor:** `text-yellow-400`
- **Ícone:** 🟡
- **Quando aparece:** Série está em progresso

#### 3. **"Encerrada" - 🔴 VERMELHO**
- **Cor:** `text-red-400`
- **Ícone:** 🔴
- **Quando aparece:** Série foi finalizada

---

### Arquivo Modificado

- **`frontend/pages/apostas.js`**
  - Função `getStatusBadge()` atualizada com todas as cores corretas
  - Filtros de status atualizados para usar status em português
  - Suporte para status em inglês como fallback

### Código de Referência

```javascript
const getStatusBadge = (status) => {
  switch (status) {
    // Status em português (do banco de dados)
    case 'pendente':
      return {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50',
        icon: Clock,
        text: 'Pendente',
      };
    case 'aceita':
    case 'matched':
      return {
        color: 'bg-blue-500/20 text-blue-400 border-blue-400/50',
        icon: CheckCircle,
        text: 'Casada',
      };
    case 'ganha':
      return {
        color: 'bg-green-500/20 text-green-400 border-green-400/50',
        icon: Trophy,
        text: 'Ganhou',
      };
    case 'perdida':
      return {
        color: 'bg-red-500/20 text-red-400 border-red-400/50',
        icon: XCircle,
        text: 'Perdeu',
      };
    case 'cancelada':
      return {
        color: 'bg-red-500/20 text-red-400 border-red-400/50',
        icon: XCircle,
        text: 'Cancelado',
      };
    // ... fallback para status em inglês
  }
};
```

---

### Resumo Visual

| Status | Cor | Ícone | Texto |
|--------|-----|-------|-------|
| **Ganhou** | 🟢 Verde | 🏆 | Ganhou |
| **Pendente** | 🟡 Amarelo | 🕐 | Pendente |
| **Perdeu** | 🔴 Vermelho | ❌ | Perdeu |
| **Cancelado** | 🔴 Vermelho | ❌ | Cancelado |
| **Casada** | 🔵 Azul | ✓ | Casada |

---

### Testes Realizados

✅ **Status "Ganhou"** - Verde confirmado
✅ **Status "Pendente"** - Amarelo confirmado
✅ **Status "Encerrada"** (série) - Vermelho confirmado
✅ **Filtros de Status** - Funcionando corretamente
✅ **Contadores** - Mostrando valores corretos (ex: Vitórias (1), Pendentes (6))

---

### Status Final

🎉 **Todas as cores dos status foram implementadas conforme solicitado!**

- ✅ Ganhou → Verde
- ✅ Pendente → Amarelo
- ✅ Perdeu → Vermelho
- ✅ Cancelado → Vermelho
- ✅ Casada → Azul (mantido para diferenciar)






