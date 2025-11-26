# ✅ NeoFace Integration Complete - Mon Toit Platform

**Date:** 26 November 2025
**Status:** ✅ Fully Integrated & Operational
**Provider:** NeoFace by AINEO (https://neoface.aineo.ai)

---

## 📋 EXECUTIVE SUMMARY

NeoFace est **entièrement intégré** dans la plateforme Mon Toit pour la vérification biométrique faciale. L'intégration comprend:

- ✅ Edge Function Supabase déployée (`neoface-verify`)
- ✅ Composant React pour l'interface utilisateur
- ✅ Tables de base de données pour le tracking
- ✅ Fonctions PostgreSQL pour la gestion automatique
- ✅ Logs complets pour monitoring et audit

---

## 🎯 VUE D'ENSEMBLE

### Qu'est-ce que NeoFace?

NeoFace est un service de **vérification biométrique faciale** développé par AINEO qui permet de:
- Comparer une photo d'identité (CNI) avec un selfie en direct
- Détecter la vivacité (liveness detection)
- Calculer un score de correspondance (matching score)
- Valider l'identité de l'utilisateur

### Intégration dans Mon Toit

NeoFace est utilisé comme **étape 2 de la vérification d'identité**:

1. **Étape 1:** Vérification ONECI (CNI)
2. **Étape 2:** Vérification biométrique NeoFace ← **Vous êtes ici**
3. **Résultat:** `identity_verified = true` quand les 2 étapes sont validées

---

## 🏗️ ARCHITECTURE

### 1. Edge Function: `neoface-verify`

**Emplacement:** `/supabase/functions/neoface-verify/index.ts`

**Status:** ✅ Déployée et Active
**JWT Verification:** ✅ Activée (requiert authentification)

**Actions disponibles:**

#### A. Upload Document (Action 1)
```typescript
POST /functions/v1/neoface-verify
{
  "action": "upload_document",
  "cni_photo_url": "https://...",
  "user_id": "uuid"
}
```

**Processus:**
1. Télécharge l'image CNI depuis l'URL fournie
2. Envoie l'image à NeoFace API `/document_capture`
3. Reçoit un `document_id` unique
4. Crée une entrée dans `facial_verification_attempts`
5. Retourne le `document_id` et `selfie_url`

**Réponse:**
```json
{
  "success": true,
  "document_id": "abc123",
  "selfie_url": "https://neoface.aineo.ai/capture/abc123",
  "verification_id": "uuid",
  "provider": "neoface",
  "message": "Document téléchargé avec succès..."
}
```

#### B. Check Status (Action 2)
```typescript
POST /functions/v1/neoface-verify
{
  "action": "check_status",
  "document_id": "abc123",
  "verification_id": "uuid"
}
```

**Processus:**
1. Interroge NeoFace API `/match_verify`
2. Récupère le statut de vérification
3. Met à jour `facial_verification_attempts`
4. Si `verified`, met à jour `user_verifications`

**Statuts possibles:**
- `waiting` - En attente du selfie utilisateur
- `verified` - Vérification réussie ✅
- `failed` - Vérification échouée ❌

**Réponse:**
```json
{
  "status": "verified",
  "message": "Face verified successfully",
  "document_id": "abc123",
  "matching_score": 95.5,
  "verified_at": "2025-11-26T10:30:00Z",
  "provider": "neoface"
}
```

### 2. Composant React: `NeofaceVerification`

**Emplacement:** `/src/shared/ui/NeofaceVerification.tsx`

**Props:**
```typescript
interface NeofaceVerificationProps {
  userId: string;
  cniPhotoUrl: string;
  onVerified: (verificationData: any) => void;
  onFailed: (error: string) => void;
}
```

**Fonctionnalités:**
- 📸 Ouvre une fenêtre popup pour la capture du selfie
- 🔄 Polling automatique du statut (toutes les 3 secondes)
- ⏱️ Timeout de 5 minutes maximum
- ✅ Gestion des erreurs avec retry
- 📊 Affichage du score de correspondance

**États du composant:**
- `idle` - Prêt à démarrer
- `uploading` - Upload du document CNI en cours
- `waiting` - Attente du selfie utilisateur
- `polling` - Vérification du statut en cours
- `success` - Vérification réussie ✅
- `error` - Erreur rencontrée ❌

### 3. Page d'Utilisation: `IdentityVerificationPage`

**Emplacement:** `/src/features/auth/pages/IdentityVerificationPage.tsx`

**Intégration:**
```typescript
import NeofaceVerification from '@/shared/ui/NeofaceVerification';

// Dans le composant (ligne 54)
const [useNeoface, setUseNeoface] = useState(true);
const [useSmileless, setUseSmileless] = useState(false);

// Utilisation
{useNeoface && oneciPreview && (
  <NeofaceVerification
    userId={user.id}
    cniPhotoUrl={oneciPreview}
    onVerified={handleNeofaceVerified}
    onFailed={handleNeofaceFailed}
  />
)}
```

---

## 💾 BASE DE DONNÉES

### 1. Table: `user_verifications`

**Champs NeoFace:**
```sql
face_verified BOOLEAN DEFAULT false
face_verified_at TIMESTAMPTZ
face_verification_provider TEXT  -- 'neoface'
face_verification_reference TEXT -- verification_id
identity_verified BOOLEAN DEFAULT false -- true si ONECI + face OK
```

**Logique:**
```sql
identity_verified = (oneci_verified = true) AND (face_verified = true)
```

### 2. Table: `facial_verification_attempts`

**Structure:**
```sql
CREATE TABLE facial_verification_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  provider TEXT NOT NULL,              -- 'neoface'
  document_id TEXT,                    -- NeoFace document_id
  selfie_url TEXT,                     -- URL de capture
  status TEXT DEFAULT 'pending',       -- pending, passed, failed
  matching_score NUMERIC(5, 2),       -- 0-100
  is_match BOOLEAN,                    -- Face matching result
  is_live BOOLEAN,                     -- Liveness detection
  provider_response JSONB,             -- Réponse complète API
  failure_reason TEXT,                 -- En cas d'échec
  attempt_number INTEGER DEFAULT 1,    -- Numéro de tentative
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Utilité:** Audit trail complet de toutes les tentatives de vérification

### 3. Table: `service_usage_logs`

**Structure:**
```sql
CREATE TABLE service_usage_logs (
  id UUID PRIMARY KEY,
  service_name TEXT NOT NULL,      -- 'face_recognition'
  provider TEXT NOT NULL,           -- 'neoface'
  status TEXT NOT NULL,             -- success, failure, pending
  error_message TEXT,
  response_time_ms INTEGER,         -- Performance tracking
  metadata JSONB,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**Utilité:** Monitoring des appels API, performance, taux d'erreur

### 4. Fonctions PostgreSQL

#### A. `log_facial_verification_attempt`
```sql
SELECT log_facial_verification_attempt(
  p_user_id := 'user-uuid',
  p_provider := 'neoface',
  p_document_id := 'doc123',
  p_selfie_url := 'https://...'
) AS verification_id;
```

**Rôle:** Crée une nouvelle entrée dans `facial_verification_attempts`

#### B. `update_facial_verification_status`
```sql
SELECT update_facial_verification_status(
  p_verification_id := 'verif-uuid',
  p_status := 'passed',
  p_matching_score := 95.5,
  p_provider_response := '{"status": "verified"}',
  p_is_match := true,
  p_is_live := true,
  p_failure_reason := NULL
);
```

**Rôle:**
1. Met à jour `facial_verification_attempts`
2. Si `passed`, met à jour `user_verifications.face_verified = true`
3. Si ONECI + face vérifiés, met `identity_verified = true`

---

## ⚙️ CONFIGURATION

### Variables d'Environnement

**Dans Supabase Edge Functions:**
```env
NEOFACE_API_BASE=https://neoface.aineo.ai/api/v2
NEOFACE_BEARER_TOKEN=7JpTxE9Io6ZFIZN96bS8UZkkCbsC0h8kY4hXEVmVoYOZdPoC1TNOhWHyudUuOSQp
```

**Dans Frontend (.env):**
```env
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

### Endpoints NeoFace API

1. **Document Capture**
   - URL: `https://neoface.aineo.ai/api/v2/document_capture`
   - Method: POST (multipart/form-data)
   - Params: `token`, `doc_file`

2. **Match Verify**
   - URL: `https://neoface.aineo.ai/api/v2/match_verify`
   - Method: POST (application/json)
   - Params: `token`, `document_id`

---

## 🔄 WORKFLOW COMPLET

### 1. Upload du Document CNI

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/neoface-verify`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'upload_document',
    cni_photo_url: 'https://storage.supabase.co/...',
    user_id: user.id
  })
});

const { document_id, selfie_url, verification_id } = await response.json();
```

### 2. Capture du Selfie par l'Utilisateur

```typescript
// Ouvrir une popup pour la capture
const popup = window.open(
  selfie_url,
  'neoface-capture',
  'width=600,height=800'
);
```

L'utilisateur:
1. Autorise l'accès à sa webcam
2. Positionne son visage dans le cadre
3. La capture est automatique
4. La popup se ferme

### 3. Polling du Statut

```typescript
const intervalId = setInterval(async () => {
  const statusResponse = await fetch(`${SUPABASE_URL}/functions/v1/neoface-verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'check_status',
      document_id: document_id,
      verification_id: verification_id
    })
  });

  const { status, matching_score } = await statusResponse.json();

  if (status === 'verified') {
    clearInterval(intervalId);
    onVerified({ matching_score, verified_at: new Date() });
  } else if (status === 'failed') {
    clearInterval(intervalId);
    onFailed('Verification failed');
  }
}, 3000); // Toutes les 3 secondes
```

### 4. Mise à Jour Automatique de la Base

Quand le statut devient `verified`:

1. **`facial_verification_attempts`** est mis à jour:
   ```sql
   UPDATE facial_verification_attempts
   SET status = 'passed',
       matching_score = 95.5,
       is_match = true,
       is_live = true
   WHERE id = verification_id;
   ```

2. **`user_verifications`** est mis à jour:
   ```sql
   UPDATE user_verifications
   SET face_verified = true,
       face_verified_at = now(),
       face_verification_provider = 'neoface',
       face_verification_reference = verification_id
   WHERE user_id = user_id;
   ```

3. **Si ONECI est aussi vérifié:**
   ```sql
   UPDATE user_verifications
   SET identity_verified = true,
       identity_verified_at = now()
   WHERE user_id = user_id
     AND oneci_verified = true
     AND face_verified = true;
   ```

---

## 📊 MONITORING & LOGS

### Service Usage Logs

Chaque appel à NeoFace API est enregistré:

```sql
SELECT
  service_name,
  provider,
  status,
  COUNT(*) as calls,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE status = 'success') as success_count,
  COUNT(*) FILTER (WHERE status = 'failure') as failure_count
