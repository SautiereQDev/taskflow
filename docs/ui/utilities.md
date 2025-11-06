# Utility Classes

Custom utility classes for TaskFlow beyond Tailwind defaults.

## Glass Surface Utilities

### Glass Levels

Defined in `public/css/tailwind.css`:

```html
<!-- Subtle glass (sidebar, filters, background panels) -->
<div class="glass-light p-6">
  <h3>Subtle surface</h3>
</div>

<!-- Standard glass (cards, content blocks) -->
<div class="glass p-6">
  <h3>Standard card</h3>
</div>

<!-- Heavy glass (modals, overlays, elevated content) -->
<div class="glass-heavy p-8">
  <h2>Modal content</h2>
</div>

<!-- Interactive glass (hover effect for clickable items) -->
<div class="glass-hover p-6">
  <p>Click me!</p>
</div>
```

### Glass Properties

Each glass level includes:

- **Background**: Semi-transparent white/black with alpha
- **Backdrop filter**: Blur effect (4px to 16px)
- **Border**: Subtle white/black border
- **Shadow**: Layered shadow for depth
- **Border radius**: `rounded-xl` (0.75rem)

**Light theme:**
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border-radius: 0.75rem;
}
```

**Dark theme:**
```css
[data-theme='taskflowDark'] .glass {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}
```

## Component Utilities

### Card Utility

```html
<div class="tf-card glass">
  <!-- Includes p-6 padding -->
  <h3>Card with standard padding</h3>
</div>
```

### Button Utility

```html
<button class="btn-glass">
  Custom glass button
</button>
```

Includes:
- `px-4 py-2` padding
- `font-medium` weight
- `rounded-lg` border radius
- `transition-all duration-200` smooth transitions

### Input Utility

```html
<input type="text" class="input-glass" placeholder="Enter text" />
```

Includes:
- `w-full` width
- `px-4 py-3` padding
- `rounded-lg` border radius
- Focus ring with primary color
- Smooth transitions

### Badge Utility

```html
<span class="badge-glass">
  Custom badge
</span>
```

Includes:
- `px-3 py-1` padding
- `text-sm` size
- `font-medium` weight
- `inline-flex items-center gap-1` layout
- `rounded-full` shape

## HTMX State Utilities

### Loading Indicators

Defined in `public/css/tailwind.css` and `public/css/animations.css`:

```html
<!-- Spinner indicator -->
<button 
  class="btn btn-primary"
  hx-post="/tasks"
  hx-indicator=".spinner"
>
  Save
  <span class="htmx-indicator spinner">
    <svg class="loading-spinner w-4 h-4">...</svg>
  </span>
</button>
```

**Behavior:**
- `.htmx-indicator`: Hidden by default (`opacity-0`)
- `.htmx-request .htmx-indicator`: Visible during request (`opacity-100`)
- `.loading-spinner`: Animated spin (`animation: spin 1s linear infinite`)

### Swap Animations

```html
<!-- Element fades out during swap -->
<div 
  id="content"
  class="htmx-swapping"
  hx-get="/content"
  hx-swap="innerHTML"
>
  Content that will be replaced
</div>
```

**Animation stages:**
- `.htmx-swapping`: Opacity 0, triggered before swap
- `.htmx-settling`: Fade in animation after swap

## Focus Ring Utility

```html
<button class="focus-ring btn btn-primary">
  Accessible button
</button>

<input type="text" class="focus-ring input input-bordered" />

<a href="/tasks" class="focus-ring btn btn-ghost">
  Link styled as button
</a>
```

**Properties:**
```css
.focus-ring {
  @apply focus-visible:outline-none 
         focus-visible:ring-2 
         focus-visible:ring-primary 
         focus-visible:ring-opacity-50 
         focus-visible:ring-offset-2;
}
```

**Benefits:**
- Only shows on keyboard navigation (`:focus-visible`)
- Uses theme primary color
- 2px offset for clear visibility
- WCAG 2.2 AA compliant

## Animation Utilities

Defined in `public/css/animations.css`:

### Pulse Animation

```html
<div class="animate-pulse glass p-6">
  Loading skeleton
</div>
```

### Fade In

```html
<div class="htmx-settling">
  <!-- Automatically fades in with HTMX swap -->
  New content
</div>
```

### Task Item Hover

```html
<div class="task-item glass-hover">
  <!-- Smooth transform and shadow on hover -->
  Task content
</div>
```

**Properties:**
```css
.task-item {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.45);
}
```

## Accessibility Utilities

### Skip Link

```html
<a href="#main-content" class="skip-link">
  <%= t('a11y.skipToContent') %>
</a>
```

**Styles** (defined in `public/css/animations.css`):
- Hidden off-screen by default
- Visible on focus (positioned top-left)
- High z-index for visibility

### X-Cloak (Alpine.js)

```html
<div x-data="{ open: false }" x-cloak>
  <!-- Hidden until Alpine.js initializes -->
  <div x-show="open">Dropdown menu</div>
