/**
 * Feature: property
 * 
 * Exports publics de la feature property
 */

// Pages
export { default as HomePage } from './pages/HomePage';
export { default as PropertyStatsPage } from './pages/PropertyStatsPage';

// Components
export { default as PropertyComparison } from './components/PropertyComparison';
export { default as PropertyMap } from './components/PropertyMap';
export { default as QuickSearch } from './components/QuickSearch';

// Hooks
export { 
  useProperties,
  useProperty,
  useOwnerProperties,
  useFeaturedProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty
} from './hooks/useProperties';

// Services
export { propertyApi } from './services/property.api';

// Types
export type {
  Property,
  PropertyInsert,
  PropertyUpdate,
  PropertyWithOwner,
  PropertyFilters,
  PropertyStats,
  PropertyFormData,
  PropertyStatus,
  PropertyType,
  PropertyAmenity,
  PropertyLocation
} from './types';
