import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Clock, X, ExternalLink, RefreshCw } from 'lucide-react';
import { faceVerificationService } from '@/services/faceVerificationService';
import { useAuth } from '@/app/providers/AuthProvider';

interface VerificationData {
  smileId: {
    status: string;
    job_id?: string;
    result_data?: any;
  };
  face: {
    status: string;
    imageUrl?: string;
    confidence?: number;
    livenessDetected?: boolean;
    error?: string;
  };
  document: {
    status: string;
    documentType?: string;
    imageUrl?: string;
    extractedData?: any;
    confidence?: number;
    isExpired?: boolean;
    error?: string;
  };
}

export default function VerificationSummary() {
  const { user } = useAuth();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
  }, [user]);

  const loadVerificationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les données de vérification faciale et documentaire
      const verificationStatus = await faceVerificationService.getVerificationStatus(user?.id || '');

      // Charger les données Smile ID depuis Supabase
      const response = await fetch('/api/verification/smile-id/status');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du statut Smile ID');
      }
      const smileData = await response.json();

      setVerificationData({
        smileId: {
          status: smileData.status || 'non_commence',
          job_id: smileData.job_id,
          result_data: smileData.result_data,
        },
        face: verificationStatus.faceVerification,
        document: verificationStatus.documentVerification,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des données de vérification:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, confidence?: number) => {
    if (status === 'verifie' && (!confidence || confidence > 0.8)) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (status === 'en_attente') {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    if (status === 'echoue' || status === 'rejete') {
      return <X className="h-5 w-5 text-red-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verifie':
        return 'Vérifié';
      case 'en_attente':
        return 'En attente';
      case 'echoue':
        return 'Échoué';
      case 'rejete':
        return 'Rejeté';
      case 'non_commence':
        return 'Non commencé';
      default:
        return 'Inconnu';
    }
  };

  const getOverallStatus = () => {
    if (!verificationData) return { status: 'unknown', color: 'gray', text: 'Inconnu' };

    const allVerified =
      verificationData.smileId.status === 'verifie' &&
      verificationData.face.status === 'verifie' &&
      verificationData.document.status === 'verifie';

    const anyFailed =
      verificationData.smileId.status === 'echoue' ||
      verificationData.smileId.status === 'rejete' ||
      verificationData.face.status === 'echoue' ||
      verificationData.face.status === 'rejete' ||
      verificationData.document.status === 'echoue' ||
      verificationData.document.status === 'rejete';

    const anyPending =
      verificationData.smileId.status === 'en_attente' ||
      verificationData.face.status === 'en_attente' ||
      verificationData.document.status === 'en_attente';

    if (allVerified) {
      return { status: 'verified', color: 'green', text: 'Identité complètement vérifiée' };
    }
    if (anyFailed) {
      return { status: 'failed', color: 'red', text: 'Vérification échouée' };
    }
    if (anyPending) {
      return { status: 'pending', color: 'yellow', text: 'Vérification en cours' };
    }
    return { status: 'incomplete', color: 'gray', text: 'Vérification incomplète' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !verificationData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Erreur: {error || 'Données non disponibles'}</span>
          <button
            onClick={loadVerificationData}
            className="ml-auto p-1 hover:bg-gray-100 rounded"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* En-tête avec statut global */}
      <div className={`p-6 ${
        overallStatus.color === 'green' ? 'bg-green-50 border-green-200' :
        overallStatus.color === 'red' ? 'bg-red-50 border-red-200' :
        overallStatus.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        'bg-gray-50 border-gray-200'
      } border-b-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className={`h-8 w-8 ${
              overallStatus.color === 'green' ? 'text-green-600' :
              overallStatus.color === 'red' ? 'text-red-600' :
              overallStatus.color === 'yellow' ? 'text-yellow-600' :
              'text-gray-600'
            }`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Statut de vérification</h3>
              <p className={`text-sm ${
                overallStatus.color === 'green' ? 'text-green-700' :
                overallStatus.color === 'red' ? 'text-red-700' :
                overallStatus.color === 'yellow' ? 'text-yellow-700' :
                'text-gray-700'
              }`}>
                {overallStatus.text}
              </p>
            </div>
          </div>
          <button
            onClick={loadVerificationData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Détails de chaque vérification */}
      <div className="p-6 space-y-6">
        {/* Vérification Smile ID */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(verificationData.smileId.status)}
            <div>
              <h4 className="font-medium text-gray-900">Vérification ONECI/Smile ID</h4>
              <p className="text-sm text-gray-600">Statut: {getStatusText(verificationData.smileId.status)}</p>
              {verificationData.smileId.job_id && (
                <p className="text-xs text-gray-500">ID: {verificationData.smileId.job_id}</p>
              )}
            </div>
          </div>
          <a
            href="/verification"
            className="text-terracotta-600 hover:text-terracotta-700 flex items-center space-x-1 text-sm"
          >
            <span>Modifier</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Vérification faciale */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(verificationData.face.status, verificationData.face.confidence)}
            <div>
              <h4 className="font-medium text-gray-900">Reconnaissance faciale</h4>
              <p className="text-sm text-gray-600">Statut: {getStatusText(verificationData.face.status)}</p>
              {verificationData.face.confidence && (
                <p className="text-xs text-gray-500">
                  Confiance: {(verificationData.face.confidence * 100).toFixed(1)}%
                </p>
              )}
              {verificationData.face.livenessDetected !== undefined && (
                <p className="text-xs text-gray-500">
                  Détection de vie: {verificationData.face.livenessDetected ? 'Oui' : 'Non'}
                </p>
              )}
            </div>
          </div>
          <a
            href="/verification"
            className="text-terracotta-600 hover:text-terracotta-700 flex items-center space-x-1 text-sm"
          >
            <span>Modifier</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Vérification des documents */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon(verificationData.document.status, verificationData.document.confidence)}
            <div>
              <h4 className="font-medium text-gray-900">Vérification des documents</h4>
              <p className="text-sm text-gray-600">
                Statut: {getStatusText(verificationData.document.status)}
                {verificationData.document.documentType && ` (${verificationData.document.documentType})`}
              </p>
              {verificationData.document.confidence && (
                <p className="text-xs text-gray-500">
                  Confiance: {(verificationData.document.confidence * 100).toFixed(1)}%
                </p>
              )}
              {verificationData.document.isExpired !== undefined && (
                <p className="text-xs text-gray-500">
                  Validité: {verificationData.document.isExpired ? 'Expiré' : 'Valide'}
                </p>
              )}
            </div>
          </div>
          <a
            href="/verification"
            className="text-terracotta-600 hover:text-terracotta-700 flex items-center space-x-1 text-sm"
          >
            <span>Modifier</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-3">
          <a
            href="/verification"
            className="btn-primary text-sm"
          >
            Compléter la vérification
          </a>
          <a
            href="/mes-certificats"
            className="btn-secondary text-sm"
          >
            Voir mes certificats
          </a>
          <a
            href="/verification/parametres"
            className="btn-secondary text-sm"
          >
            Paramètres
          </a>
        </div>
      </div>
    </div>
  );
}