# 🔑 Référence des Clés API - Mon Toit

Ce document liste toutes les clés API utilisées dans l'application Mon Toit et leur localisation dans le nouveau système de configuration centralisé.

## 📍 Emplacement Central

Toutes les clés API sont maintenant centralisées dans :
```
src/config/api-keys.config.ts
```

## 🔐 Clés API par Service

### 1. Supabase (Base de données & Authentification)
**Statut** : ✅ Obligatoire

```typescript
import { apiKeysConfig } from '@config';

const url = apiKeysConfig.supabase.url;
const anonKey = apiKeysConfig.supabase.anonKey;
const serviceRoleKey = apiKeysConfig.supabase.serviceRoleKey; // Optionnel
```

**Variables d'environnement** :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optionnel, backend seulement)

**Utilisation** :
- Base de données PostgreSQL
- Authentification utilisateurs
- Storage de fichiers
- Realtime subscriptions

---

### 2. Azure OpenAI (Chatbot IA)
**Statut** : ⚠️ Optionnel (chatbot indisponible si non configuré)

```typescript
const openaiConfig = apiKeysConfig.azure.openai;

if (openaiConfig.isConfigured) {
  const key = openaiConfig.key;
  const endpoint = openaiConfig.endpoint;
  const deploymentName = openaiConfig.deploymentName; // gpt-4o-mini
  const apiVersion = openaiConfig.apiVersion; // 2024-10-21
}
```

**Variables d'environnement** :
- `VITE_AZURE_OPENAI_API_KEY`
- `VITE_AZURE_OPENAI_ENDPOINT`
- `VITE_AZURE_OPENAI_DEPLOYMENT_NAME`
- `VITE_AZURE_OPENAI_API_VERSION`

**Utilisation** :
- Assistant virtuel SUTA
- Génération de descriptions de propriétés
- Recommandations intelligentes
- Détection d'arnaques

**Valeur Actuelle** :
- API Key : `Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JTACi9YtNkJEIiWV4pRjMiJQQJ99BJACYeBjFXJ3w3AAAAACOG2jwX`
- Endpoint : `https://dtdi-ia-test.openai.azure.com/`

---

### 3. Azure AI Services (Vision, Forms, etc.)
**Statut** : ⚠️ Optionnel

```typescript
const aiServices = apiKeysConfig.azure.aiServices;

if (aiServices.isConfigured) {
  const key = aiServices.key;
  const endpoint = aiServices.endpoint;
}
```

**Variables d'environnement** :
- `VITE_AZURE_AI_SERVICES_API_KEY`
- `VITE_AZURE_AI_SERVICES_ENDPOINT`

**Utilisation** :
- Analyse d'images de propriétés
- OCR pour documents
- Modération de contenu
- Extraction de données

**Valeur Actuelle** :
- API Key : `Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JTACi9YtNkJEIiWV4pRjMiJQQJ99BJACYeBjFXJ3w3AAAAACOG2jwX`
- Endpoint : `https://dtdi-ia-test.cognitiveservices.azure.com/`

---

### 4. Azure Speech Services
**Statut** : ⚠️ Optionnel

```typescript
const speech = apiKeysConfig.azure.speech;

if (speech.isConfigured) {
  const key = speech.key;
  const region = speech.region;
  const sttEndpoint = speech.sttEndpoint;
  const ttsEndpoint = speech.ttsEndpoint;
}
```

**Variables d'environnement** :
- `AZURE_SPEECH_API_KEY`
- `AZURE_SPEECH_REGION`
- `AZURE_SPEECH_STT_ENDPOINT`
- `AZURE_SPEECH_TTS_ENDPOINT`

**Utilisation** :
- Recherche vocale
- Lecture audio des annonces
- Accessibilité

**Valeur Actuelle** :
- API Key : `Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JTACi9YtNkJEIiWV4pRjMiJQQJ99BJACYeBjFXJ3w3AAAAACOG2jwX`
- Region : `eastus`

---

### 5. Mapbox (Cartes Interactives)
**Statut** : ⚠️ Optionnel (cartes indisponibles si non configuré)

```typescript
const mapbox = apiKeysConfig.maps.mapbox;

if (mapbox.isConfigured) {
  const key = mapbox.key;
}
```

**Variables d'environnement** :
- `VITE_MAPBOX_PUBLIC_TOKEN`

**Utilisation** :
- Cartes interactives
- Géolocalisation
- Recherche par zone

**Valeur Actuelle** :
- Token : `pk.eyJ1IjoicHNvbWV0IiwiYSI6ImNtYTgwZ2xmMzEzdWcyaXM2ZG45d3A4NmEifQ.MYXzdc5CREmcvtBLvfV0Lg`

---

### 6. Google Maps
**Statut** : ⚠️ Optionnel

```typescript
const googleMaps = apiKeysConfig.maps.googleMaps;

if (googleMaps.isConfigured) {
  const key = googleMaps.key;
}
```

**Variables d'environnement** :
- `VITE_GOOGLE_MAPS_API_KEY`

