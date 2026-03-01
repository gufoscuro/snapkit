# CRUD Workflow

A **CRUD workflow** is a complete set of pages and components for managing a resource: **listing**, **creating**, **editing**, and **archiving/deleting**. This blueprint describes the general structure and conventions, regardless of whether pages are configurable or fixed.

## Anatomy of a CRUD

A typical CRUD for an entity (e.g. `ProductFamily`, `Customer`) consists of:

| Piece | Purpose | Key Component |
|---|---|---|
| **List page** | Shows all records in a paginated table | `ResourceTable` with `createApiFetcher` |
| **Filters bar** | Search input + "Add" button above the table | `GenericFilters` wrapper |
| **Detail/form page** | Create or edit a single record | `useDetailRecord` + `FormUtil` |
| **Archive action** | Delete a record from the table row | `createArchiveAction` in table column config |

---

## Step-by-step: building a CRUD

### 1. Identify the entity and API

Use the **Moddo API MCP** to discover the relevant endpoints:

```
mcp__moddo-api__get-api-documentation({ group: "ProductFamilies" })
```

Extract:
- The TypeScript type (add to `src/lib/types/api-types.ts` if not present)
- **GET** (list) — paginated endpoint for the table
- **GET** (single) — fetch by id for the detail form
- **POST** (create) — required fields for `validateCreate`
- **PUT** (update) — required fields for `validateUpdate`
- **DELETE** — for the archive action

### 2. Create the table component

Follow the [Resource Table blueprint](../components/resource-table.md):

- **Contract**: consumes `filters` (from GenericFilters)
- **Columns**: define `ColumnConfig<Entity>[]` with appropriate renderers
- **Fetch**: `createApiFetcher<Entity>(apiUrl)`
- **Archive**: `createArchiveAction` in the actions column

File structure:
```
src/lib/components/features/<domain>/<EntityName>Table/
  default/
    <EntityName>Table.contract.ts
    <EntityName>Table.svelte
    <EntityName>Table.mock.ts
  index.ts
```

### 3. Create the filters component

Wrap `GenericFilters` with domain-specific actions (typically an "Add" button):

```
src/lib/components/features/common/Filters/<EntityName>Filters.svelte
```

Pattern:
```svelte
<script lang="ts" module>
  export { GenericFiltersContract as contract } from '../GenericFilters/default/GenericFilters.contract.js'
</script>

<script lang="ts">
  import GenericFilters from '$components/features/common/GenericFilters/default/GenericFilters.svelte'
  import Button from '$components/ui/button/button.svelte'
  import * as m from '$lib/paraglide/messages'
  import type { SnippetProps } from '$utils/runtime'

  const props: SnippetProps = $props()
</script>

<GenericFilters {...props}>
  <Button variant="default" href="/path/to/upsert">
    {m.add_new_entity()}
  </Button>
</GenericFilters>
```

### 4. Create the detail form component

Follow the [Detail Record Form blueprint](../components/detail-record-form.md):

- **`useDetailRecord`**: manages fetch/create/update lifecycle
- **`FormUtil`**: provides form context to field components
- **Validation**: `validateCreate` (POST required fields) + `validateUpdate` (format rules only)
- **`useBreadcrumbTitle`**: sets the record name in the breadcrumb

### 5. Create the pages

The page structure depends on whether you are building **configurable pages** or **fixed pages**. See below and the [Fixed Pages blueprint](./fixed-pages.md) for details.

### 6. Post-implementation

- [ ] Add missing i18n keys to both `messages/en.json` and `messages/it.json`
- [ ] Run `npm run generate:components-registry`
- [ ] Validate all new `.svelte` files with the `svelte-autofixer` MCP tool

---

## Configurable pages vs fixed pages

SnapKit has two page models. Understanding which to use is critical.

### Configurable pages (default)

Used for the **main application** (customers, orders, products, etc.).

- Routes handled by the **catch-all** `[...path]` route
- Page structure defined in `entityConfig.dashboard.pages` (database-driven)
- Components mounted via `SnippetResolver` — the admin chooses which components appear on each page
- Navigation uses `createRoute({ $id: 'page-id' })` — **never hardcode URLs**
- Sidebar menus are dynamic, driven by `entityConfig.dashboard.menus`
- `pageDetails.params` provides route parameters (e.g. `uuid`)
- `SnippetBindingsProvider` sets up bindings automatically

### Fixed pages

Used for **settings**, **admin panel**, and other sections with a known, stable structure.

- Routes are **SvelteKit file-based** (e.g. `src/routes/(app)/settings/product-families/+page.svelte`)
- Components mounted **statically** in the page template — no SnippetResolver
- Navigation uses **hardcoded `href` links** — `createRoute()` is not used
- Sidebar menus have **fixed items** with direct `href` values
- Route params come from **SvelteKit's `page.params`** (via `$app/state`), not from `pageDetails`
- Bindings set up **manually** via `setSnippetBindings()`

See the [Fixed Pages blueprint](./fixed-pages.md) for the complete guide.

---

## i18n conventions for CRUDs

Every CRUD typically needs these i18n keys (example for `product_family`):

| Key | EN | IT |
|---|---|---|
| `product_family` | Product Family | Famiglia Prodotto |
| `product_families` | Product Families | Famiglie Prodotto |
| `add_new_product_family` | Add product family | Aggiungi famiglia prodotto |
| `new_product_family` | New Product Family | Nuova Famiglia Prodotto |
| `archive_product_family_confirmation` | Are you sure you want to archive...? | Sei sicuro di voler archiviare...? |
| `product_family_archived_success` | Product family "{name}" archived successfully | Famiglia prodotto "{name}" archiviata con successo |
| `product_family_archive_error` | Failed to archive product family | Impossibile archiviare la famiglia prodotto |

Generic keys already available: `code`, `name`, `description`, `active`, `inactive`, `status`, `save_changes`, `changes_saved`, `common_error`, `common_search`.

---

## Checklist

Before considering a CRUD complete:

- [ ] Entity type defined in `src/lib/types/api-types.ts`
- [ ] Table component with contract, columns, fetcher, and archive action
- [ ] Filters component with search and "Add" button
- [ ] Detail form component with `useDetailRecord`, validation, and breadcrumb title
- [ ] List page rendering filters + table
- [ ] Detail page rendering the form (with breadcrumbs)
- [ ] Barrel exports (`index.ts`) for all new component directories
- [ ] i18n keys added to both `en.json` and `it.json`
- [ ] `npm run generate:components-registry` executed
- [ ] All `.svelte` files validated with `svelte-autofixer` (zero issues)
