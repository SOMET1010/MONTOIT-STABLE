# Plan de Réorganisation - Structure Standardisée React

**Date :** 21 novembre 2025  
**Auteur :** Manus AI  
**Version :** 1.0  
**Statut :** 📋 Plan en cours

---

## 🎯 Objectif

Réorganiser le projet Mon Toit selon la structure standardisée React pour améliorer :
- ✅ Lisibilité et maintenabilité
- ✅ Scalabilité
- ✅ Travail en équipe
- ✅ Cohérence avec les standards

---

## 📊 Analyse de la Structure Actuelle

### État Actuel (src/)

```
src/
├── api/
│   └── repositories/          # 📦 À déplacer dans services/
├── components/                # ⚠️ À réorganiser
│   ├── ui/                    # ✅ Déjà conforme
│   ├── charts/                # ✅ OK
│   ├── profile/               # ⚠️ À déplacer
│   └── *.tsx (58 fichiers)    # ⚠️ À catégoriser
├── pages/                     # ⚠️ À réorganiser par modules
│   └── *.tsx (70 fichiers)    # ⚠️ Tous à la racine
├── contexts/                  # ✅ Conforme (1 fichier)
├── services/                  # ⚠️ À réorganiser
│   ├── ai/
│   ├── azure/
│   ├── contracts/
│   ├── format/
│   ├── providers/
│   ├── upload/
│   └── validation/
├── hooks/                     # ✅ Conforme (7 fichiers)
├── lib/                       # ✅ Conforme (7 fichiers)
│   ├── constants/
│   └── helpers/
├── types/                     # ✅ Conforme (2 fichiers)
├── config/                    # ⚠️ À fusionner avec lib/
├── routes/                    # ✅ OK
└── stores/                    # ✅ OK
```

