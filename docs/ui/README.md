# TaskFlow Design System

> **Glassmorphism Design System** - October 2025  
> Tailwind CSS 3.4 + DaisyUI 5.3.7 + Custom Glass Utilities

## 📋 Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](./tokens.md)
3. [Components](./components.md)
4. [Utilities](./utilities.md)
5. [Patterns](./patterns.md)
6. [Accessibility](./accessibility.md)
7. [EJS Snippets](./snippets.md)

## Design Philosophy

### Glassmorphism Principles

TaskFlow uses a **glassmorphism** design language that emphasizes:

- **Transparency**: Subtle alpha backgrounds that reveal underlying content
- **Blur Effects**: Backdrop filters creating depth and hierarchy
- **Layering**: Clear visual hierarchy through opacity and shadow variations
- **Elegance**: Minimalist aesthetic with refined visual details

### Core Values

1. **Accessibility First**: WCAG 2.2 AA compliance, keyboard navigation, screen reader support
2. **Progressive Enhancement**: SSR-first with HTMX for dynamic interactions
3. **Performance**: CSS-only effects, GPU-accelerated animations, <2s load times
4. **Responsiveness**: Mobile-first approach with fluid layouts
5. **Themability**: Light/dark mode with seamless transitions

## Technology Stack

### Core Technologies

- **Tailwind CSS 3.4**: Utility-first CSS framework
- **DaisyUI 5.3.7**: Component library with custom themes
- **PostCSS**: CSS processing and transformations
- **EJS**: Server-side templating for SSR

### Enhancement Layer

- **HTMX 1.9+**: Partial page updates without JavaScript
- **Alpine.js 3.x**: Minimal client-side reactivity
- **Alpine Plugins**: Persist (localStorage), Intersect (lazy loading), Focus (trap)

## Quick Start

### Using Glass Surfaces

```html
<!-- Subtle background (sidebar, filters) -->
<div class="glass-light p-6">
  <h2>Filters</h2>
</div>

<!-- Standard card -->
<div class="glass p-6">
  <h3>Task Title</h3>
  <p>Task description...</p>
</div>

<!-- Elevated modal -->
<div class="glass-heavy p-8">
  <h2>Modal Content</h2>
</div>

<!-- Interactive card -->
<div class="glass-hover p-6">
  <p>Hover to see effect</p>
</div>
```

### Using DaisyUI Components

```html
<!-- Button with primary theme color -->
<button class="btn btn-primary">Create Task</button>

<!-- Badge with status color -->
<span class="badge badge-success">Done</span>

<!-- Card with glass effect -->
<div class="card glass">
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content</p>
  </div>
</div>
```

### Using EJS Partials

```ejs
<!-- Badge component -->
<%- include('../partials/ui/badge', {
  type: 'TODO',
  text: 'À faire'
}) %>

<!-- Avatar component -->
<%- include('../partials/ui/avatar', {
  user: { name: 'John Doe', email: 'john@example.com' }
}) %>

<!-- Skeleton loader -->
<%- include('../partials/ui/skeleton', {
  type: 'card'
}) %>
```

## Theme Switching

TaskFlow supports light/dark themes via the `data-theme` attribute:

```javascript
// Toggle theme
const theme = document.documentElement.getAttribute('data-theme');
const newTheme = theme === 'taskflowLight' ? 'taskflowDark' : 'taskflowLight';
document.documentElement.setAttribute('data-theme', newTheme);
localStorage.setItem('theme', newTheme);
```

Themes are automatically applied on page load via `public/js/theme-switcher.js`.

## File Structure

```
public/css/
├── tailwind.css        # Main stylesheet with custom utilities
└── animations.css      # Animation definitions

tailwind.config.ts      # Tailwind + DaisyUI configuration

views/partials/ui/      # Reusable EJS components
├── badge.ejs           # Status/priority badges
├── avatar.ejs          # User avatars
├── skeleton.ejs        # Loading placeholders
├── surface.ejs         # Glass surface wrapper
├── stat-card.ejs       # Statistics cards
└── forms/              # Form components
    ├── input.ejs       # Text inputs
    ├── select.ejs      # Select dropdowns
    └── textarea.ejs    # Text areas

docs/ui/                # Design system documentation
├── README.md           # This file
├── tokens.md           # Design tokens reference
├── components.md       # Component documentation
├── utilities.md        # Utility classes
├── patterns.md         # HTMX + Alpine patterns
├── accessibility.md    # Accessibility guidelines
└── snippets.md         # EJS code snippets
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [HTMX Documentation](https://htmx.org/docs/)
- [Alpine.js Documentation](https://alpinejs.dev/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

## Contributing

When adding new components or utilities:

1. **Follow naming conventions**: Use semantic class names
2. **Document thoroughly**: Update this documentation
3. **Test accessibility**: Keyboard navigation, screen readers, reduced motion
4. **Update both themes**: Ensure light/dark compatibility
5. **Add i18n keys**: Update `locales/fr.json` and `locales/en.json`

## Version History

- **v2.0** (October 2025): Glassmorphism design system, DaisyUI 5.3.7
- **v1.0** (September 2025): Initial design system with Tailwind CSS
