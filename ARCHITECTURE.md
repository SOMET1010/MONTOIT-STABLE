# Architecture du Projet Mon Toit

## 📋 Vue d'Ensemble

Mon Toit est une plateforme de location immobilière sécurisée en Côte d'Ivoire construite avec React, TypeScript, Vite, et Supabase. Ce document décrit l'architecture du projet après la restructuration complète selon les meilleures pratiques React.

## 🏗️ Structure des Dossiers

```
src/
├── config/                    # Configuration centralisée
│   ├── api-keys.config.ts    # Toutes les clés API
│   ├── app.config.ts         # Configuration application
│   ├── env.config.ts         # Variables d'environnement
│   ├── routes.config.ts      # Routes de l'application
│   └── index.ts              # Export centralisé
│
├── components/                # Composants réutilisables
│   ├── ui/                   # Composants UI de base (Button, Input, etc.)
│   ├── auth/                 # Composants d'authentification
│   ├── property/             # Composants liés aux propriétés
│   ├── payment/              # Composants de paiement
│   ├── admin/                # Composants d'administration
│   ├── shared/               # Composants partagés (Header, Footer, Layout)
│   ├── profile/              # Composants de profil
│   ├── verification/         # Composants de vérification
│   └── charts/               # Composants de graphiques
│
├── pages/                     # Vues principales de l'application
│   ├── admin/                # Pages d'administration
│   ├── tenant/               # Pages du locataire
│   ├── owner/                # Pages du propriétaire
│   ├── agency/               # Pages de l'agence
│   ├── marketplace/          # Pages publiques (Home, Search, etc.)
│   └── common/               # Pages communes (Auth, Profile, Messages)
│
├── services/                  # Logique métier et appels API
│   ├── api/                  # Repositories et client API
│   ├── payment/              # Services de paiement
│   ├── ai/                   # Services IA (Azure, Gemini, DeepSeek)
│   ├── verification/         # Services de vérification
│   ├── signature/            # Signature électronique
│   ├── storage/              # Gestion des fichiers
│   └── notification/         # Emails et SMS
│
├── hooks/                     # Hooks React personnalisés
│   ├── auth/                 # Hooks d'authentification
│   ├── properties/           # Hooks pour les propriétés
│   ├── payment/              # Hooks de paiement
│   └── messaging/            # Hooks de messagerie
│
├── contexts/                  # Contextes React globaux
│   └── AuthContext.tsx
│
├── stores/                    # État global (Zustand)
│   ├── authStore.ts
│   ├── paymentStore.ts
│   └── uiStore.ts
│
├── lib/                       # Utilitaires et helpers
│   ├── constants/            # Constantes de l'application
│   ├── format/               # Fonctions de formatage
│   ├── validation/           # Fonctions de validation
│   ├── helpers/              # Fonctions utilitaires
│   ├── supabase.ts          # Client Supabase
│   └── database.types.ts    # Types Supabase
│
├── types/                     # Définitions TypeScript
│   ├── index.ts             # Types généraux
│   └── payment.types.ts     # Types de paiement
│
├── routes/                    # Configuration du routage
│   └── index.tsx
│
├── App.tsx                    # Composant racine
├── main.tsx                   # Point d'entrée
└── index.css                  # Styles globaux
```

## 🎯 Principes Architecturaux

### 1. Séparation des Préoccupations

- **Composants** : Présentation uniquement
- **Services** : Logique métier et appels API
- **Hooks** : Logique React réutilisable
- **Lib** : Utilitaires purs sans dépendances React

### 2. Configuration Centralisée

Toutes les configurations et clés API sont centralisées dans `src/config/` :

```typescript
import { apiKeysConfig } from '@config';

// Accès aux clés
const supabaseUrl = apiKeysConfig.supabase.url;

// Vérification de disponibilité
if (apiKeysConfig.azure.openai.isConfigured) {
  // Utiliser le service
}
```

### 3. Alias de Chemins

Les imports sont simplifiés avec des alias TypeScript :

```typescript
// ✅ Avec alias
import { Button } from '@components/ui';
import { apiKeysConfig } from '@config';
import { useAuth } from '@hooks/auth';

// ❌ Sans alias (ancien)
import { Button } from '../../../../components/ui/Button';
```

### 4. Organisation Modulaire

Les pages sont organisées par modules utilisateur :

