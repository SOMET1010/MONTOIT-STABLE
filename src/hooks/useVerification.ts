import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';

interface VerificationData {
  id: string;
  user_id: string;
  smile_id_status: 'en_attente' | 'submitted' | 'processing' | 'verifie' | 'rejete';
  cnam_status: 'en_attente' | 'verifie' | 'rejete';
  face_verification_status: 'en_attente' | 'verifie' | 'rejete';
  smile_id_document_url: string | null;
  cnam_document_url: string | null;
  selfie_image_url: string | null;
  smile_id_job_id: string | null;
  smile_id_partner_id: string | null;
  smile_id_result_data: Record<string, any> | null;
  cnam_number: string | null;
  rejection_reason: string | null;
  identity_verified: boolean;
  created_at: string;
  updated_at: string;
}

export function useVerification(userId: string | undefined) {
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVerificationData = async () => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('user_verifications')
        .select(`
          id,
          user_id,
          smile_id_status,
          smile_id_verified_at,
          smile_id_document_url,
          smile_id_job_id,
          smile_id_partner_id,
          smile_id_result_data,
          cnam_status,
          cnam_verified_at,
          cnam_document_url,
          cnam_number,
          face_verification_status,
          face_verified_at,
          face_verification_confidence,
          face_verification_data,
          selfie_image_url,
          tenant_score,
          profile_completeness_score,
          rental_history_score,
          payment_reliability_score,
          last_score_update,
          ansut_certified,
          ansut_certified_at,
          rejection_reason,
          verification_notes,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      setVerification(data);
    } catch (err: any) {
      console.error('Error loading verification:', err);
      setError('Erreur lors du chargement des données de vérification');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerificationData();
  }, [userId]);

  return { verification, loading, error, reload: loadVerificationData };
}
