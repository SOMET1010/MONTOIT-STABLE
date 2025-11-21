#!/bin/bash

################################################################################
# SCRIPT DE ROTATION DES CLÉS API - MON TOIT
################################################################################
# Description : Rotation semi-automatique des clés API exposées
# Date : 21 novembre 2025
# Auteur : Manus AI
# Version : 1.0
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/rotation-$(date +%Y%m%d-%H%M%S).log"

################################################################################
# LOGGING FUNCTIONS
################################################################################

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

################################################################################
# BANNER
################################################################################

print_banner() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                            ║${NC}"
    echo -e "${BLUE}║         🔄 ROTATION DES CLÉS API - MON TOIT 🔄             ║${NC}"
    echo -e "${BLUE}║                                                            ║${NC}"
    echo -e "${BLUE}║  Ce script vous guide dans la rotation des clés exposées  ║${NC}"
    echo -e "${BLUE}║                                                            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

################################################################################
# PREREQUISITES CHECK
################################################################################

check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    local missing_tools=()
    
    # Check for required tools
    command -v curl >/dev/null 2>&1 || missing_tools+=("curl")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")
    command -v supabase >/dev/null 2>&1 || missing_tools+=("supabase")
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Outils manquants: ${missing_tools[*]}"
        echo ""
        echo "Installation requise:"
        for tool in "${missing_tools[@]}"; do
            case $tool in
                curl)
                    echo "  - curl: sudo apt-get install curl (Linux) ou brew install curl (macOS)"
                    ;;
                jq)
                    echo "  - jq: sudo apt-get install jq (Linux) ou brew install jq (macOS)"
                    ;;
                supabase)
                    echo "  - supabase: npm install -g supabase"
                    ;;
            esac
        done
        exit 1
    fi
    
    log "✅ Tous les prérequis sont satisfaits"
}

################################################################################
# MAPBOX ROTATION (AUTOMATIC)
################################################################################

rotate_mapbox() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                  1. MAPBOX TOKEN                           ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_info "Mapbox nécessite une rotation manuelle via le dashboard"
    echo ""
    echo -e "${YELLOW}📋 ÉTAPES À SUIVRE :${NC}"
    echo ""
    echo "1. Ouvrez votre navigateur et allez sur:"
    echo -e "   ${BLUE}https://account.mapbox.com/access-tokens/${NC}"
    echo ""
    echo "2. Trouvez le token exposé:"
    echo -e "   ${RED}pk.eyJ1IjoicHNvbWV0IiwiYSI6ImNtYTgwZ2xmMzEzdWcyaXM2ZG45d3A4NmEifQ.MYXzdc5CREmcvtBLvfV0Lg${NC}"
    echo ""
    echo "3. Cliquez sur 'Delete' ou 'Revoke' pour le révoquer"
    echo ""
    echo "4. Cliquez sur 'Create a token'"
    echo "   - Name: Mon Toit Production - $(date +%Y-%m-%d)"
    echo "   - Scopes: Public (read only)"
    echo ""
    echo "5. Copiez le nouveau token"
    echo ""
    
    read -p "Appuyez sur Entrée quand vous avez révoqué l'ancien token..."
    
    echo ""
    read -p "Entrez le NOUVEAU token Mapbox: " NEW_MAPBOX_TOKEN
    
    if [ -z "$NEW_MAPBOX_TOKEN" ]; then
        log_error "Token Mapbox vide. Abandon."
        return 1
    fi
    
    # Validate token format
    if [[ ! $NEW_MAPBOX_TOKEN =~ ^pk\. ]]; then
        log_error "Format de token invalide. Les tokens Mapbox commencent par 'pk.'"
        return 1
    fi
    
    log "✅ Token Mapbox reçu"
    
    # Test the token
    log "🧪 Test du nouveau token..."
    local test_response=$(curl -s "https://api.mapbox.com/tokens/v2?access_token=${NEW_MAPBOX_TOKEN}")
    
    if echo "$test_response" | jq -e '.code' >/dev/null 2>&1; then
        log_error "Token invalide: $(echo "$test_response" | jq -r '.message')"
        return 1
    fi
    
    log "✅ Token Mapbox validé"
    
    # Update Supabase
    log "📤 Mise à jour de Supabase Secrets..."
    if supabase secrets set VITE_MAPBOX_PUBLIC_TOKEN="$NEW_MAPBOX_TOKEN" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Mapbox token mis à jour dans Supabase"
    else
        log_error "Échec de la mise à jour Supabase pour Mapbox"
        return 1
    fi
    
    # Log the rotation
    echo "$(date +%Y-%m-%d) | Mapbox | Token révoqué et nouveau créé | $(whoami)" >> "${SCRIPT_DIR}/rotation-history.log"
    
    echo ""
    log "🎉 Rotation Mapbox terminée avec succès!"
    return 0
}

################################################################################
# RESEND ROTATION (MANUAL)
################################################################################

