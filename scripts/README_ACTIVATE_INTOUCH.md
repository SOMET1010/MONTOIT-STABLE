# 🚀 GUIDE D'ACTIVATION DE L'INTÉGRATION INTOUCH

**Date :** 21 novembre 2025  
**Auteur :** Manus AI  
**Version :** 1.0  
**Script :** `activate_intouch_integration.sql`

---

## 📋 DESCRIPTION

Ce script SQL permet d'activer **complètement** l'intégration InTouch sur la plateforme Mon Toit en utilisant le système de feature flags. Il configure les credentials et active tous les services InTouch en une seule exécution.

### Services Activés

Le script active **7 services InTouch** :

1. **Paiements InTouch** (service principal)
2. **Orange Money** (paiement mobile)
3. **MTN Money** (paiement mobile)
4. **Moov Money** (paiement mobile)
5. **Wave** (paiement mobile)
6. **SMS InTouch** (notifications SMS)
7. **WhatsApp InTouch** (notifications WhatsApp)

---

## ⚠️ PRÉREQUIS

Avant d'exécuter ce script, vous devez avoir :

### 1. Credentials InTouch

Vous devez obtenir les credentials suivants auprès d'InTouch :

| Credential | Description | Exemple |
|------------|-------------|---------|
| `username` | Nom d'utilisateur InTouch | `montoit_partner` |
| `password` | Mot de passe InTouch | `P@ssw0rd123!` |
| `partner_id` | Identifiant partenaire | `PART_12345` |
| `login_api` | Login API | `api_login_montoit` |
| `password_api` | Password API | `api_P@ss123!` |

**Comment obtenir ces credentials :**

1. Contactez InTouch : https://www.gutouch.com
2. Créez un compte partenaire
3. Remplissez le formulaire de partenariat
4. Attendez la validation (généralement 3-5 jours ouvrés)
5. Recevez vos credentials par email

### 2. Système de Feature Flags

Le système de feature flags doit être installé. Si ce n'est pas le cas, exécutez d'abord :

```bash
psql -d your_database -f supabase/migrations/20251121100000_create_feature_flags_system.sql
```

### 3. Table api_keys

La table `api_keys` doit exister dans votre base de données. Elle est normalement créée lors de l'initialisation de Mon Toit.

---

## 🔧 UTILISATION

### Étape 1 : Modifier le Script

Ouvrez le fichier `activate_intouch_integration.sql` et remplacez les valeurs suivantes par vos credentials réels :

```sql
-- Ligne ~50
'YOUR_INTOUCH_USERNAME' → Remplacez par votre username

-- Ligne ~63
'YOUR_INTOUCH_PASSWORD' → Remplacez par votre password

-- Ligne ~76
'YOUR_PARTNER_ID' → Remplacez par votre partner_id

-- Ligne ~89
'YOUR_LOGIN_API' → Remplacez par votre login_api

-- Ligne ~102
'YOUR_PASSWORD_API' → Remplacez par votre password_api
```

**Exemple de modification :**

```sql
-- AVANT
'YOUR_INTOUCH_USERNAME'

-- APRÈS
'montoit_partner'
```

### Étape 2 : Choisir l'Environnement

Par défaut, le script configure l'environnement **production**. Si vous voulez tester en **sandbox** d'abord, modifiez :

```sql
-- Ligne ~45 et suivantes
environment = 'production' → Changez en 'sandbox'

-- Ligne ~137
credentials_status = 'production' → Changez en 'sandbox'
```

**Recommandation :** Testez toujours en sandbox avant de passer en production.

### Étape 3 : Exécuter le Script

#### Option A : Via psql (Ligne de commande)

```bash
# Se connecter à la base de données
psql -h your-db-host -U your-db-user -d your-db-name

# Exécuter le script
\i /path/to/activate_intouch_integration.sql

# Ou en une seule commande
psql -h your-db-host -U your-db-user -d your-db-name -f activate_intouch_integration.sql
```

