#!/bin/bash

# NMN Network Site-Wide Cleanup Script
# Compatible with GNU sed on Windows Git Bash, Mac, and Linux
# Handles CRLF line endings and batch processing

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

# Find all .html files and convert CRLF to LF
find . -name "*.html" -type f | while read file; do
    # Use dos2unix if available, otherwise use sed
    if command -v dos2unix &> /dev/null; then
        dos2unix "$file" 2>/dev/null || true
    else
        # GNU sed compatible: convert CRLF to LF
        sed -i 's/\r$//' "$file"
    fi
done

echo -e "${GREEN}✓ Line endings normalized.${NC}"
echo ""

# ============================================================================
# STEP 3: Process sw.js (Zero-byte file)
# ============================================================================

echo -e "${YELLOW}[STEP 1/4]${NC} Zeroing out sw.js..."

if [ -f "sw.js" ]; then
    > sw.js  # Truncate to 0 bytes
    echo -e "${GREEN}✓ sw.js is now 0 bytes.${NC}"
else
    echo -e "${YELLOW}⚠ sw.js not found. Skipping.${NC}"
fi

echo ""

# ============================================================================
# STEP 4: Remove Monetag/Ad Scripts (Batch Processing)
# ============================================================================

echo -e "${YELLOW}[STEP 2/4]${NC} Removing deprecated scripts (nap5k.com, 5gvci.com)..."

BATCH_SIZE=23
HTML_FILES=($(find . -name "*.html" -type f | sort))
TOTAL_FILES=${#HTML_FILES[@]}
BATCH_NUM=1

# Process in batches
for ((i = 0; i < TOTAL_FILES; i += BATCH_SIZE)); do
    END=$((i + BATCH_SIZE))
    if [ $END -gt $TOTAL_FILES ]; then
        END=$TOTAL_FILES
    fi
    
    BATCH_FILES=("${HTML_FILES[@]:$i:$((END - i))}")
    
    echo "  Batch $BATCH_NUM: Processing files $((i + 1))-$END of $TOTAL_FILES..."
    
    for file in "${BATCH_FILES[@]}"; do
        # Remove nap5k.com scripts (handles multiple line scenarios)
        sed -i "/<script[^>]*nap5k\.com/,/<\/script>/d" "$file"
        sed -i "s/<script>[^<]*nap5k\.com[^<]*<\/script>//g" "$file"
        
        # Remove 5gvci.com scripts
        sed -i "/<script[^>]*5gvci\.com/,/<\/script>/d" "$file"
        sed -i "s/<script>[^<]*5gvci\.com[^<]*<\/script>//g" "$file"
        
        # Remove serviceWorker.register blocks
        sed -i "/navigator\.serviceWorker\.register/,/}/d" "$file"
        sed -i "s/serviceWorker\.register([^)]*);?//g" "$file"
        
        # Remove Monetag zone references in inline scripts
        sed -i "s/s\.dataset\.zone='[0-9]*'//g" "$file"
    done
    
    ((BATCH_NUM++))
done

echo -e "${GREEN}✓ Ad scripts removed.${NC}"
echo ""

# ============================================================================
# STEP 5: Remove Hard-Coded Navigation (Batch Processing)
# ============================================================================

echo -e "${YELLOW}[STEP 3/4]${NC} Removing hard-coded nav/footer blocks..."

BATCH_NUM=1

for ((i = 0; i < TOTAL_FILES; i += BATCH_SIZE)); do
    END=$((i + BATCH_SIZE))
    if [ $END -gt $TOTAL_FILES ]; then
        END=$TOTAL_FILES
    fi
    
    BATCH_FILES=("${HTML_FILES[@]:$i:$((END - i))}")
    
    echo "  Batch $BATCH_NUM: Processing files $((i + 1))-$END of $TOTAL_FILES..."
    
    for file in "${BATCH_FILES[@]}"; do
        # Remove hard-coded <nav> blocks (multi-line safe)
        sed -i "/<nav[^>]*>/,/<\/nav>/d" "$file"
        
        # Remove hard-coded <footer> blocks
        sed -i "/<footer[^>]*>/,/<\/footer>/d" "$file"
        
        # Ensure <script src="nmn-nav.js"></script> exists at start of body
        # (This is handled in Step 6)
    done
    
    ((BATCH_NUM++))
done

echo -e "${GREEN}✓ Hard-coded nav/footer removed.${NC}"
echo ""

# ============================================================================
# STEP 6: Inject nmn-nav.js Script (Batch Processing)
# ============================================================================

echo -e "${YELLOW}[STEP 4/4]${NC} Injecting nmn-nav.js script tag..."

BATCH_NUM=1

for ((i = 0; i < TOTAL_FILES; i += BATCH_SIZE)); do
    END=$((i + BATCH_SIZE))
    if [ $END -gt $TOTAL_FILES ]; then
        END=$TOTAL_FILES
    fi
    
    BATCH_FILES=("${HTML_FILES[@]:$i:$((END - i))}")
    
    echo "  Batch $BATCH_NUM: Processing files $((i + 1))-$END of $TOTAL_FILES..."
    
    for file in "${BATCH_FILES[@]}"; do
        # Skip if already has nmn-nav.js
        if grep -q 'src="nmn-nav\.js"' "$file"; then
            continue
        fi
        
        # Insert nmn-nav.js script right after <body> tag
        # GNU sed compatible multi-line replacement
        sed -i '/<body[^>]*>/a\
<script src="nmn-nav.js"></script>' "$file"
    done
    
    ((BATCH_NUM++))
done

echo -e "${GREEN}✓ nmn-nav.js injected.${NC}"
echo ""

# ============================================================================
# STEP 7: Image Filename Replacements (Batch Processing)
# ============================================================================

echo -e "${YELLOW}[BONUS STEP]${NC} Standardizing image filenames in HTML..."

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
    if [ $END -gt $TOTAL_FILES ]; then
        END=$TOTAL_FILES
    fi
    
    BATCH_FILES=("${HTML_FILES[@]:$i:$((END - i))}")
    
    echo "  Batch $BATCH_NUM: Processing files $((i + 1))-$END of $TOTAL_FILES..."
    
    for file in "${BATCH_FILES[@]}"; do
        for mapping in "${IMAGE_MAPPINGS[@]}"; do
            sed -i "$mapping" "$file"
        done
    done
    
    ((BATCH_NUM++))
done

echo -e "${GREEN}✓ Image filenames standardized.${NC}"
echo ""

# ============================================================================
# STEP 8: Verify and Commit (4 Batches)
# ============================================================================

echo -e "${YELLOW}[COMMIT]${NC} Preparing batches for commit..."
echo ""

git add -A

# Get the number of changes
CHANGES=$(git diff --cached --stat | tail -1)
echo -e "${GREEN}✓ Changes staged:${NC}"
echo "  $CHANGES"
echo ""

echo -e "${YELLOW}Ready to commit in 4 batches.${NC}"
echo "Run the following commands:"
echo ""
echo "  git commit -m 'NMN Cleanup Batch 1: Remove deprecated ad scripts (nap5k.com, 5gvci.com)'"
echo "  git commit -m 'NMN Cleanup Batch 2: Remove hard-coded navigation and footer blocks'"
echo "  git commit -m 'NMN Cleanup Batch 3: Inject nmn-nav.js as single source of truth'"
echo "  git commit -m 'NMN Cleanup Batch 4: Standardize image filenames and finalize'"
echo ""
echo -e "${GREEN}All cleanup steps completed. Ready to push to main.${NC}"