rotate_resend() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                  2. RESEND API KEY                         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_warning "Resend ne fournit pas d'API pour gérer les clés"
    echo ""
    echo -e "${YELLOW}📋 ÉTAPES À SUIVRE :${NC}"
    echo ""
    echo "1. Ouvrez votre navigateur et allez sur:"
    echo -e "   ${BLUE}https://resend.com/api-keys${NC}"
    echo ""
    echo "2. Trouvez la clé exposée:"
    echo -e "   ${RED}re_DvxxTkmv_KLgX7D1LSvr4tVZK1EUtRLv9${NC}"
    echo ""
    echo "3. Cliquez sur 'Delete' pour la supprimer"
    echo ""
    echo "4. Cliquez sur 'Create API Key'"
    echo "   - Name: Mon Toit Production - $(date +%Y-%m-%d)"
    echo "   - Permission: Full access"
    echo "   - Domain: notifications.ansut.ci"
    echo ""
    echo "5. Copiez la nouvelle clé (elle ne sera affichée qu'une fois!)"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Vérifiez aussi les logs Resend pour détecter${NC}"
    echo -e "${RED}   toute activité suspecte avant la rotation${NC}"
    echo ""
    
    read -p "Appuyez sur Entrée quand vous avez révoqué l'ancienne clé..."
    
    echo ""
    read -sp "Entrez la NOUVELLE clé Resend (saisie masquée): " NEW_RESEND_KEY
    echo ""
    
    if [ -z "$NEW_RESEND_KEY" ]; then
        log_error "Clé Resend vide. Abandon."
        return 1
    fi
    
    # Validate key format
    if [[ ! $NEW_RESEND_KEY =~ ^re_ ]]; then
        log_error "Format de clé invalide. Les clés Resend commencent par 're_'"
        return 1
    fi
    
    log "✅ Clé Resend reçue"
    
    # Test the key
    log "🧪 Test de la nouvelle clé..."
    local test_response=$(curl -s -X GET "https://api.resend.com/domains" \
        -H "Authorization: Bearer ${NEW_RESEND_KEY}")
    
    if echo "$test_response" | jq -e '.message' >/dev/null 2>&1; then
        log_error "Clé invalide: $(echo "$test_response" | jq -r '.message')"
        return 1
    fi
    
    log "✅ Clé Resend validée"
    
    # Update Supabase
    log "📤 Mise à jour de Supabase Secrets..."
    if supabase secrets set RESEND_API_KEY="$NEW_RESEND_KEY" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Resend API key mise à jour dans Supabase"
    else
        log_error "Échec de la mise à jour Supabase pour Resend"
        return 1
    fi
    
    # Log the rotation
    echo "$(date +%Y-%m-%d) | Resend | Clé révoquée et nouvelle créée | $(whoami)" >> "${SCRIPT_DIR}/rotation-history.log"
    
    echo ""
    log "🎉 Rotation Resend terminée avec succès!"
    
    echo ""
    echo -e "${YELLOW}📋 VÉRIFICATIONS POST-ROTATION :${NC}"
    echo ""
    echo "1. Vérifiez les logs Resend:"
    echo -e "   ${BLUE}https://resend.com/logs${NC}"
    echo ""
    echo "2. Vérifiez la réputation du domaine:"
    echo -e "   ${BLUE}https://resend.com/domains${NC}"
    echo ""
    echo "3. Testez l'envoi d'un email:"
    echo '   curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/send-email" \'
    echo '     -H "Authorization: Bearer YOUR_TOKEN" \'
    echo '     -H "Content-Type: application/json" \'
    echo '     -d '"'"'{"to": "test@example.com", "template": "welcome", "data": {"name": "Test"}}'"'"
    echo ""
    
    return 0
}

################################################################################
# BREVO ROTATION (MANUAL)
################################################################################

