# 🚨 INCIDENT DE SÉCURITÉ - CLÉS API EXPOSÉES

**Date de l'incident :** 21 novembre 2025  
**Sévérité :** 🔴 **CRITIQUE**  
**Statut :** ⚠️ **ACTION IMMÉDIATE REQUISE**

---

## 📋 RÉSUMÉ EXÉCUTIF

Des clés API de production ont été **accidentellement commitées** dans le dépôt Git public `MONTOIT-STABLE` via le fichier `.env.production`.

**Impact :** 🔴 **ÉLEVÉ** - Les clés sont publiquement accessibles sur GitHub

**Action immédiate requise :** Rotation de toutes les clés exposées

---

## 🔴 CLÉS EXPOSÉES (À ROTER IMMÉDIATEMENT)

### 1. Mapbox (Cartes)

**Clé exposée :**
```
pk.eyJ1IjoicHNvbWV0IiwiYSI6ImNtYTgwZ2xmMzEzdWcyaXM2ZG45d3A4NmEifQ.MYXzdc5CREmcvtBLvfV0Lg
```

**Impact :** 🟡 MOYEN
- Token public (moins critique)
- Peut être utilisé pour consommer votre quota Mapbox
- Risque de frais non autorisés

**Action requise :**
1. ✅ Révoquer le token sur https://account.mapbox.com/access-tokens/
2. ✅ Générer un nouveau token public
3. ✅ Mettre à jour dans les variables d'environnement Supabase
4. ✅ Vérifier l'utilisation non autorisée dans les logs Mapbox

---

### 2. Resend (Emails)

**Clé exposée :**
```
re_DvxxTkmv_KLgX7D1LSvr4tVZK1EUtRLv9
```

**Domaine :** `notifications.ansut.ci`  
**From Email :** `no-reply@notifications.ansut.ci`

**Impact :** 🔴 ÉLEVÉ
- Peut être utilisée pour envoyer des emails depuis votre domaine
- Risque de spam / phishing en votre nom
- Risque de blacklist du domaine
- Risque de frais non autorisés

**Action requise :**
1. 🔴 **URGENT** : Révoquer la clé sur https://resend.com/api-keys
2. ✅ Générer une nouvelle clé API
3. ✅ Mettre à jour dans les variables d'environnement Supabase
4. ✅ Vérifier les emails envoyés dans les logs Resend
5. ✅ Surveiller la réputation du domaine notifications.ansut.ci
6. ✅ Vérifier que le domaine n'est pas blacklisté

---

### 3. Brevo (SMS & WhatsApp)

**Clé exposée :**
```
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
```

**Impact :** 🔴 ÉLEVÉ
- Peut être utilisée pour envoyer des SMS
- Risque de spam SMS
- Risque de frais non autorisés (30 FCFA/SMS)
- Peut consommer rapidement votre crédit

**Action requise :**
1. 🔴 **URGENT** : Révoquer la clé sur https://app.brevo.com/settings/keys/api
2. ✅ Générer une nouvelle clé API
3. ✅ Mettre à jour dans les variables d'environnement Supabase
4. ✅ Vérifier les SMS envoyés dans les logs Brevo
5. ✅ Vérifier le solde et les transactions
6. ✅ Activer les alertes de seuil de dépenses

---

### 4. CryptoNeo (Signature Électronique)

**Clés exposées :**
```
App Key: f1e12a-d652-a757-b968-4784-3b062142
App Secret: 4a76-b456-c170-a774-410b-b0a5-9c67-b20c
```

**Environment :** TEST (sandbox)  
**URL :** `https://ansut.cryptoneoplatforms.com/esignaturedemo`

**Impact :** 🟡 MOYEN
- Credentials de TEST uniquement (pas de production)
- Les signatures ne sont pas valides légalement
- Risque limité mais rotation recommandée

**Action requise :**
1. ✅ Contacter CryptoNeo via l'ANSUT
2. ✅ Demander de nouvelles credentials de TEST
3. ✅ Mettre à jour dans les variables d'environnement Supabase
4. ✅ Vérifier les logs d'utilisation

---

## ⏱️ CHRONOLOGIE DE L'INCIDENT

| Date/Heure | Événement |
|------------|-----------|
| 21 nov 2025, 13:00 | Création du fichier `.env.production` avec credentials réels |
| 21 nov 2025, 13:30 | Commit du fichier dans Git |
| 21 nov 2025, 13:35 | Push vers GitHub (dépôt public) |
| 21 nov 2025, 14:00 | **Clés exposées publiquement** |
| 21 nov 2025, [HEURE] | 🚨 **Incident détecté par l'utilisateur** |
| 21 nov 2025, [HEURE] | Suppression du fichier du dépôt |
| 21 nov 2025, [HEURE] | ⏳ **Rotation des clés en cours** |

