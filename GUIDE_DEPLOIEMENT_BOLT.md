# Guide de Déploiement pour Bolt.new

**Projet :** Mon Toit - Plateforme de Location Immobilière  
**Date :** 22 Novembre 2024  
**Auteur :** Manus AI  
**Version :** 1.0

---

## 📋 Vue d'Ensemble

Ce guide explique comment déployer l'application Mon Toit sur Bolt.new avec toutes les fonctionnalités : build optimisé, Edge Functions Supabase, migrations SQL, et configuration complète.

### Ce Qui Sera Déployé

| Composant | Description | Statut |
|-----------|-------------|--------|
| **Application React** | Interface utilisateur complète | ✅ Prêt |
| **Build optimisé** | Chunks séparés, lazy loading | ✅ Configuré |
| **Edge Functions** | 4 fonctions Supabase | ✅ Prêt |
| **Migrations SQL** | Base de données à jour | ✅ Prêt |
| **Feature Flags** | CNAM désactivé, Commercial caché | ✅ Activé |

---

## 🚀 Méthode 1 : Déploiement Automatique (Recommandé)

### Étape 1 : Importer le Projet dans Bolt

1. Ouvrir Bolt.new
2. Cliquer sur "Import from GitHub"
3. Entrer l'URL du dépôt :
   ```
   https://github.com/SOMET1010/MONTOIT-STABLE
   ```
4. Sélectionner la branche `main`
5. Cliquer sur "Import"

### Étape 2 : Exécuter le Script de Déploiement

Dans le terminal Bolt, exécuter :

```bash
./deploy-production.sh
```

Le script va automatiquement :
- ✅ Vérifier les prérequis (Node.js, npm, Supabase CLI)
- ✅ Installer les dépendances npm
- ✅ Builder l'application
- ✅ Déployer les Edge Functions (si Supabase CLI disponible)
- ✅ Appliquer les migrations SQL (si Supabase CLI disponible)
- ✅ Tester le déploiement
- ✅ Afficher le résumé

**Durée estimée :** 5-10 minutes

### Étape 3 : Vérifier le Déploiement

Le script affichera un résumé complet. Vérifier que :
- ✅ Build réussi (répertoire `dist/` créé)
- ✅ Edge Functions déployées (4 fonctions)
- ✅ Tests passés

---

## 🛠️ Méthode 2 : Déploiement Manuel (Si Script Échoue)

### Étape 1 : Installation

```bash
# Cloner le dépôt
git clone https://github.com/SOMET1010/MONTOIT-STABLE.git
cd MONTOIT-STABLE

# Installer les dépendances
npm install
```

### Étape 2 : Build

```bash
# Builder l'application
npm run build

# Vérifier que dist/ est créé
ls -la dist/
```

### Étape 3 : Déployer les Edge Functions

**Option A : Avec Supabase CLI (Recommandé)**

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref wsuarbcmxywcwcpaklxw

# Configurer les secrets Azure OpenAI
supabase secrets set AZURE_OPENAI_API_KEY="Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JTACi9YtNkJEIiWV4pRjMiJQQJ99BJACYeBjFXJ3w3AAAAACOG2jwX"
supabase secrets set AZURE_OPENAI_ENDPOINT="https://dtdi-ia-test.openai.azure.com/"
supabase secrets set AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o-mini"
supabase secrets set AZURE_OPENAI_API_VERSION="2024-10-21"

