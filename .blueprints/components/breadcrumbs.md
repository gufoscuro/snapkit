# Breadcrumbs

Dynamic breadcrumbs built from the page hierarchy configuration, rendered in the main layout header.

## How It Works

`Breadcrumbs.svelte` reads `entityConfig.dashboard.pages` (the full page tree), finds the path from the root to the current page (`pageDetails.config.$id`), and renders one crumb per level.

For **every** crumb (both ancestors and current page), the label is resolved as:

1. `breadcrumbLabels[page.$id]` — a custom label set via `setLabel(pageId, label)`
2. `getI18nLabel(page.title)` — the default i18n page title

This means any crumb in the chain can display a dynamic label (e.g. entity name) instead of the generic page title.

## Setting Breadcrumb Labels

### Utility: `useBreadcrumbTitle`

```ts
// src/lib/utils/breadcrumb-title.ts
import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
```

Must be called **synchronously during component initialisation** (like `useProvides`), because it calls `getContext` internally. The returned handles are safe to use anywhere, including inside async functions.

### API

| Method | Description |
|--------|-------------|
| `setLabel(pageId, label)` | Set label for a page by its `$id` |
| `clearLabel(pageId)` | Clear label for a specific page |

### Setting the Current Page Label (Config-Driven Detail Components)

Use `setLabel` with `pageDetails.config.$id`:

```svelte
<script lang="ts">
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { useDetailRecord } from '$lib/hooks/use-detail-record.svelte'
  import type { SnippetProps } from '$utils/runtime'

  let { pageDetails, legalEntity }: SnippetProps = $props()
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<Customer>({
    // ...
    onFetched: data => {
      breadcrumbTitle.setLabel(pageDetails.config.$id, data.name)
    },
    cleanup: () => {
      breadcrumbTitle.clearLabel(pageDetails.config.$id)
    },
  })
</script>
```

### Setting the Current Page Label (Settings Detail Components)

Settings components receive `pageId` as a prop from their `+page.svelte`:

```svelte
<script lang="ts">
  let { legalEntity, uuid, pageId }: { ...; pageId?: string } = $props()
  const breadcrumbTitle = useBreadcrumbTitle()

  const detail = useDetailRecord<Entity>({
    // ...
    onFetched: data => {
      if (pageId) breadcrumbTitle.setLabel(pageId, data.name)
    },
    cleanup: () => {
      if (pageId) breadcrumbTitle.clearLabel(pageId)
    },
  })
</script>
```

### Setting a Parent Page Label (Sub-Page Components)

Use `setLabel(pageId, label)` to set a label for an ancestor crumb. This is used by sub-page components (tables and detail forms) that fetch the parent entity:

```svelte
<script lang="ts">
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { onDestroy, onMount } from 'svelte'

  const breadcrumbTitle = useBreadcrumbTitle()

  onMount(async () => {
    const supplier = await api.get<Supplier>(...)
    breadcrumbTitle.setLabel('supplier-details', supplier.name)
  })

  onDestroy(() => {
    breadcrumbTitle.clearLabel('supplier-details')
  })
</script>
```

This ensures that when viewing e.g. supplier addresses, the breadcrumb shows:
`Fornitori > Express Logistics S.r.l. > Indirizzi`
instead of:
`Fornitori > Dettagli fornitore > Indirizzi`

> **Important:** Do **not** call `useBreadcrumbTitle()` inside an async function or a callback. The returned handles can be called anywhere, but `useBreadcrumbTitle()` itself must run at component init time.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/components/features/globals/Breadcrumbs.svelte` | Renders the breadcrumb bar; reads page hierarchy and label overrides |
| `src/lib/utils/breadcrumb-title.ts` | `useBreadcrumbTitle()` factory — bridges components and the breadcrumb bar via page state |
| `src/lib/components/features/layouts/LeftSidebar.svelte` | Mounts `Breadcrumbs` as fallback for the `header` snippet slot |

## Architecture

Labels are stored in the shared `PageState` under the reserved key `__breadcrumb_labels` as a `Record<string, string>` map (page `$id` → label).

```
+page.svelte  ──  initPageState()
    │
    ├── Breadcrumbs.svelte              reads  __breadcrumb_labels  (reactive)
    │
    ├── SupplierDetails.svelte          writes __breadcrumb_labels['supplier-details']  via setLabel()
    │
    └── SupplierAddressesTable.svelte   writes __breadcrumb_labels['supplier-details']  via setLabel()
```
