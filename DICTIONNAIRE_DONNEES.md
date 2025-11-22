# 📚 Dictionnaire de Données Complet - Mon Toit

**Date:** 22 Novembre 2025
**Version:** 1.0
**Total Tables:** 98
**Total Colonnes:** 800+

---

## 📋 INDEX ALPHABÉTIQUE DES TABLES

### A
- **admin_audit_logs** - Logs d'administration
- **admin_dashboard_overview** - Vue tableau de bord (materialized view)
- **admin_users** - Utilisateurs administration
- **agency_commissions** - Commissions des agences
- **agency_team_members** - Membres d'équipes d'agences
- **agencies** - Agences immobilières
- **ai_cache** - Cache réponses IA
- **ai_model_performance** - Performance modèles IA
- **ai_recommendations** - Recommandations IA
- **ai_usage_logs** - Logs utilisation IA
- **alert_preferences** - Préférences d'alertes
- **api_key_logs** - Logs d'utilisation API
- **api_keys** - Clés API externes
- **application_documents** - Documents des candidatures
- **audit_logs** - Logs d'audit général

### B
- **background_jobs** - Tâches en arrière-plan

### C
- **chatbot_conversations** - Conversations chatbot
- **ci_contract_templates** - Modèles de contrats CI
- **contract_documents** - Documents contractuels
- **contract_history** - Historique des contrats
- **contract_notifications** - Notifications contrats
- **contract_renewals** - Renouvellements de contrats
- **contract_templates** - Modèles de contrats
- **conversations** - Conversations entre utilisateurs
- **crm_leads** - Leads CRM pour agences
- **cryptoneo_documents** - Documents CryptoNeo

### D
- **dashboard_analytics** - Analytics tableau de bord
- **dispute_messages** - Messages de médiation
- **disputes** - Litiges et médiation
- **document_analysis** - Analyse de documents

### E
- **email_logs** - Logs d'envoi d'emails
- **email_templates** - Modèles d'emails

### F
- **facial_verifications** - Vérifications faciales
- **feature_flag_history** - Historique feature flags
- **feature_flag_overrides** - Surcharges feature flags
- **feature_flags** - Gestion feature flags
- **fraud_detection_alerts** - Alertes détection fraude

### H
- **health_checks** - Contrôles de santé système

### I
- **identity_verifications** - Vérifications ONECI
- **images** - Images générales

### L
- **landlord_reviews** - Avis sur propriétaires
- **landlord_transfers** - Virements propriétaires
- **lax_requirements** - Configuration Lax
- **lease_contracts** - Contrats de location
- **lease_documents** - Documents de baux
- **lease_history** - Historique des baux
- **lease_signatures** - Signatures de baux
- **leases** - Baux de location
- **lead_activities** - Activités des leads
- **legal_articles** - Articles légaux
- **legal_consultation_logs** - Logs consultations légales
- **llm_routing_logs** - Logs routage LLM
- **login_attempts** - Tentatives de connexion

### M
- **maintenance_documents** - Documents maintenance
- **maintenance_images** - Images maintenance
- **maintenance_requests** - Demandes maintenance
- **map_markers** - Marqueurs cartographiques
- **message_attachments** - Pièces jointes messages
- **messages** - Messages entre utilisateurs
- **mobile_money_transactions** - Transactions Mobile Money
- **monartisan_documents** - Documents MonArtisan
- **monartisan_integrations** - Intégrations MonArtisan

### N
- **notification_logs** - Logs notifications
- **notification_preferences** - Préférences notifications
- **notifications** - Notifications système

### O
- **oneci_verifications** - Vérifications ONECI
- **owner_ratings** - Notations propriétaires
- **owner_reviews** - Avis sur propriétaires

