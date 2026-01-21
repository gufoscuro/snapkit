# MCP Servers

This project uses multiple MCP servers. Use the appropriate one based on your task.

## Quick Reference

| MCP Server               | Purpose                            | When to Use                                                                    |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| **svelte**               | Svelte 5 & SvelteKit documentation | Language features, runes, routing, SvelteKit APIs                              |
| **shadcn-svelte**        | shadcn-svelte component docs       | Using/adding base UI components in `src/lib/components/ui/`                    |
| **shadcn-svelte-extras** | Extra components via jsrepo        | Advanced components not in core shadcn-svelte (Chat, Code, Emoji Picker, etc.) |
| **svelte-components**    | Feature component discovery        | Finding/creating components in `src/lib/components/features/`                  |
| **arke**                 | Backend API discovery              | Finding API endpoints and TypeScript types for data fetching                   |

---

## svelte MCP

Use for Svelte 5 and SvelteKit documentation.

**Tools:**

- **list-sections**: Discover available documentation sections. Use this FIRST when asked about Svelte/SvelteKit topics.
- **get-documentation**: Retrieve full documentation content. After `list-sections`, fetch ALL relevant sections based on use_cases.
- **svelte-autofixer**: Analyze Svelte code for issues. MUST use this whenever writing Svelte code - keep calling until no issues remain.
- **playground-link**: Generate a Svelte Playground link. Only use after user confirmation and NEVER if code was written to files.

---

## shadcn-svelte MCP

Use for **base UI components** in `src/lib/components/ui/`. These components should NOT be modified directly.

**Tools:**

- **shadcn-svelte-list**: List all available shadcn-svelte components, blocks, charts, and docs
- **shadcn-svelte-get**: Get detailed component documentation, installation commands, and code examples
- **shadcn-svelte-search**: Fuzzy search across shadcn-svelte components and docs
- **shadcn-svelte-icons**: Browse and search Lucide Svelte icons
- **bits-ui-get**: Access Bits UI component API documentation (shadcn-svelte is built on Bits UI)

**When to use:**

1. Understanding props/usage of base UI components (Button, Dialog, Card, etc.)
2. Adding a new shadcn component to the project → use `shadcn-svelte-get` for installation instructions
3. Finding icons → use `shadcn-svelte-icons`

---

## shadcn-svelte-extras MCP (jsrepo)

