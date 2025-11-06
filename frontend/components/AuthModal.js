import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { login as loginApi, register as registerApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { InlineLoader } from './Loader';
import { X, Mail, Lock, User, Phone, CreditCard, Key, Eye, EyeOff, Check, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

/**
 * Schemas de validação
 */
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Etapa 1: Dados Básicos
const step1Schema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter minúscula, MAIÚSCULA e número'
    ),
});

// Etapa 2: Documentos
const step2Schema = z.object({
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .transform((val) => {
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length === 11 ? `+55${cleaned}` : `+${cleaned}`;
    }),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00')
    .refine((cpf) => {
      const cleaned = cpf.replace(/\D/g, '');
      if (cleaned.length !== 11) return false;
      if (/^(\d)\1+$/.test(cleaned)) return false;
      
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
      }
      let digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      if (digit !== parseInt(cleaned.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
      }
      digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      if (digit !== parseInt(cleaned.charAt(10))) return false;
      
      return true;
    }, 'CPF inválido'),
});

// Etapa 3: Chave Pix
const step3Schema = z.object({
  pix_key: z.string().min(3, 'Chave Pix é obrigatória'),
  pix_type: z.enum(['email', 'cpf', 'phone', 'random'], {
    required_error: 'Selecione o tipo de chave Pix',
  }),
});

/**
 * Componente AuthModal - Modal de Login/Cadastro estilo RASPA GREEN
 */
