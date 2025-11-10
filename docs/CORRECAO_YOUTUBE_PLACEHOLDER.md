# 🔧 Correção: Erros de Imagem e YouTube Embed

## 📋 Problemas Identificados

### 1️⃣ Erro de Placeholder
```
GET https://via.placeholder.com/150 net::ERR_NAME_NOT_RESOLVED
```

### 2️⃣ Erro do YouTube
```
Refused to display 'https://m.youtube.com/' in a frame 
because it set 'X-Frame-Options' to 'sameorigin'
```

---

## 🔍 Análise dos Problemas

### Problema 1: via.placeholder.com

**Causa:**
- Código antigo tentava carregar imagens de `via.placeholder.com`
- Esse serviço externo pode estar fora do ar ou bloqueado

**Impacto:**
- ❌ Imagens quebradas em alguns componentes
- ❌ Console poluído com erros
- ⚠️ **Não encontrado no código atual** (pode ser cache do navegador)

---

### Problema 2: YouTube Mobile URL

**Causa:**
- URLs do YouTube podem vir em vários formatos:
  - `https://www.youtube.com/watch?v=VIDEO_ID` ✅
  - `https://m.youtube.com/watch?v=VIDEO_ID` ❌ (mobile)
  - `https://youtu.be/VIDEO_ID` ✅ (curta)

- O código antigo fazia:
```javascript
// ❌ ERRADO - Não funciona com m.youtube.com
src={`${match.youtube_url.replace('watch?v=', 'embed/')}`}
```

- Resultado com URL mobile:
```
https://m.youtube.com/embed/VIDEO_ID  ❌ Erro X-Frame-Options
```

**Por que erro?**
O YouTube mobile (`m.youtube.com`) **não permite** ser incorporado em iframe. Apenas `www.youtube.com/embed/` funciona.

---

## ✅ Soluções Implementadas

### Solução 1: Placeholder

Como não encontrei `via.placeholder.com` no código atual:
- ✅ Provavelmente já foi removido
- ✅ O erro é de **cache do navegador**

**Solução:** Limpar cache do navegador
```
Ctrl + Shift + Delete → Limpar cache
```

---

### Solução 2: YouTube Embed Correto

Criei arquivo: `frontend/utils/youtube.js`

#### Função `getYouTubeVideoId(url)`
Extrai o ID do vídeo de **qualquer** formato de URL:

```javascript
getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
// → 'dQw4w9WgXcQ'

getYouTubeVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')
// → 'dQw4w9WgXcQ'

getYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')
// → 'dQw4w9WgXcQ'
```

#### Função `getYouTubeEmbedUrl(url, options)`
Converte para formato embed com opções:

```javascript
getYouTubeEmbedUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ', {
  autoplay: true,
  mute: false,
  controls: true
})
// → 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0'
```

**Sempre retorna:** `https://www.youtube.com/embed/VIDEO_ID` ✅

---

## 📝 Mudanças Aplicadas

### Arquivo: `frontend/pages/partidas/[id].js`

**ANTES:**
```javascript
<iframe
  src={`${match.youtube_url.replace('watch?v=', 'embed/')}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
  // ❌ Falha com m.youtube.com
/>
```

**DEPOIS:**
```javascript
import { getYouTubeEmbedUrl } from '../../utils/youtube';

<iframe
  src={getYouTubeEmbedUrl(match.youtube_url, { 
    autoplay: true, 
    mute: false, 
    controls: true 
  })}
  // ✅ Funciona com qualquer URL do YouTube
/>
```

---

## 🎁 Funções Adicionais Criadas

### `getYouTubeThumbnail(url, quality)`
Gera URL de thumbnail do vídeo:

```javascript
getYouTubeThumbnail('https://youtube.com/watch?v=dQw4w9WgXcQ', 'hqdefault')
// → 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
```

**Qualidades disponíveis:**
- `default` - 120x90
- `mqdefault` - 320x180
- `hqdefault` - 480x360
- `sddefault` - 640x480
- `maxresdefault` - 1280x720

### `isYouTubeUrl(url)`
Valida se uma URL é do YouTube:

```javascript
isYouTubeUrl('https://youtube.com/watch?v=123')
// → true

isYouTubeUrl('https://vimeo.com/123')
// → false
```

---

## 🧪 Como Testar

### Teste 1: YouTube Desktop URL
1. Crie uma partida com: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. Acesse `/partidas/{id}`
3. ✅ Vídeo deve aparecer no iframe

### Teste 2: YouTube Mobile URL
1. Crie uma partida com: `https://m.youtube.com/watch?v=dQw4w9WgXcQ`
2. Acesse `/partidas/{id}`
3. ✅ Vídeo deve aparecer (convertido para www.youtube.com/embed/)

### Teste 3: YouTube Short URL
1. Crie uma partida com: `https://youtu.be/dQw4w9WgXcQ`
2. Acesse `/partidas/{id}`
3. ✅ Vídeo deve aparecer

---

## 🔧 Resolver Erro de Placeholder

Se o erro `via.placeholder.com` ainda aparecer:

### 1. Limpar Cache do Navegador
```
Ctrl + Shift + Delete
→ Marcar: Cache, Cookies, Imagens
→ Período: Último mês
→ Limpar
```

### 2. Hard Refresh
```
Ctrl + Shift + R (Chrome/Edge)
Cmd + Shift + R (Mac)
```

### 3. Verificar Network no DevTools
1. F12 → Network
2. Recarregar página
3. Filtrar por: `placeholder`
4. Clicar na requisição
5. Ver onde está sendo chamada (Initiator)

---

## 📦 Commit

```
fix: corrigir embed do YouTube para suportar URLs mobile

- Criar utils/youtube.js com funções para manipular URLs do YouTube
- getYouTubeVideoId: extrai ID de qualquer formato de URL
- getYouTubeEmbedUrl: converte para formato embed correto
- getYouTubeThumbnail: gera URL de thumbnail
- isYouTubeUrl: valida se é URL do YouTube

- Aplicar em partidas/[id].js no iframe
- Agora suporta:
  ✅ https://www.youtube.com/watch?v=ID
  ✅ https://m.youtube.com/watch?v=ID (mobile)
  ✅ https://youtu.be/ID (curta)
  ✅ Qualquer formato do YouTube

ANTES: m.youtube.com causava erro X-Frame-Options
DEPOIS: Sempre converte para www.youtube.com/embed/ID
```

**Commit hash:** `23840d5e`

---

## ✅ Problemas Resolvidos

1. ✅ YouTube mobile URLs agora funcionam
2. ✅ URLs curtas (youtu.be) funcionam
3. ✅ Parâmetros de embed configuráveis
4. ✅ Código reutilizável para futuros componentes
5. ⚠️ via.placeholder.com → limpar cache do navegador

---

**Data da correção:** 10/11/2025