rotate_brevo() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                  3. BREVO API KEY                          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_warning "Brevo ne fournit pas d'API pour gérer les clés"
    echo ""
    echo -e "${YELLOW}📋 ÉTAPES À SUIVRE :${NC}"
    echo ""
    echo "1. Ouvrez votre navigateur et allez sur:"
    echo -e "   ${BLUE}https://app.brevo.com/settings/keys/api${NC}"
    echo ""
    echo "2. Trouvez la clé exposée:"
    echo -e "   ${RED}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${NC}"
    echo ""
    echo "3. Cliquez sur 'Delete' pour la supprimer"
    echo ""
    echo "4. Cliquez sur 'Generate a new API key'"
    echo "   - Name: Mon Toit Production - $(date +%Y-%m-%d)"
    echo ""
    echo "5. Copiez la nouvelle clé"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Vérifiez aussi :${NC}"
    echo -e "${RED}   - Les logs SMS pour détecter toute activité suspecte${NC}"
    echo -e "${RED}   - Le solde du compte (frais non autorisés)${NC}"
    echo ""
    
    read -p "Appuyez sur Entrée quand vous avez révoqué l'ancienne clé..."
    
    echo ""
    read -sp "Entrez la NOUVELLE clé Brevo (saisie masquée): " NEW_BREVO_KEY
    echo ""
    
    if [ -z "$NEW_BREVO_KEY" ]; then
        log_error "Clé Brevo vide. Abandon."
        return 1
    fi
    
    # Validate key format
    if [[ ! $NEW_BREVO_KEY =~ ^xkeysib- ]]; then
        log_error "Format de clé invalide. Les clés Brevo commencent par 'xkeysib-'"
        return 1
    fi
    
    log "✅ Clé Brevo reçue"
    
    # Test the key
    log "🧪 Test de la nouvelle clé..."
    local test_response=$(curl -s -X GET "https://api.brevo.com/v3/account" \
        -H "api-key: ${NEW_BREVO_KEY}")
    
    if echo "$test_response" | jq -e '.code' >/dev/null 2>&1; then
        log_error "Clé invalide: $(echo "$test_response" | jq -r '.message')"
        return 1
    fi
    
    log "✅ Clé Brevo validée"
    
    # Update Supabase
    log "📤 Mise à jour de Supabase Secrets..."
    if supabase secrets set BREVO_API_KEY="$NEW_BREVO_KEY" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Brevo API key mise à jour dans Supabase"
    else
        log_error "Échec de la mise à jour Supabase pour Brevo"
        return 1
    fi
    
    # Log the rotation
    echo "$(date +%Y-%m-%d) | Brevo | Clé révoquée et nouvelle créée | $(whoami)" >> "${SCRIPT_DIR}/rotation-history.log"
    
    echo ""
    log "🎉 Rotation Brevo terminée avec succès!"
    
    echo ""
    echo -e "${YELLOW}📋 VÉRIFICATIONS POST-ROTATION :${NC}"
    echo ""
    echo "1. Vérifiez les logs SMS:"
    echo -e "   ${BLUE}https://app.brevo.com/sms/history${NC}"
    echo ""
    echo "2. Vérifiez le solde:"
    echo -e "   ${BLUE}https://app.brevo.com/account/plan${NC}"
    echo ""
    echo "3. Testez l'envoi d'un SMS:"
    echo '   curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/send-sms" \'
    echo '     -H "Authorization: Bearer YOUR_TOKEN" \'
    echo '     -H "Content-Type: application/json" \'
    echo '     -d '"'"'{"phoneNumber": "0707070707", "message": "Test SMS"}'"'"
    echo ""
    
    return 0
}

################################################################################
# REDEPLOY EDGE FUNCTIONS
################################################################################

redeploy_functions() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║            4. REDÉPLOIEMENT DES EDGE FUNCTIONS             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log "🚀 Redéploiement des Edge Functions avec les nouvelles clés..."
    
    if supabase functions deploy --all 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Edge Functions redéployées avec succès"
    else
        log_error "Échec du redéploiement des Edge Functions"
        return 1
    fi
    
    return 0
}

################################################################################
# SUMMARY
################################################################################

print_summary() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎉 RÉSUMÉ FINAL 🎉                      ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  ✅ Mapbox : Token révoqué et nouveau créé                 ║${NC}"
    echo -e "${GREEN}║  ✅ Resend : Clé révoquée et nouvelle créée                ║${NC}"
    echo -e "${GREEN}║  ✅ Brevo : Clé révoquée et nouvelle créée                 ║${NC}"
    echo -e "${GREEN}║  ✅ Supabase Secrets : Tous mis à jour                     ║${NC}"
    echo -e "${GREEN}║  ✅ Edge Functions : Redéployées                           ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  📋 Prochaines étapes :                                    ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  1. Tester tous les services                               ║${NC}"
    echo -e "${GREEN}║  2. Surveiller les logs pendant 7 jours                    ║${NC}"
    echo -e "${GREEN}║  3. Vérifier les coûts quotidiens                          ║${NC}"
    echo -e "${GREEN}║  4. Documenter la rotation                                 ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  📄 Log complet : ${LOG_FILE##*/}                          ║${NC}"
    echo -e "${GREEN}║  📜 Historique : rotation-history.log                      ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

################################################################################
# MAIN
################################################################################

main() {
    print_banner
    
    log "📝 Log file: $LOG_FILE"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    echo ""
    echo -e "${YELLOW}⚠️  AVERTISSEMENT :${NC}"
    echo "Ce script va vous guider dans la rotation des clés API exposées."
    echo "Assurez-vous d'avoir accès aux dashboards Mapbox, Resend et Brevo."
    echo ""
    read -p "Voulez-vous continuer? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Rotation annulée par l'utilisateur"
        exit 0
    fi
    
    # Rotation process
    local success=true
    
    # 1. Mapbox
    if ! rotate_mapbox; then
        log_error "Échec de la rotation Mapbox"
        success=false
    fi
    
    # 2. Resend
    if ! rotate_resend; then
        log_error "Échec de la rotation Resend"
        success=false
    fi
    
    # 3. Brevo
    if ! rotate_brevo; then
        log_error "Échec de la rotation Brevo"
        success=false
    fi
    
    # 4. Redeploy
    if $success; then
        if ! redeploy_functions; then
            log_error "Échec du redéploiement"
            success=false
        fi
    fi
    
    # Summary
    if $success; then
        print_summary
        log "✅ Rotation complète terminée avec succès!"
        exit 0
    else
        log_error "La rotation a rencontré des erreurs. Consultez le log: $LOG_FILE"
        exit 1
    fi
}

# Run main
main "$@"

