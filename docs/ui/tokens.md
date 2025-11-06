# Design Tokens

Design tokens are the atomic values that define the visual language of TaskFlow.

## Color Palette

### Theme Colors (DaisyUI)

TaskFlow uses two custom DaisyUI themes: `taskflowLight` and `taskflowDark`.

#### Light Theme (`taskflowLight`)

```css
primary: #6366f1      /* Indigo - Primary actions */
secondary: #8b5cf6    /* Violet - Secondary actions */
accent: #ec4899       /* Pink - Highlights */
neutral: #1f2937      /* Gray 800 - Text */
base-100: #f9fafb     /* Gray 50 - Background */
base-200: #f3f4f6     /* Gray 100 - Secondary background */
base-300: #e5e7eb     /* Gray 200 - Borders */
info: #3b82f6         /* Blue - Info messages */
success: #10b981      /* Green - Success states */
warning: #f59e0b      /* Amber - Warning states */
error: #ef4444        /* Red - Error states */
```

#### Dark Theme (`taskflowDark`)

```css
primary: #818cf8      /* Indigo 400 - Primary actions */
secondary: #a78bfa    /* Violet 400 - Secondary actions */
accent: #f472b6       /* Pink 400 - Highlights */
neutral: #f3f4f6      /* Gray 100 - Text */
base-100: #0f172a     /* Slate 900 - Background */
base-200: #1e293b     /* Slate 800 - Secondary background */
base-300: #334155     /* Slate 700 - Borders */
info: #60a5fa         /* Blue 400 - Info messages */
success: #34d399      /* Green 400 - Success states */
warning: #fbbf24      /* Amber 400 - Warning states */
error: #f87171        /* Red 400 - Error states */
```

### Glass Colors

Custom glassmorphism tokens defined in `tailwind.config.ts`:

```typescript
glass: {
  white: 'rgba(255, 255, 255, 0.1)',
  'white-subtle': 'rgba(255, 255, 255, 0.05)',
  'white-strong': 'rgba(255, 255, 255, 0.25)',
  black: 'rgba(0, 0, 0, 0.1)',
  'black-subtle': 'rgba(0, 0, 0, 0.05)',
  'black-strong': 'rgba(0, 0, 0, 0.25)',
}
```

**Usage:**

```html
<div class="bg-glass-white">Subtle light overlay</div>
<div class="bg-glass-black">Subtle dark overlay</div>
```

## Typography

### Font Family

TaskFlow uses system fonts for optimal performance:

```css
font-family: 
  ui-sans-serif, 
  system-ui, 
  -apple-system, 
  BlinkMacSystemFont, 
  "Segoe UI", 
  Roboto, 
  "Helvetica Neue", 
  Arial, 
  sans-serif;
```

### Font Sizes

Standard Tailwind scale (rem units):

| Class | Size | Use Case |
|-------|------|----------|
| `text-xs` | 0.75rem (12px) | Captions, labels |
| `text-sm` | 0.875rem (14px) | Body text small |
| `text-base` | 1rem (16px) | Default body text |
| `text-lg` | 1.125rem (18px) | Emphasized text |
| `text-xl` | 1.25rem (20px) | Small headings |
| `text-2xl` | 1.5rem (24px) | Card titles |
| `text-3xl` | 1.875rem (30px) | Page headings |
| `text-4xl` | 2.25rem (36px) | Hero headings |

### Font Weights

| Class | Weight | Use Case |
|-------|--------|----------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Subheadings |
| `font-bold` | 700 | Headings |

## Spacing

Tailwind spacing scale (based on 0.25rem = 4px):

| Class | Size | Pixels |
|-------|------|--------|
| `p-1` / `m-1` | 0.25rem | 4px |
| `p-2` / `m-2` | 0.5rem | 8px |
| `p-3` / `m-3` | 0.75rem | 12px |
| `p-4` / `m-4` | 1rem | 16px |
| `p-6` / `m-6` | 1.5rem | 24px |
| `p-8` / `m-8` | 2rem | 32px |
| `p-12` / `m-12` | 3rem | 48px |
| `p-16` / `m-16` | 4rem | 64px |

### Common Spacing Patterns

```html
<!-- Card padding -->
<div class="p-6">Standard card</div>
<div class="p-8">Large card</div>

<!-- Section spacing -->
<section class="py-12 px-4">...</section>
<section class="py-16 px-6">...</section>

<!-- Gap in flexbox/grid -->
<div class="flex gap-4">...</div>
<div class="grid gap-6">...</div>
```

## Border Radius

| Class | Size | Use Case |
|-------|------|----------|
| `rounded-sm` | 0.125rem (2px) | Small elements |
| `rounded` | 0.25rem (4px) | Buttons, inputs |
| `rounded-md` | 0.375rem (6px) | Cards |
| `rounded-lg` | 0.5rem (8px) | Modals |
| `rounded-xl` | 0.75rem (12px) | Glass surfaces (default) |
| `rounded-2xl` | 1rem (16px) | Hero sections |
| `rounded-full` | 9999px | Avatars, badges |

