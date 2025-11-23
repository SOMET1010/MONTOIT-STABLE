# 🎨 Guide du Design System Premium - Mon Toit

**Version :** 1.0.0  
**Date :** 23 novembre 2024  
**Auteur :** Manus AI

---

## 📖 Introduction

Ce guide présente le **Design System Premium** de Mon Toit, un système de composants réutilisables inspiré des meilleures pratiques de l'industrie. Il permet de créer des interfaces cohérentes, accessibles et performantes.

### Philosophie

Le Design System Premium repose sur trois principes fondamentaux qui guident toutes les décisions de design et d'implémentation :

**Cohérence** - Tous les composants partagent les mêmes design tokens (couleurs, typographie, espacement) pour garantir une expérience visuelle unifiée sur toute la plateforme.

**Réutilisabilité** - Chaque composant est conçu pour être utilisé dans multiples contextes avec des props configurables, réduisant la duplication de code et facilitant la maintenance.

**Accessibilité** - Tous les composants respectent les normes WCAG AA avec support clavier, ARIA labels, et états focus visibles pour garantir l'accès à tous les utilisateurs.

### Architecture

Le système suit la méthodologie **Atomic Design** avec trois niveaux de complexité croissante :

**Atoms** (4 composants) - Composants de base indivisibles : ButtonPremium, InputPremium, CardPremium, BadgePremium

**Molecules** (4 composants) - Composants composés d'atoms : PropertyCardPremium, ToastPremium, SearchBarPremium, FiltersPremium

**Organisms** (5 composants) - Composants complexes : ImageGalleryPremium, TrustBadges, TestimonialsCarousel, TrustSection

---

## 🎨 Design Tokens

Les design tokens sont les variables fondamentales du système qui garantissent la cohérence visuelle.

### Couleurs

Le système utilise une palette de couleurs sémantiques avec des nuances de 50 à 900 pour chaque couleur principale.

**Primary (Orange)** - Couleur principale de la marque utilisée pour les CTAs et éléments importants
- `primary-50` : #FFF7ED (très clair)
- `primary-500` : #F97316 (standard)
- `primary-600` : #EA580C (hover)
- `primary-900` : #7C2D12 (très foncé)

**Success (Vert)** - Utilisé pour les confirmations et états positifs
- `success` : #10B981

**Error (Rouge)** - Utilisé pour les erreurs et alertes
- `error` : #EF4444

**Warning (Jaune)** - Utilisé pour les avertissements
- `warning` : #F59E0B

**Info (Bleu)** - Utilisé pour les informations
- `info` : #3B82F6

**Neutral (Gris)** - Utilisé pour les textes et backgrounds
- `neutral-50` à `neutral-900`

### Typographie

Le système utilise une hiérarchie typographique claire avec des tailles prédéfinies.

**Font Families**
- Sans-serif : Inter, system-ui, -apple-system, sans-serif
- Monospace : 'Courier New', monospace

**Tailles**
- `text-xs` : 0.75rem (12px)
- `text-sm` : 0.875rem (14px)
- `text-base` : 1rem (16px)
- `text-lg` : 1.125rem (18px)
- `text-xl` : 1.25rem (20px)
- `text-2xl` : 1.5rem (24px)
- `text-3xl` : 1.875rem (30px)
- `text-4xl` : 2.25rem (36px)
- `text-5xl` : 3rem (48px)

**Poids**
- `font-normal` : 400
- `font-medium` : 500
- `font-semibold` : 600
- `font-bold` : 700
- `font-black` : 900

### Espacement

Le système utilise une échelle harmonique basée sur des multiples de 4px.

- `spacing-1` : 0.25rem (4px)
- `spacing-2` : 0.5rem (8px)
- `spacing-3` : 0.75rem (12px)
- `spacing-4` : 1rem (16px)
- `spacing-6` : 1.5rem (24px)
- `spacing-8` : 2rem (32px)
- `spacing-12` : 3rem (48px)
- `spacing-16` : 4rem (64px)
- `spacing-24` : 6rem (96px)

### Ombres

Le système propose 5 niveaux d'ombres pour créer de la profondeur.

- `shadow-sm` : Ombre légère pour éléments proches
- `shadow-md` : Ombre moyenne pour cartes
- `shadow-lg` : Ombre forte pour modales
- `shadow-xl` : Ombre très forte pour éléments flottants
- `shadow-2xl` : Ombre maximale pour éléments importants

