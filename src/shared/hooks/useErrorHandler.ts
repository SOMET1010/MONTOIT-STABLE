/**
 * Hook personnalisé pour la gestion des erreurs
 */

import { useCallback, useState } from 'react';
import * as Sentry from '@sentry/react';
import { ErrorService } from '@/shared/errors/ErrorService';
import { ApiError, ErrorCode } from '@/shared/errors/ErrorTypes';

export interface UseErrorHandlerReturn {
  error: ApiError | null;
  handleError: (error: any, context?: string) => ApiError;
  clearError: () => void;
  retryAction: () => void;
  hasError: boolean;
  isRetryable: boolean;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCallback, setRetryCallback] = useState<(() => void) | null>(null);

  const errorService = ErrorService.getInstance();

  const handleError = useCallback((error: any, context?: string, retryFn?: () => void): ApiError => {
    let apiError: ApiError;

    // Mapping des différents types d'erreurs
    if (error?.code && typeof error.code === 'string') {
      // Erreur Supabase
      apiError = errorService.mapSupabaseError(error, context);
    } else if (error instanceof Error) {
      // Erreur réseau ou JavaScript
      apiError = errorService.handleNetworkError(error, context);
    } else if (error?.message) {
      // Erreur générique avec message
      apiError = errorService.createGenericError(error, context);
    } else {
      // Erreur inconnue
      apiError = errorService.createGenericError(new Error('Unknown error'), context);
    }

    // Ajouter l'ID de requête pour le suivi
    apiError.requestId = errorService.generateRequestId();

    // Stocker la fonction de retry si fournie
    if (retryFn) {
      setRetryCallback(() => retryFn);
      apiError.action = {
        type: 'retry',
        label: 'Réessayer',
        callback: retryFn,
      };
    }

    // Mettre à jour l'état
    setError(apiError);

    // Logging
    if (errorService.shouldLogToSentry(apiError)) {
      Sentry.captureException(apiError, {
        tags: {
          errorCode: apiError.code,
          errorType: apiError.type,
          severity: apiError.severity,
        },
        extra: errorService.formatForLogging(apiError),
      });
    }

    // Afficher l'erreur si nécessaire
    if (errorService.shouldShowToUser(apiError)) {
      // Utiliser votre système de notification préféré
      // toast.error(apiError.userMessage);
      console.error('User Error:', apiError);
    }

    return apiError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCallback(null);
  }, []);

  const retryAction = useCallback(() => {
    if (retryCallback) {
      clearError();
      retryCallback();
    }
  }, [retryCallback, clearError]);

  return {
    error,
    handleError,
    clearError,
    retryAction,
    hasError: !!error,
    isRetryable: error ? errorService.isRetryable(error) : false,
  };
}

/**
 * Hook pour gérer les erreurs de formulaires
 */
export function useFormErrorHandler() {
  const { handleError, clearError, error } = useErrorHandler();
  const errorService = ErrorService.getInstance();

  const handleFieldError = useCallback((field: string, value: any, rule: string) => {
    const fieldError = errorService.handleValidationError(field, value, rule);
    return fieldError;
  }, []);

  const validateRequired = useCallback((field: string, value: any) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return handleFieldError(field, value, 'required');
    }
    return null;
  }, [handleFieldError]);

  const validateEmail = useCallback((field: string, email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return handleFieldError(field, email, 'email');
    }
    return null;
  }, [handleFieldError]);

  const validatePhone = useCallback((field: string, phone: string) => {
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (phone && !phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return handleFieldError(field, phone, 'phone');
    }
    return null;
  }, [handleFieldError]);

  return {
    error,
    handleError,
    clearError,
    handleFieldError,
    validateRequired,
    validateEmail,
    validatePhone,
  };
}

/**
 * Hook pour gérer les erreurs d'API avec retry automatique
 */
export function useApiErrorHandler() {
  const { handleError, clearError, error, isRetryable, retryAction } = useErrorHandler();

  const handleApiError = useCallback(async (
    apiCall: () => Promise<any>,
    retryCount: number = 0,
    maxRetries: number = 3
  ): Promise<any> => {
    try {
      const result = await apiCall();
      clearError(); // Effacer les erreurs précédentes en cas de succès
      return result;
    } catch (err: any) {
      const apiError = handleError(err, 'API call');

      // Retry automatique pour les erreurs réessayables
      if (
        isRetryable &&
        retryCount < maxRetries &&
        apiError.type !== 'validation' &&
        apiError.type !== 'business_logic'
      ) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        return handleApiError(apiCall, retryCount + 1, maxRetries);
      }

      throw apiError;
    }
  }, [handleError, clearError, isRetryable]);

  return {
    error,
    handleApiError,
    clearError,
    retryAction,
    isRetryable,
  };
}