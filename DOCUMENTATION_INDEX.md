# 📚 Index de la Documentation Mon Toit

> Guide complet pour naviguer dans toute la documentation du projet

## 🚀 Par Où Commencer ?

### Vous êtes nouveau sur le projet ?
1. 👉 **[README_NOUVELLE_STRUCTURE.md](./README_NOUVELLE_STRUCTURE.md)** (5 min)
   - Vue d'ensemble des changements
   - Quick start en 30 secondes
   - Exemples pratiques

2. 👉 **[NOUVELLE_STRUCTURE_GUIDE.md](./NOUVELLE_STRUCTURE_GUIDE.md)** (5 min)
   - Guide ultra-pratique
   - Exemples de code
   - Debugging et bonnes pratiques

### Vous migrez du code existant ?
1. **[FICHIERS_RESTRUCTURATION.md](./FICHIERS_RESTRUCTURATION.md)** (5 min)
   - Liste complète des fichiers modifiés
   - Fichiers déplacés
   - Checklist de migration

2. **[NOUVELLE_STRUCTURE_GUIDE.md](./NOUVELLE_STRUCTURE_GUIDE.md)** (5 min)
   - Section "Migration d'Ancien Code"
   - Exemples avant/après

### Vous configurez les services externes ?
1. **[API_KEYS_REFERENCE.md](./API_KEYS_REFERENCE.md)** (10 min)
   - Guide exhaustif de toutes les clés API
   - Variables d'environnement
   - Exemples pour chaque service

2. **`.env.example`**
   - Template de configuration
   - Toutes les variables documentées

## 📖 Documentation Complète

### 🎯 Guides Pratiques (Débutant)

| Document | Objectif | Temps | Priorité |
|----------|----------|-------|----------|
| [README_NOUVELLE_STRUCTURE.md](./README_NOUVELLE_STRUCTURE.md) | Vue d'ensemble | 5 min | ⭐⭐⭐⭐⭐ |
| [NOUVELLE_STRUCTURE_GUIDE.md](./NOUVELLE_STRUCTURE_GUIDE.md) | Guide pratique | 5 min | ⭐⭐⭐⭐⭐ |
| [.env.example](./.env.example) | Configuration env | 3 min | ⭐⭐⭐⭐⭐ |

### 🔧 Références Techniques (Intermédiaire)

| Document | Objectif | Temps | Priorité |
|----------|----------|-------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture complète | 15 min | ⭐⭐⭐⭐ |
| [API_KEYS_REFERENCE.md](./API_KEYS_REFERENCE.md) | Référence des API | 10 min | ⭐⭐⭐⭐ |
| [src/config/README.md](./src/config/README.md) | Config centralisée | 5 min | ⭐⭐⭐⭐ |
| [FICHIERS_RESTRUCTURATION.md](./FICHIERS_RESTRUCTURATION.md) | Fichiers modifiés | 5 min | ⭐⭐⭐ |

### 📊 Rapports et Historique (Avancé)

| Document | Objectif | Temps | Priorité |
|----------|----------|-------|----------|
| [RESTRUCTURATION_COMPLETE.md](./RESTRUCTURATION_COMPLETE.md) | Rapport complet | 10 min | ⭐⭐⭐ |
| [CHANGELOG.md](./CHANGELOG.md) | Historique versions | 5 min | ⭐⭐ |
| [README.md](./README.md) | README principal | 10 min | ⭐⭐⭐ |

### 🎓 Documentation Technique Détaillée

| Document | Objectif | Temps | Public |
|----------|----------|-------|--------|
| [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) | Architecture composants | 15 min | Développeurs |
| [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) | Quick start dev | 10 min | Développeurs |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Checklist déploiement | 10 min | DevOps |

## 🎯 Documentation par Cas d'Usage

### 🆕 Je veux démarrer rapidement
```
1. README_NOUVELLE_STRUCTURE.md (5 min)
2. .env.example → copier en .env
3. npm install && npm run dev
```

### 🔑 Je veux configurer les API
```
1. .env.example (3 min)
2. API_KEYS_REFERENCE.md (10 min)
3. src/config/README.md (5 min)
```

### 🏗️ Je veux comprendre l'architecture
```
1. ARCHITECTURE.md (15 min)
2. COMPONENT_ARCHITECTURE.md (15 min)
3. src/config/README.md (5 min)
```

