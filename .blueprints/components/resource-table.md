# ResourceTable - Generic Data Table Component

## Overview

**ResourceTable** is a generic, declarative table component that abstracts common data table patterns, eliminating boilerplate code for fetching, pagination, filtering, and rendering.

**Key Benefits:**

- ✅ **70% less code** - Reduces typical table component from ~200 lines to ~60 lines
- ✅ **Declarative configuration** - Define columns with simple config objects
- ✅ **11 built-in renderers** - Common patterns like links, badges, dates, currency
- ✅ **Type-safe** - Full TypeScript support with generics
- ✅ **Consistent** - Same patterns across all tables
- ✅ **Extensible** - Easy to add custom renderers

**Location:** `src/lib/components/core/ResourceTable/`

---

## Architecture

### Component Structure

```
ResourceTable.svelte              # Main component with state & fetch logic
├── types.ts                      # TypeScript type definitions
├── renderers/                    # Built-in renderers
│   ├── text-renderer.ts          # Simple text with fallback
│   ├── link-renderer.ts          # Clickable links
│   ├── email-renderer.ts         # First email from array
│   ├── phone-renderer.ts         # First phone from array
│   ├── badge-renderer.ts         # Single badge with variants
│   ├── badges-renderer.ts        # Multiple badges (CategoryBadges)
│   ├── date-renderer.ts          # Date formatting
│   ├── currency-renderer.ts      # Currency formatting
│   ├── actions-renderer.ts       # Action buttons
│   ├── ActionsCell.svelte        # Actions UI component
│   ├── component-renderer.ts     # Custom component
│   └── custom-renderer.ts        # Full custom control
└── utils/
    └── column-resolver.ts        # Converts ColumnConfig → ColumnDef
```

### How it Works

1. **Declarative Column Configuration** - You define columns using `ColumnConfig<T>[]`
2. **Column Resolution** - `column-resolver` converts configs to TanStack Table `ColumnDef`
3. **Data Fetching** - Handles pagination, load more, and filter integration
4. **Rendering** - Delegates to `DataTable` with resolved columns

---

## Basic Usage

### 0. Create the Component Contract (MANDATORY)

Every table component that uses `ResourceTable` with filter integration **must** have a contract file that declares what it consumes from the page state.

Create `YourTable.contract.ts` alongside the component:

```typescript
// YourTable/default/YourTable.contract.ts
import { Type } from '@sinclair/typebox'
import type { ComponentContract } from '$lib/contexts/page-state'

export const ConsumedFilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String()))
})

export const YourTableContract = {
  $id: 'YourTable',
  provides: {},
  consumes: {
    filters: ConsumedFilterStateSchema
  }
} as const satisfies ComponentContract
```

Then export the contract from the component's `<script module>` block:

```svelte
<script lang="ts" module>
  export { YourTableContract as contract } from './YourTable.contract.js'
</script>
```

> **Why?** The table component itself must call `useConsumes` (see step 1). This requires it to be wrapped by `SnippetBindingsProvider`, which uses the exported contract to resolve bindings. Without the contract, `useConsumes` can't find a valid namespace and throws.

---

### 1. Import Required Components

```typescript
import { ResourceTable } from '$lib/components/core/ResourceTable'
import { useConsumes } from '$lib/contexts/page-state'
import { createApiFetcher } from '$lib/utils/table-fetchers'
import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
import type { FilterQuery } from '$lib/utils/filters'
import { YourTableContract } from './YourTable.contract.js'
```

### 2. Define Column Configuration

```typescript
const columns: ColumnConfig<YourType>[] = [
  {
    accessorKey: 'name',
    header: m.name(),
    renderer: 'link',
    rendererConfig: {
      urlBuilder: (row) => `/items/${row.id}`
    }
  },
  {
    accessorKey: 'status',
    header: m.status(),
    renderer: 'badge',
    rendererConfig: {
      variantMapper: (status) => status === 'active' ? 'brand' : 'secondary',
      labelMapper: (status) => status.toUpperCase()
    }
  },
  {
    accessorKey: 'email',
    header: m.email(),
    renderer: 'email'
  }
]
```