### P
- **password_reset_tokens** - Tokens réinitialisation mot de passe
- **payment_logs** - Logs paiements
- **payment_methods** - Méthodes paiement
- **payment_notifications** - Notifications paiements
- **payment_reminders** - Rappels paiements
- **payments** - Paiements généraux
- **platform_analytics** - Analytics plateforme
- **property_alerts** - Alertes propriétés
- **property_assignments** - Assignations propriétés
- **property_categories** - Catégories propriétés
- **property_documents** - Documents propriétés
- **property_features** - Caractéristiques propriétés
- **property_favorites** - Favoris propriétés
- **property_imports** - Imports propriétés
- **property_images** - Images propriétés
- **properties** - Biens immobiliers
- **provider_failover_logs** - Logs bascule fournisseurs
- **provider_health_checks** - Contrôles santé fournisseurs
- **provider_usage_costs** - Coûts utilisation fournisseurs
- **providers** - Fournisseurs de services

### R
- **recommendation_logs** - Logs recommandations
- **regions** - Régions géographiques
- **rental_history** - Historique locations
- **rental_applications** - Candidatures location
- **reported_content** - Contenu signalé
- **review_images** - Images avis
- **reviews** - Avis généraux

### S
- **saved_searches** - Recherches sauvegardées
- **score_achievements** - Accomplissements score
- **score_history** - Historique scores
- **score_settings** - Paramètres scoring
- **search_alerts** - Alertes recherche
- **search_logs** - Logs recherche
- **service_configurations** - Configurations services
- **service_providers** - Fournisseurs services
- **sms_logs** - Logs SMS
- **storage_buckets** - Stockage fichiers
- **system_settings** - Paramètres système

### T
- **tenant_reviews** - Avis sur locataires
- **test_data** - Données de test
- **trust_agent_ratings** - Notations agents confiance
- **trust_agent_status_history** - Historique statut agents
- **trust_agents** - Agents de confiance
- **trust_validation_requests** - Demandes validation

### U
- **user_activity_tracking** - Tracking activité utilisateurs
- **user_documents** - Documents utilisateurs
- **user_feedback** - Feedback utilisateurs
- **user_notifications_settings** - Paramètres notifications utilisateurs
- **user_permissions** - Permissions utilisateurs
- **user_roles** - Rôles utilisateurs
- **user_search_history** - Historique recherche utilisateurs
- **user_sessions** - Sessions utilisateurs
- **user_settings** - Paramètres utilisateurs
- **user_type_permissions** - Permissions par type utilisateur
- **user_verifications** - Vérifications utilisateurs
- **users** - Utilisateurs (legacy)

### V
- **verification_codes** - Codes vérification
- **verification_documents** - Documents vérification
- **verification_preferences** - Préférences vérification
- **view_counts** - Compteurs vues
- **visit_feedback** - Feedback visites
- **visit_reminders** - Rappels visites
- **visits** - Visites propriétés
- **voice_integrations** - Intégrations vocales

### W
- **whatsapp_logs** - Logs WhatsApp

---

## 📖 DÉTAIL DES COLONNES PAR TABLE

