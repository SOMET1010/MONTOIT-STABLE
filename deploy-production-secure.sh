#!/bin/bash

#############################################
# Script de Déploiement Production Mon Toit
# Version sécurisée - Secrets via variables d'environnement
#############################################

set -e  # Arrêt en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration Supabase
SUPABASE_PROJECT_REF="wsuarbcmxywcwcpaklxw"
SUPABASE_URL="https://wsuarbcmxywcwcpaklxw.supabase.co"

# Charger les variables d'environnement depuis .env.production
if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
else
    echo -e "${YELLOW}⚠️  Fichier .env.production non trouvé${NC}"
    echo -e "${YELLOW}   Créez-le avec les secrets nécessaires (voir .env.production.example)${NC}"
fi

# Fonction pour afficher les messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

# Vérifier les prérequis
check_prerequisites() {
    print_header "Vérification des Prérequis"

    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installé: $NODE_VERSION"
    else
        print_error "Node.js n'est pas installé"
        exit 1
    fi

    # npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installé: $NPM_VERSION"
    else
        print_error "npm n'est pas installé"
        exit 1
    fi

    # Supabase CLI (optionnel pour Bolt)
    if command -v supabase &> /dev/null; then
        SUPABASE_VERSION=$(supabase --version)
        print_success "Supabase CLI installé: $SUPABASE_VERSION"
        HAS_SUPABASE=true
    else
        print_warning "Supabase CLI non installé (optionnel pour Bolt)"
        HAS_SUPABASE=false
    fi

    # Vérifier les variables d'environnement nécessaires
    if [ "$HAS_SUPABASE" = true ]; then
        print_info "Vérification des secrets..."
        MISSING_SECRETS=false

        if [ -z "$AZURE_OPENAI_API_KEY" ]; then
            print_error "AZURE_OPENAI_API_KEY manquant"
            MISSING_SECRETS=true
        fi

        if [ -z "$AZURE_OPENAI_ENDPOINT" ]; then
            print_error "AZURE_OPENAI_ENDPOINT manquant"
            MISSING_SECRETS=true
        fi

        if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
            print_error "VITE_SUPABASE_ANON_KEY manquant"
            MISSING_SECRETS=true
        fi

        if [ "$MISSING_SECRETS" = true ]; then
            print_error "Secrets manquants! Créez un fichier .env.production"
            print_info "Voir .env.production.example pour le template"
            exit 1
        fi

        print_success "Tous les secrets sont présents"
    fi
}

# Installation des dépendances
install_dependencies() {
    print_header "Installation des Dépendances"

    print_info "Installation des packages npm..."
    npm install

    print_success "Dépendances installées avec succès"
}

# Build de l'application
build_application() {
    print_header "Build de l'Application"

    print_info "Compilation de l'application..."
    npm run build

    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        print_success "Build réussi ! Taille: $DIST_SIZE"
    else
        print_error "Le build a échoué - répertoire dist non créé"
        exit 1
    fi
}

# Déploiement des Edge Functions (si Supabase CLI disponible)
deploy_edge_functions() {
    if [ "$HAS_SUPABASE" = false ]; then
        print_warning "Supabase CLI non disponible - Déploiement Edge Functions ignoré"
        print_info "Déployez manuellement via Supabase Dashboard ou installez Supabase CLI"
        return
    fi

    print_header "Déploiement des Edge Functions"

    # Vérifier si connecté à Supabase
    print_info "Vérification de la connexion Supabase..."
    if ! supabase projects list &> /dev/null; then
        print_warning "Non connecté à Supabase"
        print_info "Connexion à Supabase..."
        supabase login
    fi

    # Lier le projet
    print_info "Liaison au projet Supabase..."
    supabase link --project-ref $SUPABASE_PROJECT_REF || true

    # Configuration des secrets Azure OpenAI depuis les variables d'environnement
    print_info "Configuration des secrets Azure OpenAI..."
    supabase secrets set AZURE_OPENAI_API_KEY="$AZURE_OPENAI_API_KEY"
    supabase secrets set AZURE_OPENAI_ENDPOINT="${AZURE_OPENAI_ENDPOINT:-https://dtdi-ia-test.openai.azure.com/}"
    supabase secrets set AZURE_OPENAI_DEPLOYMENT_NAME="${AZURE_OPENAI_DEPLOYMENT_NAME:-gpt-4o-mini}"
    supabase secrets set AZURE_OPENAI_API_VERSION="${AZURE_OPENAI_API_VERSION:-2024-10-21}"

    print_success "Secrets configurés"

    # Déploiement des Edge Functions critiques
    print_info "Déploiement de l'Edge Function: ai-chatbot..."
    supabase functions deploy ai-chatbot

    print_info "Déploiement de l'Edge Function: send-verification-code..."
    supabase functions deploy send-verification-code

    print_info "Déploiement de l'Edge Function: verify-code..."
    supabase functions deploy verify-code

    print_info "Déploiement de l'Edge Function: send-whatsapp-otp..."
    supabase functions deploy send-whatsapp-otp

    print_success "Edge Functions déployées avec succès"
}

