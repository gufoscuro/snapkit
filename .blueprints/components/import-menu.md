# Import Menu

The **ImportMenu** is a generic, type-safe core component for letting users select multiple records from an async source and bulk-import them into a parent component. It is the standard pattern for any "import from X" workflow in SnapKit.

## When to Use

Use `ImportMenu` when you need to:

- Let users **bulk-select records** from an external source (API, list, etc.) and apply them to the current form
- Provide a **searchable, server-side filtered** picker (search text is passed to the fetch function)
- Show a **rich preview** on hover of each candidate record
- Render either as a **standalone button** or as a **sub-menu** inside another dropdown

Examples in the codebase:
- `SalesOrderDetails` imports line items from approved quotations (`compatKey` + `lockWhen` for payment composition)
- `WarehouseOrderDetails` imports from sales orders; `TransportDocumentDetails` imports from SOs and WOs (`compatKeyOf`)

For single-select scenarios, use `FormGenericSingleSelector` instead (or `singleSelect`).

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
  compatKey?: (item: T) => string
  lockWhen?: (item: T) => boolean
  label?: string
  submenu?: boolean
  disabled?: boolean
  singleSelect?: boolean
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fetchFunction` | `(search?: string) => Promise<T[]>` | — | **Required.** Async fetch. Receives debounced search query (300ms). Called on open and on each search change |
| `optionMappingFunction` | `(item: T) => BasicOption` | — | **Required.** Maps each `T` to `{ label, value }` for display + selection key |
| `onimport` | `(items: T[]) => void` | — | **Required.** Called with the selected raw `T[]` when user clicks Import |
| `previewSnippet` | `Snippet<[T]>` | — | Optional hover preview rendered in a HoverCard (400ms delay). Receives the raw `T` |
| `compatKey` | `(item: T) => string` | — | **Record-anchored lock.** The first selected item becomes the anchor; rows whose `compatKey` differs are disabled. Already-selected items stay enabled (deselectable). Clears when selection empties. Ignored in `singleSelect`. See [Compatibility locking](#compatibility-locking) |
| `lockWhen` | `(item: T) => boolean` | — | **Form-anchored lock.** Returns `true` to disable a row independently of `compatKey` (e.g. against the parent form's current state, which must reflect later edits). OR-combined with `compatKey`; selected items are never locked |
| `label` | `string` | `m.common_import()` | Trigger button label |
| `submenu` | `boolean` | `false` | When `true`, renders as a `DropdownMenu.Sub` (for nesting inside another menu) |
| `disabled` | `boolean` | `false` | Disable the trigger |
| `singleSelect` | `boolean` | `false` | Pick-one mode: clicking an item immediately calls `onimport([item])` and closes; no checkboxes/footer. `compatKey` ignored |

## The Generic Pattern

The component uses Svelte 5 generics (`<script lang="ts" generics="T">`) following the same pattern as `FormGenericSingleSelector`:

- **`fetchFunction`** returns the raw entity list (`T[]`) — keep API responses untransformed
- **`optionMappingFunction`** decides what's shown in the dropdown — typically `{ label: entity.name, value: entity.id }`
- **`onimport`** receives the original `T[]` (not the mapped options) — so the consumer has the full entity to do whatever it needs

This keeps the component fully decoupled from any specific entity shape.

## Compatibility locking

Multi-import flows often require all picked records to be mutually compatible (same customer,
incoterm, payment composition, …). Incompatible rows render **visible but not selectable**
(`opacity-50 cursor-not-allowed`, clicks rejected) rather than being hidden — so the user can
see *why* a sibling is excluded. Two predicates drive this:

- **`compatKey` — record-anchored.** The anchor is the `compatKey` of the **first selected**
  record; any row with a different key is locked. Use for *intra-session* consistency (after
  the first pick, the rest are constrained to it). Encode the compatibility-relevant fields
  into one string, e.g. `` `${customer_id}|${ship_to_address_id}|${incoterm}` ``.

- **`lockWhen` — form-anchored.** Locks rows based on state **outside** the picker (typically
  the parent document form), so it reflects edits made after import and constraints carried
  across separate import sessions. Guard it so it's inactive until that state is "pinned"
  (otherwise a fresh form locks everything).

They are **OR-combined**, and already-selected items are never locked (so deselect always
works). When both a value-derived constraint *and* an edit-reflecting constraint are needed
(e.g. payment composition), use **both** — `compatKey` alone misses post-import edits, and
`lockWhen` alone can't gate within a single pre-import selection. See
[`payment-composition.md`](./payment-composition.md) → *Import compatibility* for the worked
example.

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
- [`payment-composition.md`](./payment-composition.md) — Two-layer `compatKey` + `lockWhen` compatibility for payment composition
- [`table-filters.md`](./table-filters.md) — Similar pattern for filter dropdowns (`FilterTags` uses the same Command + checkbox layout)
