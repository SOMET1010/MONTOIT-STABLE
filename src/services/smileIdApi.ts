import { supabase } from '@/services/supabase/client';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export type SmileJobType =
  | 'biometric_kyc'
  | 'document_verification'
  | 'enhanced_document_verification'
  | 'smartselfie_authentication'
  | 'enhanced_kyc';

export interface StartSmileIdJobInput {
  userId: string;
  jobType: SmileJobType;
  country?: string;
  idType?: string;
  idNumber?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  phoneNumber?: string;
  email?: string;
  selfieBase64?: string;
  idCardFrontBase64?: string;
  idCardBackBase64?: string;
}

export interface StartSmileIdJobResponse {
  success: boolean;
  jobId: string;
  status: string;
  partnerParams: Record<string, any>;
  timestamp: string;
}

export interface SmileIdTokenResponse {
  success: boolean;
  signature: string;
  timestamp: number;
  partnerId: string;
  jobId: string;
  jobType: SmileJobType | string;
  partnerParams: Record<string, any>;
  callbackUrl?: string;
  sandbox?: boolean;
}

export interface SmileIdWebTokenResponse {
  success: boolean;
  token: string;
  partner_id: string;
  job_id: string;
  user_id: string;
  product: string;
  callback_url: string;
  timestamp: number;
}

async function fetchFunction<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${FUNCTIONS_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Erreur inconnue');
    throw new Error(text || 'Erreur lors de l’appel de la fonction Smile ID');
  }

  return (await response.json()) as T;
}

export const smileIdApi = {
  async startJob(input: StartSmileIdJobInput): Promise<StartSmileIdJobResponse> {
    const { data, error } = await supabase.functions.invoke<StartSmileIdJobResponse>('smile-id-submit', {
      body: input,
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de la création du job Smile ID');
    }

    return data!;
  },

  async getStatus(jobId: string) {
    return fetchFunction(`/smile-id-status?jobId=${encodeURIComponent(jobId)}`);
  },

  async generateToken(input: Omit<StartSmileIdJobInput, 'selfieBase64' | 'idCardFrontBase64' | 'idCardBackBase64'>): Promise<SmileIdTokenResponse> {
    const { data, error } = await supabase.functions.invoke<SmileIdTokenResponse>('smile-id-token', {
      body: input,
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de la génération du token Smile ID');
    }

    return data!;
  },

  async generateWebToken(input: {
    userId?: string;
    jobId?: string;
    product?: SmileJobType | string;
    callbackUrl?: string;
    partnerParams?: Record<string, any>;
  }): Promise<SmileIdWebTokenResponse> {
    const { data, error } = await supabase.functions.invoke<SmileIdWebTokenResponse>('smile-id-web-token', {
      body: input,
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de la génération du web token Smile ID');
    }

    return data!;
  },
};
