/**
 * Page de test pour l'envoi de SMS
 * Accessible sans authentification pour tester rapidement l'envoi de SMS via Brevo
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MessageSquare, CheckCircle, AlertCircle, Loader2, Phone } from 'lucide-react';
import { supabase } from '@/services/supabase/client';

export default function TestSMSPage() {
  const [phone, setPhone] = useState('+2250140984943');
  const [name, setName] = useState('AKOUN DEV');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const testSMS = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log("Test d'envoi de SMS au:", phone);
      console.log('Nom:', name);

      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          phone: phone,
          type: 'sms',
          name: name
        }
      });

      console.log('Résultat SMS:', { data, error });

      if (error) {
        setResult({
          type: 'error',
          message: `Erreur: ${error.message}`,
        });
      } else {
        const message = data.message || 'SMS envoyé avec succès!';
        setResult({
          type: 'success',
          message: message
        });
      }
    } catch (error) {
      console.error('Erreur lors du test SMS:', error);
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
            <MessageSquare className="h-6 w-6" />
            Test SMS Brevo
          </CardTitle>
          <CardDescription>Testez l'envoi de SMS via l'API Brevo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du destinataire</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2250700000000"
            />
            <p className="text-xs text-gray-500">
              Format: +225 XX XX XX XX XX
            </p>
          </div>

          <Button onClick={testSMS} disabled={isLoading || !phone} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Envoyer un SMS de test
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
              <div className="flex-1">
                <span>{result.message}</span>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
            <p>• Brevo API: {import.meta.env.VITE_RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante'}</p>
            <p>• Le SMS doit être envoyé réellement via l'API Brevo</p>
            <p>• Format requis: +225 XX XX XX XX XX</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}