-- ============================================================================
-- SCRIPT SQL : MISE À JOUR DES CLÉS API APRÈS ROTATION
-- ============================================================================
-- Description : Met à jour la table api_keys après rotation des clés exposées
-- Date : 21 novembre 2025
-- Auteur : Manus AI
-- Version : 1.0
-- ============================================================================

-- ============================================================================
-- IMPORTANT : REMPLACEZ LES VALEURS CI-DESSOUS PAR VOS NOUVELLES CLÉS
-- ============================================================================

DO $$
DECLARE
  -- 🔴 REMPLACEZ CES VALEURS PAR VOS NOUVELLES CLÉS
  v_new_mapbox_token TEXT := 'VOTRE_NOUVEAU_TOKEN_MAPBOX';
  v_new_resend_key TEXT := 'VOTRE_NOUVELLE_CLE_RESEND';
  v_new_brevo_key TEXT := 'VOTRE_NOUVELLE_CLE_BREVO';
  
  -- Variables pour les anciennes clés (pour logging)
  v_old_mapbox_token TEXT;
  v_old_resend_key TEXT;
  v_old_brevo_key TEXT;
  
  -- Variables pour les IDs
  v_mapbox_id UUID;
  v_resend_id UUID;
  v_brevo_id UUID;
  
  -- Variables de contrôle
  v_rotation_date TIMESTAMP := NOW();
  v_rotation_user TEXT := current_user;
  v_rotation_reason TEXT := 'Incident de sécurité - Clés exposées dans Git';
