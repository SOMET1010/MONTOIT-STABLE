/**
 * Service API pour l'authentification
 * 
 * Ce service centralise tous les appels API liés à l'authentification et à la gestion des utilisateurs.
 */

import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'tenant' | 'owner';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}

/**
 * API d'authentification
 */
export const authApi = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  signUp: async (data: SignUpData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
          role: data.role,
        },
      },
    });

    if (authError) throw authError;

    return { data: authData, error: null };
  },

  /**
   * Connexion d'un utilisateur
   */
  signIn: async (data: SignInData) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return { data: authData, error: null };
  },

  /**
   * Déconnexion
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { data: null, error: null };
  },

  /**
   * Récupère la session courante
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { data: data.session, error: null };
  },

  /**
   * Récupère l'utilisateur courant
   */
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { data: data.user, error: null };
  },

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { data: null, error: null };
  },

  /**
   * Met à jour le mot de passe
   */
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { data: null, error: null };
  },

  /**
   * Envoie un OTP par email
   */
  sendOTP: async (email: string, method: 'email' | 'sms' | 'whatsapp' = 'email') => {
    // Appeler l'Edge Function appropriée selon la méthode
    const functionName = method === 'whatsapp' ? 'send-whatsapp-otp' : 'send-otp';

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { email, method },
    });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Vérifie un OTP
   */
  verifyOTP: async (data: OTPVerificationData) => {
    const { data: verifyData, error } = await supabase.functions.invoke('verify-otp', {
      body: data,
    });

    if (error) throw error;
    return { data: verifyData, error: null };
  },

  /**
   * Récupère le profil d'un utilisateur
   */
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Met à jour le profil d'un utilisateur
   */
  updateProfile: async (userId: string, updates: ProfileUpdate) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Change le rôle actif d'un utilisateur
   */
  switchRole: async (userId: string, newRole: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ active_role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Vérifie si un email existe déjà
   */
  emailExists: async (email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return { data: !!data, error: null };
  },

  /**
   * Connexion avec Google
   */
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { data, error: null };
  },
};