### A - admin_users
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
role: TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'support'))
permissions: JSONB NOT NULL DEFAULT '{}'
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### A - agencies
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
owner_id: UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
name: TEXT NOT NULL
legal_name: TEXT
registration_number: TEXT
tax_id: TEXT
phone: TEXT
email: TEXT
website: TEXT
address: TEXT
city: TEXT
neighborhood: TEXT
description: TEXT
rccm_document: TEXT
business_license: TEXT
tax_certificate: TEXT
verification_status: TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended'))
verified_at: TIMESTAMPTZ
verification_notes: TEXT
logo_url: TEXT
banner_url: TEXT
primary_color: TEXT
commission_rate: DECIMAL(5,2) DEFAULT 5.00
auto_assign_leads: BOOLEAN DEFAULT true
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### A - api_keys
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
service_name: TEXT NOT NULL UNIQUE
display_name: TEXT NOT NULL
description: TEXT
keys: JSONB NOT NULL DEFAULT '{}'
is_active: BOOLEAN DEFAULT true
environment: TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production'))
provider_type: TEXT DEFAULT 'primary' CHECK (provider_type IN ('primary', 'fallback', 'backup'))
priority: INTEGER DEFAULT 1
health_check_url: TEXT
health_status: TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown'))
last_health_check: TIMESTAMPTZ
response_time_ms: INTEGER
success_rate: NUMERIC(5,2) DEFAULT 100.00
last_used_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
created_by: UUID REFERENCES profiles(id)
```

### C - contract_templates
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
name: TEXT NOT NULL
description: TEXT
contract_type: TEXT NOT NULL CHECK (contract_type IN ('residential', 'commercial', 'short_term', 'long_term', 'furnished', 'unfurnished'))
template_content: TEXT NOT NULL
required_fields: JSONB NOT NULL DEFAULT '[]'
optional_fields: JSONB DEFAULT '[]'
custom_clauses: JSONB DEFAULT '[]'
legal_references: JSONB DEFAULT '[]'
is_active: BOOLEAN DEFAULT true
is_default: BOOLEAN DEFAULT false
language: TEXT DEFAULT 'fr'
country_code: TEXT DEFAULT 'CI'
created_by: UUID REFERENCES profiles(id)
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### C - conversations
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
participant_1_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
participant_2_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
property_id: UUID REFERENCES properties(id) ON DELETE SET NULL
application_id: UUID REFERENCES rental_applications(id) ON DELETE SET NULL
last_message_at: TIMESTAMPTZ
participant_1_archived: BOOLEAN DEFAULT false
participant_2_archived: BOOLEAN DEFAULT false
participant_1_muted: BOOLEAN DEFAULT false
participant_2_muted: BOOLEAN DEFAULT false
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
UNIQUE(participant_1_id, participant_2_id, COALESCE(property_id, '00000000-0000-0000-0000-000000000000'::uuid))
CHECK (participant_1_id != participant_2_id)
```

### D - disputes
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
dispute_number: TEXT UNIQUE NOT NULL
lease_id: UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE
opened_by: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
against_user: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
dispute_type: TEXT NOT NULL CHECK (dispute_type IN ('rent_dispute', 'deposit_dispute', 'property_damage', 'contract_violation', 'noise_complaint', 'maintenance_issue', 'illegal_activity', 'other'))
description: TEXT NOT NULL
amount_disputed: DECIMAL(12,2)
urgency: TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent'))
evidence_files: JSONB DEFAULT '[]'
witnesses: JSONB DEFAULT '[]'
status: TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'investigation', 'mediation', 'legal_action', 'resolved', 'closed', 'dismissed'))
assigned_to: UUID REFERENCES trust_agents(id) ON DELETE SET NULL
assigned_at: TIMESTAMPTZ
resolution_type: TEXT
resolution_details: TEXT
resolution_amount: DECIMAL(12,2)
resolution_accepted_by_opener: BOOLEAN DEFAULT false
resolution_accepted_by_opponent: BOOLEAN DEFAULT false
resolution_final_document: TEXT
resolved_at: TIMESTAMPTZ
resolved_by: UUID REFERENCES profiles(id) ON DELETE SET NULL
escalated_to: UUID REFERENCES admin_users(id) ON DELETE SET NULL
escalated_at: TIMESTAMPTZ
escalation_reason: TEXT
legal_case_number: TEXT
court_documents: JSONB DEFAULT '[]'
opened_at: TIMESTAMPTZ DEFAULT now()
closed_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### F - feature_flags
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
key: TEXT UNIQUE NOT NULL
name: TEXT NOT NULL
description: TEXT
category: TEXT
is_enabled: BOOLEAN DEFAULT false
requires_credentials: BOOLEAN DEFAULT false
credentials_status: TEXT DEFAULT 'unknown' CHECK (credentials_status IN ('valid', 'invalid', 'missing', 'expired'))
rollout_percentage: INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
allowed_roles: JSONB DEFAULT '[]'
blocked_roles: JSONB DEFAULT '[]'
allowed_users: JSONB DEFAULT '[]'
metadata: JSONB DEFAULT '{}'
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
created_by: UUID REFERENCES profiles(id)
updated_by: UUID REFERENCES profiles(id)
```

### L - lease_contracts
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
contract_number: TEXT UNIQUE NOT NULL
property_id: UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE
owner_id: UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
tenant_id: UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
template_id: UUID REFERENCES contract_templates(id) ON DELETE SET NULL
contract_type: TEXT NOT NULL CHECK (contract_type IN ('residential', 'commercial', 'short_term', 'long_term', 'furnished', 'unfurnished'))
status: TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'active', 'expired', 'terminated', 'cancelled'))
start_date: DATE NOT NULL
end_date: DATE
monthly_rent: DECIMAL(12,2) NOT NULL CHECK (monthly_rent > 0)
deposit_amount: DECIMAL(12,2) DEFAULT 0 CHECK (deposit_amount >= 0)
charges_amount: DECIMAL(12,2) DEFAULT 0 CHECK (charges_amount >= 0)
payment_day: INTEGER DEFAULT 1 CHECK (payment_day >= 1 AND payment_day <= 31)
payment_method: TEXT DEFAULT 'mobile_money' CHECK (payment_method IN ('mobile_money', 'bank_transfer', 'cash', 'check'))
contract_content: TEXT
custom_clauses: JSONB DEFAULT '[]'
rent_increase_terms: JSONB DEFAULT '{}'
maintenance_terms: JSONB DEFAULT '{}'
termination_terms: JSONB DEFAULT '{}'
owner_signature: JSONB
tenant_signature: JSONB
witness_signatures: JSONB DEFAULT '[]'
owner_signed_at: TIMESTAMPTZ
tenant_signed_at: TIMESTAMPTZ
activation_date: TIMESTAMPTZ
termination_date: TIMESTAMPTZ
early_termination_fee: DECIMAL(12,2) DEFAULT 0
renewal_terms: JSONB DEFAULT '{}'
insurance_requirements: JSONB DEFAULT '{}'
metadata: JSONB DEFAULT '{}'
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### M - messages
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
sender_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
receiver_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
conversation_id: UUID REFERENCES conversations(id) ON DELETE CASCADE
application_id: UUID REFERENCES rental_applications(id) ON DELETE SET NULL
property_id: UUID REFERENCES properties(id) ON DELETE SET NULL
content: TEXT NOT NULL
message_type: TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'location', 'contact', 'system'))
attachments: JSONB DEFAULT '[]'
reply_to_id: UUID REFERENCES messages(id) ON DELETE SET NULL
is_read: BOOLEAN DEFAULT false
is_edited: BOOLEAN DEFAULT false
edit_count: INTEGER DEFAULT 0
deleted_by_sender: BOOLEAN DEFAULT false
deleted_by_receiver: BOOLEAN DEFAULT false
read_at: TIMESTAMPTZ
edited_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ DEFAULT now()
```

