#!/bin/bash
# Script pour remplacer les includes EJS problématiques par du HTML inline

FILES=$(find views -name "*.ejs" -type f -not -path "views/partials/ui/surface.ejs")

for file in $FILES; do
  if grep -q "include.*ui/surface" "$file"; then
    echo "Fixing: $file"
    
    # Remplacer include surface variant='light' par div glass-light
    sed -i "s|<%- include('../ui/surface', { variant: 'light' }) %>|<div class=\"glass-light p-6 rounded-lg\">|g" "$file"
    sed -i "s|<%- include('../../partials/ui/surface', { variant: 'light' }) %>|<div class=\"glass-light p-6 rounded-lg\">|g" "$file"
    
    # Remplacer include surface variant='normal' par div glass
    sed -i "s|<%- include('../ui/surface', { variant: 'normal' }) %>|<div class=\"glass p-6 rounded-lg\">|g" "$file"
    sed -i "s|<%- include('../../partials/ui/surface', { variant: 'normal' }) %>|<div class=\"glass p-6 rounded-lg\">|g" "$file"
    
    # Remplacer include surface variant='heavy' par div glass-heavy
    sed -i "s|<%- include('../ui/surface', { variant: 'heavy' }) %>|<div class=\"glass-heavy p-6 rounded-lg\">|g" "$file"
    sed -i "s|<%- include('../../partials/ui/surface', { variant: 'heavy' }) %>|<div class=\"glass-heavy p-6 rounded-lg\">|g" "$file"
    
    #Patterns with more complex parameters (hover, extraClass)
    sed -i "s|<%- include('../partials/ui/surface', { variant: 'normal', hover: true, extraClass: 'text-center' }) %>|<div class=\"glass glass-hover p-6 rounded-lg text-center\">|g" "$file"
  fi
done

echo "✅ Done!"
