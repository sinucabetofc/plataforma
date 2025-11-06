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

  // Handle URL manual
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Digite uma URL válida');
      return;
    }

    // Validar se é uma URL de imagem
    if (!urlInput.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) && !urlInput.includes('placeholder')) {
      toast.error('URL deve apontar para uma imagem (jpg, png, gif, svg)');
      return;
    }

    setPreviewUrl(urlInput);
    onChange(urlInput);
    toast.success('Imagem adicionada!');
  };

  // Handle file upload (converter para base64 ou fazer upload para serviço)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
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
      
      // Por enquanto, converter para base64
      // No futuro, podemos fazer upload para Cloudinary/Imgur aqui
      onChange(base64);
      toast.success('Imagem carregada!');
    };
    reader.readAsDataURL(file);
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
    'https://ui-avatars.com/api/?name=Jogador&size=150&background=27E502&color=000',
    'https://i.pravatar.cc/150',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player',
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {label || 'Foto do Jogador'}
      </label>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'url'
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-gray-400 hover:text-gray-300'
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
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-gray-400 hover:text-gray-300'
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
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Adicionar
              </button>
            </div>

            {/* Sugestões de Placeholder */}
            <div className="text-xs text-gray-500">
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
                    className="px-2 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Placeholder {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              📌 Cole a URL de uma imagem já hospedada na web (Imgur, Google Photos, Cloudinary, etc)
            </p>
          </div>
        )}

        {activeTab === 'file' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
              <Upload className="mx-auto text-gray-500 mb-3" size={32} />
              <label className="cursor-pointer">
                <span className="text-sm text-gray-400">
                  Clique para selecionar ou arraste uma imagem
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-600 mt-2">
                PNG, JPG, GIF até 5MB
              </p>
            </div>
            <p className="text-xs text-yellow-500">
              ⚠️ A imagem será convertida para Base64. Para melhor performance, recomendamos usar URLs externas.
            </p>
          </div>
        )}
      </div>

      {/* Preview da Imagem */}
      {previewUrl && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Preview:</span>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-red-500 hover:bg-red-500/20 rounded transition-colors"
              title="Remover imagem"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-green-500"
              onError={(e) => {
                e.target.src = 'https://ui-avatars.com/api/?name=Erro&size=150&background=ff0000&color=fff';
                toast.error('Erro ao carregar imagem. Verifique a URL.');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

