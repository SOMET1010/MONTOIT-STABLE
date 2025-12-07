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
    const { userId, fileType, imageBase64, idType = 'NATIONAL_ID', country = 'CI', jobType = 1 } = await req.json()

    // Validation des données
    if (!userId || !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes: userId et imageBase64 sont requis' }),
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
      job_type: jobType,
      optional_info: `${fileType}_verification_initiated`
    }

    const imageDetails = jobType === 1
      ? { selfie: imageBase64 }
      : { id_card_front: imageBase64 }

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
        smile_id_job_type: jobType === 1 ? 'biometric_kyc' : 'document_verification',
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
        JSON.stringify({ error: `Échec de l'appel API Smile ID: ${response.status}` }),
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