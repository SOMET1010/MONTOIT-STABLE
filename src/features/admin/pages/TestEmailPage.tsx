/**
 * Page de test pour l'envoi d'emails
 * Permet de tester rapidement la configuration Resend
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { emailTemplateService, emailService } from '@/services/email';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestEmailPage() {
  const [recipient, setRecipient] = useState('aboa.akoun40@gmail.com');
  const [subject, setSubject] = useState('Test Email depuis Mon Toit');
  const [message, setMessage] = useState('Ceci est un email de test envoyé via Resend.');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendTemplateEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const emailResult = await emailTemplateService.sendWelcomeEmail({
        userName: 'Utilisateur Test',
        userEmail: recipient,
        verifyUrl: 'https://mon-toit.com/verify-email',
      });

      if (emailResult.error) {
        setResult({
          type: 'error',
          message: `Erreur: ${emailResult.error.message}`,
        });
      } else {
        setResult({
          type: 'success',
          message: `Email envoyé avec succès! ID: ${emailResult.data?.id}`,
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCustomEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const emailResult = await emailService.sendEmail({
        to: recipient,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">${subject}</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
              <p>${message}</p>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              Cet email a été envoyé depuis la plateforme Mon Toit.
            </p>
          </div>
        `,
        text: message,
        tags: [
          { name: 'type', value: 'test' },
          { name: 'platform', value: 'mon-toit' },
        ],
      });

      if (emailResult.error) {
        setResult({
          type: 'error',
          message: `Erreur: ${emailResult.error.message}`,
        });
      } else {
        setResult({
          type: 'success',
          message: `Email envoyé avec succès! ID: ${emailResult.data?.id}`,
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const emailResult = await emailTemplateService.sendPasswordResetEmail({
        userName: 'Utilisateur Test',
        userEmail: recipient,
        resetUrl: 'https://mon-toit.com/reset-password',
      });

      if (emailResult.error) {
        setResult({
          type: 'error',
          message: `Erreur: ${emailResult.error.message}`,
        });
      } else {
        setResult({
          type: 'success',
          message: `Email de réinitialisation envoyé avec succès! ID: ${emailResult.data?.id}`,
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Test d'envoi d'emails (Resend)
          </CardTitle>
          <CardDescription>
            Testez la configuration de l'envoi d'emails via l'API Resend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Email du destinataire</Label>
              <Input
                id="recipient"
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="destinataire@exemple.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleSendTemplateEmail}
              disabled={isLoading || !recipient}
              className="w-full"
            >
              {isLoading ? 'Envoi en cours...' : 'Tester Email Bienvenue'}
            </Button>

            <Button
              onClick={handleSendPasswordReset}
              disabled={isLoading || !recipient}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Envoi en cours...' : 'Tester Email Réinitialisation'}
            </Button>

            <Button
              onClick={handleSendCustomEmail}
              disabled={isLoading || !recipient}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? 'Envoi en cours...' : 'Tester Email Personnalisé'}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Sujet (email personnalisé)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Sujet de l'email"
              />
            </div>
            <div>
              <Label htmlFor="message">Message (email personnalisé)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contenu de l'email"
                rows={4}
              />
            </div>
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg flex items-center gap-2 ${
                result.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {result.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{result.message}</span>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Configuration Resend</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• API Key: {import.meta.env.VITE_RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante'}</p>
              <p>• From Email: {import.meta.env.VITE_RESEND_FROM_EMAIL || '❌ Non configuré'}</p>
              <p>• Admin Email: {import.meta.env.VITE_ADMIN_EMAIL || '❌ Non configuré'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}