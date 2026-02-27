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

- The functionality is reusable across multiple domains (e.g., a data table, chart, calendar, form fields)
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

| Component            | Location              | Purpose                                        | Usage Example                                        |
| -------------------- | --------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `ResourceTable`      | `core/ResourceTable/` | Declarative data table with built-in renderers | CRUD tables with pagination, filters, actions        |
| `DataTable`          | `core/DataTable/`     | Generic data table with TanStack Table         | Lists, grids, paginated data                         |
| `GanttChart`         | `core/Gantt/`         | Generic Gantt chart with timeline              | Scheduling, planning, timelines                      |
| `form/*`             | `core/form/`          | Context-based form system                      | Forms with validation, field sync                    |
| `RequestPlaceholder` | `core/common/`        | Loading/error state wrapper for async requests | Wrap any component that awaits a promise             |
| `BackButton`         | `core/common/`        | Navigation back button using history stack     | Detail pages, sidebars, anywhere "go back" is needed |

> **💡 Tip:** For new data tables, prefer `ResourceTable` over `DataTable` to reduce boilerplate. See [resource-table.md](./resource-table.md) for full documentation.

### `BackButton`

A navigation utility button that goes back using the internal history stack. Falls back to a specified route if no history entry is available. Renders nothing if neither history nor fallback are present.

```svelte
<script lang="ts">
  import BackButton from '$components/core/common/BackButton.svelte'
  import { createRoute } from '$utils/route-builder'
</script>

<!-- Goes back in history, falls back to the customers list -->
<BackButton fallback={createRoute({ $id: 'customers' })} />

<!-- Ghost variant with custom label -->
<BackButton variant="ghost" label="Go back" fallback="/dashboard" />
```

**Props:**

| Prop       | Type            | Default    | Description                                |
| ---------- | --------------- | ---------- | ------------------------------------------ |
| `variant`  | `ButtonVariant` | `'outline'`| Button visual variant                      |
| `fallback` | `string`        | —          | Route to navigate to when history is empty |
| `label`    | `string`        | `m.back()` | Button label (i18n by default)             |

> **Note:** `BackButton` lives in `core/common/` and is imported directly — it is NOT in the auto-generated components registry and cannot be referenced by page configuration.

### Core Form System

The `src/lib/components/core/form/` directory contains a complete form system built on Svelte 5 runes and context API.

**Key components:**

| Component                    | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `FormUtil`                   | Form container that manages state & context  |
| `TextField`                  | Text input field (autowired)                 |
| `TextareaField`              | Multiline text field (autowired)             |
| `QuantityField`              | Numeric quantity input (autowired)           |
| `PriceField`                 | Price/currency input (autowired)             |
| `SelectField`                | Dropdown select field (autowired)            |
| `SwitchField`                | Toggle switch field (autowired)              |
| `UOMField`                   | Unit of measure selector (autowired)         |
| `CurrencyField`              | Currency selector (autowired)                |
| `CountryField`               | Country selector (autowired)                 |
| `DateField`                  | Date picker with calendar (autowired)        |
| `EditableTableField`         | Editable inline table (autowired)            |
| `FormGenericSingleSelector`  | Generic single-item selector (autowired)     |
| `FormGenericMultiSelector`   | Generic multi-item selector (autowired)      |
| `BusyButton`                 | Submit button with loading state             |
| `FormFieldMessages`          | Error/warning message display                |
| `FormFieldErrorMessage`      | Single error message component               |
| `FormFieldWarningMessage`    | Single warning message component             |
| `FormFieldSkeleton`          | Loading skeleton for form fields             |

**Supporting modules:**

| File                   | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `form-state.svelte.ts` | Reactive state management with runes       |
| `form-context.ts`      | Context API (getFormContext, setFormContext) |
| `validation.ts`        | Declarative validation builder (`v.schema`) |

> **📖 For detailed form documentation, see [forms.md](./forms.md)**

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

