-- ============================================================================
-- SCRIPT D'ACTIVATION DE L'INTÉGRATION CRYPTONEO (SIGNATURE CEV)
-- ============================================================================
-- Description : Active la signature électronique CryptoNeo avec CEV ANSUT
--               via le système de feature flags
-- Date : 21 novembre 2025
-- Auteur : Manus AI
-- Version : 1.0
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : CONFIGURATION DES CREDENTIALS CRYPTONEO
-- ============================================================================

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
    'f1e12a-d652-a757-b968-4784-3b062142',
    'https://ansut.cryptoneoplatforms.com/esignaturedemo',
    'sandbox', -- Mode TEST
    true,
    jsonb_build_object(
      'description', 'Clé d''application CryptoNeo pour signature électronique',
      'documentation', 'https://ansut.cryptoneoplatforms.com/docs',
      'environment', 'TEST'
    ),
    NOW(),
    NOW()
  ),
  (
    'cryptoneo',
    'app_secret',
    '4a76-b456-c170-a774-410b-b0a5-9c67-b20c',
    'https://ansut.cryptoneoplatforms.com/esignaturedemo',
    'sandbox', -- Mode TEST
    true,
    jsonb_build_object(
      'description', 'Secret d''application CryptoNeo',
      'environment', 'TEST'
    ),
    NOW(),
    NOW()
  ),
  (
    'cryptoneo',
    'base_url',
    'https://ansut.cryptoneoplatforms.com/esignaturedemo',
    'https://ansut.cryptoneoplatforms.com/esignaturedemo',
    'sandbox', -- Mode TEST
    true,
    jsonb_build_object(
      'description', 'URL de base de l''API CryptoNeo ANSUT',
      'environment', 'TEST',
      'note', 'URL de démonstration pour tests'
    ),
    NOW(),
    NOW()
  )
ON CONFLICT (service_name, key_name, environment) 
DO UPDATE SET
  key_value = EXCLUDED.key_value,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Vérifier CryptoNeo
DO $$
DECLARE
  credential_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO credential_count
  FROM api_keys
  WHERE service_name = 'cryptoneo' AND is_active = true;
  
  IF credential_count = 3 THEN
    RAISE NOTICE '✅ CryptoNeo : % credentials configurés (MODE TEST)', credential_count;
  ELSE
    RAISE WARNING '⚠️ CryptoNeo : Seulement % credentials configurés (3 attendus)', credential_count;
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 2 : ACTIVATION DES FEATURE FLAGS CRYPTONEO
-- ============================================================================

-- 2.1 : Activer la signature électronique CryptoNeo
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'sandbox', -- MODE TEST
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'activated_by', 'admin',
    'reason', 'Credentials CryptoNeo TEST configurés',
    'provider', 'cryptoneo',
    'environment', 'TEST',
    'base_url', 'https://ansut.cryptoneoplatforms.com/esignaturedemo',
    'features', ARRAY[
      'electronic_signature',
      'cev_certificate',
      'otp_validation',
      'signature_verification',
      'signature_revocation'
    ],
    'workflow', ARRAY[
      '1. Générer OTP',
      '2. Vérifier OTP',
      '3. Signer document',
      '4. Obtenir CEV',
      '5. Vérifier signature'
    ]
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'cryptoneo_signature';

-- Vérifier activation
DO $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT is_enabled INTO is_active
  FROM feature_flags
  WHERE key = 'cryptoneo_signature';
  
  IF is_active THEN
    RAISE NOTICE '✅ Feature flag "cryptoneo_signature" activé (MODE TEST)';
  ELSE
    RAISE WARNING '⚠️ Feature flag "cryptoneo_signature" non activé';
  END IF;
END $$;

-- 2.2 : Activer la génération de CEV
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'sandbox',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'provider', 'cryptoneo',
    'environment', 'TEST',
    'description', 'Certificat Électronique de Validité ANSUT'
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'cev_certificate';

-- Vérifier activation CEV
DO $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT is_enabled INTO is_active
  FROM feature_flags
  WHERE key = 'cev_certificate';
  
  IF is_active THEN
    RAISE NOTICE '✅ Feature flag "cev_certificate" activé';
  ELSE
    RAISE WARNING '⚠️ Feature flag "cev_certificate" non activé';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 3 : VÉRIFICATION COMPLÈTE