### Border Radius

Le système utilise des rayons de bordure cohérents.

- `rounded-sm` : 0.125rem (2px)
- `rounded` : 0.25rem (4px)
- `rounded-md` : 0.375rem (6px)
- `rounded-lg` : 0.5rem (8px)
- `rounded-xl` : 0.75rem (12px)
- `rounded-2xl` : 1rem (16px)
- `rounded-full` : 9999px (cercle)

---

## 🧩 Composants - Guide d'Utilisation

### ButtonPremium

Bouton polyvalent avec effets premium.

**Import**
```typescript
import { ButtonPremium } from '@/shared/components/premium';
```

**Props**
```typescript
interface ButtonPremiumProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
}
```

**Exemples**
```tsx
// Bouton primary standard
<ButtonPremium variant="primary" onClick={handleClick}>
  Postuler maintenant
</ButtonPremium>

// Bouton avec icon et loading
<ButtonPremium 
  variant="secondary" 
  size="lg"
  leftIcon={<Search className="h-5 w-5" />}
  isLoading={loading}
>
  Rechercher
</ButtonPremium>

// Bouton full width
<ButtonPremium variant="primary" fullWidth>
  Envoyer
</ButtonPremium>
```

**Bonnes pratiques**
- Utiliser `variant="primary"` pour les actions principales
- Utiliser `variant="secondary"` pour les actions secondaires
- Utiliser `variant="ghost"` pour les actions tertiaires
- Toujours fournir un `onClick` ou `type="submit"`
- Utiliser `isLoading` pour les actions asynchrones

---

### InputPremium

Champ de saisie avec validation visuelle.

**Import**
```typescript
import { InputPremium } from '@/shared/components/premium';
```

**Props**
```typescript
interface InputPremiumProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  variant?: 'default' | 'glass';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  maxLength?: number;
  showCharCount?: boolean;
  className?: string;
}
```

**Exemples**
```tsx
// Input simple
<InputPremium
  label="Ville"
  value={city}
  onChange={setCity}
  placeholder="Ex: Abidjan"
/>

// Input avec validation
<InputPremium
  type="email"
  label="Email"
  value={email}
  onChange={setEmail}
  error={emailError}
  required
/>

// Input password avec toggle
<InputPremium
  type="password"
  label="Mot de passe"
  value={password}
  onChange={setPassword}
  helperText="Minimum 8 caractères"
/>

// Input avec icon et character count
<InputPremium
  label="Message"
  value={message}
  onChange={setMessage}
  leftIcon={<MessageCircle className="h-5 w-5" />}
  maxLength={500}
  showCharCount
/>
```

**Bonnes pratiques**
- Toujours fournir un `label` pour l'accessibilité
- Utiliser `helperText` pour guider l'utilisateur
- Afficher `error` pour la validation
- Utiliser `required` pour les champs obligatoires
- Utiliser `maxLength` + `showCharCount` pour les champs limités

---

### CardPremium

Carte conteneur avec multiples styles.

**Import**
```typescript
import { 
  CardPremium, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/shared/components/premium';
```

**Props**
```typescript
interface CardPremiumProps {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

**Exemples**
```tsx
// Card simple
<CardPremium variant="default" padding="lg">
  <h3>Titre</h3>
  <p>Contenu</p>
</CardPremium>

// Card avec sub-components
<CardPremium variant="elevated" hoverEffect="lift">
  <CardHeader>
    <CardTitle>Caractéristiques</CardTitle>
    <CardDescription>Détails de la propriété</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu principal</p>
  </CardContent>
  <CardFooter>
    <ButtonPremium>Action</ButtonPremium>
  </CardFooter>
</CardPremium>

// Card glassmorphism
<CardPremium variant="glass" padding="lg">
  <p>Contenu avec effet verre</p>
</CardPremium>
```

**Bonnes pratiques**
- Utiliser `variant="default"` pour les cartes standard
- Utiliser `variant="glass"` pour les overlays
- Utiliser `variant="elevated"` pour les cartes importantes
- Utiliser `hoverEffect="lift"` pour les cartes cliquables
- Utiliser les sub-components pour une structure claire

---

### PropertyCardPremium

Carte propriété avec galerie et actions.

**Import**
```typescript
import { PropertyCardPremium } from '@/shared/components/premium';
```

**Props**
```typescript
interface PropertyCardPremiumProps {
  id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  isVerified?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onShare?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}
