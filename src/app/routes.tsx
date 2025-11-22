import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from '@/app/layout/Layout';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import RouterErrorBoundary from '@/shared/ui/RouterErrorBoundary';

// ========================================
// LAZY IMPORTS - Pages
// ========================================

// Pages publiques et authentification
const Home = lazy(() => import('@/features/property/pages/HomePage'));
const Auth = lazy(() => import('@/features/auth/pages/AuthPage'));
const AuthCallback = lazy(() => import('@/features/auth/pages/CallbackPage'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const VerifyOTP = lazy(() => import('@/features/auth/pages/VerifyOTPPage'));
const ProfileSelection = lazy(() => import('@/features/auth/pages/ProfileSelectionPage'));
const Profile = lazy(() => import('@/features/auth/pages/ProfilePage'));
const AboutPage = lazy(() => import('@/features/auth/pages/AboutPage'));
const TermsOfServicePage = lazy(() => import('@/features/auth/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('@/features/auth/pages/PrivacyPolicyPage'));

// Pages Locataire
const SearchProperties = lazy(() => import('@/features/tenant/pages/SearchPropertiesPage'));
const PropertyDetail = lazy(() => import('@/features/tenant/pages/PropertyDetailPage'));
const Favorites = lazy(() => import('@/features/tenant/pages/FavoritesPage'));
const SavedSearches = lazy(() => import('@/features/tenant/pages/SavedSearchesPage'));
const Recommendations = lazy(() => import('@/features/tenant/pages/RecommendationsPage'));
const ApplicationForm = lazy(() => import('@/features/tenant/pages/ApplicationFormPage'));
const ApplicationDetail = lazy(() => import('@/features/tenant/pages/ApplicationDetailPage'));
const ScheduleVisit = lazy(() => import('@/features/tenant/pages/ScheduleVisitPage'));
const MyVisits = lazy(() => import('@/features/tenant/pages/MyVisitsPage'));
const TenantDashboard = lazy(() => import('@/features/tenant/pages/DashboardPage'));
const TenantCalendar = lazy(() => import('@/features/tenant/pages/CalendarPage'));
const TenantScore = lazy(() => import('@/features/tenant/pages/ScorePage'));
const TenantMaintenance = lazy(() => import('@/features/tenant/pages/MaintenancePage'));
const MyContracts = lazy(() => import('@/features/tenant/pages/MyContractsPage'));
const ContractDetail = lazy(() => import('@/features/tenant/pages/ContractDetailPage'));
const ContractDetailEnhanced = lazy(() => import('@/features/tenant/pages/ContractDetailEnhancedPage'));
const SignLease = lazy(() => import('@/features/tenant/pages/SignLeasePage'));
const MakePayment = lazy(() => import('@/features/tenant/pages/MakePaymentPage'));
const PaymentHistory = lazy(() => import('@/features/tenant/pages/PaymentHistoryPage'));

// Pages Propriétaire
const CreateContract = lazy(() => import('@/features/owner/pages/CreateContractPage'));
const ContractsList = lazy(() => import('@/features/owner/pages/ContractsListPage'));
const AddProperty = lazy(() => import('@/features/owner/pages/AddPropertyPage'));
const OwnerDashboard = lazy(() => import('@/features/owner/pages/DashboardPage'));
const OwnerMaintenance = lazy(() => import('@/features/owner/pages/MaintenancePage'));

// Pages Agence
const AgencyDashboard = lazy(() => import('@/features/agency/pages/DashboardPage'));
const AgencyRegistration = lazy(() => import('@/features/agency/pages/RegistrationPage'));
const AgencyTeam = lazy(() => import('@/features/agency/pages/TeamPage'));
const AgencyProperties = lazy(() => import('@/features/agency/pages/PropertiesPage'));
const AgencyCommissions = lazy(() => import('@/features/agency/pages/CommissionsPage'));

// Pages Admin
const AdminDashboard = lazy(() => import('@/features/admin/pages/DashboardPage'));
const AdminUsers = lazy(() => import('@/features/admin/pages/UsersPage'));
const AdminUserRoles = lazy(() => import('@/features/admin/pages/UserRolesPage'));
const AdminApiKeys = lazy(() => import('@/features/admin/pages/ApiKeysPage'));
const AdminServiceProviders = lazy(() => import('@/features/admin/pages/ServiceProvidersPage'));
const AdminServiceMonitoring = lazy(() => import('@/features/admin/pages/ServiceMonitoringPage'));
const AdminServiceConfiguration = lazy(() => import('@/features/admin/pages/ServiceConfigurationPage'));
const AdminTestDataGenerator = lazy(() => import('@/features/admin/pages/TestDataGeneratorPage'));
const AdminQuickDemo = lazy(() => import('@/features/admin/pages/QuickDemoPage'));
const AdminCEVManagement = lazy(() => import('@/features/admin/pages/CEVManagementPage'));
const AdminTrustAgents = lazy(() => import('@/features/admin/pages/TrustAgentsPage'));

// Pages Trust Agent
const TrustAgentDashboard = lazy(() => import('@/features/trust-agent/pages/DashboardPage'));
const TrustAgentModeration = lazy(() => import('@/features/trust-agent/pages/ModerationPage'));
const TrustAgentMediation = lazy(() => import('@/features/trust-agent/pages/MediationPage'));
const TrustAgentAnalytics = lazy(() => import('@/features/trust-agent/pages/AnalyticsPage'));

// Pages Vérification
const VerificationRequest = lazy(() => import('@/features/verification/pages/RequestPage'));
const IdentityVerification = lazy(() => import('@/features/auth/pages/IdentityVerificationPage'));
const VerificationSettings = lazy(() => import('@/features/verification/pages/SettingsPage'));
const MyCertificates = lazy(() => import('@/features/verification/pages/MyCertificatesPage'));
const RequestCEV = lazy(() => import('@/features/verification/pages/RequestCEVPage'));
const CEVRequestDetail = lazy(() => import('@/features/verification/pages/CEVRequestDetailPage'));

// Pages Messagerie et Litiges
const Messages = lazy(() => import('@/features/messaging/pages/MessagesPage'));
const NotificationPreferences = lazy(() => import('@/features/messaging/pages/NotificationPreferencesPage'));
const MyDisputes = lazy(() => import('@/features/dispute/pages/MyDisputesPage'));
const CreateDispute = lazy(() => import('@/features/dispute/pages/CreateDisputePage'));
const DisputeDetail = lazy(() => import('@/features/dispute/pages/DisputeDetailPage'));

// Pages Services
const MaintenanceRequest = lazy(() => import('@/features/tenant/pages/MaintenanceRequestPage'));
const PropertyStats = lazy(() => import('@/features/property/pages/PropertyStatsPage'));

// ========================================
// ROUTES PUBLIQUES (sans authentification)
// ========================================
const publicRoutes: RouteObject[] = [
  { index: true, element: <Home /> },
  { path: 'connexion', element: <Auth /> },
  { path: 'inscription', element: <Auth /> },
  { path: 'auth/callback', element: <AuthCallback /> },
  { path: 'mot-de-passe-oublie', element: <ForgotPassword /> },
  { path: 'reinitialiser-mot-de-passe', element: <ResetPassword /> },
  { path: 'verification-otp', element: <VerifyOTP /> },
  { path: 'a-propos', element: <AboutPage /> },
  { path: 'conditions-utilisation', element: <TermsOfServicePage /> },
  { path: 'politique-confidentialite', element: <PrivacyPolicyPage /> },
  { path: 'mentions-legales', element: <TermsOfServicePage /> },
  { path: 'recherche', element: <SearchProperties /> },
  { path: 'propriete/:id', element: <PropertyDetail /> },
  { path: 'properties/:id', element: <PropertyDetail /> },
];

// ========================================
// ROUTES PROTÉGÉES (avec authentification)
// ========================================
const protectedRoutes: RouteObject[] = [
  {
    path: 'choix-profil',
    element: (
      <ProtectedRoute>
        <ProfileSelection />
      </ProtectedRoute>
    ),
  },
  {
    path: 'profil',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: 'favoris',
    element: (
      <ProtectedRoute>
        <Favorites />
      </ProtectedRoute>
    ),
  },
  {
    path: 'recherches-sauvegardees',
    element: (
      <ProtectedRoute>
        <SavedSearches />
      </ProtectedRoute>
    ),
  },
  {
    path: 'recommandations',
    element: (
      <ProtectedRoute>
        <Recommendations />
      </ProtectedRoute>
    ),
  },
  {
    path: 'candidature/:id',
    element: (
      <ProtectedRoute>
        <ApplicationForm />
      </ProtectedRoute>
    ),
  },
  {
    path: 'visiter/:id',
    element: (
      <ProtectedRoute>
        <ScheduleVisit />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mes-visites',
    element: (
      <ProtectedRoute>
        <MyVisits />
      </ProtectedRoute>
    ),
  },
  {
    path: 'messages',
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mes-contrats',
    element: (
      <ProtectedRoute>
        <MyContracts />
      </ProtectedRoute>
    ),
  },
  {
    path: 'tous-les-contrats',
    element: (
      <ProtectedRoute>
        <ContractsList />
      </ProtectedRoute>
    ),
  },
  {
    path: 'contrat/:id',
    element: (
      <ProtectedRoute>
        <ContractDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: 'bail/:id/details',
    element: (
      <ProtectedRoute>
        <ContractDetailEnhanced />
      </ProtectedRoute>
    ),
  },
  {
    path: 'signer-bail/:id',
    element: (
      <ProtectedRoute>
        <SignLease />
      </ProtectedRoute>
    ),
  },
  {
    path: 'bail/signer/:id',
    element: (
      <ProtectedRoute>
        <SignLease />
      </ProtectedRoute>
    ),
  },
  {
    path: 'effectuer-paiement',
    element: (
      <ProtectedRoute>
        <MakePayment />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mes-paiements',
    element: (
      <ProtectedRoute>
        <PaymentHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: 'verification',
    element: (
      <ProtectedRoute>
        <VerificationRequest />
      </ProtectedRoute>
    ),
  },
  {
    path: 'certification-ansut',
    element: (
      <ProtectedRoute>
        <IdentityVerification />
      </ProtectedRoute>
    ),
  },
  {
    path: 'ansut-verification',
    element: (
      <ProtectedRoute>
        <IdentityVerification />
      </ProtectedRoute>
    ),
  },
  {
    path: 'verification/parametres',
    element: (
      <ProtectedRoute>
        <VerificationSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mes-certificats',
    element: (
      <ProtectedRoute>
        <MyCertificates />
      </ProtectedRoute>
    ),
  },
  {
    path: 'request-cev',
    element: (
      <ProtectedRoute>
        <RequestCEV />
      </ProtectedRoute>
    ),
  },
  {
    path: 'cev-request/:id',
    element: (
      <ProtectedRoute>
        <CEVRequestDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: 'maintenance/nouvelle',
    element: (
      <ProtectedRoute>
        <MaintenanceRequest />
      </ProtectedRoute>
    ),
  },
  {
    path: 'notifications/preferences',
    element: (
      <ProtectedRoute>
        <NotificationPreferences />
      </ProtectedRoute>
    ),
  },
  {
    path: 'mes-litiges',
    element: (
      <ProtectedRoute>
        <MyDisputes />
      </ProtectedRoute>
    ),
  },
  {
    path: 'creer-litige',
    element: (
      <ProtectedRoute>
        <CreateDispute />
      </ProtectedRoute>
    ),
  },
  {
    path: 'litige/:id',
    element: (
      <ProtectedRoute>
        <DisputeDetail />
      </ProtectedRoute>
    ),
  },
];

// ========================================
// ROUTES LOCATAIRE
// ========================================
const tenantRoutes: RouteObject[] = [
  {
    path: 'dashboard/locataire',
    element: (
      <ProtectedRoute allowedRoles={['locataire']}>
        <TenantDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'dashboard/locataire/calendrier',
    element: (
      <ProtectedRoute allowedRoles={['locataire']}>
        <TenantCalendar />
      </ProtectedRoute>
    ),
  },
  {
    path: 'score-locataire',
    element: (
      <ProtectedRoute allowedRoles={['locataire']}>
        <TenantScore />
      </ProtectedRoute>
    ),
  },
  {
    path: 'maintenance/locataire',
    element: (
      <ProtectedRoute allowedRoles={['locataire']}>
        <TenantMaintenance />
      </ProtectedRoute>
    ),
  },
];

// ========================================
// ROUTES PROPRIÉTAIRE
// ========================================
const ownerRoutes: RouteObject[] = [
  {
    path: 'dashboard/proprietaire',
    element: (
      <ProtectedRoute allowedRoles={['proprietaire']}>
        <OwnerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'dashboard/ajouter-propriete',
    element: (
      <ProtectedRoute allowedRoles={['proprietaire', 'agence']}>
        <AddProperty />
      </ProtectedRoute>
    ),
  },
  {
    path: 'add-property',
    element: (
      <ProtectedRoute allowedRoles={['proprietaire', 'agence']}>
        <AddProperty />
      </ProtectedRoute>
    ),
  },
  {
    path: 'dashboard/propriete/:id/stats',
    element: (
      <ProtectedRoute allowedRoles={['proprietaire', 'agence']}>
        <PropertyStats />
      </ProtectedRoute>
    ),
  },
  {
    path: 'maintenance/proprietaire',
    element: (
      <ProtectedRoute allowedRoles={['proprietaire']}>
        <OwnerMaintenance />
      </ProtectedRoute>
    ),
  },
  {
    path: 'creer-contrat/:propertyId',
    element: (
      <ProtectedRoute allowedRoles={['proprietaire', 'agence']}>
        <CreateContract />
      </ProtectedRoute>
    ),
  },
  {
    path: 'dashboard/candidature/:id',
    element: (
      <ProtectedRoute allowedRoles={['proprietaire', 'agence']}>
        <ApplicationDetail />
      </ProtectedRoute>
    ),
  },
];

// ========================================
// ROUTES AGENCE
// ========================================
const agencyRoutes: RouteObject[] = [
  {
    path: 'agence/tableau-de-bord',
    element: (
      <ProtectedRoute allowedRoles={['agence']}>
        <AgencyDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'agence/inscription',
    element: (
      <ProtectedRoute>
        <AgencyRegistration />
      </ProtectedRoute>
    ),
  },
  {
    path: 'agence/equipe',
    element: (
      <ProtectedRoute allowedRoles={['agence']}>
        <AgencyTeam />
      </ProtectedRoute>
    ),
  },
  {
    path: 'agence/proprietes',
    element: (
      <ProtectedRoute allowedRoles={['agence']}>
        <AgencyProperties />
      </ProtectedRoute>
    ),
  },
  {
    path: 'agence/commissions',
    element: (
      <ProtectedRoute allowedRoles={['agence']}>
        <AgencyCommissions />
      </ProtectedRoute>
    ),
  },
];

// ========================================
// ROUTES ADMIN
// ========================================
const adminRoutes: RouteObject[] = [
  {
    path: 'admin/tableau-de-bord',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/utilisateurs',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/gestion-roles',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminUserRoles />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/api-keys',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminApiKeys />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/service-providers',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminServiceProviders />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/service-monitoring',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminServiceMonitoring />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/service-configuration',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminServiceConfiguration />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/test-data-generator',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminTestDataGenerator />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/demo-rapide',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminQuickDemo />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/cev-management',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminCEVManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/cev/:id',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminCEVManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: 'admin/trust-agents',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminTrustAgents />
      </ProtectedRoute>
    ),
  },
];

// ========================================
// ROUTES TRUST AGENT
// ========================================
const trustAgentRoutes: RouteObject[] = [
  {
    path: 'trust-agent/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['trust_agent']}>
        <TrustAgentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'trust-agent/moderation',
    element: (
      <ProtectedRoute allowedRoles={['trust_agent']}>
        <TrustAgentModeration />
      </ProtectedRoute>
    ),
  },
  {
    path: 'trust-agent/mediation',
    element: (
      <ProtectedRoute allowedRoles={['trust_agent']}>
        <TrustAgentMediation />
      </ProtectedRoute>
    ),
  },
  {
    path: 'trust-agent/analytics',
    element: (
      <ProtectedRoute allowedRoles={['trust_agent']}>
        <TrustAgentAnalytics />
      </ProtectedRoute>
    ),
  },
];

// ========================================
// ROUTE 404
// ========================================
const notFoundRoute: RouteObject = {
  path: '*',
  element: (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-8">La page que vous recherchez n'existe pas.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-terracotta-500 text-white rounded-lg hover:bg-terracotta-600 transition-colors"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  ),
};

// ========================================
// EXPORT DES ROUTES COMPLÈTES
// ========================================
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouterErrorBoundary />,
    children: [
      // Routes publiques
      ...publicRoutes,
      
      // Routes protégées générales
      ...protectedRoutes,
      
      // Routes par type d'utilisateur
      ...tenantRoutes,
      ...ownerRoutes,
      ...agencyRoutes,
      ...adminRoutes,
      ...trustAgentRoutes,
      
      // Route 404
      notFoundRoute,
    ],
  },
];
