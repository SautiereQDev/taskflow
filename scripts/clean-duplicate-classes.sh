#!/bin/bash

# Script pour nettoyer les classes CSS en double dans les fichiers EJS
# Créé pour résoudre les problèmes de classes dupliquées après la migration glassmorphism

echo "🧹 Nettoyage des classes CSS en double dans les fichiers EJS..."

# Trouver tous les fichiers EJS
find views -name "*.ejs" -type f | while read -r file; do
  echo "📄 Traitement: $file"

  # Créer un fichier temporaire
  temp_file=$(mktemp)

  # Supprimer les classes en double (border, shadow, bg-)
  sed -E 's/border border-[^ "]+ ([^"]*) border border-[^ "]+/border border-\1/g' "$file" | \
  sed -E 's/shadow-[^ "]+ ([^"]*) shadow-[^ "]+/shadow-\1/g' | \
  sed -E 's/bg-[^ "]+ ([^"]*) bg-[^ "]+/bg-\1/g' | \
  sed -E 's/  +/ /g' > "$temp_file"

  # Remplacer le fichier original
  mv "$temp_file" "$file"
done

echo "✅ Nettoyage terminé !"
