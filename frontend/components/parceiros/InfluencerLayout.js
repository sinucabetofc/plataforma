import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useInfluencerStore from '../../store/influencerStore';
import { Home, Trophy, User, LogOut, Star, Menu, X } from 'lucide-react';

export default function InfluencerLayout({ children }) {
  const router = useRouter();
  const { influencer, isAuthenticated, logout, fetchInfluencer } = useInfluencerStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/parceiros/login');
      return;
    }

    // Buscar dados do influencer se não tiver
    if (!influencer) {
      fetchInfluencer();
    }
  }, [isAuthenticated, influencer, router, fetchInfluencer]);

  const handleLogout = () => {
    logout();
    router.push('/parceiros/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/parceiros/dashboard', icon: Home },
    { name: 'Meus Jogos', href: '/parceiros/jogos', icon: Trophy },
    { name: 'Perfil', href: '/parceiros/perfil', icon: User },
  ];

  if (!isAuthenticated || !influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">
          <svg className="animate-spin h-8 w-8 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-400 text-center">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-700">
            <Star className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-white">Painel Parceiro</h1>
              <p className="text-xs text-gray-400">SinucaBet</p>
            </div>
          </div>

          {/* Profile */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center">
              {influencer.photo_url ? (
                <img
                  src={influencer.photo_url}
                  alt={influencer.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-yellow-600 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {influencer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{influencer.name}</p>
                <p className="text-xs text-gray-400">{influencer.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
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

          {/* Logout */}
          <div className="p-3 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            <span className="text-white font-semibold">Painel Parceiro</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-gray-800 border-t border-gray-700">
            <nav className="px-2 py-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
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
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

