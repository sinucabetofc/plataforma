/**
 * ============================================================
 * Sidebar Component - Menu Lateral
 * ============================================================
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle,
  Star,
  Trophy, 
  Target, 
  DollarSign, 
  FileText,
  X 
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Usuários',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Jogadores',
    href: '/admin/players',
    icon: UserCircle,
  },
  {
    name: 'Influencers',
    href: '/admin/influencers',
    icon: Star,
  },
  {
    name: 'Jogos',
    href: '/admin/games',
    icon: Trophy,
  },
  {
    name: 'Apostas',
    href: '/admin/bets',
    icon: Target,
  },
  {
    name: 'Saques',
    href: '/admin/withdrawals',
    icon: DollarSign,
  },
  {
    name: 'Transações',
    href: '/admin/transactions',
    icon: FileText,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, pendingWithdrawalsCount } = useAdminStore();

  const isActive = (href) => {
    return router.pathname === href;
  };

  return (
    <>
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-admin-gray-medium border-r border-black
          transition-transform duration-300 ease-in-out z-50
          w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-admin-green flex items-center justify-center">
              <span className="text-admin-black font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-lg text-admin-text-primary">
              SinucaBet <span className="text-admin-green">Admin</span>
            </span>
          </div>
          
          {/* Botão fechar (mobile) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-admin-text-secondary hover:text-admin-green"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const showBadge = item.href === '/withdrawals' && pendingWithdrawalsCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${active 
                    ? 'bg-admin-green text-admin-black font-medium' 
                    : 'text-admin-text-secondary hover:bg-admin-gray-light hover:text-admin-green'
                  }
                `}
              >
                <Icon size={20} />
                <span className="flex-1">{item.name}</span>
                
                {/* Badge de notificação */}
                {showBadge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-status-error text-white">
                    {pendingWithdrawalsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black">
          <div className="text-xs text-admin-text-muted text-center">
            <p>SinucaBet Admin Panel</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

