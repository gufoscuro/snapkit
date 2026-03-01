# Fixed Pages

Fixed pages are SvelteKit **file-based routes** used for sections with a known, stable structure — primarily **Settings** and **Admin**. Unlike configurable pages (which use the catch-all `[...path]` route and `SnippetResolver`), fixed pages mount components statically and use hardcoded navigation.

## When to use fixed pages

Use fixed pages when:
- The page structure is **known at build time** and does not change per tenant
- There is **no admin-configurable layout** (no SnippetResolver)
- The section has its own **dedicated sidebar** with fixed menu items
- Examples: Settings, Admin panel, Onboarding wizards

Use configurable pages (catch-all) when:
- Admins control which components appear on the page
- The page is part of the main application (customers, orders, products)
- Navigation is dynamic and menu-driven

---

## Key differences from configurable pages

| Aspect | Configurable pages | Fixed pages |
|---|---|---|
| Route type | Catch-all `[...path]` | File-based (`+page.svelte`) |
| Component mounting | `SnippetResolver` | Static in template |
| Navigation | `createRoute({ $id })` | Hardcoded `href` |
| Route params | `pageDetails.params` | `page.params` from `$app/state` |
| Sidebar | Dynamic from `entityConfig.dashboard.menus` | Fixed items with `href` |
| Snippet bindings | `SnippetBindingsProvider` (automatic) | `setSnippetBindings()` (manual) |
| Page config | Registered in `entityConfig.dashboard.pages` | Not registered |
| Post-create navigation | `createRoute({ $id: detailPageId })` | `goto('/fixed/path/${id}')` |

---

## Layout structure

Fixed page sections share a common layout pattern:

```
src/routes/(app)/settings/
  +layout.svelte       ← Sidebar + main area + pageState init
  +page.svelte         ← Section overview (e.g. Settings home)
  product-families/
    +page.svelte       ← List page
    upsert/
      [[uuid]]/
        +page.svelte   ← Create/edit page (uuid optional)
```

### Layout setup

The section layout initializes `pageState` and provides `SnippetProps` via context, just like configurable pages:

```svelte
<script lang="ts">
  import SectionSidebar from '$components/features/globals/sidebars/SectionSidebar.svelte'
  import * as Sidebar from '$components/ui/sidebar'
  import { initPageState } from '$lib/contexts/page-state'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { setContext } from 'svelte'
  import type { PageProps } from '../$types'

  let { data, children }: PageProps & { children?: () => any } = $props()
  let { pageDetails, routeDetails, entityConfig, legalEntity, user } = $derived(data)

  initPageState()

  setContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY, () => ({
    pageDetails,
    routeDetails,
    entityConfig,
    legalEntity,
    user,
  }))
</script>

<Sidebar.Provider>
  <div class="flex h-screen w-full overflow-hidden">
    <SectionSidebar {...data} />
    <main class="flex h-screen flex-1 flex-col overflow-y-scroll" data-scrollable-content>
      {@render children?.()}
    </main>
  </div>
</Sidebar.Provider>
```

> **Note:** `pageDetails` and `routeDetails` will be `undefined` for fixed pages since they come from the configurable page system. This is expected — fixed page components should not rely on `pageDetails`.

---

## Sidebar with fixed links

Fixed page sidebars use direct `href` links instead of `pageId` + `createRoute()`:

```svelte
<script lang="ts">
  import { page } from '$app/state'
  import * as Sidebar from '$lib/components/ui/sidebar/index.js'
  import * as m from '$lib/paraglide/messages'

  type SectionMenuItem = {
    label: string
    href: string
  }

  const items: SectionMenuItem[] = [
    { label: m.overview(), href: '/settings' },
    { label: m.product_family(), href: '/settings/product-families' },
    // ... more items
  ]
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>{m.settings()}</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as item (item.href)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          isActive={page.url.pathname === item.href}
          tooltipContent={item.label}>
          {#snippet child({ props: btnProps })}
            <a href={item.href} {...btnProps} data-sveltekit-preload-data="off">
              <span>{item.label}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
```