BEGIN
  
  -- ============================================================================
  -- ÉTAPE 1 : VÉRIFICATIONS PRÉALABLES
  -- ============================================================================
  
  RAISE NOTICE '🔍 Étape 1/6 : Vérifications préalables...';
  
  -- Vérifier que les nouvelles valeurs ont été modifiées
  IF v_new_mapbox_token = 'VOTRE_NOUVEAU_TOKEN_MAPBOX' OR
     v_new_resend_key = 'VOTRE_NOUVELLE_CLE_RESEND' OR
     v_new_brevo_key = 'VOTRE_NOUVELLE_CLE_BREVO' THEN
    RAISE EXCEPTION '❌ ERREUR : Vous devez remplacer les valeurs par défaut par vos nouvelles clés !';
  END IF;
  
  -- Vérifier que la table api_keys existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
    RAISE EXCEPTION '❌ ERREUR : La table api_keys n''existe pas. Exécutez d''abord la migration de feature flags.';
  END IF;
  
  RAISE NOTICE '✅ Vérifications préalables OK';
  
  -- ============================================================================
  -- ÉTAPE 2 : SAUVEGARDE DES ANCIENNES CLÉS
  -- ============================================================================
  
  RAISE NOTICE '💾 Étape 2/6 : Sauvegarde des anciennes clés...';
  
  -- Récupérer les anciennes clés
  SELECT id, key_value INTO v_mapbox_id, v_old_mapbox_token
  FROM api_keys
  WHERE service_name = 'mapbox' AND key_name = 'public_token' AND is_active = true
  LIMIT 1;
  
  SELECT id, key_value INTO v_resend_id, v_old_resend_key
  FROM api_keys
  WHERE service_name = 'resend' AND key_name = 'api_key' AND is_active = true
  LIMIT 1;
  
  SELECT id, key_value INTO v_brevo_id, v_old_brevo_key
  FROM api_keys
  WHERE service_name = 'brevo' AND key_name = 'api_key' AND is_active = true
  LIMIT 1;
  
  -- Créer une table temporaire de backup
  CREATE TEMP TABLE IF NOT EXISTS api_keys_rotation_backup AS
  SELECT 
    id,
    service_name,
    key_name,
    key_value,
    environment,
    is_active,
    created_at,
    updated_at,
    v_rotation_date as backup_date,
    v_rotation_reason as backup_reason
  FROM api_keys
  WHERE id IN (v_mapbox_id, v_resend_id, v_brevo_id);
  
  RAISE NOTICE '✅ Anciennes clés sauvegardées dans api_keys_rotation_backup';
  RAISE NOTICE '   - Mapbox ID: %', v_mapbox_id;
  RAISE NOTICE '   - Resend ID: %', v_resend_id;
  RAISE NOTICE '   - Brevo ID: %', v_brevo_id;
  
  -- ============================================================================
  -- ÉTAPE 3 : DÉSACTIVATION DES ANCIENNES CLÉS
  -- ============================================================================
  
  RAISE NOTICE '🔒 Étape 3/6 : Désactivation des anciennes clés...';
  
  -- Désactiver les anciennes clés (ne pas supprimer pour l'audit)
  UPDATE api_keys
  SET 
    is_active = false,
    updated_at = v_rotation_date,
    notes = COALESCE(notes, '') || E'\n[' || v_rotation_date || '] Désactivée lors de la rotation - ' || v_rotation_reason
  WHERE id IN (v_mapbox_id, v_resend_id, v_brevo_id);
  
  RAISE NOTICE '✅ Anciennes clés désactivées (3 clés)';
  
  -- ============================================================================
  -- ÉTAPE 4 : CRÉATION DES NOUVELLES CLÉS
  -- ============================================================================
  
  RAISE NOTICE '🔑 Étape 4/6 : Création des nouvelles clés...';
  
  -- Insérer la nouvelle clé Mapbox
  INSERT INTO api_keys (
    service_name,
    key_name,
    key_value,
    environment,
    is_active,
    created_at,
    updated_at,
    notes
  ) VALUES (
    'mapbox',
    'public_token',
    v_new_mapbox_token,
    'production',
    true,
    v_rotation_date,
    v_rotation_date,
    'Créée lors de la rotation du ' || v_rotation_date || ' - ' || v_rotation_reason
  ) RETURNING id INTO v_mapbox_id;
  
  RAISE NOTICE '   ✅ Nouvelle clé Mapbox créée (ID: %)', v_mapbox_id;
  
  -- Insérer la nouvelle clé Resend
  INSERT INTO api_keys (
    service_name,
    key_name,
    key_value,
    environment,
    is_active,
    created_at,
    updated_at,
    notes
  ) VALUES (
    'resend',
    'api_key',
    v_new_resend_key,
    'production',
    true,
    v_rotation_date,
    v_rotation_date,
    'Créée lors de la rotation du ' || v_rotation_date || ' - ' || v_rotation_reason
  ) RETURNING id INTO v_resend_id;
  
  RAISE NOTICE '   ✅ Nouvelle clé Resend créée (ID: %)', v_resend_id;
  
  -- Insérer la nouvelle clé Brevo
  INSERT INTO api_keys (
    service_name,
    key_name,
    key_value,
    environment,
    is_active,
    created_at,
    updated_at,
    notes
  ) VALUES (
    'brevo',
    'api_key',
    v_new_brevo_key,
    'production',
    true,
    v_rotation_date,
    v_rotation_date,
    'Créée lors de la rotation du ' || v_rotation_date || ' - ' || v_rotation_reason
  ) RETURNING id INTO v_brevo_id;
  
  RAISE NOTICE '   ✅ Nouvelle clé Brevo créée (ID: %)', v_brevo_id;
  
  -- ============================================================================
  -- ÉTAPE 5 : LOGGING DE LA ROTATION
  -- ============================================================================
  
  RAISE NOTICE '📝 Étape 5/6 : Logging de la rotation...';
  
  -- Créer une table de log des rotations si elle n'existe pas
  CREATE TABLE IF NOT EXISTS api_keys_rotation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    old_key_id UUID,
    new_key_id UUID,
    rotation_date TIMESTAMP NOT NULL DEFAULT NOW(),
    rotation_user TEXT NOT NULL,
    rotation_reason TEXT,
    old_key_masked TEXT,
    new_key_masked TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  
  -- Logger la rotation Mapbox
  INSERT INTO api_keys_rotation_log (
    service_name,
    old_key_id,
    new_key_id,
    rotation_date,
    rotation_user,
    rotation_reason,
    old_key_masked,
    new_key_masked
  )
  SELECT 
    'mapbox',
    (SELECT id FROM api_keys_rotation_backup WHERE service_name = 'mapbox' LIMIT 1),
    v_mapbox_id,
    v_rotation_date,
    v_rotation_user,
    v_rotation_reason,
    SUBSTRING(v_old_mapbox_token, 1, 10) || '...' || SUBSTRING(v_old_mapbox_token, LENGTH(v_old_mapbox_token) - 4),
    SUBSTRING(v_new_mapbox_token, 1, 10) || '...' || SUBSTRING(v_new_mapbox_token, LENGTH(v_new_mapbox_token) - 4);
  
  -- Logger la rotation Resend
  INSERT INTO api_keys_rotation_log (
    service_name,
    old_key_id,
    new_key_id,
    rotation_date,
    rotation_user,
    rotation_reason,
    old_key_masked,
    new_key_masked
  )
  SELECT 
    'resend',
    (SELECT id FROM api_keys_rotation_backup WHERE service_name = 'resend' LIMIT 1),
    v_resend_id,
    v_rotation_date,
    v_rotation_user,
    v_rotation_reason,
    SUBSTRING(v_old_resend_key, 1, 6) || '...' || SUBSTRING(v_old_resend_key, LENGTH(v_old_resend_key) - 4),
    SUBSTRING(v_new_resend_key, 1, 6) || '...' || SUBSTRING(v_new_resend_key, LENGTH(v_new_resend_key) - 4);
  
  -- Logger la rotation Brevo
  INSERT INTO api_keys_rotation_log (
    service_name,
    old_key_id,
    new_key_id,
    rotation_date,
    rotation_user,
    rotation_reason,
    old_key_masked,
    new_key_masked
  )
  SELECT 
    'brevo',
    (SELECT id FROM api_keys_rotation_backup WHERE service_name = 'brevo' LIMIT 1),
    v_brevo_id,
    v_rotation_date,
    v_rotation_user,
    v_rotation_reason,
    SUBSTRING(v_old_brevo_key, 1, 10) || '...' || SUBSTRING(v_old_brevo_key, LENGTH(v_old_brevo_key) - 4),
    SUBSTRING(v_new_brevo_key, 1, 10) || '...' || SUBSTRING(v_new_brevo_key, LENGTH(v_new_brevo_key) - 4);
  
  RAISE NOTICE '✅ Rotation loggée dans api_keys_rotation_log (3 entrées)';
  
  -- ============================================================================
  -- ÉTAPE 6 : MISE À JOUR DES FEATURE FLAGS
  -- ============================================================================
  
  RAISE NOTICE '🚩 Étape 6/6 : Mise à jour des feature flags...';
  
  -- Vérifier que les feature flags sont toujours actifs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_flags') THEN
    
    -- S'assurer que les services sont activés
    UPDATE feature_flags
    SET 
      is_enabled = true,
      credentials_configured = true,
      updated_at = v_rotation_date
    WHERE flag_key IN (
      'communications_resend_emails',
      'communications_brevo_sms',
      'maps_mapbox'
    );
    
    RAISE NOTICE '✅ Feature flags mis à jour';
  ELSE
    RAISE NOTICE '⚠️  Table feature_flags non trouvée, skip';
  END IF;
  
  -- ============================================================================
  -- RÉSUMÉ FINAL
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              🎉 ROTATION TERMINÉE AVEC SUCCÈS 🎉           ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  ✅ Mapbox : Clé rotée                                     ║';
  RAISE NOTICE '║  ✅ Resend : Clé rotée                                     ║';
  RAISE NOTICE '║  ✅ Brevo : Clé rotée                                      ║';
  RAISE NOTICE '║  ✅ Anciennes clés : Désactivées                           ║';
  RAISE NOTICE '║  ✅ Nouvelles clés : Créées et activées                    ║';
  RAISE NOTICE '║  ✅ Rotation : Loggée                                      ║';
  RAISE NOTICE '║  ✅ Feature flags : Mis à jour                             ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  📋 Prochaines étapes :                                    ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║  1. Mettre à jour Supabase Secrets (CLI)                  ║';
  RAISE NOTICE '║  2. Redéployer les Edge Functions                         ║';
  RAISE NOTICE '║  3. Tester tous les services                               ║';
  RAISE NOTICE '║  4. Surveiller les logs pendant 7 jours                    ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  -- Afficher les IDs des nouvelles clés
  RAISE NOTICE '📋 Nouvelles clés créées :';
  RAISE NOTICE '   - Mapbox : % (masqué: %...%)', 
    v_mapbox_id, 
    SUBSTRING(v_new_mapbox_token, 1, 10),
    SUBSTRING(v_new_mapbox_token, LENGTH(v_new_mapbox_token) - 4);
  RAISE NOTICE '   - Resend : % (masqué: %...%)', 
    v_resend_id,
    SUBSTRING(v_new_resend_key, 1, 6),
    SUBSTRING(v_new_resend_key, LENGTH(v_new_resend_key) - 4);
  RAISE NOTICE '   - Brevo : % (masqué: %...%)', 
    v_brevo_id,
    SUBSTRING(v_new_brevo_key, 1, 10),
    SUBSTRING(v_new_brevo_key, LENGTH(v_new_brevo_key) - 4);
  
END $$;

-- ============================================================================
-- VÉRIFICATIONS POST-ROTATION
-- ============================================================================

-- Afficher les clés actives
SELECT 
  service_name,
  key_name,
  environment,
  is_active,
  SUBSTRING(key_value, 1, 10) || '...' || SUBSTRING(key_value, LENGTH(key_value) - 4) as key_masked,
  created_at,
  updated_at
FROM api_keys
WHERE service_name IN ('mapbox', 'resend', 'brevo')
  AND is_active = true
ORDER BY service_name, created_at DESC;

-- Afficher l'historique des rotations
SELECT 
  service_name,
  rotation_date,
  rotation_user,
  rotation_reason,
  old_key_masked,
  new_key_masked
FROM api_keys_rotation_log
ORDER BY rotation_date DESC
LIMIT 10;

-- ============================================================================
-- COMMANDES SUPABASE CLI À EXÉCUTER APRÈS CE SCRIPT
-- ============================================================================

/*

Après avoir exécuté ce script SQL, vous DEVEZ mettre à jour Supabase Secrets :

# 1. Mettre à jour Mapbox
supabase secrets set VITE_MAPBOX_PUBLIC_TOKEN="VOTRE_NOUVEAU_TOKEN_MAPBOX"

# 2. Mettre à jour Resend
supabase secrets set RESEND_API_KEY="VOTRE_NOUVELLE_CLE_RESEND"

# 3. Mettre à jour Brevo
supabase secrets set BREVO_API_KEY="VOTRE_NOUVELLE_CLE_BREVO"

# 4. Redéployer les Edge Functions
supabase functions deploy --all

# 5. Vérifier que tout fonctionne
./scripts/verify-api-keys.sh

*/

-- ============================================================================
-- ROLLBACK (EN CAS DE PROBLÈME)
-- ============================================================================

/*

Si vous devez faire un rollback :

DO $$
BEGIN
  -- Réactiver les anciennes clés
  UPDATE api_keys
  SET is_active = true, updated_at = NOW()
  WHERE id IN (
    SELECT old_key_id FROM api_keys_rotation_log
    WHERE rotation_date = (SELECT MAX(rotation_date) FROM api_keys_rotation_log)
  );
  
  -- Désactiver les nouvelles clés
  UPDATE api_keys
  SET is_active = false, updated_at = NOW()
  WHERE id IN (
    SELECT new_key_id FROM api_keys_rotation_log
    WHERE rotation_date = (SELECT MAX(rotation_date) FROM api_keys_rotation_log)
  );
  
  RAISE NOTICE '✅ Rollback effectué';
END $$;

*/

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

