# 🔍 RAPPORT: FONCTIONNALITÉS MANQUANTES OU INCOMPLÈTES

**Date d'analyse :** 21 novembre 2025  
**Auteur :** Manus AI  
**Version de la plateforme :** v4.0.0-unified  
**Dépôt :** https://github.com/SOMET1010/MONTOIT-STABLE

---

## 📊 RÉSUMÉ EXÉCUTIF

Après une analyse approfondie du code source, de la documentation et des Edge Functions, j'ai identifié **les fonctionnalités manquantes ou incomplètes** dans la plateforme Mon Toit. La plateforme dispose d'une **base solide avec 69 pages React et 69 Edge Functions**, mais certaines fonctionnalités critiques nécessitent une attention particulière pour être pleinement opérationnelles.

### Vue d'Ensemble

| Catégorie | Implémenté | Incomplet | Manquant | Priorité |
|-----------|------------|-----------|----------|----------|
| **Authentification & Profils** | ✅ 90% | 🟡 10% | - | Basse |
| **Propriétés & Recherche** | ✅ 95% | 🟡 5% | - | Basse |
| **Vérifications d'Identité** | 🟡 60% | 🔴 30% | 🔴 10% | **CRITIQUE** |
| **Signature Électronique CEV** | 🟡 70% | 🔴 20% | 🔴 10% | **CRITIQUE** |
| **Paiements Mobile Money** | 🟡 80% | 🟡 15% | 🟡 5% | **HAUTE** |
| **Contrats & Baux** | ✅ 85% | 🟡 10% | 🟡 5% | **HAUTE** |
| **Messagerie** | ✅ 100% | - | - | Basse |
| **Notifications** | 🟡 70% | 🟡 20% | 🟡 10% | Moyenne |
| **Agences** | ✅ 90% | 🟡 10% | - | Basse |
| **Admin & Modération** | ✅ 85% | 🟡 15% | - | Moyenne |
| **IA & Chatbot** | 🟡 75% | 🟡 20% | 🟡 5% | Moyenne |
| **Analytics & Reporting** | 🟡 60% | 🟡 30% | 🟡 10% | Moyenne |

---

## 🔴 FONCTIONNALITÉS CRITIQUES MANQUANTES

### 1. Vérification d'Identité ONECI (NNI)

**Statut :** 🔴 **INCOMPLET - CRITIQUE**

#### Ce qui existe
- ✅ Edge Function `oneci-verification` créée
- ✅ Interface utilisateur pour saisir le NNI
- ✅ Variables d'environnement définies dans `.env.example`

#### Ce qui manque
- ❌ **Clés API ONECI réelles** - Les variables sont des placeholders
- ❌ **Documentation officielle ONECI** - Endpoint exact et format de réponse inconnus
- ❌ **Tests d'intégration** - Aucun test avec l'API réelle
- ❌ **Gestion des erreurs spécifiques** - Codes d'erreur ONECI non documentés
- ❌ **Fallback en cas d'indisponibilité** - Pas de plan B si ONECI est down

#### Impact
🔴 **BLOQUANT** - La vérification NNI est **obligatoire** pour la cachet électronique visible. Sans cela, la plateforme ne peut pas être certifiée.

#### Actions requises
1. **Obtenir les credentials ONECI** auprès de l'ANSUT
2. **Documenter l'API ONECI** (endpoints, formats, codes d'erreur)
3. **Implémenter les tests** avec l'environnement de sandbox ONECI
4. **Créer un fallback** (validation manuelle par tiers de confiance)
5. **Ajouter le monitoring** des appels ONECI

**Temps estimé :** 3-5 jours

---

### 2. Signature Électronique CryptoNeo (CEV)

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - CRITIQUE**

#### Ce qui existe
- ✅ 6 Edge Functions CryptoNeo créées :
  - `cryptoneo-auth` - Authentification
  - `cryptoneo-send-otp` - Envoi OTP
  - `cryptoneo-signature` - Signature
  - `cryptoneo-sign-document` - Signature de document
  - `cryptoneo-verify-signature` - Vérification
  - `cryptoneo-generate-certificate` - Génération certificat
- ✅ Interface utilisateur pour signer
- ✅ Variables d'environnement définies

