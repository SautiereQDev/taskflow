# ADR-006: HTMX Conventions & Patterns

**Status**: Accepted  
**Date**: 2025-10-31  
**Decision Makers**: Development Team  

## Context

HTMX is central to our progressive enhancement strategy. To ensure consistency, maintainability, and best practices across the codebase, we need standardized conventions and patterns.

## Decision

**We will follow strict HTMX conventions covering naming, attributes, server responses, error handling, and accessibility.**

## Core Principles

### 1. Progressive Enhancement First
```html
<!-- ✅ GOOD: Works without HTMX -->
<form method="POST" action="/tasks" 
      hx-post="/tasks" 
      hx-target="#task-list" 
      hx-swap="afterbegin">
  <!-- form fields -->
</form>

<!-- ❌ BAD: Requires HTMX -->
<div hx-post="/tasks" hx-target="#task-list">
  <!-- No fallback -->
</div>
```

**Rule**: Every HTMX-enhanced element MUST have a working HTML fallback.

### 2. Server Renders HTML
```typescript
// ✅ GOOD: Return HTML
res.render('partials/tasks/task-item', { task });

// ❌ BAD: Return JSON
res.json({ task });
```

**Rule**: HTMX endpoints return HTML fragments, never JSON.

### 3. Semantic HTML IDs
```html
<!-- ✅ GOOD: Descriptive IDs -->
<div id="task-list"></div>
<div id="task-123"></div>
<div id="task-filters"></div>

<!-- ❌ BAD: Generic IDs -->
<div id="container"></div>
<div id="item-1"></div>
```

**Rule**: Target IDs must clearly describe content and purpose.

## HTMX Attribute Conventions

### Request Attributes

#### `hx-get` / `hx-post` / `hx-put` / `hx-delete`
```html
<!-- GET: Idempotent reads -->
<button hx-get="/tasks/123" hx-target="#task-detail">
  View Details
</button>

<!-- POST: Create or non-idempotent actions -->
<form hx-post="/tasks" hx-target="#task-list">
  <!-- fields -->
</form>

<!-- DELETE: Destructive actions -->
<button hx-delete="/tasks/123" 
        hx-target="#task-123" 
        hx-swap="outerHTML"
        hx-confirm="Are you sure?">
  Delete
</button>
```

**Convention**:
- `hx-get`: Read operations, no side effects
- `hx-post`: Create or modify operations
- `hx-delete`: Destructive operations (include `hx-confirm`)

#### `hx-target`
```html
<!-- ✅ GOOD: Specific ID selector -->
<button hx-get="/tasks" hx-target="#task-list">Load Tasks</button>

<!-- ✅ GOOD: Closest relative -->
<button hx-delete="/tasks/123" hx-target="closest .task-item">Delete</button>

<!-- ⚠️ ACCEPTABLE: this (replace self) -->
<div hx-get="/tasks/123" hx-target="this">
  Click to load
</div>

<!-- ❌ BAD: Complex selectors -->
<button hx-target="#main > div.tasks:nth-child(2)">Bad</button>
```

**Convention**:
- Prefer `#id` selectors for clarity
- Use `closest .class` for relative targeting
- Use `this` when replacing the element itself
- Avoid complex CSS selectors

#### `hx-swap`
```html
<!-- Default: innerHTML (replace content) -->
<div hx-get="/tasks" hx-target="#task-list">

<!-- afterbegin: Prepend (e.g., newest item first) -->
<form hx-post="/tasks" 
      hx-target="#task-list" 
      hx-swap="afterbegin">

<!-- beforeend: Append (e.g., load more) -->
<button hx-get="/tasks?page=2" 
        hx-target="#task-list" 
        hx-swap="beforeend">

<!-- outerHTML: Replace entire element (e.g., inline edit) -->
<button hx-get="/tasks/123/edit" 
        hx-target="#task-123" 
        hx-swap="outerHTML">

<!-- delete: Remove element (e.g., after deletion) -->
<button hx-delete="/tasks/123" 
        hx-target="#task-123" 
        hx-swap="delete">

<!-- none: No swap (side effect only) -->
<button hx-post="/tasks/123/view" 
        hx-swap="none">
```