**Utilisation** :
- Alternative à Mapbox
- Intégration Google Maps

**Valeur Actuelle** :
- API Key : `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`

---

### 7. IN TOUCH (Paiements Mobile Money)
**Statut** : ⚠️ Optionnel (paiements indisponibles si non configuré)

```typescript
const inTouch = apiKeysConfig.payment.inTouch;

if (inTouch.isConfigured) {
  const baseUrl = inTouch.baseUrl;
  const username = inTouch.username;
  const password = inTouch.password;
  const partnerId = inTouch.partnerId;
  const loginApi = inTouch.loginApi;
  const passwordApi = inTouch.passwordApi;
}
```

**Variables d'environnement** :
- `VITE_INTOUCH_BASE_URL`
- `VITE_INTOUCH_USERNAME`
- `VITE_INTOUCH_PASSWORD`
- `VITE_INTOUCH_PARTNER_ID`
- `VITE_INTOUCH_LOGIN_API`
- `VITE_INTOUCH_PASSWORD_API`

**Utilisation** :
- Paiements Orange Money
- Paiements MTN Money
- Paiements Moov Money
- Paiements Wave
- Envoi de SMS
- Transferts d'argent

**Valeurs Actuelles** :
- Base URL : `https://apidist.gutouch.net`
- Username : `8ff019758878d5cdab335d12fbc998721d319e4159e2086f9cb1f15f23896e10`
- Password : `d3fd092d16747333547e340e4aac135888ff90c38e9577cadec41a052a507978`
- Partner ID : `CI300373`
- Login API : `07084598370`

---

### 8. NeoFace (Vérification Faciale)
**Statut** : ⚠️ Optionnel

```typescript
const neoface = apiKeysConfig.verification.neoface;

if (neoface.isConfigured) {
  const key = neoface.key;
  const apiBase = neoface.apiBase;
}
```

**Variables d'environnement** :
- `NEOFACE_BEARER_TOKEN`
- `NEOFACE_API_BASE`

**Utilisation** :
- Vérification biométrique faciale
- Anti-fraude
- KYC (Know Your Customer)

**Valeur Actuelle** :
- Bearer Token : `7JpTxE9Io6ZFIZN96bS8UZkkCbsC0h8kY4hXEVmVoYOZdPoC1TNOhWHyudUuOSQp`
- API Base : `https://neoface.aineo.ai/api/v2`

---

### 9. Smileless (Vérification Faciale - Fallback)
**Statut** : ⚠️ Optionnel

```typescript
const smileless = apiKeysConfig.verification.smileless;

if (smileless.isConfigured) {
  const key = smileless.key;
  const apiBase = smileless.apiBase;
}
```

**Variables d'environnement** :
- `SMILELESS_TOKEN`
- `SMILELESS_API_BASE`

**Utilisation** :
- Vérification faciale alternative
- Fallback pour NeoFace

**Valeur Actuelle** :
- Token : `7JpTxE9Io6ZFIZN96bS8UZkkCbsC0h8kY4hXEVmVoYOZdPoC1TNOhWHyudUuOSQp`
- API Base : `https://neoface.aineo.ai/api`

---

### 10. Smile ID (Vérification d'Identité)
**Statut** : ⚠️ Optionnel

```typescript
const smileId = apiKeysConfig.verification.smileId;

if (smileId.isConfigured) {
  const partnerId = smileId.partnerId;
  const apiKey = smileId.apiKey;
  const environment = smileId.environment; // 'sandbox' | 'production'
}
```

**Variables d'environnement** :
- `SMILE_ID_PARTNER_ID`
- `SMILE_ID_API_KEY`
- `SMILE_ID_ENVIRONMENT`

**Utilisation** :
- Vérification d'identité complète
- Vérification de documents

**Valeur Actuelle** :
- Partner ID : `7685`
- API Key : `965535ad-7ca6-45f4-a207-00f88e47c946`
- Environment : `sandbox`

---

### 11. CryptoNeo (Signature Électronique)
**Statut** : ⚠️ Optionnel (signature indisponible si non configuré)

```typescript
const cryptoneo = apiKeysConfig.signature.cryptoneo;

if (cryptoneo.isConfigured) {
  const appKey = cryptoneo.appKey;
  const appSecret = cryptoneo.appSecret;
  const baseUrl = cryptoneo.baseUrl;
}
```

**Variables d'environnement** :
- `CRYPTONEO_APP_KEY`
- `CRYPTONEO_APP_SECRET`
- `CRYPTONEO_BASE_URL`

**Utilisation** :
- Signature électronique légale
- Certificats numériques
- Conformité juridique ivoirienne

**Valeurs Actuelles** :
- App Key : `f1e12a-d652-a757-b968-4784-3b062142`
- App Secret : `4a76-b456-c170-a774-410b-b0a5-9c67-b20c`
- Base URL : `https://ansut.cryptoneoplatforms.com/esignaturedemo`

---

### 12. Resend (Service Email)
**Statut** : ⚠️ Optionnel