```

**Exemple**
```tsx
<PropertyCardPremium
  id={property.id}
  title={property.title}
  location={`${property.city}, ${property.neighborhood}`}
  price={property.monthly_rent}
  currency="FCFA"
  images={[property.main_image]}
  bedrooms={property.bedrooms}
  bathrooms={property.bathrooms}
  area={property.area}
  isVerified={property.is_verified}
  isFavorite={favorites.has(property.id)}
  onFavoriteToggle={handleFavoriteToggle}
  onShare={handleShare}
  onClick={handlePropertyClick}
/>
```

**Bonnes pratiques**
- Toujours fournir au moins 1 image
- Utiliser `isVerified` pour les propriétés ANSUT
- Implémenter `onFavoriteToggle` pour la persistance
- Utiliser `onClick` pour la navigation

---

### ToastPremium

Système de notifications.

**Import**
```typescript
import { toast, ToastContainer } from '@/shared/components/premium';
```

**API**
```typescript
// Success
toast.success('Titre', 'Message de succès');

// Error
toast.error('Erreur', 'Message d\'erreur');

// Warning
toast.warning('Attention', 'Message d\'avertissement');

// Info
toast.info('Information', 'Message informatif');

// Avec action button
toast.success('Sauvegardé', 'Vos modifications ont été enregistrées', {
  action: {
    label: 'Voir',
    onClick: () => console.log('Action clicked'),
  },
});

// Avec durée personnalisée
toast.success('Titre', 'Message', {
  duration: 5000, // 5 secondes
});
```

**Intégration**
```tsx
// Dans Layout.tsx
import { ToastContainer } from '@/shared/components/premium';

<ToastContainer position="top-right" />
```

**Bonnes pratiques**
- Utiliser `success` pour les confirmations
- Utiliser `error` pour les erreurs
- Utiliser `warning` pour les avertissements
- Utiliser `info` pour les informations
- Garder les messages courts et clairs
- Utiliser `action` pour les actions rapides

---

### SearchBarPremium

Barre de recherche avec autocomplete.

**Import**
```typescript
import { SearchBarPremium } from '@/shared/components/premium';
```

**Props**
```typescript
interface SearchBarPremiumProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  popularSearches?: string[];
  recentSearches?: string[];
  isLoading?: boolean;
  maxRecentSearches?: number;
  className?: string;
}
```

**Exemple**
```tsx
<SearchBarPremium
  value={searchCity}
  onChange={setSearchCity}
  onSearch={handleSearch}
  placeholder="Où cherchez-vous ? (Ville, quartier...)"
  popularSearches={['Abidjan', 'Cocody', 'Plateau', 'Marcory']}
  isLoading={loading}
/>
```

**Bonnes pratiques**
- Fournir `popularSearches` pour guider l'utilisateur
- Utiliser `isLoading` pendant la recherche
- Implémenter debounce dans `onChange` pour la performance
- Les recent searches sont automatiquement sauvegardés

---

### FiltersPremium

Panneau de filtres avancés.

**Import**
```typescript
import { FiltersPremium, type FilterOption } from '@/shared/components/premium';
```

**Props**
```typescript
interface FiltersPremiumProps {
  propertyType?: string;
  propertyTypes?: FilterOption[];
  onPropertyTypeChange?: (value: string) => void;
  propertyCategory?: string;
  propertyCategories?: FilterOption[];
  onPropertyCategoryChange?: (value: string) => void;
  minPrice?: string;
  maxPrice?: string;
  onPriceChange?: (min: string, max: string) => void;
  bedrooms?: string;
  onBedroomsChange?: (value: string) => void;
  bathrooms?: string;
  onBathroomsChange?: (value: string) => void;
  isFurnished?: boolean | null;
  hasParking?: boolean | null;
  hasAC?: boolean | null;
  onAmenitiesChange?: (amenity: string, value: boolean | null) => void;
  sortBy?: string;
  sortOptions?: FilterOption[];
  onSortChange?: (value: string) => void;
  onClearAll?: () => void;
  onApply?: () => void;
  activeFiltersCount?: number;
  defaultExpanded?: boolean;
  className?: string;
}
```

**Exemple**
```tsx
<FiltersPremium
  propertyType={propertyType}
  propertyTypes={[
    { label: 'Appartement', value: 'appartement' },
    { label: 'Maison', value: 'maison' },
  ]}
  onPropertyTypeChange={setPropertyType}
  minPrice={minPrice}
  maxPrice={maxPrice}
  onPriceChange={(min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  }}
  bedrooms={bedrooms}
  onBedroomsChange={setBedrooms}
  sortBy={sortBy}
  sortOptions={[
    { label: 'Plus récent', value: 'recent' },
    { label: 'Prix croissant', value: 'price_asc' },
  ]}
  onSortChange={setSortBy}
  onClearAll={clearFilters}
  onApply={loadProperties}
  activeFiltersCount={activeFiltersCount}
