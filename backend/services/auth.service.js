/**
 * ============================================================
 * Auth Service - NOVA VERSÃO com Supabase Auth
 * ============================================================
 * Migrado de JWT manual para Supabase Auth completo
 * Data: 05/11/2025
 */

const { supabase } = require('../config/supabase.config');

class AuthService {
  /**
   * Registra um novo usuário usando Supabase Auth
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Dados do usuário criado e sessão
   */
  async register(userData) {
    const { name, email, password, phone, cpf, pix_key, pix_type } = userData;

    try {
      console.log('📝 [REGISTER] Iniciando registro para:', email);

      // 1. Criar usuário DIRETO no Supabase Auth (sem verificações prévias)
      // O Supabase Auth vai validar email duplicado automaticamente
      console.log('🔐 [REGISTER] Criando usuário no Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirma email
        user_metadata: {
          name,
          phone,
          cpf,
          pix_key: pix_key || email,
          pix_type: pix_type || 'email'
        }
      });

      if (authError) {
        console.error('❌ [REGISTER] Erro no Supabase Auth:', authError);
        
        // Verificar se é erro de email duplicado
        if (authError.message?.includes('already registered') || 
            authError.message?.includes('already exists') ||
            authError.status === 422) {
          throw {
            code: 'CONFLICT',
            message: 'Email já cadastrado'
          };
        }
        
        throw {
          code: 'AUTH_ERROR',
          message: authError.message || 'Erro ao criar usuário no sistema de autenticação',
          details: authError
        };
      }

      if (!authData.user) {
        throw {
          code: 'AUTH_ERROR',
          message: 'Usuário não foi criado'
        };
      }

      console.log('✅ [REGISTER] Usuário criado no Supabase Auth:', authData.user.id);
      console.log('📝 [REGISTER] Criando registro em public.users...');

      // 3. Criar registro em public.users manualmente (não depende de trigger)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          phone,
          cpf,
          pix_key: pix_key || email,
          pix_type: pix_type || 'email',
          email_verified: false,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, role, is_active, created_at')
        .single();

      if (insertError || !newUser) {
        console.error('❌ [REGISTER] Erro ao criar usuário em public.users!');
        console.error('❌ [REGISTER] Error:', insertError);
        console.error('❌ [REGISTER] Error code:', insertError?.code);
        console.error('❌ [REGISTER] Error message:', insertError?.message);
        console.error('❌ [REGISTER] Error details:', insertError?.details);
        console.error('❌ [REGISTER] Error hint:', insertError?.hint);
        throw {
          code: 'SYNC_ERROR',
          message: `Erro ao criar perfil: ${insertError?.message || 'Desconhecido'}`
        };
      }

      console.log('✅ [REGISTER] Registro criado em public.users:', newUser.email);

      // 4. Criar carteira para o usuário
      const { error: walletInsertError } = await supabase
        .from('wallet')
        .insert({
          user_id: authData.user.id,
          balance: 0.00,
          blocked_balance: 0.00,
          total_deposited: 0.00,
          total_withdrawn: 0.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (walletInsertError) {
        console.error('⚠️ [REGISTER] Erro ao criar carteira:', walletInsertError);
        // Continua mesmo se wallet falhar
      } else {
        console.log('✅ [REGISTER] Carteira criada para:', newUser.email);
      }

      const user = newUser;

      // 5. Buscar dados da carteira
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance, blocked_balance, total_deposited, total_withdrawn')
        .eq('user_id', user.id)
        .single();

      // 6. Retornar dados do usuário e sessão
      console.log('🎉 [REGISTER] Registro completo com sucesso!');
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf,
          pix_key: user.pix_key,
          pix_type: user.pix_type,
          email_verified: user.email_verified,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at
        },
        session: authData.session,
        token: authData.session?.access_token,
        wallet: wallet || {
          balance: 0,
          blocked_balance: 0,
          total_deposited: 0,
          total_withdrawn: 0
        }
      };
    } catch (error) {
      // Propagar erros customizados
      if (error.code) {
        throw error;
      }

      // Tratar erros inesperados
      console.error('Erro inesperado no register:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno ao processar registro',
        details: error.message
      };
    }
  }

  /**
   * Realiza login usando Supabase Auth
   * @param {Object} credentials - Credenciais do usuário
   * @returns {Promise<Object>} Dados do usuário e sessão
   */
  async login(credentials) {
    const { email, password } = credentials;

    try {
      // 1. Fazer login via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Erro no Supabase Auth signIn:', authError);
        throw {
          code: 'UNAUTHORIZED',
          message: 'Email ou senha inválidos'
        };
      }

      if (!authData.user || !authData.session) {
        throw {
          code: 'UNAUTHORIZED',
          message: 'Email ou senha inválidos'
        };
      }

      // 2. Buscar dados completos do usuário em public.users
      console.log('🔍 [LOGIN - NOVA VERSÃO] Buscando usuário ID:', authData.user.id);
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('🔍 [LOGIN - NOVA VERSÃO] Dados completos do banco:', JSON.stringify(user, null, 2));
      console.log('🔑 [LOGIN - NOVA VERSÃO] ROLE:', user?.role);
      console.log('✅ [LOGIN - NOVA VERSÃO] IS_ACTIVE:', user?.is_active);

      if (userError || !user) {
        throw {
          code: 'NOT_FOUND',
          message: 'Dados do usuário não encontrados'
        };
      }

      // 3. Verificar se o usuário está ativo
      if (!user.is_active) {
        throw {
          code: 'FORBIDDEN',
          message: 'Usuário desativado. Entre em contato com o suporte.'
        };
      }

      // 4. Buscar dados da carteira
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance, blocked_balance, total_deposited, total_withdrawn')
        .eq('user_id', user.id)
        .single();

      // 5. Retornar dados do usuário e sessão
      console.log('📤 [LOGIN SERVICE] user.role ANTES de retornar:', user.role);
      console.log('📤 [LOGIN SERVICE] user.is_active ANTES de retornar:', user.is_active);
      
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        pix_key: user.pix_key,
        pix_type: user.pix_type,
        email_verified: user.email_verified,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      };
      
      console.log('📤 [LOGIN SERVICE] userResponse.role:', userResponse.role);
      
      return {
        user: userResponse,
        session: authData.session,
        token: authData.session.access_token,
        wallet: wallet || {
          balance: 0,
          blocked_balance: 0,
          total_deposited: 0,
          total_withdrawn: 0
        }
      };
    } catch (error) {
      // Propagar erros customizados
      if (error.code) {
        throw error;
      }

      // Tratar erros inesperados
      console.error('Erro inesperado no login:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno ao processar login',
        details: error.message
      };
    }
  }

  /**
   * Busca perfil do usuário usando Supabase Auth
   * @param {string} userId - ID do usuário (do token JWT do Supabase)
   * @returns {Promise<Object>} Dados do usuário
   */
  async getProfile(userId) {
    try {
      console.log('🔍 [GET PROFILE SUPABASE] Buscando usuário:', userId);

      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, role, is_active, created_at')
        .eq('id', userId)
        .single();

      console.log('🔍 [GET PROFILE SUPABASE] Resultado:', { user, error });

      if (error || !user) {
        throw {
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado'
        };
      }

      return user;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar perfil',
        details: error.message
      };
    }
  }

  /**
   * Atualiza perfil do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Dados atualizados
   */
  async updateProfile(userId, updateData) {
    try {
      // Campos permitidos para atualização
      const allowedFields = ['name', 'phone', 'pix_key', 'pix_type'];
      const filteredData = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      // Atualizar em public.users
      const { data: user, error } = await supabase
        .from('users')
        .update(filteredData)
        .eq('id', userId)
        .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, role, is_active, created_at')
        .single();

      if (error) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar perfil',
          details: error.message
        };
      }

      if (!user) {
        throw {
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado'
        };
      }

      // Atualizar metadados no Supabase Auth também
      if (filteredData.name) {
        await supabase.auth.updateUser({
          data: { name: filteredData.name }
        });
      }

      return user;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao atualizar perfil',
        details: error.message
      };
    }
  }

  /**
   * Faz logout do usuário (invalida sessão)
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw {
          code: 'LOGOUT_ERROR',
          message: 'Erro ao fazer logout'
        };
      }

      return { success: true };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao processar logout',
        details: error.message
      };
    }
  }

  /**
   * Solicita reset de senha
   * @param {string} email - Email do usuário
   */
  async requestPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
      });

      if (error) {
        throw {
          code: 'RESET_ERROR',
          message: 'Erro ao solicitar reset de senha'
        };
      }

      return { success: true, message: 'Email de recuperação enviado' };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao solicitar reset de senha',
        details: error.message
      };
    }
  }

  /**
   * Atualiza senha do usuário
   * @param {string} newPassword - Nova senha
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw {
          code: 'UPDATE_ERROR',
          message: 'Erro ao atualizar senha'
        };
      }

      return { success: true, message: 'Senha atualizada com sucesso' };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao atualizar senha',
        details: error.message
      };
    }
  }
}

module.exports = new AuthService();





