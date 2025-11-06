# Accessibility Guidelines

TaskFlow is committed to WCAG 2.2 Level AA compliance and inclusive design.

## WCAG 2.2 AA Requirements

### Perceivable

#### 1.1 Text Alternatives

**Requirement**: Provide text alternatives for non-text content.

```html
<!-- ✓ Good: Alt text for images -->
<img src="/images/task-icon.svg" alt="<%= t('a11y.taskIcon') %>" />

<!-- ✓ Good: Aria-label for icon buttons -->
<button aria-label="<%= t('common.delete') %>" class="btn btn-error">
  <svg aria-hidden="true">...</svg>
</button>

<!-- ✓ Good: Screen reader text -->
<span class="sr-only"><%= t('a11y.loading') %></span>
```

#### 1.3 Adaptable

**Requirement**: Create content that can be presented in different ways.

```html
<!-- ✓ Good: Semantic HTML -->
<nav aria-label="<%= t('nav.main') %>">
  <ul>
    <li><a href="/tasks"><%= t('nav.tasks') %></a></li>
  </ul>
</nav>

<!-- ✓ Good: Proper heading hierarchy -->
<h1><%= t('dashboard.title') %></h1>
  <h2><%= t('dashboard.stats') %></h2>
    <h3><%= t('dashboard.totalTasks') %></h3>
```

#### 1.4 Distinguishable

**Requirement**: Make it easier for users to see and hear content.

**Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text.

```html
<!-- ✓ Good: Sufficient contrast -->
<p class="text-neutral">Normal text (4.5:1 ratio)</p>
<h1 class="text-2xl text-neutral">Large text (3:1 ratio)</h1>

<!-- ✗ Bad: Insufficient contrast -->
<p class="text-gray-400">Low contrast text</p>
```

**Verify with tools**:
- Chrome DevTools: Inspect > Accessibility > Contrast ratio
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Operable

#### 2.1 Keyboard Accessible

**Requirement**: All functionality available from keyboard.

```html
<!-- ✓ Good: Keyboard accessible dropdown -->
<div x-data="{ open: false }" @keydown.escape="open = false">
  <button 
    @click="open = !open"
    @keydown.enter="open = !open"
    @keydown.space.prevent="open = !open"
    aria-expanded="false"
    :aria-expanded="open"
    aria-haspopup="true"
  >
    <%= t('common.options') %>
  </button>
  
  <div 
    x-show="open"
    @click.away="open = false"
    role="menu"
  >
    <a href="/tasks/edit" role="menuitem"><%= t('common.edit') %></a>
    <button role="menuitem"><%= t('common.delete') %></button>
  </div>
</div>

<!-- ✓ Good: Skip link -->
<a href="#main-content" class="skip-link">
  <%= t('a11y.skipToContent') %>
</a>

<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>
```

#### 2.2 Enough Time

**Requirement**: Provide users enough time to read and use content.

```html
<!-- ✓ Good: Pausable auto-update -->
<div 
  x-data="{ paused: false, intervalId: null }"
  x-init="
    intervalId = setInterval(() => {
      if (!paused) {
        htmx.trigger('#stats', 'reload');
      }
    }, 30000);
  "
>
  <button @click="paused = !paused" aria-label="<%= t('a11y.pauseUpdates') %>">
    <span x-text="paused ? '<%= t('a11y.resume') %>' : '<%= t('a11y.pause') %>'"></span>
  </button>
  
  <div id="stats" hx-get="/tasks/stats">
    <!-- Auto-updating stats -->
  </div>
</div>
```

#### 2.4 Navigable

**Requirement**: Provide ways to help users navigate and find content.