Use for **extra components** not included in core shadcn-svelte. These are community components from [shadcn-svelte-extras](https://www.shadcn-svelte-extras.com/).

**Available components include:** Avatar Group, Chat, Code Block, Emoji Picker, Field Set, File Tree, Tags Input, Terminal, and more.

**Tools:**

- **search**: Search for available extra components
- **get_block**: Get component documentation, code, and installation commands
- **list_blocks**: List all available extra components

**When to use:**

1. Need a component not available in core shadcn-svelte
2. Looking for advanced/specialized UI components (chat interfaces, code blocks, terminals, etc.)
3. Adding new extras to the project → use `npx jsrepo add @ieedan/shadcn-svelte-extras/<component>`

---

## svelte-components MCP

Use for **feature components** in `src/lib/components/features/`. This is where all custom project components live.

**Tools:**

- **list_components**: List all available feature components, optionally filtered by category
- **get_component**: Get detailed information about a specific component including props, types, and usage examples
- **search_components**: Search components by props, types, or functionality

**When to use:**

1. Discovering existing feature components before creating new ones
2. Understanding props and usage of custom project components
3. Finding components with specific functionality

---

## arke MCP

Use for **backend API discovery** when creating components that fetch or interact with data.

**Tools:**

- **search_api**: Search for API operations by natural language query. Returns matching endpoints with method, path, and TypeScript types.

**Parameters:**

- `query`: Natural language description (e.g., "list orders", "create customer", "update product")
- `namespace` (optional): Filter by API namespace (e.g., "sales-api", "supply-api", "product-api")
- `include_schemas`: Set to `true` to get raw JSON schemas in addition to TypeScript types

**Workflow for components that fetch data:**

1. **Search for relevant endpoints**: Use `search_api` to find endpoints that match your data needs
2. **Review the response types**: Use the returned TypeScript type definitions to type your component's data
3. **Implement the fetch call**: Use `apiRequest` from `$lib/utils/request.ts` (NOT raw `fetch`)
4. **Handle loading and error states**: Always account for async data fetching

**API Request Utility:**

```typescript
import { apiRequest } from '$lib/utils/request'
import { createQueryRequestObject } from '$lib/utils/filters'

const orders = await apiRequest<OrderSummary[]>({
  url: 'sales/order',
  queryParams: createQueryRequestObject(query)
})
```

---

# Component Development Guidelines

## Component File Locations

| Location                       | Contains                           | MCP Server        |
| ------------------------------ | ---------------------------------- | ----------------- |
| `src/lib/components/ui/`       | Base UI components (shadcn-svelte) | shadcn-svelte     |
| `src/lib/components/features/` | Feature/domain components          | svelte-components |

**Note:** Base UI components in `ui/` should NOT be modified directly. Always build feature components by composing them.

## Reuse and Composition First

Before creating a new component, you MUST:

1. **Check for existing components**: Use `svelte-components` MCP to search the codebase
2. **Consider composition**: Evaluate if combining existing components achieves the desired result
3. **Extend when appropriate**: If an existing component is close, prefer extending it over duplicating logic

**Decision flow:**

1. Can an existing component be used as-is? → Use it
2. Can existing components be composed together? → Compose them
3. Can an existing component be extended with new props/slots? → Extend it
4. Only if none of the above apply → Create a new component

## Creating New Feature Components

All newly created feature components MUST be placed in:

```
src/lib/components/features/
```

**Simple composed components** (combining existing UI components with minimal logic):

```
src/lib/components/features/<domain>/<ComponentName>.svelte
```

**New standalone components** (step 4 of decision flow - requires extensibility):

```
src/lib/components/features/<domain>/<ComponentName>/default/<ComponentName>.svelte
```

Examples:

- `src/lib/components/features/orders/OrderStatusBadge.svelte` - Simple composition of Badge
- `src/lib/components/features/orders/SalesOrdersList/default/SalesOrdersList.svelte` - Complex standalone component

### Barrel Files for Exports

For standalone components, create an `index.ts` file:

```typescript
// src/lib/components/features/orders/SalesOrdersList/index.ts
export { default as SalesOrdersList } from './default/SalesOrdersList.svelte';
export { default as SalesOrdersListCompact } from './default/SalesOrdersListCompact.svelte';
```

This enables clean imports:

```typescript
import { SalesOrdersList } from '$lib/components/features/orders/SalesOrdersList';
```

### Update the Components Registry

After creating new components, run:

```bash
npm run generate:components-registry
```

This automatically scans `src/lib/components/features/` and updates `src/generated/components-registry.ts`. Do NOT edit the registry file manually.

## API Types Management

**IMPORTANT:** Do NOT define API response types locally within components. All API types must be centralized in `src/lib/types/api-types.ts`.

**Rules:**

1. **Never define API types inline** in components (e.g., `type OrderSummary = {...}`)
2. **Always add new API types** to `src/lib/types/api-types.ts`
3. **Import and reuse** types from the centralized location

**Example:**

```typescript
// ❌ WRONG - Don't define types locally in components
// src/lib/components/features/supply/SupplyOrdersTable.svelte
type OrderSummary = {
  id?: string
  name: string
  status: 'draft' | 'sent' | 'accepted'
  // ...
}

// ✅ CORRECT - Define in api-types.ts and import
// src/lib/types/api-types.ts
export type OrderSummary = {
  id?: string
  name: string
  status: 'draft' | 'sent' | 'accepted'
  // ...
}

// src/lib/components/features/supply/SupplyOrdersTable.svelte
import type { OrderSummary } from '$lib/types/api-types'
```

**Why:** This ensures type consistency across the application, enables reusability, and makes it easier to update types when the API changes.

## Component Documentation

When creating a new component, add a descriptive comment block at the top:

```svelte
<!--
  @component OrderSummaryCard
  @description Displays a summary of an order including items, totals, and status.
  @keywords order, summary, card, checkout, invoice, receipt
  @uses Card, Badge, Separator
-->
```

## Creating Selector Components

Use the existing generic selector components:

- **Single selection**: `FormGenericSingleSelector` from `$lib/components/form/FormGenericSingleSelector.svelte`
- **Multi selection**: `FormGenericMultiSelector` from `$lib/components/form/FormGenericMultiSelector.svelte`

**Required implementation pattern:**

1. Define your entity type (from API)
2. Create an `optionMappingFunction` that maps your entity to `ExtendedOption`
3. Create a `fetchFunction` that fetches entities from the API
4. Pass these to the generic selector component

**Example**: See `src/lib/components/features/form/FormSelectorExample.svelte`

## Variants vs Props

**Use a prop when:**

- The change is a simple toggle (e.g., `compact`, `bordered`, `disabled`)
- The variation affects only styling or minor layout adjustments
- The logic remains essentially the same
- You want consumers to switch between modes dynamically at runtime

**Use a variant file when:**

- The variation involves significantly different markup structure
- The variant has different data requirements or props
- The logic diverges substantially from the base component
- The variant is a specialized use case that most consumers won't need

**Examples:**

- `size="sm" | "md" | "lg"` → Use a prop (simple styling change)
- `SalesOrdersListCompact.svelte` → Use a variant (different column layout, omits details section)

---

# Navigation and Routing

## Creating Links to Pages

**IMPORTANT:** When creating links to pages in the application, you MUST ALWAYS use the route-builder utility instead of hardcoded URLs.

Use the `createRoute()` function from `$lib/utils/route-builder` to generate URLs programmatically. This provides:

- Type-safe route generation
- Centralized route management
- Prevention of broken links when routes change
- Automatic parameter interpolation and query string handling

See [@src/lib/utils/ROUTE-BUILDER.md](src/lib/utils/ROUTE-BUILDER.md) for complete documentation and examples.

**Basic usage:**

```svelte
<script>
  import { createRoute } from '$lib/utils/route-builder'
</script>

<!-- Simple link -->
<a href={createRoute({ $id: 'order-list' })}>Orders</a>

<!-- Link with parameters -->
<a href={createRoute({ $id: 'order-detail', params: { uuid: orderId } })}>
  View Order
</a>

<!-- Link with query params -->
<a href={createRoute({ $id: 'order-list', query: { status: 'pending' } })}>
  Pending Orders
</a>
```

**Never hardcode URLs like this:**

```svelte
<!-- ❌ WRONG -->
<a href="/orders">Orders</a>
<a href="/orders/{orderId}">View Order</a>

<!-- ✅ CORRECT -->
<a href={createRoute({ $id: 'order-list' })}>Orders</a>
<a href={createRoute({ $id: 'order-detail', params: { uuid: orderId } })}>View Order</a>
```
