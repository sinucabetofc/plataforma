# 🎨 SISTEMA DE BADGES DE STATUS - COMPLETO

**Data:** 07/11/2025  
**Status:** ✅ Implementado  

---

## 🎯 BADGES POR STATUS E CONTEXTO

### 📊 **TRANSAÇÕES**

| Status | Badge | Cor | Quando Ocorre |
|--------|-------|-----|---------------|
| `pending` | **Pendente** | 🟡 Amarelo | Depósito gerado, aguardando pagamento |
| `completed` | **Concluída** | 🟢 Verde | Transação processada com sucesso |
| `failed` | **Falhou** | 🔴 Vermelho | Erro no processamento |
| `cancelled` | **Cancelada** | 🔴 Vermelho | Transação cancelada |

---

### 🎲 **APOSTAS**

| Status | Badge | Cor | Quando Ocorre |
|--------|-------|-----|---------------|
| `pendente` | **Aguardando emparelhamento** | 🟡 Amarelo | Aposta criada, aguardando par |
| `aceita` | **Aposta casada** | 🔵 Azul | Aposta emparelhada com sucesso |
| `ganha` | **Ganha** | 🟢 Verde | Usuário venceu a aposta |
| `perdida` | **Perdida** | 🔴 Vermelho | Usuário perdeu a aposta |
| `cancelada` | **Cancelada** | 🔴 Vermelho | Aposta cancelada |
| `reembolsada` | **Reembolsada** | 🔵 Azul | Valor devolvido ao usuário |

---

### 🎮 **PARTIDAS**

| Status | Badge | Cor | Quando Ocorre |
|--------|-------|-----|---------------|
| `agendada` | **Agendada** | 🔵 Azul | Partida programada |
| `em_andamento` | **Ao Vivo** | 🟢 Verde | Partida acontecendo agora |
| `finalizada` | **Finalizada** | 🟢 Verde | Partida concluída |
| `cancelada` | **Cancelada** | 🔴 Vermelho | Partida cancelada |

---

### 💰 **SAQUES**

| Status | Badge | Cor | Quando Ocorre |
|--------|-------|-----|---------------|
| `pending` | **Pendente** | 🟡 Amarelo | Aguardando aprovação admin |
| `approved` | **Aprovado** | 🟢 Verde | Saque aprovado e processado |
| `rejected` | **Recusado** | 🔴 Vermelho | Saque negado |

---

## 🎨 PALETA DE CORES

### Classe CSS e Cores:

| Classe | Cor | Uso | Hex |
|--------|-----|-----|-----|
| `status-success` | 🟢 Verde | Sucesso, concluído, ao vivo | `#10b981` |
| `status-warning` | 🟡 Amarelo | Pendente, aguardando | `#f59e0b` |
| `status-error` | 🔴 Vermelho | Erro, falhou, perdeu | `#ef4444` |
| `status-info` | 🔵 Azul | Info, casada, agendada | `#3b82f6` |

---

## 💻 IMPLEMENTAÇÃO

### Componente: `StatusBadge.js`

```javascript
const STATUS_COLORS = {
  // Verde (sucesso)
  completed: 'status-success',
  ganha: 'status-success',
  finished: 'status-success',
  approved: 'status-success',
  
  // Amarelo (pendente)
  pending: 'status-warning',
  pendente: 'status-warning',
  
  // Vermelho (erro)
  failed: 'status-error',
  perdida: 'status-error',
  cancelled: 'status-error',
  rejected: 'status-error',
  
  // Azul (info)
  aceita: 'status-info',
  casada: 'status-info',
  matched: 'status-info',
  agendada: 'status-info',
  reembolsada: 'status-info',
};
```

### Formatação de Textos: `formatters.js`

```javascript
export function formatStatus(status) {
  const statusMap = {
    // Transações
    pending: 'Pendente',
    completed: 'Concluída',
    failed: 'Falhou',
    
    // Apostas
    pendente: 'Aguardando emparelhamento', // 🟡
    aceita: 'Aposta casada',               // 🔵
    ganha: 'Ganha',                        // 🟢
    perdida: 'Perdida',                    // 🔴
    reembolsada: 'Reembolsada',           // 🔵
  };
  
  return statusMap[status] || status;
}
```

