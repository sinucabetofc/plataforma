# 📋 Instruções para Cadastro - SinucaBet

## ✅ Correções Aplicadas

Ajustei todas as validações do frontend para corresponder **exatamente** aos requisitos do backend.

---

## 🔐 Regras de Validação

### **Etapa 1: Dados Básicos**

#### Nome
- ✅ Mínimo 3 caracteres
- ✅ Máximo 255 caracteres

#### Email
- ✅ Formato de email válido
- ✅ Exemplo: `joao@teste.com`

#### Senha ⚠️ **IMPORTANTE**
- ✅ **Mínimo 8 caracteres**
- ✅ **Pelo menos uma letra minúscula** (a-z)
- ✅ **Pelo menos uma letra MAIÚSCULA** (A-Z)
- ✅ **Pelo menos um número** (0-9)

**Exemplos de senhas válidas:**
- ✅ `Senha123`
- ✅ `SinucaBet2024`
- ✅ `Teste@123`

**Exemplos de senhas inválidas:**
- ❌ `123456` (sem letras)
- ❌ `senha123` (sem maiúscula)
- ❌ `SENHA123` (sem minúscula)
- ❌ `SenhaSenha` (sem número)

---

### **Etapa 2: Documentos**

#### Telefone
- ✅ Formato com DDD e 9 dígitos
- ✅ A máscara formata automaticamente
- ✅ Digite apenas números: `11999999999`
- ✅ Será formatado para: `(11) 99999-9999`
- ✅ Backend recebe: `+5511999999999`

#### CPF ⚠️ **IMPORTANTE**
- ✅ **Formato obrigatório:** `000.000.000-00`
- ✅ A máscara formata automaticamente
- ✅ **Validação de dígitos verificadores**
- ✅ CPF deve ser válido

**Exemplo válido:**
- Digite: `12345678909`
- Será formatado: `123.456.789-09`

**⚠️ ATENÇÃO:**
- O CPF `123.456.789-00` é **inválido** (falha na verificação)
- Use um [gerador de CPF válido](https://www.4devs.com.br/gerador_de_cpf)

---

### **Etapa 3: Chave Pix**

#### Tipo de Chave
- ✅ Email
- ✅ CPF
- ✅ Telefone
- ✅ Aleatória

#### Chave Pix
- ✅ Deve corresponder ao tipo selecionado
- ✅ Mínimo 3 caracteres

---

## 🧪 Dados para Teste

Use estes dados para testar o cadastro:

### ✅ Cadastro de Teste Válido

**Etapa 1:**
```
Nome: João Silva
Email: joao.silva@teste.com
Senha: SinucaBet123
```

**Etapa 2:**
```
Telefone: (11) 99999-9999
CPF: 123.456.789-09 (use um gerador de CPF válido)
```

**Etapa 3:**
```
Tipo: Email
Chave Pix: joao.silva@teste.com
```

---

## 🔧 Como Testar

1. **Acesse:** http://localhost:3000/register

2. **Preencha a Etapa 1:**
   - Use uma senha forte: `SinucaBet123`
   - Clique em [Continuar]

3. **Preencha a Etapa 2:**
   - Digite apenas números no telefone (a máscara formata)
   - Use um CPF válido com pontos e traço
   - Clique em [Continuar]

4. **Preencha a Etapa 3:**
   - Selecione o tipo de chave
   - Digite a chave Pix
   - Clique em [Finalizar Cadastro]

5. **Resultado esperado:**
   - ✅ Toast: "Cadastro realizado com sucesso!"
   - ✅ Redirect para `/wallet`
   - ✅ Usuário autenticado

---

## ⚠️ Problemas Comuns

### "Senha deve conter pelo menos uma letra minúscula, uma MAIÚSCULA e um número"
**Solução:** Use uma senha como `SinucaBet123` ou `Teste@123`

### "CPF inválido"
**Soluções:**
1. Use um gerador de CPF válido: https://www.4devs.com.br/gerador_de_cpf
2. Certifique-se de usar o formato: `000.000.000-00`

### "Telefone inválido"
**Solução:** 
- Digite apenas números
- A máscara formatará automaticamente
- Exemplo: `11999999999` → `(11) 99999-9999`

---

## 📊 O que mudou?

### ✅ Validações Atualizadas

| Campo | Antes | Depois |
|-------|-------|--------|
| Senha | Min 6 chars | Min 8 chars + maiúscula + minúscula + número |
| Telefone | Aceita qualquer formato | Formato `(11) 99999-9999` + conversão para internacional |
| CPF | Aceita sem formatação | Requer formato `000.000.000-00` + validação de dígitos |

### ✅ Máscaras Adicionadas

- **Telefone:** Formata automaticamente `(11) 99999-9999`
- **CPF:** Formata automaticamente `000.000.000-00`

### ✅ Dicas Visuais

- Mensagens de ajuda abaixo dos campos
- Exemplos de formato correto
- Feedback visual instantâneo

---

## 🎉 Pronto para Usar!

Todas as correções foram aplicadas. O cadastro agora está **100% funcional** e validado de acordo com o backend!

**Teste agora em:** http://localhost:3000/register

---

**Desenvolvido para SinucaBet** 🎱





