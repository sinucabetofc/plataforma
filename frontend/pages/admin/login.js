/**
 * ============================================================
 * Admin Login Page - Página de Login Admin
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { post } from '../../utils/api';
import { saveToken, saveUser, clearAuth } from '../../utils/auth';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Limpar cookies antigos ao carregar a página de login
  useEffect(() => {
    clearAuth();
    console.log('🧹 Cookies limpos ao carregar página de login');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Fazer login
      const response = await post('/auth/login', formData);

      if (!response.success || !response.data) {
        toast.error('Erro ao fazer login');
        setLoading(false);
        return;
      }

      const { user, token } = response.data;

      // 2. Verificar se é admin
      if (user.role !== 'admin') {
        toast.error('Acesso negado. Você não tem permissão de administrador.');
        setLoading(false);
        return;
      }

      // 3. Salvar token e dados do usuário
      saveToken(token);
      saveUser(user);

      // 4. Redirecionar para admin dashboard
      toast.success(`Bem-vindo, ${user.name}!`);
      
      // Usar replace para evitar voltar ao login com botão voltar
      setTimeout(() => {
        router.replace('/admin/dashboard');
      }, 500);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      if (error.response?.status === 401) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
      
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-admin-green mb-4">
            <span className="text-3xl font-bold text-admin-black">S</span>
          </div>
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
            SinucaBet <span className="text-admin-green">Admin</span>
          </h1>
          <p className="text-admin-text-secondary">
            Painel Administrativo
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
                placeholder="admin@sinucabet.com"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-admin-green"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
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
              🔒 Acesso restrito a administradores
            </p>
          </div>
        </div>

        {/* Link para voltar */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-admin-text-muted hover:text-admin-green transition-colors"
          >
            ← Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}







