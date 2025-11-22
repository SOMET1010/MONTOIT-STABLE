# Charte de Développement - Mon Toit

**Version :** 1.0  
**Date :** 22 novembre 2025  
**Projet :** Mon Toit - Plateforme Immobilière  
**Auteur :** Manus AI

---

## Introduction

Cette charte définit les standards de développement, les bonnes pratiques et les conventions à respecter pour tous les développeurs travaillant sur le projet Mon Toit. Elle vise à garantir la cohérence, la qualité et la maintenabilité du code.

**Tous les membres de l'équipe doivent lire et respecter cette charte.**

---

## 1. Architecture et Organisation du Code

### 1.1 Principes Fondamentaux

Le projet Mon Toit suit une **architecture feature-based** conforme aux standards ANSUT/DTDI. Chaque domaine métier (feature) est isolé et auto-contenu.

**Règles d'or :**

1. **Une feature = un domaine métier** : Chaque feature représente un domaine fonctionnel distinct (auth, property, contract, etc.)
2. **Isolation stricte** : Les features ne doivent pas accéder directement aux fichiers internes d'autres features
3. **Exports contrôlés** : Seuls les exports dans `index.ts` sont publics
4. **Shared pour le générique** : Seuls les composants et hooks réellement réutilisables vont dans `shared/`

### 1.2 Structure des Répertoires

```
src/
├── app/                    # Configuration globale
│   ├── layout/            # Header, Footer, Sidebar
│   ├── providers/         # AuthProvider, ThemeProvider
│   └── routes.tsx         # Routage centralisé
│
├── features/              # Domaines métier
│   └── [nom-feature]/
│       ├── pages/         # Pages React
│       ├── components/    # Composants spécifiques
│       ├── hooks/         # Hooks métier
│       ├── services/      # Services API (*.api.ts)
│       ├── types.ts       # Types TypeScript
│       └── index.ts       # Exports publics
│
├── shared/               # Ressources partagées
│   ├── ui/              # Composants UI génériques
│   ├── hooks/           # Hooks génériques
│   ├── lib/             # Utilitaires
│   ├── types/           # Types globaux
│   └── config/          # Configuration
│
├── services/            # Services externes
│   ├── supabase/       # Client Supabase
│   ├── azure/          # Services Azure
│   └── api/            # Autres APIs
│
└── store/              # État global (si nécessaire)
```

### 1.3 Quand Créer une Nouvelle Feature ?

**Créer une feature si :**
- ✅ C'est un domaine métier distinct (ex: facturation, reporting)
- ✅ Ça a ses propres pages et composants
- ✅ Ça peut évoluer indépendamment
- ✅ Plusieurs développeurs peuvent y travailler en parallèle

**Ne PAS créer de feature si :**
- ❌ C'est juste un composant UI réutilisable → `shared/ui/`
- ❌ C'est une fonctionnalité mineure d'une feature existante
- ❌ Ça n'a pas de logique métier propre

---

## 2. Conventions de Nommage

### 2.1 Fichiers et Répertoires

| Type | Convention | Exemple |
|------|------------|---------|
| Composants React | PascalCase.tsx | `PropertyCard.tsx` |
| Pages React | PascalCase + Page.tsx | `PropertyDetailPage.tsx` |
| Hooks | camelCase + use prefix | `usePropertyManagement.ts` |
| Services API | camelCase + .api.ts | `property.api.ts` |
| Types | PascalCase + types.ts | `types.ts` (dans feature) |
| Utilitaires | camelCase.ts | `formatPrice.ts` |
| Constantes | UPPER_SNAKE_CASE.ts | `API_ENDPOINTS.ts` |
| Répertoires features | kebab-case | `trust-agent/` |

### 2.2 Variables et Fonctions

```typescript
// ✅ BON
const propertyList = [...];
const isVerified = true;
const userCount = 42;

function calculateTotalPrice(basePrice: number, tax: number): number {
  return basePrice + tax;
}

// ❌ MAUVAIS
const PropertyList = [...];  // Variable en PascalCase
const verified = true;       // Manque le préfixe "is"
const cnt = 42;             // Nom trop court

function calc(a: number, b: number): number {  // Nom peu explicite
  return a + b;
}
```

