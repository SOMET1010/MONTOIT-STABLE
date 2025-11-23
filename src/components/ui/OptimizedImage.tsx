import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  useEffect(() => {
    // Generate optimized image URL with parameters
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', '80'); // Quality
    params.set('f', 'webp'); // Format preference
    
    const optimizedSrc = `${src}?${params.toString()}`;
    setCurrentSrc(optimizedSrc);
  }, [src, width, height]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && !error && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" 
          style={{ 
            width: width || '100%', 
            height: height || 'auto' 
          }}
        />
      )}
      
      {/* Main image with WebP support */}
      <picture>
        <source 
          srcSet={`${src}?format=webp&w=${width}&h=${height}&q=80`} 
          type="image/webp" 
        />
        <source 
          srcSet={`${src}?format=avif&w=${width}&h=${height}&q=80`} 
          type="image/avif" 
        />
        <img
          src={currentSrc || `${src}?w=${width}&h=${height}&q=80`}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      </picture>
      
      {/* Error fallback */}
      {error && (
        <div className="flex items-center justify-center bg-gray-100" style={{ 
          width: width || '100%', 
          height: height || '300px' 
        }}>
          <Building2 className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};