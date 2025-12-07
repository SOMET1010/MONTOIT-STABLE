/**
 * Types TypeScript pour la feature Agency
 * Gestion des agences immobilières
 */

/**
 * Agence immobilière
 */
export interface RealEstateAgency {
  id: string;
  name: string;
  commercial_name: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  license_number: string;
  license_expiry: string;
  status: 'active' | 'inactive' | 'suspended';
  verified: boolean;
  verification_document_url?: string;
  website?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  specializations: string[];
  service_areas: string[];
  commission_rates: {
    rental_fee: number;
    sale_fee?: number;
    management_fee?: number;
  };
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Agent immobilier
 */
export interface AgencyAgent {
  id: string;
  agency_id: string;
  user_id: string;
  agent_code: string;
  full_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  bio?: string;
  specializations: string[];
  license_number: string;
  license_expiry?: string;
  commission_rate: number;
  status: 'active' | 'inactive' | 'on_leave';
  is_manager: boolean;
  hire_date: string;
  performance_metrics?: {
    total_deals: number;
    total_revenue: number;
    average_rating: number;
    client_satisfaction: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Portfolio de propriétés gérées
 */
export interface AgencyProperty {
  id: string;
  agency_id: string;
  agent_id?: string;
  property_id: string;
  management_type: 'rental' | 'sale' | 'both';
  contract_type: 'exclusive' | 'non_exclusive';
  commission_rate?: number;
  management_fee?: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'expired' | 'terminated';
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Client de l'agence
 */
export interface AgencyClient {
  id: string;
  agency_id: string;
  agent_id?: string;
  client_type: 'owner' | 'tenant' | 'buyer' | 'seller';
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  budget_min?: number;
  budget_max?: number;
  property_requirements?: {
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    surface_min?: number;
    features?: string[];
    neighborhoods?: string[];
  };
  status: 'active' | 'inactive' | 'lost';
  last_contact_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Rapport de performance de l'agence
 */
export interface AgencyPerformanceReport {
  id: string;
  agency_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    total_properties: number;
    new_listings: number;
    sold_properties: number;
    rented_properties: number;
    total_revenue: number;
    average_time_to_rent: number;
    average_time_to_sell: number;
    client_satisfaction_score: number;
    lead_conversion_rate: number;
  };
  agent_performances: {
    agent_id: string;
    agent_name: string;
    deals_count: number;
    revenue_generated: number;
    client_rating: number;
  }[];
  created_at: string;
}

/**
 * Document légal de l'agence
 */
export interface AgencyDocument {
  id: string;
  agency_id: string;
  document_type: 'license' | 'insurance' | 'contract' | 'certificate' | 'other';
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  expiry_date?: string;
  is_required: boolean;
  status: 'valid' | 'expired' | 'pending' | 'rejected';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Configuration de notification pour l'agence
 */
export interface AgencyNotificationSettings {
  id: string;
  agency_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    new_inquiry: boolean;
    appointment_scheduled: boolean;
    contract_signed: boolean;
    payment_received: boolean;
    document_expiry: boolean;
    system_maintenance: boolean;
  };
  notification_emails: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Export des types pour imports
 */
export type {
  RealEstateAgency,
  AgencyAgent,
  AgencyProperty,
  AgencyClient,
  AgencyPerformanceReport,
  AgencyDocument,
  AgencyNotificationSettings
};