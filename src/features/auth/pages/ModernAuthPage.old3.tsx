/**
 * ModernAuthPageNew - Authentification Moderne 2025
 * Inspiré de Airbnb, Google, LinkedIn
 * 
 * Features:
 * - Onglets Connexion/Inscription
 * - Email + Mot de passe (standard)
 * - Validation en temps réel
 * - Loading states clairs
 * - Messages d'erreur visibles
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/services/supabase/client';

type Tab = 'login' | 'register' | 'phone';
type PhoneStep = 'enter' | 'verify';

export default function ModernAuthPageNew() {
  const navigate = useNavigate();
  
  // State
  const [tab, setTab] = useState<Tab>('login');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Phone auth fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [sendMethod, setSendMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [resendTimer, setResendTimer] = useState(0);

  // Validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10;
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateEmail(loginEmail)) {
        setError('Email invalide');
        setLoading(false);
        return;
      }

      if (!validatePassword(loginPassword)) {
        setError('Mot de passe trop court (minimum 6 caractères)');
        setLoading(false);
        return;
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (loginError) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      // Success
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!registerName.trim()) {
        setError('Nom complet requis');
        setLoading(false);
        return;
      }

      if (!validateEmail(registerEmail)) {
        setError('Email invalide');
        setLoading(false);
        return;
      }

      if (!validatePhone(registerPhone)) {
        setError('Numéro de téléphone invalide');
        setLoading(false);
        return;
      }

      if (!validatePassword(registerPassword)) {
        setError('Mot de passe trop court (minimum 6 caractères)');
        setLoading(false);
        return;
      }

      if (registerPassword !== registerConfirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      // Create account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: registerName,
            phone: registerPhone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Success
      alert('Compte créé ! Vérifiez votre email pour confirmer votre compte.');
      setTab('login');
      setLoginEmail(registerEmail);
    } catch (err: any) {
      console.error('Register error:', err);
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-orange-600" />
            <span className="text-3xl font-bold text-gray-900">Mon Toit</span>
          </div>
          <p className="text-gray-600">Trouvez votre logement idéal en Côte d'Ivoire</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => {
                setTab('login');
                setError('');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'login'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => {
                setTab('phone');
                setError('');
                setPhoneStep('enter');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'phone'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Téléphone
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'register'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/mot-de-passe-oublie')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Phone Form */}
          {tab === 'phone' && (
            <div className="space-y-5">
              {phoneStep === 'enter' ? (
                <div className="space-y-5">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion par téléphone</h2>
                    <p className="text-gray-600">Entrez votre numéro pour recevoir un code</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+225 07 XX XX XX XX"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Send Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Recevoir le code par :
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSendMethod('sms')}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                          sendMethod === 'sms'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📱 SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMethod('whatsapp')}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                          sendMethod === 'whatsapp'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={() => {
                      if (phoneNumber.replace(/\D/g, '').length >= 10) {
                        setPhoneStep('verify');
                        setResendTimer(60);
                        // TODO: Appeler l'API pour envoyer le code
                      } else {
                        setError('Numéro de téléphone invalide');
                      }
                    }}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Envoyer le code</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Entrez le code</h2>
                    <p className="text-gray-600">
                      Code envoyé par {sendMethod === 'sms' ? 'SMS' : 'WhatsApp'} au<br />
                      <span className="font-medium text-gray-900">{phoneNumber}</span>
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code de vérification
                    </label>
                    <input
                      type="text"
                      value={phoneOTP}
                      onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-center text-2xl font-mono tracking-widest"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  {/* Resend */}
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-gray-500">
                        Renvoyer le code dans {resendTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setResendTimer(60);
                          // TODO: Renvoyer le code
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Renvoyer le code
                      </button>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={() => {
                      if (phoneOTP.length === 6) {
                        // TODO: Vérifier le code et connecter
                        navigate('/');
                      } else {
                        setError('Code invalide');
                      }
                    }}
                    disabled={loading || phoneOTP.length !== 6}
                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Vérifier et se connecter</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  {/* Back */}
                  <button
                    type="button"
                    onClick={() => setPhoneStep('enter')}
                    className="w-full text-sm text-gray-600 hover:text-gray-900"
                  >
                    ← Changer de numéro
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Jean Kouassi"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="+225 07 XX XX XX XX"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-center text-gray-500">
                En créant un compte, vous acceptez nos{' '}
                <a href="/conditions-utilisation" className="text-orange-600 hover:underline">
                  Conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="/politique-confidentialite" className="text-orange-600 hover:underline">
                  Politique de confidentialité
                </a>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Besoin d'aide ?{' '}
          <a href="mailto:support@montoit.ci" className="text-orange-600 hover:underline font-medium">
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
}
