# 🗄️ SCHÉMA COMPLET BASE DE DONNÉES - Mon Toit

**Date :** 23 novembre 2025  
**Version :** 3.1  
**SGBD :** PostgreSQL (Supabase)

---

## 📋 TABLE DES MATIÈRES

1. [Types Énumérés](#types-énumérés)
2. [Tables Principales](#tables-principales)
3. [Tables de Relations](#tables-de-relations)
4. [Tables de Système](#tables-de-système)
5. [Fonctions](#fonctions)
6. [Triggers](#triggers)
7. [Politiques RLS](#politiques-rls)

---

## 🎯 TYPES ÉNUMÉRÉS

```sql
-- Types utilisateur
CREATE TYPE user_type AS ENUM ('locataire', 'proprietaire', 'agent', 'garant');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Types propriété
CREATE TYPE property_type AS ENUM ('appartement', 'maison', 'studio', 'villa', 'duplex', 'bureau', 'commerce');
CREATE TYPE property_status AS ENUM ('disponible', 'loue', 'en_attente', 'retire');
CREATE TYPE property_category AS ENUM ('residential', 'commercial', 'mixed');

-- Types candidature
CREATE TYPE application_status AS ENUM ('en_attente', 'acceptee', 'refusee', 'annulee');

-- Types vérification
CREATE TYPE verification_status AS ENUM ('en_attente', 'verifie', 'rejete');

-- Types paiement
CREATE TYPE payment_status AS ENUM ('en_attente', 'complete', 'echoue', 'annule');
CREATE TYPE payment_type AS ENUM ('loyer', 'depot_garantie', 'charges', 'frais_agence');
CREATE TYPE payment_method AS ENUM ('mobile_money', 'carte_bancaire', 'virement', 'especes');

-- Types contrat
CREATE TYPE lease_status AS ENUM ('brouillon', 'en_attente_signature', 'actif', 'expire', 'resilie');
CREATE TYPE lease_type AS ENUM ('courte_duree', 'longue_duree');

-- Types maintenance
CREATE TYPE maintenance_status AS ENUM ('en_attente', 'en_cours', 'termine', 'annule');
CREATE TYPE maintenance_priority AS ENUM ('basse', 'moyenne', 'haute', 'urgente');

-- Types notification
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'push', 'in_app');
```

---

## 📊 TABLES PRINCIPALES

### 1. profiles
**Description :** Profils utilisateurs étendus

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  user_type user_type DEFAULT 'locataire',
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  oneci_verified BOOLEAN DEFAULT false,
  cnam_verified BOOLEAN DEFAULT false,
  profile_setup_completed BOOLEAN DEFAULT false,
  active_role user_type,
  
  -- Vérification faciale
  facial_verification_status verification_status DEFAULT 'en_attente',
  facial_verification_image_url TEXT,
  facial_verification_date TIMESTAMPTZ,
  facial_verification_score DECIMAL(5,2),
  
  -- Vérification OnECI
  oneci_number TEXT,
  oneci_verification_date TIMESTAMPTZ,
  oneci_data JSONB,
  
  -- Scoring
  trust_score INTEGER DEFAULT 0,
  reliability_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. properties
**Description :** Propriétés immobilières

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Informations de base
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  latitude DOUBLE PRECISION DEFAULT 5.3600,
  longitude DOUBLE PRECISION DEFAULT -4.0083,
  
  -- Type et statut
  property_type property_type NOT NULL,
  property_category property_category DEFAULT 'residential',
  status property_status DEFAULT 'disponible',
  
  -- Caractéristiques
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  surface_area DOUBLE PRECISION,
  has_parking BOOLEAN DEFAULT false,
  has_garden BOOLEAN DEFAULT false,
  is_furnished BOOLEAN DEFAULT false,
  has_ac BOOLEAN DEFAULT false,
  
  -- Prix
  monthly_rent DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  charges_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Médias
  images TEXT[] DEFAULT '{}',
  main_image TEXT,
  
  -- Statistiques
  view_count INTEGER DEFAULT 0,
  
  -- Vérification ANSUT
  ansut_verified BOOLEAN DEFAULT false,
  ansut_verification_date TIMESTAMPTZ,
  ansut_certificate_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. applications
**Description :** Candidatures de location

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  status application_status DEFAULT 'en_attente',
  message TEXT,
  
  -- Documents
  id_document_url TEXT,
  proof_of_income_url TEXT,
  proof_of_address_url TEXT,
  
  -- Scoring
  application_score INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. lease_contracts
**Description :** Contrats de location

```sql
CREATE TABLE lease_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  landlord_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Informations contrat
  lease_type lease_type NOT NULL,
  status lease_status DEFAULT 'brouillon',
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  signed_date TIMESTAMPTZ,
  
  -- Montants
  monthly_rent DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  charges_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Documents
  contract_url TEXT,
  signed_contract_url TEXT,
  
  -- Signature électronique (CryptoNeo/ANSUT)
  tenant_signature_status verification_status DEFAULT 'en_attente',
  landlord_signature_status verification_status DEFAULT 'en_attente',
  tenant_signature_date TIMESTAMPTZ,
  landlord_signature_date TIMESTAMPTZ,
  tenant_signature_certificate_url TEXT,
  landlord_signature_certificate_url TEXT,
  cryptoneo_transaction_id TEXT,
  
  -- Renouvellement
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_sent BOOLEAN DEFAULT false,
  renewal_notice_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. payments
**Description :** Paiements (InTouch)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_contract_id UUID REFERENCES lease_contracts ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  landlord_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Type et montant
  payment_type payment_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Statut
  status payment_status DEFAULT 'en_attente',
  payment_method payment_method,
  
  -- InTouch
  intouch_transaction_id TEXT,
  intouch_payment_url TEXT,
  intouch_status TEXT,
  intouch_response JSONB,
  
  -- Dates
  due_date DATE,
  paid_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 6. visits
**Description :** Visites de propriétés

```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Planification
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  
  -- Notes
  notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. messages
**Description :** Messagerie interne

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties ON DELETE SET NULL,
  
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8. maintenance_requests
**Description :** Demandes de maintenance

```sql
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  landlord_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority maintenance_priority DEFAULT 'moyenne',
  status maintenance_status DEFAULT 'en_attente',
  
  -- Images
  images TEXT[] DEFAULT '{}',
  
  -- Artisan (MonArtisan)
  artisan_id UUID REFERENCES auth.users ON DELETE SET NULL,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  -- Dates
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔗 TABLES DE RELATIONS

### 9. favorites
**Description :** Propriétés favorites

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, property_id)
);
```

### 10. property_alerts
**Description :** Alertes de recherche

```sql
CREATE TABLE property_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Critères
  city TEXT,
  neighborhood TEXT,
  property_type property_type,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  min_bedrooms INTEGER,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 11. saved_searches
**Description :** Recherches sauvegardées

```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  search_name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 12. reviews
**Description :** Avis et notes

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Type d'avis
  review_type TEXT, -- 'property', 'landlord', 'tenant'
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## ⚙️ TABLES DE SYSTÈME

### 13. api_keys
**Description :** Clés API des services externes

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  api_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Services configurés :**
- `brevo` - SMS
- `resend` - Emails
- `intouch` - Paiements & SMS
- `mapbox` - Cartes
- `cryptoneo` - Signature électronique

### 14. notifications
**Description :** Notifications système

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  channel notification_channel DEFAULT 'in_app',
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Métadonnées
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 15. sms_logs
**Description :** Logs des SMS envoyés

```sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  provider TEXT, -- 'brevo', 'intouch'
  provider_response JSONB,
  
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 16. email_logs
**Description :** Logs des emails envoyés

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  provider TEXT DEFAULT 'resend',
  provider_response JSONB,
  
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 17. user_roles
**Description :** Rôles utilisateurs

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'user',
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 18. login_attempts
**Description :** Tentatives de connexion

```sql
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_time TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN DEFAULT false,
  ip_address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 19. feature_flags
**Description :** Feature flags pour activer/désactiver des fonctionnalités

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  config JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 20. chatbot_conversations
**Description :** Conversations chatbot

```sql
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  messages JSONB[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 21. ai_recommendations
**Description :** Recommandations IA

```sql
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties ON DELETE CASCADE NOT NULL,
  
  score DECIMAL(5,2) NOT NULL,
  reasons JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔧 FONCTIONS PRINCIPALES

### update_updated_at()
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### handle_new_user()
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'locataire')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### increment_view_count()
```sql
CREATE OR REPLACE FUNCTION increment_view_count(property_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET view_count = view_count + 1
  WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### has_role()
```sql
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ⚡ TRIGGERS

```sql
-- Trigger pour nouveau utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger pour updated_at sur profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour updated_at sur properties
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour updated_at sur applications
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour updated_at sur lease_contracts
CREATE TRIGGER update_lease_contracts_updated_at
  BEFORE UPDATE ON lease_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 🔒 POLITIQUES RLS (Row Level Security)

**Toutes les tables ont RLS activé :**

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
```

**Exemples de politiques :**

```sql
-- Profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Properties
CREATE POLICY "Anyone can view available properties"
  ON properties FOR SELECT
  TO authenticated
  USING (status = 'disponible' OR owner_id = auth.uid());

CREATE POLICY "Owners can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Messages
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
```

---

## 📊 STATISTIQUES

**Nombre total de tables :** 21+  
**Nombre de types énumérés :** 15  
**Nombre de fonctions :** 10+  
**Nombre de triggers :** 10+  
**Nombre de politiques RLS :** 50+

---

## 🔗 RELATIONS PRINCIPALES

```
auth.users (Supabase Auth)
  ├── profiles (1:1)
  ├── properties (1:N) - owner_id
  ├── applications (1:N) - tenant_id
  ├── lease_contracts (1:N) - tenant_id, landlord_id
  ├── payments (1:N) - tenant_id, landlord_id
  ├── visits (1:N) - tenant_id
  ├── messages (1:N) - sender_id, receiver_id
  ├── favorites (1:N) - user_id
  ├── property_alerts (1:N) - user_id
  ├── saved_searches (1:N) - user_id
  ├── reviews (1:N) - reviewer_id, reviewee_id
  ├── notifications (1:N) - user_id
  └── maintenance_requests (1:N) - tenant_id, landlord_id

properties
  ├── applications (1:N)
  ├── lease_contracts (1:N)
  ├── visits (1:N)
  ├── favorites (1:N)
  ├── reviews (1:N)
  └── maintenance_requests (1:N)

lease_contracts
  └── payments (1:N)
```

---

## 🚀 SERVICES EXTERNES INTÉGRÉS

1. **Brevo** - Envoi SMS
2. **Resend** - Envoi emails
3. **InTouch** - Paiements mobile money
4. **Mapbox** - Cartes interactives
5. **CryptoNeo/ANSUT** - Signature électronique
6. **OnECI** - Vérification identité
7. **CNAM** - Vérification santé
8. **MonArtisan** - Maintenance

---

## 📝 NOTES

- **Toutes les dates** sont en `TIMESTAMPTZ` (timezone aware)
- **Tous les montants** sont en `DECIMAL(10,2)`
- **Toutes les tables** ont `created_at` et `updated_at` (sauf exceptions)
- **RLS activé** sur toutes les tables sensibles
- **Soft delete** non implémenté (utiliser `status` ou `is_active`)

---

**Document généré le 23 novembre 2025**  
**Version : 3.1**
