/**
 * ============================================================
 * Parceiros Sidebar - Menu Lateral do Painel de Parceiros
 * ============================================================
 * Segue EXATAMENTE o padrão do Admin Sidebar
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Trophy, User, LogOut, Star, X, DollarSign } from 'lucide-react';
import useInfluencerStore from '../../store/influencerStore';
import { useState } from 'react';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/parceiros/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Meus Jogos',
    href: '/parceiros/jogos',
    icon: Trophy,
  },
  {
    name: 'Saque',
    href: '/parceiros/saques',
    icon: DollarSign,
  },
  {
    name: 'Perfil',
    href: '/parceiros/perfil',
    icon: User,
  },
];

export default function ParceirosSidebar() {
  const router = useRouter();
  const { influencer, logout } = useInfluencerStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
    router.push('/parceiros/login');
  };

  return (
    <>
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-admin-gray-medium border-r border-black
          transition-transform duration-300 ease-in-out z-50
          w-64 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#27E502] flex items-center justify-center">
              <Star className="text-admin-black" size={18} />
            </div>
            <span className="font-bold text-lg text-admin-text-primary">
              SinucaBet <span className="text-[#27E502]">Parceiros</span>
            </span>
          </div>
          
          {/* Botão fechar (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-admin-text-secondary hover:text-[#27E502]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${active 
                    ? 'bg-[#27E502] text-white font-medium' 
                    : 'text-admin-text-secondary hover:bg-admin-gray-light hover:text-[#27E502]'
                  }
                `}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Logout + Version */}
        <div className="border-t border-black">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 text-admin-text-secondary hover:bg-admin-gray-light hover:text-status-error transition-all duration-200"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span>Sair</span>
          </button>
          
          {/* Version */}
          <div className="px-4 py-3 border-t border-black">
            <div className="text-xs text-admin-text-muted text-center">
              <p>SinucaBet Parceiros</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

