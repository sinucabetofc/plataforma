import { useRouter } from 'next/router';
import { useAdminStore } from '../store/adminStore';
import { LogOut, User } from 'lucide-react';

export default function Topbar() {
  const router = useRouter();
  const { admin, logout } = useAdminStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 lg:pl-0">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Painel Administrativo
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {admin && (
            <div className="flex items-center space-x-2 text-gray-300">
              <User className="h-5 w-5" />
              <span className="text-sm">{admin.email || admin.username}</span>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
