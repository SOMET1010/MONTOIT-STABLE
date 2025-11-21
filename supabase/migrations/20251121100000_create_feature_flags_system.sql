-- ============================================================================
-- MIGRATION: Système de Feature Flags
-- Date: 21 novembre 2025
-- Auteur: Manus AI
-- Description: Système complet de gestion des fonctionnalités activables/désactivables
-- ============================================================================

-- ============================================================================
-- SECTION 1: TABLE FEATURE_FLAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  requires_credentials BOOLEAN DEFAULT false,
  credentials_status TEXT CHECK (credentials_status IN ('not_configured', 'sandbox', 'production')) DEFAULT 'not_configured',
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  allowed_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_category ON feature_flags(category);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- ============================================================================
-- SECTION 2: TABLE FEATURE_FLAG_HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flag_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('enabled', 'disabled', 'updated', 'created')),
  previous_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);

-- Index pour l'historique
CREATE INDEX idx_feature_flag_history_flag_id ON feature_flag_history(feature_flag_id);
CREATE INDEX idx_feature_flag_history_changed_at ON feature_flag_history(changed_at DESC);

-- ============================================================================
-- SECTION 3: TABLE FEATURE_FLAG_OVERRIDES
-- ============================================================================

-- Permet de surcharger un flag pour un utilisateur spécifique (A/B testing)
CREATE TABLE IF NOT EXISTS feature_flag_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(feature_flag_id, user_id)
);

-- Index pour les overrides
CREATE INDEX idx_feature_flag_overrides_user_id ON feature_flag_overrides(user_id);
CREATE INDEX idx_feature_flag_overrides_flag_id ON feature_flag_overrides(feature_flag_id);

-- ============================================================================
-- SECTION 4: FONCTION POUR VÉRIFIER UN FEATURE FLAG
-- ============================================================================

CREATE OR REPLACE FUNCTION check_feature_flag(
  flag_key TEXT,
  user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
  override_record RECORD;
  user_role TEXT;
BEGIN
  -- Récupérer le flag
  SELECT * INTO flag_record FROM feature_flags WHERE key = flag_key;
  
  -- Si le flag n'existe pas, retourner false par défaut
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Vérifier s'il y a un override pour cet utilisateur
  IF user_id IS NOT NULL THEN
    SELECT * INTO override_record 
    FROM feature_flag_overrides 
    WHERE feature_flag_id = flag_record.id 
      AND feature_flag_overrides.user_id = check_feature_flag.user_id
      AND (expires_at IS NULL OR expires_at > NOW());
    
    IF FOUND THEN
      RETURN override_record.is_enabled;
    END IF;
  END IF;
  
  -- Si le flag n'est pas activé globalement, retourner false
  IF NOT flag_record.is_enabled THEN
    RETURN false;
  END IF;
  
  -- Vérifier les rôles autorisés
  IF array_length(flag_record.allowed_roles, 1) > 0 AND user_id IS NOT NULL THEN
    SELECT ur.name INTO user_role
    FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = check_feature_flag.user_id
    LIMIT 1;
    
    IF user_role IS NULL OR NOT (user_role = ANY(flag_record.allowed_roles)) THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Vérifier le rollout percentage (A/B testing)
  IF flag_record.rollout_percentage < 100 AND user_id IS NOT NULL THEN
    -- Utiliser un hash du user_id pour déterminer si l'utilisateur est dans le rollout
    IF (hashtext(user_id::TEXT) % 100) >= flag_record.rollout_percentage THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 5: FONCTION POUR LOGGER LES CHANGEMENTS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_feature_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO feature_flag_history (feature_flag_id, action, new_value, changed_by)
    VALUES (NEW.id, 'created', to_jsonb(NEW), NEW.created_by);
  ELSIF TG_OP = 'UPDATE' THEN
    -- Détecter si le flag a été activé ou désactivé
    IF OLD.is_enabled != NEW.is_enabled THEN
      INSERT INTO feature_flag_history (feature_flag_id, action, previous_value, new_value, changed_by)
      VALUES (
        NEW.id,
        CASE WHEN NEW.is_enabled THEN 'enabled' ELSE 'disabled' END,
        to_jsonb(OLD),
        to_jsonb(NEW),
        NEW.updated_by
      );
    ELSE
      INSERT INTO feature_flag_history (feature_flag_id, action, previous_value, new_value, changed_by)
      VALUES (NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), NEW.updated_by);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_feature_flag_change
  AFTER INSERT OR UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION log_feature_flag_change();

