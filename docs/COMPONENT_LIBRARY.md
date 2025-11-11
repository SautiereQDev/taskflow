# Component Library Documentation

**Version**: 1.0.0  
**Last Updated**: 2025-01-11  
**Framework**: DaisyUI 5.4.7 + Alpine.js 3.15.1 + HTMX 2.0.7

---

## Table of Contents

- [Overview](#overview)
- [Form Components](#form-components)
  - [Input](#input)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [Radio Group](#radio-group)
  - [File Input](#file-input)
  - [Textarea](#textarea)
  - [Select](#select)
- [UI Components](#ui-components)
  - [Button](#button)
  - [Card](#card)
  - [Badge](#badge)
  - [Alert](#alert)
  - [Modal](#modal)
  - [Divider](#divider)
  - [Breadcrumbs](#breadcrumbs)
  - [Tabs](#tabs)
  - [Dropdown](#dropdown)
  - [Loading Spinner](#loading-spinner)
- [Best Practices](#best-practices)
- [Accessibility](#accessibility)

---

## Overview

This library provides **22 production-ready EJS components** for building consistent, accessible, and maintainable user interfaces. All components:

- ✅ Use **DaisyUI 5.4.7** classes for styling
- ✅ Support **Alpine.js 3.15.1** for reactivity
- ✅ Support **HTMX 2.0.7** for progressive enhancement
- ✅ Follow **WCAG 2.1 AA** accessibility guidelines
- ✅ Include comprehensive **JSDoc** documentation
- ✅ Support **i18n** (all labels are props)

### Component Categories

- **Form Components** (8): Input controls with validation and accessibility
- **UI Components** (14): Layout and interaction elements

---

## Form Components

### Input

**Path**: `views/partials/ui/forms/input.ejs`  
**Lines**: 239

#### Description
Comprehensive text input component supporting all HTML5 input types with validation, character counter, and error handling.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Field label text |
| `name` | string | required | Input name and ID |
| `type` | string | `'text'` | Input type: text, email, password, number, date, datetime-local, time, tel, url, search |
| `value` | string | `''` | Input value |
| `placeholder` | string | `''` | Placeholder text |
| `required` | boolean | `false` | Mark as required |
| `disabled` | boolean | `false` | Disable input |
| `readonly` | boolean | `false` | Make read-only |
| `autofocus` | boolean | `false` | Auto-focus on load |
| `autocomplete` | string | `''` | Autocomplete attribute |
| `error` | string | `''` | Error message |
| `helpText` | string | `''` | Help text below input |
| `labelAlt` | string | `''` | Alt label (right side) |
| `minlength` | number | `null` | Min character length |
| `maxlength` | number | `null` | Max character length |
| `min` | number | `null` | Min value (number/date) |
| `max` | number | `null` | Max value (number/date) |
| `step` | number | `null` | Step increment (number) |
| `pattern` | string | `''` | Regex validation pattern |
| `showCounter` | boolean | `false` | Show character counter |
| `counterModel` | string | `''` | Alpine x-model for counter |
| `size` | string | `'md'` | Size: xs, sm, md, lg |
| `variant` | string | `'bordered'` | Variant: bordered, ghost, primary, secondary |
| `inputClass` | string | `''` | Additional input classes |
| `containerClass` | string | `''` | Additional container classes |
| `hxPost`, `hxGet`, `hxTrigger`, `hxTarget`, `hxSwap`, `hxIndicator` | string | `''` | HTMX attributes |
| `xModel` | string | `''` | Alpine x-model binding |
| `xOn` | string | `''` | Alpine x-on handler |
| `ariaLabel`, `ariaDescribedby` | string | `''` | ARIA attributes |

#### Usage Examples

**Basic Text Input**:
```ejs
<%- include('../../partials/ui/forms/input', {
  label: 'Email Address',
  name: 'email',
  type: 'email',
  required: true,
  placeholder: 'name@example.com',
  error: typeof errors !== 'undefined' ? errors.email : ''
}) %>
```

**With Character Counter** (requires Alpine.js x-data):
```ejs
<div x-data="{ title: '<%= task.title %>' }">
  <%- include('../../partials/ui/forms/input', {
    label: 'Task Title',
    name: 'title',
    value: task.title,
    maxlength: 200,
    showCounter: true,
    counterModel: 'title',
    xModel: 'title',
    required: true,
    helpText: 'Enter a descriptive title'
  }) %>
</div>
```

**With HTMX Validation**:
```ejs
<%- include('../../partials/ui/forms/input', {
  label: 'Username',
  name: 'username',
  hxPost: '/api/validate-username',
  hxTrigger: 'keyup changed delay:500ms',
  hxTarget: '#username-validation',
  hxSwap: 'innerHTML'
}) %>
<div id="username-validation"></div>
```

---

### Checkbox

**Path**: `views/partials/ui/forms/checkbox.ejs`  
**Lines**: 213

#### Description
Checkbox or toggle switch component with dual-mode support for standard checkboxes and iOS-style toggles.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Checkbox label text |
| `name` | string | required | Input name and ID |
| `type` | string | `'checkbox'` | Type: checkbox or toggle |
| `checked` | boolean | `false` | Initial checked state |
| `required` | boolean | `false` | Mark as required |
| `disabled` | boolean | `false` | Disable checkbox |
| `value` | string | `'on'` | Input value attribute |
| `error` | string | `''` | Error message |
| `helpText` | string | `''` | Help text below checkbox |
| `labelClass` | string | `''` | Additional label classes |
| `size` | string | `'md'` | Size: xs, sm, md, lg |
| `variant` | string | `'primary'` | Variant: primary, secondary, accent, success, warning, error, info |
| `containerClass` | string | `''` | Additional container classes |
| `inputClass` | string | `''` | Additional input classes |
| `layout` | string | `'inline'` | Layout: inline or stacked |
| `justify` | string | `'start'` | Flex justify: start, center, end, between |
| `hxPost`, `hxGet`, `hxTrigger`, `hxTarget`, `hxSwap` | string | `''` | HTMX attributes |
| `xModel`, `xOn` | string | `''` | Alpine attributes |
| `ariaLabel`, `ariaDescribedby` | string | `''` | ARIA attributes |

#### Usage Examples

**Standard Checkbox**:
```ejs
<%- include('../../partials/ui/forms/checkbox', {
  label: 'Remember me',
  name: 'rememberMe'
}) %>
```

**Toggle Switch** (settings):
```ejs
<%- include('../../partials/ui/forms/checkbox', {
  label: 'Email notifications',
  name: 'emailNotifications',
  type: 'toggle',
  checked: user.emailNotifications,
  helpText: 'Receive email updates about your tasks'
}) %>
```

**With HTMX Live Save**:
```ejs
<%- include('../../partials/ui/forms/checkbox', {
  label: 'Dark mode',
  name: 'darkMode',
  type: 'toggle',
  checked: user.preferences.darkMode,
  hxPost: '/api/settings/theme',
  hxTrigger: 'change',
  hxSwap: 'none'
}) %>
```

---

### Radio

**Path**: `views/partials/ui/forms/radio.ejs`  
**Lines**: 204

#### Description
Single radio button component for basic radio groups.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Radio button label |
| `name` | string | required | Input name (shared across group) |
| `value` | string | required | Input value (unique per radio) |
| `checked` | boolean | `false` | Initial checked state |
| `required` | boolean | `false` | Mark as required |
| `disabled` | boolean | `false` | Disable radio |
| `error`, `helpText`, `labelClass` | string | `''` | Error/help text |
| `size`, `variant`, `containerClass`, `inputClass`, `layout`, `justify` | string | - | Same as checkbox |
| `hxPost`, `hxGet`, `hxTrigger`, `hxTarget`, `hxSwap` | string | `''` | HTMX attributes |
| `xModel`, `xOn` | string | `''` | Alpine attributes |
| `ariaLabel`, `ariaDescribedby` | string | `''` | ARIA attributes |

#### Usage Example

```ejs
<div x-data="{ plan: 'basic' }">
  <%- include('../../partials/ui/forms/radio', {
    label: 'Basic Plan',
    name: 'plan',
    value: 'basic',
    xModel: 'plan',
    helpText: '$10/month'
  }) %>
  <%- include('../../partials/ui/forms/radio', {
    label: 'Premium Plan',
    name: 'plan',
    value: 'premium',
    xModel: 'plan',
    helpText: '$29/month'
  }) %>
</div>
```

---

### Radio Group

**Path**: `views/partials/ui/forms/radio-group.ejs`  
**Lines**: 57

#### Description
Visual radio group component for theme/locale-style selectors with custom card visuals.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | required | Input name shared by group |
| `options` | Array<Object> | required | Option objects (see below) |
| `xModel` | string | `''` | Alpine x-model variable |
| `selectedValue` | string | `''` | Server-side selected value |
| `containerClass` | string | `'flex gap-4 flex-wrap'` | Container classes |
| `cardBaseClass` | string | DaisyUI defaults | Card base classes |

**Options Object**:
```typescript
{
  value: string;       // Radio value
  title: string;       // Display title
  subtitle?: string;   // Optional subtitle
  icon?: string;       // HTML icon/emoji
  cardClass?: string;  // Additional card classes
}
```

#### Usage Example

```ejs
<div x-data="{ selectedTheme: '<%= theme %>' }">
  <%- include('../../partials/ui/forms/radio-group', {
    name: 'theme',
    xModel: 'selectedTheme',
    options: [
      {
        value: 'light',
        title: __('settings.appearance.light'),
        icon: `<svg>...</svg>`
      },
      {
        value: 'dark',
        title: __('settings.appearance.dark'),
        icon: `<svg>...</svg>`
      }
    ]
  }) %>
</div>
```

---

### File Input

**Path**: `views/partials/ui/forms/file-input.ejs`  
**Lines**: 179

#### Description
File upload component with drag-and-drop, image preview, and multiple file support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | required | Input name attribute |
| `label` | string | `''` | Field label |
| `accept` | string | `''` | Accepted file types (e.g., `'image/*,.pdf'`) |
| `multiple` | boolean | `false` | Allow multiple files |
| `maxSize` | number | `null` | Max file size in bytes |
| `required` | boolean | `false` | Mark as required |
| `disabled` | boolean | `false` | Disable input |
| `error`, `helpText`, `containerClass` | string | `''` | Error/help/classes |
| `hxPost`, `hxGet`, `hxTrigger`, `hxTarget`, `hxSwap` | string | `''` | HTMX attributes |

#### Features
- Drag-and-drop area with visual feedback
- Image preview with thumbnails (12x12)
- File size display (KB)
- Remove button per file
- Native fallback (works without JS)

#### Usage Example

```ejs
<%- include('../../partials/ui/forms/file-input', {
  name: 'avatar',
  label: 'Profile Picture',
  accept: 'image/*',
  maxSize: 5242880,
  helpText: 'PNG, JPG up to 5MB'
}) %>
```

---

### Textarea

**Path**: `views/partials/ui/forms/textarea.ejs`  
**Lines**: 59

#### Description
Multi-line text input component (existing component, not created in Phase 1.1).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Field label |
| `name` | string | required | Textarea name |
| `value` | string | `''` | Textarea value |
| `rows` | number | `4` | Number of rows |
| `placeholder`, `error`, `helpText` | string | `''` | Text props |
| `required`, `disabled` | boolean | `false` | State props |

#### Usage Example

```ejs
<%- include('../../partials/ui/forms/textarea', {
  label: 'Description',
  name: 'description',
  rows: 6,
  value: task.description,
  placeholder: 'Enter task description...'
}) %>
```

---

### Select

**Path**: `views/partials/ui/forms/select.ejs`

#### Description
Dropdown select component (existing component, not created in Phase 1.1).

---

## UI Components

### Button

**Path**: `views/partials/ui/button.ejs`  
**Lines**: 111

#### Description
Comprehensive button component with 11 variants, icons, loading states, and HTMX support (existing component).

#### Key Features
- 11 variants: primary, secondary, accent, neutral, ghost, link, info, success, warning, error, outline
- 4 sizes: xs, sm, md, lg
- Icon support (left/right)
- Loading state with spinner
- Link mode (renders as `<a>`)
- Block button (full width)
- HTMX attributes

---

### Card

**Path**: `views/partials/ui/card.ejs`  
**Lines**: 96

#### Description
Card container with slots and variants (existing component, 0% adoption).

---

### Badge

**Path**: `views/partials/ui/badge.ejs`

#### Description
Status/priority badge component (existing component, 15% adoption).

---

### Alert

**Path**: `views/partials/ui/alert.ejs`

#### Description
Alert messages with icons and variants (existing component).

---

### Modal

**Path**: `views/partials/ui/modal.ejs`

#### Description
Modal dialog with Alpine.js state management (existing component).

---

### Divider

**Path**: `views/partials/ui/divider.ejs`  
**Lines**: 35

#### Description
Horizontal or vertical divider with optional text label.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | `''` | Text to display in divider |
| `orientation` | string | `'horizontal'` | Orientation: horizontal or vertical |
| `variant` | string | `'neutral'` | Variant: neutral, primary, secondary, accent |
| `containerClass` | string | `''` | Additional classes |

#### Usage Examples

```ejs
<!-- Simple divider -->
<%- include('../partials/ui/divider') %>

<!-- With text -->
<%- include('../partials/ui/divider', { text: 'OR' }) %>

<!-- Vertical (in flex container) -->
<%- include('../partials/ui/divider', { orientation: 'vertical' }) %>
```

---

### Breadcrumbs

**Path**: `views/partials/ui/breadcrumbs.ejs`  
**Lines**: 39

#### Description
Navigation breadcrumb trail with SEO and accessibility support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | Array<Object> | required | Breadcrumb items (see below) |
| `containerClass` | string | `''` | Additional classes |

**Items Object**:
```typescript
{
  label: string;       // Breadcrumb text
  href?: string;       // Link URL (omit for active)
  icon?: string;       // HTML icon
  active?: boolean;    // Active page indicator
}
```

#### Usage Example

```ejs
<%- include('../partials/ui/breadcrumbs', {
  items: [
    { label: 'Home', href: '/' },
    { label: 'Tasks', href: '/tasks' },
    { label: 'Edit Task', active: true }
  ]
}) %>
```

---

### Tabs

**Path**: `views/partials/ui/tabs.ejs`  
**Lines**: 58

#### Description
Tabbed interface with Alpine.js reactive switching.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | Array<Object> | required | Tab definitions (see below) |
| `activeTab` | string | `tabs[0].id` | Initially active tab |
| `variant` | string | `'bordered'` | Variant: bordered, lifted, boxed |
| `size` | string | `'md'` | Size: xs, sm, md, lg |
| `containerClass` | string | `''` | Additional classes |

**Tabs Object**:
```typescript
{
  id: string;          // Tab identifier
  label: string;       // Tab label
  icon?: string;       // HTML icon
  badge?: string;      // Badge text (e.g., count)
}
```

#### Usage Example

```ejs
<div x-data="{ activeTab: 'profile' }">
  <%- include('../partials/ui/tabs', {
    tabs: [
      { id: 'profile', label: 'Profile' },
      { id: 'settings', label: 'Settings', badge: '3' },
      { id: 'notifications', label: 'Notifications' }
    ]
  }) %>

  <div x-show="activeTab === 'profile'">Profile content</div>
  <div x-show="activeTab === 'settings'">Settings content</div>
  <div x-show="activeTab === 'notifications'">Notifications content</div>
</div>
```

---

### Dropdown

**Path**: `views/partials/ui/dropdown.ejs`  
**Lines**: 75

#### Description
Interactive dropdown menu with Alpine.js and click-outside support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Button label |
| `items` | Array<Object> | required | Menu items (see below) |
| `variant` | string | `'primary'` | Button variant |
| `size` | string | `'md'` | Button size |
| `position` | string | `'bottom'` | Position: top, bottom, left, right |
| `align` | string | `'end'` | Alignment: start, end |
| `containerClass` | string | `''` | Additional classes |

**Items Object**:
```typescript
{
  label: string;       // Menu item text
  href?: string;       // Link URL
  icon?: string;       // HTML icon
  divider?: boolean;   // Render as divider
  onClick?: string;    // Alpine onClick handler
}
```

#### Usage Example

```ejs
<%- include('../partials/ui/dropdown', {
  label: 'Actions',
  items: [
    {
      label: 'Edit',
      href: '/tasks/' + task.id + '/edit',
      icon: '<svg>...</svg>'
    },
    { divider: true },
    {
      label: 'Delete',
      onClick: 'deleteTask()'
    }
  ]
}) %>
```

---

### Loading Spinner

**Path**: `views/partials/ui/loading-spinner.ejs`  
**Lines**: 59

#### Description
Animated loading spinner with multiple animation types.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `'spinner'` | Type: spinner, dots, ring, ball, bars, infinity |
| `size` | string | `'md'` | Size: xs, sm, md, lg |
| `variant` | string | `'primary'` | Variant: primary, secondary, accent, neutral |
| `text` | string | `''` | Loading text to display |
| `containerClass` | string | `''` | Additional classes |

#### Usage Examples

```ejs
<!-- Simple spinner -->
<%- include('../partials/ui/loading-spinner') %>

<!-- With text -->
<%- include('../partials/ui/loading-spinner', {
  size: 'lg',
  text: 'Loading...'
}) %>

<!-- Different animation -->
<%- include('../partials/ui/loading-spinner', {
  type: 'dots',
  variant: 'accent'
}) %>

<!-- HTMX indicator -->
<span id="submit-indicator" class="htmx-indicator">
  <%- include('../partials/ui/loading-spinner', { size: 'sm' }) %>
</span>
```

---

## Best Practices

### 1. Component Selection

**Use `input.ejs` when**:
- Single-line text input needed
- Need character counter with Alpine.js
- Need HTMX validation

**Use `textarea.ejs` when**:
- Multi-line text input needed
- Description or long-form content

**Use `checkbox.ejs` when**:
- Boolean on/off choice
- Need toggle switch style (type: 'toggle')

**Use `radio.ejs` when**:
- Simple radio button group
- No custom visuals needed

**Use `radio-group.ejs` when**:
- Visual card-style selection (theme, locale)
- Need custom icons/content per option

### 2. Error Handling

Always pass error messages from validation:

```ejs
<%- include('input', {
  name: 'email',
  error: typeof errors !== 'undefined' ? errors.email : ''
}) %>
```

### 3. Alpine.js Integration

Components with Alpine.js require parent `x-data`:

```ejs
<div x-data="{ title: '' }">
  <%- include('input', {
    name: 'title',
    xModel: 'title',
    showCounter: true,
    counterModel: 'title',
    maxlength: 200
  }) %>
</div>
```

### 4. HTMX Integration

Use HTMX attributes for progressive enhancement:

```ejs
<%- include('input', {
  name: 'search',
  hxGet: '/api/search',
  hxTrigger: 'keyup changed delay:300ms',
  hxTarget: '#results'
}) %>
<div id="results"></div>
```

### 5. Accessibility

All components include:
- Proper ARIA attributes
- Required indicators (*)
- Error/help text associations
- Keyboard navigation support

Always provide:
- Meaningful labels
- Help text for complex fields
- Error messages for validation

---

## Accessibility

### WCAG 2.1 AA Compliance

All components follow WCAG 2.1 Level AA guidelines:

1. **Perceivable**:
   - Text alternatives (aria-label, aria-describedby)
   - Color contrast ratios (DaisyUI defaults)
   - Resize text support (rem units)

2. **Operable**:
   - Keyboard navigation (native HTML semantics)
   - Focus indicators (DaisyUI defaults)
   - No timing constraints

3. **Understandable**:
   - Clear labels and instructions
   - Error messages with guidance
   - Consistent navigation patterns

4. **Robust**:
   - Valid HTML5 semantics
   - ARIA roles and properties
   - Progressive enhancement

### Common Patterns

**Required Fields**:
```ejs
<%- include('input', {
  label: 'Email',
  name: 'email',
  required: true  // Adds * indicator and required attribute
}) %>
```

**Error States**:
```ejs
<%- include('input', {
  label: 'Password',
  name: 'password',
  error: 'Password must be at least 8 characters'  // Adds aria-describedby
}) %>
```

**Help Text**:
```ejs
<%- include('input', {
  label: 'Username',
  name: 'username',
  helpText: 'Must be unique and 3-20 characters'  // Adds aria-describedby
}) %>
```

---

## Migration Guide

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed before/after examples and step-by-step instructions.

---

**Documentation Version**: 1.0.0  
**Component Library Version**: Phase 1.1 Complete  
**Last Updated**: 2025-01-11
