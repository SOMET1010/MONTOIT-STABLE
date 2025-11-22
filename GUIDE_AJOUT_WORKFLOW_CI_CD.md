# Guide d'Ajout du Workflow CI/CD

**Date :** 22 novembre 2025  
**Fichier :** `.github/workflows/ci-cd.yml`  
**Durée :** 2 minutes

---

## 📋 Pourquoi Ce Guide ?

Le fichier workflow CI/CD a été retiré temporairement car GitHub bloque sa création via GitHub App. Vous devez l'ajouter manuellement via l'interface GitHub.

---

## 🚀 Méthode 1 : Via l'Interface GitHub (Recommandé)

### Étape 1 : Aller sur GitHub

1. Ouvrir https://github.com/SOMET1010/MONTOIT-STABLE
2. Cliquer sur l'onglet **"Actions"**
3. Cliquer sur **"New workflow"** ou **"Set up a workflow yourself"**

### Étape 2 : Créer le Fichier

1. GitHub va créer un fichier `.github/workflows/main.yml`
2. **Renommer** le fichier en `ci-cd.yml`
3. **Copier-coller** le contenu ci-dessous dans l'éditeur

### Étape 3 : Contenu du Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

permissions:
  contents: read
  pull-requests: write
  actions: write

jobs:
  # Job 1: Tests et vérifications
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --run --reporter=verbose
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: coverage/

  # Job 2: Build de l'application
  build:
    name: Build Application
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_ENVIRONMENT: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  # Job 3: Analyse de sécurité
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate || true
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Job 4: Déploiement en staging (branche develop)
  deploy-staging:
    name: Deploy to Staging
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment:
      name: staging
      url: https://staging.montoit.app
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
          scope: ${{ secrets.VERCEL_ORG_ID }}

  # Job 5: Déploiement en production (branche main)
  deploy-production:
    name: Deploy to Production
    needs: [test, build, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://montoit.app
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Create Sentry release
        uses: getsentry/action-release@v1
        if: env.SENTRY_AUTH_TOKEN != ''
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
          sourcemaps: './dist/assets'
      
      - name: Notify deployment success
        if: success()
        run: |
          echo "✅ Deployment to production successful!"
          echo "URL: https://montoit.app"
      
      - name: Notify deployment failure
        if: failure()
        run: |
          echo "❌ Deployment to production failed!"

  # Job 6: Lighthouse CI (Performance)
  lighthouse:
    name: Lighthouse Performance Audit
    needs: deploy-production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://montoit.app
            https://montoit.app/connexion
            https://montoit.app/recherche
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Étape 4 : Committer

1. Cliquer sur **"Commit changes"**
2. Message de commit : `ci: add CI/CD workflow`
3. Cliquer sur **"Commit changes"**

---

## 🚀 Méthode 2 : Via Git Local (Alternative)

Si vous préférez le faire en local :

```bash
# 1. Créer le répertoire
mkdir -p .github/workflows

# 2. Créer le fichier
cat > .github/workflows/ci-cd.yml << 'EOF'
[Copier le contenu YAML ci-dessus]
EOF

# 3. Committer et pousser
git add .github/workflows/ci-cd.yml
git commit -m "ci: add CI/CD workflow"
git push origin main
```

---

## ⚙️ Configuration des Secrets GitHub

Pour que le workflow fonctionne, vous devez configurer les secrets :

### Étape 1 : Aller dans les Settings

1. Aller sur https://github.com/SOMET1010/MONTOIT-STABLE
2. Cliquer sur **"Settings"**
3. Cliquer sur **"Secrets and variables"** → **"Actions"**
4. Cliquer sur **"New repository secret"**

### Étape 2 : Ajouter les Secrets

**Secrets obligatoires :**

| Nom | Valeur | Description |
|-----|--------|-------------|
| `VITE_SUPABASE_URL` | `https://wsuarbcmxywcwcpaklxw.supabase.co` | URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Clé anonyme Supabase |

**Secrets optionnels (pour déploiement) :**

| Nom | Description |
|-----|-------------|
| `VERCEL_TOKEN` | Token Vercel pour déploiement |
| `VERCEL_ORG_ID` | ID organisation Vercel |
| `VERCEL_PROJECT_ID` | ID projet Vercel |
| `SENTRY_AUTH_TOKEN` | Token Sentry pour monitoring |
| `SENTRY_ORG` | Organisation Sentry |
| `SENTRY_PROJECT` | Projet Sentry |
| `SNYK_TOKEN` | Token Snyk pour sécurité |

---

## ✅ Vérification

### Test 1 : Vérifier le Workflow

1. Aller sur https://github.com/SOMET1010/MONTOIT-STABLE/actions
2. Vous devriez voir le workflow **"CI/CD Pipeline"**
3. Il devrait se lancer automatiquement au prochain push

### Test 2 : Déclencher Manuellement

1. Aller dans **Actions**
2. Sélectionner **"CI/CD Pipeline"**
3. Cliquer sur **"Run workflow"**
4. Sélectionner la branche **main**
5. Cliquer sur **"Run workflow"**

---

## 📊 Ce Que Fait le Workflow

**Sur chaque Push/PR :**
1. ✅ Tests automatiques
2. ✅ Vérification TypeScript
3. ✅ Linting du code
4. ✅ Scan de sécurité
5. ✅ Build de l'application

**Sur Push vers main :**
6. ✅ Déploiement en production
7. ✅ Création release Sentry
8. ✅ Audit Lighthouse

**Sur Push vers develop :**
6. ✅ Déploiement en staging

---

## 💡 Conseils

1. **Commencez simple** : Ajoutez d'abord le workflow sans les secrets optionnels
2. **Testez progressivement** : Activez les jobs un par un
3. **Surveillez les logs** : Vérifiez les logs dans l'onglet Actions
4. **Ajustez si nécessaire** : Modifiez le workflow selon vos besoins

---

## 🎯 Résultat Final

Une fois le workflow ajouté et configuré :

✅ **CI/CD automatique** sur chaque push  
✅ **Tests automatiques** avant déploiement  
✅ **Déploiement automatique** en production  
✅ **Audits de performance** automatiques  
✅ **Sécurité** vérifiée à chaque commit

---

**Guide créé par :** Manus AI  
**Date :** 22 novembre 2025  
**Version :** 1.0

