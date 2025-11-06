import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Users, Trophy, DollarSign, TrendingUp, UserCircle } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Usuários', href: '/users', icon: Users },
    { name: 'Jogadores', href: '/players', icon: UserCircle },
    { name: 'Partidas', href: '/games', icon: Trophy },
    { name: 'Apostas', href: '/bets', icon: TrendingUp },
    { name: 'Saques', href: '/withdrawals', icon: DollarSign },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 py-6">
          <h1 className="text-2xl font-bold text-white">SinucaBet Admin</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
