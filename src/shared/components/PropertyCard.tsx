import { Home as HomeIcon, Star } from 'lucide-react';
import { FormatService } from '@/services/format/formatService';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyCardProps {
  property: Property;
  showBadge?: boolean;
  badgeText?: string;
}

export default function PropertyCard({ property, showBadge, badgeText }: PropertyCardProps) {
  return (
    <a
      href={`/propriete/${property.id}`}
      className="group block w-full sm:w-80 flex-shrink-0 card-premium hover-lift"
    >
      {/* Image */}
      <div className="relative h-64 sm:h-72 bg-gray-200 rounded-xl overflow-hidden mb-3 image-zoom shadow-premium group-hover:shadow-premium-hover transition-shadow duration-300">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <HomeIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 glass rounded-lg text-sm font-semibold text-gray-900 shadow-premium">
          {FormatService.formatPrice(property.price)}
        </div>

        {/* Optional Badge (Nouveau, etc.) */}
        {showBadge && badgeText && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold shadow-premium badge-pulse">
            {badgeText}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate flex-1">
            {property.city}, {property.neighborhood}
          </h3>
          {property.rating && (
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current text-gray-900" />
              <span className="text-xs sm:text-sm font-semibold">{property.rating}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-xs sm:text-sm truncate mb-1">
          {property.title}
        </p>
        
        <p className="text-gray-600 text-xs sm:text-sm">
          {property.bedrooms && `${property.bedrooms} ch.`}
          {property.bedrooms && property.bathrooms && ' · '}
          {property.bathrooms && `${property.bathrooms} sdb.`}
          {(property.bedrooms || property.bathrooms) && property.surface && ' · '}
          {property.surface && `${property.surface} m²`}
        </p>
      </div>
    </a>
  );
}
