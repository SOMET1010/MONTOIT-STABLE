import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function RouterErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || 'Une erreur est survenue';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Une erreur inconnue est survenue';
  }

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-terracotta-50 via-coral-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-terracotta-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {errorStatus ? `Erreur ${errorStatus}` : 'Oups ! Une erreur est survenue'}
            </h1>
            <p className="text-lg text-gray-600">
              {errorMessage}
            </p>
          </div>

          {import.meta.env.DEV && error instanceof Error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-800 mb-2">
                Détails de l'erreur (mode développement) :
              </p>
              <p className="text-xs text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer">Stack trace</summary>
                  <pre className="text-xs text-red-600 font-mono mt-2 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoBack}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>

            <Link
              to="/"
              className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center space-x-2 text-center"
            >
              <Home className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-olive-50 border-2 border-olive-200 rounded-xl">
            <p className="text-sm text-olive-800 text-center">
              Si le problème persiste, veuillez contacter notre support technique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}