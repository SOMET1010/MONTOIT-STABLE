import { MapPin, Bed, Bath, Home, Heart } from 'lucide-react';
import { PropertyCardSkeleton } from '@/shared/ui/Skeleton';
import type { Database } from '@/shared/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

interface SearchResultsProps {
  properties: Property[];
  loading: boolean;
  onPropertyClick?: (propertyId: string) => void;
}

export default function SearchResults({ properties, loading, onPropertyClick }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun bien trouvé</h3>
        <p className="text-gray-600 mb-6">
          Essayez de modifier vos critères de recherche pour voir plus de résultats.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        <span className="font-semibold">{properties.length}</span> bien{properties.length > 1 ? 's' : ''} trouvé{properties.length > 1 ? 's' : ''}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={() => onPropertyClick?.(property.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

function PropertyCard({ property, onClick }: PropertyCardProps) {
  const images = Array.isArray(property.images) ? property.images : [];
  const mainImage = images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
        {property.property_category === 'commercial' && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">
            Commercial
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Type */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {property.property_type}
          </span>
          {property.is_furnished && (
            <span className="text-xs text-gray-600">Meublé</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {property.neighborhood}, {property.city}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span>{property.area}m²</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {property.monthly_rent?.toLocaleString('fr-FR')} <span className="text-base">FCFA</span>
            </p>
            <p className="text-xs text-gray-500">par mois</p>
          </div>
        </div>
      </div>
    </div>
  );
}
