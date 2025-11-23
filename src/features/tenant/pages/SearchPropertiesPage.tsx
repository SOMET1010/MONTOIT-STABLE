import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import type { Database } from '@/shared/lib/database.types';
import {
  SearchBarPremium,
  FiltersPremium,
  PropertyCardPremium,
  toast,
  type FilterOption,
} from '@/shared/components/premium';
import { Loader2 } from 'lucide-react';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyType = Database['public']['Tables']['properties']['Row']['property_type'];

export default function SearchPropertiesPagePremium() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search & Filter States
  const [searchCity, setSearchCity] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [propertyCategory, setPropertyCategory] = useState<'residentiel' | 'commercial' | ''>('residentiel');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [isFurnished, setIsFurnished] = useState<boolean | null>(null);
  const [hasParking, setHasParking] = useState<boolean | null>(null);
  const [hasAC, setHasAC] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');

  // Results States
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load properties on mount and when filters change
  useEffect(() => {
    loadProperties();
    if (user) {
      loadFavorites();
    }
  }, [propertyType, propertyCategory, minPrice, maxPrice, bedrooms, bathrooms, isFurnished, hasParking, hasAC, sortBy, user]);

  // Load URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const category = params.get('category');
    const type = params.get('type');

    if (city) setSearchCity(city);
    if (category) setPropertyCategory(category as 'residentiel' | 'commercial');
    if (type) setPropertyType(type as PropertyType);
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible');

      // Category filter
      if (propertyCategory) {
        query = query.eq('property_category', propertyCategory);
      }

      // City filter
      if (searchCity && searchCity.trim() !== '') {
        query = query.or(`city.ilike.%${searchCity}%,neighborhood.ilike.%${searchCity}%`);
      }

      // Property type filter
      if (propertyType) {
        query = query.eq('property_type', propertyType);
      }

      // Price filters
      if (minPrice && parseFloat(minPrice) > 0) {
        query = query.gte('monthly_rent', parseFloat(minPrice));
      }
      if (maxPrice && parseFloat(maxPrice) > 0) {
        query = query.lte('monthly_rent', parseFloat(maxPrice));
      }

      // Bedrooms filter
      if (bedrooms) {
        query = query.gte('bedrooms', parseInt(bedrooms));
      }

      // Bathrooms filter
      if (bathrooms) {
        query = query.gte('bathrooms', parseInt(bathrooms));
      }

      // Amenities filters
      if (isFurnished !== null) {
        query = query.eq('is_furnished', isFurnished);
      }
      if (hasParking !== null) {
        query = query.eq('has_parking', hasParking);
      }
      if (hasAC !== null) {
        query = query.eq('has_ac', hasAC);
      }

      // Sorting
      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'price_asc') {
        query = query.order('monthly_rent', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('monthly_rent', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Erreur', 'Impossible de charger les propriétés');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map((f) => f.property_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchCity(value);
    loadProperties();
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    if (!user) {
      toast.warning('Connexion requise', 'Connectez-vous pour ajouter des favoris');
      return;
    }

    try {
      if (favorites.has(propertyId)) {
        // Remove from favorites
        await supabase
          .from('property_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });

        toast.success('Retiré des favoris', 'Propriété retirée de vos favoris');
      } else {
        // Add to favorites
        await supabase
          .from('property_favorites')
          .insert({
            user_id: user.id,
            property_id: propertyId,
          });

        setFavorites((prev) => new Set(prev).add(propertyId));
        toast.success('Ajouté aux favoris', 'Propriété ajoutée à vos favoris');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const handleShare = async (propertyId: string) => {
    const url = `${window.location.origin}/propriete/${propertyId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Propriété Mon Toit',
          url,
        });
        toast.success('Partagé', 'Lien copié avec succès');
      } catch (error) {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Lien copié', 'Le lien a été copié dans le presse-papiers');
      } catch (error) {
        toast.error('Erreur', 'Impossible de copier le lien');
      }
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/propriete/${propertyId}`);
  };

  const clearFilters = () => {
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setIsFurnished(null);
    setHasParking(null);
    setHasAC(null);
    toast.info('Filtres effacés', 'Tous les filtres ont été réinitialisés');
  };

  // Calculate active filters count
  const activeFiltersCount = [
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    isFurnished !== null,
    hasParking !== null,
    hasAC !== null,
  ].filter(Boolean).length;

  // Property types options
  const propertyTypes: FilterOption[] = [
    { label: 'Appartement', value: 'appartement' },
    { label: 'Maison individuelle', value: 'maison' },
    { label: 'Villa', value: 'villa' },
    { label: 'Studio', value: 'studio' },
    { label: 'Duplex', value: 'duplex' },
    { label: 'Chambre individuelle', value: 'chambre' },
  ];

  // Property categories options
  const propertyCategories: FilterOption[] = [
    { label: 'Résidentiel', value: 'residentiel' },
    { label: 'Commercial', value: 'commercial' },
  ];

  // Sort options
  const sortOptions: FilterOption[] = [
    { label: 'Plus récent', value: 'recent' },
    { label: 'Prix croissant', value: 'price_asc' },
    { label: 'Prix décroissant', value: 'price_desc' },
  ];

  // Popular cities for search suggestions
  const popularCities = [
    'Abidjan',
    'Cocody',
    'Plateau',
    'Marcory',
    'Yopougon',
    'Abobo',
    'Adjamé',
    'Bouaké',
    'Yamoussoukro',
    'San-Pédro',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Rechercher un logement</h1>
          <p className="text-primary-100 text-lg">
            Trouvez votre logement idéal parmi {properties.length} propriétés disponibles
          </p>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Bar */}
          <div className="lg:col-span-4">
            <SearchBarPremium
              value={searchCity}
              onChange={setSearchCity}
              onSearch={handleSearch}
              placeholder="Où cherchez-vous ? (Ville, quartier...)"
              popularSearches={popularCities}
              isLoading={loading}
            />
          </div>

          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FiltersPremium
              propertyType={propertyType}
              propertyTypes={propertyTypes}
              onPropertyTypeChange={setPropertyType}
              propertyCategory={propertyCategory}
              propertyCategories={propertyCategories}
              onPropertyCategoryChange={setPropertyCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              bedrooms={bedrooms}
              onBedroomsChange={setBedrooms}
              bathrooms={bathrooms}
              onBathroomsChange={setBathrooms}
              isFurnished={isFurnished}
              hasParking={hasParking}
              hasAC={hasAC}
              onAmenitiesChange={(amenity, value) => {
                if (amenity === 'furnished') setIsFurnished(value);
                if (amenity === 'parking') setHasParking(value);
                if (amenity === 'ac') setHasAC(value);
              }}
              sortBy={sortBy}
              sortOptions={sortOptions}
              onSortChange={(value) => setSortBy(value as typeof sortBy)}
              onClearAll={clearFilters}
              onApply={loadProperties}
              activeFiltersCount={activeFiltersCount}
              defaultExpanded={true}
            />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                {loading ? (
                  'Chargement...'
                ) : (
                  <>
                    {properties.length} propriété{properties.length > 1 ? 's' : ''} trouvée{properties.length > 1 ? 's' : ''}
                  </>
                )}
              </h2>
              {searchCity && (
                <p className="text-neutral-600 mt-1">
                  à <span className="font-semibold text-primary-600">{searchCity}</span>
                </p>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
              </div>
            )}

            {/* Empty State */}
            {!loading && properties.length === 0 && (
              <div className="text-center py-20">
                <div className="text-neutral-400 mb-4">
                  <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Aucune propriété trouvée
                </h3>
                <p className="text-neutral-600 mb-6">
                  Essayez de modifier vos critères de recherche
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Results Grid */}
            {!loading && properties.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <PropertyCardPremium
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    location={`${property.city}${property.neighborhood ? `, ${property.neighborhood}` : ''}`}
                    price={property.monthly_rent}
                    currency="FCFA"
                    images={property.main_image ? [property.main_image] : []}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    area={property.area}
                    isVerified={property.is_verified || false}
                    isNew={false}
                    isFeatured={false}
                    isFavorite={favorites.has(property.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onShare={handleShare}
                    onClick={handlePropertyClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
