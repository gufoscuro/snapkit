# Testing Strategy

## Overview

SnapKit uses **Vitest** with three test project configurations, each targeting a different runtime environment. Tests are organized by file naming convention — the suffix determines which project runs them.

## Test Projects

| Project | Environment | File Pattern | Use Case |
|---------|-------------|-------------|----------|
| `unit` | happy-dom | `*.unit.test.ts` | Component rendering, hooks with runes (`$state`, `$derived`) |
| `server` | Node | `*.test.ts` | Pure functions, server utilities, renderers |
| `client` | Playwright (Chromium) | `*.svelte.test.ts` | Tests requiring a real browser (scroll, resize, focus) |

**Default rule:** Use `*.unit.test.ts` for component tests and `*.test.ts` for pure functions. Only escalate to `*.svelte.test.ts` when happy-dom is insufficient (e.g., real browser APIs needed).

## File Placement

Test files live **next to** their source files:

```
src/lib/utils/
├── filters.ts
├── filters.unit.test.ts      ← unit test (happy-dom)
├── json.ts
└── json.unit.test.ts

src/lib/components/core/form/
├── FormUtil.svelte
├── FormUtil.unit.test.ts      ← component test (happy-dom)
├── validation.ts
├── validation.test.ts         ← pure function test (Node)
├── form-state.svelte.ts
└── form-state.svelte.unit.test.ts  ← runes test (happy-dom)

src/lib/components/features/supply/SuppliersTable/
├── default/
│   └── SuppliersTable.svelte
├── SuppliersTable.mock.ts
├── SuppliersTable.unit.test.ts ← feature component test
└── index.ts
```

## Choosing the Right Project

```
Does the code use $state, $derived, $effect, or render Svelte components?
├── YES → Does it need real browser APIs (scroll, resize, IntersectionObserver)?
│   ├── YES → *.svelte.test.ts (client/Playwright)
│   └── NO  → *.unit.test.ts (unit/happy-dom)
└── NO (pure functions, types, constants)
    └── *.test.ts (server/Node)
```

## Mocking Patterns

### SvelteKit Modules

Use `vi.hoisted()` + `vi.mock()` to mock SvelteKit and project aliases:

```typescript
const { mockGoto, mockHasPrevious } = vi.hoisted(() => ({
  mockGoto: vi.fn(),
  mockHasPrevious: vi.fn(() => false),
}))

vi.mock('$app/navigation', () => ({ goto: mockGoto }))
vi.mock('$lib/contexts/navigation-history.svelte', () => ({
  hasPrevious: mockHasPrevious,
}))
```

### Paraglide (i18n)

Mock messages as simple functions returning the key or a formatted string:

```typescript
vi.mock('$lib/paraglide/messages', () => ({
  validation_required_generic: () => 'This field is required',
  validation_required: ({ field }: { field: string }) => `${field} is required`,
  datatable_no_data: () => 'No data available',
}))
```

### Svelte Components (in renderer tests)

When testing functions that import Svelte components, mock the component as a simple object:

```typescript
vi.mock('./StatusBadge.svelte', () => ({ default: 'StatusBadge' }))
vi.mock('$lib/components/ui/badge/badge.svelte', () => ({ default: 'Badge' }))
```

### Data-table Utilities

```typescript
vi.mock('$lib/components/ui/data-table', () => ({
  renderComponent: vi.fn((_comp, props) => ({ __component: true, props })),
  renderSnippet: vi.fn((snippet) => ({ __snippet: true, snippet })),
}))
```

### Fetch / API

```typescript
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// In test:
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: () => Promise.resolve({ data: [...] }),
})
```

## Testing Reactive Code (Runes)

For code using `$state` and `$derived`, use `flushSync` from Svelte to force synchronous updates:

```typescript
import { flushSync } from 'svelte'

it('updates a field value', () => {
  const state = createFormState(config)
  flushSync(() => {
    state.updateField('name', 'Alice')
  })
  expect(state.values.name).toBe('Alice')
})
```

