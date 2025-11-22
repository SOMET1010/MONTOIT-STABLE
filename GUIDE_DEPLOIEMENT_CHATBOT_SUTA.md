# Guide de Déploiement - Chatbot SUTA

**Date :** 22 novembre 2025  
**Projet :** Mon Toit - Chatbot SUTA  
**Type :** Guide de Déploiement Pratique  
**Durée estimée :** 30 minutes

---

## 📋 Vue d'Ensemble

Ce guide vous permet de déployer l'Edge Function `ai-chatbot` pour activer le chatbot SUTA avec Azure OpenAI.

**Prérequis :**
- ✅ Supabase CLI installé
- ✅ Accès au projet Supabase
- ✅ Clés API Azure OpenAI (déjà disponibles)

---

## 🚀 Déploiement Rapide (3 étapes)

### Étape 1 : Login Supabase

```bash
# Se connecter à Supabase
supabase login

# Suivre les instructions dans le navigateur
```

### Étape 2 : Lier le Projet

```bash
cd /path/to/MONTOIT-STABLE

# Lier le projet (utilisez l'ID du projet)
supabase link --project-ref wsuarbcmxywcwcpaklxw
```

**Note :** Le project-ref est extrait de l'URL Supabase : `https://wsuarbcmxywcwcpaklxw.supabase.co`

### Étape 3 : Configurer les Secrets

```bash
# Azure OpenAI (Recommandé)
supabase secrets set AZURE_OPENAI_API_KEY="Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JTACi9YtNkJEIiWV4pRjMiJQQJ99BJACYeBjFXJ3w3AAAAACOG2jwX"

supabase secrets set AZURE_OPENAI_ENDPOINT="https://dtdi-ia-test.openai.azure.com/"

supabase secrets set AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o-mini"

supabase secrets set AZURE_OPENAI_API_VERSION="2024-10-21"
```

**Alternative : Gemini (Fallback)**
```bash
# Si vous voulez aussi configurer Gemini comme fallback
supabase secrets set GEMINI_API_KEY="votre_cle_gemini"
```

### Étape 4 : Déployer la Fonction

```bash
# Déployer l'Edge Function ai-chatbot
supabase functions deploy ai-chatbot

# Vérifier le déploiement
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

---

## ✅ Vérification du Déploiement

### Test 1 : Vérifier les Secrets

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

### Test 2 : Tester la Fonction

```bash
curl -X POST \
  https://wsuarbcmxywcwcpaklxw.supabase.co/functions/v1/ai-chatbot \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "Tu es SUTA, assistant protecteur Mon Toit"
      },
      {
        "role": "user",
        "content": "Bonjour, peux-tu te présenter ?"
      }
    ],
    "userId": null,
    "temperature": 0.8,
    "maxTokens": 1000
  }'
```

**Résultat attendu :**
```json
{
  "content": "Bonjour ! Je suis SUTA, votre assistant protecteur sur Mon Toit...",
  "tokensUsed": 150,
  "model": "gpt-4o-mini"
}
```

### Test 3 : Vérifier les Logs

```bash
# Suivre les logs en temps réel
supabase functions logs ai-chatbot --follow

# Ou voir les derniers logs
supabase functions logs ai-chatbot
```

**Logs attendus :**
```
✅ Starting AI chatbot request
📝 Messages count: 2
👤 User ID: null
🤖 Calling OpenAI API...
✅ AI response received successfully
📊 Tokens used: 150
```

---

## 🧪 Test dans l'Application

### Test Frontend

1. **Ouvrir l'application** : https://montoit.app (ou localhost:5173)
2. **Se connecter** avec un compte utilisateur
3. **Cliquer sur l'icône du chatbot** (bas droite)
4. **Envoyer un message** : "Bonjour"

**Résultat attendu :**
- ✅ Message envoyé
- ✅ Réponse IA reçue en quelques secondes
- ✅ Conversation sauvegardée

### Test de Détection d'Arnaque

**Envoyer :**
```
Le propriétaire me demande de payer 200,000 FCFA avant de visiter l'appartement. Il dit qu'il est à l'étranger.
```

**Résultat attendu :**
```
🚨 **ALERTE ARNAQUE ! NE PAIE RIEN !** 🚨

