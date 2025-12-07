import { useState, useEffect, useRef } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  loading = 'lazy',
  objectFit = 'cover'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Déterminer les sources d'image optimisées
  const getOptimizedSrcs = () => {
    // Si le src commence par /optimized/ ou http, l'utiliser directement
    if (src.startsWith('/optimized/') || src.startsWith('http')) {
      const baseSrc = src.replace(/\.(webp|png|jpg|jpeg)$/i, '');
      return {
        webp: `${baseSrc}.webp`,
        webp2x: `${baseSrc}@2x.webp`,
        webp05x: `${baseSrc}@0.5x.webp`,
        placeholder: src.includes('placeholder') ? src : `${baseSrc}-placeholder.webp`,
        fallback: `${baseSrc}.webp`
      };
    }

    // Sinon, chercher dans le dossier optimized
    const baseSrc = src.replace(/^\/+/, '').replace(/\.(webp|png|jpg|jpeg)$/i, '');
    return {
      webp: `/optimized/${baseSrc}.webp`,
      webp2x: `/optimized/${baseSrc}@2x.webp`,
      webp05x: `/optimized/${baseSrc}@0.5x.webp`,
      placeholder: `/optimized/${baseSrc}-placeholder.webp`,
      fallback: src // Utiliser l'original si l'optimisé n'existe pas
    };
  };

  const { webp, webp2x, webp05x, placeholder, fallback } = getOptimizedSrcs();

  useEffect(() => {
    if (priority) {
      setCurrentSrc(webp);
      return;
    }

    // Implémenter le chargement différé avec Intersection Observer
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentSrc(webp);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [webp, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setShowPlaceholder(false);
  };

  const handleError = () => {
    setError(true);
    setShowPlaceholder(false);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder flou pendant le chargement */}
      {showPlaceholder && !error && (
        <div className="absolute inset-0 -z-10">
          <img
            src={placeholder}
            alt=""
            className="w-full h-full object-cover blur-lg scale-110 opacity-50"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        </div>
      )}

      {/* Image principale avec support WebP et srcset */}
      <picture>
        {/* Sources pour différentes densités */}
        <source
          srcSet={`${webp05x} 1x, ${webp} 2x, ${webp2x} 3x`}
          media="(max-width: 400px)"
          type="image/webp"
        />
        <source
          srcSet={`${webp} 1x, ${webp2x} 2x`}
          type="image/webp"
        />

        {/* Image de fallback */}
        <img
          ref={imgRef}
          src={currentSrc || fallback}
          srcSet={currentSrc ? `${currentSrc} 1x, ${webp2x} 2x` : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          className={cn(
            'transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            'w-full h-full'
          )}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
        />
      </picture>

      {/* Skeleton de chargement */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Erreur fallback */}
      {error && (
        <div className="flex items-center justify-center bg-gray-100 w-full h-full">
          <Building2 className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};