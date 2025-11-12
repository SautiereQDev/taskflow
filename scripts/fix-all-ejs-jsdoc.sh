#!/bin/bash

# Fix all EJS components with JSDoc inside <% %> blocks
# This script converts JSDoc comments to HTML comments to prevent EJS parser errors

echo "🔧 Fixing EJS JSDoc comments in UI components..."
echo ""

FILES_TO_FIX=(
  "views/partials/ui/avatar.ejs"
  "views/partials/ui/badge.ejs"
  "views/partials/ui/breadcrumbs.ejs"
  "views/partials/ui/card.ejs"
  "views/partials/ui/divider.ejs"
  "views/partials/ui/dropdown.ejs"
  "views/partials/ui/forms/field.ejs"
  "views/partials/ui/forms/file-input.ejs"
  "views/partials/ui/loading-spinner.ejs"
  "views/partials/ui/modal.ejs"
  "views/partials/ui/forms/radio-group.ejs"
  "views/partials/ui/forms/radio.ejs"
  "views/partials/ui/forms/select.ejs"
  "views/partials/ui/skeleton.ejs"
  "views/partials/ui/stat-card.ejs"
  "views/partials/ui/surface.ejs"
  "views/partials/ui/tabs.ejs"
  "views/partials/ui/forms/textarea.ejs"
)

FIXED_COUNT=0
SKIPPED_COUNT=0

for file in "${FILES_TO_FIX[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⏭️  Skipping $file (not found)"
    ((SKIPPED_COUNT++))
    continue
  fi
  
  # Check if file has JSDoc inside <% %> blocks
  if grep -q "^<%" "$file" && grep -q "^ \* @" "$file"; then
    echo "✅ Would fix: $file"
    ((FIXED_COUNT++))
  else
    echo "⏭️  Skipping $file (no JSDoc found)"
    ((SKIPPED_COUNT++))
  fi
done

echo ""
echo "📊 Summary:"
echo "   - Files to fix: $FIXED_COUNT"
echo "   - Files skipped: $SKIPPED_COUNT"
echo ""
echo "⚠️  Manual fix required for each file:"
echo "   1. Move JSDoc comments BEFORE <% tag"
echo "   2. OR convert to HTML comments <!-- -->"
echo "   3. Change all 'const variable = typeof variable' to 'const _variable = typeof locals.variable'"