/>
```

**Bonnes pratiques**
- Calculer `activeFiltersCount` pour le badge
- Implémenter `onClearAll` pour réinitialiser
- Appeler `onApply` pour charger les résultats
- Les sections sont collapsibles individuellement

---

### ImageGalleryPremium

Galerie d'images avec lightbox.

**Import**
```typescript
import { ImageGalleryPremium } from '@/shared/components/premium';
```

**Props**
```typescript
interface ImageGalleryPremiumProps {
  images: string[];
  alt?: string;
  layout?: 'grid' | 'masonry' | 'carousel';
  className?: string;
}
```

**Exemple**
```tsx
<ImageGalleryPremium
  images={[
    property.main_image,
    ...property.images
  ]}
  alt={property.title}
  layout="grid"
/>
```

**Fonctionnalités**
- Lightbox fullscreen au clic
- Zoom 1x à 3x
- Navigation clavier (← → + - Esc)
- Thumbnails strip
- Image counter

**Bonnes pratiques**
- Fournir au moins 1 image
- Utiliser des images optimisées
- Fournir un `alt` descriptif

---

### TrustSection

Section complète de confiance.

**Import**
```typescript
import { TrustSection } from '@/shared/components/premium';
```

**Props**
```typescript
interface TrustSectionProps {
  showBadges?: boolean;
  showTestimonials?: boolean;
  customTestimonials?: Testimonial[];
  variant?: 'full' | 'compact';
  className?: string;
}
```

**Exemple**
```tsx
// Section complète
<TrustSection 
  showBadges={true} 
  showTestimonials={true} 
  variant="full" 
/>

// Seulement badges
<TrustSection 
  showBadges={true} 
  showTestimonials={false} 
/>

// Témoignages personnalisés
<TrustSection 
  showTestimonials={true}
  customTestimonials={[
    {
      id: '1',
      name: 'Jean Dupont',
      role: 'Locataire',
      location: 'Abidjan',
      rating: 5,
      comment: 'Excellent service !',
    }
  ]}
/>
```

**Bonnes pratiques**
- Utiliser sur HomePage pour la crédibilité
- Utiliser sur pages de conversion
- Personnaliser les témoignages si disponibles

---

## 🎯 Patterns d'Utilisation

### Pattern : Page de Recherche

```tsx
import { 
  SearchBarPremium, 
  FiltersPremium, 
  PropertyCardPremium,
  toast 
} from '@/shared/components/premium';