**Convention**:
- `innerHTML` (default): Replace content of target
- `afterbegin`: Add at top (new items, notifications)
- `beforeend`: Add at bottom (infinite scroll, load more)
- `outerHTML`: Replace entire element (inline editing)
- `delete`: Remove element (deletions)
- `none`: No DOM update (tracking, analytics)

#### `hx-trigger`
```html
<!-- Default: Natural event (click for buttons, submit for forms) -->
<button hx-get="/tasks">Load</button>

<!-- Custom event -->
<input type="search" 
       hx-get="/tasks/search" 
       hx-trigger="keyup changed delay:300ms" 
       hx-target="#search-results">

<!-- Revealed (infinite scroll) -->
<button hx-get="/tasks?page=2" 
        hx-trigger="revealed" 
        hx-target="#task-list" 
        hx-swap="beforeend">

<!-- Every N seconds (polling) -->
<div hx-get="/dashboard/stats" 
     hx-trigger="every 30s" 
     hx-target="#stats">

<!-- Load (on page load) -->
<div hx-get="/recent-tasks" 
     hx-trigger="load" 
     hx-target="#recent">

<!-- Multiple triggers -->
<button hx-post="/tasks/123/save" 
        hx-trigger="click, keyup[ctrlKey&&key=='s'] from:body">
  Save
</button>
```

**Convention**:
- Omit `hx-trigger` for default behavior
- Use `delay:300ms` for search inputs (debounce)
- Use `revealed` for infinite scroll
- Use `every Ns` sparingly (polling is expensive)
- Use `load` for initial data fetch

#### `hx-include`
```html
<!-- Include specific fields -->
<button hx-get="/tasks" 
        hx-include="[name='status'], [name='priority']">
  Filter
</button>

<!-- Include all fields in closest form -->
<button hx-post="/tasks" 
        hx-include="closest form">
  Submit
</button>

<!-- Include Alpine.js models -->
<div x-data="{ filters: { status: 'TODO' } }">
  <button hx-get="/tasks" hx-include="[x-model]">
    Apply Filters
  </button>
</div>
```

**Convention**:
- Use CSS selectors to include form fields
- Prefer `closest form` for form submissions
- Can include `[x-model]` from Alpine.js

### Response Attributes

#### `hx-push-url`
```html
<!-- Update browser URL after successful request -->
<a hx-get="/tasks/123" 
   hx-target="#main" 
   hx-push-url="true">
  View Task #123
</a>

<!-- Custom URL -->
<button hx-post="/tasks" 
        hx-target="#task-list" 
        hx-push-url="/tasks">
  Create Task
</button>
```

**Convention**:
- Use `hx-push-url="true"` for navigation
- Enables back/forward button support
- Use for major view changes only

#### `hx-select`
```html
<!-- Extract specific part of response -->
<button hx-get="/tasks/123" 
        hx-target="#task-detail" 
        hx-select="#task-content">
  Load Task
</button>

<!-- Server returns full page, but only #task-content is swapped -->
```

**Convention**:
- Use when server returns full HTML pages
- Allows code reuse (same route for full page and partial)
- Extract specific section from response

### Error Handling Attributes

#### `hx-target-error` (with response-targets extension)
```html
<form hx-post="/tasks" 
      hx-target="#task-list" 
      hx-target-error="#error-message" 
      hx-ext="response-targets">
  <!-- fields -->
</form>

<div id="error-message" role="alert"></div>
```

**Convention**:
- Always provide error target for forms
- Use `role="alert"` for accessibility
- Server returns 4xx/5xx with error HTML

### Loading State Attributes

