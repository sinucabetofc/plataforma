# 🔧 Corrigir Saldo no Frontend - Guia Rápido

**Status:** Backend 100% funcional, Frontend precisa de ajuste  
**Tempo estimado:** 5 minutos

---

## ✅ O Que Já Funciona

- ✅ **Backend:** API `/api/wallet` retorna saldo correto (R$ 120,00)
- ✅ **Database:** Saldo está correto no banco
- ✅ **Triggers:** Sistema de apostas funciona perfeitamente
- ❌ **Frontend:** Mostra R$ 0,00 (cache ou token)

---

## 🧪 Teste Manual (RECOMENDADO)

### **Passo 1: Abrir no Navegador**
```
http://localhost:3000
```

### **Passo 2: Fazer Login**
```
Email: vini@admin.com
Senha: @Vini0608
```

### **Passo 3: Verificar Saldo**
Olhe no canto superior direito:
- **Esperado:** R$ 120,00
- **Atual:** R$ 0,00 (provavelmente)

---

## 🔍 Debug no Browser (se ainda mostrar R$ 0,00)

### **Opção 1: Console do Navegador (F12)**

```javascript
// 1. Ver o token
localStorage.getItem('token')

// 2. Testar API diretamente
fetch('http://localhost:3001/api/wallet', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))

// 3. Deve retornar:
{
  total_balance: 120,         // ← Em REAIS!
  available_balance: 120,
  locked_balance: 0
}
```

Se a API retornar correto mas o frontend não atualizar:

```javascript
// Limpar cache do React Query e recarregar
localStorage.clear()
location.reload()
```

---

## 🛠️ Solução Definitiva (Se necessário)

Se ainda assim não funcionar, o problema pode ser que o **Header** não está buscando corretamente. 

Verifique no código (linha 228 do `Header.js`):

```javascript
{formatCurrency(walletData?.total_balance || 0)}
```

E nas linhas 244-245:

```javascript
{formatCurrency(walletData?.available_balance || 0)}
```

Agora a API retorna `total_balance` e `available_balance` diretamente na raiz do objeto!

---

## 📝 Comandos Úteis

**Reiniciar Backend:**
```bash
cd backend
npm run dev
```

**Reiniciar Frontend:**
```bash
cd frontend  
npm run dev
```

**Testar API:**
```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vini@admin.com","password":"@Vini0608"}' \
  | jq '.data.token'

# 2. Copiar o token e substituir em TOKEN_AQUI
curl http://localhost:3001/api/wallet \
  -H "Authorization: Bearer TOKEN_AQUI" \
  | jq '.data'
```

---

## ✅ Checklist de Verificação

- [ ] Backend rodando (localhost:3001)
- [ ] Frontend rodando (localhost:3000)
- [ ] Login feito com vini@admin.com
- [ ] Token salvo no localStorage
- [ ] API `/api/wallet` retorna 200 OK
- [ ] API retorna `total_balance: 120`
- [ ] Header exibe R$ 120,00

---

## 🚀 Próximo Passo

Assim que o saldo aparecer correto:
- ✅ Sprint 1: **100% CONCLUÍDO**
- ⏭️ Iniciar Sprint 2: Backend APIs (services, controllers, routes)

---

**Criado:** 05/11/2025  
**Status:** Aguardando teste manual


