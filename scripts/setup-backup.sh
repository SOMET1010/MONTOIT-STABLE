#!/bin/bash

# Script de configuration du système de backup pour MonToit
# Usage : ./scripts/setup-backup.sh

set -e

echo "🚀 Configuration du système de backup MonToit..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Configuration
PROJECT_ID=$(supabase status --json | jq -r '.Project.ID')
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Impossible de récupérer l'ID du projet Supabase"
    exit 1
fi

echo "📋 ID du projet : $PROJECT_ID"

# 1. Appliquer la migration de backup
echo "📦 Application de la migration du système de backup..."
supabase db reset
supabase db push

# 2. Créer le bucket de backups
echo "📁 Création du bucket de backups..."
supabase storage new --name backups

# 3. Configurer les politiques RLS pour le bucket de backups
echo "🔒 Configuration des politiques de sécurité..."
supabase db push --include-objects=storage.policies

# 4. Déployer les Edge Functions
echo "🌐 Déploiement des Edge Functions..."
supabase functions deploy backup-database
supabase functions deploy backup-storage
supabase functions deploy monitor-backups

# 5. Configurer les variables d'environnement
echo "🔧 Configuration des variables d'environnement..."
BACKUP_SECRET=$(openssl rand -base64 32)
supabase secrets set BACKUP_SECRET_KEY=$BACKUP_SECRET

# 6. Créer le cron job pour le backup quotidien
echo "⏰ Configuration du cron job de backup..."

# Récupérer l'URL de la fonction
BACKUP_URL="https://$PROJECT_ID.supabase.co/functions/v1/backup-database"

# Créer le fichier de configuration cron
CRON_FILE="/tmp/montoit-backup.cron"
cat > $CRON_FILE << EOF
# Backup quotidien de la base de données à 2h du matin
0 2 * * * curl -X POST "$BACKUP_URL" \\
  -H "Authorization: Bearer $BACKUP_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  >> /var/log/montoit-backup.log 2>&1

# Backup hebdomadaire du storage le dimanche à 3h du matin
0 3 * * 0 curl -X POST "https://$PROJECT_ID.supabase.co/functions/v1/backup-storage" \\
  -H "Authorization: Bearer $BACKUP_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  >> /var/log/montoit-backup.log 2>&1

# Nettoyage des vieux logs tous les jours à 4h du matin
0 4 * * * supabase functions invoke monitor-backups \\
  -H "Authorization: Bearer $BACKUP_SECRET_KEY" \\
  --data '{"action": "cleanup"}' \\
  >> /var/log/montoit-backup.log 2>&1
EOF

echo "📝 Fichier de configuration cron créé : $CRON_FILE"
echo "👋 Veuillez installer manuellement le cron job :"
echo "   sudo crontab $CRON_FILE"

# 7. Tester le système de backup
echo "🧪 Test du système de backup..."
TEST_RESULT=$(curl -s -X POST "$BACKUP_URL" \
  -H "Authorization: Bearer $BACKUP_SECRET_KEY" \
  -H "Content-Type: application/json" | jq -r '.success // false')

if [ "$TEST_RESULT" = "true" ]; then
    echo "✅ Test de backup réussi !"
else
    echo "❌ Test de backup échoué"
    exit 1
fi

# 8. Créer le fichier de configuration monitoring
MONITORING_CONFIG="$(cat << EOF
{
  "backup_monitoring": {
    "enabled": true,
    "check_interval": "1h",
    "alert_email": "admin@montoit.ci",
    "slack_webhook": "https://hooks.slack.com/services/...",
    "health_checks": {
      "backup_success_rate": 0.99,
      "max_execution_time": 1800,
      "max_storage_usage": 0.8
    }
  }
}
EOF
)"

# Sauvegarder la configuration
echo "$MONITORING_CONFIG" > backup-config.json

echo ""
echo "✅ Configuration du système de backup terminée !"
echo ""
echo "📋 Résumé :"
echo "   • Migration appliquée"
echo "   • Bucket 'backups' créé"
echo "   • Edge Functions déployées"
echo "   • Variables d'environnement configurées"
echo "   • Cron jobs générés"
echo ""
echo "🔑 Clé secrète de backup : $BACKUP_SECRET"
echo "⚠️  Sauvegardez cette clé dans un endroit sécurisé !"
echo ""
echo "📚 Prochaines étapes :"
echo "   1. Installer le cron job : sudo crontab $CRON_FILE"
echo "   2. Configurer les alertes email/Slack"
echo "   3. Documenter la procédure de restauration"
echo "   4. Effectuer un test de restauration complet"
echo ""
echo "📖 Documentation complète : docs/backup-strategy.md"