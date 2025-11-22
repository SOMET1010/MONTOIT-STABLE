# 🚀 Déploiement Automatique - Chatbot SUTA

## 📋 Vue d'Ensemble

Ce script automatise entièrement le déploiement de l'Edge Function `ai-chatbot` pour activer le chatbot SUTA avec Azure OpenAI.

**Durée totale :** 5-10 minutes  
**Niveau :** Débutant  
**Prérequis :** Supabase CLI installé

---

## ⚡ Déploiement Rapide (1 commande)

```bash
cd /path/to/MONTOIT-STABLE
./deploy-chatbot.sh
```

C'est tout ! Le script fait tout automatiquement :
- ✅ Vérifie Supabase CLI
- ✅ Vous connecte à Supabase (si nécessaire)
- ✅ Lie le projet
- ✅ Configure les secrets Azure OpenAI
- ✅ Déploie la fonction
- ✅ Teste la fonction
- ✅ Affiche les logs

---

## 📦 Prérequis

### 1. Installer Supabase CLI

**macOS :**
```bash
brew install supabase/tap/supabase
```

**Linux :**
```bash
# Via Homebrew on Linux
brew install supabase/tap/supabase

# Ou via NPM
npm install -g supabase
```

**Windows :**
```powershell
# Via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Vérifier l'installation

```bash
supabase --version
```

**Résultat attendu :**
```
2.54.10 (ou supérieur)
```

---

## 🎯 Utilisation

### Étape 1 : Aller dans le répertoire du projet

```bash
cd /path/to/MONTOIT-STABLE
```

### Étape 2 : Exécuter le script

```bash
./deploy-chatbot.sh
```

### Étape 3 : Suivre les instructions

Le script va :

1. **Vérifier Supabase CLI**
   ```
   ✅ Supabase CLI installé: 2.54.10
   ```

2. **Vous connecter à Supabase** (si nécessaire)
   ```
   ⚠️  Vous n'êtes pas connecté à Supabase
   ℹ️  Connexion à Supabase...
   ```
   
   → Une page web s'ouvrira pour vous connecter
   
   → Suivez les instructions dans le navigateur
   
   → Revenez au terminal

3. **Lier le projet**
   ```
   ✅ Projet lié avec succès
   ```

4. **Configurer les secrets**
   ```
   ℹ️  Configuration de AZURE_OPENAI_API_KEY...
   ℹ️  Configuration de AZURE_OPENAI_ENDPOINT...
   ℹ️  Configuration de AZURE_OPENAI_DEPLOYMENT_NAME...
   ℹ️  Configuration de AZURE_OPENAI_API_VERSION...
   ✅ Secrets configurés avec succès
   ```

5. **Déployer la fonction**
   ```
   ℹ️  Déploiement de ai-chatbot...
   ✅ Fonction déployée avec succès
   ```

6. **Tester la fonction**
   ```
   ✅ Test réussi ! La fonction répond correctement
   
   ℹ️  Réponse de SUTA:
   {
     "content": "Bonjour ! Je suis SUTA...",
     "tokensUsed": 150,
     "model": "gpt-4o-mini"
   }
   ```

7. **Afficher le résumé**
   ```
   ✅ Le chatbot SUTA est maintenant déployé et fonctionnel !
   
   📊 Résumé:
     • Projet: wsuarbcmxywcwcpaklxw
     • Fonction: ai-chatbot
     • URL: https://wsuarbcmxywcwcpaklxw.supabase.co/functions/v1/ai-chatbot
     • Modèle IA: gpt-4o-mini
   ```

---

## ✅ Vérification Post-Déploiement

### Test 1 : Vérifier les fonctions déployées

```bash
supabase functions list
```

**Résultat attendu :**
```
┌──────────────┬─────────┬──────────────────────┐
│ NAME         │ VERSION │ CREATED AT           │
├──────────────┼─────────┼──────────────────────┤
│ ai-chatbot   │ 1       │ 2025-11-22 10:00:00  │
└──────────────┴─────────┴──────────────────────┘
```

### Test 2 : Vérifier les secrets

```bash
supabase secrets list
```

**Résultat attendu :**
```
AZURE_OPENAI_API_KEY
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_DEPLOYMENT_NAME
AZURE_OPENAI_API_VERSION
```

### Test 3 : Voir les logs

```bash
supabase functions logs ai-chatbot --follow
```

**Logs attendus :**
```
✅ Starting AI chatbot request
📝 Messages count: 2
🤖 Calling OpenAI API...
✅ AI response received successfully
📊 Tokens used: 150
```

### Test 4 : Tester dans l'application

1. Ouvrir l'application Mon Toit
2. Se connecter avec un compte utilisateur
3. Cliquer sur l'icône du chatbot (bas droite)
4. Envoyer un message : "Bonjour"
5. Vérifier la réponse IA

---

## 🔧 Dépannage

### Problème 1 : "Supabase CLI not found"

**Cause :** Supabase CLI n'est pas installé

**Solution :**
```bash
# macOS
brew install supabase/tap/supabase

# Linux
brew install supabase/tap/supabase

# Vérifier
supabase --version
```

### Problème 2 : "Access token not provided"

**Cause :** Vous n'êtes pas connecté à Supabase

**Solution :**
```bash
supabase login
```

Suivez les instructions dans le navigateur.

### Problème 3 : "Failed to deploy function"

**Cause :** Erreur dans le code de la fonction

**Solution :**
```bash
# Vérifier le code
cat supabase/functions/ai-chatbot/index.ts

