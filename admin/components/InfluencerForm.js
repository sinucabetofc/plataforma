import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function InfluencerForm({ influencer, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    photo_url: '',
    pix_key: '',
    commission_percentage: 0,
    is_active: true,
    social_media: {
      instagram: '',
      youtube: '',
      twitch: '',
      tiktok: ''
    }
  });

  useEffect(() => {
    if (influencer) {
      setFormData({
        name: influencer.name || '',
        email: influencer.email || '',
        password: '', // Não preencher senha na edição
        phone: influencer.phone || '',
        photo_url: influencer.photo_url || '',
        pix_key: influencer.pix_key || '',
        commission_percentage: influencer.commission_percentage || 0,
        is_active: influencer.is_active !== undefined ? influencer.is_active : true,
        social_media: influencer.social_media || {
          instagram: '',
          youtube: '',
          twitch: '',
          tiktok: ''
        }
      });
    }
  }, [influencer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Se for edição e não tiver senha, remover do payload
    const submitData = { ...formData };
    if (influencer && !submitData.password) {
      delete submitData.password;
    }
    
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {influencer ? 'Editar Influencer' : 'Novo Influencer'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {influencer ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!influencer}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+5511999999999"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                URL da Foto (opcional)
              </label>
              <input
                type="url"
                name="photo_url"
                value={formData.photo_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dados Financeiros */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white">Dados Financeiros</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Chave PIX *
              </label>
              <input
                type="text"
                name="pix_key"
                value={formData.pix_key}
                onChange={handleChange}
                required
                placeholder="email@example.com ou CPF ou telefone"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Comissão (%) *
              </label>
              <input
                type="number"
                name="commission_percentage"
                value={formData.commission_percentage}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Percentual de comissão sobre o lucro da casa por jogo
              </p>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white">Redes Sociais (opcional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.social_media.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="@usuario"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  YouTube
                </label>
                <input
                  type="text"
                  value={formData.social_media.youtube}
                  onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                  placeholder="@canal"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Twitch
                </label>
                <input
                  type="text"
                  value={formData.social_media.twitch}
                  onChange={(e) => handleSocialMediaChange('twitch', e.target.value)}
                  placeholder="usuario"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  TikTok
                </label>
                <input
                  type="text"
                  value={formData.social_media.tiktok}
                  onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                  placeholder="@usuario"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="pt-4 border-t border-gray-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-300">
                Influencer ativo
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : influencer ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