# Déployer les Edge Functions
supabase functions deploy ai-chatbot
supabase functions deploy send-verification-code
supabase functions deploy verify-code
supabase functions deploy send-whatsapp-otp
```

**Option B : Via Supabase Dashboard (Sans CLI)**

1. Aller sur https://supabase.com/dashboard/project/wsuarbcmxywcwcpaklxw
2. Naviguer vers **Edge Functions**
3. Créer chaque fonction manuellement :
   - `ai-chatbot` : Copier le code de `supabase/functions/ai-chatbot/index.ts`
   - `send-verification-code` : Copier le code de `supabase/functions/send-verification-code/index.ts`
   - `verify-code` : Copier le code de `supabase/functions/verify-code/index.ts`
   - `send-whatsapp-otp` : Copier le code de `supabase/functions/send-whatsapp-otp/index.ts`
4. Configurer les secrets dans **Settings** → **Edge Functions** → **Secrets**

### Étape 4 : Appliquer les Migrations SQL

**Option A : Avec Supabase CLI**

```bash
supabase db push
```

**Option B : Via Supabase Dashboard**

1. Aller sur https://supabase.com/dashboard/project/wsuarbcmxywcwcpaklxw
2. Naviguer vers **SQL Editor**
3. Créer une nouvelle requête
4. Copier le contenu de `migration_corrections.sql`
5. Exécuter la requête

### Étape 5 : Déployer sur Bolt

Dans Bolt.new :

1. Cliquer sur **Deploy**
2. Sélectionner la plateforme (Vercel, Netlify, etc.)
3. Configurer les variables d'environnement :

```env
VITE_SUPABASE_URL=https://wsuarbcmxywcwcpaklxw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzdw FyYmNteHl3Y3djcGFrbHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5NzE4NzEsImV4cCI6MjA0NjU0Nzg3MX0.kNl9TZPQm_yHvIbUXTVdQqDRkZbvjXvLqWNiCJVPHCM
```

4. Lancer le déploiement

---

## 🧪 Tests Post-Déploiement

### Test 1 : Application Accessible

1. Ouvrir l'URL de déploiement
2. Vérifier que la page d'accueil s'affiche
3. Vérifier qu'il n'y a pas d'erreurs dans la console

### Test 2 : CNAM Désactivé

1. Aller sur la page de vérification d'identité
2. Vérifier que **CNAM n'apparaît pas**
3. Vérifier que seul **ONECI** est visible

### Test 3 : Recherche Harmonisée

1. Aller sur la page de recherche
2. Vérifier que le bouton **"Commercial" n'apparaît pas**
3. Essayer de rechercher sans sélectionner de ville
4. Vérifier qu'une **alerte apparaît** demandant de sélectionner une ville

### Test 4 : Inscription

1. Aller sur la page d'inscription
2. Tester les 3 méthodes de vérification :
   - ✅ Email
   - ✅ SMS
   - ✅ WhatsApp
3. Vérifier que les champs obligatoires changent selon la méthode
4. Créer un compte de test
5. Vérifier que le **profil est créé automatiquement**

### Test 5 : Chatbot SUTA

1. Cliquer sur l'icône du chatbot (bas droite)
2. Envoyer un message : "Bonjour"
3. Vérifier que le chatbot **répond**
4. Tester la détection d'arnaque : "Le propriétaire me demande de payer avant la visite"
5. Vérifier que le chatbot **alerte sur l'arnaque**

### Test 6 : Edge Functions

Tester chaque Edge Function avec curl :

```bash
# Test ai-chatbot
curl -X POST \
  https://wsuarbcmxywcwcpaklxw.supabase.co/functions/v1/ai-chatbot \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Bonjour"}]}'

# Test send-verification-code
curl -X POST \
  https://wsuarbcmxywcwcpaklxw.supabase.co/functions/v1/send-verification-code \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"email","name":"Test User"}'