```html
<!-- ✓ Good: Landmarks -->
<header role="banner">
  <nav role="navigation" aria-label="<%= t('nav.main') %>">
    <!-- Main navigation -->
  </nav>
</header>

<main role="main" id="main-content">
  <!-- Main content -->
</main>

<aside role="complementary" aria-label="<%= t('nav.filters') %>">
  <!-- Filters -->
</aside>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>

<!-- ✓ Good: Focus visible styles -->
<style>
*:focus-visible {
  outline: 2px solid hsl(var(--p));
  outline-offset: 2px;
}
</style>
```

#### 2.5 Input Modalities

**Requirement**: Make it easier for users to operate functionality through various inputs.

```html
<!-- ✓ Good: Large click target (44x44px minimum) -->
<button class="btn btn-primary min-h-[44px] min-w-[44px]">
  <%= t('common.save') %>
</button>

<!-- ✓ Good: Pointer cancel (action on release, not press) -->
<button 
  class="btn"
  @mousedown="/* no action */"
  @click="handleClick()"
>
  <%= t('common.action') %>
</button>
```

### Understandable

#### 3.1 Readable

**Requirement**: Make text content readable and understandable.

```html
<!-- ✓ Good: Language attribute -->
<html lang="<%= locale %>">

<!-- ✓ Good: Language changes -->
<p>Le projet est <span lang="en">open source</span>.</p>
```

#### 3.2 Predictable

**Requirement**: Make Web pages appear and operate in predictable ways.

```html
<!-- ✓ Good: Consistent navigation -->
<nav aria-label="<%= t('nav.main') %>">
  <ul>
    <li><a href="/" aria-current="<%= currentPage === 'dashboard' ? 'page' : false %>">
      <%= t('nav.dashboard') %>
    </a></li>
    <li><a href="/tasks" aria-current="<%= currentPage === 'tasks' ? 'page' : false %>">
      <%= t('nav.tasks') %>
    </a></li>
  </ul>
</nav>

<!-- ✓ Good: No unexpected context changes -->
<select name="status" aria-label="<%= t('tasks.filterByStatus') %>">
  <!-- Doesn't auto-submit on change unless explicitly labeled -->
  <option value=""><%= t('filters.allStatuses') %></option>
</select>
<button type="submit"><%= t('common.apply') %></button>
```

#### 3.3 Input Assistance

**Requirement**: Help users avoid and correct mistakes.

```html
<!-- ✓ Good: Labels and instructions -->
<div class="form-control">
  <label for="task-title" class="label">
    <span class="label-text">
      <%= t('tasks.title') %>
      <abbr title="<%= t('common.required') %>" aria-label="<%= t('common.required') %>">*</abbr>
    </span>
  </label>
  <input 
    id="task-title"
    type="text" 
    name="title"
    class="input input-bordered"
    required
    aria-required="true"
    aria-describedby="title-hint title-error"
  />
  <span id="title-hint" class="label-text-alt">
    <%= t('tasks.titleHint') %>
  </span>
  <span id="title-error" class="label-text-alt text-error" role="alert">
    <!-- Error message appears here -->
  </span>
</div>

<!-- ✓ Good: Error identification -->
<div class="alert alert-error" role="alert">
  <h3><%= t('validation.errorsFound') %></h3>
  <ul>
    <% errors.forEach(error => { %>
      <li><a href="#<%= error.field %>"><%= error.message %></a></li>
    <% }) %>
  </ul>
</div>
```

### Robust

#### 4.1 Compatible

**Requirement**: Maximize compatibility with current and future user tools.

```html
<!-- ✓ Good: Proper ARIA usage -->
<div role="status" aria-live="polite" aria-atomic="true">
  <%= t('tasks.loaded', { count: tasks.length }) %>
</div>

<!-- ✓ Good: Valid HTML -->
<button type="button" class="btn">
  <!-- type="button" prevents accidental form submission -->
  <%= t('common.action') %>
</button>
```

---

## ARIA Best Practices

### Landmarks

```html
<header role="banner">
  <nav role="navigation" aria-label="<%= t('nav.main') %>"></nav>
</header>
<main role="main"></main>
<aside role="complementary"></aside>
<footer role="contentinfo"></footer>
```

