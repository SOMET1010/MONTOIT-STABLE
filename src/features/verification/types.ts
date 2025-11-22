/**
 * Types TypeScript pour la feature verification
 */

import type { Database } from '@/shared/lib/database.types';

// Types de base depuis la base de données
export type UserVerification = Database['public']['Tables']['user_verifications']['Row'];
export type UserVerificationInsert = Database['public']['Tables']['user_verifications']['Insert'];
export type UserVerificationUpdate = Database['public']['Tables']['user_verifications']['Update'];

// Types étendus pour l'application
export type VerificationStatus = 'en_attente' | 'verifie' | 'rejete';

export type VerificationType = 'oneci' | 'cnam' | 'face';

export interface UserVerificationWithProfile extends UserVerification {
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    avatar_url?: string;
  };
}

export interface VerificationFormData {
  oneci_document?: File;
  oneci_number?: string;
  cnam_document?: File;
  cnam_number?: string;
  selfie_image?: File;
}

export interface VerificationStatusUpdate {
  type: VerificationType;
  status: VerificationStatus;
  document_url?: string;
  number?: string;
  rejection_reason?: string;
}

export interface VerificationStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  oneci_verified: number;
  cnam_verified: number;
  face_verified: number;
  fully_verified: number;
}

export interface VerificationFilters {
  status?: VerificationStatus;
  type?: VerificationType;
  identity_verified?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface VerificationDocument {
  type: 'oneci' | 'cnam' | 'selfie';
  url: string;
  uploaded_at: string;
  verified: boolean;
}

export interface FaceVerificationResult {
  match: boolean;
  confidence: number;
  message: string;
}

export interface ONECIVerificationData {
  number: string;
  document_url: string;
  full_name?: string;
  date_of_birth?: string;
  place_of_birth?: string;
}

export interface CNAMVerificationData {
  number: string;
  document_url: string;
  full_name?: string;
  employer?: string;
}

export interface VerificationProgress {
  oneci: {
    completed: boolean;
    status: VerificationStatus;
  };
  cnam: {
    completed: boolean;
    status: VerificationStatus;
  };
  face: {
    completed: boolean;
    status: VerificationStatus;
  };
  overall_progress: number; // 0-100
  is_complete: boolean;
}

export interface VerificationRejection {
  type: VerificationType;
  reason: string;
  rejected_at: string;
  can_retry: boolean;
}

