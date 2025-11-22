/**
 * Feature: verification
 * 
 * Exports publics de la feature verification
 */

// Pages
export { default as CEVRequestDetailPage } from './pages/CEVRequestDetailPage';
export { default as MyCertificatesPage } from './pages/MyCertificatesPage';
export { default as RequestCEVPage } from './pages/RequestCEVPage';
export { default as RequestPage } from './pages/RequestPage';
export { default as SettingsPage } from './pages/SettingsPage';

// Components
export { default as AnsutBadge } from './components/AnsutBadge';
export { default as CEVBadge } from './components/CEVBadge';
export { default as TrustIndicator } from './components/TrustIndicator';

// Hooks
export { useVerification } from './hooks/useVerification';

// Services
export { verificationApi } from './services/verification.api';

// Types
export type {
  UserVerification,
  UserVerificationInsert,
  UserVerificationUpdate,
  VerificationStatus,
  VerificationType,
  UserVerificationWithProfile,
  VerificationFormData,
  VerificationStatusUpdate,
  VerificationStats,
  VerificationFilters,
  VerificationDocument,
  FaceVerificationResult,
  ONECIVerificationData,
  CNAMVerificationData,
  VerificationProgress,
  VerificationRejection
} from './types';
