import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/services/supabase/server';
import crypto from 'crypto';

/**
 * API endpoint pour soumettre une vérification Smile ID
 * Toute la logique de signature et d'appel API se fait côté serveur
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const {
      userId,
      fileType,
      imageBase64,
      idType = 'NATIONAL_ID',
      country = 'CI',
      jobType = 1 // 1 = Biometric KYC, 5 = Document Verification
    } = body;

    // Validation des données
    if (!userId || !imageBase64) {
      return NextResponse.json(
        { error: 'Données manquantes: userId et imageBase64 sont requis' },
        { status: 400 }
      );
    }

    // Configuration Smile ID
    const partnerId = process.env.SMILE_ID_PARTNER_ID || '7685';
    const apiKey = process.env.SMILE_ID_API_KEY || '965535ad-7ca6-45f4-a207-00f88e47c946';
    const isSandbox = process.env.VITE_SMILE_ID_SANDBOX !== 'false';
    const baseUrl = isSandbox ? 'https://testapi.usesmileid.com' : 'https://api.usesmileid.com';

    // Créer un job ID unique
    const timestamp = Math.floor(Date.now() / 1000);
    const randomString = Math.random().toString(36).substring(2, 15);
    const jobId = `${partnerId}_${timestamp}_${randomString}`;

    // Générer la signature HMAC
    const message = `timestamp:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', apiKey)
      .update(message)
      .digest('hex');

    // Préparer les paramètres pour Smile ID
    const partnerParams = {
      job_id: jobId,
      user_id: userId,
      job_type: jobType,
      optional_info: `${fileType}_verification_initiated`
    };

    const imageDetails = jobType === 1
      ? { selfie: imageBase64 }
      : { id_card_front: imageBase64 };

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

    // Enregistrer la tentative dans la base de données
    await supabase
      .from('user_verifications')
      .upsert({
        user_id: userId,
        smile_id_job_id: jobId,
        smile_id_status: 'en_attente',
        smile_id_job_type: jobType === 1 ? 'biometric_kyc' : 'document_verification',
        smile_id_id_type: idType,
        smile_id_country_code: country,
        smile_id_partner_params: partnerParams,
        smile_id_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5176'}/api/smile-id/callback`,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    // Appeler l'API Smile ID
    const response = await fetch(`${baseUrl}/v1/job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-smile-timestamp': timestamp.toString(),
        'x-smile-signature': signature,
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Smile ID API Error:', errorText);
      return NextResponse.json(
        { error: `Échec de l'appel API Smile ID: ${response.status}` },
        { status: 500 }
      );
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

    console.log('✅ Smile ID job submitted:', result);

    return NextResponse.json({
      success: true,
      jobId,
      status: 'submitted',
      partnerParams,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur dans lAPI Smile ID:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}