#### Option B : Via Supabase Dashboard

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **Database** > **SQL Editor**
4. Créez une nouvelle query
5. Copiez-collez le contenu du script (après modification)
6. Cliquez sur **Run**

#### Option C : Via DBeaver / pgAdmin

1. Ouvrez votre client SQL préféré
2. Connectez-vous à votre base de données
3. Ouvrez le fichier `activate_intouch_integration.sql`
4. Exécutez le script

### Étape 4 : Vérifier l'Activation

Le script affiche automatiquement un résumé à la fin de l'exécution :

```
╔════════════════════════════════════════════════════════════╗
║         RÉSULTAT DE L'ACTIVATION INTOUCH                  ║
╠════════════════════════════════════════════════════════════╣
║ ✅ Credentials InTouch : CONFIGURÉS                        ║
║ 📊 Services activés : 7/7                                  ║
║                                                            ║
║ ✅ Paiements InTouch : ACTIF                               ║
║ ✅ Orange Money : ACTIF                                    ║
║ ✅ MTN Money : ACTIF                                       ║
║ ✅ Moov Money : ACTIF                                      ║
║ ✅ Wave : ACTIF                                            ║
║ ✅ SMS InTouch : ACTIF                                     ║
║ ✅ WhatsApp InTouch : ACTIF                                ║
║                                                            ║
║ 🎉 INTÉGRATION INTOUCH COMPLÈTE ET OPÉRATIONNELLE !       ║
╚════════════════════════════════════════════════════════════╝
```

Si vous voyez ce message, l'intégration est **complète et opérationnelle** ! 🎉

---

## 🧪 TESTS

Après l'activation, testez chaque service pour vous assurer qu'il fonctionne correctement.

### Test 1 : Paiement Orange Money

```bash
curl -X POST \
  "https://YOUR_PROJECT.supabase.co/functions/v1/intouch-payment-initiate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "phoneNumber": "0707070707",
    "provider": "orange_money",
    "description": "Test paiement Orange Money"
  }'
```

**Résultat attendu :**

```json
{
  "success": true,
  "transactionId": "MTT_PAY_1234567890_ABC123",
  "status": "pending",
  "message": "Paiement initié avec succès"
}
```

### Test 2 : SMS

```bash
curl -X POST \
  "https://YOUR_PROJECT.supabase.co/functions/v1/send-sms-intouch" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0707070707",
    "message": "Test SMS depuis Mon Toit"
  }'
```

**Résultat attendu :**

```json
{
  "success": true,
  "messageId": "MSG_1234567890",
  "status": "sent"
}
```

### Test 3 : WhatsApp

```bash
curl -X POST \
  "https://YOUR_PROJECT.supabase.co/functions/v1/send-whatsapp" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0707070707",
    "message": "Test WhatsApp depuis Mon Toit"
  }'
```

**Résultat attendu :**

```json
{
  "success": true,
  "messageId": "WA_1234567890",
  "status": "sent"
}
```

### Test 4 : Vérifier via l'Interface Admin

1. Allez sur `/admin/feature-flags`
2. Recherchez "intouch"
3. Vérifiez que tous les flags sont **activés** (switch vert)
4. Vérifiez que le statut est **"Production"** (badge vert)

---

## 📊 CE QUE FAIT LE SCRIPT

Le script exécute 5 étapes principales :

### Étape 1 : Configuration des Credentials

Le script insère ou met à jour les 6 credentials InTouch dans la table `api_keys` :

- `base_url` : URL de l'API InTouch
- `username` : Nom d'utilisateur
- `password` : Mot de passe
- `partner_id` : Identifiant partenaire
- `login_api` : Login API
- `password_api` : Password API

**Sécurité :** Les credentials sont stockés de manière sécurisée dans la base de données avec RLS activé.

### Étape 2 : Activation des Feature Flags

Le script active 7 feature flags :