-- ============================================================================

-- 3.1 : Résumé des credentials
SELECT 
  '=== CREDENTIALS CRYPTONEO (MODE TEST) ===' AS section,
  key_name,
  environment,
  is_active,
  '✅ CONFIGURÉ' AS status
FROM api_keys
WHERE service_name = 'cryptoneo'
  AND is_active = true
ORDER BY key_name;

-- 3.2 : Résumé des feature flags
SELECT 
  '=== FEATURE FLAGS CRYPTONEO ===' AS section,
  key,
  name,
  is_enabled,
  credentials_status,
  rollout_percentage,
  CASE 
    WHEN is_enabled AND credentials_status = 'sandbox' THEN '🧪 TEST'
    WHEN is_enabled AND credentials_status = 'production' THEN '✅ PRODUCTION'
    ELSE '❌ INACTIF'
  END AS status
FROM feature_flags
WHERE key IN (
  'cryptoneo_signature',
  'cev_certificate'
)
ORDER BY key;

-- 3.3 : Vérification finale
DO $$
DECLARE
  credentials_ok BOOLEAN;
  flags_ok BOOLEAN;
  total_active INTEGER;
BEGIN
  -- Vérifier credentials
  SELECT COUNT(*) = 3 INTO credentials_ok
  FROM api_keys
  WHERE service_name = 'cryptoneo' AND is_active = true;
  
  -- Vérifier feature flags
  SELECT COUNT(*) = 2 INTO flags_ok
  FROM feature_flags
  WHERE key IN ('cryptoneo_signature', 'cev_certificate')
    AND is_enabled = true;
  
  -- Compter total
  SELECT COUNT(*) INTO total_active
  FROM feature_flags
  WHERE key IN ('cryptoneo_signature', 'cev_certificate')
    AND is_enabled = true;
  
  -- Afficher résultat
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║      RÉSULTAT DE L''ACTIVATION CRYPTONEO (MODE TEST)       ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  
  IF credentials_ok THEN
    RAISE NOTICE '║ ✅ CryptoNeo : CONFIGURÉ (MODE TEST)                       ║';
    RAISE NOTICE '║    🔐 App Key : f1e12a-d652-a757-b968-4784-3b062142       ║';
    RAISE NOTICE '║    🔐 App Secret : 4a76-b456-c170-a774-410b-b0a5-9c67-b20c║';
    RAISE NOTICE '║    🌐 URL : ansut.cryptoneoplatforms.com/esignaturedemo   ║';
  ELSE
    RAISE NOTICE '║ ❌ CryptoNeo : NON CONFIGURÉ                               ║';
  END IF;
  
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 📊 Services activés : %/2                                  ║', LPAD(total_active::TEXT, 1, ' ');
  RAISE NOTICE '║                                                            ║';
  
  IF total_active >= 1 THEN
    RAISE NOTICE '║ ✅ Signature électronique : ACTIF (TEST)                   ║';
  END IF;
  
  IF total_active = 2 THEN
    RAISE NOTICE '║ ✅ Certificat CEV : ACTIF (TEST)                           ║';
  END IF;
  
  RAISE NOTICE '║                                                            ║';
  
  IF credentials_ok AND flags_ok THEN
    RAISE NOTICE '║ 🎉 INTÉGRATION CRYPTONEO COMPLÈTE (MODE TEST) !           ║';
    RAISE NOTICE '║                                                            ║';
    RAISE NOTICE '║ ⚠️  IMPORTANT : VOUS ÊTES EN MODE TEST                     ║';
    RAISE NOTICE '║    Les signatures ne sont PAS valides légalement          ║';
    RAISE NOTICE '║    Utilisez uniquement pour tester le workflow            ║';
  ELSIF NOT credentials_ok THEN
    RAISE NOTICE '║ ⚠️  ATTENTION : Credentials non configurés                 ║';
  ELSE
    RAISE NOTICE '║ ⚠️  ATTENTION : Feature flags non activés                  ║';
  END IF;
  
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 4 : WORKFLOW DE SIGNATURE CRYPTONEO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           WORKFLOW DE SIGNATURE CRYPTONEO                  ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 1️⃣  GÉNÉRER OTP                                            ║';
  RAISE NOTICE '║    POST /user/auth (obtenir token JWT)                     ║';
  RAISE NOTICE '║    POST /generateCert/generateCertificat                   ║';
  RAISE NOTICE '║    → OTP envoyé par SMS au signataire                      ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 2️⃣  VÉRIFIER OTP                                           ║';
  RAISE NOTICE '║    POST /generateCert/verifyOTP                            ║';
  RAISE NOTICE '║    → Validation du code OTP                                ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 3️⃣  SIGNER DOCUMENT                                        ║';
  RAISE NOTICE '║    POST /generateCert/signDocument                         ║';
  RAISE NOTICE '║    → Document signé avec certificat CEV                    ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 4️⃣  OBTENIR CEV                                            ║';
  RAISE NOTICE '║    GET /generateCert/getCertificate                        ║';
  RAISE NOTICE '║    → Certificat Électronique de Validité ANSUT             ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 5️⃣  VÉRIFIER SIGNATURE                                     ║';
  RAISE NOTICE '║    POST /generateCert/verifySignature                      ║';
  RAISE NOTICE '║    → Validation de la signature                            ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 5 : COMMANDES DE TEST
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              COMMANDES DE TEST CRYPTONEO                   ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 1. Générer un OTP :                                       ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       cryptoneo-generate-otp" \                            ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "phoneNumber": "0707070707",                        ║';
  RAISE NOTICE '║        "documentHash": "abc123...",                        ║';
  RAISE NOTICE '║        "userId": "user-uuid"                               ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 2. Vérifier l''OTP :                                      ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       cryptoneo-verify-otp" \                              ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "operationId": "op-123",                            ║';
  RAISE NOTICE '║        "otp": "123456"                                     ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 3. Signer un document :                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       cryptoneo-sign-document" \                           ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "documentId": "doc-uuid",                           ║';
  RAISE NOTICE '║        "operationId": "op-123"                             ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 6 : PASSAGE EN PRODUCTION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║           PASSAGE EN PRODUCTION (À FAIRE PLUS TARD)        ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ ⚠️  ACTUELLEMENT EN MODE TEST                               ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ Pour passer en production :                                ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 1. Contacter CryptoNeo via l''ANSUT                        ║';
  RAISE NOTICE '║ 2. Demander les credentials de PRODUCTION                  ║';
  RAISE NOTICE '║ 3. Obtenir l''URL de production (sans /esignaturedemo)    ║';
  RAISE NOTICE '║ 4. Mettre à jour les credentials dans api_keys             ║';
  RAISE NOTICE '║ 5. Changer environment de ''sandbox'' à ''production''      ║';
  RAISE NOTICE '║ 6. Mettre à jour credentials_status à ''production''        ║';
  RAISE NOTICE '║ 7. Tester en production avec un document réel              ║';
  RAISE NOTICE '║ 8. Valider avec l''ANSUT                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ Commandes SQL pour passage en production :                ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ UPDATE api_keys                                            ║';
  RAISE NOTICE '║ SET environment = ''production'',                           ║';
  RAISE NOTICE '║     key_value = ''YOUR_PRODUCTION_VALUE''                   ║';
  RAISE NOTICE '║ WHERE service_name = ''cryptoneo'';                         ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ UPDATE feature_flags                                       ║';
  RAISE NOTICE '║ SET credentials_status = ''production''                     ║';
  RAISE NOTICE '║ WHERE key IN (''cryptoneo_signature'', ''cev_certificate'');║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 7 : ROLLBACK (EN CAS DE PROBLÈME)
-- ============================================================================

/*
-- Désactiver tous les feature flags CryptoNeo
UPDATE feature_flags
SET 
  is_enabled = false,
  credentials_status = 'not_configured',
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key IN (
  'cryptoneo_signature',
  'cev_certificate'
);

-- Désactiver les credentials CryptoNeo
UPDATE api_keys
SET 
  is_active = false,
  updated_at = NOW()
WHERE service_name = 'cryptoneo';

RAISE NOTICE '⚠️ Intégration CryptoNeo désactivée';
*/

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