- `pages/admin/` - Administration
- `pages/tenant/` - Locataire
- `pages/owner/` - Propriétaire
- `pages/agency/` - Agence
- `pages/marketplace/` - Public
- `pages/common/` - Partagées

## 🔧 Services Externes

### Configuration des Clés API

Toutes les clés API sont gérées dans `src/config/api-keys.config.ts` :

#### Services Obligatoires
- **Supabase** : Base de données et authentification

#### Services Optionnels
- **Azure OpenAI** : Chatbot IA
- **Azure AI Services** : Vision, Speech, Traduction
- **Mapbox** : Cartes interactives
- **Google Maps** : Alternative pour les cartes
- **IN TOUCH** : Paiements Mobile Money (Orange, MTN, Moov, Wave)
- **NeoFace/Smileless** : Vérification faciale biométrique
- **CryptoNeo** : Signature électronique légale
- **Resend** : Service d'emails transactionnels
- **Brevo** : Service SMS
- **Gemini** : LLM alternatif de Google
- **DeepSeek** : LLM alternatif

### Validation de Configuration

Au démarrage, la configuration est automatiquement validée :

```typescript
const validation = apiKeysConfig.validateConfiguration();

if (!validation.isValid) {
  console.error('Configuration invalide:', validation.missing);
}

// Afficher le statut de tous les services
apiKeysConfig.logConfiguration();
```

## 🗺️ Routage

Les routes sont définies dans `src/config/routes.config.ts` :

```typescript
import { ROUTES, getPropertyDetailRoute } from '@config';

// Routes statiques
<Link to={ROUTES.TENANT.DASHBOARD}>Dashboard</Link>

// Routes dynamiques
const url = getPropertyDetailRoute(propertyId);
navigate(url);
```

## 🎨 Composants UI

La bibliothèque UI est dans `src/components/ui/` :

- `Button.tsx` - Boutons avec variantes
- `Input.tsx` - Champs de formulaire
- `Modal.tsx` - Modales
- `Card.tsx` - Cartes
- `Tabs.tsx` - Onglets

## 📊 Gestion d'État

### Contextes React
- `AuthContext` - Authentification utilisateur

### Stores Zustand
- `authStore` - État d'authentification
- `paymentStore` - État des paiements
- `uiStore` - État de l'interface

## 🔐 Sécurité

### Clés API
- Jamais commitées dans le code
- Stockées dans `.env`
- Accédées via `apiKeysConfig`

### Authentification
- Gérée par Supabase
- JWT dans les headers
- Sessions persistantes

### Paiements
- Validés côté serveur
- Webhook pour confirmation
- Logs de toutes les transactions

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage

# Tests UI
npm run test:ui
```

## 🚀 Déploiement

```bash
# Build de production
npm run build

# Aperçu du build
npm run preview
```

## 📝 Conventions de Code

### Nommage
- **Composants** : PascalCase (`UserProfile.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.ts`)
- **Services** : camelCase avec suffixe `Service` (`paymentService.ts`)
- **Types** : PascalCase (`UserProfile`, `PropertyDetails`)
- **Constants** : UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Organisation des Fichiers
- Un composant par fichier
- Co-localiser les types avec leur utilisation
- Grouper les fonctionnalités liées

### Imports
- Utiliser les alias (`@config`, `@components`, etc.)
- Grouper les imports par catégorie
- Ordre : externes, internes, types

```typescript
// ✅ Bon
import React from 'react';
import { Button } from '@components/ui';
import { apiKeysConfig } from '@config';
import type { User } from '@types';

// ❌ Mauvais
import { Button } from '../../../components/ui/Button';
import type { User } from '../../../types';
```

## 🔄 Migration

Pour migrer un fichier existant :

1. Identifier les imports à mettre à jour
2. Remplacer les chemins relatifs par des alias
3. Utiliser `apiKeysConfig` pour les clés API
4. Utiliser `ROUTES` pour les routes
5. Tester le build

## 📚 Ressources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🤝 Contribution

1. Respecter la structure des dossiers
2. Utiliser les alias de chemins
3. Documenter les nouvelles fonctionnalités
4. Ajouter des tests pour les nouveaux services
5. Valider avec `npm run build` avant commit

## 📞 Support

- Email: support@montoit.ci
- Documentation: [README.md](./README.md)
- Config: [src/config/README.md](./src/config/README.md)
