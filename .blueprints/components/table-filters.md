# Table Filters

Pattern for adding structured filters (enum, tags, date) to listing pages that use `ResourceTable`.

## Architecture

```
Page (+page.svelte)
├── SnippetResolver / PageState
│   ├── <XxxFilters config={filterConfig}>   ← domain filter wrapping GenericFilters
│   │       └── GenericFilters
│   │           ├── FilterDropdown             ← grouped + standalone filters
│   │           └── SearchFilter               ← debounced text search
│   └── <XxxTable>                             ← consumes filters via contract
│       └── ResourceTable
```

### Core pieces

| File | Role |
|------|------|
| `src/lib/utils/filters.ts` | Types (`FilterConfig`, `FilterQuery`, `QueryObject`), serialization, URL helpers |
| `src/lib/components/features/common/GenericFilters/` | UI shell: search input + optional FilterDropdown + action buttons |
| `src/lib/components/core/common/filter-dropdown/` | Sub-components for each filter type (FilterEnum, FilterTags, FilterDate, FilterStandalone) |
| `GenericFilters.contract.ts` | Contract providing `filters` state to sibling table components |

## How It Works

GenericFilters provides a `filters` state via the **contract system** (`useProvides`). The contract schema already supports both `search` and `query`:

```typescript
// GenericFilters.contract.ts
export const FilterStateSchema = Type.Object({
  search: Type.Optional(Type.String()),
  query: Type.Optional(Type.Record(Type.String(), Type.String())),
})
```

When you pass a `config: FilterConfig` prop to GenericFilters, it renders a `FilterDropdown` that populates the `query` object. The sibling table component consumes this via `useConsumes` and passes it to `ResourceTable` — no changes needed in the table.

## Filter Types

| Type | UI | Internal state | Serialized as |
|------|----|----------------|---------------|
| `enum` | RadioGroup (single select) | `string \| undefined` | `{ key: "value" }` |
| `tags` | Command (search + multi select) | `string[]` | `{ key: "a,b,c" }` |
| `date` | Calendar picker | `DateValue \| undefined` | `{ key: "2026-01-30T00:00:00.000Z" }` |

## Configuration

Define a `FilterConfig` object mapping filter keys to their configuration:

```typescript
import type { FilterConfig } from '$lib/utils/filters'
import * as m from '$lib/paraglide/messages'

const filterConfig: FilterConfig = {
  // Enum filter — single select via radio group
  status: {
    type: 'enum',
    label: m.status(),
    options: [
      { label: m.status_draft(), value: 'draft' },
      { label: m.status_confirmed(), value: 'confirmed' },
      { label: m.status_shipped(), value: 'shipped' },
    ],
  },

  // Tags filter — multi-select with searchable command list
  labels: {
    type: 'tags',
    label: m.labels(),
    fetchFunction: async () => {
      const { data } = await apiRequest({ url: 'labels', method: 'GET' })
      return data.map((l: string) => ({ label: l, value: l }))
    },
  },

  // Date filter (standalone) — renders as separate button, not inside dropdown
  from: {
    type: 'date',
    label: m.filters_from(),
    standalone: true,
    allowPast: true,
    allowFuture: false,
    dayBoundary: 'startOf',
  },

  to: {
    type: 'date',
    label: m.filters_to(),
    standalone: true,
    allowPast: true,
    allowFuture: false,
    dayBoundary: 'endOf',
  },
}
```

### Config properties reference

#### Common (all types)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `'enum' \| 'tags' \| 'date'` | — | **Required.** Filter type |
| `label` | `string` | — | **Required.** Display label |
| `standalone` | `boolean` | `false` | Render as separate button instead of inside dropdown |

#### Enum

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | `FilterOption[]` | — | Static options `{ label, value }` |
| `fetchFunction` | `() => Promise<FilterOption[]>` | — | Async options loader (used when `options` is not set) |

#### Tags

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | `FilterOption[]` | — | Static options |
| `fetchFunction` | `() => Promise<FilterOption[]>` | — | Async options loader |

