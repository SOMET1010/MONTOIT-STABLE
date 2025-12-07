import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';
import Chatbot from '@/features/messaging/components/Chatbot';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import SkipLinks from '@/shared/ui/SkipLinks';

const noLayoutRoutes = ['/connexion', '/inscription', '/messages', '/auth/callback'];
const noHeaderFooterRoutes = [
  '/messages',
  '/admin/tableau-de-bord',
  '/admin/utilisateurs',
  '/admin/service-monitoring',
  '/admin/service-configuration',
  '/admin/test-data-generator',
  '/admin/demo-rapide',
  '/admin/gestion-roles',
  '/admin/cev-management',
  '/visiter',
  '/mes-visites',
  '/creer-contrat',
  '/contrat',
  '/signer-bail',
  '/bail/signer',
  '/verification',
  '/certification-ansut',
  '/mes-certificats',
  '/admin/api-keys',
  '/admin/service-providers',
  '/favoris',
  '/mes-contrats',
];

export default function Layout() {
  const location = useLocation();
  const path = location.pathname;

  const shouldShowLayout = !noLayoutRoutes.includes(path);
  const shouldShowHeaderFooter =
    !noHeaderFooterRoutes.some((route) => path.startsWith(route)) && !noLayoutRoutes.includes(path);

  // Liens de navigation pour l'accessibilité
  const skipLinks = [
    { id: 'main-content', label: 'Aller au contenu principal' },
    { id: 'main-navigation', label: 'Aller à la navigation' },
    { id: 'footer', label: 'Aller au pied de page' },
  ].filter((link) => {
    if (link.id === 'main-navigation' && !shouldShowHeaderFooter) return false;
    if (link.id === 'footer' && !shouldShowHeaderFooter) return false;
    return true;
  });

  if (!shouldShowLayout) {
    return (
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500"></div>
            </div>
          }
        >
          <Outlet />
          <Chatbot />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SkipLinks links={skipLinks} />
      {shouldShowHeaderFooter && (
        <header id="main-navigation">
          <Header />
        </header>
      )}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500"></div>
          </div>
        }
      >
        <main
          id="main-content"
          className={shouldShowHeaderFooter ? 'min-h-screen' : ''}
          role="main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </Suspense>
      {shouldShowHeaderFooter && (
        <footer id="footer">
          <Footer />
        </footer>
      )}
      <Chatbot />
    </ErrorBoundary>
  );
}
