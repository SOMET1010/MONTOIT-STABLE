import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyRequest {
  email?: string;
  phone?: string;
  code: string;
  type: 'email' | 'sms';
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

    const { email, phone, code, type } = await req.json() as VerifyRequest;

    if (!code || !type || (type === 'email' && !email) || (type === 'sms' && !phone)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the code using the database function
    const { data: result, error: verifyError } = await supabaseClient.rpc('verify_otp_code', {
      p_email: type === 'email' ? email : null,
      p_phone: type === 'sms' ? phone : null,
      p_code: code,
      p_type: type
    });

    if (verifyError) {
      throw new Error('Verification error: ' + verifyError.message);
    }

    const verificationResult = result as any;

    if (!verificationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: verificationResult.error,
          attemptsRemaining: verificationResult.attempts_remaining
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful verification
    await supabaseClient.rpc('log_api_usage', {
      p_service_name: 'verification',
      p_action: `verify_${type}`,
      p_status: 'success',
      p_request_data: { type, verified: true },
      p_response_data: { userId: verificationResult.user_id }
    }).catch(() => {}); // Ignore logging errors

    return new Response(
      JSON.stringify({
        success: true,
        message: verificationResult.message,
        userId: verificationResult.user_id,
        verified: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error verifying code:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});