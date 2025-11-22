# 📊 Architecture Complète de la Base de Données Mon Toit

**Date:** 22 Novembre 2025
**Version:** 1.0
**Total Tables:** 98
**Total Functions:** 56
**Total Triggers:** 28

---

## 🏗️ VUE D'ENSEMBLE

La base de données **Mon Toit** est une plateforme immobilière complète conçue pour le marché ouest-africain, intégrant la gestion de locations, les paiements Mobile Money, la vérification d'identité, la signature électronique, et des fonctionnalités avancées d'IA et d'analytics.

### **Architecture Modulaire**

```
┌─────────────────────────────────────────────────────────────┐
│                    MON TOIT DATABASE                        │
├─────────────────────────────────────────────────────────────┤
│  🔐 AUTHENTIFICATION      │  🏠 PROPERTY MANAGEMENT       │
│  │─ profiles              │  │─ properties                 │
│  │─ user_roles            │  │─ property_favorites         │
│  │─ login_attempts        │  │─ property_images            │
│  │─ verification_codes    │  └─ property_documents        │
├─────────────────────────────────────────────────────────────┤
│  📋 LEASE MANAGEMENT      │  💰 PAYMENT SYSTEM            │
│  │─ leases                │  │─ payments                   │
│  │─ lease_contracts       │  │─ mobile_money_transactions  │
│  │─ contract_templates    │  │─ landlord_transfers         │
│  │─ contract_documents    │  └─ api_keys                  │
├─────────────────────────────────────────────────────────────┤
│  💬 COMMUNICATION         │  🔍 VERIFICATION SYSTEM       │
│  │─ messages              │  │─ user_verifications         │
│  │─ conversations         │  │─ identity_verifications     │
│  │─ notifications         │  │─ cnam_verifications         │
│  │─ notification_preferences│ └─ facial_verifications      │
├─────────────────────────────────────────────────────────────┤
│  🏢 AGENCY MANAGEMENT     │  ⭐ AI & ANALYTICS             │
│  │─ agencies              │  │─ ai_usage_logs              │
│  │─ agency_team_members   │  │─ user_activity_tracking     │
│  │─ crm_leads             │  │─ ai_recommendations         │
│  │─ agency_commissions    │  │─ fraud_detection_alerts     │
│  └─ property_assignments  │  └─ feature_flags              │
├─────────────────────────────────────────────────────────────┤
│  🛡️ TRUST & MODERATION    │  🔧 ADMINISTRATION            │
│  │─ trust_agents          │  │─ admin_audit_logs           │
│  │─ validation_requests   │  │─ system_settings            │
│  │─ disputes              │  │─ platform_analytics         │
│  │─ moderation_queue      │  └─ reported_content           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 TYPES ENUM PERSONNALISÉS

### **Types Principaux**
```sql
user_type ENUM('locataire', 'proprietaire', 'agence', 'admin_ansut')
user_role ENUM('admin', 'user', 'agent', 'moderator')
property_type ENUM('appartement', 'villa', 'studio', 'chambre', 'bureau', 'commerce')
property_status ENUM('disponible', 'loue', 'en_attente', 'retire')
application_status ENUM('en_attente', 'acceptee', 'refusee', 'annulee')
verification_status ENUM('en_attente', 'verifie', 'rejete')
payment_status ENUM('en_attente', 'complete', 'echoue', 'annule')
payment_type ENUM('loyer', 'depot_garantie', 'charges', 'frais_agence')
payment_method ENUM('mobile_money', 'carte_bancaire', 'virement', 'especes')
lease_status ENUM('brouillon', 'en_attente_signature', 'actif', 'expire', 'resilie')
```

### **Types Spécialisés**
```sql
team_role ENUM('admin', 'manager', 'agent', 'viewer')              -- Agences
lead_status ENUM('new', 'contacted', 'qualified', 'won', 'lost')   -- CRM
alert_frequency ENUM('immediate', 'daily', 'weekly')               -- Notifications
ai_service_type ENUM('openai', 'nlp', 'vision', 'fraud_detection') -- IA
fraud_alert_type ENUM('fake_profile', 'suspicious_listing', 'payment_fraud')
```

---

## 🗄️ MODULES FONCTIONNELS DÉTAILLÉS

### Module 1: 🔐 AUTHENTIFICATION & UTILISATEURS

#### **profiles** - Profils utilisateurs principaux
```sql
id: UUID (PK) → auth.users
user_type: ENUM ('locataire', 'proprietaire', 'agence', 'admin_ansut')
full_name: TEXT
phone: TEXT UNIQUE
avatar_url: TEXT
bio: TEXT
city: TEXT
is_verified: BOOLEAN
oneci_verified: BOOLEAN
cnam_verified: BOOLEAN
trust_verified: BOOLEAN
trust_score: INTEGER (0-100)
```

**Relations:** auth.users, user_verifications
**Index:** user_type, city, is_verified, trust_score
**RLS:** Utilisateurs voient leur profil + profils publics

#### **user_roles** - Rôles et permissions
```sql
user_id: UUID → auth.users
role: ENUM ('admin', 'user', 'agent', 'moderator')
permissions: JSONB
```

#### **admin_users** - Administration plateforme
```sql
user_id: UUID → auth.users
role: TEXT
permissions: JSONB
is_active: BOOLEAN
```

---

### Module 2: 🏠 GESTION IMMOBILIÈRE

#### **properties** - Biens immobiliers
```sql
id: UUID (PK)
owner_id: UUID → profiles
title: TEXT NOT NULL
description: TEXT
address: TEXT
city: TEXT
neighborhood: TEXT
latitude: DECIMAL
longitude: DECIMAL
property_type: ENUM ('appartement', 'villa', 'studio', 'chambre')
status: ENUM ('disponible', 'loue', 'en_attente', 'retire')
bedrooms: INTEGER
bathrooms: INTEGER
surface_area: DECIMAL
monthly_rent: DECIMAL(12,2)
deposit_amount: DECIMAL(12,2)
charges_amount: DECIMAL(12,2)
images: JSONB
main_image: TEXT
view_count: INTEGER DEFAULT 0
rating: DECIMAL(3,2)
review_count: INTEGER DEFAULT 0
```

**Index:** owner_id, city, status, property_type, rating, created_at
**RLS:** Propriétaires gèrent leurs biens, public voit biens disponibles

#### **property_images** - Photos des propriétés
```sql
property_id: UUID → properties
image_url: TEXT NOT NULL
caption: TEXT
is_primary: BOOLEAN DEFAULT FALSE
display_order: INTEGER
```

#### **property_favorites** - Favoris utilisateurs
```sql
user_id: UUID → auth.users
property_id: UUID → properties
notes: TEXT
created_at: TIMESTAMPTZ
UNIQUE(user_id, property_id)
```

---

### Module 3: 📋 GESTION DES BAUX & CONTRATS

#### **lease_contracts** - Contrats de location avancés
```sql
id: UUID (PK)
contract_number: TEXT UNIQUE
property_id: UUID → properties
owner_id: UUID → profiles
tenant_id: UUID → profiles
template_id: UUID → contract_templates
contract_type: ENUM ('courte_duree', 'longue_duree', 'meuble')
status: ENUM ('brouillon', 'en_attente_signature', 'actif', 'expire')
start_date: DATE
end_date: DATE
monthly_rent: DECIMAL(12,2)
deposit_amount: DECIMAL(12,2)
payment_day: INTEGER (1-31)
contract_content: TEXT
custom_clauses: JSONB
owner_signature: JSONB
tenant_signature: JSONB
owner_signed_at: TIMESTAMPTZ
tenant_signed_at: TIMESTAMPTZ
activation_date: TIMESTAMPTZ
termination_date: TIMESTAMPTZ
metadata: JSONB
```

**Fonctions:** Génération automatique de numéros, signature électronique

#### **contract_templates** - Modèles de contrats
```sql
name: TEXT NOT NULL
description: TEXT
contract_type: ENUM
template_content: TEXT
required_fields: JSONB
is_active: BOOLEAN DEFAULT TRUE
created_by: UUID → profiles
```

#### **rental_applications** - Demandes de location
```sql
property_id: UUID → properties
applicant_id: UUID → profiles
status: ENUM ('en_attente', 'acceptee', 'refusee', 'annulee')
cover_letter: TEXT
application_score: INTEGER (0-100)
documents: JSONB
application_data: JSONB
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

