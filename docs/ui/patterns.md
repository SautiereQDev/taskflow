# HTMX + Alpine.js Patterns

Common interaction patterns for TaskFlow using HTMX 1.9+ and Alpine.js 3.x.

## Table of Contents

- [HTMX Patterns](#htmx-patterns)
- [Alpine.js Patterns](#alpinejs-patterns)
- [Combined Patterns](#combined-patterns)
- [Real-World Examples](#real-world-examples)

---

## HTMX Patterns

### 1. Partial Page Updates

```html
<!-- Replace entire task list -->
<div 
  id="task-list"
  hx-get="/tasks"
  hx-trigger="load"
  hx-swap="innerHTML"
  hx-indicator=".spinner"
>
  <!-- Tasks loaded here -->
</div>
```

### 2. Filtering with Query Params

```html
<form 
  hx-get="/tasks"
  hx-trigger="change from:select, input from:input delay:300ms"
  hx-target="#task-list-container"
  hx-push-url="true"
>
  <select name="status">
    <option value=""><%= t('filters.allStatuses') %></option>
    <option value="TODO">TODO</option>
    <option value="DONE">DONE</option>
  </select>
  
  <input 
    type="search" 
    name="search" 
    placeholder="<%= t('filters.search') %>"
  />
</form>

<div id="task-list-container">
  <!-- Filtered tasks appear here -->
</div>
```

**Key features:**
- `hx-trigger="change from:select"`: Trigger on select change
- `hx-trigger="input from:input delay:300ms"`: Debounced search input
- `hx-push-url="true"`: Updates browser URL (shareable filters)

### 3. Inline Editing

```html
<div hx-target="this" hx-swap="outerHTML">
  <div>
    <span><%= task.title %></span>
    <button 
      hx-get="/tasks/<%= task.id %>/edit"
      class="btn btn-sm btn-ghost"
    >
      <%= t('common.edit') %>
    </button>
  </div>
</div>
```

**Edit form returned by server:**

```html
<div hx-target="this" hx-swap="outerHTML">
  <form hx-patch="/tasks/<%= task.id %>">
    <input type="text" name="title" value="<%= task.title %>" />
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
</div>
```

### 4. Delete with Confirmation

```html
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

**Options:**
- `hx-confirm`: Built-in browser confirmation dialog
- `hx-target="closest .task-item"`: Target nearest parent with class
- `hx-swap="outerHTML swap:1s"`: Smooth 1-second fade out

### 5. Infinite Scroll / Load More

```html
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
  >
    <%- include('../partials/ui/skeleton', { type: 'list' }) %>
  </div>
<% } %>
```

**Key features:**
- `hx-trigger="intersect once"`: Triggers when scrolled into view (once only)
- `hx-swap="beforeend"`: Appends to end of list
- Skeleton shows while loading

### 6. Form Validation (Server-Side)

```html
<form 
  hx-post="/tasks"
  hx-target="#form-errors"
  hx-swap="innerHTML"
>
  <div id="form-errors"></div>
  
  <input type="text" name="title" class="input input-bordered" />
  <button type="submit" class="btn btn-primary">
    <%= t('common.save') %>
  </button>
</form>
```

**Server returns errors:**

```html
<div class="alert alert-error">
  <ul>
    <% errors.forEach(error => { %>
      <li><%= error.message %></li>
    <% }) %>
  </ul>
</div>
```

### 7. Polling for Updates

```html
<div 
  hx-get="/tasks/stats"
  hx-trigger="every 30s"
  hx-swap="innerHTML"
>
  <!-- Stats updated every 30 seconds -->
  <div class="stats glass">
    <div class="stat">
      <div class="stat-value"><%= stats.total %></div>
    </div>
  </div>
</div>
```

### 8. Optimistic UI Updates

```html
<button 
  class="btn btn-success"
  hx-post="/tasks/<%= task.id %>/complete"
  hx-target="closest .task-card"
  hx-swap="outerHTML"
  onclick="this.classList.add('loading')"
>
  <%= t('tasks.markComplete') %>
</button>
```

---

## Alpine.js Patterns

### 1. Collapsible Panel

```html
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
      <!-- chevron down icon -->
    </svg>
  </button>
  
  <div 
    x-show="open"
    x-collapse
    x-cloak
  >
    <div class="pt-4 space-y-4">
      <!-- Filter content -->
    </div>
  </div>
</div>
```

### 2. Persistent State (localStorage)

```javascript
// In Alpine component
Alpine.data('filtersPanel', () => ({
  open: Alpine.$persist(true).as('filtersPanel_open'),
  filters: Alpine.$persist({
    status: '',
    priority: '',
    assignee: ''
  }).as('taskFilters'),
  
  applyFilters() {
    // HTMX will handle the request
    document.getElementById('filter-form').requestSubmit();
  }
}));
```

```html
<div x-data="filtersPanel" class="glass-light p-6">
  <button @click="open = !open" class="btn btn-ghost">
    <%= t('filters.title') %>
  </button>
  
  <form 
    x-show="open"
    id="filter-form"
    hx-get="/tasks"
    hx-target="#task-list"
  >
    <select name="status" x-model="filters.status">
      <option value="">All</option>
      <option value="TODO">TODO</option>
    </select>
  </form>
</div>
```

### 3. Modal Dialog

```html
<div x-data="{ open: false }">
  <!-- Trigger -->
  <button @click="open = true" class="btn btn-primary">
    <%= t('tasks.new') %>
  </button>
  
  <!-- Modal overlay -->
  <div 
    x-show="open"
    x-cloak
    @click.self="open = false"
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
  >
    <!-- Modal content -->
    <div 
      @click.away="open = false"
      x-trap="open"
      class="glass-heavy p-8 max-w-lg w-full"
      role="dialog"
      aria-modal="true"
    >
      <h2 class="text-2xl font-bold mb-4"><%= t('tasks.create') %></h2>
      
      <form hx-post="/tasks" @htmx:after-request="open = false">
        <!-- Form fields -->
        <button type="submit" class="btn btn-primary">
          <%= t('common.save') %>
        </button>
      </form>
      
      <button @click="open = false" class="btn btn-ghost">
        <%= t('common.cancel') %>
      </button>
    </div>
  </div>
</div>
```

**Key features:**
- `x-trap="open"`: Focus trap for accessibility
- `@click.away`: Close when clicking outside
- `@click.self`: Close when clicking overlay (not modal content)
- `@htmx:after-request`: Close after HTMX completes

### 4. Tabs

```html
<div x-data="{ activeTab: 'all' }" class="glass p-6">
  <!-- Tab buttons -->
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
    <button 
      @click="activeTab = 'done'"
      :class="activeTab === 'done' ? 'tab-active' : ''"
      class="tab"
    >
      <%= t('tasks.done') %>
    </button>
  </div>
  
  <!-- Tab panels -->
  <div x-show="activeTab === 'all'" x-cloak>
    <%- include('../partials/tasks/all-tasks') %>
  </div>
  <div x-show="activeTab === 'todo'" x-cloak>
    <%- include('../partials/tasks/todo-tasks') %>
  </div>
  <div x-show="activeTab === 'done'" x-cloak>
    <%- include('../partials/tasks/done-tasks') %>
  </div>
</div>
```

### 5. Lazy Loading with Intersection Observer

```html
<div 
  x-data="{ visible: false }"
  x-intersect:enter="visible = true"
>
  <div x-show="!visible">
    <%- include('../partials/ui/skeleton', { type: 'card' }) %>
  </div>
  
  <div 
    x-show="visible"
    hx-get="/tasks/<%= task.id %>/details"
    hx-trigger="load"
  >
    <!-- Details loaded when scrolled into view -->
  </div>
</div>
```

### 6. Dropdown Menu

```html
<div x-data="{ open: false }" @click.away="open = false" class="relative">
  <button @click="open = !open" class="btn btn-ghost">
    <%= t('common.options') %>
    <svg><!-- chevron down --></svg>
  </button>
  
  <div 
    x-show="open"
    x-cloak
    x-transition
    class="absolute right-0 mt-2 glass p-2 rounded-box w-52 z-30"
    role="menu"
  >
    <a href="/tasks/<%= task.id %>/edit" class="btn btn-ghost btn-sm w-full justify-start">
      <%= t('common.edit') %>
    </a>
    <button 
      hx-delete="/tasks/<%= task.id %>"
      class="btn btn-ghost btn-sm btn-error w-full justify-start"
    >
      <%= t('common.delete') %>
    </button>
  </div>
</div>
```

---

## Combined Patterns

### 1. Filters with Persistence + HTMX

```javascript
// public/js/alpine-components.js
Alpine.data('taskFilters', () => ({
  status: Alpine.$persist('').as('filter_status'),
  priority: Alpine.$persist('').as('filter_priority'),
  search: Alpine.$persist('').as('filter_search'),
  
  init() {
    // Apply saved filters on page load
    this.$nextTick(() => {
      if (this.status || this.priority || this.search) {
        this.$refs.filterForm.requestSubmit();
      }
    });
  },
  
  clearFilters() {
    this.status = '';
    this.priority = '';
    this.search = '';
    this.$refs.filterForm.requestSubmit();
  }
}));
```

```html
<form 
  x-data="taskFilters"
  x-ref="filterForm"
  hx-get="/tasks"
  hx-trigger="submit, change from:select, input from:input delay:300ms"
  hx-target="#task-list-container"
  hx-push-url="true"
  class="glass-light p-6 space-y-4"
>
  <select name="status" x-model="status" class="select select-bordered w-full">
    <option value=""><%= t('filters.allStatuses') %></option>
    <option value="TODO">TODO</option>
    <option value="DONE">DONE</option>
  </select>
  
  <input 
    type="search" 
    name="search" 
    x-model="search"
    placeholder="<%= t('filters.search') %>"
    class="input input-bordered w-full"
  />
  
  <button 
    type="button" 
    @click="clearFilters()"
    class="btn btn-ghost btn-sm w-full"
  >
    <%= t('filters.clear') %>
  </button>
</form>
```

### 2. Optimistic Delete with Confirmation

```html
<div 
  x-data="{ deleting: false }"
  :class="deleting ? 'opacity-50' : ''"
  class="glass p-6 transition-opacity"
>
  <h3><%= task.title %></h3>
  
  <button 
    @click="if(confirm('<%= t('tasks.confirmDelete') %>')) { deleting = true }"
    hx-delete="/tasks/<%= task.id %>"
    hx-target="closest div"
    hx-swap="outerHTML swap:1s"
    class="btn btn-error btn-sm"
  >
    <%= t('common.delete') %>
  </button>
</div>
```

### 3. Live Search with Skeleton

```html
<div x-data="{ searching: false }">
  <input 
    type="search"
    @input="searching = true"
    hx-get="/tasks/search"
    hx-trigger="input changed delay:300ms"
    hx-target="#search-results"
    hx-swap="innerHTML"
    @htmx:after-request="searching = false"
    class="input input-bordered w-full"
  />
  
  <div id="search-results">
    <div x-show="searching" x-cloak>
      <%- include('../partials/ui/skeleton', { type: 'list' }) %>
    </div>
    
    <div x-show="!searching">
      <!-- Search results appear here -->
    </div>
  </div>
</div>
```

### 4. Multi-Step Form

```html
<div x-data="{ step: 1 }" class="glass p-8">
  <!-- Progress indicator -->
  <div class="mb-8">
    <ul class="steps w-full">
      <li :class="step >= 1 ? 'step-primary' : ''" class="step">
        <%= t('tasks.create.step1') %>
      </li>
      <li :class="step >= 2 ? 'step-primary' : ''" class="step">
        <%= t('tasks.create.step2') %>
      </li>
      <li :class="step >= 3 ? 'step-primary' : ''" class="step">
        <%= t('tasks.create.step3') %>
      </li>
    </ul>
  </div>
  
  <form hx-post="/tasks" hx-swap="none">
    <!-- Step 1: Basic info -->
    <div x-show="step === 1" x-cloak>
      <input type="text" name="title" placeholder="<%= t('tasks.title') %>" />
      <button type="button" @click="step = 2" class="btn btn-primary">
        <%= t('common.next') %>
      </button>
    </div>
    
    <!-- Step 2: Details -->
    <div x-show="step === 2" x-cloak>
      <textarea name="description"></textarea>
      <button type="button" @click="step = 1" class="btn btn-ghost">
        <%= t('common.back') %>
      </button>
      <button type="button" @click="step = 3" class="btn btn-primary">
        <%= t('common.next') %>
      </button>
    </div>
    
    <!-- Step 3: Confirm -->
    <div x-show="step === 3" x-cloak>
      <button type="button" @click="step = 2" class="btn btn-ghost">
        <%= t('common.back') %>
      </button>
      <button type="submit" class="btn btn-primary">
        <%= t('common.save') %>
      </button>
    </div>
  </form>
</div>
```

---

## Real-World Examples

### Task List with All Features

```html
<!-- Filters panel with persistence -->
<aside 
  x-data="filtersPanel"
  class="glass-light p-6"
>
  <button @click="open = !open" class="btn btn-ghost w-full">
    <%= t('filters.title') %>
  </button>
  
  <form 
    x-show="open"
    x-collapse
    hx-get="/tasks"
    hx-trigger="change from:select, input from:input delay:300ms"
    hx-target="#task-list"
    hx-push-url="true"
    class="space-y-4 mt-4"
  >
    <select name="status" x-model="filters.status" class="select select-bordered w-full">
      <option value=""><%= t('filters.allStatuses') %></option>
      <option value="TODO">TODO</option>
    </select>
    
    <input 
      type="search" 
      name="search"
      x-model="filters.search"
      placeholder="<%= t('filters.search') %>"
      class="input input-bordered w-full"
    />
  </form>
</aside>

<!-- Task list with loading state -->
<main class="flex-1">
  <div 
    id="task-list"
    hx-get="/tasks"
    hx-trigger="load"
    hx-indicator=".list-spinner"
  >
    <div class="htmx-indicator list-spinner text-center py-12">
      <%- include('../partials/ui/skeleton', { type: 'list' }) %>
    </div>
  </div>
</main>
```

---

## Best Practices

### HTMX

1. **Use `hx-indicator`** for loading states
2. **Add `hx-push-url`** for bookmarkable filters
3. **Debounce inputs** with `delay:300ms`
4. **Target specific elements** with `hx-target`
5. **Swap strategically** (`innerHTML`, `outerHTML`, `beforeend`)

### Alpine.js

1. **Keep components small** and focused
2. **Use `x-cloak`** to prevent FOUC
3. **Persist important state** with `$persist`
4. **Trap focus in modals** with `x-trap`
5. **Clean up listeners** in `destroy()` lifecycle hook

### Combined

1. **HTMX for data**, Alpine for UI state
2. **Server returns HTML**, Alpine enhances interactivity
3. **Progressive enhancement**: Works without JS
4. **Use HTMX events** in Alpine (`@htmx:after-request`)
5. **Avoid duplication**: Don't manage same state in both

## Anti-Patterns

❌ **Don't** manage data in Alpine that should be fetched  
✅ **Do** use HTMX to fetch, Alpine to toggle UI

❌ **Don't** nest glass effects (causes blur stacking)  
✅ **Do** use single glass layer per component

❌ **Don't** forget loading indicators  
✅ **Do** always show feedback during async operations

❌ **Don't** hardcode text  
✅ **Do** use i18n keys

❌ **Don't** ignore keyboard navigation  
✅ **Do** test with Tab and Enter keys
