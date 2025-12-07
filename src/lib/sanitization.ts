import DOMPurify from 'dompurify';

/**
 * Service de sanitization pour sécuriser les entrées utilisateur
 */
export class SanitizationService {
  private static purify = DOMPurify;

  /**
   * Nettoie une chaîne de caractères pour prévenir les attaques XSS
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return this.purify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  /**
   * Nettoie le HTML en autorisant uniquement certaines balises
   */
  static sanitizeHtml(input: string, allowedTags?: string[]): string {
    if (typeof input !== 'string') {
      return '';
    }

    const config: DOMPurify.Config = {
      ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
      KEEP_CONTENT: true
    };

    return this.purify.sanitize(input, config);
  }

  /**
   * Valide et nettoie un email
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return '';
    }

    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * Valide et nettoie un numéro de téléphone
   */
  static sanitizePhoneNumber(phone: string): string {
    if (typeof phone !== 'string') {
      return '';
    }

    // Garde uniquement les chiffres et les symboles +, -, (, )
    const sanitized = phone.replace(/[^\d+\-() ]/g, '').trim();

    return sanitized;
  }

  /**
   * Nettoie les entrées d'un objet récursivement
   */
  static sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        sanitized[key] = value;
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item =>
          typeof item === 'string' ? this.sanitizeString(item) :
          typeof item === 'object' ? this.sanitizeObject(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Valide une longueur de chaîne
   */
  static validateLength(input: string, min: number, max: number): boolean {
    const sanitized = this.sanitizeString(input);
    return sanitized.length >= min && sanitized.length <= max;
  }

  /**
   * Échappe les caractères spéciaux pour les expressions régulières
   */
  static escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}