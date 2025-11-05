# 🎯 Teste Final de Cadastro - SinucaBet

## ✅ Status Atual

- ✅ **Frontend** rodando em http://localhost:3000
- ✅ **Backend** rodando em http://localhost:3001
- ✅ **Validações corrigidas** (senha, telefone, CPF)
- ✅ **Máscaras de formatação** adicionadas
- ✅ **Rate limiter resetado**
- ✅ **Rotas da API corrigidas** (`/auth/register`)

---

## 🧪 Dados para Teste (COPIE E COLE)

### **Etapa 1: Dados Básicos**

```
Nome: João Silva
Email: joao@teste.com
Senha: SinucaBet123
```

⚠️ **IMPORTANTE:** A senha DEVE ter:
- Mínimo 8 caracteres
- Pelo menos uma letra minúscula
- Pelo menos uma letra MAIÚSCULA
- Pelo menos um número

### **Etapa 2: Documentos**

```
Telefone: (11) 99999-9999
CPF: [Use um CPF válido]
```

⚠️ **GERE UM CPF VÁLIDO:**
1. Acesse: https://www.4devs.com.br/gerador_de_cpf
2. Clique em "Gerar CPF"
3. Copie o CPF COM pontos e traço (formato: 000.000.000-00)
4. Cole no campo

### **Etapa 3: Chave Pix**

```
Tipo de Chave: Email
Chave Pix: joao@teste.com
```

---

## 📝 Passo a Passo

### **1. Acesse a página de cadastro**
```
http://localhost:3000/register
```

### **2. Preencha a Etapa 1**
- Cole o nome: `João Silva`
- Cole o email: `joao@teste.com`
- Cole a senha: `SinucaBet123`
- Clique em **[Continuar]**

### **3. Preencha a Etapa 2**
- No telefone, digite apenas números: `11999999999`
  - A máscara formata automaticamente para `(11) 99999-9999`
- No CPF, cole um CPF válido com pontos e traço
  - Exemplo: `123.456.789-09`
- Clique em **[Continuar]**

### **4. Preencha a Etapa 3**
- Selecione tipo: `Email`
- Digite a chave: `joao@teste.com`
- Clique em **[Finalizar Cadastro]**

### **5. Resultado Esperado** ✅
- Toast verde: "Cadastro realizado com sucesso!"
- Redirecionamento automático para `/wallet`
- Usuário autenticado e logado

---

## 🚨 Erros Comuns e Soluções

### **"Senha deve conter pelo menos uma letra minúscula, uma MAIÚSCULA e um número"**
❌ Problema: Senha não atende aos requisitos  
✅ Solução: Use `SinucaBet123` ou similar

### **"CPF inválido"**
❌ Problema: CPF não passou na validação de dígitos  
✅ Solução: Use o gerador: https://www.4devs.com.br/gerador_de_cpf

### **"Telefone inválido"**
❌ Problema: Formato incorreto  
✅ Solução: Digite apenas números (ex: `11999999999`)

### **"Muitas tentativas de registro"**
❌ Problema: Rate limiter bloqueou  
✅ Solução: Backend foi reiniciado, tente novamente

### **"Erro de validação"**
❌ Problema: Algum campo não está correto  
✅ Solução: Verifique TODOS os requisitos acima

---

## 🔍 Como Verificar se Funcionou

### **No Browser (Console):**
✅ Deve ver: `Status 200 OK` para `/api/auth/register`

### **Na Interface:**
✅ Toast de sucesso verde
✅ Redirect para http://localhost:3000/wallet
✅ Header mostra seu nome
✅ Menu com "Carteira" e "Perfil" disponíveis

### **No Backend (Terminal):**
✅ Log: `POST /api/auth/register 200`

---

## 📊 Checklist Final

Antes de testar, certifique-se:

- [ ] Frontend rodando em http://localhost:3000
- [ ] Backend rodando em http://localhost:3001
- [ ] Página de cadastro aberta
- [ ] Dados de teste preparados
- [ ] CPF válido gerado
- [ ] Senha forte preparada: `SinucaBet123`

---

## 🎉 Após o Cadastro com Sucesso

Você terá acesso a:

1. **Carteira Digital** (`/wallet`)
   - Ver saldo
   - Depositar via Pix
   - Solicitar saque

2. **Lista de Jogos** (`/games`)
   - Ver jogos abertos
   - Apostar em jogos

3. **Perfil** (`/profile`)
   - Editar dados
   - Atualizar chave Pix
   - Logout

---

## 🔄 Se Ainda Assim Der Erro

### **Opção 1: Logs Detalhados**
Abra o DevTools (F12) → Console e envie os erros

### **Opção 2: Testar Backend Direto**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@teste.com",
    "password": "SinucaBet123",
    "phone": "+5511999999999",
    "cpf": "123.456.789-09",
    "pix_key": "joao@teste.com",
    "pix_type": "email"
  }'
```

Se funcionar no curl, o problema está no frontend.  
Se não funcionar, o problema está no backend.

---

## 📞 Resumo para Sucesso

**Use exatamente estes dados:**

```javascript
{
  name: "João Silva",
  email: "joao@teste.com", 
  password: "SinucaBet123",
  phone: "(11) 99999-9999",
  cpf: "[CPF válido do gerador]",
  pix_type: "email",
  pix_key: "joao@teste.com"
}
```

**Lembre-se:**
- Senha forte: `SinucaBet123` ✅
- CPF válido do gerador ✅
- Telefone formatado automaticamente ✅

---

**Boa sorte! 🎱 Cadastro vai funcionar agora!** 🚀