### 3. Read filters from page state and create fetch function

Call `useConsumes` at the top level of the script (NOT inside `{#if}` blocks):

```typescript
// Read filters from page state — MUST be called at top level
const filtersHandle = useConsumes(YourTableContract, 'filters')
const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

const fetchItems = createApiFetcher<YourType>('api/endpoint')
// Returns: (page: number, filters?: FilterQuery) => Promise<PaginatedResponse<YourType>>
```

### 4. Render ResourceTable

Pass `{filters}` directly — ResourceTable will react to filter changes:

```svelte
<ResourceTable {columns} fetchFunction={fetchItems} {filters} class="mt-4" />
```

> **Why not `filtersContract` on ResourceTable?** `ResourceTable` is a generic core component — it should not depend on the page state context system. The table feature component (which IS wrapped by `SnippetBindingsProvider`) reads filters and passes them as a plain reactive prop.

---

## Available Renderers

### 1. **text** - Simple Text with Fallback

Displays text value or "-" if empty.

```typescript
{
  accessorKey: 'vat_no',
  header: m.vat(),
  renderer: 'text'
}
```

---

### 2. **link** - Clickable Links

Creates links to detail pages.

```typescript
{
  accessorKey: 'name',
  header: m.supplier(),
  renderer: 'link',
  rendererConfig: {
    urlBuilder: (row) => createRoute({
      $id: 'supplier-details',
      params: { uuid: row.id }
    })
  }
}
```

---

### 3. **email** - First Email from Array

Extracts first email from an email array.

**Expected data structure:**

```typescript
emails: [{ email: "test@example.com" }, ...]
```

**Usage:**

```typescript
{
  accessorKey: 'emails',
  header: m.email(),
  renderer: 'email'
}
```

**Custom accessor (optional):**

```typescript
{
  accessorKey: 'contacts',
  header: m.email(),
  renderer: 'email',
  rendererConfig: {
    accessor: (row) => row.contacts.filter(c => c.type === 'email')
  }
}
```

---

### 4. **phone** - First Phone from Array

Extracts first phone from a phone array.

**Expected data structure:**

```typescript
phones: [{ phone: "+39 123456789" }, ...]
```

**Usage:**

```typescript
{
  accessorKey: 'phones',
  header: m.phone(),
  renderer: 'phone'
}
```

---

### 5. **badge** - Single Badge with Variant

Renders a single badge with dynamic variant and label.

```typescript
{
  accessorKey: 'status',
  header: m.status(),
  renderer: 'badge',
  rendererConfig: {
    variantMapper: (status) => {
      if (status === 'active') return 'brand'
      if (status === 'pending') return 'default'
      return 'secondary'
    },
    labelMapper: (status) => status.toUpperCase() // Optional
  }
}
```

**Available variants:** `'default' | 'secondary' | 'brand' | 'destructive' | 'outline'`

---

### 6. **badges** - Multiple Badges Component

Renders multiple badges using a custom component (e.g., CategoryBadges).

```typescript
{
  accessorKey: 'categories',
  header: m.categories(),
  renderer: 'badges',
  rendererConfig: {
    component: CategoryBadges
  }
}
```

**Custom accessor:**

```typescript
{
  accessorKey: 'tags',
  header: m.tags(),
  renderer: 'badges',
  rendererConfig: {
    component: TagBadges,
    accessor: (row) => row.metadata.tags
  }
}
```

---

### 7. **date** - Date Formatting

Formats dates using `Intl.DateTimeFormat`.

```typescript
{
  accessorKey: 'created_at',
  header: m.created(),
  renderer: 'date',
  rendererConfig: {
    format: 'short',  // 'short' | 'long' | 'iso'
    locale: 'it-IT'   // Optional, defaults to user locale
  }
}
```

