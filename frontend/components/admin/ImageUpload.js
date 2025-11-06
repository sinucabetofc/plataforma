import { useState } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Componente de Upload de Imagem
 * Suporta:
 * 1. Upload direto via URL
 * 2. Preview da imagem
 * 3. Conversão para base64 (opcional para futuro upload)
 */
export default function ImageUpload({ value, onChange, label }) {
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('url'); // 'url' ou 'file'
  const [isDragging, setIsDragging] = useState(false);

  // Handle URL manual
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Digite uma URL válida');
      return;
    }

    // Validar se é uma URL de imagem
    if (!urlInput.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) && !urlInput.includes('placeholder') && !urlInput.includes('pravatar') && !urlInput.includes('ui-avatars')) {
      toast.error('URL deve apontar para uma imagem (jpg, png, gif, svg)');
      return;
    }

    setPreviewUrl(urlInput);
    onChange(urlInput);
    toast.success('Imagem adicionada!');
  };

  // Processar arquivo (usado por upload e drag & drop)
  const processFile = (file) => {
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande! Máximo 5MB');
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setPreviewUrl(base64);
      onChange(base64);
      toast.success('Imagem carregada!');
    };
    reader.readAsDataURL(file);
  };

  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Remover imagem
  const handleRemove = () => {
    setPreviewUrl('');
    setUrlInput('');
    onChange('');
    toast.success('Imagem removida');
  };

  // Sugestões de URLs de placeholder
  const placeholderSuggestions = [
    'https://i.pravatar.cc/150',
    'https://ui-avatars.com/api/?name=Jogador&size=150&background=27E502&color=000',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player',
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-admin-text-primary">
        {label || 'Foto do Jogador'}
      </label>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-black">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'url'
              ? 'text-admin-green border-b-2 border-admin-green'
              : 'text-admin-text-secondary hover:text-admin-text-primary'
          }`}
        >
          <LinkIcon className="inline mr-2" size={16} />
          URL da Imagem
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'file'
              ? 'text-admin-green border-b-2 border-admin-green'
              : 'text-admin-text-secondary hover:text-admin-text-primary'
          }`}
        >
          <Upload className="inline mr-2" size={16} />
          Upload de Arquivo
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="mt-4">
        {activeTab === 'url' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                className="flex-1 px-4 py-2 bg-admin-gray-dark border border-black rounded-lg text-admin-text-primary focus:outline-none focus:border-admin-green"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-admin-green text-admin-black rounded-lg hover:brightness-110 transition-all font-medium"
              >
                Adicionar
              </button>
            </div>

            {/* Sugestões de Placeholder */}
            <div className="text-xs text-admin-text-muted">
              <p className="mb-2">💡 Sugestões de placeholders:</p>
              <div className="flex flex-wrap gap-2">
                {placeholderSuggestions.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setUrlInput(url);
                      setPreviewUrl(url);
                      onChange(url);
                      toast.success('Placeholder adicionado!');
                    }}
                    className="px-2 py-1 bg-admin-gray-dark text-admin-text-secondary rounded hover:bg-admin-gray-light hover:text-admin-green transition-colors text-xs"
                  >
                    Avatar {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-admin-text-muted">
              📌 Cole a URL de uma imagem já hospedada na web (Imgur, Google Photos, Cloudinary, etc)
            </p>
          </div>
        )}

        {activeTab === 'file' && (
          <div className="space-y-3">
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragging
                  ? 'border-admin-green bg-admin-green/10 scale-105'
                  : 'border-black hover:border-admin-green'
              }`}
            >
              <Upload 
                className={`mx-auto mb-3 transition-all ${
                  isDragging ? 'text-admin-green scale-110' : 'text-admin-text-muted'
                }`} 
                size={32} 
              />
              <label className="cursor-pointer block">
                <span className={`text-sm ${
                  isDragging ? 'text-admin-green font-semibold' : 'text-admin-text-secondary'
                }`}>
                  {isDragging ? '📥 Solte a imagem aqui!' : 'Clique para selecionar ou arraste uma imagem'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-admin-text-muted mt-2">
                PNG, JPG, GIF até 5MB
              </p>
            </div>
            <p className="text-xs text-status-warning">
              ⚠️ A imagem será convertida para Base64. Para melhor performance, recomendamos usar URLs externas.
            </p>
          </div>
        )}
      </div>

      {/* Preview da Imagem */}
      {previewUrl && (
        <div className="mt-4 p-4 bg-admin-gray-dark rounded-lg border border-black">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-admin-text-primary">Preview:</span>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-status-error hover:bg-status-error/20 rounded transition-colors"
              title="Remover imagem"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-admin-green"
              onError={(e) => {
                e.target.src = 'https://ui-avatars.com/api/?name=Erro&size=150&background=ff0000&color=fff';
                toast.error('Erro ao carregar imagem. Tente outra URL.');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