### 2.3 Types et Interfaces

```typescript
// ✅ BON
interface Property {
  id: string;
  title: string;
  price: number;
}

type PropertyStatus = 'available' | 'rented' | 'sold';

// ❌ MAUVAIS
interface property {  // Minuscule
  id: string;
}

type Status = string;  // Trop générique
```

---

## 3. Standards TypeScript

### 3.1 Typage Strict

**TOUJOURS typer explicitement :**

```typescript
// ✅ BON
function getProperty(id: string): Promise<Property> {
  return propertyApi.getById(id);
}

const properties: Property[] = [];
const count: number = properties.length;

// ❌ MAUVAIS
function getProperty(id: any): any {  // any interdit
  return propertyApi.getById(id);
}

const properties = [];  // Type implicite
```

### 3.2 Interfaces vs Types

**Utiliser `interface` pour :**
- Les objets et leurs propriétés
- Les contrats de composants (props)

**Utiliser `type` pour :**
- Les unions et intersections
- Les types primitifs étendus
- Les types utilitaires

```typescript
// Interface pour les objets
interface PropertyProps {
  property: Property;
  onSelect: (id: string) => void;
}

// Type pour les unions
type PropertyStatus = 'available' | 'rented' | 'sold';
type ApiResponse<T> = { data: T } | { error: string };
```

### 3.3 Types Génériques

```typescript
// ✅ BON
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  // ...
}

// Utilisation
const response = await fetchData<Property>('/api/properties/123');
```

---

## 4. Imports et Exports

### 4.1 Imports Absolus Obligatoires

**TOUJOURS utiliser les imports absolus avec `@/` :**

```typescript
// ✅ BON
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/app/providers/AuthProvider';
import { PropertyCard } from '@/features/property';

// ❌ MAUVAIS
import { Button } from '../../../shared/ui/Button';
import { useAuth } from '../../providers/AuthProvider';
```

### 4.2 Organisation des Imports

**Ordre des imports :**

1. Bibliothèques externes (React, etc.)
2. Imports absolus internes (`@/`)
3. Imports relatifs (si vraiment nécessaire)
4. Styles CSS

```typescript
// 1. Bibliothèques externes
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Imports absolus internes
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/app/providers/AuthProvider';
import { propertyApi } from '@/features/property/services/property.api';

// 3. Types
import type { Property } from '@/features/property/types';

// 4. Styles
import './PropertyCard.css';
```

### 4.3 Exports dans index.ts

**Chaque feature DOIT avoir un `index.ts` qui exporte uniquement l'API publique :**

```typescript
// features/property/index.ts

// Pages
export { default as PropertyDetailPage } from './pages/PropertyDetailPage';
export { default as AddPropertyPage } from './pages/AddPropertyPage';

// Composants publics
export { PropertyCard } from './components/PropertyCard';
export { PropertyFilters } from './components/PropertyFilters';

// Hooks publics
export { usePropertyManagement } from './hooks/usePropertyManagement';

// Types publics
export type { Property, PropertyFilters } from './types';
```

**Ne PAS exporter :**
- Les composants internes utilisés uniquement dans la feature
- Les utilitaires privés
- Les constantes internes

---

## 5. Composants React

### 5.1 Structure d'un Composant

```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import type { Property } from '../types';

// 1. Interface des props
interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
  className?: string;
}

// 2. Composant
export function PropertyCard({ property, onSelect, className = '' }: PropertyCardProps) {
  // 3. Hooks
  const [isHovered, setIsHovered] = useState(false);

  // 4. Effets
  useEffect(() => {
    // ...
  }, [property.id]);

  // 5. Handlers
  const handleClick = () => {
    onSelect(property.id);
  };

  // 6. Rendu
  return (
    <div 
      className={`property-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3>{property.title}</h3>
      <p>{property.price} FCFA</p>
      <Button onClick={handleClick}>Voir détails</Button>
    </div>
  );
}
```

### 5.2 Props et Valeurs par Défaut

```typescript
// ✅ BON - Valeurs par défaut dans la destructuration
function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false 
}: ButtonProps) {
  // ...
}

