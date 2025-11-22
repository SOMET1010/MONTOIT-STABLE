import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { apiKeysConfig } from '@/shared/config/api-keys.config';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = apiKeysConfig.supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