---

## 📊 EXEMPLOS VISUAIS

### Na Página de Transações:
```
Status: [Pendente 🟡]     ← Depósito gerado, não pago
Status: [Concluída 🟢]    ← Transação processada
Status: [Falhou 🔴]       ← Erro no processamento
```

### Na Página de Apostas:
```
Status: [Aguardando emparelhamento 🟡]  ← Aposta pendente
Status: [Aposta casada 🔵]              ← Aposta emparelhada
Status: [Ganha 🟢]                      ← Apostador venceu
Status: [Perdida 🔴]                    ← Apostador perdeu
```

### Na Página de Partidas:
```
Status: [Agendada 🔵]     ← Programada
Status: [Ao Vivo 🟢]      ← Acontecendo agora
Status: [Finalizada 🟢]   ← Concluída
```

---

## 🔄 FLUXOS DE STATUS

### Fluxo de Depósito:
```
1. [Pendente 🟡]     → Usuário gera QR Code
2. [Concluída 🟢]    → Webhook confirma pagamento
   OU
   [Cancelada 🔴]    → Timeout ou cancelamento
```

### Fluxo de Aposta:
```
1. [Aguardando emparelhamento 🟡]  → Aposta criada
2. [Aposta casada 🔵]              → Par encontrado
3. [Ganha 🟢] ou [Perdida 🔴]      → Resultado
   OU
   [Reembolsada 🔵]                → Partida cancelada
```

### Fluxo de Saque:
```
1. [Pendente 🟡]      → Solicitação criada
2. [Aprovado 🟢]      → Admin aprova
   OU
   [Recusado 🔴]      → Admin rejeita
```

---

## 🎯 PRÓXIMA FASE: PROVEDORES PIX

### O que falta para Depósitos funcionarem 100%:

1. **Página "Provedores Pix"** (a criar)
   - Interface para gerenciar credenciais
   - Adicionar chaves Pix
   - Configurar Woovi/OpenPix

2. **Integração Webhook**
   - Receber notificação de pagamento
   - Atualizar status: `pending` → `completed`
   - Creditar saldo do usuário

3. **Geração de QR Code**
   - Criar transação com status `pending`
   - Gerar QR Code via provedor
   - Exibir para usuário

**Quando implementado:**
- Depósitos com status `pending` aparecerão com badge **🟡 Amarelo "Pendente"**
- Após pagamento confirmado, mudarão para **🟢 Verde "Concluída"**

---

## ✅ ARQUIVOS MODIFICADOS

```
frontend/components/admin/StatusBadge.js
├── Adicionado: aceita → status-info (azul)
└── Adicionado: reembolsada → status-info (azul)

frontend/utils/formatters.js
├── Modificado: pendente → "Aguardando emparelhamento"
├── Modificado: aceita → "Aposta casada"
├── Modificado: matched → "Aposta casada"
└── Adicionado: reembolsada → "Reembolsada"
```

---

## 📋 CHECKLIST DE STATUS

### Transações:
- ✅ Pendente (amarelo)
- ✅ Concluída (verde)
- ✅ Falhou (vermelho)
- ✅ Cancelada (vermelho)

### Apostas:
- ✅ Aguardando emparelhamento (amarelo)
- ✅ Aposta casada (azul)
- ✅ Ganha (verde)
- ✅ Perdida (vermelho)
- ✅ Reembolsada (azul)

### Partidas:
- ✅ Agendada (azul)
- ✅ Ao Vivo (verde)
- ✅ Finalizada (verde)
- ✅ Cancelada (vermelho)

### Saques:
- ✅ Pendente (amarelo)
- ✅ Aprovado (verde)
- ✅ Recusado (vermelho)

---

## 🎉 RESUMO

✅ **Sistema de badges completo e consistente**  
✅ **Cores padronizadas em todo o sistema**  
✅ **Textos claros e descritivos**  
✅ **Pronto para integração com Provedores Pix**  

**Status:** ✅ **FINALIZADO E FUNCIONAL!** 🚀

---

**Desenvolvido em:** 07/11/2025  
**Próxima fase:** Integração Provedores Pix