## Antipatterns to Avoid

**NEVER use these approaches in component development:**

### ❌ Global Window Functions

```typescript
// NEVER DO THIS
if (typeof window !== 'undefined') {
  ;(window as any).__handleSomething = handleSomething
}

// Or in HTML:
onclick="window.__handleSomething('id')"
```

**Why it's bad:**
- Pollutes global namespace
- Breaks component encapsulation
- Not reusable or composable
- Difficult to test
- Can cause memory leaks
- Tight coupling between components

**Use instead:** Proper Svelte event handlers, component composition, or context API.

### ❌ Inline HTML/SVG Strings

```typescript
// NEVER DO THIS
const snippet = createRawSnippet(() => ({
  render: () => `
    <button onclick="window.something()">
      <svg xmlns="..." width="16" height="16">
        <path d="..."></path>
      </svg>
    </button>
  `
}))
```

**Why it's bad:**
- Not reusable
- Bypasses type safety
- Hard to maintain
- No component composition
- Loses Svelte reactivity
- No proper icon management

**Use instead:**
- Proper Svelte components
- Component composition with imports
- Icon libraries: `lucide-svelte` for icons
- `renderComponent` for proper component rendering

### ✅ Correct Patterns

**For icons:**
```typescript
import { Trash } from 'lucide-svelte'

// Use as component
<Trash size={16} />
```

**For event handlers:**
```typescript
// Direct function binding
<button onclick={() => handleClick(id)}>Click</button>

// Or via renderComponent with proper event binding
return renderComponent(Button, {
  onclick: () => handleClick(id),
  children: iconSnippet
})
```

## Component Quality Checklist

Before considering a component complete, you MUST verify all of the following:

### 1. Internationalization (i18n)

**All user-facing text MUST use Paraglide translation keys.**

**✅ Correct:**
```svelte
<script>
  import * as m from '$lib/paraglide/messages.js'
</script>

<button>{m.common_save()}</button>
<h1>{m.customer()}</h1>
<AlertDialog.Title>{m.confirm_action()}</AlertDialog.Title>
```

**❌ Incorrect:**
```svelte
<button>Save</button>
<h1>Customer</h1>
<AlertDialog.Title>Are you sure?</AlertDialog.Title>
```

**Translation key naming conventions:**

- **Common actions**: Use `common_*` prefix (e.g., `common_save`, `common_cancel`, `common_delete`)
- **Domain-specific**: Use descriptive names (e.g., `supplier`, `customer`, `product`)
- **Parameterized messages**: Use `{param}` syntax (e.g., `archive_supplier_confirmation` with `{name}`)

**Adding new translations:**

1. Add keys to both `messages/en.json` and `messages/it.json`
2. Use consistent naming with existing patterns
3. Provide clear, contextual translations (not literal word-for-word)

**Example:**
```json
// messages/en.json
{
  "phone": "Phone",
  "confirm_action": "Are you sure?",
  "archive_supplier_confirmation": "Are you sure you want to archive the supplier \"{name}\"? This action cannot be undone.",
  "archiving": "Archiving..."
}

// messages/it.json
{
  "phone": "Telefono",
  "confirm_action": "Sei sicuro?",
  "archive_supplier_confirmation": "Sei sicuro di voler archiviare il fornitore \"{name}\"? Questa azione non può essere annullata.",
  "archiving": "Archiviando..."
}
```

### 2. Svelte 5 Validation with svelte-autofixer

**ALWAYS validate your Svelte components using the `svelte-autofixer` tool from the `svelte` MCP server.**

This tool catches common Svelte 5 issues like:
- Missing keys in `#each` blocks
- Incorrect rune usage
- Component API violations
- Reactivity issues

**Required workflow:**

1. After writing/modifying a Svelte component, run `svelte-autofixer`
2. Fix all issues reported by the tool
3. Run `svelte-autofixer` again until no issues remain
4. Only then is the component considered complete