## Shadows

### Standard Shadows

```css
/* Tailwind default shadows */
shadow-sm    /* 0 1px 2px rgba(0, 0, 0, 0.05) */
shadow       /* 0 1px 3px rgba(0, 0, 0, 0.1) */
shadow-md    /* 0 4px 6px rgba(0, 0, 0, 0.1) */
shadow-lg    /* 0 10px 15px rgba(0, 0, 0, 0.1) */
shadow-xl    /* 0 20px 25px rgba(0, 0, 0, 0.1) */
```

### Glass Shadows

Applied automatically with glass utilities:

```css
.glass-light: 0 4px 16px 0 rgba(31, 38, 135, 0.25)
.glass:       0 8px 32px 0 rgba(31, 38, 135, 0.37)
.glass-heavy: 0 8px 32px 0 rgba(31, 38, 135, 0.5)
```

## Backdrop Blur

```css
backdrop-blur-none  /* 0 */
backdrop-blur-sm    /* 4px */
backdrop-blur       /* 8px - Default for .glass */
backdrop-blur-md    /* 12px */
backdrop-blur-lg    /* 16px - Default for .glass-heavy */
backdrop-blur-xl    /* 24px */
```

## Z-Index Layers

```css
z-0    /* Base layer (backgrounds) */
z-10   /* Content layer */
z-20   /* Cards, elevated content */
z-30   /* Dropdowns, popovers */
z-40   /* Modals, overlays */
z-50   /* Toasts, notifications */
```

### Semantic Z-Index Usage

```html
<!-- Background pattern -->
<div class="fixed inset-0 z-0">...</div>

<!-- Page content -->
<main class="relative z-10">...</main>

<!-- Dropdown menu -->
<div class="absolute z-30">...</div>

<!-- Modal -->
<div class="fixed inset-0 z-40">...</div>
```

## Transitions

### Duration

```css
duration-75     /* 75ms */
duration-100    /* 100ms */
duration-150    /* 150ms - Micro-interactions */
duration-200    /* 200ms - Button hovers */
duration-300    /* 300ms - Card animations (default for .glass-hover) */
duration-500    /* 500ms - Page transitions */
```

### Timing Functions

```css
ease-linear     /* linear */
ease-in         /* cubic-bezier(0.4, 0, 1, 1) */
ease-out        /* cubic-bezier(0, 0, 0.2, 1) */
ease-in-out     /* cubic-bezier(0.4, 0, 0.2, 1) - Default */
```

### Common Patterns

```html
<!-- Smooth hover effect -->
<button class="transition-all duration-200 hover:scale-105">
  Hover me
</button>

<!-- Color transition -->
<div class="bg-base-200 transition-colors duration-300 hover:bg-base-300">
  ...
</div>
```

## Breakpoints

Tailwind responsive prefixes:

| Prefix | Min Width | Use Case |
|--------|-----------|----------|
| `sm:` | 640px | Tablets portrait |
| `md:` | 768px | Tablets landscape |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large displays |

### Mobile-First Example

```html
<div class="
  w-full          <!-- Mobile: full width -->
  sm:w-1/2        <!-- Tablet: half width -->
  lg:w-1/3        <!-- Desktop: third width -->
  p-4             <!-- Mobile: small padding -->
  md:p-6          <!-- Tablet: medium padding -->
  lg:p-8          <!-- Desktop: large padding -->
">
  Responsive content
</div>
```

## Accessibility Tokens

### Focus Visible

```css
/* Defined in animations.css */
*:focus-visible {
  outline: 2px solid hsl(var(--p));  /* Primary color */
  outline-offset: 2px;
  border-radius: 0.25rem;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Usage Guidelines

### DO ✓

- Use theme color variables (`text-primary`, `bg-base-100`)
- Apply glass utilities for consistent surfaces
- Maintain 4.5:1 contrast ratio (WCAG AA)
- Use semantic spacing (multiples of 4)
- Leverage DaisyUI semantic classes (`btn-primary`, `badge-success`)

### DON'T ✗

- Hardcode RGB/hex colors outside of theme definitions
- Mix arbitrary values with design tokens (`p-[13px]`)
- Override DaisyUI component internals
- Use fixed widths without responsive variants
- Ignore reduced motion preferences

## Quick Reference

```html
<!-- Standard card with proper spacing and glass effect -->
<div class="glass p-6 space-y-4">
  <h3 class="text-xl font-semibold text-neutral">Title</h3>
  <p class="text-base text-neutral/70">Description</p>
  <button class="btn btn-primary">Action</button>
</div>

<!-- Interactive card with hover effect -->
<div class="glass-hover p-6 cursor-pointer">
  <p class="text-sm">Click me</p>
</div>

<!-- Form with proper focus states -->
<input 
  type="text" 
  class="input input-bordered w-full focus-ring"
  placeholder="Enter text"
/>
```