**Pourquoi c'est une arnaque** :
1. ❌ Demande d'argent AVANT la visite (technique #1 des arnaqueurs)
2. ❌ Propriétaire "à l'étranger" qui ne peut pas montrer le bien
3. ❌ Pression pour payer rapidement

**Ce que tu dois faire MAINTENANT** :
1. ❌ **NE PAIE RIEN**
2. 🚫 **NE DONNE PAS** tes coordonnées bancaires
3. 📢 **SIGNALE** cette personne
4. 🚷 **BLOQUE** ce contact

**Sur Mon Toit, tu es protégé** :
• ✅ Vérification ANSUT obligatoire
• 🔒 Paiements sécurisés via la plateforme
• 📝 Signature électronique AVANT tout paiement
```

---

## 🔧 Dépannage

### Problème 1 : "OPENAI_API_KEY not configured"

**Cause :** Les secrets ne sont pas configurés

**Solution :**
```bash
# Vérifier les secrets
supabase secrets list

# Si vide, reconfigurer
supabase secrets set AZURE_OPENAI_API_KEY="Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JTACi9YtNkJEIiWV4pRjMiJQQJ99BJACYeBjFXJ3w3AAAAACOG2jwX"
```

### Problème 2 : "Failed to deploy function"

**Cause :** Erreur de syntaxe ou dépendances manquantes

**Solution :**
```bash
# Vérifier le code de la fonction
cd supabase/functions/ai-chatbot
cat index.ts

# Redéployer
supabase functions deploy ai-chatbot --debug
```

### Problème 3 : "429 Too Many Requests"

**Cause :** Limite de requêtes Azure OpenAI atteinte

**Solution :**
```bash
# Configurer Gemini comme fallback
supabase secrets set GEMINI_API_KEY="votre_cle_gemini"

# La fonction utilisera automatiquement Gemini si Azure échoue
```

### Problème 4 : "relation chatbot_conversations does not exist"

**Cause :** Tables non créées en production

**Solution :**
```bash
# Appliquer toutes les migrations
supabase db push

# Ou via SQL Editor sur Supabase Dashboard
# Exécuter le contenu de :
# supabase/migrations/20251029200631_add_chatbot_system.sql
```

---

## 📊 Monitoring et Maintenance

### Surveiller les Logs

```bash
# Logs en temps réel
supabase functions logs ai-chatbot --follow

# Logs des dernières 24h
supabase functions logs ai-chatbot --since 24h

# Logs avec erreurs seulement
supabase functions logs ai-chatbot --level error
```

### Métriques Importantes

**Via Supabase Dashboard :**
1. Aller sur https://app.supabase.com
2. Sélectionner le projet
3. Edge Functions → ai-chatbot
4. Onglet "Metrics"

**Métriques à surveiller :**
- Invocations par heure
- Temps de réponse moyen
- Taux d'erreur
- Utilisation de tokens

### Optimisation des Coûts

**Azure OpenAI :**
- Modèle : gpt-4o-mini (économique)
- Max tokens : 1000 (limite raisonnable)
- Temperature : 0.8 (bon équilibre)

**Estimation de coûts :**
- ~$0.15 pour 1M tokens input
- ~$0.60 pour 1M tokens output
- Conversation moyenne : ~500 tokens
- **Coût par conversation : ~$0.0004 (0.25 FCFA)**

**Pour réduire les coûts :**
1. Activer le système de fallback pour questions simples
2. Limiter maxTokens à 800
3. Utiliser Gemini (gratuit jusqu'à 60 req/min)

---

## 🔄 Mise à Jour de la Fonction

### Modifier le Code

```bash
# Éditer la fonction
cd supabase/functions/ai-chatbot
nano index.ts

# Redéployer
supabase functions deploy ai-chatbot
```

### Rollback en Cas de Problème

```bash
# Lister les versions
supabase functions list --versions ai-chatbot