---

### 8. **currency** - Currency Formatting

Formats currency using `Intl.NumberFormat`.

```typescript
{
  accessorKey: 'total',
  header: m.total(),
  renderer: 'currency',
  rendererConfig: {
    currencyAccessor: (row) => row.default_currency || 'EUR',
    locale: 'en-US'  // Optional
  }
}
```

---

### 9. **actions** - Action Buttons

Renders action buttons (single button or multiple).

**Single action:**

```typescript
{
  renderer: 'actions',
  rendererConfig: {
    actions: [
      {
        icon: Archive,
        variant: 'ghost',
        onClick: async (row, helpers) => {
          await archiveItem(row.id)
          helpers.removeRow(row.id)
        }
      }
    ]
  },
  meta: {
    cellClassName: 'p-0 w-12'
  }
}
```

**Multiple actions (TODO - currently renders buttons side by side):**

```typescript
{
  renderer: 'actions',
  rendererConfig: {
    actions: [
      {
        label: m.common_edit(),
        icon: Pencil,
        onClick: (row) => goto(`/items/${row.id}/edit`)
      },
      {
        label: m.common_delete(),
        icon: Trash,
        variant: 'destructive',
        onClick: (row, helpers) => {
          await deleteItem(row.id)
          helpers.removeRow(row.id)
        }
      }
    ]
  }
}
```

**Action helpers:**

- `helpers.removeRow(id)` - Optimistically remove row
- `helpers.updateRow(id, updates)` - Optimistically update row
- `helpers.refresh()` - Refetch all data

**Conditional visibility/disable:**

```typescript
{
  label: m.common_edit(),
  icon: Pencil,
  visible: (row) => row.status !== 'archived',
  disabled: (row) => row.isLocked,
  onClick: (row) => goto(`/items/${row.id}/edit`)
}
```

---

### 10. **component** - Custom Component

Renders a custom Svelte component.

```typescript
{
  accessorKey: 'supplier',
  header: m.supplier(),
  renderer: 'component',
  rendererConfig: {
    component: SupplierCard,
    propsMapper: (row) => ({
      supplier: row.supplier,
      compact: true
    })
  }
}
```

---

### 11. **custom** - Full Custom Control

Complete control over cell rendering.

```typescript
{
  accessorKey: 'risk_score',
  header: m.risk(),
  renderer: 'custom',
  rendererConfig: {
    cellRenderer: (row) => {
      const score = row.risk_score
      const color = score > 80 ? 'red' : score > 50 ? 'orange' : 'green'
      return `<span class="text-${color}-600 font-bold">${score}%</span>`
    }
  }
}
```

---

## Utilities

### createApiFetcher<T>(url: string)

Creates a generic fetch function compatible with ResourceTable.

**Handles:**

- Pagination (page-based, Laravel standard)
- Filtering (via `FilterQuery`)
- Error handling

**Returns:** `(page: number, filters?: FilterQuery) => Promise<PaginatedResponse<T>>`

The response includes `data`, `links` (with `next`/`prev` for load-more detection), and `meta` (with `current_page`, `last_page`, `total`, etc.).

**Usage:**

```typescript
const fetchSuppliers = createApiFetcher<SupplierSummary>('supply/supplier')

<ResourceTable
  columns={columns}
  fetchFunction={fetchSuppliers}
/>
```

**Location:** `src/lib/utils/table-fetchers.ts`

---

### createArchiveAction<T>(config)

Creates a standardized archive action with confirmation dialog.

**Features:**

- Archive icon (lucide-svelte)
- Confirmation dialog
- API DELETE request
- Success/error toasts
- Optimistic row removal

**Usage:**

