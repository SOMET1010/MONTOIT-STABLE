/**
 * ModernAuthPage - Authentification Premium 2025
 * 3 onglets: Email, Téléphone, Inscription
 * Design harmonisé terracotta
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/services/supabase/client';

type Tab = 'email' | 'phone' | 'register';
type PhoneStep = 'enter' | 'verify';

export default function ModernAuthPage() {
  const navigate = useNavigate();

  // State
  const [tab, setTab] = useState<Tab>('email');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone Auth
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sendMethod, setSendMethod] = useState<'sms' | 'whatsapp'>('sms');
  const [resendTimer, setResendTimer] = useState(0);

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Email Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-auth-otp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            method: sendMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du code');
      }

      setSuccess(`Code envoyé par ${sendMethod === 'sms' ? 'SMS' : 'WhatsApp'}`);
      setPhoneStep('verify');
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-auth-otp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            code: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code invalide');
      }

      if (data.action === 'login') {
        // Existing user - use magic link
        window.location.href = data.sessionUrl;
      } else {
        // New user - show registration form
        setSuccess('Téléphone vérifié ! Complétez votre inscription.');
        setTab('register');
        setRegPhone(phoneNumber);
      }
    } catch (err: any) {
      setError(err.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (regPassword !== regConfirm) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (regPassword.length < 6) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regName,
            phone: regPhone,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess('Compte créé ! Connectez-vous avec votre email.');
      setTimeout(() => {
        setTab('email');
        setEmail(regEmail);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-terracotta-50 to-coral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-terracotta-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-terracotta-600 to-coral-600 bg-clip-text text-transparent">
              Mon Toit
            </span>
          </div>
          <p className="text-gray-600">Trouvez votre logement idéal en Côte d'Ivoire</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-scale-in">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => { setTab('email'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'email'
                  ? 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => { setTab('phone'); setError(''); setSuccess(''); setPhoneStep('enter'); }}
              className={`flex-1 py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'phone'
                  ? 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Téléphone
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 px-2 rounded-xl font-semibold text-sm transition-all ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-terracotta-500 to-coral-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium animate-slide-down">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm font-medium animate-slide-down">
              {success}
            </div>
          )}

          {/* EMAIL TAB */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all"
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

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/mot-de-passe-oublie')}
                  className="text-sm text-terracotta-600 hover:text-terracotta-700 font-semibold"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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

          {/* PHONE TAB */}
          {tab === 'phone' && (
            <div className="space-y-5">
              {phoneStep === 'enter' ? (
                <>
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion par téléphone</h2>
                    <p className="text-gray-600">Entrez votre numéro pour recevoir un code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+225 07 XX XX XX XX"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Recevoir le code par :</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSendMethod('sms')}
                        className={`py-4 px-4 rounded-xl border-2 font-semibold transition-all ${
                          sendMethod === 'sms'
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 shadow-md'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        📱 SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendMethod('whatsapp')}
                        className={`py-4 px-4 rounded-xl border-2 font-semibold transition-all ${
                          sendMethod === 'whatsapp'
                            ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700 shadow-md'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}
                    className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <span>Envoyer le code</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Entrez le code</h2>
                    <p className="text-gray-600">
                      Code envoyé par {sendMethod === 'sms' ? 'SMS' : 'WhatsApp'} au
                      <br />
                      <span className="font-bold text-gray-900">{phoneNumber}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                      Code de vérification
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all text-center text-3xl font-mono tracking-[0.5em]"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-gray-500 font-medium">
                        Renvoyer dans <span className="text-terracotta-600 font-bold">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="text-sm text-terracotta-600 hover:text-terracotta-700 font-bold"
                      >
                        Renvoyer le code
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Vérification...</span>
                      </>
                    ) : (
                      <>
                        <span>Vérifier et se connecter</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep('enter');
                      setOtp('');
                      setError('');
                    }}
                    className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Changer de numéro
                  </button>
                </>
              )}
            </div>
          )}

          {/* REGISTER TAB */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jean Kouassi"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+225 07 XX XX XX XX"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all"
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-terracotta-500 focus:ring-4 focus:ring-terracotta-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-terracotta-600 to-coral-600 text-white rounded-xl font-bold text-lg hover:from-terracotta-700 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Inscription...</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <button
            onClick={() => navigate('/')}
            className="hover:text-terracotta-600 font-medium transition-colors"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
