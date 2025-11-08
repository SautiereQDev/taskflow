# Système de Boutons Moderne - TaskFlow 2025

## Vue d'ensemble

Ce document décrit le nouveau système de boutons implémenté selon les **best practices UI/UX 2025**, avec un focus sur l'accessibilité, l'utilisabilité et la cohérence visuelle.

## Inspirations & Standards

**Sources** :
- Apple Human Interface Guidelines (44x44px minimum)
- Google Material Design (48x48dp minimum)
- WCAG 2.2 AA (contrast ratio 4.5:1+)
- UI/UX Trends 2025 (spacing, hover states, animations)

## Classes de Boutons

### Base `.btn`

Tous les boutons héritent automatiquement de :
- **Hauteur minimum** : 44px (touch target accessible)
- **Padding** : px-5 py-2.5 (desktop), plus grand sur mobile
- **Gap** : 0.5rem entre icônes et texte
- **Transitions** : 200ms smooth sur tous les états
- **Focus ring** : 2px solid avec offset pour accessibilité clavier
- **Disabled state** : opacity 50%, cursor not-allowed

```html
<button class="btn">Base Button</button>
```

### Tailles

#### Standard (défaut)
```html
<button class="btn btn-primary">Standard (44px)</button>
```
- Hauteur : 44px (2.75rem)
- Padding : px-5 py-2.5
- Texte : text-sm

#### Small `.btn-sm`
```html
<button class="btn btn-sm">Small (36px)</button>
```
- Hauteur : 36px (2.25rem)
- Padding : px-4 py-2
- Usage : Actions secondaires, tables, cards compactes

#### Large `.btn-lg`
```html
<button class="btn btn-lg">Large (52px)</button>
```
- Hauteur : 52px (3.25rem)
- Padding : px-6 py-3.5
- Usage : Hero sections, CTAs principales

### Variants

#### Primary `.btn-primary`
**Usage** : Actions principales (Save, Submit, Create)

```html
<button class="btn btn-primary">
  <svg>...</svg>
  Créer une tâche
</button>
```

**Styles** :
- Background : primary color
- Text : primary-content
- Hover : brightness-110 + scale-102 + shadow-md
- Focus : ring-2 ring-primary

#### Outline `.btn-outline`
**Usage** : Actions secondaires (Viewmore, Filters)

```html
<button class="btn btn-outline">
  Voir plus
</button>
```

**Styles** :
- Background : transparent
- Border : 2px solid current color
- Hover : bg-base-200, border/text primary, shadow-md

#### Ghost `.btn-ghost`
**Usage** : Actions tertiaires (Cancel, Back, Menu items)

```html
<button class="btn btn-ghost">
  Annuler
</button>
```

**Styles** :
- Background : transparent
- Hover : bg-base-200
- Active : bg-base-300
- **Pas de border, pas de shadow**

#### Error `.btn-error`
**Usage** : Actions destructives (Delete, Remove)

```html
<button class="btn btn-error">
  Supprimer
</button>

<!-- Ou version outline -->
<button class="btn btn-outline btn-error">
  Supprimer
</button>
```

**Styles** :
- Background : error color
- Text : error-content
- Hover : brightness-110 + scale-102 + shadow-md

### Formes Spéciales

#### Circle `.btn-circle`
**Usage** : Icon buttons, avatars, actions compactes

```html
<button class="btn btn-circle btn-ghost">
  <svg class="w-5 h-5">...</svg>
</button>
```

**Styles** :
- Forme : rounded-full
- Aspect ratio : 1:1 (carré)
- Taille : 44x44px (standard), 36x36px (small)
- **Pas de padding horizontal** : centrage automatique

## Groupes de Boutons

### `.btn-group`
**Usage** : Regrouper plusieurs actions avec espacement cohérent

```html
<div class="btn-group">
  <button class="btn btn-primary">Enregistrer</button>
  <button class="btn btn-ghost">Annuler</button>
</div>
```

**Comportement** :
- Espacement : 12px (gap-3) entre boutons
- Responsive : wrap automatique
- Flex : boutons s'adaptent à la largeur disponible

### `.btn-group.justify-end`
**Usage** : Aligner les boutons à droite (formulaires)

```html
<div class="btn-group justify-end">
  <button class="btn btn-ghost">Annuler</button>
  <button class="btn btn-primary">Enregistrer</button>
</div>
```

## Card Actions

### `.card-actions`
**Usage** : Actions dans les cards (task cards, user cards, etc.)

```html
<div class="card">
  <div class="card-body">
    <!-- Contenu -->
  </div>
  <div class="card-actions">
    <button class="btn btn-ghost btn-sm">Modifier</button>
    <button class="btn btn-primary btn-sm">Terminer</button>
  </div>
</div>
```

**Styles** :
- Layout : flex wrap
- Espacement : 8px (gap-2)
- Margin top : 16px (mt-4)
- Boutons : flex-shrink-0 (ne rétrécissent pas)

## États Spéciaux

### Loading
```html
<button class="btn btn-primary loading">
  Chargement...
</button>
```