#### `hx-indicator`
```html
<!-- Default: Show spinner in clicked element -->
<button hx-post="/tasks" hx-indicator="#spinner">
  <span>Create Task</span>
  <span id="spinner" class="htmx-indicator">⏳</span>
</button>

<!-- External spinner -->
<button hx-post="/tasks" hx-indicator="#global-spinner">
  Create Task
</button>
<div id="global-spinner" class="htmx-indicator">Loading...</div>
```

**Convention**:
- Use `.htmx-indicator` class (hidden by default)
- HTMX adds `.htmx-request` class during request
- CSS: `.htmx-indicator { display: none; } .htmx-request .htmx-indicator { display: block; }`

## Server-Side Patterns

### HTMX Detection Middleware
```typescript
// src/middleware/htmx.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function detectHtmx(req: Request, res: Response, next: NextFunction) {
  req.isHtmx = req.headers['hx-request'] === 'true';
  
  // Attach HTMX headers to request
  req.htmx = {
    request: req.headers['hx-request'] === 'true',
    trigger: req.headers['hx-trigger'] as string,
    triggerName: req.headers['hx-trigger-name'] as string,
    target: req.headers['hx-target'] as string,
    currentURL: req.headers['hx-current-url'] as string,
    promptResponse: req.headers['hx-prompt'] as string
  };
  
  next();
}
```

### Controller Pattern
```typescript
// src/controllers/TaskController.ts
export class TaskController {
  async create(req: Request, res: Response): Promise<void> {
    const task = await this.taskService.createTask(req.body);
    
    if (req.isHtmx) {
      // HTMX request: Return partial HTML
      res.render('partials/tasks/task-item', { 
        task,
        layout: false // Disable layout for partials
      });
    } else {
      // Normal request: Redirect with flash message
      req.flash('success', 'Task created successfully');
      res.redirect('/tasks');
    }
  }
  
  async delete(req: Request, res: Response): Promise<void> {
    await this.taskService.deleteTask(req.params.id);
    
    if (req.isHtmx) {
      // Return empty response (element will be removed by hx-swap="delete")
      res.status(200).send('');
    } else {
      req.flash('success', 'Task deleted successfully');
      res.redirect('/tasks');
    }
  }
}
```

### Response Headers
```typescript
// Trigger client-side event after response
res.setHeader('HX-Trigger', 'taskCreated');

// Trigger multiple events
res.setHeader('HX-Trigger', JSON.stringify({
  taskCreated: { id: task.id },
  showNotification: { message: 'Task created!' }
}));

// Redirect client
res.setHeader('HX-Redirect', '/tasks');

// Refresh page
res.setHeader('HX-Refresh', 'true');

// Update URL
res.setHeader('HX-Push-Url', '/tasks/123');
```

### Error Response Pattern
```typescript
// For HTMX requests, return HTML error message
if (req.isHtmx) {
  res.status(400).render('partials/error-message', {
    layout: false,
    message: 'Invalid task data',
    errors: validationErrors
  });
} else {
  req.flash('error', 'Invalid task data');
  res.redirect('back');
}
```

## View Patterns

### Partial Structure
```
views/
├── layouts/
│   └── main.ejs                 # Full page layout
├── pages/
│   ├── tasks/
│   │   ├── index.ejs            # Full page: task list
│   │   ├── show.ejs             # Full page: task detail
│   │   └── edit.ejs             # Full page: edit form
└── partials/
    ├── tasks/
    │   ├── task-list.ejs        # Partial: list of task items
    │   ├── task-item.ejs        # Partial: single task card
    │   ├── task-filters.ejs     # Partial: filter form
    │   └── task-form.ejs        # Partial: create/edit form
    └── ui/
        ├── error-message.ejs    # Partial: error display
        └── loading-spinner.ejs  # Partial: spinner
```

