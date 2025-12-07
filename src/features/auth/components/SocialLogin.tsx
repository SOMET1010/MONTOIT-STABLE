import { Chrome, Facebook } from 'lucide-react';

interface SocialLoginProps {
  onProviderLogin: (provider: 'google' | 'facebook') => void;
  loading: boolean;
}

export default function SocialLogin({ onProviderLogin, loading }: SocialLoginProps) {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => onProviderLogin('google')}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Chrome className="w-5 h-5 mr-2" />
          Google
        </button>

        <button
          onClick={() => onProviderLogin('facebook')}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Facebook className="w-5 h-5 mr-2 text-blue-600" />
          Facebook
        </button>
      </div>
    </div>
  );
}