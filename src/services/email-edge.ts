/**
 * Email Service - Utilise les Edge Functions Supabase pour éviter les problèmes CORS
 * Service d'envoi d'emails via Resend API
 */

export interface EmailTemplate {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  verifyUrl: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  userEmail: string;
}

export interface VerificationCodeEmailData {
  userName: string;
  code: string;
  expiryMinutes: number;
  userEmail: string;
}

export interface EmailResult {
  data?: {
    id: string;
  };
  error?: {
    message: string;
    name: string;
    statusCode: number;
  };
}

class EmailTemplateService {
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private readonly fromEmail: string;

  constructor() {
    this.supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] || 'http://127.0.0.1:54321';
    this.supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] || '';
    this.fromEmail = import.meta.env['VITE_RESEND_FROM_EMAIL'] || 'no-reply@notifications.ansut.ci';

    console.log('🔧 Configuration Email Edge Service:');
    console.log('- Supabase URL:', this.supabaseUrl);
    console.log('- From Email:', this.fromEmail);
    console.log('- API Key Resend:', import.meta.env['VITE_RESEND_API_KEY'] ? '✅ Configurée' : '❌ Manquante');

    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.warn('⚠️ Configuration Supabase manquante - Le service email ne fonctionnera pas');
    }
  }

  /**
   * Envoyer un email via l'Edge Function Supabase
   */
  private async sendEmailInternal(emailData: EmailTemplate): Promise<EmailResult> {
    try {
      if (!this.supabaseUrl || !this.supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante');
      }

      console.log('📤 Envoi d\'email via Edge Function:', {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from || this.fromEmail
      });

      const response = await fetch(`${this.supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailData.from || this.fromEmail,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          replyTo: emailData.replyTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erreur réponse Edge Function:', data);
        return {
          error: {
            message: data.error || "Erreur lors de l'envoi de l'email",
            name: data.name || 'SendError',
            statusCode: response.status,
          },
        };
      }

      console.log('✅ Email envoyé avec succès:', data);
      return { data };
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email:", error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue',
          name: 'NetworkError',
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Template d'email de bienvenue
   */
  private getWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur Mon Toit</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .welcome-title {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .security-info {
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .feature {
            text-align: center;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
        }
        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏠 Mon Toit</div>
            <h1 class="welcome-title">Bienvenue ${data.userName} !</h1>
        </div>
        
        <div class="content">
            <p>Merci de vous être inscrit sur <strong>Mon Toit</strong>, la plateforme de location immobilière sécurisée en Côte d'Ivoire.</p>
            
            <div class="security-info">
                <strong>🛡️ Votre sécurité est notre priorité</strong><br>
                Mon Toit vous protège contre les arnaques avec la vérification ANSUT et des paiements sécurisés.
            </div>

            <p>Pour activer votre compte et accéder à toutes nos fonctionnalités, veuillez vérifier votre adresse email :</p>
            
            <div style="text-align: center;">
                <a href="${data.verifyUrl}" class="button">Vérifier mon adresse email</a>
            </div>

            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🔍</div>
                    <strong>Recherche sécurisée</strong>
                    <p>Trouvez des logements vérifiés</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🛡️</div>
                    <strong>Protection anti-arnaque</strong>
                    <p>Vérification ANSUT obligatoire</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💰</div>
                    <strong>Paiements sécurisés</strong>
                    <p>Mobile Money et séquestre</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📝</div>
                    <strong>Contrats légaux</strong>
                    <p>Signature électronique CryptoNeo</p>
                </div>
            </div>

            <p><strong>Processus de location sécurisé :</strong></p>
            <ol>
                <li>🔍 Recherchez des propriétés vérifiées</li>
                <li>🗓️ Planifiez des visites en toute sécurité</li>
                <li>📝 Signez le bail électroniquement</li>
                <li>💰 Effectuez les paiements via la plateforme</li>
                <li>🏠 Emménagez en toute tranquillité</li>
            </ol>
        </div>

        <div class="footer">
            <p><strong>Mon Toit - La location en toute sécurité</strong></p>
            <p>Cet email a été envoyé à ${data.userEmail}</p>
            <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
        </div>
    </div>
</body>
</html>`;

    return {
      to: [data.userEmail],
      subject: 'Bienvenue sur Mon Toit - Vérifiez votre adresse email',
      html,
    };
  }

  /**
   * Template d'email de réinitialisation de mot de passe
   */
  private getPasswordResetEmailTemplate(data: PasswordResetEmailData): EmailTemplate {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe - Mon Toit</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏠 Mon Toit</div>
            <h1 class="title">Réinitialisation de mot de passe</h1>
        </div>
        
        <p>Bonjour ${data.userName},</p>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Mon Toit.</p>
        
        <div class="warning">
            <strong>⚠️ Important :</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.
        </div>
        
        <div style="text-align: center;">
            <a href="${data.resetUrl}" class="button">Réinitialiser mon mot de passe</a>
        </div>
        
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email. Votre mot de passe restera inchangé.</p>
        
        <p>Pour des raisons de sécurité, ne partagez jamais ce lien avec d'autres personnes.</p>

        <div class="footer">
            <p><strong>Mon Toit - La location en toute sécurité</strong></p>
            <p>Cet email a été envoyé suite à votre demande</p>
        </div>
    </div>
</body>
</html>`;

    return {
      to: [data.userEmail],
      subject: 'Réinitialisation de mot de passe - Mon Toit',
      html,
    };
  }

  /**
   * Template d'email de code de vérification
   */
  private getVerificationCodeEmailTemplate(data: VerificationCodeEmailData): EmailTemplate {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification - Mon Toit</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .code-container {
            background-color: #f0f9ff;
            border: 2px dashed #2563eb;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 5px;
            margin: 10px 0;
        }
        .expiry {
            color: #6b7280;
            font-size: 14px;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏠 Mon Toit</div>
            <h1 class="title">Code de vérification</h1>
        </div>
        
        <p>Bonjour ${data.userName},</p>
        
        <p>Voici votre code de vérification pour sécuriser votre compte Mon Toit :</p>
        
        <div class="code-container">
            <div class="code">${data.code}</div>
            <div class="expiry">⏰ Ce code expire dans ${data.expiryMinutes} minutes</div>
        </div>
        
        <p><strong>Instructions :</strong></p>
        <ol>
            <li>Copiez ce code : <strong>${data.code}</strong></li>
            <li>Collez-le dans la page de vérification</li>
            <li>Le code est valide pendant ${data.expiryMinutes} minutes uniquement</li>
        </ol>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>⚠️ Sécurité :</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Ne partagez jamais ce code avec d'autres personnes</li>
                <li>Mon Toit ne vous demandera jamais ce code par téléphone</li>
                <li>Si vous n'avez pas demandé ce code, ignorez cet email</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Mon Toit - La location en toute sécurité</strong></p>
            <p>Ce code a été généré pour votre sécurité</p>
        </div>
    </div>
</body>
</html>`;

    return {
      to: [data.userEmail],
      subject: `Votre code de vérification Mon Toit: ${data.code}`,
      html,
    };
  }

  /**
   * Envoyer un email de bienvenue
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
    const template = this.getWelcomeEmailTemplate(data);
    return this.sendEmailInternal(template);
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<EmailResult> {
    const template = this.getPasswordResetEmailTemplate(data);
    return this.sendEmailInternal(template);
  }

  /**
   * Envoyer un email avec code de vérification
   */
  async sendVerificationCodeEmail(data: VerificationCodeEmailData): Promise<EmailResult> {
    const template = this.getVerificationCodeEmailTemplate(data);
    return this.sendEmailInternal(template);
  }

  /**
   * Envoyer un email personnalisé
   */
  async sendCustomEmail(emailData: EmailTemplate): Promise<EmailResult> {
    return this.sendEmailInternal(emailData);
  }

  /**
   * Envoyer un email personnalisé (format compatible)
   */
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
    text?: string;
    tags?: Array<{ name: string; value: string }>;
  }): Promise<EmailResult> {
    const emailData: EmailTemplate = {
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      from: options.from,
      replyTo: options.replyTo,
    };
    
    return this.sendEmailInternal(emailData);
  }

  /**
   * Vérifier la configuration du service
   */
  isConfigured(): boolean {
    return !!(this.supabaseUrl && this.supabaseAnonKey);
  }

  /**
   * Obtenir le statut de configuration
   */
  getConfigurationStatus(): {
    apiKey: boolean;
    fromEmail: boolean;
    fullyConfigured: boolean;
  } {
    return {
      apiKey: !!this.supabaseAnonKey,
      fromEmail: !!this.fromEmail,
      fullyConfigured: !!this.supabaseUrl && !!this.supabaseAnonKey,
    };
  }
}

export const emailTemplateService = new EmailTemplateService();
export const emailService = emailTemplateService; // Pour compatibilité
export default emailTemplateService;