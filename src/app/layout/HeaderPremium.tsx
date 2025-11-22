import { Home, Search, PlusCircle, MessageCircle, User, Heart, Calendar, Bell, FileText, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useMessageNotifications } from '@/features/messaging';
import { useState, useEffect } from 'react';

interface HeaderPremiumProps {
  transparent?: boolean;
}

export default function HeaderPremium({ transparent = false }: HeaderPremiumProps) {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useMessageNotifications();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isOwner = profile?.user_type === 'proprietaire' || profile?.active_role === 'proprietaire';

  // Détecter le scroll
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

  // Classes dynamiques selon état
  const isTransparent = transparent && !scrolled;

  const headerBg = isTransparent
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-lg';

  const textColor = isTransparent
    ? 'text-white'
    : 'text-gray-900';

  const textColorSecondary = isTransparent
    ? 'text-white/80'
    : 'text-gray-600';

  const buttonHoverBg = isTransparent
    ? 'hover:bg-white/10'
    : 'hover:bg-terracotta-50';

  const buttonHoverText = isTransparent
    ? 'hover:text-white'
    : 'hover:text-terracotta-600';

  return (
    <>
      {/* Header Principal */}
      <header className={`w-full transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">

            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className={`absolute inset-0 ${isTransparent ? 'bg-white/20' : 'bg-terracotta-100'} rounded-xl blur-md group-hover:blur-lg transition-all`}></div>
                <img
                  src="/logo-montoit.png"
                  alt="Mon Toit"
                  className="relative h-10 w-10 sm:h-12 sm:w-12 object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className={`text-xl sm:text-2xl font-bold ${isTransparent ? 'text-white' : 'bg-gradient-to-r from-terracotta-500 to-coral-500 bg-clip-text text-transparent'} group-hover:scale-105 transition-transform duration-300`}>
                  Mon Toit
                </span>
                <span className={`text-xs ${textColorSecondary} font-medium hidden sm:block`}>
                  Plateforme Immobilière
                </span>
              </div>
            </a>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              <a
                href="/"
                className={`px-4 py-2 rounded-lg ${textColor} ${buttonHoverBg} ${buttonHoverText} transition-all duration-200 flex items-center gap-2 font-medium group`}
              >
                <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Accueil</span>
              </a>

              {mainNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg ${textColor} ${buttonHoverBg} ${buttonHoverText} transition-all duration-200 flex items-center gap-2 font-medium relative group`}
                >
                  <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-coral-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            {/* Actions Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`px-4 py-2 rounded-lg ${isTransparent ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white hover:shadow-lg'} transition-all duration-300 flex items-center gap-2 font-medium`}
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden xl:inline">{profile?.full_name?.split(' ')[0] || 'Compte'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-slide-down">
                      {/* En-tête profil */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {profile?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      {/* Menu items */}
                      {userMenuItems.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-terracotta-50 hover:text-terracotta-600 transition-all duration-200 group"
                        >
                          <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{item.label}</span>
                        </a>
                      ))}

                      {/* Déconnexion */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={signOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                        >
                          <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <a
                    href="/connexion"
                    className={`px-4 py-2 rounded-lg ${textColor} ${buttonHoverBg} ${buttonHoverText} transition-all duration-200 font-medium`}
                  >
                    Connexion
                  </a>
                  <a
                    href="/inscription"
                    className={`px-5 py-2 rounded-lg ${isTransparent ? 'bg-white text-terracotta-600 hover:bg-white/90' : 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white hover:shadow-lg'} transition-all duration-300 font-semibold`}
                  >
                    Inscription
                  </a>
                </>
              )}
            </div>

            {/* Menu Mobile Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2 rounded-lg ${buttonHoverBg} ${textColor} transition-all`}
              aria-label="Menu"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40 top-16 sm:top-20">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          ></div>

          {/* Menu Content */}
          <div className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl shadow-2xl p-6 max-h-[calc(100vh-5rem)] overflow-y-auto animate-slide-down">
            {/* Navigation */}
            <div className="space-y-1 mb-6">
              <a
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 hover:bg-terracotta-50 hover:text-terracotta-600 transition-all font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                <Home className="h-5 w-5" />
                <span>Accueil</span>
              </a>

              {mainNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 hover:bg-terracotta-50 hover:text-terracotta-600 transition-all font-medium relative"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-coral-500 text-white text-xs font-bold rounded-full px-2 py-1">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* User Section */}
            {user ? (
              <div className="border-t border-gray-200 pt-4 space-y-1">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {profile?.full_name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                {userMenuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-terracotta-50 hover:text-terracotta-600 transition-all"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}

                <button
                  onClick={() => {
                    signOut();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all mt-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <a
                  href="/connexion"
                  className="block w-full px-4 py-3 text-center rounded-lg border-2 border-terracotta-500 text-terracotta-600 font-semibold hover:bg-terracotta-50 transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Connexion
                </a>
                <a
                  href="/inscription"
                  className="block w-full px-4 py-3 text-center rounded-lg bg-gradient-to-r from-terracotta-500 to-coral-500 text-white font-semibold hover:shadow-lg transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Inscription
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