Key points:
- Active state uses `page.url.pathname === item.href`
- No `createRoute()` — paths are known at build time
- `data-sveltekit-preload-data="off"` avoids unnecessary preloading

---

## List page pattern

A fixed list page manually sets up snippet bindings and renders components statically:

```svelte
<script lang="ts">
  import { page } from '$app/state'
  import EntityFilters from '$lib/components/features/common/Filters/EntityFilters.svelte'
  import { EntityTable } from '$lib/components/features/domain/EntityTable'
  import { setSnippetBindings } from '$lib/contexts/page-state'
  import { SNIPPET_PROPS_CONTEXT_KEY, type SnippetPropsGetter } from '$utils/runtime'
  import { getContext } from 'svelte'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const getSnippetProps = getContext<SnippetPropsGetter>(SNIPPET_PROPS_CONTEXT_KEY)
  const snippetProps = $derived(getSnippetProps())

  // Manual bindings: GenericFilters provides 'filters', EntityTable consumes 'filters'
  setSnippetBindings({
    provides: { filters: 'filters' },
    consumes: { filters: 'filters' },
  })
</script>

<!-- Header with breadcrumbs -->
<header class="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center border-b bg-background px-4">
  <!-- Sidebar trigger + Breadcrumb.Root -->
</header>

<div class="flex flex-1 flex-col gap-4 p-4">
  <EntityFilters {...snippetProps} />
  <EntityTable {...snippetProps} />
</div>
```

### Why `setSnippetBindings` is needed

Table and filter components use `useConsumes` / `useProvides` which call `getSnippetBindings()` internally. In configurable pages, `SnippetBindingsProvider` sets this context automatically. In fixed pages, we must call `setSnippetBindings()` manually.

The bindings object maps logical names to namespace names:
```typescript
setSnippetBindings({
  provides: { filters: 'filters' },  // GenericFilters provides under 'filters' namespace
  consumes: { filters: 'filters' },  // EntityTable consumes from 'filters' namespace
})
```

---

## Detail/form page pattern

The detail page gets the `uuid` from SvelteKit route params, not from `pageDetails`:

```svelte
<script lang="ts">
  import { page } from '$app/state'
  import { EntityDetails } from '$lib/components/features/domain/EntityDetails'
  import { getPageState } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages'
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
  const pageState = getPageState()

  const uuid = $derived(page.params.uuid)
  const recordTitle = $derived(pageState.get<string>('__breadcrumb_title'))
  const breadcrumbLabel = $derived(recordTitle ?? m.new_entity())
</script>

<!-- Header with breadcrumbs (hardcoded, not dynamic) -->
<header>
  <!-- ... breadcrumbs with hardcoded hrefs ... -->
  <Breadcrumb.Page>{breadcrumbLabel}</Breadcrumb.Page>
</header>

<div class="flex flex-1 flex-col gap-4 p-4">
  <EntityDetails legalEntity={data.legalEntity} {uuid} />
</div>
```

### Route structure for upsert

Use SvelteKit optional params `[[uuid]]` for create/edit on a single route:

```
src/routes/(app)/settings/entity-name/upsert/[[uuid]]/+page.svelte
```

- `/settings/entity-name/upsert` → create mode (`uuid` is `undefined`)
- `/settings/entity-name/upsert/abc-123` → edit mode (`uuid` is `'abc-123'`)

---

## Detail component adaptations for fixed pages

When creating a detail form component for a fixed page, there are two key differences from the configurable page pattern:

### 1. Props: accept `uuid` explicitly

Since `pageDetails.params` is not available, the component accepts `uuid` as a direct prop:

```typescript
// ❌ Configurable page pattern
let { pageDetails, legalEntity }: SnippetProps = $props()
const uuid = $derived(pageDetails.params.uuid)

// ✅ Fixed page pattern
let { legalEntity, uuid }: { legalEntity?: LegalEntity | null; uuid?: string } = $props()
```

### 2. Navigation: custom `handleSuccess`

