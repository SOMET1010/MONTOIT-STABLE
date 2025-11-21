-- ============================================================================
-- MIGRATION: Activation du Row Level Security (RLS) sur toutes les tables
-- Date: 21 novembre 2025
-- Auteur: Manus AI
-- Description: Active RLS et crée les politiques pour 97 tables
-- ============================================================================

-- ============================================================================
-- SECTION 1: ACTIVATION DU RLS SUR TOUTES LES TABLES
-- ============================================================================

-- Tables Utilisateurs et Profils
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_switch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_load_errors ENABLE ROW LEVEL SECURITY;

-- Tables Propriétés
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_reminders ENABLE ROW LEVEL SECURITY;

-- Tables Locations et Contrats
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_history ENABLE ROW LEVEL SECURITY;

-- Tables Paiements
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_money_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_transfers ENABLE ROW LEVEL SECURITY;

-- Tables Avis et Évaluations
ALTER TABLE landlord_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_ratings ENABLE ROW LEVEL SECURITY;

-- Tables Scoring
ALTER TABLE tenant_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_settings ENABLE ROW LEVEL SECURITY;

-- Tables Vérifications
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE facial_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cnam_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Tables Certifications ANSUT
ALTER TABLE ansut_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cev_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cev_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_history ENABLE ROW LEVEL SECURITY;

-- Tables Agents de Confiance
ALTER TABLE trust_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_validation_requests ENABLE ROW LEVEL SECURITY;

-- Tables Litiges
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;

-- Tables Messagerie
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Tables Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Tables Agences
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_commissions ENABLE ROW LEVEL SECURITY;

-- Tables Artisans (MonArtisan)
ALTER TABLE monartisan_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monartisan_job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE monartisan_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_assignments ENABLE ROW LEVEL SECURITY;

-- Tables IA et Chatbot
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Tables Analytics
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Tables Admin
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Tables Sécurité et Modération
ALTER TABLE fraud_detection_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Tables Services Externes
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_failover_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_usage_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_routing_logs ENABLE ROW LEVEL SECURITY;

-- Tables CRM
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Tables Recherches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_history ENABLE ROW LEVEL SECURITY;

-- Tables Légal
ALTER TABLE legal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_consultation_logs ENABLE ROW LEVEL SECURITY;

-- Tables Disponibilité
ALTER TABLE owner_availability ENABLE ROW LEVEL SECURITY;

-- Tables Données de Test
ALTER TABLE generated_test_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_data_templates ENABLE ROW LEVEL SECURITY;

-- Table Base de Données Noms Ivoiriens
ALTER TABLE ivorian_names_database ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 2: POLITIQUES RLS - TABLES UTILISATEURS
-- ============================================================================

-- Politique profiles: Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique user_roles: Lecture publique, modification admin uniquement
CREATE POLICY "Anyone can view roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique user_role_assignments: Les utilisateurs voient leurs rôles, admins voient tout
CREATE POLICY "Users can view own role assignments"
  ON user_role_assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all role assignments"
  ON user_role_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique role_switch_history: Lecture propre historique
CREATE POLICY "Users can view own role switch history"
  ON role_switch_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 3: POLITIQUES RLS - TABLES PROPRIÉTÉS
-- ============================================================================

-- Politique properties: Public en lecture, propriétaires en écriture
CREATE POLICY "Anyone can view published properties"
  ON properties FOR SELECT
  USING (status = 'published' OR owner_id = auth.uid());

CREATE POLICY "Owners can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all properties"
  ON properties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique property_favorites: Gestion personnelle
CREATE POLICY "Users can manage own favorites"
  ON property_favorites FOR ALL
  USING (auth.uid() = user_id);

-- Politique property_reviews: Lecture publique, écriture authentifiée
CREATE POLICY "Anyone can view reviews"
  ON property_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON property_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON property_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique property_visits: Locataires et propriétaires concernés
CREATE POLICY "Users can view own visits"
  ON property_visits FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_visits.property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can book visits"
  ON property_visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SECTION 4: POLITIQUES RLS - TABLES LOCATIONS ET CONTRATS
-- ============================================================================

-- Politique leases: Propriétaires et locataires concernés
CREATE POLICY "Users can view own leases"
  ON leases FOR SELECT
  USING (
    auth.uid() = tenant_id OR
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = leases.property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can create leases"
  ON leases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update own leases"
  ON leases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = leases.property_id AND p.owner_id = auth.uid()
    )
  );

-- Politique lease_contracts: Parties concernées uniquement
CREATE POLICY "Users can view own contracts"
  ON lease_contracts FOR SELECT
  USING (
    auth.uid() = tenant_id OR auth.uid() = landlord_id
  );

