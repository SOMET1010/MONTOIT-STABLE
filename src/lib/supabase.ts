// Réexporter l'instance centralisée pour éviter les multiples instances GoTrueClient
export { supabase as default, supabase } from '@/services/supabase/client';
export type { Database } from './database.types';
