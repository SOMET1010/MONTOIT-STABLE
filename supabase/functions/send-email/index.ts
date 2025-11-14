import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, any>;
}

const emailTemplates = {
  'email-verification': {
    subject: 'Vérifiez votre adresse email - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .otp-code { background: #f0fdfa; border: 3px dashed #0891b2; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0891b2; margin: 20px 0; border-radius: 10px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Vérification Email</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour ${data.name || 'utilisateur'} !</h2>
            <p>Merci de vous être inscrit sur Mon Toit. Pour finaliser votre inscription, veuillez vérifier votre adresse email en utilisant le code ci-dessous :</p>

            <div class="otp-code">${data.otp}</div>

            <p style="text-align: center; color: #6b7280;">
              <strong>Ce code expire dans ${data.expiresIn || '10 minutes'}</strong>
            </p>

            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important :</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Ne partagez jamais ce code avec qui que ce soit</li>
                <li>Mon Toit ne vous demandera jamais ce code par téléphone</li>
                <li>Ce code est à usage unique</li>
              </ul>
            </div>

            <p>Si vous n'avez pas créé de compte, ignorez simplement cet email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  welcome: {
    subject: 'Bienvenue sur Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Mon Toit</h1>
            <p>Plateforme immobilière certifiée ANSUT</p>
          </div>
          <div class="content">
            <h2>Bienvenue ${data.name} !</h2>
            <p>Merci de vous être inscrit sur Mon Toit, la plateforme immobilière certifiée ANSUT de Côte d'Ivoire.</p>
            <p>Vous pouvez maintenant :</p>
            <ul>
              <li>Rechercher des propriétés vérifiées</li>
              <li>Planifier des visites</li>
              <li>Signer des contrats électroniquement</li>
              <li>Effectuer des paiements sécurisés</li>
            </ul>
            <a href="${data.dashboardUrl || 'https://montoit.ansut.ci'}" class="button">Accéder à mon tableau de bord</a>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - ANSUT Certifié</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'payment-confirmation': {
    subject: 'Confirmation de paiement',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>✅ Paiement confirmé</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; margin-top: -10px;">
            <p>Votre paiement a été traité avec succès.</p>
            <table style="width: 100%; margin: 20px 0;">
              <tr><td><strong>Montant:</strong></td><td>${data.amount} FCFA</td></tr>
              <tr><td><strong>Référence:</strong></td><td>${data.reference}</td></tr>
              <tr><td><strong>Type:</strong></td><td>${data.type}</td></tr>
              <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
              <tr><td><strong>Méthode:</strong></td><td>${data.method}</td></tr>
            </table>
            <p>Merci d'utiliser Mon Toit pour vos transactions.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  'password-reset': {
    subject: 'Réinitialisation de votre mot de passe - Mon Toit',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Réinitialisation du mot de passe</h1>
            <p>Mon Toit - Plateforme Immobilière</p>
          </div>
          <div class="content">
            <h2>Bonjour !</h2>
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Mon Toit associé à cette adresse email.</p>

            <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>

            <div style="text-align: center;">
              <a href="${data.resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </div>

            <p style="text-align: center; color: #6b7280; margin-top: 20px;">
              <strong>Ce lien est valide pendant 30 minutes</strong>
            </p>

            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important :</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Ne partagez jamais ce lien avec qui que ce soit</li>
                <li>Ce lien ne peut être utilisé qu'une seule fois</li>
              </ul>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/>
              <a href="${data.resetLink}" style="color: #0891b2; word-break: break-all;">${data.resetLink}</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2025 Mon Toit - Tous droits réservés</p>
            <p>Ce message a été envoyé à ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

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

    const { to, template, data } = await req.json() as EmailRequest;

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, template' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: apiKeys, error: keyError } = await supabaseClient.rpc('get_api_keys', { service: 'resend' });

    if (keyError || !apiKeys || !apiKeys.api_key) {
      throw new Error('RESEND API key not configured: ' + (keyError?.message || 'No key found'));
    }

    const emailTemplate = emailTemplates[template as keyof typeof emailTemplates];
    if (!emailTemplate) {
      return new Response(
        JSON.stringify({ error: 'Invalid template' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Mon Toit <no-reply@notifications.ansut.ci>',
        to: [to],
        subject: emailTemplate.subject,
        html: emailTemplate.html(data)
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    await supabaseClient.rpc('log_api_usage', {
      p_service_name: 'resend',
      p_action: 'send_email',
      p_status: 'success',
      p_request_data: { to, template },
      p_response_data: result
    });

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