#### Ce qui manque
- ❌ **Workflow complet de signature** - Les fonctions existent mais ne sont pas orchestrées
- ❌ **Stockage sécurisé des certificats** - Où sont stockés les CEV signés ?
- ❌ **Vérification de validité** - Comment vérifier qu'un CEV est valide après 1 an ?
- ❌ **Intégration avec les contrats** - Lien entre `lease_contracts` et `digital_certificates`
- ❌ **Tests end-to-end** - Signature complète d'un bail non testée
- ❌ **Gestion des expirations** - Pas de rappel avant expiration du CEV

#### Impact
🔴 **BLOQUANT** - La signature électronique CEV est le **cœur de la valeur ajoutée** de Mon Toit. Sans workflow complet, les baux n'ont pas de valeur juridique.

#### Actions requises
1. **Créer le workflow orchestré** :
   - Génération PDF → Envoi OTP → Signature → Stockage → Notification
2. **Implémenter le stockage sécurisé** dans Supabase Storage avec chiffrement
3. **Créer la table de liaison** `contract_certificates` (contract_id, certificate_id, status)
4. **Ajouter les rappels d'expiration** (30 jours avant expiration)
5. **Tester le workflow complet** avec CryptoNeo sandbox
6. **Documenter le processus** pour les utilisateurs

**Temps estimé :** 5-7 jours

---

### 3. Callback Webhook ONECI CEV

**Statut :** 🔴 **MANQUANT - CRITIQUE**

#### Ce qui existe
- ✅ Edge Function `oneci-cev-webhook` créée
- ✅ Endpoint défini

#### Ce qui manque
- ❌ **Configuration webhook côté ONECI** - L'endpoint n'est pas enregistré chez ONECI
- ❌ **Validation de la signature** - Comment vérifier que le webhook vient bien d'ONECI ?
- ❌ **Gestion des statuts CEV** - Que faire quand ONECI notifie un changement de statut ?
- ❌ **Retry logic** - Que faire si le webhook échoue ?
- ❌ **Monitoring** - Aucun log des webhooks reçus

#### Impact
🔴 **BLOQUANT** - Sans webhook, la plateforme ne sait pas quand un CEV est validé par ONECI. Les utilisateurs ne reçoivent pas de notification.

#### Actions requises
1. **Configurer le webhook** dans le portail ONECI
2. **Implémenter la validation** de signature HMAC
3. **Créer la logique de traitement** des événements CEV
4. **Ajouter le retry** avec exponential backoff
5. **Implémenter le monitoring** avec logs et alertes

**Temps estimé :** 2-3 jours

---

### 4. Vérification Biométrique (Smile ID / NeoFace)

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - HAUTE**

#### Ce qui existe
- ✅ Edge Function `face-verification` créée
- ✅ Edge Function `azure-face-verify` créée
- ✅ Variables d'environnement pour Smile ID et Smileless (NeoFace)

#### Ce qui manque
- ❌ **Choix entre Smile ID et NeoFace** - Quelle solution utiliser en production ?
- ❌ **Capture photo côté client** - Pas de composant React pour prendre une photo
- ❌ **Comparaison avec photo NNI** - Comment obtenir la photo depuis ONECI ?
- ❌ **Seuil de confiance** - Quel score minimum pour valider (80%, 90%, 95%) ?
- ❌ **Gestion des échecs** - Que faire si la vérification échoue 3 fois ?
- ❌ **Stockage des photos** - Où stocker les photos de vérification (RGPD) ?

#### Impact
🟡 **HAUTE** - La vérification biométrique est un **différenciateur majeur** de Mon Toit. Sans elle, la plateforme perd un avantage compétitif.

