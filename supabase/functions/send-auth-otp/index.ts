import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OTPRequest {
  phoneNumber: string;
  method: 'sms' | 'whatsapp';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, method }: OTPRequest = await req.json();

    // Validation
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Numéro de téléphone requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Normaliser le numéro
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    if (normalizedPhone.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Numéro de téléphone invalide' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Générer un code OTP à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocker l'OTP dans Supabase (expire après 10 minutes)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Créer ou mettre à jour l'OTP dans la table
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/otp_codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        code: otp,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        verified: false,
      }),
    });

    if (!storeResponse.ok) {
      console.error('Failed to store OTP:', await storeResponse.text());
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la génération du code' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Envoyer le code via InTouch (SMS ou WhatsApp)
    const intouchUrl = method === 'sms'
      ? `${supabaseUrl}/functions/v1/intouch-sms`
      : `${supabaseUrl}/functions/v1/send-whatsapp`;

    const message = `Votre code Mon Toit est : ${otp}\n\nCe code expire dans 10 minutes. Ne le partagez avec personne.`;

    const sendResponse = await fetch(intouchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: normalizedPhone,
        message: message,
      }),
    });

    if (!sendResponse.ok) {
      console.warn('Failed to send OTP, but code was stored:', await sendResponse.text());
      // Continue anyway - le code est stocké
    }

    console.log(`✅ OTP sent to ${normalizedPhone} via ${method}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Code envoyé par ${method === 'sms' ? 'SMS' : 'WhatsApp'}`,
        expiresIn: 600, // 10 minutes en secondes
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in send-auth-otp:', error);
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
