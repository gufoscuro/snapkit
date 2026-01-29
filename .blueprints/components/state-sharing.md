# Component State Sharing

Architecture for sharing state between sibling components in a configurable page system.

## Problem Statement

In a page composition system where components are loaded dynamically based on configuration:
- Components at the same level (siblings) need to communicate
- Example: a filter component and a table component need to share filter state
- The page configuration comes from a database, not from code
- Components should be reusable "building blocks" that can be wired together

## Design Goals

1. **Type-safe**: Components know the shape of data they read/write at compile time
2. **Flexible bindings**: The same component can be wired to different state namespaces
3. **Decoupled components**: Components don't know about each other, only about the data contract
4. **Sensible defaults**: Works without explicit configuration in common cases
5. **Database-driven**: Bindings can be configured without code changes

## Core Concepts

### Contract

A **contract** defines what data a component provides (writes) and consumes (reads). It uses TypeBox schemas for both runtime validation and TypeScript type inference.

```typescript
// DemoFilter.contract.ts
import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

export const DemoFilterContract = {
  $id: 'DemoFilter',
  provides: {
    filters: Type.Object({
      search: Type.String(),
      status: Type.Array(Type.String())
    })
  },
  consumes: {}
} as const satisfies ComponentContract
```

The contract describes the **shape** of the data, not **where** it lives.

### Binding

A **binding** maps logical names from the contract to actual namespaces in the page state.

```typescript
// In SnippetDefinition (from database)
{
  componentKey: '_poc.demofilter.DemoFilter',
  enabled: true,
  bindings: {
    provides: {
      filters: 'searchFilters'  // writes to 'searchFilters' instead of default 'filters'
    }
  }
}
```

If no binding is specified, the logical name is used as the namespace (default binding).

### PageState

The **PageState** is a reactive key-value registry that holds all shared state for a page. Components read and write to it via typed handles.

```typescript
// Simplified structure
{
  'filters': { search: 'laptop', status: ['pending'] },
  'selection': { rows: ['uuid-1', 'uuid-2'] }
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  +page.svelte                                               │
│  └── initPageState()  ← Creates the PageState registry      │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SnippetResolver                                     │   │
│  │  └── Loads component + contract                      │   │
│  │       │                                              │   │
│  │       ▼                                              │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │  SnippetBindingsProvider                      │  │   │
│  │  │  └── Resolves bindings, sets context          │  │   │
│  │  │       │                                       │  │   │
│  │  │       ▼                                       │  │   │
│  │  │  ┌─────────────────────────────────────────┐ │  │   │
│  │  │  │  Component (e.g., DemoFilter)           │ │  │   │
│  │  │  │  └── useProvides() / useConsumes()      │ │  │   │
│  │  │  │       │                                 │ │  │   │
│  │  │  │       ▼                                 │ │  │   │
│  │  │  │  Typed StateHandle                      │ │  │   │
│  │  │  │  └── get() / set() / update()          │ │  │   │
│  │  │  └─────────────────────────────────────────┘ │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Page loads**: `+page.svelte` calls `initPageState()` to create the registry
2. **Component loads**: `SnippetResolver` loads the component and its contract
3. **Bindings resolve**: `SnippetBindingsProvider` resolves bindings (explicit or defaults)
4. **Component initializes**: Component calls `useProvides()` / `useConsumes()` to get typed handles
5. **State flows**: Components read/write state via handles, changes are reactive

### Example Flow

```
DemoFilter                          PageState                         DemoTable
    │                                   │                                  │
    │  useProvides('filters')           │                                  │
    │ ─────────────────────────────────►│                                  │
    │  returns StateHandle<FilterState> │                                  │
    │                                   │                                  │
    │  handle.set({ search: 'laptop' }) │                                  │
    │ ─────────────────────────────────►│  state['filters'] = {...}        │
    │                                   │ ─────────────────────────────────►│
    │                                   │  (reactive update)               │
    │                                   │                                  │
    │                                   │  useConsumes('filters')          │
    │                                   │◄─────────────────────────────────│
    │                                   │  returns { get() }               │
    │                                   │                                  │
    │                                   │  handle.get()                    │
    │                                   │◄─────────────────────────────────│
    │                                   │  { search: 'laptop', ... }       │
```

## Usage

### Creating a Component with Contract

1. **Define the contract** (`MyComponent.contract.ts`):

```typescript
import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