1. `intouch_payment` - Service principal de paiement
2. `orange_money` - Méthode de paiement Orange Money
3. `mtn_money` - Méthode de paiement MTN Money
4. `moov_money` - Méthode de paiement Moov Money
5. `wave_payment` - Méthode de paiement Wave
6. `sms_notifications` - Notifications SMS
7. `whatsapp_notifications` - Notifications WhatsApp

**Rollout :** Tous les flags sont déployés à **100%** des utilisateurs par défaut.

### Étape 3 : Vérification Complète

Le script vérifie automatiquement que :

- Tous les credentials sont configurés (pas de valeur `YOUR_XXX`)
- Tous les feature flags sont activés
- Le statut est correct (production ou sandbox)

### Étape 4 : Affichage des Commandes de Test

Le script affiche les commandes curl prêtes à l'emploi pour tester chaque service.

### Étape 5 : Rollback (Optionnel)

Le script contient une section commentée pour désactiver l'intégration en cas de problème.

---

## 🔄 ROLLBACK

Si vous rencontrez des problèmes et devez désactiver l'intégration InTouch, décommentez la section **ÉTAPE 5** du script et exécutez-la :

```sql
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
```

**Effet :** Tous les services InTouch seront immédiatement désactivés sur la plateforme.

---

## 🎯 ROLLOUT PROGRESSIF

