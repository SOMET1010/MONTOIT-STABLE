import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';

/**
 * API endpoint pour vérifier le statut d'une vérification Smile ID
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId est requis' },
        { status: 400 }
      );
    }

    // Configuration Smile ID
    const partnerId = process.env.SMILE_ID_PARTNER_ID || '7685';
    const apiKey = process.env.SMILE_ID_API_KEY || '965535ad-7ca6-45f4-a207-00f88e47c946';
    const isSandbox = process.env.VITE_SMILE_ID_SANDBOX !== 'false';
    const baseUrl = isSandbox ? 'https://testapi.usesmileid.com' : 'https://api.usesmileid.com';

    // Récupérer les informations de vérification depuis la base de données
    const { data: verification, error: fetchError } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('smile_id_job_id', jobId)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Vérification non trouvée' },
        { status: 404 }
      );
    }

    // Appeler l'API Smile ID pour vérifier le statut
    const response = await fetch(`${baseUrl}/v1/job/${jobId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Échec de la vérification du statut: ${response.status}` },
        { status: 500 }
      );
    }

    const result = await response.json();

    // Mapper le code de résultat vers notre statut
    let status: string;
    switch (result.result_code) {
      case '1210': // Enroll User
      case '1211': // Verify User
      case '1212': // ID Card Validation
      case '1213': // ID Number Validation
      case '1214': // Business Verification
      case '1215': // Enhanced Document Verification
      case '1216': // Enhanced KYC
        status = 'completed';
        break;
      case '1201': // Job Submitted
        status = 'submitted';
        break;
      case '1202': // Job Processing
        status = 'processing';
        break;
      case '1203': // Job Failed
        status = 'failed';
        break;
      default:
        status = 'pending';
    }

    // Mettre à jour le statut dans la base de données si nécessaire
    if (status !== verification.smile_id_status) {
      await supabase
        .from('user_verifications')
        .update({
          smile_id_status: status,
          smile_id_result_data: result,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', verification.user_id);
    }

    return NextResponse.json({
      success: true,
      jobId,
      userId: verification.user_id,
      status,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}