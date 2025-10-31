# ADR-003: Progressive Enhancement Strategy

**Status**: Accepted  
**Date**: 2025-10-31  
**Decision Makers**: Development Team  

## Context

Progressive enhancement is a core principle of our SSR architecture. We need a clear strategy for implementing functionality in layers, ensuring the application works for all users while providing enhanced experiences where possible.

## Decision

**We will implement a 3-layer progressive enhancement strategy:**

```
Layer 1: Core HTML + Server Rendering (REQUIRED)
         ↓ Works for everyone, always
Layer 2: HTMX Enhancements (PROGRESSIVE)
         ↓ Adds partial updates, better UX
Layer 3: Alpine.js Enhancements (PROGRESSIVE)
         ↓ Adds local interactivity
```

## Layer 1: Core HTML (Foundation)

### Principle
**Every feature MUST work with plain HTML forms and standard HTTP methods.**

### Implementation Rules

#### ✅ DO: Use Semantic HTML
```html
<!-- GOOD: Works without JavaScript -->
<form method="POST" action="/tasks">
  <label for="title">Task Title</label>
  <input type="text" id="title" name="title" required>
  
  <label for="status">Status</label>
  <select id="status" name="status">
    <option value="TODO">To Do</option>
    <option value="IN_PROGRESS">In Progress</option>
    <option value="DONE">Done</option>
  </select>
  
  <button type="submit">Create Task</button>
</form>
```

#### ❌ DON'T: Rely on JavaScript for Core Functionality
```html
<!-- BAD: Doesn't work without JavaScript -->
<div onclick="createTask()">Create Task</div>
<script>
  function createTask() {
    // XHR logic here
  }
</script>
```

### HTTP Methods & REST
```
GET    /tasks              → List tasks
GET    /tasks/new          → Show create form
POST   /tasks              → Create task (redirect to /tasks)
GET    /tasks/:id          → Show task detail
GET    /tasks/:id/edit     → Show edit form
POST   /tasks/:id          → Update task (redirect to /tasks/:id)
POST   /tasks/:id/delete   → Delete task (redirect to /tasks)
```

**Note**: Using POST for updates/deletes (not PUT/DELETE) because HTML forms only support GET/POST.

### Server Responses
```typescript
// Controller pattern for Layer 1
async create(req: Request, res: Response): Promise<void> {
  const task = await this.taskService.createTask(req.body);
  
  // Flash message for feedback
  req.flash('success', 'Task created successfully');
  
  // Redirect to prevent duplicate submissions
  res.redirect('/tasks');
}
```

## Layer 2: HTMX Enhancements

### Principle
**Add AJAX-style interactions WITHOUT page reloads, gracefully degrading to Layer 1.**

### Implementation Rules

#### ✅ DO: Enhance Existing Forms
```html
<!-- Enhances Layer 1 form with HTMX -->
<form method="POST" action="/tasks"
      hx-post="/tasks"
      hx-target="#task-list"
      hx-swap="afterbegin">
  <input type="text" name="title" required>
  <button type="submit">Create Task</button>
</form>

<!-- Without HTMX: Form submits normally, page reloads -->
<!-- With HTMX: AJAX request, partial update, no reload -->
```

#### Server-Side HTMX Detection
```typescript
// Middleware to detect HTMX requests
function isHtmxRequest(req: Request): boolean {
  return req.headers['hx-request'] === 'true';
}

// Controller handles both Layer 1 and Layer 2
async create(req: Request, res: Response): Promise<void> {
  const task = await this.taskService.createTask(req.body);
  
  if (isHtmxRequest(req)) {
    // Layer 2: Return partial HTML
    res.render('partials/tasks/task-item', { task });
  } else {
    // Layer 1: Full page redirect
    req.flash('success', 'Task created successfully');
    res.redirect('/tasks');
  }
}
```

### HTMX Patterns

