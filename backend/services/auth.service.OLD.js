/**
 * ============================================================
 * Auth Service - Lógica de Negócio de Autenticação
 * ============================================================
 */

const supabase = require('../config/supabase.config');
const { hashPassword, verifyPassword } = require('../utils/hash.util');
const { generateToken } = require('../utils/jwt.util');

class AuthService {
  /**
   * Registra um novo usuário no sistema
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Dados do usuário criado e token JWT
   */
  async register(userData) {
    const { name, email, password, phone, cpf, pix_key, pix_type } = userData;

    try {
      // 1. Verificar se email já existe
      const { data: existingEmailUser, error: emailCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingEmailUser) {
        throw {
          code: 'CONFLICT',
          message: 'Email já cadastrado',
          field: 'email'
        };
      }

      // 2. Verificar se CPF já existe
      const { data: existingCpfUser, error: cpfCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('cpf', cpf)
        .single();

      if (existingCpfUser) {
        throw {
          code: 'CONFLICT',
          message: 'CPF já cadastrado',
          field: 'cpf'
        };
      }

      // 3. Gerar hash da senha
      const password_hash = await hashPassword(password);

      // 4. Preparar dados para inserção
      const newUser = {
        name,
        email,
        password_hash,
        phone,
        cpf,
        pix_key: pix_key || null,
        pix_type: pix_type || null,
        is_active: true,
        email_verified: false
      };

      // 5. Inserir usuário no banco
      const { data: createdUser, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select('id, name, email, phone, cpf, pix_key, pix_type, is_active, email_verified, created_at')
        .single();

      if (insertError) {
        console.error('Erro ao inserir usuário:', insertError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar usuário no banco de dados',
          details: insertError.message
        };
      }

      // 6. Verificar se a carteira foi criada automaticamente (via trigger)
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('id, balance, blocked_balance')
        .eq('user_id', createdUser.id)
        .single();

      if (walletError || !wallet) {
        console.warn('Aviso: Carteira não foi criada automaticamente. Tentando criar manualmente...');
        
        // Criar carteira manualmente caso o trigger não tenha funcionado
        const { data: manualWallet, error: manualWalletError } = await supabase
          .from('wallet')
          .insert({ user_id: createdUser.id })
          .select('id, balance, blocked_balance')
          .single();

        if (manualWalletError) {
          console.error('Erro ao criar carteira:', manualWalletError);
        }
      }

      // 7. Gerar token JWT
      const token = generateToken({
        user_id: createdUser.id,
        email: createdUser.email
      });

      // 8. Retornar dados do usuário e token
      return {
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          phone: createdUser.phone,
          cpf: createdUser.cpf,
          pix_key: createdUser.pix_key,
          pix_type: createdUser.pix_type,
          is_active: createdUser.is_active,
          email_verified: createdUser.email_verified,
          created_at: createdUser.created_at
        },
        token,
        wallet: wallet || { balance: 0, blocked_balance: 0 }
      };
    } catch (error) {
      // Propagar erros customizados
      if (error.code) {
        throw error;
      }

      // Tratar erros inesperados
      console.error('Erro inesperado no registro:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno ao processar registro',
        details: error.message
      };
    }
  }

  /**
   * Realiza login do usuário
   * @param {Object} credentials - Credenciais do usuário
   * @param {string} credentials.email - Email do usuário
   * @param {string} credentials.password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e token JWT
   */
  async login(credentials) {
    const { email, password } = credentials;

    try {
      // 1. Buscar usuário pelo email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email, password_hash, phone, cpf, pix_key, pix_type, is_active, email_verified, created_at')
        .eq('email', email)
        .single();

      if (userError || !user) {
        throw {
          code: 'UNAUTHORIZED',
          message: 'Email ou senha inválidos'
        };
      }

      // 2. Verificar se o usuário está ativo
      if (!user.is_active) {
        throw {
          code: 'FORBIDDEN',
          message: 'Usuário desativado. Entre em contato com o suporte.'
        };
      }

      // 3. Verificar senha
      const isPasswordValid = await verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        throw {
          code: 'UNAUTHORIZED',
          message: 'Email ou senha inválidos'
        };
      }

      // 4. Buscar dados da carteira
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance, blocked_balance, total_deposited, total_withdrawn')
        .eq('user_id', user.id)
        .single();

      // 5. Gerar token JWT
      const token = generateToken({
        user_id: user.id,
        email: user.email
      });

      // 6. Remover password_hash da resposta
      delete user.password_hash;

      // 7. Retornar dados do usuário e token
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf,
          pix_key: user.pix_key,
          pix_type: user.pix_type,
          is_active: user.is_active,
          email_verified: user.email_verified,
          created_at: user.created_at
        },
        token,
        wallet: wallet || { balance: 0, blocked_balance: 0, total_deposited: 0, total_withdrawn: 0 }
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
   * Verifica se um email já está cadastrado
   * @param {string} email - Email a ser verificado
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se um CPF já está cadastrado
   * @param {string} cpf - CPF a ser verificado
   * @returns {Promise<boolean>}
   */
  async cpfExists(cpf) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('cpf', cpf)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Busca perfil do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Dados do usuário
   */
  async getProfile(userId) {
    try {
      console.log('🔍 [GET PROFILE] Buscando usuário com ID:', userId);
      console.log('🔍 [GET PROFILE] Tipo do userId:', typeof userId);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, created_at')
        .eq('id', userId)
        .single();

      console.log('🔍 [GET PROFILE] Resultado Supabase:');
      console.log('   - User:', user);
      console.log('   - Error:', error);

      if (error || !user) {
        console.error('❌ [GET PROFILE] Usuário não encontrado!');
        throw {
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado'
        };
      }

      console.log('✅ [GET PROFILE] Usuário encontrado:', user.name);
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

      // Atualizar usuário
      const { data: user, error } = await supabase
        .from('users')
        .update(filteredData)
        .eq('id', userId)
        .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, created_at')
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
}

module.exports = new AuthService();





