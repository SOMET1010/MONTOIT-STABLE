// Outils de monitoring des performances pour l'interface locataire

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // Custom metrics
  bundleSize: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  
  // User experience metrics
  errorRate: number;
  conversionRate: number;
  bounceRate: number;
}

interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number; poor: number };
  fid: { good: number; needsImprovement: number; poor: number };
  cls: { good: number; needsImprovement: number; poor: number };
}

const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000, poor: 6000 },
  fid: { good: 100, needsImprovement: 300, poor: 500 },
  cls: { good: 0.1, needsImprovement: 0.25, poor: 0.5 }
};

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private startTime: number = Date.now();

  constructor() {
    this.initializeObservers();
    this.trackBundleSize();
    this.trackMemoryUsage();
  }

  private initializeObservers() {
    // Observer pour LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.evaluateMetric('lcp', this.metrics.lcp!);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observer pour FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.evaluateMetric('fid', this.metrics.fid!);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Observer pour CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.evaluateMetric('cls', this.metrics.cls!);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  private trackBundleSize() {
    // Simuler la taille du bundle (à remplacer avec des vraies métriques)
    if (window.performance && window.performance.memory) {
      const bundleSize = window.performance.memory.usedJSHeapSize;
      this.metrics.bundleSize = bundleSize / 1024 / 1024; // en MB
    }
  }

  private trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // en MB
    }
  }

  private evaluateMetric(metricName: keyof PerformanceThresholds, value: number) {
    const threshold = PERFORMANCE_THRESHOLDS[metricName];
    let rating: 'good' | 'needs-improvement' | 'poor';

    if (value <= threshold.good) {
      rating = 'good';
    } else if (value <= threshold.needsImprovement) {
      rating = 'needs-improvement';
    } else {
      rating = 'poor';
    }

    this.reportMetric(metricName, value, rating);
  }

  private reportMetric(name: string, value: number, rating: string) {
    console.log(`[Performance] ${name}: ${value.toFixed(2)} (${rating})`);
    
    // Envoyer à un service d'analytics (ex: Google Analytics, Sentry, etc.)
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        value: value,
        rating: rating
      });
    }

    // Envoyer à Sentry si disponible
    if (window.Sentry) {
      window.Sentry.addBreadcrumb({
        message: `Performance: ${name}`,
        data: { value, rating },
        level: rating === 'poor' ? 'warning' : 'info'
      });
    }
  }

  // Méthodes pour suivre les métriques personnalisées
  trackApiResponseTime(endpoint: string, duration: number) {
    this.metrics.apiResponseTime = duration;
    
    if (duration > 2000) {
      console.warn(`[Performance] API response time for ${endpoint}: ${duration}ms (slow)`);
    }
    
    return duration;
  }

  trackRenderTime(componentName: string, duration: number) {
    this.metrics.renderTime = duration;
    
    if (duration > 100) {
      console.warn(`[Performance] Render time for ${componentName}: ${duration}ms (slow)`);
    }
    
    return duration;
  }

  trackUserInteraction(action: string, duration?: number) {
    const timestamp = Date.now() - this.startTime;
    console.log(`[Performance] User interaction: ${action} at ${timestamp}ms`);
    
    if (duration) {
      this.trackApiResponseTime(`user_action_${action}`, duration);
    }
  }

  // Obtenir toutes les métriques
  getMetrics(): PerformanceMetrics {
    return {
      lcp: this.metrics.lcp || 0,
      fid: this.metrics.fid || 0,
      cls: this.metrics.cls || 0,
      bundleSize: this.metrics.bundleSize || 0,
      apiResponseTime: this.metrics.apiResponseTime || 0,
      renderTime: this.metrics.renderTime || 0,
      memoryUsage: this.metrics.memoryUsage || 0,
      errorRate: this.metrics.errorRate || 0,
      conversionRate: this.metrics.conversionRate || 0,
      bounceRate: this.metrics.bounceRate || 0
    };
  }

  // Obtenir le score de performance global (0-100)
  getPerformanceScore(): number {
    const metrics = this.getMetrics();
    let score = 100;

    // Pénalités pour chaque métrique
    if (metrics.lcp > PERFORMANCE_THRESHOLDS.lcp.good) score -= 20;
    if (metrics.fid > PERFORMANCE_THRESHOLDS.fid.good) score -= 15;
    if (metrics.cls > PERFORMANCE_THRESHOLDS.cls.good) score -= 15;
    if (metrics.bundleSize > 2) score -= 10; // > 2MB
    if (metrics.apiResponseTime > 1000) score -= 15; // > 1s
    if (metrics.memoryUsage > 50) score -= 10; // > 50MB

    return Math.max(0, score);
  }

  // Générer un rapport de performance
  generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();
    
    return `
📊 RAPPORT DE PERFORMANCE MON TOIT
==================================

Score Global: ${score}/100

⚡ Core Web Vitals:
   • LCP (Largest Contentful Paint): ${metrics.lcp.toFixed(0)}ms
   • FID (First Input Delay): ${metrics.fid.toFixed(0)}ms
   • CLS (Cumulative Layout Shift): ${metrics.cls.toFixed(3)}

📦 Métriques Techniques:
   • Taille Bundle: ${metrics.bundleSize.toFixed(2)}MB
   • Temps Réponse API: ${metrics.apiResponseTime.toFixed(0)}ms
   • Temps Rendu: ${metrics.renderTime.toFixed(0)}ms
   • Mémoire Utilisée: ${metrics.memoryUsage.toFixed(2)}MB

👥 Métriques UX:
   • Taux d'Erreur: ${(metrics.errorRate * 100).toFixed(1)}%
   • Taux Conversion: ${(metrics.conversionRate * 100).toFixed(1)}%
   • Taux Rebond: ${(metrics.bounceRate * 100).toFixed(1)}%

🎯 Recommandations:
${this.generateRecommendations(score, metrics)}
    `.trim();
  }

  private generateRecommendations(score: number, metrics: PerformanceMetrics): string {
    const recommendations: string[] = [];

    if (metrics.lcp > 2500) {
      recommendations.push('• Optimiser les images et charger les ressources critiques en priorité');
    }
    if (metrics.fid > 100) {
      recommendations.push('• Réduire le temps d\'exécution JavaScript et optimiser les interactions');
    }
    if (metrics.cls > 0.1) {
      recommendations.push('• Stabiliser les dimensions des éléments et éviter les changements de layout');
    }
    if (metrics.bundleSize > 2) {
      recommendations.push('• Implémenter le code splitting et réduire la taille du bundle');
    }
    if (metrics.apiResponseTime > 1000) {
      recommendations.push('• Optimiser les appels API et implémenter la mise en cache');
    }

    if (recommendations.length === 0) {
      return '✅ Performance excellente ! Aucune action requise.';
    }

    return recommendations.join('\n');
  }

  // Nettoyer les observateurs
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Hook React pour utiliser le monitoring de performance
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [score, setScore] = useState<number>(100);

  useEffect(() => {
    const monitor = new PerformanceMonitor();
    
    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics());
      setScore(monitor.getPerformanceScore());
    }, 5000);

    return () => {
      clearInterval(interval);
      monitor.destroy();
    };
  }, []);

  const trackInteraction = useCallback((action: string, duration?: number) => {
    const monitor = new PerformanceMonitor();
    monitor.trackUserInteraction(action, duration);
  }, []);

  return { metrics, score, trackInteraction };
};

// Export pour utilisation globale
export const performanceMonitor = new PerformanceMonitor();

// Types pour TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, options?: any) => void;
    Sentry?: {
      addBreadcrumb: (breadcrumb: any) => void;
    };
  }
}

export { PerformanceMonitor, PerformanceMetrics, PERFORMANCE_THRESHOLDS };