function SearchPage() {
  const [searchCity, setSearchCity] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (city: string) => {
    setLoading(true);
    try {
      const results = await searchProperties(city);
      setProperties(results);
      toast.success('Recherche terminée', `${results.length} propriétés trouvées`);
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les propriétés');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SearchBarPremium
        value={searchCity}
        onChange={setSearchCity}
        onSearch={handleSearch}
        isLoading={loading}
      />
      
      <div className="grid grid-cols-3 gap-6">
        <FiltersPremium {...filterProps} />
        
        <div className="col-span-2 grid grid-cols-2 gap-6">
          {properties.map(property => (
            <PropertyCardPremium key={property.id} {...property} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Pattern : Formulaire avec Validation

```tsx
import { InputPremium, ButtonPremium, toast } from '@/shared/components/premium';

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Le nom est requis';
    if (!email) newErrors.email = 'L\'email est requis';
    if (!message) newErrors.message = 'Le message est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    try {
      await sendMessage({ name, email, message });
      toast.success('Message envoyé', 'Nous vous répondrons bientôt');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputPremium
        label="Nom"
        value={name}
        onChange={setName}
        error={errors.name}
        required
      />
      <InputPremium
        type="email"
        label="Email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        required
      />
      <InputPremium
        label="Message"
        value={message}
        onChange={setMessage}
        error={errors.message}
        maxLength={500}
        showCharCount
        required
      />
      <ButtonPremium
        type="submit"
        variant="primary"
        fullWidth
        isLoading={sending}
      >
        Envoyer
      </ButtonPremium>
    </form>
  );
}
```

### Pattern : Dashboard avec Cards

```tsx
import { CardPremium, BadgePremium } from '@/shared/components/premium';

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <CardPremium variant="elevated" hoverEffect="lift">
        <CardHeader>
          <CardTitle>Propriétés actives</CardTitle>
          <BadgePremium variant="success">12</BadgePremium>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">12</p>
          <p className="text-neutral-600">+2 ce mois</p>
        </CardContent>
      </CardPremium>

      <CardPremium variant="elevated" hoverEffect="lift">
        <CardHeader>
          <CardTitle>Candidatures</CardTitle>
          <BadgePremium variant="warning">5</BadgePremium>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">5</p>
          <p className="text-neutral-600">En attente</p>
        </CardContent>
      </CardPremium>

      <CardPremium variant="elevated" hoverEffect="lift">
        <CardHeader>
          <CardTitle>Revenus</CardTitle>
          <BadgePremium variant="info">FCFA</BadgePremium>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">2.5M</p>
          <p className="text-neutral-600">Ce mois</p>
        </CardContent>
      </CardPremium>
    </div>
  );
}
```

---

## ✅ Checklist de Qualité

Avant de livrer une page harmonisée, vérifiez ces points :

### Design
- [ ] Utilise les design tokens (couleurs, typographie, espacement)
- [ ] Cohérent avec les autres pages
- [ ] Responsive mobile (320px à 4K)
- [ ] Hover states sur tous les éléments interactifs
- [ ] Focus states visibles pour le clavier

### Code
- [ ] Pas d'erreurs TypeScript
- [ ] Props typées avec interfaces
- [ ] Composants premium utilisés
- [ ] Pas de code dupliqué
- [ ] Build réussi

### UX
- [ ] Loading states pour les actions asynchrones
- [ ] Empty states pour les listes vides
- [ ] Error states pour les erreurs
- [ ] Toast notifications pour le feedback
- [ ] Navigation claire

### Accessibilité
- [ ] Labels sur tous les inputs
- [ ] ARIA labels sur les boutons icon-only
- [ ] Keyboard navigation fonctionnelle
- [ ] Contraste suffisant (WCAG AA)
- [ ] Alt text sur toutes les images

### Performance
- [ ] Images optimisées
- [ ] Pas de re-renders inutiles
- [ ] Debounce sur les inputs de recherche
- [ ] Lazy loading si nécessaire

---

## 🚀 Déploiement

### Build de Production

```bash
# Build
npm run build

# Preview
npm run preview

# Deploy (selon votre plateforme)
npm run deploy
```

### Vérifications Pré-Déploiement

- [ ] Tous les tests passent
- [ ] Build réussi sans warnings critiques
- [ ] Lighthouse score > 90
- [ ] Testé sur Chrome, Firefox, Safari
- [ ] Testé sur mobile (iOS + Android)
- [ ] Pas de console.log() en production

---

## 📚 Ressources

### Documentation
- **Tailwind CSS :** https://tailwindcss.com/docs
- **React :** https://react.dev
- **TypeScript :** https://www.typescriptlang.org/docs

### Inspirations
- **Apple.com :** Design minimaliste et élégant
- **Linear.app :** Animations fluides et micro-interactions
- **Stripe.com :** Clarté et professionnalisme
- **Vercel.com :** Design moderne et performant

### Outils
- **Figma :** Design et prototypage
- **Lucide Icons :** Icônes cohérentes
- **Coolors :** Palettes de couleurs
- **Type Scale :** Hiérarchie typographique

---

## 🆘 Support

Pour toute question sur le Design System Premium :

**Documentation :** Voir HARMONISATION_FINALE_RAPPORT.md  
**Référence :** Voir COMPOSANTS_PREMIUM_REFERENCE.md  
**GitHub :** https://github.com/SOMET1010/MONTOIT-STABLE

---

**Fin du Guide**
