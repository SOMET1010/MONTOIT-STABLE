/**
 * Messages d'erreur localisés pour l'application
 */

import { ErrorCode, ErrorSeverity, ErrorType } from './ErrorTypes';

/**
 * Types de messages d'erreur
 */
export type ErrorMessage = {
  userMessage: string;
  type: ErrorType;
  severity: ErrorSeverity;
  action?: {
    type: 'retry' | 'navigate' | 'reload' | 'contact_support';
    label: string;
  };
};

/**
 * Messages d'erreur en français
 */
export const errorMessagesFR: Record<ErrorCode, ErrorMessage> = {
  // === Erreurs d'authentification ===
  [ErrorCode.EMAIL_ALREADY_EXISTS]: {
    userMessage: 'Cet email est déjà utilisé par un autre compte',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'navigate',
      label: 'Se connecter'
    }
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    userMessage: 'Email ou mot de passe incorrect',
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'retry',
      label: 'Réessayer'
    }
  },
  [ErrorCode.EMAIL_NOT_VERIFIED]: {
    userMessage: 'Veuillez vérifier votre email avant de continuer',
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'retry',
      label: 'Renvoyer l\'email'
    }
  },
  [ErrorCode.ACCOUNT_DISABLED]: {
    userMessage: 'Votre compte a été désactivé. Contactez le support',
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    action: {
      type: 'contact_support',
      label: 'Contacter le support'
    }
  },
  [ErrorCode.SESSION_EXPIRED]: {
    userMessage: 'Votre session a expiré. Veuillez vous reconnecter',
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'navigate',
      label: 'Se reconnecter'
    }
  },
  [ErrorCode.WEAK_PASSWORD]: {
    userMessage: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
  },
  [ErrorCode.PASSWORD_MISMATCH]: {
    userMessage: 'Les mots de passe ne correspondent pas',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
  },

  // === Erreurs réseau ===
  [ErrorCode.NETWORK_ERROR]: {
    userMessage: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet',
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'retry',
      label: 'Réessayer'
    }
  },
  [ErrorCode.TIMEOUT_ERROR]: {
    userMessage: 'La requête a pris trop de temps. Veuillez réessayer',
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'retry',
      label: 'Réessayer'
    }
  },
  [ErrorCode.OFFLINE_ERROR]: {
    userMessage: 'Vous êtes hors ligne. Vérifiez votre connexion',
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.HIGH,
  },

  // === Erreurs serveur ===
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    userMessage: 'Une erreur technique est survenue. Nos équipes en sont informées',
    type: ErrorType.SYSTEM,
    severity: ErrorSeverity.HIGH,
    action: {
      type: 'reload',
      label: 'Actualiser la page'
    }
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    userMessage: 'Le service est temporairement indisponible. Veuillez réessayer plus tard',
    type: ErrorType.SYSTEM,
    severity: ErrorSeverity.HIGH,
  },
  [ErrorCode.MAINTENANCE_MODE]: {
    userMessage: 'Le site est en maintenance. Nous serons de retour rapidement',
    type: ErrorType.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
  },

  // === Erreurs de validation ===
  [ErrorCode.VALIDATION_ERROR]: {
    userMessage: 'Certaines informations sont incorrectes',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
  },
  [ErrorCode.REQUIRED_FIELD]: {
    userMessage: 'Ce champ est obligatoire',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
  },
  [ErrorCode.INVALID_EMAIL]: {
    userMessage: 'Veuillez entrer une adresse email valide',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
  },
  [ErrorCode.INVALID_PHONE]: {
    userMessage: 'Veuillez entrer un numéro de téléphone valide',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
  },
  [ErrorCode.INVALID_DATE]: {
    userMessage: 'Veuillez entrer une date valide',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
  },

  // === Erreurs de fichiers ===
  [ErrorCode.FILE_TOO_LARGE]: {
    userMessage: 'Ce fichier est trop volumineux (max 5MB)',
    type: ErrorType.USER_INPUT,
    severity: ErrorSeverity.LOW,
  },
  [ErrorCode.INVALID_FILE_TYPE]: {
    userMessage: 'Ce type de fichier n\'est pas autorisé',
    type: ErrorType.USER_INPUT,
    severity: ErrorSeverity.LOW,
  },
  [ErrorCode.UPLOAD_FAILED]: {
    userMessage: 'Le téléchargement a échoué. Veuillez réessayer',
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'retry',
      label: 'Réessayer'
    }
  },
  [ErrorCode.MAX_FILES_EXCEEDED]: {
    userMessage: 'Vous avez atteint le nombre maximum de fichiers',
    type: ErrorType.USER_INPUT,
    severity: ErrorSeverity.LOW,
  },

  // === Erreurs de permissions ===
  [ErrorCode.ACCESS_DENIED]: {
    userMessage: 'Vous n\'avez pas l\'autorisation d\'accéder à cette page',
    type: ErrorType.PERMISSION,
    severity: ErrorSeverity.MEDIUM,
  },
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: {
    userMessage: 'Vos permissions sont insuffisantes pour cette action',
    type: ErrorType.PERMISSION,
    severity: ErrorSeverity.MEDIUM,
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    userMessage: 'Ce contenu n\'existe pas ou a été supprimé',
    type: ErrorType.PERMISSION,
    severity: ErrorSeverity.LOW,
  },

  // === Erreurs métier ===
  [ErrorCode.PROPERTY_UNAVAILABLE]: {
    userMessage: 'Ce bien n\'est plus disponible',
    type: ErrorType.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
  },
  [ErrorCode.APPLICATION_ALREADY_EXISTS]: {
    userMessage: 'Vous avez déjà postulé pour ce bien',
    type: ErrorType.BUSINESS_LOGIC,
    severity: ErrorSeverity.LEDIUM,
  },
  [ErrorCode.CONTRACT_ALREADY_SIGNED]: {
    userMessage: 'Ce contrat est déjà signé',
    type: ErrorType.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
  },
  [ErrorCode.PAYMENT_FAILED]: {
    userMessage: 'Le paiement a échoué. Veuillez vérifier vos informations',
    type: ErrorType.BUSINESS_LOGIC,
    severity: ErrorSeverity.HIGH,
    action: {
      type: 'retry',
      label: 'Réessayer le paiement'
    }
  },
  [ErrorCode.INSUFFICIENT_FUNDS]: {
    userMessage: 'Solde insuffisant pour cette transaction',
    type: ErrorType.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
  },

  // === Erreurs système ===
  [ErrorCode.UNKNOWN_ERROR]: {
    userMessage: 'Une erreur inattendue est survenue. Veuillez réessayer',
    type: ErrorType.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'retry',
      label: 'Réessayer'
    }
  },
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    userMessage: 'Trop de tentatives. Veuillez attendre quelques minutes',
    type: ErrorType.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
  },
};

/**
 * Messages d'erreur en anglais (pour extension future)
 */
export const errorMessagesEN: Record<ErrorCode, ErrorMessage> = {
  [ErrorCode.EMAIL_ALREADY_EXISTS]: {
    userMessage: 'This email is already in use by another account',
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'navigate',
      label: 'Sign in'
    }
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    userMessage: 'Incorrect email or password',
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'retry',
      label: 'Try again'
    }
  },
  [ErrorCode.NETWORK_ERROR]: {
    userMessage: 'Unable to connect to server. Check your internet connection',
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    action: {
      type: 'retry',
      label: 'Retry'
    }
  },
  // ... autres messages en anglais
} as Record<ErrorCode, ErrorMessage>;

/**
 * Messages d'erreur par langue
 */
export const errorMessages = {
  fr: errorMessagesFR,
  en: errorMessagesEN,
} as const;