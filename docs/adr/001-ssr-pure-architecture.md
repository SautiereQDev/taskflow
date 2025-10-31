# ADR-001: SSR Pure Architecture

**Status**: Accepted  
**Date**: 2025-10-31  
**Decision Makers**: Development Team  

## Context

We need to decide on the fundamental architecture for TaskFlow: should we build a Single Page Application (SPA) with a REST API backend, or adopt a Server-Side Rendering (SSR) approach?

### Options Considered

1. **SPA (React/Vue + REST API)**: Modern client-side framework with JSON API
2. **SSR Pure (Express + EJS)**: Traditional server-rendered HTML
3. **Hybrid (Next.js/Remix)**: Framework with SSR + client hydration

## Decision

**We will use SSR Pure architecture with Express + EJS templates.**

### Rationale

#### Performance Benefits
- **Time to Interactive (TTI) < 2s**: No JavaScript bundle download/parse/execute required
- **First Contentful Paint (FCP)**: Immediate HTML rendering from server
- **No Hydration Overhead**: Unlike Next.js, no client-side framework reconciliation
- **Smaller Bundle Size**: ~50KB (HTMX + Alpine.js) vs ~200KB+ (React/Vue bundle)

#### SEO & Accessibility
- **Perfect SEO**: Search engines receive fully rendered HTML
- **Works Without JavaScript**: Core functionality accessible to all users
- **Progressive Enhancement**: JavaScript enhances but isn't required
- **WCAG 2.2 AA Compliance**: Easier to maintain with server-rendered forms

#### Developer Experience
- **Simpler Mental Model**: Request → HTML response (no client state management)
- **Easier Debugging**: Server logs show complete request/response cycle
- **No Build Complexity**: No webpack/vite configuration, source maps, etc.
- **TypeScript on Server Only**: Type safety where complexity lives

#### Business Requirements
- **Task Management Domain**: CRUD operations don't need heavy client-side interactivity
- **Team Collaboration**: Real-time features can be added with WebSockets if needed
- **Mobile-First**: Less JavaScript = better performance on low-end devices

### Trade-offs

#### Disadvantages Accepted
- ❌ **Full Page Reloads**: Mitigated with HTMX for partial updates
- ❌ **Server Load**: Each request requires rendering; addressed with caching strategies
- ❌ **Limited Client State**: Complex UI state harder to manage; not needed for this domain

#### Advantages Gained
- ✅ **Sub-2s TTI**: Meets performance requirements
- ✅ **Zero JavaScript Failures**: App works even if JS fails to load
- ✅ **Simple Deployment**: Single server process, no CDN required
- ✅ **Team Velocity**: Faster development without framework complexity

## Implementation Strategy

### Core Stack
- **Rendering**: EJS templates (simple, flexible, no DSL)
- **Routing**: Express 5 (mature, well-documented)
- **Interactivity**: HTMX 1.9+ (partial updates) + Alpine.js 3.x (local UI state)

### Progressive Enhancement Layers

```
Layer 1 (Required): HTML Forms + Server Rendering
  ↓ Works without JavaScript
Layer 2 (Enhancement): HTMX (AJAX requests → HTML responses)
  ↓ No page reloads for common actions
Layer 3 (Enhancement): Alpine.js (Modals, dropdowns, client validation)
  ↓ Smooth UX for local interactions
```

### Example: Task Creation Flow

#### Layer 1 - Base HTML
```html
<form method="POST" action="/tasks">
  <input type="text" name="title" required>
  <button type="submit">Create Task</button>
</form>
```

#### Layer 2 - HTMX Enhancement
```html
<form hx-post="/tasks" hx-target="#task-list" hx-swap="afterbegin">
  <input type="text" name="title" required>
  <button type="submit">Create Task</button>
</form>
```

#### Layer 3 - Alpine.js Enhancement
```html
<form hx-post="/tasks" hx-target="#task-list" hx-swap="afterbegin"
      x-data="{ validating: false }"
      @submit="validating = true">
  <input type="text" name="title" required 
         x-bind:class="{'border-red-500': validating && !$el.validity.valid}">
  <button type="submit" x-bind:disabled="validating">Create Task</button>
</form>
```

## Consequences

### Positive
- Delivers on performance requirements (TTI < 2s, Lighthouse score > 90)
- Simpler codebase = easier onboarding for new developers
- Lower hosting costs (no separate frontend build/deployment)
- Better accessibility by default

### Negative
- Team must learn HTMX patterns (mitigated by comprehensive documentation)
- Complex client-side features require more thought (acceptable for task management domain)
- Less ecosystem tooling compared to React/Vue (not critical for this project)

### Neutral
- Different from typical SPA approach (opportunity to explore proven alternative)
- Requires discipline to maintain progressive enhancement (enforced by code reviews)

## Validation

### Success Metrics
- [ ] Lighthouse Performance Score > 90
- [ ] Time to Interactive < 2s on 3G connection
- [ ] WCAG 2.2 AA compliance (100% automated tests pass)
- [ ] Core user flows work with JavaScript disabled

### Review Date
**2025-12-01** - Reassess after Phase 4 completion

## References
- [HTMX Documentation](https://htmx.org/docs/)
- [Alpine.js Guide](https://alpinejs.dev/start-here)
- [Web.dev Progressive Enhancement](https://web.dev/progressively-enhance-your-pwa/)
- [Gov.uk Design System](https://design-system.service.gov.uk/) - SSR reference implementation
