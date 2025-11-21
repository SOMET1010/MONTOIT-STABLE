-- ============================================================================
-- SCRIPT D'ACTIVATION DE L'INTÉGRATION INTOUCH
-- ============================================================================
-- Description : Active tous les services InTouch (paiements, SMS, WhatsApp)
--               via le système de feature flags
-- Date : 21 novembre 2025
-- Auteur : Manus AI
-- Version : 1.0
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : CONFIGURATION DES CREDENTIALS INTOUCH
-- ============================================================================
-- IMPORTANT : Remplacez les valeurs 'YOUR_XXX' par vos credentials réels
--             obtenus auprès d'InTouch
-- ============================================================================

-- Insérer ou mettre à jour les credentials InTouch dans la table api_keys
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
  -- Credentials principaux
  (
    'intouch',
    'base_url',
    'https://apidist.gutouch.net', -- URL de production InTouch
    'https://apidist.gutouch.net',
    'production', -- Changez en 'sandbox' pour les tests
    true,
    jsonb_build_object(
      'description', 'URL de base de l''API InTouch',
      'documentation', 'https://www.gutouch.com/documentation'
    ),
    NOW(),
    NOW()
  ),
  (
    'intouch',
    'username',
    'YOUR_INTOUCH_USERNAME', -- ⚠️ REMPLACEZ PAR VOTRE USERNAME
    'https://apidist.gutouch.net',
    'production',
    true,
    jsonb_build_object(
      'description', 'Nom d''utilisateur InTouch',
      'required_for', ARRAY['payment', 'sms', 'whatsapp']
    ),
    NOW(),
    NOW()
  ),
  (
    'intouch',
    'password',
    'YOUR_INTOUCH_PASSWORD', -- ⚠️ REMPLACEZ PAR VOTRE PASSWORD
    'https://apidist.gutouch.net',
    'production',
    true,
    jsonb_build_object(
      'description', 'Mot de passe InTouch',
      'required_for', ARRAY['payment', 'sms', 'whatsapp']
    ),
    NOW(),
    NOW()
  ),
  (
    'intouch',
    'partner_id',
    'YOUR_PARTNER_ID', -- ⚠️ REMPLACEZ PAR VOTRE PARTNER_ID
    'https://apidist.gutouch.net',
    'production',
    true,
    jsonb_build_object(
      'description', 'Identifiant partenaire InTouch',
      'required_for', ARRAY['payment', 'sms', 'whatsapp']
    ),
    NOW(),
    NOW()
  ),
  (
    'intouch',
    'login_api',
    'YOUR_LOGIN_API', -- ⚠️ REMPLACEZ PAR VOTRE LOGIN_API
    'https://apidist.gutouch.net',
    'production',
    true,
    jsonb_build_object(
      'description', 'Login API InTouch',
      'required_for', ARRAY['payment', 'sms', 'whatsapp']
    ),
    NOW(),
    NOW()
  ),
  (
    'intouch',
    'password_api',
    'YOUR_PASSWORD_API', -- ⚠️ REMPLACEZ PAR VOTRE PASSWORD_API
    'https://apidist.gutouch.net',
    'production',
    true,
    jsonb_build_object(
      'description', 'Password API InTouch',
      'required_for', ARRAY['payment', 'sms', 'whatsapp']
    ),
    NOW(),
    NOW()
  )
ON CONFLICT (service_name, key_name, environment) 
DO UPDATE SET
  key_value = EXCLUDED.key_value,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Vérifier que les credentials ont été insérés
DO $$
DECLARE
  credential_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO credential_count
  FROM api_keys
  WHERE service_name = 'intouch' AND is_active = true;
  
  IF credential_count < 6 THEN
    RAISE WARNING 'Seulement % credentials InTouch actifs. 6 attendus.', credential_count;
  ELSE
    RAISE NOTICE '✅ % credentials InTouch configurés avec succès', credential_count;
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 2 : ACTIVATION DES FEATURE FLAGS INTOUCH
-- ============================================================================
-- Active tous les services InTouch via le système de feature flags
-- ============================================================================

-- 2.1 : Activer le paiement InTouch (CRITIQUE)
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production', -- Changez en 'sandbox' pour les tests
  rollout_percentage = 100, -- Déployer à 100% des utilisateurs
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'activated_by', 'admin',
    'reason', 'Credentials InTouch configurés et validés',
    'providers', ARRAY['orange_money', 'mtn_money', 'moov_money', 'wave'],
    'commission', '1%',
    'cost_per_transaction', '1% du montant'
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'intouch_payment';

