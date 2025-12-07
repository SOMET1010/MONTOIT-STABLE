import {
  Home,
  Search,
  User,
  LogOut,
  Building2,
  MessageCircle,
  Calendar,
  FileText,
  Heart,
  Key,
  Award,
  Wrench,
  Users,
  BarChart,
  ChevronDown,
  Settings,
  Menu,
  X,
  Shield,
  Activity,
  Zap,
  Sun,
  Moon,
  Monitor,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useMessageNotifications } from '@/features/messaging';
import LanguageSelector from '@/shared/ui/LanguageSelector';
import RoleSwitcher from './RoleSwitcher';
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { useTheme } from '@/app/providers/ThemeProvider';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useMessageNotifications();
  const [verificationStatus, setVerificationStatus] = useState({
    smileIdVerified: false,
    faceVerified: false,
    identityVerified: false,
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  const closeAllMenus = () => {
    setShowUserMenu(false);
  };
  const isOwnerRole =
    profile?.active_role === 'proprietaire' ||
    profile?.active_role === 'agence' ||
    profile?.user_type === 'proprietaire' ||
    profile?.user_type === 'agence';
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  useEffect(() => {
    if (user && profile) {
      loadVerificationStatus();
    }
  }, [user, profile]);

  const loadVerificationStatus = async () => {
    try {
      const { data } = await supabase
        .from('user_verifications')
        .select('smile_id_status, face_verification_status')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data) {
        setVerificationStatus({
          smileIdVerified: data.smile_id_status === 'verifie',
          faceVerified: data.face_verification_status === 'verifie',
          identityVerified:
            data.smile_id_status === 'verifie' && data.face_verification_status === 'verifie',
        });
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg dark:shadow-gray-900/50 border-b-2 border-terracotta-100 dark:border-terracotta-900 sticky top-0 z-50">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <img
                src="/logo-montoit.png"
                alt="Mon Toit - Plateforme Immobilière ANSUT"
                className="h-12 w-12 transform group-hover:scale-105 transition-all duration-300 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight" style={{ color: '#2563eb' }}>
                MON TOIT
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Plateforme Immobilière</span>
            </div>
          </a>

          <nav
            className="hidden md:flex items-center space-x-0.5 flex-1 justify-center px-4 min-w-0 overflow-visible"
            style={{ scrollbarWidth: 'none' }}
          >
            <a
              href="/"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-terracotta-50 hover:to-coral-50 dark:hover:from-terracotta-900/30 dark:hover:to-coral-900/30 hover:text-terracotta-700 dark:hover:text-terracotta-400 transition-all duration-200 font-semibold whitespace-nowrap"
            >
              <Home className="h-4 w-4" />
              <span>Accueil</span>
            </a>
            <a
              href="/recherche"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100 dark:hover:from-cyan-900/30 dark:hover:to-cyan-900/30 hover:text-cyan-700 dark:hover:text-cyan-400 transition-all duration-200 font-semibold whitespace-nowrap"
            >
              <Search className="h-4 w-4" />
              <span>Rechercher</span>
            </a>
            {user && isOwnerRole && (
              <>
                <a
                  href="/dashboard/proprietaire"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-terracotta-50 hover:to-coral-50 dark:hover:from-terracotta-900/30 dark:hover:to-coral-900/30 hover:text-terracotta-700 dark:hover:text-terracotta-400 transition-all duration-200 font-semibold whitespace-nowrap"
                >
                  <Home className="h-4 w-4" />
                  <span>Tableau de bord</span>
                </a>
                <a
                  href="/dashboard/ajouter-propriete"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 transition-all duration-200 font-semibold whitespace-nowrap"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Ajouter une propriété</span>
                </a>
              </>
            )}
            {user && profile?.user_type === 'locataire' && (
              <a
                href="/dashboard/locataire"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-200 font-semibold whitespace-nowrap"
              >
                <Home className="h-4 w-4" />
                <span>Tableau de bord</span>
              </a>
            )}
            {user && (
              <>
                <a
                  href="/messages"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-200 font-semibold relative whitespace-nowrap"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </a>
                <a
                  href="/mes-visites"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 transition-all duration-200 font-semibold whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Visites</span>
                </a>
                <a
                  href="/mes-contrats"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 transition-all duration-200 font-semibold whitespace-nowrap"
                >
                  <FileText className="h-4 w-4" />
                  <span>Contrats</span>
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg border border-gray-200 hover:border-terracotta-300 hover:bg-terracotta-50 transition-all flex items-center space-x-1 text-gray-700"
              title="Changer de thème"
            >
              {theme === 'system' ? (
                <Monitor className="h-5 w-5" />
              ) : resolvedTheme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            {user ? (
              <>
                <div className="relative hidden md:block">
                  <button
                    onClick={() => {
                      const next = !showUserMenu;
                      closeAllMenus();
                      setShowUserMenu(next);
                    }}
                    className="flex items-center space-x-2 bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="h-9 w-9 rounded-full border-2 border-terracotta-300 shadow-md"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-terracotta-500 to-coral-500 flex items-center justify-center text-white font-bold text-sm shadow-glow">
                        {profile?.full_name?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex flex-col items-start leading-tight text-left">
                      <span className="text-sm font-semibold text-gray-900 max-w-[150px] truncate">
                        {profile?.full_name || 'Utilisateur'}
                      </span>
                      <span className="text-xs text-gray-500 max-w-[160px] truncate">
                        {profile?.email || user.email}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                          Changer de rôle
                        </p>
                        <RoleSwitcher />
                      </div>
                      {(profile?.active_role === 'proprietaire' ||
                        profile?.active_role === 'agence' ||
                        profile?.user_type === 'proprietaire' ||
                        profile?.user_type === 'agence') && (
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs uppercase font-semibold text-gray-500 mb-1">
                            Espace propriétaire
                          </p>
                          <div className="space-y-1">
                            <a
                              href="/dashboard/proprietaire"
                              className="flex items-center px-2 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                            >
                              <Home className="h-4 w-4 mr-2" />
                              Tableau de bord
                            </a>
                            <a
                              href="/dashboard/ajouter-propriete"
                              className="flex items-center px-2 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                            >
                              <Building2 className="h-4 w-4 mr-2" />
                              Ajouter une propriété
                            </a>
                            <a
                              href="/maintenance/proprietaire"
                              className="flex items-center px-2 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                            >
                              <Wrench className="h-4 w-4 mr-2" />
                              Maintenance
                            </a>
                          </div>
                        </div>
                      )}
                      <a
                        href="/profil"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Mon profil
                      </a>
                      <a
                        href="/notifications/preferences"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Préférences
                      </a>
                      <a
                        href="/recherches-sauvegardees"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Mes recherches
                      </a>
                      <a
                        href="/favoris"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Favoris
                      </a>
                      {profile?.user_type === 'locataire' && (
                        <a
                          href="/score-locataire"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Mon Score
                        </a>
                      )}
                      {(profile?.user_type === 'locataire' ||
                        profile?.user_type === 'proprietaire') && (
                        <a
                          href={
                            profile?.user_type === 'locataire'
                              ? '/maintenance/locataire'
                              : '/maintenance/proprietaire'
                          }
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          <Wrench className="h-4 w-4 mr-2" />
                          Maintenance
                        </a>
                      )}
                      <div className="px-4 py-3 border-t border-b border-gray-100">
                        <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Apparence</p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-semibold ${
                              resolvedTheme === 'light'
                                ? 'border-terracotta-300 text-terracotta-700 bg-terracotta-50'
                                : 'border-gray-200 text-gray-700 hover:border-terracotta-200'
                            }`}
                          >
                            <Sun className="h-4 w-4 mr-1" />
                            Clair
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-semibold ${
                              resolvedTheme === 'dark'
                                ? 'border-terracotta-300 text-terracotta-700 bg-terracotta-50'
                                : 'border-gray-200 text-gray-700 hover:border-terracotta-200'
                            }`}
                          >
                            <Moon className="h-4 w-4 mr-1" />
                            Sombre
                          </button>
                          <button
                            onClick={() => setTheme('system')}
                            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-semibold ${
                              theme === 'system'
                                ? 'border-terracotta-300 text-terracotta-700 bg-terracotta-50'
                                : 'border-gray-200 text-gray-700 hover:border-terracotta-200'
                            }`}
                          >
                            <Monitor className="h-4 w-4 mr-1" />
                            Système
                          </button>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-t border-b border-gray-100">
                        <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Langue</p>
                        <LanguageSelector />
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 font-semibold"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                  <button
                    onClick={cycleTheme}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 border border-gray-200"
                    aria-label="Changer de thème"
                  >
                    {theme === 'system' ? (
                      <Monitor className="h-5 w-5" />
                    ) : resolvedTheme === 'dark' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </button>
              </>
            ) : (
              <>
                <a
                  href="/connexion"
                  className="text-terracotta-600 hover:text-terracotta-700 font-bold transition-colors transform hover:scale-105 transition-all duration-300"
                >
                  Connexion
                </a>
                <a href="/inscription" className="btn-primary">
                  Inscription
                </a>
              </>
            )}
          </div>
        </div>

        {showMobileMenu && user && (
          <div className="md:hidden border-t border-gray-200 py-4 px-4 bg-white">
            <div className="mb-4">
              <RoleSwitcher />
            </div>
            <div className="space-y-2">
              <a href="/" className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium">
                <Home className="h-4 w-4 inline mr-2" />
                Accueil
              </a>
              <a
                href="/recherche"
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
              >
                <Search className="h-4 w-4 inline mr-2" />
                Rechercher
              </a>
              {isOwnerRole && (
                <>
                  <a
                    href="/dashboard/proprietaire"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Home className="h-4 w-4 inline mr-2" />
                    Tableau de bord
                  </a>
                  <a
                    href="/dashboard/ajouter-propriete"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Building2 className="h-4 w-4 inline mr-2" />
                    Ajouter une propriété
                  </a>
                </>
              )}
              <a
                href="/messages"
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium relative"
              >
                <MessageCircle className="h-4 w-4 inline mr-2" />
                Messages
                {unreadCount > 0 && (
                  <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </a>
              <a
                href="/mes-visites"
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Mes visites
              </a>
              <a
                href="/favoris"
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
              >
                <Heart className="h-4 w-4 inline mr-2" />
                Favoris
              </a>
              <a
                href="/mes-contrats"
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Contrats
              </a>

              {profile?.user_type === 'locataire' && (
                <>
                  <a
                    href="/score-locataire"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Award className="h-4 w-4 inline mr-2" />
                    Mon Score
                  </a>
                  <a
                    href="/maintenance/locataire"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Wrench className="h-4 w-4 inline mr-2" />
                    Mes demandes
                  </a>
                </>
              )}

              {profile?.user_type === 'proprietaire' && (
                <a
                  href="/maintenance/proprietaire"
                  className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <Wrench className="h-4 w-4 inline mr-2" />
                  Demandes de maintenance
                </a>
              )}

              {profile?.user_type === 'agence' && (
                <>
                  <a
                    href="/agence/tableau-de-bord"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <BarChart className="h-4 w-4 inline mr-2" />
                    Tableau de bord
                  </a>
                  <a
                    href="/agence/equipe"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Mon équipe
                  </a>
                  <a
                    href="/agence/proprietes"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Building2 className="h-4 w-4 inline mr-2" />
                    Propriétés
                  </a>
                </>
              )}

              {(profile?.user_type === 'admin' ||
                (Array.isArray(profile?.available_roles) &&
                  profile.available_roles.includes('admin')) ||
                profile?.active_role === 'admin') && (
                <>
                  <div className="py-2 px-4 border-b border-gray-200">
                    <p className="text-xs font-bold text-blue-600 uppercase">Administration</p>
                  </div>
                  <a
                    href="/admin/tableau-de-bord"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <BarChart className="h-4 w-4 inline mr-2" />
                    Dashboard
                  </a>
                  <a
                    href="/admin/utilisateurs"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Utilisateurs
                  </a>
                  <a
                    href="/admin/gestion-roles"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Shield className="h-4 w-4 inline mr-2" />
                    Attribuer Rôles
                  </a>
                  <a
                    href="/admin/api-keys"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Key className="h-4 w-4 inline mr-2" />
                    Clés API
                  </a>
                  <a
                    href="/admin/service-monitoring"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Activity className="h-4 w-4 inline mr-2" />
                    Monitoring
                  </a>
                  <a
                    href="/admin/demo-rapide"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Démo Rapide
                  </a>
                  <a
                    href="/admin/cev-management"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <FileCheck className="h-4 w-4 inline mr-2" />
                    Certifications
                  </a>
                </>
              )}

              {((Array.isArray(profile?.available_roles) &&
                profile.available_roles.includes('trust_agent')) ||
                profile?.active_role === 'trust_agent') && (
                <>
                  <div className="py-2 px-4 border-b border-t border-gray-200 mt-2">
                    <p className="text-xs font-bold text-green-600 uppercase">Trust Agent</p>
                  </div>
                  <a
                    href="/trust-agent/dashboard"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <BarChart className="h-4 w-4 inline mr-2" />
                    Dashboard Agent
                  </a>
                  <a
                    href="/trust-agent/moderation"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Shield className="h-4 w-4 inline mr-2" />
                    Modération
                  </a>
                  <a
                    href="/trust-agent/mediation"
                    className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Médiation
                  </a>
                </>
              )}

              <a
                href="/notifications/preferences"
                className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Préférences
              </a>
              <a href="/profil" className="block py-2 px-4 rounded-lg hover:bg-gray-50 font-medium">
                <User className="h-4 w-4 inline mr-2" />
                Profil
              </a>

              <div className="border-t border-gray-200 my-2"></div>

              <div className="py-2 px-4">
                <p className="text-sm font-bold text-gray-700 mb-1">
                  {profile?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>

              <div className="px-4 pb-2">
                <LanguageSelector />
              </div>

              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  signOut();
                }}
                className="w-full text-left py-2 px-4 rounded-lg hover:bg-red-50 text-red-600 font-medium"
              >
                <LogOut className="h-4 w-4 inline mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
