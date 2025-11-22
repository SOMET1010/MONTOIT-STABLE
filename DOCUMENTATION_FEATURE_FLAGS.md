## 🚩 SYSTÈME DE FEATURE FLAGS - DOCUMENTATION COMPLÈTE

**Date de création :** 21 novembre 2025  
**Auteur :** Manus AI  
**Version :** 1.0  
**Dépôt :** https://github.com/SOMET1010/MONTOIT-STABLE

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Utilisation](#utilisation)
5. [API Reference](#api-reference)
6. [Interface Admin](#interface-admin)
7. [Cas d'Usage](#cas-dusage)
8. [Bonnes Pratiques](#bonnes-pratiques)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 INTRODUCTION

Le système de **Feature Flags** (drapeaux de fonctionnalités) permet d'activer ou de désactiver des fonctionnalités de la plateforme Mon Toit **sans redéployer le code**. Ce système offre une flexibilité maximale pour gérer le déploiement progressif de nouvelles fonctionnalités, effectuer des tests A/B, et gérer les intégrations externes qui nécessitent des credentials.

### Avantages

Le système de feature flags apporte plusieurs avantages majeurs à la plateforme Mon Toit. Premièrement, il permet un **déploiement progressif** des fonctionnalités, ce qui signifie que vous pouvez activer une fonctionnalité pour un pourcentage d'utilisateurs avant de la déployer à tous. Deuxièmement, la **gestion des credentials** devient plus simple car vous pouvez désactiver une fonctionnalité si les credentials ne sont pas encore configurés. Troisièmement, les **tests A/B** deviennent possibles en activant différentes versions pour différents groupes d'utilisateurs. Quatrièmement, le **rollback instantané** est facilité car si une fonctionnalité cause des problèmes, vous pouvez la désactiver immédiatement sans redéployer. Enfin, la **séparation des rôles** permet de restreindre certaines fonctionnalités à des rôles spécifiques (admin, landlord, tenant, etc.).

### Fonctionnalités Clés

Le système offre **45 feature flags pré-configurés** couvrant toutes les fonctionnalités de Mon Toit. Il dispose d'une **interface admin intuitive** pour gérer les flags visuellement. Le **rollout progressif** permet d'activer pour 10%, 50%, 100% des utilisateurs. Les **overrides par utilisateur** permettent de forcer l'activation/désactivation pour des utilisateurs spécifiques. L'**historique complet** des changements est conservé pour audit. Enfin, les **politiques RLS** garantissent que seuls les admins peuvent modifier les flags.

---

## 🏗️ ARCHITECTURE

### Schéma de la Base de Données

Le système repose sur trois tables principales dans la base de données Supabase.

#### Table `feature_flags`

Cette table contient la définition de tous les feature flags disponibles sur la plateforme.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique du flag |
| `key` | TEXT | Clé unique du flag (ex: `oneci_verification`) |
| `name` | TEXT | Nom lisible du flag |
| `description` | TEXT | Description de la fonctionnalité |
| `category` | TEXT | Catégorie (verification, payment, ai, etc.) |
| `is_enabled` | BOOLEAN | Flag activé globalement ou non |
| `requires_credentials` | BOOLEAN | Nécessite des credentials API externes |
| `credentials_status` | TEXT | Statut: `not_configured`, `sandbox`, `production` |
| `rollout_percentage` | INTEGER | Pourcentage de rollout (0-100) |
| `allowed_roles` | TEXT[] | Rôles autorisés à utiliser cette fonctionnalité |
| `metadata` | JSONB | Métadonnées additionnelles |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de dernière modification |
| `created_by` | UUID | Utilisateur créateur |
| `updated_by` | UUID | Dernier utilisateur modificateur |

#### Table `feature_flag_history`

Cette table conserve l'historique de tous les changements effectués sur les feature flags.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique de l'entrée d'historique |
| `feature_flag_id` | UUID | Référence au flag modifié |
| `action` | TEXT | Type d'action: `enabled`, `disabled`, `updated`, `created` |
| `previous_value` | JSONB | Valeur avant modification |
| `new_value` | JSONB | Nouvelle valeur |
| `changed_by` | UUID | Utilisateur ayant effectué le changement |
| `changed_at` | TIMESTAMPTZ | Date du changement |
| `reason` | TEXT | Raison du changement (optionnel) |

#### Table `feature_flag_overrides`

Cette table permet de surcharger l'état d'un flag pour un utilisateur spécifique, utile pour les tests A/B ou pour donner un accès anticipé à certains utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique de l'override |
| `feature_flag_id` | UUID | Référence au flag |
| `user_id` | UUID | Utilisateur concerné |
| `is_enabled` | BOOLEAN | État forcé du flag pour cet utilisateur |
| `reason` | TEXT | Raison de l'override |
| `expires_at` | TIMESTAMPTZ | Date d'expiration de l'override (optionnel) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `created_by` | UUID | Utilisateur créateur |

### Fonction SQL `check_feature_flag`

La fonction SQL `check_feature_flag(flag_key TEXT, user_id UUID)` est le cœur du système. Elle vérifie si un flag est activé pour un utilisateur donné en suivant cette logique :

1. **Vérification de l'existence** : Si le flag n'existe pas, retourner `false`
2. **Vérification des overrides** : Si un override existe pour cet utilisateur et n'est pas expiré, utiliser sa valeur
3. **Vérification de l'activation globale** : Si le flag n'est pas activé globalement, retourner `false`
4. **Vérification des rôles** : Si des rôles sont spécifiés, vérifier que l'utilisateur a un rôle autorisé
5. **Vérification du rollout** : Si le rollout est < 100%, utiliser un hash du user_id pour déterminer si l'utilisateur est dans le rollout
6. **Retourner true** : Si toutes les conditions sont remplies

### Edge Functions

Le système expose deux Edge Functions Supabase.

#### `manage-feature-flags`

Cette fonction permet de gérer les feature flags (CRUD complet). Elle est réservée aux administrateurs.

**Endpoints disponibles :**

- `GET /manage-feature-flags` - Liste tous les flags
- `GET /manage-feature-flags?category=payment` - Liste les flags d'une catégorie
- `GET /manage-feature-flags/{key}` - Récupère un flag spécifique
- `POST /manage-feature-flags` - Crée un nouveau flag
- `PUT /manage-feature-flags/{key}` - Met à jour un flag
- `DELETE /manage-feature-flags/{key}` - Supprime un flag
- `POST /manage-feature-flags/{key}/toggle` - Active/désactive un flag
- `POST /manage-feature-flags/{key}/override` - Crée un override pour un utilisateur
- `GET /manage-feature-flags/{key}/history` - Récupère l'historique d'un flag
- `GET /manage-feature-flags/categories` - Liste toutes les catégories

#### `check-feature-flag`

Cette fonction permet de vérifier si un flag est activé pour l'utilisateur courant. Elle est accessible à tous les utilisateurs authentifiés.

**Endpoint :**

- `GET /check-feature-flag?key={flagKey}` - Vérifie si un flag est activé

**Réponse :**

```json
{
  "key": "oneci_verification",
  "enabled": true,
  "user_id": "uuid-of-user"
}
```

---

## 🚀 INSTALLATION

### 1. Appliquer la Migration SQL

La migration SQL crée toutes les tables et fonctions nécessaires.

```bash
# Se connecter à Supabase
cd /home/ubuntu/MONTOIT-STABLE

# Appliquer la migration
supabase db push
```

Ou appliquer manuellement via le dashboard Supabase :

1. Aller dans **Database** > **SQL Editor**
2. Copier le contenu de `supabase/migrations/20251121100000_create_feature_flags_system.sql`
3. Exécuter le script

### 2. Déployer les Edge Functions

```bash
# Déployer manage-feature-flags
supabase functions deploy manage-feature-flags

# Déployer check-feature-flag
supabase functions deploy check-feature-flag
```

### 3. Ajouter la Route Admin

Ajouter la route dans `src/App.tsx` ou votre fichier de routes :

```tsx
import AdminFeatureFlags from "@/pages/AdminFeatureFlags";

// Dans vos routes
<Route path="/admin/feature-flags" element={<AdminFeatureFlags />} />
```

### 4. Vérifier l'Installation

```bash
# Vérifier que les tables existent
supabase db dump --data-only feature_flags

# Vérifier que les Edge Functions sont déployées
supabase functions list
```

---

## 💻 UTILISATION

### Utilisation dans React

#### Hook `useFeatureFlag`

Le hook `useFeatureFlag` est la manière la plus simple de vérifier un flag dans un composant React.

```tsx
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

function PropertyVerification() {
  const { isEnabled, isLoading } = useFeatureFlag('oneci_verification');

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div>
      {isEnabled ? (
        <ONECIVerification />
      ) : (
        <ManualVerification />
      )}
    </div>
  );
}
```

#### Hook `useFeatureFlags` (Multiple)

Pour vérifier plusieurs flags en une seule fois :

```tsx
import { useFeatureFlags } from "@/hooks/useFeatureFlag";

function PaymentMethods() {
  const flags = useFeatureFlags([
    'orange_money',
    'mtn_money',
    'moov_money',
    'wave_payment'
  ]);

  return (
    <div>
      <h2>Méthodes de paiement disponibles</h2>
      {flags.orange_money.isEnabled && <OrangeMoneyButton />}
      {flags.mtn_money.isEnabled && <MTNMoneyButton />}
      {flags.moov_money.isEnabled && <MoovMoneyButton />}
      {flags.wave_payment.isEnabled && <WaveButton />}
    </div>
  );
}
```

#### Composant `<FeatureFlag>`

Pour un usage déclaratif :

```tsx
import { FeatureFlag } from "@/hooks/useFeatureFlag";

function SignatureSection() {
  return (
    <div>
      <FeatureFlag 
        flag="cryptoneo_signature"
        fallback={<SimpleSignature />}
        loadingFallback={<Skeleton />}
      >
        <CryptoNeoSignature />
      </FeatureFlag>
    </div>
  );
}
```

#### Options Avancées

Le hook `useFeatureFlag` accepte des options pour des cas d'usage avancés :

```tsx
// Forcer la désactivation (utile en développement)
const { isEnabled } = useFeatureFlag('beta_feature', {
  forceDisabled: true
});

// Forcer l'activation (utile en développement)
const { isEnabled } = useFeatureFlag('new_feature', {
  forceEnabled: process.env.NODE_ENV === 'development'
});

// Rafraîchir toutes les 30 secondes
const { isEnabled, refetch } = useFeatureFlag('realtime_feature', {
  refetchInterval: 30000
});
```

### Utilisation dans les Edge Functions

Pour vérifier un flag dans une Edge Function Supabase :

```typescript
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Récupérer l'utilisateur
  const { data: { user } } = await supabaseClient.auth.getUser(
    req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
  );

  // Vérifier le flag
  const { data: isEnabled } = await supabaseClient.rpc("check_feature_flag", {
    flag_key: "oneci_verification",
    user_id: user?.id || null
  });

  if (!isEnabled) {
    return new Response(
      JSON.stringify({ error: "Feature not available" }),
      { status: 403 }
    );
  }

  // Continuer le traitement...
});
```

### Utilisation en SQL

Pour vérifier un flag directement en SQL (dans une fonction ou un trigger) :

```sql
-- Vérifier un flag pour un utilisateur
SELECT check_feature_flag('oneci_verification', 'user-uuid');

-- Vérifier un flag sans utilisateur (flag global)
SELECT check_feature_flag('analytics_dashboard', NULL);

-- Utiliser dans une requête
SELECT *
FROM properties
WHERE check_feature_flag('map_clustering', auth.uid()) = true;
```

---

## 📚 API REFERENCE

### Edge Function: `manage-feature-flags`

#### Liste tous les flags

```http
GET /functions/v1/manage-feature-flags
Authorization: Bearer {token}
```

**Paramètres de requête :**
- `category` (optionnel) : Filtrer par catégorie
- `enabled` (optionnel) : Filtrer par état (`true` ou `false`)

**Réponse :**

```json
{
  "flags": [
    {
      "id": "uuid",
      "key": "oneci_verification",
      "name": "Vérification ONECI (NNI)",
      "description": "Vérification du Numéro National d'Identification",
      "category": "verification",
      "is_enabled": false,
      "requires_credentials": true,
      "credentials_status": "not_configured",
      "rollout_percentage": 0,
      "allowed_roles": [],
      "metadata": {},
      "created_at": "2025-11-21T10:00:00Z",
      "updated_at": "2025-11-21T10:00:00Z"
    }
  ]
}
```

#### Récupère un flag spécifique

```http
GET /functions/v1/manage-feature-flags/{key}
Authorization: Bearer {token}
```

**Réponse :**

```json
{
  "id": "uuid",
  "key": "oneci_verification",
  "name": "Vérification ONECI (NNI)",
  ...
}
```

#### Crée un nouveau flag

```http
POST /functions/v1/manage-feature-flags
Authorization: Bearer {token}
Content-Type: application/json

{
  "key": "new_feature",
  "name": "Nouvelle Fonctionnalité",
  "description": "Description de la fonctionnalité",
  "category": "advanced",
  "is_enabled": false,
  "requires_credentials": false,
  "credentials_status": "production",
  "rollout_percentage": 0,
  "allowed_roles": ["admin"],
  "metadata": {}
}
```

#### Met à jour un flag

```http
PUT /functions/v1/manage-feature-flags/{key}
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_enabled": true,
  "credentials_status": "production"
}
```

#### Active/Désactive un flag

```http
POST /functions/v1/manage-feature-flags/{key}/toggle
Authorization: Bearer {token}
```

**Réponse :**

```json
{
  "id": "uuid",
  "key": "oneci_verification",
  "is_enabled": true,
  ...
}
```

#### Crée un override pour un utilisateur

```http
POST /functions/v1/manage-feature-flags/{key}/override
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": "user-uuid",
  "is_enabled": true,
  "reason": "Beta tester",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

#### Récupère l'historique d'un flag

```http
GET /functions/v1/manage-feature-flags/{key}/history
Authorization: Bearer {token}
```

**Réponse :**

```json
{
  "history": [
    {
      "id": "uuid",
      "feature_flag_id": "flag-uuid",
      "action": "enabled",
      "previous_value": { "is_enabled": false },
      "new_value": { "is_enabled": true },
      "changed_by": "admin-uuid",
      "changed_at": "2025-11-21T10:30:00Z",
      "reason": null,
      "profiles": {
        "email": "admin@montoit.ci"
      }
    }
  ]
}
```

### Edge Function: `check-feature-flag`

#### Vérifie un flag

```http
GET /functions/v1/check-feature-flag?key={flagKey}
Authorization: Bearer {token}
```

**Réponse :**

```json
{
  "key": "oneci_verification",
  "enabled": true,
  "user_id": "user-uuid"
}
```

---

## 🖥️ INTERFACE ADMIN

### Accès à l'Interface

L'interface admin est accessible à l'URL `/admin/feature-flags`. Seuls les utilisateurs avec le rôle `admin` peuvent y accéder.

### Fonctionnalités de l'Interface

L'interface admin offre plusieurs fonctionnalités pour gérer les feature flags de manière intuitive.

#### Dashboard de Statistiques

Le dashboard affiche des statistiques en temps réel sur les feature flags. Vous pouvez voir le **nombre total de flags**, le **nombre de flags activés**, le **nombre de flags nécessitant des credentials non configurés**, le **nombre de flags en sandbox**, et le **nombre de flags en production**.

#### Recherche et Filtres

La barre de recherche permet de rechercher par nom, clé ou description. Le filtre par catégorie permet de filtrer par catégorie (vérifications, paiements, IA, etc.).

#### Liste des Flags par Catégorie

Les flags sont groupés par catégorie pour une meilleure organisation. Chaque flag affiche son nom et sa clé, sa description, s'il nécessite des credentials (icône d'alerte), son statut (Non configuré / Sandbox / Production), et un switch pour l'activer/désactiver.

#### Activation/Désactivation

Un simple switch permet d'activer ou de désactiver un flag instantanément. Si un flag nécessite des credentials non configurés, le switch est désactivé.

#### Historique des Changements

Un bouton "Historique" permet de voir tous les changements effectués sur un flag, incluant qui a fait le changement, quand, et quelle était la valeur avant/après.

---

## 🎯 CAS D'USAGE

### Cas 1 : Gérer les Intégrations Externes

**Problème :** Vous voulez déployer le code avec l'intégration ONECI, mais vous n'avez pas encore les credentials.

**Solution :**

1. Le flag `oneci_verification` est créé avec `is_enabled: false` et `credentials_status: not_configured`
2. Déployez le code en production
3. Quand vous obtenez les credentials, mettez à jour le flag :
   ```sql
   UPDATE feature_flags 
   SET credentials_status = 'production', is_enabled = true 
   WHERE key = 'oneci_verification';
   ```
4. La fonctionnalité est maintenant active sans redéployer !

### Cas 2 : Rollout Progressif d'une Nouvelle Fonctionnalité

**Problème :** Vous voulez tester une nouvelle fonctionnalité avec 10% des utilisateurs avant de la déployer à tous.

**Solution :**

1. Créez un flag avec `rollout_percentage: 10`
2. La fonction `check_feature_flag` utilisera un hash du `user_id` pour déterminer si l'utilisateur fait partie des 10%
3. Augmentez progressivement : 10% → 25% → 50% → 100%
4. Si un problème survient, réduisez le pourcentage ou désactivez complètement

### Cas 3 : Tests A/B

**Problème :** Vous voulez tester deux versions d'une fonctionnalité pour voir laquelle convertit le mieux.

**Solution :**

1. Créez deux flags : `feature_v1` et `feature_v2`
2. Configurez `feature_v1` avec `rollout_percentage: 50`
3. Configurez `feature_v2` avec `rollout_percentage: 50`
4. Dans votre code :
   ```tsx
   const v1 = useFeatureFlag('feature_v1');
   const v2 = useFeatureFlag('feature_v2');
   
   if (v1.isEnabled) return <FeatureV1 />;
   if (v2.isEnabled) return <FeatureV2 />;
   return <DefaultFeature />;
   ```
5. Analysez les métriques et gardez la meilleure version

### Cas 4 : Accès Anticipé pour Beta Testeurs

**Problème :** Vous voulez donner accès à une fonctionnalité à des beta testeurs spécifiques avant le lancement public.

**Solution :**

1. Créez un flag avec `is_enabled: false`
2. Créez des overrides pour vos beta testeurs :
   ```sql
   INSERT INTO feature_flag_overrides (feature_flag_id, user_id, is_enabled, reason)
   VALUES (
     (SELECT id FROM feature_flags WHERE key = 'beta_feature'),
     'beta-tester-uuid',
     true,
     'Beta tester VIP'
   );
   ```
3. Les beta testeurs voient la fonctionnalité, les autres non
4. Quand vous êtes prêt, activez le flag globalement

### Cas 5 : Restriction par Rôle

**Problème :** Vous voulez qu'une fonctionnalité ne soit accessible qu'aux admins.

**Solution :**

1. Créez un flag avec `allowed_roles: ['admin']`
2. La fonction `check_feature_flag` vérifiera automatiquement le rôle de l'utilisateur
3. Seuls les admins verront la fonctionnalité

---

## ✅ BONNES PRATIQUES

### Nommage des Flags

Utilisez une convention de nommage cohérente pour les clés de flags. Les clés doivent être en **snake_case** (ex: `oneci_verification`). Elles doivent être **descriptives** et **explicites** (évitez `flag1`, `test_feature`). Elles doivent inclure le **service ou la fonctionnalité** (ex: `cryptoneo_signature`, `intouch_payment`). Pour les variations, utilisez un **suffixe** (ex: `feature_v1`, `feature_v2`).

### Gestion des Credentials

Pour les fonctionnalités nécessitant des credentials externes, suivez ces bonnes pratiques. Créez toujours le flag avec `requires_credentials: true`. Définissez `credentials_status` selon l'état réel (`not_configured`, `sandbox`, `production`). Désactivez le flag tant que les credentials ne sont pas configurés. Testez d'abord en `sandbox` avant de passer en `production`. Documentez où trouver les credentials dans le champ `metadata`.

### Rollout Progressif

Pour un rollout progressif en toute sécurité, commencez avec un **faible pourcentage** (5-10%). Surveillez les **métriques** et les **erreurs**. Augmentez progressivement si tout va bien (10% → 25% → 50% → 100%). Préparez un **plan de rollback** en cas de problème. Communiquez avec les **utilisateurs** sur les nouvelles fonctionnalités.

### Documentation

Documentez chaque flag de manière complète. Remplissez toujours les champs `name` et `description`. Utilisez le champ `metadata` pour des informations additionnelles (lien vers la doc, ticket Jira, etc.). Ajoutez une `reason` lors des changements importants. Maintenez une **documentation externe** des flags critiques.

### Monitoring

Mettez en place un monitoring efficace des feature flags. Surveillez l'**historique des changements** régulièrement. Créez des **alertes** si un flag critique est désactivé. Analysez l'**utilisation** des flags (combien d'utilisateurs sont impactés). Nettoyez les **flags obsolètes** régulièrement. Auditez les **permissions** (qui peut modifier les flags).

### Sécurité

Assurez la sécurité du système de feature flags. Seuls les **admins** peuvent modifier les flags. Les **utilisateurs normaux** peuvent seulement consulter leur état. Utilisez les **RLS policies** pour garantir la sécurité. Loggez tous les **changements** dans l'historique. Validez les **inputs** côté serveur (Edge Functions).

---

## 🔧 TROUBLESHOOTING

### Problème : Le flag n'est pas activé malgré `is_enabled: true`

**Causes possibles :**

1. **Credentials manquants** : Si `requires_credentials: true` et `credentials_status: not_configured`, le flag ne s'activera pas
2. **Rôle non autorisé** : Si `allowed_roles` est défini, vérifiez que l'utilisateur a le bon rôle
3. **Rollout percentage** : Si < 100%, l'utilisateur n'est peut-être pas dans le rollout
4. **Override** : Un override peut forcer la désactivation pour cet utilisateur

**Solution :**

```sql
-- Vérifier l'état complet du flag
SELECT * FROM feature_flags WHERE key = 'your_flag_key';

-- Vérifier les overrides pour un utilisateur
SELECT * FROM feature_flag_overrides 
WHERE feature_flag_id = (SELECT id FROM feature_flags WHERE key = 'your_flag_key')
  AND user_id = 'user-uuid';

-- Vérifier le rôle de l'utilisateur
SELECT ur.name 
FROM user_role_assignments ura
JOIN user_roles ur ON ura.role_id = ur.id
WHERE ura.user_id = 'user-uuid';
```

### Problème : "Forbidden - Admin access required"

**Cause :** L'utilisateur n'a pas le rôle `admin`.

**Solution :**

```sql
-- Vérifier le rôle de l'utilisateur
SELECT ur.name 
FROM user_role_assignments ura
JOIN user_roles ur ON ura.role_id = ur.id
WHERE ura.user_id = auth.uid();

-- Ajouter le rôle admin si nécessaire
INSERT INTO user_role_assignments (user_id, role_id)
VALUES (
  'user-uuid',
  (SELECT id FROM user_roles WHERE name = 'admin')
);
```

### Problème : Le hook `useFeatureFlag` retourne toujours `false`

**Causes possibles :**

1. **URL Supabase incorrecte** : Vérifiez `VITE_SUPABASE_URL` dans `.env`
2. **Edge Function non déployée** : Vérifiez que `check-feature-flag` est déployée
3. **Authentification** : L'utilisateur n'est peut-être pas authentifié
4. **CORS** : Problème de CORS entre le frontend et l'Edge Function

**Solution :**

```bash
# Vérifier les variables d'environnement
cat .env | grep VITE_SUPABASE_URL

# Vérifier que l'Edge Function est déployée
supabase functions list

# Tester l'Edge Function manuellement
curl -X GET \
  "https://your-project.supabase.co/functions/v1/check-feature-flag?key=test_flag" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Problème : Les changements ne sont pas reflétés immédiatement

**Cause :** Le cache React Query conserve les données pendant 5 minutes par défaut.

**Solution :**

```tsx
// Forcer le rafraîchissement
const { refetch } = useFeatureFlag('your_flag');
refetch();

// Ou réduire le staleTime
const { isEnabled } = useFeatureFlag('your_flag', {
  staleTime: 0 // Pas de cache
});
```

### Problème : L'historique n'affiche rien

**Cause :** Le trigger `trigger_log_feature_flag_change` n'est peut-être pas créé.

**Solution :**

```sql
-- Vérifier que le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'trigger_log_feature_flag_change';

-- Recréer le trigger si nécessaire
CREATE TRIGGER trigger_log_feature_flag_change
  AFTER INSERT OR UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION log_feature_flag_change();
```

---

## 📊 FEATURE FLAGS PRÉ-CONFIGURÉS

Le système est livré avec **45 feature flags pré-configurés** couvrant toutes les fonctionnalités de Mon Toit.

### Catégorie : Vérifications (4 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `oneci_verification` | Vérification ONECI (NNI) | ✅ Requis | 🔴 Non configuré |
| `facial_verification` | Vérification Biométrique | ✅ Requis | 🔴 Non configuré |
| `cnam_verification` | Vérification CNAM | ✅ Requis | 🔴 Non configuré |
| `passport_verification` | Vérification Passeport | ❌ Non requis | ✅ Production |

### Catégorie : Signature (2 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `cryptoneo_signature` | Signature CEV CryptoNeo | ✅ Requis | 🔴 Non configuré |
| `electronic_signature` | Signature Électronique Simple | ❌ Non requis | ✅ Production |

### Catégorie : Paiements (6 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `intouch_payment` | Paiements InTouch | ✅ Requis | 🔴 Non configuré |
| `orange_money` | Orange Money | ✅ Requis | 🔴 Non configuré |
| `mtn_money` | MTN Money | ✅ Requis | 🔴 Non configuré |
| `moov_money` | Moov Money | ✅ Requis | 🔴 Non configuré |
| `wave_payment` | Wave | ✅ Requis | 🔴 Non configuré |
| `split_payment` | Split Payment (99%/1%) | ❌ Non requis | ✅ Production |

### Catégorie : Notifications (4 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `email_notifications` | Notifications Email | ✅ Requis | ✅ Production |
| `sms_notifications` | Notifications SMS | ✅ Requis | 🔴 Non configuré |
| `push_notifications` | Notifications Push | ✅ Requis | 🔴 Non configuré |
| `whatsapp_notifications` | Notifications WhatsApp | ✅ Requis | 🔴 Non configuré |

### Catégorie : Intelligence Artificielle (4 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `ai_chatbot` | Chatbot IA (SUTA) | ✅ Requis | ✅ Production |
| `ai_recommendations` | Recommandations IA | ❌ Non requis | ✅ Production |
| `ai_property_description` | Description IA | ✅ Requis | ✅ Production |
| `ai_image_generation` | Génération d'Images IA | ✅ Requis | 🔴 Non configuré |

### Catégorie : Carte (4 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `mapbox_integration` | Carte Mapbox | ✅ Requis | ✅ Production |
| `map_clustering` | Clustering de Carte | ❌ Non requis | ✅ Production |
| `map_heatmap` | Heatmap des Prix | ❌ Non requis | ✅ Production |
| `map_directions` | Itinéraires | ✅ Requis | 🔴 Non configuré |

### Catégorie : Agences (3 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `agency_management` | Gestion d'Agences | ❌ Non requis | ✅ Production |
| `agency_commissions` | Commissions d'Agences | ❌ Non requis | ✅ Production |
| `agency_team` | Équipes d'Agences | ❌ Non requis | ✅ Production |

### Catégorie : Maintenance (3 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `monartisan` | MonArtisan | ❌ Non requis | ✅ Production |
| `monartisan_payment` | Paiement MonArtisan | ✅ Requis | 🔴 Non configuré |
| `monartisan_warranty` | Garantie Travaux | ❌ Non requis | ✅ Production |

### Catégorie : Analytics (3 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `analytics_dashboard` | Dashboard Analytics | ❌ Non requis | ✅ Production |
| `realtime_analytics` | Analytics Temps Réel | ❌ Non requis | ✅ Production |
| `export_reports` | Export de Rapports | ❌ Non requis | ✅ Production |

### Catégorie : Modération (3 flags)

| Clé | Nom | Credentials | Statut |
|-----|-----|-------------|--------|
| `content_moderation` | Modération de Contenu | ❌ Non requis | ✅ Production |
| `ai_moderation` | Modération IA | ✅ Requis | 🔴 Non configuré |
| `fraud_detection` | Détection de Fraude | ❌ Non requis | ✅ Production |

### Catégorie : Avancé (3 flags)

| Clé | Nom | Credentials | Statut | Rollout |
|-----|-----|-------------|--------|---------|
| `beta_features` | Fonctionnalités Beta | ❌ Non requis | ✅ Production | 10% |
| `ab_testing` | A/B Testing | ❌ Non requis | ✅ Production | 50% |
| `debug_mode` | Mode Debug | ❌ Non requis | ✅ Production | 0% |

---

## 🎓 EXEMPLES COMPLETS

### Exemple 1 : Vérification ONECI Conditionnelle

```tsx
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function IdentityVerification() {
  const { isEnabled: oneciEnabled } = useFeatureFlag('oneci_verification');
  const [nni, setNni] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    setLoading(true);

    try {
      if (oneciEnabled) {
        // Vérification automatique via ONECI
        const response = await fetch('/functions/v1/oneci-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nni })
        });

        const result = await response.json();
        
        if (result.verified) {
          toast.success("Identité vérifiée avec succès !");
        } else {
          toast.error("Échec de la vérification");
        }
      } else {
        // Vérification manuelle (fallback)
        toast.info("Vérification manuelle requise. Un agent vous contactera.");
        // Créer une demande de vérification manuelle
        await createManualVerificationRequest(nni);
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2>Vérification d'Identité</h2>
      
      {oneciEnabled && (
        <div className="bg-green-50 p-4 rounded">
          ✅ Vérification automatique activée
        </div>
      )}

      <Input
        placeholder="Numéro National d'Identification"
        value={nni}
        onChange={(e) => setNni(e.target.value)}
      />

      <Button onClick={handleVerification} disabled={loading}>
        {oneciEnabled ? "Vérifier automatiquement" : "Demander vérification manuelle"}
      </Button>
    </div>
  );
}
```

### Exemple 2 : Méthodes de Paiement Dynamiques

```tsx
import { useFeatureFlags } from "@/hooks/useFeatureFlag";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAYMENT_METHODS = [
  { key: 'orange_money', name: 'Orange Money', icon: '🟠', color: 'orange' },
  { key: 'mtn_money', name: 'MTN Money', icon: '🟡', color: 'yellow' },
  { key: 'moov_money', name: 'Moov Money', icon: '🔵', color: 'blue' },
  { key: 'wave_payment', name: 'Wave', icon: '🌊', color: 'cyan' },
];

function PaymentSelection({ amount, onPaymentComplete }) {
  const flags = useFeatureFlags(PAYMENT_METHODS.map(m => m.key));

  const availableMethods = PAYMENT_METHODS.filter(
    method => flags[method.key]?.isEnabled
  );

  if (availableMethods.length === 0) {
    return (
      <div className="text-center p-8">
        <p>Aucune méthode de paiement disponible pour le moment.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Veuillez contacter le support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2>Choisissez votre méthode de paiement</h2>
      <p className="text-muted-foreground">Montant: {amount} FCFA</p>

      <div className="grid grid-cols-2 gap-4">
        {availableMethods.map(method => (
          <Card
            key={method.key}
            className="p-4 cursor-pointer hover:shadow-lg transition"
            onClick={() => initiatePayment(method.key, amount)}
          >
            <div className="text-4xl mb-2">{method.icon}</div>
            <div className="font-medium">{method.name}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Exemple 3 : Signature avec Fallback

```tsx
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { Button } from "@/components/ui/button";
import { Shield, FileSignature } from "lucide-react";

function ContractSignature({ contractId }) {
  const { isEnabled: cryptoneoEnabled } = useFeatureFlag('cryptoneo_signature');
  const { isEnabled: simpleSignatureEnabled } = useFeatureFlag('electronic_signature');

  const handleSign = async () => {
    if (cryptoneoEnabled) {
      // Signature avec CEV CryptoNeo (valeur juridique)
      await signWithCryptoNeo(contractId);
    } else if (simpleSignatureEnabled) {
      // Signature électronique simple (sans CEV)
      await signWithSimpleSignature(contractId);
    } else {
      // Signature manuelle (impression + scan)
      await requestManualSignature(contractId);
    }
  };

  return (
    <div className="space-y-4">
      <h2>Signature du Contrat</h2>

      {cryptoneoEnabled && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-medium">Signature Certifiée ANSUT</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Votre signature sera certifiée par l'ANSUT avec un Certificat Électronique de Validité (CEV).
          </p>
        </div>
      )}

      {!cryptoneoEnabled && simpleSignatureEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Signature Électronique Simple</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Signature électronique sans cachet électronique visible.
          </p>
        </div>
      )}

      <Button onClick={handleSign} className="w-full">
        {cryptoneoEnabled && "Signer avec CEV"}
        {!cryptoneoEnabled && simpleSignatureEnabled && "Signer électroniquement"}
        {!cryptoneoEnabled && !simpleSignatureEnabled && "Demander signature manuelle"}
      </Button>
    </div>
  );
}
```

---

## 📝 CONCLUSION

Le système de Feature Flags de Mon Toit offre une **flexibilité maximale** pour gérer le déploiement de fonctionnalités sans redéployer le code. Avec **45 flags pré-configurés**, une **interface admin intuitive**, et des **hooks React faciles à utiliser**, vous pouvez gérer toutes les fonctionnalités de la plateforme de manière granulaire.

### Prochaines Étapes

1. **Appliquer la migration SQL** pour créer les tables
2. **Déployer les Edge Functions** `manage-feature-flags` et `check-feature-flag`
3. **Accéder à l'interface admin** `/admin/feature-flags`
4. **Configurer les credentials** pour les services externes (ONECI, CryptoNeo, InTouch, etc.)
5. **Activer progressivement** les fonctionnalités selon vos besoins

### Support

Pour toute question ou problème, consultez la section [Troubleshooting](#troubleshooting) ou contactez l'équipe technique.

---

**Documentation créée par Manus AI**  
**Date : 21 novembre 2025**  
**Version : 1.0**