-- ============================================================================
-- SECTION 6: RLS (ROW LEVEL SECURITY)
-- ============================================================================

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_overrides ENABLE ROW LEVEL SECURITY;

-- Politique feature_flags: Lecture publique, modification admin uniquement
CREATE POLICY "Anyone can view feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique feature_flag_history: Admins uniquement
CREATE POLICY "Only admins can view feature flag history"
  ON feature_flag_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique feature_flag_overrides: Utilisateur voit ses overrides, admins voient tout
CREATE POLICY "Users can view own overrides"
  ON feature_flag_overrides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all overrides"
  ON feature_flag_overrides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- ============================================================================
-- SECTION 7: INSERTION DES FEATURE FLAGS PAR DÉFAUT
-- ============================================================================

-- Catégorie: Vérifications d'Identité
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('oneci_verification', 'Vérification ONECI (NNI)', 'Vérification du Numéro National d''Identification via l''API ONECI', 'verification', false, true, 'not_configured'),
('facial_verification', 'Vérification Biométrique', 'Vérification faciale via Smile ID ou NeoFace', 'verification', false, true, 'not_configured'),
('cnam_verification', 'Vérification CNAM', 'Vérification de la Carte Nationale d''Assurance Maladie', 'verification', false, true, 'not_configured'),
('passport_verification', 'Vérification Passeport', 'Vérification du passeport via OCR', 'verification', true, false, 'production');

-- Catégorie: Signature Électronique
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('cryptoneo_signature', 'Signature CEV CryptoNeo', 'Signature électronique avec Certificat Électronique de Validité', 'signature', false, true, 'not_configured'),
('electronic_signature', 'Signature Électronique Simple', 'Signature électronique sans CEV (fallback)', 'signature', true, false, 'production');

-- Catégorie: Paiements
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('intouch_payment', 'Paiements InTouch', 'Paiements Mobile Money via InTouch (Orange, MTN, Moov, Wave)', 'payment', false, true, 'not_configured'),
('orange_money', 'Orange Money', 'Paiements via Orange Money', 'payment', false, true, 'not_configured'),
('mtn_money', 'MTN Money', 'Paiements via MTN Money', 'payment', false, true, 'not_configured'),
('moov_money', 'Moov Money', 'Paiements via Moov Money', 'payment', false, true, 'not_configured'),
('wave_payment', 'Wave', 'Paiements via Wave', 'payment', false, true, 'not_configured'),
('split_payment', 'Split Payment (99%/1%)', 'Répartition automatique propriétaire/plateforme', 'payment', false, false, 'production');

-- Catégorie: Notifications
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('email_notifications', 'Notifications Email', 'Notifications par email via Resend', 'notification', true, true, 'production'),
('sms_notifications', 'Notifications SMS', 'Notifications par SMS via InTouch', 'notification', false, true, 'not_configured'),
('push_notifications', 'Notifications Push', 'Notifications push via Firebase', 'notification', false, true, 'not_configured'),
('whatsapp_notifications', 'Notifications WhatsApp', 'Notifications via WhatsApp Business API', 'notification', false, true, 'not_configured');

-- Catégorie: Intelligence Artificielle
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('ai_chatbot', 'Chatbot IA (SUTA)', 'Assistant virtuel intelligent', 'ai', true, true, 'production'),
('ai_recommendations', 'Recommandations IA', 'Recommandations personnalisées de propriétés', 'ai', true, false, 'production'),
('ai_property_description', 'Description IA', 'Génération automatique de descriptions de propriétés', 'ai', true, true, 'production'),
('ai_image_generation', 'Génération d''Images IA', 'Génération d''images de propriétés via IA', 'ai', false, true, 'not_configured');

