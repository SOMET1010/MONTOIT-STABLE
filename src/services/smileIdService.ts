/**
 * Smile ID Service
 * Integration with Smile ID for digital identity verification in Africa
 * Documentation: https://docs.usesmileid.com/
 */

import { supabase } from '@/services/supabase/client';

// Types based on Smile ID API
export interface SmileIdConfig {
  sandbox: boolean;
  apiKey: string;
  partnerId: string;
  callbackUrl: string;
}

export interface SmileIdJob {
  id: string;
  userId: string;
  jobType: string;
  idType: string;
  country: string;
  partnerParams: Record<string, any>;
  callbackUrl: string;
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  result?: SmileIdResult;
}

export interface SmileIdResult {
  status: 'VERIFIED' | 'NOT_VERIFIED' | 'FAILED';
  confidence: number;
  verificationData: {
    idNumber: string;
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    photo?: string;
    signature?: string;
  };
  biometricData?: {
    faceMatch: boolean;
    livenessCheck: boolean;
    confidence: number;
  };
  documentData?: {
    documentType: string;
    issuingCountry: string;
    issuingAuthority: string;
    expiryDate?: string;
  };
  errors?: string[];
}

export interface SmileIdPartnerParams {
  user_id: string;
  job_type: 'BIOMETRIC_VERIFICATION' | 'DOCUMENT_VERIFICATION' | 'SMART_CARD_VERIFICATION';
  language?: string;
  consent_text?: string;
  redirect_url?: string;
  source: string;
}

export class SmileIdService {
  private config: SmileIdConfig;

  constructor() {
    this.config = {
      sandbox: import.meta.env.VITE_SMILE_ID_SANDBOX === 'true',
      apiKey: import.meta.env.VITE_SMILE_ID_API_KEY || '',
      partnerId: import.meta.env.VITE_SMILE_ID_PARTNER_ID || '',
      callbackUrl: import.meta.env.VITE_SMILE_ID_CALLBACK_URL ||
        `${window.location.origin}/api/smile-id/callback`
    };
  }

  /**
   * Get Smile ID base URL
   */
  private getBaseUrl(): string {
    return this.config.sandbox
      ? 'https://testapi.usesmileid.com'
      : 'https://api.usesmileid.com';
  }