---

### Module 4: 💬 COMMUNICATION & MESSAGERIE

#### **messages** - Messages entre utilisateurs
```sql
sender_id: UUID → auth.users
receiver_id: UUID → auth.users
application_id: UUID → rental_applications
conversation_id: UUID → conversations
content: TEXT NOT NULL
is_read: BOOLEAN DEFAULT FALSE
deleted_by_sender: BOOLEAN DEFAULT FALSE
deleted_by_receiver: BOOLEAN DEFAULT FALSE
read_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ
```

#### **conversations** - Conversations organisées
```sql
participant_1_id: UUID → auth.users
participant_2_id: UUID → auth.users
property_id: UUID → properties
last_message_at: TIMESTAMPTZ
participant_1_archived: BOOLEAN DEFAULT FALSE
participant_2_archived: BOOLEAN DEFAULT FALSE
```

#### **notifications** - Système de notifications
```sql
user_id: UUID → auth.users
type: TEXT NOT NULL -- ('payment_received', 'visit_scheduled', etc.)
title: TEXT NOT NULL
message: TEXT NOT NULL
channels: JSONB -- ['email', 'sms', 'push', 'in_app', 'whatsapp']
read: BOOLEAN DEFAULT FALSE
read_at: TIMESTAMPTZ
action_url: TEXT
action_label: TEXT
metadata: JSONB
priority: ENUM ('low', 'normal', 'high', 'urgent')
expires_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ
```