# Redéployer avec debug
supabase functions deploy ai-chatbot --debug
```

### Problème 4 : "No response from AI"

**Cause :** Secrets mal configurés

**Solution :**
```bash
# Vérifier les secrets
supabase secrets list

# Reconfigurer si nécessaire
./deploy-chatbot.sh
```

### Problème 5 : Permission denied

**Cause :** Le script n'est pas exécutable

**Solution :**
```bash
chmod +x deploy-chatbot.sh
./deploy-chatbot.sh
```

---

## 📊 Ce Que Fait le Script

### 1. Vérifications Préalables
- Vérifie que Supabase CLI est installé
- Vérifie la version de Supabase CLI
- Vérifie si vous êtes connecté à Supabase
- Vous connecte si nécessaire

### 2. Liaison du Projet
- Vérifie si le projet est déjà lié
- Lie le projet `wsuarbcmxywcwcpaklxw`
- Vérifie la liaison

### 3. Configuration des Secrets
- Configure `AZURE_OPENAI_API_KEY`
- Configure `AZURE_OPENAI_ENDPOINT`
- Configure `AZURE_OPENAI_DEPLOYMENT_NAME`
- Configure `AZURE_OPENAI_API_VERSION`
- Liste les secrets configurés

### 4. Déploiement
- Déploie l'Edge Function `ai-chatbot`
- Vérifie le déploiement
- Liste les fonctions déployées

### 5. Tests
- Teste la fonction avec un message simple
- Affiche la réponse de SUTA
- Affiche les logs récents

### 6. Résumé
- Affiche un résumé complet
- Donne les commandes utiles
- Indique comment tester

---

## 🎨 Personnalisation

### Modifier les Secrets

Éditez le script `deploy-chatbot.sh` :

```bash
# Lignes 18-21
AZURE_OPENAI_API_KEY="votre_nouvelle_cle"
AZURE_OPENAI_ENDPOINT="https://votre-endpoint.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT_NAME="votre-modele"
AZURE_OPENAI_API_VERSION="2024-10-21"
```

### Ajouter Gemini comme Fallback

Ajoutez ces lignes après la ligne 21 :

```bash
GEMINI_API_KEY="votre_cle_gemini"
```

Et après la ligne 122 :

```bash
print_info "Configuration de GEMINI_API_KEY..."
echo "$GEMINI_API_KEY" | supabase secrets set GEMINI_API_KEY --stdin
```

### Changer le Projet

Modifiez la ligne 17 :

```bash
PROJECT_REF="votre_project_ref"
```

---

## 📚 Documentation Complémentaire

- **Guide complet :** `GUIDE_DEPLOIEMENT_CHATBOT_SUTA.md`
- **Rapport technique :** `RAPPORT_CORRECTION_CHATBOT_SUTA.md`
- **Documentation Supabase :** https://supabase.com/docs/guides/functions

---

## 🎉 Résultat Final

Après exécution du script, vous aurez :

✅ **Edge Function déployée**
- Nom : `ai-chatbot`
- URL : `https://wsuarbcmxywcwcpaklxw.supabase.co/functions/v1/ai-chatbot`
- Statut : Actif

✅ **Secrets configurés**
- Azure OpenAI API Key
- Azure OpenAI Endpoint
- Deployment Name
- API Version

✅ **Chatbot fonctionnel**
- IA Azure OpenAI (gpt-4o-mini)
- Détection d'arnaques
- Réponses contextualisées
- Historique sauvegardé

✅ **Tests validés**
- Fonction répond correctement
- Logs disponibles
- Interface accessible

---

## 💡 Conseils

1. **Exécutez le script depuis le répertoire du projet**
   ```bash
   cd /path/to/MONTOIT-STABLE
   ./deploy-chatbot.sh
   ```

2. **Gardez une copie des logs**
   ```bash
   ./deploy-chatbot.sh 2>&1 | tee deployment.log
   ```

3. **Vérifiez les logs après déploiement**
   ```bash
   supabase functions logs ai-chatbot --follow
   ```

4. **Testez immédiatement après déploiement**
   - Ouvrez l'application
   - Testez le chatbot
   - Vérifiez les réponses

---

## 🚀 Prochaines Étapes

Après le déploiement :

1. ✅ Tester le chatbot dans l'application
2. ✅ Vérifier la détection d'arnaques
3. ✅ Collecter les retours utilisateurs
4. ✅ Ajuster le prompt si nécessaire
5. ✅ Monitorer les coûts Azure

---

## 📞 Support

En cas de problème :

1. **Vérifier les logs**
   ```bash
   supabase functions logs ai-chatbot --level debug
   ```

2. **Consulter la documentation**
   - `GUIDE_DEPLOIEMENT_CHATBOT_SUTA.md`
   - `RAPPORT_CORRECTION_CHATBOT_SUTA.md`

3. **Contacter le support**
   - Supabase : https://supabase.com/support
   - Azure : https://portal.azure.com

---

**Script créé par :** Manus AI  
**Date :** 22 novembre 2025  
**Version :** 1.0  
**Statut :** ✅ Prêt à Utiliser