```typescript
import { createArchiveAction } from '$lib/utils/table-actions'

{
  renderer: 'actions',
  rendererConfig: {
    actions: [
      createArchiveAction({
        apiUrl: (supplier) => `supply/supplier/${supplier.id}`,
        confirmMessage: (supplier) =>
          m.archive_supplier_confirmation({ name: supplier.name || '' }),
        successMessage: (supplier) =>
          m.supplier_archived_success({ name: supplier.name || '' }),
        errorMessage: m.supplier_archive_error()
      })
    ]
  }
}
```

**Config type:**

```typescript
type ArchiveActionConfig<T> = {
  apiUrl: (row: T) => string
  confirmMessage: (row: T) => string
  successMessage: (row: T) => string
  errorMessage?: string
  onSuccess?: (row: T) => void
}
```

**Location:** `src/lib/utils/table-actions.ts`

---

## Creating Table Variants

Different use cases require different column configurations. Here's how to create variants:

### Variant 1: Compact View

Show only essential columns:

```typescript
// SuppliersTable/compact/SuppliersTable.svelte
const columns: ColumnConfig<SupplierSummary>[] = [
  {
    accessorKey: 'name',
    header: m.supplier(),
    renderer: 'link',
    rendererConfig: { urlBuilder: (row) => `/suppliers/${row.id}` }
  },
  {
    accessorKey: 'emails',
    header: m.email(),
    renderer: 'email'
  }
]
```

### Variant 2: Full View

Show all available information:

```typescript
// SuppliersTable/full/SuppliersTable.svelte
const columns: ColumnConfig<SupplierSummary>[] = [
  { accessorKey: 'name', header: m.supplier(), renderer: 'link', ... },
  { accessorKey: 'categories', header: m.categories(), renderer: 'badges', ... },
  { accessorKey: 'emails', header: m.email(), renderer: 'email' },
  { accessorKey: 'phones', header: m.phone(), renderer: 'phone' },
  { accessorKey: 'vat_no', header: m.vat(), renderer: 'text' },
  { accessorKey: 'address', header: m.address(), renderer: 'text' },
  { accessorKey: 'created_at', header: m.created(), renderer: 'date' },
  { renderer: 'actions', ... }
]
```

### Variant 3: Selection View (for Selector Components)

Simple table for selecting items (no actions):

```typescript
// SuppliersTable/selector/SuppliersTable.svelte
const columns: ColumnConfig<SupplierSummary>[] = [
  {
    accessorKey: 'name',
    header: m.supplier(),
    renderer: 'link',
    rendererConfig: { urlBuilder: (row) => `/suppliers/${row.id}` }
  },
  {
    accessorKey: 'vat_no',
    header: m.vat(),
    renderer: 'text'
  }
  // No actions column
]
```

### Directory Structure for Variants

```
src/lib/components/features/supply/SuppliersTable/
├── default/
│   └── SuppliersTable.svelte       # Full-featured table
├── compact/
│   └── SuppliersTable.svelte       # Minimal columns
└── selector/
    └── SuppliersTable.svelte       # For selection dialogs
```

---

## Extending with Custom Renderers

### When to Create a Custom Renderer

Create a custom renderer when:

- ✅ The pattern is used in **3+ tables**
- ✅ The logic is **reusable** across domains
- ✅ It encapsulates **complex rendering logic**

### How to Create a Custom Renderer

**Example: Status Badge Renderer**

1. **Create renderer file:**

```typescript
// src/lib/components/core/ResourceTable/renderers/status-badge-renderer.ts
import { createRawSnippet } from 'svelte'
import { renderComponent } from '$lib/components/ui/data-table'
import Badge from '$lib/components/ui/badge/badge.svelte'
import type { CellContext } from '@tanstack/table-core'
import type { ColumnConfig } from '../types'

export function createStatusBadgeRenderer<T>(config: ColumnConfig<T>) {
  return (context: CellContext<T, unknown>) => {
    const value = context.getValue()

    // Auto-detect variant based on status
    const variant =
      value === 'active' ? 'brand' :
      value === 'pending' ? 'default' :
      'secondary'

    const children = createRawSnippet(() => ({
      render: () => `<span>${String(value).toUpperCase()}</span>`
    }))

    return renderComponent(Badge, { variant, children })
  }
}
```

