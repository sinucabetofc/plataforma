/**
 * ============================================================
 * Parceiros Topbar - Barra Superior do Painel de Parceiros
 * ============================================================
 * Segue EXATAMENTE o padrão do Admin Topbar
 */

import { Menu, Bell } from 'lucide-react';
import useInfluencerStore from '../../store/influencerStore';

export default function ParceirosTopbar() {
  const { influencer } = useInfluencerStore();

  return (
    <header className="h-16 bg-admin-gray-medium border-b border-black flex items-center justify-between px-4 lg:px-6">
      {/* Título */}
      <div>
        <h1 className="text-lg lg:text-xl font-bold text-admin-text-primary">
          SinucaBet <span className="text-[#27E502]">Parceiros</span>
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-admin-text-secondary hover:text-[#27E502] transition-colors">
          <Bell size={20} />
          {/* Badge de notificações (se houver) */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-status-error rounded-full"></span> */}
        </button>

        {/* User info */}
        {influencer && (
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-admin-text-primary">
                {influencer.name}
              </p>
              <p className="text-xs text-admin-text-muted">
                Parceiro
              </p>
            </div>
            {influencer.photo_url ? (
              <img
                src={influencer.photo_url}
                alt={influencer.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#27E502]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#27E502] flex items-center justify-center">
                <span className="text-admin-black font-bold text-sm">
                  {influencer.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

