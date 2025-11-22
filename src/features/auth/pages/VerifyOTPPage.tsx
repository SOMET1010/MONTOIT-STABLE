import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Phone, AlertCircle, CheckCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import { supabase } from '@/services/supabase/client';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, phone, type, name } = location.state || {};

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email && !phone) {
      navigate('/inscription');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, phone, navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split('').forEach((char, idx) => {
      if (idx < 6) newCode[idx] = char;
    });
    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex((c) => !c);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Veuillez entrer le code complet');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: {
          email: type === 'email' ? email : undefined,
          phone: type === 'sms' ? phone : undefined,
          code: fullCode,
          type: type || 'email'
        }
      });

      if (error) throw error;

      if (data.success) {
        setSuccess('Vérification réussie !');
        setTimeout(() => {
          navigate('/choix-profil');
        }, 1500);
      } else {
        setError(data.error || 'Code incorrect');
        if (data.attemptsRemaining !== undefined) {
          setError(`${data.error}. ${data.attemptsRemaining} tentative(s) restante(s)`);
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: type === 'email' ? email : undefined,
          phone: type === 'sms' ? phone : undefined,
          type: type || 'email',
          name: name
        }
      });

      if (error) throw error;

      if (data.success) {
        setSuccess('Nouveau code envoyé !');
        setTimeLeft(600);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      setError('Erreur lors du renvoi du code');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-cyan-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>

        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-bounce-subtle">
              {type === 'email' ? (
                <Mail className="h-10 w-10 text-white" />
              ) : type === 'whatsapp' ? (
                <MessageCircle className="h-10 w-10 text-white" />
              ) : (
                <Phone className="h-10 w-10 text-white" />
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Vérification {type === 'email' ? 'Email' : type === 'whatsapp' ? 'WhatsApp' : 'SMS'}
            </h2>
            <p className="text-gray-600">
              Un code à 6 chiffres a été envoyé à
            </p>
            <p className="text-cyan-600 font-semibold mt-1">
              {type === 'email' ? email : phone}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl flex items-start space-x-3 animate-slide-down">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl flex items-start space-x-3 animate-slide-down">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center space-x-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 transition-all bg-white"
                  disabled={loading}
                />
              ))}
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Code valide pendant {formatTime(timeLeft)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Vérification...</span>
                </span>
              ) : (
                'Vérifier'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              onClick={handleResend}
              disabled={resending || timeLeft > 540}
              className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Envoi en cours...' : 'Renvoyer le code'}</span>
            </button>
            {timeLeft > 540 && (
              <p className="text-xs text-gray-500 mt-2">
                Disponible dans {Math.ceil((timeLeft - 540) / 60)} minute(s)
              </p>
            )}
          </div>

          <div className="mt-8 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold mb-1">Conseils de sécurité :</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Ne partagez jamais ce code</li>
                  <li>Mon Toit ne vous demandera jamais ce code par téléphone</li>
                  <li>Le code expire après 10 minutes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
