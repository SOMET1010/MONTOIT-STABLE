# 🔄 Scripts de Rotation des Clés API

**Date de création :** 21 novembre 2025  
**Version :** 1.0  
**Auteur :** Manus AI

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Utilisation](#utilisation)
5. [Scripts Disponibles](#scripts-disponibles)
6. [Dépannage](#dépannage)
7. [Sécurité](#sécurité)

---

## 🎯 Vue d'ensemble

Ce dossier contient des scripts shell pour faciliter la rotation des clés API exposées lors de l'incident de sécurité du 21 novembre 2025.

### Scripts Inclus

| Script | Description | Type |
|--------|-------------|------|
| `rotate-api-keys.sh` | Script principal de rotation | Semi-automatique |
| `verify-api-keys.sh` | Vérification des clés | Automatique |

---

## ✅ Prérequis

### Outils Requis

```bash
# Vérifier que vous avez tous les outils
command -v curl && echo "✅ curl installé" || echo "❌ curl manquant"
command -v jq && echo "✅ jq installé" || echo "❌ jq manquant"
command -v supabase && echo "✅ supabase installé" || echo "❌ supabase manquant"
```

### Installation des Outils

**macOS**

```bash
brew install curl jq
npm install -g supabase
```

**Linux (Ubuntu/Debian)**

```bash
sudo apt-get update
sudo apt-get install -y curl jq
npm install -g supabase
```

**Windows (WSL ou Git Bash)**

```bash
# Installer via Chocolatey
choco install curl jq
npm install -g supabase
```

### Accès Requis

- ✅ Accès au dashboard Mapbox (https://account.mapbox.com/)
- ✅ Accès au dashboard Resend (https://resend.com/)
- ✅ Accès au dashboard Brevo (https://app.brevo.com/)
- ✅ Supabase CLI configuré et connecté

---

## 🚀 Installation

### 1. Cloner le Dépôt

```bash
git clone https://github.com/SOMET1010/MONTOIT-STABLE.git
cd MONTOIT-STABLE/scripts
```

### 2. Rendre les Scripts Exécutables

```bash
chmod +x rotate-api-keys.sh
chmod +x verify-api-keys.sh
```

### 3. Configurer Supabase CLI

```bash
# Se connecter
supabase login

# Lier le projet
supabase link --project-ref YOUR_PROJECT_REF
```

---

## 📖 Utilisation

### Script 1 : Rotation des Clés API

**Objectif :** Révoquer les anciennes clés et créer de nouvelles clés pour Mapbox, Resend et Brevo.

**Commande :**

```bash
./rotate-api-keys.sh
```

**Processus :**

1. **Vérification des prérequis** - Le script vérifie que tous les outils sont installés
2. **Rotation Mapbox** - Vous guide pour révoquer et créer un nouveau token
3. **Rotation Resend** - Vous guide pour révoquer et créer une nouvelle clé
4. **Rotation Brevo** - Vous guide pour révoquer et créer une nouvelle clé
5. **Mise à jour Supabase** - Met à jour automatiquement les secrets
6. **Redéploiement** - Redéploie les Edge Functions avec les nouvelles clés

**Durée estimée :** 15-20 minutes

**Logs :**

- Log complet : `rotation-YYYYMMDD-HHMMSS.log`
- Historique : `rotation-history.log`

---

### Script 2 : Vérification des Clés API

**Objectif :** Vérifier que toutes les clés API fonctionnent correctement après la rotation.

**Commande :**

```bash
./verify-api-keys.sh
```

**Ce que le script vérifie :**

- ✅ Token Mapbox valide
- ✅ Clé Resend valide et domaine configuré
- ✅ Clé Brevo valide et crédits disponibles

**Sortie :**

```
╔════════════════════════════════════════════════════════════╗
║                      📊 RÉSUMÉ                             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Mapbox Token      : ✅ VALIDE                             ║
║  Resend API Key    : ✅ VALIDE                             ║
║  Brevo API Key     : ✅ VALIDE                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

🎉 Toutes les clés API sont valides et fonctionnelles !
```

**Durée estimée :** 30 secondes

---

## 🔧 Scripts Disponibles

### rotate-api-keys.sh

**Fonctionnalités :**

- ✅ Vérification automatique des prérequis
- ✅ Guide interactif étape par étape
- ✅ Validation des formats de clés
- ✅ Test des nouvelles clés avant mise à jour
- ✅ Mise à jour automatique de Supabase Secrets
- ✅ Redéploiement automatique des Edge Functions
- ✅ Logging complet de toutes les opérations
- ✅ Historique des rotations
- ✅ Gestion d'erreurs robuste

**Options :**

Aucune option pour l'instant. Le script est entièrement interactif.

**Exemple d'utilisation :**

```bash
$ ./rotate-api-keys.sh

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🔄 ROTATION DES CLÉS API - MON TOIT 🔄             ║
║                                                            ║
║  Ce script vous guide dans la rotation des clés exposées  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📝 Log file: rotation-20251121-140000.log

🔍 Vérification des prérequis...
✅ Tous les prérequis sont satisfaits

⚠️  AVERTISSEMENT :
Ce script va vous guider dans la rotation des clés API exposées.
Assurez-vous d'avoir accès aux dashboards Mapbox, Resend et Brevo.

Voulez-vous continuer? (y/n) y

╔════════════════════════════════════════════════════════════╗
║                  1. MAPBOX TOKEN                           ║
╚════════════════════════════════════════════════════════════╝

📋 ÉTAPES À SUIVRE :

1. Ouvrez votre navigateur et allez sur:
   https://account.mapbox.com/access-tokens/

2. Trouvez le token exposé:
   pk.eyJ1IjoicHNvbWV0IiwiYSI6ImNtYTgwZ2xmMzEzdWcyaXM2ZG45d3A4NmEifQ.MYXzdc5CREmcvtBLvfV0Lg

3. Cliquez sur 'Delete' ou 'Revoke' pour le révoquer

4. Cliquez sur 'Create a token'
   - Name: Mon Toit Production - 2025-11-21
   - Scopes: Public (read only)

5. Copiez le nouveau token

Appuyez sur Entrée quand vous avez révoqué l'ancien token...

Entrez le NOUVEAU token Mapbox: pk.eyJ1IjoicHNvbWV0IiwiYSI6ImNtYTgwZ2xmMzEzdWcyaXM2ZG45d3A4NmEifQ.NEW_TOKEN_HERE

✅ Token Mapbox reçu
🧪 Test du nouveau token...
✅ Token Mapbox validé
📤 Mise à jour de Supabase Secrets...
✅ Mapbox token mis à jour dans Supabase

🎉 Rotation Mapbox terminée avec succès!

[... suite pour Resend et Brevo ...]
```

---

### verify-api-keys.sh

**Fonctionnalités :**

- ✅ Récupération automatique des secrets depuis Supabase
- ✅ Test de chaque clé API
- ✅ Affichage des informations de compte
- ✅ Résumé visuel du statut
- ✅ Code de sortie approprié (0 = succès, 1 = échec)

**Exemple d'utilisation :**

```bash
$ ./verify-api-keys.sh

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🔍 VÉRIFICATION DES CLÉS API - MON TOIT 🔍         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📥 Récupération des secrets depuis Supabase...

✅ Secrets récupérés

╔════════════════════════════════════════════════════════════╗
║                    1. MAPBOX TOKEN                         ║
╚════════════════════════════════════════════════════════════╝

🧪 Test du token Mapbox...
✅ Token Mapbox valide
   Note: Mon Toit Production - 2025-11-21
   Créé: 2025-11-21T14:00:00.000Z

[... suite pour Resend et Brevo ...]

╔════════════════════════════════════════════════════════════╗
║                      📊 RÉSUMÉ                             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Mapbox Token      : ✅ VALIDE                             ║
║  Resend API Key    : ✅ VALIDE                             ║
║  Brevo API Key     : ✅ VALIDE                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

🎉 Toutes les clés API sont valides et fonctionnelles !
```

---

## 🐛 Dépannage

### Erreur : "Outils manquants"

**Problème :** `curl`, `jq` ou `supabase` n'est pas installé.

**Solution :**

```bash
# macOS
brew install curl jq
npm install -g supabase

# Linux
sudo apt-get install curl jq
npm install -g supabase
```

---

### Erreur : "Impossible de récupérer les secrets depuis Supabase"

**Problème :** Supabase CLI n'est pas connecté ou le projet n'est pas lié.

**Solution :**

```bash
# Se connecter
supabase login

# Lier le projet
supabase link --project-ref YOUR_PROJECT_REF

# Vérifier
supabase projects list
```

---

### Erreur : "Format de clé invalide"

**Problème :** La clé entrée ne correspond pas au format attendu.

**Solution :** Vérifiez que :

- Les tokens Mapbox commencent par `pk.`
- Les clés Resend commencent par `re_`
- Les clés Brevo commencent par `xkeysib-`

---

### Erreur : "Clé invalide" après test

**Problème :** La clé a été copiée incorrectement ou est déjà révoquée.

**Solution :**

1. Vérifiez que vous avez copié la clé complète (pas de caractères manquants)
2. Vérifiez que la clé n'a pas été révoquée sur le dashboard
3. Générez une nouvelle clé si nécessaire

---

### Erreur : "Échec du redéploiement des Edge Functions"

**Problème :** Supabase CLI ne peut pas redéployer les fonctions.

**Solution :**

```bash
# Vérifier le statut Supabase
supabase status

# Redéployer manuellement
cd /path/to/MONTOIT-STABLE
supabase functions deploy --all

# Vérifier les logs
supabase functions logs
```

---

## 🔒 Sécurité

### Bonnes Pratiques

1. ✅ **Ne jamais** committer les logs de rotation (ils contiennent des clés)
2. ✅ **Toujours** exécuter les scripts dans un terminal sécurisé
3. ✅ **Vérifier** que personne ne regarde par-dessus votre épaule
4. ✅ **Supprimer** les logs après rotation (ou les stocker de manière sécurisée)
5. ✅ **Documenter** chaque rotation dans `rotation-history.log`

### Logs et Historique

**rotation-YYYYMMDD-HHMMSS.log**

Contient le log complet de la rotation, y compris :
- Toutes les opérations effectuées
- Les erreurs rencontrées
- Les timestamps

**⚠️ ATTENTION :** Ce fichier peut contenir des informations sensibles. Ne le partagez pas.

**rotation-history.log**

Contient l'historique des rotations :

```
2025-11-21 | Mapbox | Token révoqué et nouveau créé | john.doe
2025-11-21 | Resend | Clé révoquée et nouvelle créée | john.doe
2025-11-21 | Brevo | Clé révoquée et nouvelle créée | john.doe
```

Ce fichier peut être committé (il ne contient pas de clés).

### Nettoyage

Après la rotation, supprimez les logs sensibles :

```bash
# Supprimer tous les logs de rotation
rm -f rotation-*.log

# Garder uniquement l'historique
# (rotation-history.log ne contient pas de clés)
```

---

## 📞 Support

**En cas de problème :**

1. Consultez la section [Dépannage](#dépannage)
2. Vérifiez les logs : `rotation-YYYYMMDD-HHMMSS.log`
3. Consultez la documentation de sécurité : `SECURITY_BEST_PRACTICES.md`
4. Contactez le lead dev ou l'équipe sécurité

---

## 📚 Ressources

- [Documentation Mapbox API](https://docs.mapbox.com/api/)
- [Documentation Resend API](https://resend.com/docs)
- [Documentation Brevo API](https://developers.brevo.com/)
- [Documentation Supabase CLI](https://supabase.com/docs/guides/cli)
- [SECURITY_BEST_PRACTICES.md](../SECURITY_BEST_PRACTICES.md)
- [SECURITY_INCIDENT_RESPONSE.md](../SECURITY_INCIDENT_RESPONSE.md)

---

**Document créé le :** 21 novembre 2025  
**Dernière mise à jour :** 21 novembre 2025  
**Auteur :** Manus AI

