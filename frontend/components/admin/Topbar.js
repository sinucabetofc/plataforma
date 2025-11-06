/**
 * ============================================================
 * Topbar Component - Cabeçalho Superior
 * ============================================================
 */

import { Menu, LogOut, Bell } from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import { getUser, doLogout } from '../../utils/auth';
import { useState, useEffect } from 'react';

export default function Topbar() {
  const { toggleSidebar, pendingWithdrawalsCount } = useAdminStore();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const user = getUser();
    setAdmin(user);
  }, []);

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      // Limpar auth e redirecionar para login admin
      if (typeof window !== 'undefined') {
        localStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        window.location.href = '/admin/login';
      }
    }
  };

  return (
    <header className="h-16 bg-black border-b border-black fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Botão menu (mobile) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-admin-text-secondary hover:text-admin-green"
        >
          <Menu size={24} />
        </button>

        {/* Título da página (desktop) */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-admin-text-primary">
            Painel Administrativo
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notificações */}
          <button className="relative text-admin-text-secondary hover:text-admin-green transition-colors">
            <Bell size={20} />
            {pendingWithdrawalsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          {/* Separador */}
          <div className="w-px h-6 bg-black" />

          {/* Admin info */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-admin-text-primary">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-xs text-admin-text-muted">
                Administrador
              </p>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-admin-green flex items-center justify-center text-admin-black font-bold">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-black" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-admin-text-secondary hover:text-status-error transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
            <span className="hidden md:inline text-sm">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}

