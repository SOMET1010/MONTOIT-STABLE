# Guide de Déploiement Production - Mon Toit Platform

**Version:** 3.2.1
**Date:** 23 Novembre 2024
**Status:** Ready for Production

---

## 📋 Checklist Pré-Déploiement

### ✅ Code Quality
- [x] Build réussit sans erreurs TypeScript
- [x] Code obsolète supprimé (10 fichiers .old/.backup)
- [x] Logger centralisé implémenté
- [x] PDF lazy loading configuré
- [x] Suspense boundaries ajoutés
- [x] Payment store connecté au repository
- [ ] Tests coverage ≥ 30% (TODO)
- [ ] Linting errors = 0 (TODO)

### ✅ Performance
- [x] Bundle size optimisé (<600KB gzip initial)
- [x] Code splitting configuré
- [x] Lazy loading routes
- [x] Tree-shaking lucide-react
- [ ] Images WebP conversion (TODO)
- [ ] Service Worker cache (TODO)

### ✅ Sécurité
- [x] Logger ne leak pas de données sensibles
- [x] Row Level Security (RLS) activé sur toutes tables
- [ ] Variables env production vérifiées (TODO)
- [ ] Rate limiting API (TODO)
- [ ] HTTPS forcé (TODO)
- [ ] CSP headers configurés (TODO)

---

## 🔧 Configuration Variables d'Environnement

### Production `.env`

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# API Keys - À CONFIGURER
VITE_MAPBOX_TOKEN=pk.your-mapbox-token
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Sentry (Monitoring)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
VITE_SENTRY_ENVIRONMENT=production

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_FACIAL_VERIFICATION=false
```

### ⚠️ Variables Sensibles

**NE JAMAIS exposer côté client:**
- `SUPABASE_SERVICE_ROLE_KEY` (backend only)
- API secrets
- Private keys
- Webhook secrets

**Safe pour client:**
- `VITE_SUPABASE_URL` ✅
- `VITE_SUPABASE_ANON_KEY` ✅ (lecture publique OK avec RLS)
- `VITE_MAPBOX_TOKEN` ✅
- `VITE_GA_TRACKING_ID` ✅

---

## 🚀 Étapes de Déploiement

### 1. Build Production

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Type check
npm run typecheck

# Linting
npm run lint

# Build optimized
npm run build

# Preview locally
npm run preview
```

### 2. Vérifier Bundle

```bash
# Analyser bundle sizes
npm run build:analyze

# Vérifier fichiers dist/
ls -lh dist/assets/*.js
```

**Limites acceptables:**
- Initial JS: <200KB gzip
- Vendor bundles: <500KB gzip
- Feature chunks: <100KB gzip each

### 3. Tests Pré-Production

```bash
# Tests unitaires
npm test

# Tests E2E (si disponibles)
npm run test:e2e

# Tests manuels critiques:
# - Inscription/Connexion
# - Recherche propriétés
# - Paiement mobile money
# - Messages
# - Vérification identité
```

---

## 🌐 Déploiement Netlify (Recommandé)

### Configuration `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Commandes Déploiement

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy preview
netlify deploy

# Deploy production
netlify deploy --prod
```

---

## 🔍 Configuration Supabase Production

### 1. Database

```bash
# Appliquer toutes migrations
supabase db push

# Vérifier RLS
supabase db rls verify

# Backup database
pg_dump your-db-url > backup-$(date +%Y%m%d).sql
```

### 2. Edge Functions

```bash
# Deploy toutes les Edge Functions
npm run deploy:functions

