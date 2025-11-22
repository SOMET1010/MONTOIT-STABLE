/**
 * Feature: auth
 * 
 * Exports publics de la feature auth
 */

// Pages
export { default as AboutPage } from './pages/AboutPage';
export { default as AuthPage } from './pages/AuthPage';
export { default as CallbackPage } from './pages/CallbackPage';
export { default as ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { default as IdentityVerificationPage } from './pages/IdentityVerificationPage';
export { default as PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
export { default as ProfilePage } from './pages/ProfilePage';
export { default as ProfileSelectionPage } from './pages/ProfileSelectionPage';
export { default as ResetPasswordPage } from './pages/ResetPasswordPage';
export { default as TermsOfServicePage } from './pages/TermsOfServicePage';
export { default as VerifyOTPPage } from './pages/VerifyOTPPage';

// Components
export { default as AuthModal } from './components/AuthModal';

// Services
export { authApi } from './services/auth.api';

// Types
export type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  SignUpData,
  SignInData,
  OTPVerificationData,
  OTPMethod,
  UserRole,
  AuthUser,
  AuthState,
  AuthContextValue,
  PasswordResetData,
  ProfileFormData,
  UserRoles,
  RoleSwitchData,
  AuthError,
  EmailVerificationStatus,
  PhoneVerificationStatus,
  IdentityVerificationStatus,
  UserPreferences
} from './types';
