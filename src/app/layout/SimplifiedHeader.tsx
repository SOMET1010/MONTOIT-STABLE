import { Home, Search, MessageCircle, User, Menu, X, PlusCircle, Heart, Calendar, Bell, FileText, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useMessageNotifications } from '@/features/messaging';
import { useState } from 'react';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import ThemeToggle, { CompactThemeToggle } from '@/shared/ui/ThemeToggle';

export default function SimplifiedHeader() {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useMessageNotifications();
  const { isMobile } = useBreakpoint();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isOwner = profile?.user_type === 'proprietaire' || profile?.active_role === 'proprietaire';

  const mainNavItems = [
    { label: 'Rechercher', href: '/recherche', icon: Search },
    ...(user && isOwner ? [{ label: 'Publier', href: '/ajouter-propriete', icon: PlusCircle }] : []),
    ...(user ? [{ label: 'Messages', href: '/messages', icon: MessageCircle, badge: unreadCount }] : []),
  ];

  const userMenuItems = user ? [
    { label: 'Mon Profil', href: '/profil', icon: User },
    { label: 'Mes Favoris', href: '/favoris', icon: Heart },
    { label: 'Mes Visites', href: '/mes-visites', icon: Calendar },
    { label: 'Mes Alertes', href: '/recherches-sauvegardees', icon: Bell },
    { label: 'Mes Contrats', href: '/mes-contrats', icon: FileText },
    { label: 'Paramètres', href: '/profil', icon: Settings },
  ] : [];

  return (
    <header className="glass dark:bg-gray-900/90 backdrop-blur-lg shadow-premium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
            <div className="relative">
              <img
                src="/logo-montoit.png"
                alt="Mon Toit"
                className="h-10 w-10 md:h-12 md:w-12 transform group-hover:scale-105 transition-all duration-200 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold gradient-text-orange">
                Mon Toit
              </span>
              {!isMobile && (
                <span className="text-xs text-gray-500 font-medium">Plateforme Immobilière</span>
              )}
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <a
              href="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-semibold"
            >
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </a>

            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 font-semibold relative hover-lift"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </a>
            ))}

            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl gradient-orange text-white hover:shadow-orange-hover transition-all duration-300 font-semibold btn-premium"
                >
                  <User className="h-5 w-5" />
                  <span>Mon Compte</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {profile?.full_name || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>

                    {userMenuItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </a>
                    ))}

                    <div className="border-t border-gray-100 mt-2">
                      <button
                        onClick={() => signOut()}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/connexion"
                  className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 font-semibold"
                >
                  Connexion
                </a>
                <a
                  href="/inscription"
                  className="px-4 py-2 rounded-xl gradient-orange text-white hover:shadow-orange-hover transition-all duration-300 font-semibold btn-premium"
                >
                  Inscription
                </a>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {showMobileMenu ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <a
              href="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 font-semibold"
              onClick={() => setShowMobileMenu(false)}
            >
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </a>

            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-semibold relative"
                onClick={() => setShowMobileMenu(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </a>
            ))}

            {user ? (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                {userMenuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 font-semibold"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                ))}
                <button
                  onClick={() => {
                    signOut();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <a
                  href="/connexion"
                  className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 font-semibold text-center"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Connexion
                </a>
                <a
                  href="/inscription"
                  className="block px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-semibold text-center"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Inscription
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
