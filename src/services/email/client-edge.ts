/**
 * Email Client Service - Utilise les Edge Functions Supabase pour éviter les problèmes CORS
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailResponse {
  id: string;
}

export interface EmailError {
  message: string;
  name: string;
  statusCode: number;
}

export interface EmailResult {
  data?: EmailResponse;
  error?: EmailError;
}

/**
 * Service client pour l'envoi d'emails via Edge Functions Supabase
 */
class EmailService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  /**
   * Envoyer un email via l'Edge Function
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          html: options.html,
          from: options.from,
          replyTo: options.replyTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.error || "Erreur lors de l'envoi de l'email",
            name: data.name || 'SendError',
            statusCode: response.status,
          },
        };
      }

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
   * Vérifier si le service est configuré
   */
  isConfigured(): boolean {
    return !!(this.supabaseUrl && this.supabaseAnonKey);
  }

  /**
   * Obtenir le statut de configuration
   */
  getConfigurationStatus(): {
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    fullyConfigured: boolean;
  } {
    return {
      supabaseUrl: !!this.supabaseUrl,
      supabaseAnonKey: !!this.supabaseAnonKey,
      fullyConfigured: !!this.supabaseUrl && !!this.supabaseAnonKey,
    };
  }
}

export const emailService = new EmailService();
export default emailService;