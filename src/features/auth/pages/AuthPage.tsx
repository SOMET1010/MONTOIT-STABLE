import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import { Building2, Mail, Lock, User, UserCircle, Sparkles, Shield, CheckCircle, Chrome, Facebook, KeyRound, ArrowLeft, Phone, AlertTriangle, Info, MessageCircle } from 'lucide-react';
import { PhoneInput } from '@/shared/components/PhoneInput';

export default function Auth() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [isLogin, setIsLogin] = useState(currentPath === '/connexion');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationType, setVerificationType] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '' });

  const { signIn, signUp, signInWithProvider, resetPassword } = useAuth();

  const validatePassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

    if (score <= 2) {
      return { score, message: 'Mot de passe faible', color: 'text-red-600', valid: false };
    } else if (score === 3 || score === 4) {
      return { score, message: 'Mot de passe moyen', color: 'text-amber-600', valid: hasMinLength };
    } else {
      return { score, message: 'Mot de passe fort', color: 'text-olive-600', valid: true };
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!email) {
          setError('Veuillez entrer votre adresse email');
          setLoading(false);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        const { error } = await resetPassword(email);
        if (error) {
          if (error.message?.includes('Aucun compte')) {
            setError('Aucun compte associé à cette adresse email. Veuillez vérifier votre email ou créer un compte.');
          } else {
            setError(error.message || 'Erreur lors de l\'envoi du lien de réinitialisation');
          }
          return;
        }
        setSuccess('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception (et vos spams).');
        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLogin(true);
          setSuccess('');
        }, 5000);
      } else if (isLogin) {
        // Connexion par téléphone avec OTP
        if (loginMethod === 'phone') {
          if (!phone) {
            setError('Veuillez entrer votre numéro de téléphone');
            return;
          }

          if (!validatePhone(phone)) {
            setError('Numéro de téléphone invalide. Format: +225 XX XX XX XX XX');
            return;
          }

          // Vérifier si l'utilisateur existe avec ce numéro
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, phone, full_name')
            .eq('phone', phone)
            .single();

          if (profileError || !profileData) {
            setError('Aucun compte trouvé avec ce numéro de téléphone. Veuillez vous inscrire.');
            return;
          }

          // Envoyer le code OTP
          try {
            const otpType = verificationType === 'email' ? 'sms' : verificationType;
            const { data: otpData, error: otpError } = await supabase.functions.invoke('send-verification-code', {
              body: {
                phone: phone,
                type: otpType,
                name: profileData.full_name,
                isLogin: true
              }
            });

            if (otpError) {
              console.error('OTP send error:', otpError);
              setError('Erreur lors de l\'envoi du code de vérification. Veuillez réessayer.');
              return;
            }

            const methodName = otpType === 'whatsapp' ? 'WhatsApp' : 'SMS';
            setSuccess(`Code de vérification envoyé par ${methodName}`);
            
            // Rediriger vers la page de vérification OTP
            setTimeout(() => {
              navigate('/verification-otp', {
                state: {
                  phone: phone,
                  type: otpType,
                  name: profileData.full_name,
                  isLogin: true
                }
              });
            }, 1500);
          } catch (otpErr: any) {
            console.error('OTP error:', otpErr);
            setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
          }
        } else {
          // Connexion classique par email + mot de passe
          const { error } = await signIn(email, password);
          if (error) throw error;

          const pendingAction = sessionStorage.getItem('pendingAction');
          if (pendingAction) {
            try {
              const action = JSON.parse(pendingAction);
              sessionStorage.removeItem('pendingAction');
              if (action.action === 'apply') {
                window.location.href = `/candidature/${action.propertyId}`;
              } else if (action.action === 'visit') {
                window.location.href = `/visiter/${action.propertyId}`;
              } else {
                window.location.href = '/';
              }
            } catch (e) {
              window.location.href = '/';
            }
          } else {
            window.location.href = '/';
          }
        }
      } else {
        // Validation email uniquement si inscription par email
        if (verificationType === 'email') {
          if (!email || !validateEmail(email)) {
            setError('Adresse email invalide. Veuillez entrer une adresse email valide.');
            return;
          }
        }

        // Validation téléphone uniquement si inscription par SMS/WhatsApp
        if (verificationType === 'sms' || verificationType === 'whatsapp') {
          if (!phone || !validatePhone(phone)) {
            setError('Numéro de téléphone invalide. Format: +225 XX XX XX XX XX');
            return;
          }
        }

        // Pour SMS/WhatsApp, pas besoin de mot de passe
        if (verificationType === 'email') {
          const pwdValidation = validatePassword(password);
          if (!pwdValidation.valid) {
            setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
            return;
          }
          
          const { error } = await signUp(email, password, { full_name: fullName, phone: phone || '' });
          if (error) {
            console.error('Signup error:', error);
            if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
              setError('Cet email est déjà utilisé. Connectez-vous.');
            } else if (error.message?.includes('Database error')) {
              setError('Erreur de base de données. Veuillez réessayer ou contacter le support.');
            } else {
              setError(error.message || 'Erreur lors de l\'inscription');
            }
            return;
          }
        } else {
          // Inscription par SMS/WhatsApp - créer un compte sans mot de passe
          // Générer un mot de passe temporaire aléatoire (non communiqué à l'utilisateur)
          const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
          const tempEmail = email || `${phone.replace(/\+/g, '').replace(/\s/g, '')}@temp.montoit.ci`;
          
          const { error } = await signUp(tempEmail, tempPassword, { 
            full_name: fullName, 
            phone: phone,
            auth_method: verificationType // Marquer la méthode d'authentification
          });
          if (error) {
            console.error('Signup error:', error);
            if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
              setError('Ce numéro est déjà utilisé. Connectez-vous.');
            } else if (error.message?.includes('Database error')) {
              setError('Erreur de base de données. Veuillez réessayer ou contacter le support.');
            } else {
              setError(error.message || 'Erreur lors de l\'inscription');
            }
            return;
          }
        }
        
        // Envoyer le code OTP
        const finalVerificationType = verificationType;
        const finalEmail = verificationType === 'email' ? email : undefined;
        const finalPhone = (verificationType === 'sms' || verificationType === 'whatsapp') ? phone : undefined;
        
        try {
          const { data: otpData, error: otpError } = await supabase.functions.invoke('send-verification-code', {
            body: {
              email: finalEmail,
              phone: finalPhone,
              type: finalVerificationType,
              name: fullName
            }
          });

          if (otpError) {
            console.error('OTP send error:', otpError);
            setError('Inscription réussie mais erreur d\'envoi du code de vérification. Veuillez vous reconnecter.');
            return;
          }

          const methodName = finalVerificationType === 'email' ? 'email' : finalVerificationType === 'whatsapp' ? 'WhatsApp' : 'SMS';
          setSuccess(`Inscription réussie ! Code de vérification envoyé par ${methodName}`);
          
          // Rediriger vers la page de vérification OTP
          setTimeout(() => {
            navigate('/verify-otp', {
              state: {
                email: finalEmail,
                phone: finalPhone,
                type: finalVerificationType,
                name: fullName
              }
            });
          }, 1500);
        } catch (otpErr: any) {
          console.error('OTP error:', otpErr);
          setError('Inscription réussie mais erreur d\'envoi du code. Veuillez vous reconnecter.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion sociale');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen custom-cursor relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-terracotta-400 via-coral-300 to-amber-300" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-olive-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="absolute top-10 right-10 text-white/30 transform rotate-12 text-9xl font-bold animate-float">★</div>
      <div className="absolute bottom-20 left-20 text-white/30 transform -rotate-12 text-7xl font-bold animate-bounce-subtle">♥</div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:block text-white space-y-8 animate-slide-down">
            <div className="flex items-center space-x-4">
              <img
                src="/logo.png"
                alt="Mon Toit Logo"
                className="h-24 w-24 object-contain drop-shadow-2xl"
              />
              <span className="text-5xl font-bold">MON TOIT</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Votre logement idéal vous attend
            </h1>

            <p className="text-2xl text-amber-100">
              Rejoignez des milliers d'utilisateurs qui ont trouvé leur chez-soi
            </p>

            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-olive-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Sécurité et Protection</h3>
                  <p className="text-amber-100 text-sm">Vos données sont protégées</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">100% Sécurisé</h3>
                  <p className="text-amber-100 text-sm">Paiements et contrats protégés</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-coral-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Accès Universel</h3>
                  <p className="text-amber-100 text-sm">Un logement pour tous</p>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-scale-in">
            <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <img
                    src="/logo.png"
                    alt="Mon Toit Logo"
                    className="h-14 w-14 object-contain"
                  />
                  <span className="text-3xl font-bold" style={{ color: '#1e3a8a' }}>MON TOIT</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 mb-4 bg-gradient-to-r from-terracotta-100 to-coral-100 px-4 py-2 rounded-full">
                  <Sparkles className="h-4 w-4 text-terracotta-600" />
                  <span className="text-sm font-semibold text-terracotta-700">Plateforme immobilière</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {isForgotPassword ? 'Récupération' : isLogin ? 'Bienvenue !' : 'Créez votre compte'}
                </h2>
                <p className="text-gray-600">
                  {isForgotPassword
                    ? 'Recevez un lien de réinitialisation par email'
                    : isLogin
                    ? 'Connectez-vous pour continuer'
                    : 'Rejoignez la communauté Mon Toit'
                  }
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-coral-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-medium animate-slide-down">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-gradient-to-r from-olive-50 to-cyan-50 border-2 border-olive-200 rounded-2xl text-olive-700 text-sm font-medium animate-slide-down">
                  {success}
                </div>
              )}

              {isLogin && !isForgotPassword && (
                <>
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl animate-slide-down">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Connexion flexible</p>
                        <p className="text-xs leading-relaxed">
                          Connectez-vous avec votre <span className="font-semibold">email + mot de passe</span> ou recevez un <span className="font-semibold">code OTP par téléphone</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 animate-slide-down" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Méthode de connexion
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('email')}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          loginMethod === 'email'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <Mail className={`h-6 w-6 mx-auto mb-2 ${
                          loginMethod === 'email' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-xs font-semibold ${
                          loginMethod === 'email' ? 'text-blue-700' : 'text-gray-600'
                        }`}>Email + Mot de passe</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginMethod('phone')}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          loginMethod === 'phone'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <Phone className={`h-6 w-6 mx-auto mb-2 ${
                          loginMethod === 'phone' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-xs font-semibold ${
                          loginMethod === 'phone' ? 'text-blue-700' : 'text-gray-600'
                        }`}>Téléphone + OTP</p>
                      </button>
                    </div>
                  </div>

                  {loginMethod === 'phone' && (
                    <div className="mb-6 animate-slide-down" style={{ animationDelay: '0.15s' }}>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Méthode d'envoi OTP
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setVerificationType('sms')}
                          className={`p-3 rounded-2xl border-2 transition-all ${
                            verificationType === 'sms'
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 bg-white hover:border-cyan-300'
                          }`}
                        >
                          <Phone className={`h-5 w-5 mx-auto mb-1 ${
                            verificationType === 'sms' ? 'text-cyan-600' : 'text-gray-400'
                          }`} />
                          <p className={`text-xs font-semibold ${
                            verificationType === 'sms' ? 'text-cyan-700' : 'text-gray-600'
                          }`}>SMS</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVerificationType('whatsapp')}
                          className={`p-3 rounded-2xl border-2 transition-all ${
                            verificationType === 'whatsapp'
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 bg-white hover:border-cyan-300'
                          }`}
                        >
                          <MessageCircle className={`h-5 w-5 mx-auto mb-1 ${
                            verificationType === 'whatsapp' ? 'text-cyan-600' : 'text-gray-400'
                          }`} />
                          <p className={`text-xs font-semibold ${
                            verificationType === 'whatsapp' ? 'text-cyan-700' : 'text-gray-600'
                          }`}>WhatsApp</p>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!isLogin && !isForgotPassword && (
                <>
                  <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl animate-slide-down">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-cyan-800">
                        <p className="font-semibold mb-1">Inscription flexible avec vérification</p>
                        <p className="text-xs leading-relaxed">
                          Choisissez votre méthode de vérification : <span className="font-semibold">Email, SMS ou WhatsApp</span>.
                          Un code de vérification sera envoyé pour valider votre compte.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 animate-slide-down" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Méthode de vérification
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setVerificationType('email')}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          verificationType === 'email'
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-gray-200 bg-white hover:border-cyan-300'
                        }`}
                      >
                        <Mail className={`h-6 w-6 mx-auto mb-2 ${
                          verificationType === 'email' ? 'text-cyan-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-xs font-semibold ${
                          verificationType === 'email' ? 'text-cyan-700' : 'text-gray-600'
                        }`}>Email</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationType('sms')}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          verificationType === 'sms'
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-gray-200 bg-white hover:border-cyan-300'
                        }`}
                      >
                        <Phone className={`h-6 w-6 mx-auto mb-2 ${
                          verificationType === 'sms' ? 'text-cyan-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-xs font-semibold ${
                          verificationType === 'sms' ? 'text-cyan-700' : 'text-gray-600'
                        }`}>SMS</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationType('whatsapp')}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          verificationType === 'whatsapp'
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-gray-200 bg-white hover:border-cyan-300'
                        }`}
                      >
                        <MessageCircle className={`h-6 w-6 mx-auto mb-2 ${
                          verificationType === 'whatsapp' ? 'text-cyan-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-xs font-semibold ${
                          verificationType === 'whatsapp' ? 'text-cyan-700' : 'text-gray-600'
                        }`}>WhatsApp</p>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && !isForgotPassword && (
                  <>
                    <div className="animate-slide-down">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-terracotta-500" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all bg-white/70"
                          placeholder="Votre nom complet"
                        />
                      </div>
                    </div>

                    <div className="animate-slide-down" style={{ animationDelay: '0.05s' }}>
                      <PhoneInput
                        value={phone}
                        onChange={setPhone}
                        required={verificationType === 'sms' || verificationType === 'whatsapp'}
                        label={`Numéro de téléphone${(verificationType !== 'sms' && verificationType !== 'whatsapp') ? ' (optionnel)' : ''}`}
                        autoValidate={true}
                      />
                    </div>
                  </>
                )}

                {/* Champ Téléphone pour connexion par téléphone */}
                {isLogin && loginMethod === 'phone' && (
                  <div className="animate-slide-down" style={{ animationDelay: '0.2s' }}>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      required={true}
                      label="Numéro de téléphone"
                      autoValidate={true}
                    />
                  </div>
                )}

                {/* Champ Email pour connexion par email ou inscription */}
                {(!isLogin || loginMethod === 'email') && (
                  <div className="animate-slide-down" style={{ animationDelay: isLogin ? '0s' : '0.15s' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email {!isLogin && verificationType !== 'email' && <span className="text-gray-500 text-xs font-normal">(optionnel)</span>}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-terracotta-500" />
                      <input
                        type="email"
                        required={(isLogin && loginMethod === 'email') || (!isLogin && verificationType === 'email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all bg-white/70"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                )}

                {/* Mot de passe uniquement pour Email ou connexion par email */}
                {!isForgotPassword && (!isLogin || loginMethod === 'email') && (isLogin || verificationType === 'email') && (
                  <div className="animate-slide-down" style={{ animationDelay: isLogin ? '0.1s' : '0.2s' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-terracotta-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (!isLogin && e.target.value) {
                            setPasswordStrength(validatePassword(e.target.value));
                          }
                        }}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-terracotta-200 focus:border-terracotta-500 transition-all bg-white/70"
                        placeholder="••••••••"
                        minLength={8}
                      />
                    </div>
                    {!isLogin && password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                passwordStrength.score <= 2 ? 'bg-red-500' :
                                passwordStrength.score <= 4 ? 'bg-amber-500' :
                                'bg-olive-500'
                              }`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                            {passwordStrength.message}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className={password.length >= 8 ? 'text-olive-600' : 'text-gray-400'}>✓</span>
                            <span>Au moins 8 caractères</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={/[A-Z]/.test(password) ? 'text-olive-600' : 'text-gray-400'}>✓</span>
                            <span>Une majuscule</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={/[a-z]/.test(password) ? 'text-olive-600' : 'text-gray-400'}>✓</span>
                            <span>Une minuscule</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={/[0-9]/.test(password) ? 'text-olive-600' : 'text-gray-400'}>✓</span>
                            <span>Un chiffre</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-olive-600' : 'text-gray-400'}>✓</span>
                            <span>Un caractère spécial</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isLogin && !isForgotPassword && loginMethod === 'email' && (
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                        setSuccess('');
                      }}
                      className="text-sm text-terracotta-600 hover:text-terracotta-700 font-semibold transition-colors hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Chargement...</span>
                    </span>
                  ) : isForgotPassword ? (
                    <span className="flex items-center justify-center space-x-2">
                      <KeyRound className="w-5 h-5" />
                      <span>Envoyer le lien</span>
                    </span>
                  ) : isLogin ? (
                    loginMethod === 'phone' ? 'Recevoir le code OTP' : 'Se connecter'
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </form>

              {isForgotPassword && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setIsLogin(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="inline-flex items-center space-x-2 text-terracotta-600 hover:text-terracotta-700 font-bold text-sm transform hover:scale-105 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour à la connexion</span>
                  </button>
                </div>
              )}

              {!isForgotPassword && import.meta.env.VITE_ENABLE_SOCIAL_AUTH === 'true' && (
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">ou continuer avec</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                    >
                      <Chrome className="w-5 h-5" />
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin('facebook')}
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                    >
                      <Facebook className="w-5 h-5" />
                      <span>Facebook</span>
                    </button>
                  </div>

                  <div className="mt-6 text-center">
                    <a
                      href={isLogin ? '/inscription' : '/connexion'}
                      className="text-terracotta-600 hover:text-terracotta-700 font-bold text-sm transform hover:scale-105 transition-all inline-block"
                    >
                      {isLogin ? "Pas de compte ? Inscrivez-vous gratuitement" : "Déjà un compte ? Connectez-vous"}
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
