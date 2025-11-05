/**
 * ============================================================
 * Supabase Configuration
 * ============================================================
 */

const { createClient } = require('@supabase/supabase-js');

// Validar variáveis de ambiente
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL não está definida nas variáveis de ambiente');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não está definida nas variáveis de ambiente');
}

// Criar cliente Supabase com Service Role Key (acesso admin)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Export nomeado para compatibilidade
module.exports = { supabase };
module.exports.supabase = supabase;





