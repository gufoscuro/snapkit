You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

## Using Arke MCP Server for API Discovery

When creating components that need to fetch or interact with backend data, you MUST use the **arke MCP server** to discover available API endpoints and their types.

### Available tool:

- **search_api**: Search for API operations by natural language query. Returns matching endpoints with method, path, and TypeScript types.

### Usage:

```
search_api(query: "list orders", namespace: "sales-api", include_schemas: true)
```

**Parameters:**
- `query`: Natural language description of what you're looking for (e.g., "list orders", "create customer", "update product")
- `namespace` (optional): Filter by API namespace (e.g., "sales-api", "supply-api", "product-api")
- `include_schemas`: Set to `true` to get raw JSON schemas in addition to TypeScript types

### Workflow for components that fetch data:

1. **Search for relevant endpoints**: Use `search_api` to find endpoints that match your data needs
2. **Review the response types**: The tool returns TypeScript type definitions - use these to type your component's data
3. **Implement the fetch call**: Use `apiRequest` from `$lib/utils/request.ts` to make API calls (NOT raw `fetch`)
4. **Handle loading and error states**: Always account for async data fetching

### API Request Utility

Always use `apiRequest` from `$lib/utils/request.ts` when fetching data from the API.
Use `createQueryRequestObject` from `$lib/utils/filters.ts` to format query parameters (search, limit, offset).

```typescript
import { apiRequest } from '$lib/utils/request'
import { createQueryRequestObject } from '$lib/utils/filters'

const orders = await apiRequest<OrderSummary[]>({
  url: 'sales/order',
  queryParams: createQueryRequestObject(query)
})
```

### Example:

When building a component to display shipped orders:

1. Search: `search_api(query: "list orders shipped", namespace: "sales-api")`
2. Result shows: `GET /order` returns `orderSummary[]` with `shipped?: "completed" | "not shipped" | "partial"`
3. Use this info to fetch and filter the data in your component

---

## Component Development Guidelines

### Using svelte-components MCP Server

When creating new components, you MUST use the **svelte-components MCP server** to discover and utilize existing UI components. This ensures consistency and proper usage of the component library.

Available tools from svelte-components:

- **list_components**: List all available components, optionally filtered by category
- **get_component**: Get detailed information about a specific component including props, types, and usage examples
- **search_components**: Search components by props, types, or functionality

**Workflow for creating new components:**

1. First, call `list_components` to see available UI components
2. Use `get_component` to understand the props and usage of components you need
3. Use `search_components` if looking for specific functionality

### Component File Location

All newly created feature components MUST be placed in:

```
src/lib/components/features/
```

Organize by feature/domain. The folder structure depends on whether you're creating a **new standalone component** or a **simple composed component**:

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
- `src/lib/components/features/customers/CustomerProfileCard/default/CustomerProfileCard.svelte` - Complex standalone component

**Note:** Base UI components live in `src/lib/components/ui/` and should NOT be modified directly. Always build feature components by composing the existing UI components.

### Component Documentation

When creating a new component, you MUST add a descriptive comment block at the top of the file. This helps AI tools (like svelte-components-mcp) better understand, search, and suggest the component.

Include:

- **Purpose**: What the component does and its intended use case
- **Keywords**: Relevant search terms (e.g., "form", "modal", "list", "data-display")
- **Dependencies**: Which UI components it composes/uses

Example:

```svelte
<!--
  @component OrderSummaryCard
  @description Displays a summary of an order including items, totals, and status.
  @keywords order, summary, card, checkout, invoice, receipt
  @uses Card, Badge, Separator
-->
```

### Reuse and Composition First

Before creating a new component, you MUST:

1. **Check for existing components**: Search the codebase for components that already solve the problem or can be extended
2. **Consider composition**: Evaluate if combining existing components can achieve the desired result without creating a new one from scratch
3. **Extend when appropriate**: If an existing component is close but needs modifications, prefer extending it over duplicating logic

**Decision flow:**

1. Can an existing component be used as-is? → Use it
2. Can existing components be composed together? → Compose them
3. Can an existing component be extended with new props/slots? → Extend it
4. Only if none of the above apply → Create a new component

### Creating New Components

When creating a new component (step 4 of the decision flow):

1. **Use self-explanatory names**: Give the component a descriptive name that clearly conveys its purpose, even if the name is long. Clarity is more important than brevity.

2. **Folder structure for extensibility**: Place the component in a folder structure that supports future variants:

   ```
   src/lib/components/features/<domain>/<ComponentName>/default/<ComponentName>.svelte
   ```

   This allows variants to be added alongside the default implementation:

   ```
   src/lib/components/features/orders/SalesOrdersList/default/SalesOrdersList.svelte
   src/lib/components/features/orders/SalesOrdersList/default/SalesOrdersListCompact.svelte
   src/lib/components/features/orders/SalesOrdersList/default/SalesOrdersListWithFilters.svelte
   ```

3. **Barrel file for exports**: Create an `index.ts` file in the component folder to provide clean imports:

   ```
   src/lib/components/features/orders/SalesOrdersList/index.ts
   ```

   Example `index.ts`:

   ```typescript
   export { default as SalesOrdersList } from './default/SalesOrdersList.svelte';
   export { default as SalesOrdersListCompact } from './default/SalesOrdersListCompact.svelte';
   ```

   This enables clean imports:

   ```typescript
   import { SalesOrdersList, SalesOrdersListCompact } from '$lib/components/features/orders/SalesOrdersList';
   ```

### Creating Selector Components

When creating a selector/picker component for an entity (e.g., MaterialSelector, CustomerSelector), you MUST use the existing generic selector components:

- **Single selection**: Use `FormGenericSingleSelector` from `$lib/components/form/FormGenericSingleSelector.svelte`
- **Multi selection**: Use `FormGenericMultiSelector` from `$lib/components/form/FormGenericMultiSelector.svelte`

**Required implementation pattern:**

1. Define your entity type (from API)
2. Create an `optionMappingFunction` that maps your entity to `ExtendedOption`
3. Create a `fetchFunction` that fetches entities from the API
4. Pass these to the generic selector component

**Example** (see `src/lib/components/features/form/FormSelectorExample.svelte`)

### Variants vs Props

When extending a component, choose between creating a **variant file** or adding a **prop** based on these guidelines:

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
- Combining both behaviors in one component would create confusing conditional logic

**Examples:**

- `size="sm" | "md" | "lg"` → Use a prop (simple styling change)
- `SalesOrdersListCompact.svelte` → Use a variant (different column layout, omits details section)
- `loading={true}` → Use a prop (temporary state toggle)
- `SalesOrdersListWithFilters.svelte` → Use a variant (adds filter UI, different data flow)