# Application des migrations SQL
apply_migrations() {
    if [ "$HAS_SUPABASE" = false ]; then
        print_warning "Supabase CLI non disponible - Migrations SQL ignorées"
        print_info "Appliquez manuellement via Supabase Dashboard > SQL Editor"
        return
    fi

    print_header "Application des Migrations SQL"

    # Les migrations sont déjà dans supabase/migrations/
    print_info "Vérification des migrations..."
    if [ -d "supabase/migrations" ]; then
        MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
        print_info "Nombre de migrations trouvées: $MIGRATION_COUNT"

        print_info "Application des migrations..."
        supabase db push
        print_success "Migrations appliquées"
    else
        print_warning "Répertoire supabase/migrations non trouvé"
    fi
}

# Tests post-déploiement
run_tests() {
    print_header "Tests Post-Déploiement"

    # Test du build
    print_info "Vérification du build..."
    if [ -f "dist/index.html" ]; then
        print_success "index.html présent"
    else
        print_error "index.html manquant dans dist/"
        exit 1
    fi

    # Test des chunks
    print_info "Vérification des chunks optimisés..."
    if ls dist/assets/*-vendor-*.js 1> /dev/null 2>&1; then
        print_success "Chunks vendor trouvés"
    else
        print_warning "Chunks vendor non trouvés (optimisations peut-être désactivées)"
    fi

    # Test Edge Functions (si Supabase CLI disponible et token présent)
    if [ "$HAS_SUPABASE" = true ] && [ -n "$VITE_SUPABASE_ANON_KEY" ]; then
        print_info "Test de l'Edge Function ai-chatbot..."
        RESPONSE=$(curl -s -X POST \
            "$SUPABASE_URL/functions/v1/ai-chatbot" \
            -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
            -H "Content-Type: application/json" \
            -d '{"messages":[{"role":"user","content":"Bonjour"}]}' \
            2>/dev/null || echo "ERREUR")

        if [[ "$RESPONSE" == *"content"* ]]; then
            print_success "Edge Function ai-chatbot fonctionne"
        else
            print_warning "Edge Function ai-chatbot ne répond pas (peut nécessiter configuration)"
        fi
    fi
}

# Afficher le résumé
show_summary() {
    print_header "Résumé du Déploiement"

    echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
    echo ""
    echo "📊 Informations:"
    echo "  • Projet Supabase: $SUPABASE_PROJECT_REF"
    echo "  • URL Supabase: $SUPABASE_URL"
    echo "  • Build: dist/"
    echo ""

    if [ "$HAS_SUPABASE" = true ]; then
        echo "🚀 Edge Functions déployées:"
        echo "  • ai-chatbot (Chatbot SUTA avec Azure OpenAI)"
        echo "  • send-verification-code (Envoi OTP Email/SMS/WhatsApp)"
        echo "  • verify-code (Vérification OTP)"
        echo "  • send-whatsapp-otp (OTP WhatsApp via InTouch)"
        echo ""
    fi

    echo "🧪 Prochaines étapes:"
    echo "  1. Tester l'application en local: npm run dev"
    echo "  2. Déployer sur votre plateforme (Vercel, Netlify, etc.)"
    echo "  3. Tester l'inscription et la connexion"
    echo "  4. Tester le chatbot SUTA"
    echo "  5. Vérifier que CNAM n'apparaît plus"
    echo ""

    if [ "$HAS_SUPABASE" = false ]; then
        echo "⚠️  Actions manuelles requises:"
        echo "  1. Installer Supabase CLI: npm install -g supabase"
        echo "  2. Déployer les Edge Functions manuellement"
        echo "  3. Appliquer les migrations SQL via Dashboard"
        echo ""
    fi

    echo "📚 Documentation:"
    echo "  • DEPLOIEMENT_FINAL.txt"
    echo "  • RAPPORT_FINAL_REORGANISATION.md"
    echo "  • GUIDE_DEPLOIEMENT_PRODUCTION.md"
    echo ""
}

# Menu principal
main() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   Déploiement Production Mon Toit          ║"
    echo "║   Version Sécurisée 2.0                    ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Demander confirmation
    read -p "Voulez-vous démarrer le déploiement complet ? (o/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        print_info "Déploiement annulé"
        exit 0
    fi

    # Exécution des étapes
    check_prerequisites
    install_dependencies
    build_application
    deploy_edge_functions
    apply_migrations
    run_tests
    show_summary

    print_success "🎉 Déploiement terminé avec succès !"
}

# Exécution
main "$@"