// ❌ MAUVAIS - Valeurs par défaut dans le composant
function Button({ variant, size, disabled }: ButtonProps) {
  const finalVariant = variant || 'primary';  // Non
  // ...
}
```

### 5.3 Composition vs Héritage

**Privilégier la composition :**

```typescript
// ✅ BON - Composition
function PropertyCard({ property, children }: PropertyCardProps) {
  return (
    <Card>
      <CardHeader title={property.title} />
      <CardBody>
        {children}
      </CardBody>
    </Card>
  );
}

// ❌ MAUVAIS - Héritage
class PropertyCard extends Card {
  // ...
}
```

---

## 6. Hooks

### 6.1 Hooks Personnalisés

**Règles :**
- Toujours préfixer par `use`
- Respecter les règles des hooks React
- Un hook = une responsabilité

```typescript
// ✅ BON
export function usePropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    propertyApi.getAll()
      .then(setProperties)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addProperty = async (data: PropertyData) => {
    const newProperty = await propertyApi.create(data);
    setProperties(prev => [...prev, newProperty]);
  };

  return { properties, loading, error, addProperty };
}
```

### 6.2 Hooks Génériques vs Métier

**Hooks génériques → `shared/hooks/` :**
- `useDebounce`
- `useLocalStorage`
- `useMediaQuery`
- `useClickOutside`

**Hooks métier → `features/[feature]/hooks/` :**
- `usePropertyManagement`
- `useContractActions`
- `usePaymentProcessing`

---

## 7. Services et API

### 7.1 Structure d'un Service

**Chaque feature doit avoir ses services dans `services/[nom].api.ts` :**

```typescript
// features/property/services/property.api.ts
import { supabase } from '@/services/supabase/client';
import type { Property, PropertyData, PropertyFilters } from '../types';

export const propertyApi = {
  /**
   * Récupère toutes les propriétés
   */
  getAll: async (filters?: PropertyFilters): Promise<Property[]> => {
    let query = supabase.from('properties').select('*');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.priceRange) {
      query = query
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Récupère une propriété par ID
   */
  getById: async (id: string): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crée une nouvelle propriété
   */
  create: async (propertyData: PropertyData): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Met à jour une propriété
   */
  update: async (id: string, propertyData: Partial<PropertyData>): Promise<Property> => {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Supprime une propriété
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
```

### 7.2 Gestion des Erreurs

```typescript
// ✅ BON - Gestion explicite des erreurs
try {
  const property = await propertyApi.getById(id);
  setProperty(property);
} catch (error) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('Une erreur est survenue');
  }
}

// ❌ MAUVAIS - Pas de gestion d'erreur
const property = await propertyApi.getById(id);
setProperty(property);
```

---

## 8. État et Gestion des Données

### 8.1 État Local vs Global

**État local (useState) pour :**
- État UI (ouvert/fermé, actif/inactif)
- Formulaires
- Données temporaires

**État global (Context/Store) pour :**
- Authentification
- Préférences utilisateur
- Données partagées entre features

```typescript
// État local
function PropertyCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  // ...
}

// État global
function Header() {
  const { user, signOut } = useAuth();  // Context
  // ...
}
```

### 8.2 Optimisation des Re-renders

```typescript
// ✅ BON - Mémoïsation
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ MAUVAIS - Recalcul à chaque render
const expensiveValue = calculateExpensiveValue(data);

const handleClick = () => {
  doSomething(id);
};
```

---

## 9. Styles et CSS

### 9.1 Tailwind CSS

**Utiliser Tailwind en priorité :**

```tsx
// ✅ BON
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
  <Button className="bg-indigo-600 hover:bg-indigo-700">Action</Button>
</div>
```

### 9.2 Classes Conditionnelles

**Utiliser la fonction `cn()` pour les classes conditionnelles :**

```typescript
import { cn } from '@/shared/lib/utils';