**Durée d'exposition :** ~1 heure (estimation)

---

## ✅ ACTIONS CORRECTIVES PRISES

### 1. Suppression Immédiate

✅ Fichier `.env.production` supprimé du dépôt Git  
✅ Ajout de `.env.production` à `.gitignore`  
✅ Commit de sécurité créé

### 2. Documentation

✅ Ce document d'incident créé  
✅ Guide de rotation des clés fourni  
✅ Guide de sécurité créé

---

## 🔄 GUIDE DE ROTATION DES CLÉS

### Mapbox

**1. Se connecter à Mapbox**
```
https://account.mapbox.com/
```

**2. Accéder aux tokens**
```
Account > Access tokens
```

**3. Révoquer le token exposé**
- Trouver le token commençant par `pk.eyJ1IjoicHNvbWV0...`
- Cliquer sur "Delete" ou "Revoke"
- Confirmer la révocation

**4. Créer un nouveau token**
- Cliquer sur "Create a token"
- Nom : `Mon Toit Production - Nov 2025`
- Scopes : Public (read only)
- Copier le nouveau token

**5. Mettre à jour Supabase**
```bash
# Via Supabase Dashboard
# Settings > Edge Functions > Environment Variables
# Mettre à jour VITE_MAPBOX_PUBLIC_TOKEN
```

**6. Redéployer les Edge Functions**
```bash
supabase functions deploy --all
```

---

### Resend

**1. Se connecter à Resend**
```
https://resend.com/login
```

**2. Accéder aux API Keys**
```
Settings > API Keys
```

**3. Révoquer la clé exposée**
- Trouver la clé `re_DvxxTkmv...`
- Cliquer sur "Delete"
- Confirmer la suppression