</div>
```

**Behavior:**
```css
[x-cloak] {
  display: none !important;
}
```

Prevents flash of unstyled content.

### Reduced Motion

Automatically applied via media query:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Test in DevTools:**
- Chrome: Settings > Accessibility > "Emulate CSS media feature prefers-reduced-motion"
- Firefox: about:config > `ui.prefersReducedMotion` = 1

## Layout Utilities

### Container

```html
<div class="container mx-auto px-4">
  <!-- Max-width responsive container with padding -->
  <h1>Page content</h1>
</div>
```

### Section Spacing

```html
<section class="py-12 px-4 md:py-16 md:px-6">
  <!-- Vertical padding increases on larger screens -->
  <h2>Section title</h2>
</section>
```

### Grid Layouts

```html
<!-- Responsive task grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="glass p-6">Task 1</div>
  <div class="glass p-6">Task 2</div>
  <div class="glass p-6">Task 3</div>
</div>
```

### Flexbox Utilities

```html
<!-- Vertical stack with spacing -->
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Horizontal layout with space-between -->
<div class="flex items-center justify-between">
  <h2>Title</h2>
  <button class="btn">Action</button>
</div>
```

## Text Utilities

### Text Colors (Semantic)

```html
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-neutral">Neutral text (default)</p>
<p class="text-neutral/70">Muted text (70% opacity)</p>
<p class="text-success">Success message</p>
<p class="text-error">Error message</p>
```

### Text Truncation

```html
<!-- Single line truncate -->
<p class="truncate">
  Very long text that will be cut off with ellipsis...
</p>

<!-- Multi-line truncate (2 lines) -->
<p class="line-clamp-2">
  Long description that will be truncated after two lines...
</p>
```

## Responsive Utilities

### Show/Hide by Breakpoint

```html
<!-- Hidden on mobile, visible on tablet+ -->
<div class="hidden md:block">
  Desktop sidebar
</div>

<!-- Visible on mobile, hidden on tablet+ -->
<div class="block md:hidden">
  Mobile menu
</div>
```

### Responsive Text Sizes

```html
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">
  <!-- Grows from 24px → 30px → 36px -->
  Responsive heading
</h1>
```

## Utility Combinations

### Card with Loading State

```html
<div 
  class="glass p-6"
  hx-get="/tasks/123"
  hx-trigger="load"
  hx-indicator=".card-spinner"
>
  <div class="htmx-indicator card-spinner text-center py-8">
    <svg class="loading-spinner mx-auto">...</svg>
    <p class="text-sm text-neutral/70 mt-2"><%= t('a11y.loading') %></p>
  </div>
  
  <div class="htmx-content">
    <!-- Content loaded via HTMX -->
  </div>
</div>
```

### Interactive List Item

```html
<a 
  href="/tasks/123"
  class="block glass-hover p-4 focus-ring"
  role="listitem"
>
  <div class="flex items-center justify-between">
    <h3 class="font-semibold">Task title</h3>
    <span class="badge badge-success">Done</span>
  </div>
  <p class="text-sm text-neutral/70 mt-2">Task description</p>
</a>
```

### Form with Validation

```html
<div class="form-control">
  <label class="label">
    <span class="label-text">Email *</span>
  </label>
  <input 
    type="email" 
    name="email"
    class="input input-bordered focus-ring" 
    required
    aria-describedby="email-error"
  />
  <label class="label">
    <span id="email-error" class="label-text-alt text-error">
      <!-- Error message appears here -->
    </span>
  </label>
</div>
```

## Custom Utility Tips

### DO ✓

- Combine utilities for complex layouts
- Use `@apply` in components for repeated patterns
- Leverage Tailwind's responsive prefixes
- Apply glass utilities to containers, not small elements
- Use semantic color utilities (`text-primary` vs `text-blue-500`)

### DON'T ✗

- Create arbitrary values (`w-[237px]`) instead of design tokens
- Override DaisyUI internals
- Nest glass surfaces (causes blur stacking)
- Use fixed widths without responsive variants
- Ignore focus states on interactive elements

## Quick Reference

```html
<!-- Perfect card -->
<div class="glass p-6 space-y-4 focus-ring" tabindex="0">
  <h3 class="text-xl font-semibold">Title</h3>
  <p class="text-neutral/70">Description</p>
  <div class="flex gap-2 justify-end">
    <button class="btn btn-ghost">Cancel</button>
    <button class="btn btn-primary">Save</button>
  </div>
</div>

<!-- Loading state -->
<div class="htmx-indicator">
  <div class="animate-pulse glass p-6">
    <div class="h-4 bg-base-300 rounded w-3/4"></div>
  </div>
</div>
```
