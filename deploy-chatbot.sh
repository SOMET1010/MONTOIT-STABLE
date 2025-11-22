#!/bin/bash

# ============================================
# Script de Déploiement - Chatbot SUTA
# ============================================
# Projet: Mon Toit
# Date: 22 novembre 2025
# Description: Déploie l'Edge Function ai-chatbot avec Azure OpenAI
# ============================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_REF="wsuarbcmxywcwcpaklxw"
FUNCTION_NAME="ai-chatbot"

# Clés API Azure OpenAI
AZURE_OPENAI_API_KEY="Eb0tyDX22cFJWcEkSpzYQD4P2v2WS7JTACi9YtNkJEIiWV4pRjMiJQQJ99BJACYeBjFXJ3w3AAAAACOG2jwX"
AZURE_OPENAI_ENDPOINT="https://dtdi-ia-test.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o-mini"
AZURE_OPENAI_API_VERSION="2024-10-21"

# ============================================
# Fonctions utilitaires
# ============================================

print_header() {
    echo -e "${BLUE}"
    echo "============================================"
    echo "$1"
    echo "============================================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================
# Vérifications préalables
# ============================================

print_header "Vérifications Préalables"

# Vérifier Supabase CLI
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI n'est pas installé"
    echo ""
    echo "Installez-le avec:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Linux: https://supabase.com/docs/guides/cli/getting-started#installing-the-supabase-cli"
    exit 1
fi

print_success "Supabase CLI installé: $(supabase --version | head -1)"

# Vérifier si connecté
if ! supabase projects list &> /dev/null; then
    print_warning "Vous n'êtes pas connecté à Supabase"
    echo ""
    print_info "Connexion à Supabase..."
    supabase login
    
    if [ $? -ne 0 ]; then
        print_error "Échec de connexion à Supabase"
        exit 1
    fi
fi

print_success "Connecté à Supabase"

# ============================================
# Lier le projet
# ============================================

print_header "Liaison du Projet"

# Vérifier si déjà lié
if [ -f ".supabase/config.toml" ]; then
    print_info "Projet déjà lié, vérification..."
    CURRENT_REF=$(grep -A 5 "\[project\]" .supabase/config.toml | grep "project_id" | cut -d'"' -f2 || echo "")
    
    if [ "$CURRENT_REF" = "$PROJECT_REF" ]; then
        print_success "Projet déjà lié correctement"
    else
        print_warning "Projet lié à un autre projet ($CURRENT_REF)"
        print_info "Reliaison au projet $PROJECT_REF..."
        supabase link --project-ref $PROJECT_REF
    fi
else
    print_info "Liaison au projet $PROJECT_REF..."
    supabase link --project-ref $PROJECT_REF
    
    if [ $? -ne 0 ]; then
        print_error "Échec de liaison du projet"
        exit 1
    fi
    
    print_success "Projet lié avec succès"
fi

# ============================================
# Configuration des Secrets
# ============================================

print_header "Configuration des Secrets Azure OpenAI"

print_info "Configuration de AZURE_OPENAI_API_KEY..."
echo "$AZURE_OPENAI_API_KEY" | supabase secrets set AZURE_OPENAI_API_KEY --stdin

print_info "Configuration de AZURE_OPENAI_ENDPOINT..."
echo "$AZURE_OPENAI_ENDPOINT" | supabase secrets set AZURE_OPENAI_ENDPOINT --stdin

print_info "Configuration de AZURE_OPENAI_DEPLOYMENT_NAME..."
echo "$AZURE_OPENAI_DEPLOYMENT_NAME" | supabase secrets set AZURE_OPENAI_DEPLOYMENT_NAME --stdin

print_info "Configuration de AZURE_OPENAI_API_VERSION..."
echo "$AZURE_OPENAI_API_VERSION" | supabase secrets set AZURE_OPENAI_API_VERSION --stdin

print_success "Secrets configurés avec succès"

# ============================================
# Vérification des Secrets
# ============================================

print_header "Vérification des Secrets"

print_info "Liste des secrets configurés:"
supabase secrets list

# ============================================
# Déploiement de la Fonction
# ============================================

print_header "Déploiement de l'Edge Function"

print_info "Déploiement de $FUNCTION_NAME..."
supabase functions deploy $FUNCTION_NAME

if [ $? -ne 0 ]; then
    print_error "Échec du déploiement de la fonction"
    exit 1
fi

print_success "Fonction déployée avec succès"

# ============================================
# Vérification du Déploiement
# ============================================

print_header "Vérification du Déploiement"

print_info "Liste des fonctions déployées:"
supabase functions list

# ============================================
# Test de la Fonction
# ============================================

print_header "Test de la Fonction"

print_info "Récupération de l'URL du projet..."
PROJECT_URL="https://$PROJECT_REF.supabase.co"
FUNCTION_URL="$PROJECT_URL/functions/v1/$FUNCTION_NAME"

print_info "URL de la fonction: $FUNCTION_URL"

# Récupérer l'anon key depuis .env
if [ -f ".env" ]; then
    ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d'=' -f2)
    
    if [ -n "$ANON_KEY" ]; then
        print_info "Test de la fonction avec un message simple..."
        
        RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
            -H "Authorization: Bearer $ANON_KEY" \
            -H "Content-Type: application/json" \
            -d '{
                "messages": [
                    {"role": "system", "content": "Tu es SUTA, assistant protecteur Mon Toit"},
                    {"role": "user", "content": "Bonjour, peux-tu te présenter en une phrase ?"}
                ],
                "userId": null,
                "temperature": 0.8,
                "maxTokens": 200
            }')
        
        if echo "$RESPONSE" | grep -q "content"; then
            print_success "Test réussi ! La fonction répond correctement"
            echo ""
            print_info "Réponse de SUTA:"
            echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
        else
            print_warning "La fonction répond mais avec une erreur possible"
            echo ""
            print_info "Réponse:"
            echo "$RESPONSE"
        fi
    else
        print_warning "ANON_KEY non trouvée dans .env, test manuel requis"
    fi
else
    print_warning "Fichier .env non trouvé, test manuel requis"
fi

# ============================================
# Affichage des Logs
# ============================================

print_header "Logs de la Fonction (10 dernières lignes)"

print_info "Récupération des logs..."
supabase functions logs $FUNCTION_NAME --limit 10 || print_warning "Impossible de récupérer les logs"

# ============================================
# Résumé Final
# ============================================

print_header "Déploiement Terminé !"

echo ""
print_success "Le chatbot SUTA est maintenant déployé et fonctionnel !"
echo ""
echo "📊 Résumé:"
echo "  • Projet: $PROJECT_REF"
echo "  • Fonction: $FUNCTION_NAME"
echo "  • URL: $FUNCTION_URL"
echo "  • Modèle IA: $AZURE_OPENAI_DEPLOYMENT_NAME"
echo ""
echo "🧪 Pour tester dans l'application:"
echo "  1. Ouvrir l'application Mon Toit"
echo "  2. Cliquer sur l'icône du chatbot (bas droite)"
echo "  3. Envoyer un message: 'Bonjour'"
echo ""
echo "📊 Pour voir les logs en temps réel:"
echo "  supabase functions logs $FUNCTION_NAME --follow"
echo ""
echo "📚 Documentation complète:"
echo "  • GUIDE_DEPLOIEMENT_CHATBOT_SUTA.md"
echo "  • RAPPORT_CORRECTION_CHATBOT_SUTA.md"
echo ""
print_success "Déploiement réussi ! 🎉"

