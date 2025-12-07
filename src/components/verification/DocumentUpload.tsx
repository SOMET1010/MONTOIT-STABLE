import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, FileText, AlertCircle, CheckCircle, X, RefreshCw, Eye } from 'lucide-react';
import { faceVerificationService } from '@/services/faceVerificationService';

interface DocumentUploadProps {
  onUploadComplete: (result: any) => void;
  userId: string;
  documentType?: 'national_id' | 'passport' | 'driver_license' | 'voter_card';
  country?: string;
}

interface UploadState {
  isUploading: boolean;
  uploadedFile: File | null;
  previewUrl: string | null;
  error: string | null;
  extractedData: any | null;
  isProcessing: boolean;
}

const documentTypes = [
  { value: 'national_id', label: 'Carte d\'identité nationale', icon: FileText },
  { value: 'passport', label: 'Passeport', icon: FileText },
  { value: 'driver_license', label: 'Permis de conduire', icon: FileText },
  { value: 'voter_card', label: 'Carte d\'électeur', icon: FileText },
];

const countries = [
  { value: 'CI', label: 'Côte d\'Ivoire' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'ML', label: 'Mali' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'TG', label: 'Togo' },
  { value: 'BJ', label: 'Bénin' },
  { value: 'NE', label: 'Niger' },
  { value: 'GN', label: 'Guinée' },
];

export default function DocumentUpload({ onUploadComplete, userId, documentType: initialType = 'national_id', country: initialCountry = 'CI' }: DocumentUploadProps) {
  const [documentType, setDocumentType] = useState(initialType);
  const [country, setCountry] = useState(initialCountry);
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    uploadedFile: null,
    previewUrl: null,
    error: null,
    extractedData: null,
    isProcessing: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setState(prev => ({
        ...prev,
        error: 'Type de fichier non supporté. Utilisez JPG, PNG, WebP ou PDF.',
      }));
      return;
    }

    // Validation de la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setState(prev => ({
        ...prev,
        error: 'Le fichier est trop volumineux. La taille maximale est de 10MB.',
      }));
      return;
    }

    // Créer l'aperçu
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          uploadedFile: file,
          previewUrl: e.target?.result as string,
          error: null,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // Pour les PDF, on n'affiche pas de preview
      setState(prev => ({
        ...prev,
        uploadedFile: file,
        previewUrl: null,
        error: null,
      }));
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const clearFile = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadedFile: null,
      previewUrl: null,
      error: null,
      extractedData: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processDocument = useCallback(async () => {
    if (!state.uploadedFile) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      const result = await faceVerificationService.validateDocument({
        userId,
        documentImage: state.uploadedFile,
        documentType: documentType as any,
        country,
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          extractedData: result.extractedData,
          isProcessing: false,
        }));

        onUploadComplete({
          type: 'document',
          success: true,
          imageUrl: result.imageUrl,
          extractedData: result.extractedData,
          confidence: result.confidence,
          documentType,
          isExpired: result.isExpired,
        });
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'La validation du document a échoué',
          isProcessing: false,
        }));
      }
    } catch (error) {
      console.error('Erreur lors du traitement du document:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isProcessing: false,
      }));
    }
  }, [state.uploadedFile, userId, documentType, country, onUploadComplete]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Téléversement de document</h3>
        <p className="text-gray-600 text-sm">
          Téléversez une photo claire de votre document d'identité
        </p>
      </div>

      {/* Sélection du type de document */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de document
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pays de délivrance
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-transparent"
          >
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone de téléversement */}
      {!state.uploadedFile ? (
        <div
          className="mb-6"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-terracotta-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Glissez votre document ici ou
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Parcourir
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="btn-secondary"
              >
                <Camera className="h-4 w-4 mr-2" />
                Prendre une photo
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Formats supportés: JPG, PNG, WebP, PDF (max 10MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
        </div>
      ) : (
        <div className="mb-6">
          <div className="relative">
            {state.previewUrl ? (
              <div className="relative">
                <img
                  src={state.previewUrl}
                  alt="Aperçu du document"
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Supprimer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-gray-300 rounded-lg p-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{state.uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(state.uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="text-red-500 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Données extraites */}
      {state.extractedData && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900">Informations extraites</h4>
          </div>
          <div className="space-y-2 text-sm">
            {state.extractedData.fullName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Nom complet:</span>
                <span className="font-medium text-gray-900">{state.extractedData.fullName}</span>
              </div>
            )}
            {state.extractedData.documentNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Numéro:</span>
                <span className="font-medium text-gray-900">{state.extractedData.documentNumber}</span>
              </div>
            )}
            {state.extractedData.dateOfBirth && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date de naissance:</span>
                <span className="font-medium text-gray-900">{state.extractedData.dateOfBirth}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Erreur */}
      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      {/* Boutons d'action */}
      {state.uploadedFile && !state.extractedData && (
        <div className="flex space-x-3">
          <button
            onClick={clearFile}
            className="flex-1 btn-secondary"
            disabled={state.isProcessing}
          >
            Annuler
          </button>
          <button
            onClick={processDocument}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
            disabled={state.isProcessing}
          >
            {state.isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Valider le document</span>
              </>
            )}
          </button>
        </div>
      )}

      {state.extractedData && (
        <button
          onClick={clearFile}
          className="w-full btn-secondary flex items-center justify-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Téléverser un autre document</span>
        </button>
      )}
    </div>
  );
}