The default `useDetailRecord.handleSuccess` uses `createRoute()` for post-create navigation, which requires a registered `detailPageId`. Fixed pages are not registered in the page config, so provide a custom `handleSuccess`:

```typescript
const detail = useDetailRecord<Entity>({
  getUuid: () => uuid,
  fetchUrl: (id) => `/legal-entities/${legalEntityId}/entities/${id}`,
  createUrl: () => `/legal-entities/${legalEntityId}/entities`,
  updateUrl: (id) => `/legal-entities/${legalEntityId}/entities/${id}`,
  detailPageId: 'entity-details', // placeholder — unused because we override handleSuccess
  onFetched: (data) => { breadcrumbTitle.set(data.name) },
  cleanup: () => { breadcrumbTitle.clear() },
})

const { handleSubmit, handleFailure } = detail

function handleSuccess(payload: SuccessPayload<unknown>) {
  if (!detail.record) {
    // Create mode — navigate to fixed route
    toast.success(m.changes_saved())
    const newId = (payload.result as Entity).id
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(`/settings/entity-name/upsert/${newId}`, { replaceState: true })
    return
  }
  // Update mode — delegate to the hook (shows toast + updates internal record)
  detail.handleSuccess(payload)
}
```

Key points:
- Only override the **create** branch — the update branch of `detail.handleSuccess` works fine (it just updates the internal `record` state, no navigation)
- Use `replaceState: true` so the browser back button goes to the list, not back to the create URL
- The `detailPageId` passed to `useDetailRecord` is a placeholder; it's never used because our custom `handleSuccess` intercepts the create case

### 3. Contract and useProvides: optional

For configurable pages, contracts are required so `SnippetResolver` can wire components together. For fixed pages, a contract is only needed if sibling components on the same page consume the record data (e.g. a sidebar).

If the detail form is the only component on the page, **skip the contract and `useProvides`**.

---

## Breadcrumbs

Fixed pages define breadcrumbs **directly in the page template** with hardcoded links. They do not use the `Breadcrumbs.svelte` component (which relies on `entityConfig.dashboard.pages` to build the trail).

For detail pages, use `useBreadcrumbTitle()` in the component and read the title via `pageState.get('__breadcrumb_title')` in the page:

```svelte
<!-- In the page -->
<script>
  const pageState = getPageState()
  const recordTitle = $derived(pageState.get<string>('__breadcrumb_title'))
  const breadcrumbLabel = $derived(recordTitle ?? m.new_entity())
</script>

<Breadcrumb.Link href="/settings/entities">{m.entities()}</Breadcrumb.Link>
<Breadcrumb.Separator />
<Breadcrumb.Page>{breadcrumbLabel}</Breadcrumb.Page>
```

---

## Header pattern

All fixed pages share the same header structure with sidebar trigger and breadcrumbs:

```svelte
<header class="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center border-b bg-background px-4">
  <Sidebar.Trigger class="relative -ms-1 overflow-visible">
    {#if sidebar.open}
      <PanelLeftIcon />
    {:else}
      <div class="absolute left-1 flex items-center">
        <Logo class="z-10 text-brand" />
        <ChevronRight class=" size-3 text-brand/70" />
      </div>
    {/if}
    <span class="sr-only">Toggle Sidebar</span>
  </Sidebar.Trigger>

  <Breadcrumb.Root class="ms-4 cursor-default">
    <Breadcrumb.List>
      <!-- Legal entity name → section → page → [record name] -->
    </Breadcrumb.List>
  </Breadcrumb.Root>
</header>
```

---

## Checklist for fixed pages

- [ ] Route created under the section directory (e.g. `settings/entity-name/`)
- [ ] `setSnippetBindings()` called in list pages (if using filter + table)
- [ ] `uuid` extracted from `page.params` (not `pageDetails.params`)
- [ ] Custom `handleSuccess` for post-create navigation (no `createRoute()`)
- [ ] Breadcrumbs hardcoded with correct `href` links
- [ ] Sidebar updated with new menu item (fixed `href`)
- [ ] Header follows the shared pattern (sidebar trigger + breadcrumbs)
- [ ] Components validated with `svelte-autofixer`