### N - notifications
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
type: TEXT NOT NULL
title: TEXT NOT NULL
message: TEXT NOT NULL
channels: JSONB DEFAULT '["in_app"]'
read: BOOLEAN DEFAULT false
read_at: TIMESTAMPTZ
action_url: TEXT
action_label: TEXT
action_data: JSONB DEFAULT '{}'
metadata: JSONB DEFAULT '{}'
priority: TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
expires_at: TIMESTAMPTZ
sent_via_email: BOOLEAN DEFAULT false
sent_via_sms: BOOLEAN DEFAULT false
sent_via_push: BOOLEAN DEFAULT false
sent_via_whatsapp: BOOLEAN DEFAULT false
email_sent_at: TIMESTAMPTZ
sms_sent_at: TIMESTAMPTZ
push_sent_at: TIMESTAMPTZ
whatsapp_sent_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ DEFAULT now()
```

### P - properties
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
owner_id: UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
title: TEXT NOT NULL
description: TEXT
address: TEXT NOT NULL
city: TEXT NOT NULL
neighborhood: TEXT
postal_code: TEXT
country: TEXT DEFAULT 'CI'
latitude: DECIMAL(10, 8)
longitude: DECIMAL(11, 8)
property_type: TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'studio', 'loft', 'duplex', 'penthouse', 'commercial', 'office', 'retail', 'warehouse', 'land', 'other'))
status: TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'under_contract', 'maintenance', 'unavailable', 'draft', 'archived'))
bedrooms: INTEGER DEFAULT 0 CHECK (bedrooms >= 0)
bathrooms: INTEGER DEFAULT 0 CHECK (bathrooms >= 0)
surface_area: DECIMAL(8,2)
surface_unit: TEXT DEFAULT 'm²' CHECK (surface_unit IN ('m²', 'ft²'))
lot_size: DECIMAL(10,2)
year_built: INTEGER CHECK (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM CURRENT_DATE) + 10)
year_renovated: INTEGER CHECK (year_renovated >= 1800 AND year_renovated <= EXTRACT(YEAR FROM CURRENT_DATE) + 10)
monthly_rent: DECIMAL(12,2) CHECK (monthly_rent > 0)
deposit_amount: DECIMAL(12,2) DEFAULT 0 CHECK (deposit_amount >= 0)
charges_amount: DECIMAL(12,2) DEFAULT 0 CHECK (charges_amount >= 0)
agency_fee: DECIMAL(5,2) DEFAULT 0 CHECK (agency_fee >= 0 AND agency_fee <= 100)
furnishing: TEXT CHECK (furnishing IN ('unfurnished', 'partially_furnished', 'fully_furnished'))
parking_spaces: INTEGER DEFAULT 0
has_elevator: BOOLEAN DEFAULT false
has_balcony: BOOLEAN DEFAULT false
has_terrace: BOOLEAN DEFAULT false
has_garden: BOOLEAN DEFAULT false
has_pool: BOOLEAN DEFAULT false
has_air_conditioning: BOOLEAN DEFAULT false
has_heating: BOOLEAN DEFAULT false
has_security_system: BOOLEAN DEFAULT false
pets_allowed: BOOLEAN DEFAULT true
smoking_allowed: BOOLEAN DEFAULT false
minimum_lease_months: INTEGER DEFAULT 12
available_from: DATE
images: JSONB DEFAULT '[]'
main_image: TEXT
virtual_tour_url: TEXT
video_url: TEXT
floor_plan_url: TEXT
energy_rating: TEXT
features: JSONB DEFAULT '[]'
amenities: JSONB DEFAULT '[]'
nearby_places: JSONB DEFAULT '[]'
transportation: JSONB DEFAULT '[]'
schools: JSONB DEFAULT '[]'
view_count: INTEGER DEFAULT 0
favorite_count: INTEGER DEFAULT 0
inquiry_count: INTEGER DEFAULT 0
visit_count: INTEGER DEFAULT 0
application_count: INTEGER DEFAULT 0
rating: DECIMAL(3,2) DEFAULT 0
review_count: INTEGER DEFAULT 0
is_featured: BOOLEAN DEFAULT false
is_verified: BOOLEAN DEFAULT false
verification_level: TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'standard', 'premium'))
listing_boost_expires_at: TIMESTAMPTZ
last_viewed_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### R - rental_applications
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
property_id: UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE
applicant_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
status: TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn', 'expired'))
priority: INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5)
cover_letter: TEXT
application_data: JSONB DEFAULT '{}'
financial_info: JSONB DEFAULT '{}'
employment_info: JSONB DEFAULT '{}'
references: JSONB DEFAULT '[]'
documents: JSONB DEFAULT '[]'
background_check_consent: BOOLEAN DEFAULT false
credit_check_consent: BOOLEAN DEFAULT false
application_score: INTEGER DEFAULT 0
auto_evaluated: BOOLEAN DEFAULT false
owner_notes: TEXT
application_fee_paid: BOOLEAN DEFAULT false
application_fee_amount: DECIMAL(8,2) DEFAULT 0
viewing_scheduled: BOOLEAN DEFAULT false
viewing_date: TIMESTAMPTZ
response_deadline: TIMESTAMPTZ
accepted_at: TIMESTAMPTZ
rejected_at: TIMESTAMPTZ
withdrawn_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### T - trust_agents
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id: UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
agent_code: TEXT UNIQUE NOT NULL
full_name: TEXT NOT NULL
email: TEXT UNIQUE NOT NULL
phone: TEXT
specialties: JSONB DEFAULT '[]'
languages: JSONB DEFAULT '[]'
status: TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended', 'terminated'))
working_hours: JSONB DEFAULT '{}'
timezone: TEXT DEFAULT 'Africa/Abidjan'
total_validations: INTEGER DEFAULT 0
total_mediations: INTEGER DEFAULT 0
total_moderations: INTEGER DEFAULT 0
successful_validations: INTEGER DEFAULT 0
successful_mediations: INTEGER DEFAULT 0
avg_validation_time_hours: DECIMAL(5,2) DEFAULT 0
avg_mediation_resolution_days: DECIMAL(5,2) DEFAULT 0
satisfaction_score: DECIMAL(3,2) DEFAULT 0
response_time_avg_minutes: DECIMAL(5,2) DEFAULT 0
can_validate: BOOLEAN DEFAULT false
can_mediate: BOOLEAN DEFAULT false
can_moderate: BOOLEAN DEFAULT false
can_manage_agents: BOOLEAN DEFAULT false
can_handle_disputes: BOOLEAN DEFAULT false
verification_level: TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'standard', 'advanced', 'expert'))
service_areas: JSONB DEFAULT '[]'
max_cases_per_month: INTEGER DEFAULT 50
rating: DECIMAL(3,2) DEFAULT 0
review_count: INTEGER DEFAULT 0
salary_type: TEXT DEFAULT 'commission' CHECK (salary_type IN ('fixed', 'commission', 'hybrid'))
salary_fixed_amount: DECIMAL(12,2) DEFAULT 0
commission_rate: DECIMAL(5,2) DEFAULT 0
performance_bonus_rate: DECIMAL(5,2) DEFAULT 0
hire_date: DATE
probation_end_date: DATE
contract_document: TEXT
background_check_completed: BOOLEAN DEFAULT false
training_completed: BOOLEAN DEFAULT false
certifications: JSONB DEFAULT '[]
last_active_at: TIMESTAMPTZ
termination_date: DATE
termination_reason: TEXT
rehire_eligible: BOOLEAN DEFAULT true
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### U - user_verifications
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id: UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
verification_level: TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'standard', 'premium'))
identity_status: TEXT DEFAULT 'pending' CHECK (identity_status IN ('pending', 'verified', 'rejected', 'expired'))
address_status: TEXT DEFAULT 'pending' CHECK (address_status IN ('pending', 'verified', 'rejected', 'expired'))
income_status: TEXT DEFAULT 'pending' CHECK (income_status IN ('pending', 'verified', 'rejected', 'expired'))
criminal_status: TEXT DEFAULT 'pending' CHECK (criminal_status IN ('pending', 'verified', 'rejected', 'expired'))
oneci_status: TEXT DEFAULT 'pending' CHECK (oneci_status IN ('pending', 'verified', 'rejected', 'expired'))
oneci_verified_at: TIMESTAMPTZ
oneci_document_url: TEXT
oneci_expiry_date: DATE
oneci_number: TEXT
cnam_status: TEXT DEFAULT 'pending' CHECK (cnam_status IN ('pending', 'verified', 'rejected', 'expired'))
cnam_verified_at: TIMESTAMPTZ
cnam_document_url: TEXT
cnam_policy_number: TEXT
cnam_expiry_date: DATE
employer_status: TEXT DEFAULT 'pending' CHECK (employer_status IN ('pending', 'verified', 'rejected', 'expired'))
employer_verified_at: TIMESTAMPTZ
employer_name: TEXT
employer_phone: TEXT
employer_address: TEXT
employment_status: TEXT
employment_start_date: DATE
monthly_income: DECIMAL(10,2)
income_document_url: TEXT
guarantor_name: TEXT
guarantor_phone: TEXT
guarantor_email: TEXT
guarantor_relationship: TEXT
guarantor_income: DECIMAL(10,2)
guarantor_document_url: TEXT
tenant_score: INTEGER DEFAULT 0
profile_completeness_score: INTEGER DEFAULT 0
payment_reliability_score: INTEGER DEFAULT 0
rental_history_score: INTEGER DEFAULT 0
background_check_passed: BOOLEAN DEFAULT false
risk_level: TEXT DEFAULT 'unknown' CHECK (risk_level IN ('low', 'medium', 'high', 'unknown'))
verification_notes: TEXT
auto_approved: BOOLEAN DEFAULT false
manual_review_required: BOOLEAN DEFAULT false
next_review_date: DATE
last_score_update: TIMESTAMPTZ
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### V - visits
```sql
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
property_id: UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE
visitor_id: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
owner_id: UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
visit_type: TEXT DEFAULT 'physical' CHECK (visit_type IN ('physical', 'virtual', 'hybrid'))
visit_date: DATE NOT NULL
visit_time: TIME NOT NULL
duration_minutes: INTEGER DEFAULT 30
status: TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'))
visitor_notes: TEXT
owner_notes: TEXT
feedback: TEXT
rating: INTEGER CHECK (rating >= 1 AND rating <= 5)
would_rent: BOOLEAN
concerns: JSONB DEFAULT '[]'
meeting_point: TEXT
special_instructions: TEXT
confirmed_at: TIMESTAMPTZ
started_at: TIMESTAMPTZ
completed_at: TIMESTAMPTZ
cancelled_at: TIMESTAMPTZ
cancelled_by: UUID REFERENCES auth.users(id)
cancellation_reason: TEXT
cancellation_fee: DECIMAL(8,2) DEFAULT 0
rescheduled_from: UUID REFERENCES visits(id)
rescheduled_to: UUID REFERENCES visits(id)
reminder_sent_24h: BOOLEAN DEFAULT false
reminder_sent_2h: BOOLEAN DEFAULT false
reminder_sent_30min: BOOLEAN DEFAULT false
virtual_meeting_url: TEXT
virtual_meeting_id: TEXT
virtual_meeting_password: TEXT
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

