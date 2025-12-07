/**
 * Service pour gérer les imports dynamiques des dépendances lourdes
 */

export class DynamicImportsService {
  // Cache des modules chargés
  private static cache = new Map<string, any>();

  /**
   * Charger Mapbox GL dynamiquement
   */
  static async loadMapbox() {
    if (this.cache.has('mapbox')) {
      return this.cache.get('mapbox');
    }

    const mapbox = await import('mapbox-gl');
    this.cache.set('mapbox', mapbox);
    return mapbox;
  }

  /**
   * Charger jsPDF dynamiquement
   */
  static async loadJsPDF() {
    if (this.cache.has('jspdf')) {
      return this.cache.get('jspdf');
    }

    const [{ jsPDF }] = await Promise.all([
      import('jspdf'),
      // Charger html2canvas seulement si nécessaire
      import('html2canvas').catch(() => null)
    ]);
    this.cache.set('jspdf', jsPDF);
    return jsPDF;
  }

  /**
   * Charger Sentry dynamiquement (seulement en production)
   */
  static async loadSentry() {
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }

    if (this.cache.has('sentry')) {
      return this.cache.get('sentry');
    }

    const [{ initSentry }] = await Promise.all([
      import('@/lib/sentry'),
      import('@sentry/tracing'),
      import('@sentry/replay')
    ]);

    this.cache.set('sentry', { initSentry });
    return { initSentry };
  }

  /**
   * Charger Lucide React dynamiquement
   */
  static async loadLucideIcon(iconName: string) {
    const cacheKey = `lucide-${iconName}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Import dynamique de l'icône spécifique
      const iconModule = await import(`lucide-react`);
      const icon = iconModule[iconName as keyof typeof iconModule];

      if (icon) {
        this.cache.set(cacheKey, icon);
        return icon;
      }
    } catch (error) {
      console.warn(`Failed to load Lucide icon: ${iconName}`, error);
    }

    // Fallback vers une icône par défaut
    return this.cache.get('lucide-Home') || null;
  }

  /**
   * Charger les icônes de manière groupée
   */
  static async loadLucideIcons(iconNames: string[]) {
    const icons: Record<string, any> = {};

    // Charger toutes les icônes d'un coup
    const lucideModule = await import('lucide-react');

    iconNames.forEach(name => {
      const cacheKey = `lucide-${name}`;
      const icon = lucideModule[name as keyof typeof lucideModule];

      if (icon) {
        icons[name] = icon;
        this.cache.set(cacheKey, icon);
      }
    });

    return icons;
  }

  /**
   * Précharger les dépendances critiques de manière asynchrone
   */
  static preloadCriticalDependencies() {
    // Précharger React Query
    import('@tanstack/react-query');

    // Précharger Supabase
    import('@supabase/supabase-js');

    // Précharger Zustand
    import('zustand');
  }

  /**
   * Vider le cache (utile pour le développement)
   */
  static clearCache() {
    this.cache.clear();
  }
}