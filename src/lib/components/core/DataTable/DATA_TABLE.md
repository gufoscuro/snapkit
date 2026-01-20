# DataTable Component

A generic, reusable data table component built on TanStack Table with support for infinite loading, custom cell renderers, and i18n.

## Location

```
src/lib/components/core/DataTable/
├── index.ts
├── DataTable.svelte
└── DataTableSkeleton.svelte
```

## Import

```typescript
import { DataTable, DataTableSkeleton } from '$lib/components/core/DataTable'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | required | Array of data items to display |
| `columns` | `ColumnDef<T, unknown>[]` | required | TanStack Table column definitions |
| `loading` | `boolean` | `false` | Shows skeleton when true (initial load) |
| `hasMore` | `boolean` | `false` | Shows "Load More" button when true |
| `loadingMore` | `boolean` | `false` | Shows spinner on button when loading more |
| `onLoadMore` | `() => void \| Promise<void>` | - | Callback when "Load More" is clicked |
| `emptyState` | `Snippet` | - | Custom empty state (overrides i18n default) |
| `loadMoreLabel` | `string` | i18n default | Custom label for load more button |
| `stickyHeader` | `boolean` | `true` | Whether the header should stick to top when scrolling |
| `class` | `string` | - | Additional CSS classes |

## Basic Usage

```svelte
<script lang="ts">
  import { DataTable } from '$lib/components/core/DataTable'
  import type { ColumnDef } from '@tanstack/table-core'

  type User = {
    id: string
    name: string
    email: string
  }

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
  ]

  let data: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ]
</script>

<DataTable {data} {columns} />
```

## With Load More (Infinite Loading)

```svelte
<script lang="ts">
  import { DataTable } from '$lib/components/core/DataTable'
  import { apiRequest } from '$lib/utils/request'
  import { createQueryRequestObject, DEFAULT_ITEMS_LIMIT } from '$lib/utils/filters'
  import type { ColumnDef } from '@tanstack/table-core'

  type Order = {
    id: string
    status: string
    total: number
  }

  const columns: ColumnDef<Order>[] = [
    { accessorKey: 'id', header: 'Order ID' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'total', header: 'Total' },
  ]

  let data = $state<Order[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let hasMore = $state(true)

  async function fetchOrders(offset: number = 0) {
    const response = await apiRequest<Order[]>({
      url: 'supply/orders',
      queryParams: createQueryRequestObject({
        limit: DEFAULT_ITEMS_LIMIT,
        offset
      })
    })
    return response ?? []
  }

  async function loadInitial() {
    loading = true
    const items = await fetchOrders(0)
    data = items
    hasMore = items.length >= DEFAULT_ITEMS_LIMIT
    loading = false
  }

  async function handleLoadMore() {
    loadingMore = true
    const items = await fetchOrders(data.length)
    data = [...data, ...items]
    hasMore = items.length >= DEFAULT_ITEMS_LIMIT
    loadingMore = false
  }

  $effect(() => {
    loadInitial()
  })
</script>

<DataTable
  {data}
  {columns}
  {loading}
  {loadingMore}
  {hasMore}
  onLoadMore={handleLoadMore}
/>
```

## Custom Cell Renderers

Use `renderComponent` for Svelte components or `renderSnippet` for snippets:

```svelte
<script lang="ts">
  import { DataTable } from '$lib/components/core/DataTable'
  import { renderComponent, renderSnippet } from '$lib/components/ui/data-table'
  import { createRawSnippet } from 'svelte'
  import type { ColumnDef } from '@tanstack/table-core'
  import StatusBadge from './StatusBadge.svelte'

  type Order = {
    id: string
    status: 'pending' | 'shipped' | 'delivered'
    total: number
    createdAt: Date
  }

  const columns: ColumnDef<Order>[] = [
    { accessorKey: 'id', header: 'Order ID' },

    // Using a Svelte component
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => renderComponent(StatusBadge, {
        status: row.original.status
      }),
    },

    // Using a snippet for formatted values
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR'
        })
        const snippet = createRawSnippet<[{ value: string }]>((getValue) => ({
          render: () => `<span class="font-medium">${getValue().value}</span>`
        }))
        return renderSnippet(snippet, { value: formatter.format(row.original.total) })
      },
    },

    // Simple string transformation
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
    },
  ]
</script>
```

## Custom Empty State

```svelte
<DataTable {data} {columns}>
  {#snippet emptyState()}
    <div class="flex flex-col items-center gap-2">
      <span class="text-muted-foreground">No orders found</span>
      <Button onclick={createOrder}>Create your first order</Button>
    </div>
  {/snippet}
</DataTable>
```

## Architecture

The DataTable is a **presentational component**. Data fetching and state management live in the parent component (or a dedicated wrapper).

```
┌─────────────────────────────────────────────────────────────┐
│  FeatureTable (e.g., OrdersTable.svelte)                    │
│  - defines columns with specific renderers                  │
│  - implements fetchFunction(limit, offset)                  │
│  - manages state: data[], loading, hasMore                  │
│  - passes everything to <DataTable>                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  <DataTable>  (generic component)                           │
│  - receives data, columns, state flags                      │
│  - renders table with TanStack Table                        │
│  - shows skeleton, empty state, load more button            │
└─────────────────────────────────────────────────────────────┘
```

## Creating a Feature Table Component

Follow this pattern for domain-specific tables:

```
src/lib/components/features/<domain>/<EntityName>Table/
├── index.ts
└── default/<EntityName>Table.svelte
```

Example: `src/lib/components/features/supply/SupplyOrdersTable/`

## i18n

The component uses these translation keys:
- `datatable_no_data` - Default empty state message
- `datatable_load_more` - Load more button label

Override with `emptyState` snippet or `loadMoreLabel` prop if needed.