---

## 🔤 TYPES DE DONNÉES

### Types PostgreSQL Utilisés
- **UUID**: Identifiants uniques primaires
- **TEXT**: Données textuelles (noms, descriptions, adresses)
- **INTEGER**: Nombres entiers (compteurs, scores, IDs)
- **DECIMAL(p,s)**: Montants monétaires (p: précision, s: échelle)
- **BOOLEAN**: États binaires (true/false)
- **DATE**: Dates sans heure
- **TIMESTAMPTZ**: Timestamps avec timezone
- **JSONB**: Données structurées flexibles
- **INET**: Adresses IP
- **ENUM**: Valeurs prédéfinies

### Contraintes Commones
- **PRIMARY KEY**: Clé primaire UUID auto-générée
- **FOREIGN KEY**: Références à d'autres tables
- **UNIQUE**: Valeurs uniques
- **CHECK**: Validation de valeurs
- **NOT NULL**: Champs obligatoires
- **DEFAULT**: Valeurs par défaut

---

## 📊 INDEX ET PERFORMANCE

### Index Stratégiques
- **Clés étrangères**: Toutes les FK sont indexées
- **Recherche**: city, status, property_type, created_at
- **Filtrage**: user_id, owner_id, tenant_id
- **Géospatiaux**: latitude/longitude propriétés
- **Composite**: Requêtes complexes multi-colonnes

### Index Exemples
```sql
-- Index simples
CREATE INDEX idx_properties_city_status ON properties(city, status);
CREATE INDEX idx_leases_dates ON leases(start_date, end_date);

-- Index composites
CREATE INDEX idx_rental_applications_property_status ON rental_applications(property_id, application_status, created_at DESC);

-- Index uniques
CREATE UNIQUE INDEX idx_user_verifications_user_id ON user_verifications(user_id);
CREATE UNIQUE INDEX idx_property_favorites_user_property ON property_favorites(user_id, property_id);
```

---

## 🛡️ SÉCURITÉ ET VALIDATION

### Validation des Données
- **ENUM**: Contrôle des valeurs autorisées
- **CHECK**: Validation logique (montants positifs, dates valides)
- **NOT NULL**: Champs obligatoires
- **UNIQUE**: Éviter les doublons
- **FOREIGN KEY**: Intégrité référentielle

### Patterns de Sécurité
- **Row Level Security**: Accès par rôle
- **Timestamps**: Audit trail automatique
- **Soft Deletes**: Préservation des données
- **Encryption**: Données sensibles protégées

---

*Ce dictionnaire sera mis à jour régulièrement avec l'évolution de la base de données*