### Reusable Partial Example
```ejs
<!-- views/partials/tasks/task-item.ejs -->
<div id="task-<%= task.id %>" class="task-item glass">
  <% if (editable) { %>
    <!-- Edit mode: Form -->
    <form hx-post="/tasks/<%= task.id %>" 
          hx-target="#task-<%= task.id %>" 
          hx-swap="outerHTML"
          class="task-form">
      <input type="text" name="title" value="<%= task.title %>" required>
      <select name="status">
        <option value="TODO" <%= task.status === 'TODO' ? 'selected' : '' %>>To Do</option>
        <option value="IN_PROGRESS" <%= task.status === 'IN_PROGRESS' ? 'selected' : '' %>>In Progress</option>
        <option value="DONE" <%= task.status === 'DONE' ? 'selected' : '' %>>Done</option>
      </select>
      <button type="submit">Save</button>
      <button type="button" 
              hx-get="/tasks/<%= task.id %>" 
              hx-target="#task-<%= task.id %>" 
              hx-swap="outerHTML">
        Cancel
      </button>
    </form>
  <% } else { %>
    <!-- View mode: Display -->
    <h3><%= task.title %></h3>
    <span class="badge"><%= task.status %></span>
    <div class="task-actions">
      <button hx-get="/tasks/<%= task.id %>/edit" 
              hx-target="#task-<%= task.id %>" 
              hx-swap="outerHTML">
        Edit
      </button>
      <button hx-delete="/tasks/<%= task.id %>" 
              hx-target="#task-<%= task.id %>" 
              hx-swap="outerHTML"
              hx-confirm="Delete this task?">
        Delete
      </button>
    </div>
  <% } %>
</div>
```

## Common Patterns

### 1. Click-to-Edit
```html
<!-- View state shows content + edit button -->
<div id="task-title-123">
  <h3>Original Title</h3>
  <button hx-get="/tasks/123/edit/title" 
          hx-target="#task-title-123" 
          hx-swap="outerHTML">
    Edit
  </button>
</div>

<!-- Server returns edit form -->
<div id="task-title-123">
  <form hx-post="/tasks/123/update/title" 
        hx-target="#task-title-123" 
        hx-swap="outerHTML">
    <input type="text" name="title" value="Original Title">
    <button type="submit">Save</button>
    <button hx-get="/tasks/123/view/title" 
            hx-target="#task-title-123" 
            hx-swap="outerHTML">
      Cancel
    </button>
  </form>
</div>
```

### 2. Infinite Scroll
```html
<div id="task-list">
  <% tasks.forEach(task => { %>
    <%- include('partials/tasks/task-item', { task }) %>
  <% }) %>
</div>

<% if (hasMore) { %>
  <div hx-get="/tasks?page=<%= nextPage %>" 
       hx-trigger="revealed" 
       hx-swap="afterend">
    <div class="loading">Loading more...</div>
  </div>
<% } %>
```

### 3. Active Search
```html
<form>
  <input type="search" 
         name="q" 
         placeholder="Search tasks..." 
         hx-get="/tasks/search" 
         hx-trigger="keyup changed delay:300ms" 
         hx-target="#search-results" 
         hx-indicator="#search-spinner">
  <span id="search-spinner" class="htmx-indicator">🔍</span>
</form>

<div id="search-results"></div>
```

### 4. Dependent Selects
```html
<!-- Category select -->
<select name="category" 
        hx-get="/api/subcategories" 
        hx-target="#subcategory-select" 
        hx-include="this">
  <option value="work">Work</option>
  <option value="personal">Personal</option>
</select>

<!-- Subcategory select (populated dynamically) -->
<div id="subcategory-select">
  <select name="subcategory">
    <option>Select category first</option>
  </select>
</div>
```

### 5. Optimistic UI
```html
<form hx-post="/tasks" 
      hx-target="#task-list" 
      hx-swap="afterbegin"
      hx-on::before-request="this.querySelector('button').disabled = true">
  <input type="text" name="title" required>
  <button type="submit">Create</button>
</form>
```

## Accessibility Patterns

### ARIA Live Regions
```html
<!-- Announce updates to screen readers -->
<div hx-get="/tasks" 
     hx-target="#task-list" 
     aria-live="polite" 
     aria-atomic="false">
  <div id="task-list" role="list">
    <!-- tasks -->
  </div>
</div>
```