**Comportement** :
- Texte devient transparent
- Spinner animé au centre (rotation 360°)
- Pointer events disabled

### Disabled
```html
<button class="btn btn-primary" disabled>
  Action impossible
</button>

<!-- Ou avec Alpine.js -->
<button class="btn btn-primary" :disabled="isSubmitting">
  Enregistrer
</button>
```

**Styles** :
- Opacity : 50%
- Cursor : not-allowed
- Pas d'interactions (hover/focus désactivés)

## Exemples Complets

### Formulaire Standard
```html
<form>
  <!-- Champs du formulaire -->
  
  <div class="btn-group justify-end mt-6">
    <a href="/cancel" class="btn btn-ghost">
      Annuler
    </a>
    <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
      <span class="htmx-indicator loading loading-spinner loading-xs"></span>
      Enregistrer
    </button>
  </div>
</form>
```

### Card avec Actions
```html
<div class="card bg-base-200 border border-base-content/10 shadow-md p-6">
  <h3 class="font-semibold text-lg">Titre de la tâche</h3>
  <p class="text-base-content/70">Description...</p>
  
  <div class="card-actions">
    <button class="btn btn-ghost btn-sm">
      <svg class="w-4 h-4">...</svg>
      Modifier
    </button>
    <button class="btn btn-primary btn-sm">
      Terminer
    </button>
  </div>
  
  <!-- Action destructive séparée -->
  <div class="mt-4 pt-4 border-t border-base-content/10">
    <button class="btn btn-outline btn-error btn-sm">
      <svg class="w-4 h-4">...</svg>
      Supprimer
    </button>
  </div>
</div>
```

### Header Navigation
```html
<header class="navbar bg-base-100">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl">TaskFlow</a>
  </div>
  
  <div class="flex-none gap-2">
    <button class="btn btn-circle btn-ghost">
      <svg class="w-5 h-5"><!-- Bell icon --></svg>
    </button>
    
    <div class="dropdown dropdown-end">
      <button class="btn btn-circle btn-ghost">
        <div class="avatar">
          <div class="w-10 rounded-full">
            <img src="/avatar.jpg" />
          </div>
        </div>
      </button>
    </div>
    
    <a href="/auth/register" class="btn btn-primary">
      S'inscrire
    </a>
  </div>
</header>
```

## Règles de Design

### Espacement Minimum
- **Entre boutons** : 12px minimum (gap-3)
- **Dans un groupe** : 8px minimum (gap-2)
- **Avec bordures** : 16px minimum

### Hiérarchie Visuelle
1. **Primary** : 1 seul par écran/section
2. **Outline** : 2-3 actions secondaires
3. **Ghost** : Actions tertiaires illimitées
4. **Error** : Séparé des autres actions

### Accessibilité
- ✅ Taille touch target ≥ 44px
- ✅ Contrast ratio ≥ 4.5:1
- ✅ Focus ring visible (2px)
- ✅ Labels descriptifs (pas de "Click here")
- ✅ Support clavier (Tab, Enter, Space)
- ✅ Fonctionne sans JavaScript

### Responsive
- **Mobile** : Boutons full-width dans les formulaires
- **Tablet** : Disposition en colonne (flex-col)
- **Desktop** : Disposition en ligne (flex-row)

```html
<!-- Responsive button group -->
<div class="btn-group flex-col md:flex-row">
  <button class="btn btn-primary">Action 1</button>
  <button class="btn btn-outline">Action 2</button>
</div>
```

## Migration depuis l'ancien système

### Avant (glassmorphism)
```html
<button class="btn btn-ghost bg-base-100 border border-base-content/10 hover:bg-base-200 border border-base-content/10 shadow-md transition-all duration-200">
  Ancien style
</button>
```

### Après (nouveau système)
```html
<button class="btn btn-ghost">
  Nouveau style
</button>
```

**Simplifications** :
- ❌ Plus de classes redondantes (border border)
- ❌ Plus de transitions manuelles
- ❌ Plus de hover states manuels
- ✅ Tout est géré par les classes utilitaires

## Checklist Qualité

Avant de valider un bouton :
- [ ] Taille touch target ≥ 44px
- [ ] Espacement avec autres éléments ≥ 8px
- [ ] Label descriptif (verbe d'action)
- [ ] Hiérarchie visuelle claire
- [ ] États hover/focus/active définis
- [ ] Support clavier fonctionnel
- [ ] Fonctionne sans JavaScript (progressive enhancement)
- [ ] Responsive sur mobile/tablet/desktop

## Performance

**Optimisations** :
- Animations GPU-accelerated (transform, opacity)
- Pas d'animations sur backdrop-filter (supprimé)
- Transitions : 200ms (sweet spot UX)
- Hover states : scale-102 (subtil, performant)

**Taille CSS finale** : 169.43 KB (Tailwind + DaisyUI + Custom)

---

**Dernière mise à jour** : 8 novembre 2025  
**Version** : 2.0 (Post-glassmorphism removal)