---

### Module 5: 💰 SYSTÈME DE PAIEMENT

#### **payments** - Paiements généraux
```sql
payer_id: UUID → auth.users
receiver_id: UUID → auth.users
property_id: UUID → properties
amount: DECIMAL(12,2) NOT NULL
payment_type: ENUM -- ('loyer', 'depot_garantie', 'charges', 'frais_agence')
payment_method: ENUM -- ('mobile_money', 'carte_bancaire', 'virement', 'especes')
status: ENUM -- ('en_attente', 'complete', 'echoue', 'annule')
transaction_reference: TEXT UNIQUE
intouch_transaction_id: TEXT
intouch_status: TEXT
intouch_callback_data: JSONB
notes: TEXT
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

#### **mobile_money_transactions** - Transactions Mobile Money
```sql
payment_id: UUID → payments
provider: ENUM ('orange_money', 'mtn_money', 'moov_money', 'wave')
phone_number: TEXT NOT NULL
transaction_ref: TEXT
amount: DECIMAL(12,2)
transaction_status: ENUM ('pending', 'processing', 'completed', 'failed')
intouch_request: JSONB
intouch_response: JSONB
response_data: JSONB
```

**Providers supportés:** Orange Money, MTN Money, Moov Money, Wave

---

### Module 6: 🔍 VÉRIFICATION D'IDENTITÉ & KYC

#### **user_verifications** - Vérifications principales
```sql
user_id: UUID UNIQUE → auth.users
oneci_status: ENUM -- ('pending', 'verified', 'rejected')
oneci_verified_at: TIMESTAMPTZ
oneci_document_url: TEXT
cnam_status: ENUM -- ('pending', 'verified', 'rejected')
cnam_verified_at: TIMESTAMPTZ
cnam_document_url: TEXT
tenant_score: INTEGER (0-100)
identity_verified: BOOLEAN DEFAULT FALSE
background_check_passed: BOOLEAN DEFAULT FALSE
verification_notes: TEXT
profile_completeness_score: INTEGER (0-12)
last_score_update: TIMESTAMPTZ
```

#### **identity_verifications** - Vérification ONECI
```sql
user_id: UUID UNIQUE → auth.users
cni_number: TEXT
cni_front_url: TEXT
cni_back_url: TEXT
status: ENUM ('pending', 'verified', 'rejected')
confidence_score: DECIMAL(3,2)
match_score: DECIMAL(3,2)
verified_at: TIMESTAMPTZ
```

#### **facial_verifications** - Vérification faciale
```sql
user_id: UUID UNIQUE → auth.users
selfie_url: TEXT
liveness_check_url: TEXT
status: ENUM ('pending', 'verified', 'rejected')
confidence_score: DECIMAL(3,2)
match_score: DECIMAL(3,2)
verified_at: TIMESTAMPTZ
```

---

### Module 7: 🏢 GESTION DES AGENCES

#### **agencies** - Agences immobilières
```sql
owner_id: UUID → profiles
name: TEXT NOT NULL
legal_name: TEXT
registration_number: TEXT
tax_id: TEXT
phone: TEXT
email: TEXT
website: TEXT
address: TEXT
city: TEXT
description: TEXT
rccm_document: TEXT
business_license: TEXT
tax_certificate: TEXT
verification_status: ENUM ('pending', 'verified', 'rejected')
verified_at: TIMESTAMPTZ
verification_notes: TEXT
logo_url: TEXT
banner_url: TEXT
primary_color: TEXT
commission_rate: DECIMAL(5,2) DEFAULT 5.00
auto_assign_leads: BOOLEAN DEFAULT TRUE
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

