import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerificationRequest {
  email?: string;
  phone?: string;
  type: 'email' | 'sms' | 'whatsapp';
  name?: string;
  userId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, phone, type, name, userId } = await req.json() as VerificationRequest;

    if (!type || (type === 'email' && !email) || ((type === 'sms' || type === 'whatsapp') && !phone)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate OTP code
    const { data: otpData, error: otpError } = await supabaseClient.rpc('generate_otp');
    
    if (otpError || !otpData) {
      throw new Error('Failed to generate OTP: ' + (otpError?.message || 'Unknown error'));
    }

    const otp = otpData as string;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const { error: insertError } = await supabaseClient
      .from('verification_codes')
      .insert({
        user_id: userId || null,
        email: type === 'email' ? email : null,
        phone: (type === 'sms' || type === 'whatsapp') ? phone : null,
        code: otp,
        type: type,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      throw new Error('Failed to save verification code: ' + insertError.message);
    }

    // Send verification code
    if (type === 'email') {
      // Call send-email function
      const emailResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: email,
            template: 'email-verification',
            data: {
              name: name || 'utilisateur',
              email: email,
              otp: otp,
              expiresIn: '10 minutes'
            }
          })
        }
      );

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error('Failed to send email: ' + (errorData.error || 'Unknown error'));
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Code de vérification envoyé par email',
          expiresAt: expiresAt.toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'sms') {
      // Format phone number for Côte d'Ivoire
      let formattedPhone = phone!.replace(/\D/g, '');
      if (!formattedPhone.startsWith('225')) {
        formattedPhone = '225' + formattedPhone;
      }
      formattedPhone = '+' + formattedPhone;

      const message = `Mon Toit: Votre code de verification est ${otp}. Valide pendant 10 minutes. Ne partagez pas ce code.`;

      // Call send-sms function
      const smsResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumber: formattedPhone,
            message: message,
            sender: 'MonToit'
          })
        }
      );

      if (!smsResponse.ok) {
        const errorData = await smsResponse.json();
        throw new Error('Failed to send SMS: ' + (errorData.error || 'Unknown error'));
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Code de vérification envoyé par SMS',
          expiresAt: expiresAt.toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'whatsapp') {
      // Call send-whatsapp-otp function
      const whatsappResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-whatsapp-otp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone: phone,
            otp: otp,
            name: name || 'utilisateur'
          })
        }
      );

      if (!whatsappResponse.ok) {
        const errorData = await whatsappResponse.json();
        throw new Error('Failed to send WhatsApp: ' + (errorData.error || 'Unknown error'));
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Code de vérification envoyé via WhatsApp',
          expiresAt: expiresAt.toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid verification type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending verification code:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});