  /**
   * Initialize a new verification job
   */
  async initializeVerification(
    userId: string,
    verificationType: 'biometric' | 'document' | 'smart_card',
    idType: string = 'NATIONAL_ID',
    country: string = 'CI'
  ): Promise<SmileIdJob> {
    const jobType = this.mapVerificationTypeToJobType(verificationType);

    const partnerParams: SmileIdPartnerParams = {
      user_id: userId,
      job_type: jobType,
      language: 'fr',
      source: 'MONTOIT_APP',
      consent_text: 'Je consens à la vérification de mon identité via Smile ID pour les besoins de ma location sur Mon Toit.'
    };

    try {
      // Create verification record in database
      const { data: verification, error: dbError } = await supabase
        .from('user_verifications')
        .upsert({
          user_id: userId,
          smile_id_status: 'en_attente',
          smile_id_job_type: jobType,
          smile_id_id_type: idType,
          smile_id_country_code: country,
          smile_id_partner_params: partnerParams,
          smile_id_callback_url: this.config.callbackUrl,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Call Smile ID API to create job
      const response = await fetch(`${this.getBaseUrl()}/v1/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          partner_id: this.config.partnerId,
          job_type: jobType,
          id_type: idType,
          country: country,
          partner_params: partnerParams,
          callback_url: this.config.callbackUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Smile ID API Error: ${response.status} ${response.statusText}`);
      }

      const smileIdResponse = await response.json();

      // Update verification record with job ID
      await supabase
        .from('user_verifications')
        .update({
          smile_id_job_id: smileIdResponse.job_id,
          smile_id_status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return {
        id: smileIdResponse.job_id,
        userId,
        jobType,
        idType,
        country,
        partnerParams,
        callbackUrl: this.config.callbackUrl,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error initializing Smile ID verification:', error);
      throw new Error('Failed to initialize identity verification');
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(jobId: string): Promise<SmileIdJob | null> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/v1/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch verification status: ${response.status}`);
      }

      const result = await response.json();

      // Update local database
      await this.updateVerificationInDatabase(jobId, result);

      return {
        id: jobId,
        userId: result.partner_params?.user_id || '',
        jobType: result.job_type || '',
        idType: result.id_type || '',
        country: result.country || '',
        partnerParams: result.partner_params || {},
        callbackUrl: result.callback_url || '',
        status: this.mapSmileIdStatus(result.status),
        createdAt: result.created_at,
        completedAt: result.completed_at,
        result: result.result ? this.parseSmileIdResult(result.result) : undefined
      };

    } catch (error) {
      console.error('Error getting verification status:', error);
      return null;
    }
  }

  /**
   * Process callback from Smile ID
   */
  async processCallback(callbackData: any): Promise<void> {
    try {
      const { job_id, status, result, timestamp } = callbackData;

      // Update verification in database
      await this.updateVerificationInDatabase(job_id, {
        status,
        result,
        completed_at: timestamp
      });

      // Update user profile if verification is successful
      if (status === 'VERIFIED' && result) {
        const userId = callbackData.partner_params?.user_id;
        if (userId) {
          await this.updateUserProfile(userId, result);
        }
      }

    } catch (error) {
      console.error('Error processing Smile ID callback:', error);
    }
  }

  /**
   * Get Smile ID verification URL for user redirection
   */
  getVerificationUrl(jobId: string): string {
    const baseUrl = this.config.sandbox
      ? 'https://test.usesmileid.com/verify'
      : 'https://usesmileid.com/verify';

    return `${baseUrl}?job_id=${jobId}&partner_id=${this.config.partnerId}`;
  }

  /**
   * Cancel verification job
   */
  async cancelVerification(jobId: string): Promise<void> {
    try {
      await fetch(`${this.getBaseUrl()}/v1/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      await supabase
        .from('user_verifications')
        .update({
          smile_id_status: 'annule',
          updated_at: new Date().toISOString()
        })
        .eq('smile_id_job_id', jobId);

    } catch (error) {
      console.error('Error cancelling verification:', error);
    }
  }

  // Private helper methods

  private mapVerificationTypeToJobType(type: string): string {
    switch (type) {
      case 'biometric':
        return 'BIOMETRIC_VERIFICATION';
      case 'document':
        return 'DOCUMENT_VERIFICATION';
      case 'smart_card':
        return 'SMART_CARD_VERIFICATION';
      default:
        return 'BIOMETRIC_VERIFICATION';
    }
  }

  private mapSmileIdStatus(status: string): SmileIdJob['status'] {
    switch (status) {
      case 'SUBMITTED':
        return 'submitted';
      case 'PROCESSING':
        return 'processing';
      case 'COMPLETED':
        return 'completed';
      case 'FAILED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private parseSmileIdResult(result: any): SmileIdResult {
    return {
      status: result.verification_status || 'FAILED',
      confidence: result.confidence_score || 0,
      verificationData: {
        idNumber: result.id_number || '',
        fullName: result.full_name || '',
        dateOfBirth: result.date_of_birth,
        gender: result.gender,
        address: result.address,
        photo: result.photo_url,
        signature: result.signature_url
      },
      biometricData: result.biometric_verification ? {
        faceMatch: result.biometric_verification.face_match || false,
        livenessCheck: result.biometric_verification.liveness_check || false,
        confidence: result.biometric_verification.confidence || 0
      } : undefined,
      documentData: result.document_verification ? {
        documentType: result.document_verification.document_type || '',
        issuingCountry: result.document_verification.issuing_country || '',
        issuingAuthority: result.document_verification.issuing_authority || '',
        expiryDate: result.document_verification.expiry_date
      } : undefined,
      errors: result.errors
    };
  }

  private async updateVerificationInDatabase(jobId: string, data: any): Promise<void> {
    const updateData: any = {
      smile_id_status: this.mapSmileIdStatus(data.status),
      updated_at: new Date().toISOString()
    };

    if (data.result) {
      updateData.smile_id_result_data = data.result;
    }

    if (data.completed_at) {
      updateData.smile_id_verified_at = data.completed_at;
    }

    await supabase
      .from('user_verifications')
      .update(updateData)
      .eq('smile_id_job_id', jobId);
  }

  private async updateUserProfile(userId: string, result: any): Promise<void> {
    const updateData: any = {
      smile_id_verified: true,
      smile_id_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (result.partner_id) {
      updateData.smile_id_partner_id = result.partner_id;
    }

    if (result.result?.full_name) {
      updateData.full_name = result.result.full_name;
    }

    if (result.result?.date_of_birth) {
      // Could add a date_of_birth column to profiles if needed
    }

    await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
  }

  /**
   * Get supported ID types for a country
   */
  getSupportedIdTypes(country: string = 'CI'): Array<{ value: string; label: string }> {
    const idTypes = {
      CI: [
        { value: 'NATIONAL_ID', label: 'Carte Nationale d\'Identité (CNI)' },
        { value: 'PASSPORT', label: 'Passeport' },
        { value: 'DRIVING_LICENSE', label: 'Permis de Conduire' },
        { value: 'VOTER_CARD', label: 'Carte d\'Électeur' }
      ]
    };

    return idTypes[country as keyof typeof idTypes] || idTypes.CI;
  }

  /**
   * Validate verification parameters
   */
  validateVerificationParams(type: string, idType: string): { valid: boolean; error?: string } {
    const supportedTypes = ['biometric', 'document', 'smart_card'];
    const supportedIdTypes = this.getSupportedIdTypes().map(t => t.value);

    if (!supportedTypes.includes(type)) {
      return { valid: false, error: 'Type de vérification non supporté' };
    }

    if (!supportedIdTypes.includes(idType)) {
      return { valid: false, error: 'Type de document non supporté' };
    }

    return { valid: true };
  }
}

export const smileIdService = new SmileIdService();