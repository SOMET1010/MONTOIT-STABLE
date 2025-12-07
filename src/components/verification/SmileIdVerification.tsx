import { useState, useEffect } from 'react';
import { Camera, Shield, CheckCircle, AlertCircle, Loader2, User, FileText, CreditCard } from 'lucide-react';
import { smileIdService, type SmileIdJob, type SmileIdResult } from '@/services/smileIdService';
import { useAuth } from '@/app/providers/AuthProvider';

interface SmileIdVerificationProps {
  onVerificationComplete?: (result: SmileIdResult) => void;
  onVerificationError?: (error: string) => void;
  // Alias pour compatibilité avec les appels existants
  onComplete?: (result: SmileIdResult) => void;
  className?: string;
}

/**
 * SmileIdVerification Component
 *
 * Provides a complete interface for identity verification using Smile ID
 * Supports biometric, document, and smart card verification methods
 */

export default function SmileIdVerification({
  onVerificationComplete,
  onVerificationError,
  onComplete,
  className = ''
}: SmileIdVerificationProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'method' | 'document' | 'verification' | 'complete'>('method');
  const [verificationType, setVerificationType] = useState<'biometric' | 'document' | 'smart_card'>('biometric');
  const [selectedIdType, setSelectedIdType] = useState('NATIONAL_ID');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<SmileIdJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<SmileIdResult | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  const supportedIdTypes = smileIdService.getSupportedIdTypes();

  // Check if we're in demo mode
  const isDemoMode = !import.meta.env.VITE_SMILE_ID_API_KEY ||
                     import.meta.env.VITE_SMILE_ID_API_KEY === 'demo_key' ||
                     !import.meta.env.VITE_SMILE_ID_PARTNER_ID ||
                     import.meta.env.VITE_SMILE_ID_PARTNER_ID === 'demo_partner';

  const notifyComplete = (result: SmileIdResult) => {
    onVerificationComplete?.(result);
    onComplete?.(result);
  };

  const handleStartVerification = async () => {
    if (!consentGiven) {
      setError('Merci de cocher la case de consentement avant de continuer.');
      return;
    }

    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      const validation = smileIdService.validateVerificationParams(verificationType, selectedIdType);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const job = await smileIdService.initializeVerification(
        user.id,
        verificationType,
        selectedIdType
      );

      setCurrentJob(job);
      setCurrentStep('verification');

      // Redirect to Smile ID verification page
      window.location.href = smileIdService.getVerificationUrl(job.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initialisation de la vérification';
      setError(errorMessage);
      onVerificationError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkVerificationStatus = async () => {
    if (!currentJob) return;

    setIsProcessing(true);
    try {
      const jobStatus = await smileIdService.getVerificationStatus(currentJob.id);
      if (jobStatus) {
        setCurrentJob(jobStatus);

        if (jobStatus.status === 'completed' && jobStatus.result) {
          setVerificationResult(jobStatus.result);
          setCurrentStep('complete');
          notifyComplete(jobStatus.result);
        } else if (jobStatus.status === 'failed') {
          setError('La vérification a échoué. Veuillez réessayer.');
          onVerificationError?.('La vérification a échoué');
        }
      }
    } catch (err) {
      setError('Erreur lors de la vérification du statut');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (currentJob && currentJob.status === 'submitted') {
      // Poll for status updates
      const interval = setInterval(checkVerificationStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [currentJob]);

  const handleContinueFromMethod = () => {
    if (!consentGiven) {
      setError('Merci de cocher la case de consentement avant de continuer.');
      return;
    }

    if (isProcessing) return;

    if (verificationType === 'document' || verificationType === 'smart_card') {
      setCurrentStep('document');
      return;
    }

    // Pour la biométrie, on lance directement la vérification
    handleStartVerification();
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez votre méthode de vérification
        </h2>
        <p className="text-gray-600">
          Sélectionnez la méthode que vous préférez pour vérifier votre identité
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setVerificationType('biometric')}
          className={`p-6 rounded-xl border-2 transition-all ${
            verificationType === 'biometric'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Camera className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h3 className="font-semibold text-gray-900 mb-2">Vérification biométrique</h3>
          <p className="text-sm text-gray-600">
            Reconnaissance faciale et empreintes digitales
          </p>
          <p className="text-xs text-green-600 mt-2">Recommandé</p>
        </button>

        <button
          onClick={() => setVerificationType('document')}
          className={`p-6 rounded-xl border-2 transition-all ${
            verificationType === 'document'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h3 className="font-semibold text-gray-900 mb-2">Vérification par document</h3>
          <p className="text-sm text-gray-600">
            Scan de votre carte d'identité ou passeport
          </p>
        </button>

        <button
          onClick={() => setVerificationType('smart_card')}
          className={`p-6 rounded-xl border-2 transition-all ${
            verificationType === 'smart_card'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h3 className="font-semibold text-gray-900 mb-2">Carte à puce</h3>
          <p className="text-sm text-gray-600">
            Vérification avec carte à puce biométrique
          </p>
        </button>
      </div>
    </div>
  );

  const renderDocumentSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Type de document
        </h2>
        <p className="text-gray-600">
          Sélectionnez le type de document que vous souhaitez utiliser
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportedIdTypes.map((idType) => (
          <button
            key={idType.value}
            onClick={() => setSelectedIdType(idType.value)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedIdType === idType.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="font-medium text-gray-900">{idType.label}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vérification en cours...
        </h2>
        <p className="text-gray-600">
          Vous allez être redirigé vers Smile ID pour compléter la vérification
        </p>
      </div>

      {currentJob && (
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-900">
            <strong>ID de la vérification:</strong> {currentJob.id}
          </p>
          <p className="text-sm text-blue-900 mt-1">
            <strong>Statut:</strong> {currentJob.status}
          </p>
        </div>
      )}
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vérification réussie !
        </h2>
        <p className="text-gray-600">
          Votre identité a été vérifiée avec succès
        </p>
      </div>

      {verificationResult && (
        <div className="bg-green-50 p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Informations vérifiées</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nom:</strong> {verificationResult.verificationData.fullName}</p>
                <p><strong>Numéro d'ID:</strong> {verificationResult.verificationData.idNumber}</p>
                {verificationResult.verificationData.dateOfBirth && (
                  <p><strong>Date de naissance:</strong> {verificationResult.verificationData.dateOfBirth}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Confiance</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Score global:</strong> {verificationResult.confidence}%</p>
                {verificationResult.biometricData && (
                  <p><strong>Correspondance faciale:</strong> {verificationResult.biometricData.faceMatch ? 'Oui' : 'Non'}</p>
                )}
                {verificationResult.biometricData && (
                  <p><strong>Anti-spoofing:</strong> {verificationResult.biometricData.livenessCheck ? 'Validé' : 'Non validé'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
      {/* Demo Mode Alert */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Mode Démonstration</h4>
            <p className="text-sm text-blue-700">
              Cette instance utilise des données de démonstration. La vérification Smile ID est simulée et ne se connecte pas au service réel.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Consent Section */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => {
              setConsentGiven(e.target.checked);
              if (error) setError(null);
            }}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <div className="text-sm text-gray-700">
            <p className="font-medium">Consentement de vérification d'identité</p>
            <p className="mt-1">
              J'accepte que mes informations personnelles soient collectées et vérifiées par Smile ID
              dans le but de confirmer mon identité. Les données seront traitées conformément à la
              politique de confidentialité et aux réglementations applicables.
            </p>
          </div>
        </label>
      </div>

      {/* Current Step Content */}
      {currentStep === 'method' && renderMethodSelection()}
      {currentStep === 'document' && renderDocumentSelection()}
      {currentStep === 'verification' && renderVerification()}
      {currentStep === 'complete' && renderComplete()}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        {currentStep === 'document' && (
          <button
            onClick={() => setCurrentStep('method')}
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Retour
          </button>
        )}

        {currentStep === 'method' && (
          <button
            onClick={handleContinueFromMethod}
            disabled={isProcessing}
            type="button"
            className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuer
          </button>
        )}

        {currentStep === 'document' && (
          <button
            onClick={handleStartVerification}
            disabled={isProcessing || !consentGiven}
            type="button"
            className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Commencer la vérification</span>
              </>
            )}
          </button>
        )}

        {currentStep === 'complete' && (
          <button
            onClick={() => onVerificationComplete?.(verificationResult!)}
            className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Terminer
          </button>
        )}
      </div>
    </div>
  );
}
