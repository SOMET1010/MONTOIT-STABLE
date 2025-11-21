-- ============================================================================
-- SCRIPT DE MIGRATION CRYPTONEO : TEST → PRODUCTION
-- ============================================================================
-- Description : Met à jour les credentials CryptoNeo du mode TEST vers PRODUCTION
-- Date : 21 novembre 2025
-- Auteur : Manus AI
-- Version : 1.0
-- ============================================================================

-- ============================================================================
-- ⚠️  INSTRUCTIONS AVANT EXÉCUTION
-- ============================================================================
-- 1. Contactez l'ANSUT pour obtenir les credentials de PRODUCTION
-- 2. Remplacez les valeurs ci-dessous par vos credentials réels
-- 3. Vérifiez que l'URL de production est correcte (sans /esignaturedemo)
-- 4. Testez d'abord en staging avant la production
-- 5. Sauvegardez la base de données avant d'exécuter ce script
-- ============================================================================

-- ============================================================================
-- VARIABLES À REMPLACER (CREDENTIALS DE PRODUCTION)
-- ============================================================================
-- Remplacez ces valeurs par vos credentials de production fournis par l'ANSUT

\set PRODUCTION_APP_KEY '''VOTRE_APP_KEY_PRODUCTION'''
\set PRODUCTION_APP_SECRET '''VOTRE_APP_SECRET_PRODUCTION'''
\set PRODUCTION_BASE_URL '''https://ansut.cryptoneoplatforms.com'''

-- Alternative si \set ne fonctionne pas : utilisez DO $$ avec des variables

-- ============================================================================
-- MÉTHODE 1 : AVEC VARIABLES POSTGRESQL (RECOMMANDÉ)
-- ============================================================================

DO $$
DECLARE
  -- 🔴 REMPLACEZ CES VALEURS PAR VOS CREDENTIALS DE PRODUCTION
  v_production_app_key TEXT := 'VOTRE_APP_KEY_PRODUCTION';
  v_production_app_secret TEXT := 'VOTRE_APP_SECRET_PRODUCTION';
  v_production_base_url TEXT := 'https://ansut.cryptoneoplatforms.com'; -- Sans /esignaturedemo
  
  -- Variables de contrôle
  v_test_credentials_count INTEGER;
  v_updated_count INTEGER;
