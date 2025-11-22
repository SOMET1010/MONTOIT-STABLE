/**
 * Service API pour la gestion des paiements
 * 
 * Ce service centralise tous les appels API liés aux paiements et transactions.
 */

import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export interface PaymentData {
  lease_id: string;
  amount: number;
  payment_type: 'rent' | 'deposit' | 'charges' | 'other';
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
  description?: string;
}

/**
 * API de gestion des paiements
 */
export const paymentApi = {
  /**
   * Récupère tous les paiements
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, lease:leases(*), payer:profiles!payer_id(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère un paiement par son ID
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, lease:leases(*), payer:profiles!payer_id(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère les paiements d'un bail
   */
  getByLeaseId: async (leaseId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, payer:profiles!payer_id(*)')
      .eq('lease_id', leaseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère les paiements d'un utilisateur (payeur)
   */
  getByPayerId: async (payerId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, lease:leases(*)')
      .eq('payer_id', payerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Crée un nouveau paiement
   */
  create: async (payment: PaymentInsert) => {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Met à jour un paiement
   */
  update: async (id: string, updates: PaymentUpdate) => {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Supprime un paiement
   */
  delete: async (id: string) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: null, error: null };
  },

  /**
   * Marque un paiement comme vérifié
   */
  markAsVerified: async (id: string, verifiedBy: string) => {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Marque un paiement comme rejeté
   */
  markAsRejected: async (id: string, reason: string) => {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Initie un paiement mobile money
   */
  initiateMobileMoney: async (paymentData: PaymentData & { phone: string; provider: string }) => {
    const { data, error } = await supabase.functions.invoke('process-mobile-money-payment', {
      body: paymentData,
    });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère le total des paiements pour un bail
   */
  getTotalByLeaseId: async (leaseId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('lease_id', leaseId)
      .eq('status', 'verified');

    if (error) throw error;

    const total = data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    return { data: total, error: null };
  },

  /**
   * Récupère les paiements en attente
   */
  getPending: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, lease:leases(*), payer:profiles!payer_id(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Compte le nombre de paiements en attente
   */
  countPending: async () => {
    const { count, error } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;
    return { data: count || 0, error: null };
  },

  /**
   * Génère un reçu de paiement
   */
  generateReceipt: async (paymentId: string) => {
    const { data, error } = await supabase.functions.invoke('generate-payment-receipt', {
      body: { paymentId },
    });

    if (error) throw error;
    return { data, error: null };
  },
};

