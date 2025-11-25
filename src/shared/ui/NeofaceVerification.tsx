import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

interface NeofaceVerificationProps {
  userId: string;
  cniPhotoUrl: string;
  onVerified: (verificationData: any) => void;
  onFailed: (error: string) => void;
}

interface VerificationResponse {
  success: boolean;
  document_id: string;
  selfie_url: string;
  verification_id: string;
  provider: string;
  message: string;
}

interface StatusResponse {
  status: 'waiting' | 'verified' | 'failed';
  message: string;
  document_id: string;
  matching_score?: number;
  verified_at?: string;
  provider: string;
}

const NeofaceVerification: React.FC<NeofaceVerificationProps> = ({
  userId,
  cniPhotoUrl,
  onVerified,
  onFailed,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'waiting' | 'polling' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [matchingScore, setMatchingScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState('');
  const selfieWindowRef = useRef<Window | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
        selfieWindowRef.current.close();
      }
    };
  }, []);

  const uploadDocument = async (): Promise<VerificationResponse> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/neoface-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        action: 'upload_document',
        cni_photo_url: cniPhotoUrl,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Échec du téléchargement du document');
    }

    return await response.json();
  };

  const checkVerificationStatus = async (
    docId: string,
    verifyId: string
  ): Promise<StatusResponse> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/neoface-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        action: 'check_status',
        document_id: docId,
        verification_id: verifyId,
      }),
    });

    return await response.json();
  };

  const startPolling = (docId: string, verifyId: string) => {
    setStatus('polling');
    setProgress('Vérification en cours...');
    let pollAttempts = 0;
    const maxAttempts = 100;

    timeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setStatus('error');
      setError('Timeout: La vérification n\'a pas été complétée dans les délais. Veuillez réessayer.');
      if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
        selfieWindowRef.current.close();
      }
    }, 5 * 60 * 1000);

    pollingIntervalRef.current = setInterval(async () => {
      pollAttempts++;
      setAttempts(pollAttempts);

      try {
        const statusData = await checkVerificationStatus(docId, verifyId);

        if (statusData.status === 'verified') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
            selfieWindowRef.current.close();
          }

          setStatus('success');
          setMatchingScore(statusData.matching_score || null);
          setProgress('Identité vérifiée avec succès !');

          onVerified({
            document_id: docId,
            matching_score: statusData.matching_score,
            verified_at: statusData.verified_at,
            provider: 'neoface',
          });
        } else if (statusData.status === 'failed') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (selfieWindowRef.current && !selfieWindowRef.current.closed) {
            selfieWindowRef.current.close();
          }

          setStatus('error');
          const errorMsg = statusData.message || 'La vérification a échoué';
          setError(errorMsg);
          onFailed(errorMsg);
        } else {
          setProgress(`En attente du selfie (tentative ${pollAttempts}/${maxAttempts})...`);
        }

        if (pollAttempts >= maxAttempts) {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setStatus('error');
          setError('Nombre maximum de tentatives atteint. Veuillez réessayer.');
        }
      } catch (err) {
        console.error('[NeoFace] Error checking status:', err);
      }
    }, 3000);
  };

  const handleVerification = async () => {
    setIsVerifying(true);
    setStatus('uploading');
    setError(null);
    setProgress('Téléchargement du document en cours...');

    try {
      const uploadData = await uploadDocument();

      setDocumentId(uploadData.document_id);
      setSelfieUrl(uploadData.selfie_url);
      setVerificationId(uploadData.verification_id);
      setProgress('Document téléchargé avec succès !');

      setStatus('waiting');
      setProgress('Ouverture de la fenêtre de capture du selfie...');

      selfieWindowRef.current = window.open(
        uploadData.selfie_url,
        'NeofaceVerification',
        'width=800,height=600,left=100,top=100'
      );

      if (!selfieWindowRef.current) {
        throw new Error('Impossible d\'ouvrir la fenêtre de vérification. Veuillez autoriser les popups.');
      }

      startPolling(uploadData.document_id, uploadData.verification_id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      setStatus('error');
      setError(errorMessage);
      onFailed(errorMessage);
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setError(null);
    setDocumentId(null);
    setSelfieUrl(null);
    setVerificationId(null);
    setMatchingScore(null);
    setAttempts(0);
    setProgress('');
    setIsVerifying(false);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleReopenWindow = () => {
    if (selfieUrl && (!selfieWindowRef.current || selfieWindowRef.current.closed)) {
      selfieWindowRef.current = window.open(
        selfieUrl,
        'NeofaceVerification',
        'width=800,height=600,left=100,top=100'
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-600" />
          Vérification Faciale NeoFace V2
        </CardTitle>
        <CardDescription>
          Vérification biométrique gratuite avec détection de vivacité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cniPhotoUrl && status === 'idle' && (
          <div className="flex justify-center">
            <img
              src={cniPhotoUrl}
              alt="Photo CNI"
              className="max-w-xs rounded-lg border-2 border-gray-200 shadow-sm"
            />
          </div>
        )}

        {status !== 'idle' && status !== 'success' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">{progress}</p>
                {attempts > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Tentative {attempts}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {status === 'waiting' && selfieUrl && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Fenêtre de capture ouverte</p>
                <p className="text-sm text-amber-700 mt-1">
                  Suivez les instructions dans la fenêtre popup pour capturer votre selfie.
                </p>
                <Button
                  onClick={handleReopenWindow}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Rouvrir la fenêtre
                </Button>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Identité Vérifiée !</p>
                <p className="text-sm text-green-700 mt-1">
                  Votre identité a été vérifiée avec succès via NeoFace V2.
                </p>
                {matchingScore !== null && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    Score de correspondance : {(matchingScore * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Erreur de vérification</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <Button
            onClick={handleVerification}
            disabled={isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Commencer la Vérification NeoFace V2
              </>
            )}
          </Button>
        )}

        {status === 'error' && (
          <Button
            onClick={handleRetry}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        )}

        <div className="border-t pt-4 space-y-2">
          <p className="text-xs text-gray-600 font-medium">
            🔒 Vérification Sécurisée
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>✓ Détection de vivacité (clignement des yeux)</li>
            <li>✓ Reconnaissance faciale par IA</li>
            <li>✓ Service 100% gratuit (0 FCFA)</li>
            <li>✓ Données cryptées et sécurisées</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeofaceVerification;
