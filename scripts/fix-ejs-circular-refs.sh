#!/bin/bash

# Fix EJS circular reference issues in all UI components
# Changes pattern: const variable = typeof variable !== 'undefined' ? ...
# To: const _variable = typeof locals.variable !== 'undefined' ? locals.variable : ...

echo "Fixing EJS circular references in UI components..."

# Function to fix a single file
fix_file() {
  local file=$1
  echo "Processing: $file"

  # Create backup
  cp "$file" "$file.bak"

  # Get the component name (button, checkbox, etc.)
  local component=$(basename "$file" .ejs)

  # Fix the circular reference patterns using sed
  # This is complex because we need to:
  # 1. Change variable names on the left side of assignment to _variable
  # 2. Change typeof variable to typeof locals.variable
  # 3. Update all references to use _variable

  # For now, we'll process each file manually since they have different variable sets
}

# List of files with the issue
files=(
  "views/partials/ui/button.ejs"
  "views/partials/ui/forms/checkbox.ejs"
  "views/partials/ui/alert.ejs"
  "views/partials/ui/card.ejs"
  "views/partials/ui/modal.ejs"
  "views/partials/ui/badge.ejs"
  "views/partials/ui/skeleton.ejs"
  "views/partials/ui/breadcrumbs.ejs"
  "views/partials/ui/divider.ejs"
  "views/partials/ui/loading-spinner.ejs"
)

echo "Found ${#files[@]} files with circular reference issues"
echo ""
echo "Files to fix:"
for file in "${files[@]}"; do
  echo "  - $file"
done