#### Date

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `allowPast` | `boolean` | `true` | Allow selecting past dates |
| `allowFuture` | `boolean` | `true` | Allow selecting future dates |
| `dayBoundary` | `'startOf' \| 'endOf'` | `'startOf'` | Time boundary: `startOf` = 00:00:00, `endOf` = 23:59:59 |

### Options loading

Filters can provide options **statically** via `options` or **dynamically** via `fetchFunction`. If `fetchFunction` is provided (and `options` is not), options are loaded asynchronously on first render with a loading state.

### `standalone` flag

Filters with `standalone: true` render as **separate dropdown buttons** next to the main filter dropdown. Ideal for date pickers or filters important enough to always be visible.

Filters without `standalone` (or `standalone: false`) appear as **sub-menus** inside the main filter dropdown.

## Adding Filters to a Listing Page

### Step 1 — Define the filter config

In your domain filter component (e.g., `SalesOrdersFilters.svelte`), create a `FilterConfig`:

```svelte
<!--
  @component SalesOrdersFilters
  @description Filters for sales orders listing with status and date range.
  @keywords filter, search, sales-orders
  @uses GenericFilters
  @provides filters
-->

<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { FilterConfig } from '$lib/utils/filters'
  import { createRoute } from '$utils/route-builder.js'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()

  const filterConfig: FilterConfig = {
    status: {
      type: 'enum',
      label: m.status(),
      options: [
        { label: m.status_draft(), value: 'draft' },
        { label: m.status_confirmed(), value: 'confirmed' },
      ],
    },
  }
</script>

<GenericFilters {...props} config={filterConfig}>
  <Button variant="default" href={createRoute({ $id: 'sales-order-details' })}>
    {m.add_new_sales_order()}
  </Button>
</GenericFilters>
```

### Step 2 — That's it

No changes needed in:
- The **table component** (`SalesOrdersTable`) — it already consumes `filters` via the contract
- The **contract** — `FilterStateSchema` already supports `query`
- **ResourceTable** — it passes `filters` to the fetch function unchanged
- The **API fetcher** — `createQueryRequestObject` already flattens `query` into standalone params

## Data Flow

```
FilterDropdown
  ├── internalState (FilterInternalState)
  │     enum: string | undefined
  │     tags: string[]
  │     date: DateValue | undefined
  │
  └── serializeFilters() → QueryObject
        { status: "draft", labels: "foo,bar", from: "2026-01-01T00:00:00.000Z" }
              │
              ▼
GenericFilters.handleQueryChange()
  filtersHandle.set({ search, query })
              │
              ▼
Contract (useProvides → useConsumes)
  Table receives FilterQuery { search?, query? }
              │
              ▼
createQueryRequestObject(filterQuery)
  { search: "term", status: "draft", labels: ["foo", "bar"], from: "2026-01-01T00:00:00.000Z" }
              │
              ▼
apiRequest() serialization
  ?search=term&status=draft&labels=foo&labels=bar&from=2026-01-01T00:00:00.000Z
```

### Key serialization details

- **Enum**: string value as-is → standalone query param
- **Tags**: array joined by comma → `createQueryRequestObject` splits back into `string[]` → `apiRequest` serializes as repeated key (`key=a&key=b`)
- **Date**: `DateValue` → ISO string with time boundary (`startOf` = 00:00:00, `endOf` = 23:59:59)

## Component Reference

### FilterDropdown

Main orchestrator. Splits config into grouped (inside dropdown menu) and standalone (separate buttons).

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `config` | `FilterConfig` | Filter definitions |
| `query` | `QueryObject \| undefined` | Current query state |
| `onchange` | `(query: QueryObject \| undefined) => void` | Callback when filters change |

**Behavior:**
- Manages `FilterInternalState` internally via `$state`
- Deserializes from `query` prop on initialization
- Serializes back and calls `onchange` on every filter change (no "Apply" button)
- Shows active filter count badge on the dropdown trigger
- "Remove all filters" button clears all grouped filters

**Location:** `src/lib/components/core/common/filter-dropdown/FilterDropdown.svelte`

### FilterEnum

Single-select filter using `DropdownMenu.RadioGroup`.