### Live Regions

```html
<!-- Polite: Wait for user to finish -->
<div role="status" aria-live="polite">
  <%= t('tasks.filterApplied', { count: tasks.length }) %>
</div>

<!-- Assertive: Interrupt immediately (use sparingly) -->
<div role="alert" aria-live="assertive">
  <%= t('errors.criticalError') %>
</div>
```

### States and Properties

```html
<!-- Expanded/collapsed -->
<button 
  aria-expanded="false"
  :aria-expanded="open"
  aria-controls="menu-content"
>
  <%= t('common.menu') %>
</button>
<div id="menu-content" x-show="open"></div>

<!-- Selected -->
<div role="tablist">
  <button 
    role="tab" 
    aria-selected="true"
    :aria-selected="activeTab === 'all'"
  >
    <%= t('tasks.all') %>
  </button>
</div>

<!-- Disabled -->
<button disabled aria-disabled="true">
  <%= t('common.save') %>
</button>

<!-- Loading -->
<button aria-busy="true">
  <span class="loading loading-spinner"></span>
  <%= t('a11y.loading') %>
</button>
```

---

## Keyboard Navigation

### Focus Management

```html
<!-- ✓ Good: Focus trap in modal -->
<div 
  x-data="{ open: false }"
  @keydown.escape="open = false"
>
  <button @click="open = true"><%= t('common.openModal') %></button>
  
  <div 
    x-show="open"
    x-trap="open"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <h2 id="modal-title"><%= t('modal.title') %></h2>
    <!-- Modal content -->
    <button @click="open = false"><%= t('common.close') %></button>
  </div>
</div>
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Next focusable element |
| `Shift+Tab` | Previous focusable element |
| `Enter` | Activate button/link |
| `Space` | Toggle checkbox, activate button |
| `Escape` | Close modal/dropdown |
| `Arrow keys` | Navigate within components |

### Implementation

```html
<div 
  x-data="{ selectedIndex: 0 }"
  @keydown.arrow-down.prevent="selectedIndex = (selectedIndex + 1) % items.length"
  @keydown.arrow-up.prevent="selectedIndex = (selectedIndex - 1 + items.length) % items.length"
  @keydown.enter="selectItem(items[selectedIndex])"
  role="listbox"
>
  <% items.forEach((item, index) => { %>
    <div 
      :class="selectedIndex === <%= index %> ? 'bg-primary' : ''"
      role="option"
      :aria-selected="selectedIndex === <%= index %>"
    >
      <%= item.name %>
    </div>
  <% }) %>
</div>
```

---

## Screen Reader Support

### Announcements

```html
<!-- Status updates -->
<div role="status" aria-live="polite" class="sr-only">
  <%= t('tasks.created') %>
</div>

<!-- Loading indicators -->
<div aria-live="polite" aria-atomic="true">
  <span class="htmx-indicator">
    <span class="sr-only"><%= t('a11y.loading') %></span>
    <svg aria-hidden="true" class="animate-spin">...</svg>
  </span>
</div>
```

### Hidden Content

```css
/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Icons

```html
<!-- Decorative icon -->
<button class="btn">
  <svg aria-hidden="true">...</svg>
  <%= t('common.save') %>
</button>

<!-- Meaningful icon without text -->
<button aria-label="<%= t('common.delete') %>">
  <svg aria-hidden="true">...</svg>
</button>
```

---

## Reduced Motion

### Respecting User Preferences

