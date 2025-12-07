import { z } from 'zod';
import { ZodError } from 'zod';

/**
 * Middleware de validation pour les API routes
 */
export class ValidationMiddleware {
  /**
   * Valide les données avec un schéma Zod
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
  } {
    try {
      const validatedData = schema.parse(data);
      return {
        success: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};

        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });

        return {
          success: false,
          errors
        };
      }

      return {
        success: false,
        errors: { general: 'Erreur de validation inconnue' }
      };
    }
  }

  /**
   * Crée un wrapper pour les mutations React Query avec validation
   */
  static withValidation<T, V>(
    mutationFn: (data: T) => Promise<V>,
    schema: z.ZodSchema<T>
  ) {
    return async (data: unknown): Promise<V> => {
      const validation = this.validate(schema, data);

      if (!validation.success) {
        throw new Error(
          `Erreur de validation: ${JSON.stringify(validation.errors)}`
        );
      }

      return mutationFn(validation.data!);
    };
  }
}

/**
 * Hook personnalisé pour la validation côté client
 */
export function useValidation<T>(schema: z.ZodSchema<T>) {
  const validateField = (name: string, value: unknown): string | undefined => {
    try {
      schema.parse({ [name]: value });
      return undefined;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.errors.find(err =>
          err.path.length === 1 && err.path[0] === name
        );
        return fieldError?.message;
      }
      return 'Erreur de validation';
    }
  };

  const validateForm = (data: unknown): {
    isValid: boolean;
    errors: Record<string, string>;
  } => {
    const validation = ValidationMiddleware.validate(schema, data);
    return {
      isValid: validation.success,
      errors: validation.errors || {}
    };
  };

  return {
    validateField,
    validateForm
  };
}