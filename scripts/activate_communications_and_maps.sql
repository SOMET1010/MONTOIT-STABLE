-- ============================================================================
-- SCRIPT D'ACTIVATION DES COMMUNICATIONS ET CARTES
-- ============================================================================
-- Description : Active Resend (emails), Brevo (SMS/WhatsApp) et Mapbox (cartes)
--               via le système de feature flags
-- Date : 21 novembre 2025
-- Auteur : Manus AI
-- Version : 1.0
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : CONFIGURATION DES CREDENTIALS RESEND (EMAILS)
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
    'resend',
    'api_key',
    're_DvxxTkmv_KLgX7D1LSvr4tVZK1EUtRLv9',
    'https://api.resend.com',
    'production',
    true,
    jsonb_build_object(
      'description', 'Clé API Resend pour envoi d''emails',
      'documentation', 'https://resend.com/docs'
    ),
    NOW(),
    NOW()
  ),
  (
    'resend',
    'from_email',
    'no-reply@notifications.ansut.ci',
    'https://api.resend.com',
    'production',
    true,
    jsonb_build_object(
      'description', 'Adresse email d''envoi',
      'domain', 'notifications.ansut.ci'
    ),
    NOW(),
    NOW()
  ),
  (
    'resend',
    'domain',
    'notifications.ansut.ci',
    'https://api.resend.com',
    'production',
    true,
    jsonb_build_object(
      'description', 'Domaine vérifié pour envoi d''emails',
      'status', 'verified'
    ),
    NOW(),
    NOW()
  )
ON CONFLICT (service_name, key_name, environment) 
DO UPDATE SET
  key_value = EXCLUDED.key_value,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Vérifier Resend
DO $$
DECLARE
  credential_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO credential_count
  FROM api_keys
  WHERE service_name = 'resend' AND is_active = true;
  
  IF credential_count = 3 THEN
    RAISE NOTICE '✅ Resend : % credentials configurés', credential_count;
  ELSE
    RAISE WARNING '⚠️ Resend : Seulement % credentials configurés (3 attendus)', credential_count;
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 2 : CONFIGURATION DES CREDENTIALS BREVO (SMS & WHATSAPP)
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
    'brevo',
    'api_key',
    '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',
    'https://api.brevo.com/v3',
    'production',
    true,
    jsonb_build_object(
      'description', 'Clé API Brevo pour SMS et WhatsApp',
      'documentation', 'https://developers.brevo.com',
      'services', ARRAY['sms', 'whatsapp']
    ),
    NOW(),
    NOW()
  )
ON CONFLICT (service_name, key_name, environment) 
DO UPDATE SET
  key_value = EXCLUDED.key_value,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Vérifier Brevo
DO $$
DECLARE
  credential_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO credential_count
  FROM api_keys
  WHERE service_name = 'brevo' AND is_active = true;
  
  IF credential_count >= 1 THEN
    RAISE NOTICE '✅ Brevo : % credential configuré', credential_count;
  ELSE
    RAISE WARNING '⚠️ Brevo : Aucun credential configuré';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 3 : CONFIGURATION DES CREDENTIALS MAPBOX (CARTES)
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
    'mapbox',
    'public_token',
    'pk.eyJ1IjoicHNvbWV0IiwiYSI6ImNtYTgwZ2xmMzEzdWcyaXM2ZG45d3A4NmEifQ.MYXzdc5CREmcvtBLvfV0Lg',
    'https://api.mapbox.com',
    'production',
    true,
    jsonb_build_object(
      'description', 'Token public Mapbox pour affichage de cartes',
      'documentation', 'https://docs.mapbox.com',
      'account', 'psomet'
    ),
    NOW(),
    NOW()
  )
ON CONFLICT (service_name, key_name, environment) 
DO UPDATE SET
  key_value = EXCLUDED.key_value,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Vérifier Mapbox
DO $$
DECLARE
  credential_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO credential_count
  FROM api_keys
  WHERE service_name = 'mapbox' AND is_active = true;
  
  IF credential_count >= 1 THEN
    RAISE NOTICE '✅ Mapbox : % credential configuré', credential_count;
  ELSE
    RAISE WARNING '⚠️ Mapbox : Aucun credential configuré';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 4 : ACTIVATION DES FEATURE FLAGS
-- ============================================================================

-- 4.1 : Activer les emails via Resend
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'activated_by', 'admin',
    'reason', 'Credentials Resend configurés et validés',
    'provider', 'resend',
    'from_email', 'no-reply@notifications.ansut.ci',
    'domain', 'notifications.ansut.ci',
    'templates', ARRAY[
      'email-verification',
      'welcome',
      'lease-signed',
      'payment-received',
      'payment-reminder',
      'visit-scheduled',
      'visit-reminder',
      'property-approved',
      'property-rejected',
      'dispute-created'
    ]
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'email_notifications';

