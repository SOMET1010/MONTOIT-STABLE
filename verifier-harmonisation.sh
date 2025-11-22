#!/bin/bash

# Script de vérification de l'harmonisation terracotta
# Usage: bash verifier-harmonisation.sh

echo "🎨 VÉRIFICATION DE L'HARMONISATION TERRACOTTA"
echo "=============================================="
echo ""

# Couleurs pour le terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteur de succès
success_count=0
total_checks=6

# 1. Vérifier que design-tokens.css existe
echo "1. Vérification design-tokens.css..."
if [ -f "src/shared/styles/design-tokens.css" ]; then
    size=$(wc -c < "src/shared/styles/design-tokens.css")
    if [ "$size" -gt 5000 ]; then
        echo -e "   ${GREEN}✓${NC} design-tokens.css existe (${size} bytes)"
        ((success_count++))
    else
        echo -e "   ${RED}✗${NC} design-tokens.css trop petit (${size} bytes)"
    fi
else
    echo -e "   ${RED}✗${NC} design-tokens.css manquant"
fi
echo ""

# 2. Vérifier Button.tsx utilise terracotta
echo "2. Vérification Button.tsx..."
if grep -q "terracotta-500" "src/shared/ui/Button.tsx"; then
    echo -e "   ${GREEN}✓${NC} Button.tsx utilise terracotta"
    ((success_count++))
else
    echo -e "   ${RED}✗${NC} Button.tsx n'utilise pas terracotta"
fi
echo ""

# 3. Vérifier Card.tsx utilise terracotta
echo "3. Vérification Card.tsx..."
if grep -q "terracotta" "src/shared/ui/Card.tsx"; then
    echo -e "   ${GREEN}✓${NC} Card.tsx utilise terracotta"
    ((success_count++))
else
    echo -e "   ${RED}✗${NC} Card.tsx n'utilise pas terracotta"
fi
echo ""

# 4. Vérifier que Alert.tsx existe
echo "4. Vérification Alert.tsx (nouveau composant)..."
if [ -f "src/shared/ui/Alert.tsx" ]; then
    echo -e "   ${GREEN}✓${NC} Alert.tsx créé"
    ((success_count++))
else
    echo -e "   ${RED}✗${NC} Alert.tsx manquant"
fi
echo ""

# 5. Vérifier que les templates existent
echo "5. Vérification templates..."
template_count=0
if [ -f "src/shared/components/templates/PageTemplate.tsx" ]; then
    ((template_count++))
fi
if [ -f "src/shared/components/templates/DashboardTemplate.tsx" ]; then
    ((template_count++))
fi

if [ "$template_count" -eq 2 ]; then
    echo -e "   ${GREEN}✓${NC} 2/2 templates créés"
    ((success_count++))
else
    echo -e "   ${YELLOW}!${NC} ${template_count}/2 templates créés"
fi
echo ""

# 6. Vérifier que le build fonctionne
echo "6. Vérification build..."
echo "   (cela peut prendre 30-45 secondes...)"
if npm run build > /tmp/build.log 2>&1; then
    build_time=$(grep "built in" /tmp/build.log | grep -oP '\d+\.\d+')
    echo -e "   ${GREEN}✓${NC} Build réussi en ${build_time}s"
    ((success_count++))
else
    echo -e "   ${RED}✗${NC} Build échoué (voir /tmp/build.log)"
fi
echo ""

# Compter combien de fichiers utilisent terracotta
echo "7. Statistiques terracotta..."
terracotta_count=$(grep -r "terracotta" src/shared/ui/*.tsx src/shared/components/*.tsx 2>/dev/null | wc -l)
terracotta_files=$(grep -l "terracotta" src/shared/ui/*.tsx src/shared/components/*.tsx 2>/dev/null | wc -l)
echo "   📊 ${terracotta_count} utilisations dans ${terracotta_files} fichiers"
echo ""

# Résultat final
echo "=============================================="
echo "RÉSULTAT: ${success_count}/${total_checks} vérifications passées"
echo ""

if [ "$success_count" -eq "$total_checks" ]; then
    echo -e "${GREEN}🎉 HARMONISATION COMPLÈTE ET VALIDÉE!${NC}"
    echo ""
    echo "✅ Tous les composants sont harmonisés"
    echo "✅ Build fonctionne"
    echo "✅ Palette terracotta déployée"
    echo ""
    echo "👉 Maintenant: Faites Ctrl+Shift+R dans votre navigateur pour voir les changements!"
    exit 0
elif [ "$success_count" -ge 4 ]; then
    echo -e "${YELLOW}⚠️  HARMONISATION PARTIELLE${NC}"
    echo ""
    echo "La plupart des modifications sont en place."
    echo "Consultez les erreurs ci-dessus pour plus de détails."
    exit 1
else
    echo -e "${RED}❌ HARMONISATION INCOMPLÈTE${NC}"
    echo ""
    echo "Plusieurs vérifications ont échoué."
    echo "Relancez les modifications ou consultez la documentation."
    exit 2
fi