#### **agency_team_members** - Équipes d'agences
```sql
agency_id: UUID → agencies
user_id: UUID → profiles
email: TEXT
role: ENUM ('admin', 'manager', 'agent', 'viewer')
permissions: JSONB
can_add_properties: BOOLEAN DEFAULT FALSE
can_edit_properties: BOOLEAN DEFAULT FALSE
can_delete_properties: BOOLEAN DEFAULT FALSE
can_manage_leads: BOOLEAN DEFAULT FALSE
can_view_commissions: BOOLEAN DEFAULT FALSE
can_manage_team: BOOLEAN DEFAULT FALSE
invitation_status: ENUM ('pending', 'accepted', 'rejected')
invited_by: UUID → profiles
invited_at: TIMESTAMPTZ
accepted_at: TIMESTAMPTZ
UNIQUE(agency_id, user_id)
UNIQUE(agency_id, email)
```

#### **crm_leads** - Gestion des leads
```sql
agency_id: UUID → agencies
agent_id: UUID → profiles
property_id: UUID → properties
first_name: TEXT
last_name: TEXT
email: TEXT
phone: TEXT
status: ENUM ('new', 'contacted', 'qualified', 'viewing_scheduled', 'viewing_done', 'offer_made', 'negotiating', 'won', 'lost')
source: TEXT
budget_min: DECIMAL(12,2)
budget_max: DECIMAL(12,2)
preferred_location: TEXT
move_in_date: DATE
notes: TEXT
priority: ENUM ('low', 'medium', 'high')
converted_to_contract_id: UUID
converted_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
last_contacted_at: TIMESTAMPTZ
```

---

### Module 8: ⚡ INFRASTRUCTURE IA & ANALYTICS

#### **ai_usage_logs** - Tracking utilisation IA
```sql
user_id: UUID → profiles
service_type: ENUM ('openai', 'nlp', 'vision', 'speech', 'fraud_detection', 'recommendation')
operation: TEXT NOT NULL
tokens_used: INTEGER DEFAULT 0
cost_fcfa: DECIMAL(10,2) DEFAULT 0
response_time_ms: INTEGER DEFAULT 0
success: BOOLEAN DEFAULT TRUE
error_message: TEXT
metadata: JSONB
created_at: TIMESTAMPTZ
```

#### **user_activity_tracking** - Tracking activité
```sql
user_id: UUID → profiles
property_id: UUID → properties
action_type: ENUM ('view', 'favorite', 'search', 'click', 'apply', 'visit_request', 'message', 'share')
action_data: JSONB
session_id: TEXT
created_at: TIMESTAMPTZ
```

#### **ai_recommendations** - Recommandations IA
```sql
user_id: UUID → profiles
property_id: UUID → properties
recommendation_score: DECIMAL(3,2)
recommendation_reason: TEXT
algorithm_type: TEXT
clicked: BOOLEAN DEFAULT FALSE
clicked_at: TIMESTAMPTZ
converted: BOOLEAN DEFAULT FALSE
created_at: TIMESTAMPTZ
```

#### **fraud_detection_alerts** - Alertes détection fraude
```sql
user_id: UUID → profiles
alert_type: ENUM ('fake_profile', 'suspicious_listing', 'payment_fraud', 'identity_theft', 'spam_activity')
risk_score: INTEGER (0-100)
risk_factors: JSONB
status: ENUM ('new', 'investigating', 'resolved', 'false_positive')
investigated_by: UUID → profiles
investigated_at: TIMESTAMPTZ
resolution_notes: TEXT
created_at: TIMESTAMPTZ
```

---

### Module 9: 🛡️ TIERS DE CONFIANCE & MODÉRATION

