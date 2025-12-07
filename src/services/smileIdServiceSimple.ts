/**
 * Smile ID Service Simple - Implementation directe avec HTTP
 * Basé sur la documentation officielle de Smile ID
 * https://docs.usesmileid.com/
 */

import { supabase } from '@/services/supabase/client';
import crypto from 'crypto';

export interface SmileIdConfig {
  partnerId: string;
  apiKey: string;
  sandbox: boolean;
  callbackUrl: string;
}

export interface SmileIdJob {
  id: string;
  userId: string;
  jobType: number;
  idType: string;
  country: string;
  partnerParams: Record<string, any>;
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface SmileIdResult {
  success: boolean;
  confidence?: number;
  timestamp?: string;
  resultType?: string;
  extractedData?: any;
  selfie?: string;
  idCardFront?: string;
  idCardBack?: string;
}

class SmileIdServiceSimple {
  private config: SmileIdConfig;

  constructor() {
    const partnerId = import.meta.env.VITE_SMILE_ID_PARTNER_ID;
    const apiKey = import.meta.env.VITE_SMILE_ID_API_KEY;

    if (!partnerId || !apiKey || partnerId === 'your_smile_id_partner_id' || apiKey === 'your_smile_id_api_key') {
      throw new Error(
        'Configuration Smile ID manquante. Veuillez configurer VITE_SMILE_ID_API_KEY et VITE_SMILE_ID_PARTNER_ID dans votre fichier .env'
      );
    }

    this.config = {
      partnerId,
      apiKey,
      sandbox: import.meta.env.VITE_SMILE_ID_SANDBOX !== 'false',
      callbackUrl: import.meta.env.VITE_SMILE_ID_CALLBACK_URL ||
        `${window.location.origin}/api/smile-id/callback`
    };
  }

  /**
   * Générer une signature pour les appels API
   */
  private generateSignature(timestamp: number): string {
    const message = `timestamp:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.config.apiKey)
      .update(message)
      .digest('hex');
    return signature;
  }

  /**
   * Obtenir l'URL de base de l'API Smile ID
   */
  private getBaseUrl(): string {
    return this.config.sandbox
      ? 'https://testapi.usesmileid.com'
      : 'https://api.usesmileid.com';
  }

  /**
   * Soumettre une vérification biométrique KYC
   */
  async submitBiometricVerification(
    userId: string,
    selfieImage: File,
    idType: string = 'NATIONAL_ID',
    country: string = 'CI'
  ): Promise<SmileIdJob> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const jobId = `${this.config.partnerId}_${timestamp}_${Math.random().toString(36).substring(2, 15)}`;

      const partnerParams = {
        job_id: jobId,
        user_id: userId,
        job_type: 1, // Biometric KYC
        optional_info: 'verification_initiated'
      };

      // Préparer les données
      const imageDetails = {
        selfie: await this.fileToBase64(selfieImage)
      };

      const params = {
        partner_params: partnerParams,
        image_details: imageDetails,
        id_info: {
          id_type: idType,
          country: country
        },
        options: {
          return_job_status: true,
          return_image_links: true
        }
      };

      // Signer la requête
      const signature = this.generateSignature(timestamp);
      const requestBody = JSON.stringify(params);

      // Enregistrer dans la base de données
      await supabase
        .from('user_verifications')
        .upsert({
          user_id: userId,
          smile_id_job_id: jobId,
          smile_id_status: 'en_attente',
          smile_id_job_type: 'biometric_kyc',
          smile_id_id_type: idType,
          smile_id_country_code: country,
          smile_id_partner_params: partnerParams,
          smile_id_callback_url: this.config.callbackUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      // Appeler l'API Smile ID
      const response = await fetch(`${this.getBaseUrl()}/v1/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-smile-timestamp': timestamp.toString(),
          'x-smile-signature': signature,
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Smile ID API Error:', errorData);
        throw new Error(`Échec de l'appel API Smile ID: ${response.status}`);
      }

      const result = await response.json();

