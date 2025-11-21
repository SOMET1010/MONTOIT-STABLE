-- Migration SQL pour corriger les colonnes et valeurs ANSUT
-- Date: 21 novembre 2025
-- Auteur: Manus AI

-- ============================================
-- 1. Renommer les colonnes dans user_verifications
-- ============================================

-- Renommer ansut_certified en identity_verified
ALTER TABLE user_verifications 
  RENAME COLUMN ansut_certified TO identity_verified;

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN user_verifications.identity_verified IS 
  'Indique si l''identité de l''utilisateur a été vérifiée (ONECI + biométrie faciale)';

-- ============================================
-- 2. Mettre à jour le type user_type dans profiles
-- ============================================

-- Mettre à jour toutes les valeurs 'admin_ansut' en 'admin'
UPDATE profiles 
SET user_type = 'admin' 
WHERE user_type = 'admin_ansut';

-- Mettre à jour active_role si nécessaire
UPDATE profiles 
SET active_role = 'admin' 
WHERE active_role = 'admin_ansut';

-- ============================================
-- 3. Ajouter colonnes pour CEV optionnel ONECI
-- ============================================

-- Ajouter colonne pour indiquer si un CEV ONECI a été demandé
ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS oneci_cev_requested BOOLEAN DEFAULT FALSE;

-- Ajouter colonne pour le numéro CEV ONECI (optionnel)
ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS oneci_cev_number TEXT;

-- Ajouter colonne pour indiquer si les frais CEV ont été payés
ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS oneci_cev_fee_paid BOOLEAN DEFAULT FALSE;

-- Ajouter colonne pour le montant des frais CEV
ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS oneci_cev_fee_amount INTEGER DEFAULT 5000;

-- Ajouter commentaires
COMMENT ON COLUMN contracts.oneci_cev_requested IS 
  'Indique si un Certificat Électronique de Vérification (CEV) ONECI a été demandé (optionnel)';

COMMENT ON COLUMN contracts.oneci_cev_number IS 
  'Numéro du CEV ONECI si demandé (service optionnel fourni par l''ONECI)';

COMMENT ON COLUMN contracts.oneci_cev_fee_paid IS 
  'Indique si les frais du CEV ONECI ont été payés (5,000 FCFA)';

-- ============================================
-- 4. Ajouter colonne pour cachet électronique
-- ============================================

-- Ajouter colonne pour le numéro du cachet électronique
ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS electronic_stamp_number TEXT;

-- Ajouter colonne pour la date d'application du cachet
ALTER TABLE contracts 
  ADD COLUMN IF NOT EXISTS electronic_stamp_applied_at TIMESTAMP WITH TIME ZONE;

-- Ajouter commentaires
COMMENT ON COLUMN contracts.electronic_stamp_number IS 
  'Numéro du cachet électronique visible appliqué au contrat';

COMMENT ON COLUMN contracts.electronic_stamp_applied_at IS 
  'Date et heure d''application du cachet électronique';

-- ============================================
-- 5. Mettre à jour les contraintes et index
-- ============================================

-- Créer un index sur identity_verified pour les requêtes de vérification
CREATE INDEX IF NOT EXISTS idx_user_verifications_identity_verified 
  ON user_verifications(identity_verified);

-- Créer un index sur oneci_cev_number pour les recherches
CREATE INDEX IF NOT EXISTS idx_contracts_oneci_cev_number 
  ON contracts(oneci_cev_number) 
  WHERE oneci_cev_number IS NOT NULL;

-- Créer un index sur electronic_stamp_number
CREATE INDEX IF NOT EXISTS idx_contracts_electronic_stamp_number 
  ON contracts(electronic_stamp_number) 
  WHERE electronic_stamp_number IS NOT NULL;

-- ============================================
-- 6. Mettre à jour les RLS policies si nécessaire
-- ============================================

-- Les policies existantes devraient continuer à fonctionner
-- car nous avons seulement renommé des colonnes

-- ============================================
-- 7. Vérifications post-migration
-- ============================================

-- Vérifier que toutes les colonnes existent
DO $$
BEGIN
  -- Vérifier user_verifications.identity_verified
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_verifications' 
    AND column_name = 'identity_verified'
  ) THEN
    RAISE EXCEPTION 'Colonne identity_verified manquante dans user_verifications';
  END IF;

  -- Vérifier contracts.oneci_cev_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' 
    AND column_name = 'oneci_cev_number'
  ) THEN
    RAISE EXCEPTION 'Colonne oneci_cev_number manquante dans contracts';
  END IF;

  -- Vérifier contracts.electronic_stamp_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contracts' 
    AND column_name = 'electronic_stamp_number'
  ) THEN
    RAISE EXCEPTION 'Colonne electronic_stamp_number manquante dans contracts';
  END IF;

  RAISE NOTICE '✅ Migration terminée avec succès !';
END $$;

-- ============================================
-- 8. Statistiques post-migration
-- ============================================

-- Compter les utilisateurs avec identité vérifiée
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE identity_verified = true) as verified_users,
  ROUND(100.0 * COUNT(*) FILTER (WHERE identity_verified = true) / COUNT(*), 2) as verification_rate
FROM user_verifications;

-- Compter les contrats avec CEV ONECI
SELECT 
  COUNT(*) as total_contracts,
  COUNT(*) FILTER (WHERE oneci_cev_requested = true) as cev_requested,
  COUNT(*) FILTER (WHERE oneci_cev_number IS NOT NULL) as cev_issued
FROM contracts;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