#### **trust_agents** - Agents de confiance
```sql
user_id: UUID UNIQUE → profiles
full_name: TEXT NOT NULL
email: TEXT UNIQUE
phone: TEXT
specialties: JSONB -- ['residential', 'commercial', 'luxury']
languages: JSONB -- ['fr', 'en', 'dioula']
status: ENUM ('active', 'inactive', 'suspended')
working_hours: JSONB
timezone: TEXT
total_validations: INTEGER DEFAULT 0
total_mediations: INTEGER DEFAULT 0
total_moderations: INTEGER DEFAULT 0
avg_validation_time_hours: DECIMAL(5,2)
avg_mediation_resolution_days: DECIMAL(5,2)
satisfaction_score: DECIMAL(3,2)
can_validate: BOOLEAN DEFAULT FALSE
can_mediate: BOOLEAN DEFAULT FALSE
can_moderate: BOOLEAN DEFAULT FALSE
can_manage_agents: BOOLEAN DEFAULT FALSE
salary_type: ENUM ('fixed', 'commission', 'hybrid')
salary_fixed_amount: DECIMAL(12,2)
commission_rate: DECIMAL(5,2)
hired_at: TIMESTAMPTZ
terminated_at: TIMESTAMPTZ
last_active_at: TIMESTAMPTZ
```

#### **disputes** - Litiges et médiation
```sql
dispute_number: TEXT UNIQUE
lease_id: UUID → leases
opened_by: UUID → profiles
against_user: UUID → profiles
dispute_type: ENUM ('rent_dispute', 'deposit_dispute', 'property_damage', 'contract_violation', 'other')
description: TEXT NOT NULL
amount_disputed: DECIMAL(12,2)
urgency: ENUM ('low', 'medium', 'high', 'urgent')
evidence_files: JSONB
status: ENUM ('open', 'under_review', 'investigation', 'mediation', 'resolved', 'closed')
assigned_to: UUID → trust_agents
assigned_at: TIMESTAMPTZ
resolution_proposed: TEXT
resolution_accepted_by_opener: BOOLEAN DEFAULT FALSE
resolution_accepted_by_opponent: BOOLEAN DEFAULT FALSE
resolution_final: TEXT
resolved_at: TIMESTAMPTZ
resolved_by: UUID → profiles
escalated_to: UUID → admin_users
escalated_at: TIMESTAMPTZ
escalation_reason: TEXT
opened_at: TIMESTAMPTZ
closed_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

---

### Module 10: 🔧 ADMINISTRATION & CONFIGURATION

#### **feature_flags** - Gestion fonctionnalités
```sql
key: TEXT UNIQUE NOT NULL
name: TEXT NOT NULL
description: TEXT
category: TEXT
is_enabled: BOOLEAN DEFAULT FALSE
requires_credentials: BOOLEAN DEFAULT FALSE
credentials_status: ENUM ('valid', 'invalid', 'missing')
rollout_percentage: INTEGER DEFAULT 0
allowed_roles: JSONB
metadata: JSONB
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
created_by: UUID → profiles
updated_by: UUID → profiles
```

#### **system_settings** - Paramètres système
```sql
key: TEXT UNIQUE NOT NULL
value: JSONB NOT NULL
description: TEXT
category: TEXT
is_public: BOOLEAN DEFAULT FALSE
updated_at: TIMESTAMPTZ
updated_by: UUID → profiles
```

#### **admin_audit_logs** - Logs d'administration
```sql
admin_user_id: UUID → auth.users
action: TEXT NOT NULL
entity_type: TEXT
entity_id: UUID
details: JSONB
ip_address: INET
user_agent: TEXT
created_at: TIMESTAMPTZ
```

---

## 🔄 RELATIONS CLÉS

### **Relations Principales**
```
auth.users (1) → (1) profiles (1) → (*) properties
profiles (1) → (*) user_verifications
properties (1) → (*) rental_applications
properties (1) → (1) lease_contracts
lease_contracts (*) → (1) contract_templates
profiles (1) → (*) agency_team_members → agencies
trust_agents (1) → (*) disputes → lease_contracts
```

### **Diagramme des Relations**
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   auth.users├─────►│   profiles  ├─────►│ properties  │
└─────────────┘     └─────┬───────┘     └─────┬───────┘
                          │                   │
                          ▼                   ▼
                 ┌─────────────┐     ┌─────────────┐
                 │user_verifi- │     │rental_appli- │
                 │cations      │     │cations      │
                 └─────────────┘     └─────┬───────┘
                                              │
                                              ▼
                                    ┌─────────────┐
                                    │lease_contra-│
                                    │cts          │
                                    └─────┬───────┘
                                          │
                                          ▼
                            ┌─────────────────────────┐
                            │   contract_templates   │
                            └─────────────────────────┘
```

