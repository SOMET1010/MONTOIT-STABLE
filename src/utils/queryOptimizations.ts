// Optimisations des requêtes avec projections pour les services restants
// Ce fichier contient les requêtes optimisées pour remplacer les select('*')

// Services à optimiser :
// - monartisanService.ts
// - contractorService.ts
// - apiKeyService.ts
// - scoringService.ts
// - messaging.api.ts

// Tables concernées et projections optimales :

const OPTIMIZED_SELECTS = {
  // Contractors table
  contractors: `
    id,
    user_id,
    full_name,
    email,
    phone,
    whatsapp_phone,
    specialization,
    skills,
    experience_years,
    rating,
    is_verified,
    is_available,
    city,
    address,
    bio,
    portfolio_urls,
    certifications,
    created_at,
    updated_at
  `,

  // API keys table
  api_keys: `
    id,
    name,
    key_prefix,
    permissions,
    status,
    expires_at,
    last_used_at,
    created_at,
    updated_at
  `,

  // Scoring analyses table
  scoring_analyses: `
    id,
    user_id,
    tenant_id,
    property_id,
    application_id,
    overall_score,
    profile_completeness_score,
    financial_stability_score,
    rental_history_score,
    employment_stability_score,
    credit_worthiness_score,
    risk_factors,
    recommendations,
    analysis_date,
    created_at,
    updated_at
  `,

  // Messages table
  messages: `
    id,
    sender_id,
    receiver_id,
    conversation_id,
    application_id,
    property_id,
    content,
    message_type,
    attachments,
    reply_to_id,
    is_read,
    is_edited,
    edit_count,
    deleted_by_sender,
    deleted_by_receiver,
    read_at,
    edited_at,
    created_at,
    updated_at
  `,

  // MonArtisan orders table
  orders: `
    id,
    client_id,
    contractor_id,
    service_type,
    description,
    budget,
    status,
    location,
    scheduled_date,
    completion_date,
    created_at,
    updated_at
  `,

  // MonArtisan reviews table
  reviews: `
    id,
    order_id,
    client_id,
    contractor_id,
    rating,
    comment,
    review_date,
    created_at,
    updated_at
  `
} as const;

export default OPTIMIZED_SELECTS;