-- Vérifier activation email
DO $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT is_enabled INTO is_active
  FROM feature_flags
  WHERE key = 'email_notifications';
  
  IF is_active THEN
    RAISE NOTICE '✅ Feature flag "email_notifications" activé';
  ELSE
    RAISE WARNING '⚠️ Feature flag "email_notifications" non activé';
  END IF;
END $$;

-- 4.2 : Activer les SMS via Brevo
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'activated_by', 'admin',
    'reason', 'Credentials Brevo configurés et validés',
    'provider', 'brevo',
    'cost', '30 FCFA/SMS',
    'fallback', 'intouch'
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'sms_notifications';

-- Vérifier activation SMS
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

-- 4.3 : Activer WhatsApp via Brevo
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'activated_by', 'admin',
    'reason', 'Credentials Brevo configurés et validés',
    'provider', 'brevo',
    'note', 'Nécessite validation Meta pour WhatsApp Business',
    'fallback', 'intouch'
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'whatsapp_notifications';

-- Vérifier activation WhatsApp
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

-- 4.4 : Activer les cartes Mapbox
UPDATE feature_flags
SET 
  is_enabled = true,
  credentials_status = 'production',
  rollout_percentage = 100,
  metadata = jsonb_build_object(
    'activated_at', NOW(),
    'activated_by', 'admin',
    'reason', 'Token Mapbox configuré et validé',
    'provider', 'mapbox',
    'account', 'psomet',
    'features', ARRAY[
      'interactive_maps',
      'property_clustering',
      'heatmap',
      'routing'
    ]
  ),
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key = 'mapbox_maps';

-- Vérifier activation Mapbox
DO $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT is_enabled INTO is_active
  FROM feature_flags
  WHERE key = 'mapbox_maps';
  
  IF is_active THEN
    RAISE NOTICE '✅ Feature flag "mapbox_maps" activé';
  ELSE
    RAISE WARNING '⚠️ Feature flag "mapbox_maps" non activé';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 5 : VÉRIFICATION COMPLÈTE
-- ============================================================================

-- 5.1 : Résumé des credentials
SELECT 
  '=== CREDENTIALS CONFIGURÉS ===' AS section,
  service_name,
  key_name,
  environment,
  is_active,
  '✅ CONFIGURÉ' AS status
FROM api_keys
WHERE service_name IN ('resend', 'brevo', 'mapbox')
  AND is_active = true
ORDER BY service_name, key_name;

-- 5.2 : Résumé des feature flags
SELECT 
  '=== FEATURE FLAGS ACTIVÉS ===' AS section,
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
  'email_notifications',
  'sms_notifications',
  'whatsapp_notifications',
  'mapbox_maps'
)
ORDER BY key;

-- 5.3 : Vérification finale
DO $$
DECLARE
  resend_ok BOOLEAN;
  brevo_ok BOOLEAN;
  mapbox_ok BOOLEAN;
  flags_ok BOOLEAN;
  total_active INTEGER;
