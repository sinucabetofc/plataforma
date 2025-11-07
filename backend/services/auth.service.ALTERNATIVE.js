/**
 * ============================================================
 * Auth Service - VERSÃO ALTERNATIVA
 * ============================================================
 * Usa método diferente para contornar erro do Supabase Auth
 */

const { supabase } = require('../config/supabase.config');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class AuthServiceAlternative {
  /**
   * Registra usuário DIRETO na tabela users (sem usar Supabase Auth)
   * Use esta versão SE o erro do Supabase Auth persistir
   */
  async register(userData) {
    const { name, email, password, phone, cpf, pix_key, pix_type } = userData;

    try {
      console.log('📝 [REGISTER ALTERNATIVE] Iniciando registro para:', email);

      // 1. Verificar se email já existe na tabela users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw {
          code: 'CONFLICT',
          message: 'Email já cadastrado'
        };
      }

      // 2. Verificar se CPF já existe
      const { data: existingCPF } = await supabase
        .from('users')
        .select('id')
        .eq('cpf', cpf)
        .single();

      if (existingCPF) {
        throw {
          code: 'CONFLICT',
          message: 'CPF já cadastrado'
        };
      }

      // 3. Hash da senha
      const password_hash = await bcrypt.hash(password, 10);

      // 4. Gerar UUID para o usuário
      const userId = uuidv4();

      // 5. Inserir DIRETO na tabela users
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          name,
          phone,
          cpf,
          pix_key: pix_key || email,
          pix_type: pix_type || 'email',
          password_hash,
          email_verified: false,
          role: 'apostador',
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select('id, name, email, phone, cpf, pix_key, pix_type, email_verified, role, is_active, created_at')
        .single();

      if (insertError || !newUser) {
        console.error('❌ [REGISTER ALTERNATIVE] Erro ao criar usuário:', insertError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar usuário no banco de dados'
        };
      }

      console.log('✅ [REGISTER ALTERNATIVE] Usuário criado:', newUser.email);

      // 6. Criar carteira
      const { error: walletError } = await supabase
        .from('wallet')
        .insert({
          user_id: newUser.id,
          balance: 0.00,
          blocked_balance: 0.00,
          total_deposited: 0.00,
          total_withdrawn: 0.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (walletError) {
        console.error('⚠️ [REGISTER ALTERNATIVE] Erro ao criar carteira:', walletError);
      } else {
        console.log('✅ [REGISTER ALTERNATIVE] Carteira criada');
      }

      // 7. Gerar token JWT manual (já que não estamos usando Supabase Auth)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        {
          sub: newUser.id,
          email: newUser.email,
          role: newUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // 8. Buscar wallet
      const { data: wallet } = await supabase
        .from('wallet')
        .select('balance, blocked_balance, total_deposited, total_withdrawn')
        .eq('user_id', newUser.id)
        .single();

      return {
        user: newUser,
        token,
        wallet: wallet || {
          balance: 0,
          blocked_balance: 0,
          total_deposited: 0,
          total_withdrawn: 0
        }
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('❌ [REGISTER ALTERNATIVE] Erro inesperado:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno ao processar registro',
        details: error.message
      };
    }
  }

  /**
   * Login alternativo (verifica senha manualmente)
   */
  async login(credentials) {
    const { email, password } = credentials;

    try {
      console.log('🔐 [LOGIN ALTERNATIVE] Tentando login:', email);

      // 1. Buscar usuário por email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        throw {
          code: 'UNAUTHORIZED',
          message: 'Email ou senha inválidos'
        };
      }

      // 2. Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        throw {
          code: 'UNAUTHORIZED',
          message: 'Email ou senha inválidos'
        };
      }

      // 3. Verificar se está ativo
      if (!user.is_active) {
        throw {
          code: 'FORBIDDEN',
          message: 'Usuário desativado'
        };
      }

      // 4. Gerar token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // 5. Buscar wallet
      const { data: wallet } = await supabase
        .from('wallet')
        .select('balance, blocked_balance, total_deposited, total_withdrawn')
        .eq('user_id', user.id)
        .single();

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
        token,
        wallet: wallet || {
          balance: 0,
          blocked_balance: 0,
          total_deposited: 0,
          total_withdrawn: 0
        }
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('❌ [LOGIN ALTERNATIVE] Erro inesperado:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno ao processar login',
        details: error.message
      };
    }
  }
}

module.exports = new AuthServiceAlternative();

