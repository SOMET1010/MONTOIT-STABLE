import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Skip JWT verification for local development
  const isLocalDev = req.headers.get("host")?.includes("127.0.0.1") || req.headers.get("host")?.includes("localhost");
  if (!isLocalDev) {
    // In production, JWT verification is handled by Supabase automatically
    // We don't need to manually verify it here
  }

  try {
    const { email, phone, type, name } = await req.json();

    if (!type || !name) {
      return new Response(
        JSON.stringify({ error: "Type and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the verification code in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Store verification code with expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: storageError } = await supabase
      .from("verification_codes")
      .insert({
        identifier: email || phone,
        code: verificationCode,
        type: type,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      });

    if (storageError) {
      console.error("Error storing verification code:", storageError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send the verification code based on type
    if (type === "email" && email) {
      // Send via Resend
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

      const { data, error } = await resend.emails.send({
        from: "no-reply@notifications.ansut.ci",
        to: [email],
        subject: "Votre code de vérification - MON TOIT",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e74c3c; margin: 0;">MON TOIT</h1>
              <p style="color: #666; margin: 5px 0;">Votre plateforme immobilière de confiance</p>
            </div>

            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-top: 0;">Code de vérification</h2>
              <p style="color: #34495e; line-height: 1.6;">
                Bonjour ${name},<br><br>
                Merci de vous être inscrit sur MON TOIT ! Pour finaliser votre inscription,
                veuillez utiliser le code de vérification ci-dessous :
              </p>

              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Votre code de vérification est :</p>
                <div style="font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px;">
                  ${verificationCode}
                </div>
              </div>

              <p style="color: #7f8c8d; font-size: 14px; text-align: center; margin-top: 20px;">
                Ce code expire dans 10 minutes. Ne partagez ce code avec personne.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #95a5a6; font-size: 12px;">
              <p>© 2024 MON TOIT. Tous droits réservés.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Error sending email:", error);
        return new Response(
          JSON.stringify({ error: "Failed to send verification email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Verification code sent via email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (type === "sms" && phone) {
      // Send SMS via Brevo
      try {
        const brevoApiKey = Deno.env.get("BREVO_API_KEY");
        if (!brevoApiKey) {
          throw new Error("Brevo API key not configured");
        }

        const smsResponse = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": brevoApiKey,
          },
          body: JSON.stringify({
            sender: "MonToit",
            recipient: phone,
            content: `Votre code de verification Mon Toit est: ${verificationCode}. Valable 10 minutes.`,
            type: "transactional",
          }),
        });

        if (!smsResponse.ok) {
          const errorData = await smsResponse.json().catch(() => ({}));
          console.error("Brevo SMS error:", errorData);

          // Gérer les erreurs spécifiques de Brevo
          if (smsResponse.status === 401) {
            throw new Error("API Brevo SMS non activée. Veuillez activer l'API SMS dans votre compte Brevo et configurer un nom d'expéditeur.");
          } else if (smsResponse.status === 400) {
            throw new Error(`Erreur de configuration Brevo: ${errorData.message || 'Paramètres invalides'}`);
          } else if (smsResponse.status === 429) {
            throw new Error("Limite d'envoi dépassée. Veuillez réessayer plus tard.");
          } else {
            throw new Error(`Erreur Brevo (${smsResponse.status}): ${errorData.message || 'Échec de l\'envoi du SMS'}`);
          }
        }

        const smsData = await smsResponse.json();
        console.log("SMS sent successfully:", smsData);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Verification code sent via SMS",
            messageId: smsData.messageId
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (smsError) {
        console.error("Error sending SMS:", smsError);
        return new Response(
          JSON.stringify({ error: smsError.message || "Failed to send SMS" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (type === "whatsapp" && phone) {
      // WhatsApp not implemented yet
      return new Response(
        JSON.stringify({ error: "WhatsApp verification not implemented" }),
        { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid verification type or missing contact information" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error in send-verification-code function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});