# Ou manuellement:
supabase functions deploy ai-chatbot
supabase functions deploy intouch-payment
supabase functions deploy send-sms
# ... etc
```

### 3. Storage Buckets

Vérifier permissions RLS sur buckets:
- `property-images` - RLS enabled
- `profile-images` - RLS enabled
- `documents` - RLS enabled

---

## 📊 Monitoring Production

### Sentry Setup

```typescript
// src/lib/sentry.ts (déjà configuré)
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
  tracesSampleRate: 0.1, // 10% sampling
  beforeSend(event) {
    // Filtrer données sensibles
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['Authorization'];
    }
    return event;
  },
});
```

### Google Analytics

```typescript
// src/lib/analytics.ts (déjà configuré)
import ReactGA from 'react-ga4';

ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID);
```

### Métriques à Surveiller

**Performance:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

**Erreurs:**
- JavaScript errors rate
- API errors rate
- Payment failures rate

**Business:**
- Inscriptions/jour
- Propriétés publiées/jour
- Messages envoyés/jour
- Paiements réussis/jour

---

## 🔐 Sécurité Production

### Rate Limiting

**À implémenter sur Edge Functions:**

```typescript
// middleware/rateLimiter.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requêtes
  duration: 60, // par 60 secondes
});

export async function checkRateLimit(userId: string) {
  try {
    await rateLimiter.consume(userId);
    return true;
  } catch {
    throw new Error('Rate limit exceeded');
  }
}
```

### Content Security Policy

**Headers à ajouter:**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://*.supabase.co https://api.mapbox.com;
  connect-src 'self' https://*.supabase.co https://api.mapbox.com;
  frame-ancestors 'none';
```

### HTTPS Enforcement

```javascript
// Redirect HTTP → HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

---

## 🆘 Troubleshooting Production

### Build Fails

```bash
# Clear cache
rm -rf node_modules .vite dist
npm install
npm run build
```

### Environment Variables Not Working

```bash
# Vérifier variables sont préfixées VITE_
echo $VITE_SUPABASE_URL

# Rebuild après changement env
npm run build
```

### Database Connection Issues

```bash
# Test connexion
curl https://your-project.supabase.co/rest/v1/

# Vérifier RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Performance Issues

```bash
# Analyser bundle
npm run build:analyze

# Vérifier lazy loading
grep -r "lazy(() => import" src/app/routes.tsx

# Check bundle sizes
ls -lh dist/assets/*.js | sort -k5 -h
```

---

## 📝 Post-Déploiement

### Vérifications Immédiat

1. ✅ Site accessible via HTTPS
2. ✅ Inscription/Connexion fonctionne
3. ✅ Recherche propriétés charge
4. ✅ Images s'affichent
5. ✅ Aucune erreur JavaScript console
6. ✅ Sentry reçoit events
7. ✅ Google Analytics track pages

### Monitoring 24h

- Surveiller errors Sentry
- Vérifier performance metrics
- Tester flows critiques
- Monitorer database load

### Rollback Plan

```bash
# Si problème critique:
git revert HEAD
npm run build
netlify deploy --prod

# Ou rollback dans Netlify UI
# Deployments > Previous deploy > Publish
```

---

## 🔄 CI/CD Pipeline (Recommandé)

### GitHub Actions `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

---

## 📞 Support & Contacts

**Équipe Technique:**
- DevOps: devops@montoit.ci
- Backend: backend@montoit.ci
- Frontend: frontend@montoit.ci

**Urgences Production:**
- Tel: +225 XX XX XX XX XX
- Email: urgent@montoit.ci
- Slack: #production-alerts

---

## 📚 Ressources

**Documentation:**
- [Supabase Docs](https://supabase.com/docs)
- [Vite Production](https://vitejs.dev/guide/build.html)
- [Netlify Deploy](https://docs.netlify.com/)
- [Sentry Setup](https://docs.sentry.io/)

**Monitoring:**
- Sentry Dashboard: https://sentry.io/montoit
- Google Analytics: https://analytics.google.com
- Supabase Dashboard: https://supabase.com/dashboard

---

**✅ Prêt pour Production!**

Ce guide couvre tous les aspects critiques du déploiement. Suivez les étapes dans l'ordre et vérifiez chaque checkpoint avant de continuer.

Pour questions ou problèmes, contactez l'équipe technique.
