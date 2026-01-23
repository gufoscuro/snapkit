# Component Development Guidelines

## Component File Locations

| Location                       | Contains                                      | MCP Server        |
| ------------------------------ | --------------------------------------------- | ----------------- |
| `src/lib/components/ui/`       | Base UI components (shadcn-svelte)            | shadcn-svelte     |
| `src/lib/components/core/`     | Generic reusable components (DataTable, Gantt, etc.) | -                 |
| `src/lib/components/features/` | Feature/domain components                     | svelte-components |

**Notes:**
- Base UI components in `ui/` should NOT be modified directly. Always build feature components by composing them.
- Core components in `core/` are generic, domain-agnostic components that can be reused across multiple features. They typically wrap complex functionality (charts, tables, calendars) and expose a clean API with callbacks and snippets for customization.

## Reuse and Composition First

Before creating a new component, you MUST:

1. **Check for existing feature components**: Use `svelte-components` MCP to search the codebase
2. **Check for existing core components**: Look in `src/lib/components/core/` for generic components (DataTable, GanttChart, etc.)
3. **Consider composition**: Evaluate if combining existing components achieves the desired result
4. **Extend when appropriate**: If an existing component is close, prefer extending it over duplicating logic

**Decision flow:**

1. Can an existing feature component be used as-is? → Use it
2. Can a core component be configured for this use case? → Use it with appropriate props/snippets
3. Can existing components be composed together? → Compose them
4. Can an existing component be extended with new props/slots? → Extend it
5. Only if none of the above apply → Create a new component

## Core Components

Core components live in `src/lib/components/core/` and are **generic, domain-agnostic** components that encapsulate complex functionality.

**When to create a core component:**

- The functionality is reusable across multiple domains (e.g., a data table, chart, calendar)
- The component requires significant logic that shouldn't be duplicated
- Multiple feature components would benefit from the same base implementation

**Core component structure:**

```
src/lib/components/core/<ComponentName>/
├── <ComponentName>.svelte      # Main component
├── <ComponentName>Skeleton.svelte  # Loading state (optional)
├── types.ts                    # TypeScript types
└── index.ts                    # Exports
```

**Core component design principles:**

1. **Generic typing**: Use TypeScript generics (`<T extends BaseType>`) for flexibility
2. **Callbacks for data**: Expose callbacks like `onDateRangeChange`, `onItemClick` for data fetching and interactions
3. **Snippets for customization**: Use Svelte 5 snippets for custom rendering (tooltips, cells, content)
4. **Sensible defaults**: Provide good defaults while allowing full customization

**Available core components:**

| Component   | Purpose                                | Usage Example                |
| ----------- | -------------------------------------- | ---------------------------- |
| `DataTable` | Generic data table with TanStack Table | Lists, grids, paginated data |
| `GanttChart`| Generic Gantt chart with timeline      | Scheduling, planning, timelines |

## Creating New Feature Components

All newly created feature components MUST be placed in:

```
src/lib/components/features/
```

**Simple composed components** (combining existing UI components with minimal logic):

```
src/lib/components/features/<domain>/<ComponentName>.svelte
```

**New standalone components** (step 5 of decision flow - requires extensibility):

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

After creating new components, remember to ALWAYS run:

```bash
npm run generate:components-registry
```

This automatically scans `src/lib/components/features/` and updates `src/generated/components-registry.ts`. Do NOT edit the registry file manually.

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