2. **Add to column-resolver:**

```typescript
// utils/column-resolver.ts
import { createStatusBadgeRenderer } from '../renderers/status-badge-renderer'

// In switch statement:
case 'status-badge':
  return { ...base, cell: createStatusBadgeRenderer(config) }
```

3. **Add type to RendererType:**

```typescript
// types.ts
export type RendererType =
  | 'text'
  | 'link'
  // ...
  | 'status-badge'  // Add new type
  | 'custom'
```

4. **Usage:**

```typescript
{
  accessorKey: 'status',
  header: m.status(),
  renderer: 'status-badge'  // No config needed!
}
```

---

## Best Practices

### 1. Always Use Type Generics

```typescript
const columns: ColumnConfig<SupplierSummary>[] = [...]
const fetchSuppliers = createApiFetcher<SupplierSummary>('supply/supplier')
```

### 2. Use Utilities for Common Patterns

❌ **Don't:**

```typescript
{
  renderer: 'actions',
  rendererConfig: {
    actions: [{
      icon: Archive,
      onClick: async (row, helpers) => {
        // 20 lines of archive logic...
      }
    }]
  }
}
```

✅ **Do:**

```typescript
{
  renderer: 'actions',
  rendererConfig: {
    actions: [
      createArchiveAction({
        apiUrl: (row) => `supply/supplier/${row.id}`,
        confirmMessage: (row) => m.archive_supplier_confirmation({ name: row.name }),
        successMessage: (row) => m.supplier_archived_success({ name: row.name })
      })
    ]
  }
}
```

### 3. Keep Column Configs Clean

Group related columns, use consistent ordering:

```typescript
const columns: ColumnConfig<SupplierSummary>[] = [
  // Identity
  { accessorKey: 'name', header: m.supplier(), renderer: 'link', ... },

  // Categories/Tags
  { accessorKey: 'categories', header: m.categories(), renderer: 'badges', ... },

  // Contact Information
  { accessorKey: 'emails', header: m.email(), renderer: 'email' },
  { accessorKey: 'phones', header: m.phone(), renderer: 'phone' },

  // Other Fields
  { accessorKey: 'vat_no', header: m.vat(), renderer: 'text' },

  // Actions (always last)
  { renderer: 'actions', ... }
]
```

### 4. Use Conditional Rendering for Actions

```typescript
{
  label: m.common_edit(),
  icon: Pencil,
  visible: (row) => row.status !== 'archived',
  disabled: (row) => !row.canEdit,
  onClick: (row) => goto(`/items/${row.id}/edit`)
}
```

### 5. Handle Optional Fields Safely

Use optional chaining and fallbacks:

```typescript
{
  accessorKey: 'name',
  header: m.supplier(),
  renderer: 'link',
  rendererConfig: {
    urlBuilder: (row) => createRoute({
      $id: 'supplier-details',
      params: { uuid: row.id! }  // Non-null assertion if you're sure
    })
  }
}
```

### 6. Create Reusable Column Fragments

For commonly repeated column patterns:

```typescript
// utils/column-fragments.ts
export function createNameColumn<T extends { id?: string, name?: string }>(
  route: string
): ColumnConfig<T> {
  return {
    accessorKey: 'name',
    header: m.name(),
    renderer: 'link',
    rendererConfig: {
      urlBuilder: (row) => `/${route}/${row.id}`
    }
  }
}

// Usage:
const columns = [
  createNameColumn<SupplierSummary>('suppliers'),
  // ... other columns
]
```

---

## Complete Example: SuppliersTable

**Before (198 lines):**