# Revenir à une version précédente
supabase functions deploy ai-chatbot --version 1
```

---

## 📝 Checklist Post-Déploiement

### Vérifications Techniques
- [ ] Edge Function déployée
- [ ] Secrets configurés (Azure OpenAI)
- [ ] Tables créées (chatbot_conversations, chatbot_messages)
- [ ] Test cURL réussi
- [ ] Logs activés

### Tests Fonctionnels
- [ ] Chatbot visible en icône flottante
- [ ] Message de bienvenue affiché
- [ ] Envoi de message fonctionne
- [ ] Réponse IA reçue
- [ ] Détection d'arnaque fonctionne
- [ ] Historique sauvegardé
- [ ] Nouvelle conversation fonctionne

### Monitoring
- [ ] Logs consultables
- [ ] Métriques visibles
- [ ] Alertes configurées (optionnel)

---

## 🎯 Prochaines Étapes

### Court Terme (Cette semaine)
1. ✅ Déployer la fonction (fait avec ce guide)
2. Tester avec des utilisateurs réels
3. Collecter les retours
4. Ajuster le prompt si nécessaire

### Moyen Terme (1-2 semaines)
1. Ajouter des analytics sur les questions fréquentes
2. Enrichir le système de fallback
3. Améliorer la détection d'arnaques
4. Ajouter plus de contexte ivoirien

### Long Terme (1 mois+)
1. Implémenter le streaming pour réponses en temps réel
2. Intégration directe avec les propriétés
3. Support multi-langue (français, anglais, nouchi)
4. Personnalisation par utilisateur

---

## 💡 Conseils et Bonnes Pratiques

### Sécurité
- ✅ Ne jamais exposer les clés API dans le frontend
- ✅ Utiliser les secrets Supabase pour les clés sensibles
- ✅ Activer RLS sur les tables chatbot
- ✅ Limiter les requêtes par utilisateur (rate limiting)

### Performance
- ✅ Utiliser le système de fallback pour questions simples
- ✅ Limiter maxTokens pour réduire latence
- ✅ Cacher les réponses fréquentes
- ✅ Monitorer le temps de réponse

### Expérience Utilisateur
- ✅ Réponses concises et actionnables
- ✅ Emojis pour attirer l'attention (arnaques)
- ✅ Toujours proposer une prochaine étape
- ✅ Adapter le langage au contexte ivoirien

---

## 📞 Support

### En Cas de Problème

**Logs détaillés :**
```bash
supabase functions logs ai-chatbot --level debug
```

**Tester manuellement :**
```bash
# Via Supabase Dashboard
# Edge Functions → ai-chatbot → Invoke function
```

**Contacter le support :**
- Supabase : https://supabase.com/support
- Azure : https://portal.azure.com

---

## ✅ Résumé des Commandes

```bash
# 1. Login
supabase login

# 2. Lier le projet
supabase link --project-ref wsuarbcmxywcwcpaklxw

# 3. Configurer les secrets
supabase secrets set AZURE_OPENAI_API_KEY="Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JTACi9YtNkJEIiWV4pRjMiJQQJ99BJACYeBjFXJ3w3AAAAACOG2jwX"
supabase secrets set AZURE_OPENAI_ENDPOINT="https://dtdi-ia-test.openai.azure.com/"
supabase secrets set AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o-mini"
supabase secrets set AZURE_OPENAI_API_VERSION="2024-10-21"

# 4. Déployer
supabase functions deploy ai-chatbot

# 5. Vérifier
supabase functions list
supabase functions logs ai-chatbot

# 6. Tester
curl -X POST https://wsuarbcmxywcwcpaklxw.supabase.co/functions/v1/ai-chatbot \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Bonjour"}]}'
```

---

## 🎉 Félicitations !

Une fois ces étapes complétées, le chatbot SUTA sera **100% fonctionnel** avec :
- ✅ IA Azure OpenAI (gpt-4o-mini)
- ✅ Détection d'arnaques intelligente
- ✅ Réponses contextualisées pour la Côte d'Ivoire
- ✅ Fallback automatique si IA indisponible
- ✅ Historique des conversations
- ✅ Interface intuitive en icône flottante

**Le chatbot est prêt à protéger les utilisateurs de Mon Toit ! 🛡️**

---

**Guide rédigé par :** Manus AI  
**Date :** 22 novembre 2025  
**Version :** 1.0  
**Statut :** ✅ Prêt à Déployer

