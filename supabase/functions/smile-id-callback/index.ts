import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Lire le corps de la requête
    const body = await req.text()
    const signature = req.headers.get('x-smile-signature')

    // Pour la production, vérifier la signature
    // if (!verifySignature(body, signature)) {
    //   return new Response({ error: 'Signature invalide' }, { status: 401 })
    // }

    let data
    try {
      data = JSON.parse(body)
    } catch (error) {
      console.error('Erreur de parsing JSON:', error)
      return new Response(
        JSON.stringify({ error: 'JSON invalide' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔔 [SMILE ID] Callback reçu:', {
      jobId: data.job_id,
      userId: data.partner_params?.user_id,
      resultCode: data.result_code,
      timestamp: data.timestamp
    })

    // Extraire les informations essentielles
    const jobId = data.job_id
    const userId = data.partner_params?.user_id
    const resultCode = data.result_code
    const timestamp = data.timestamp

    if (!jobId || !userId) {
      console.error('Données manquantes dans le callback:', { jobId, userId })
      return new Response(
        JSON.stringify({ error: 'Données manquantes' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Mapper le code de résultat vers notre statut
    let status: string
    switch (resultCode) {
      case '1210': // Enroll User
      case '1211': // Verify User
      case '1212': // ID Card Validation
      case '1213': // ID Number Validation
      case '1214': // Business Verification
      case '1215': // Enhanced Document Verification
      case '1216': // Enhanced KYC
        status = 'verifie'
        break
      case '1201': // Job Submitted
        status = 'submitted'
        break
      case '1202': // Job Processing
        status = 'en_cours'
        break
      case '1203': // Job Failed
        status = 'echoue'
        break
      default:
        status = 'inconnu'
    }

    // Mettre à jour la base de données
    const { error: updateError } = await supabase
      .from('user_verifications')
      .update({
        smile_id_status: status,
        smile_id_result_data: data,
        updated_at: new Date().toISOString()
      })
      .eq('smile_id_job_id', jobId)

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erreur de mise à jour' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`✅ [SMILE ID] Callback traité - Job: ${jobId}, Statut: ${status}`)

    // Si la vérification est réussie, mettre à jour les informations du profil
    if (status === 'verifie') {
      const confidenceValue = data.confidence_value || 0
      if (confidenceValue >= 80) { // Seulement si la confiance est suffisante
        await supabase
          .from('profiles')
          .update({
            is_verified: true,
            smile_id_verified: true,
            smile_id_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        console.log(`✅ [SMILE ID] Profil ${userId} vérifié avec confiance ${confidenceValue}%`)
      }
    }

    // Retourner une réponse à Smile ID
    return new Response(
      JSON.stringify({
        success: true,
        job_id: jobId,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur dans le callback Smile ID:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})