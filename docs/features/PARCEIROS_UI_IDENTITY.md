# Identidade Visual do Painel de Parceiros

## 📋 Padrão Seguido

O painel de parceiros/influencers segue **exatamente a mesma identidade visual** do painel administrativo, com ajustes de cor para diferenciação.

---

## 🎨 Cores e Identidade

### Admin (Verde Neon)
- **Cor Principal**: `#27e502` (Verde Neon)
- **Classes**: `bg-admin-green`, `text-admin-green`
- **Logo**: Letra "S" em destaque

### Parceiros (Amarelo/Gold)
- **Cor Principal**: `#f59e0b` (Amarelo/Warning)
- **Classes**: `bg-status-warning`, `text-status-warning`
- **Logo**: Ícone Star (⭐) em destaque

---

## 🏗️ Estrutura de Páginas

### Roteamento Idêntico

**Admin**:
```
/admin
  ├── /index.js       → Redireciona (login ou dashboard)
  ├── /login.js       → Página de login
  └── /dashboard.js   → Dashboard principal
```

**Parceiros**:
```
/parceiros
  ├── /index.js       → Redireciona (login ou dashboard)
  ├── /login.js       → Página de login
  └── /dashboard.js   → Dashboard principal
```

---

## 🧩 Componentes Compartilhados

### Componentes Reutilizados do Admin:
1. **Loader** (`/components/admin/Loader.js`)
   - Spinner de carregamento
   - Tamanhos: sm, md, lg

2. **CardInfo** (`/components/admin/CardInfo.js`)
   - Cards de métricas/estatísticas
   - Suporta ícones, valores, trends

### Classes CSS Customizadas:

#### Layout
```css
.admin-card              /* Card padrão */
.bg-admin-black          /* Fundo preto (#0a0a0a) */
.bg-admin-gray-dark      /* Cinza escuro */
.bg-admin-gray-light     /* Cinza claro */
```

#### Botões
```css
.btn                     /* Base button */
.btn-primary             /* Botão verde (admin) */
.btn-warning             /* Botão amarelo (parceiros) */
```

#### Inputs
```css
.input                   /* Input padrão */
```

#### Textos
```css
.text-admin-text-primary   /* Texto principal branco */
.text-admin-text-secondary /* Texto secundário cinza */
.text-admin-text-muted     /* Texto esmaecido */
```

#### Spinners
```css
.spinner-sm              /* Spinner pequeno */
```

---

## 📱 Login Page - Comparação

### Elementos Comuns:

#### 1. Logo
**Admin**:
```jsx
<div className="w-16 h-16 rounded-2xl bg-admin-green">
  <span className="text-3xl">S</span>
</div>
<h1>SinucaBet <span className="text-admin-green">Admin</span></h1>
```

**Parceiros**:
```jsx
<div className="w-16 h-16 rounded-2xl bg-status-warning">
  <Star size={32} />
</div>
<h1>SinucaBet <span className="text-status-warning">Parceiros</span></h1>
```

#### 2. Card de Login
```jsx
<div className="admin-card">
  <h2>Fazer Login</h2>
  <form>
    <input className="input" type="email" />
    <input className="input" type="password" />
    <button className="btn btn-[primary|warning]">
      <LogIn /> Entrar no Painel
    </button>
  </form>
</div>
```

#### 3. Feedback
- **Toasts**: `react-hot-toast` para sucesso/erro
- **Loading**: Spinner inline com texto "Entrando..."
- **Aviso**: Box com emoji e texto explicativo

---

## 🔄 Autenticação

### Admin
```javascript
// Usa utils próprios
import { saveToken, saveUser, isAuthenticated } from '@/utils/auth';
import { post } from '@/utils/api';

// Verifica role = 'admin'
if (user.role !== 'admin') {
  toast.error('Acesso negado');
}
```

### Parceiros
```javascript
// Usa Zustand Store
import useInfluencerStore from '@/store/influencerStore';

const { login, isAuthenticated } = useInfluencerStore();

// Login via store
await login(email, password);
```

---

## 🎯 Dashboard - Layout

### Estrutura Comum:

