import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { ButtonPremium } from '../atoms/ButtonPremium';
import { cn } from '@/shared/utils/cn';

export interface ImageGalleryPremiumProps {
  images: string[];
  alt?: string;
  layout?: 'grid' | 'masonry' | 'carousel';
  className?: string;
}

export const ImageGalleryPremium: React.FC<ImageGalleryPremiumProps> = ({
  images,
  alt = 'Property image',
  layout = 'grid',
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedIndex, zoomLevel]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
    setZoomLevel(1);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoomLevel(1);
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 1));
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-neutral-100 rounded-xl flex items-center justify-center">
        <p className="text-neutral-400">Aucune image disponible</p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn('relative', className)}>
        {layout === 'grid' && (
          <div className="grid grid-cols-4 gap-2">
            {/* Main image */}
            <div
              className="col-span-4 md:col-span-3 row-span-2 relative group cursor-pointer overflow-hidden rounded-xl"
              onClick={() => openLightbox(0)}
            >
              <img
                src={images[0]}
                alt={`${alt} 1`}
                className="w-full h-full object-cover aspect-[16/10] group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <Maximize2 className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  1 / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail images */}
            {images.slice(1, 5).map((image, index) => (
              <div
                key={index + 1}
                className="relative group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => openLightbox(index + 1)}
              >
                <img
                  src={image}
                  alt={`${alt} ${index + 2}`}
                  className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {/* Show "+X more" on last thumbnail */}
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{images.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* View all photos button */}
        {images.length > 1 && (
          <ButtonPremium
            variant="secondary"
            size="sm"
            leftIcon={<Maximize2 className="h-4 w-4" />}
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 left-4 z-10"
          >
            Voir toutes les photos ({images.length})
          </ButtonPremium>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white font-medium">
              {selectedIndex + 1} / {images.length}
            </div>
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 1}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="text-white text-sm min-w-[4rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Main image */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-32">
            <img
              src={images[selectedIndex]}
              alt={`${alt} ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Thumbnails strip */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedIndex(index);
                    setZoomLevel(1);
                  }}
                  className={cn(
                    'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                    selectedIndex === index
                      ? 'border-primary-500 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-75'
                  )}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs text-center">
            <p>← → pour naviguer • + - pour zoomer • ESC pour fermer</p>
          </div>
        </div>
      )}
    </>
  );
};

ImageGalleryPremium.displayName = 'ImageGalleryPremium';

// Hide scrollbar utility
const scrollbarHideStyles = `
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;

if (typeof document !== 'undefined') {
  const styleId = 'image-gallery-premium-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = scrollbarHideStyles;
    document.head.appendChild(style);
  }
}
