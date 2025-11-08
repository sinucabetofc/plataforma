# 🔍 ANÁLISE: Valor Errado ao Criar Aposta

**Data**: 07/11/2025  
**Problema**: Apostou R$ 15, salvou R$ 40

---

## 📊 DADOS DO PROBLEMA

```
Frontend (digitado): R$ 15,00
Backend (salvo):     R$ 40,00 (4000 centavos)
Diferença:           R$ 25,00
Multiplicador:       2.67x (??)
```

---

## ✅ O QUE JÁ FOI VERIFICADO

1. ✅ Backend NÃO multiplica o valor
2. ✅ Trigger `validate_bet_on_insert` NÃO multiplica
3. ✅ NÃO há débito duplo (só 1 transação)
4. ✅ O valor SALVO na tabela `bets` já está errado (R$ 40)

---

## 🎯 HIPÓTESES

### Hipótese 1: Frontend está enviando R$ 40
- Frontend converte: `parseFloat(amount) * 100`
- Se `amount` for "40" ao invés de "15"...
- **COMO TESTAR**: Adicionar console.log no frontend

### Hipótese 2: Há apostas anteriores sendo somadas
- Talvez esteja somando apostas pendentes?
- **COMO TESTAR**: Verificar se R$ 40 = soma de outras apostas

### Hipótese 3: Campo HTML errado
- Input pode estar pegando valor de outro campo
- **COMO TESTAR**: Inspecionar elemento no navegador

### Hipótese 4: Estado React desatualizado
- O `amount` no state pode estar com valor antigo
- **COMO TESTAR**: React DevTools

---

## 🔧 PRÓXIMAS AÇÕES

### 1. Adicionar Logs no Frontend
```javascript
// frontend/pages/partidas/[id].js linha 990
console.log('🎯 [APOSTA] Valor digitado:', amount);
console.log('🎯 [APOSTA] Valor em centavos:', amountInCents);
console.log('🎯 [APOSTA] Enviando para API:', { serie_id, chosen_player_id, amount: amountInCents });
```

### 2. Adicionar Logs no Backend
```javascript
// backend/services/bets.service.js linha 19
console.log('🎯 [BACKEND] Recebeu:', betData);
console.log('🎯 [BACKEND] Amount recebido:', amount);
```

### 3. Verificar Console do Navegador
- Abrir DevTools (F12)
- Aba Console
- Fazer aposta de R$ 15
- Ver o que está sendo enviado

---

## 🚨 TESTE RÁPIDO

Faça uma aposta de **R$ 10,00** (valor redondo):
- Se salvar R$ 10 ✅ = problema com R$ 15 especificamente
- Se salvar outro valor ❌ = problema sistemático

---

## 💡 SOLUÇÃO TEMPORÁRIA

Adicionar validação no backend:
```javascript
// Garantir que amount está correto
if (amount !== parseInt(amount)) {
  throw new Error(`Valor inválido: ${amount}`);
}
console.log(`✅ Amount validado: ${amount} centavos = R$ ${amount/100}`);
```


