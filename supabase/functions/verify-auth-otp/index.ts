import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, code }: VerifyOTPRequest = await req.json();

    // Validation
    if (!phoneNumber || !code) {
      return new Response(
        JSON.stringify({ error: 'Numéro et code requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    // Vérifier le code OTP
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Récupérer l'OTP valide
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpRecord) {
      // Incrémenter les tentatives
      await supabaseAdmin
        .from('otp_codes')
        .update({ attempts: supabaseAdmin.rpc('increment', { x: 1 }) })
        .eq('phone', normalizedPhone)
        .eq('code', code);

      return new Response(
        JSON.stringify({ error: 'Code invalide ou expiré' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Vérifier le nombre de tentatives
    if (otpRecord.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: 'Trop de tentatives. Demandez un nouveau code.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Marquer comme vérifié
    await supabaseAdmin
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Chercher ou créer un utilisateur avec ce téléphone
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*, auth_users:user_id(*)')
      .eq('phone', normalizedPhone)
      .single();

    if (existingProfile && existingProfile.auth_users) {
      // Utilisateur existant - créer une session
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: existingProfile.auth_users.email,
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Erreur de session' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          userId: existingProfile.user_id,
          action: 'login',
          sessionUrl: sessionData.properties.action_link,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Nouvel utilisateur - nécessite inscription
      return new Response(
        JSON.stringify({
          success: true,
          action: 'register',
          phoneVerified: true,
          message: 'Téléphone vérifié. Complétez votre inscription.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in verify-auth-otp:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
