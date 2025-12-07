import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { userId, selfieImageUrl, referenceImageUrl, performLivenessCheck } = await request.json();

    // Validation des entrées
    if (!userId || !selfieImageUrl) {
      return NextResponse.json(
        { error: 'userId et selfieImageUrl sont requis' },
        { status: 400 }
      );
    }

    // Simuler la vérification faciale (en production, utiliser un vrai service de ML)
    const verificationResult = await simulateFaceVerification({
      selfieImageUrl,
      referenceImageUrl,
      performLivenessCheck: performLivenessCheck ?? true,
    });

    // Mettre à jour la base de données
    const { error: updateError } = await supabase
      .from('user_verifications')
      .upsert({
        user_id: userId,
        face_verification_status: verificationResult.success ? 'verifie' : 'echoue',
        selfie_image_url: selfieImageUrl,
        face_match_score: verificationResult.matchScore,
        face_confidence: verificationResult.confidence,
        liveness_detected: verificationResult.livenessDetected,
        face_verification_error: verificationResult.error,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la base de données:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du statut de vérification' },
        { status: 500 }
      );
    }

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Erreur lors de la vérification faciale:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Simulation de la vérification faciale (remplacer par un vrai service ML)
async function simulateFaceVerification(options: {
  selfieImageUrl: string;
  referenceImageUrl?: string;
  performLivenessCheck: boolean;
}): Promise<{
  success: boolean;
  confidence: number;
  matchScore?: number;
  livenessDetected?: boolean;
  error?: string;
}> {
  try {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simuler un résultat aléatoire pour la démo
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
    const livenessDetected = options.performLivenessCheck ? Math.random() > 0.1 : true;
    let matchScore = undefined;

    if (referenceImageUrl) {
      matchScore = Math.random() * 0.3 + 0.7; // 0.7-1.0
    }

    const success = confidence > 0.8 && livenessDetected && (!matchScore || matchScore > 0.8);

    return {
      success,
      confidence,
      matchScore,
      livenessDetected,
      error: success ? undefined : 'Qualité insuffisante de l\'image ou détection de vie échouée',
    };
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      error: 'Erreur lors du traitement de l\'image',
    };
  }
}