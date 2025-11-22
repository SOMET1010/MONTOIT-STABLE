import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '@/services/supabase/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '' });

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant');
      setValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.rpc('validate_reset_token', { p_token: token });

      if (error) throw error;

      if (!data || data.length === 0 || !data[0].valid) {
        setError('Ce lien de réinitialisation est invalide ou expiré');
        setTokenValid(false);
      } else {
        setTokenValid(true);
      }
    } catch (err: any) {
      console.error('Token validation error:', err);
      setError('Erreur lors de la validation du lien');
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

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
      return { score, message: 'Mot de passe fort', color: 'text-green-600', valid: true };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.valid) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const { data: tokenData, error: tokenError } = await supabase.rpc('validate_reset_token', { p_token: token });

      if (tokenError || !tokenData || tokenData.length === 0 || !tokenData[0].valid) {
        setError('Ce lien de réinitialisation est invalide ou expiré');
        return;
      }

      const userId = tokenData[0].user_id;

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: password }
      );

      if (updateError) throw updateError;

      const { error: markUsedError } = await supabase.rpc('mark_token_used', { p_token: token });

      if (markUsedError) {
        console.error('Error marking token as used:', markUsedError);
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/connexion');
      }, 3000);

    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-300 to-indigo-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Validation du lien...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && !validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-300 to-red-300 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lien invalide ou expiré</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.'}
            </p>
            <button
              onClick={() => navigate('/mot-de-passe-oublie')}
              className="btn-primary w-full"
            >
              Demander un nouveau lien
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen custom-cursor relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-300 to-indigo-300" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <button
          onClick={() => navigate('/connexion')}
          className="mb-6 flex items-center space-x-2 text-white hover:text-cyan-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold">Retour à la connexion</span>
        </button>

        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl">
          {!success ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-bounce-subtle">
                  <Lock className="h-10 w-10 text-white" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Nouveau mot de passe
                </h2>
                <p className="text-gray-600">
                  Créez un mot de passe sécurisé pour votre compte
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl flex items-start space-x-3 animate-slide-down">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordStrength(validatePassword(e.target.value));
                      }}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 transition-all bg-white/70"
                      placeholder="••••••••"
                      minLength={8}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.score <= 2 ? 'bg-red-500' :
                              passwordStrength.score <= 4 ? 'bg-amber-500' :
                              'bg-green-500'
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
                          <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>✓</span>
                          <span>Au moins 8 caractères</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>✓</span>
                          <span>Une majuscule</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>✓</span>
                          <span>Une minuscule</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>✓</span>
                          <span>Un chiffre</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-400'}>✓</span>
                          <span>Un caractère spécial</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 transition-all bg-white/70"
                      placeholder="••••••••"
                      minLength={8}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-xs text-red-600 font-medium">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                  className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Réinitialisation...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <Lock className="w-5 h-5" />
                      <span>Réinitialiser le mot de passe</span>
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-1">Conseils de sécurité :</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Utilisez un mot de passe unique pour chaque service</li>
                      <li>N'utilisez pas d'informations personnelles</li>
                      <li>Changez votre mot de passe régulièrement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 animate-scale-in">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Mot de passe réinitialisé !
                </h3>
                <p className="text-gray-600">
                  Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion...
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
