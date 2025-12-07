import { z } from 'zod';
import { SanitizationService } from '../sanitization';

/**
 * Schémas de validation Zod avec sanitization intégrée
 */

// Schéma de base pour la sanitization de chaînes
const sanitizedString = (min: number = 1, max: number = 1000) =>
  z.string()
    .min(min, `Minimum ${min} caractères requis`)
    .max(max, `Maximum ${max} caractères autorisés`)
    .transform(val => SanitizationService.sanitizeString(val));

// Schéma pour les emails
const emailSchema = z.string()
  .email('Email invalide')
  .transform(val => SanitizationService.sanitizeEmail(val));

// Schéma pour les mots de passe
const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial');

// Schéma pour les numéros de téléphone
const phoneSchema = z.string()
  .min(10, 'Numéro de téléphone invalide')
  .max(20, 'Numéro de téléphone trop long')
  .transform(val => SanitizationService.sanitizePhoneNumber(val));

/**
 * Schémas d'authentification
 */
export const authSchemas = {
  register: z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: sanitizedString(2, 50),
    lastName: sanitizedString(2, 50),
    phone: phoneSchema.optional(),
    acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions générales')
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  }),

  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Mot de passe requis'),
    remember: z.boolean().optional()
  }),

  forgotPassword: z.object({
    email: emailSchema
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Token requis'),
    password: passwordSchema,
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  })
};

/**
 * Schémas pour les biens immobiliers
 */
export const propertySchemas = {
  create: z.object({
    title: sanitizedString(10, 200),
    description: sanitizedString(50, 5000),
    type: z.enum(['apartment', 'house', 'studio', 'villa', 'loft', 'other']),
    address: z.object({
      street: sanitizedString(5, 200),
      city: sanitizedString(2, 100),
      postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
      country: sanitizedString(2, 100)
    }),
    price: z.number().min(0, 'Le prix doit être positif'),
    area: z.number().min(1, 'La surface doit être positive'),
    rooms: z.number().min(1, 'Au moins une pièce requise').max(20, 'Nombre de pièces trop élevé'),
    bedrooms: z.number().min(0).max(20),
    bathrooms: z.number().min(0).max(20),
    features: z.array(sanitizedString(2, 50)).optional(),
    images: z.array(z.string().url('URL d\'image invalide')).optional(),
    available: z.boolean().optional()
  }),

  search: z.object({
    query: sanitizedString(0, 200).optional(),
    type: z.enum(['apartment', 'house', 'studio', 'villa', 'loft', 'other']).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    minArea: z.number().min(0).optional(),
    maxArea: z.number().min(0).optional(),
    rooms: z.number().min(1).max(20).optional(),
    city: sanitizedString(2, 100).optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional()
  })
};

/**
 * Schémas pour les profils utilisateur
 */
export const profileSchemas = {
  update: z.object({
    firstName: sanitizedString(2, 50).optional(),
    lastName: sanitizedString(2, 50).optional(),
    phone: phoneSchema.optional(),
    bio: sanitizedString(0, 500).optional(),
    avatar: z.string().url('URL d\'avatar invalide').optional()
  }),

  preferences: z.object({
    language: z.enum(['fr', 'en']).optional(),
    theme: z.enum(['light', 'dark']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional()
    }).optional()
  })
};

/**
 * Schémas pour les messages
 */
export const messageSchemas = {
  send: z.object({
    recipientId: z.string().uuid('ID destinataire invalide'),
    subject: sanitizedString(5, 200),
    content: sanitizedString(10, 5000),
    attachments: z.array(z.string().url('URL de pièce jointe invalide')).optional()
  }),

  reply: z.object({
    messageId: z.string().uuid('ID message invalide'),
    content: sanitizedString(10, 5000)
  })
};

/**
 * Schémas pour les contrats
 */
export const contractSchemas = {
  create: z.object({
    propertyId: z.string().uuid('ID propriété invalide'),
    tenantId: z.string().uuid('ID locataire invalide'),
    startDate: z.string().datetime('Date de début invalide'),
    endDate: z.string().datetime('Date de fin invalide'),
    rent: z.number().min(0, 'Loyer doit être positif'),
    deposit: z.number().min(0, 'Caution doit être positive'),
    terms: sanitizedString(100, 10000)
  })
};

/**
 * Schéma générique pour la validation d'ID
 */
export const idSchema = z.string().uuid('ID invalide');

/**
 * Schéma pour la pagination
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

/**
 * Export des types inférés
 */
export type AuthRegisterInput = z.infer<typeof authSchemas.register>;
export type AuthLoginInput = z.infer<typeof authSchemas.login>;
export type PropertyCreateInput = z.infer<typeof propertySchemas.create>;
export type PropertySearchInput = z.infer<typeof propertySchemas.search>;
export type ProfileUpdateInput = z.infer<typeof profileSchemas.update>;
export type MessageSendInput = z.infer<typeof messageSchemas.send>;
export type ContractCreateInput = z.infer<typeof contractSchemas.create>;
export type PaginationInput = z.infer<typeof paginationSchema>;