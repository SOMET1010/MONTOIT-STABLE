/**
 * Service centralisé de gestion des erreurs
 */

import { PostgrestError } from '@supabase/supabase-js';
import { ErrorCode, ErrorSeverity, ErrorType, ApiError, SUPABASE_ERROR_MAPPING } from './ErrorTypes';
import { errorMessages } from './ErrorMessages';

export class ErrorService {
  private static instance: ErrorService;
  private currentLanguage: string = 'fr';

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Définit la langue courante pour les messages d'erreur
   */
  setLanguage(language: string): void {
    this.currentLanguage = language;
  }

  /**
   * Convertit une erreur Supabase en erreur standardisée
   */
  mapSupabaseError(error: PostgrestError, context?: string): ApiError {
    const errorCode = this.mapSupabaseCodeToErrorCode(error.code);
    const messageConfig = errorMessages[this.currentLanguage][errorCode];

    return {
      code: errorCode,
      message: error.message,
      userMessage: messageConfig.userMessage,
      type: messageConfig.type,
      severity: messageConfig.severity,
      details: error.details,
      field: this.extractFieldFromError(error),
      action: messageConfig.action,
      timestamp: new Date().toISOString(),
      originalError: error,
    };
  }

  /**
   * Gère les erreurs réseau
   */
  handleNetworkError(error: Error, context?: string): ApiError {
    let errorCode: ErrorCode;

    if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      errorCode = ErrorCode.NETWORK_ERROR;
    } else if (error.message.includes('timeout')) {
      errorCode = ErrorCode.TIMEOUT_ERROR;
    } else if (navigator.onLine === false) {
      errorCode = ErrorCode.OFFLINE_ERROR;
    } else {
      errorCode = ErrorCode.NETWORK_ERROR;
    }

    const messageConfig = errorMessages[this.currentLanguage][errorCode];

    return {
      code: errorCode,
      message: error.message,
      userMessage: messageConfig.userMessage,
      type: messageConfig.type,
      severity: messageConfig.severity,
      timestamp: new Date().toISOString(),
      originalError: error,
    };
  }

  /**
   * Gère les erreurs de validation de formulaire
   */
  handleValidationError(field: string, value: any, rule: string): ApiError {
    let errorCode: ErrorCode;

    switch (rule) {
      case 'required':
        errorCode = ErrorCode.REQUIRED_FIELD;
        break;
      case 'email':
        errorCode = ErrorCode.INVALID_EMAIL;
        break;
      case 'phone':
        errorCode = ErrorCode.INVALID_PHONE;
        break;
      case 'date':
        errorCode = ErrorCode.INVALID_DATE;
        break;
      default:
        errorCode = ErrorCode.VALIDATION_ERROR;
    }

    const messageConfig = errorMessages[this.currentLanguage][errorCode];

    return {
      code: errorCode,
      message: `Validation failed for field ${field}`,
      userMessage: messageConfig.userMessage,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      field,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Gère les erreurs d'upload de fichiers
   */
  handleFileUploadError(error: any, file?: File): ApiError {
    let errorCode: ErrorCode;

    if (error?.message?.includes('File size too large')) {
      errorCode = ErrorCode.FILE_TOO_LARGE;
    } else if (error?.message?.includes('Invalid file type')) {
      errorCode = ErrorCode.INVALID_FILE_TYPE;
    } else {
      errorCode = ErrorCode.UPLOAD_FAILED;
    }

    const messageConfig = errorMessages[this.currentLanguage][errorCode];

    return {
      code: errorCode,
      message: error?.message || 'Upload failed',
      userMessage: messageConfig.userMessage,
      type: messageConfig.type,
      severity: messageConfig.severity,
      timestamp: new Date().toISOString(),
      originalError: error,
    };
  }

  /**
   * Crée une erreur générique pour les cas non gérés
   */
  createGenericError(error?: any, context?: string): ApiError {
    const messageConfig = errorMessages[this.currentLanguage][ErrorCode.UNKNOWN_ERROR];

    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error?.message || 'Unknown error occurred',
      userMessage: messageConfig.userMessage,
      type: ErrorType.SYSTEM,
      severity: ErrorSeverity.MEDIUM,
      action: messageConfig.action,
      timestamp: new Date().toISOString(),
      originalError: error,
    };
  }

  /**
   * Map les codes d'erreur Supabase vers nos codes standardisés
   */
  private mapSupabaseCodeToErrorCode(supabaseCode?: string): ErrorCode {
    if (!supabaseCode) {
      return ErrorCode.UNKNOWN_ERROR;
    }

    return SUPABASE_ERROR_MAPPING[supabaseCode] || ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Extrait le nom du champ depuis une erreur Supabase
   */
  private extractFieldFromError(error: PostgrestError): string | undefined {
    if (error.details && error.details.includes('column')) {
      const match = error.details.match(/column "([^"]+)"/);
      return match ? match[1] : undefined;
    }
    return undefined;
  }

  /**
   * Détermine si une erreur doit être affichée à l'utilisateur
   */
  shouldShowToUser(error: ApiError): boolean {
    // Cacher les erreurs techniques critiques
    if (error.severity === ErrorSeverity.CRITICAL && error.type === ErrorType.SYSTEM) {
      return false;
    }

    // Toujours montrer les erreurs de validation et métier
    if (error.type === ErrorType.VALIDATION || error.type === ErrorType.BUSINESS_LOGIC) {
      return true;
    }

    // Montrer les erreurs réseau avec message utilisateur
    if (error.type === ErrorType.NETWORK) {
      return true;
    }

    return true;
  }

  /**
   * Détermine si une erreur doit être envoyée à Sentry
   */
  shouldLogToSentry(error: ApiError): boolean {
    // Logger toutes les erreurs critiques
    if (error.severity === ErrorSeverity.CRITICAL) {
      return true;
    }

    // Logger les erreurs système inattendues
    if (error.type === ErrorType.SYSTEM && error.code === ErrorCode.UNKNOWN_ERROR) {
      return true;
    }

    // Logger les erreurs serveur
    if (error.code >= ErrorCode.INTERNAL_SERVER_ERROR && error.code <= ErrorCode.GATEWAY_TIMEOUT) {
      return true;
    }

    return false;
  }

  /**
   * Formate une erreur pour le logging
   */
  formatForLogging(error: ApiError): Record<string, any> {
    return {
      code: error.code,
      message: error.message,
      type: error.type,
      severity: error.severity,
      field: error.field,
      timestamp: error.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    };
  }

  /**
   * Récupère l'ID utilisateur courant pour le logging
   */
  private getCurrentUserId(): string | undefined {
    // Implémenter selon votre gestion d'auth
    return undefined;
  }

  /**
   * Génère un ID unique de requête pour le suivi
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Vérifie si une erreur est réessayable
   */
  isRetryable(error: ApiError): boolean {
    const retryableCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.INTERNAL_SERVER_ERROR,
      ErrorCode.UPLOAD_FAILED,
      ErrorCode.PAYMENT_FAILED,
    ];

    return retryableCodes.includes(error.code);
  }
}