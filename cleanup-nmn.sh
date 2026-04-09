#!/bin/bash

# NMN Network Site-Wide Cleanup & Restoration Script
# Compatible with GNU sed on Windows Git Bash, Linux
# Handles CRLF line endings, ad removal, and Empire Aesthetic Unification

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# STEP 1: Verify we're in the correct repository
# ============================================================================

echo -e "${YELLOW}[SAFETY CHECK]${NC} Verifying repository location..."

if [ ! -f "README.md" ] || [ ! -d ".git" ]; then
    echo -e "${RED}ERROR: Not in the root of Lord-Oro/nmn-network repository.${NC}"
    echo "Current directory: $(pwd)"
    echo "Expected: The root directory containing README.md and .git/"
    exit 1
fi

if ! grep -q "Core infrastructure for the Nonsense Media Network" README.md 2>/dev/null; then
    echo -e "${RED}ERROR: README.md does not match expected repo.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Correct repository detected.${NC}"
echo ""

# ============================================================================
# STEP 2: Convert CRLF to LF (Windows Git Bash compatibility)
# ============================================================================

echo -e "${YELLOW}[PREP]${NC} Normalizing line endings (CRLF → LF)..."

find . -name "*.html" -type f | while read file; do
    if command -v dos2unix &> /dev/null; then
        dos2unix "$file" 2>/dev/null || true
    else
        sed -i 's/\r$//' "$file"
    fi
done

echo -e "${GREEN}✓ Line endings normalized.${NC}"
echo ""

# ============================================================================
# STEP 3: Process sw.js (Zero-byte file)
# ============================================================================

echo -e "${YELLOW}[PHASE 1]${NC} Zeroing out sw.js..."

if [ -f "sw.js" ]; then
    > sw.js  # Truncate to 0 bytes
    echo -e "${GREEN}✓ sw.js is now 0 bytes.${NC}"
else
    echo -e "${YELLOW}⚠ sw.js not found. Skipping.${NC}"
fi

echo ""

# ============================================================================
# STEP 4: Remove Monetag/Ad Scripts & Ghost Workers
# ============================================================================

echo -e "${YELLOW}[PHASE 2]${NC} Purging Ghost Scripts (Ads & Service Workers)..."

