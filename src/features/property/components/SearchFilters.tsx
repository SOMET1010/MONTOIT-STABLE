import { SlidersHorizontal, X, MapPin, Home, Bed, Bath, DollarSign, Sofa, ParkingCircle, Wind } from 'lucide-react';
import { useState } from 'react';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import type { Database } from '@/shared/lib/database.types';

type PropertyType = Database['public']['Tables']['properties']['Row']['property_type'];
type PropertyCategory = 'residentiel' | 'commercial';

interface SearchFiltersProps {
  searchCity: string;
  setSearchCity: (city: string) => void;
  propertyType: PropertyType | '';
  setPropertyType: (type: PropertyType | '') => void;
  propertyCategory: PropertyCategory | '';
  setPropertyCategory: (category: PropertyCategory | '') => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  bedrooms: string;
  setBedrooms: (beds: string) => void;
  bathrooms: string;
  setBathrooms: (baths: string) => void;
  isFurnished: boolean | null;
  setIsFurnished: (furnished: boolean | null) => void;
  hasParking: boolean | null;
  setHasParking: (parking: boolean | null) => void;
  hasAC: boolean | null;
  setHasAC: (ac: boolean | null) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function SearchFilters({
  searchCity,
  setSearchCity,
  propertyType,
  setPropertyType,
  propertyCategory,
  setPropertyCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  isFurnished,
  setIsFurnished,
  hasParking,
  setHasParking,
  hasAC,
  setHasAC,
  onSearch,
  onReset,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const ivoirianCities = [
    'Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'San-Pédro',
    'Korhogo', 'Man', 'Gagnoa', 'Abengourou', 'Agboville',
    'Cocody', 'Yopougon', 'Abobo', 'Plateau', 'Marcory',
    'Treichville', 'Koumassi', 'Port-Bouët', 'Adjamé', 'Attécoubé'
  ];

  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: 'appartement', label: 'Appartement' },
    { value: 'maison', label: 'Maison' },
    { value: 'villa', label: 'Villa' },
    { value: 'studio', label: 'Studio' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'bureau', label: 'Bureau' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'terrain', label: 'Terrain' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Filtres de recherche</h2>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
        >
          <X className="h-4 w-4" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* Filtres essentiels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Ville ou quartier
          </label>
          <select
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full px-4 py-3 min-h-[48px] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Toutes les villes</option>
            {ivoirianCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Type de propriété */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Home className="h-4 w-4 inline mr-1" />
            Type de bien
          </label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType | '')}
            className="w-full px-4 py-3 min-h-[48px] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Tous les types</option>
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prix minimum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Prix minimum (FCFA)
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Ex: 50000"
            className="w-full px-4 py-3 min-h-[48px] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Prix maximum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="h-4 w-4 inline mr-1" />
            Prix maximum (FCFA)
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Ex: 500000"
            className="w-full px-4 py-3 min-h-[48px] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Bouton filtres avancés */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>{showAdvanced ? 'Masquer' : 'Afficher'} les filtres avancés</span>
      </button>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chambres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bed className="h-4 w-4 inline mr-1" />
                Nombre de chambres minimum
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-4 py-3 min-h-[48px] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Indifférent</option>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'chambre' : 'chambres'}
                  </option>
                ))}
              </select>
            </div>

            {/* Salles de bain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bath className="h-4 w-4 inline mr-1" />
                Nombre de salles de bain minimum
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-4 py-3 min-h-[48px] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Indifférent</option>
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'salle de bain' : 'salles de bain'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Équipements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Équipements</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsFurnished(isFurnished === true ? null : true)}
                className={`px-4 py-2 rounded-xl border-2 transition-all min-h-[44px] ${
                  isFurnished === true
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Sofa className="h-4 w-4 inline mr-2" />
                Meublé
              </button>
              <button
                onClick={() => setHasParking(hasParking === true ? null : true)}
                className={`px-4 py-2 rounded-xl border-2 transition-all min-h-[44px] ${
                  hasParking === true
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <ParkingCircle className="h-4 w-4 inline mr-2" />
                Parking
              </button>
              <button
                onClick={() => setHasAC(hasAC === true ? null : true)}
                className={`px-4 py-2 rounded-xl border-2 transition-all min-h-[44px] ${
                  hasAC === true
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Wind className="h-4 w-4 inline mr-2" />
                Climatisation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton de recherche */}
      <Button
        onClick={onSearch}
        variant="primary"
        size="lg"
        fullWidth
        className="mt-4"
      >
        Rechercher
      </Button>
    </div>
  );
}
