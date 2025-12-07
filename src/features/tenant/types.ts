/**
 * Types TypeScript pour la feature Tenant
 * Gestion des locataires et candidatures
 */

/**
 * Profil locataire
 */
export interface TenantProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  current_address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  profession?: string;
  employer?: string;
  monthly_income?: number;
  employment_status: 'employed' | 'self_employed' | 'student' | 'unemployed' | 'retired';
  is_verified: boolean;
  verification_status: {
    identity_verified: boolean;
    income_verified: boolean;
    references_verified: boolean;
  };
  rental_preferences: {
    property_types: string[];
    budget_min?: number;
    budget_max?: number;
    bedrooms_min?: number;
    neighborhoods?: string[];
    move_in_date?: string;
    lease_duration?: number; // en mois
    furnished: boolean;
    pets_allowed: boolean;
  };
  documents?: {
    id_card_url?: string;
    proof_of_income_url?: string;
    employment_letter_url?: string;
    bank_statement_url?: string;
    guarantor_letter_url?: string;
  };
  references?: {
    previous_landlord?: {
      name: string;
      phone: string;
      email: string;
    };
    employer_reference?: {
      name: string;
      company: string;
      phone: string;
      email: string;
    };
    personal_reference?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  rental_history: {
    previous_rentals_count: number;
    eviction_history: boolean;
    payment_issues: boolean;
    average_stay_duration: number; // en mois
  };
  created_at: string;
  updated_at: string;
}

/**
 * Candidature de location
 */
export interface RentalApplication {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  application_date: string;
  cover_letter: string;
  proposed_move_date: string;
  proposed_lease_duration: number;
  proposed_rent?: number;
  documents: {
    id_card_url?: string;
    proof_of_income_url?: string;
    employment_letter_url?: string;
    bank_statement_url?: string;
    guarantor_letter_url?: string;
    additional_documents?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  };
  screening_results?: {
    credit_score?: number;
    background_check_passed: boolean;
    reference_check_passed: boolean;
    income_verification_passed: boolean;
    overall_score: number;
    risk_level: 'low' | 'medium' | 'high';
  };
  guarantor?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    profession?: string;
    monthly_income?: number;
    documents: {
      id_card_url?: string;
      proof_of_income_url?: string;
    };
  };
  landlord_notes?: string;
  rejection_reason?: string;
  viewed_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Visite programmée
 */
export interface PropertyVisit {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  scheduled_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  visit_type: 'individual' | 'group' | 'virtual';
  additional_attendees?: string[];
  special_requests?: string;
  feedback?: {
    rating: number;
    comments: string;
    property_condition: number;
    neighborhood_rating: number;
    price_appropriateness: number;
    would_rent: boolean;
  };
  reminder_sent: boolean;
  calendar_event_id?: string;
  meeting_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Bail de location
 */
export interface LeaseAgreement {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  lease_number: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'active' | 'expired' | 'terminated';
  lease_type: 'residential' | 'commercial';
  start_date: string;
  end_date?: string;
  is_renewable: boolean;
  renewal_terms?: {
    notice_period_days: number;
    rent_increase_percentage?: number;
  };
  financial_terms: {
    monthly_rent: number;
    deposit_amount: number;
    charges_amount: number;
    payment_day: number;
    payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
    late_fee_percentage?: number;
  };
  property_details: {
    address: string;
    type: string;
    surface_area: number;
    bedrooms: number;
    bathrooms: number;
    furnished: boolean;
    amenities?: string[];
    inventory?: string[];
  };
  custom_clauses?: string;
  landlord_signature?: {
    signed_at: string;
    ip_address: string;
    certificate_id?: string;
  };
  tenant_signature?: {
    signed_at: string;
    ip_address: string;
    certificate_id?: string;
  };
  termination_details?: {
    termination_date: string;
    termination_reason: string;
    terminated_by: 'landlord' | 'tenant' | 'mutual';
    notice_given_days: number;
    deposit_return_status: 'pending' | 'partial' | 'full' | 'withheld';
    deposit_deductions?: Array<{
      description: string;
      amount: number;
    }>;
  };
  renewal_history?: Array<{
    renewed_at: string;
    new_end_date: string;
    new_rent: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Paiement de loyer
 */
 export interface RentPayment {
  id: string;
  lease_id: string;
  tenant_id: string;
  landlord_id: string;
  payment_period: {
    start_date: string;
    end_date: string;
  };
  amount: number;
  late_fee?: number;
  total_amount: number;
  due_date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
  payment_reference?: string;
  transaction_id?: string;
  provider?: 'orange' | 'mtn' | 'wave' | 'moov' | 'bank';
  paid_at?: string;
  failed_at?: string;
  failure_reason?: string;
  refund_details?: {
    refunded_at: string;
    refund_amount: number;
    refund_reason: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Évaluation du locataire
 */
export interface TenantRating {
  id: string;
  tenant_id: string;
  property_id: string;
  lease_id: string;
  landlord_id: string;
  rating_type: 'end_of_lease' | 'periodic';
  criteria: {
    cleanliness: number; // 1-5
    communication: number; // 1-5
    property_care: number; // 1-5
    payment_timeliness: number; // 1-5
    rule_compliance: number; // 1-5
  };
  overall_rating: number; // 1-5
  comments?: string;
  would_rent_again: boolean;
  rated_by_landlord: boolean;
  response_from_tenant?: {
    tenant_response: string;
    responded_at: string;
  };
  created_at: string;
}

/**
 * Favoris et alertes du locataire
 */
export interface TenantPreferences {
  id: string;
  tenant_id: string;
  saved_properties: string[]; // property IDs
  saved_searches: Array<{
    id: string;
    name: string;
    criteria: {
      property_types?: string[];
      cities?: string[];
      price_min?: number;
      price_max?: number;
      bedrooms?: number;
      bathrooms?: number;
      surface_min?: number;
      furnished?: boolean;
      features?: string[];
    };
    alert_frequency: 'immediate' | 'daily' | 'weekly';
    last_alert_sent?: string;
    created_at: string;
  }>;
  notification_settings: {
    new_listings: boolean;
    price_changes: boolean;
    application_updates: boolean;
    visit_reminders: boolean;
    payment_reminders: boolean;
    lease_renewals: boolean;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Export des types pour imports
 */
export type {
  TenantProfile,
  RentalApplication,
  PropertyVisit,
  LeaseAgreement,
  RentPayment,
  TenantRating,
  TenantPreferences
};