**Example usage:**
```
mcp__svelte__svelte-autofixer({
  code: "<component source code>",
  desired_svelte_version: 5,
  filename: "ComponentName.svelte"
})
```

The tool will return:
- `issues`: Critical problems that MUST be fixed
- `suggestions`: Optional improvements (evaluate case-by-case)
- `require_another_tool_call_after_fixing`: Whether to run again after fixes

**Keep iterating until `issues` is empty.**

### 3. Archive/Delete Operations

**If your component includes archive or delete functionality, you MUST use the standard utility.**

**✅ Correct:**
```typescript
import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'

confirmArchive({
  title: m.confirm_action(),
  description: m.archive_entity_confirmation({ name: entity.name }),
  confirmText: m.common_archive(),
  cancelText: m.common_cancel(),
  onArchive: async () => {
    await apiRequest({ url: `domain/entity/${id}`, method: 'DELETE' })
  },
  successMessage: m.entity_archived_success({ name: entity.name }),
  errorMessage: m.entity_archive_error(),
  onSuccess: () => {
    data = data.filter(d => d.id !== id)
  },
})
```

**❌ Incorrect:**
```typescript
// Don't manage dialog state manually
let dialogOpen = $state(false)
let archiving = $state(false)

async function handleArchive() {
  archiving = true
  try {
    await apiRequest(...)
    dialogOpen = false
    toast.success(...)
  } catch (err) {
    toast.error(...)
  }
  archiving = false
}
```

**See [patterns.md](./patterns.md#archivingdeleting-records) for complete documentation.**

### 4. Testing

**REQUIRED:** When creating or modifying a feature component, you MUST write tests and verify they pass.

#### Creating a new feature component

Create a test file `<ComponentName>.unit.test.ts` alongside the component:

```
src/lib/components/features/<domain>/
├── <ComponentName>.svelte
├── <ComponentName>.mock.ts
└── <ComponentName>.unit.test.ts    ← REQUIRED
```

Tests should cover at minimum:
- Rendering with default/required props
- Key user interactions (clicks, form submissions)
- Conditional rendering (loading, error, empty states)
- Props variations that affect behavior

#### Modifying an existing feature component

When modifying a component that already has tests:
1. Run existing tests first to ensure they pass before your changes
2. Update or add tests to cover your changes
3. Run tests again to verify everything passes

When modifying a component without tests:
1. Write tests for the existing behavior first
2. Make your changes
3. Update tests to cover the new behavior

#### Run tests after implementation

**After every component creation or modification, you MUST run:**

```bash
npm test
```

This runs both `unit` and `server` test projects. All tests must pass before considering the work complete. If tests fail, fix the issues before moving on.

> **📖 For testing patterns, mocking strategies, and project configuration, see [testing/strategy.md](../testing/strategy.md)**

### 5. Component Completeness

Ensure your component includes:

- ✅ Proper TypeScript types for all props
- ✅ Component documentation comment block
- ✅ Mock data file (`<ComponentName>.mock.ts`)
- ✅ Unit test file (`<ComponentName>.unit.test.ts`)
- ✅ Barrel export file (`index.ts`) for standalone components
- ✅ Updated components registry (`npm run generate:components-registry`)
- ✅ All required translations in both `en.json` and `it.json`
- ✅ No hardcoded user-facing strings
- ✅ Validated with `svelte-autofixer` (zero issues)
- ✅ Uses `confirmArchive` utility for delete/archive operations (if applicable)
- ✅ All tests pass (`npm test`)

**Pre-completion checklist:**

```bash
# 1. Validate Svelte code
# Use svelte-autofixer MCP tool

# 2. Check for hardcoded strings
grep -r "hardcoded text" src/lib/components/features/YourComponent/

# 3. Verify translations exist
# Check messages/en.json and messages/it.json

# 4. Update registry
npm run generate:components-registry

# 5. Run tests
npm test
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