export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [mode, setMode] = useState(defaultMode); // 'login' ou 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // 1, 2 ou 3
  const [registerData, setRegisterData] = useState({}); // Dados acumulados do cadastro

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Forms para cada etapa do cadastro
  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
  });

  const step3Form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      pix_type: 'email',
    },
  });

  const onLoginSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await loginApi(data.email, data.password);
      if (result.success) {
        // A resposta tem dados aninhados: result.data.data
        const { token, user } = result.data.data || result.data;
        
        // Usa o AuthContext para fazer login (atualiza estado global)
        authLogin(token, user);
        
        toast.success(`Bem-vindo, ${user.name}!`, { duration: 2000 });
        onClose();
        
        // Redireciona para home se estiver na página inicial
        if (router.pathname === '/') {
          router.push('/home');
        }
      } else {
        toast.error(result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao conectar com servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para cada etapa do cadastro
  const handleStep1Submit = (data) => {
    setRegisterData({ ...registerData, ...data });
    setRegisterStep(2);
    toast.success('Etapa 1 concluída!');
  };

  const handleStep2Submit = (data) => {
    setRegisterData({ ...registerData, ...data });
    setRegisterStep(3);
    toast.success('Etapa 2 concluída!');
  };

  const handleStep3Submit = async (data) => {
    setIsLoading(true);
    const completeData = { ...registerData, ...data };

    try {
      const result = await registerApi(completeData);
      if (result.success) {
        // A resposta tem dados aninhados: result.data.data
        const { token, user } = result.data.data || result.data;
        
        // Usa o AuthContext para fazer login (atualiza estado global)
        authLogin(token, user);
        
        toast.success(`Conta criada! Bem-vindo, ${user.name}!`, { duration: 2000 });
        
        // Resetar estado do modal
        setRegisterStep(1);
        setRegisterData({});
        step1Form.reset();
        step2Form.reset();
        step3Form.reset();
        
        onClose();
        
        // Redireciona para home após cadastro
        router.push('/home');
      } else {
        toast.error(result.message || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao conectar com servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Voltar etapa no cadastro
  const handlePreviousStep = () => {
    setRegisterStep(registerStep - 1);
  };

  // Resetar ao trocar de modo
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setRegisterStep(1);
    setRegisterData({});
    loginForm.reset();
    step1Form.reset();
    step2Form.reset();
    step3Form.reset();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Estilo ShadcnUI sem border verde */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4">
        <div className="relative rounded-xl bg-[#0B0C0B] shadow-2xl">
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-texto-secundario transition-all hover:bg-[#0B0C0B] hover:text-white"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>

          {/* Conteúdo do Modal */}
          <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
            {mode === 'login' ? (
              /* MODAL DE LOGIN */
              <>
                <div className="mb-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-verde-neon shadow-lg transition-transform hover:scale-110">
                      <span className="text-3xl font-bold text-cinza-escuro">8</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-texto-principal">
                    Bem-vindo de volta!
                  </h2>
                  <p className="mt-2 text-texto-secundario">
                    Entre com sua conta SinucaBet
                  </p>
                </div>

                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-texto-normal">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-desabilitado"
                        size={18}
                      />
                      <input
                        type="email"
                        {...loginForm.register('email')}
                        className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] py-3 pl-11 pr-4 text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none"
                        placeholder="seu@email.com"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-sinuca-error">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-texto-normal">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-desabilitado"
                        size={18}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...loginForm.register('password')}
                        className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] py-3 pl-11 pr-11 text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-desabilitado hover:text-texto-normal"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-sinuca-error">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Botão Entrar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-verde-neon px-6 py-3 text-base font-bold uppercase text-cinza-escuro transition-all hover:bg-verde-accent disabled:opacity-50"
                  >
                    {isLoading ? <InlineLoader /> : 'Entrar'}
                  </button>
                </form>

                {/* Alternar para Cadastro */}
                <div className="mt-6 text-center">
                  <p className="text-texto-secundario">
                    Não tem uma conta?{' '}
                    <button
                      onClick={() => handleModeChange('register')}
                      className="font-bold text-verde-accent hover:text-verde-neon"
                    >
                      Criar Conta
                    </button>
                  </p>
                </div>
              </>
            ) : (
              /* MODAL DE CADASTRO COM 3 ETAPAS */
              <>
                <div className="mb-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-verde-neon shadow-lg transition-transform hover:scale-110">
                      <span className="text-3xl font-bold text-cinza-escuro">8</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-texto-principal">
                    Crie sua conta!
                  </h2>
                  <p className="mt-2 text-texto-secundario">
                    Complete seu cadastro em 3 etapas
                  </p>
                </div>

                {/* Indicador de Etapas */}
                <div className="mb-6 flex items-center justify-center gap-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          step < registerStep
                            ? 'bg-sinuca-success text-white'
                            : step === registerStep
                            ? 'bg-verde-neon text-cinza-escuro'
                            : 'bg-gray-700 text-texto-secundario'
                        }`}
                      >
                        {step < registerStep ? <Check size={16} /> : step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`mx-2 h-1 w-8 ${
                            step < registerStep ? 'bg-sinuca-success' : 'bg-gray-700'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* ETAPA 1: Dados Básicos */}
                {registerStep === 1 && (
                  <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                    <h3 className="mb-3 text-lg font-semibold text-texto-principal">
                      Etapa 1: Dados Básicos
                    </h3>
                  {/* Nome */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-texto-normal">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-desabilitado"
                        size={18}
                      />
                      <input
                        type="text"
                        {...step1Form.register('name')}
                        className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] py-2.5 pl-11 pr-4 text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    {step1Form.formState.errors.name && (
                      <p className="mt-1 text-xs text-sinuca-error">
                        {step1Form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-texto-normal">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-desabilitado"
                        size={18}
                      />
                      <input
                        type="email"
                        {...step1Form.register('email')}
                        className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] py-2.5 pl-11 pr-4 text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none"
                        placeholder="exemplo@gmail.com"
                      />
                    </div>
                    {step1Form.formState.errors.email && (
                      <p className="mt-1 text-xs text-sinuca-error">
                        {step1Form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-texto-normal">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-desabilitado"
                        size={18}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...step1Form.register('password')}
                        className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] py-2.5 pl-11 pr-11 text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none"
                        placeholder="Digite uma senha..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-desabilitado hover:text-texto-normal"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {step1Form.formState.errors.password && (
                      <p className="mt-1 text-xs text-sinuca-error">
                        {step1Form.formState.errors.password.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-texto-secundario">
                      Mín. 8 caracteres, com minúscula, MAIÚSCULA e número
                    </p>
                  </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-verde-neon px-6 py-3 text-base font-bold uppercase text-cinza-escuro transition-all hover:bg-verde-accent"
                    >
                      Continuar
                      <ChevronRight size={20} />
                    </button>
                  </form>
                )}

                {/* ETAPA 2: Documentos */}
                {registerStep === 2 && (
                  <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                    <h3 className="mb-3 text-lg font-semibold text-texto-principal">
                      Etapa 2: Documentos
                    </h3>

                    {/* Telefone */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto-normal">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-desabilitado"
                          size={18}
                        />
                        <input
                          type="tel"
                          {...step2Form.register('phone')}
                          className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] py-2.5 pl-11 pr-4 text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none"
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 11) {
                              value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                              value = value.replace(/(\d{5})(\d)/, '$1-$2');
                            }
                            e.target.value = value;
                            step2Form.setValue('phone', value);
                          }}
                        />
                      </div>
                      {step2Form.formState.errors.phone && (
                        <p className="mt-1 text-xs text-sinuca-error">
                          {step2Form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto-normal">
                        CPF
                      </label>
                      <div className="relative">
                        <CreditCard
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-desabilitado"
                          size={18}
                        />
                        <input
                          type="text"
                          {...step2Form.register('cpf')}
                          className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] py-2.5 pl-11 pr-4 text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none"
                          placeholder="000.000.000-00"
                          maxLength={14}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            value = value.replace(/(\d{3})(\d)/, '$1.$2');
                            value = value.replace(/(\d{3})(\d)/, '$1.$2');
                            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                            e.target.value = value;
                            step2Form.setValue('cpf', value);
                          }}
                        />
                      </div>
                      {step2Form.formState.errors.cpf && (
                        <p className="mt-1 text-xs text-sinuca-error">
                          {step2Form.formState.errors.cpf.message}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handlePreviousStep}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-verde-accent bg-transparent px-6 py-3 text-base font-bold uppercase text-verde-accent transition-all hover:bg-verde-accent hover:text-cinza-escuro"
                      >
                        <ChevronLeft size={20} />
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-verde-neon px-6 py-3 text-base font-bold uppercase text-cinza-escuro transition-all hover:bg-verde-accent"
                      >
                        Continuar
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </form>
                )}

                {/* ETAPA 3: Chave Pix */}
                {registerStep === 3 && (
                  <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-4">
                    <h3 className="mb-3 text-lg font-semibold text-texto-principal">
                      Etapa 3: Chave Pix
                    </h3>

                    {/* Tipo de Chave Pix */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto-normal">
                        Tipo de Chave Pix
                      </label>
                      <select
                        {...step3Form.register('pix_type')}
                        className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] px-4 py-2.5 text-texto-principal focus:border-verde-neon focus:outline-none"
                      >
                        <option value="email">Email</option>
                        <option value="cpf">CPF</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Aleatória</option>
                      </select>
                      {step3Form.formState.errors.pix_type && (
                        <p className="mt-1 text-xs text-sinuca-error">
                          {step3Form.formState.errors.pix_type.message}
                        </p>
                      )}
                    </div>

                    {/* Chave Pix */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto-normal">
                        Chave Pix
                      </label>
                      <div className="relative">
                        <Key
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-texto-desabilitado"
                          size={18}
                        />
                        <input
                          type="text"
                          {...step3Form.register('pix_key')}
                          className="w-full rounded-lg border-2 border-cinza-borda bg-[#0B0C0B] py-2.5 pl-11 pr-4 text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none"
                          placeholder="Digite sua chave Pix"
                        />
                      </div>
                      {step3Form.formState.errors.pix_key && (
                        <p className="mt-1 text-xs text-sinuca-error">
                          {step3Form.formState.errors.pix_key.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-texto-secundario">
                        Usada para receber seus saques
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handlePreviousStep}
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-verde-accent bg-transparent px-6 py-3 text-base font-bold uppercase text-verde-accent transition-all hover:bg-verde-accent hover:text-cinza-escuro disabled:opacity-50"
                      >
                        <ChevronLeft size={20} />
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-verde-neon px-6 py-3 text-base font-bold uppercase text-cinza-escuro transition-all hover:bg-verde-accent disabled:opacity-50"
                      >
                        {isLoading ? <InlineLoader /> : 'Finalizar'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Alternar para Login */}
                <div className="mt-6 text-center">
                  <p className="text-texto-secundario">
                    Já tem uma conta?{' '}
                    <button
                      onClick={() => handleModeChange('login')}
                      className="font-bold text-verde-accent hover:text-verde-neon"
                    >
                      Entrar
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

