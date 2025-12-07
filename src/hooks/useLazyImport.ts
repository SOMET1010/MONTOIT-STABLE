import { useState, useEffect } from 'react';
import { DynamicImportsService } from '@/services/dynamic-imports.service';

/**
 * Hook pour charger dynamiquement des dépendances
 */
export function useLazyImport<T>(
  loader: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDependency = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await loader();

        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error('Unknown error')
          });
        }
      }
    };

    loadDependency();

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}

/**
 * Hook pour charger Mapbox GL
 */
export function useMapbox() {
  return useLazyImport(() => DynamicImportsService.loadMapbox());
}

/**
 * Hook pour charger jsPDF
 */
export function useJsPDF() {
  return useLazyImport(() => DynamicImportsService.loadJsPDF());
}

/**
 * Hook pour charger une icône Lucide spécifique
 */
export function useLucideIcon(iconName: string) {
  return useLazyImport(
    () => DynamicImportsService.loadLucideIcon(iconName),
    [iconName]
  );
}

/**
 * Hook pour charger Sentry (seulement en production)
 */
export function useSentry() {
  return useLazyImport(() => DynamicImportsService.loadSentry());
}

/**
 * Hook pour précharger des dépendances
 */
export function usePreloadDeps(dependencies: (() => Promise<any>)[]) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const preload = async () => {
      try {
        await Promise.all(dependencies.map(dep => dep()));
        setLoaded(true);
      } catch (error) {
        console.warn('Failed to preload dependencies:', error);
      }
    };

    preload();
  }, dependencies);

  return loaded;
}