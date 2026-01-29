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

### Create Mock Data for Preview

**REQUIRED:** When creating a new feature component, you MUST also create a mock data file for admin panel preview.

Create a file named `<ComponentName>.mock.ts` in the same directory as your component:

```
src/lib/components/features/<domain>/<ComponentName>.mock.ts
```

**Mock data structure:**

```typescript
// src/lib/components/features/orders/OrderSummaryCard.mock.ts
import type { Order } from '$lib/types/orders'

/**
 * Mock data for OrderSummaryCard component preview
 */
export const mockOrderData: Order = {
  id: 'ORD-2024-0001',
  customerName: 'Acme Corporation',
  customerEmail: 'purchasing@acme.com',
  status: 'confirmed',
  total: 12500.00,
  currency: 'USD',
  items: [
    {
      id: 'item-1',
      productName: 'Industrial Widget A',
      sku: 'WID-A-001',
      quantity: 100,
      unitPrice: 75.00,
      total: 7500.00
    },
    {
      id: 'item-2',
      productName: 'Premium Gadget B',
      sku: 'GAD-B-042',
      quantity: 50,
      unitPrice: 100.00,
      total: 5000.00
    }
  ],
  shippingAddress: {
    street: '123 Business Park Drive',
    city: 'Tech Valley',
    state: 'CA',
    zipCode: '94025',
    country: 'USA'
  },
  createdAt: '2024-03-15T10:30:00Z',
  updatedAt: '2024-03-15T14:22:00Z'
}

// Optional: Multiple scenarios
export const mockOrderPending: Order = {
  ...mockOrderData,
  id: 'ORD-2024-0002',
  status: 'pending',
  items: []
}

export const mockOrderCancelled: Order = {
  ...mockOrderData,
  id: 'ORD-2024-0003',
  status: 'cancelled'
}
```

**Mock data guidelines:**

- **Realistic values**: Use plausible data, not "Test Customer" or "foo@bar.com"
  - Good: `"Acme Corporation"`, `"purchasing@acme.com"`
  - Bad: `"Test"`, `"foo"`, `"customer1"`
- **Representative data**: Cover typical use cases (normal state, edge cases, empty states)
- **Type-safe**: Match your component's prop types exactly
- **Self-documenting**: Names should explain what they represent
- **Complete objects**: Include all required fields and realistic optional fields
- **Realistic numbers**: Use actual business values (1250000, not 123 or 999999)
- **Valid dates**: Use ISO format with realistic timestamps
- **Proper enums**: Use actual enum values from your types

**What to avoid:**

- ❌ Generic placeholders: "Item 1", "Product 2", "Test User"
- ❌ Obviously fake data: "test@test.com", "123 Fake Street"
- ❌ Magic numbers: 999, 123456, 42 (unless contextually appropriate)
- ❌ Lorem ipsum text (use realistic business copy instead)

**Export default for simple cases:**

```typescript
// Simple component with single prop
export default {
  customerName: 'Acme Corporation',
  totalOrders: 342,
  lastOrderDate: '2024-03-15'
}
```

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
