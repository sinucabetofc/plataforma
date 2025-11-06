import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminStore } from '../store/adminStore';
import LoginForm from '../components/LoginForm';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAdminStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              SinucaBet Admin
            </h1>
            <p className="text-gray-400">
              Faça login para acessar o painel
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
