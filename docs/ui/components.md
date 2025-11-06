# Components

Comprehensive reference for all TaskFlow UI components (DaisyUI + Custom).

## Table of Contents

- [Buttons](#buttons)
- [Cards](#cards)
- [Badges](#badges)
- [Forms](#forms)
- [Avatar](#avatar)
- [Skeleton Loaders](#skeleton-loaders)
- [Stats](#stats)
- [Modals](#modals)
- [Dropdowns](#dropdowns)
- [Navigation](#navigation)

---

## Buttons

### DaisyUI Buttons

```html
<!-- Primary button -->
<button class="btn btn-primary">Primary</button>

<!-- Secondary button -->
<button class="btn btn-secondary">Secondary</button>

<!-- Ghost button (transparent) -->
<button class="btn btn-ghost">Ghost</button>

<!-- Outline button -->
<button class="btn btn-outline">Outline</button>

<!-- Button sizes -->
<button class="btn btn-xs">Extra Small</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-md">Medium (default)</button>
<button class="btn btn-lg">Large</button>

<!-- Button states -->
<button class="btn btn-disabled">Disabled</button>
<button class="btn loading">Loading</button>
```

### HTMX Buttons

Buttons with HTMX attributes for partial updates:

```html
<!-- Delete button with confirmation -->
<button 
  class="btn btn-error btn-sm"
  hx-delete="/tasks/123"
  hx-confirm="Êtes-vous sûr de vouloir supprimer cette tâche ?"
  hx-target="closest .task-item"
  hx-swap="outerHTML swap:1s"
>
  <svg>...</svg>
  <%= t('common.delete') %>
</button>

<!-- Update status button -->
<button
  class="btn btn-success btn-sm"
  hx-patch="/tasks/123/status"
  hx-vals='{"status": "DONE"}'
  hx-target="closest .task-card"
  hx-swap="outerHTML"
>
  <%= t('tasks.markComplete') %>
</button>

<!-- Load more button -->
<button
  class="btn btn-primary"
  hx-get="/tasks?page=2"
  hx-target="#task-list"
  hx-swap="beforeend"
  hx-indicator=".spinner"
>
  <%= t('common.loadMore') %>
  <span class="htmx-indicator spinner">
    <svg class="animate-spin">...</svg>
  </span>
</button>
```

---

## Cards

### Basic Card with Glass Effect

```html
<div class="card glass">
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content goes here.</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

### Interactive Task Card

```html
<div class="glass-hover p-6 task-item" data-task-id="<%= task.id %>">
  <!-- Task header -->
  <div class="flex items-start justify-between mb-4">
    <h3 class="text-lg font-semibold">
      <%= task.title %>
    </h3>
    
    <!-- Priority badge -->
    <%- include('../partials/ui/badge', { 
      type: task.priority, 
      text: t(`tasks.priority.${task.priority}`) 
    }) %>
  </div>
  
  <!-- Task description -->
  <p class="text-sm text-neutral/70 mb-4">
    <%= task.description %>
  </p>
  
  <!-- Task footer -->
  <div class="flex items-center justify-between">
    <!-- Assignee -->
    <% if (task.assignee) { %>
      <%- include('../partials/ui/avatar', { user: task.assignee }) %>
    <% } %>
    
    <!-- Actions -->
    <div class="flex gap-2">
      <a href="/tasks/<%= task.id %>/edit" class="btn btn-sm btn-ghost">
        <%= t('common.edit') %>
      </a>
      <button 
        class="btn btn-sm btn-error"
        hx-delete="/tasks/<%= task.id %>"
        hx-confirm="<%= t('tasks.confirmDelete') %>"
      >
        <%= t('common.delete') %>
      </button>
    </div>
  </div>
</div>
```

### Stat Card

```html
<%- include('../partials/ui/stat-card', {
  title: t('dashboard.totalTasks'),
  value: stats.totalTasks,
  icon: 'tasks',
  trend: { value: 12, direction: 'up' }
}) %>
```

---

## Badges

### Status Badges (Custom EJS Component)

```ejs
<%- include('../partials/ui/badge', { 
  type: 'TODO', 
  text: 'À faire' 
}) %>

<%- include('../partials/ui/badge', { 
  type: 'IN_PROGRESS', 
  text: 'En cours' 
}) %>

<%- include('../partials/ui/badge', { 
  type: 'DONE', 
  text: 'Terminé' 
}) %>
```

**Badge Component** (`views/partials/ui/badge.ejs`):

```ejs
<%
const badgeType = type || 'default';
const badgeText = text || '';

const badgeClasses = {
  TODO: 'badge-info',
  IN_PROGRESS: 'badge-warning',
  DONE: 'badge-success',
  CANCELLED: 'badge-error',
  LOW: 'badge-ghost',
  MEDIUM: 'badge-info',
  HIGH: 'badge-warning',
  URGENT: 'badge-error',
  default: 'badge-ghost'
};

const badgeClass = badgeClasses[badgeType] || badgeClasses.default;
%>

<span class="badge <%= badgeClass %> gap-2">
  <%= badgeText %>
</span>
```

### DaisyUI Badges

```html
<!-- Semantic badges -->
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<span class="badge badge-accent">Accent</span>
<span class="badge badge-ghost">Ghost</span>

<!-- State badges -->
<span class="badge badge-info">Info</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>

<!-- Badge sizes -->
<span class="badge badge-lg">Large</span>
<span class="badge badge-md">Medium</span>
<span class="badge badge-sm">Small</span>
<span class="badge badge-xs">Extra Small</span>

<!-- Badge with outline -->
<span class="badge badge-outline">Outline</span>
```

---

## Forms

### Input Fields

```html
<!-- Standard text input -->
<div class="form-control w-full">
  <label class="label">
    <span class="label-text"><%= t('tasks.title') %></span>
  </label>
  <input 
    type="text" 
    name="title"
    placeholder="<%= t('tasks.titlePlaceholder') %>"
    class="input input-bordered w-full focus-ring" 
    required
  />
  <label class="label">
    <span class="label-text-alt"><%= t('tasks.titleHint') %></span>
  </label>
</div>

<!-- Input with error state -->
<input 
  type="email" 
  class="input input-bordered input-error w-full" 
  value="invalid-email"
/>
<span class="text-error text-sm"><%= t('validation.invalidEmail') %></span>
```

### Textarea

```html
<div class="form-control">
  <label class="label">
    <span class="label-text"><%= t('tasks.description') %></span>
  </label>
  <textarea 
    name="description"
    class="textarea textarea-bordered h-24" 
    placeholder="<%= t('tasks.descriptionPlaceholder') %>"
  ></textarea>
</div>
```

### Select Dropdown

```html
<div class="form-control w-full">
  <label class="label">
    <span class="label-text"><%= t('tasks.status') %></span>
  </label>
  <select name="status" class="select select-bordered w-full">
    <option value="TODO"><%= t('tasks.status.TODO') %></option>
    <option value="IN_PROGRESS"><%= t('tasks.status.IN_PROGRESS') %></option>
    <option value="DONE"><%= t('tasks.status.DONE') %></option>
    <option value="CANCELLED"><%= t('tasks.status.CANCELLED') %></option>
  </select>
</div>
```

### HTMX-Enhanced Select (Instant Filter)

```html
<select 
  name="status" 
  class="select select-bordered w-full"
  hx-get="/tasks"
  hx-trigger="change"
  hx-target="#task-list-container"
  hx-indicator=".loading-spinner"
>
  <option value=""><%= t('tasks.filters.allStatuses') %></option>
  <option value="TODO"><%= t('tasks.status.TODO') %></option>
  <option value="IN_PROGRESS"><%= t('tasks.status.IN_PROGRESS') %></option>
  <option value="DONE"><%= t('tasks.status.DONE') %></option>
</select>
```

### Checkbox

```html
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text"><%= t('tasks.markComplete') %></span>
    <input type="checkbox" class="checkbox checkbox-primary" />
  </label>
</div>
```

### Form Example (Complete)

```html
<form 
  method="POST" 
  action="/tasks" 
  class="space-y-6 glass p-8"
  hx-post="/tasks"
  hx-target="#task-list"
  hx-swap="beforeend"
  hx-on::after-request="this.reset()"
>
  <!-- Title -->
  <div class="form-control">
    <label class="label">
      <span class="label-text"><%= t('tasks.title') %> *</span>
    </label>
    <input 
      type="text" 
      name="title" 
      class="input input-bordered w-full" 
      required
      minlength="3"
      maxlength="200"
    />
  </div>
  
  <!-- Description -->
  <div class="form-control">
    <label class="label">
      <span class="label-text"><%= t('tasks.description') %></span>
    </label>
    <textarea 
      name="description" 
      class="textarea textarea-bordered h-24"
    ></textarea>
  </div>
  
  <!-- Status and Priority -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label">
        <span class="label-text"><%= t('tasks.status') %></span>
      </label>
      <select name="status" class="select select-bordered">
        <option value="TODO"><%= t('tasks.status.TODO') %></option>
        <option value="IN_PROGRESS"><%= t('tasks.status.IN_PROGRESS') %></option>
      </select>
    </div>
    
    <div class="form-control">
      <label class="label">
        <span class="label-text"><%= t('tasks.priority') %></span>
      </label>
      <select name="priority" class="select select-bordered">
        <option value="LOW"><%= t('tasks.priority.LOW') %></option>
        <option value="MEDIUM" selected><%= t('tasks.priority.MEDIUM') %></option>
        <option value="HIGH"><%= t('tasks.priority.HIGH') %></option>
        <option value="URGENT"><%= t('tasks.priority.URGENT') %></option>
      </select>
    </div>
  </div>
  
  <!-- Actions -->
  <div class="flex gap-4 justify-end">
    <a href="/tasks" class="btn btn-ghost"><%= t('common.cancel') %></a>
    <button type="submit" class="btn btn-primary">
      <%= t('common.save') %>
    </button>
  </div>
</form>
```

---

## Avatar

**EJS Component** (`views/partials/ui/avatar.ejs`):

```ejs
<div class="avatar placeholder">
  <div class="bg-neutral text-neutral-content rounded-full w-10">
    <span class="text-sm">
      <%= user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) %>
    </span>
  </div>
</div>
```

**Usage:**

```ejs
<%- include('../partials/ui/avatar', { 
  user: { name: 'John Doe', email: 'john@example.com' } 
}) %>
```

---

## Skeleton Loaders

**EJS Component** (`views/partials/ui/skeleton.ejs`):

```ejs
<% 
const skeletonType = type || 'card';
%>

<% if (skeletonType === 'card') { %>
  <div class="glass p-6 animate-pulse" role="status" aria-label="<%= t('a11y.loading') %>">
    <div class="h-4 bg-base-300 rounded w-3/4 mb-4"></div>
    <div class="h-3 bg-base-300 rounded w-full mb-2"></div>
    <div class="h-3 bg-base-300 rounded w-5/6"></div>
  </div>
<% } else if (skeletonType === 'list') { %>
  <div class="space-y-3" role="status" aria-label="<%= t('a11y.loading') %>">
    <% for(let i = 0; i < 5; i++) { %>
      <div class="flex items-center gap-4 animate-pulse">
        <div class="w-10 h-10 bg-base-300 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-base-300 rounded w-1/2"></div>
        </div>
      </div>
    <% } %>
  </div>
<% } %>
```

**Usage:**

```ejs
<!-- Show skeleton while loading -->
<div id="task-list" hx-get="/tasks" hx-trigger="load">
  <%- include('../partials/ui/skeleton', { type: 'list' }) %>
</div>
```

---

## Stats

**Stat Cards** (DaisyUI):

```html
<div class="stats glass shadow">
  <div class="stat">
    <div class="stat-title"><%= t('dashboard.totalTasks') %></div>
    <div class="stat-value text-primary"><%= stats.total %></div>
    <div class="stat-desc">↗︎ <%= stats.change %>% <%= t('dashboard.thisMonth') %></div>
  </div>
  
  <div class="stat">
    <div class="stat-title"><%= t('dashboard.completed') %></div>
    <div class="stat-value text-success"><%= stats.completed %></div>
    <div class="stat-desc"><%= stats.completionRate %>% <%= t('dashboard.completion') %></div>
  </div>
</div>
```

---

## Modals

```html
<!-- Modal trigger -->
<label for="my-modal" class="btn btn-primary">Open Modal</label>

<!-- Modal -->
<input type="checkbox" id="my-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box glass-heavy">
    <h3 class="font-bold text-lg"><%= t('tasks.delete') %></h3>
    <p class="py-4"><%= t('tasks.confirmDeleteMessage') %></p>
    <div class="modal-action">
      <label for="my-modal" class="btn btn-ghost"><%= t('common.cancel') %></label>
      <button class="btn btn-error"><%= t('common.delete') %></button>
    </div>
  </div>
</div>
```

---

## Dropdowns

```html
<div class="dropdown dropdown-end">
  <label tabindex="0" class="btn btn-ghost">
    <%= t('common.options') %>
    <svg>...</svg>
  </label>
  <ul tabindex="0" class="dropdown-content menu glass p-2 shadow rounded-box w-52">
    <li><a><%= t('common.edit') %></a></li>
    <li><a><%= t('common.duplicate') %></a></li>
    <li><a class="text-error"><%= t('common.delete') %></a></li>
  </ul>
</div>
```

---

## Navigation

### Navbar

```html
<nav class="navbar glass-light">
  <div class="navbar-start">
    <a href="/" class="btn btn-ghost normal-case text-xl">TaskFlow</a>
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a href="/tasks"><%= t('nav.tasks') %></a></li>
      <li><a href="/users"><%= t('nav.users') %></a></li>
    </ul>
  </div>
  <div class="navbar-end">
    <button class="btn btn-ghost btn-circle">
      <svg><!-- theme toggle --></svg>
    </button>
    <%- include('../partials/ui/avatar', { user }) %>
  </div>
</nav>
```

### Breadcrumbs

```html
<div class="text-sm breadcrumbs">
  <ul>
    <li><a href="/"><%= t('nav.home') %></a></li>
    <li><a href="/tasks"><%= t('nav.tasks') %></a></li>
    <li><%= task.title %></li>
  </ul>
</div>
```

---

## Best Practices

1. **Always use i18n**: Never hardcode text
2. **Progressive Enhancement**: Forms work without JS
3. **HTMX attributes**: Add `hx-indicator` for loading states
4. **Accessibility**: Include `aria-label` and `role` where needed
5. **Glass effects**: Use on containers, not tiny elements
6. **Responsive**: Test all components on mobile

## Component Checklist

- [ ] Keyboard navigable
- [ ] Screen reader accessible
- [ ] Works without JavaScript
- [ ] HTMX loading indicator
- [ ] i18n translations
- [ ] Dark mode compatible
- [ ] Mobile responsive
