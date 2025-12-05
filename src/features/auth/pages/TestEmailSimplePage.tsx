/**
 * Page de test simple pour l'envoi d'emails
 * Accessible sans authentification pour tester rapidement
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { emailTemplateService } from '@/services/email';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestEmailSimplePage() {
  const [email, setEmail] = useState('aboa.akoun40@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const testEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log("Test d'envoi d'email à:", email);
      console.log(
        'API Key Resend:',
        import.meta.env.VITE_RESEND_API_KEY ? 'Configurée' : 'Manquante'
      );
      console.log('From Email:', import.meta.env.VITE_RESEND_FROM_EMAIL);

      const emailResult = await emailTemplateService.sendWelcomeEmail({
        userName: 'Développeur Test',
        userEmail: email,
        verifyUrl: 'https://mon-toit.com/verify-email?email=' + encodeURIComponent(email),
      });

      console.log('Résultat email:', emailResult);

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
      console.error('Erreur lors du test:', error);
      setResult({
        type: 'error',
        message: `Erreur inattendue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Mail className="h-6 w-6" />
            Test Email Resend
          </CardTitle>
          <CardDescription>Testez l'envoi d'emails via Resend API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email de test</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>

          <Button onClick={testEmail} disabled={isLoading || !email} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Envoyer un email de test
              </>
            )}
          </Button>

          {result && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                result.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {result.type === 'success' ? (
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
            <p>
              • API Key: {import.meta.env.VITE_RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante'}
            </p>
            <p>• From Email: {import.meta.env.VITE_RESEND_FROM_EMAIL || '❌ Non configuré'}</p>
            <p>• Admin Email: {import.meta.env.VITE_ADMIN_EMAIL || '❌ Non configuré'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
