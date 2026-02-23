# Breadcrumbs

Dynamic breadcrumbs built from the page hierarchy configuration, rendered in the main layout header.

## How It Works

`Breadcrumbs.svelte` reads `entityConfig.dashboard.pages` (the full page tree), finds the path from the root to the current page (`pageDetails.config.$id`), and renders one crumb per level.

- **Ancestor pages** (all but the last) → clickable `Breadcrumb.Link`, URL built with `createRoute({ $id })`
- **Current page** (last) → non-clickable `Breadcrumb.Page`, label from `getI18nLabel(page.title)` **or** a record title override (see below)

The crumbs are only shown when the page is found in the hierarchy (even root pages with no ancestors show a single crumb).

## Record Title Override

By default the last crumb shows the page title (e.g. `customer_details`). Detail components can override it to show the actual record name (e.g. `Acme Inc.`).

### Utility: `useBreadcrumbTitle`

```ts
// src/lib/utils/breadcrumb-title.ts
import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
```

Returns `{ set(title: string), clear() }`. Must be called **synchronously during component initialisation** (like `useProvides`), because it calls `getContext` internally. The returned handles are then safe to use anywhere, including inside async functions.

### Implementing It in a Detail Component

```svelte
<script lang="ts">
  import { useBreadcrumbTitle } from '$lib/utils/breadcrumb-title'
  import { onMount } from 'svelte'

  // ✅ Called synchronously at init — getContext works here
  const breadcrumbTitle = useBreadcrumbTitle()

  async function fetchRecord() {
    const { data } = await safeApiRequest({ ... })
    if (data) {
      // ✅ Safe to call inside async — uses the handle captured above
      breadcrumbTitle.set(data.name)
    }
  }

  onMount(() => {
    fetchRecord()

    return () => {
      // Clean up when the component unmounts
      breadcrumbTitle.clear()
    }
  })
</script>
```

> **Important:** Do **not** call `useBreadcrumbTitle()` inside an async function or a callback. The returned `set`/`clear` handles can be called anywhere, but `useBreadcrumbTitle()` itself must run at component init time.

### What the User Sees

| Situation | Last crumb |
|-----------|------------|
| Page loaded, fetch pending | `customer_details` (i18n title) |
| Fetch resolved | `Acme Inc.` (record name) |
| Component unmounted (navigated away) | title cleared, next page shows its own crumb |

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/components/features/globals/Breadcrumbs.svelte` | Renders the breadcrumb bar; reads page hierarchy and record title override |
| `src/lib/utils/breadcrumb-title.ts` | `useBreadcrumbTitle()` factory — bridges detail components and the breadcrumb bar via page state |
| `src/lib/components/features/layouts/LeftSidebar.svelte` | Mounts `Breadcrumbs` as fallback for the `header` snippet slot |

## Architecture Note

The record title is stored in the shared `PageState` under the reserved key `__breadcrumb_title`. Both `Breadcrumbs` and the detail component live under the same `+page.svelte` that calls `initPageState()`, so they share the same reactive registry. When a detail component calls `breadcrumbTitle.set(...)`, `Breadcrumbs` updates automatically because it reads from `$derived(pageState.get('__breadcrumb_title'))`.

```
+page.svelte  ──  initPageState()
    │
    ├── Breadcrumbs.svelte           reads  __breadcrumb_title  (reactive)
    │
    └── CustomerDetails.svelte       writes __breadcrumb_title  via useBreadcrumbTitle()
```