**Statistiques :**
- **components/** : 58 fichiers (dont beaucoup à catégoriser)
- **pages/** : 70 fichiers (tous à la racine, à organiser par modules)
- **services/** : 39 fichiers (structure OK mais à améliorer)
- **hooks/** : 7 fichiers ✅
- **lib/** : 7 fichiers ✅
- **types/** : 2 fichiers ✅
- **contexts/** : 1 fichier ✅

---

## 🎯 Structure Cible (Standardisée)

```
src/
├── components/
│   ├── ui/                    # Composants ShadCN/UI de base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── auth/                  # Composants d'authentification
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── OTPVerification.tsx
│   │   └── ...
│   ├── layout/                # Composants de mise en page
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   ├── common/                # Composants communs réutilisables
│   │   ├── FileUpload.tsx
│   │   ├── MapWrapper.tsx
│   │   ├── Chatbot.tsx
│   │   └── ...
│   ├── property/              # Composants liés aux propriétés
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyFilters.tsx
│   │   └── ...
│   ├── contract/              # Composants liés aux contrats
│   │   ├── ContractPreview.tsx
│   │   ├── ContractAnnexes.tsx
│   │   └── ...
│   └── charts/                # Composants de graphiques
│       └── ...
│
├── pages/
│   ├── admin/                 # Module Admin
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── ApiKeys.tsx
│   │   ├── ServiceConfiguration.tsx
│   │   └── ...
│   ├── tenant/                # Module Locataire
│   │   ├── Dashboard.tsx
│   │   ├── SearchProperties.tsx
│   │   ├── MyContracts.tsx
│   │   └── ...
│   ├── owner/                 # Module Propriétaire
│   │   ├── Dashboard.tsx
│   │   ├── Properties.tsx
│   │   ├── Applications.tsx
│   │   └── ...
│   ├── trust-agent/           # Module Tiers de Confiance
│   │   ├── Dashboard.tsx
│   │   ├── Validations.tsx
│   │   └── ...
│   ├── agency/                # Module Agence
│   │   ├── Dashboard.tsx
│   │   ├── Properties.tsx
│   │   └── ...
│   ├── auth/                  # Pages d'authentification
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── VerifyOTP.tsx
│   │   └── ...
│   └── public/                # Pages publiques
│       ├── Home.tsx
│       ├── About.tsx
│       └── ...
│
├── contexts/
│   ├── AuthContext.tsx        # ✅ Déjà présent
│   ├── ThemeContext.tsx       # À créer si besoin
│   └── ...
│
├── services/
│   ├── supabase/              # Services Supabase
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── properties.ts
│   │   ├── contracts.ts
│   │   └── ...
│   ├── api/                   # Appels API externes
│   │   ├── intouch.ts
│   │   ├── cryptoneo.ts
│   │   ├── mapbox.ts
│   │   └── ...
│   ├── ai/                    # Services IA
│   │   ├── openai.ts
│   │   ├── gemini.ts
│   │   └── ...
│   └── repositories/          # Repositories (pattern Repository)
│       ├── userRepository.ts
│       ├── propertyRepository.ts
│       └── ...
│
├── hooks/
│   ├── useAuth.ts             # Hook d'authentification
│   ├── useContract.ts         # Hook de contrats
│   ├── useProperty.ts         # Hook de propriétés
│   ├── useFeatureFlag.ts      # Hook de feature flags
│   └── ...
│
├── lib/
│   ├── utils.ts               # Fonctions utilitaires générales
│   ├── formatDate.ts          # Formatteurs de dates
│   ├── formatCurrency.ts      # Formatteurs de devises
│   ├── validation.ts          # Fonctions de validation
│   ├── constants.ts           # Constantes globales
│   └── ...
│
├── types/
│   ├── User.ts                # Types utilisateur
│   ├── Property.ts            # Types propriété
│   ├── Contract.ts            # Types contrat
│   ├── database.types.ts      # Types Supabase générés
│   └── ...
│
├── routes/
│   └── index.tsx              # ✅ Déjà présent
│
└── stores/                    # ✅ Déjà présent (si Zustand/Redux)
```

---

## 📋 Plan de Réorganisation Détaillé

### Phase 1 : Réorganiser `components/`

#### 1.1 Créer les sous-dossiers

```bash
mkdir -p src/components/auth
mkdir -p src/components/layout
mkdir -p src/components/common
mkdir -p src/components/property
mkdir -p src/components/contract
mkdir -p src/components/admin
mkdir -p src/components/profile
```

#### 1.2 Déplacer les composants

**components/auth/** (Authentification)
- `LoginForm.tsx` (à extraire de Auth.tsx)
- `RegisterForm.tsx` (à extraire de Auth.tsx)
- `OTPVerification.tsx` (à extraire de VerifyOTP.tsx)
- `AuthModal.tsx` → `components/auth/`

**components/layout/** (Mise en page)
- `Header.tsx` → `components/layout/`
- `Footer.tsx` → `components/layout/`
- `Layout.tsx` → `components/layout/`
- `Sidebar.tsx` (si existe)

**components/common/** (Communs)
- `FileUpload.tsx` → `components/common/`
- `MapWrapper.tsx` → `components/common/`
- `MapboxMap.tsx` → `components/common/`
- `Chatbot.tsx` → `components/common/`
- `ChatMessage.tsx` → `components/common/`
- `ErrorBoundary.tsx` → `components/common/`
- `LazyImage.tsx` → `components/common/`
- `LanguageSelector.tsx` → `components/common/`
- `ContextualHelp.tsx` → `components/common/`
- `EnhancedSearch.tsx` → `components/common/`

**components/property/** (Propriétés)
- `PropertyCard.tsx` → `components/property/`
- `PropertyFilters.tsx` → `components/property/`
- `PropertyGallery.tsx` → `components/property/`
- `PropertyMap.tsx` → `components/property/`
- `QuickSearch.tsx` → `components/property/`

**components/contract/** (Contrats)
- `ContractPreview.tsx` → `components/contract/`
- `ContractAnnexes.tsx` → `components/contract/`
- `SignatureCanvas.tsx` → `components/contract/`

**components/admin/** (Admin)
- `DashboardExportButton.tsx` → `components/admin/`

**components/profile/** (Profil)
- Garder tel quel (déjà organisé)

**components/ui/** (UI)
- ✅ Déjà conforme, ne pas toucher

**components/charts/** (Graphiques)
- ✅ Déjà conforme, ne pas toucher

---

### Phase 2 : Réorganiser `pages/`

#### 2.1 Créer les sous-dossiers par modules

```bash
mkdir -p src/pages/admin
mkdir -p src/pages/tenant
mkdir -p src/pages/owner
mkdir -p src/pages/trust-agent
mkdir -p src/pages/agency
mkdir -p src/pages/auth
mkdir -p src/pages/public
mkdir -p src/pages/common
```

#### 2.2 Déplacer les pages par module

**pages/admin/** (Administration)
- `AdminDashboard.tsx` → `pages/admin/Dashboard.tsx`
- `AdminUsers.tsx` → `pages/admin/Users.tsx`
- `AdminApiKeys.tsx` → `pages/admin/ApiKeys.tsx`
- `AdminServiceConfiguration.tsx` → `pages/admin/ServiceConfiguration.tsx`
- `AdminServiceMonitoring.tsx` → `pages/admin/ServiceMonitoring.tsx`
- `AdminServiceProviders.tsx` → `pages/admin/ServiceProviders.tsx`
- `AdminFeatureFlags.tsx` → `pages/admin/FeatureFlags.tsx`
- `AdminUserRoles.tsx` → `pages/admin/UserRoles.tsx`
- `AdminTrustAgents.tsx` → `pages/admin/TrustAgents.tsx`
- `AdminCEVManagement.tsx` → `pages/admin/CEVManagement.tsx`
- `AdminTestDataGenerator.tsx` → `pages/admin/TestDataGenerator.tsx`
- `AdminQuickDemo.tsx` → `pages/admin/QuickDemo.tsx`

**pages/tenant/** (Locataire)
- `TenantDashboard.tsx` → `pages/tenant/Dashboard.tsx`
- `SearchProperties.tsx` → `pages/tenant/SearchProperties.tsx`
- `PropertyDetail.tsx` → `pages/tenant/PropertyDetail.tsx`
- `Favorites.tsx` → `pages/tenant/Favorites.tsx`
- `SavedSearches.tsx` → `pages/tenant/SavedSearches.tsx`
- `Recommendations.tsx` → `pages/tenant/Recommendations.tsx`
- `ApplicationForm.tsx` → `pages/tenant/ApplicationForm.tsx`
- `ApplicationDetail.tsx` → `pages/tenant/ApplicationDetail.tsx`
- `MyContracts.tsx` → `pages/tenant/MyContracts.tsx`
- `ContractDetail.tsx` → `pages/tenant/ContractDetail.tsx`
- `ContractDetailEnhanced.tsx` → `pages/tenant/ContractDetailEnhanced.tsx`
- `SignLease.tsx` → `pages/tenant/SignLease.tsx`
- `MakePayment.tsx` → `pages/tenant/MakePayment.tsx`
- `PaymentHistory.tsx` → `pages/tenant/PaymentHistory.tsx`
- `TenantCalendar.tsx` → `pages/tenant/Calendar.tsx`
- `TenantScore.tsx` → `pages/tenant/Score.tsx`
- `TenantDocuments.tsx` → `pages/tenant/Documents.tsx`
- `TenantSupport.tsx` → `pages/tenant/Support.tsx`
- `MyVisits.tsx` → `pages/tenant/MyVisits.tsx`
- `ScheduleVisit.tsx` → `pages/tenant/ScheduleVisit.tsx`

**pages/owner/** (Propriétaire)
- `OwnerDashboard.tsx` → `pages/owner/Dashboard.tsx`
- `AddProperty.tsx` → `pages/owner/AddProperty.tsx`
- `MyProperties.tsx` → `pages/owner/MyProperties.tsx`
- `PropertyApplications.tsx` → `pages/owner/PropertyApplications.tsx`
- `CreateContract.tsx` → `pages/owner/CreateContract.tsx`
- `ContractsList.tsx` → `pages/owner/ContractsList.tsx`
- `OwnerPayments.tsx` → `pages/owner/Payments.tsx`
- `OwnerCalendar.tsx` → `pages/owner/Calendar.tsx`
- `OwnerDocuments.tsx` → `pages/owner/Documents.tsx`
- `OwnerSupport.tsx` → `pages/owner/Support.tsx`

**pages/trust-agent/** (Tiers de Confiance)
- `TrustAgentDashboard.tsx` → `pages/trust-agent/Dashboard.tsx`
- `RequestTrustValidation.tsx` → `pages/trust-agent/RequestValidation.tsx`
- `TrustValidationDetail.tsx` → `pages/trust-agent/ValidationDetail.tsx`
- `TrustAgentCalendar.tsx` → `pages/trust-agent/Calendar.tsx`
- `MediationCases.tsx` → `pages/trust-agent/MediationCases.tsx`
- `MediationDetail.tsx` → `pages/trust-agent/MediationDetail.tsx`

**pages/agency/** (Agence)
- `AgencyDashboard.tsx` → `pages/agency/Dashboard.tsx`
- `AgencyRegistration.tsx` → `pages/agency/Registration.tsx`
- `AgencyProperties.tsx` → `pages/agency/Properties.tsx`
- `AgencyTeam.tsx` → `pages/agency/Team.tsx`
- `AgencyCommissions.tsx` → `pages/agency/Commissions.tsx`

**pages/auth/** (Authentification)
- `Auth.tsx` → `pages/auth/Login.tsx` (ou garder Auth.tsx)
- `VerifyOTP.tsx` → `pages/auth/VerifyOTP.tsx`
- `ForgotPassword.tsx` → `pages/auth/ForgotPassword.tsx`
- `ResetPassword.tsx` → `pages/auth/ResetPassword.tsx`
- `AuthCallback.tsx` → `pages/auth/Callback.tsx`
- `ProfileSelection.tsx` → `pages/auth/ProfileSelection.tsx`
- `IdentityVerification.tsx` → `pages/auth/IdentityVerification.tsx`

**pages/public/** (Public)
- `Home.tsx` → `pages/public/Home.tsx`
- `AboutPage.tsx` → `pages/public/About.tsx`

**pages/common/** (Commun à tous les rôles)
- `Profile.tsx` → `pages/common/Profile.tsx`
- `Messages.tsx` → `pages/common/Messages.tsx`
- `Notifications.tsx` → `pages/common/Notifications.tsx`
- `Settings.tsx` → `pages/common/Settings.tsx`
- `VerificationRequest.tsx` → `pages/common/VerificationRequest.tsx`
- `VerificationSettings.tsx` → `pages/common/VerificationSettings.tsx`
- `MyCertificates.tsx` → `pages/common/MyCertificates.tsx`
- `RequestCEV.tsx` → `pages/common/RequestCEV.tsx`
- `CEVRequestDetail.tsx` → `pages/common/CEVRequestDetail.tsx`
- `CreateDispute.tsx` → `pages/common/CreateDispute.tsx`
- `DisputeDetail.tsx` → `pages/common/DisputeDetail.tsx`
- `DisputesList.tsx` → `pages/common/DisputesList.tsx`

---

### Phase 3 : Réorganiser `services/`

#### 3.1 Créer la structure

```bash
mkdir -p src/services/supabase
mkdir -p src/services/api
mkdir -p src/services/repositories
```

#### 3.2 Déplacer les services

**services/supabase/** (Services Supabase)
- Créer `client.ts` (client Supabase)
- Créer `auth.ts` (authentification)
- Créer `properties.ts` (propriétés)
- Créer `contracts.ts` (contrats)
- Créer `users.ts` (utilisateurs)

**services/api/** (API externes)
- `providers/intouch.ts` → `api/intouch.ts`
- `providers/cryptoneo.ts` → `api/cryptoneo.ts`
- `providers/mapbox.ts` → `api/mapbox.ts`
- `providers/resend.ts` → `api/resend.ts`
- `providers/brevo.ts` → `api/brevo.ts`

**services/repositories/** (Repositories)
- `api/repositories/userRepository.ts` → `repositories/userRepository.ts`
- `api/repositories/propertyRepository.ts` → `repositories/propertyRepository.ts`

**services/** (Racine - services métier)
- Garder `ai/`, `azure/`, `contracts/`, `format/`, `upload/`, `validation/`

---

### Phase 4 : Nettoyer et Fusionner

#### 4.1 Fusionner `config/` dans `lib/`

```bash
mv src/config/* src/lib/
rmdir src/config
```

#### 4.2 Réorganiser `lib/`

**lib/** (Utilitaires)
- `lib/supabase.ts` → `services/supabase/client.ts`
- `lib/constants/*` → `lib/constants.ts` (fusionner)
- `lib/helpers/*` → `lib/utils.ts` (fusionner)

---

## 🔄 Mise à Jour des Imports

### Exemples de changements

**Avant :**
```typescript
import { Header } from '../components/Header';
import { PropertyCard } from '../components/PropertyCard';
import { TenantDashboard } from '../pages/TenantDashboard';
```

**Après :**
```typescript
import { Header } from '@/components/layout/Header';
import { PropertyCard } from '@/components/property/PropertyCard';
import { TenantDashboard } from '@/pages/tenant/Dashboard';
```

---

## ✅ Avantages de la Nouvelle Structure

1. **Clarté** : Chaque fichier a sa place logique
2. **Scalabilité** : Facile d'ajouter de nouveaux modules
3. **Maintenabilité** : Structure prévisible et cohérente
4. **Collaboration** : Équipe peut travailler sur des modules séparés
5. **Performance** : Meilleur code splitting par module

---

## 📊 Estimation

**Fichiers à déplacer :** ~130 fichiers  
**Imports à mettre à jour :** ~500+ imports  
**Temps estimé :** 4-6 heures

---

## ⚠️ Risques et Précautions

1. **Imports cassés** : Tous les imports doivent être mis à jour
2. **Routes** : Le fichier `routes/index.tsx` doit être mis à jour
3. **Tests** : Les tests doivent être adaptés
4. **Build** : Vérifier que le build fonctionne après chaque phase

---

## 🚀 Prochaines Étapes

1. ✅ Valider ce plan avec vous
2. 🔄 Créer les dossiers
3. 🔄 Déplacer les fichiers par phase
4. 🔄 Mettre à jour les imports
5. 🔄 Tester le build
6. 🔄 Committer les changements

---

**Voulez-vous que je commence la réorganisation ?**

---

**Document créé par Manus AI - 21 novembre 2025**  
**Version 1.0 - Plan de Réorganisation Structure**

