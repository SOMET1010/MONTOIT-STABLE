# 🛡️ GUIDE DE SÉCURITÉ - GESTION DES SECRETS

**Date de création :** 21 novembre 2025  
**Version :** 1.0  
**Auteur :** Manus AI  
**Statut :** ✅ **ACTIF - À IMPLÉMENTER IMMÉDIATEMENT**

---

## 📋 TABLE DES MATIÈRES

1. [Principes Fondamentaux](#principes-fondamentaux)
2. [Ce Qu'il Ne Faut JAMAIS Faire](#ce-quil-ne-faut-jamais-faire)
3. [Bonnes Pratiques](#bonnes-pratiques)
4. [Gestion des Fichiers .env](#gestion-des-fichiers-env)
5. [Utilisation de Supabase Secrets](#utilisation-de-supabase-secrets)
6. [Pre-commit Hooks](#pre-commit-hooks)
7. [Rotation des Clés](#rotation-des-clés)
8. [Monitoring et Alertes](#monitoring-et-alertes)
9. [Formation de l'Équipe](#formation-de-léquipe)
10. [Checklist de Sécurité](#checklist-de-sécurité)

---

## 🎯 PRINCIPES FONDAMENTAUX

### Règle d'Or

> **AUCUN SECRET NE DOIT JAMAIS ÊTRE COMMITTÉ DANS GIT**

Cela inclut :
- Clés API
- Mots de passe
- Tokens d'authentification
- Certificats privés
- Secrets de chiffrement
- Connection strings avec credentials
- Clés SSH privées
- Variables d'environnement sensibles

### Pourquoi C'est Critique

Une fois qu'un secret est dans Git, il est **permanent** :
- Il reste dans l'historique même après suppression
- Il peut être cloné par n'importe qui (dépôt public)
- Il peut être indexé par des bots de scanning
- Il est difficile et coûteux à nettoyer complètement

### Conséquences d'une Exposition

**Techniques :**
- Accès non autorisé aux services
- Consommation frauduleuse de ressources
- Frais non autorisés
- Spam / phishing en votre nom
- Compromission de données

**Business :**
- Coûts financiers (factures API)
- Atteinte à la réputation
- Perte de confiance des clients
- Sanctions légales (RGPD, etc.)
- Temps perdu en gestion d'incident

---

## ❌ CE QU'IL NE FAUT JAMAIS FAIRE

### 1. Committer des Fichiers .env

```bash
# ❌ JAMAIS FAIRE ÇA
git add .env
git add .env.production
git add .env.local
git commit -m "Add environment variables"
```

**Pourquoi :** Ces fichiers contiennent des secrets en clair.

---

### 2. Hardcoder des Secrets dans le Code

```typescript
// ❌ JAMAIS FAIRE ÇA
const API_KEY = "sk_live_abc123...";
const DATABASE_URL = "postgresql://user:password@host/db";
```

**Pourquoi :** Le code est versionné et partagé.

---

### 3. Mettre des Secrets dans les Commentaires

```typescript
// ❌ JAMAIS FAIRE ÇA
// API Key: sk_live_abc123...
// Password: MySecretPass123
```

**Pourquoi :** Les commentaires sont indexés et searchables.

---

### 4. Utiliser des Secrets en Clair dans les Logs

```typescript
// ❌ JAMAIS FAIRE ÇA
console.log(`API Key: ${API_KEY}`);
logger.info(`Connecting with password: ${password}`);
```

**Pourquoi :** Les logs sont souvent publics ou peu sécurisés.

---

### 5. Partager des Secrets par Email/Slack

```
// ❌ JAMAIS FAIRE ÇA
Hey, voici la clé API: sk_live_abc123...
```

**Pourquoi :** Les emails/messages sont stockés et peuvent être interceptés.

---

### 6. Utiliser des Secrets Faibles ou Prévisibles

```bash
# ❌ JAMAIS FAIRE ÇA
API_KEY=123456
PASSWORD=password
SECRET=secret
```

**Pourquoi :** Facilement devinables par brute force.

---

### 7. Réutiliser les Mêmes Secrets

```bash
# ❌ JAMAIS FAIRE ÇA
# Utiliser la même clé pour dev, staging et production
```

**Pourquoi :** Une compromission affecte tous les environnements.

---

### 8. Ne Jamais Roter les Clés

```bash
# ❌ JAMAIS FAIRE ÇA
# Utiliser la même clé pendant des années
```

**Pourquoi :** Plus une clé est ancienne, plus elle a de chances d'être compromise.

---

## ✅ BONNES PRATIQUES

### 1. Utiliser des Variables d'Environnement

```typescript
// ✅ BONNE PRATIQUE
const API_KEY = process.env.API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

**Avantages :**
- Secrets séparés du code
- Faciles à changer sans redéploiement
- Différents par environnement

---

### 2. Utiliser un Gestionnaire de Secrets

**Options recommandées :**

#### Supabase Secrets (Recommandé pour Mon Toit)

```bash
# Ajouter un secret
supabase secrets set API_KEY=sk_live_abc123...

# Lister les secrets (valeurs masquées)
supabase secrets list

# Supprimer un secret
supabase secrets unset API_KEY
```

**Avantages :**
- Intégré à Supabase
- Chiffré au repos
- Accessible aux Edge Functions
- Gratuit

#### Alternatives

- **AWS Secrets Manager** : Pour infrastructure AWS
- **HashiCorp Vault** : Solution enterprise
- **Azure Key Vault** : Pour infrastructure Azure
- **Google Secret Manager** : Pour infrastructure GCP

---

### 3. Utiliser .env.example comme Template

```bash
# ✅ .env.example (committé dans Git)
# API Keys
MAPBOX_PUBLIC_TOKEN=your_mapbox_token_here
RESEND_API_KEY=your_resend_key_here
BREVO_API_KEY=your_brevo_key_here

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

```bash
# ✅ .env (JAMAIS committé)
# Copier depuis .env.example et remplir avec les vraies valeurs
MAPBOX_PUBLIC_TOKEN=pk.eyJ1IjoicHNvbWV0...
RESEND_API_KEY=re_DvxxTkmv...
BREVO_API_KEY=xkeysib-d8c9...
```

**Workflow :**
1. Développeur clone le dépôt
2. Copie `.env.example` vers `.env`
3. Remplit `.env` avec les vraies valeurs (obtenues séparément)
4. `.env` est ignoré par Git

---

### 4. Configurer .gitignore Correctement

```bash
# ✅ .gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.development
.env.test

# Secrets
secrets/
*.key
*.pem
*.p12
*.pfx

# Credentials
credentials.json
service-account.json
```

**Vérifier que .gitignore fonctionne :**

```bash
# Vérifier qu'un fichier est ignoré
git check-ignore -v .env

# Lister tous les fichiers ignorés
git status --ignored
```

---

### 5. Utiliser des Secrets Différents par Environnement

```bash
# ✅ BONNE PRATIQUE
# Development
RESEND_API_KEY=re_test_abc123...  # Clé de test

# Staging
RESEND_API_KEY=re_staging_def456...  # Clé de staging

# Production
RESEND_API_KEY=re_live_ghi789...  # Clé de production
```

**Avantages :**
- Isolation des environnements
- Facilite le debugging
- Limite l'impact d'une compromission

---

### 6. Masquer les Secrets dans les Logs

```typescript
// ✅ BONNE PRATIQUE
function maskSecret(secret: string): string {
  if (!secret || secret.length < 10) return '***';
  return secret.substring(0, 4) + '...' + secret.substring(secret.length - 4);
}

console.log(`API Key: ${maskSecret(API_KEY)}`);
// Output: API Key: sk_l...3456
```

---

### 7. Valider les Secrets au Démarrage

```typescript
// ✅ BONNE PRATIQUE
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'RESEND_API_KEY',
  'BREVO_API_KEY',
  'MAPBOX_PUBLIC_TOKEN'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

console.log('✅ All required environment variables are set');
```

---

### 8. Utiliser des Permissions Minimales

```bash
# ✅ BONNE PRATIQUE
# Créer des clés API avec permissions limitées

# Resend : Clé avec permission "Send emails" uniquement
# Brevo : Clé avec permission "Send SMS" uniquement
# Mapbox : Token public (read-only)
```

**Principe du moindre privilège :**
- Chaque clé a uniquement les permissions nécessaires
- Limite l'impact d'une compromission

---

## 📁 GESTION DES FICHIERS .env

### Structure Recommandée

```
project/
├── .env.example          # ✅ Committé (template)
├── .env                  # ❌ Ignoré (local development)
├── .env.local            # ❌ Ignoré (overrides locaux)
├── .env.development      # ❌ Ignoré (dev)
├── .env.staging          # ❌ Ignoré (staging)
├── .env.production       # ❌ Ignoré (production)
└── .gitignore            # ✅ Committé
```

### Workflow de Développement

**1. Nouveau développeur rejoint l'équipe**

```bash
# Cloner le dépôt
git clone https://github.com/SOMET1010/MONTOIT-STABLE.git
cd MONTOIT-STABLE

# Copier le template
cp .env.example .env

# Demander les secrets au lead dev (via canal sécurisé)
# Remplir .env avec les vraies valeurs

# Vérifier que .env est ignoré
git status  # .env ne doit PAS apparaître
```

**2. Ajouter une nouvelle variable d'environnement**

```bash
# 1. Ajouter dans .env.example (avec placeholder)
echo "NEW_API_KEY=your_new_api_key_here" >> .env.example

# 2. Committer .env.example
git add .env.example
git commit -m "docs: Add NEW_API_KEY to environment variables"

# 3. Ajouter dans .env (avec vraie valeur)
echo "NEW_API_KEY=real_value_abc123" >> .env

# 4. Informer l'équipe de mettre à jour leur .env
```

**3. Partager des secrets de manière sécurisée**

**❌ Ne PAS utiliser :**
- Email
- Slack/Teams
- SMS
- Fichiers partagés non chiffrés

**✅ Utiliser :**
- **1Password** / **LastPass** : Coffres-forts partagés
- **Bitwarden** : Open source, auto-hébergeable
- **Supabase Secrets** : Pour les Edge Functions
- **Rencontre en personne** : Pour secrets très sensibles
- **Outils de partage éphémère** : https://onetimesecret.com

---

## 🔐 UTILISATION DE SUPABASE SECRETS

### Configuration Initiale

**1. Installer Supabase CLI**

```bash
npm install -g supabase
```

**2. Se connecter**

```bash
supabase login
```

**3. Lier le projet**

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Gestion des Secrets

**Ajouter un secret**

```bash
supabase secrets set RESEND_API_KEY=re_DvxxTkmv...
supabase secrets set BREVO_API_KEY=xkeysib-d8c9...
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ1...
```

**Lister les secrets**

```bash
supabase secrets list

# Output:
# NAME                    | UPDATED AT
# ----------------------- | --------------------
# RESEND_API_KEY          | 2025-11-21 14:00:00
# BREVO_API_KEY           | 2025-11-21 14:00:00
# MAPBOX_PUBLIC_TOKEN     | 2025-11-21 14:00:00
```

**Supprimer un secret**

```bash
supabase secrets unset RESEND_API_KEY
```

**Utiliser dans une Edge Function**

```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Les secrets sont automatiquement disponibles via Deno.env
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    return new Response('RESEND_API_KEY not configured', { status: 500 });
  }
  
  // Utiliser la clé...
});
```

### Bonnes Pratiques Supabase

1. ✅ Utiliser Supabase Secrets pour les Edge Functions
2. ✅ Utiliser des variables d'environnement frontend via Vite (`VITE_*`)
3. ✅ Ne jamais exposer des secrets côté client
4. ✅ Roter les secrets via `supabase secrets set` (écrase l'ancienne valeur)

---

## 🪝 PRE-COMMIT HOOKS

### Installation de git-secrets

**macOS**

```bash
brew install git-secrets
```

**Linux**

```bash
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install
```

**Windows**

```powershell
# Via Chocolatey
choco install git-secrets
```

### Configuration

**1. Initialiser dans le dépôt**

```bash
cd /path/to/MONTOIT-STABLE
git secrets --install
```

**2. Ajouter des patterns à détecter**

```bash
# Détecter les clés AWS
git secrets --register-aws

# Détecter les patterns personnalisés
git secrets --add 'pk\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+'  # Mapbox
git secrets --add 're_[a-zA-Z0-9]+'  # Resend
git secrets --add 'xkeysib-[a-zA-Z0-9-]+'  # Brevo
git secrets --add 'sk_live_[a-zA-Z0-9]+'  # Stripe
git secrets --add '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'  # UUIDs sensibles
```

**3. Scanner le dépôt existant**

```bash
git secrets --scan
```

**4. Scanner l'historique complet**

```bash
git secrets --scan-history
```

### Alternative : gitleaks

**Installation**

```bash
# macOS
brew install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**Utilisation**

```bash
# Scanner le dépôt
gitleaks detect --source . --verbose

# Scanner l'historique
gitleaks detect --source . --log-opts="--all"

# Générer un rapport
gitleaks detect --source . --report-path=gitleaks-report.json
```

**Configuration personnalisée**

```toml
# .gitleaks.toml
title = "Mon Toit Gitleaks Config"

[[rules]]
id = "mapbox-token"
description = "Mapbox Public Token"
regex = '''pk\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+'''

[[rules]]
id = "resend-api-key"
description = "Resend API Key"
regex = '''re_[a-zA-Z0-9]+'''

[[rules]]
id = "brevo-api-key"
description = "Brevo API Key"
regex = '''xkeysib-[a-zA-Z0-9-]+'''

[[rules]]
id = "cryptoneo-key"
description = "CryptoNeo API Key"
regex = '''[0-9a-f]{6}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{8}'''
```

### Pre-commit Hook Manuel

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "🔍 Scanning for secrets..."

# Scanner avec gitleaks
gitleaks protect --staged --verbose

if [ $? -ne 0 ]; then
  echo "❌ Secrets detected! Commit blocked."
  echo "Please remove secrets before committing."
  exit 1
fi

echo "✅ No secrets detected."
exit 0
```

**Rendre exécutable**

```bash
chmod +x .git/hooks/pre-commit
```

---

## 🔄 ROTATION DES CLÉS

### Pourquoi Roter les Clés

- **Sécurité proactive** : Limite la fenêtre d'exploitation
- **Conformité** : Requis par certaines normes (PCI-DSS, SOC 2)
- **Bonne pratique** : Réduit l'impact d'une compromission non détectée

### Fréquence Recommandée

| Type de Clé | Fréquence | Raison |
|-------------|-----------|--------|
| **Production API Keys** | Tous les 90 jours | Sécurité standard |
| **Staging API Keys** | Tous les 180 jours | Moins critique |
| **Development API Keys** | Tous les 365 jours | Environnement local |
| **Clés compromises** | **Immédiatement** | Urgence |
| **Clés de test** | Tous les 180 jours | Moins critique |

### Processus de Rotation

**1. Planification**

```markdown
- [ ] Identifier les clés à roter
- [ ] Vérifier les dépendances (services utilisant la clé)
- [ ] Planifier une fenêtre de maintenance
- [ ] Informer l'équipe
- [ ] Préparer les nouvelles clés
```

**2. Génération**

```bash
# Générer une nouvelle clé sur le service
# Exemple : Resend
# 1. Se connecter à https://resend.com
# 2. Settings > API Keys
# 3. Create API Key
# 4. Copier la nouvelle clé
```

**3. Mise à Jour**

```bash
# Mettre à jour dans Supabase
supabase secrets set RESEND_API_KEY=new_key_value

# Mettre à jour dans .env local
sed -i 's/RESEND_API_KEY=.*/RESEND_API_KEY=new_key_value/' .env

# Redéployer les Edge Functions
supabase functions deploy --all
```

**4. Vérification**

```bash
# Tester le service avec la nouvelle clé
curl -X POST \
  "https://YOUR_PROJECT.supabase.co/functions/v1/send-email" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "template": "welcome",
    "data": {"name": "Test"}
  }'
```

**5. Révocation**

```bash
# Révoquer l'ancienne clé sur le service
# Attendre 24-48h pour s'assurer qu'elle n'est plus utilisée
# Puis supprimer définitivement
```

**6. Documentation**

```markdown
# Rotation Log
- Date: 2025-11-21
- Clé: RESEND_API_KEY
- Ancienne clé: re_old_...
- Nouvelle clé: re_new_...
- Révoquée le: 2025-11-23
- Responsable: John Doe
```

### Automatisation

**Script de rotation automatique**

```bash
#!/bin/bash
# rotate-keys.sh

echo "🔄 Rotation des clés API"

# 1. Générer nouvelles clés (à adapter selon le service)
# 2. Mettre à jour Supabase Secrets
# 3. Redéployer
# 4. Tester
# 5. Révoquer anciennes clés après 48h

# Exemple pour Resend
read -sp "Nouvelle clé Resend: " NEW_RESEND_KEY
echo ""

supabase secrets set RESEND_API_KEY="$NEW_RESEND_KEY"
supabase functions deploy --all

echo "✅ Rotation terminée"
echo "⚠️  N'oubliez pas de révoquer l'ancienne clé dans 48h"
```

---

## 📊 MONITORING ET ALERTES

### Métriques à Surveiller

**1. Utilisation des API**

```typescript
// Tracker l'utilisation
interface APIUsageMetrics {
  service: string;
  endpoint: string;
  count: number;
  timestamp: Date;
  ip?: string;
  user_id?: string;
}

// Logger chaque appel
async function trackAPIUsage(metrics: APIUsageMetrics) {
  await supabase
    .from('api_usage_logs')
    .insert(metrics);
}
```

**2. Erreurs d'authentification**

```typescript
// Détecter les tentatives avec clés invalides
async function logAuthFailure(service: string, ip: string) {
  await supabase
    .from('auth_failures')
    .insert({
      service,
      ip,
      timestamp: new Date()
    });
  
  // Alerter si trop de tentatives
  const recentFailures = await supabase
    .from('auth_failures')
    .select('*')
    .eq('ip', ip)
    .gte('timestamp', new Date(Date.now() - 3600000)); // 1h
  
  if (recentFailures.data && recentFailures.data.length > 10) {
    await sendAlert('Suspicious activity detected', { ip, service });
  }
}
```

**3. Coûts inhabituels**

```typescript
// Surveiller les coûts par service
interface CostAlert {
  service: string;
  daily_cost: number;
  threshold: number;
  exceeded: boolean;
}

async function checkCosts() {
  const costs = await fetchDailyCosts(); // Implémenter selon le service
  
  for (const cost of costs) {
    if (cost.daily_cost > cost.threshold) {
      await sendAlert('Cost threshold exceeded', cost);
    }
  }
}
```

### Configuration des Alertes

**Sentry (Recommandé)**

```typescript
// sentry.config.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Masquer les secrets dans les erreurs
    if (event.request) {
      event.request.headers = maskHeaders(event.request.headers);
    }
    return event;
  }
});

function maskHeaders(headers: any) {
  const sensitiveHeaders = ['authorization', 'x-api-key'];
  for (const header of sensitiveHeaders) {
    if (headers[header]) {
      headers[header] = '***MASKED***';
    }
  }
  return headers;
}
```

**Email Alerts**

```typescript
// alerts.ts
async function sendAlert(title: string, details: any) {
  await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/send-email', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: 'security@montoit.ci',
      template: 'security_alert',
      data: {
        title,
        details,
        timestamp: new Date().toISOString()
      }
    })
  });
}
```

---

## 👥 FORMATION DE L'ÉQUIPE

### Onboarding des Nouveaux Développeurs

**Checklist de sécurité**

- [ ] Lire ce document (SECURITY_BEST_PRACTICES.md)
- [ ] Lire SECURITY_INCIDENT_RESPONSE.md
- [ ] Configurer .gitignore correctement
- [ ] Installer git-secrets ou gitleaks
- [ ] Configurer pre-commit hooks
- [ ] Obtenir les secrets via canal sécurisé
- [ ] Tester que .env n'est pas committé
- [ ] Comprendre le processus de rotation des clés
- [ ] Savoir comment réagir en cas d'incident

### Sessions de Formation

**1. Formation initiale (1h)**

- Principes de sécurité des secrets
- Démonstration d'un incident
- Outils et workflows
- Q&A

**2. Rappels trimestriels (30min)**

- Revue des incidents récents (industrie)
- Nouvelles menaces
- Mise à jour des outils
- Bonnes pratiques

### Ressources

- **OWASP Top 10** : https://owasp.org/www-project-top-ten/
- **OWASP Secrets Management Cheat Sheet** : https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- **GitHub Secret Scanning** : https://docs.github.com/en/code-security/secret-scanning
- **GitGuardian Blog** : https://blog.gitguardian.com/

---

## ✅ CHECKLIST DE SÉCURITÉ

### Configuration Initiale

- [ ] .gitignore configuré avec tous les patterns de secrets
- [ ] .env.example créé et committé
- [ ] .env créé localement (jamais committé)
- [ ] git-secrets ou gitleaks installé
- [ ] Pre-commit hooks configurés
- [ ] Supabase Secrets configuré pour les Edge Functions
- [ ] Documentation de sécurité partagée avec l'équipe

### Développement Quotidien

- [ ] Vérifier que .env n'apparaît pas dans `git status`
- [ ] Ne jamais hardcoder de secrets dans le code
- [ ] Masquer les secrets dans les logs
- [ ] Valider les variables d'environnement au démarrage
- [ ] Utiliser des permissions minimales pour les clés API

### Revue de Code

- [ ] Vérifier qu'aucun secret n'est présent
- [ ] Vérifier que les secrets sont bien masqués dans les logs
- [ ] Vérifier que les variables d'environnement sont validées
- [ ] Vérifier que les erreurs ne révèlent pas de secrets

### Déploiement

- [ ] Secrets configurés dans Supabase
- [ ] Variables d'environnement vérifiées
- [ ] Tests de connexion aux services externes
- [ ] Monitoring et alertes activés
- [ ] Documentation de déploiement à jour

### Maintenance

- [ ] Rotation des clés tous les 90 jours (production)
- [ ] Audit de sécurité trimestriel
- [ ] Revue des logs d'utilisation des API
- [ ] Vérification des coûts
- [ ] Formation de l'équipe

### En Cas d'Incident

- [ ] Suivre SECURITY_INCIDENT_RESPONSE.md
- [ ] Révoquer immédiatement les clés exposées
- [ ] Générer de nouvelles clés
- [ ] Mettre à jour tous les environnements
- [ ] Vérifier les logs pour utilisation malveillante
- [ ] Documenter l'incident
- [ ] Analyser les causes et améliorer les processus

---

## 📞 CONTACTS

**En cas de question ou d'incident :**

- **Lead Dev** : [À compléter]
- **DevOps** : [À compléter]
- **Security Team** : security@montoit.ci
- **ANSUT Support** : support@ansut.ci

---

## 📚 RÉFÉRENCES

1. OWASP Top 10 - https://owasp.org/www-project-top-ten/
2. OWASP Secrets Management Cheat Sheet - https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
3. GitHub Secret Scanning - https://docs.github.com/en/code-security/secret-scanning
4. AWS Secrets Manager Best Practices - https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html
5. Supabase Secrets Documentation - https://supabase.com/docs/guides/functions/secrets
6. git-secrets - https://github.com/awslabs/git-secrets
7. gitleaks - https://github.com/gitleaks/gitleaks
8. GitGuardian Blog - https://blog.gitguardian.com/

---

**Document créé le :** 21 novembre 2025  
**Dernière mise à jour :** 21 novembre 2025  
**Auteur :** Manus AI  
**Statut :** ✅ **ACTIF - À IMPLÉMENTER IMMÉDIATEMENT**