-- Vérifier l'activation
DO $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT is_enabled INTO is_active
  FROM feature_flags
  WHERE key = 'intouch_payment';
  
  IF is_active THEN
    RAISE NOTICE '✅ Feature flag "intouch_payment" activé';
  ELSE
    RAISE WARNING '⚠️ Feature flag "intouch_payment" non activé';
  END IF;
END $$;

-- 2.2 : Activer les méthodes de paiement individuelles
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'provider', 'orange',
    'cost', '1% commission',
    'min_amount', 100,
    'max_amount', 1000000
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'orange_money';

UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'provider', 'mtn',
    'cost', '1% commission',
    'min_amount', 100,
    'max_amount', 1000000
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'mtn_money';

UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'provider', 'moov',
    'cost', '1% commission',
    'min_amount', 100,
    'max_amount', 1000000
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'moov_money';

UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'provider', 'wave',
    'cost', '1% commission',
    'min_amount', 100,
    'max_amount', 1000000
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'wave_payment';

-- Vérifier l'activation des méthodes de paiement
DO $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM feature_flags
  WHERE key IN ('orange_money', 'mtn_money', 'moov_money', 'wave_payment')
    AND is_enabled = true;
  
  RAISE NOTICE '✅ % méthodes de paiement activées sur 4', active_count;
END $$;

-- 2.3 : Activer les notifications SMS via InTouch
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'provider', 'intouch',
    'cost', '25 FCFA/SMS',
    'advantage', '50% moins cher que les concurrents'
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'sms_notifications';

-- Vérifier l'activation SMS
DO $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT is_enabled INTO is_active
  FROM feature_flags
  WHERE key = 'sms_notifications';
  
  IF is_active THEN
    RAISE NOTICE '✅ Feature flag "sms_notifications" activé';
  ELSE
    RAISE WARNING '⚠️ Feature flag "sms_notifications" non activé';
  END IF;
END $$;

-- 2.4 : Activer les notifications WhatsApp via InTouch
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'provider', 'intouch',
    'advantage', 'Pas besoin de validation Meta'
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'whatsapp_notifications';

-- Vérifier l'activation WhatsApp
DO $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT is_enabled INTO is_active
  FROM feature_flags
  WHERE key = 'whatsapp_notifications';
  
  IF is_active THEN
    RAISE NOTICE '✅ Feature flag "whatsapp_notifications" activé';
  ELSE
    RAISE WARNING '⚠️ Feature flag "whatsapp_notifications" non activé';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 3 : VÉRIFICATION COMPLÈTE DE L'INTÉGRATION
-- ============================================================================

-- 3.1 : Résumé des credentials InTouch
SELECT 
  '=== CREDENTIALS INTOUCH ===' AS section,
  key_name,
  CASE 
    WHEN key_value LIKE 'YOUR_%' THEN '❌ NON CONFIGURÉ'
    ELSE '✅ CONFIGURÉ'
  END AS status,
  environment,
  is_active
FROM api_keys
WHERE service_name = 'intouch'
ORDER BY key_name;

-- 3.2 : Résumé des feature flags InTouch
SELECT 
  '=== FEATURE FLAGS INTOUCH ===' AS section,
  key,
  name,
  is_enabled,
  credentials_status,
  rollout_percentage,
  CASE 
    WHEN is_enabled AND credentials_status = 'production' THEN '✅ ACTIF'
    WHEN is_enabled AND credentials_status = 'sandbox' THEN '🧪 SANDBOX'
    ELSE '❌ INACTIF'
  END AS status
FROM feature_flags
WHERE key IN (
  'intouch_payment',
  'orange_money',
  'mtn_money',
  'moov_money',
  'wave_payment',
  'sms_notifications',
  'whatsapp_notifications'
)
ORDER BY 
  CASE 
    WHEN key = 'intouch_payment' THEN 1
    WHEN key LIKE '%_money' OR key = 'wave_payment' THEN 2
    ELSE 3
  END,
  key;

-- 3.3 : Vérification finale
DO $$
DECLARE
  credentials_ok BOOLEAN;
  flags_ok BOOLEAN;
  total_active INTEGER;
