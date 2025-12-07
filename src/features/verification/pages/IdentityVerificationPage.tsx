import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, FileCheck, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import { faceVerificationService } from '@/services/faceVerificationService';
import SmileIdVerification from '@/components/verification/SmileIdVerification';
import FaceVerificationCapture from '@/components/verification/FaceVerificationCapture';
import DocumentUpload from '@/components/verification/DocumentUpload';

interface VerificationStatus {
  smileIdStatus?: string;
  faceVerificationStatus?: string;
  documentVerificationStatus?: string;
  identityVerified: boolean;
  smileIdVerified: boolean;
  faceVerified: boolean;
  documentVerified: boolean;
  faceVerification: {
    status: string;
    imageUrl?: string;
    confidence?: number;
    livenessDetected?: boolean;
    error?: string;
  };
  documentVerification: {
    status: string;
    documentType?: string;
    imageUrl?: string;
    extractedData?: any;
    confidence?: number;
    isExpired?: boolean;
    error?: string;
  };
}

export default function IdentityVerificationPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    identityVerified: false,
    smileIdVerified: false,
    faceVerified: false,
    documentVerified: false,
    faceVerification: { status: 'non_commence' },
    documentVerification: { status: 'non_commence' },
  });
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const verificationSteps = [
    {
      id: 'smileId',
      title: 'Vérification ONECI/Smile ID',
      description: 'Vérifiez votre identité avec ONECI via Smile ID',
      icon: User,
      status: verificationStatus.smileIdVerified ? 'completed' : verificationStatus.smileIdStatus === 'en_attente' ? 'pending' : 'not_started',
      color: 'blue'
    },
    {
      id: 'face',
      title: 'Reconnaissance faciale',
      description: 'Prenez une photo selfie avec détection de vie',
      icon: Shield,
      status: verificationStatus.faceVerified ? 'completed' : verificationStatus.faceVerification.status === 'en_attente' ? 'pending' : 'not_started',
      color: 'green'
    },
    {
      id: 'documents',
      title: 'Vérification des documents',
      description: 'Téléversez et validez vos pièces d\'identité',
      icon: FileCheck,
      status: verificationStatus.documentVerified ? 'completed' : verificationStatus.documentVerification.status === 'en_attente' ? 'pending' : 'not_started',
      color: 'purple'
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    loadVerificationStatus();
  }, [user, navigate]);

  const loadVerificationStatus = async () => {
    try {
      // Charger le statut depuis le service unifié
      const verificationData = await faceVerificationService.getVerificationStatus(user?.id || '');

      // Charger les données Smile ID séparément
      const { data: smileData } = await supabase
        .from('user_verifications')
        .select('smile_id_status, smile_id_job_id, smile_id_result_data')
        .eq('user_id', user?.id)
        .maybeSingle();

      const smileIdVerified = smileData?.smile_id_status === 'verifie';
      const faceVerified = verificationData.faceVerification.status === 'verifie';
      const documentVerified = verificationData.documentVerification.status === 'verifie';

      setVerificationStatus({
        smileIdStatus: smileData?.smile_id_status,
        faceVerificationStatus: verificationData.faceVerification.status,
        documentVerificationStatus: verificationData.documentVerification.status,
        smileIdVerified,
        faceVerified,
        documentVerified,
        identityVerified: smileIdVerified && faceVerified && documentVerified,
        faceVerification: verificationData.faceVerification,
        documentVerification: verificationData.documentVerification,
      });
    } catch (error) {
      console.error('Erreur lors du chargement du statut de vérification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = (type: string) => {
    loadVerificationStatus();
  };

  const getStepIcon = (step: typeof verificationSteps[0]) => {
    const Icon = step.icon;
    const iconClass = step.status === 'completed' ? 'text-green-600' :
                     step.status === 'pending' ? 'text-yellow-600' : 'text-gray-400';

    return <Icon className={`h-6 w-6 ${iconClass}`} />;
  };

  const getStepBorder = (step: typeof verificationSteps[0]) => {
    return step.status === 'completed' ? 'border-green-500 bg-green-50' :
           step.status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
           'border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du statut de vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-terracotta-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Vérification d'identité</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complétez les étapes de vérification pour sécuriser votre compte et accéder à toutes les fonctionnalités de la plateforme.
          </p>
        </div>

        {/* Statut global */}
        <div className={`rounded-xl p-6 mb-8 ${
          verificationStatus.identityVerified
            ? 'bg-green-50 border border-green-200'
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center">
            {verificationStatus.identityVerified ? (
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            ) : (
              <AlertCircle className="h-8 w-8 text-yellow-600 mr-3" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {verificationStatus.identityVerified
                  ? 'Identité vérifiée avec succès'
                  : 'Vérification en cours'}
              </h3>
              <p className="text-gray-600">
                {verificationStatus.identityVerified
                  ? 'Votre identité a été complètement vérifiée. Vous avez accès à toutes les fonctionnalités.'
                  : 'Veuillez compléter toutes les étapes pour finaliser la vérification de votre identité.'}
              </p>
            </div>
          </div>
        </div>

        {/* Étapes de vérification */}
        <div className="space-y-6 mb-8">
          {verificationSteps.map((step, index) => (
            <div
              key={step.id}
              className={`bg-white rounded-xl border-2 ${getStepBorder(step)} p-6 transition-all duration-200 ${
                currentStep === index ? 'ring-2 ring-terracotta-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    step.status === 'completed' ? 'bg-green-100' :
                    step.status === 'pending' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    {getStepIcon(step)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {step.status === 'completed' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Terminé
                    </span>
                  )}
                  {step.status === 'pending' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="h-4 w-4 mr-1" />
                      En attente
                    </span>
                  )}
                  {step.status === 'not_started' && (
                    <button
                      onClick={() => setCurrentStep(index)}
                      className="inline-flex items-center px-4 py-2 border border-terracotta-300 rounded-lg text-sm font-medium text-terracotta-700 bg-terracotta-50 hover:bg-terracotta-100 transition-colors"
                    >
                      Commencer
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contenu de l'étape courant */}
              {currentStep === index && step.status !== 'completed' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {step.id === 'smileId' && (
                    <SmileIdVerification
                      onComplete={() => {
                        handleVerificationComplete('smileId');
                        setCurrentStep(1); // Passer à l'étape suivante
                      }}
                    />
                  )}
                  {step.id === 'face' && (
                    <FaceVerificationCapture
                      userId={user?.id || ''}
                      referenceImage={verificationStatus.documentVerification.imageUrl}
                      onVerificationComplete={(result) => {
                        handleVerificationComplete('face');
                        setCurrentStep(2); // Passer à l'étape suivante
                      }}
                    />
                  )}
                  {step.id === 'documents' && (
                    <DocumentUpload
                      userId={user?.id || ''}
                      onVerificationComplete={(result) => {
                        handleVerificationComplete('documents');
                        // Toutes les étapes sont terminées
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/verification/parametres"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Paramètres de vérification
            </a>
            <a
              href="/mes-certificats"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Mes certificats
            </a>
            <a
              href="/profil"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Retour au profil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}