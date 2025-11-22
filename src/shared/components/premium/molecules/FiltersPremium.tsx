import React, { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ButtonPremium } from '../atoms/ButtonPremium';
import { BadgePremium } from '../atoms/BadgePremium';
import { cn } from '@/shared/utils/cn';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FiltersPremiumProps {
  // Property type
  propertyType?: string;
  propertyTypes?: FilterOption[];
  onPropertyTypeChange?: (value: string) => void;

  // Property category
  propertyCategory?: string;
  propertyCategories?: FilterOption[];
  onPropertyCategoryChange?: (value: string) => void;

  // Price range
  minPrice?: string;
  maxPrice?: string;
  onPriceChange?: (min: string, max: string) => void;

  // Bedrooms
  bedrooms?: string;
  onBedroomsChange?: (value: string) => void;

  // Bathrooms
  bathrooms?: string;
  onBathroomsChange?: (value: string) => void;

  // Amenities
  isFurnished?: boolean | null;
  hasParking?: boolean | null;
  hasAC?: boolean | null;
  onAmenitiesChange?: (amenity: string, value: boolean | null) => void;

  // Sort
  sortBy?: string;
  sortOptions?: FilterOption[];
  onSortChange?: (value: string) => void;

  // Actions
  onClearAll?: () => void;
  onApply?: () => void;

  // Active filters count
  activeFiltersCount?: number;

  // Collapsible
  defaultExpanded?: boolean;
  className?: string;
}

export const FiltersPremium: React.FC<FiltersPremiumProps> = ({
  propertyType = '',
  propertyTypes = [],
  onPropertyTypeChange,
  propertyCategory = '',
  propertyCategories = [],
  onPropertyCategoryChange,
  minPrice = '',
  maxPrice = '',
  onPriceChange,
  bedrooms = '',
  onBedroomsChange,
  bathrooms = '',
  onBathroomsChange,
  isFurnished = null,
  hasParking = null,
  hasAC = null,
  onAmenitiesChange,
  sortBy = 'recent',
  sortOptions = [],
  onSortChange,
  onClearAll,
  onApply,
  activeFiltersCount = 0,
  defaultExpanded = true,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    type: true,
    price: true,
    rooms: true,
    amenities: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClearAll = () => {
    onClearAll?.();
  };

  const handleApply = () => {
    onApply?.();
  };

  return (
    <div className={cn('bg-white/80 backdrop-blur-md rounded-xl border border-neutral-200 shadow-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-neutral-900">Filtres</h3>
          {activeFiltersCount > 0 && (
            <BadgePremium variant="info" size="sm">
              {activeFiltersCount}
            </BadgePremium>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Tout effacer
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-neutral-100 transition-colors"
            aria-label={isExpanded ? 'Réduire' : 'Développer'}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-neutral-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-600" />
            )}
          </button>
        </div>
      </div>

      {/* Filters content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Property Category */}
          {propertyCategories.length > 0 && (
            <FilterSection
              title="Catégorie"
              isExpanded={expandedSections.type}
              onToggle={() => toggleSection('type')}
            >
              <div className="grid grid-cols-2 gap-2">
                {propertyCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => onPropertyCategoryChange?.(category.value)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      propertyCategory === category.value
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    )}
                  >
                    {category.label}
                    {category.count !== undefined && (
                      <span className="ml-1 text-xs opacity-75">({category.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Property Type */}
          {propertyTypes.length > 0 && (
            <FilterSection
              title="Type de bien"
              isExpanded={expandedSections.type}
              onToggle={() => toggleSection('type')}
            >
              <div className="space-y-2">
                {propertyTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value={type.value}
                      checked={propertyType === type.value}
                      onChange={(e) => onPropertyTypeChange?.(e.target.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="flex-1 text-sm text-neutral-900">{type.label}</span>
                    {type.count !== undefined && (
                      <span className="text-xs text-neutral-500">({type.count})</span>
                    )}
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Price Range */}
          <FilterSection
            title="Budget mensuel"
            isExpanded={expandedSections.price}
            onToggle={() => toggleSection('price')}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Min (FCFA)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => onPriceChange?.(e.target.value, maxPrice)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Max (FCFA)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => onPriceChange?.(minPrice, e.target.value)}
                    placeholder="∞"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>
              {/* Quick price buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '< 100K', max: '100000' },
                  { label: '100K-200K', min: '100000', max: '200000' },
                  { label: '200K-500K', min: '200000', max: '500000' },
                  { label: '> 500K', min: '500000' },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => onPriceChange?.(range.min || '', range.max || '')}
                    className="px-3 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Rooms */}
          <FilterSection
            title="Chambres & Salles de bain"
            isExpanded={expandedSections.rooms}
            onToggle={() => toggleSection('rooms')}
          >
            <div className="space-y-4">
              {/* Bedrooms */}
              <div>
                <label className="block text-xs text-neutral-600 mb-2">Chambres</label>
                <div className="flex gap-2">
                  {['', '1', '2', '3', '4', '5+'].map((num) => (
                    <button
                      key={num || 'any'}
                      onClick={() => onBedroomsChange?.(num)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        bedrooms === num
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      )}
                    >
                      {num || 'Tous'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-xs text-neutral-600 mb-2">Salles de bain</label>
                <div className="flex gap-2">
                  {['', '1', '2', '3+'].map((num) => (
                    <button
                      key={num || 'any'}
                      onClick={() => onBathroomsChange?.(num)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        bathrooms === num
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      )}
                    >
                      {num || 'Tous'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Amenities */}
          <FilterSection
            title="Équipements"
            isExpanded={expandedSections.amenities}
            onToggle={() => toggleSection('amenities')}
          >
            <div className="space-y-2">
              <ToggleOption
                label="Meublé"
                value={isFurnished}
                onChange={(value) => onAmenitiesChange?.('furnished', value)}
              />
              <ToggleOption
                label="Parking"
                value={hasParking}
                onChange={(value) => onAmenitiesChange?.('parking', value)}
              />
              <ToggleOption
                label="Climatisation"
                value={hasAC}
                onChange={(value) => onAmenitiesChange?.('ac', value)}
              />
            </div>
          </FilterSection>

          {/* Sort */}
          {sortOptions.length > 0 && (
            <FilterSection title="Trier par" isExpanded={true} onToggle={() => {}}>
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterSection>
          )}

          {/* Apply button */}
          <ButtonPremium
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleApply}
          >
            Appliquer les filtres
          </ButtonPremium>
        </div>
      )}
    </div>
  );
};

// Filter Section Component
interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => (
  <div className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full mb-3 group"
    >
      <h4 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
        {title}
      </h4>
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
      ) : (
        <ChevronDown className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
      )}
    </button>
    {isExpanded && <div>{children}</div>}
  </div>
);

// Toggle Option Component
interface ToggleOptionProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
    <span className="text-sm text-neutral-900">{label}</span>
    <div className="flex gap-1">
      <button
        onClick={() => onChange(value === true ? null : true)}
        className={cn(
          'px-3 py-1 rounded text-xs font-medium transition-all',
          value === true
            ? 'bg-success text-white'
            : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
        )}
      >
        Oui
      </button>
      <button
        onClick={() => onChange(value === false ? null : false)}
        className={cn(
          'px-3 py-1 rounded text-xs font-medium transition-all',
          value === false
            ? 'bg-error text-white'
            : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
        )}
      >
        Non
      </button>
    </div>
  </div>
);

FiltersPremium.displayName = 'FiltersPremium';
