/**
 * Email services exports
 */

export { emailService, type EmailOptions, type EmailResponse, type EmailError } from './client';
export { emailTemplateService, type WelcomeEmailData, type PasswordResetEmailData, type EmailVerificationEmailData } from './emailService';