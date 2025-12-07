/**
 * Smile ID Service V2 - Implementation correcte selon la documentation officielle
 * https://docs.usesmileid.com/integration-options/server-to-server/javascript/
 */

import { supabase } from '@/services/supabase/client';
import WebApi from 'smile-identity-core/WebApi';
import Signature from 'smile-identity-core/Signature';

export interface SmileIdConfigV2 {
  partnerId: string;
  apiKey: string;
  sandbox: boolean;
  callbackUrl: string;
}

export interface SmileIdJobV2 {
  id: string;
  userId: string;
  jobType: number;
  idType: string;
  country: string;
  partnerParams: Record<string, any>;
  callbackUrl: string;
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  result?: SmileIdResultV2;
}

export interface SmileIdResultV2 {
  success: boolean;
  confidence: number;
  timestamp: string;
  resultType: string;
  partnerParams: Record<string, any>;
  selfie?: string;
  idCardFront?: string;
  idCardBack?: string;
  extractedData?: any;
}

class SmileIdServiceV2 {
  private config: SmileIdConfigV2;
  private webApi: WebApi;
  private signature: Signature;

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

    // Initialiser l'API Smile ID
    const server = this.config.sandbox ? 'test' : 'prod';
    this.webApi = new WebApi(this.config.partnerId, this.config.callbackUrl, this.config.apiKey, server);

    // Initialiser pour les signatures
    this.signature = new Signature(this.config.partnerId, this.config.apiKey);
  }

  /**
   * Générer une signature pour les appels API
   */
  private generateSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return this.signature.generate_signature(timestamp);
  }

  /**
   * Créer un job ID unique
   */
  private createJobId(): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${this.config.partnerId}_${timestamp}_${randomString}`;
  }

  /**
   * Soumettre une vérification biométrique KYC
   */
  async submitBiometricVerification(
    userId: string,
    selfieImage: File,
    idType: string = 'NATIONAL_ID',
    country: string = 'CI',
    idInfo?: Record<string, any>
  ): Promise<SmileIdJobV2> {
    try {
      const jobId = this.createJobId();

      // Créer les partner_params requis
      const partnerParams = {
        job_id: jobId,
        user_id: userId,
        job_type: 1, // Biometric KYC
        optional_info: 'verification_initiated'
      };

      // Préparer les détails d'image pour le selfie
      const imageDetails = {
        selfie: await this.fileToBase64(selfieImage)
      };

      // Enregistrer la tentative dans la base de données
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

      // Préparer les paramètres pour l'API Smile ID
      const params = {
        partner_params: partnerParams,
        image_details: imageDetails,
        id_info: idInfo || {
          id_type: idType,
          country: country
        },
        options: {
          return_job_status: true,
          return_image_links: true,
          use_enhanced_steps: true
        }
      };

      // Soumettre à Smile ID
      const response = await this.webApi.submit_job(params);

      // Mettre à jour le statut
      await supabase
        .from('user_verifications')
        .update({
          smile_id_status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      console.log('✅ Smile ID job submitted:', response);

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
      throw new Error(`Échec de la soumission Smile ID: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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
  ): Promise<SmileIdJobV2> {
    try {
      const jobId = this.createJobId();

      const partnerParams = {
        job_id: jobId,
        user_id: userId,
        job_type: 5, // Document Verification
        optional_info: 'document_verification_initiated'
      };

      const imageDetails = {
        id_card_front: await this.fileToBase64(documentImage)
      };

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

      const params = {
        partner_params: partnerParams,
        image_details: imageDetails,
        id_info: {
          id_type: documentType,
          country: country
        },
        options: {
          return_job_status: true,
          return_image_links: true,
          use_enhanced_steps: true
        }
      };

      const response = await this.webApi.submit_job(params);

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
      throw new Error(`Échec de la soumission du document: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupérer le statut d'un job
   */
  async getJobStatus(jobId: string): Promise<SmileIdJobV2 | null> {
    try {
      const response = await this.webApi.query_job_status(jobId);

      const { data: verification } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('smile_id_job_id', jobId)
        .single();

      if (!verification) {
        return null;
      }

      const status = this.mapSmileIdStatus(response.result_code);

      // Mettre à jour le statut dans la base de données
      if (status !== verification.smile_id_status) {
        await supabase
          .from('user_verifications')
          .update({
            smile_id_status: status,
            smile_id_result_data: response,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', verification.user_id);
      }

      return {
        id: jobId,
        userId: verification.user_id,
        jobType: verification.smile_id_job_type === 'biometric_kyc' ? 1 : 5,
        idType: verification.smile_id_id_type || 'NATIONAL_ID',
        country: verification.smile_id_country_code || 'CI',
        partnerParams: verification.smile_id_partner_params || {},
        callbackUrl: verification.smile_id_callback_url || '',
        status,
        createdAt: verification.created_at,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
        result: status === 'completed' ? this.parseResult(response) : undefined
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
        // Supprimer le préfixe data:image/...;base64,
        const base64 = result.split(',')[1];
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
   * Parser les résultats de Smile ID
   */
  private parseResult(response: any): SmileIdResultV2 {
    return {
      success: response.result_code === '1210' || response.result_code === '1211',
      confidence: response.confidence_value || 0,
      timestamp: response.timestamp || new Date().toISOString(),
      resultType: response.result_type || 'unknown',
      partnerParams: response.partner_params || {},
      selfie: response.selfie,
      idCardFront: response.id_card_front,
      idCardBack: response.id_card_back,
      extractedData: response.extracted_data
    };
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
      ],
      'SN': [
        { value: 'NATIONAL_ID', label: 'Carte d\'identité nationale' },
        { value: 'PASSPORT', label: 'Passeport' }
      ]
    };

    return idTypes[country] || idTypes.CI;
  }
}

export const smileIdServiceV2 = new SmileIdServiceV2();