function Button({ variant, className }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium',
        variant === 'primary' && 'bg-indigo-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-900',
        className
      )}
    >
      {children}
    </button>
  );
}
```

### 9.3 CSS Modules (si nécessaire)

```typescript
// PropertyCard.module.css
.card {
  padding: 1rem;
  border-radius: 0.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
}

// PropertyCard.tsx
import styles from './PropertyCard.module.css';

function PropertyCard() {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
    </div>
  );
}
```

---

## 10. Performance

### 10.1 Lazy Loading

**Lazy load les pages et composants lourds :**

```typescript
// routes.tsx
import { lazy } from 'react';

const PropertyDetailPage = lazy(() => import('@/features/property/pages/PropertyDetailPage'));
const MapboxMap = lazy(() => import('@/features/property/components/MapboxMap'));

// Utilisation
<Suspense fallback={<LoadingSpinner />}>
  <PropertyDetailPage />
</Suspense>
```

### 10.2 Optimisation des Images

```tsx
// ✅ BON
<img 
  src={property.imageUrl} 
  alt={property.title}
  loading="lazy"
  width={400}
  height={300}
  className="object-cover"
/>

// ❌ MAUVAIS
<img src={property.imageUrl} />  // Pas de lazy loading, pas de dimensions
```

### 10.3 Debouncing

```typescript
import { useDebounce } from '@/shared/hooks/useDebounce';

function SearchBar() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchProperties(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input 
      value={search} 
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Rechercher..."
    />
  );
}
```

---

## 11. Tests

### 11.1 Tests Unitaires

**Tester :**
- Les hooks personnalisés
- Les fonctions utilitaires
- Les services API (mocks)

```typescript
// usePropertyManagement.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { usePropertyManagement } from './usePropertyManagement';

