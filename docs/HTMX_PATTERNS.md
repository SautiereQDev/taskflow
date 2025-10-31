# HTMX Patterns & Best Practices

**Project**: TaskFlow  
**Purpose**: Comprehensive guide for HTMX usage patterns  
**Last Updated**: 2025-10-31  

## Table of Contents
- [Core Patterns](#core-patterns)
- [Form Patterns](#form-patterns)
- [Navigation Patterns](#navigation-patterns)
- [Interactive Patterns](#interactive-patterns)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Testing Patterns](#testing-patterns)

---

## Core Patterns

### Pattern 1: Click to Load Content

**Use Case**: Load content on demand without page reload

```html
<!-- Trigger -->
<button hx-get="/tasks/123" 
        hx-target="#task-detail" 
        hx-swap="innerHTML">
  View Details
</button>

<!-- Target -->
<div id="task-detail">
  <!-- Content will be loaded here -->
</div>
```

**Server Response** (EJS):
```ejs
<!-- Partial: views/partials/tasks/task-detail.ejs -->
<div class="task-detail">
  <h2><%= task.title %></h2>
  <p>Status: <%= task.status %></p>
  <p>Created: <%= formatDate(task.createdAt) %></p>
</div>
```

**Controller**:
```typescript
async show(req: Request, res: Response): Promise<void> {
  const task = await this.taskService.getTaskById(req.params.id);
  
  if (req.isHtmx) {
    res.render('partials/tasks/task-detail', { task, layout: false });
  } else {
    res.render('pages/tasks/show', { task });
  }
}
```

---

### Pattern 2: Click to Edit (Inline Editing)

**Use Case**: Edit content inline without navigating to separate page

```html
<!-- View Mode -->
<div id="task-<%= task.id %>" class="task-item">
  <h3><%= task.title %></h3>
  <p><%= task.description %></p>
  <button hx-get="/tasks/<%= task.id %>/edit" 
          hx-target="#task-<%= task.id %>" 
          hx-swap="outerHTML">
    Edit
  </button>
</div>
```

**Server Returns Edit Form**:
```ejs
<!-- Edit Mode -->
<form id="task-<%= task.id %>" 
      class="task-item" 
      hx-post="/tasks/<%= task.id %>" 
      hx-target="#task-<%= task.id %>" 
      hx-swap="outerHTML">
  <input type="text" name="title" value="<%= task.title %>" required>
  <textarea name="description"><%= task.description %></textarea>
  
  <button type="submit">Save</button>
  <button type="button" 
          hx-get="/tasks/<%= task.id %>" 
          hx-target="#task-<%= task.id %>" 
          hx-swap="outerHTML">
    Cancel
  </button>
</form>
```

**After Save, Return to View Mode**:
```ejs
<!-- Updated View Mode -->
<div id="task-<%= task.id %>" class="task-item">
  <h3><%= task.title %></h3>
  <p><%= task.description %></p>
  <button hx-get="/tasks/<%= task.id %>/edit" 
          hx-target="#task-<%= task.id %>" 
          hx-swap="outerHTML">
    Edit
  </button>
</div>
```

**Controller Pattern**:
```typescript
// GET /tasks/:id/edit - Return edit form
async edit(req: Request, res: Response): Promise<void> {
  const task = await this.taskService.getTaskById(req.params.id);
  res.render('partials/tasks/task-edit-form', { task, layout: false });
}

// POST /tasks/:id - Update and return view
async update(req: Request, res: Response): Promise<void> {
  const task = await this.taskService.updateTask(req.params.id, req.body);
  
  if (req.isHtmx) {
    res.render('partials/tasks/task-item', { task, layout: false });
  } else {
    req.flash('success', 'Task updated');
    res.redirect(`/tasks/${task.id}`);
  }
}
```

---

### Pattern 3: Delete with Confirmation

**Use Case**: Delete item with confirmation prompt

```html
<div id="task-<%= task.id %>" class="task-item">
  <h3><%= task.title %></h3>
  
  <!-- Alpine.js modal for confirmation -->
  <div x-data="{ confirmDelete: false }">
    <button @click="confirmDelete = true">Delete</button>
    
    <!-- Confirmation Modal -->
    <div x-show="confirmDelete" 
         x-transition
         class="modal"
         @click.away="confirmDelete = false">
      <div class="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete "<%= task.title %>"?</p>
        
        <button hx-delete="/tasks/<%= task.id %>" 
                hx-target="#task-<%= task.id %>" 
                hx-swap="outerHTML swap:500ms"
                @click="confirmDelete = false">
          Yes, Delete
        </button>
        
        <button @click="confirmDelete = false">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
```

**Controller**:
```typescript
async delete(req: Request, res: Response): Promise<void> {
  await this.taskService.deleteTask(req.params.id);
  
  if (req.isHtmx) {
    // Return empty response (element will be removed by hx-swap="outerHTML")
    res.status(200).send('');
  } else {
    req.flash('success', 'Task deleted');
    res.redirect('/tasks');
  }
}
```

---

## Form Patterns

### Pattern 4: Form Submission with Partial Update

**Use Case**: Submit form and update specific page section

```html
<form hx-post="/tasks" 
      hx-target="#task-list" 
      hx-swap="afterbegin"
      hx-on::after-request="this.reset()">
  
  <input type="text" name="title" placeholder="Task title" required>
  
  <select name="status">
    <option value="TODO">To Do</option>
    <option value="IN_PROGRESS">In Progress</option>
    <option value="DONE">Done</option>
  </select>
  
  <button type="submit">
    <span data-loading-replace>
      <span class="spinner htmx-indicator"></span>
    </span>
    <span data-loading-replace-content>
      Create Task
    </span>
  </button>
</form>

<div id="task-list">
  <!-- Existing tasks -->
</div>
```

**Controller**:
```typescript
async create(req: Request, res: Response): Promise<void> {
  const task = await this.taskService.createTask(req.body);
  
  if (req.isHtmx) {
    // Return single task item (will be prepended to #task-list)
    res.render('partials/tasks/task-item', { task, layout: false });
  } else {
    req.flash('success', 'Task created');
    res.redirect('/tasks');
  }
}
```

---

### Pattern 5: Form Validation with Error Display

**Use Case**: Show validation errors inline without page reload

```html
<form hx-post="/tasks" 
      hx-target="#task-form-container" 
      hx-swap="outerHTML"
      hx-ext="response-targets"
      hx-target-error="#error-container">
  
  <div id="task-form-container">
    <div class="form-field">
      <label for="title">Title</label>
      <input type="text" 
             id="title" 
             name="title" 
             value="<%= formData?.title || '' %>"
             class="<%= errors?.title ? 'error' : '' %>">
      <% if (errors?.title) { %>
        <span class="error-message"><%= errors.title %></span>
      <% } %>
    </div>
    
    <div class="form-field">
      <label for="dueDate">Due Date</label>
      <input type="date" 
             id="dueDate" 
             name="dueDate" 
             value="<%= formData?.dueDate || '' %>">
      <% if (errors?.dueDate) { %>
        <span class="error-message"><%= errors.dueDate %></span>
      <% } %>
    </div>
    
    <button type="submit">Create Task</button>
  </div>
  
  <div id="error-container" role="alert" aria-live="assertive"></div>
</form>
```

**Controller with Validation**:
```typescript
async create(req: Request, res: Response): Promise<void> {
  const result = TaskSchema.safeParse(req.body);
  
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    
    if (req.isHtmx) {
      // Return form with errors
      res.status(400).render('partials/tasks/task-form', {
        layout: false,
        formData: req.body,
        errors
      });
    } else {
      req.flash('error', 'Invalid task data');
      res.render('pages/tasks/new', { formData: req.body, errors });
    }
    return;
  }
  
  const task = await this.taskService.createTask(result.data);
  
  if (req.isHtmx) {
    res.render('partials/tasks/task-item', { task, layout: false });
  } else {
    req.flash('success', 'Task created');
    res.redirect('/tasks');
  }
}
```

---

## Navigation Patterns

### Pattern 6: Active Search / Typeahead

**Use Case**: Search with live results as user types

```html
<div class="search-container">
  <input type="search" 
         name="q" 
         placeholder="Search tasks..." 
         hx-get="/tasks/search" 
         hx-trigger="keyup changed delay:300ms" 
         hx-target="#search-results" 
         hx-indicator="#search-spinner">
  
  <span id="search-spinner" class="spinner htmx-indicator">🔍</span>
</div>

<div id="search-results" role="region" aria-live="polite">
  <!-- Results will appear here -->
</div>
```

**Controller**:
```typescript
async search(req: Request, res: Response): Promise<void> {
  const query = req.query.q as string;
  
  if (!query || query.length < 2) {
    res.status(200).send('<p>Type at least 2 characters to search</p>');
    return;
  }
  
  const tasks = await this.taskService.searchTasks(query);
  
  res.render('partials/tasks/search-results', { 
    tasks, 
    query, 
    layout: false 
  });
}
```

**Results Partial**:
```ejs
<!-- views/partials/tasks/search-results.ejs -->
<% if (tasks.length === 0) { %>
  <p>No results found for "<%= query %>"</p>
<% } else { %>
  <ul class="search-results-list">
    <% tasks.forEach(task => { %>
      <li>
        <a href="/tasks/<%= task.id %>"><%= task.title %></a>
        <span class="badge"><%= task.status %></span>
      </li>
    <% }) %>
  </ul>
<% } %>
```

---

### Pattern 7: Infinite Scroll / Load More

**Use Case**: Automatically load more content as user scrolls

```html
<div id="task-list">
  <% tasks.forEach(task => { %>
    <%- include('partials/tasks/task-item', { task }) %>
  <% }) %>
</div>

<% if (hasMore) { %>
  <!-- Trigger loads when scrolled into view -->
  <div hx-get="/tasks?page=<%= nextPage %>" 
       hx-trigger="revealed" 
       hx-swap="afterend">
    <div class="loading">Loading more tasks...</div>
  </div>
<% } %>
```

**Controller**:
```typescript
async list(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  
  const result = await this.taskService.getTasks({
    page,
    limit
  });
  
  if (req.isHtmx) {
    // Return just the new tasks + load more button if needed
    res.render('partials/tasks/task-list-items', {
      tasks: result.tasks,
      hasMore: result.hasMore,
      nextPage: page + 1,
      layout: false
    });
  } else {
    // Full page
    res.render('pages/tasks/index', {
      tasks: result.tasks,
      hasMore: result.hasMore,
      nextPage: page + 1
    });
  }
}
```

---

### Pattern 8: Filtering with Multiple Controls

**Use Case**: Filter list with multiple criteria

```html
<form hx-get="/tasks" 
      hx-target="#task-list" 
      hx-trigger="change from:select, submit"
      hx-indicator="#filter-spinner">
  
  <select name="status">
    <option value="">All Statuses</option>
    <option value="TODO">To Do</option>
    <option value="IN_PROGRESS">In Progress</option>
    <option value="DONE">Done</option>
  </select>
  
  <select name="priority">
    <option value="">All Priorities</option>
    <option value="LOW">Low</option>
    <option value="MEDIUM">Medium</option>
    <option value="HIGH">High</option>
  </select>
  
  <input type="search" 
         name="search" 
         placeholder="Search..." 
         hx-get="/tasks" 
         hx-trigger="keyup changed delay:300ms" 
         hx-include="closest form">
  
  <button type="submit">Apply Filters</button>
  <span id="filter-spinner" class="htmx-indicator">⏳</span>
</form>

<div id="task-list">
  <!-- Filtered tasks -->
</div>
```

**Controller**:
```typescript
async list(req: Request, res: Response): Promise<void> {
  const filters = {
    status: req.query.status as TaskStatus,
    priority: req.query.priority as TaskPriority,
    search: req.query.search as string
  };
  
  const tasks = await this.taskService.getTasks(filters);
  
  if (req.isHtmx) {
    res.render('partials/tasks/task-list', { tasks, layout: false });
  } else {
    res.render('pages/tasks/index', { tasks, filters });
  }
}
```

---

## Interactive Patterns

### Pattern 9: Polling for Updates

**Use Case**: Auto-refresh data every N seconds

```html
<div hx-get="/dashboard/stats" 
     hx-trigger="every 30s" 
     hx-target="this" 
     hx-swap="innerHTML">
  
  <!-- Initial stats -->
  <%- include('partials/dashboard/stats', { stats }) %>
</div>
```

**Best Practices**:
- Use sparingly (polling is expensive)
- Provide visual indicator when data is stale
- Consider WebSockets for real-time updates

---

### Pattern 10: Dependent Select Dropdowns

**Use Case**: Second dropdown depends on first dropdown's selection

```html
<div>
  <!-- First select -->
  <select name="project" 
          hx-get="/api/tasks/by-project" 
          hx-target="#task-select" 
          hx-include="this">
    <option value="">Select Project</option>
    <% projects.forEach(project => { %>
      <option value="<%= project.id %>"><%= project.name %></option>
    <% }) %>
  </select>
  
  <!-- Second select (populated dynamically) -->
  <div id="task-select">
    <select name="task" disabled>
      <option>Select project first</option>
    </select>
  </div>
</div>
```

**Controller**:
```typescript
async getTasksByProject(req: Request, res: Response): Promise<void> {
  const projectId = req.query.project as string;
  
  if (!projectId) {
    res.send('<select name="task" disabled><option>Select project first</option></select>');
    return;
  }
  
  const tasks = await this.taskService.getTasksByProject(projectId);
  
  res.render('partials/tasks/task-select', { tasks, layout: false });
}
```

---

## Error Handling

### Pattern 11: Error Display with Response Targets

```html
<form hx-post="/tasks" 
      hx-target="#success-container" 
      hx-target-error="#error-container"
      hx-ext="response-targets">
  
  <!-- Form fields -->
  
  <button type="submit">Create Task</button>
</form>

<div id="success-container"></div>
<div id="error-container" role="alert" class="error"></div>
```

**Controller Error Response**:
```typescript
async create(req: Request, res: Response): Promise<void> {
  try {
    const task = await this.taskService.createTask(req.body);
    res.render('partials/tasks/task-item', { task, layout: false });
  } catch (error) {
    if (req.isHtmx) {
      res.status(400).render('partials/error-message', {
        layout: false,
        message: error.message
      });
    } else {
      req.flash('error', error.message);
      res.redirect('back');
    }
  }
}
```

---

## Performance Optimization

### Pattern 12: Request Debouncing

```html
<!-- Debounce: Wait 300ms after user stops typing -->
<input type="search" 
       hx-get="/tasks/search" 
       hx-trigger="keyup changed delay:300ms">
```

### Pattern 13: Request Cancellation

```html
<!-- Cancel previous request if new one starts -->
<input type="search" 
       hx-get="/tasks/search" 
       hx-trigger="keyup changed delay:300ms" 
       hx-sync="this:abort">
```

### Pattern 14: Request Throttling

```html
<!-- Max one request per second -->
<button hx-get="/api/increment" 
        hx-trigger="click throttle:1s">
  Increment
</button>
```

---

## Testing Patterns

### Unit Test (Server Response)

```typescript
describe('POST /tasks (HTMX)', () => {
  it('returns partial HTML for HTMX request', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('HX-Request', 'true')
      .send({ title: 'Test Task', status: 'TODO' })
      .expect(200);
    
    expect(response.text).toContain('task-item');
    expect(response.text).not.toContain('<!DOCTYPE html>');
  });
});
```

### E2E Test (Browser Interaction)

```typescript
test('inline edit updates task without reload', async ({ page }) => {
  await page.goto('/tasks');
  
  // Click edit button
  await page.click('.task-item:first-child button:has-text("Edit")');
  
  // Wait for form to appear
  await page.waitForSelector('.task-item form');
  
  // Edit title
  await page.fill('input[name="title"]', 'Updated Title');
  await page.click('button[type="submit"]');
  
  // Wait for view mode to return
  await page.waitForSelector('.task-item:has-text("Updated Title"):not(form)');
  
  // Verify no page reload (URL unchanged)
  expect(page.url()).not.toContain('/edit');
});
```

---

## Best Practices Summary

### ✅ DO
1. **Progressive Enhancement**: Always provide HTML fallback
2. **Semantic IDs**: Use descriptive target IDs (`#task-list`, not `#container`)
3. **ARIA Attributes**: Add `aria-live`, `role="alert"` for accessibility
4. **Debounce Searches**: Use `delay:300ms` for search inputs
5. **Loading Indicators**: Show spinners during requests
6. **Error Handling**: Provide error targets and graceful failures
7. **Test Both Modes**: Test HTMX and non-HTMX requests

### ❌ DON'T
1. **Don't Return JSON**: HTMX expects HTML, not JSON
2. **Don't Use Complex Selectors**: Keep `hx-target` simple
3. **Don't Overuse Polling**: Polling is expensive
4. **Don't Forget CSRF**: Include tokens in all mutating requests
5. **Don't Skip Server Validation**: Client validation is UX only
6. **Don't Ignore Errors**: Always handle error states

---

**See Also**:
- [ADR-006: HTMX Conventions](./adr/006-htmx-conventions.md)
- [ADR-003: Progressive Enhancement](./adr/003-progressive-enhancement.md)
- [HTMX Official Documentation](https://htmx.org/docs/)

---

**Last Updated**: 2025-10-31