**4. Créer une nouvelle clé**
- Cliquer sur "Create API Key"
- Nom : `Mon Toit Production - Nov 2025`
- Permission : Full access
- Copier la nouvelle clé (elle ne sera affichée qu'une fois !)

**5. Mettre à jour Supabase**
```bash
# Via Supabase Dashboard
# Settings > Edge Functions > Environment Variables
# Mettre à jour RESEND_API_KEY
```

**6. Tester l'envoi d'email**
```bash
curl -X POST \
  "https://YOUR_PROJECT.supabase.co/functions/v1/send-email" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "template": "welcome",
    "data": {"name": "Test"}
  }'
```

---

### Brevo

**1. Se connecter à Brevo**
```
https://app.brevo.com/
```

**2. Accéder aux API Keys**
```
Settings > SMTP & API > API Keys
```

**3. Révoquer la clé exposée**
- Trouver la clé `xkeysib-d8c9...`
- Cliquer sur "Delete"
- Confirmer la suppression

**4. Créer une nouvelle clé**
- Cliquer sur "Generate a new API key"
- Nom : `Mon Toit Production - Nov 2025`
- Copier la nouvelle clé

**5. Mettre à jour Supabase**
```bash
# Via Supabase Dashboard
# Settings > Edge Functions > Environment Variables
# Mettre à jour BREVO_API_KEY
```

**6. Tester l'envoi de SMS**
```bash
curl -X POST \
  "https://YOUR_PROJECT.supabase.co/functions/v1/send-sms" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0707070707",
    "message": "Test SMS"
  }'
```

---

### CryptoNeo (TEST)

**1. Contacter l'ANSUT**
```
Email : support@ansut.ci
Objet : Rotation credentials CryptoNeo TEST
```

**2. Demander de nouvelles credentials**
```
Bonjour,

Nous avons besoin de nouvelles credentials de TEST pour CryptoNeo
suite à une exposition accidentelle de nos clés actuelles.

Credentials exposées :
- App Key : f1e12a-d652-a757-b968-4784-3b062142
- App Secret : 4a76-b456-c170-a774-410b-b0a5-9c67-b20c

Merci de nous fournir de nouvelles credentials de TEST.

Cordialement,
```

**3. Mettre à jour Supabase**
```bash
# Via Supabase Dashboard
# Settings > Edge Functions > Environment Variables
# Mettre à jour CRYPTONEO_APP_KEY et CRYPTONEO_APP_SECRET
```

---

## 📊 VÉRIFICATION POST-ROTATION

### Checklist

- [ ] **Mapbox** : Token révoqué et nouveau token généré
- [ ] **Mapbox** : Nouveau token testé et fonctionnel
- [ ] **Mapbox** : Logs vérifiés (pas d'utilisation suspecte)
- [ ] **Resend** : Clé révoquée et nouvelle clé générée
- [ ] **Resend** : Nouvelle clé testée (envoi d'email)
- [ ] **Resend** : Logs vérifiés (pas d'emails suspects)
- [ ] **Resend** : Domaine notifications.ansut.ci vérifié (pas de blacklist)
- [ ] **Brevo** : Clé révoquée et nouvelle clé générée
- [ ] **Brevo** : Nouvelle clé testée (envoi de SMS)
- [ ] **Brevo** : Logs vérifiés (pas de SMS suspects)
- [ ] **Brevo** : Solde vérifié (pas de dépenses suspectes)
- [ ] **CryptoNeo** : Nouvelles credentials demandées à l'ANSUT
- [ ] **CryptoNeo** : Nouvelles credentials reçues et configurées
- [ ] **Git** : `.env.production` supprimé du dépôt
- [ ] **Git** : `.env.production` ajouté à `.gitignore`
- [ ] **Git** : Historique Git vérifié (pas d'autres expositions)
- [ ] **Supabase** : Toutes les variables d'environnement mises à jour
- [ ] **Supabase** : Edge Functions redéployées
- [ ] **Tests** : Tous les services testés et fonctionnels
- [ ] **Monitoring** : Alertes configurées pour détecter utilisation suspecte
- [ ] **Documentation** : Équipe informée de l'incident
- [ ] **Post-mortem** : Réunion d'analyse de l'incident planifiée

---

## 🔍 SURVEILLANCE POST-INCIDENT

### Logs à Surveiller (7 jours)

**Mapbox**
- Nombre de requêtes par jour
- Origines des requêtes (IP, domaines)
- Quota consommé

**Resend**
- Emails envoyés par jour
- Destinataires inhabituels
- Taux de bounce/spam
- Réputation du domaine

**Brevo**
- SMS envoyés par jour
- Numéros inhabituels
- Dépenses quotidiennes
- Solde du compte

**CryptoNeo**
- Signatures créées
- Utilisateurs inhabituels
- Opérations suspectes

---

## 💰 ESTIMATION DES COÛTS POTENTIELS

### Scénario Pessimiste (Utilisation Malveillante)

| Service | Risque | Coût Potentiel |
|---------|--------|----------------|
| **Mapbox** | Consommation quota | 0-50 USD |
| **Resend** | Spam emails | 0-500 USD |
| **Brevo** | Spam SMS | 0-1000 USD (33,000 SMS) |
| **CryptoNeo** | TEST uniquement | 0 USD |
| **TOTAL** | | **0-1,550 USD** |

### Scénario Réaliste (Exposition Courte)

Exposition de ~1 heure, faible probabilité de découverte et d'exploitation.

**Coût estimé : 0-50 USD**

---

## 📚 LEÇONS APPRISES

### Ce qui a mal fonctionné

1. ❌ Fichier `.env.production` committé avec credentials réels
2. ❌ Pas de vérification avant le commit
3. ❌ Pas de pre-commit hook pour bloquer les secrets
4. ❌ `.env.production` n'était pas dans `.gitignore`

### Ce qui a bien fonctionné

1. ✅ Détection rapide de l'incident par l'utilisateur
2. ✅ Réaction immédiate pour supprimer le fichier
3. ✅ Documentation complète de l'incident
4. ✅ Plan de rotation des clés fourni

---

## 🛡️ MESURES PRÉVENTIVES

Voir le document `SECURITY_BEST_PRACTICES.md` pour les recommandations complètes.

**Actions immédiates :**

1. ✅ Utiliser un gestionnaire de secrets (Vault, AWS Secrets Manager, Supabase Secrets)
2. ✅ Installer `git-secrets` ou `gitleaks` pour scanner les commits
3. ✅ Configurer des pre-commit hooks
4. ✅ Former l'équipe sur les bonnes pratiques
5. ✅ Auditer régulièrement le dépôt Git
6. ✅ Rotation régulière des clés (tous les 90 jours)
7. ✅ Monitoring et alertes sur l'utilisation des API

---

## 📞 CONTACTS D'URGENCE

**En cas de problème :**

- **Mapbox Support** : https://support.mapbox.com
- **Resend Support** : support@resend.com
- **Brevo Support** : https://help.brevo.com
- **ANSUT** : support@ansut.ci
- **CryptoNeo** : Via ANSUT

---

## 📝 RAPPORT POST-INCIDENT

**À compléter après résolution :**

- [ ] Date de résolution complète : _______________
- [ ] Coût réel de l'incident : _______________
- [ ] Utilisation malveillante détectée : Oui / Non
- [ ] Mesures préventives implémentées : _______________
- [ ] Réunion post-mortem effectuée : Oui / Non
- [ ] Documentation mise à jour : Oui / Non

---

**Document créé le :** 21 novembre 2025  
**Dernière mise à jour :** 21 novembre 2025  
**Responsable :** Équipe Technique Mon Toit  
**Statut :** 🔴 **EN COURS - ACTION REQUISE**

