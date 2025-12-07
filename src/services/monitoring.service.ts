import * as Sentry from '@sentry/react';
import { captureError, addBreadcrumb } from '@/lib/sentry';

/**
 * Types d'événements de monitoring
 */
export enum MonitoringEventType {
  USER_ACTION = 'user_action',
  API_ERROR = 'api_error',
  PERFORMANCE = 'performance',
  VALIDATION_ERROR = 'validation_error',
  AUTH_ERROR = 'auth_error',
  BUSINESS_ERROR = 'business_error'
}

/**
 * Service de monitoring avancé
 */
export class MonitoringService {
  /**
   * Suivre une action utilisateur
   */
  static trackUserAction(action: string, data?: Record<string, unknown>) {
    addBreadcrumb(`User action: ${action}`, {
      category: 'user',
      action,
      ...data
    });

    // Envoyer à un service d'analytics si disponible
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'User Interaction',
        ...data
      });
    }
  }

  /**
   * Suivre les erreurs API avec contexte
   */
  static trackApiError(
    error: Error | Response,
    endpoint: string,
    method: string,
    requestData?: unknown
  ) {
    const context = {
      type: MonitoringEventType.API_ERROR,
      endpoint,
      method,
      requestData: this.sanitizeData(requestData),
      timestamp: new Date().toISOString()
    };

    // Extraire plus d'infos si c'est une Response
    if (error instanceof Response) {
      context.status = error.status;
      context.statusText = error.statusText;
    }

    captureError(error instanceof Error ? error : new Error('API Error'), context);
  }

  /**
   * Suivre les erreurs de validation
   */
  static trackValidationError(
    field: string,
    value: unknown,
    validationRule: string,
    errorMessage: string
  ) {
    const error = new Error(`Validation failed: ${field}`);

    captureError(error, {
      type: MonitoringEventType.VALIDATION_ERROR,
      field,
      value: this.sanitizeData(value),
      rule: validationRule,
      message: errorMessage
    });
  }

  /**
   * Suivre les performances
   */
  static trackPerformance(
    metricName: string,
    duration: number,
    additionalData?: Record<string, unknown>
  ) {
    Sentry.addBreadcrumb({
      message: `Performance: ${metricName}`,
      data: {
        metricName,
        duration,
        unit: 'ms',
        ...additionalData
      },
      level: duration > 3000 ? 'warning' : 'info',
      category: 'performance'
    });

    // Envoyer les métriques à Sentry
    Sentry.setMeasurement(metricName, duration, 'millisecond');
  }

  /**
   * Mesurer le temps de chargement d'une page
   */
  static measurePageLoad(pageName: string) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;

      this.trackPerformance(`${pageName}_page_load`, loadTime, {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: this.getMetric('first-contentful-paint'),
        firstInputDelay: this.getMetric('first-input-delay')
      });
    }
  }

  /**
   * Mesurer le temps d'exécution d'une fonction
   */
  static measureFunction<T>(
    functionName: string,
    fn: () => T | Promise<T>
  ): T | Promise<T> {
    const start = performance.now();

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          this.trackPerformance(functionName, duration);
        });
      } else {
        const duration = performance.now() - start;
        this.trackPerformance(functionName, duration);
        return result;
      }
    } catch (error) {
      const duration = performance.now() - start;
      this.trackPerformance(`${functionName}_error`, duration);
      throw error;
    }
  }

  /**
   * Suivre les erreurs d'authentification
   */
  static trackAuthError(error: Error, context: 'login' | 'register' | 'token_refresh') {
    captureError(error, {
      type: MonitoringEventType.AUTH_ERROR,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Suivre les erreurs métier
   */
  static trackBusinessError(
    error: Error,
    operation: string,
    businessContext?: Record<string, any>
  ) {
    captureError(error, {
      type: MonitoringEventType.BUSINESS_ERROR,
      operation,
      businessContext: this.sanitizeData(businessContext),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Nettoyer les données sensibles
   */
  private static sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'creditCard',
      'ssn',
      'iban'
    ];

    // Type assertion car nous avons déjà vérifié que c'est un objet et non null
    const objData = data as Record<string, unknown>;
    const sanitized: Record<string, unknown> = { ...objData };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Nettoyer les objets imbriqués
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Obtenir une métrique de performance
   */
  private static getMetric(name: string): number | undefined {
    if ('web-vitals' in window) {
      const webVitalsWindow = window as { webVitals?: { getMetricByName?: (name: string) => { value: number } } };
      return webVitalsWindow.webVitals?.getMetricByName?.(name)?.value;
    }
    return undefined;
  }

  /**
   * Configurer le monitoring global
   */
  static setupGlobalMonitoring() {
    // Surveiller les erreurs non capturées
    window.addEventListener('error', (event) => {
      captureError(event.error || new Error(event.message), {
        type: MonitoringEventType.USER_ACTION,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Surveiller les rejets de promesses
    window.addEventListener('unhandledrejection', (event) => {
      captureError(event.reason || new Error('Unhandled Promise Rejection'), {
        type: MonitoringEventType.USER_ACTION,
        promise: true
      });
    });

    // Surveiller les changements de route
    if ('navigation' in window) {
      window.navigation.addEventListener('navigate', () => {
        addBreadcrumb('Navigation changed', {
          category: 'navigation',
          url: window.location.href
        });
      });
    }
  }
}

// Déclarer les types pour gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}