#### Pattern 1: Click to Edit
```html
<!-- View Mode -->
<div id="task-<%= task.id %>">
  <h3><%= task.title %></h3>
  <button hx-get="/tasks/<%= task.id %>/edit"
          hx-target="#task-<%= task.id %>"
          hx-swap="outerHTML">
    Edit
  </button>
</div>

<!-- Edit Mode (returned by server) -->
<form id="task-<%= task.id %>"
      hx-post="/tasks/<%= task.id %>"
      hx-target="#task-<%= task.id %>"
      hx-swap="outerHTML">
  <input type="text" name="title" value="<%= task.title %>">
  <button type="submit">Save</button>
  <button hx-get="/tasks/<%= task.id %>"
          hx-target="#task-<%= task.id %>"
          hx-swap="outerHTML">
    Cancel
  </button>
</form>
```

#### Pattern 2: Infinite Scroll
```html
<div id="task-list">
  <% tasks.forEach(task => { %>
    <%- include('partials/tasks/task-item', { task }) %>
  <% }) %>
</div>

<% if (hasMore) { %>
  <button hx-get="/tasks?page=<%= nextPage %>"
          hx-target="#task-list"
          hx-swap="beforeend"
          hx-trigger="revealed">
    Load More
  </button>
<% } %>
```

#### Pattern 3: Active Search
```html
<input type="search" name="query"
       hx-get="/tasks/search"
       hx-trigger="keyup changed delay:300ms"
       hx-target="#search-results"
       placeholder="Search tasks...">

<div id="search-results"></div>
```

### HTMX Extensions
We'll use these official extensions:

1. **loading-states**: Show spinners during requests
```html
<button hx-post="/tasks"
        hx-ext="loading-states">
  <span data-loading>Creating...</span>
  <span data-ready>Create Task</span>
</button>
```

2. **response-targets**: Different targets for success/error
```html
<form hx-post="/tasks"
      hx-target="#task-list"
      hx-target-error="#error-message"
      hx-ext="response-targets">
  <!-- form fields -->
</form>
```

## Layer 3: Alpine.js Enhancements

### Principle
**Add client-side interactivity for UI components that don't require server interaction.**

### Implementation Rules

#### ✅ DO: Use for Local UI State
```html
<!-- Theme Switcher (no server needed) -->
<div x-data="{ theme: localStorage.getItem('theme') || 'light' }">
  <button @click="theme = 'light'; localStorage.setItem('theme', 'light')">
    Light
  </button>
  <button @click="theme = 'dark'; localStorage.setItem('theme', 'dark')">
    Dark
  </button>
  <div x-show="theme === 'light'">☀️</div>
  <div x-show="theme === 'dark'">🌙</div>
</div>
```

#### Alpine.js Use Cases

1. **Modals**
```html
<div x-data="{ open: false }">
  <button @click="open = true">Open Modal</button>
  
  <div x-show="open"
       x-transition
       @click.away="open = false"
       class="modal">
    <div class="modal-content">
      <h2>Confirm Delete</h2>
      <p>Are you sure?</p>
      <form method="POST" action="/tasks/<%= task.id %>/delete">
        <button type="submit">Yes, Delete</button>
        <button type="button" @click="open = false">Cancel</button>
      </form>
    </div>
  </div>
</div>
```

2. **Dropdowns**
```html
<div x-data="{ open: false }">
  <button @click="open = !open">
    Filter Tasks
  </button>
  
  <div x-show="open" @click.away="open = false">
    <form method="GET" action="/tasks">
      <label>
        <input type="checkbox" name="status" value="TODO">
        To Do
      </label>
      <button type="submit">Apply</button>
    </form>
  </div>
</div>
```

3. **Client-Side Validation**
```html
<form method="POST" action="/tasks"
      x-data="{ title: '', errors: {} }"
      @submit="if (title.length < 3) { 
        errors.title = 'Title must be at least 3 characters'; 
        $event.preventDefault(); 
      }">
  <input type="text" 
         name="title"
         x-model="title"
         :class="{ 'border-red-500': errors.title }">
  <p x-show="errors.title" x-text="errors.title" class="text-red-500"></p>
  <button type="submit">Create</button>
</form>
```

## Integration Patterns