FROM service_usage_logs
WHERE provider = 'neoface'
  AND timestamp > now() - interval '24 hours'
GROUP BY service_name, provider, status;
```

### Verification Attempts Analytics

```sql
SELECT
  user_id,
  provider,
  status,
  AVG(matching_score) as avg_score,
  COUNT(*) as attempts,
  MAX(created_at) as last_attempt
FROM facial_verification_attempts
WHERE provider = 'neoface'
GROUP BY user_id, provider, status
ORDER BY last_attempt DESC;
```

---

## 🔒 SÉCURITÉ & RLS

### Policies Configurées

**`facial_verification_attempts`:**
- Users can view own attempts
- Admins can view all attempts

**`service_usage_logs`:**
- Only admins can view service logs

**Edge Function:**
- JWT verification activée
- Authentification requise pour tous les appels

---

## 🎨 INTERFACE UTILISATEUR

### Composants Visuels

Le composant `NeofaceVerification` utilise:
- 📸 `Camera` icon - Capture en cours
- ✅ `CheckCircle` icon - Vérification réussie
- ❌ `XCircle` icon - Échec
- 🔄 `Loader2` icon - Chargement
- ⚠️ `AlertCircle` icon - Avertissements
- 🔄 `RefreshCw` icon - Retry

### États Visuels

1. **Idle** - Bouton "Démarrer la vérification"
2. **Upload** - "Téléchargement du document..."
3. **Waiting** - "En attente du selfie... [Progress bar]"
4. **Polling** - "Vérification en cours... [Spinner]"
5. **Success** - "✅ Vérification réussie! Score: 95.5%"
6. **Error** - "❌ Échec de la vérification. [Retry button]"

---

## 🧪 TESTS & VALIDATION

### Test Manuel

1. **Accéder à la page:**
   ```
   /identity-verification
   ```

2. **Compléter la vérification ONECI:**
   - Télécharger une photo CNI
   - Remplir les informations
   - Soumettre

3. **Lancer NeoFace:**
   - Cliquer sur "Vérification biométrique"
   - Autoriser la webcam dans la popup
   - Capturer le selfie
   - Attendre la vérification

4. **Vérifier les résultats:**
   ```sql
   SELECT * FROM facial_verification_attempts
   WHERE user_id = 'votre-user-id'
   ORDER BY created_at DESC LIMIT 1;
   ```

### Test des Edge Functions

```bash
curl -X POST \
  https://votre-projet.supabase.co/functions/v1/neoface-verify \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "upload_document",
    "cni_photo_url": "https://example.com/cni.jpg",
    "user_id": "user-uuid"
  }'
