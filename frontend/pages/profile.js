import { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../utils/api';
import { useAuth, withAuth } from '../contexts/AuthContext';
import { FullPageLoader, InlineLoader } from '../components/Loader';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Key,
  Edit2,
  Save,
  X,
  LogOut,
  AlertCircle,
  Check,
} from 'lucide-react';

/**
 * Schema de validação do perfil
 */
const profileSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  phone: z
    .string()
    .regex(/^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/, 'Telefone inválido'),
  pix_key: z.string().min(3, 'Chave Pix é obrigatória'),
  pix_type: z.enum(['email', 'cpf', 'phone', 'random']),
});

/**
 * Página Profile - Perfil do Usuário
 */
function Profile() {
  const { logout: authLogout, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Buscar perfil
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const result = await getProfile();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    },
  });

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: profileData
      ? {
          name: profileData.name || '',
          phone: profileData.phone || '',
          pix_key: profileData.pix_key || '',
          pix_type: profileData.pix_type || 'email',
        }
      : undefined,
  });

  // Mutation para atualizar perfil
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const result = await updateProfile(data);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar perfil');
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  // Logout usando AuthContext
  const handleLogout = () => {
    authLogout();
  };

  if (profileLoading) {
    return <FullPageLoader text="Carregando perfil..." />;
  }

  if (profileError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="rounded-lg border border-sinuca-error/30 bg-sinuca-error/10 p-6 text-center">
          <p className="text-lg text-sinuca-error">
            Erro ao carregar perfil: {profileError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Perfil - SinucaBet</title>
      </Head>

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-texto-principal">
            <User className="text-sinuca-green" size={36} />
            Meu Perfil
          </h1>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg bg-verde-neon px-4 py-2 text-base font-medium text-texto-principal transition-all hover:bg-verde-claro"
            >
              <Edit2 size={18} />
              Editar
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-lg border border-sinuca-green bg-transparent px-4 py-2 text-base font-medium text-sinuca-green transition-all hover:bg-verde-neon hover:text-texto-principal"
            >
              <X size={18} />
              Cancelar
            </button>
          )}
        </div>

        {/* Card de perfil */}
        <div className="mb-8 rounded-lg border border-cinza-borda bg-[#1a1a1a] p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-lg font-medium text-texto-principal">
                <User size={20} className="text-sinuca-green" />
                Nome Completo
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full rounded-lg border border-cinza-borda bg-cinza-claro px-4 py-3 text-lg text-texto-principal placeholder:text-texto-desabilitado focus:border-sinuca-green focus:outline-none focus:ring-2 focus:ring-sinuca-green"
                  />
                  {errors.name && (
                    <div className="mt-2 flex items-center gap-1 text-sinuca-error">
                      <AlertCircle size={16} />
                      <span className="text-sm">{errors.name.message}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xl text-texto-normal">{profileData.name}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-lg font-medium text-texto-principal">
                <Mail size={20} className="text-sinuca-green" />
                Email
              </label>
              <p className="text-xl text-texto-normal">{profileData.email}</p>
              <p className="mt-1 text-sm text-texto-desabilitado">
                O email não pode ser alterado
              </p>
            </div>

            {/* Telefone */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-lg font-medium text-texto-principal">
                <Phone size={20} className="text-sinuca-green" />
                Telefone
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full rounded-lg border border-cinza-borda bg-cinza-claro px-4 py-3 text-lg text-texto-principal placeholder:text-texto-desabilitado focus:border-sinuca-green focus:outline-none focus:ring-2 focus:ring-sinuca-green"
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && (
                    <div className="mt-2 flex items-center gap-1 text-sinuca-error">
                      <AlertCircle size={16} />
                      <span className="text-sm">{errors.phone.message}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xl text-texto-normal">{profileData.phone}</p>
              )}
            </div>

            {/* CPF (read-only) */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-lg font-medium text-texto-principal">
                <CreditCard size={20} className="text-sinuca-green" />
                CPF
              </label>
              <p className="text-xl text-texto-normal">{profileData.cpf}</p>
              <p className="mt-1 text-sm text-texto-desabilitado">
                O CPF não pode ser alterado
              </p>
            </div>

            {/* Tipo de chave Pix */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-lg font-medium text-texto-principal">
                <Key size={20} className="text-sinuca-green" />
                Tipo de Chave Pix
              </label>
              {isEditing ? (
                <>
                  <select
                    {...register('pix_type')}
                    className="w-full appearance-none rounded-lg border border-cinza-borda bg-cinza-claro px-4 py-3 text-lg text-texto-principal focus:border-sinuca-green focus:outline-none focus:ring-2 focus:ring-sinuca-green"
                  >
                    <option value="email">Email</option>
                    <option value="cpf">CPF</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Aleatória</option>
                  </select>
                  {errors.pix_type && (
                    <div className="mt-2 flex items-center gap-1 text-sinuca-error">
                      <AlertCircle size={16} />
                      <span className="text-sm">{errors.pix_type.message}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xl capitalize text-texto-normal">
                  {profileData.pix_type}
                </p>
              )}
            </div>

            {/* Chave Pix */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-lg font-medium text-texto-principal">
                <CreditCard size={20} className="text-sinuca-green" />
                Chave Pix
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    {...register('pix_key')}
                    className="w-full rounded-lg border border-cinza-borda bg-cinza-claro px-4 py-3 text-lg text-texto-principal placeholder:text-texto-desabilitado focus:border-sinuca-green focus:outline-none focus:ring-2 focus:ring-sinuca-green"
                  />
                  {errors.pix_key && (
                    <div className="mt-2 flex items-center gap-1 text-sinuca-error">
                      <AlertCircle size={16} />
                      <span className="text-sm">{errors.pix_key.message}</span>
                    </div>
                  )}
                  <p className="mt-1 text-sm text-texto-desabilitado">
                    Esta chave será usada para receber seus saques
                  </p>
                </>
              ) : (
                <p className="text-xl text-texto-normal">{profileData.pix_key}</p>
              )}
            </div>

            {/* Botão de salvar (só aparece quando editando) */}
            {isEditing && (
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-verde-neon py-3 text-xl font-semibold text-texto-principal transition-all hover:bg-verde-claro hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <InlineLoader />
                ) : (
                  <>
                    <Save size={20} />
                    Salvar Alterações
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Informações da conta */}
        <div className="mb-8 rounded-lg border border-cinza-borda bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-xl font-semibold text-texto-principal">
            Informações da Conta
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario">Data de cadastro:</span>
              <span className="text-texto-principal">
                {new Date(profileData.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario">ID do usuário:</span>
              <span className="text-texto-principal">{profileData.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario">Status:</span>
              <span className="flex items-center gap-1 text-sinuca-success">
                <Check size={16} />
                Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Botão de logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-600 bg-transparent py-3 text-xl font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-texto-principal"
        >
          <LogOut size={20} />
          Sair da Conta
        </button>
      </div>
    </>
  );
}

// Proteger rota com autenticação
export default withAuth(Profile);

