/**
 * Service API pour la gestion des contrats (baux)
 * 
 * Ce service centralise tous les appels API liés aux contrats de location.
 */

import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';

type Lease = Database['public']['Tables']['leases']['Row'];
type LeaseInsert = Database['public']['Tables']['leases']['Insert'];
type LeaseUpdate = Database['public']['Tables']['leases']['Update'];

/**
 * API de gestion des contrats
 */
export const contractApi = {
  /**
   * Récupère tous les contrats
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('leases')
      .select('*, properties(*), landlord:profiles!landlord_id(*), tenant:profiles!tenant_id(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère un contrat par son ID
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('leases')
      .select('*, properties(*), landlord:profiles!landlord_id(*), tenant:profiles!tenant_id(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère les contrats d'un propriétaire
   */
  getByLandlordId: async (landlordId: string) => {
    const { data, error } = await supabase
      .from('leases')
      .select('*, properties(*), tenant:profiles!tenant_id(*)')
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère les contrats d'un locataire
   */
  getByTenantId: async (tenantId: string) => {
    const { data, error } = await supabase
      .from('leases')
      .select('*, properties(*), landlord:profiles!landlord_id(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Récupère les contrats d'une propriété
   */
  getByPropertyId: async (propertyId: string) => {
    const { data, error } = await supabase
      .from('leases')
      .select('*, landlord:profiles!landlord_id(*), tenant:profiles!tenant_id(*)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Crée un nouveau contrat
   */
  create: async (lease: LeaseInsert) => {
    const { data, error } = await supabase
      .from('leases')
      .insert(lease)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Met à jour un contrat
   */
  update: async (id: string, updates: LeaseUpdate) => {
    const { data, error } = await supabase
      .from('leases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Supprime un contrat
   */
  delete: async (id: string) => {
    const { error } = await supabase
      .from('leases')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: null, error: null };
  },

  /**
   * Signe un contrat (locataire ou propriétaire)
   */
  sign: async (id: string, role: 'tenant' | 'landlord', signatureData: { otp_verified_at: string; signed_at: string; signed_pdf_url?: string }) => {
    const updates: LeaseUpdate = {};

    if (role === 'tenant') {
      updates.tenant_otp_verified_at = signatureData.otp_verified_at;
      updates.tenant_signed_at = signatureData.signed_at;
    } else {
      updates.landlord_otp_verified_at = signatureData.otp_verified_at;
      updates.landlord_signed_at = signatureData.signed_at;
    }

    if (signatureData.signed_pdf_url) {
      updates.signed_pdf_url = signatureData.signed_pdf_url;
    }

    const { data, error } = await supabase
      .from('leases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Vérifie si un contrat est complètement signé
   */
  isFullySigned: async (id: string) => {
    const { data, error } = await supabase
      .from('leases')
      .select('tenant_signed_at, landlord_signed_at')
      .eq('id', id)
      .single();

    if (error) throw error;

    const isFullySigned = !!(data?.tenant_signed_at && data?.landlord_signed_at);
    return { data: isFullySigned, error: null };
  },

  /**
   * Met à jour le statut d'un contrat
   */
  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('leases')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },
};