export const MyComponentContract = {
  $id: 'MyComponent',
  provides: {
    myData: Type.Object({
      value: Type.String()
    })
  },
  consumes: {
    otherData: Type.Object({
      items: Type.Array(Type.String())
    })
  }
} as const satisfies ComponentContract
```

2. **Export contract from component** (`MyComponent.svelte`):

```svelte
<script lang="ts" module>
  export { MyComponentContract as contract } from './MyComponent.contract.js'
</script>

<script lang="ts">
  import { useProvides, useConsumes } from '$lib/contexts/page-state'
  import { MyComponentContract } from './MyComponent.contract.js'

  // Get typed handles
  const myDataHandle = useProvides(MyComponentContract, 'myData')
  const otherDataHandle = useConsumes(MyComponentContract, 'otherData')

  // Read consumed data (reactive)
  const items = $derived(otherDataHandle.get()?.items ?? [])

  // Write provided data
  function updateValue(newValue: string) {
    myDataHandle.set({ value: newValue })
  }
</script>
```

### Configuring Bindings

In the page registry (database):

```typescript
{
  title: 'My Page',
  route: '/my-page',
  layout: { componentKey: 'layouts.List', enabled: true },
  snippets: {
    producer: {
      componentKey: 'myapp.DataProducer',
      enabled: true,
      // Default bindings: provides.data -> 'data'
    },
    consumer: {
      componentKey: 'myapp.DataConsumer',
      enabled: true,
      // Default bindings: consumes.data -> 'data'
    }
  }
}
```

### Custom Bindings

Wire the same component to different namespaces:

```typescript
snippets: {
  filtersPrimary: {
    componentKey: 'myapp.Filters',
    enabled: true,
    bindings: {
      provides: { filters: 'primaryFilters' }
    }
  },
  filtersSecondary: {
    componentKey: 'myapp.Filters',
    enabled: true,
    bindings: {
      provides: { filters: 'secondaryFilters' }
    }
  },
  tablePrimary: {
    componentKey: 'myapp.Table',
    enabled: true,
    bindings: {
      consumes: { filters: 'primaryFilters' }
    }
  },
  tableSecondary: {
    componentKey: 'myapp.Table',
    enabled: true,
    bindings: {
      consumes: { filters: 'secondaryFilters' }
    }
  }
}
```

## File Structure

```
src/lib/
├── contexts/
│   └── page-state/
│       ├── index.ts                 # Public exports
│       ├── types.ts                 # TypeScript types
│       ├── page-state.svelte.ts     # Reactive registry
│       └── bindings.svelte.ts       # Binding resolution, useProvides/useConsumes
├── contracts/
│   └── base-schemas.ts              # Reusable TypeBox schemas
└── components/
    ├── runtime/
    │   ├── SnippetResolver.svelte           # Loads components + contracts
    │   └── SnippetBindingsProvider.svelte   # Sets bindings context
    └── features/
        └── myfeature/
            └── MyComponent/
                ├── MyComponent.svelte
                └── MyComponent.contract.ts
```

## Key Files

| File | Purpose |
|------|---------|
| `page-state.svelte.ts` | Creates and manages the reactive state registry |
| `bindings.svelte.ts` | Resolves bindings, provides `useProvides`/`useConsumes` hooks |
| `types.ts` | TypeScript interfaces for contracts, bindings, handles |
| `SnippetResolver.svelte` | Loads component + contract, wraps with bindings provider |
| `SnippetBindingsProvider.svelte` | Sets resolved bindings in Svelte context |

## Advanced Topics

### Multiple Producers for Same Namespace

If multiple components need to write to the same logical namespace, create a "merger" meta-component that combines their outputs:

```typescript
// FilterMerger consumes from multiple sources and provides unified output
const FilterMergerContract = {
  $id: 'FilterMerger',
  provides: {
    filters: FilterStateSchema
  },
  consumes: {
    searchFilters: FilterStateSchema,
    quickFilters: FilterStateSchema
  }
}
```

### Validation (Future)

The system can validate at runtime that:
- Every `consumes` has a corresponding `provides` in the page
- Schemas are compatible (consumes is a subset of provides)

### Contract from Database (Future)

Contracts could be stored as JSON Schema in the database alongside the page configuration, enabling fully dynamic component wiring without code deployment.