### HTMX + Alpine.js Together
```html
<!-- Filter UI (Alpine) + AJAX Loading (HTMX) -->
<div x-data="{ filters: { status: 'ALL', priority: 'ALL' } }">
  <!-- Filter Controls -->
  <select x-model="filters.status">
    <option value="ALL">All Statuses</option>
    <option value="TODO">To Do</option>
    <option value="IN_PROGRESS">In Progress</option>
    <option value="DONE">Done</option>
  </select>
  
  <!-- Apply Filters with HTMX -->
  <button hx-get="/tasks"
          hx-include="[x-model]"
          hx-target="#task-list"
          @click="console.log('Filters:', filters)">
    Apply Filters
  </button>
</div>

<div id="task-list">
  <!-- Tasks loaded here -->
</div>
```

## Testing Strategy

### Layer 1: Integration Tests
```typescript
// Test without JavaScript
describe('Task Creation (Layer 1)', () => {
  it('creates task with standard form submission', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task', status: 'TODO' })
      .expect(302); // Redirect
    
    expect(response.headers.location).toBe('/tasks');
  });
});
```

### Layer 2: E2E Tests (HTMX)
```typescript
// Test with JavaScript enabled
test('creates task without page reload', async ({ page }) => {
  await page.goto('/tasks');
  await page.fill('input[name="title"]', 'Test Task');
  await page.click('button[type="submit"]');
  
  // Wait for HTMX to update DOM
  await page.waitForSelector('#task-list .task-item:first-child');
  
  // Verify no page reload
  expect(page.url()).toBe('/tasks'); // Same URL
});
```

### Layer 3: E2E Tests (Alpine.js)
```typescript
test('modal opens and closes', async ({ page }) => {
  await page.goto('/tasks');
  await page.click('button:has-text("Delete")');
  
  // Modal should be visible
  await expect(page.locator('.modal')).toBeVisible();
  
  // Click outside modal
  await page.click('.modal-overlay');
  
  // Modal should close
  await expect(page.locator('.modal')).not.toBeVisible();
});
```

## Accessibility Considerations

### Keyboard Navigation
- All interactive elements must be keyboard-accessible
- Use proper focus management with HTMX
```html
<button hx-post="/tasks"
        hx-swap="outerHTML"
        hx-on:htmx:after-swap="$el.focus()">
  Create Task
</button>
```

### Screen Readers
- Use ARIA live regions for dynamic updates
```html
<div hx-get="/tasks"
     hx-target="#task-list"
     aria-live="polite"
     aria-atomic="true">
  <div id="task-list"></div>
</div>
```

### Reduced Motion
```html
<!-- Respect prefers-reduced-motion -->
<div x-show="open"
     x-transition:enter="transition ease-out duration-300"
     x-transition:enter-start="opacity-0"
     x-transition:enter-end="opacity-100"
     @media(prefers-reduced-motion: reduce) {
       transition: none !important;
     }>
  <!-- content -->
</div>
```

## Consequences

### Positive
- **Universal Access**: Works for all users regardless of capabilities
- **Resilient**: Degrades gracefully when JavaScript fails
- **SEO-Friendly**: All content accessible to crawlers
- **Performance**: Core functionality loads instantly

### Negative
- **More Server Logic**: Need to handle both HTMX and non-HTMX requests
- **Testing Complexity**: Must test each layer independently
- **Development Time**: Requires thinking in layers

### Risk Mitigation
- Create helper functions for HTMX detection
- Build reusable partial templates
- Comprehensive test coverage for each layer

## Validation Criteria

- [ ] All features work with JavaScript disabled (Layer 1)
- [ ] HTMX enhancements provide seamless UX (Layer 2)
- [ ] Alpine.js components accessible and performant (Layer 3)
- [ ] Lighthouse Accessibility score = 100
- [ ] Keyboard navigation works for all features

## References
- [Progressive Enhancement MDN](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)
- [HTMX Examples](https://htmx.org/examples/)
- [Alpine.js Patterns](https://alpinejs.dev/advanced/patterns)
- [GOV.UK Accessibility](https://www.gov.uk/service-manual/technology/using-progressive-enhancement)
