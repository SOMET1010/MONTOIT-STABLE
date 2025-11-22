import React, { useState } from 'react';
import { Heart, Share2, Eye, MapPin, Bed, Bath, Maximize2, Calendar } from 'lucide-react';
import { CardPremium } from '../atoms/CardPremium';
import { BadgePremium, ANSUTBadge, NewBadge, FeaturedBadge } from '../atoms/BadgePremium';
import { ButtonPremium } from '../atoms/ButtonPremium';
import { cn } from '@/shared/utils/cn';

export interface PropertyCardPremiumProps {
  id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  isVerified?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  availableFrom?: string;
  onFavoriteToggle?: (id: string) => void;
  onShare?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

export const PropertyCardPremium: React.FC<PropertyCardPremiumProps> = ({
  id,
  title,
  location,
  price,
  currency = 'FCFA',
  images,
  bedrooms,
  bathrooms,
  area,
  isVerified = false,
  isNew = false,
  isFeatured = false,
  isFavorite = false,
  availableFrom,
  onFavoriteToggle,
  onShare,
  onClick,
  className,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  const mainImage = images[currentImageIndex] || images[0] || '/placeholder-property.jpg';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalIsFavorite(!localIsFavorite);
    onFavoriteToggle?.(id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(id);
  };

  const handleCardClick = () => {
    onClick?.(id);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <CardPremium
      variant="glass"
      hover="lift"
      padding="none"
      className={cn('cursor-pointer group', className)}
      onClick={handleCardClick}
    >
      {/* Image container */}
      <div
        className="relative h-56 overflow-hidden rounded-t-lg"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        {/* Main image */}
        <img
          src={mainImage}
          alt={title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            isImageHovered && 'scale-110'
          )}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges - Top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isVerified && <ANSUTBadge size="sm" />}
          {isFeatured && <FeaturedBadge size="sm" />}
          {isNew && <NewBadge size="sm" />}
        </div>

        {/* Quick actions - Top right */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleFavoriteClick}
            className={cn(
              'p-2 rounded-full backdrop-blur-md transition-all duration-200',
              localIsFavorite
                ? 'bg-primary-500 text-white'
                : 'bg-white/80 text-neutral-700 hover:bg-white'
            )}
            aria-label={localIsFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart
              className={cn('h-5 w-5', localIsFavorite && 'fill-current')}
            />
          </button>
          <button
            onClick={handleShareClick}
            className="p-2 rounded-full bg-white/80 backdrop-blur-md text-neutral-700 hover:bg-white transition-all duration-200"
            aria-label="Partager"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Image navigation dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  index === currentImageIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Price tag - Bottom right */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full">
          <p className="text-primary-600 font-bold text-lg">
            {formatPrice(price)} {currency}
            <span className="text-xs text-neutral-600 font-normal">/mois</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-neutral-600 mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm line-clamp-1">{location}</p>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-neutral-600 mb-3">
          {bedrooms !== undefined && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              <span className="text-sm">{bedrooms}</span>
            </div>
          )}
          {bathrooms !== undefined && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              <span className="text-sm">{bathrooms}</span>
            </div>
          )}
          {area !== undefined && (
            <div className="flex items-center gap-1.5">
              <Maximize2 className="h-4 w-4" />
              <span className="text-sm">{area}m²</span>
            </div>
          )}
        </div>

        {/* Available from */}
        {availableFrom && (
          <div className="flex items-center gap-1.5 text-neutral-500 mb-3">
            <Calendar className="h-4 w-4" />
            <p className="text-xs">Disponible dès le {availableFrom}</p>
          </div>
        )}

        {/* CTA Button */}
        <ButtonPremium
          variant="primary"
          size="md"
          fullWidth
          leftIcon={<Eye className="h-4 w-4" />}
          className="mt-2"
        >
          Voir les détails
        </ButtonPremium>
      </div>
    </CardPremium>
  );
};

PropertyCardPremium.displayName = 'PropertyCardPremium';