```jsx
<div className="space-y-6">
  {/* Header */}
  <div>
    <h1 className="text-3xl font-bold text-admin-text-primary">
      Dashboard
    </h1>
  </div>

  {/* Cards de Métricas */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <CardInfo
      title="..."
      value={...}
      icon={<Icon />}
      trend="..."
      className="border-[color]"
    />
  </div>

  {/* Conteúdo Adicional */}
  <div className="admin-card">
    ...
  </div>
</div>
```

---

## 📊 Cards de Informação

### Admin Cards:
- Total Usuários
- Cadastros Hoje
- Jogos ao Vivo
- Apostado Hoje/Mês
- Depósitos
- Saldo Total
- Saques Pendentes
- Lucro Plataforma

### Parceiros Cards:
- Total de Jogos
- Jogos Ativos
- Comissões Totais
- Comissões Pendentes

---

## 🎨 Cores de Status

### Sistema de Cores Unificado:
```css
.border-admin-green      /* Verde neon - Admin principal */
.border-status-warning   /* Amarelo - Parceiros principal */
.border-status-success   /* Verde - Sucesso */
.border-status-error     /* Vermelho - Erro */
.border-status-info      /* Azul - Informação */

/* Específicas */
.border-blue-500
.border-red-500
.border-yellow-500
.border-purple-500
.border-cyan-500
.border-emerald-500
```

---

## 🔐 Diferenças Chave

### Acesso

| Aspecto | Admin | Parceiros |
|---------|-------|-----------|
| **Autenticação** | Via API + JWT (Supabase) | Via API + JWT (Manual) |
| **Role Check** | `role === 'admin'` | Tabela `influencers` |
| **Redirect após Login** | `/admin/dashboard` | `/parceiros/dashboard` |
| **Store** | `adminStore` (opcional) | `influencerStore` (Zustand) |

### Funcionalidades

| Recurso | Admin | Parceiros |
|---------|-------|-----------|
| **CRUD Usuários** | ✅ | ❌ |
| **CRUD Jogos** | ✅ | ❌ |
| **Controle de Placar** | ✅ | ✅ |
| **Aprovar Saques** | ✅ | ❌ |
| **Ver Apostas** | ✅ (todas) | ✅ (só do seu jogo) |
| **Comissões** | ❌ | ✅ |

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
```
frontend/pages/parceiros/
  ├── index.js                    ✅ Criado (redirect)
  ├── login.js                    ✅ Recriado (padrão admin)
  ├── dashboard.js                ✅ Recriado (padrão admin)
  └── jogos/
      └── [id].js                 ✅ Criado

frontend/components/parceiros/
  ├── InfluencerLayout.js         ✅ Criado
  ├── GameControlPanel.js         ✅ Criado
  └── BetsHistory.js              ✅ Criado

frontend/store/
  └── influencerStore.js          ✅ Criado (Zustand)

frontend/hooks/
  └── useInfluencerMatches.js     ✅ Criado
```

### Componentes Compartilhados:
```
frontend/components/admin/
  ├── Loader.js                   🔄 Usado por ambos
  └── CardInfo.js                 🔄 Usado por ambos
```

---

## 🚀 Próximos Passos

### CSS Customizado
Adicionar ao `globals.css` ou criar arquivo específico:

```css
/* Botão Warning para Parceiros */
.btn-warning {
  @apply bg-status-warning text-admin-black font-semibold;
  @apply hover:bg-yellow-600 active:bg-yellow-700;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors;
}

/* Cards com borda amarela */
.card-parceiro {
  @apply admin-card border-l-4 border-status-warning;
}
```

### Responsividade
- ✅ Já implementado mobile-first
- ✅ Touch-friendly (44px mínimo)
- ✅ Scroll horizontal em filtros
- ✅ Grid adaptativo

---

## ✅ Checklist de Consistência

- [x] Mesmo bg-color (`bg-admin-black`)
- [x] Mesmas classes de card (`admin-card`)
- [x] Mesmos inputs (`input`)
- [x] Mesmos botões (base `btn`)
- [x] Mesmo loader component
- [x] Mesmo padrão de toast
- [x] Mesmo layout de login
- [x] Mesma estrutura de redirect
- [x] Mobile-first responsive
- [x] Touch-optimized

---

**Última Atualização**: 08/11/2025  
**Versão**: 1.0.0  
**Status**: ✅ Identidade Visual Alinhada com Admin

