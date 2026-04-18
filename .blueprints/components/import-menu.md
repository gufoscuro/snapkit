# Import Menu

The **ImportMenu** is a generic, type-safe core component for letting users select multiple records from an async source and bulk-import them into a parent component. It is the standard pattern for any "import from X" workflow in SnapKit.

## When to Use

Use `ImportMenu` when you need to:

- Let users **bulk-select records** from an external source (API, list, etc.) and apply them to the current form
- Provide a **searchable, server-side filtered** picker (search text is passed to the fetch function)
- Show a **rich preview** on hover of each candidate record
- Render either as a **standalone button** or as a **sub-menu** inside another dropdown

Examples in the codebase:
- `SalesOrderItemsListEditor` uses it to import line items from approved quotations

For single-select scenarios, use `FormGenericSingleSelector` instead.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Parent component (e.g. SalesOrderItemsListEditor)          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  <ImportMenu                                          │  │
│  │    fetchFunction={search => api.get(...)}             │  │
│  │    optionMappingFunction={r => ({label, value})}      │  │
│  │    onimport={records => editorRef.addItems(records)}> │  │
│  │    {#snippet previewSnippet(record)}...{/snippet}     │  │
│  │  </ImportMenu>                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Trigger Button (IconDatabaseImport + label)          │  │
│  │    └─ DropdownMenu opens on click                     │  │
│  │       └─ Command (search + checkbox list)             │  │
│  │          └─ HoverCard per item (if previewSnippet)    │  │
│  │       └─ Import button at bottom                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core File

`$components/core/common/import-menu/ImportMenu.svelte`

Exported via the barrel:
```typescript
import { ImportMenu } from '$components/core/common/import-menu'
```

## Props

```typescript
interface Props<T> {
  fetchFunction: (search?: string) => Promise<T[]>
  optionMappingFunction: (item: T) => BasicOption
  onimport: (items: T[]) => void
  previewSnippet?: Snippet<[T]>
  label?: string
  submenu?: boolean
  disabled?: boolean
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fetchFunction` | `(search?: string) => Promise<T[]>` | — | **Required.** Async fetch. Receives debounced search query (300ms). Called on open and on each search change |
| `optionMappingFunction` | `(item: T) => BasicOption` | — | **Required.** Maps each `T` to `{ label, value }` for display + selection key |
| `onimport` | `(items: T[]) => void` | — | **Required.** Called with the selected raw `T[]` when user clicks Import |
| `previewSnippet` | `Snippet<[T]>` | — | Optional hover preview rendered in a HoverCard (400ms delay). Receives the raw `T` |
| `label` | `string` | `m.common_import()` | Trigger button label |
| `submenu` | `boolean` | `false` | When `true`, renders as a `DropdownMenu.Sub` (for nesting inside another menu) |
| `disabled` | `boolean` | `false` | Disable the trigger |

## The Generic Pattern

The component uses Svelte 5 generics (`<script lang="ts" generics="T">`) following the same pattern as `FormGenericSingleSelector`:

- **`fetchFunction`** returns the raw entity list (`T[]`) — keep API responses untransformed
- **`optionMappingFunction`** decides what's shown in the dropdown — typically `{ label: entity.name, value: entity.id }`
- **`onimport`** receives the original `T[]` (not the mapped options) — so the consumer has the full entity to do whatever it needs

This keeps the component fully decoupled from any specific entity shape.

## Usage Examples

### Standalone Trigger

```svelte
<script lang="ts">
  import { ImportMenu } from '$components/core/common/import-menu'
  import { apiRequest } from '$utils/request'
  import type { BasicOption } from '$lib/utils/generics'

  type Quotation = { id: string; document_number: string }

  async function fetchQuotations(search?: string): Promise<Quotation[]> {
    const res = await apiRequest<{ data: Quotation[] }>({
      url: '/legal-entities/X/quotations',
      method: 'GET',
      queryParams: { state: 'approved', ...(search ? { search } : {}) },
    })
    return res.data ?? []
  }

  function mapToOption(q: Quotation): BasicOption {
    return { label: q.document_number, value: q.id }
  }

  function handleImport(quotations: Quotation[]) {
    // ...do something with the selected quotations
  }
</script>

<ImportMenu
  fetchFunction={fetchQuotations}
  optionMappingFunction={mapToOption}
  onimport={handleImport} />
```

### With Hover Preview

```svelte
<ImportMenu
  fetchFunction={fetchQuotations}
  optionMappingFunction={mapToOption}
  onimport={handleImport}>
  {#snippet previewSnippet(quotation)}
    <div class="space-y-2">
      <p class="text-sm font-semibold">{quotation.document_number}</p>
      <p class="text-xs text-muted-foreground">
        {new Date(quotation.document_date).toLocaleDateString()}
      </p>
      <p class="text-xs">{quotation.items?.length} items</p>
    </div>
  {/snippet}
</ImportMenu>
```

### As a Sub-Menu

```svelte
<DropdownMenu.Root>
  <DropdownMenu.Trigger>...</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>Other action</DropdownMenu.Item>
    <ImportMenu submenu fetchFunction={...} optionMappingFunction={...} onimport={...} />
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Search Behavior

- The search input uses `oninput` (not `bind:value`) → calls `onSearchChange` → debounces 300ms → re-invokes `fetchFunction(search)`
- Server-side filtering: the search string is **passed to the API**, not filtered client-side
- `Command.Root` is configured with `shouldFilter={false}` to disable bits-ui's built-in client filter

## Hover Preview

When `previewSnippet` is provided, each item is wrapped in a `HoverCard`:
- `openDelay={400}` — 400ms hover before showing
- `closeDelay={0}` — closes immediately on leave
- `side="left"` — appears to the left of the dropdown (avoids viewport overflow)
- Width: `w-72`

The snippet receives the raw `T` (not the mapped option), so you can render any data from the original record.

## Closing the Dropdown

After clicking Import, the menu must close. The standard `bind:open` approach **does not work** because the shadcn-svelte `DropdownMenu` wrapper does not forward the `open` prop to the underlying bits-ui primitive (see `dropdown-menu.svelte` source).

**Workaround used**: dispatch an Escape `keydown` event, which bits-ui handles natively:

```typescript
function closeMenu() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  open = false
}
```

This works for both standalone and `submenu` modes.

## Lifecycle

| Event | Behavior |
|-------|----------|
| Menu opens | `selectedValues` cleared, search reset, `load()` called with no search |
| User types in search | Debounced 300ms, then `load(search)` called |
| User clicks an item | Toggled in `selectedValues` (SvelteSet) |
| Menu closes | Pending search debounce timer cleared |
| User clicks Import | Filters `items` by `selectedValues`, calls `onimport(selected)`, dispatches Escape to close |

## State Management

- **`items: T[]`** — the raw fetched records (held internally)
- **`selectedValues: SvelteSet<string>`** — the value-keys of selected items (uses `SvelteSet` from `svelte/reactivity` for fine-grained reactivity)
- **`searchValue: string`** — current search input
- **`loading: boolean`** — fetch in progress

## Internationalization

The component uses these existing i18n keys:
- `common_import` — default trigger label and import button text
- `common_loading` — shown while fetching
- `common_no_results` — shown when fetch returns empty
- `filters_search` — search input placeholder

## Related

- [`quotation-items-list-editor.md`](./quotation-items-list-editor.md) — The main consumer of ImportMenu via `SalesOrderItemsListEditor`
- [`table-filters.md`](./table-filters.md) — Similar pattern for filter dropdowns (`FilterTags` uses the same Command + checkbox layout)
