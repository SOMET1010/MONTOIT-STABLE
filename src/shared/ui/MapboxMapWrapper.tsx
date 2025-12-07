import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const MapboxMap = lazy(() => import('./MapboxMap'));

interface Property {
  id: string;
  title: string;
  monthly_rent: number;
  longitude: number;
  latitude: number;
  status?: string;
  images?: string[];
  city?: string;
  neighborhood?: string;
}

interface MapboxMapWrapperProps {
  center?: [number, number];
  zoom?: number;
  properties: Property[];
  highlightedPropertyId?: string;
  onMarkerClick?: (property: Property) => void;
  onBoundsChange?: (bounds: any) => void;
  clustering?: boolean;
  draggableMarker?: boolean;
  showRadius?: boolean;
  radiusKm?: number;
  fitBounds?: boolean;
  height?: string;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  onMarkerDrag?: (lngLat: { lng: number; lat: number }) => void;
  searchEnabled?: boolean;
  singleMarker?: boolean;
}

export default function MapboxMapWrapper(props: MapboxMapWrapperProps) {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center bg-gray-100 rounded-lg"
          style={{ width: '100%', height: props.height || '400px' }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="ml-2 text-gray-600">Chargement de la carte...</span>
        </div>
      }
    >
      <MapboxMap {...props} />
    </Suspense>
  );
}