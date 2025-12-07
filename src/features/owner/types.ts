/**
 * Types TypeScript pour la feature Owner
 * Gestion des propriétaires immobiliers
 */

/**
 * Profil propriétaire
 */
export interface OwnerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  national_id_number?: string;
  tax_id_number?: string;
  is_verified: boolean;
  verification_documents?: {
    national_id_url?: string;
    proof_of_address_url?: string;
    tax_document_url?: string;
  };
  properties_count: number;
  active_listings: number;
  total_properties_value?: number;
  average_rating?: number;
  response_rate?: number;
  preferred_languages: string[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

/**
 * Bien immobilier du propriétaire
 */
export interface OwnerProperty {
  id: string;
  owner_id: string;
  property_id: string;
  ownership_percentage: number;
  acquisition_date?: string;
  acquisition_price?: number;
  ownership_type: 'full' | 'co_ownership' | 'company' | 'trust';
  management_status: 'self_managed' | 'agency_managed';
  agency_id?: string;
  rental_history: {
    total_tenants: number;
    average_occupancy_rate: number;
    total_rental_income: number;
    last_vacancy_date?: string;
  };
  expenses: {
    monthly_maintenance?: number;
    annual_taxes?: number;
    insurance_cost?: number;
    management_fee?: number;
  };
  documents?: {
    title_deed_url?: string;
    insurance_policy_url?: string;
    tax_assessment_url?: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Locataire du propriétaire
 */
export interface OwnerTenant {
  id: string;
  owner_id: string;
  tenant_id: string;
  property_id: string;
  lease_id: string;
  full_name: string;
  email: string;
  phone: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  rental_status: 'active' | 'expired' | 'terminated' | 'pending';
  lease_details: {
    start_date: string;
    end_date?: string;
    monthly_rent: number;
    deposit_amount: number;
    payment_day: number;
    last_payment_date?: string;
    next_payment_date?: string;
    outstanding_balance: number;
  };
  rating?: {
    cleanliness: number;
    communication: number;
    property_care: number;
    payment_timeliness: number;
    overall: number;
    review_date: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Revenus et dépenses du propriétaire
 */
export interface OwnerFinancials {
  owner_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  income: {
    rent_collected: number;
    late_fees: number;
    other_income: number;
    total_income: number;
  };
  expenses: {
    maintenance: number;
    taxes: number;
    insurance: number;
    management_fees: number;
    utilities?: number;
    marketing: number;
    other_expenses: number;
    total_expenses: number;
  };
  net_profit: number;
  roi_percentage?: number;
  occupancy_rate: number;
  property_count: number;
}

/**
 * Demande de maintenance
 */
export interface MaintenanceRequest {
  id: string;
  owner_id: string;
  property_id: string;
  tenant_id?: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest_control' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  photos?: string[];
  estimated_cost?: number;
  actual_cost?: number;
  contractor_id?: string;
  contractor_details?: {
    name: string;
    phone: string;
    company?: string;
  };
  scheduled_date?: string;
  completion_date?: string;
  tenant_rating?: number;
  owner_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Rapport de performance du propriétaire
 */
export interface OwnerPerformanceReport {
  id: string;
  owner_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    total_properties: number;
    occupancy_rate: number;
    average_rent: number;
    total_income: number;
    total_expenses: number;
    net_income: number;
    roi_percentage: number;
    tenant_satisfaction: number;
    maintenance_response_time: number;
    vacancy_rate: number;
  };
  property_breakdown: {
    property_id: string;
    property_address: string;
    monthly_rent: number;
    occupancy_status: 'occupied' | 'vacant' | 'maintenance';
    last_vacancy_date?: string;
    annual_income: number;
  }[];
  trends: {
    income_trend: 'increasing' | 'stable' | 'decreasing';
    expense_trend: 'increasing' | 'stable' | 'decreasing';
    occupancy_trend: 'increasing' | 'stable' | 'decreasing';
  };
  generated_at: string;
}

/**
 * Notification propriétaire
 */
export interface OwnerNotification {
  id: string;
  owner_id: string;
  type: 'new_application' | 'payment_received' | 'maintenance_request' | 'lease_expiring' | 'document_required' | 'system_update';
  title: string;
  message: string;
  property_id?: string;
  tenant_id?: string;
  lease_id?: string;
  read: boolean;
  action_required: boolean;
  action_url?: string;
  created_at: string;
}

/**
 * Configuration du propriétaire
 */
export interface OwnerSettings {
  id: string;
  owner_id: string;
  auto_approve_applications: boolean;
  minimum_tenant_score?: number;
  preferred_payment_methods: string[];
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    new_applications: boolean;
    payment_reminders: boolean;
    maintenance_requests: boolean;
    lease_expirations: boolean;
  };
  auto_renewal_settings: {
    enabled: boolean;
    notice_period_days: number;
    rent_increase_percentage?: number;
  };
  marketing_preferences: {
    show_phone_number: boolean;
    allow_instant_booking: boolean;
    require_verification: boolean;
    minimum_stay_days?: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Export des types pour imports
 */
export type {
  OwnerProfile,
  OwnerProperty,
  OwnerTenant,
  OwnerFinancials,
  MaintenanceRequest,
  OwnerPerformanceReport,
  OwnerNotification,
  OwnerSettings
};