```

---

## 🔧 ALTERNATIVE: Smileless

**Le projet supporte 2 providers:**

### NeoFace (par défaut)
- Provider officiel recommandé
- Meilleure précision
- Liveness detection avancée
- Configuration actuelle

### Smileless (alternative)
- Edge Function: `/smileless-face-verify`
- Composant: `SmilelessVerification`
- Peut être activé en changeant `useNeoface = false`

**Basculer vers Smileless:**
```typescript
// Dans IdentityVerificationPage.tsx ligne 54-55
const [useNeoface, setUseNeoface] = useState(false);
const [useSmileless, setUseSmileless] = useState(true);
```

---

## 📚 FICHIERS CLÉS

### Backend
- ✅ `/supabase/functions/neoface-verify/index.ts` - Edge Function
- ✅ Migration: `add_neoface_support_functions.sql`

### Frontend
- ✅ `/src/shared/ui/NeofaceVerification.tsx` - Composant React
- ✅ `/src/features/auth/pages/IdentityVerificationPage.tsx` - Page d'utilisation

### Base de Données
- ✅ Table: `user_verifications`
- ✅ Table: `facial_verification_attempts`
- ✅ Table: `service_usage_logs`
- ✅ Function: `log_facial_verification_attempt()`
- ✅ Function: `update_facial_verification_status()`

### Documentation
- ✅ `SMILE_ID_REMOVAL_COMPLETE.md` - Historique de migration
- ✅ `SMILELESS_INTEGRATION_COMPLETE.md` - Alternative Smileless
- ✅ Ce document - Documentation complète NeoFace

---

## ✅ STATUT D'INTÉGRATION

| Composant | Statut | Notes |
|-----------|--------|-------|
| Edge Function | ✅ DEPLOYED | Active et fonctionnelle |
| Database Tables | ✅ EXISTS | Toutes créées |
| PostgreSQL Functions | ✅ EXISTS | Logs et mise à jour automatique |
| React Component | ✅ READY | Interface complète |
| Page Integration | ✅ READY | Utilisable immédiatement |
| RLS Policies | ✅ CONFIGURED | Sécurité en place |
| Monitoring | ✅ CONFIGURED | Logs et analytics |

---

## 🚀 UTILISATION IMMÉDIATE

**NeoFace est prêt à l'emploi !**

1. Les utilisateurs peuvent maintenant:
   - Compléter leur vérification ONECI
   - Puis lancer la vérification biométrique NeoFace
   - Obtenir le statut `identity_verified = true`

2. Les admins peuvent:
   - Monitorer les tentatives de vérification
   - Consulter les logs d'utilisation
   - Analyser les taux de succès

3. Le système gère automatiquement:
   - L'upload des documents
   - La capture du selfie
   - La vérification biométrique
   - La mise à jour de la base de données
   - Le logging complet

---

## 🎯 PROCHAINES ÉTAPES (OPTIONNEL)

Pour améliorer l'intégration:

1. **Dashboard Admin:**
   - Créer une page de monitoring NeoFace
   - Statistiques de vérification en temps réel

2. **Notifications:**
   - Email/SMS quand vérification complétée
   - Rappels si vérification incomplète

3. **Retry Logic:**
   - Limiter le nombre de tentatives (ex: 3 max)
   - Cooldown entre tentatives

4. **Analytics Avancés:**
   - Taux de conversion
   - Temps moyen de vérification
   - Points de friction

---

## 📞 SUPPORT

**API NeoFace:**
- Website: https://neoface.aineo.ai
- Documentation API: https://neoface.aineo.ai/docs

**Questions Techniques:**
- Consulter ce document
- Vérifier les logs dans `service_usage_logs`
- Examiner `facial_verification_attempts` pour l'audit trail

---

**Document créé:** 26 November 2025
**Auteur:** AI Assistant
**Status:** ✅ NeoFace entièrement intégré et opérationnel
