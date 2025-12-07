import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';
import crypto from 'crypto';

/**
 * Endpoint pour recevoir les callbacks de Smile ID
 * Documentation: https://docs.usesmileid.com/integration-options/server-to-server/javascript/
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Lire le corps de la requête
    const body = await request.text();
    const signature = request.headers.get('x-smile-signature');

    // Pour la production, vérifier la signature
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    // }

    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      console.error('Erreur de parsing JSON:', error);
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }

    console.log('🔔 [SMILE ID] Callback reçu:', {
      jobId: data.job_id,
      userId: data.partner_params?.user_id,
      resultCode: data.result_code,
      timestamp: data.timestamp
    });

    // Extraire les informations essentielles
    const jobId = data.job_id;
    const userId = data.partner_params?.user_id;
    const resultCode = data.result_code;
    const timestamp = data.timestamp;

    if (!jobId || !userId) {
      console.error('Données manquantes dans le callback:', { jobId, userId });
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Mapper le code de résultat vers notre statut
    let status: string;
    switch (resultCode) {
      case '1210': // Enroll User
      case '1211': // Verify User
      case '1212': // ID Card Validation
      case '1213': // ID Number Validation
      case '1214': // Business Verification
      case '1215': // Enhanced Document Verification
      case '1216': // Enhanced KYC
        status = 'verifie';
        break;
      case '1201': // Job Submitted
        status = 'submitted';
        break;
      case '1202': // Job Processing
        status = 'en_cours';
        break;
      case '1203': // Job Failed
        status = 'echoue';
        break;
      default:
        status = 'inconnu';
    }

    // Mettre à jour la base de données
    const { error: updateError } = await supabase
      .from('user_verifications')
      .update({
        smile_id_status: status,
        smile_id_result_data: data,
        updated_at: new Date().toISOString()
      })
      .eq('smile_id_job_id', jobId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 });
    }

    console.log(`✅ [SMILE ID] Callback traité - Job: ${jobId}, Statut: ${status}`);

    // Si la vérification est réussie, mettre à jour les informations du profil
    if (status === 'verifie') {
      const confidenceValue = data.confidence_value || 0;
      if (confidenceValue >= 80) { // Seulement si la confiance est suffisante
        await supabase
          .from('profiles')
          .update({
            is_verified: true,
            smile_id_verified: true,
            smile_id_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        console.log(`✅ [SMILE ID] Profil ${userId} vérifié avec confiance ${confidenceValue}%`);
      }
    }

    // Retourner une réponse à Smile ID
    return NextResponse.json({
      success: true,
      job_id: jobId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur dans le callback Smile ID:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: 'healthy',
    service: 'Smile ID Callback',
    timestamp: new Date().toISOString()
  });
}