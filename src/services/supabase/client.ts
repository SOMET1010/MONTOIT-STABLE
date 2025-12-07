import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { apiKeysConfig } from '@/shared/config/api-keys.config';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = apiKeysConfig.supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Custom fetch implementation for public requests that removes Authorization header
const publicFetch = (url: RequestInfo | URL, options?: RequestInit) => {
  // Create clean headers without Authorization
  const cleanHeaders: Record<string, string> = {};

  if (options?.headers) {
    Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
      // Skip Authorization header entirely
      if (key.toLowerCase() !== 'authorization') {
        cleanHeaders[key] = value;
      }
    });
  }

  return fetch(url, { ...options, headers: cleanHeaders });
};

// Public client for anonymous requests (no Authorization header)
export const supabasePublic = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'supabase.public.auth.token',
  },
  global: {
    fetch: publicFetch,
  },
});

// Authenticated client for user requests (with session management)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
});
