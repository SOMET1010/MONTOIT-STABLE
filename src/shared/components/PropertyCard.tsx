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
      <div className="relative h-64 sm:h-72 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-3 image-zoom shadow-premium group-hover:shadow-premium-hover transition-shadow duration-300">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <HomeIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg text-sm font-bold text-terracotta-600 dark:text-terracotta-400 shadow-lg">
          {FormatService.formatCurrency(property.monthly_rent || 0)}/mois
        </div>

        {/* Optional Badge (Nouveau, etc.) */}
        {showBadge && badgeText && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-bold shadow-lg animate-pulse">
            {badgeText}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate flex-1">
            {property.city}, {property.neighborhood}
          </h3>
          {property.rating && (
            <div className="flex items-center gap-1 ml-2 flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{property.rating}</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate mb-2">
          {property.title}
        </p>

        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
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
