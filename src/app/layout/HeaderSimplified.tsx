import { Search, PlusCircle, MessageCircle, User, Menu, X, Bell, Heart, Calendar, FileText, Building2, LogOut, Shield, Settings, Award, Wrench } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useMessageNotifications } from '@/features/messaging';
import LanguageSelector from '@/shared/ui/LanguageSelector';
import { useState } from 'react';

export default function HeaderSimplified() {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useMessageNotifications();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Navigation principale (4 items max)
  const mainNav = [
    {
      label: 'Rechercher',
      href: '/recherche',
      icon: Search,
      color: 'blue',
      description: 'Trouver votre logement idéal'
    },
    {
      label: 'Publier',
      href: '/ajouter-propriete',
      icon: PlusCircle,
      color: 'green',
      description: 'Publier une annonce',
      requiresAuth: true
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: MessageCircle,
      color: 'purple',
      badge: unreadCount,
      description: 'Vos conversations',
      requiresAuth: true
    }
  ];

  // Menu utilisateur (dans dropdown)
  const userMenuItems = [
    { label: 'Mon Profil', href: '/profil', icon: User },
    { label: 'Mes Favoris', href: '/favoris', icon: Heart },
    { label: 'Mes Visites', href: '/mes-visites', icon: Calendar },
    { label: 'Mes Contrats', href: '/mes-contrats', icon: FileText },
    { label: 'Notifications', href: '/notifications/preferences', icon: Bell },
    ...(profile?.user_type === 'locataire' ? [
      { label: 'Mon Score', href: '/locataire/score', icon: Award }
    ] : []),
    ...(profile?.user_type === 'proprietaire' || profile?.user_type === 'agence' ? [
      { label: 'Mes Propriétés', href: '/proprietaire/mes-proprietes', icon: Building2 }
    ] : []),
    { label: 'Paramètres', href: '/profil', icon: Settings },
    { label: 'Vérification ANSUT', href: '/verification', icon: Shield },
  ];

  const colorClasses = {
    blue: 'hover:bg-blue-50 hover:text-blue-700',
    green: 'hover:bg-green-50 hover:text-green-700',
    purple: 'hover:bg-purple-50 hover:text-purple-700',
    gray: 'hover:bg-gray-100 hover:text-gray-900'
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <img
              src="/logo-montoit.png"
              alt="Mon Toit"
              className="h-10 w-10 transform group-hover:scale-105 transition-transform duration-200"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-blue-600">Mon Toit</span>
              <span className="text-xs text-gray-500">Plateforme Immobilière</span>
            </div>
          </a>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {mainNav.map((item) => {
              // Masquer les items nécessitant auth si pas connecté
              if (item.requiresAuth && !user) return null;

              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    text-gray-700 font-medium transition-all duration-200
                    ${colorClasses[item.color]}
                    relative
                  `}
                  title={item.description}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Actions Droite */}
          <div className="flex items-center space-x-3">
            {/* Sélecteur de langue */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>

            {/* Menu Utilisateur */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    text-gray-700 font-medium transition-all duration-200
                    ${colorClasses.gray}
                  `}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden lg:inline">{profile?.full_name?.split(' ')[0] || 'Mon Compte'}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {/* En-tête utilisateur */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    {/* Items du menu */}
                    <div className="py-2">
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Icon className="h-4 w-4 text-gray-400" />
                            <span>{item.label}</span>
                          </a>
                        );
                      })}
                    </div>

                    {/* Déconnexion */}
                    <div className="border-t border-gray-200 pt-2">
                      <button
                        onClick={signOut}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/connexion"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Connexion
                </a>
                <a
                  href="/inscription"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Inscription
                </a>
              </div>
            )}

            {/* Menu Mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {/* Navigation principale */}
            {mainNav.map((item) => {
              if (item.requiresAuth && !user) return null;
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </a>
              );
            })}

            {/* Menu utilisateur mobile */}
            {user && (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Mon Compte
                  </div>
                </div>
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Icon className="h-5 w-5 text-gray-400" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
                <button
                  onClick={() => {
                    signOut();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </>
            )}

            {/* Langue */}
            <div className="border-t border-gray-200 mt-2 pt-2 px-4">
              <LanguageSelector />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