## Component Testing with @testing-library/svelte

### Rendering

```typescript
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte'

afterEach(() => cleanup())

it('renders the component', () => {
  render(MyComponent, { props: { label: 'Click me' } })
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})
```

### Querying Elements

| Method | When to use |
|--------|-------------|
| `screen.getByRole()` | Asserting element IS present (throws if not found) |
| `screen.queryByRole()` | Asserting element IS NOT present (returns null) |
| `screen.getByText()` | Finding by visible text content |
| `screen.getByTestId()` | Last resort — prefer semantic queries |
| `document.querySelector()` | When no ARIA role exists (e.g., `<form>` without name) |

**Note:** `<form>` elements without an accessible name (aria-label, name attribute) are NOT found by `getByRole('form')`. Use `document.querySelector('form')` instead.

### Async Operations

```typescript
it('shows result after async operation', async () => {
  render(MyComponent, { props: { promise } })

  await vi.waitFor(() => {
    expect(screen.getByText('Result')).toBeInTheDocument()
  })
})
```

### Events

```typescript
await fireEvent.click(screen.getByRole('button'))
await fireEvent.submit(document.querySelector('form')!)
await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'new' } })
```

## Test Structure

Follow a consistent structure across all test files:

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// 1. vi.hoisted() mocks (before vi.mock)
const { mockDep } = vi.hoisted(() => ({
  mockDep: vi.fn(),
}))

// 2. vi.mock() declarations
vi.mock('$lib/some-module', () => ({ dep: mockDep }))

// 3. Imports (AFTER mocks)
import Component from './Component.svelte'

// 4. Test helpers
function createProps(overrides = {}) {
  return { required: 'value', ...overrides }
}

// 5. Test suites organized by behavior
describe('Component', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => cleanup())

  describe('rendering', () => {
    it('renders with default props', () => { ... })
  })

  describe('interaction', () => {
    it('handles click', async () => { ... })
  })

  describe('edge cases', () => {
    it('handles null data', () => { ... })
  })
})
```

## What to Test

### Pure Functions / Renderers

- **Happy path**: Normal input → expected output
- **Edge cases**: null, undefined, empty string, empty array
- **Type coercion**: String numbers, Date objects vs strings
- **Error handling**: Invalid input, missing config
- **Locale/format variations**: Different locale strings, format options

### Components

- **Rendering**: Correct elements appear with given props
- **Interaction**: Click handlers, form submissions, input changes
- **State management**: Loading, error, empty, success states
- **Context integration**: Behavior inside and outside form context
- **Conditional rendering**: Elements appear/disappear based on props
- **Accessibility**: Correct ARIA roles, labels, disabled states

### Stores / Hooks

- **Initial state**: Correct defaults after creation
- **Mutations**: State changes correctly after method calls
- **Derived state**: Computed values update when dependencies change
- **Reset behavior**: State returns to initial after reset
- **Edge cases**: Empty collections, concurrent operations

## What NOT to Test

- **Styling/CSS classes**: Don't assert specific Tailwind classes unless they encode behavior
- **Internal implementation**: Test the public API, not internal `$state` variables
- **Third-party libraries**: Don't test TanStack Table, shadcn-svelte, or Lucide behavior
- **Types**: TypeScript types are compile-time checked, no runtime tests needed
- **Generated code**: Don't test `components-registry.ts` or Paraglide output

## Running Tests

```bash
# Run all tests (unit + server, no Playwright)
npm test

# Run specific project
npx vitest run --project unit
npx vitest run --project server

# Run specific file
npx vitest run --project unit src/lib/components/core/form/FormUtil.unit.test.ts

# Watch mode
npx vitest --project unit
```

## Configuration

Tests are configured in `vite.config.ts` under `test.projects`. Key settings:

- `requireAssertions: true` — every test must have at least one assertion
- Unit project uses `src/test-setup.ts` which imports `@testing-library/jest-dom/vitest`
- Unit project resolves with `browser` condition for Svelte component imports