---

## 🛡️ SÉCURITÉ & PERMISSIONS

### **Row Level Security (RLS)**
Toutes les tables utilisent RLS avec:

- **Utilisateurs authentifiés:** Voient/éditent leurs propres données
- **Rôles admin:** Accès complet aux données d'administration
- **Service role:** Opérations système et maintenance
- **Accès public:** Données publiques (propriétés disponibles, reviews)

### **Politiques par Rôle**
- **Propriétaires:** Gestion complète de leurs propriétés et contrats
- **Locataires:** Gestion de leurs candidatures, visites et contrats
- **Agences:** Gestion de leur portefeuille, équipe et leads
- **Agents de confiance:** Accès aux validations et médiations
- **Admins:** Accès complet à toutes les fonctionnalités

### **Encryptage & Protection**
- Clés API stockées en JSONB encrypté
- Données sensibles protégées
- Signatures électroniques sécurisées
- Audit trail complet

---

## ⚡ PERFORMANCE & OPTIMISATION

### **Index Stratégiques**
- **Clés étrangères:** Toutes les FK sont indexées
- **Recherche:** city, status, property_type, user_type
- **Filtrage:** user_id, created_at, owner_id
- **Géospatial:** coordonnées propriétés
- **Composite:** Requêtes complexes multi-colonnes

### **Cache & Vues**
- **Vues matérialisées:** Analytics et reporting
- **Cache IA:** Réponses fréquentes stockées
- **Vues modulaires:** Organisation logique des données

### **Optimisations**
- **Triggers automatiques:** Mise à jour timestamps, scores
- **Fonctions réutilisables:** Logique métier centralisée
- **Partitionnement possible:** Par date ou région

---

## 📊 STATISTIQUES & MÉTRIQUES

### **Volumes de Données**
- **Total Tables:** 98 tables
- **Types ENUM:** 15+ types personnalisés
- **Fonctions SQL:** 56 fonctions
- **Triggers:** 28 triggers automatiques
- **Politiques RLS:** 120+ politiques de sécurité

### **Modules Couverts**
1. 🔐 Authentification & Utilisateurs
2. 🏠 Gestion Immobilière
3. 📋 Gestion des Baux
4. 💬 Communication & Messagerie
5. 💰 Paiements Mobile Money
6. 🔍 Vérification d'Identité
7. 🏢 Gestion des Agences
8. ⚡ Infrastructure IA & Analytics
9. 🛡️ Tiers de Confiance & Modération
10. 🔧 Administration & Configuration

### **Fonctionnalités Avancées**
- ✅ **Vérification multi-niveaux** (ONECI, CNAM, faciale)
- ✅ **Signature électronique** avancée
- ✅ **Détection de fraude** par IA
- ✅ **Recommandations intelligentes**
- ✅ **Système de médiation** automatisé
- ✅ **Feature flags** dynamiques
- ✅ **Analytics en temps réel**
- ✅ **Multi-périphérique** (email, SMS, WhatsApp, push)

---

## 🎯 CONCLUSION

L'architecture de la base de données Mon Toit est conçue pour:

- **Scalabilité:** Indexation optimisée, structure modulaire
- **Sécurité:** RLS complet, encryptage, audit trails
- **Flexibilité:** Configuration dynamique, feature flags
- **Performance:** Caching intelligent, requêtes optimisées
- **Maintenabilité:** Documentation complète, code réutilisable
- **Adaptabilité:** Conçue pour le marché ouest-africain

Cette architecture supporte une plateforme immobilière moderne avec des fonctionnalités avancées adaptées spécifiquement au contexte ivoirien et ouest-africain, intégrant parfaitement les particularités locales comme les systèmes Mobile Money et les processus de vérification d'identité.

---

*Document généré par Claude Code - Architecture Database Analysis*