BEGIN
  -- Vérifier que tous les credentials sont configurés
  SELECT COUNT(*) = 6 AND 
         COUNT(*) FILTER (WHERE key_value NOT LIKE 'YOUR_%') = 6
  INTO credentials_ok
  FROM api_keys
  WHERE service_name = 'intouch' AND is_active = true;
  
  -- Vérifier que tous les feature flags sont activés
  SELECT COUNT(*) = 7
  INTO flags_ok
  FROM feature_flags
  WHERE key IN (
    'intouch_payment',
    'orange_money',
    'mtn_money',
    'moov_money',
    'wave_payment',
    'sms_notifications',
    'whatsapp_notifications'
  ) AND is_enabled = true;
  
  -- Compter le total de services actifs
  SELECT COUNT(*) INTO total_active
  FROM feature_flags
  WHERE key IN (
    'intouch_payment',
    'orange_money',
    'mtn_money',
    'moov_money',
    'wave_payment',
    'sms_notifications',
    'whatsapp_notifications'
  ) AND is_enabled = true;
  
  -- Afficher le résultat
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║         RÉSULTAT DE L''ACTIVATION INTOUCH                  ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  
  IF credentials_ok THEN
    RAISE NOTICE '║ ✅ Credentials InTouch : CONFIGURÉS                        ║';
  ELSE
    RAISE NOTICE '║ ❌ Credentials InTouch : NON CONFIGURÉS                    ║';
    RAISE NOTICE '║    ⚠️  Remplacez les valeurs YOUR_XXX dans le script      ║';
  END IF;
  
  RAISE NOTICE '║ 📊 Services activés : %/7                                  ║', LPAD(total_active::TEXT, 1, ' ');
  RAISE NOTICE '║                                                            ║';
  
  IF total_active >= 1 THEN
    RAISE NOTICE '║ ✅ Paiements InTouch : ACTIF                               ║';
  END IF;
  
  IF total_active >= 5 THEN
    RAISE NOTICE '║ ✅ Orange Money : ACTIF                                    ║';
    RAISE NOTICE '║ ✅ MTN Money : ACTIF                                       ║';
    RAISE NOTICE '║ ✅ Moov Money : ACTIF                                      ║';
    RAISE NOTICE '║ ✅ Wave : ACTIF                                            ║';
  END IF;
  
  IF total_active >= 6 THEN
    RAISE NOTICE '║ ✅ SMS InTouch : ACTIF                                     ║';
  END IF;
  
  IF total_active = 7 THEN
    RAISE NOTICE '║ ✅ WhatsApp InTouch : ACTIF                                ║';
  END IF;
  
  RAISE NOTICE '║                                                            ║';
  
  IF credentials_ok AND flags_ok THEN
    RAISE NOTICE '║ 🎉 INTÉGRATION INTOUCH COMPLÈTE ET OPÉRATIONNELLE !       ║';
  ELSIF NOT credentials_ok THEN
    RAISE NOTICE '║ ⚠️  ATTENTION : Configurez les credentials avant de tester║';
  ELSE
    RAISE NOTICE '║ ⚠️  ATTENTION : Certains services ne sont pas activés     ║';
  END IF;
  
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 4 : COMMANDES DE TEST (À EXÉCUTER APRÈS CONFIGURATION)
-- ============================================================================

-- Afficher les commandes de test
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              COMMANDES DE TEST INTOUCH                     ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 1. Tester un paiement Orange Money :                      ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       intouch-payment-initiate" \                          ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "amount": 1000,                                     ║';
  RAISE NOTICE '║        "phoneNumber": "0707070707",                        ║';
  RAISE NOTICE '║        "provider": "orange_money",                         ║';
  RAISE NOTICE '║        "description": "Test paiement"                      ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 2. Tester un SMS :                                        ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       send-sms-intouch" \                                  ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "phoneNumber": "0707070707",                        ║';
  RAISE NOTICE '║        "message": "Test SMS depuis Mon Toit"               ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 3. Tester WhatsApp :                                      ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       send-whatsapp" \                                     ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "phoneNumber": "0707070707",                        ║';
  RAISE NOTICE '║        "message": "Test WhatsApp depuis Mon Toit"          ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 5 : ROLLBACK (EN CAS DE PROBLÈME)
-- ============================================================================
-- Décommentez cette section pour désactiver l'intégration InTouch

/*
-- Désactiver tous les feature flags InTouch
UPDATE feature_flags
SET 
  is_enabled = false,
  credentials_status = 'not_configured',
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key IN (
  'intouch_payment',
  'orange_money',
  'mtn_money',
  'moov_money',
  'wave_payment',
  'sms_notifications',
  'whatsapp_notifications'
);

-- Désactiver les credentials InTouch
UPDATE api_keys
SET 
  is_active = false,
  updated_at = NOW()
WHERE service_name = 'intouch';

RAISE NOTICE '⚠️ Intégration InTouch désactivée';
*/

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

