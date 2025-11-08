/**
 * ============================================================
 * Parceiros - Perfil
 * ============================================================
 */

import { useState } from 'react';
import { User, Mail, Phone, CreditCard, Camera, Save } from 'lucide-react';
import useInfluencerStore from '../../../store/influencerStore';
import toast from 'react-hot-toast';

export default function ParceirosPerfil() {
  const { influencer } = useInfluencerStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: influencer?.name || '',
    email: influencer?.email || '',
    phone: influencer?.phone || '',
    photo_url: influencer?.photo_url || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implementar update do perfil
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
          Meu Perfil
        </h1>
        <p className="text-admin-text-secondary">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Profile Photo */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          Foto do Perfil
        </h3>
        
        <div className="flex items-center gap-6">
          {formData.photo_url ? (
            <img
              src={formData.photo_url}
              alt="Foto do perfil"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#27E502]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#27E502] flex items-center justify-center">
              <span className="text-admin-black font-bold text-3xl">
                {formData.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <button className="admin-btn-secondary">
            <Camera size={20} />
            Alterar Foto
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          Informações Pessoais
        </h3>

        <div className="space-y-4">
          <div>
            <label className="admin-label">
              <User size={16} className="inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">
              <Mail size={16} className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="admin-input opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-admin-text-muted mt-1">
              O email não pode ser alterado
            </p>
          </div>

          <div>
            <label className="admin-label">
              <Phone size={16} className="inline mr-2" />
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* PIX Information */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          <CreditCard size={20} className="inline mr-2" />
          Informações de Pagamento
        </h3>

        <div className="space-y-4">
          <div>
            <label className="admin-label">Tipo de Chave PIX</label>
            <select className="admin-select" disabled>
              <option>{influencer?.pix_type || 'CPF'}</option>
            </select>
          </div>

          <div>
            <label className="admin-label">Chave PIX</label>
            <input
              type="text"
              value={influencer?.pix_key || ''}
              disabled
              className="admin-input opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-admin-text-muted mt-1">
              Para alterar dados de pagamento, entre em contato com o suporte
            </p>
          </div>

          <div className="p-4 bg-admin-gray-light rounded-lg border border-[#27E502]">
            <p className="text-sm text-admin-text-primary">
              <strong>Comissão:</strong> {influencer?.commission_percentage || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="admin-btn-primary"
        >
          <Save size={20} />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}

