import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      userId,
      jobType = 'biometric_kyc',
      idType = 'NATIONAL_ID',
      country = 'CI',
      idNumber,
      firstName,
      lastName,
      dob,
      phoneNumber,
      email
    } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId est requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const partnerId = Deno.env.get('SMILE_ID_PARTNER_ID') || '7685'
    const apiKey = Deno.env.get('SMILE_ID_API_KEY') || ''
    const isSandbox = Deno.env.get('SMILE_ID_SANDBOX') !== 'false'
    const callbackUrl = Deno.env.get('SMILE_ID_CALLBACK_URL') || `${Deno.env.get('SITE_URL') || ''}/api/smile-id/callback`

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Clé API Smile ID manquante côté serveur' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const randomString = Math.random().toString(36).substring(2, 12)
    const jobId = `${partnerId}_${timestamp}_${randomString}`

    // Générer la signature HMAC (conforme generate-token)
    const message = `${partnerId}${jobId}${timestamp}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const partnerParams = {
      job_id: jobId,
      user_id: userId,
      job_type: jobType,
      id_type: idType,
      country,
      id_number: idNumber,
      first_name: firstName,
      last_name: lastName,
      dob,
      phone_number: phoneNumber,
      email
    }

    return new Response(
      JSON.stringify({
        success: true,
        signature,
        timestamp,
        partnerId,
        jobId,
        jobType,
        partnerParams,
        callbackUrl,
        sandbox: isSandbox
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur dans smile-id-token:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
