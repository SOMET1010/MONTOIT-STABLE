import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      userId,
      jobType = 'biometric_kyc',
      selfieBase64,
      idCardFrontBase64,
      idCardBackBase64,
      idType = 'NATIONAL_ID',
      country = 'CI',
      idNumber,
      firstName,
      lastName,
      dob,
      phoneNumber,
      email
    } = await req.json()

    // Validation des données de base
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes: userId est requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Mapper les job types selon la documentation Smile ID
    const jobTypeMap: Record<string, number> = {
      biometric_kyc: 1, // Biometric KYC
      document_verification: 5, // Document Verification
      enhanced_document_verification: 12, // Enhanced Document Verification
      smartselfie_authentication: 11, // SmartSelfie Authentication
      enhanced_kyc: 14 // Enhanced KYC
    }

    const jobTypeCode = jobTypeMap[jobType] ?? 1

    // Validation des assets obligatoires selon le produit
    const needsSelfie = ['biometric_kyc', 'smartselfie_authentication'].includes(jobType)
    const needsDoc = ['document_verification', 'enhanced_document_verification'].includes(jobType)

    if (needsSelfie && !selfieBase64) {
      return new Response(
        JSON.stringify({ error: 'Une photo selfie est requise pour ce type de vérification' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (needsDoc && !idCardFrontBase64) {
      return new Response(
        JSON.stringify({ error: 'Une photo du document (face avant) est requise pour ce type de vérification' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Configuration Smile ID depuis les variables d'environnement
    const partnerId = Deno.env.get('SMILE_ID_PARTNER_ID') || '7685'
    const apiKey = Deno.env.get('SMILE_ID_API_KEY') || '965535ad-7ca6-45f4-a207-00f88e47c946'
    const isSandbox = Deno.env.get('SMILE_ID_SANDBOX') !== 'false'
    const baseUrl = isSandbox ? 'https://testapi.usesmileid.com' : 'https://api.usesmileid.com'
    const callbackUrl = Deno.env.get('SITE_URL') || 'http://localhost:5176'

    // Créer un job ID unique
    const timestamp = Math.floor(Date.now() / 1000)
    const randomString = Math.random().toString(36).substring(2, 15)
    const jobId = `${partnerId}_${timestamp}_${randomString}`

    // Générer la signature HMAC
    const message = `timestamp:${timestamp}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Préparer les paramètres pour Smile ID
    const partnerParams = {
      job_id: jobId,
      user_id: userId,
      job_type: jobTypeCode,
      optional_info: `${jobType}_initiated`
    }

    const imageDetails: Record<string, any> = {}
    if (selfieBase64) imageDetails.selfie = selfieBase64
    if (idCardFrontBase64) imageDetails.id_card_front = idCardFrontBase64
    if (idCardBackBase64) imageDetails.id_card_back = idCardBackBase64

    const idInfo = {
      id_type: idType,
      country,
      id_number: idNumber,
      first_name: firstName,
      last_name: lastName,
      dob,
      phone_number: phoneNumber,
      email
    }

    const params: Record<string, any> = {
      partner_params: partnerParams,
      image_details: imageDetails,
      options: {
        return_job_status: true,
        return_image_links: true,
        return_history: true
      }
    }

    // id_info requis pour les produits KYC/documentaires
    const shouldSendIdInfo = jobTypeCode === 14 || jobTypeCode === 12 || jobTypeCode === 5
    if (shouldSendIdInfo) {
      params.id_info = idInfo
    }

    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Enregistrer la tentative dans la base de données
    await supabase
      .from('user_verifications')
      .upsert({
        user_id: userId,
        smile_id_job_id: jobId,
        smile_id_status: 'en_attente',
        smile_id_job_type: jobType,
        smile_id_id_type: idType,
        smile_id_country_code: country,
        smile_id_partner_params: partnerParams,
        smile_id_callback_url: `${callbackUrl}/api/smile-id/callback`,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

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
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Smile ID API Error:', errorText)
      return new Response(
        JSON.stringify({ error: `Échec de l'appel API Smile ID: ${response.status} - ${errorText}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = await response.json()

    // Mettre à jour le statut
    await supabase
      .from('user_verifications')
      .update({
        smile_id_status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    console.log('✅ Smile ID job submitted:', result)

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        status: 'submitted',
        partnerParams,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur dans lEdge Function Smile ID:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
