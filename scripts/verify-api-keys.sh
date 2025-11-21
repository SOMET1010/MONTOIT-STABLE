#!/bin/bash

################################################################################
# SCRIPT DE VÉRIFICATION DES CLÉS API - MON TOIT
################################################################################
# Description : Vérifie que toutes les clés API fonctionnent correctement
# Date : 21 novembre 2025
# Auteur : Manus AI
# Version : 1.0
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

################################################################################
# BANNER
################################################################################

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║         🔍 VÉRIFICATION DES CLÉS API - MON TOIT 🔍         ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

################################################################################
# GET SECRETS FROM SUPABASE
################################################################################

echo -e "${BLUE}📥 Récupération des secrets depuis Supabase...${NC}"
echo ""

# Get secrets
MAPBOX_TOKEN=$(supabase secrets list | grep VITE_MAPBOX_PUBLIC_TOKEN | awk '{print $2}')
RESEND_KEY=$(supabase secrets list | grep RESEND_API_KEY | awk '{print $2}')
BREVO_KEY=$(supabase secrets list | grep BREVO_API_KEY | awk '{print $2}')

if [ -z "$MAPBOX_TOKEN" ] || [ -z "$RESEND_KEY" ] || [ -z "$BREVO_KEY" ]; then
    echo -e "${RED}❌ Impossible de récupérer les secrets depuis Supabase${NC}"
    echo "Assurez-vous d'être connecté: supabase login"
    exit 1
fi

echo -e "${GREEN}✅ Secrets récupérés${NC}"
echo ""

################################################################################
# VERIFY MAPBOX
################################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    1. MAPBOX TOKEN                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "🧪 Test du token Mapbox..."

MAPBOX_RESPONSE=$(curl -s "https://api.mapbox.com/tokens/v2?access_token=${MAPBOX_TOKEN}")

if echo "$MAPBOX_RESPONSE" | jq -e '.code' >/dev/null 2>&1; then
    echo -e "${RED}❌ Token Mapbox invalide${NC}"
    echo "Erreur: $(echo "$MAPBOX_RESPONSE" | jq -r '.message')"
    MAPBOX_STATUS="❌ INVALIDE"
else
    echo -e "${GREEN}✅ Token Mapbox valide${NC}"
    
    # Get token info
    TOKEN_NOTE=$(echo "$MAPBOX_RESPONSE" | jq -r '.note // "N/A"')
    TOKEN_CREATED=$(echo "$MAPBOX_RESPONSE" | jq -r '.created // "N/A"')
    
    echo "   Note: $TOKEN_NOTE"
    echo "   Créé: $TOKEN_CREATED"
    MAPBOX_STATUS="✅ VALIDE"
fi

echo ""

################################################################################
# VERIFY RESEND
################################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    2. RESEND API KEY                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "🧪 Test de la clé Resend..."

RESEND_RESPONSE=$(curl -s -X GET "https://api.resend.com/domains" \
    -H "Authorization: Bearer ${RESEND_KEY}")

if echo "$RESEND_RESPONSE" | jq -e '.message' >/dev/null 2>&1; then
    echo -e "${RED}❌ Clé Resend invalide${NC}"
    echo "Erreur: $(echo "$RESEND_RESPONSE" | jq -r '.message')"
    RESEND_STATUS="❌ INVALIDE"
else
    echo -e "${GREEN}✅ Clé Resend valide${NC}"
    
    # Get domain info
    DOMAIN_COUNT=$(echo "$RESEND_RESPONSE" | jq -r '.data | length')
    echo "   Domaines configurés: $DOMAIN_COUNT"
    
    if [ "$DOMAIN_COUNT" -gt 0 ]; then
        DOMAIN_NAME=$(echo "$RESEND_RESPONSE" | jq -r '.data[0].name')
        DOMAIN_STATUS=$(echo "$RESEND_RESPONSE" | jq -r '.data[0].status')
        echo "   Domaine principal: $DOMAIN_NAME ($DOMAIN_STATUS)"
    fi
    
    RESEND_STATUS="✅ VALIDE"
fi

echo ""

################################################################################
# VERIFY BREVO
################################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    3. BREVO API KEY                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "🧪 Test de la clé Brevo..."

BREVO_RESPONSE=$(curl -s -X GET "https://api.brevo.com/v3/account" \
    -H "api-key: ${BREVO_KEY}")

if echo "$BREVO_RESPONSE" | jq -e '.code' >/dev/null 2>&1; then
    echo -e "${RED}❌ Clé Brevo invalide${NC}"
    echo "Erreur: $(echo "$BREVO_RESPONSE" | jq -r '.message')"
    BREVO_STATUS="❌ INVALIDE"
else
    echo -e "${GREEN}✅ Clé Brevo valide${NC}"
    
    # Get account info
    COMPANY_NAME=$(echo "$BREVO_RESPONSE" | jq -r '.companyName // "N/A"')
    EMAIL=$(echo "$BREVO_RESPONSE" | jq -r '.email // "N/A"')
    
    echo "   Compte: $COMPANY_NAME"
    echo "   Email: $EMAIL"
    
    # Get plan info
    PLAN=$(echo "$BREVO_RESPONSE" | jq -r '.plan[0].type // "N/A"')
    CREDITS=$(echo "$BREVO_RESPONSE" | jq -r '.plan[0].credits // "N/A"')
    
    echo "   Plan: $PLAN"
    echo "   Crédits SMS: $CREDITS"
    
    BREVO_STATUS="✅ VALIDE"
fi

echo ""

################################################################################
# SUMMARY
################################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      📊 RÉSUMÉ                             ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
printf "${BLUE}║${NC}  Mapbox Token      : %-38s${BLUE}║${NC}\n" "$MAPBOX_STATUS"
printf "${BLUE}║${NC}  Resend API Key    : %-38s${BLUE}║${NC}\n" "$RESEND_STATUS"
printf "${BLUE}║${NC}  Brevo API Key     : %-38s${BLUE}║${NC}\n" "$BREVO_STATUS"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if all valid
if [[ "$MAPBOX_STATUS" == *"VALIDE"* ]] && [[ "$RESEND_STATUS" == *"VALIDE"* ]] && [[ "$BREVO_STATUS" == *"VALIDE"* ]]; then
    echo -e "${GREEN}🎉 Toutes les clés API sont valides et fonctionnelles !${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Certaines clés API sont invalides. Veuillez les corriger.${NC}"
    echo ""
    exit 1
fi

