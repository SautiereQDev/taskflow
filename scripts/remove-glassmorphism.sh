#!/bin/bash

# Script to remove glassmorphism classes from EJS files
# Replaces glass* classes with standard DaisyUI classes

echo "🔄 Removing glassmorphism classes from EJS files..."

# Find all EJS files
find views -name "*.ejs" -type f | while read file; do
  echo "Processing: $file"
  
  # Replace glass-heavy with bg-base-300
  sed -i 's/\bclass="\([^"]*\)glass-heavy\([^"]*\)"/class="\1bg-base-300 border border-base-content\/10 shadow-lg\2"/g' "$file"
  
  # Replace glass-light with bg-base-100  
  sed -i 's/\bclass="\([^"]*\)glass-light\([^"]*\)"/class="\1bg-base-100 border border-base-content\/10\2"/g' "$file"
  
  # Replace glass-hover with card
  sed -i 's/\bclass="\([^"]*\)glass-hover\([^"]*\)"/class="\1card bg-base-200 hover:bg-base-300 transition-colors\2"/g' "$file"
  sed -i 's/\bclass="\([^"]*\)glass \+glass-hover\([^"]*\)"/class="\1card bg-base-200 hover:bg-base-300 transition-colors\2"/g' "$file"
  
  # Replace standalone glass with bg-base-200
  sed -i 's/\bclass="\([^"]*\)glass \+/class="\1bg-base-200 border border-base-content\/10 shadow-md /g' "$file"
  sed -i 's/\bclass="\([^"]*\) glass"/class="\1 bg-base-200 border border-base-content\/10 shadow-md"/g' "$file"
  sed -i 's/\bclass="glass\([^"]*\)"/class="bg-base-200 border border-base-content\/10 shadow-md\1"/g' "$file"
  
  # Remove glassmorphism comments
  sed -i 's/<!-- .*Glassmorphism.* -->//g' "$file"
  sed -i 's/with Glassmorphism//g' "$file"
done

echo "✅ Glassmorphism classes removed successfully!"
