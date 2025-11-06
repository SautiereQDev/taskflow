# EJS Code Snippets

Ready-to-use code snippets for common TaskFlow patterns.

## Table of Contents

- [Layout Snippets](#layout-snippets)
- [Component Snippets](#component-snippets)
- [Form Snippets](#form-snippets)
- [HTMX Snippets](#htmx-snippets)
- [Alpine.js Snippets](#alpinejs-snippets)
- [Accessibility Snippets](#accessibility-snippets)

---

## Layout Snippets

### Page Template

```ejs
<%- include('../layouts/main', { 
  title: t('tasks.title'),
  currentPage: 'tasks'
}) %>

<div class="container mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold"><%= t('tasks.title') %></h1>
    <a href="/tasks/new" class="btn btn-primary">
      <%= t('tasks.new') %>
    </a>
  </div>
  
  <!-- Page content -->
</div>
```

### Two-Column Layout

```ejs
<div class="flex gap-6">
  <!-- Sidebar -->
  <aside class="w-64 glass-light p-6">
    <h2 class="text-lg font-semibold mb-4"><%= t('filters.title') %></h2>
    <!-- Filters -->
  </aside>
  
  <!-- Main content -->
  <main class="flex-1">
    <div id="task-list" class="space-y-4">
      <!-- Tasks -->
    </div>
  </main>
</div>
```

### Grid Layout

```ejs
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <% tasks.forEach(task => { %>
    <div class="glass-hover p-6">
      <h3 class="text-lg font-semibold"><%= task.title %></h3>
      <p class="text-sm text-neutral/70 mt-2"><%= task.description %></p>
    </div>
  <% }) %>
</div>
```

---

## Component Snippets

### Card

```ejs
<div class="glass p-6">
  <div class="flex items-start justify-between mb-4">
    <h3 class="text-lg font-semibold"><%= task.title %></h3>
    <%- include('../partials/ui/badge', { 
      type: task.status, 
      text: t(`tasks.status.${task.status}`) 
    }) %>
  </div>
  
  <p class="text-sm text-neutral/70 mb-4"><%= task.description %></p>
  
  <div class="flex items-center justify-between">
    <% if (task.assignee) { %>
      <%- include('../partials/ui/avatar', { user: task.assignee }) %>
    <% } %>
    
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

### Empty State

```ejs
<div class="glass p-12 text-center">
  <svg class="w-24 h-24 mx-auto text-neutral/30 mb-4">
    <!-- Empty state icon -->
  </svg>
  <h3 class="text-xl font-semibold mb-2"><%= t('tasks.noTasks') %></h3>
  <p class="text-neutral/70 mb-6"><%= t('tasks.noTasksDescription') %></p>
  <a href="/tasks/new" class="btn btn-primary">
    <%= t('tasks.createFirst') %>
  </a>
</div>
```

### Loading State

```ejs
<div class="space-y-4">
  <% for(let i = 0; i < 3; i++) { %>
    <%- include('../partials/ui/skeleton', { type: 'card' }) %>
  <% } %>
</div>
```

### Badge

```ejs
<%- include('../partials/ui/badge', { 
  type: 'TODO', 
  text: t('tasks.status.TODO') 
}) %>

<%- include('../partials/ui/badge', { 
  type: 'HIGH', 
  text: t('tasks.priority.HIGH') 
}) %>
```

### Avatar

```ejs
<%- include('../partials/ui/avatar', { 
  user: { 
    name: 'John Doe', 
    email: 'john@example.com' 
  } 
}) %>
```

### Stats

```ejs
<div class="stats glass shadow">
  <div class="stat">
    <div class="stat-title"><%= t('dashboard.totalTasks') %></div>
    <div class="stat-value text-primary"><%= stats.total %></div>
    <div class="stat-desc">↗︎ <%= stats.change %>%</div>
  </div>
  
  <div class="stat">
    <div class="stat-title"><%= t('dashboard.completed') %></div>
    <div class="stat-value text-success"><%= stats.completed %></div>
    <div class="stat-desc"><%= stats.completionRate %>%</div>
  </div>
</div>
```

---

## Form Snippets

### Text Input

```ejs
<div class="form-control w-full">
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
    value="<%= task?.title || '' %>"
    placeholder="<%= t('tasks.titlePlaceholder') %>"
    class="input input-bordered w-full focus-ring" 
    required
    minlength="3"
    maxlength="200"
    aria-describedby="title-hint"
  />
  <label class="label">
    <span id="title-hint" class="label-text-alt"><%= t('tasks.titleHint') %></span>
  </label>
</div>
```

### Textarea

```ejs
<div class="form-control">
  <label for="description" class="label">
    <span class="label-text"><%= t('tasks.description') %></span>
  </label>
  <textarea 
    id="description"
    name="description"
    class="textarea textarea-bordered h-24 focus-ring" 
    placeholder="<%= t('tasks.descriptionPlaceholder') %>"
  ><%= task?.description || '' %></textarea>
</div>
```

### Select Dropdown

```ejs
<div class="form-control w-full">
  <label for="status" class="label">
    <span class="label-text"><%= t('tasks.status') %></span>
  </label>
  <select 
    id="status"
    name="status" 
    class="select select-bordered w-full focus-ring"
  >
    <option value="TODO" <%= task?.status === 'TODO' ? 'selected' : '' %>>
      <%= t('tasks.status.TODO') %>
    </option>
    <option value="IN_PROGRESS" <%= task?.status === 'IN_PROGRESS' ? 'selected' : '' %>>
      <%= t('tasks.status.IN_PROGRESS') %>
    </option>
    <option value="DONE" <%= task?.status === 'DONE' ? 'selected' : '' %>>
      <%= t('tasks.status.DONE') %>
    </option>
  </select>
</div>
```

### Checkbox

```ejs
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text"><%= t('tasks.markUrgent') %></span>
    <input 
      type="checkbox" 
      name="urgent"
      class="checkbox checkbox-primary" 
      <%= task?.priority === 'URGENT' ? 'checked' : '' %>
    />
  </label>
</div>
```

### Date Input

```ejs
<div class="form-control w-full">
  <label for="dueDate" class="label">
    <span class="label-text"><%= t('tasks.dueDate') %></span>
  </label>
  <input 
    id="dueDate"
    type="date" 
    name="dueDate"
    value="<%= task?.dueDate ? task.dueDate.toISOString().split('T')[0] : '' %>"
    class="input input-bordered w-full focus-ring"
  />
</div>
```

### Complete Form

```ejs
<form 
  method="POST" 
  action="<%= formAction %>"
  class="space-y-6 glass p-8"
>
  <!-- Title -->
  <div class="form-control">
    <label for="title" class="label">
      <span class="label-text"><%= t('tasks.title') %> *</span>
    </label>
    <input 
      id="title"
      type="text" 
      name="title" 
      value="<%= task?.title || '' %>"
      class="input input-bordered w-full focus-ring" 
      required
    />
  </div>
  
  <!-- Description -->
  <div class="form-control">
    <label for="description" class="label">
      <span class="label-text"><%= t('tasks.description') %></span>
    </label>
    <textarea 
      id="description"
      name="description" 
      class="textarea textarea-bordered h-24 focus-ring"
    ><%= task?.description || '' %></textarea>
  </div>
  
  <!-- Status & Priority -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="form-control">
      <label for="status" class="label">
        <span class="label-text"><%= t('tasks.status') %></span>
      </label>
      <select id="status" name="status" class="select select-bordered focus-ring">
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
      </select>
    </div>
    
    <div class="form-control">
      <label for="priority" class="label">
        <span class="label-text"><%= t('tasks.priority') %></span>
      </label>
      <select id="priority" name="priority" class="select select-bordered focus-ring">
        <option value="LOW">LOW</option>
        <option value="MEDIUM" selected>MEDIUM</option>
        <option value="HIGH">HIGH</option>
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

## HTMX Snippets

### Load on Page Load

```ejs
<div 
  id="task-list"
  hx-get="/tasks"
  hx-trigger="load"
  hx-swap="innerHTML"
  hx-indicator=".spinner"
>
  <%- include('../partials/ui/skeleton', { type: 'list' }) %>
</div>
```

### Filter Form

```ejs
<form 
  hx-get="/tasks"
  hx-trigger="change from:select, input from:input delay:300ms"
  hx-target="#task-list-container"
  hx-push-url="true"
  class="space-y-4"
>
  <select name="status" class="select select-bordered w-full">
    <option value=""><%= t('filters.allStatuses') %></option>
    <option value="TODO">TODO</option>
    <option value="DONE">DONE</option>
  </select>
  
  <input 
    type="search" 
    name="search" 
    placeholder="<%= t('filters.search') %>"
    class="input input-bordered w-full"
  />
</form>

<div id="task-list-container">
  <!-- Filtered results -->
</div>
```

### Delete Button

```ejs
<button 
  class="btn btn-error btn-sm"
  hx-delete="/tasks/<%= task.id %>"
  hx-confirm="<%= t('tasks.confirmDelete') %>"
  hx-target="closest .task-item"
  hx-swap="outerHTML swap:1s"
>
  <%= t('common.delete') %>
</button>
```

### Infinite Scroll

```ejs
<div id="task-list">
  <% tasks.forEach(task => { %>
    <%- include('../partials/task-card', { task }) %>
  <% }) %>
</div>

<% if (hasMore) { %>
  <div 
    hx-get="/tasks?page=<%= page + 1 %>"
    hx-trigger="intersect once"
    hx-target="#task-list"
    hx-swap="beforeend"
    class="py-8"
  >
    <%- include('../partials/ui/skeleton', { type: 'list' }) %>
  </div>
<% } %>
```

### Inline Edit

```ejs
<div hx-target="this" hx-swap="outerHTML">
  <% if (editMode) { %>
    <form hx-patch="/tasks/<%= task.id %>" class="flex gap-2">
      <input 
        type="text" 
        name="title" 
        value="<%= task.title %>"
        class="input input-bordered flex-1"
      />
      <button type="submit" class="btn btn-sm btn-primary">
        <%= t('common.save') %>
      </button>
      <button 
        type="button"
        hx-get="/tasks/<%= task.id %>"
        class="btn btn-sm btn-ghost"
      >
        <%= t('common.cancel') %>
      </button>
    </form>
  <% } else { %>
    <div class="flex items-center justify-between">
      <span><%= task.title %></span>
      <button 
        hx-get="/tasks/<%= task.id %>/edit"
        class="btn btn-sm btn-ghost"
      >
        <%= t('common.edit') %>
      </button>
    </div>
  <% } %>
</div>
```

---

## Alpine.js Snippets

### Collapsible Panel

```ejs
<div x-data="{ open: false }" class="glass p-6">
  <button 
    @click="open = !open"
    class="btn btn-ghost w-full justify-between"
  >
    <span><%= t('filters.title') %></span>
    <svg 
      :class="open ? 'rotate-180' : ''"
      class="w-5 h-5 transition-transform"
    >
      <!-- chevron icon -->
    </svg>
  </button>
  
  <div x-show="open" x-collapse x-cloak class="pt-4">
    <!-- Collapsible content -->
  </div>
</div>
```

### Modal

```ejs
<div x-data="{ open: false }">
  <button @click="open = true" class="btn btn-primary">
    <%= t('common.openModal') %>
  </button>
  
  <div 
    x-show="open"
    x-cloak
    @click.self="open = false"
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
  >
    <div 
      @click.away="open = false"
      x-trap="open"
      class="glass-heavy p-8 max-w-lg w-full"
      role="dialog"
      aria-modal="true"
    >
      <h2 class="text-2xl font-bold mb-4"><%= t('modal.title') %></h2>
      
      <!-- Modal content -->
      
      <button @click="open = false" class="btn btn-ghost">
        <%= t('common.close') %>
      </button>
    </div>
  </div>
</div>
```

### Tabs

```ejs
<div x-data="{ activeTab: 'all' }" class="glass p-6">
  <div class="tabs tabs-boxed mb-4">
    <button 
      @click="activeTab = 'all'"
      :class="activeTab === 'all' ? 'tab-active' : ''"
      class="tab"
    >
      <%= t('tasks.all') %>
    </button>
    <button 
      @click="activeTab = 'todo'"
      :class="activeTab === 'todo' ? 'tab-active' : ''"
      class="tab"
    >
      <%= t('tasks.todo') %>
    </button>
  </div>
  
  <div x-show="activeTab === 'all'" x-cloak>
    <!-- All tasks -->
  </div>
  <div x-show="activeTab === 'todo'" x-cloak>
    <!-- TODO tasks -->
  </div>
</div>
```

### Dropdown

```ejs
<div x-data="{ open: false }" @click.away="open = false" class="relative">
  <button @click="open = !open" class="btn btn-ghost">
    <%= t('common.options') %>
  </button>
  
  <div 
    x-show="open"
    x-cloak
    x-transition
    class="absolute right-0 mt-2 glass p-2 rounded-box w-52 z-30"
  >
    <a href="/tasks/<%= task.id %>/edit" class="btn btn-ghost btn-sm w-full justify-start">
      <%= t('common.edit') %>
    </a>
    <button class="btn btn-ghost btn-sm btn-error w-full justify-start">
      <%= t('common.delete') %>
    </button>
  </div>
</div>
```

---

## Accessibility Snippets

### Skip Link

```ejs
<a href="#main-content" class="skip-link">
  <%= t('a11y.skipToContent') %>
</a>

<main id="main-content" tabindex="-1">
  <!-- Main content -->
</main>
```

### Form with Error

```ejs
<div class="form-control">
  <label for="email" class="label">
    <span class="label-text"><%= t('auth.email') %> *</span>
  </label>
  <input 
    id="email"
    type="email" 
    name="email"
    class="input input-bordered <%= error ? 'input-error' : '' %>"
    required
    aria-required="true"
    aria-invalid="<%= error ? 'true' : 'false' %>"
    aria-describedby="email-error"
  />
  <% if (error) { %>
    <span id="email-error" class="label-text-alt text-error" role="alert">
      <%= error.message %>
    </span>
  <% } %>
</div>
```

### Loading Indicator

```ejs
<div role="status" aria-live="polite">
  <span class="sr-only"><%= t('a11y.loading') %></span>
  <svg aria-hidden="true" class="animate-spin w-6 h-6">
    <!-- Spinner icon -->
  </svg>
</div>
```

### Breadcrumbs

```ejs
<nav aria-label="<%= t('nav.breadcrumbs') %>">
  <ol class="breadcrumbs">
    <li><a href="/"><%= t('nav.home') %></a></li>
    <li><a href="/tasks"><%= t('nav.tasks') %></a></li>
    <li aria-current="page"><%= task.title %></li>
  </ol>
</nav>
```

---

## Utility Snippets

### Conditional Classes

```ejs
<div class="<%= task.priority === 'HIGH' ? 'border-error' : 'border-base-300' %> border-2 p-4">
  <%= task.title %>
</div>
```

### Loop with Index

```ejs
<% tasks.forEach((task, index) => { %>
  <div class="<%= index % 2 === 0 ? 'bg-base-100' : 'bg-base-200' %> p-4">
    <%= task.title %>
  </div>
<% }) %>
```

### Conditional Rendering

```ejs
<% if (tasks.length > 0) { %>
  <div class="space-y-4">
    <% tasks.forEach(task => { %>
      <%- include('../partials/task-card', { task }) %>
    <% }) %>
  </div>
<% } else { %>
  <%- include('../partials/empty-state') %>
<% } %>
```

### Date Formatting

```ejs
<%
const formatDate = (date) => {
  return new Intl.DateTimeFormat(locale, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date(date));
};
%>

<time datetime="<%= task.dueDate.toISOString() %>">
  <%= formatDate(task.dueDate) %>
</time>
```

### Truncate Text

```ejs
<%
const truncate = (text, length = 100) => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};
%>

<p class="text-sm"><%= truncate(task.description, 150) %></p>
```

---

## Quick Copy-Paste

### Task Card

```ejs
<div class="glass-hover p-6" data-task-id="<%= task.id %>">
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-lg font-semibold"><%= task.title %></h3>
    <%- include('../partials/ui/badge', { 
      type: task.priority, 
      text: t(`tasks.priority.${task.priority}`) 
    }) %>
  </div>
  <p class="text-sm text-neutral/70"><%= task.description %></p>
  <div class="flex justify-between items-center mt-4">
    <%- include('../partials/ui/avatar', { user: task.assignee }) %>
    <div class="flex gap-2">
      <a href="/tasks/<%= task.id %>/edit" class="btn btn-sm btn-ghost">Edit</a>
      <button 
        hx-delete="/tasks/<%= task.id %>"
        class="btn btn-sm btn-error"
      >Delete</button>
    </div>
  </div>
</div>
```

### Filter Sidebar

```ejs
<aside 
  x-data="{ open: true }"
  class="glass-light p-6"
>
  <button @click="open = !open" class="btn btn-ghost w-full mb-4">
    Filters
  </button>
  <form 
    x-show="open"
    hx-get="/tasks"
    hx-target="#task-list"
    class="space-y-4"
  >
    <select name="status" class="select select-bordered w-full">
      <option value="">All</option>
      <option value="TODO">TODO</option>
    </select>
  </form>
</aside>
```

---

## Tips

1. **Always use i18n keys** - Never hardcode text
2. **Include ARIA attributes** - For accessibility
3. **Add HTMX indicators** - Show loading states
4. **Use semantic HTML** - `<nav>`, `<main>`, `<article>`
5. **Apply focus rings** - `focus-ring` utility class
6. **Test keyboard navigation** - Tab through all elements
7. **Validate forms** - Client and server-side
8. **Handle empty states** - Show helpful messages
9. **Progressive enhancement** - Works without JS
10. **Mobile-first responsive** - Test on small screens