      // Mettre à jour le statut
      await supabase
        .from('user_verifications')
        .update({
          smile_id_status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return {
        id: jobId,
        userId,
        jobType: 1,
        idType,
        country,
        partnerParams,
        callbackUrl: this.config.callbackUrl,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur lors de la soumission Smile ID:', error);
      throw new Error(`Échec de la soumission: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Soumettre une vérification de document
   */
  async submitDocumentVerification(
    userId: string,
    documentImage: File,
    documentType: string = 'NATIONAL_ID',
    country: string = 'CI'
  ): Promise<SmileIdJob> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const jobId = `${this.config.partnerId}_${timestamp}_${Math.random().toString(36).substring(2, 15)}`;

      const partnerParams = {
        job_id: jobId,
        user_id: userId,
        job_type: 5, // Document Verification
        optional_info: 'document_verification_initiated'
      };

      const imageDetails = {
        id_card_front: await this.fileToBase64(documentImage)
      };

      const params = {
        partner_params: partnerParams,
        image_details: imageDetails,
        id_info: {
          id_type: documentType,
          country: country
        },
        options: {
          return_job_status: true,
          return_image_links: true
        }
      };

      const signature = this.generateSignature(timestamp);
      const requestBody = JSON.stringify(params);

      await supabase
        .from('user_verifications')
        .upsert({
          user_id: userId,
          smile_id_job_id: jobId,
          smile_id_status: 'en_attente',
          smile_id_job_type: 'document_verification',
          smile_id_id_type: documentType,
          smile_id_country_code: country,
          smile_id_partner_params: partnerParams,
          smile_id_callback_url: this.config.callbackUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      const response = await fetch(`${this.getBaseUrl()}/v1/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-smile-timestamp': timestamp.toString(),
          'x-smile-signature': signature,
        },
        body: requestBody
      });

      if (!response.ok) {
        throw new Error(`Échec de l'appel API: ${response.status}`);
      }

      await supabase
        .from('user_verifications')
        .update({
          smile_id_status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return {
        id: jobId,
        userId,
        jobType: 5,
        idType: documentType,
        country,
        partnerParams,
        callbackUrl: this.config.callbackUrl,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur lors de la soumission du document:', error);
      throw new Error(`Échec de la soumission: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupérer le statut d'un job
   */
  async getJobStatus(jobId: string): Promise<SmileJob | null> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/v1/job/${jobId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();

      const status = this.mapSmileIdStatus(result.result_code);

      // Mettre à jour le statut dans la base de données
      const { data: verification } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('smile_id_job_id', jobId)
        .single();

      if (verification && status !== verification.smile_id_status) {
        await supabase
          .from('user_verifications')
          .update({
            smile_id_status: status,
            smile_id_result_data: result,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', verification.user_id);
      }

      return {
        id: jobId,
        userId: verification?.user_id || '',
        jobType: verification?.smile_id_job_type === 'biometric_kyc' ? 1 : 5,
        idType: verification?.smile_id_id_type || 'NATIONAL_ID',
        country: verification?.smile_id_country_code || 'CI',
        partnerParams: verification?.smile_id_partner_params || {},
        callbackUrl: verification?.smile_id_callback_url || '',
        status,
        createdAt: verification?.created_at || new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : undefined
      };

    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      return null;
    }
  }

  /**
   * Convertir un fichier en base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Supprimer le préfixe
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Mapper les codes de résultat Smile ID vers nos statuts
   */
  private mapSmileIdStatus(resultCode: string): 'pending' | 'submitted' | 'processing' | 'completed' | 'failed' {
    switch (resultCode) {
      case '1210': // Enroll User
      case '1211': // Verify User
      case '1212': // ID Card Validation
      case '1213': // ID Number Validation
      case '1214': // Business Verification
      case '1215': // Enhanced Document Verification
      case '1216': // Enhanced KYC
        return 'completed';
      case '1201': // Job Submitted
        return 'submitted';
      case '1202': // Job Processing
        return 'processing';
      case '1203': // Job Failed
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Obtenir les types d'ID supportés par pays
   */
  getSupportedIdTypes(country: string = 'CI'): { value: string; label: string }[] {
    const idTypes: Record<string, { value: string; label: string }[]> = {
      'CI': [
        { value: 'NATIONAL_ID', label: 'Carte d\'identité nationale' },
        { value: 'PASSPORT', label: 'Passeport' },
        { value: 'DRIVING_LICENSE', label: 'Permis de conduire' },
        { value: 'VOTER_CARD', label: 'Carte d\'électeur' }
      ],
      'BF': [
        { value: 'NATIONAL_ID', label: 'Carte d\'identité nationale' },
        { value: 'PASSPORT', label: 'Passeport' }
      ],
      'ML': [
        { value: 'NATIONAL_ID', label: 'Carte d\'identité nationale' },
        { value: 'PASSPORT', label: 'Passeport' }
      ]
    };

    return idTypes[country] || idTypes.CI;
  }
}

export const smileIdServiceSimple = new SmileIdServiceSimple();