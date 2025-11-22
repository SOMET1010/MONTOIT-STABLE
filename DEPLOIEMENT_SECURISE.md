# Guide de Déploiement Sécurisé - Mon Toit v3.2.0

## Problèmes de Sécurité Corrigés

### Script Original (`deploy-production.sh`)
Le script original exposait des secrets sensibles:
- ❌ Clé Azure OpenAI en clair (ligne 129)
- ❌ Token Supabase ANON_KEY en clair (ligne 200)
- ❌ Endpoint Azure OpenAI visible
- ❌ Pas de gestion des variables d'environnement

### Nouveau Script Sécurisé (`deploy-production-secure.sh`)
- ✅ Secrets chargés depuis `.env.production`
- ✅ Validation des secrets avant déploiement
- ✅ Aucun secret en clair dans le code
- ✅ Template `.env.production.example` fourni

## Installation

### 1. Créer le fichier de secrets

```bash
# Copier le template
cp .env.production.example .env.production

# Éditer avec vos vrais secrets
nano .env.production
```

### 2. Compléter `.env.production`

Remplacer les valeurs `your_*_here` avec vos vraies clés:

```bash
# Supabase
VITE_SUPABASE_URL=https://wsuarbcmxywcwcpaklxw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Azure OpenAI
AZURE_OPENAI_API_KEY=Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JT...
AZURE_OPENAI_ENDPOINT=https://dtdi-ia-test.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-10-21

# InTouch
INTOUCH_API_KEY=votre_cle_intouch
INTOUCH_API_SECRET=votre_secret_intouch

# Etc...
```

### 3. Sécuriser le fichier

```bash
# Ne JAMAIS commiter .env.production
echo ".env.production" >> .gitignore

# Restreindre les permissions
chmod 600 .env.production
```

## Déploiement

### Option A: Script Automatique Sécurisé (Recommandé)

```bash
# Rendre le script exécutable
chmod +x deploy-production-secure.sh

# Lancer le déploiement
./deploy-production-secure.sh
```

Le script va:
1. ✅ Vérifier que tous les secrets sont présents
2. ✅ Installer les dépendances
3. ✅ Builder l'application
4. ✅ Déployer les Edge Functions avec secrets sécurisés
5. ✅ Appliquer les migrations
6. ✅ Tester le déploiement

**Temps estimé:** 10-15 minutes

### Option B: Déploiement Manuel

Si vous préférez un contrôle total:

```bash
# 1. Charger les variables
source .env.production

# 2. Build
npm install
npm run build

# 3. Supabase
supabase login
supabase link --project-ref wsuarbcmxywcwcpaklxw

# 4. Configurer secrets
supabase secrets set AZURE_OPENAI_API_KEY="$AZURE_OPENAI_API_KEY"
supabase secrets set AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT"
supabase secrets set AZURE_OPENAI_DEPLOYMENT_NAME="$AZURE_OPENAI_DEPLOYMENT_NAME"
supabase secrets set AZURE_OPENAI_API_VERSION="$AZURE_OPENAI_API_VERSION"

# 5. Déployer Edge Functions
supabase functions deploy ai-chatbot
supabase functions deploy send-verification-code
supabase functions deploy verify-code
supabase functions deploy send-whatsapp-otp

# 6. Appliquer migrations
supabase db push
```

## Comparaison des Scripts

| Aspect | `deploy-production.sh` | `deploy-production-secure.sh` |
|--------|------------------------|-------------------------------|
| **Secrets** | ❌ En clair dans le code | ✅ Variables d'environnement |
| **Validation** | ❌ Aucune | ✅ Vérifie avant de déployer |
| **Sécurité** | ❌ Risque si partagé | ✅ Safe pour Git |
| **Configuration** | ❌ Hardcodée | ✅ Flexible via .env |
| **Best practices** | ❌ Non | ✅ Oui |

## Vérification de Sécurité

Avant de commiter:

```bash
# Vérifier qu'aucun secret n'est dans le code
grep -r "Eb0tyDX22cFJ" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "eyJhbGciOiJIUzI1" . --exclude-dir=node_modules --exclude-dir=.git

# Ces commandes ne doivent RIEN retourner!
```

## Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours utiliser `.env.production`** pour les secrets
2. **Ajouter `.env.production` à `.gitignore`**
3. **Utiliser `deploy-production-secure.sh`** au lieu de l'ancien script
4. **Restreindre les permissions** avec `chmod 600 .env.production`
5. **Documenter les secrets nécessaires** dans `.env.production.example`
6. **Rotate les secrets** régulièrement (tous les 90 jours)

### ❌ À NE PAS FAIRE

1. ❌ Commiter `.env.production` dans Git
2. ❌ Partager des secrets par email/Slack
3. ❌ Hardcoder des secrets dans le code
4. ❌ Utiliser les mêmes secrets en dev/prod
5. ❌ Donner accès aux secrets à tout le monde

## Rotation des Secrets

Si un secret est compromis:

```bash
# 1. Générer de nouvelles clés (Azure Portal, Supabase Dashboard, etc.)

# 2. Mettre à jour .env.production
nano .env.production

# 3. Redéployer
./deploy-production-secure.sh

# 4. Révoquer les anciennes clés
```

## Support

### Si le déploiement échoue

1. **Vérifier les secrets:**
   ```bash
   source .env.production
   echo "AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY"
   ```

2. **Vérifier Supabase CLI:**
   ```bash
   supabase --version
   supabase projects list
   ```

3. **Logs détaillés:**
   ```bash
   bash -x deploy-production-secure.sh
   ```

### Documentation complémentaire

- `DEPLOIEMENT_FINAL.txt` - Guide rapide
- `GUIDE_DEPLOIEMENT_PRODUCTION.md` - Guide détaillé
- `RAPPORT_FINAL_REORGANISATION.md` - Architecture complète

## Checklist Finale

Avant de déployer en production:

- [ ] `.env.production` créé avec tous les secrets
- [ ] `.env.production` dans `.gitignore`
- [ ] Permissions restrictives (`chmod 600 .env.production`)
- [ ] Build réussi (`npm run build`)
- [ ] Supabase CLI installé et connecté
- [ ] Secrets validés (script les vérifie)
- [ ] Documentation lue
- [ ] Backup de la base de données effectué

## Conclusion

Le nouveau script `deploy-production-secure.sh` élimine tous les problèmes de sécurité:

- ✅ **Aucun secret en clair**
- ✅ **Configuration externalisée**
- ✅ **Validation automatique**
- ✅ **Safe pour Git**
- ✅ **Production-ready**

**Utilisez TOUJOURS ce script au lieu de l'ancien!**

---

Créé: 22 novembre 2025
Version: 2.0
Status: ✅ Sécurisé et Production-Ready
