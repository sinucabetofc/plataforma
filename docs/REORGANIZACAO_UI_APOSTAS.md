# Reorganização UI - Página de Apostas

## Data: 05/11/2025

### Problema Identificado

Os cards na página `/apostas` estavam desalinhados e desorganizados, dificultando a leitura e navegação.

---

## Solução Implementada

### Novo Layout Estruturado em 3 Seções

#### 1. **Cabeçalho do Card** (Fundo Escuro `#0a0a0a`)

**Layout:**
```
[🏆 Série X • TIPO DE JOGO]                [Badge Status]
[🕐 há X horas]
```

**Elementos:**
- Ícone troféu + número da série + tipo de jogo
- Badge de status (Ganhou/Pendente/Perdeu/Casada) alinhado à direita
- Data/horário da aposta abaixo

**Código:**
```jsx
<div className="bg-[#0a0a0a] px-4 py-3 border-b border-cinza-borda">
  <div className="flex items-center justify-between flex-wrap gap-2">
    <div className="flex items-center gap-2 flex-wrap">
      <Trophy size={14} className="text-verde-accent" />
      <span className="text-xs font-semibold text-verde-neon">
        Série {serie?.serie_number || '-'}
      </span>
      <span className="text-xs text-texto-desabilitado">•</span>
      <span className="text-xs text-texto-secundario">
        {match?.game_rules?.game_type || 'Sinuca'}
      </span>
    </div>
    
    {/* Status Badge */}
    <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${statusInfo.color}`}>
      <StatusIcon size={12} />
      <span className="text-xs font-bold">{statusInfo.text}</span>
    </div>
  </div>
  
  {/* Data da aposta */}
  <div className="flex items-center gap-1 mt-2">
    <Clock size={10} className="text-texto-desabilitado" />
    <span className="text-[10px] text-texto-desabilitado">
      {getTimeAgo(bet.placed_at)}
    </span>
  </div>
</div>
```

---

#### 2. **Conteúdo Principal** (Fundo `#1a1a1a`)

**Layout:**
```
        Jogador 1 vs Jogador 2
        
[🎯 Apostou em]    [💰 Valor Apostado]
[  Jogador X  ]    [    R$ XX,XX     ]

[Retorno Possível] [Você Ganhou] (se aplicável)
```

**Estrutura:**
- **Matchup centralizado** - Nome dos jogadores em destaque
- **Grid 2 colunas** com bordas e fundo escuro:
  - Coluna 1: Jogador escolhido com ícone de alvo
  - Coluna 2: Valor apostado
- **Grid adicional** (quando aplicável):
  - Retorno possível (verde)
  - Valor ganho (verde destaque)

**Código:**
```jsx
<div className="p-4">
  {/* Matchup */}
  <h3 className="mb-3 text-center text-lg font-bold text-texto-principal">
    {player1} <span className="text-texto-desabilitado">vs</span> {player2}
  </h3>

  {/* Informações da Aposta - Grid 2 colunas */}
  <div className="grid grid-cols-2 gap-4 mb-4">
    {/* Apostou em */}
    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-cinza-borda">
      <div className="flex items-center gap-2 mb-1">
        <Target size={14} className="text-verde-neon" />
        <p className="text-[10px] text-texto-secundario uppercase">Apostou em</p>
      </div>
      <p className="text-sm font-bold text-verde-accent">
        {chosenPlayer}
      </p>
    </div>

    {/* Valor Apostado */}
    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-cinza-borda">
      <p className="text-[10px] text-texto-secundario uppercase mb-1">Valor Apostado</p>
      <p className="text-sm font-bold text-white">
        {formatCurrency(bet.amount)}
      </p>
    </div>
  </div>

  {/* Retornos (se aplicável) */}
  {(bet.potential_return || bet.payout_amount > 0) && (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {bet.potential_return && (
        <div className="bg-green-900/10 rounded-lg p-3 border border-green-500/20">
          <p className="text-[10px] text-green-400 uppercase mb-1">Retorno Possível</p>
          <p className="text-sm font-bold text-green-400">
            {formatCurrency(bet.potential_return)}
          </p>
        </div>
      )}
      {bet.payout_amount > 0 && (
        <div className="bg-green-900/10 rounded-lg p-3 border border-green-500/20">
          <p className="text-[10px] text-green-400 uppercase mb-1">Você Ganhou</p>
          <p className="text-sm font-bold text-green-400">
            {formatCurrency(bet.payout_amount)}
          </p>
        </div>
      )}
    </div>
  )}
</div>
```

---

#### 3. **Rodapé do Card** (Fundo Escuro `#0a0a0a`)

**Layout:**
```
[Status da Série: 🟢 Liberada]    [Ver Partida →]
```

**Elementos:**
- Status da série com cor apropriada (Verde/Amarelo/Vermelho)
- Link para ver detalhes da partida

**Código:**
```jsx
<div className="bg-[#0a0a0a] px-4 py-3 border-t border-cinza-borda">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xs text-texto-secundario">Status da Série:</span>
      <span className={`text-xs font-semibold ${statusColor}`}>
        {statusIcon} {statusText}
      </span>
    </div>

    {/* Link para a partida */}
    {match?.id && (
      <Link href={`/partidas/${match.id}`}>
        <span className="text-xs font-semibold text-verde-accent hover:text-verde-neon transition-colors cursor-pointer">
          Ver Partida →
        </span>
      </Link>
    )}
  </div>
</div>
```

---

## Melhorias de UX

### 1. **Hierarquia Visual Clara**
- Cabeçalho com fundo mais escuro separa metadados
- Conteúdo principal em fundo médio destaca informações importantes
- Rodapé em fundo escuro agrupa ações secundárias

### 2. **Alinhamento Consistente**
- Todos os elementos alinhados em grid
- Espaçamento uniforme entre seções
- Bordas e separadores bem definidos

### 3. **Responsividade**
- Grid adapta automaticamente para mobile
- Flex-wrap para evitar overflow
- Tamanhos de fonte otimizados

### 4. **Cores e Contraste**
- Fundos escuros (`#0a0a0a`) para destacar informações
- Verde para valores positivos (ganhos, retornos)
- Cores de status bem definidas
- Alto contraste para legibilidade

---

## Comparação Antes vs Depois

### **Antes:**
- ❌ Layout em linha única (difícil de ler)
- ❌ Informações misturadas
- ❌ Sem separação clara de seções
- ❌ Alinhamento inconsistente

### **Depois:**
- ✅ Layout em seções bem definidas
- ✅ Informações organizadas em grid
- ✅ Separação visual com fundos diferentes
- ✅ Alinhamento perfeito e consistente
- ✅ Mais fácil de escanear visualmente

---

## Arquivos Modificados

- **`frontend/pages/apostas.js`**
  - Reestruturação completa do JSX dos cards
  - Novo sistema de grid 2 colunas
  - Cabeçalho e rodapé com fundos escuros
  - Melhor organização de informações

---

## Testes Realizados

✅ **Layout Reorganizado:** Cards com 3 seções bem definidas
✅ **Alinhamento:** Todos os elementos perfeitamente alinhados
✅ **Responsividade:** Grid adapta para diferentes tamanhos
✅ **Legibilidade:** Informações claras e fáceis de encontrar

---

## Status Final

🎉 **UI completamente reorganizada e melhorada!**

- ✅ Cards com layout estruturado
- ✅ Alinhamento perfeito
- ✅ Seções bem definidas
- ✅ Visual profissional e limpo