### Focus Management
```html
<!-- Restore focus after update -->
<button hx-post="/tasks" 
        hx-swap="outerHTML" 
        hx-on::after-swap="this.focus()">
  Create
</button>
```

### Loading Announcements
```html
<div aria-live="assertive" aria-atomic="true" class="sr-only">
  <span class="htmx-indicator">Loading content...</span>
</div>
```

## Testing HTMX

### Unit Test (Server Response)
```typescript
describe('POST /tasks (HTMX)', () => {
  it('returns task item partial for HTMX request', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('HX-Request', 'true')
      .send({ title: 'Test Task', status: 'TODO' })
      .expect(200);
    
    expect(response.text).toContain('task-item');
    expect(response.text).toContain('Test Task');
  });
  
  it('redirects for normal request', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task', status: 'TODO' })
      .expect(302);
    
    expect(response.headers.location).toBe('/tasks');
  });
});
```

### E2E Test (Browser Interaction)
```typescript
test('task creation updates list without reload', async ({ page }) => {
  await page.goto('/tasks');
  
  const initialUrl = page.url();
  
  await page.fill('input[name="title"]', 'New Task');
  await page.click('button[type="submit"]');
  
  // Wait for HTMX to update
  await page.waitForSelector('.task-item:has-text("New Task")');
  
  // Verify no page reload (URL unchanged)
  expect(page.url()).toBe(initialUrl);
  
  // Verify DOM updated
  const taskItem = page.locator('.task-item').first();
  await expect(taskItem).toContainText('New Task');
});
```

## Performance Optimization

### Debouncing
```html
<!-- Avoid excessive requests -->
<input type="search" 
       hx-get="/tasks/search" 
       hx-trigger="keyup changed delay:300ms">
```

### Request Cancellation
```html
<!-- Cancel previous request if new one starts -->
<input type="search" 
       hx-get="/tasks/search" 
       hx-trigger="keyup changed delay:300ms" 
       hx-sync="this:abort">
```

### Selective Swapping
```html
<!-- Only swap if content changed -->
<div hx-get="/dashboard/stats" 
     hx-trigger="every 30s" 
     hx-swap="innerHTML settle:200ms"
     hx-select="#stats-content">
</div>
```

## Security Considerations

### CSRF Protection
```html
<!-- Include CSRF token in all mutating requests -->
<form hx-post="/tasks">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <!-- other fields -->
</form>
```

### Rate Limiting
```typescript
// Server-side rate limiting for HTMX endpoints
import rateLimit from 'express-rate-limit';

const htmxLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // 10 requests per second
  skip: (req) => !req.isHtmx
});

app.use('/tasks', htmxLimiter);
```

### Input Validation
```typescript
// Always validate on server (client validation is UX only)
async create(req: Request, res: Response) {
  const result = TaskSchema.safeParse(req.body);
  
  if (!result.success) {
    if (req.isHtmx) {
      return res.status(400).render('partials/error-message', {
        layout: false,
        errors: result.error.errors
      });
    }
    // ... normal error handling
  }
}
```

## Consequences

### Positive
- Consistent patterns across codebase
- Better maintainability
- Improved accessibility
- Optimized performance

### Negative
- Learning curve for team
- More verbose HTML
- Need to maintain server-side routing for both HTMX and non-HTMX

### Risk Mitigation
- Comprehensive documentation (this ADR)
- Code review checklist for HTMX
- Reusable partial templates
- Helper functions for common patterns

## Validation Criteria

- [ ] All HTMX elements have fallback behavior
- [ ] Server handles both HTMX and non-HTMX requests
- [ ] ARIA attributes added for accessibility
- [ ] No client-side JSON parsing (HTML only)
- [ ] Error states handled gracefully
- [ ] Loading states visible to users

## References
- [HTMX Documentation](https://htmx.org/docs/)
- [HTMX Examples](https://htmx.org/examples/)
- [HTMX Essays (Philosophy)](https://htmx.org/essays/)
- [Hypermedia Systems Book](https://hypermedia.systems/)