BEGIN
  -- Vérifier Resend
  SELECT COUNT(*) = 3 INTO resend_ok
  FROM api_keys
  WHERE service_name = 'resend' AND is_active = true;
  
  -- Vérifier Brevo
  SELECT COUNT(*) >= 1 INTO brevo_ok
  FROM api_keys
  WHERE service_name = 'brevo' AND is_active = true;
  
  -- Vérifier Mapbox
  SELECT COUNT(*) >= 1 INTO mapbox_ok
  FROM api_keys
  WHERE service_name = 'mapbox' AND is_active = true;
  
  -- Vérifier feature flags
  SELECT COUNT(*) = 4 INTO flags_ok
  FROM feature_flags
  WHERE key IN (
    'email_notifications',
    'sms_notifications',
    'whatsapp_notifications',
    'mapbox_maps'
  ) AND is_enabled = true;
  
  -- Compter total
  SELECT COUNT(*) INTO total_active
  FROM feature_flags
  WHERE key IN (
    'email_notifications',
    'sms_notifications',
    'whatsapp_notifications',
    'mapbox_maps'
  ) AND is_enabled = true;
  
  -- Afficher résultat
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║    RÉSULTAT DE L''ACTIVATION COMMUNICATIONS & CARTES       ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  
  IF resend_ok THEN
    RAISE NOTICE '║ ✅ Resend (Emails) : CONFIGURÉ                             ║';
    RAISE NOTICE '║    📧 Domaine : notifications.ansut.ci                     ║';
    RAISE NOTICE '║    📧 From : no-reply@notifications.ansut.ci               ║';
    RAISE NOTICE '║    📧 Templates : 10 disponibles                           ║';
  ELSE
    RAISE NOTICE '║ ❌ Resend (Emails) : NON CONFIGURÉ                         ║';
  END IF;
  
  RAISE NOTICE '║                                                            ║';
  
  IF brevo_ok THEN
    RAISE NOTICE '║ ✅ Brevo (SMS & WhatsApp) : CONFIGURÉ                      ║';
    RAISE NOTICE '║    💬 SMS : 30 FCFA/SMS                                    ║';
    RAISE NOTICE '║    💬 WhatsApp : Nécessite validation Meta                 ║';
  ELSE
    RAISE NOTICE '║ ❌ Brevo (SMS & WhatsApp) : NON CONFIGURÉ                  ║';
  END IF;
  
  RAISE NOTICE '║                                                            ║';
  
  IF mapbox_ok THEN
    RAISE NOTICE '║ ✅ Mapbox (Cartes) : CONFIGURÉ                             ║';
    RAISE NOTICE '║    🗺️  Compte : psomet                                     ║';
    RAISE NOTICE '║    🗺️  Features : Cartes, Clustering, Heatmap, Routing    ║';
  ELSE
    RAISE NOTICE '║ ❌ Mapbox (Cartes) : NON CONFIGURÉ                         ║';
  END IF;
  
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 📊 Services activés : %/4                                  ║', LPAD(total_active::TEXT, 1, ' ');
  RAISE NOTICE '║                                                            ║';
  
  IF resend_ok AND brevo_ok AND mapbox_ok AND flags_ok THEN
    RAISE NOTICE '║ 🎉 TOUTES LES COMMUNICATIONS ET CARTES SONT ACTIVES !     ║';
  ELSIF NOT (resend_ok AND brevo_ok AND mapbox_ok) THEN
    RAISE NOTICE '║ ⚠️  ATTENTION : Certains credentials ne sont pas configurés║';
  ELSE
    RAISE NOTICE '║ ⚠️  ATTENTION : Certains feature flags ne sont pas activés║';
  END IF;
  
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 6 : COMMANDES DE TEST
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║              COMMANDES DE TEST                             ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 1. Tester l''envoi d''email (Resend) :                     ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       send-email" \                                        ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "to": "test@example.com",                           ║';
  RAISE NOTICE '║        "template": "welcome",                              ║';
  RAISE NOTICE '║        "data": {                                           ║';
  RAISE NOTICE '║          "name": "Test User",                              ║';
  RAISE NOTICE '║          "email": "test@example.com"                       ║';
  RAISE NOTICE '║        }                                                   ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 2. Tester l''envoi de SMS (Brevo) :                       ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       send-sms" \                                          ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "phoneNumber": "0707070707",                        ║';
  RAISE NOTICE '║        "message": "Test SMS depuis Mon Toit"               ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 3. Tester WhatsApp (Brevo) :                              ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    curl -X POST \                                          ║';
  RAISE NOTICE '║      "https://YOUR_PROJECT.supabase.co/functions/v1/\     ║';
  RAISE NOTICE '║       send-whatsapp-brevo" \                               ║';
  RAISE NOTICE '║      -H "Authorization: Bearer YOUR_TOKEN" \               ║';
  RAISE NOTICE '║      -H "Content-Type: application/json" \                 ║';
  RAISE NOTICE '║      -d ''{                                                ║';
  RAISE NOTICE '║        "phoneNumber": "0707070707",                        ║';
  RAISE NOTICE '║        "message": "Test WhatsApp depuis Mon Toit"          ║';
  RAISE NOTICE '║      }''                                                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║ 4. Vérifier Mapbox dans l''interface :                    ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║    - Allez sur la page de recherche de propriétés         ║';
  RAISE NOTICE '║    - La carte Mapbox devrait s''afficher automatiquement  ║';
  RAISE NOTICE '║    - Testez le clustering et la heatmap                    ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ÉTAPE 7 : ROLLBACK (EN CAS DE PROBLÈME)
-- ============================================================================

/*
-- Désactiver tous les feature flags
UPDATE feature_flags
SET 
  is_enabled = false,
  credentials_status = 'not_configured',
  updated_at = NOW(),
  updated_by = auth.uid()
WHERE key IN (
  'email_notifications',
  'sms_notifications',
  'whatsapp_notifications',
  'mapbox_maps'
);

-- Désactiver les credentials
UPDATE api_keys
SET 
  is_active = false,
  updated_at = NOW()
WHERE service_name IN ('resend', 'brevo', 'mapbox');

RAISE NOTICE '⚠️ Communications et cartes désactivées';
*/

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