```

---

## 📊 Checklist de Déploiement

### Avant le Déploiement

- [ ] Code poussé sur GitHub (branche `main`)
- [ ] Variables d'environnement configurées
- [ ] Secrets Azure OpenAI disponibles
- [ ] Accès Supabase configuré

### Pendant le Déploiement

- [ ] Dépendances installées (`npm install`)
- [ ] Build réussi (`npm run build`)
- [ ] Edge Functions déployées (4 fonctions)
- [ ] Migrations SQL appliquées
- [ ] Tests passés

### Après le Déploiement

- [ ] Application accessible
- [ ] CNAM n'apparaît plus
- [ ] Bouton Commercial caché
- [ ] Validation ville fonctionne
- [ ] Inscription fonctionne
- [ ] Profil créé automatiquement
- [ ] Chatbot SUTA répond
- [ ] Aucune erreur dans les logs

---

## 🔧 Dépannage

### Problème : Build Échoue

**Symptôme :** Erreurs TypeScript ou erreurs de build

**Solution :**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problème : Edge Functions Ne Répondent Pas

**Symptôme :** Erreur 404 ou timeout

**Solutions :**
1. Vérifier que les fonctions sont déployées :
   ```bash
   supabase functions list
   ```
2. Vérifier les logs :
   ```bash
   supabase functions logs ai-chatbot
   ```
3. Vérifier les secrets :
   ```bash
   supabase secrets list
   ```

### Problème : CNAM Toujours Visible

**Symptôme :** CNAM apparaît encore dans l'interface

**Solution :**
1. Vérifier que le fichier `src/shared/config/features.config.ts` existe
2. Vérifier que `CNAM_VERIFICATION: false`
3. Rebuild l'application :
   ```bash
   npm run build
   ```

### Problème : Profil Non Créé

**Symptôme :** Message "Tentative 5/6" ou "Profil introuvable"

**Solutions :**
1. Vérifier que les migrations sont appliquées :
   ```bash
   supabase db pull
   ```
2. Vérifier que le trigger `on_auth_user_created` existe
3. Vérifier que la fonction `ensure_my_profile_exists` existe

### Problème : Chatbot Ne Répond Pas

**Symptôme :** Erreur ou pas de réponse

**Solutions :**
1. Vérifier que l'Edge Function `ai-chatbot` est déployée
2. Vérifier les secrets Azure OpenAI :
   ```bash
   supabase secrets list
   ```
3. Vérifier les logs :
   ```bash
   supabase functions logs ai-chatbot
   ```

---

## 📈 Métriques de Succès

Après le déploiement, monitorer ces métriques :

| Métrique | Cible | Comment Mesurer |
|----------|-------|-----------------|
| **Taux d'inscription** | >90% | Supabase Analytics |
| **Profils créés auto** | 100% | Vérifier `profiles` table |
| **Recherches sans ville** | 0% | Analytics frontend |
| **Clics "Commercial"** | 0% | Analytics frontend |
| **Mentions CNAM** | 0 | Vérification manuelle |
| **Réponses chatbot** | >95% | Logs Edge Functions |

---

## 🎯 Prochaines Étapes

### Immédiat (Aujourd'hui)

1. Déployer avec le script `./deploy-production.sh`
2. Tester tous les flows principaux
3. Vérifier les métriques de succès

### Court Terme (Cette Semaine)

4. Monitorer les erreurs avec Sentry
5. Analyser les logs Supabase
6. Collecter les retours utilisateurs

### Moyen Terme (2-3 Semaines)

7. Appliquer Sprint 2 (Corrections Majeures)
8. Optimiser les performances
9. Ajouter des tests E2E

---

## 📚 Documentation Complémentaire

### Rapports Techniques

1. **RAPPORT_CORRECTIONS_SPRINT1_APPLIQUEES.md** (12 pages)
   - Détails des corrections appliquées
   - Impact utilisateur
   - Métriques de succès

2. **RAPPORT_ANALYSE_RECOMMANDATIONS_UTILISATEURS.md** (35 pages)
   - Analyse des 14 recommandations
   - Plan d'action sur 3 semaines
   - Exemples de code

3. **RAPPORT_DEPLOIEMENT_FINAL.md** (28 pages)
   - Guide de déploiement complet
   - Configuration Sentry et Analytics
   - Pipeline CI/CD

### Guides Spécifiques

4. **GUIDE_DEPLOIEMENT_CHATBOT_SUTA.md** (30 pages)
   - Déploiement Edge Function ai-chatbot
   - Configuration Azure OpenAI
   - Tests et validation

5. **GUIDE_DEPLOIEMENT_PRODUCTION.md** (25 pages)
   - Déploiement Edge Functions
   - Migration SQL
   - Configuration production

6. **README_DEPLOIEMENT_CHATBOT.md** (8 pages)
   - Guide rapide chatbot
   - Commandes essentielles

### Code et Configuration

7. **deploy-production.sh** (Script Bash)
   - Script automatisé de déploiement
   - Vérifications et tests
   - Résumé complet

8. **src/shared/config/features.config.ts** (TypeScript)
   - Configuration feature flags
   - Documentation inline
   - Exemples d'utilisation

---

## 💡 Conseils pour Bolt.new

### Optimisations Bolt

1. **Activer le cache** : Bolt met en cache les builds pour accélérer les déploiements
2. **Utiliser les previews** : Tester les changements avant production
3. **Configurer les webhooks** : Déploiement automatique à chaque push GitHub

### Limitations Bolt

1. **Supabase CLI** : Peut ne pas être disponible dans Bolt
   - **Solution** : Déployer Edge Functions manuellement via Dashboard
2. **Migrations SQL** : Peuvent nécessiter accès direct à Supabase
   - **Solution** : Utiliser SQL Editor dans Dashboard
3. **Secrets** : Doivent être configurés via interface Bolt
   - **Solution** : Ajouter dans Settings → Environment Variables

### Bonnes Pratiques

1. **Tester en local d'abord** : `npm run dev` avant de déployer
2. **Vérifier les logs** : Bolt affiche les logs de build en temps réel
3. **Utiliser les branches** : Créer une branche `staging` pour tester
4. **Documenter les changements** : Commits clairs et descriptifs

---

## 🆘 Support

### En Cas de Problème

1. **Vérifier la documentation** : Tous les guides sont dans le dépôt
2. **Consulter les logs** :
   - Logs Bolt : Interface de déploiement
   - Logs Supabase : Dashboard → Logs
   - Logs Edge Functions : `supabase functions logs <nom>`
3. **Tester en local** : Reproduire le problème localement
4. **Contacter le support** :
   - Bolt.new : https://bolt.new/support
   - Supabase : https://supabase.com/support

### Ressources Utiles

- **Documentation Bolt** : https://docs.bolt.new
- **Documentation Supabase** : https://supabase.com/docs
- **Documentation React** : https://react.dev
- **Documentation Vite** : https://vitejs.dev

---

## 🎉 Conclusion

Le déploiement sur Bolt.new est simple et rapide avec le script automatisé fourni. En cas de problème, les options manuelles sont disponibles et bien documentées.

**Temps total estimé :** 10-15 minutes pour un déploiement complet

**Prérequis :**
- ✅ Compte Bolt.new
- ✅ Accès GitHub au dépôt MONTOIT-STABLE
- ✅ Accès Supabase (pour Edge Functions et migrations)

**Résultat attendu :**
- ✅ Application déployée et accessible
- ✅ Toutes les fonctionnalités opérationnelles
- ✅ CNAM désactivé
- ✅ Recherche harmonisée
- ✅ Chatbot SUTA fonctionnel

**Bon déploiement ! 🚀**

---

**Guide créé par Manus AI**  
**Date :** 22 Novembre 2024  
**Version :** 1.0

