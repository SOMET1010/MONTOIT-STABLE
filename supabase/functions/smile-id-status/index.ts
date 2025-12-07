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
    const url = new URL(req.url)
    const jobId = url.searchParams.get('jobId')

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId est requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Configuration Smile ID
    const partnerId = Deno.env.get('SMILE_ID_PARTNER_ID') || '7685'
    const isSandbox = Deno.env.get('SMILE_ID_SANDBOX') !== 'false'
    const baseUrl = isSandbox ? 'https://testapi.usesmileid.com' : 'https://api.usesmileid.com'

    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer les informations de vérification depuis la base de données
    const { data: verification, error: fetchError } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('smile_id_job_id', jobId)
      .single()

    if (fetchError || !verification) {
      return new Response(
        JSON.stringify({ error: 'Vérification non trouvée' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Appeler l'API Smile ID pour vérifier le statut
    const response = await fetch(`${baseUrl}/v1/job/${jobId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Échec de la vérification du statut: ${response.status}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = await response.json()

    // Mapper le code de résultat vers notre statut
    let status: string
    switch (result.result_code) {
      case '1210': // Enroll User
      case '1211': // Verify User
      case '1212': // ID Card Validation
      case '1213': // ID Number Validation
      case '1214': // Business Verification
      case '1215': // Enhanced Document Verification
      case '1216': // Enhanced KYC
        status = 'completed'
        break
      case '1201': // Job Submitted
        status = 'submitted'
        break
      case '1202': // Job Processing
        status = 'processing'
        break
      case '1203': // Job Failed
        status = 'failed'
        break
      default:
        status = 'pending'
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
        .eq('user_id', verification.user_id)

      // Si la vérification est réussie, mettre à jour les informations du profil
      if (status === 'completed') {
        const confidenceValue = result.confidence_value || 0
        if (confidenceValue >= 80) { // Seulement si la confiance est suffisante
          await supabase
            .from('profiles')
            .update({
              is_verified: true,
              smile_id_verified: true,
              smile_id_verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', verification.user_id)

          console.log(`✅ Profil ${verification.user_id} vérifié avec confiance ${confidenceValue}%`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        userId: verification.user_id,
        status,
        result: result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})