#### Actions requises
1. **Choisir la solution définitive** (Smile ID recommandé pour l'Afrique)
2. **Créer le composant React** de capture photo avec webcam
3. **Implémenter la comparaison** avec la photo NNI (si disponible via ONECI)
4. **Définir les seuils** de confiance selon les tests
5. **Créer le workflow de retry** (max 3 tentatives)
6. **Implémenter le stockage sécurisé** avec expiration automatique (30 jours)

**Temps estimé :** 4-6 jours

---

### 5. Vérification CNAM (Carte Nationale d'Assurance Maladie)

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - MOYENNE**

#### Ce qui existe
- ✅ Edge Function `cnam-verification` créée
- ✅ Table `cnam_verifications` dans la base de données

#### Ce qui manque
- ❌ **API CNAM réelle** - Pas de documentation sur l'API CNAM ivoirienne
- ❌ **Credentials CNAM** - Pas de clés API
- ❌ **Format des données** - Quel format de réponse attend-on ?
- ❌ **Optionnalité** - La vérification CNAM est-elle obligatoire ou optionnelle ?

#### Impact
🟡 **MOYENNE** - La vérification CNAM est un **plus** mais pas critique. Elle peut être ajoutée plus tard.

#### Actions requises
1. **Contacter la CNAM** pour obtenir l'accès API
2. **Documenter l'API** CNAM
3. **Implémenter l'intégration** une fois l'API disponible
4. **Rendre la vérification optionnelle** en attendant

**Temps estimé :** 2-3 jours (après obtention de l'API)

---

## 🟡 FONCTIONNALITÉS INCOMPLÈTES (HAUTE PRIORITÉ)

### 6. Paiements Mobile Money (InTouch)

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - HAUTE**

#### Ce qui existe
- ✅ 4 Edge Functions InTouch :
  - `intouch-payment` - Initier un paiement
  - `intouch-transfer` - Transférer vers un propriétaire
  - `intouch-sms` - Envoyer SMS
  - `intouch-webhook-handler` - Recevoir les callbacks
- ✅ Support des 4 opérateurs :
  - Orange Money
  - MTN Money
  - Moov Money
  - Wave
- ✅ Interface utilisateur pour payer

#### Ce qui manque
- ❌ **Credentials InTouch réels** - Variables sont des placeholders
- ❌ **Tests en sandbox** - Aucun test avec l'API InTouch réelle
- ❌ **Gestion des échecs de paiement** - Que faire si le paiement échoue ?
- ❌ **Retry automatique** - Pas de retry si le webhook n'arrive pas
- ❌ **Réconciliation bancaire** - Comment réconcilier les paiements avec les virements ?
- ❌ **Commission 1%** - Le calcul est-il implémenté correctement ?
- ❌ **Split payment** - Comment répartir entre propriétaire (99%) et plateforme (1%) ?

#### Impact
🟡 **HAUTE** - Les paiements sont **essentiels** pour la monétisation. Sans paiements fonctionnels, pas de revenus.

#### Actions requises
1. **Obtenir les credentials InTouch** auprès de GTI
2. **Tester en sandbox** avec les 4 opérateurs
3. **Implémenter la gestion des échecs** (retry, remboursement)
4. **Créer le système de split payment** (99% propriétaire + 1% plateforme)
5. **Implémenter la réconciliation** bancaire automatique
6. **Ajouter le monitoring** des transactions
7. **Créer les rapports financiers** pour les propriétaires

**Temps estimé :** 5-7 jours

---

### 7. Génération PDF de Bail

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - HAUTE**

#### Ce qui existe
- ✅ Edge Function `generate-lease-pdf` créée
- ✅ Utilise jsPDF pour générer le PDF

#### Ce qui manque
- ❌ **Template officiel ANSUT** - Le PDF utilise-t-il le template officiel ?
- ❌ **Mentions légales** - Toutes les mentions obligatoires sont-elles présentes ?
- ❌ **QR Code de vérification** - Pas de QR code pour vérifier l'authenticité
- ❌ **Numéro unique de contrat** - Format du numéro de contrat non défini
- ❌ **Watermark** - Pas de watermark "Mon Toit - Avec cachet électronique"
- ❌ **Annexes** - Comment gérer les annexes (état des lieux, inventaire) ?

#### Impact
🟡 **HAUTE** - Le PDF de bail est le **document légal**. Il doit être conforme aux exigences ANSUT.

#### Actions requises
1. **Obtenir le template officiel** ANSUT
2. **Ajouter toutes les mentions légales** obligatoires
3. **Générer un QR code** avec l'URL de vérification
4. **Définir le format** du numéro de contrat (ex: MT-2025-001234)
5. **Ajouter le watermark** Mon Toit
6. **Implémenter les annexes** (état des lieux, inventaire)

**Temps estimé :** 3-4 jours

---

### 8. Notifications Multi-Canaux

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - MOYENNE**

#### Ce qui existe
- ✅ Edge Function `send-email` créée (Resend)
- ✅ Edge Function `intouch-sms` créée
- ✅ Table `notifications` dans la base de données
- ✅ Table `notification_preferences` pour les préférences utilisateur

#### Ce qui manque
- ❌ **Push notifications** - Pas de service de push (Firebase, OneSignal)
- ❌ **WhatsApp** - Pas d'intégration WhatsApp Business API
- ❌ **Templates de notifications** - Pas de système de templates
- ❌ **Planification** - Pas de notifications planifiées (rappels)
- ❌ **Agrégation** - Pas de digest quotidien/hebdomadaire
- ❌ **Désabonnement** - Pas de lien de désabonnement dans les emails

#### Impact
🟡 **MOYENNE** - Les notifications améliorent l'**engagement utilisateur** mais ne sont pas bloquantes.

#### Actions requises
1. **Intégrer Firebase Cloud Messaging** pour les push notifications
2. **Créer les templates** de notifications (email, SMS, push)
3. **Implémenter la planification** avec cron jobs
4. **Ajouter le digest** quotidien/hebdomadaire
5. **Créer le système de désabonnement** conforme RGPD

**Temps estimé :** 4-5 jours

---

## 🟢 FONCTIONNALITÉS OPTIONNELLES (MOYENNE/BASSE PRIORITÉ)

### 9. Chatbot IA (SUTA)

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - MOYENNE**

#### Ce qui existe
- ✅ Edge Function `ai-chatbot` créée
- ✅ Intégration Azure OpenAI
- ✅ Tables `chatbot_conversations` et `chatbot_messages`
- ✅ Interface utilisateur du chatbot

#### Ce qui manque
- ❌ **Contexte spécifique Mon Toit** - Le chatbot connaît-il les spécificités de la plateforme ?
- ❌ **Intégration avec la base de connaissances** - Pas de RAG (Retrieval Augmented Generation)
- ❌ **Actions automatiques** - Le chatbot peut-il réserver une visite, créer une alerte ?
- ❌ **Support multilingue** - Français uniquement, pas de support Nouchi ou langues locales
- ❌ **Historique de conversation** - L'historique est-il conservé entre sessions ?

#### Impact
🟡 **MOYENNE** - Le chatbot améliore l'**expérience utilisateur** mais n'est pas critique.

#### Actions requises
1. **Créer la base de connaissances** Mon Toit (FAQ, processus, tarifs)
2. **Implémenter le RAG** avec Azure AI Search ou Pinecone
3. **Ajouter les actions** automatiques (réserver visite, créer alerte)
4. **Implémenter le multilingue** (Français, Anglais, Nouchi)
5. **Optimiser l'historique** de conversation

**Temps estimé :** 5-7 jours

---

### 10. Recommandations IA

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - MOYENNE**

#### Ce qui existe
- ✅ Edge Function `ai-recommendations` créée
- ✅ Edge Function `generate-recommendations` créée
- ✅ Table `ai_recommendations` dans la base de données

#### Ce qui manque
- ❌ **Algorithme de recommandation** - Quel algorithme est utilisé ?
- ❌ **Facteurs de scoring** - Quels critères (localisation, prix, taille, historique) ?
- ❌ **Personnalisation** - Les recommandations sont-elles personnalisées par utilisateur ?
- ❌ **A/B testing** - Comment mesurer l'efficacité des recommandations ?
- ❌ **Refresh automatique** - Les recommandations sont-elles mises à jour régulièrement ?

#### Impact
🟡 **MOYENNE** - Les recommandations améliorent la **conversion** mais ne sont pas critiques.

#### Actions requises
1. **Définir l'algorithme** de recommandation (collaborative filtering, content-based)
2. **Implémenter le scoring** avec pondération des facteurs
3. **Personnaliser** selon l'historique utilisateur
4. **Créer le système d'A/B testing**
5. **Automatiser le refresh** quotidien

**Temps estimé :** 4-6 jours

---

### 11. Analytics et Reporting

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - MOYENNE**

#### Ce qui existe
- ✅ Edge Function `generate-monthly-report` créée
- ✅ Edge Function `generate-report` créée
- ✅ Tables `platform_analytics` et `monthly_reports`
- ✅ Pages admin pour voir les statistiques

#### Ce qui manque
- ❌ **Dashboards temps réel** - Pas de dashboard en temps réel
- ❌ **Métriques business** - Pas de calcul du CAC, LTV, churn
- ❌ **Export des données** - Pas d'export CSV/Excel
- ❌ **Rapports personnalisés** - Pas de création de rapports custom
- ❌ **Alertes automatiques** - Pas d'alertes sur les anomalies

#### Impact
🟡 **MOYENNE** - Les analytics aident à la **prise de décision** mais ne sont pas bloquants.

#### Actions requises
1. **Créer les dashboards temps réel** avec Chart.js ou D3.js
2. **Calculer les métriques business** (CAC, LTV, churn, MRR)
3. **Implémenter l'export** CSV/Excel
4. **Créer le builder** de rapports personnalisés
5. **Ajouter les alertes** automatiques

**Temps estimé :** 5-7 jours

---

### 12. Carte Interactive Avancée

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - BASSE**

#### Ce qui existe
- ✅ Intégration Mapbox
- ✅ Affichage des propriétés sur la carte
- ✅ Edge Function `geocode-address` créée
- ✅ Edge Function `azure-maps-geocode` créée

#### Ce qui manque
- ❌ **Clustering** - Pas de clustering des marqueurs quand zoom out
- ❌ **Heatmap** - Pas de heatmap des prix
- ❌ **Filtres sur la carte** - Pas de filtres directement sur la carte
- ❌ **Itinéraires** - Pas de calcul d'itinéraire vers une propriété
- ❌ **Points d'intérêt** - Pas d'affichage des écoles, hôpitaux, transports

#### Impact
🟢 **BASSE** - La carte améliore l'**expérience** mais n'est pas critique.

#### Actions requises
1. **Implémenter le clustering** avec Mapbox GL JS
2. **Créer la heatmap** des prix
3. **Ajouter les filtres** sur la carte
4. **Intégrer les itinéraires** avec Mapbox Directions API
5. **Afficher les POI** (écoles, hôpitaux, transports)

**Temps estimé :** 3-5 jours

---

### 13. Système d'Avis et Réputation

**Statut :** ✅ **IMPLÉMENTÉ - BASSE**

#### Ce qui existe
- ✅ Tables `landlord_reviews`, `tenant_reviews`, `property_reviews`
- ✅ Edge Function `moderate-review` créée
- ✅ Interface utilisateur pour laisser des avis

#### Ce qui manque
- ❌ **Vérification des avis** - Seuls les locataires ayant loué peuvent-ils laisser un avis ?
- ❌ **Réponse aux avis** - Les propriétaires peuvent-ils répondre aux avis ?
- ❌ **Signalement d'avis** - Pas de système de signalement d'avis inappropriés
- ❌ **Badge de réputation** - Pas de badge "Super Propriétaire" ou "Locataire Fiable"

#### Impact
🟢 **BASSE** - Le système d'avis existe déjà, les améliorations sont mineures.

#### Actions requises
1. **Vérifier que seuls les locataires** ayant loué peuvent laisser un avis
2. **Permettre les réponses** aux avis
3. **Créer le système de signalement**
4. **Implémenter les badges** de réputation

**Temps estimé :** 2-3 jours

---

### 14. Maintenance et Support (MonArtisan)

**Statut :** 🟡 **PARTIELLEMENT IMPLÉMENTÉ - BASSE**

#### Ce qui existe
- ✅ Tables `monartisan_contractors`, `monartisan_job_requests`, `monartisan_quotes`
- ✅ Edge Functions `monartisan-request` et `monartisan-webhook`
- ✅ Pages pour demander un artisan

#### Ce qui manque
- ❌ **Marketplace d'artisans** - Pas de page pour explorer les artisans
- ❌ **Notation des artisans** - Pas de système de notation
- ❌ **Paiement des artisans** - Comment payer un artisan ?
- ❌ **Garantie des travaux** - Pas de système de garantie
- ❌ **Photos avant/après** - Pas de système de photos

#### Impact
🟢 **BASSE** - MonArtisan est une **fonctionnalité bonus** qui peut être développée plus tard.

#### Actions requises
1. **Créer la marketplace** d'artisans
2. **Implémenter la notation** des artisans
3. **Intégrer le paiement** via InTouch
4. **Créer le système de garantie**
5. **Ajouter les photos** avant/après

**Temps estimé :** 5-7 jours

---

## 📋 INTÉGRATIONS EXTERNES À CONFIGURER

### Services avec Credentials Manquants

| Service | Statut | Variables Manquantes | Impact | Priorité |
|---------|--------|---------------------|--------|----------|
| **ONECI** | 🔴 Non configuré | `ONECI_API_KEY`, `ONECI_BASE_URL` | Bloquant | ⭐⭐⭐ |
| **CryptoNeo** | 🔴 Non configuré | `CRYPTONEO_APP_KEY`, `CRYPTONEO_APP_SECRET` | Bloquant | ⭐⭐⭐ |
| **InTouch** | 🔴 Non configuré | `INTOUCH_PARTNER_ID`, `INTOUCH_LOGIN_API`, `INTOUCH_PASSWORD_API` | Haute | ⭐⭐⭐ |
| **Smile ID** | 🟡 Partiellement | `SMILE_ID_PARTNER_ID`, `SMILE_ID_API_KEY` | Haute | ⭐⭐ |
| **CNAM** | 🔴 Non configuré | `CNAM_API_KEY`, `CNAM_BASE_URL` | Moyenne | ⭐ |
| **Azure OpenAI** | 🟡 Partiellement | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` | Moyenne | ⭐ |
| **Mapbox** | 🟡 Partiellement | `VITE_MAPBOX_TOKEN` | Basse | ⭐ |
| **Resend** | 🟡 Partiellement | `RESEND_API_KEY` | Moyenne | ⭐⭐ |

### Actions Requises

1. **Contacter les fournisseurs** pour obtenir les credentials
2. **Configurer les webhooks** dans les portails des fournisseurs
3. **Tester en sandbox** avant la production
4. **Documenter les intégrations** (endpoints, formats, codes d'erreur)
5. **Créer les fallbacks** en cas d'indisponibilité

---

## 🧪 TESTS MANQUANTS

### Tests Unitaires

**Statut :** 🔴 **0% de couverture**

- ❌ Aucun test unitaire pour les Edge Functions
- ❌ Aucun test unitaire pour les composants React
- ❌ Aucun test unitaire pour les repositories

**Actions requises :**
- Implémenter les tests selon la stratégie définie dans `STRATEGIE_TESTS_PHASE5.md`
- Objectif : **≥70% de couverture** du code critique

**Temps estimé :** 2-3 jours (selon stratégie Phase 5)

### Tests d'Intégration

**Statut :** 🔴 **0% de couverture**

- ❌ Aucun test d'intégration pour les workflows complets
- ❌ Aucun test des intégrations externes (ONECI, CryptoNeo, InTouch)

**Actions requises :**
- Créer les tests d'intégration pour les workflows critiques
- Tester les intégrations en sandbox

**Temps estimé :** 2-3 jours (selon stratégie Phase 5)

### Tests E2E

**Statut :** 🔴 **0% de couverture**

- ❌ Aucun test E2E avec Playwright ou Cypress

**Actions requises :**
- Créer 3 tests E2E critiques :
  1. Inscription → Vérification → Location → Paiement
  2. Publication propriété → Réception candidature → Signature bail
  3. Litige → Médiation → Résolution

**Temps estimé :** 1 jour (selon stratégie Phase 5)

---

## 📊 PRIORISATION DES DÉVELOPPEMENTS

### Phase 1 : Fonctionnalités Critiques (2-3 semaines)

**Objectif :** Rendre la plateforme **certifiable ANSUT** et **opérationnelle** pour les paiements.

| Fonctionnalité | Priorité | Temps | Dépendances |
|----------------|----------|-------|-------------|
| 1. Vérification ONECI (NNI) | ⭐⭐⭐ | 3-5 jours | Credentials ONECI |
| 2. Signature CEV (workflow complet) | ⭐⭐⭐ | 5-7 jours | CryptoNeo credentials |
| 3. Webhook ONECI CEV | ⭐⭐⭐ | 2-3 jours | Configuration ONECI |
| 4. Paiements InTouch | ⭐⭐⭐ | 5-7 jours | InTouch credentials |
| 5. Génération PDF conforme | ⭐⭐⭐ | 3-4 jours | Template ANSUT |
| **TOTAL PHASE 1** | | **18-26 jours** | |

### Phase 2 : Fonctionnalités Importantes (1-2 semaines)

**Objectif :** Améliorer la **sécurité** et l'**expérience utilisateur**.

| Fonctionnalité | Priorité | Temps | Dépendances |
|----------------|----------|-------|-------------|
| 6. Vérification biométrique | ⭐⭐ | 4-6 jours | Smile ID credentials |
| 7. Notifications multi-canaux | ⭐⭐ | 4-5 jours | Firebase, WhatsApp API |
| 8. Tests (Phase 5) | ⭐⭐ | 2-3 jours | - |
| **TOTAL PHASE 2** | | **10-14 jours** | |

### Phase 3 : Fonctionnalités Optionnelles (2-3 semaines)

**Objectif :** Améliorer l'**engagement** et la **conversion**.

| Fonctionnalité | Priorité | Temps | Dépendances |
|----------------|----------|-------|-------------|
| 9. Chatbot IA (SUTA) | ⭐ | 5-7 jours | Azure OpenAI |
| 10. Recommandations IA | ⭐ | 4-6 jours | - |
| 11. Analytics & Reporting | ⭐ | 5-7 jours | - |
| 12. Carte interactive avancée | ⭐ | 3-5 jours | Mapbox |
| **TOTAL PHASE 3** | | **17-25 jours** | |

### Phase 4 : Fonctionnalités Bonus (1-2 semaines)

**Objectif :** Ajouter de la **valeur** et se **différencier**.

| Fonctionnalité | Priorité | Temps | Dépendances |
|----------------|----------|-------|-------------|
| 13. Améliorations avis | ⭐ | 2-3 jours | - |
| 14. MonArtisan complet | ⭐ | 5-7 jours | - |
| 15. Vérification CNAM | ⭐ | 2-3 jours | CNAM API |
| **TOTAL PHASE 4** | | **9-13 jours** | |

---

## 📅 CALENDRIER GLOBAL

### Timeline Complète

| Phase | Durée | Dates (estimation) | Livrables |
|-------|-------|-------------------|-----------|
| **Phase 1 : Critique** | 18-26 jours | Semaines 1-4 | Cachet électronique visible possible |
| **Phase 2 : Important** | 10-14 jours | Semaines 5-6 | Sécurité & UX améliorées |
| **Phase 3 : Optionnel** | 17-25 jours | Semaines 7-10 | Engagement & conversion |
| **Phase 4 : Bonus** | 9-13 jours | Semaines 11-12 | Différenciation |
| **TOTAL** | **54-78 jours** | **12-16 semaines** | **Plateforme complète** |

### Milestone 1 : MVP Certifiable (4 semaines)

**Objectif :** Plateforme **minimale viable** certifiable ANSUT.

✅ Vérification ONECI fonctionnelle  
✅ Signature CEV complète  
✅ Paiements InTouch opérationnels  
✅ PDF de bail conforme  
✅ Webhook ONECI configuré

**Résultat :** La plateforme peut être **certifiée ANSUT** et **lancée en beta**.

### Milestone 2 : Production Ready (6 semaines)

**Objectif :** Plateforme **prête pour la production** avec sécurité renforcée.

✅ Vérification biométrique active  
✅ Notifications multi-canaux  
✅ Tests automatisés (≥70% couverture)  
✅ Monitoring et alertes

**Résultat :** La plateforme peut être **lancée publiquement**.

### Milestone 3 : Plateforme Complète (12 semaines)

**Objectif :** Plateforme **complète** avec toutes les fonctionnalités.

✅ Chatbot IA opérationnel  
✅ Recommandations personnalisées  
✅ Analytics avancés  
✅ MonArtisan complet

**Résultat :** La plateforme est **leader du marché** en Côte d'Ivoire.

---

## 💡 RECOMMANDATIONS STRATÉGIQUES

### 1. Focus sur la Cachet électronique visible

**Recommandation :** Prioriser **absolument** les fonctionnalités critiques (Phase 1) avant tout le reste.

**Justification :** La cachet électronique visible est le **différenciateur majeur** de Mon Toit. Sans elle, la plateforme perd sa valeur ajoutée principale.

**Actions :**
- Obtenir les credentials ONECI et CryptoNeo **immédiatement**
- Allouer les meilleurs développeurs sur ces fonctionnalités
- Tester en sandbox avant la production

### 2. Lancer en Beta Rapidement

**Recommandation :** Lancer une **version beta** après la Phase 1 (4 semaines) avec un nombre limité d'utilisateurs.

**Justification :** Le feedback utilisateur réel est **invaluable** pour identifier les problèmes et prioriser les développements.

**Actions :**
- Recruter 50-100 beta testeurs (propriétaires + locataires)
- Collecter le feedback systématiquement
- Itérer rapidement selon les retours

### 3. Partenariats Stratégiques

**Recommandation :** Établir des **partenariats** avec les fournisseurs de services (ONECI, CryptoNeo, InTouch).

**Justification :** Des partenariats solides garantissent un **support prioritaire** et des **tarifs préférentiels**.

**Actions :**
- Négocier des accords de partenariat
- Obtenir un support technique dédié
- Négocier des tarifs dégressifs selon le volume

### 4. Investir dans les Tests

**Recommandation :** Implémenter les tests **dès maintenant** (Phase 5) en parallèle des développements.

**Justification :** Les tests évitent les **régressions** et accélèrent les développements futurs.

**Actions :**
- Suivre la stratégie définie dans `STRATEGIE_TESTS_PHASE5.md`
- Viser ≥70% de couverture du code critique
- Automatiser les tests dans la CI/CD

### 5. Documentation Continue

**Recommandation :** Documenter **chaque intégration** au fur et à mesure.

**Justification :** La documentation facilite la **maintenance** et l'**onboarding** des nouveaux développeurs.

**Actions :**
- Créer un guide d'intégration pour chaque service
- Documenter les codes d'erreur et les solutions
- Maintenir un changelog à jour

---

## 📦 LIVRABLES

### Documents Créés

1. **Ce rapport** : `FONCTIONNALITES_MANQUANTES.md`
2. **Stratégie de tests** : `STRATEGIE_TESTS_PHASE5.md` (déjà créé)
3. **Documentation RLS** : `DOCUMENTATION_RLS.md` (déjà créé)
4. **Analyse d'optimisation** : `ANALYSE_OPTIMISATION_CODE.md` (déjà créé)

### Prochains Documents à Créer

1. **Guide d'intégration ONECI** (après obtention des credentials)
2. **Guide d'intégration CryptoNeo** (après obtention des credentials)
3. **Guide d'intégration InTouch** (après obtention des credentials)
4. **Guide de déploiement en production**
5. **Guide de monitoring et alertes**

---

## 💡 CONCLUSION

La plateforme Mon Toit dispose d'une **base solide** avec 69 pages React, 69 Edge Functions, et une architecture moderne. Cependant, **5 fonctionnalités critiques** doivent être complétées pour rendre la plateforme **certifiable ANSUT** et **opérationnelle** :

1. ✅ **Vérification ONECI (NNI)** - 3-5 jours
2. ✅ **Signature CEV complète** - 5-7 jours
3. ✅ **Webhook ONECI CEV** - 2-3 jours
4. ✅ **Paiements InTouch** - 5-7 jours
5. ✅ **Génération PDF conforme** - 3-4 jours

**Temps total pour le MVP certifiable : 18-26 jours (4 semaines)**

Avec un développement focalisé sur ces fonctionnalités critiques, la plateforme peut être **lancée en beta** dans **1 mois** et **déployée en production** dans **2-3 mois**.

---

**Rapport créé par Manus AI**  
**Date : 21 novembre 2025**  
**Version : 1.0**