### 🔄 Je veux migrer mon code
```
1. FICHIERS_RESTRUCTURATION.md (5 min)
2. NOUVELLE_STRUCTURE_GUIDE.md (5 min)
3. Exemples dans API_KEYS_REFERENCE.md
```

### 🐛 Je veux debugger
```
1. NOUVELLE_STRUCTURE_GUIDE.md - Section Debugging
2. API_KEYS_REFERENCE.md - Section Validation
3. Console au démarrage (apiKeysConfig.logConfiguration())
```

## 📁 Structure de la Documentation

```
Documentation/
├── Quick Start/
│   ├── README_NOUVELLE_STRUCTURE.md    ← Commencer ici
│   ├── NOUVELLE_STRUCTURE_GUIDE.md     ← Guide pratique
│   └── .env.example                     ← Configuration
│
├── Références/
│   ├── ARCHITECTURE.md                  ← Architecture
│   ├── API_KEYS_REFERENCE.md           ← Clés API
│   ├── FICHIERS_RESTRUCTURATION.md     ← Fichiers
│   └── src/config/README.md            ← Config
│
├── Rapports/
│   ├── RESTRUCTURATION_COMPLETE.md     ← Rapport complet
│   ├── CHANGELOG.md                     ← Versions
│   └── README.md                        ← README principal
│
└── Technique/
    ├── COMPONENT_ARCHITECTURE.md        ← Composants
    ├── DEVELOPER_QUICK_START.md         ← Dev start
    └── DEPLOYMENT_CHECKLIST.md          ← Déploiement
```

## 🔍 Recherche Rapide

### Comment faire pour... ?

| Question | Document | Section |
|----------|----------|---------|
| Utiliser une clé API ? | API_KEYS_REFERENCE.md | Service concerné |
| Importer un composant ? | NOUVELLE_STRUCTURE_GUIDE.md | Imports |
| Naviguer vers une page ? | NOUVELLE_STRUCTURE_GUIDE.md | Routes |
| Vérifier la config ? | NOUVELLE_STRUCTURE_GUIDE.md | Validation |
| Comprendre la structure ? | ARCHITECTURE.md | Structure des dossiers |
| Migrer mon code ? | FICHIERS_RESTRUCTURATION.md | Migration |
| Configurer un service ? | API_KEYS_REFERENCE.md | Service concerné |
| Debugger un problème ? | NOUVELLE_STRUCTURE_GUIDE.md | Debugging |

## 💡 Raccourcis Utiles

### Configuration
```typescript
// Voir tous les services
import { apiKeysConfig } from '@config';
apiKeysConfig.logConfiguration();

// Valider la config
const validation = apiKeysConfig.validateConfiguration();
console.log(validation);
```

### Imports
```typescript
// Imports avec alias
import { Button } from '@components/ui';
import { ROUTES } from '@config';
import { supabase } from '@lib';
```

### Routes
```typescript
import { ROUTES, getPropertyDetailRoute } from '@config';

// Statique
navigate(ROUTES.TENANT.DASHBOARD);

// Dynamique
navigate(getPropertyDetailRoute(id));
```

## 🆘 Support

### Besoin d'aide ?

1. **Cherchez dans ce document** - Index complet
2. **Consultez les guides** - Documentation détaillée
3. **Vérifiez la config** - `apiKeysConfig.logConfiguration()`
4. **Contactez le support** - support@montoit.ci

### Ressources Externes

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)

## 📝 Contribution

Pour contribuer à la documentation :

1. Respectez la structure existante
2. Utilisez un langage clair et simple
3. Ajoutez des exemples pratiques
4. Mettez à jour cet index si nécessaire

## ✅ Checklist Documentation

Avant de démarrer le développement :

- [ ] Lu README_NOUVELLE_STRUCTURE.md
- [ ] Configuré .env avec les clés API
- [ ] Compris la structure des dossiers (ARCHITECTURE.md)
- [ ] Testé `npm run dev` et vérifié la console
- [ ] Consulté API_KEYS_REFERENCE.md pour les services

Avant de déployer :

- [ ] Relu DEPLOYMENT_CHECKLIST.md
- [ ] Vérifié toutes les variables d'environnement
- [ ] Testé le build (`npm run build`)
- [ ] Validé la configuration en production

---

**Dernière mise à jour** : 14 Novembre 2025
**Version du projet** : 3.2.0
**Nombre de documents** : 15+

💡 **Astuce** : Marquez ce fichier pour retrouver rapidement toute la documentation !
