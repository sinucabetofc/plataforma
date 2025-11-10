/**
 * ============================================================
 * YouTube Utils - Utilitários para vídeos do YouTube
 * ============================================================
 */

/**
 * Extrai o ID do vídeo de qualquer URL do YouTube
 * Suporta:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export function getYouTubeVideoId(url) {
  if (!url) return null;

  try {
    // Regex para extrair ID do vídeo
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[7].length === 11) ? match[7] : null;
  } catch (error) {
    console.error('Erro ao extrair ID do YouTube:', error);
    return null;
  }
}

/**
 * Converte qualquer URL do YouTube para formato embed
 * Retorna: https://www.youtube.com/embed/VIDEO_ID
 */
export function getYouTubeEmbedUrl(url, options = {}) {
  const videoId = getYouTubeVideoId(url);
  
  if (!videoId) {
    console.warn('URL do YouTube inválida:', url);
    return null;
  }

  // Parâmetros padrão
  const params = new URLSearchParams({
    autoplay: options.autoplay ? '1' : '0',
    mute: options.mute ? '1' : '0',
    controls: options.controls !== false ? '1' : '0',
    modestbranding: '1',
    rel: '0', // Não mostrar vídeos relacionados
    ...options.extraParams
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Converte URL do YouTube para thumbnail
 * Qualidades disponíveis: default, mqdefault, hqdefault, sddefault, maxresdefault
 */
export function getYouTubeThumbnail(url, quality = 'hqdefault') {
  const videoId = getYouTubeVideoId(url);
  
  if (!videoId) return null;

  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Verifica se uma URL é do YouTube
 */
export function isYouTubeUrl(url) {
  if (!url) return false;
  
  return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
}

