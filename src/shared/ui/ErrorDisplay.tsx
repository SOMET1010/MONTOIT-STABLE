/**
 * Composant pour afficher les erreurs de manière standardisée
 */

import React, { useState } from 'react';
import { XCircle, AlertTriangle, RefreshCw, AlertCircle, X, ChevronDown } from 'lucide-react';
import { ApiError, ErrorSeverity } from '@/shared/errors/ErrorTypes';

interface ErrorDisplayProps {
  error: ApiError | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

export function ErrorDisplay({
  error,
  onDismiss,
  onRetry,
  className = '',
  showDetails = false,
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!error) return null;

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      case ErrorSeverity.HIGH:
        return 'bg-red-50 border-red-200 text-red-800';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ErrorSeverity.LOW:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return <XCircle className="h-5 w-5" />;
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle className="h-5 w-5" />;
      case ErrorSeverity.LOW:
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getActionIcon = () => {
    if (error.action?.type === 'retry') {
      return <RefreshCw className="h-4 w-4" />;
    }
    return null;
  };

  const handleAction = () => {
    if (error.action?.callback) {
      error.action.callback();
    } else if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getSeverityColor(error.severity)} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getSeverityIcon(error.severity)}
        </div>

        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">
            {error.userMessage}
          </h4>

          {error.field && (
            <p className="text-xs mt-1 opacity-75">
              Champ concerné : {error.field}
            </p>
          )}

          {/* Actions */}
          {(error.action || onRetry) && (
            <div className="mt-3 flex gap-2">
              {(error.action?.type === 'retry' || onRetry) && (
                <button
                  onClick={handleAction}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-white bg-opacity-50 px-3 py-1 rounded hover:bg-opacity-75 transition-colors"
                >
                  {getActionIcon()}
                  {error.action?.label || 'Réessayer'}
                </button>
              )}

              {error.action?.type === 'navigate' && (
                <button
                  onClick={error.action.callback}
                  className="text-xs font-medium bg-white bg-opacity-50 px-3 py-1 rounded hover:bg-opacity-75 transition-colors"
                >
                  {error.action.label}
                </button>
              )}

              {error.action?.type === 'reload' && (
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs font-medium bg-white bg-opacity-50 px-3 py-1 rounded hover:bg-opacity-75 transition-colors"
                >
                  {error.action.label}
                </button>
              )}
            </div>
          )}

          {/* Détails techniques */}
          {(showDetails || error.details) && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs opacity-75 hover:opacity-100 transition-opacity"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                {isExpanded ? 'Masquer' : 'Afficher'} les détails
              </button>

              {isExpanded && (
                <div className="mt-2 text-xs space-y-1">
                  {error.details && (
                    <p>
                      <span className="font-medium">Détails :</span> {error.details}
                    </p>
                  )}
                  {error.requestId && (
                    <p>
                      <span className="font-medium">Référence :</span> {error.requestId}
                    </p>
                  )}
                  {error.message && (
                    <details className="mt-2">
                      <summary className="cursor-pointer hover:underline">
                        Message technique
                      </summary>
                      <pre className="mt-1 whitespace-pre-wrap break-all opacity-75">
                        {error.message}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bouton de fermeture */}
        {onDismiss && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Composant inline pour les erreurs de formulaire
 */
export function InlineError({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      {error}
    </p>
  );
}

/**
 * Composant pour les erreurs de champ de formulaire
 */
export function FieldError({ error, fieldName }: { error: ApiError | null; fieldName?: string }) {
  if (!error || (fieldName && error.field !== fieldName)) return null;

  return <InlineError error={error.userMessage} />;
}

/**
 * Wrapper pour gérer les erreurs dans les composants enfants
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,
  onError,
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <React.ErrorBoundary
        FallbackComponent={fallback || DefaultErrorFallback}
        onError={onError}
      >
        {children}
      </React.ErrorBoundary>
  );
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <XCircle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          Une erreur inattendue est survenue
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Nous sommes désolés, mais quelque chose s'est mal passé. L'équipe a été notifiée.
        </p>
        <div className="flex gap-3">
          <button
            onClick={resetError}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
}