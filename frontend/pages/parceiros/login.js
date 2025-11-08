/**
 * ============================================================
 * Parceiros Login Page - Página de Login Parceiros/Influencers
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LogIn, Eye, EyeOff, Star } from 'lucide-react';
import useInfluencerStore from '../../store/influencerStore';
import toast from 'react-hot-toast';

export default function ParceirosLogin() {
  const router = useRouter();
  const { login, isAuthenticated, clearError } = useInfluencerStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/parceiros/dashboard');
    }
  }, [isAuthenticated, router]);

  // Limpar erros ao desmontar
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success('Login realizado com sucesso!');
        setTimeout(() => {
          router.replace('/parceiros/dashboard');
        }, 500);
      } else {
        toast.error(result.error || 'Erro ao fazer login');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-admin-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-status-warning mb-4">
            <Star className="text-admin-black" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
            SinucaBet <span className="text-status-warning">Parceiros</span>
          </h1>
          <p className="text-admin-text-secondary">
            Painel de Influencers
          </p>
        </div>

        {/* Card de Login */}
        <div className="admin-card">
          <h2 className="text-xl font-bold text-admin-text-primary mb-6">
            Fazer Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-status-warning"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              className="btn btn-warning w-full flex items-center justify-center gap-2 py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-sm" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar no Painel
                </>
              )}
            </button>
          </form>

          {/* Aviso */}
          <div className="mt-6 p-4 bg-admin-gray-dark border border-admin-gray-light rounded-lg">
            <p className="text-xs text-admin-text-muted text-center">
              ⭐ Acesso exclusivo para parceiros e influencers
            </p>
          </div>
        </div>

        {/* Link para voltar */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-admin-text-muted hover:text-status-warning transition-colors"
          >
            ← Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}