- **Grouped mode**: Renders as a sub-menu inside the dropdown
- **Standalone mode**: Renders radio items directly
- Toggle behavior: selecting the same option twice deselects it
- Supports async `fetchFunction` for options loading

**Location:** `src/lib/components/core/common/filter-dropdown/FilterEnum.svelte`

### FilterTags

Multi-select filter using `Command` (searchable list with checkboxes).

- **Grouped mode**: Renders inside a sub-menu with search
- **Standalone mode**: Renders Command list directly
- Shows selected count badge
- "Remove filter" option in header clears selection
- Supports async `fetchFunction` for options loading

**Location:** `src/lib/components/core/common/filter-dropdown/FilterTags.svelte`

### FilterDate

Date picker using `Calendar` from `@internationalized/date`.

- **Grouped mode**: Calendar inside a sub-menu, shows formatted date
- **Standalone mode**: Calendar rendered directly
- Respects `allowPast` / `allowFuture` constraints
- "Remove filter" button when a date is selected

**Location:** `src/lib/components/core/common/filter-dropdown/FilterDate.svelte`

### FilterStandalone

Wrapper that renders any filter type as an independent button with a dropdown.

- Shows an active indicator dot when the filter has a value
- Delegates rendering to FilterEnum/FilterTags/FilterDate with `standalone: true`

**Location:** `src/lib/components/core/common/filter-dropdown/FilterStandalone.svelte`

## Utility Functions

All in `src/lib/utils/filters.ts`:

| Function | Signature | Description |
|----------|-----------|-------------|
| `serializeFilters` | `(config, state) → QueryObject` | Converts internal state to URL-safe query object |
| `deserializeFilters` | `(config, query) → FilterInternalState` | Converts query object back to internal state |
| `isFilterActive` | `(state, key) → boolean` | Checks if a specific filter has a value |
| `countActiveFilters` | `(config, state) → number` | Counts how many filters are active |
| `createQueryRequestObject` | `(filterQuery) → ExtendedFilterQueryObject` | Flattens FilterQuery for API requests |

## i18n Keys

The filter system uses these translation keys (already added):

```json
{
  "filters_label": "Filters",
  "filter_by": "Filter results by",
  "filters_remove": "Remove filter",
  "filters_remove_all": "Remove all filters",
  "filters_search": "Search..."
}
```

When adding date standalone filters, you may also need:

```json
{
  "filters_from": "From",
  "filters_to": "To"
}
```

## Best Practices

- **Filter keys must match API query param names.** The key in `FilterConfig` (e.g., `status`) becomes the query parameter sent to the API.

- **Use `standalone: true` for date filters.** Calendar pickers don't work well as nested sub-menus.

- **Prefer static `options` over `fetchFunction`** when the option set is small and known at compile time. Use `fetchFunction` only for dynamic data.

- **Use enum labels from the MCP server** when filtering by API enums:
  ```typescript
  // Use get-enum-labels MCP tool to get the correct values
  const statusOptions = [
    { label: m.enum_sales_order_status_draft(), value: 'draft' },
    { label: m.enum_sales_order_status_confirmed(), value: 'confirmed' },
  ]
  ```

- **Don't modify the contract.** `FilterStateSchema` already supports `query`. No changes needed.

- **Don't modify table components.** The `query` flows through the existing pipeline unchanged. Tables don't need to know about individual filter types.

## Adding a New Filter Type

If you need a filter type beyond enum/tags/date:

1. Add the config type to `src/lib/utils/filters.ts` (extend `FilterConfigEntry` union)
2. Add serialization/deserialization cases in `serializeFilters`/`deserializeFilters`
3. Create a new sub-component in `src/lib/components/core/common/filter-dropdown/`
4. Add the rendering case in `FilterDropdown.svelte` (grouped) and `FilterStandalone.svelte` (standalone)

## Existing Implementations

| Domain | File | Filters |
|--------|------|---------|
| (none yet) | — | All 18 domain filters currently use search-only mode |

To see the first implementation with structured filters, add a `FilterConfig` to any domain filter following the pattern above.
