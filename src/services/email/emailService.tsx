/**
 * Email Service - High-level email operations
 * Integrates with Resend API and provides email template functionality
 */

import { render } from '@react-email/render';
import { WelcomeEmail, PasswordResetEmail, EmailVerificationEmail } from './templates';
import { emailService, type EmailOptions, type EmailResponse, type EmailError } from './client';

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  verifyUrl: string;
  platformName?: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  platformName?: string;
}

export interface EmailVerificationEmailData {
  userName: string;
  verifyUrl: string;
  platformName?: string;
}

/**
 * High-level email service with template support
 */
export class EmailTemplateService {
  /**
   * Send welcome email with verification link
   */
  async sendWelcomeEmail({
    userName,
    userEmail,
    verifyUrl,
    platformName = 'Mon Toit'
  }: WelcomeEmailData): Promise<{ data?: EmailResponse; error?: EmailError }> {
    const emailHtml = render(
      <WelcomeEmail
        userName={userName}
        userEmail={userEmail}
        verifyUrl={verifyUrl}
        platformName={platformName}
      />
    );

    return emailService.sendEmail({
      to: userEmail,
      subject: `Bienvenue sur ${platformName} !`,
      html: emailHtml,
      tags: [
        { name: 'type', value: 'welcome' },
        { name: 'platform', value: platformName.toLowerCase() },
      ],
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail({
    userName,
    resetUrl,
    userEmail,
    platformName = 'Mon Toit'
  }: PasswordResetEmailData & { userEmail: string }): Promise<{ data?: EmailResponse; error?: EmailError }> {
    const emailHtml = render(
      <PasswordResetEmail
        userName={userName}
        resetUrl={resetUrl}
        platformName={platformName}
      />
    );

    return emailService.sendEmail({
      to: userEmail,
      subject: `Réinitialisation de votre mot de passe ${platformName}`,
      html: emailHtml,
      tags: [
        { name: 'type', value: 'password_reset' },
        { name: 'platform', value: platformName.toLowerCase() },
      ],
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerificationEmail({
    userName,
    verifyUrl,
    userEmail,
    platformName = 'Mon Toit'
  }: EmailVerificationEmailData & { userEmail: string }): Promise<{ data?: EmailResponse; error?: EmailError }> {
    const emailHtml = render(
      <EmailVerificationEmail
        userName={userName}
        verifyUrl={verifyUrl}
        platformName={platformName}
      />
    );

    return emailService.sendEmail({
      to: userEmail,
      subject: `Vérifiez votre adresse email - ${platformName}`,
      html: emailHtml,
      tags: [
        { name: 'type', value: 'email_verification' },
        { name: 'platform', value: platformName.toLowerCase() },
      ],
    });
  }

  /**
   * Send custom email with HTML content
   */
  async sendCustomEmail(options: EmailOptions): Promise<{ data?: EmailResponse; error?: EmailError }> {
    return emailService.sendEmail(options);
  }

  /**
   * Send notification email to admin
   */
  async sendAdminNotification(
    subject: string,
    content: string,
    adminEmail: string = import.meta.env.VITE_ADMIN_EMAIL || 'admin@mon-toit.com'
  ): Promise<{ data?: EmailResponse; error?: EmailError }> {
    return emailService.sendEmail({
      to: adminEmail,
      subject: `[Mon Toit] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">${subject}</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            ${content}
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Cet email a été envoyé depuis la plateforme Mon Toit.
          </p>
        </div>
      `,
      tags: [{ name: 'type', value: 'admin_notification' }],
    });
  }
}

// Export singleton instance
export const emailTemplateService = new EmailTemplateService();
export default emailTemplateService;