```typescript
const email = apiKeysConfig.communication.email;

if (email.isConfigured) {
  const key = email.key;
  const fromEmail = email.fromEmail;
  const domain = email.domain;
}
```

**Variables d'environnement** :
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_DOMAIN`

**Utilisation** :
- Emails transactionnels
- Notifications par email
- Réinitialisation mot de passe

**Valeurs Actuelles** :
- API Key : `re_DvxxTkmv_KLgX7D1LSvr4tVZK1EUtRLv9`
- From Email : `no-reply@notifications.ansut.ci`
- Domain : `notifications.ansut.ci`

---

### 13. Brevo (Service SMS)
**Statut** : ⚠️ Optionnel

```typescript
const sms = apiKeysConfig.communication.sms;

if (sms.isConfigured) {
  const key = sms.key;
}
```

**Variables d'environnement** :
- `BREVO_API_KEY`

**Utilisation** :
- Envoi de SMS
- Notifications push
- Codes OTP

**Valeur Actuelle** :
- API Key : `sbp_cc242aed6acfb7f01e92cce48993e147bb2c1586`

---

### 14. Gemini (LLM Alternatif - Google)
**Statut** : ⚠️ Optionnel

```typescript
const gemini = apiKeysConfig.llm.gemini;

if (gemini.isConfigured) {
  const key = gemini.key;
  const endpoint = gemini.endpoint;
}
```

**Variables d'environnement** :
- `GEMINI_API_KEY`

**Utilisation** :
- Alternative à Azure OpenAI
- Traitement du langage naturel

**Valeur Actuelle** :
- API Key : `AIzaSyCjSdMI581gAe9QsNVcOGCJtzGpMi7sF2E`

---

### 15. DeepSeek (LLM Alternatif)
**Statut** : ⚠️ Optionnel

```typescript
const deepseek = apiKeysConfig.llm.deepseek;

if (deepseek.isConfigured) {
  const key = deepseek.key;
  const endpoint = deepseek.endpoint;
}
```

**Variables d'environnement** :
- `DEEPSEEK_API_KEY`

**Utilisation** :
- Alternative à Azure OpenAI
- Analyse de code

**Valeur Actuelle** :
- API Key : `sk-ba402bc4e2fb48ecb123408de3456564`

---

## 📊 Résumé des Services

| Service | Statut | Impact si manquant |
|---------|--------|-------------------|
| Supabase | ✅ Obligatoire | Application non fonctionnelle |
| Azure OpenAI | ⚠️ Optionnel | Chatbot indisponible |
| Azure AI Services | ⚠️ Optionnel | Fonctionnalités IA réduites |
| Azure Speech | ⚠️ Optionnel | Pas de recherche vocale |
| Mapbox | ⚠️ Optionnel | Pas de cartes |
| Google Maps | ⚠️ Optionnel | Alternative à Mapbox |
| IN TOUCH | ⚠️ Optionnel | Pas de paiements Mobile Money |
| NeoFace | ⚠️ Optionnel | Pas de vérification faciale |
| Smileless | ⚠️ Optionnel | Fallback pour NeoFace |
| Smile ID | ⚠️ Optionnel | Alternative vérification |
| CryptoNeo | ⚠️ Optionnel | Pas de signature électronique |
| Resend | ⚠️ Optionnel | Pas d'emails transactionnels |
| Brevo | ⚠️ Optionnel | Pas de SMS |
| Gemini | ⚠️ Optionnel | Alternative LLM |
| DeepSeek | ⚠️ Optionnel | Alternative LLM |

## 🔍 Validation de la Configuration

Pour vérifier quels services sont configurés :

```typescript
import { apiKeysConfig } from '@config';

// Validation complète
const validation = apiKeysConfig.validateConfiguration();

console.log('Configuration valide:', validation.isValid);
console.log('Services manquants:', validation.missing);
console.log('Avertissements:', validation.warnings);

// Statut de chaque service
const status = apiKeysConfig.getServiceStatus();
console.log('Statut des services:', status);

// Log formaté dans la console
apiKeysConfig.logConfiguration();
```

## 🔒 Sécurité

**⚠️ IMPORTANT** :
- **JAMAIS** commiter les clés API dans le code
- Toujours utiliser les variables d'environnement
- Ne pas partager le fichier `.env`
- Utiliser `.env.example` pour documenter les variables requises
- Rotation régulière des clés sensibles

## 📝 Migration

Si vous devez migrer un ancien code utilisant directement `import.meta.env` :

```typescript
// ❌ Ancien code
const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;

// ✅ Nouveau code
import { apiKeysConfig } from '@config';
const apiKey = apiKeysConfig.azure.openai.key;

// ✅ Avec vérification
if (apiKeysConfig.azure.openai.isConfigured) {
  const apiKey = apiKeysConfig.azure.openai.key;
  // Utiliser le service
}
```

## 📞 Support

Pour toute question sur la configuration des clés API :
- Email : support@montoit.ci
- Documentation : [ARCHITECTURE.md](./ARCHITECTURE.md)
