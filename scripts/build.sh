#!/bin/bash
#
# Builds the extension for Chrome Web Store submission.
# Creates: store/zagyva.zip, store/screenshot-*.png, store/LISTING.md
#
# Usage: npm run build

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STORE_DIR="$ROOT_DIR/store"

mkdir -p "$STORE_DIR"

echo "=== Building Zagyva extension ==="
echo ""

# 1. Run unit tests
echo "--- Running unit tests ---"
node "$ROOT_DIR/test/matcher.test.js"
echo ""

# 2. Create zip
echo "--- Creating extension zip ---"
cd "$ROOT_DIR"
rm -f "$STORE_DIR/zagyva.zip"
zip -r "$STORE_DIR/zagyva.zip" \
  manifest.json \
  LICENSE \
  icons/ \
  src/ \
  popup/ \
  -x "*.DS_Store" \
  -x "__MACOSX/*"

ZIP_SIZE=$(du -h "$STORE_DIR/zagyva.zip" | cut -f1)
echo "  Created: store/zagyva.zip ($ZIP_SIZE)"
echo ""

# 3. Generate screenshots
echo "--- Generating screenshots ---"
node "$ROOT_DIR/scripts/screenshots.js"
echo ""

# 4. Summary
echo "=== Build complete ==="
echo ""
echo "Files ready in store/:"
ls -la "$STORE_DIR/"
echo ""
echo "Next steps:"
echo "  1. Go to https://chrome.google.com/webstore/devconsole"
echo "  2. Click 'New Item' and upload store/zagyva.zip"
echo "  3. Fill in listing info from store/LISTING.md"
echo "  4. Upload screenshots from store/screenshot-*.png"
echo "  5. Submit for review"
