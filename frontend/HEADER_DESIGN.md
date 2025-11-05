# 🎱 Novo Header SinucaBet - Estilo RASPA GREEN

## 🎨 Design Minimalista e Funcional

---

## 📊 Layout do Header

### **NÃO AUTENTICADO**

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  [🎱] SINUCA          [REGISTRAR] [ENTRAR]                │
│       BET             (outline)   (verde)                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Elementos:**
- Logo: Bola 8 verde neon + texto "SINUCA BET"
- Botão REGISTRAR: Outline branco, fundo transparente
- Botão ENTRAR: Fundo verde neon, texto preto

---

### **AUTENTICADO**

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  [🎱] SINUCA    [R$ 1.250,00 ▼] [💳] [👤 ▼]              │
│       BET       (saldo cinza)   (verde) (perfil)           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Elementos:**
1. **Saldo com Dropdown** (clicável)
   - Background cinza médio
   - Valor do saldo em branco
   - Chevron down
   - Ao clicar: vai para /wallet

2. **Botão Depositar** (quadrado verde)
   - Background verde neon
   - Ícone de cartão de crédito
   - Ao clicar: vai para /wallet

3. **Menu do Usuário** (dropdown)
   - Círculo com ícone de pessoa
   - Chevron down
   - Ao clicar: abre menu

**Dropdown do Usuário:**
```
┌─────────────────────┐
│ João Silva          │
│ joao@teste.com      │
├─────────────────────┤
│ Meu Perfil          │
│ Carteira            │
│ Jogos               │
├─────────────────────┤
│ 🚪 Sair             │
└─────────────────────┘
```

---

## 🎨 Cores Aplicadas

### Logo
- Círculo: `bg-verde-neon` (#5ce1a1)
- Número 8: `text-cinza-escuro`
- Texto "SINUCA": `text-white`
- Texto "BET": `text-verde-neon`

### Header
- Background: `bg-cinza-escuro` (#0a0f14)
- Altura: 64px (h-16)

### Botões (Não Logado)
- **REGISTRAR**: 
  - Border branco (2px)
  - Texto branco
  - Hover: fundo branco, texto escuro

- **ENTRAR**:
  - Background verde neon
  - Texto cinza escuro
  - Hover: verde accent

### Elementos (Logado)
- **Saldo**:
  - Background cinza médio
  - Texto branco
  - Hover: cinza claro

- **Depositar**:
  - Background verde neon
  - Ícone preto
  - Hover: verde accent

- **Menu Usuário**:
  - Border cinza
  - Background cinza médio
  - Dropdown: sombra e border

---

## ✨ Funcionalidades

### **Saldo em Tempo Real**
- ✅ Atualiza automaticamente a cada 10 segundos
- ✅ Clicável (leva para /wallet)
- ✅ Formato moeda brasileira

### **Botão Depositar Rápido**
- ✅ Acesso direto à carteira
- ✅ Ícone de cartão de crédito
- ✅ Visual destacado (verde neon)

### **Menu do Usuário**
- ✅ Mostra nome e email
- ✅ Links rápidos: Perfil, Carteira, Jogos
- ✅ Logout em vermelho
- ✅ Fecha ao clicar fora (com useEffect)

---

## 📱 Responsividade

### Mobile
- Logo compacto (bola 8 + texto vertical)
- Botões menores (text-xs)
- Padding reduzido
- Icone depositar 40px

### Desktop
- Logo com espaçamento
- Botões maiores (text-sm/base)
- Padding generoso
- Ícone depositar 44px

---

## 🎯 Comparação com RASPA GREEN

| Elemento | RASPA GREEN | SinucaBet |
|----------|-------------|-----------|
| **Logo** | Trevo verde + texto | Bola 8 verde + texto |
| **Fundo Header** | Laranja | Cinza escuro |
| **Destaque** | Verde lime | Verde neon |
| **Botão Principal** | Verde | Verde neon |
| **Saldo** | Cinza com chevron | Cinza com chevron ✅ |
| **Depositar** | Quadrado verde | Quadrado verde ✅ |
| **Menu Usuário** | Círculo + chevron | Círculo + chevron ✅ |

---

## 🚀 Vantagens do Novo Design

1. **Minimalista** - Sem elementos desnecessários
2. **Funcional** - Tudo que precisa está visível
3. **Limpo** - Fácil de usar
4. **Rápido** - Acesso direto ao saldo e depósito
5. **Profissional** - Visual moderno e confiável

---

## 📋 Checklist de Implementação

- [x] Logo estilo RASPA GREEN
- [x] Botões REGISTRAR e ENTRAR (não logado)
- [x] Display de saldo com dropdown (logado)
- [x] Botão depositar quadrado verde (logado)
- [x] Menu do usuário com dropdown (logado)
- [x] Cores verde, preto e branco
- [x] Sem gradientes
- [x] Responsivo
- [x] Animações sutis

---

**Novo header implementado com sucesso!** 🎉

Quer que eu abra o projeto no browser para você ver o resultado? 🚀



