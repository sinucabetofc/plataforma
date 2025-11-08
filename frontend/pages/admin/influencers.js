/**
 * ============================================================
 * Influencers Page - Gestão de Influencers/Parceiros
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Star, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { get, post, patch, del } from '../../utils/api';
import { maskPhone, maskCPF } from '../../utils/formatters';
import Loader from '../../components/admin/Loader';
import ImageUpload from '../../components/admin/ImageUpload';

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    photo_url: '',
    pix_key: '',
    pix_type: 'cpf', // Tipo padrão
    commission_percentage: '',
    is_active: true,
    social_media: {
      instagram: '',
      youtube: '',
      twitch: '',
      tiktok: ''
    }
  });

  // Buscar influencers
  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== 'all') {
        params.append('is_active', filterActive === 'active');
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await get(`/admin/influencers?${params.toString()}`);
      setInfluencers(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar influencers:', error);
      toast.error('Erro ao carregar influencers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [filterActive, searchTerm]);

  // Abrir modal para criar/editar
  const handleOpenModal = (influencer = null) => {
    if (influencer) {
      setEditingInfluencer(influencer);
      setFormData({
        name: influencer.name,
        email: influencer.email,
        password: '', // Não preencher senha na edição
        phone: influencer.phone,
        photo_url: influencer.photo_url || '',
        pix_key: influencer.pix_key,
        pix_type: influencer.pix_type || 'cpf',
        commission_percentage: influencer.commission_percentage || 5,
        is_active: influencer.is_active,
        social_media: influencer.social_media || {
          instagram: '',
          youtube: '',
          twitch: '',
          tiktok: ''
        }
      });
    } else {
      setEditingInfluencer(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        photo_url: '',
        pix_key: '',
        pix_type: 'cpf',
        commission_percentage: '',
        is_active: true,
        social_media: {
          instagram: '',
          youtube: '',
          twitch: '',
          tiktok: ''
        }
      });
    }
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInfluencer(null);
  };

  // Salvar influencer
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Se for edição e não tiver senha, remover do payload
      const submitData = { ...formData };
      if (editingInfluencer && !submitData.password) {
        delete submitData.password;
      }

      // Remover máscara do telefone (deixar apenas números)
      if (submitData.phone) {
        const cleanPhone = submitData.phone.replace(/\D/g, '');
        // Adicionar +55 se não tiver
        submitData.phone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
      }

      // Remover máscara do PIX se for CPF ou telefone
      if (submitData.pix_key) {
        if (submitData.pix_type === 'cpf' || submitData.pix_type === 'phone') {
          submitData.pix_key = submitData.pix_key.replace(/\D/g, '');
          
          // Se for telefone, adicionar +55
          if (submitData.pix_type === 'phone') {
            const cleanPix = submitData.pix_key;
            submitData.pix_key = cleanPix.startsWith('55') ? `+${cleanPix}` : `+55${cleanPix}`;
          }
        }
      }

      if (editingInfluencer) {
        await patch(`/admin/influencers/${editingInfluencer.id}`, submitData);
        toast.success('Influencer atualizado!');
      } else {
        await post('/admin/influencers', submitData);
        toast.success('Influencer cadastrado!');
      }

      handleCloseModal();
      fetchInfluencers();
    } catch (error) {
      console.error('Erro ao salvar influencer:', error);
      toast.error(error.message || 'Erro ao salvar influencer');
    } finally {
      setSaving(false);
    }
  };

  // Deletar/Desativar influencer
  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja desativar ${name}?`)) return;

    try {
      await del(`/admin/influencers/${id}`);
      toast.success('Influencer desativado!');
      fetchInfluencers();
    } catch (error) {
      console.error('Erro ao desativar influencer:', error);
      toast.error(error.message || 'Erro ao desativar influencer');
    }
  };

  // Toggle ativo/inativo
  const handleToggleActive = async (influencer) => {
    try {
      await patch(`/admin/influencers/${influencer.id}`, {
        is_active: !influencer.is_active
      });
      toast.success(`Influencer ${!influencer.is_active ? 'ativado' : 'desativado'}!`);
      fetchInfluencers();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-admin-text-primary flex items-center gap-2">
            <Star className="text-status-warning" size={32} />
            Gerenciar Influencers
          </h1>
          <p className="text-admin-text-secondary mt-1 text-sm sm:text-base">
            Cadastre e gerencie os influencers/parceiros que transmitem jogos
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-status-warning text-admin-black rounded-lg hover:brightness-110 transition-all font-semibold"
        >
          <Plus size={20} />
          Novo Influencer
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-text-muted" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-10"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterActive === 'all'
                ? 'bg-admin-green text-admin-black'
                : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterActive === 'active'
                ? 'bg-admin-green text-admin-black'
                : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filterActive === 'inactive'
                ? 'bg-admin-green text-admin-black'
                : 'bg-admin-gray-light text-admin-text-secondary hover:bg-admin-gray-dark'
            }`}
          >
            Inativos
          </button>
        </div>
      </div>

      {/* Lista de Influencers */}
      {loading ? (
        <div className="py-12">
          <Loader size="lg" />
        </div>
      ) : influencers.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Star className="mx-auto mb-4 text-admin-text-muted" size={48} />
          <p className="text-admin-text-secondary">
            {searchTerm || filterActive !== 'all'
              ? 'Nenhum influencer encontrado com os filtros aplicados'
              : 'Nenhum influencer cadastrado ainda'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map((influencer) => (
            <div key={influencer.id} className="admin-card hover:border-status-warning">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {influencer.photo_url ? (
                    <img
                      src={influencer.photo_url}
                      alt={influencer.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-status-warning"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-status-warning flex items-center justify-center">
                      <span className="text-admin-black font-bold text-xl">
                        {influencer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-admin-text-primary">
                      {influencer.name}
                    </h3>
                    <p className="text-xs text-admin-text-muted">
                      {influencer.email}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <button
                  onClick={() => handleToggleActive(influencer)}
                  className={`status-badge ${
                    influencer.is_active ? 'status-success' : 'status-error'
                  }`}
                >
                  {influencer.is_active ? (
                    <>
                      <CheckCircle size={14} className="mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="mr-1" />
                      Inativo
                    </>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-admin-text-muted">Telefone:</span>
                  <span className="text-admin-text-primary">{influencer.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-admin-text-muted">PIX:</span>
                  <span className="text-admin-text-primary text-xs">{influencer.pix_key}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-admin-text-muted">Comissão:</span>
                  <span className="text-status-warning font-bold">
                    {influencer.commission_percentage}%
                  </span>
                </div>
              </div>

              {/* Stats (se tiver) */}
              {influencer.stats && (
                <div className="pt-4 border-t border-admin-gray-light">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-admin-text-muted text-xs">Jogos</p>
                      <p className="text-admin-text-primary font-semibold">
                        {influencer.stats.total_matches || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-admin-text-muted text-xs">Comissões</p>
                      <p className="text-status-warning font-semibold">
                        R$ {(influencer.stats.total_commissions || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-admin-gray-light">
                <button
                  onClick={() => handleOpenModal(influencer)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-admin-gray-light text-admin-text-primary rounded-lg hover:bg-admin-green hover:text-admin-black transition-all"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(influencer.id, influencer.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-admin-gray-light text-status-error rounded-lg hover:bg-status-error hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                  Desativar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-gray-medium border border-admin-gray-light rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-admin-gray-light">
              <h2 className="text-xl font-bold text-admin-text-primary">
                {editingInfluencer ? 'Editar Influencer' : 'Novo Influencer'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-admin-text-muted hover:text-admin-green"
              >
                <Trash2 size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-admin-text-primary border-b border-admin-gray-light pb-2">
                  Informações Básicas
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                      {editingInfluencer ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingInfluencer}
                      placeholder={editingInfluencer ? '(manter atual)' : ''}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      setFormData({...formData, phone: masked});
                    }}
                    required
                    placeholder="(11) 99999-9999"
                    maxLength="15"
                  />
                  <p className="text-xs text-admin-text-muted mt-1">
                    Formato: (11) 99999-9999
                  </p>
                </div>

                <div>
                  <ImageUpload
                    label="Foto do Influencer (opcional)"
                    value={formData.photo_url}
                    onChange={(url) => setFormData({...formData, photo_url: url})}
                  />
                </div>
              </div>

              {/* Dados Financeiros */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-admin-text-primary border-b border-admin-gray-light pb-2">
                  Dados Financeiros
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tipo de Chave PIX */}
                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                      Tipo de Chave PIX *
                    </label>
                    <select
                      className="select"
                      value={formData.pix_type}
                      onChange={(e) => {
                        setFormData({...formData, pix_type: e.target.value, pix_key: ''});
                      }}
                      required
                    >
                      <option value="cpf">CPF</option>
                      <option value="email">Email</option>
                      <option value="phone">Telefone</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </div>

                  {/* Chave PIX com Máscara */}
                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                      Chave PIX *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.pix_key}
                      onChange={(e) => {
                        let value = e.target.value;
                        
                        // Aplicar máscara baseada no tipo
                        if (formData.pix_type === 'cpf') {
                          value = maskCPF(value);
                        } else if (formData.pix_type === 'phone') {
                          value = maskPhone(value);
                        }
                        
                        setFormData({...formData, pix_key: value});
                      }}
                      required
                      placeholder={
                        formData.pix_type === 'cpf' ? '000.000.000-00' :
                        formData.pix_type === 'email' ? 'exemplo@email.com' :
                        formData.pix_type === 'phone' ? '(11) 99999-9999' :
                        'Chave aleatória do Banco'
                      }
                      maxLength={
                        formData.pix_type === 'cpf' ? 14 :
                        formData.pix_type === 'phone' ? 15 :
                        undefined
                      }
                    />
                    <p className="text-xs text-admin-text-muted mt-1">
                      {formData.pix_type === 'cpf' && '💳 Formato: 000.000.000-00'}
                      {formData.pix_type === 'email' && '📧 Use um email válido'}
                      {formData.pix_type === 'phone' && '📱 Formato: (11) 99999-9999'}
                      {formData.pix_type === 'random' && '🔑 Cole a chave aleatória do banco'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                    Comissão (%) *
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.commission_percentage}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({...formData, commission_percentage: value});
                    }}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Ex: 5"
                  />
                  <p className="text-xs text-admin-text-muted mt-1">
                    Percentual sobre o lucro da casa por jogo
                  </p>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-admin-text-primary border-b border-admin-gray-light pb-2">
                  Redes Sociais (opcional)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.social_media.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: {...formData.social_media, instagram: e.target.value}
                      })}
                      placeholder="@usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                      YouTube
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.social_media.youtube}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: {...formData.social_media, youtube: e.target.value}
                      })}
                      placeholder="@canal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                      Twitch
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.social_media.twitch}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: {...formData.social_media, twitch: e.target.value}
                      })}
                      placeholder="usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                      TikTok
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.social_media.tiktok}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_media: {...formData.social_media, tiktok: e.target.value}
                      })}
                      placeholder="@usuario"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-admin-text-secondary">
                    Influencer ativo
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-admin-gray-light">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="spinner-sm" />
                      Salvando...
                    </>
                  ) : (
                    editingInfluencer ? 'Atualizar' : 'Criar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

