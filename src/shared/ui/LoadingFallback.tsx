interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingFallback({
  message = 'Chargement...',
  fullScreen = true
}: LoadingFallbackProps) {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-4',
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
}
