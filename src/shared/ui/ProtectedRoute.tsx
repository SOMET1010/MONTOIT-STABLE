import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  fallbackPath = '/connexion' 
}: ProtectedRouteProps) {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  // Afficher le loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-terracotta-50 via-coral-50 to-amber-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-terracotta-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Forcer la complétion du profil avant d'accéder aux pages protégées (hors page de choix)
  if (profile && !profile.profile_setup_completed && location.pathname !== '/choix-profil') {
    return <Navigate to="/choix-profil" state={{ from: location }} replace />;
  }

  // Vérifier les rôles si des rôles spécifiques sont requis
  if (allowedRoles.length > 0) {
    const userRole = profile?.active_role || profile?.user_type;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-terracotta-50 via-coral-50 to-amber-50">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-terracotta-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Accès non autorisé
                </h1>
                <p className="text-gray-600 mb-6">
                  Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.history.back()}
                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                  >
                    Retour
                  </button>
                  <a
                    href="/"
                    className="w-full px-4 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold rounded-xl transition-all text-center block"
                  >
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Si toutes les vérifications passent, afficher les enfants
  return <>{children}</>;
}
