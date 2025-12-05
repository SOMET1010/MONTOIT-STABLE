/**
 * Email Service Client using Resend API
 * Centralized email sending functionality for the Mon Toit platform
 */

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailResponse {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  createdAt: Date;
}

export interface EmailError {
  message: string;
  type: string;
  code?: string;
}

/**
 * Email service client for Resend
 */
class EmailService {
  private readonly baseUrl = 'https://api.resend.com';
  private readonly apiKey: string;
  private readonly defaultFrom: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || '';
    this.defaultFrom = import.meta.env.VITE_RESEND_FROM_EMAIL || 'noreply@mon-toit.com';

    if (!this.apiKey) {
      console.warn('Resend API key not configured. Email functionality will be limited.');
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(options: EmailOptions): Promise<{ data?: EmailResponse; error?: EmailError }> {
    try {
      if (!this.apiKey) {
        throw new Error('Resend API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from || this.defaultFrom,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo,
          attachments: options.attachments,
          tags: options.tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data: {
          id: data.id,
          from: data.from,
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
          createdAt: new Date(data.created_at),
        },
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'SEND_ERROR',
        },
      };
    }
  }

  /**
   * Send multiple emails in a batch
   */
  async sendBatchEmails(emails: EmailOptions[]): Promise<{
    data?: EmailResponse[];
    error?: EmailError | EmailError[]
  }> {
    try {
      if (!this.apiKey) {
        throw new Error('Resend API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/emails/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.defaultFrom,
          emails: emails.map(email => ({
            to: Array.isArray(email.to) ? email.to : [email.to],
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: email.replyTo,
            attachments: email.attachments,
            tags: email.tags,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data: data.map((email: any) => ({
          id: email.id,
          from: email.from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          createdAt: new Date(email.created_at),
        })),
      };
    } catch (error) {
      console.error('Batch email sending error:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'BATCH_SEND_ERROR',
        },
      };
    }
  }

  /**
   * Retrieve email details by ID
   */
  async getEmail(emailId: string): Promise<{ data?: EmailResponse; error?: EmailError }> {
    try {
      if (!this.apiKey) {
        throw new Error('Resend API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/emails/${emailId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data: {
          id: data.id,
          from: data.from,
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
          createdAt: new Date(data.created_at),
        },
      };
    } catch (error) {
      console.error('Email retrieval error:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'RETRIEVE_ERROR',
        },
      };
    }
  }

  /**
   * List emails with optional filtering
   */
  async listEmails(options: {
    limit?: number;
    page?: number;
    from?: string;
    to?: string;
    subject?: string;
  } = {}): Promise<{ data?: EmailResponse[]; error?: EmailError }> {
    try {
      if (!this.apiKey) {
        throw new Error('Resend API key not configured');
      }

      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.page) params.append('page', options.page.toString());
      if (options.from) params.append('from', options.from);
      if (options.to) params.append('to', options.to);
      if (options.subject) params.append('subject', options.subject);

      const response = await fetch(`${this.baseUrl}/emails?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data: data.map((email: any) => ({
          id: email.id,
          from: email.from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          createdAt: new Date(email.created_at),
        })),
      };
    } catch (error) {
      console.error('Email list error:', error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'LIST_ERROR',
        },
      };
    }
  }
}

// Singleton instance
export const emailService = new EmailService();
export default emailService;