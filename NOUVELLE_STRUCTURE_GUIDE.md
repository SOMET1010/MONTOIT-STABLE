# 🎯 Guide Rapide - Nouvelle Structure Mon Toit

## 🚀 Démarrage Ultra-Rapide (2 minutes)

### 1. Accéder à la Configuration des Clés API

```typescript
import { apiKeysConfig } from '@config';

// ✅ Toutes les clés sont ici !
const supabaseUrl = apiKeysConfig.supabase.url;
const azureKey = apiKeysConfig.azure.openai.key;
const mapboxToken = apiKeysConfig.maps.mapbox.key;
```

### 2. Vérifier Quels Services Sont Configurés

```typescript
import { apiKeysConfig } from '@config';

// Afficher le statut dans la console
apiKeysConfig.logConfiguration();

// Ou vérifier programmatiquement
if (apiKeysConfig.azure.openai.isConfigured) {
  console.log('✅ Chatbot disponible');
} else {
  console.log('⚠️ Chatbot indisponible - Azure OpenAI non configuré');
}
```

### 3. Utiliser les Nouveaux Imports

```typescript
// ✅ NOUVEAU - Simple et propre
import { Button } from '@components/ui';
import { supabase } from '@lib';
import { ROUTES } from '@config';
import { useAuth } from '@hooks/auth';

// ❌ ANCIEN - Chemins relatifs complexes
import { Button } from '../../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';
```

## 📂 Où Trouver Quoi ?

| Ce que je cherche | Où c'est maintenant |
|-------------------|---------------------|
| Clés API | `src/config/api-keys.config.ts` |
| Routes | `src/config/routes.config.ts` |
| Constantes app | `src/lib/constants/app.constants.ts` |
| Composants UI | `src/components/ui/` |
| Pages Admin | `src/pages/admin/` |
| Services paiement | `src/services/payment/` |
| Hooks auth | `src/hooks/auth/` |
| Utilitaires | `src/lib/helpers/` |

## 🔑 Les 15 Services Configurés

### Obligatoire
- ✅ **Supabase** - Base de données

### Optionnels
- **Azure OpenAI** - Chatbot SUTA
- **Azure AI Services** - Vision, OCR
- **Azure Speech** - Recherche vocale
- **Mapbox** - Cartes interactives
- **Google Maps** - Alternative cartes
- **IN TOUCH** - Mobile Money (Orange, MTN, Moov, Wave)
- **NeoFace** - Vérification faciale
- **Smileless** - Vérification faciale (fallback)
- **Smile ID** - Vérification d'identité
- **CryptoNeo** - Signature électronique
- **Resend** - Emails transactionnels
- **Brevo** - SMS
- **Gemini** - LLM alternatif
- **DeepSeek** - LLM alternatif

## 📖 Documentation Complète

| Document | Contenu | Taille |
|----------|---------|--------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture complète du projet | 8 KB |
| [API_KEYS_REFERENCE.md](./API_KEYS_REFERENCE.md) | Guide de toutes les clés API | 15 KB |
| [RESTRUCTURATION_COMPLETE.md](./RESTRUCTURATION_COMPLETE.md) | Rapport de restructuration | 12 KB |
| [src/config/README.md](./src/config/README.md) | Guide de la configuration | 2 KB |

## ⚡ Exemples Pratiques

### Utiliser une Clé API

```typescript
import { apiKeysConfig } from '@config';

// Vérifier avant d'utiliser
if (apiKeysConfig.payment.inTouch.isConfigured) {
  const baseUrl = apiKeysConfig.payment.inTouch.baseUrl;
  const username = apiKeysConfig.payment.inTouch.username;
  // Faire le paiement...
}
```

### Naviguer avec les Routes

```typescript
import { ROUTES, getPropertyDetailRoute } from '@config';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Routes statiques
navigate(ROUTES.TENANT.DASHBOARD);
navigate(ROUTES.ADMIN.API_KEYS);

// Routes dynamiques
const propertyUrl = getPropertyDetailRoute(propertyId);
navigate(propertyUrl);
```

### Valider la Configuration

```typescript
import { apiKeysConfig } from '@config';

const validation = apiKeysConfig.validateConfiguration();

if (!validation.isValid) {
  console.error('❌ Configuration invalide');
  console.error('Services manquants:', validation.missing);
}

if (validation.warnings.length > 0) {
  console.warn('⚠️ Avertissements:', validation.warnings);
}
```

## 🛠️ Commandes Utiles

```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build

# Tests
npm run test

# Linter
npm run lint

# Format
npm run format
```

## 🔍 Debugging

### Problème : "Service non configuré"

```typescript
// 1. Vérifier dans la console
apiKeysConfig.logConfiguration();

// 2. Vérifier le fichier .env
// Les variables doivent être présentes

// 3. Utiliser .env.example comme référence
// Copiez .env.example → .env et remplissez les valeurs
```

### Problème : "Import non trouvé"

```typescript
// ❌ Mauvais
import { Button } from '../../../components/ui/Button';

// ✅ Correct
import { Button } from '@components/ui';
```

## 📝 Checklist de Migration

Pour migrer un ancien fichier :

- [ ] Remplacer `import.meta.env.VITE_XXX` par `apiKeysConfig.xxx`
- [ ] Remplacer les chemins relatifs par des alias (@config, @components, etc.)
- [ ] Mettre à jour les imports de constantes vers `@lib/constants`
- [ ] Tester le build avec `npm run build`

## 🎓 Bonnes Pratiques

### ✅ À FAIRE

```typescript
// Utiliser apiKeysConfig
const key = apiKeysConfig.azure.openai.key;

// Vérifier la configuration
if (apiKeysConfig.azure.openai.isConfigured) {
  // Utiliser le service
}

// Utiliser les alias
import { Button } from '@components/ui';

// Utiliser les routes configurées
navigate(ROUTES.TENANT.DASHBOARD);
```

### ❌ À ÉVITER

```typescript
// Accès direct aux variables d'environnement
const key = import.meta.env.VITE_AZURE_OPENAI_API_KEY;

// Chemins relatifs
import { Button } from '../../../../components/ui/Button';

// Routes en dur
navigate('/dashboard/locataire');

// Commiter le fichier .env
git add .env  // ❌ JAMAIS !
```

## 🆘 Aide

- **Questions** : support@montoit.ci
- **Documentation** : Voir les fichiers MD à la racine
- **Exemples** : Consulter les fichiers dans `src/config/`

---

**Astuce** : Pour voir tous les services disponibles, lancez l'application et regardez la console. Le statut de chaque service s'affichera automatiquement !
