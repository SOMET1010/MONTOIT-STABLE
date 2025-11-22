import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import SearchFilters from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import VoiceSearch, { parseVoiceQuery } from '../components/VoiceSearch';
import { toast } from '@/shared/hooks/useToast';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyType = Database['public']['Tables']['properties']['Row']['property_type'];
type PropertyCategory = 'residentiel' | 'commercial';

export default function SearchPropertiesPageSimplified() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Utilisation de useLocalStorage pour persister les filtres
  const [searchCity, setSearchCity] = useLocalStorage('search_city', '');
  const [propertyType, setPropertyType] = useLocalStorage<PropertyType | ''>('property_type', '');
  const [propertyCategory, setPropertyCategory] = useLocalStorage<PropertyCategory | ''>('property_category', '');
  const [minPrice, setMinPrice] = useLocalStorage('min_price', '');
  const [maxPrice, setMaxPrice] = useLocalStorage('max_price', '');
  const [bedrooms, setBedrooms] = useLocalStorage('bedrooms', '');
  const [bathrooms, setBathrooms] = useLocalStorage('bathrooms', '');
  const [isFurnished, setIsFurnished] = useLocalStorage<boolean | null>('is_furnished', null);
  const [hasParking, setHasParking] = useLocalStorage<boolean | null>('has_parking', null);
  const [hasAC, setHasAC] = useLocalStorage<boolean | null>('has_ac', null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const category = params.get('category');
    const type = params.get('type');

    if (city) setSearchCity(city);
    if (category) setPropertyCategory(category as PropertyCategory);
    if (type) setPropertyType(type as PropertyType);

    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      if (maxPrice && parseFloat(maxPrice) > 0 && parseFloat(maxPrice) < 10000) {
        setProperties([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'disponible');

      if (propertyCategory && propertyCategory.trim() !== '') {
        query = query.eq('property_category', propertyCategory);
      } else {
        query = query.eq('property_category', 'residentiel');
      }

      if (searchCity && searchCity.trim() !== '' && searchCity !== 'Toutes les villes') {
        query = query.or(`city.ilike.%${searchCity}%,neighborhood.ilike.%${searchCity}%`);
      }

      if (propertyType && propertyType.trim() !== '') {
        query = query.eq('property_type', propertyType);
      }

      if (minPrice && parseFloat(minPrice) > 0) {
        query = query.gte('monthly_rent', parseFloat(minPrice));
      }

      if (maxPrice && parseFloat(maxPrice) > 0) {
        query = query.lte('monthly_rent', parseFloat(maxPrice));
      }

      if (bedrooms && parseInt(bedrooms) > 0) {
        query = query.gte('bedrooms', parseInt(bedrooms));
      }

      if (bathrooms && parseInt(bathrooms) > 0) {
        query = query.gte('bathrooms', parseInt(bathrooms));
      }

      if (isFurnished !== null) {
        query = query.eq('is_furnished', isFurnished);
      }

      if (hasParking !== null) {
        query = query.eq('has_parking', hasParking);
      }

      if (hasAC !== null) {
        query = query.eq('has_ac', hasAC);
      }

      query = query.order('created_at', { ascending: false }).limit(50);

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Erreur lors du chargement des propriétés', {
        description: 'Veuillez réessayer plus tard',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchCity('');
    setPropertyType('');
    setPropertyCategory('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setIsFurnished(null);
    setHasParking(null);
    setHasAC(null);
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/propriete/${propertyId}`);
  };

  const handleVoiceTranscript = (transcript: string) => {
    const parsed = parseVoiceQuery(transcript);

    if (parsed.city) setSearchCity(parsed.city);
    if (parsed.propertyType) setPropertyType(parsed.propertyType as PropertyType);
    if (parsed.bedrooms) setBedrooms(parsed.bedrooms.toString());
    if (parsed.maxPrice) setMaxPrice(parsed.maxPrice.toString());

    setTimeout(() => {
      loadProperties();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Rechercher un bien
              </h1>
              <p className="text-gray-600">
                Trouvez le logement idéal parmi nos {properties.length} biens disponibles
              </p>
            </div>
            <VoiceSearch onTranscript={handleVoiceTranscript} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SearchFilters
                searchCity={searchCity}
                setSearchCity={setSearchCity}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                propertyCategory={propertyCategory}
                setPropertyCategory={setPropertyCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                bathrooms={bathrooms}
                setBathrooms={setBathrooms}
                isFurnished={isFurnished}
                setIsFurnished={setIsFurnished}
                hasParking={hasParking}
                setHasParking={setHasParking}
                hasAC={hasAC}
                setHasAC={setHasAC}
                onSearch={loadProperties}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-3">
            <SearchResults
              properties={properties}
              loading={loading}
              onPropertyClick={handlePropertyClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
