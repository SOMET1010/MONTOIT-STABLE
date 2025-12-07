/**
 * Types et codes d'erreur standardisés pour l'application
 */

/**
 * Codes d'erreur uniques pour toute l'application
 */
export enum ErrorCode {
  // === Erreurs d'authentification ===
  EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_EXISTS',
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
  ACCOUNT_DISABLED = 'AUTH_ACCOUNT_DISABLED',
  SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  PASSWORD_MISMATCH = 'AUTH_PASSWORD_MISMATCH',
  INVALID_TOKEN = 'AUTH_INVALID_TOKEN',

  // === Erreurs de réseau ===
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR',
  DNS_ERROR = 'DNS_ERROR',

  // === Erreurs serveur ===
  INTERNAL_SERVER_ERROR = 'SERVER_ERROR_500',
  BAD_GATEWAY = 'SERVER_ERROR_502',
  SERVICE_UNAVAILABLE = 'SERVER_ERROR_503',
  GATEWAY_TIMEOUT = 'SERVER_ERROR_504',

  // === Erreurs de validation ===
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  INVALID_PHONE = 'VALIDATION_INVALID_PHONE',
  INVALID_DATE = 'VALIDATION_INVALID_DATE',

  // === Erreurs de fichiers ===
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  MAX_FILES_EXCEEDED = 'MAX_FILES_EXCEEDED',

  // === Erreurs de permissions ===
  ACCESS_DENIED = 'ACCESS_DENIED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // === Erreurs métier ===
  PROPERTY_UNAVAILABLE = 'PROPERTY_UNAVAILABLE',
  APPLICATION_ALREADY_EXISTS = 'APPLICATION_ALREADY_EXISTS',
  CONTRACT_ALREADY_SIGNED = 'CONTRACT_ALREADY_SIGNED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // === Erreurs système ===
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Niveaux de sévérité des erreurs
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Types d'erreurs pour le logging
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
}

/**
 * Interface d'erreur standardisée
 */
export interface ApiError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  type: ErrorType;
  severity: ErrorSeverity;
  details?: string;
  field?: string;
  action?: {
    type: 'retry' | 'navigate' | 'reload' | 'contact_support';
    label: string;
    callback?: () => void;
  };
  timestamp: string;
  requestId?: string;
  originalError?: any;
}

/**
 * Mapping des codes d'erreur Supabase vers nos codes
 */
export const SUPABASE_ERROR_MAPPING: Record<string, ErrorCode> = {
  '23505': ErrorCode.EMAIL_ALREADY_EXISTS,
  '23514': ErrorCode.VALIDATION_ERROR,
  'PGRST116': ErrorCode.RESOURCE_NOT_FOUND,
  'PGRST301': ErrorCode.ACCESS_DENIED,
  '42P01': ErrorCode.RESOURCE_NOT_FOUND,
  '42501': ErrorCode.INSUFFICIENT_PERMISSIONS,
  '23503': ErrorCode.VALIDATION_ERROR,
  '23502': ErrorCode.REQUIRED_FIELD,
  '23514': ErrorCode.VALIDATION_ERROR,
  '22001': ErrorCode.FILE_TOO_LARGE,
  '22023': ErrorCode.INVALID_FILE_TYPE,
};