/**
 * Service API pour la vérification d'identité
 * 
 * Ce service centralise tous les appels API liés aux vérifications d'identité
 * (ONECI, CNAM, vérification faciale).
 */

import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';

type UserVerification = Database['public']['Tables']['user_verifications']['Row'];
type UserVerificationInsert = Database['public']['Tables']['user_verifications']['Insert'];
type UserVerificationUpdate = Database['public']['Tables']['user_verifications']['Update'];

type VerificationStatus = 'en_attente' | 'verifie' | 'rejete';

/**
 * API de gestion des vérifications d'identité
 */
export const verificationApi = {
  /**
   * Récupère les données de vérification d'un utilisateur
   */
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  },

  /**
   * Crée une nouvelle entrée de vérification
   */
  create: async (verification: UserVerificationInsert) => {
    const { data, error } = await supabase
      .from('user_verifications')
      .insert(verification)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Met à jour les données de vérification
   */
  update: async (userId: string, updates: UserVerificationUpdate) => {
    const { data, error } = await supabase
      .from('user_verifications')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Met à jour le statut de vérification ONECI
   */
  updateOneciStatus: async (userId: string, status: VerificationStatus, documentUrl?: string, oneciNumber?: string, rejectionReason?: string) => {
    const updates: UserVerificationUpdate = {
      oneci_status: status,
      updated_at: new Date().toISOString(),
    };

    if (documentUrl) updates.oneci_document_url = documentUrl;
    if (oneciNumber) updates.oneci_number = oneciNumber;
    if (rejectionReason) updates.rejection_reason = rejectionReason;

    return verificationApi.update(userId, updates);
  },

  /**
   * Met à jour le statut de vérification CNAM
   */
  updateCnamStatus: async (userId: string, status: VerificationStatus, documentUrl?: string, cnamNumber?: string, rejectionReason?: string) => {
    const updates: UserVerificationUpdate = {
      cnam_status: status,
      updated_at: new Date().toISOString(),
    };

    if (documentUrl) updates.cnam_document_url = documentUrl;
    if (cnamNumber) updates.cnam_number = cnamNumber;
    if (rejectionReason) updates.rejection_reason = rejectionReason;

    return verificationApi.update(userId, updates);
  },

  /**
   * Met à jour le statut de vérification faciale
   */
  updateFaceVerificationStatus: async (userId: string, status: VerificationStatus, selfieUrl?: string, rejectionReason?: string) => {
    const updates: UserVerificationUpdate = {
      face_verification_status: status,
      updated_at: new Date().toISOString(),
    };

    if (selfieUrl) updates.selfie_image_url = selfieUrl;
    if (rejectionReason) updates.rejection_reason = rejectionReason;

    return verificationApi.update(userId, updates);
  },

  /**
   * Marque l'identité comme vérifiée
   */
  markAsVerified: async (userId: string) => {
    const updates: UserVerificationUpdate = {
      identity_verified: true,
      updated_at: new Date().toISOString(),
    };

    // Mettre à jour aussi le profil
    await supabase
      .from('profiles')
      .update({ identity_verified: true })
      .eq('id', userId);

    return verificationApi.update(userId, updates);
  },

  /**
   * Vérifie si toutes les vérifications sont complètes
   */
  isFullyVerified: async (userId: string) => {
    const { data } = await verificationApi.getByUserId(userId);

    if (!data) return { data: false, error: null };

    const isFullyVerified =
      data.oneci_status === 'verifie' &&
      data.face_verification_status === 'verifie' &&
      data.identity_verified === true;

    return { data: isFullyVerified, error: null };
  },

  /**
   * Récupère toutes les vérifications en attente (pour admin)
   */
  getPending: async () => {
    const { data, error } = await supabase
      .from('user_verifications')
      .select('*, user:profiles!user_id(*)')
      .or('oneci_status.eq.en_attente,cnam_status.eq.en_attente,face_verification_status.eq.en_attente')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère toutes les vérifications vérifiées
   */
  getVerified: async () => {
    const { data, error } = await supabase
      .from('user_verifications')
      .select('*, user:profiles!user_id(*)')
      .eq('identity_verified', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère toutes les vérifications rejetées
   */
  getRejected: async () => {
    const { data, error } = await supabase
      .from('user_verifications')
      .select('*, user:profiles!user_id(*)')
      .or('oneci_status.eq.rejete,cnam_status.eq.rejete,face_verification_status.eq.rejete')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Compte le nombre de vérifications en attente
   */
  countPending: async () => {
    const { count, error } = await supabase
      .from('user_verifications')
      .select('*', { count: 'exact', head: true })
      .or('oneci_status.eq.en_attente,cnam_status.eq.en_attente,face_verification_status.eq.en_attente');

    if (error) throw error;
    return { data: count || 0, error: null };
  },
};

