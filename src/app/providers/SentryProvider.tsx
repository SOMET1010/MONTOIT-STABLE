import React from 'react';
import * as Sentry from '@sentry/react';
import { useAuthStore } from '@/features/auth/stores/authStore';

interface SentryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider pour configurer Sentry avec le contexte utilisateur
 */
export function SentryProvider({ children }: SentryProviderProps) {
  const { user } = useAuthStore();

  React.useEffect(() => {
    // Mettre à jour l'utilisateur dans Sentry
    if (user?.id) {
      Sentry.setUser({
        id: user.id,
        email: user.email || undefined,
        username: `${user.firstName} ${user.lastName}`.trim() || undefined,
        role: user.role
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return <>{children}</>;
}

/**
 * HOC pour envelopper un composant avec monitoring Sentry
 */
export function withSentryMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = Sentry.withErrorBoundary(Component, {
    fallback: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Une erreur est survenue
            </h2>
            <p className="text-gray-600 mb-6">
              L'équipe technique a été notifiée et travaille sur la résolution du problème.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser la page
            </button>
          </div>
        </div>
      </div>
    ),
    showDialog: true
  });

  WrappedComponent.displayName = componentName
    ? `withSentryMonitoring(${componentName})`
    : `withSentryMonitoring(${Component.name || 'Component'})`;

  return WrappedComponent;
}