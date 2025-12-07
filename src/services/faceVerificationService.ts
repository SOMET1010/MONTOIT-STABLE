import { supabase } from '@/services/supabase/client';
import { UploadService } from '@/services/upload/uploadService';

// Créer une instance du service d'upload
const uploadService = new UploadService();

export interface FaceVerificationOptions {
  userId: string;
  selfieImage: File;
  referenceImage?: string; // URL de l'image de référence (document d'identité)
  livenessChecks?: boolean;
}

export interface FaceVerificationResult {
  success: boolean;
  confidence: number;
  matchScore?: number;
  livenessDetected?: boolean;
  imageUrl: string;
  error?: string;
}

export interface DocumentValidationOptions {
  userId: string;
  documentImage: File;
  documentType: 'national_id' | 'passport' | 'driver_license' | 'voter_card';
  country: string;
}

export interface DocumentValidationResult {
  success: boolean;
  extractedData?: {
    fullName?: string;
    documentNumber?: string;
    dateOfBirth?: string;
    expiryDate?: string;
    issuedDate?: string;
    nationality?: string;
  };
  confidence: number;
  imageUrl: string;
  isExpired?: boolean;
  error?: string;
}

class FaceVerificationService {
  private readonly API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  /**
   * Vérifie une photo selfie avec détection de vie et correspondance faciale
   */
  async verifySelfie(options: FaceVerificationOptions): Promise<FaceVerificationResult> {
    try {
      // 1. Téléverser la photo selfie
      const uploadResult = await uploadService.uploadFile(
        options.selfieImage,
        'verifications',
        `selfie-${options.userId}-${Date.now()}`,
        {
          maxSize: 5 * 1024 * 1024, // 5MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
          compress: true
        }
      );

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error('Échec du téléversement de la photo');
      }

      const imageUrl = uploadResult.url;

      // 2. Appeler l'API de vérification faciale
      const response = await fetch(`${this.API_BASE}/api/verification/face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: options.userId,
          selfieImageUrl: imageUrl,
          referenceImageUrl: options.referenceImage,
          performLivenessCheck: options.livenessChecks ?? true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la vérification faciale');
      }

      const result = await response.json();

      // 3. Mettre à jour la base de données
      await this.updateFaceVerificationStatus(options.userId, {
        status: result.success ? 'verifie' : 'echoue',
        selfieImageUrl: imageUrl,
        matchScore: result.matchScore,
        confidence: result.confidence,
        livenessDetected: result.livenessDetected,
        error: result.error,
      });

      return {
        success: result.success,
        confidence: result.confidence,
        matchScore: result.matchScore,
        livenessDetected: result.livenessDetected,
        imageUrl,
        error: result.error,
      };
    } catch (error) {
      console.error('Erreur lors de la vérification faciale:', error);

      // Mettre à jour le statut en cas d'erreur
      await this.updateFaceVerificationStatus(options.userId, {
        status: 'echoue',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });

      return {
        success: false,
        confidence: 0,
        imageUrl: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Valide un document d'identité avec OCR
   */
  async validateDocument(options: DocumentValidationOptions): Promise<DocumentValidationResult> {
    try {
      // 1. Téléverser le document
      const uploadResult = await uploadService.uploadFile(
        options.documentImage,
        'verifications',
        `document-${options.userId}-${options.documentType}-${Date.now()}`,
        {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          compress: true
        }
      );

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error('Échec du téléversement du document');
      }

      const imageUrl = uploadResult.url;

      // 2. Appeler l'API de validation de document
      const response = await fetch(`${this.API_BASE}/api/verification/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: options.userId,
          documentImageUrl: imageUrl,
          documentType: options.documentType,
          country: options.country,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la validation du document');
      }

      const result = await response.json();

      // 3. Mettre à jour la base de données
      await this.updateDocumentVerificationStatus(options.userId, {
        status: result.success ? 'verifie' : 'echoue',
        documentType: options.documentType,
        documentImageUrl: imageUrl,
        extractedData: result.extractedData,
        confidence: result.confidence,
        isExpired: result.isExpired,
        error: result.error,
      });

      return {
        success: result.success,
        extractedData: result.extractedData,
        confidence: result.confidence,
        imageUrl,
        isExpired: result.isExpired,
        error: result.error,
      };
    } catch (error) {
      console.error('Erreur lors de la validation du document:', error);

      await this.updateDocumentVerificationStatus(options.userId, {
        status: 'echoue',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });

      return {
        success: false,
        confidence: 0,
        imageUrl: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Compare deux images pour détecter une correspondance faciale
   */
  async compareFaces(faceImage1: string, faceImage2: string): Promise<{
    match: boolean;
    confidence: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/api/verification/compare-faces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faceImage1,
          faceImage2,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la comparaison faciale');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la comparaison faciale:', error);
      return {
        match: false,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Met à jour le statut de vérification faciale dans la base de données
   */
  private async updateFaceVerificationStatus(
    userId: string,
    data: {
      status: string;
      selfieImageUrl?: string;
      matchScore?: number;
      confidence?: number;
      livenessDetected?: boolean;
      error?: string;
    }
  ): Promise<void> {
    try {
      const updateData: any = {
        face_verification_status: data.status,
        updated_at: new Date().toISOString(),
      };

      if (data.selfieImageUrl) {
        updateData.selfie_image_url = data.selfieImageUrl;
      }
      if (data.matchScore !== undefined) {
        updateData.face_match_score = data.matchScore;
      }
      if (data.confidence !== undefined) {
        updateData.face_confidence = data.confidence;
      }
      if (data.livenessDetected !== undefined) {
        updateData.liveness_detected = data.livenessDetected;
      }
      if (data.error) {
        updateData.face_verification_error = data.error;
      }

      await supabase
        .from('user_verifications')
        .upsert({
          user_id: userId,
          ...updateData,
        });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de vérification faciale:', error);
    }
  }

  /**
   * Met à jour le statut de vérification de document
   */
  private async updateDocumentVerificationStatus(
    userId: string,
    data: {
      status: string;
      documentType: string;
      documentImageUrl?: string;
      extractedData?: any;
      confidence?: number;
      isExpired?: boolean;
      error?: string;
    }
  ): Promise<void> {
    try {
      const updateData: any = {
        document_verification_status: data.status,
        document_type: data.documentType,
        updated_at: new Date().toISOString(),
      };

      if (data.documentImageUrl) {
        updateData.document_image_url = data.documentImageUrl;
      }
      if (data.extractedData) {
        updateData.extracted_document_data = data.extractedData;
      }
      if (data.confidence !== undefined) {
        updateData.document_confidence = data.confidence;
      }
      if (data.isExpired !== undefined) {
        updateData.document_expired = data.isExpired;
      }
      if (data.error) {
        updateData.document_verification_error = data.error;
      }

      await supabase
        .from('user_verifications')
        .upsert({
          user_id: userId,
          ...updateData,
        });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de vérification de document:', error);
    }
  }

  /**
   * Récupère le statut de vérification d'un utilisateur
   */
  async getVerificationStatus(userId: string): Promise<{
    faceVerification: {
      status: string;
      imageUrl?: string;
      confidence?: number;
      livenessDetected?: boolean;
      error?: string;
    };
    documentVerification: {
      status: string;
      documentType?: string;
      imageUrl?: string;
      extractedData?: any;
      confidence?: number;
      isExpired?: boolean;
      error?: string;
    };
  }> {
    try {
      const { data } = await supabase
        .from('user_verifications')
        .select(`
          face_verification_status,
          selfie_image_url,
          face_match_score,
          face_confidence,
          liveness_detected,
          face_verification_error,
          document_verification_status,
          document_type,
          document_image_url,
          extracted_document_data,
          document_confidence,
          document_expired,
          document_verification_error
        `)
        .eq('user_id', userId)
        .single();

      if (!data) {
        return {
          faceVerification: { status: 'non_commence' },
          documentVerification: { status: 'non_commence' },
        };
      }

      return {
        faceVerification: {
          status: data.face_verification_status || 'non_commence',
          imageUrl: data.selfie_image_url,
          confidence: data.face_confidence,
          livenessDetected: data.liveness_detected,
          error: data.face_verification_error,
        },
        documentVerification: {
          status: data.document_verification_status || 'non_commence',
          documentType: data.document_type,
          imageUrl: data.document_image_url,
          extractedData: data.extracted_document_data,
          confidence: data.document_confidence,
          isExpired: data.document_expired,
          error: data.document_verification_error,
        },
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de vérification:', error);
      return {
        faceVerification: { status: 'erreur', error: 'Impossible de récupérer le statut' },
        documentVerification: { status: 'erreur', error: 'Impossible de récupérer le statut' },
      };
    }
  }
}

export const faceVerificationService = new FaceVerificationService();