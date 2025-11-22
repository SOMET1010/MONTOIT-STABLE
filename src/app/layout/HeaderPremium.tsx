import { Home, Search, PlusCircle, MessageCircle, User, Heart, Calendar, Bell, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useMessageNotifications } from '@/features/messaging';
import { useState, useEffect } from 'react';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import ThemeToggle from '@/shared/ui/ThemeToggle';

export default function HeaderPremium() {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useMessageNotifications();
  const { isMobile } = useBreakpoint();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isOwner = profile?.user_type === 'proprietaire' || profile?.active_role === 'proprietaire';

  // Détecter le scroll pour effet glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <>
      <header className={`header-premium ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Animé */}
            <a href="/" className="header-logo header-logo-animated flex items-center space-x-2 md:space-x-3 flex-shrink-0">
              <div className="relative">
                <img
                  src="/logo-montoit.png"
                  alt="Mon Toit"
                  className="h-10 w-10 md:h-12 md:w-12 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold gradient-text-orange">
                  Mon Toit
                </span>
                {!isMobile && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Plateforme Immobilière</span>
                )}
              </div>
            </a>

            {/* Desktop Navigation Premium */}
            <nav className="hidden md:flex items-center space-x-1">
              <a
                href="/"
                className="header-nav-link header-nav-link-animated flex items-center space-x-2"
                style={{ animationDelay: '0.1s' }}
              >
                <Home className="h-5 w-5" />
                <span>Accueil</span>
              </a>

              {mainNavItems.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="header-nav-link header-nav-link-animated flex items-center space-x-2 relative"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <item.icon className="h-5 w-5 header-btn-icon" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </a>
              ))}

              <div className="ml-2">
                <ThemeToggle />
              </div>

              {user ? (
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                    className="header-btn-primary flex items-center space-x-2"
                  >
                    <User className="h-5 w-5 header-btn-icon" />
                    <span>Mon Compte</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-premium border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
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
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </a>
                      ))}

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                        <button
                          onClick={signOut}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-2">
                  <a href="/connexion" className="header-btn-secondary flex items-center space-x-2">
                    <User className="h-5 w-5 header-btn-icon" />
                    <span>Connexion</span>
                  </a>
                  <a href="/inscription" className="header-btn-primary flex items-center space-x-2">
                    <span>Inscription</span>
                  </a>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Premium */}
      <div className={`header-mobile-backdrop ${showMobileMenu ? 'open' : ''}`} onClick={() => setShowMobileMenu(false)} />
      <div className={`header-mobile-menu ${showMobileMenu ? 'open' : ''}`}>
        <div className="p-6 space-y-4">
          {/* User Info Mobile */}
          {user && (
            <div className="header-mobile-item pb-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {profile?.full_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          )}

          {/* Navigation Mobile */}
          <div className="space-y-2">
            <a
              href="/"
              className="header-mobile-item flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
            >
              <Home className="h-5 w-5" />
              <span className="font-semibold">Accueil</span>
            </a>

            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="header-mobile-item flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all relative"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </a>
            ))}

            {user && userMenuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="header-mobile-item flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
              </a>
            ))}
          </div>

          {/* Actions Mobile */}
          <div className="header-mobile-item pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {user ? (
              <button
                onClick={signOut}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-semibold"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            ) : (
              <>
                <a
                  href="/connexion"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-orange-600 dark:text-orange-400 border-2 border-orange-600 dark:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all font-semibold"
                >
                  <User className="h-5 w-5" />
                  <span>Connexion</span>
                </a>
                <a
                  href="/inscription"
                  className="flex items-center justify-center w-full px-4 py-3 rounded-xl gradient-orange text-white hover:shadow-orange-hover transition-all font-semibold"
                >
                  <span>Inscription</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