```css
/* animations.css */
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

### Testing

```javascript
// Check if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable animations
}
```

**Playwright test:**

```typescript
test('should support reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/tasks');
  
  // Verify animations are disabled
  const animation = await page.evaluate(() => {
    const el = document.querySelector('.task-item');
    return window.getComputedStyle(el).animationDuration;
  });
  
  expect(animation).toBe('0.01ms');
});
```

---

## Color Contrast

### Testing Tools

- **Chrome DevTools**: Inspect > Accessibility pane
- **axe DevTools**: Browser extension
- **WAVE**: Web accessibility evaluation tool
- **WebAIM Contrast Checker**: Online tool

### TaskFlow Theme Compliance

**Light Theme:**
- Text on base-100: 15.8:1 ✓ (AAA)
- Primary on base-100: 7.3:1 ✓ (AAA)
- Secondary text (70% opacity): 5.2:1 ✓ (AA)

**Dark Theme:**
- Text on base-100: 16.1:1 ✓ (AAA)
- Primary on base-100: 8.1:1 ✓ (AAA)
- Secondary text (70% opacity): 5.4:1 ✓ (AA)

---

## Form Accessibility

### Complete Accessible Form

```html
<form 
  method="POST" 
  action="/tasks"
  aria-labelledby="form-title"
>
  <h2 id="form-title"><%= t('tasks.create') %></h2>
  
  <!-- Text input -->
  <div class="form-control">
    <label for="title" class="label">
      <span class="label-text">
        <%= t('tasks.title') %>
        <abbr title="<%= t('common.required') %>">*</abbr>
      </span>
    </label>
    <input 
      id="title"
      type="text"
      name="title"
      class="input input-bordered"
      required
      aria-required="true"
      aria-describedby="title-hint"
      aria-invalid="false"
    />
    <span id="title-hint" class="label-text-alt">
      <%= t('tasks.titleHint') %>
    </span>
  </div>
  
  <!-- Select -->
  <div class="form-control">
    <label for="status" class="label">
      <span class="label-text"><%= t('tasks.status') %></span>
    </label>
    <select id="status" name="status" class="select select-bordered">
      <option value="TODO"><%= t('tasks.status.TODO') %></option>
      <option value="DONE"><%= t('tasks.status.DONE') %></option>
    </select>
  </div>
  
  <!-- Checkbox -->
  <div class="form-control">
    <label class="label cursor-pointer">
      <input 
        type="checkbox" 
        name="urgent"
        class="checkbox"
        aria-describedby="urgent-hint"
      />
      <span class="label-text"><%= t('tasks.markUrgent') %></span>
    </label>
    <span id="urgent-hint" class="label-text-alt">
      <%= t('tasks.urgentHint') %>
    </span>
  </div>
  
  <!-- Submit -->
  <button type="submit" class="btn btn-primary">
    <%= t('common.save') %>
  </button>
</form>
```

---

## Testing Checklist

### Manual Testing

- [ ] Tab through all interactive elements
- [ ] Activate elements with Enter/Space
- [ ] Close modals with Escape
- [ ] Navigate menus with arrow keys
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify focus indicators are visible
- [ ] Check color contrast with DevTools
- [ ] Test with CSS disabled
- [ ] Test with JavaScript disabled
- [ ] Zoom to 200% and verify layout
- [ ] Test with reduced motion enabled

### Automated Testing

```typescript
// Playwright accessibility test
import { injectAxe, checkA11y } from 'axe-playwright';

test('task list should be accessible', async ({ page }) => {
  await page.goto('/tasks');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
```

### Tools

- **axe DevTools**: Browser extension for automated testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome audit tool
- **Pa11y**: Command-line accessibility tester
- **NVDA**: Free Windows screen reader
- **VoiceOver**: Built-in macOS screen reader

---

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## Quick Wins

1. **Add alt text** to all images
2. **Use semantic HTML** (`<nav>`, `<main>`, `<article>`)
3. **Label all form inputs** with `<label>` or `aria-label`
4. **Ensure sufficient color contrast** (4.5:1 minimum)
5. **Make all functionality keyboard accessible**
6. **Test with keyboard only** (no mouse)
7. **Add skip links** for keyboard users
8. **Provide focus indicators** for all interactive elements
9. **Use ARIA landmarks** (`role="main"`, `role="navigation"`)
10. **Test with screen reader** at least once per sprint
