import { useState, useRef, useCallback } from 'react';
import { Camera, RotateCw, CheckCircle, AlertCircle, CameraOff, RefreshCw } from 'lucide-react';
import { faceVerificationService } from '@/services/faceVerificationService';

interface FaceVerificationCaptureProps {
  onVerificationComplete: (result: any) => void;
  userId: string;
  referenceImage?: string;
}

interface CaptureState {
  isCapturing: boolean;
  capturedImage: string | null;
  isProcessing: boolean;
  error: string | null;
  stream: MediaStream | null;
  facingMode: 'user' | 'environment';
}

export default function FaceVerificationCapture({ onVerificationComplete, userId, referenceImage }: FaceVerificationCaptureProps) {
  const [state, setState] = useState<CaptureState>({
    isCapturing: false,
    capturedImage: null,
    isProcessing: false,
    error: null,
    stream: null,
    facingMode: 'user',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isCapturing: true }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: state.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setState(prev => ({ ...prev, stream }));
    } catch (error) {
      console.error('Erreur lors de l\'accès à la caméra:', error);
      setState(prev => ({
        ...prev,
        error: 'Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.',
        isCapturing: false,
      }));
    }
  }, [state.facingMode]);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, stream: null, isCapturing: false }));
    }
  }, [state.stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner l'image vidéo sur le canvas
    context.drawImage(video, 0, 0);

    // Convertir l'image en base64
    const imageData = canvas.toDataURL('image/jpeg', 0.95);

    setState(prev => ({
      ...prev,
      capturedImage: imageData,
      isCapturing: false,
    }));

    stopCamera();
  }, []);

  const switchCamera = useCallback(() => {
    stopCamera();
    setState(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user',
    }));
    setTimeout(() => startCamera(), 100);
  }, [stopCamera, startCamera]);

  const retakePhoto = useCallback(() => {
    setState(prev => ({
      ...prev,
      capturedImage: null,
      error: null,
    }));
    startCamera();
  }, [startCamera]);

  const submitVerification = useCallback(async () => {
    if (!state.capturedImage) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Convertir l'image base64 en File
      const response = await fetch(state.capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

      // Envoyer pour vérification
      const result = await faceVerificationService.verifySelfie({
        userId,
        selfieImage: file,
        referenceImage,
        livenessChecks: true,
      });

      if (result.success) {
        onVerificationComplete({
          type: 'face',
          success: true,
          imageUrl: result.imageUrl,
          confidence: result.confidence,
          matchScore: result.matchScore,
          livenessDetected: result.livenessDetected,
        });
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'La vérification a échoué',
          isProcessing: false,
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isProcessing: false,
      }));
    }
  }, [state.capturedImage, userId, referenceImage, onVerificationComplete]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Vérification faciale</h3>
        <p className="text-gray-600 text-sm">
          Prenez une photo claire de votre visage. Assurez-vous d'être dans un endroit bien éclairé.
        </p>
      </div>

      {/* Zone de capture */}
      <div className="relative mb-6">
        {state.capturedImage ? (
          <div className="relative">
            <img
              src={state.capturedImage}
              alt="Photo capturée"
              className="w-full h-auto rounded-lg"
            />
            <div className="absolute top-4 right-4">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        ) : state.isCapturing ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-lg bg-gray-900"
            />

            {/* Overlay de guidage */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-80 border-2 border-white rounded-lg opacity-50"></div>
              </div>

              {/* Instructions superposées */}
              <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
                <p className="text-sm text-center">
                  Centrez votre visage dans le cadre et regardez la caméra
                </p>
              </div>
            </div>

            {/* Boutons de contrôle */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
              <button
                onClick={switchCamera}
                className="bg-white bg-opacity-80 text-gray-800 p-3 rounded-full hover:bg-opacity-100 transition-all"
                title="Changer de caméra"
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                onClick={capturePhoto}
                className="bg-white bg-opacity-80 text-gray-800 p-4 rounded-full hover:bg-opacity-100 transition-all"
                title="Capturer"
              >
                <Camera className="h-8 w-8" />
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <CameraOff className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Erreur */}
      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex space-x-3">
        {!state.isCapturing && !state.capturedImage && (
          <button
            onClick={startCamera}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>Ouvrir la caméra</span>
          </button>
        )}

        {state.isCapturing && (
          <button
            onClick={stopCamera}
            className="flex-1 btn-secondary"
          >
            Annuler
          </button>
        )}

        {state.capturedImage && (
          <>
            <button
              onClick={retakePhoto}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
              disabled={state.isProcessing}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reprendre</span>
            </button>
            <button
              onClick={submitVerification}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
              disabled={state.isProcessing}
            >
              {state.isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Vérifier</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}