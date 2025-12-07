import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import WebApi from 'npm:smile-identity-core/WebApi'

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
      jobId,
      product = 'biometric_kyc',
      callbackUrl,
      partnerParams = {},
    } = (await req.json().catch(() => ({}))) || {}

    const partnerId = Deno.env.get('SMILE_ID_PARTNER_ID')
    const apiKey = Deno.env.get('SMILE_ID_API_KEY')
    const defaultCallback = Deno.env.get('SMILE_ID_CALLBACK_URL') || Deno.env.get('SITE_URL') || ''
    const isSandbox = Deno.env.get('SMILE_ID_SANDBOX') !== 'false'

    if (!partnerId || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Configuration Smile ID manquante (SMILE_ID_PARTNER_ID / SMILE_ID_API_KEY)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sidServer = isSandbox ? 'test' : 'prod'
    const connection = new WebApi(partnerId, defaultCallback, apiKey, sidServer)

    const generatedUserId = userId || `user-${crypto.randomUUID()}`
    const generatedJobId = jobId || `job-${crypto.randomUUID()}`

    const requestParams = {
      user_id: generatedUserId,
      job_id: generatedJobId,
      product,
      callback_url: callbackUrl || defaultCallback,
      ...partnerParams,
    }

    const result = await connection.get_web_token(requestParams)

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erreur smile-id-web-token:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la création du token Smile ID' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
