/**
 * Configuration et validation des variables d'environnement
 */

interface EnvConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  supabase: {
    url: string;
    anonKey: string;
  };
}

function validateEnv(): EnvConfig {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variables d\'environnement manquantes : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requises'
    );
  }

  return {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    isTest: import.meta.env.MODE === 'test',
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    },
  };
}

export const envConfig = validateEnv();

export default envConfig;
