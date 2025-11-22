/**
 * Types TypeScript pour la feature payment
 */

import type { Database } from '@/shared/lib/database.types';

// Types de base depuis la base de données
export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

// Types étendus pour l'application
export interface PaymentWithDetails extends Payment {
  lease: {
    id: string;
    property_id: string;
    monthly_rent: number;
    start_date: string;
    end_date: string;
  };
  payer: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export type PaymentType = 
  | 'rent'          // Loyer
  | 'deposit'       // Caution
  | 'charges'       // Charges
  | 'penalty'       // Pénalité
  | 'other';        // Autre

export type PaymentMethod = 
  | 'mobile_money'  // Mobile Money
  | 'bank_transfer' // Virement bancaire
  | 'cash'          // Espèces
  | 'check'         // Chèque
  | 'card';         // Carte bancaire

export type PaymentStatus = 
  | 'pending'       // En attente
  | 'processing'    // En cours de traitement
  | 'verified'      // Vérifié
  | 'rejected'      // Rejeté
  | 'cancelled';    // Annulé

export interface PaymentFormData {
  lease_id: string;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  description?: string;
  reference?: string;
  proof_url?: string;
}

export interface MobileMoneyPaymentData extends PaymentFormData {
  phone: string;
  provider: 'orange' | 'mtn' | 'moov' | 'wave';
  otp?: string;
}

export interface BankTransferPaymentData extends PaymentFormData {
  bank_name: string;
  account_number: string;
  transfer_reference: string;
}

export interface PaymentStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  total_amount: number;
  pending_amount: number;
  verified_amount: number;
  by_method: Record<PaymentMethod, number>;
  by_type: Record<PaymentType, number>;
}

export interface PaymentFilters {
  lease_id?: string;
  payer_id?: string;
  payment_type?: PaymentType;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface PaymentReceipt {
  id: string;
  payment_id: string;
  receipt_number: string;
  pdf_url: string;
  generated_at: string;
}

export interface PaymentVerification {
  payment_id: string;
  verified_by: string;
  verified_at: string;
  notes?: string;
}

export interface PaymentRejection {
  payment_id: string;
  reason: string;
  rejected_at: string;
  can_retry: boolean;
}

export interface PaymentSchedule {
  lease_id: string;
  payment_type: PaymentType;
  amount: number;
  due_date: string;
  paid: boolean;
  payment_id?: string;
}

export interface PaymentHistory {
  lease_id: string;
  payments: PaymentWithDetails[];
  total_paid: number;
  total_due: number;
  balance: number;
  next_payment_due?: string;
}

export interface MobileMoneyProvider {
  code: 'orange' | 'mtn' | 'moov' | 'wave';
  name: string;
  logo: string;
  ussd_code: string;
  min_amount: number;
  max_amount: number;
  fees: number;
}