BATCH_SIZE=25
HTML_FILES=($(find . -name "*.html" -type f | sort))
TOTAL_FILES=${#HTML_FILES[@]}
BATCH_NUM=1

for ((i = 0; i < TOTAL_FILES; i += BATCH_SIZE)); do
    END=$((i + BATCH_SIZE))
    if [ $END -gt $TOTAL_FILES ]; then END=$TOTAL_FILES; fi
    BATCH_FILES=("${HTML_FILES[@]:$i:$((END - i))}")
    
    echo "  Batch $BATCH_NUM: Processing files $((i + 1))-$END of $TOTAL_FILES..."
    
    for file in "${BATCH_FILES[@]}"; do
        # Purge Ad Networks
        sed -i "/<script[^>]*nap5k\.com/,/<\/script>/d" "$file"
        sed -i "s/<script>[^<]*nap5k\.com[^<]*<\/script>//g" "$file"
        sed -i "/<script[^>]*5gvci\.com/,/<\/script>/d" "$file"
        sed -i "s/<script>[^<]*5gvci\.com[^<]*<\/script>//g" "$file"
        sed -i "s/s\.dataset\.zone='[0-9]*'//g" "$file"
        
        # AGGRESSIVE Ghost Worker Purge (Removes the whole script block)
        sed -i "/if('serviceWorker' in navigator)/,/<\/script>/d" "$file"
        sed -i "/if ('serviceWorker' in navigator)/,/<\/script>/d" "$file"
        sed -i "/if(\"serviceWorker\" in navigator)/,/<\/script>/d" "$file"
    done
    ((BATCH_NUM++))
done

echo -e "${GREEN}✓ Ghost scripts purged.${NC}"
echo ""

# ============================================================================
# STEP 5: Empire Restoration (Favicons & Legacy Cursors)
# ============================================================================

echo -e "${YELLOW}[PHASE 3]${NC} Restoring Empire Aesthetics (Favicons & Cursors)..."

BATCH_NUM=1

for ((i = 0; i < TOTAL_FILES; i += BATCH_SIZE)); do
    END=$((i + BATCH_SIZE))
    if [ $END -gt $TOTAL_FILES ]; then END=$TOTAL_FILES; fi
    BATCH_FILES=("${HTML_FILES[@]:$i:$((END - i))}")
    
    echo "  Batch $BATCH_NUM: Processing files $((i + 1))-$END of $TOTAL_FILES..."
    
    for file in "${BATCH_FILES[@]}"; do
        # Fix Favicon Pathing
        sed -i 's/href="favicon\.png"/href="lord_oro_emblem.jpg"/g' "$file"
        sed -i 's/href="logo\.jpg"/href="lord_oro_emblem.jpg"/g' "$file"
        
        # Purge hard-coded SVG Pickaxe cursor (let nmn-nav.js handle it)
        sed -i '/cursor:url("data:image\/svg+xml/d' "$file"
        sed -i '/cursor: url("data:image\/svg+xml/d' "$file"
    done
    ((BATCH_NUM++))
done

echo -e "${GREEN}✓ Aesthetics unified.${NC}"
echo ""

# ============================================================================
# STEP 6: Remove Hard-Coded Nav & Inject nmn-nav.js
# ============================================================================

echo -e "${YELLOW}[PHASE 4]${NC} Standardizing Navigation Controllers..."

BATCH_NUM=1

for ((i = 0; i < TOTAL_FILES; i += BATCH_SIZE)); do
    END=$((i + BATCH_SIZE))
    if [ $END -gt $TOTAL_FILES ]; then END=$TOTAL_FILES; fi
    BATCH_FILES=("${HTML_FILES[@]:$i:$((END - i))}")
    
    echo "  Batch $BATCH_NUM: Processing files $((i + 1))-$END of $TOTAL_FILES..."
    
    for file in "${BATCH_FILES[@]}"; do
        # Remove old hard-coded blocks
        sed -i "/<nav[^>]*>/,/<\/nav>/d" "$file"
        sed -i "/<footer[^>]*>/,/<\/footer>/d" "$file"
        
        # Inject nmn-nav.js if missing
        if ! grep -q 'src="nmn-nav\.js"' "$file" && ! grep -q 'src="../nmn-nav\.js"' "$file"; then
            # Inject right after body tag
            sed -i '/<body[^>]*>/a\
<script src="nmn-nav.js"></script>' "$file"
        fi
    done
    ((BATCH_NUM++))
done

echo -e "${GREEN}✓ Controllers synchronized.${NC}"
echo ""

# ============================================================================
# STEP 7: Image Filename Standardizations
# ============================================================================

echo -e "${YELLOW}[PHASE 5]${NC} Standardizing Image Paths..."

IMAGE_MAPPINGS=(
    "s|Outbreak_from_the_stars_cover_art_final_1\.jpeg|outbreak_en.jpeg|g"
    "s|Lord_Oros_Emblem\.jpg|lord_oro_emblem.jpg|g"
    "s|Juni_Cover_art_Final\.jpeg|juni_en.jpeg|g"
    "s|spanish_all_tabbies_have_a_place_to_go\.png|tabbies_es.jpg|g"
    "s|Jap_cover_-_Alltabbies_havea__place_to_go\.jpeg|tabbies_ja.jpg|g"
    "s|Korean_cover-All_tabbies_have_a_place_to_go__2_\.jpeg|tabbies_ko.jpeg|g"
    "s|port_cover-all_tabbies_have_a_place_to_go\.jpeg|tabbies_pt.jpeg|g"
)

BATCH_NUM=1

for ((i = 0; i < TOTAL_FILES; i += BATCH_SIZE)); do
    END=$((i + BATCH_SIZE))
    if [ $END -gt $TOTAL_FILES ]; then END=$TOTAL_FILES; fi
    BATCH_FILES=("${HTML_FILES[@]:$i:$((END - i))}")
    
    for file in "${BATCH_FILES[@]}"; do
        for mapping in "${IMAGE_MAPPINGS[@]}"; do
            sed -i "$mapping" "$file"
        done
    done
    ((BATCH_NUM++))
done

echo -e "${GREEN}✓ Image paths standardized.${NC}"
echo ""

# ============================================================================
# VERIFICATION & STATUS
# ============================================================================

echo -e "${YELLOW}[COMPLETE]${NC} The Empire is secure."
echo ""
git status
echo ""
echo "Run: ${GREEN}git commit -a -m 'Architect Update: Global aesthetic & script purge'${NC}"
echo "Run: ${GREEN}git push${NC}"
