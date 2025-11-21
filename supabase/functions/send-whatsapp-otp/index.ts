import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WhatsAppOTPRequest {
  phone: string;
  otp: string;
  name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phone, otp, name } = await req.json() as WhatsAppOTPRequest;

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number for WhatsApp (remove spaces, ensure +225 prefix)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('225')) {
      formattedPhone = '225' + formattedPhone;
    }
    formattedPhone = '+' + formattedPhone;

    // WhatsApp message template
    const message = `🏠 *Mon Toit - Vérification*\n\nBonjour ${name || ''},\n\nVotre code de vérification est :\n\n*${otp}*\n\nCe code est valide pendant 10 minutes.\n\n⚠️ Ne partagez jamais ce code avec qui que ce soit.\n\nMerci de faire confiance à Mon Toit !`;

    // Use InTouch API for WhatsApp (same as SMS)
    const intouchApiKey = Deno.env.get('INTOUCH_API_KEY');
    const intouchSenderId = Deno.env.get('INTOUCH_SENDER_ID') || 'MonToit';

    if (!intouchApiKey) {
      throw new Error('InTouch API key not configured');
    }

    // InTouch WhatsApp API endpoint
    const intouchUrl = 'https://api.intouch.ci/api/v1/whatsapp/send';

    const response = await fetch(intouchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${intouchApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message,
        sender: intouchSenderId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('InTouch WhatsApp API error:', errorData);
      throw new Error(`Failed to send WhatsApp message: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('WhatsApp OTP sent successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Code de vérification envoyé via WhatsApp',
        messageId: result.messageId || result.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending WhatsApp OTP:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send WhatsApp OTP',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

