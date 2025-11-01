# HTMX + Alpine.js Implementation Guide

**TaskFlow - Progressive Enhancement with Server-Side Rendering**

---

## 📋 Table of Contents

- [Philosophy](#philosophy)
- [HTMX Integration](#htmx-integration)
- [Alpine.js Components](#alpinejs-components)
- [Implementation Patterns](#implementation-patterns)
- [API Endpoints](#api-endpoints)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Philosophy

TaskFlow follows a **Progressive Enhancement** approach:

1. **SSR First**: Server returns complete HTML pages
2. **HTMX Layer**: Adds partial updates without full page reloads
3. **Alpine.js Layer**: Manages local UI state and interactions

### Key Principles

✅ **App works without JavaScript** (basic functionality)  
✅ **HTMX adds smooth interactions** (no page reload)  
✅ **Alpine.js adds local state** (dropdowns, modals, theme)  
✅ **Server renders HTML** (no client-side templating)

---

## 🔄 HTMX Integration

### What is HTMX?

HTMX extends HTML with attributes to make AJAX requests that return **HTML fragments** instead of JSON. The server-rendered HTML is swapped directly into the page.

### Core HTMX Attributes

```html
<!-- GET request on change, update #task-list-container -->
<form hx-get="/tasks" 
      hx-target="#task-list-container" 
      hx-trigger="change">
  <select name="status">
    <option value="TODO">To Do</option>
    <option value="DONE">Done</option>
  </select>
</form>

<!-- POST request on click, swap entire element -->
<button hx-post="/tasks/123/complete"
        hx-target="#task-123"
        hx-swap="outerHTML">
  Mark Complete
</button>

<!-- DELETE with confirmation -->
<button hx-delete="/tasks/123"
        hx-confirm="Are you sure?"
        hx-target="#task-123"
        hx-swap="outerHTML swap:1s">
  Delete
</button>
```

### HTMX Swap Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `innerHTML` | Replace inner content | Update list container |
| `outerHTML` | Replace entire element | Update task card |
| `beforebegin` | Insert before element | Prepend new item |
| `afterbegin` | Insert as first child | Add to top of list |
| `beforeend` | Insert as last child | Add to bottom of list |
| `afterend` | Insert after element | Append new item |
| `delete` | Remove element | Delete task |

### Loading Indicators

```html
<!-- Show spinner during request -->
<button hx-post="/tasks" 
        hx-indicator="#spinner">
  Create Task
  <span id="spinner" class="htmx-indicator loading loading-spinner"></span>
</button>
```

CSS for `.htmx-indicator`:
```css
.htmx-indicator {
  display: none;
}
.htmx-request .htmx-indicator,
.htmx-request.htmx-indicator {
  display: inline;
}
```

---

## ⚡ Alpine.js Components

### Available Components

All components are defined in `public/js/alpine-components.js` and registered globally.

### 1. Theme Switcher

**Purpose**: Toggle between light and dark themes with persistence.

**Usage**:
```html
<div x-data="themeSwitch">
  <button @click="toggle">
    <svg x-show="!isDark">☀️ Light</svg>
    <svg x-show="isDark">🌙 Dark</svg>
  </button>
</div>
```

**Properties**:
- `isDark` (boolean): Current theme state
- `toggle()` (method): Switch themes

**Persistence**: Uses `localStorage` with key `taskflow-theme`.

---

### 2. Modal Component

**Purpose**: Display modal dialogs with focus trapping and ESC key support.

**Usage**:
```html
<div x-data="modal(false)" 
     @keydown.escape.window="hide()">
  <button @click="show()">Open Modal</button>
  
  <div x-show="open" 
       x-transition
       class="modal modal-open">
    <div class="modal-box">
      <h3>Modal Title</h3>
      <p>Content here...</p>
      <button @click="hide()">Close</button>
    </div>
  </div>
</div>
```

**Properties**:
- `open` (boolean): Modal visibility
- `show()` (method): Open modal
- `hide()` (method): Close modal

**Features**:
- Auto-focus first interactive element
- Body scroll lock when open
- ESC key to close

---

### 3. Toast Notifications

**Purpose**: Display temporary success/error/info messages.

**Usage** (automatically handled):
```javascript
// From JavaScript
window.dispatchEvent(new CustomEvent('show-flash', {
  detail: { type: 'success', text: 'Task created!' }
}));

// From HTMX response header
HX-Trigger: {"showSuccess": "Task updated!"}
```

**Types**: `success`, `error`, `warning`, `info`

**Features**:
- Auto-dismiss after 4 seconds (configurable)
- Smooth animations
- Stacks multiple toasts
- ESC key dismisses all

---

### 4. Form Validation

**Purpose**: Client-side validation with real-time feedback.

**Usage**:
```html
<form x-data="formValidation()">
  <input type="text" 
         name="title"
         @blur="touch('title')"
         @input="validate('title', $event.target.value, { 
           required: true, 
           minLength: 3 
         })">
  
  <div x-show="hasError('title')" 
       x-text="getError('title')" 
       class="text-error">
  </div>
</form>
```

**Validation Rules**:
- `required`: Field must have value
- `minLength`: Minimum character count
- `maxLength`: Maximum character count
- `email`: Valid email format

---

### 5. Dropdown Component

**Purpose**: Toggle dropdowns with click-outside detection.

**Usage**:
```html
<div x-data="dropdown()" 
     @click.outside="close()">
  <button @click="toggle()">Options ▼</button>
  
  <ul x-show="open" 
      x-transition
      class="menu dropdown-content">
    <li><a>Edit</a></li>
    <li><a>Delete</a></li>
  </ul>
</div>
```

---

### 6. Inline Edit

**Purpose**: Edit text fields inline without modal.

**Usage**:
```html
<div x-data="inlineEdit('Task Title', '/tasks/123', 'title')">
  <div x-show="!editing" @click="startEdit()">
    <span x-text="value"></span>
  </div>
  
  <div x-show="editing">
    <input x-model="value" 
           @keydown="handleKeydown($event)">
    <button @click="save()" :disabled="saving">Save</button>
    <button @click="cancel()">Cancel</button>
  </div>
</div>
```

**Keyboard Shortcuts**:
- `Enter`: Save
- `ESC`: Cancel

---

### 7. Task Search

**Purpose**: Debounced search with HTMX integration.

**Usage**:
```html
<div x-data="taskSearch()">
  <input type="text" 
         x-model="query" 
         @input="search()"
         placeholder="Search tasks...">
  
  <button x-show="query" @click="clear()">Clear</button>
  <span x-show="searching">Searching...</span>
</div>
```

**Features**:
- 300ms debounce delay
- Triggers HTMX GET request
- Updates `#task-list-container`

---

## 🛠️ Implementation Patterns

### Pattern 1: Filter Tasks (No Reload)

**Template** (`views/partials/htmx/task-filters.ejs`):
```html
<form hx-get="/tasks"
      hx-target="#task-list-container"
      hx-trigger="change, submit"
      hx-indicator="#filter-indicator">
  
  <select name="status">
    <option value="">All</option>
    <option value="TODO">To Do</option>
    <option value="IN_PROGRESS">In Progress</option>
    <option value="DONE">Done</option>
  </select>
  
  <span id="filter-indicator" class="htmx-indicator">⏳</span>
</form>
```

**Controller** (`TaskController.list`):
```typescript
async list(req: IAuthenticatedRequest, res: Response): Promise<void> {
  const { status, priority, search } = req.query;
  
  const result = await this.queryBus.execute(GetAllTasksQuery, query);
  
  // If HTMX request, return only the list partial
  if (req.isHtmx) {
    res.render('partials/htmx/task-list', {
      tasks: result.items,
      pagination: result.pagination
    });
  } else {
    // Full page render
    res.render('pages/tasks/list', { ...allData });
  }
}
```

**Key**: Use `req.isHtmx` to detect partial vs full page requests.

---

### Pattern 2: Toggle Task Status

**Template** (`views/partials/htmx/task-item.ejs`):
```html
<div id="task-<%= task.id %>" class="card">
  <h3><%= task.title %></h3>
  
  <button hx-post="/tasks/<%= task.id %>/complete"
          hx-target="#task-<%= task.id %>"
          hx-swap="outerHTML">
    <% if (task.status === 'DONE') { %>
      ✓ Completed
    <% } else { %>
      Mark Complete
    <% } %>
  </button>
</div>
```

**Controller** (`TaskController.toggleComplete`):
```typescript
async toggleComplete(req: IAuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  
  // Toggle status
  const task = await this.queryBus.execute(GetTaskByIdQuery, { id });
  const newStatus = task.status === 'DONE' ? 'IN_PROGRESS' : 'DONE';
  
  // Update
  await this.commandBus.execute(UpdateTaskCommand, { id, status: newStatus });
  
  // Return updated HTML
  res.render('partials/htmx/task-item', { task: updatedTask });
}
```

**Result**: Entire task card is replaced with updated version.

---

### Pattern 3: Create Task with Validation

**Template** (`views/pages/tasks/form.ejs`):
```html
<form x-data="formValidation()"
      hx-post="/tasks"
      hx-target="body"
      hx-indicator="#submit-btn">
  
  <input type="text" 
         name="title"
         @blur="touch('title')"
         @input="validate('title', $event.target.value, { 
           required: true, 
           minLength: 3,
           maxLength: 200
         })">
  
  <div x-show="hasError('title')" 
       x-text="getError('title')" 
       class="text-error text-sm mt-1">
  </div>
  
  <button type="submit" id="submit-btn">
    Create Task
    <span class="htmx-indicator loading loading-spinner"></span>
  </button>
</form>
```

**Controller** (`TaskController.create`):
```typescript
async create(req: IAuthenticatedRequest, res: Response): Promise<void> {
  const taskData = req.body;
  
  const task = await this.commandBus.execute(CreateTaskCommand, taskData);
  
  // Flash message
  req.flash('success', 'Task created successfully!');
  
  // Redirect with HTMX header
  if (req.isHtmx) {
    htmxTrigger(res, 'taskCreated');
    htmxRedirect(res, `/tasks/${task.id}`);
  } else {
    res.redirect(`/tasks/${task.id}`);
  }
}
```

**Helper** (`response.helpers.ts`):
```typescript
export function htmxRedirect(res: Response, url: string): void {
  res.setHeader('HX-Redirect', url);
  res.status(200).end();
}

export function htmxTrigger(res: Response, event: string): void {
  res.setHeader('HX-Trigger', event);
}
```

---

### Pattern 4: Optimistic UI Updates

**Concept**: Update UI immediately, revert if server fails.

**Example** (delete task):
```html
<button hx-delete="/tasks/<%= task.id %>"
        hx-target="#task-<%= task.id %>"
        hx-swap="outerHTML swap:1s"
        @click="$el.closest('.card').classList.add('opacity-50')">
  Delete
</button>
```

**Result**:
1. Button clicked → Card fades to 50% opacity immediately
2. HTMX sends DELETE request
3. Server responds with empty body or error
4. On success: Card removed with 1s transition
5. On error: Opacity restored, error toast shown

---

## 📡 API Endpoints

### Task Endpoints (HTMX-Enabled)

| Method | Endpoint | Description | Returns |
|--------|----------|-------------|---------|
| `GET` | `/tasks` | List tasks with filters | Full page OR `partials/htmx/task-list` |
| `POST` | `/tasks` | Create new task | Redirect to detail |
| `GET` | `/tasks/:id` | Task detail | Full page OR `partials/htmx/task-detail` |
| `PATCH` | `/tasks/:id` | Update task | Success + flash |
| `DELETE` | `/tasks/:id` | Delete task | Empty (removes element) |
| `POST` | `/tasks/:id/complete` | Toggle DONE status | `partials/htmx/task-item` |
| `PATCH` | `/tasks/:id/status` | Update status dropdown | `partials/htmx/task-item` |

### HTMX Response Headers

Controllers use these helpers to communicate with HTMX:

```typescript
// Trigger custom event
htmxTrigger(res, 'taskCreated');

// Redirect client
htmxRedirect(res, '/tasks/123');

// Show toast via trigger
res.setHeader('HX-Trigger', JSON.stringify({
  showSuccess: 'Task updated!'
}));

// Partial vs full page
renderOrPartial(req, res, 'pages/tasks/list', 'partials/htmx/task-list', data);
```

---

## ✅ Best Practices

### 1. Progressive Enhancement

Always make features work without JavaScript first:

```html
<!-- ✓ Good: Works without JS -->
<form action="/tasks" method="POST" hx-post="/tasks">
  <input name="title">
  <button type="submit">Create</button>
</form>

<!-- ✗ Bad: Requires JS -->
<button @click="createTask()">Create</button>
```

### 2. Semantic HTML

Use proper HTML5 elements:

```html
<!-- ✓ Good -->
<button type="button" hx-post="/tasks/123/complete">
  Complete
</button>

<!-- ✗ Bad -->
<div class="btn" hx-post="/tasks/123/complete">
  Complete
</div>
```

### 3. Accessibility

- Include `aria-label` on icon buttons
- Use `role` attributes for custom widgets
- Ensure keyboard navigation works
- Test with screen readers

```html
<button @click="toggle()" 
        aria-label="Toggle theme"
        aria-pressed="isDark">
  <svg>...</svg>
</button>
```

### 4. Error Handling

Always handle errors gracefully:

```typescript
// Server-side
try {
  await this.commandBus.execute(command);
  res.setHeader('HX-Trigger', JSON.stringify({
    showSuccess: 'Task created!'
  }));
} catch (error) {
  res.setHeader('HX-Trigger', JSON.stringify({
    showError: error.message
  }));
  res.status(400).end();
}
```

```javascript
// Client-side (automatic in alpine-components.js)
document.body.addEventListener('htmx:responseError', (event) => {
  window.dispatchEvent(new CustomEvent('show-flash', {
    detail: { type: 'error', text: 'Something went wrong' }
  }));
});
```

### 5. Loading States

Show feedback during async operations:

```html
<button hx-post="/tasks"
        hx-indicator="#spinner"
        hx-disabled-elt="this">
  Create
  <span id="spinner" class="htmx-indicator">⏳</span>
</button>
```

### 6. Debouncing

For search and autocomplete, debounce user input:

```html
<!-- HTMX built-in debouncing -->
<input hx-get="/tasks/search"
       hx-trigger="keyup changed delay:300ms"
       hx-target="#results">

<!-- Alpine.js with custom debounce -->
<input x-data="taskSearch()" 
       x-model="query" 
       @input="search()">
```

---

## 🐛 Troubleshooting

### HTMX not working?

**Check**:
1. HTMX loaded: `<script src="https://unpkg.com/htmx.org@1.9.10"></script>`
2. Valid attributes: `hx-get`, `hx-target`, etc. (lowercase, hyphenated)
3. Target element exists: `document.querySelector('#task-list-container')`
4. Network tab shows request with `HX-Request: true` header

**Debug**:
```javascript
// Enable HTMX logging
htmx.logger = (elt, event, data) => {
  if (console) console.log(event, elt, data);
};
```

---

### Alpine.js component not working?

**Check**:
1. Alpine loaded: `<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>`
2. Component registered: Check `public/js/alpine-components.js`
3. `x-data` directive present: `<div x-data="themeSwitch">`
4. Component name correct (case-sensitive)

**Debug**:
```javascript
// Check if Alpine is loaded
console.log(window.Alpine);

// Check component registration
document.addEventListener('alpine:init', () => {
  console.log('Alpine initialized');
});
```

---

### Partial not rendering?

**Check**:
1. Template path correct: `partials/htmx/task-item.ejs`
2. All data passed to render: `{ task, user }`
3. No EJS syntax errors in partial
4. Controller uses `res.render()` not `res.json()`

**Common mistake**:
```typescript
// ✗ Bad: Returns JSON
res.json({ task });

// ✓ Good: Renders HTML
res.render('partials/htmx/task-item', { task });
```

---

### Flash messages not showing?

**Check**:
1. Toast component exists: `<%- include('../partials/toast-notifications') %>`
2. Flash middleware configured: `app.use(flash())`
3. Trigger header sent: `HX-Trigger: {"showSuccess": "..."}`
4. Event listener registered (in `alpine-components.js`)

---

## 📚 Additional Resources

- [HTMX Documentation](https://htmx.org/docs/)
- [Alpine.js Documentation](https://alpinejs.dev/start-here)
- [Tailwind CSS + DaisyUI](https://daisyui.com/)
- [MDN Web Docs - Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)

---

## 🎉 What's Next?

Now that HTMX + Alpine.js are fully integrated:

1. ✅ Task filters work without reload
2. ✅ Status updates are instant
3. ✅ Theme switcher persists
4. ✅ Toast notifications auto-dismiss
5. ✅ Form validation is real-time

**Next Steps** (from ROADMAP):
- [ ] Add E2E tests for HTMX workflows (Playwright)
- [ ] Implement Settings page with preferences
- [ ] Add WebSocket support for real-time updates
- [ ] Create Storybook-like component gallery
- [ ] Performance monitoring with OpenTelemetry

---

**Happy coding! 🚀**