describe('usePropertyManagement', () => {
  it('should load properties on mount', async () => {
    const { result } = renderHook(() => usePropertyManagement());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.properties).toHaveLength(5);
    });
  });
});
```

### 11.2 Tests de Composants

```typescript
// PropertyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    title: 'Appartement 3 pièces',
    price: 150000,
  };

  it('should render property title', () => {
    render(<PropertyCard property={mockProperty} onSelect={() => {}} />);
    expect(screen.getByText('Appartement 3 pièces')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<PropertyCard property={mockProperty} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByText('Voir détails'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

---

## 12. Git et Versioning

### 12.1 Commits

**Format des messages de commit :**

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, style
- `refactor`: Refactoring
- `test`: Ajout de tests
- `chore`: Tâches de maintenance

**Exemples :**

```bash
feat(property): add property search filters

Add city, price range, and type filters to property search.
Includes new PropertyFilters component and API integration.

Closes #123

---

fix(auth): correct OTP verification timeout

The OTP was expiring too quickly. Increased timeout from 5min to 10min.

---

docs(readme): update installation instructions
```

### 12.2 Branches

**Convention de nommage :**

```
<type>/<description>

Exemples:
feature/property-search
fix/auth-otp-timeout
refactor/feature-based-architecture
docs/update-readme
```

### 12.3 Pull Requests

**Checklist avant PR :**

- [ ] Le code compile sans erreur
- [ ] Les tests passent
- [ ] Le code est documenté
- [ ] Les imports sont organisés
- [ ] Pas de console.log ou debugger
- [ ] Le code respecte la charte
- [ ] La PR a une description claire

---

## 13. Sécurité

### 13.1 Variables d'Environnement

**Ne JAMAIS committer de secrets :**

```typescript
// ✅ BON
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ MAUVAIS
const apiKey = 'sk-1234567890abcdef';  // Secret en dur
```

### 13.2 Validation des Données

**Toujours valider les données utilisateur :**

```typescript
// ✅ BON
function createProperty(data: unknown) {
  const validated = propertySchema.parse(data);  // Zod, Yup, etc.
  return propertyApi.create(validated);
}

// ❌ MAUVAIS
function createProperty(data: any) {
  return propertyApi.create(data);  // Pas de validation
}
```

### 13.3 Permissions

**Vérifier les permissions avant les actions sensibles :**

```typescript
function DeletePropertyButton({ propertyId }: Props) {
  const { user, profile } = useAuth();

  const canDelete = profile?.role === 'admin' || profile?.role === 'owner';

  if (!canDelete) {
    return null;
  }

  return (
    <Button onClick={() => deleteProperty(propertyId)}>
      Supprimer
    </Button>
  );
}
```

---

## 14. Accessibilité

### 14.1 Attributs ARIA

```tsx
// ✅ BON
<button
  aria-label="Fermer le modal"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <X />
</button>

<input
  type="text"
  aria-label="Rechercher une propriété"
  aria-describedby="search-help"
/>
<p id="search-help">Entrez une ville ou un code postal</p>
```

### 14.2 Navigation au Clavier

```typescript
function Modal({ isOpen, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // ...
}
```

---

## 15. Documentation

### 15.1 JSDoc

**Documenter les fonctions et composants publics :**

```typescript
/**
 * Récupère une propriété par son ID
 * 
 * @param id - L'identifiant unique de la propriété
 * @returns La propriété correspondante
 * @throws {Error} Si la propriété n'existe pas
 * 
 * @example
 * ```typescript
 * const property = await propertyApi.getById('123');
 * console.log(property.title);
 * ```
 */
async function getById(id: string): Promise<Property> {
  // ...
}
```

### 15.2 README par Feature

**Chaque feature complexe devrait avoir un README.md :**

```markdown
# Feature: Property Management

## Description
Gestion complète des biens immobiliers : ajout, modification, suppression, recherche.

## Structure
- `pages/` : PropertyDetailPage, AddPropertyPage
- `components/` : PropertyCard, PropertyFilters
- `hooks/` : usePropertyManagement
- `services/` : property.api.ts

## Utilisation

### Afficher une propriété
\`\`\`typescript
import { PropertyCard } from '@/features/property';

<PropertyCard property={property} onSelect={handleSelect} />
\`\`\`

### Gérer les propriétés
\`\`\`typescript
import { usePropertyManagement } from '@/features/property';

const { properties, loading, addProperty } = usePropertyManagement();
\`\`\`
```

---

## 16. Checklist du Développeur

### Avant de Commencer une Tâche

- [ ] J'ai lu et compris le ticket/issue
- [ ] J'ai créé une branche avec le bon format
- [ ] J'ai vérifié qu'il n'y a pas de code similaire existant

### Pendant le Développement

- [ ] Je respecte la structure feature-based
- [ ] J'utilise des imports absolus avec `@/`
- [ ] Je type tout avec TypeScript
- [ ] Je documente mon code
- [ ] Je teste mon code localement

### Avant de Committer

- [ ] Le build passe (`npm run build`)
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de console.log ou debugger
- [ ] Les imports sont organisés
- [ ] Le code est formaté

### Avant la Pull Request

- [ ] J'ai testé toutes les fonctionnalités
- [ ] J'ai ajouté des tests si nécessaire
- [ ] J'ai mis à jour la documentation
- [ ] J'ai écrit un message de commit clair
- [ ] J'ai relu mon code

---

## 17. Ressources et Outils

### 17.1 Outils Recommandés

**IDE :**
- VS Code avec extensions :
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

**Formatage :**
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Linting :**
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### 17.2 Documentation Externe

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## 18. Contact et Support

**Questions sur la charte ?**
- Créer une issue sur GitHub avec le tag `[question]`
- Contacter le lead technique

**Propositions d'amélioration ?**
- Créer une PR sur ce fichier
- Discuter lors des réunions d'équipe

---

## Conclusion

Cette charte est un document vivant qui évoluera avec le projet. Tous les développeurs sont encouragés à proposer des améliorations.

**Rappelez-vous :**
- **Qualité > Vitesse** : Prenez le temps de bien faire
- **Cohérence > Préférence** : Suivez les standards de l'équipe
- **Communication > Isolation** : Partagez vos questions et découvertes

**Bon développement ! 🚀**

---

**Version :** 1.0  
**Dernière mise à jour :** 22 novembre 2025  
**Auteur :** Manus AI

