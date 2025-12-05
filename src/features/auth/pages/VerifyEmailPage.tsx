/**
 * Page de vérification d'email
 * Cette page permet aux utilisateurs de vérifier leur adresse email après inscription
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { authApi } from '../services/auth.api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('Aucun email fourni pour la vérification.');
      return;
    }

    // Simuler la vérification (à adapter avec votre logique réelle)
    handleVerifyEmail();
  }, [email]);

  const handleVerifyEmail = async () => {
    try {
      setStatus('loading');
      // Ici, vous pouvez ajouter la logique de vérification avec Supabase
      // Pour l'instant, nous allons juste simuler un délai
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus('success');
      setMessage('Votre adresse email a été vérifiée avec succès !');
    } catch (error) {
      setStatus('error');
      setMessage('Une erreur est survenue lors de la vérification. Veuillez réessayer.');
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;

    try {
      setIsResending(true);
      await authApi.sendEmailVerification(email);
      setMessage('Un nouvel email de vérification a été envoyé.');
    } catch (error) {
      setMessage('Impossible d\'envoyer un nouvel email. Veuillez réessayer plus tard.');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-16 w-16 text-blue-600 animate-spin" />
            <h2 className="text-xl font-semibold">Vérification en cours...</h2>
            <p className="text-gray-600 text-center">
              Nous sommes en train de vérifier votre adresse email.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h2 className="text-xl font-semibold text-green-600">Email vérifié !</h2>
            <p className="text-gray-600 text-center">
              {message}
            </p>
            <Button
              onClick={() => navigate('/auth/signin')}
              className="mt-4"
            >
              Se connecter
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-600" />
            <h2 className="text-xl font-semibold text-red-600">Erreur de vérification</h2>
            <p className="text-gray-600 text-center">
              {message}
            </p>
            {email && (
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="mt-4"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Renvoyer l'email
                  </>
                )}
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Vérification de l'email
          </CardTitle>
          <CardDescription>
            {status !== 'success' && status !== 'error' && (
              <>
                {email && `Email: ${email}`}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}

          {status !== 'loading' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}