```svelte
<script lang="ts">
  import { DataTable } from '$lib/components/core/DataTable'
  import { renderComponent, renderSnippet } from '$lib/components/ui/data-table'
  import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
  // ... 15+ imports

  // ... 50+ lines of column definitions with createRawSnippet
  // ... 30+ lines of fetch logic
  // ... 20+ lines of archive handler
  // ... $effect for reload
</script>

<DataTable {data} {columns} {loading} {loadingMore} {hasMore} onLoadMore={handleLoadMore} />
```

**After (93 lines):**

```svelte
<script lang="ts">
  import { ResourceTable } from '$lib/components/core/ResourceTable'
  import { useConsumes } from '$lib/contexts/page-state'
  import { createApiFetcher } from '$lib/utils/table-fetchers'
  import { createArchiveAction } from '$lib/utils/table-actions'
  import { createRoute } from '$utils/route-builder.js'
  import type { SupplierSummary } from '$lib/types/api-types'
  import type { ColumnConfig } from '$lib/components/core/ResourceTable/types'
  import type { FilterQuery } from '$lib/utils/filters'
  import * as m from '$lib/paraglide/messages.js'
  import CategoryBadges from '../../CategoryBadges.svelte'
  import { SuppliersTableContract } from './SuppliersTable.contract.js'

  const filtersHandle = useConsumes(SuppliersTableContract, 'filters')
  const filters = $derived(filtersHandle.get() as FilterQuery | undefined)

  const columns: ColumnConfig<SupplierSummary>[] = [
    {
      accessorKey: 'name',
      header: m.supplier(),
      renderer: 'link',
      rendererConfig: {
        urlBuilder: row =>
          createRoute({
            $id: 'supplier-details',
            params: { uuid: row.id! },
          }),
      },
    },
    {
      accessorKey: 'categories',
      header: m.categories(),
      renderer: 'badges',
      rendererConfig: { component: CategoryBadges },
    },
    {
      accessorKey: 'emails',
      header: m.email(),
      renderer: 'email',
    },
    {
      accessorKey: 'phones',
      header: m.phone(),
      renderer: 'phone',
    },
    {
      accessorKey: 'vat_no',
      header: m.vat(),
      renderer: 'text',
    },
    {
      renderer: 'actions',
      rendererConfig: {
        actions: [
          createArchiveAction({
            apiUrl: supplier => `supply/supplier/${supplier.id}`,
            confirmMessage: supplier => m.archive_supplier_confirmation({ name: supplier.name || '' }),
            successMessage: supplier => m.supplier_archived_success({ name: supplier.name || '' }),
            errorMessage: m.supplier_archive_error(),
          }),
        ],
      },
      meta: { cellClassName: 'p-0 w-12' },
    },
  ]

  const fetchSuppliers = createApiFetcher<SupplierSummary>('supply/supplier')
</script>

<ResourceTable {columns} fetchFunction={fetchSuppliers} {filters} class="mt-4" />
```

**Result:** 53% less code, more readable, fully type-safe!

---

## Future Enhancements

### Short-term

- [ ] Implement dropdown menu for multiple actions (currently renders side-by-side)
- [ ] Add more built-in renderers as patterns emerge
- [ ] Create common action helpers (edit, delete, duplicate)

### Long-term (Visual Table Builder)

- [ ] JSON-serializable config format
- [ ] String-based component registry
- [ ] Template interpolation (`"/suppliers/{id}"`)
- [ ] Admin UI for drag-and-drop table configuration

---

## Summary

**ResourceTable** dramatically simplifies table component development by:

✅ Eliminating boilerplate fetch/pagination/filter logic
✅ Providing declarative column configuration
✅ Offering 11 built-in renderers for common patterns
✅ Including utilities for recurring actions
✅ Maintaining full type safety
✅ Being extensible for custom needs

**Use ResourceTable for:**

- List views with pagination
- Admin panels with CRUD operations
- Data tables with filtering
- Selection dialogs
- Any table with standard patterns

**Don't use ResourceTable for:**

- Tables with very custom, one-off logic
- Tables that don't fit the pagination + filters pattern
- Ultra-simple tables (< 3 columns, no actions)
