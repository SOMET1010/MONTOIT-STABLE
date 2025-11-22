# Analyse des Hooks - Plan de Migration

**Date :** 22 novembre 2025  
**Objectif :** Identifier et migrer les hooks métier vers leurs features respectives

---

## Hooks Identifiés dans shared/hooks/

### 1. useContract.ts
**Type :** Hook métier  
**Feature cible :** `features/contract/`  
**Action :** ✅ À migrer

**Raison :** Gère la logique métier des contrats (leases), spécifique au domaine contract.

**Migration :**
```
shared/hooks/useContract.ts → features/contract/hooks/useContract.ts
```

---

### 2. useProperties.ts
**Type :** Hook métier  
**Feature cible :** `features/property/`  
**Action :** ✅ À migrer

**Raison :** Gère la logique métier des propriétés, spécifique au domaine property.

**Migration :**
```
shared/hooks/useProperties.ts → features/property/hooks/useProperties.ts
```

**Exports :**
- `useProperties(filters)` - Liste des propriétés avec filtres
- `useProperty(id)` - Détail d'une propriété
- `useOwnerProperties(ownerId)` - Propriétés d'un propriétaire
- `useFeaturedProperties()` - Propriétés en vedette
- `useCreateProperty()` - Création de propriété
- `useUpdateProperty()` - Mise à jour de propriété
- `useDeleteProperty()` - Suppression de propriété

---

### 3. useMessages.ts
**Type :** Hook métier  
**Feature cible :** `features/messaging/`  
**Action :** ✅ À migrer

**Raison :** Gère la logique métier de la messagerie, spécifique au domaine messaging.

**Migration :**
```
shared/hooks/useMessages.ts → features/messaging/hooks/useMessages.ts
```

**Exports :**
- `useConversations(userId)` - Liste des conversations
- `useConversation(conversationId)` - Détail d'une conversation
- `useMessages(conversationId)` - Messages d'une conversation
- `useUnreadCount(userId)` - Nombre de messages non lus
- `useCreateConversation()` - Création de conversation
- `useSendMessage()` - Envoi de message
- `useMarkAsRead()` - Marquer comme lu

---

### 4. useMessageNotifications.ts
**Type :** Hook métier  
**Feature cible :** `features/messaging/`  
**Action :** ✅ À migrer

**Raison :** Gère les notifications de messages, spécifique au domaine messaging.

**Migration :**
```
shared/hooks/useMessageNotifications.ts → features/messaging/hooks/useMessageNotifications.ts
```

---

### 5. useVerification.ts
**Type :** Hook métier  
**Feature cible :** `features/verification/`  
**Action :** ✅ À migrer

**Raison :** Gère la logique métier des vérifications d'identité (ONECI, CNAM, Face), spécifique au domaine verification.

**Migration :**
```
shared/hooks/useVerification.ts → features/verification/hooks/useVerification.ts
```

---

### 6. useLeases.ts
**Type :** Hook métier  
**Feature cible :** `features/contract/`  
**Action :** ✅ À migrer

**Raison :** Gère la logique métier des baux (leases), spécifique au domaine contract.

**Migration :**
```
shared/hooks/useLeases.ts → features/contract/hooks/useLeases.ts
```

---

### 7. useFeatureFlag.ts
**Type :** Hook générique  
**Feature cible :** `shared/hooks/` (reste)  
**Action :** ❌ Ne pas migrer

**Raison :** Hook générique utilisé par plusieurs features pour gérer les feature flags. Doit rester dans shared/.

---

## Plan de Migration

### Phase 1 : Migrer les hooks métier

**Ordre de migration :**

1. **useContract.ts** → `features/contract/hooks/`
2. **useLeases.ts** → `features/contract/hooks/`
3. **useProperties.ts** → `features/property/hooks/`
4. **useMessages.ts** → `features/messaging/hooks/`
5. **useMessageNotifications.ts** → `features/messaging/hooks/`
6. **useVerification.ts** → `features/verification/hooks/`

### Phase 2 : Mettre à jour les imports

Pour chaque hook migré, mettre à jour tous les imports dans le projet :

**Avant :**
```typescript
import { useProperties } from '@/shared/hooks/useProperties';
```

**Après :**
```typescript
import { useProperties } from '@/features/property/hooks/useProperties';
// OU via l'export public
import { useProperties } from '@/features/property';
```

### Phase 3 : Exporter via index.ts

Ajouter les hooks dans les fichiers `index.ts` des features :

```typescript
// features/property/index.ts
export { 
  useProperties,
  useProperty,
  useOwnerProperties,
  useFeaturedProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty
} from './hooks/useProperties';
```

### Phase 4 : Supprimer les anciens fichiers

Une fois tous les imports mis à jour, supprimer les fichiers de `shared/hooks/` (sauf useFeatureFlag.ts).

---

## Hooks Génériques à Garder dans shared/

Les hooks suivants doivent rester dans `shared/hooks/` car ils sont génériques et réutilisables :

- ✅ `useFeatureFlag.ts` - Gestion des feature flags
- ✅ `useDebounce.ts` (si existe) - Debouncing générique
- ✅ `useLocalStorage.ts` (si existe) - Stockage local générique
- ✅ `useMediaQuery.ts` (si existe) - Media queries génériques
- ✅ `useClickOutside.ts` (si existe) - Détection de clic extérieur

---

## Résumé

| Hook | Type | Feature Cible | Action |
|------|------|---------------|--------|
| useContract.ts | Métier | contract | ✅ Migrer |
| useLeases.ts | Métier | contract | ✅ Migrer |
| useProperties.ts | Métier | property | ✅ Migrer |
| useMessages.ts | Métier | messaging | ✅ Migrer |
| useMessageNotifications.ts | Métier | messaging | ✅ Migrer |
| useVerification.ts | Métier | verification | ✅ Migrer |
| useFeatureFlag.ts | Générique | shared | ❌ Garder |

**Total à migrer :** 6 hooks  
**Total à garder :** 1 hook

---

## Prochaine Étape

Commencer la migration en créant les répertoires `hooks/` dans chaque feature et en déplaçant les fichiers.

