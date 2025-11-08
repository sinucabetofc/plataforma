/**
 * ============================================================
 * Admin Mobile Nav - Navbar Mobile do Admin
 * ============================================================
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, Trophy, Target, DollarSign, Star } from 'lucide-react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Usuários',
    href: '/admin/users',
    icon: Users,
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
];

export default function MobileNav() {
  const router = useRouter();

  const isActive = (href) => {
    if (href === '/admin') {
      return router.pathname === '/admin';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-admin-gray-medium border-t border-black z-40">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                transition-all duration-200 min-w-0 flex-1
                ${active
                  ? 'bg-[#27E502] text-admin-black'
                  : 'text-admin-text-secondary active:bg-admin-gray-light'
                }
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

