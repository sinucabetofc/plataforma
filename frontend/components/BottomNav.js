import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Wallet, User, Trophy, TrendingUp } from 'lucide-react';
import SinucaIcon from './icons/SinucaIcon';

/**
 * Componente BottomNav - Navegação inferior para mobile
 */
export default function BottomNav() {
  const router = useRouter();

  // Itens do navbar - 5 itens para centralizar perfeitamente "Partidas"
  const navItems = [
    {
      href: '/home',
      icon: Home,
      label: 'Inicio',
      badge: null,
    },
    {
      href: '/wallet',
      icon: Wallet,
      label: 'Carteira',
    },
    {
      href: '/partidas',
      icon: SinucaIcon,
      label: 'Partidas',
      badge: null,
      customIcon: true,
      featured: true, // Botão central destacado
    },
    {
      href: '/apostas',
      icon: TrendingUp,
      label: 'Apostas',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Perfil',
    },
  ];

  const isActive = (href) => {
    if (href === '/home') {
      return router.pathname === '/home' || router.pathname === '/';
    }
    if (href === '/partidas') {
      return router.pathname === '/partidas' || router.pathname.startsWith('/partidas/');
    }
    if (href === '/apostas') {
      return router.pathname === '/apostas';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-verde-neon bg-[#0B0C0B] shadow-verde-strong md:hidden">
      <div className="flex items-end justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          // Botão Central Destacado (Jogos) - Estilo "Depositar"
          if (item.featured) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6 flex flex-col items-center justify-center"
              >
                {/* Círculo Grande Verde #27E502 Elevado */}
                <div 
                  className="flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#27E502', boxShadow: '0 25px 50px -12px rgba(39, 229, 2, 0.5)' }}
                >
                  <Icon 
                    size={56} 
                    active={false}
                    darkMode={true}
                    className="transition-transform"
                  />
                </div>

                {/* Label */}
                <span className="mt-2 text-xs font-semibold text-white">
                  {item.label}
                </span>
              </Link>
            );
          }

          // Botões Normais
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all ${
                active
                  ? 'bg-verde-medio/30 text-verde-neon'
                  : 'text-texto-secundario hover:text-verde-accent'
              }`}
            >
              {/* Badge (contador) */}
              {item.badge && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-verde-neon text-xs font-bold text-verde-escuro shadow-verde-neon">
                  {item.badge}
                </span>
              )}

              {/* Icon */}
              <Icon 
                size={22} 
                className={`transition-transform ${active ? 'scale-110' : ''}`}
                strokeWidth={active ? 2.5 : 2}
              />

              {/* Label */}
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>

              {/* Active Indicator */}
              {active && (
                <span className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-verde-neon shadow-verde-neon"></span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-[#0B0C0B]"></div>
    </nav>
  );
}