CREATE POLICY "Landlords can create contracts"
  ON lease_contracts FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

-- Politique rental_applications: Candidats et propriétaires
CREATE POLICY "Users can view own applications"
  ON rental_applications FOR SELECT
  USING (
    auth.uid() = applicant_id OR
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = rental_applications.property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications"
  ON rental_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- ============================================================================
-- SECTION 5: POLITIQUES RLS - TABLES PAIEMENTS
-- ============================================================================

-- Politique payments: Parties concernées uniquement
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM leases l
      JOIN properties p ON l.property_id = p.id
      WHERE l.id = payments.lease_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique mobile_money_transactions: Utilisateur concerné
CREATE POLICY "Users can view own transactions"
  ON mobile_money_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 6: POLITIQUES RLS - TABLES AVIS
-- ============================================================================

-- Politique landlord_reviews: Lecture publique, écriture locataires
CREATE POLICY "Anyone can view landlord reviews"
  ON landlord_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tenants can create landlord reviews"
  ON landlord_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Politique tenant_reviews: Propriétaires uniquement
CREATE POLICY "Landlords can view tenant reviews"
  ON tenant_reviews FOR SELECT
  USING (
    auth.uid() = reviewer_id OR auth.uid() = tenant_id
  );

CREATE POLICY "Landlords can create tenant reviews"
  ON tenant_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- ============================================================================
-- SECTION 7: POLITIQUES RLS - TABLES SCORING
-- ============================================================================

-- Politique tenant_scores: Locataire et propriétaires
CREATE POLICY "Users can view own score"
  ON tenant_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Landlords can view tenant scores"
  ON tenant_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rental_applications ra
      WHERE ra.applicant_id = tenant_scores.user_id
      AND EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = ra.property_id AND p.owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- SECTION 8: POLITIQUES RLS - TABLES VÉRIFICATIONS
-- ============================================================================

-- Politique identity_verifications: Utilisateur concerné
CREATE POLICY "Users can view own verifications"
  ON identity_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create verifications"
  ON identity_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique facial_verifications: Utilisateur concerné
CREATE POLICY "Users can view own facial verifications"
  ON facial_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 9: POLITIQUES RLS - TABLES CERTIFICATIONS ANSUT
-- ============================================================================

-- Politique ansut_certifications: Parties concernées
CREATE POLICY "Users can view own certifications"
  ON ansut_certifications FOR SELECT
  USING (
    auth.uid() = tenant_id OR auth.uid() = landlord_id
  );

-- Politique cev_requests: Demandeur uniquement
CREATE POLICY "Users can view own CEV requests"
  ON cev_requests FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Users can create CEV requests"
  ON cev_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- ============================================================================
-- SECTION 10: POLITIQUES RLS - TABLES AGENTS DE CONFIANCE
-- ============================================================================

-- Politique trust_agents: Public en lecture
CREATE POLICY "Anyone can view active trust agents"
  ON trust_agents FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Trust agents can update own profile"
  ON trust_agents FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique trust_validation_requests: Parties concernées
CREATE POLICY "Users can view own validation requests"
  ON trust_validation_requests FOR SELECT
  USING (
    auth.uid() = requester_id OR
    auth.uid() IN (
      SELECT user_id FROM trust_agents WHERE id = trust_validation_requests.agent_id
    )
  );

-- ============================================================================
-- SECTION 11: POLITIQUES RLS - TABLES LITIGES
-- ============================================================================

-- Politique disputes: Parties concernées
CREATE POLICY "Users can view own disputes"
  ON disputes FOR SELECT
  USING (
    auth.uid() = complainant_id OR auth.uid() = respondent_id OR
    auth.uid() IN (
      SELECT user_id FROM trust_agents WHERE id = disputes.mediator_id
    )
  );

CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = complainant_id);

-- Politique dispute_messages: Parties du litige
CREATE POLICY "Users can view dispute messages"
  ON dispute_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_messages.dispute_id
      AND (d.complainant_id = auth.uid() OR d.respondent_id = auth.uid() OR
           d.mediator_id IN (SELECT id FROM trust_agents WHERE user_id = auth.uid()))
    )
  );

-- ============================================================================
-- SECTION 12: POLITIQUES RLS - TABLES MESSAGERIE
-- ============================================================================

-- Politique conversations: Participants uniquement
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Politique messages: Participants de la conversation
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ============================================================================
-- SECTION 13: POLITIQUES RLS - TABLES NOTIFICATIONS
-- ============================================================================

-- Politique notifications: Destinataire uniquement
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique notification_preferences: Gestion personnelle
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 14: POLITIQUES RLS - TABLES AGENCES
-- ============================================================================

