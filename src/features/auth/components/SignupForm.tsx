import { useState } from 'react';
import { Building2, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, Info, MessageCircle, AlertTriangle } from 'lucide-react';

interface SignupFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  verificationType: 'email' | 'sms' | 'whatsapp';
  setVerificationType: (type: 'email' | 'sms' | 'whatsapp') => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  passwordStrength: { score: number; message: string; color: string };
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
}

export default function SignupForm({
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  phone,
  setPhone,
  verificationType,
  setVerificationType,
  showPassword,
  setShowPassword,
  passwordStrength,
  error,
  loading,
  onSubmit,
  onToggleMode,
}: SignupFormProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta-100 rounded-full mb-4">
          <Building2 className="w-8 h-8 text-terracotta-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h2>
        <p className="text-gray-600">
          Rejoignez la plateforme immobilière de confiance en Côte d'Ivoire
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Nom complet */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500"
              placeholder="Jean Dupont"
              required
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Téléphone */}
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

        {/* Mot de passe */}
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
              placeholder="Min 8 caractères"
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
          {password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`h-1 flex-1 rounded-full bg-gray-200`}>
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Type de vérification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Méthode de vérification
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="email"
                checked={verificationType === 'email'}
                onChange={(e) => setVerificationType(e.target.value as 'email')}
                className="text-terracotta-600 focus:ring-terracotta-500"
              />
              <Mail className="w-5 h-5 ml-3 mr-2 text-gray-400" />
              <span className="text-sm font-medium">Email</span>
              <CheckCircle className="w-4 h-4 ml-auto text-green-500" />
            </label>
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="sms"
                checked={verificationType === 'sms'}
                onChange={(e) => setVerificationType(e.target.value as 'sms')}
                className="text-terracotta-600 focus:ring-terracotta-500"
              />
              <Phone className="w-5 h-5 ml-3 mr-2 text-gray-400" />
              <span className="text-sm font-medium">SMS</span>
            </label>
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="whatsapp"
                checked={verificationType === 'whatsapp'}
                onChange={(e) => setVerificationType(e.target.value as 'whatsapp')}
                className="text-terracotta-600 focus:ring-terracotta-500"
              />
              <MessageCircle className="w-5 h-5 ml-3 mr-2 text-gray-400" />
              <span className="text-sm font-medium">WhatsApp</span>
            </label>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading || passwordStrength.score < 2}
          className="w-full bg-terracotta-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-terracotta-600 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Création du compte...
            </div>
          ) : (
            'Créer mon compte'
          )}
        </button>

        {/* Informations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Vérification requise</p>
              <p>
                Un code de vérification sera envoyé pour confirmer votre identité avant de pouvoir utiliser la plateforme.
              </p>
            </div>
          </div>
        </div>

        {/* Lien vers connexion */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Déjà un compte ?</span>{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-terracotta-600 hover:text-terracotta-700 font-medium"
          >
            Se connecter
          </button>
        </div>
      </form>
    </div>
  );
}