BEGIN
  -- ============================================================================
  -- ÉTAPE 1 : VÉRIFICATIONS PRÉALABLES
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║     MIGRATION CRYPTONEO : TEST → PRODUCTION                ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ ⚠️  VÉRIFICATIONS PRÉALABLES                                ║';
  RAISE NOTICE '║                                                            ║';
  
  -- Vérifier que les credentials TEST existent
  SELECT COUNT(*) INTO v_test_credentials_count
  FROM api_keys
  WHERE service_name = 'cryptoneo'
    AND environment = 'sandbox'
    AND is_active = true;
  
  IF v_test_credentials_count = 0 THEN
    RAISE EXCEPTION '❌ Aucun credential TEST trouvé. Exécutez d''abord activate_cryptoneo_signature.sql';
  ELSIF v_test_credentials_count < 3 THEN
    RAISE WARNING '⚠️  Seulement % credentials TEST trouvés (3 attendus)', v_test_credentials_count;
  ELSE
    RAISE NOTICE '║ ✅ % credentials TEST trouvés                              ║', v_test_credentials_count;
  END IF;
  
  -- Vérifier que les nouvelles valeurs ont été modifiées
  IF v_production_app_key = 'VOTRE_APP_KEY_PRODUCTION' THEN
    RAISE EXCEPTION '❌ Vous devez remplacer VOTRE_APP_KEY_PRODUCTION par votre clé réelle';
  END IF;
  
  IF v_production_app_secret = 'VOTRE_APP_SECRET_PRODUCTION' THEN
    RAISE EXCEPTION '❌ Vous devez remplacer VOTRE_APP_SECRET_PRODUCTION par votre secret réel';
  END IF;
  
  RAISE NOTICE '║ ✅ Credentials de production fournis                       ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  -- ============================================================================
  -- ÉTAPE 2 : SAUVEGARDE DES CREDENTIALS TEST
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              SAUVEGARDE DES CREDENTIALS TEST               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  -- Créer une table temporaire pour sauvegarder les credentials TEST
  CREATE TEMP TABLE IF NOT EXISTS cryptoneo_test_backup AS
  SELECT *
  FROM api_keys
  WHERE service_name = 'cryptoneo'
    AND environment = 'sandbox';
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE '✅ % credentials TEST sauvegardés dans cryptoneo_test_backup', v_updated_count;
  RAISE NOTICE '';
  
  -- ============================================================================
  -- ÉTAPE 3 : DÉSACTIVATION DES CREDENTIALS TEST
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           DÉSACTIVATION DES CREDENTIALS TEST               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  UPDATE api_keys
  SET 
    is_active = false,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{deactivated_at}',
      to_jsonb(NOW()::TEXT)
    ),
    metadata = jsonb_set(
      metadata,
      '{deactivated_reason}',
      '"Migration vers production"'::jsonb
    ),
    updated_at = NOW()
  WHERE service_name = 'cryptoneo'
    AND environment = 'sandbox';
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE '✅ % credentials TEST désactivés', v_updated_count;
  RAISE NOTICE '';
  
  -- ============================================================================
  -- ÉTAPE 4 : CRÉATION DES CREDENTIALS PRODUCTION
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║          CRÉATION DES CREDENTIALS PRODUCTION               ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  -- 4.1 : App Key Production
  INSERT INTO api_keys (
    service_name,
    key_name,
    key_value,
    endpoint,
    environment,
    is_active,
    metadata,
    created_at,
    updated_at
  )
  VALUES
    (
      'cryptoneo',
      'app_key',
      v_production_app_key,
      v_production_base_url,
      'production',
      true,
      jsonb_build_object(
        'description', 'Clé d''application CryptoNeo PRODUCTION',
        'documentation', 'https://ansut.cryptoneoplatforms.com/docs',
        'environment', 'PRODUCTION',
        'migrated_from_test', true,
        'migration_date', NOW()
      ),
      NOW(),
      NOW()
    )
  ON CONFLICT (service_name, key_name, environment) 
  DO UPDATE SET
    key_value = EXCLUDED.key_value,
    endpoint = EXCLUDED.endpoint,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
  
  RAISE NOTICE '✅ App Key PRODUCTION créée';
  
  -- 4.2 : App Secret Production
  INSERT INTO api_keys (
    service_name,
    key_name,
    key_value,
    endpoint,
    environment,
    is_active,
    metadata,
    created_at,
    updated_at
  )
  VALUES
    (
      'cryptoneo',
      'app_secret',
      v_production_app_secret,
      v_production_base_url,
      'production',
      true,
      jsonb_build_object(
        'description', 'Secret d''application CryptoNeo PRODUCTION',
        'environment', 'PRODUCTION',
        'migrated_from_test', true,
        'migration_date', NOW()
      ),
      NOW(),
      NOW()
    )
  ON CONFLICT (service_name, key_name, environment) 
  DO UPDATE SET
    key_value = EXCLUDED.key_value,
    endpoint = EXCLUDED.endpoint,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
  
  RAISE NOTICE '✅ App Secret PRODUCTION créé';
  
  -- 4.3 : Base URL Production
  INSERT INTO api_keys (
    service_name,
    key_name,
    key_value,
    endpoint,
    environment,
    is_active,
    metadata,
    created_at,
    updated_at
  )
  VALUES
    (
      'cryptoneo',
      'base_url',
      v_production_base_url,
      v_production_base_url,
      'production',
      true,
      jsonb_build_object(
        'description', 'URL de base de l''API CryptoNeo PRODUCTION',
        'environment', 'PRODUCTION',
        'note', 'URL de production (sans /esignaturedemo)',
        'migrated_from_test', true,
        'migration_date', NOW()
      ),
      NOW(),
      NOW()
    )
  ON CONFLICT (service_name, key_name, environment) 
  DO UPDATE SET
    key_value = EXCLUDED.key_value,
    endpoint = EXCLUDED.endpoint,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Base URL PRODUCTION créée';
  RAISE NOTICE '';
  
  -- ============================================================================
  -- ÉTAPE 5 : MISE À JOUR DES FEATURE FLAGS
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║            MISE À JOUR DES FEATURE FLAGS                   ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  -- Mettre à jour cryptoneo_signature
  UPDATE feature_flags
  SET 
    credentials_status = 'production',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{migrated_to_production_at}',
      to_jsonb(NOW()::TEXT)
    ),
    metadata = jsonb_set(
      metadata,
      '{environment}',
      '"PRODUCTION"'::jsonb
    ),
    metadata = jsonb_set(
      metadata,
      '{base_url}',
      to_jsonb(v_production_base_url)
    ),
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE key = 'cryptoneo_signature';
  
  RAISE NOTICE '✅ Feature flag "cryptoneo_signature" migré vers PRODUCTION';
  
  -- Mettre à jour cev_certificate
  UPDATE feature_flags
  SET 
    credentials_status = 'production',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{migrated_to_production_at}',
      to_jsonb(NOW()::TEXT)
    ),
    metadata = jsonb_set(
      metadata,
      '{environment}',
      '"PRODUCTION"'::jsonb
    ),
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE key = 'cev_certificate';
  
  RAISE NOTICE '✅ Feature flag "cev_certificate" migré vers PRODUCTION';
  RAISE NOTICE '';
  
  -- ============================================================================
  -- ÉTAPE 6 : VÉRIFICATION FINALE
  -- ============================================================================
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                 VÉRIFICATION FINALE                        ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  
  -- Vérifier credentials PRODUCTION
  SELECT COUNT(*) INTO v_updated_count
  FROM api_keys
  WHERE service_name = 'cryptoneo'
    AND environment = 'production'
    AND is_active = true;
  
  IF v_updated_count = 3 THEN
    RAISE NOTICE '║ ✅ % credentials PRODUCTION actifs                         ║', v_updated_count;
  ELSE
    RAISE WARNING '║ ⚠️  Seulement % credentials PRODUCTION actifs (3 attendus)║', v_updated_count;
  END IF;
  
  -- Vérifier feature flags
  SELECT COUNT(*) INTO v_updated_count
  FROM feature_flags
  WHERE key IN ('cryptoneo_signature', 'cev_certificate')
    AND credentials_status = 'production';
  
  IF v_updated_count = 2 THEN
    RAISE NOTICE '║ ✅ % feature flags en mode PRODUCTION                     ║', v_updated_count;
  ELSE
    RAISE WARNING '║ ⚠️  Seulement % feature flags en PRODUCTION (2 attendus)  ║', v_updated_count;
  END IF;
  
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 🎉 MIGRATION VERS PRODUCTION TERMINÉE !                    ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ ⚠️  IMPORTANT : TESTEZ IMMÉDIATEMENT                       ║';
  RAISE NOTICE '║    1. Signez un document de test                           ║';
  RAISE NOTICE '║    2. Vérifiez le CEV avec l''ANSUT                        ║';
  RAISE NOTICE '║    3. Validez la signature                                 ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
