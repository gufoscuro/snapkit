# Component Patterns

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

### Implementation Steps

1. **Define your entity type** (should come from `$lib/types/api-types.ts`):

```typescript
import type { Customer } from '$lib/types/api-types';
```

2. **Create the option mapping function**:

```typescript
const optionMappingFunction = (customer: Customer): ExtendedOption => ({
  value: customer.id,
  label: customer.name,
  // Add any additional fields needed for display
  metadata: {
    email: customer.email,
    status: customer.status
  }
});
```

3. **Create the fetch function**:

```typescript
import { apiRequest } from '$lib/utils/request';

const fetchCustomers = async (searchTerm: string): Promise<Customer[]> => {
  return await apiRequest<Customer[]>({
    url: 'sales/customers',
    queryParams: {
      search: searchTerm,
      limit: 50
    }
  });
};
```

4. **Use the generic selector**:

```svelte
<FormGenericSingleSelector
  {fetchFunction}
  {optionMappingFunction}
  placeholder="Select a customer"
  bind:value={selectedCustomerId}
/>
```

### Best Practices

- Always type your entities using types from `$lib/types/api-types.ts`
- Handle loading and error states within the fetch function
- Keep the option mapping function pure (no side effects)
- Use meaningful labels and include relevant metadata for display
- Consider implementing debouncing for search-heavy selectors

## Translating Enum Values with Paraglide

API endpoints often return enum values (e.g., `'draft' | 'sent' | 'accepted'`) that need to be displayed as human-readable, localized labels.

**Utility file**: `src/lib/utils/enum-labels.ts`

### Adding a New Enum Type

1. **Add message keys** to `messages/en.json` and `messages/it.json`:

```json
// messages/en.json
{
  "enum_<domain>_<field>_<value1>": "Label 1",
  "enum_<domain>_<field>_<value2>": "Label 2"
}

// messages/it.json
{
  "enum_<domain>_<field>_<value1>": "Etichetta 1",
  "enum_<domain>_<field>_<value2>": "Etichetta 2"
}
```

2. **Add config and helpers** to `src/lib/utils/enum-labels.ts`:

```typescript
import * as m from '$lib/paraglide/messages.js'
import type { YourEntityType } from '$lib/types/api-types'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

interface EnumDisplayConfig {
  label: () => string
  variant: BadgeVariant
}

export const yourEnumConfig: Record<YourEntityType['field'], EnumDisplayConfig> = {
  value1: { label: m.enum_domain_field_value1, variant: 'secondary' },
  value2: { label: m.enum_domain_field_value2, variant: 'default' },
}

export function getYourEnumLabel(value: YourEntityType['field']): string {
  return yourEnumConfig[value]?.label() ?? value
}

export function getYourEnumVariant(value: YourEntityType['field']): BadgeVariant {
  return yourEnumConfig[value]?.variant ?? 'default'
}
```

3. **Use in components**:

```typescript
import { getYourEnumLabel, getYourEnumVariant } from '$lib/utils/enum-labels'

const label = getYourEnumLabel(status)   // Localized label
const variant = getYourEnumVariant(status) // Badge variant
```

### Naming Convention

Message keys follow the pattern: `enum_<domain>_<field>_<value>`

Examples:
- `enum_supply_status_draft` - Supply order status "draft"
- `enum_sales_shipped_completed` - Sales order shipped status "completed"

### Existing Enum Configs

| Config | Type | Values |
|--------|------|--------|
| `supplyOrderStatusConfig` | `SupplyOrderSummary['status']` | draft, sent, accepted, shipped, rejected |
| `salesOrderStatusConfig` | `SalesOrderSummary['status']` | draft, sent, accepted |
| `salesShippedStatusConfig` | `SalesOrderSummary['shipped']` | completed, not shipped, partial |

### Best Practices

- Always define enum types in `$lib/types/api-types.ts`
- Combine label + variant in a single config object (DRY principle)
- Use TypeScript's `Record<EnumType, Config>` for exhaustive mapping
- Fallback to the raw value if translation is missing: `config[value]?.label() ?? value`
