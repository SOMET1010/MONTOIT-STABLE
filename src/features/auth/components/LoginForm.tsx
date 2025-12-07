import { useState } from 'react';
import { Building2, Mail, Lock, Phone, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
  onForgotPassword: () => void;
  loading: boolean;
  error: string;
  loginType: 'email' | 'phone';
  setLoginType: (type: 'email' | 'phone') => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  isLogin,
  onToggleMode,
  onForgotPassword,
  loading,
  error,
  loginType,
  setLoginType,
  email,
  setEmail,
  password,
  setPassword,
  phone,
  setPhone,
  showPassword,
  setShowPassword,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta-100 rounded-full mb-4">
          <Building2 className="w-8 h-8 text-terracotta-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Connexion' : 'Inscription'}
        </h2>
        <p className="text-gray-600">
          {isLogin
            ? 'Connectez-vous à votre espace MON TOIT'
            : 'Créez votre compte pour commencer'
          }
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Type de connexion */}
        {isLogin && (
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginType('email')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginType('phone')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Téléphone
            </button>
          </div>
        )}

        {/* Champ Email/Téléphone */}
        {loginType === 'email' ? (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                placeholder="nom@exemple.com"
                required
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
                placeholder="+225 XX XX XX XX XX"
                required
              />
            </div>
          </div>
        )}

        {/* Champ Mot de passe */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Lien mot de passe oublié */}
        {isLogin && loginType === 'email' && (
          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-terracotta-600 hover:text-terracotta-700 font-medium"
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-terracotta-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-terracotta-600 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isLogin ? 'Connexion...' : 'Inscription...'}
            </div>
          ) : (
            isLogin ? 'Se connecter' : 'Créer mon compte'
          )}
        </button>

        {/* Lien changement de mode */}
        <div className="text-center text-sm">
          <span className="text-gray-600">
            {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
          </span>{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-terracotta-600 hover:text-terracotta-700 font-medium"
          >
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </button>
        </div>
      </form>
    </div>
  );
}