END $$;

-- ============================================================================
-- ÉTAPE 7 : AFFICHER LES CREDENTIALS PRODUCTION (MASQUÉS)
-- ============================================================================

SELECT 
  '=== CREDENTIALS PRODUCTION ===' AS section,
  key_name,
  CASE 
    WHEN key_name IN ('app_key', 'app_secret') THEN 
      LEFT(key_value, 10) || '...' || RIGHT(key_value, 10)
    ELSE key_value
  END AS key_value_masked,
  environment,
  is_active,
  '✅ ACTIF' AS status
FROM api_keys
WHERE service_name = 'cryptoneo'
  AND environment = 'production'
  AND is_active = true
ORDER BY key_name;

-- ============================================================================
-- ÉTAPE 8 : COMMANDES DE TEST EN PRODUCTION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           COMMANDES DE TEST EN PRODUCTION                  ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ ⚠️  ATTENTION : VOUS ÊTES EN PRODUCTION !                   ║';
  RAISE NOTICE '║    Les signatures générées sont VALIDES LÉGALEMENT         ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 1. Tester avec un document réel :                         ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       cryptoneo-sign-document" \                           ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "documentId": "real-doc-uuid",                      ║';
  RAISE NOTICE '║        "userId": "real-user-uuid"                          ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 2. Vérifier le CEV avec l''ANSUT                           ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 3. Valider la signature électronique                      ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 4. Monitorer les logs et erreurs                          ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 9 : ROLLBACK (SI NÉCESSAIRE)
-- ============================================================================

/*
-- En cas de problème, restaurer les credentials TEST

-- Réactiver les credentials TEST
UPDATE api_keys
SET 
  is_active = true,
  updated_at = NOW()
WHERE service_name = 'cryptoneo'
  AND environment = 'sandbox';

-- Désactiver les credentials PRODUCTION
UPDATE api_keys
SET 
  is_active = false,
  updated_at = NOW()
WHERE service_name = 'cryptoneo'
  AND environment = 'production';

-- Remettre les feature flags en mode TEST
UPDATE feature_flags
SET 
  credentials_status = 'sandbox',
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key IN ('cryptoneo_signature', 'cev_certificate');

RAISE NOTICE '⚠️ Rollback effectué : retour en mode TEST';
*/

-- ============================================================================
-- ÉTAPE 10 : NETTOYAGE (OPTIONNEL)
-- ============================================================================

/*
-- Supprimer définitivement les credentials TEST (ATTENTION : IRRÉVERSIBLE)
-- À faire uniquement après validation complète en production

DELETE FROM api_keys
WHERE service_name = 'cryptoneo'
  AND environment = 'sandbox';

RAISE NOTICE '✅ Credentials TEST supprimés définitivement';
*/

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Afficher un résumé final
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                     RÉSUMÉ FINAL                           ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ ✅ Migration TEST → PRODUCTION terminée                    ║';
  RAISE NOTICE '║ ✅ Credentials TEST sauvegardés et désactivés              ║';
  RAISE NOTICE '║ ✅ Credentials PRODUCTION créés et activés                 ║';
  RAISE NOTICE '║ ✅ Feature flags mis à jour                                ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 📋 PROCHAINES ÉTAPES :                                     ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 1. ✅ Tester la signature en production                    ║';
  RAISE NOTICE '║ 2. ✅ Vérifier le CEV avec l''ANSUT                        ║';
  RAISE NOTICE '║ 3. ✅ Valider avec un document réel                        ║';
  RAISE NOTICE '║ 4. ✅ Monitorer les logs pendant 24-48h                    ║';
  RAISE NOTICE '║ 5. ✅ Former les équipes sur le nouveau workflow           ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 💡 ROLLBACK DISPONIBLE :                                   ║';
  RAISE NOTICE '║    Les credentials TEST sont sauvegardés                   ║';
  RAISE NOTICE '║    Décommentez la section ROLLBACK si nécessaire           ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