Si vous voulez déployer progressivement InTouch (par exemple, à 10% des utilisateurs d'abord), modifiez le `rollout_percentage` :

```sql
-- Déployer à 10% des utilisateurs
UPDATE feature_flags
SET rollout_percentage = 10
WHERE key = 'intouch_payment';

-- Augmenter à 50%
UPDATE feature_flags
SET rollout_percentage = 50
WHERE key = 'intouch_payment';

-- Déployer à 100%
UPDATE feature_flags
SET rollout_percentage = 100
WHERE key = 'intouch_payment';
```

**Comment ça marche :** Le système utilise un hash du `user_id` pour déterminer si un utilisateur fait partie du rollout.

---

## 🔍 DÉPANNAGE

### Problème : "Credentials InTouch : NON CONFIGURÉS"

**Cause :** Vous n'avez pas remplacé les valeurs `YOUR_XXX` dans le script.

**Solution :** Modifiez le script et remplacez toutes les valeurs `YOUR_XXX` par vos credentials réels.

### Problème : "Services activés : 0/7"

**Cause :** La table `feature_flags` n'existe pas ou n'est pas peuplée.

**Solution :** Exécutez d'abord la migration du système de feature flags :

```bash
psql -d your_database -f supabase/migrations/20251121100000_create_feature_flags_system.sql
```

### Problème : "Permission denied"

**Cause :** Vous n'avez pas les droits d'administrateur sur la base de données.

**Solution :** Connectez-vous avec un compte ayant les droits `admin` ou `service_role`.

### Problème : Les paiements échouent

**Causes possibles :**

1. **Credentials incorrects** : Vérifiez vos credentials auprès d'InTouch
2. **Environnement incorrect** : Vérifiez que vous êtes en `sandbox` pour les tests
3. **Numéro de téléphone invalide** : Utilisez un numéro ivoirien valide (+225...)
4. **Montant invalide** : Vérifiez les limites min/max (100 - 1,000,000 FCFA)

**Solution :** Consultez les logs dans la table `payment_logs` :

```sql
SELECT * FROM payment_logs 
WHERE provider = 'intouch' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Problème : Les SMS ne sont pas reçus

**Causes possibles :**

1. **Credentials incorrects**
2. **Numéro de téléphone invalide**
3. **Solde InTouch insuffisant**

**Solution :** Consultez les logs dans la table `sms_logs` :

```sql
SELECT * FROM sms_logs 
WHERE provider = 'intouch' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📈 MONITORING

Après l'activation, surveillez les métriques suivantes :

### Paiements

```sql
-- Nombre de paiements par jour
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS total_payments,
  SUM(amount) AS total_amount,
  COUNT(*) FILTER (WHERE status = 'success') AS successful_payments
FROM payment_logs
WHERE provider = 'intouch'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### SMS

```sql
-- Nombre de SMS par jour
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS total_sms,
  COUNT(*) FILTER (WHERE status = 'sent') AS sent_sms,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_sms
FROM sms_logs
WHERE provider = 'intouch'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### WhatsApp

```sql
-- Nombre de messages WhatsApp par jour
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS total_messages,
  COUNT(*) FILTER (WHERE status = 'sent') AS sent_messages,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_messages
FROM whatsapp_logs
WHERE provider = 'intouch'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Coûts

```sql
-- Coûts estimés par service
SELECT 
  'Paiements' AS service,
  COUNT(*) AS transactions,
  SUM(amount) * 0.01 AS cost_fcfa, -- 1% de commission
  'Commission' AS type
FROM payment_logs
WHERE provider = 'intouch' AND status = 'success'
  AND created_at >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
  'SMS' AS service,
  COUNT(*) AS transactions,
  COUNT(*) * 25 AS cost_fcfa, -- 25 FCFA/SMS
  'Forfait' AS type
FROM sms_logs
WHERE provider = 'intouch' AND status = 'sent'
  AND created_at >= NOW() - INTERVAL '30 days';
```

---

## 💡 BONNES PRATIQUES

### 1. Tester en Sandbox D'abord

Configurez toujours l'environnement en `sandbox` avant de passer en production :

```sql
environment = 'sandbox'
credentials_status = 'sandbox'
```

### 2. Rollout Progressif

Déployez progressivement à 10%, 50%, puis 100% des utilisateurs pour minimiser les risques.

### 3. Monitorer les Coûts

InTouch facture :
- **1%** de commission sur les paiements
- **25 FCFA** par SMS

Mettez en place des alertes si les coûts dépassent un seuil.

### 4. Sauvegarder les Credentials

Conservez une copie sécurisée de vos credentials InTouch dans un gestionnaire de mots de passe (1Password, LastPass, etc.).

### 5. Logs et Audit

Consultez régulièrement les logs pour détecter les anomalies :

```sql
-- Taux d'échec des paiements
SELECT 
  COUNT(*) FILTER (WHERE status = 'failed') * 100.0 / COUNT(*) AS failure_rate
FROM payment_logs
WHERE provider = 'intouch'
  AND created_at >= NOW() - INTERVAL '24 hours';
```

Si le taux d'échec dépasse 5%, contactez InTouch.

---

## 📞 SUPPORT

### Support InTouch

- **Site web :** https://www.gutouch.com
- **Email :** support@gutouch.com
- **Téléphone :** +225 XX XX XX XX XX

### Support Mon Toit

- **Documentation :** https://github.com/SOMET1010/MONTOIT-STABLE
- **Issues GitHub :** https://github.com/SOMET1010/MONTOIT-STABLE/issues

---

## 📝 CHANGELOG

### Version 1.0 (21 novembre 2025)

- ✅ Script initial d'activation InTouch
- ✅ Configuration automatique des 6 credentials
- ✅ Activation automatique des 7 feature flags
- ✅ Vérification complète de l'intégration
- ✅ Affichage des commandes de test
- ✅ Section rollback incluse

---

## 🎉 CONCLUSION

Ce script vous permet d'activer **complètement** l'intégration InTouch en **une seule exécution**. Après avoir remplacé vos credentials et exécuté le script, tous les services InTouch (paiements, SMS, WhatsApp) seront immédiatement opérationnels sur la plateforme Mon Toit.

**Temps d'exécution :** < 5 secondes  
**Complexité :** Simple (remplacer 5 valeurs)  
**Résultat :** 7 services activés instantanément

**Bonne activation !** 🚀

---

**Documentation créée par Manus AI**  
**Date : 21 novembre 2025**  
**Version : 1.0**

