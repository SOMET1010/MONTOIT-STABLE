/**
 * Types TypeScript pour la feature contract
 */

import type { Database } from '@/shared/lib/database.types';

// Types de base depuis la base de données
export type Lease = Database['public']['Tables']['leases']['Row'];
export type LeaseInsert = Database['public']['Tables']['leases']['Insert'];
export type LeaseUpdate = Database['public']['Tables']['leases']['Update'];

// Types étendus pour l'application
export interface LeaseWithDetails extends Lease {
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    type: string;
    images?: string[];
  };
  landlord: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    identity_verified: boolean;
  };
  tenant: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    identity_verified: boolean;
  };
}

export interface ContractFormData {
  property_id: string;
  tenant_id: string;
  monthly_rent: number;
  deposit_amount: number;
  charges_amount: number;
  start_date: string;
  end_date: string;
  payment_day: number;
  custom_clauses?: string;
}

export interface SignatureData {
  otp_verified_at: string;
  signed_at: string;
  signed_pdf_url?: string;
}

export type LeaseStatus = 
  | 'draft'           // Brouillon
  | 'pending'         // En attente de signature
  | 'active'          // Actif
  | 'expired'         // Expiré
  | 'terminated'      // Résilié
  | 'cancelled';      // Annulé

export interface LeaseStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
  terminated: number;
  totalMonthlyRevenue: number;
  averageRent: number;
}

export interface LeaseFilters {
  status?: LeaseStatus;
  landlord_id?: string;
  tenant_id?: string;
  property_id?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  required: boolean;
  order: number;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  clauses: ContractClause[];
  created_at: string;
  updated_at: string;
}

export type SignatureRole = 'tenant' | 'landlord';

export interface SignatureStatus {
  tenant_signed: boolean;
  landlord_signed: boolean;
  tenant_signed_at?: string | null;
  landlord_signed_at?: string | null;
  tenant_otp_verified_at?: string | null;
  landlord_otp_verified_at?: string | null;
  fully_signed: boolean;
}

