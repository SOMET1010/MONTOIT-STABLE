# Stratégie de Backup pour MonToit

## 📋 Vue d'ensemble

Ce document décrit la stratégie complète de backup pour l'application MonToit, incluant la sauvegarde automatique de la base de données et des fichiers, le monitoring, et les procédures de restauration.

## 🎯 Objectifs

- **Disponibilité** : Garantir la continuité de service
- **Récupération** : Permettre une restauration rapide en cas d'incident
- **Conformité** : Respecter les exigences légales de conservation des données
- **Performance** : Minimiser l'impact sur les performances de l'application

## 🏗️ Architecture

### Composants

1. **Base de données Supabase** : PostgreSQL avec backup automatique
2. **Storage Supabase** : Fichiers utilisateurs (documents, images, contrats)
3. **Edge Functions** : Automatisation des backups
4. **Monitoring** : Surveillance de l'état des backups
5. **Alertes** : Notifications en cas d'échec

## 📅 Fréquence des Backups

| Type | Fréquence | Rétention | Heure d'exécution |
|------|-----------|-----------|------------------|
| Base de données | Quotidien | 7 jours | 02:00 UTC |
| Base de données | Hebdomadaire | 4 semaines | Dimanche 02:00 UTC |
| Base de données | Mensuel | 12 mois | 1er du mois 02:00 UTC |
| Storage | Hebdomadaire | 4 semaines | Dimanche 03:00 UTC |
| Storage | Mensuel | 12 mois | 1er du mois 03:00 UTC |

## 🔧 Configuration

### Variables d'environnement

```bash
# Dans Supabase Edge Functions
BACKUP_SECRET_KEY=your-secret-key-here
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Cron Jobs

```bash
# Backup quotidien de la base de données
0 2 * * * curl -X POST "https://your-project.supabase.co/functions/v1/backup-database" \
  -H "Authorization: Bearer $BACKUP_SECRET_KEY"

# Backup hebdomadaire du storage
0 3 * * 0 curl -X POST "https://your-project.supabase.co/functions/v1/backup-storage" \
  -H "Authorization: Bearer $BACKUP_SECRET_KEY"
```

## 📊 Monitoring

### Métriques surveillées

- **Taux de succès des backups** : Doit être > 99%
- **Délai d'exécution** : < 30 minutes pour la base, < 2 heures pour le storage
- **Taille des backups** : Surveiller les variations anormales
- **Espace de stockage** : Utilisation < 80% de l'espace alloué

### Alertes

- **Échec de backup** : Notification immédiate aux administrateurs
- **Backup en retard** : Alerte après 4h de retard
- **Espace insuffisant** : Alerte à 80% d'utilisation
- **Anomalie de taille** : Variation > 50% par rapport à la moyenne

## 🔄 Procédures de Restauration

### 1. Base de données

#### Restauration complète
```sql
-- Connexion à la base de données cible
\c postgresql://user:password@host:port/database

-- Restauration depuis le backup
psql -h host -U user -d database -f backup-file.sql
```

#### Restauration sélective
```sql
-- Restaurer une table spécifique
COPY table_name FROM 'backup-table.csv' WITH CSV HEADER;

-- Restaurer une période spécifique
INSERT INTO table_name
SELECT * FROM backup_table
WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31';
```

### 2. Storage

#### Restauration complète
```typescript
// Utiliser l'Edge Function de restauration
const { data, error } = await supabase.functions.invoke('restore-storage', {
  body: {
    backup_file: 'backup-storage-2024-01-01.tar.gz',
    target_bucket: 'restored-storage'
  }
});
```

#### Restauration sélective
```typescript
// Restaurer des fichiers spécifiques
const filesToRestore = [
  'properties/user123/photo.jpg',
  'documents/contract456.pdf'
];

for (const file of filesToRestore) {
  const { data } = await supabase.storage
    .from('backups')
    .download(`storage-backup/${file}`);

  await supabase.storage
    .from('target-bucket')
    .upload(file, data);
}
```

## 🚨 Plan de Reprise d'Activité

### RPO (Recovery Point Objective) : 24 heures
- Perte maximale de données acceptée : 1 jour
- Base de données : Backup quotidien
- Storage : Backup hebdomadaire

### RTO (Recovery Time Objective) : 4 heures
- Temps maximum de restauration : 4 heures
- Base de données critique : 1 heure
- Storage non-critique : 4 heures

### Scénarios de catastrophe

#### 1. Perte de la base de données
- **Détection** : Immédiate (monitoring)
- **Action** : Restaurer depuis le dernier backup quotidien
- **Délai** : 1-2 heures
- **Impact** : Données perdues depuis le dernier backup

#### 2. Perte du Storage
- **Détection** : Immédiate (monitoring)
- **Action** : Restaurer depuis le dernier backup hebdomadaire
- **Délai** : 2-4 heures
- **Impact** : Fichiers de la semaine perdue

#### 3. Corruption des données
- **Détection** : Vérification d'intégrité quotidienne
- **Action** : Restaurer depuis le backup sain précédent
- **Délai** : 1 heure
- **Impact** : Données depuis le dernier backup sain perdues

## ✅ Checklist de maintenance

### Hebdomadaire
- [ ] Vérifier les logs des backups
- [ ] Confirmer l'espace disponible
- [ ] Tester les alertes
- [ ] Vérifier les temps d'exécution

### Mensuelle
- [ ] Effectuer un test de restauration
- [ ] Nettoyer les vieux backups
- [ ] Mettre à jour la documentation
- [ ] Revoir la configuration

### Annuelle
- [ ] Audit complet de la stratégie
- [ ] Test de récupération complète
- [ ] Évaluation des coûts
- [ ] Plan d'amélioration

## 🔐 Sécurité

### Contrôle d'accès
- Les backups sont stockés dans un bucket séparé avec accès restreint
- Seuls les administrateurs peuvent accéder aux backups
- Chaque requête de backup nécessite une clé secrète

### Encryption
- Données encryptées au repos
- Transfert via HTTPS uniquement
- Clés d'encryption rotées trimestriellement

### Audit
- Tous les accès aux backups sont loggés
- Tentatives d'accès non autorisées génèrent des alertes
- Revue trimestrielle des logs d'accès

## 📞 Contacts d'urgence

- **Administrateur système** : sysadmin@montoit.ci
- **Équipe Supabase** : support@supabase.io
- **Documentation d'urgence** : Ce document

## 📈 Évolutions prévues

1. **Cross-region replication** : Mirroring dans une autre région
2. **Point-in-time recovery** : Restauration à un instant T précis
3. **Backups différentiels** : Optimisation de l'espace et du temps
4. **Self-service restore** : Interface pour les restaurations simples

## 📚 Ressources

- [Documentation Supabase Backup](https://supabase.com/docs/guides/platform/backups)
- [Edge Functions Supabase](https://supabase.com/docs/guides/functions)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)

---

*Dernière mise à jour : 6 Décembre 2024*
*Version : 1.0*