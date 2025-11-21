# Documentation Fonctionnelle Complète - Mon Toit

**Date :** 21 novembre 2025  
**Version :** 2.0  
**Auteur :** Manus AI  
**Statut :** Documentation opérationnelle complète

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Fonctionnelle](#architecture-fonctionnelle)
3. [Fonctionnalités par Module](#fonctionnalités-par-module)
4. [Workflows Détaillés](#workflows-détaillés)
5. [Intégrations Externes](#intégrations-externes)
6. [Règles Métier](#règles-métier)

---

## 🎯 Vue d'Ensemble

### Qu'est-ce que Mon Toit ?

Mon Toit est une **plateforme immobilière certifiée ANSUT** qui révolutionne le marché locatif ivoirien en offrant un écosystème complet, sécurisé et transparent pour la mise en relation entre propriétaires et locataires. La plateforme intègre des technologies avancées de vérification d'identité, de signature électronique, et de gestion des paiements pour garantir la sécurité et la conformité légale de toutes les transactions.

### Mission

Faciliter l'accès au logement en Côte d'Ivoire en digitalisant et sécurisant l'ensemble du processus locatif, de la recherche de propriété à la signature du bail et à la gestion quotidienne de la location.

### Valeurs Fondamentales

La plateforme repose sur quatre piliers essentiels. La **transparence** garantit que toutes les informations sur les propriétés, les propriétaires et les locataires sont vérifiées et accessibles. La **sécurité** assure que chaque transaction est protégée par des technologies de pointe (vérification NNI, biométrie faciale, signature électronique (CryptoNeo)). La **conformité** respecte scrupuleusement la réglementation ivoirienne et les exigences de l'ANSUT. Enfin, l'**accessibilité** rend le logement accessible à tous grâce à une interface intuitive et multilingue.

---

## 🏗️ Architecture Fonctionnelle

### Les 4 Rôles Principaux

La plateforme Mon Toit s'articule autour de quatre rôles utilisateurs distincts, chacun avec des fonctionnalités et des responsabilités spécifiques.

#### 1. Locataire (Tenant)

Le locataire est un utilisateur à la recherche d'un logement à louer. Il dispose de fonctionnalités lui permettant de rechercher des propriétés selon des critères variés (localisation, prix, type de bien), de postuler pour des biens qui l'intéressent, de passer par un processus de vérification d'identité complet (NNI via ONECI, vérification faciale via NeoFace, scoring locataire), de signer électroniquement son bail avec certificat CEV, d'effectuer des paiements sécurisés (loyer, caution, frais), de gérer ses contrats de location, de soumettre des demandes de maintenance, et de communiquer avec son propriétaire et le tiers de confiance.

**Pages dédiées :** 15 pages incluant TenantDashboard, SearchProperties, ApplicationForm, SignLease, MakePayment, MyContracts, TenantMaintenance, TenantScore, TenantCalendar, MyVisits, Favorites, SavedSearches, Recommendations.

#### 2. Propriétaire (Landlord)

Le propriétaire est un utilisateur possédant un ou plusieurs biens immobiliers qu'il souhaite mettre en location. Il peut publier des annonces de propriétés avec photos, descriptions et prix, gérer les candidatures des locataires potentiels, vérifier les profils et scores des candidats, créer et signer des contrats de bail, recevoir les paiements de loyer automatiquement, gérer les demandes de maintenance de ses locataires, suivre la performance financière de ses biens, et communiquer avec ses locataires et le tiers de confiance.

**Pages dédiées :** 10 pages incluant OwnerDashboard, AddProperty, PropertyStats, ApplicationDetail, CreateContract, ContractsList, OwnerMaintenance, PaymentHistory, AgencyDashboard (pour agences), AgencyProperties.

#### 3. Tiers de Confiance (Trust Agent)

Le tiers de confiance est un acteur neutre certifié par l'ANSUT qui joue un rôle de médiateur et de validateur. Il valide les documents et identités des utilisateurs, médiatise les litiges entre propriétaires et locataires, modère le contenu de la plateforme (annonces, commentaires), génère des rapports d'activité pour l'ANSUT, surveille les transactions suspectes, et assure la conformité réglementaire des opérations.

**Pages dédiées :** 5 pages incluant TrustAgentDashboard, TrustAgentMediation, TrustAgentModeration, TrustAgentAnalytics, RequestTrustValidation.

#### 4. Administrateur (Admin)

L'administrateur gère la plateforme dans son ensemble. Il configure les services externes et les clés API, gère les feature flags pour activer/désactiver des fonctionnalités, surveille la santé des services (monitoring), gère les utilisateurs et leurs rôles, configure les tiers de confiance, génère des données de test, gère les certificats CEV, et accède aux analytics globales de la plateforme.

**Pages dédiées :** 12 pages incluant AdminDashboard, AdminFeatureFlags, AdminApiKeys, AdminServiceConfiguration, AdminServiceMonitoring, AdminServiceProviders, AdminUsers, AdminUserRoles, AdminTrustAgents, AdminCEVManagement, AdminTestDataGenerator, AdminQuickDemo.

### Modules Fonctionnels

La plateforme est organisée en 10 modules fonctionnels principaux qui couvrent l'ensemble du cycle de vie locatif.

| Module | Description | Pages | Priorité |
|--------|-------------|-------|----------|
| **Authentification & Profil** | Inscription, connexion, gestion du profil | 6 pages | Critique |
| **Recherche & Découverte** | Recherche de propriétés, filtres, recommandations | 5 pages | Haute |
| **Candidature & Vérification** | Soumission de candidatures, vérification d'identité | 4 pages | Critique |
| **Contrats & Signature** | Création, signature électronique (CryptoNeo), gestion des baux | 6 pages | Critique |
| **Paiements** | Loyers, cautions, frais, historique | 3 pages | Critique |
| **Maintenance** | Demandes de réparation, suivi | 2 pages | Moyenne |
| **Communication** | Messagerie, notifications | 2 pages | Moyenne |
| **Litiges & Médiation** | Création et résolution de litiges | 3 pages | Haute |
| **Administration** | Gestion plateforme, monitoring | 12 pages | Haute |
| **Analytics & Reporting** | Statistiques, rapports, insights | 4 pages | Moyenne |

---

## 🔧 Fonctionnalités par Module

### Module 1 : Authentification & Profil

Ce module gère l'identité des utilisateurs et leur accès à la plateforme.

#### 1.1 Inscription

L'inscription sur Mon Toit se fait en plusieurs étapes pour garantir la sécurité et la conformité. L'utilisateur commence par créer un compte avec email et mot de passe sécurisé (minimum 8 caractères, majuscules, minuscules, chiffres, caractères spéciaux). Il reçoit ensuite un email de vérification avec lien d'activation (via Resend). Après activation, il sélectionne son profil (locataire, propriétaire, agence) et complète les informations obligatoires selon son profil. Pour les locataires, cela inclut NNI, téléphone, profession, revenus mensuels. Pour les propriétaires, NNI, téléphone, nombre de biens à louer, type de propriétaire (particulier/agence). Enfin, il accepte les conditions d'utilisation et la politique de confidentialité.

**Pages concernées :** Auth.tsx, ProfileSelection.tsx, Profile.tsx

**Services utilisés :** Supabase Auth, Resend (emails), ONECI (vérification NNI optionnelle à l'inscription)

**Règles métier :**
- Un email ne peut être utilisé que pour un seul compte
- Le NNI doit être valide (13 chiffres pour la Côte d'Ivoire)
- Les utilisateurs de moins de 18 ans ne peuvent pas s'inscrire comme locataires ou propriétaires

#### 1.2 Connexion

La connexion peut se faire de trois manières différentes. La méthode standard utilise email et mot de passe avec possibilité de "Se souvenir de moi". La connexion sociale permet de se connecter via Google ou Facebook (OAuth). Enfin, l'authentification à deux facteurs (2FA) est disponible via SMS (Brevo/InTouch) ou email (Resend) pour les comptes sensibles.

**Pages concernées :** Auth.tsx, VerifyOTP.tsx

**Services utilisés :** Supabase Auth, Brevo (SMS OTP), Resend (Email OTP)

#### 1.3 Récupération de Mot de Passe

En cas d'oubli du mot de passe, l'utilisateur peut le réinitialiser en saisissant son email. Il reçoit un lien de réinitialisation par email (valide 1 heure), clique sur le lien, définit un nouveau mot de passe sécurisé, et reçoit une confirmation par email.

**Pages concernées :** ForgotPassword.tsx, ResetPassword.tsx

**Services utilisés :** Supabase Auth, Resend

#### 1.4 Gestion du Profil

Chaque utilisateur peut gérer son profil de manière complète. Il peut modifier ses informations personnelles (nom, prénom, téléphone, adresse), changer sa photo de profil, mettre à jour ses préférences de notification (email, SMS, push), gérer ses paramètres de confidentialité, consulter son historique d'activité, et supprimer son compte (avec confirmation et période de grâce de 30 jours).

**Pages concernées :** Profile.tsx, NotificationPreferences.tsx, VerificationSettings.tsx

**Services utilisés :** Supabase Storage (photos), Supabase Database

#### 1.5 Vérification d'Identité

La vérification d'identité est un processus en plusieurs étapes obligatoire pour effectuer des transactions. L'utilisateur soumet son Numéro National d'Identification (NNI) qui est vérifié auprès de l'ONECI. Il télécharge ensuite une photo de sa CNI ou passeport, puis effectue une vérification faciale biométrique en capturant un selfie avec détection de vivacité. NeoFace compare le selfie avec la photo du document d'identité et retourne un score de correspondance. Si la vérification est réussie (score > 80%), l'utilisateur obtient un badge "Identité Vérifiée". En cas d'échec, il peut réessayer jusqu'à 3 fois, après quoi une validation manuelle par un tiers de confiance est requise.

**Pages concernées :** AnsutVerification.tsx, VerificationRequest.tsx

**Services utilisés :** ONECI (vérification NNI), NeoFace v2 (vérification faciale), Smile ID (alternative)

**Workflow détaillé :** Voir section "Workflows Détaillés - Vérification d'Identité"

---

### Module 2 : Recherche & Découverte

Ce module permet aux locataires de trouver leur logement idéal.

#### 2.1 Recherche de Propriétés

La recherche de propriétés offre de multiples critères de filtrage. Les utilisateurs peuvent filtrer par localisation (ville, quartier, proximité d'un point d'intérêt), prix (min-max, loyer mensuel), type de bien (appartement, maison, studio, villa, bureau), nombre de pièces (chambres, salles de bain), superficie (m²), équipements (climatisation, parking, piscine, sécurité, internet), et disponibilité (immédiate, à partir de date X).

La recherche utilise Mapbox pour l'affichage cartographique avec clustering des propriétés, heatmap des prix par zone, et calcul d'itinéraires vers points d'intérêt.

**Pages concernées :** SearchProperties.tsx, Home.tsx

**Services utilisés :** Mapbox (cartes), Supabase Database (recherche full-text), Gemini/DeepSeek (recherche sémantique optionnelle)

**Fonctionnalités avancées :**
- Recherche par carte interactive (dessiner une zone)
- Recherche vocale (Azure Speech STT)
- Recherche par photo (Azure AI Vision - "Trouve-moi un bien similaire")
- Suggestions intelligentes basées sur l'historique

#### 2.2 Recommandations Personnalisées

Le système de recommandations analyse le comportement de l'utilisateur pour proposer des biens pertinents. Il prend en compte l'historique de recherche, les propriétés consultées, les favoris, les candidatures précédentes, le budget déclaré, les préférences de localisation, et le profil socio-professionnel.

**Pages concernées :** Recommendations.tsx, TenantDashboard.tsx

**Services utilisés :** Supabase Database (historique), Azure OpenAI (algorithme de recommandation)

**Algorithme :**
1. Extraction des préférences utilisateur
2. Scoring des propriétés disponibles
3. Filtrage par compatibilité (budget, localisation)
4. Classement par pertinence
5. Affichage des top 10 recommandations

#### 2.3 Favoris et Recherches Sauvegardées

Les utilisateurs peuvent sauvegarder leurs propriétés favorites pour consultation ultérieure et créer des recherches sauvegardées avec alerte email lors de nouvelles annonces correspondantes.

**Pages concernées :** Favorites.tsx, SavedSearches.tsx

**Services utilisés :** Supabase Database, Resend (alertes email)

#### 2.4 Détails de Propriété

La page de détail d'une propriété affiche toutes les informations nécessaires pour prendre une décision éclairée. Elle inclut une galerie photos haute résolution (jusqu'à 20 photos), une description complète du bien, les caractéristiques techniques (superficie, nombre de pièces, année de construction), les équipements et services inclus, le prix et les conditions (loyer, caution, charges), la localisation sur carte interactive, les transports et commodités à proximité, les avis et notes des anciens locataires (si disponibles), et les informations sur le propriétaire (nom, note, nombre de biens).

**Pages concernées :** PropertyDetail.tsx

**Services utilisés :** Mapbox (carte), Supabase Storage (photos), Supabase Database

**Actions possibles :**
- Ajouter aux favoris
- Partager (email, WhatsApp, réseaux sociaux)
- Planifier une visite
- Postuler directement
- Contacter le propriétaire
- Signaler une annonce

#### 2.5 Visites de Propriétés

Les locataires peuvent planifier des visites de propriétés en ligne. Ils sélectionnent une date et heure parmi les créneaux disponibles, reçoivent une confirmation par email et SMS avec QR code de visite, et peuvent annuler ou reprogrammer jusqu'à 24h avant. Après la visite, ils peuvent laisser un avis et noter la propriété.

**Pages concernées :** ScheduleVisit.tsx, MyVisits.tsx, TenantCalendar.tsx

**Services utilisés :** Supabase Database, Resend (confirmation email), Brevo (SMS), Azure OpenAI (génération QR code)

**Workflow :** Voir section "Workflows Détaillés - Planification de Visite"

---

### Module 3 : Candidature & Vérification

Ce module gère le processus de candidature des locataires et leur vérification.

#### 3.1 Soumission de Candidature

Pour postuler à une propriété, le locataire remplit un formulaire de candidature comprenant ses informations personnelles (nom, prénom, âge, profession), ses revenus mensuels et justificatifs (fiches de paie, contrat de travail), ses références (anciens propriétaires, employeur), sa situation familiale (nombre de personnes, animaux), et sa date de début de location souhaitée.

Il joint également des documents obligatoires : copie CNI ou passeport, justificatifs de revenus (3 derniers mois), attestation d'emploi, et références de précédents propriétaires (optionnel).

**Pages concernées :** ApplicationForm.tsx, PropertyDetail.tsx

**Services utilisés :** Supabase Storage (documents), Supabase Database, Azure AI Vision (OCR des documents)

**Validation automatique :**
- Vérification que les revenus sont ≥ 3x le loyer
- Vérification de l'identité (NNI via ONECI)
- Détection de documents falsifiés (Azure AI)
- Calcul du score locataire

#### 3.2 Score Locataire

Le score locataire est une note sur 100 qui évalue la fiabilité d'un candidat. Il est calculé automatiquement en fonction de plusieurs critères : stabilité professionnelle (30 points - ancienneté, type de contrat), capacité financière (25 points - revenus vs loyer), historique locatif (20 points - références, impayés), vérification d'identité (15 points - NNI, biométrie), complétude du dossier (10 points - documents fournis).

**Pages concernées :** TenantScore.tsx, ApplicationDetail.tsx

**Services utilisés :** Supabase Database, Azure OpenAI (analyse prédictive)

**Interprétation du score :**
- 80-100 : Excellent candidat (risque très faible)
- 60-79 : Bon candidat (risque faible)
- 40-59 : Candidat moyen (risque modéré)
- 20-39 : Candidat à risque (nécessite garanties supplémentaires)
- 0-19 : Candidat à haut risque (refus recommandé)

#### 3.3 Vérification Biométrique

La vérification biométrique faciale est obligatoire avant signature de bail. Le processus se déroule en trois étapes. D'abord, l'utilisateur télécharge une photo de sa CNI ou passeport (recto-verso). Ensuite, il capture un selfie en temps réel avec détection de vivacité (clignement des yeux, rotation de la tête). Enfin, NeoFace v2 compare les deux images et retourne un score de correspondance (0-100%).

**Pages concernées :** AnsutVerification.tsx

**Services utilisés :** NeoFace v2 (API moderne), Smileless (fallback), Smile ID (alternative)

**Critères de validation :**
- Score de correspondance ≥ 80%
- Détection de vivacité réussie (pas de photo d'une photo)
- Qualité d'image suffisante (résolution, éclairage)
- Visage entièrement visible (pas de masque, lunettes de soleil)

**En cas d'échec :**
- 1ère tentative : Réessayer immédiatement
- 2ème tentative : Attendre 5 minutes
- 3ème tentative : Attendre 30 minutes
- Après 3 échecs : Validation manuelle par tiers de confiance

#### 3.4 Vérification NNI (ONECI)

La vérification du Numéro National d'Identification auprès de l'ONECI est obligatoire pour tous les utilisateurs ivoiriens. Le système envoie le NNI à l'API ONECI qui retourne les informations officielles (nom, prénom, date de naissance, lieu de naissance, sexe). Ces informations sont comparées avec celles fournies par l'utilisateur. En cas de correspondance, l'utilisateur obtient le badge "NNI Vérifié". En cas de non-correspondance, une validation manuelle est requise.

**Services utilisés :** ONECI (API officielle), Supabase Database

**Statuts possibles :**
- ✅ Vérifié : NNI valide et correspondance exacte
- ⏳ En attente : Vérification en cours (webhook ONECI)
- ⚠️ Incohérence : Données ne correspondent pas (validation manuelle)
- ❌ Invalide : NNI inexistant ou format incorrect

---

### Module 4 : Contrats & Signature

Ce module gère l'ensemble du cycle de vie des contrats de bail.

#### 4.1 Création de Contrat

Une fois qu'un propriétaire accepte une candidature, il peut créer un contrat de bail. Le système génère automatiquement un contrat pré-rempli avec les informations du propriétaire (nom, NNI, adresse), les informations du locataire (nom, NNI, adresse), les détails de la propriété (adresse, description, superficie), les conditions financières (loyer mensuel, caution, charges, frais d'agence), la durée du bail (date de début, durée, conditions de renouvellement), et les clauses spécifiques (animaux, sous-location, travaux).

Le propriétaire peut personnaliser le contrat en ajoutant des clauses supplémentaires ou en modifiant les clauses standards (dans les limites légales).

**Pages concernées :** CreateContract.tsx, ContractsList.tsx

**Services utilisés :** Supabase Database, Azure OpenAI (génération de contrat), CryptoNeo (préparation signature)

**Template de contrat :**
Le système utilise un template de bail conforme au Code Civil ivoirien et aux exigences de l'ANSUT. Le template inclut toutes les clauses obligatoires et permet l'ajout de clauses optionnelles.

#### 4.2 Signature Électronique CEV

La signature électronique avec Certificat Électronique de Vérification (CEV) est le cœur de la conformité ANSUT. Le processus de signature se déroule en 6 étapes.

**Étape 1 : Préparation du document**
Le contrat de bail est converti en PDF sécurisé avec watermark et métadonnées. Un hash SHA-256 du document est calculé pour garantir son intégrité.

**Étape 2 : Envoi pour signature**
Le document est envoyé à CryptoNeo avec les informations des signataires (propriétaire et locataire). Chaque signataire reçoit une notification par email et SMS.

**Étape 3 : Vérification d'identité**
Avant de signer, chaque signataire doit :
- Se connecter à son compte Mon Toit
- Confirmer son identité par vérification faciale (NeoFace)
- Recevoir un code OTP par SMS (valide 5 minutes)

**Étape 4 : Signature avec OTP**
Le signataire saisit le code OTP reçu par SMS. CryptoNeo génère une signature électronique avec horodatage. Un Certificat Électronique de Vérification (CEV) est créé.

**Étape 5 : Validation ANSUT**
Une fois toutes les signatures collectées, le document signé est envoyé à l'ANSUT pour validation. L'ANSUT vérifie la conformité du contrat et des signatures. Un numéro de cachet électronique visible est attribué au contrat.

**Étape 6 : Archivage sécurisé**
Le contrat signé et certifié est archivé sur Supabase Storage avec chiffrement. Chaque partie reçoit une copie PDF par email. Le contrat est accessible à tout moment depuis l'interface Mon Toit.

**Pages concernées :** SignLease.tsx, ContractDetail.tsx, ContractDetailEnhanced.tsx

**Services utilisés :** CryptoNeo (signature électronique (CryptoNeo)), Brevo (SMS OTP), NeoFace (vérification faciale), Supabase Storage (archivage), Resend (envoi PDF)

**Workflow complet :** Voir section "Workflows Détaillés - Signature de Bail"

#### 4.3 Gestion des Contrats

Les utilisateurs peuvent consulter tous leurs contrats actifs et archivés. Pour chaque contrat, ils peuvent télécharger le PDF signé, consulter l'historique des modifications, voir les paiements associés, renouveler le contrat (3 mois avant échéance), résilier le contrat (avec préavis légal), et signaler un litige.

**Pages concernées :** MyContracts.tsx, ContractsList.tsx, ContractDetail.tsx

**Services utilisés :** Supabase Database, Supabase Storage

**Statuts de contrat :**
- 🟡 Brouillon : Contrat créé mais pas encore envoyé pour signature
- 🔵 En attente de signature : Envoyé aux signataires
- 🟢 Actif : Signé et en cours d'exécution
- 🟠 Expire bientôt : Moins de 3 mois avant échéance
- 🔴 Expiré : Date de fin dépassée
- ⚫ Résilié : Contrat terminé avant échéance
- ⚠️ Litige : Contrat contesté

#### 4.4 Renouvellement de Bail

Trois mois avant l'échéance d'un bail, le système envoie automatiquement une notification au propriétaire et au locataire pour proposer un renouvellement. Le propriétaire peut proposer un nouveau loyer (dans les limites légales d'augmentation). Le locataire peut accepter, refuser, ou négocier. Si accepté, un nouveau contrat est généré et signé selon le même processus CEV.

**Services utilisés :** Supabase Database, Resend (notifications), CryptoNeo (nouvelle signature)

**Règles légales :**
- Augmentation maximale du loyer : 5% par an (à vérifier selon législation ivoirienne)
- Préavis de renouvellement : 3 mois minimum
- Durée minimale du bail : 1 an

#### 4.5 Résiliation de Bail

La résiliation d'un bail peut être initiée par le propriétaire ou le locataire. Le locataire doit respecter un préavis de 3 mois (bail d'habitation) ou 6 mois (bail commercial). Le propriétaire peut résilier uniquement pour motifs légaux (vente du bien, reprise pour habitation personnelle, non-paiement). La résiliation doit être notifiée par lettre recommandée (générée automatiquement par la plateforme). Un état des lieux de sortie doit être réalisé. La caution est restituée après déduction des éventuels dégâts.

**Services utilisés :** Supabase Database, Resend (notification), Azure OpenAI (génération lettre de résiliation)

---

### Module 5 : Paiements

Ce module gère tous les aspects financiers de la location.

#### 5.1 Paiement du Loyer

Le paiement du loyer peut se faire de plusieurs manières. Le paiement automatique (recommandé) prélève automatiquement le loyer chaque mois à la date convenue via InTouch. Le paiement manuel permet au locataire de payer quand il le souhaite avant la date d'échéance via Mobile Money (Orange Money, Moov Africa, MTN MoMo, Wave), carte bancaire, ou virement bancaire.

**Pages concernées :** MakePayment.tsx, PaymentHistory.tsx

**Services utilisés :** InTouch (paiements Mobile Money), Supabase Database

**Workflow de paiement :**
1. Le locataire initie un paiement depuis son dashboard
2. Il sélectionne le mode de paiement (Mobile Money, carte, virement)
3. Il est redirigé vers InTouch pour finaliser le paiement
4. InTouch traite la transaction et envoie un webhook à Mon Toit
5. Mon Toit met à jour le statut du paiement
6. Le locataire et le propriétaire reçoivent une confirmation par email et SMS
7. Un reçu PDF est généré automatiquement

**Frais de transaction :**
- Mobile Money : 1% du montant (min 100 FCFA, max 5,000 FCFA)
- Carte bancaire : 2.5% du montant
- Virement bancaire : Gratuit (mais délai de 2-3 jours)

#### 5.2 Gestion de la Caution

La caution (généralement équivalente à 2-3 mois de loyer) est versée au début du bail. Elle est conservée sur un compte séquestre géré par Mon Toit. À la fin du bail, un état des lieux de sortie est réalisé. Si aucun dégât n'est constaté, la caution est restituée intégralement au locataire sous 30 jours. Si des dégâts sont constatés, le coût des réparations est déduit de la caution. En cas de litige sur les déductions, un tiers de confiance intervient pour arbitrer.

**Services utilisés :** InTouch (gestion compte séquestre), Supabase Database

**Règles métier :**
- La caution ne peut pas être utilisée pour payer le dernier mois de loyer
- Les intérêts générés par la caution reviennent au locataire
- Délai maximum de restitution : 30 jours après état des lieux de sortie

#### 5.3 Historique et Reçus

Tous les paiements sont enregistrés et accessibles dans l'historique. Pour chaque paiement, l'utilisateur peut télécharger un reçu PDF officiel, consulter le statut (en attente, réussi, échoué, remboursé), voir les détails de la transaction (date, montant, mode de paiement, frais), et exporter l'historique en CSV ou PDF pour sa comptabilité.

**Pages concernées :** PaymentHistory.tsx

**Services utilisés :** Supabase Database, Azure OpenAI (génération reçus PDF)

#### 5.4 Rappels de Paiement

Le système envoie des rappels automatiques pour éviter les impayés. Un rappel est envoyé 7 jours avant l'échéance du loyer, le jour de l'échéance si le paiement n'est pas effectué, et 3 jours après l'échéance en cas de retard. Après 7 jours de retard, le propriétaire est notifié et peut initier une procédure de recouvrement. Après 30 jours de retard, le dossier peut être transmis à un tiers de confiance pour médiation.

**Services utilisés :** Resend (emails), Brevo (SMS), Supabase Database (cron jobs)

---

### Module 6 : Maintenance

Ce module gère les demandes de réparation et d'entretien.

#### 6.1 Demandes de Maintenance

Les locataires peuvent soumettre des demandes de maintenance directement depuis leur dashboard. Ils décrivent le problème (fuite d'eau, panne électrique, serrure cassée, etc.), joignent des photos ou vidéos du problème, indiquent l'urgence (urgent, normal, peut attendre), et proposent des créneaux de disponibilité pour l'intervention.

**Pages concernées :** TenantMaintenance.tsx, OwnerMaintenance.tsx, MaintenanceRequest.tsx

**Services utilisés :** Supabase Storage (photos/vidéos), Supabase Database, Resend (notifications)

**Niveaux d'urgence :**
- 🔴 Urgent (24h) : Fuite d'eau majeure, panne électrique totale, serrure cassée
- 🟠 Normal (7 jours) : Robinet qui fuit, ampoule grillée, peinture écaillée
- 🟢 Peut attendre (30 jours) : Entretien préventif, amélioration esthétique

#### 6.2 Suivi des Interventions

Une fois la demande soumise, le propriétaire est notifié immédiatement. Il peut accepter la demande, proposer un créneau d'intervention, ou la refuser (avec justification). Si acceptée, un prestataire est assigné (plombier, électricien, etc.). Le locataire peut suivre l'avancement en temps réel (en attente, planifiée, en cours, terminée). Après intervention, le locataire évalue la qualité du service.

**Services utilisés :** Supabase Database, Resend (notifications), Brevo (SMS rappels)

**Workflow :** Voir section "Workflows Détaillés - Demande de Maintenance"

---

### Module 7 : Communication

Ce module facilite les échanges entre utilisateurs.

#### 7.1 Messagerie Interne

La plateforme dispose d'une messagerie interne sécurisée permettant aux locataires et propriétaires de communiquer. Les messages sont chiffrés de bout en bout. Les pièces jointes sont autorisées (PDF, images, max 10 MB). Les utilisateurs reçoivent des notifications email/SMS pour les nouveaux messages. Un historique complet des conversations est conservé.

**Pages concernées :** Messages.tsx

**Services utilisés :** Supabase Realtime (messagerie temps réel), Supabase Storage (pièces jointes), Resend (notifications)

#### 7.2 Notifications

Le système de notifications est configurable par l'utilisateur. Les notifications peuvent être envoyées par email (Resend), SMS (Brevo/InTouch), et/ou push (navigateur). Les utilisateurs peuvent choisir les événements qui déclenchent des notifications (nouveau message, paiement reçu, visite planifiée, contrat signé, demande de maintenance, etc.).

**Pages concernées :** NotificationPreferences.tsx

**Services utilisés :** Resend, Brevo, Supabase Realtime

---

### Module 8 : Litiges & Médiation

Ce module gère les conflits entre propriétaires et locataires.

#### 8.1 Création de Litige

Lorsqu'un conflit survient, l'une des parties peut créer un litige. Elle décrit le problème en détail, joint des preuves (photos, vidéos, documents, messages), sélectionne la catégorie du litige (impayé, dégâts, non-respect du contrat, harcèlement, etc.), et propose une solution souhaitée.

**Pages concernées :** CreateDispute.tsx, MyDisputes.tsx, DisputeDetail.tsx

**Services utilisés :** Supabase Storage (preuves), Supabase Database

#### 8.2 Médiation par Tiers de Confiance

Une fois le litige créé, un tiers de confiance est automatiquement assigné. Il contacte les deux parties pour recueillir leurs versions, examine les preuves fournies, propose une solution de médiation, et organise une réunion de conciliation (en ligne ou en personne). Si un accord est trouvé, il est formalisé et signé électroniquement. Si aucun accord n'est trouvé, le dossier peut être transmis à un tribunal.

**Pages concernées :** TrustAgentMediation.tsx

**Services utilisés :** Supabase Database, Azure OpenAI (analyse du litige), Resend (notifications)

**Délais :**
- Assignation du tiers de confiance : 24h
- Premier contact : 48h
- Résolution : 30 jours maximum

---

### Module 9 : Administration

Ce module est réservé aux administrateurs de la plateforme.

#### 9.1 Gestion des Feature Flags

Les administrateurs peuvent activer ou désactiver des fonctionnalités sans redéployer l'application. Ils accèdent à l'interface de gestion des feature flags, voient la liste de tous les flags avec leur statut (actif/inactif), peuvent activer/désactiver un flag en un clic, configurer des rollouts progressifs (10%, 50%, 100%), définir des overrides par utilisateur (A/B testing), et consulter l'historique des changements.

**Pages concernées :** AdminFeatureFlags.tsx

**Services utilisés :** Supabase Database (table feature_flags)

**Flags disponibles :** 45 flags couvrant toutes les fonctionnalités de la plateforme

#### 9.2 Gestion des Clés API

Les administrateurs gèrent les clés API des services externes. Ils peuvent ajouter/modifier/supprimer des clés, activer/désactiver un service, consulter l'utilisation et les coûts, configurer les environnements (sandbox/production), et tester les connexions aux services.

**Pages concernées :** AdminApiKeys.tsx, AdminServiceConfiguration.tsx

**Services utilisés :** Supabase Database (table api_keys chiffrée)

#### 9.3 Monitoring des Services

Les administrateurs surveillent la santé de tous les services externes. Ils voient le statut en temps réel (opérationnel, dégradé, hors ligne), consultent les métriques de performance (temps de réponse, taux d'erreur), reçoivent des alertes en cas de problème, et peuvent forcer un basculement vers un service de fallback.

**Pages concernées :** AdminServiceMonitoring.tsx

**Services utilisés :** Supabase Database (logs), Azure OpenAI (détection d'anomalies)

#### 9.4 Gestion des Utilisateurs

Les administrateurs peuvent gérer tous les utilisateurs de la plateforme. Ils peuvent rechercher un utilisateur, consulter son profil complet, modifier ses informations, changer son rôle (locataire, propriétaire, tiers de confiance, admin), suspendre ou supprimer un compte, et consulter l'historique d'activité.

**Pages concernées :** AdminUsers.tsx, AdminUserRoles.tsx

**Services utilisés :** Supabase Database, Supabase Auth

#### 9.5 Gestion des Tiers de Confiance

Les administrateurs certifient et gèrent les tiers de confiance. Ils peuvent ajouter un nouveau tiers de confiance (après vérification), consulter leurs statistiques (litiges traités, taux de résolution), évaluer leur performance, suspendre ou révoquer une certification, et assigner manuellement des litiges.

**Pages concernées :** AdminTrustAgents.tsx

**Services utilisés :** Supabase Database

#### 9.6 Gestion des Certificats CEV

Les administrateurs peuvent consulter tous les certificats CEV émis, vérifier la validité d'un certificat, révoquer un certificat (en cas de fraude), exporter les statistiques pour l'ANSUT, et générer des rapports de conformité.

**Pages concernées :** AdminCEVManagement.tsx, CEVRequestDetail.tsx, RequestCEV.tsx

**Services utilisés :** CryptoNeo, Supabase Database

#### 9.7 Génération de Données de Test

Pour faciliter le développement et les démonstrations, les administrateurs peuvent générer des données de test réalistes : utilisateurs fictifs, propriétés, candidatures, contrats, paiements, litiges, etc.

**Pages concernées :** AdminTestDataGenerator.tsx, AdminQuickDemo.tsx

**Services utilisés :** Supabase Database, Azure OpenAI (génération de contenu)

---

### Module 10 : Analytics & Reporting

Ce module fournit des insights sur l'activité de la plateforme.

#### 10.1 Dashboard Propriétaire

Les propriétaires ont accès à un dashboard avec des statistiques sur leurs biens : taux d'occupation, revenus mensuels, dépenses (maintenance, taxes), rentabilité par propriété, nombre de visites, nombre de candidatures, et taux de conversion.

**Pages concernées :** OwnerDashboard.tsx, PropertyStats.tsx

**Services utilisés :** Supabase Database, Azure OpenAI (prédictions)

#### 10.2 Dashboard Tiers de Confiance

Les tiers de confiance ont accès à des analytics sur leur activité : nombre de litiges traités, taux de résolution, délai moyen de traitement, satisfaction des parties, et revenus générés.

**Pages concernées :** TrustAgentDashboard.tsx, TrustAgentAnalytics.tsx

**Services utilisés :** Supabase Database

#### 10.3 Dashboard Admin

Les administrateurs ont accès à des analytics globales : nombre d'utilisateurs actifs, nombre de propriétés publiées, nombre de contrats signés, volume de transactions, revenus de la plateforme, coûts des services externes, et taux de croissance.

**Pages concernées :** AdminDashboard.tsx

**Services utilisés :** Supabase Database, Azure OpenAI (prédictions de croissance)

#### 10.4 Rapports ANSUT

La plateforme génère automatiquement des rapports mensuels pour l'ANSUT incluant le nombre de contrats certifiés, le nombre de vérifications d'identité, les incidents de sécurité, et les litiges non résolus.

**Services utilisés :** Supabase Database, Azure OpenAI (génération de rapports)

---

## 🔄 Workflows Détaillés

### Workflow 1 : Inscription et Vérification d'Identité

Ce workflow décrit le parcours complet d'un nouvel utilisateur depuis son inscription jusqu'à sa vérification complète.

**Acteurs :** Utilisateur, Système Mon Toit, ONECI, NeoFace, Brevo

**Durée estimée :** 10-15 minutes

**Étapes détaillées :**

1. **Création du compte (2 min)**
   - L'utilisateur accède à la page d'inscription (Auth.tsx)
   - Il saisit son email et crée un mot de passe sécurisé
   - Le système vérifie que l'email n'est pas déjà utilisé
   - Un compte est créé dans Supabase Auth
   - Un email de vérification est envoyé via Resend

2. **Vérification de l'email (1 min)**
   - L'utilisateur reçoit un email avec un lien de vérification
   - Il clique sur le lien (valide 24h)
   - Son compte est activé
   - Il est redirigé vers la sélection de profil

3. **Sélection du profil (1 min)**
   - L'utilisateur choisit son type de profil (locataire, propriétaire, agence)
   - Il est redirigé vers le formulaire de profil correspondant

4. **Complétion du profil (3 min)**
   - L'utilisateur remplit ses informations personnelles :
     * Nom et prénom
     * Numéro National d'Identification (NNI)
     * Numéro de téléphone
     * Adresse
     * Profession (pour locataires)
     * Revenus mensuels (pour locataires)
   - Il télécharge une photo de profil (optionnel)
   - Il accepte les CGU et la politique de confidentialité

5. **Vérification du NNI via ONECI (2-5 min)**
   - Le système envoie le NNI à l'API ONECI
   - ONECI vérifie la validité du NNI et retourne les informations officielles
   - Le système compare les informations ONECI avec celles fournies par l'utilisateur
   - Si correspondance : Badge "NNI Vérifié" attribué
   - Si non-correspondance : Validation manuelle requise

6. **Vérification faciale biométrique (3-5 min)**
   - L'utilisateur est redirigé vers la page de vérification faciale
   - Il télécharge une photo de sa CNI ou passeport (recto-verso)
   - Il capture un selfie en temps réel avec détection de vivacité
   - NeoFace v2 compare les deux images
   - Score de correspondance calculé (0-100%)
   - Si score ≥ 80% : Badge "Identité Vérifiée" attribué
   - Si score < 80% : Possibilité de réessayer (max 3 fois)
   - Après 3 échecs : Validation manuelle par tiers de confiance

7. **Finalisation (1 min)**
   - L'utilisateur reçoit une notification de bienvenue par email et SMS
   - Son profil est complet et vérifié
   - Il peut maintenant utiliser toutes les fonctionnalités de la plateforme

**Conditions de succès :**
- Email vérifié ✅
- NNI vérifié ✅
- Identité faciale vérifiée ✅
- Profil complété à 100% ✅

**Points de friction possibles :**
- Email de vérification non reçu → Renvoyer l'email
- NNI invalide → Vérifier la saisie, contacter support
- Vérification faciale échouée → Améliorer l'éclairage, retirer lunettes/masque, réessayer
- ONECI indisponible → Fallback vers validation manuelle temporaire

---

### Workflow 2 : Recherche et Candidature à une Propriété

Ce workflow décrit le parcours d'un locataire depuis sa recherche jusqu'à la soumission de sa candidature.

**Acteurs :** Locataire, Système Mon Toit, Propriétaire, Azure OpenAI

**Durée estimée :** 15-30 minutes

**Étapes détaillées :**

1. **Recherche de propriétés (5-10 min)**
   - Le locataire accède à la page de recherche (SearchProperties.tsx)
   - Il définit ses critères de recherche :
     * Localisation (ville, quartier, rayon)
     * Budget (loyer min-max)
     * Type de bien (appartement, maison, studio)
     * Nombre de chambres
     * Équipements souhaités (climatisation, parking, etc.)
   - Le système interroge la base de données avec recherche full-text
   - Les résultats sont affichés sur une carte interactive (Mapbox)
   - Le locataire peut affiner les filtres, trier par pertinence/prix/date
   - Il consulte les fiches de plusieurs propriétés

2. **Consultation d'une propriété (3-5 min)**
   - Le locataire clique sur une propriété qui l'intéresse
   - Il est redirigé vers la page de détail (PropertyDetail.tsx)
   - Il consulte :
     * Galerie photos (jusqu'à 20 photos)
     * Description complète
     * Caractéristiques techniques
     * Prix et conditions
     * Localisation sur carte
     * Avis d'anciens locataires
     * Profil du propriétaire
   - Il peut ajouter la propriété aux favoris
   - Il peut planifier une visite
   - Il peut postuler directement

3. **Planification d'une visite (optionnel) (2-3 min)**
   - Le locataire clique sur "Planifier une visite"
   - Il sélectionne une date et heure parmi les créneaux disponibles
   - Il ajoute un message au propriétaire (optionnel)
   - Il confirme la demande
   - Le système envoie une notification au propriétaire
   - Le locataire reçoit une confirmation par email et SMS avec QR code

4. **Soumission de candidature (5-10 min)**
   - Le locataire clique sur "Postuler"
   - Il est redirigé vers le formulaire de candidature (ApplicationForm.tsx)
   - Il remplit les informations requises :
     * Informations personnelles (pré-remplies depuis le profil)
     * Revenus mensuels
     * Profession et employeur
     * Situation familiale
     * Date de début de location souhaitée
     * Références (anciens propriétaires)
   - Il télécharge les documents obligatoires :
     * Copie CNI ou passeport (si pas déjà vérifié)
     * Justificatifs de revenus (3 derniers mois)
     * Attestation d'emploi
     * Références (optionnel)
   - Il rédige un message de motivation (optionnel)
   - Il accepte les conditions de candidature

5. **Validation automatique (instantané)**
   - Le système vérifie automatiquement :
     * Revenus ≥ 3x le loyer (règle standard)
     * Identité vérifiée (NNI + biométrie)
     * Documents complets
   - Azure AI Vision analyse les documents pour détecter les falsifications
   - Le score locataire est calculé automatiquement
   - La candidature est marquée comme "Complète" ou "Incomplète"

6. **Notification et attente (variable)**
   - Le propriétaire reçoit une notification de nouvelle candidature
   - Le locataire reçoit une confirmation de soumission
   - Le locataire peut suivre le statut de sa candidature depuis son dashboard
   - Statuts possibles :
     * 🟡 En attente : Le propriétaire n'a pas encore consulté
     * 🔵 En cours d'examen : Le propriétaire a consulté la candidature
     * 🟢 Acceptée : Le propriétaire a accepté la candidature
     * 🔴 Refusée : Le propriétaire a refusé la candidature

7. **Réponse du propriétaire (24h-7 jours)**
   - Le propriétaire examine la candidature
   - Il consulte le profil du locataire, son score, ses documents
   - Il peut demander des informations complémentaires
   - Il accepte ou refuse la candidature avec justification
   - Le locataire est notifié de la décision par email et SMS

**Conditions de succès :**
- Candidature complète et conforme ✅
- Score locataire ≥ 40 ✅
- Documents valides et non falsifiés ✅
- Revenus suffisants ✅

**Points de friction possibles :**
- Aucune propriété ne correspond aux critères → Élargir la recherche, ajuster le budget
- Documents manquants → Compléter le dossier
- Score locataire trop faible → Fournir des garanties supplémentaires (garant, caution majorée)
- Revenus insuffisants → Chercher un colocataire, fournir un garant

---

### Workflow 3 : Signature de Bail avec CEV

Ce workflow décrit le processus complet de signature électronique d'un bail avec Certificat Électronique de Vérification.

**Acteurs :** Propriétaire, Locataire, Système Mon Toit, CryptoNeo, NeoFace, Brevo, ANSUT

**Durée estimée :** 30-60 minutes (réparties sur plusieurs jours)

**Étapes détaillées :**

**PHASE 1 : CRÉATION DU CONTRAT (Propriétaire)**

1. **Acceptation de la candidature (2 min)**
   - Le propriétaire consulte les candidatures reçues
   - Il sélectionne le meilleur candidat
   - Il clique sur "Accepter la candidature"
   - Les autres candidats sont automatiquement notifiés du refus

2. **Génération du contrat (5 min)**
   - Le propriétaire est redirigé vers la page de création de contrat (CreateContract.tsx)
   - Le système génère un contrat pré-rempli avec :
     * Informations du propriétaire (nom, NNI, adresse)
     * Informations du locataire (nom, NNI, adresse)
     * Détails de la propriété (adresse, description, superficie)
     * Conditions financières (loyer, caution, charges)
     * Durée du bail (date de début, durée)
   - Le propriétaire peut personnaliser :
     * Clauses spécifiques (animaux, sous-location, travaux)
     * Conditions particulières
     * Inventaire des meubles (si meublé)
   - Il vérifie toutes les informations
   - Il clique sur "Générer le contrat"

3. **Prévisualisation et validation (3 min)**
   - Le système génère un PDF du contrat
   - Le propriétaire prévisualise le document
   - Il peut apporter des modifications
   - Il valide le contrat final
   - Le contrat est enregistré avec statut "Brouillon"

4. **Envoi pour signature (1 min)**
   - Le propriétaire clique sur "Envoyer pour signature"
   - Le système envoie le contrat à CryptoNeo
   - CryptoNeo génère un ID d'opération unique
   - Le locataire et le propriétaire reçoivent une notification par email et SMS
   - Le contrat passe au statut "En attente de signature"

**PHASE 2 : SIGNATURE PAR LE LOCATAIRE (Locataire)**

5. **Notification et accès au contrat (1 min)**
   - Le locataire reçoit un email avec lien vers le contrat
   - Il clique sur le lien
   - Il est redirigé vers la page de signature (SignLease.tsx)
   - Il doit se connecter à son compte Mon Toit

6. **Consultation du contrat (5-10 min)**
   - Le locataire consulte le contrat PDF
   - Il peut le télécharger pour lecture hors ligne
   - Il vérifie toutes les clauses et conditions
   - Il peut poser des questions au propriétaire via la messagerie
   - Il clique sur "Je suis prêt à signer"

7. **Vérification d'identité pré-signature (3-5 min)**
   - Le système demande une vérification faciale
   - Le locataire capture un selfie en temps réel
   - NeoFace v2 compare avec la photo de profil
   - Si score ≥ 80% : Vérification réussie
   - Si score < 80% : Réessayer ou validation manuelle

8. **Génération et envoi de l'OTP (1 min)**
   - Le système génère un code OTP à 6 chiffres
   - L'OTP est envoyé par SMS via Brevo
   - L'OTP est valide 5 minutes
   - Le locataire reçoit le SMS avec le code

9. **Saisie de l'OTP et signature (2 min)**
   - Le locataire saisit le code OTP reçu
   - Le système vérifie la validité de l'OTP
   - Si valide : Le système envoie la demande de signature à CryptoNeo
   - CryptoNeo génère la signature électronique avec horodatage
   - Un Certificat Électronique de Vérification (CEV) est créé
   - La signature du locataire est enregistrée
   - Le locataire reçoit une confirmation par email

**PHASE 3 : SIGNATURE PAR LE PROPRIÉTAIRE (Propriétaire)**

10. **Notification de signature locataire (1 min)**
    - Le propriétaire reçoit une notification que le locataire a signé
    - Il accède au contrat depuis son dashboard
    - Il consulte la signature du locataire

11. **Signature par le propriétaire (5-10 min)**
    - Le propriétaire suit le même processus que le locataire :
      * Vérification faciale
      * Réception de l'OTP par SMS
      * Saisie de l'OTP
      * Signature électronique
    - Une fois signé, le contrat passe au statut "Signé par toutes les parties"

**PHASE 4 : VALIDATION ANSUT (Automatique)**

12. **Envoi à l'ANSUT (instantané)**
    - Le système envoie automatiquement le contrat signé à l'ANSUT
    - L'ANSUT vérifie :
      * La validité des signatures CEV
      * La conformité du contrat avec la réglementation
      * L'authenticité des NNI des signataires
    - Délai de validation : 24-48h

13. **Cachet électronique visible (24-48h)**
    - L'ANSUT valide le contrat
    - Un numéro de cachet électronique visible est attribué
    - Le contrat passe au statut "Avec cachet électronique"
    - Les deux parties reçoivent une notification de certification

**PHASE 5 : ARCHIVAGE ET DISTRIBUTION (Automatique)**

14. **Archivage sécurisé (instantané)**
    - Le contrat signé et certifié est archivé sur Supabase Storage
    - Le fichier est chiffré avec AES-256
    - Un hash SHA-256 est calculé pour garantir l'intégrité
    - Le contrat est accessible à tout moment depuis l'interface

15. **Distribution des copies (instantané)**
    - Chaque partie reçoit une copie PDF par email (via Resend)
    - Le PDF inclut :
      * Le contrat complet
      * Les signatures électroniques
      * Le certificat CEV
      * Le numéro de cachet électronique visible
      * Un QR code de vérification
    - Les copies sont également téléchargeables depuis le dashboard

16. **Activation du contrat (à la date de début)**
    - À la date de début du bail, le contrat passe au statut "Actif"
    - Le premier paiement de loyer est déclenché (si paiement automatique activé)
    - Le locataire peut accéder à la propriété
    - Les deux parties peuvent gérer le contrat depuis leur dashboard

**Conditions de succès :**
- Contrat généré correctement ✅
- Identités vérifiées (NNI + biométrie) ✅
- Signatures CEV valides ✅
- Cachet électronique visible obtenue ✅
- Contrat archivé et distribué ✅

**Points de friction possibles :**
- OTP non reçu → Renvoyer l'OTP, vérifier le numéro de téléphone
- Vérification faciale échouée → Améliorer l'éclairage, réessayer
- CryptoNeo indisponible → Réessayer plus tard, contacter support
- ANSUT refuse la certification → Corriger le contrat, resoummettre
- Désaccord sur une clause → Modifier le contrat, renégocier

**Sécurités en place :**
- Double vérification d'identité (NNI + biométrie)
- OTP à usage unique avec expiration courte (5 min)
- Signature électronique avec horodatage
- Certificat Électronique de Vérification (CEV) ONECI infalsifiable
- Validation par autorité officielle (ANSUT)
- Archivage chiffré et immuable

---

### Workflow 4 : Paiement de Loyer

Ce workflow décrit le processus de paiement mensuel du loyer.

**Acteurs :** Locataire, Système Mon Toit, InTouch, Propriétaire

**Durée estimée :** 5-10 minutes (paiement manuel) ou automatique

**Étapes détaillées :**

**MODE 1 : PAIEMENT AUTOMATIQUE (Recommandé)**

1. **Configuration initiale (une seule fois) (5 min)**
   - Le locataire accède à ses paramètres de paiement
   - Il active le paiement automatique
   - Il sélectionne son mode de paiement préféré (Mobile Money, carte bancaire)
   - Il autorise le prélèvement automatique
   - Il définit la date de prélèvement (généralement le 1er ou le 5 du mois)
   - Le système enregistre le mandat de prélèvement

2. **Prélèvement automatique mensuel (automatique)**
   - Le jour du prélèvement, le système génère automatiquement une demande de paiement
   - InTouch initie le prélèvement sur le compte du locataire
   - Le locataire reçoit une notification SMS de prélèvement
   - Si le paiement réussit :
     * Le loyer est marqué comme "Payé"
     * Le propriétaire reçoit le paiement (moins les frais de plateforme)
     * Les deux parties reçoivent une confirmation par email et SMS
     * Un reçu PDF est généré automatiquement
   - Si le paiement échoue (solde insuffisant, compte bloqué) :
     * Le locataire reçoit une notification d'échec
     * Une nouvelle tentative est programmée 3 jours plus tard
     * Après 3 échecs, le locataire doit payer manuellement

**MODE 2 : PAIEMENT MANUEL**

3. **Rappel de paiement (7 jours avant échéance)**
   - Le système envoie un rappel par email et SMS
   - Le locataire peut cliquer sur un lien pour payer directement

4. **Initiation du paiement (2 min)**
   - Le locataire accède à son dashboard
   - Il clique sur "Payer le loyer"
   - Il est redirigé vers la page de paiement (MakePayment.tsx)
   - Il voit le montant à payer (loyer + charges + frais éventuels)
   - Il sélectionne son mode de paiement :
     * Mobile Money (Orange Money, Moov Africa, MTN MoMo, Wave)
     * Carte bancaire
     * Virement bancaire

5. **Paiement via Mobile Money (3-5 min)**
   - Le locataire sélectionne son opérateur Mobile Money
   - Il saisit son numéro de téléphone
   - Il clique sur "Payer"
   - Le système génère une demande de paiement InTouch
   - Le locataire reçoit un prompt USSD sur son téléphone
   - Il saisit son code PIN Mobile Money
   - Il confirme le paiement
   - InTouch traite la transaction

6. **Confirmation et webhook (instantané)**
   - InTouch envoie un webhook à Mon Toit avec le statut du paiement
   - Si paiement réussi :
     * Le système met à jour le statut du loyer à "Payé"
     * Le propriétaire reçoit le paiement (virement sous 24-48h)
     * Les deux parties reçoivent une confirmation par email et SMS
     * Un reçu PDF est généré et envoyé par email
   - Si paiement échoué :
     * Le locataire est notifié de l'échec avec raison (solde insuffisant, etc.)
     * Il peut réessayer immédiatement

7. **Archivage et historique (instantané)**
   - Le paiement est enregistré dans l'historique
   - Le reçu PDF est archivé sur Supabase Storage
   - Le locataire peut télécharger le reçu à tout moment depuis son dashboard

**GESTION DES RETARDS DE PAIEMENT**

8. **Rappel à l'échéance (jour J)**
   - Si le loyer n'est pas payé à la date d'échéance
   - Le système envoie un rappel urgent par email et SMS
   - Le locataire a 3 jours de grâce sans pénalité

9. **Pénalités de retard (J+3)**
   - Après 3 jours de retard, des pénalités sont appliquées (selon le contrat)
   - Le propriétaire est notifié du retard
   - Le locataire reçoit une mise en demeure par email

10. **Escalade (J+7)**
    - Après 7 jours de retard, le propriétaire peut initier une procédure de recouvrement
    - Un tiers de confiance peut être sollicité pour médiation
    - Le locataire risque une inscription au fichier des mauvais payeurs

11. **Procédure légale (J+30)**
    - Après 30 jours de retard, le propriétaire peut engager une procédure d'expulsion
    - Le dossier est transmis à un avocat
    - Le locataire reçoit une mise en demeure officielle

**Conditions de succès :**
- Paiement effectué avant la date d'échéance ✅
- Montant correct (loyer + charges) ✅
- Transaction réussie ✅
- Reçu généré et envoyé ✅

**Points de friction possibles :**
- Solde Mobile Money insuffisant → Recharger le compte, utiliser un autre mode de paiement
- Transaction échouée → Réessayer, contacter InTouch support
- Retard de paiement → Payer rapidement pour éviter pénalités
- Litige sur le montant → Contacter le propriétaire, saisir un tiers de confiance

---

### Workflow 5 : Demande de Maintenance

Ce workflow décrit le processus de soumission et de traitement d'une demande de maintenance.

**Acteurs :** Locataire, Propriétaire, Prestataire (optionnel), Système Mon Toit

**Durée estimée :** Variable selon l'urgence (24h à 30 jours)

**Étapes détaillées :**

**PHASE 1 : SOUMISSION DE LA DEMANDE (Locataire)**

1. **Création de la demande (5 min)**
   - Le locataire accède à son dashboard
   - Il clique sur "Nouvelle demande de maintenance"
   - Il est redirigé vers le formulaire (TenantMaintenance.tsx)
   - Il remplit les informations :
     * Type de problème (plomberie, électricité, serrurerie, peinture, etc.)
     * Description détaillée du problème
     * Niveau d'urgence (urgent, normal, peut attendre)
     * Localisation dans le logement (cuisine, salle de bain, chambre, etc.)
   - Il joint des photos ou vidéos du problème (optionnel mais recommandé)
   - Il propose des créneaux de disponibilité pour l'intervention
   - Il clique sur "Soumettre la demande"

2. **Validation et enregistrement (instantané)**
   - Le système enregistre la demande avec un numéro unique
   - La demande est assignée au propriétaire de la propriété
   - Le statut est défini selon l'urgence :
     * 🔴 Urgent : Traitement sous 24h
     * 🟠 Normal : Traitement sous 7 jours
     * 🟢 Peut attendre : Traitement sous 30 jours

3. **Notification du propriétaire (instantané)**
   - Le propriétaire reçoit une notification par email et SMS
   - L'email contient :
     * Le numéro de la demande
     * Le type de problème
     * Le niveau d'urgence
     * Les photos/vidéos jointes
     * Un lien pour répondre à la demande
   - Si urgence = "Urgent", le propriétaire reçoit également un appel automatique (Azure Speech TTS)

**PHASE 2 : TRAITEMENT PAR LE PROPRIÉTAIRE (Propriétaire)**

4. **Examen de la demande (5-10 min)**
   - Le propriétaire accède à la demande depuis son dashboard (OwnerMaintenance.tsx)
   - Il consulte les détails, photos, vidéos
   - Il évalue la gravité et l'urgence
   - Il peut demander des informations complémentaires au locataire

5. **Décision du propriétaire (2 min)**
   - Le propriétaire a trois options :
     * **Accepter** : Il prend en charge la réparation
     * **Refuser** : Il refuse la demande (avec justification obligatoire)
     * **Négocier** : Il propose une alternative (partage des frais, délai différent, etc.)

6. **Si acceptée : Planification de l'intervention (5 min)**
   - Le propriétaire sélectionne un créneau parmi ceux proposés par le locataire
   - Il peut assigner un prestataire (plombier, électricien, etc.) depuis son carnet d'adresses
   - Ou il peut intervenir lui-même
   - Il estime le coût de la réparation (optionnel)
   - Il confirme la planification

7. **Notification du locataire (instantané)**
   - Le locataire reçoit une notification de la décision du propriétaire
   - Si acceptée : Il reçoit la date et heure de l'intervention
   - Si refusée : Il reçoit la justification et peut contester
   - Si négociation : Il peut accepter ou refuser la proposition

**PHASE 3 : INTERVENTION (Propriétaire ou Prestataire)**

8. **Rappel avant intervention (24h avant)**
   - Le locataire et le propriétaire/prestataire reçoivent un rappel par SMS
   - Le locataire confirme sa disponibilité
   - Si indisponible, il peut reprogrammer (jusqu'à 12h avant)

9. **Réalisation de l'intervention (variable)**
   - Le propriétaire ou le prestataire se rend sur place
   - Il effectue la réparation
   - Il peut prendre des photos avant/après
   - Il peut demander au locataire de signer un bon d'intervention

10. **Clôture de l'intervention (5 min)**
    - Le propriétaire marque l'intervention comme "Terminée"
    - Il joint les photos avant/après
    - Il saisit le coût réel de la réparation
    - Il peut joindre une facture du prestataire
    - La demande passe au statut "Terminée"

**PHASE 4 : ÉVALUATION (Locataire)**

11. **Notification de clôture (instantané)**
    - Le locataire reçoit une notification que l'intervention est terminée
    - Il est invité à évaluer la qualité du service

12. **Évaluation du locataire (2 min)**
    - Le locataire accède à la demande depuis son dashboard
    - Il évalue :
      * La rapidité d'intervention (1-5 étoiles)
      * La qualité de la réparation (1-5 étoiles)
      * La communication (1-5 étoiles)
    - Il peut laisser un commentaire
    - Il confirme que le problème est résolu
    - Si le problème persiste, il peut rouvrir la demande

13. **Archivage (instantané)**
    - La demande est archivée avec statut "Résolue"
    - L'évaluation est enregistrée et visible dans le profil du propriétaire
    - Le coût de la réparation est ajouté aux statistiques de la propriété

**CAS PARTICULIERS**

**Si le propriétaire ne répond pas :**
- Après 24h (urgent) ou 7 jours (normal) sans réponse
- Le locataire reçoit une notification qu'il peut escalader la demande
- Il peut saisir un tiers de confiance pour médiation
- Le tiers de confiance contacte le propriétaire
- Si toujours pas de réponse, le locataire peut faire intervenir un prestataire et déduire les frais du loyer (selon législation)

**Si le locataire refuse l'intervention :**
- Le propriétaire peut annuler la demande
- Si le problème s'aggrave, le locataire ne pourra pas tenir le propriétaire responsable
- Le propriétaire peut demander au locataire de signer une décharge

**Si litige sur les frais :**
- Le locataire conteste le coût de la réparation
- Un tiers de confiance examine la facture et les photos
- Il détermine si les frais sont justifiés
- Si oui, le locataire doit payer
- Si non, le propriétaire doit rembourser le trop-perçu

**Conditions de succès :**
- Demande soumise avec informations complètes ✅
- Propriétaire répond dans les délais ✅
- Intervention réalisée avec succès ✅
- Problème résolu ✅
- Locataire satisfait ✅

**Points de friction possibles :**
- Photos/vidéos manquantes → Demander au locataire de compléter
- Propriétaire ne répond pas → Escalader vers tiers de confiance
- Prestataire annule → Trouver un autre prestataire, reprogrammer
- Litige sur les frais → Médiation par tiers de confiance
- Problème non résolu → Rouvrir la demande, faire intervenir un expert

---

## 🔗 Intégrations Externes

La plateforme Mon Toit s'appuie sur 14 services externes pour fournir ses fonctionnalités.

### Services Configurés (14/16 - 87.5%)

| Service | Fonction | Statut | Priorité |
|---------|----------|--------|----------|
| **Supabase** | Base de données, auth, storage | ✅ Production | Critique |
| **Mapbox** | Cartes interactives | ✅ Production | Haute |
| **Resend** | Emails transactionnels | ✅ Production | Critique |
| **Brevo** | SMS et WhatsApp | ✅ Production | Critique |
| **InTouch** | Paiements Mobile Money | ✅ Production | Critique |
| **CryptoNeo** | Signature électronique CEV | ⚠️ Sandbox | Critique |
| **NeoFace v2** | Vérification faciale | ✅ Production | Critique |
| **Smile ID** | Vérification d'identité KYC | ⚠️ Sandbox | Haute |
| **Azure OpenAI** | IA conversationnelle | ✅ Production | Moyenne |
| **Azure AI Services** | Vision, OCR | ✅ Production | Moyenne |
| **Azure Speech** | STT, TTS | ✅ Production | Basse |
| **Gemini** | IA alternative | ✅ Production | Basse |
| **DeepSeek** | LLM alternatif | ✅ Production | Basse |
| **Google Maps** | Cartes alternative | ✅ Production | Basse |
| **ONECI** | Vérification NNI | 🔴 Non configuré | Critique |
| **Azure Comm** | Communications | 🔴 Non configuré | Basse |

### Détails des Intégrations

Pour chaque service, voir la section "Intégrations Externes" dans le document `AUDIT_INTEGRATIONS_EXTERNES.md`.

---

## 📏 Règles Métier

### Règles Financières

1. **Loyer et Caution**
   - Le loyer ne peut pas être modifié pendant la durée du bail (sauf clause d'indexation)
   - La caution est généralement égale à 2-3 mois de loyer
   - La caution est restituée sous 30 jours après l'état des lieux de sortie
   - Les intérêts de la caution reviennent au locataire

2. **Frais de Plateforme**
   - Frais fixes de 5,000 FCFA par contrat signé (payé par le propriétaire)
   - Commission de 1% sur les loyers encaissés (payé par le propriétaire)
   - Frais de transaction Mobile Money : 1% (min 100 FCFA, max 5,000 FCFA)

3. **Pénalités de Retard**
   - 3 jours de grâce sans pénalité
   - Après 3 jours : Pénalité de 5% du loyer par semaine de retard (max 20%)
   - Après 30 jours : Procédure d'expulsion possible

### Règles de Vérification

1. **Vérification d'Identité**
   - Le NNI doit être vérifié auprès de l'ONECI (obligatoire pour Ivoiriens)
   - La vérification faciale est obligatoire avant signature de bail
   - Score de correspondance minimum : 80%
   - Maximum 3 tentatives de vérification faciale

2. **Score Locataire**
   - Score minimum recommandé : 40/100
   - Score < 40 : Garanties supplémentaires requises (garant, caution majorée)
   - Le score est recalculé tous les 6 mois

3. **Documents Obligatoires**
   - Copie CNI ou passeport
   - Justificatifs de revenus (3 derniers mois)
   - Attestation d'emploi
   - Références (optionnel mais recommandé)

### Règles de Signature

1. **Signature Électronique CEV**
   - Obligatoire pour tous les contrats de bail
   - Double vérification d'identité (NNI + biométrie)
   - OTP à usage unique avec expiration de 5 minutes
   - Cachet électronique visible obligatoire pour validité légale

2. **Ordre de Signature**
   - Le locataire signe en premier
   - Le propriétaire signe en second
   - Le contrat n'est valide qu'après signature des deux parties et cachet électronique visible

### Règles de Bail

1. **Durée du Bail**
   - Durée minimale : 1 an (bail d'habitation)
   - Durée minimale : 3 ans (bail commercial)
   - Renouvellement automatique sauf préavis de résiliation

2. **Résiliation**
   - Préavis locataire : 3 mois (habitation), 6 mois (commercial)
   - Préavis propriétaire : 6 mois (habitation), 1 an (commercial)
   - Motifs légaux de résiliation par le propriétaire : vente, reprise, non-paiement

3. **Augmentation du Loyer**
   - Augmentation maximale : 5% par an (à vérifier selon législation)
   - Notification 3 mois avant l'échéance du bail

### Règles de Maintenance

1. **Responsabilités**
   - Propriétaire : Gros travaux, structure, équipements majeurs
   - Locataire : Petits travaux d'entretien, consommables

2. **Délais d'Intervention**
   - Urgent : 24h maximum
   - Normal : 7 jours maximum
   - Peut attendre : 30 jours maximum

3. **Frais**
   - Réparations dues à l'usure normale : À la charge du propriétaire
   - Réparations dues à une mauvaise utilisation : À la charge du locataire

### Règles de Litiges

1. **Médiation**
   - Tout litige doit d'abord passer par une médiation avec tiers de confiance
   - Délai de médiation : 30 jours maximum
   - Si échec de la médiation, recours judiciaire possible

2. **Preuves**
   - Toutes les communications via la plateforme sont archivées et peuvent servir de preuve
   - Les photos, vidéos, et documents joints sont horodatés et infalsifiables

---

## 📈 Métriques et KPIs

### Métriques Utilisateurs

- Nombre d'inscriptions mensuelles
- Taux de conversion inscription → profil complet
- Taux de vérification d'identité réussie
- Nombre d'utilisateurs actifs mensuels (MAU)
- Taux de rétention (30 jours, 90 jours)

### Métriques Propriétés

- Nombre de propriétés publiées mensuellement
- Taux d'occupation des propriétés
- Délai moyen avant location
- Nombre de visites par propriété
- Taux de conversion visite → candidature

### Métriques Contrats

- Nombre de contrats signés mensuellement
- Délai moyen candidature → signature
- Taux de cachet électronique visible
- Taux de renouvellement des baux
- Taux de résiliation anticipée

### Métriques Financières

- Volume de transactions mensuelles (FCFA)
- Revenus de la plateforme (frais + commissions)
- Coûts des services externes
- Marge nette
- Valeur moyenne d'un contrat (loyer mensuel)

### Métriques Qualité

- Taux de satisfaction utilisateurs (NPS)
- Nombre de litiges mensuels
- Taux de résolution des litiges
- Délai moyen de résolution des demandes de maintenance
- Taux d'échec des vérifications d'identité

---

## 🎓 Conclusion

La plateforme Mon Toit offre un écosystème complet et sécurisé pour la location immobilière en Côte d'Ivoire. Avec **70 pages fonctionnelles**, **10 modules**, **69 Edge Functions**, et **14 services externes intégrés**, la plateforme couvre l'ensemble du cycle de vie locatif, de la recherche de propriété à la gestion quotidienne du bail.

La conformité avec les exigences de l'ANSUT, notamment via la signature électronique CEV et la vérification d'identité NNI, garantit la validité légale de toutes les transactions effectuées sur la plateforme.

Les workflows détaillés et les règles métier clairement définies assurent une expérience utilisateur fluide et sécurisée pour tous les acteurs : locataires, propriétaires, tiers de confiance, et administrateurs.

---

**Document créé par Manus AI - 21 novembre 2025**  
**Version 2.0 - Documentation Fonctionnelle Complète**