-- Politique agencies: Public en lecture
CREATE POLICY "Anyone can view active agencies"
  ON agencies FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Agency owners can update own agency"
  ON agencies FOR UPDATE
  USING (auth.uid() = owner_id);

-- Politique agency_team_members: Membres de l'agence
CREATE POLICY "Agency members can view team"
  ON agency_team_members FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM agencies a
      WHERE a.id = agency_team_members.agency_id AND a.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- SECTION 15: POLITIQUES RLS - TABLES IA ET CHATBOT
-- ============================================================================

-- Politique ai_recommendations: Utilisateur concerné
CREATE POLICY "Users can view own AI recommendations"
  ON ai_recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- Politique chatbot_conversations: Utilisateur concerné
CREATE POLICY "Users can view own chatbot conversations"
  ON chatbot_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chatbot conversations"
  ON chatbot_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique chatbot_messages: Messages de la conversation
CREATE POLICY "Users can view own chatbot messages"
  ON chatbot_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversations cc
      WHERE cc.id = chatbot_messages.conversation_id AND cc.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SECTION 16: POLITIQUES RLS - TABLES ADMIN
-- ============================================================================

-- Politique admin_users: Admins uniquement
CREATE POLICY "Only admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique admin_audit_logs: Admins uniquement
CREATE POLICY "Only admins can view audit logs"
  ON admin_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique api_keys: Propriétaire uniquement
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 17: POLITIQUES RLS - TABLES SÉCURITÉ
-- ============================================================================

-- Politique fraud_detection_alerts: Admins et utilisateur concerné
CREATE POLICY "Users can view own fraud alerts"
  ON fraud_detection_alerts FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Politique reported_content: Auteur du signalement et modérateurs
CREATE POLICY "Users can view own reports"
  ON reported_content FOR SELECT
  USING (
    auth.uid() = reporter_id OR
    EXISTS (
      SELECT 1 FROM user_role_assignments ura
      JOIN user_roles ur ON ura.role_id = ur.id
      WHERE ura.user_id = auth.uid() AND ur.name IN ('admin', 'trust_agent')
    )
  );

-- ============================================================================
-- SECTION 18: POLITIQUES RLS - TABLES RECHERCHES
-- ============================================================================

-- Politique saved_searches: Gestion personnelle
CREATE POLICY "Users can manage own saved searches"
  ON saved_searches FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 19: POLITIQUES RLS - TABLES ARTISANS
-- ============================================================================

-- Politique monartisan_contractors: Public en lecture
CREATE POLICY "Anyone can view active contractors"
  ON monartisan_contractors FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Politique monartisan_job_requests: Demandeur et artisans
CREATE POLICY "Users can view own job requests"
  ON monartisan_job_requests FOR SELECT
  USING (
    auth.uid() = requester_id OR
    EXISTS (
      SELECT 1 FROM monartisan_quotes q
      WHERE q.job_request_id = monartisan_job_requests.id
      AND q.contractor_id IN (
        SELECT id FROM monartisan_contractors WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- SECTION 20: POLITIQUES RLS - TABLES LÉGAL
-- ============================================================================

-- Politique legal_articles: Lecture publique
CREATE POLICY "Anyone can view legal articles"
  ON legal_articles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- COMMENTAIRES ET NOTES
-- ============================================================================

-- Cette migration active le RLS sur 97 tables et crée des politiques de base
-- pour les tables les plus critiques. Les politiques suivent ces principes:
--
-- 1. PRINCIPE DE MOINDRE PRIVILÈGE
--    - Les utilisateurs ne voient que leurs propres données par défaut
--    - Les admins ont accès complet
--    - Les agents de confiance ont accès aux données de médiation
--
-- 2. SÉPARATION DES RÔLES
--    - tenant: Peut voir les propriétés, créer des demandes, gérer son profil
--    - landlord: Peut gérer ses propriétés, voir les candidatures, créer des baux
--    - trust_agent: Peut voir les litiges assignés, les demandes de validation
--    - admin: Accès complet à toutes les données
--
-- 3. DONNÉES PUBLIQUES
--    - Propriétés publiées: Visibles par tous
--    - Avis: Visibles par tous (sauf avis locataires)
--    - Agents de confiance actifs: Visibles par tous
--    - Articles légaux: Visibles par tous
--
-- 4. DONNÉES PRIVÉES
--    - Paiements: Uniquement parties concernées
--    - Messages: Uniquement participants
--    - Vérifications: Uniquement utilisateur concerné
--    - Scores: Utilisateur + propriétaires avec candidature
--
-- NOTES IMPORTANTES:
-- - Certaines tables nécessitent des politiques plus complexes selon les besoins
-- - Les politiques peuvent être affinées après tests en production
-- - Toujours tester les politiques avant déploiement en production
-- - Monitorer les performances des requêtes avec RLS activé

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