-- Catégorie: Carte et Localisation
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('mapbox_integration', 'Carte Mapbox', 'Carte interactive avec Mapbox', 'map', true, true, 'production'),
('map_clustering', 'Clustering de Carte', 'Regroupement des marqueurs sur la carte', 'map', false, false, 'production'),
('map_heatmap', 'Heatmap des Prix', 'Carte de chaleur des prix', 'map', false, false, 'production'),
('map_directions', 'Itinéraires', 'Calcul d''itinéraires vers les propriétés', 'map', false, true, 'not_configured');

-- Catégorie: Agences
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('agency_management', 'Gestion d''Agences', 'Fonctionnalités pour les agences immobilières', 'agency', true, false, 'production'),
('agency_commissions', 'Commissions d''Agences', 'Calcul automatique des commissions', 'agency', true, false, 'production'),
('agency_team', 'Équipes d''Agences', 'Gestion des membres d''équipe', 'agency', true, false, 'production');

-- Catégorie: Maintenance (MonArtisan)
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('monartisan', 'MonArtisan', 'Marketplace d''artisans pour la maintenance', 'maintenance', true, false, 'production'),
('monartisan_payment', 'Paiement MonArtisan', 'Paiement des artisans via InTouch', 'maintenance', false, true, 'not_configured'),
('monartisan_warranty', 'Garantie Travaux', 'Système de garantie des travaux', 'maintenance', false, false, 'production');

-- Catégorie: Analytics
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('analytics_dashboard', 'Dashboard Analytics', 'Tableaux de bord analytiques', 'analytics', true, false, 'production'),
('realtime_analytics', 'Analytics Temps Réel', 'Métriques en temps réel', 'analytics', false, false, 'production'),
('export_reports', 'Export de Rapports', 'Export CSV/Excel des rapports', 'analytics', true, false, 'production');

-- Catégorie: Modération
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status) VALUES
('content_moderation', 'Modération de Contenu', 'Modération automatique et manuelle', 'moderation', true, false, 'production'),
('ai_moderation', 'Modération IA', 'Modération automatique par IA', 'moderation', false, true, 'not_configured'),
('fraud_detection', 'Détection de Fraude', 'Détection automatique des fraudes', 'moderation', true, false, 'production');

-- Catégorie: Avancé
INSERT INTO feature_flags (key, name, description, category, is_enabled, requires_credentials, credentials_status, rollout_percentage) VALUES
('beta_features', 'Fonctionnalités Beta', 'Accès aux fonctionnalités en version beta', 'advanced', false, false, 'production', 10),
('ab_testing', 'A/B Testing', 'Tests A/B pour optimiser la conversion', 'advanced', false, false, 'production', 50),
('debug_mode', 'Mode Debug', 'Affichage des informations de debug', 'advanced', false, false, 'production', 0);

-- ============================================================================
-- COMMENTAIRES ET NOTES
-- ============================================================================

-- Ce système de feature flags permet de :
--
-- 1. ACTIVER/DÉSACTIVER des fonctionnalités sans redéployer
-- 2. GÉRER LES CREDENTIALS en indiquant si une fonctionnalité nécessite des clés API
-- 3. A/B TESTING avec rollout progressif (pourcentage)
-- 4. OVERRIDES par utilisateur pour tester avec des utilisateurs spécifiques
-- 5. HISTORIQUE complet des changements
-- 6. RESTRICTION PAR RÔLE pour limiter l'accès à certaines fonctionnalités
--
-- UTILISATION:
--
-- -- Vérifier un flag depuis SQL
-- SELECT check_feature_flag('oneci_verification', 'user-uuid');
--
-- -- Activer un flag
-- UPDATE feature_flags SET is_enabled = true WHERE key = 'oneci_verification';
--
-- -- Créer un override pour un utilisateur
-- INSERT INTO feature_flag_overrides (feature_flag_id, user_id, is_enabled, reason)
-- VALUES (
--   (SELECT id FROM feature_flags WHERE key = 'beta_features'),
--   'user-uuid',
--   true,
--   'Beta tester'
-- );
--
-- -- Voir l'historique d'un flag
-- SELECT * FROM feature_flag_history 
-- WHERE feature_flag_id = (SELECT id FROM feature_flags WHERE key = 'oneci_verification')
-- ORDER BY changed_at DESC;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

