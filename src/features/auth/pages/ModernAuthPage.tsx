/**
 * ModernAuthPage - Nouvelle Expérience d'Authentification 2025
 * Mon Toit - Flow Simplifié et Design Moderne
 * 
 * Flow : Téléphone → OTP → [Si nouveau: Profil] → Terminé
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { PhoneInputV2 } from '@/shared/components/modern/PhoneInputV2';
import { OTPInput } from '@/shared/components/modern/OTPInput';
import { supabase } from '@/services/supabase/client';

type Step = 'phone' | 'otp' | 'profile' | 'success';
type UserRole = 'locataire' | 'proprietaire';

export default function ModernAuthPage() {
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('locataire');
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  // Timer pour renvoyer le code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Étape 1 : Envoyer OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Valider le numéro
      const numbers = phone.replace(/\D/g, '');
      if (numbers.length !== 12 || !numbers.startsWith('225')) {
        setError('Numéro de téléphone invalide');
        setLoading(false);
        return;
      }

      const cleanPhone = `+${numbers}`;

      // Vérifier si l'utilisateur existe
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('phone', cleanPhone)
        .single();

      setIsNewUser(!profileData);

      // Envoyer le code OTP
      const { error: otpError } = await supabase.functions.invoke('send-verification-code', {
        body: {
          phone: cleanPhone,
          type: 'sms',
          name: profileData?.full_name || 'Utilisateur',
          isLogin: !!profileData
        }
      });

      if (otpError) {
        setError('Erreur lors de l\'envoi du code. Réessayez.');
        setLoading(false);
        return;
      }

      setStep('otp');
      setResendTimer(60);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Vérifier OTP
  const handleVerifyOTP = async (code: string) => {
    if (code.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = `+${cleanPhone}`;

      // Vérifier le code OTP
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-otp-code', {
        body: {
          phone: formattedPhone,
          code: code
        }
      });

      if (verifyError || !verifyData?.valid) {
        setError('Code invalide. Réessayez.');
        setOtp('');
        setLoading(false);
        return;
      }

      // Si utilisateur existant, connexion directe
      if (!isNewUser) {
        // Récupérer le profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', formattedPhone)
          .single();

        if (profileData) {
          // Connexion réussie
          setStep('success');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      } else {
        // Nouvel utilisateur → compléter le profil
        setStep('profile');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError('Erreur de vérification. Réessayez.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  // Étape 3 : Créer le profil
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = `+${cleanPhone}`;

      // Créer le compte Supabase
      const tempPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
      const tempEmail = email || `${cleanPhone.replace(/^225/, '')}@temp.montoit.ci`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: fullName,
            phone: formattedPhone,
            role: role,
            auth_method: 'sms'
          }
        }
      });

      if (authError) {
        setError('Erreur lors de la création du compte. Réessayez.');
        setLoading(false);
        return;
      }

      // Inscription réussie
      setStep('success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Create profile error:', err);
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le code
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setError('');
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = `+${cleanPhone}`;

      const { error: otpError } = await supabase.functions.invoke('send-verification-code', {
        body: {
          phone: formattedPhone,
          type: 'sms',
          name: 'Utilisateur',
          isLogin: !isNewUser
        }
      });

      if (otpError) {
        setError('Erreur lors de l\'envoi du code.');
        setLoading(false);
        return;
      }

      setResendTimer(60);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">Mon Toit</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Illustration / Info */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl p-12 shadow-xl">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Trouvez votre logement idéal en Côte d'Ivoire
                </h2>
                <ul className="space-y-4">
                  {[
                    'Vérification ANSUT garantie',
                    'Paiement sécurisé',
                    'Support 24/7',
                    'Contrats numériques'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-lg text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Auth Form */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl">
              {/* Step: Phone */}
              {step === 'phone' && (
                <div className="animate-fade-in">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Bienvenue !
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Entrez votre numéro pour vous connecter ou créer un compte
                  </p>

                  <form onSubmit={handleSendOTP} className="space-y-6">
                    <PhoneInputV2
                      value={phone}
                      onChange={setPhone}
                      error={error}
                      autoFocus
                    />

                    <button
                      type="submit"
                      disabled={loading || phone.replace(/\D/g, '').length !== 12}
                      className="w-full py-4 px-6 bg-primary text-white rounded-2xl font-semibold text-lg
                        hover:bg-primary-hover active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Envoi...</span>
                        </>
                      ) : (
                        <span>Continuer →</span>
                      )}
                    </button>

                    <p className="text-sm text-gray-500 text-center">
                      En continuant, vous acceptez nos{' '}
                      <a href="/cgu" className="text-primary hover:underline">CGU</a>
                      {' '}et{' '}
                      <a href="/confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>
                    </p>
                  </form>
                </div>
              )}

              {/* Step: OTP */}
              {step === 'otp' && (
                <div className="animate-fade-in">
                  <button
                    onClick={() => setStep('phone')}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Retour</span>
                  </button>

                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Vérification
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Code envoyé par SMS au<br />
                    <span className="font-semibold">{phone}</span>
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerifyOTP}
                    disabled={loading}
                    error={!!error}
                    autoFocus
                  />

                  <div className="mt-6 text-center">
                    {resendTimer > 0 ? (
                      <p className="text-gray-500">
                        Renvoyer le code dans {resendTimer}s
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-primary hover:underline font-semibold disabled:opacity-50"
                      >
                        Renvoyer le code
                      </button>
                    )}
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-gray-700">
                      <strong>Pas reçu ?</strong>
                      <br />• Vérifiez vos messages
                      <br />• Attendez quelques secondes
                      <br />• Renvoyez le code
                    </p>
                  </div>
                </div>
              )}

              {/* Step: Profile */}
              {step === 'profile' && (
                <div className="animate-fade-in">
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-green-800 font-semibold">Numéro vérifié !</span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dernière étape
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Complétez votre profil
                  </p>

                  <form onSubmit={handleCreateProfile} className="space-y-6">
                    {/* Nom complet */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Prénom Nom"
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl
                          focus:outline-none focus:ring-4 focus:ring-primary-light focus:border-primary
                          text-lg transition-all"
                      />
                    </div>

                    {/* Rôle */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Je suis...
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'locataire', label: 'Locataire' },
                          { value: 'proprietaire', label: 'Propriétaire' }
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setRole(option.value as UserRole)}
                            className={`
                              p-4 rounded-2xl border-2 font-semibold text-lg transition-all
                              ${role === option.value
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                              }
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Email (optionnel) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-gray-500 font-normal">(optionnel)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl
                          focus:outline-none focus:ring-4 focus:ring-primary-light focus:border-primary
                          text-lg transition-all"
                      />
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !fullName}
                      className="w-full py-4 px-6 bg-primary text-white rounded-2xl font-semibold text-lg
                        hover:bg-primary-hover active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Création...</span>
                        </>
                      ) : (
                        <span>Terminer →</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Step: Success */}
              {step === 'success' && (
                <div className="animate-fade-in text-center py-12">
                  <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isNewUser ? 'Compte créé !' : 'Connexion réussie !'}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {isNewUser ? 'Bienvenue sur Mon Toit !' : `Bienvenue ${fullName || 'à nouveau'} !`}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Redirection...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
