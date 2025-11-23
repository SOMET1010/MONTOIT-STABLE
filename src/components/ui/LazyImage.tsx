import { lazy, Suspense } from 'react';
import { Building2 } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

// Composant de fallback pour le chargement
const ImageSkeleton: React.FC<{ width?: number; height?: number }> = ({
  width = 300,
  height = 200,
}) => (
  <div
    className="animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"
    style={{ width, height }}
  />
);

// Composant d'erreur
const ImageError: React.FC = () => (
  <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
    <Building2 className="w-8 h-8 text-gray-400" />
  </div>
);

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, width, height, className }) => {
  return (
    <Suspense fallback={<ImageSkeleton width={width} height={height} />}>
      <OptimizedImage src={src} alt={alt} width={width} height={height} className={className} />
    </Suspense>
  );
};

// Import dynamique du composant OptimizedImage
const OptimizedImage = lazy(() =>
  import('./OptimizedImage').then((module) => ({
    default: module.OptimizedImage,
  }))
);

export default LazyImage;
