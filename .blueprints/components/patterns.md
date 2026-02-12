# Component Patterns

## Archiving/Deleting Records

**Standard utility**: `confirmArchive` from `$lib/components/ui/confirm-archive-dialog`

Use this utility for all archive/delete operations to ensure consistent UX across the app. The utility automatically handles:
- Dialog state management
- Loading state
- Success/error toast notifications
- Data array updates
- Error handling

### Basic Usage

```typescript
import { confirmArchive } from '$lib/components/ui/confirm-archive-dialog'
import { apiRequest } from '$lib/utils/request'
import * as m from '$lib/paraglide/messages.js'

function handleArchiveClick(itemId: string) {
  const item = data.find(d => d.id === itemId)
  if (!item) return

  confirmArchive({
    // Dialog content
    title: m.confirm_action(),
    description: m.archive_supplier_confirmation({ name: item.name || '' }),
    confirmText: m.common_archive(),
    cancelText: m.common_cancel(),

    // Archive operation
    onArchive: async () => {
      await apiRequest({
        url: `domain/entity/${itemId}`,
        method: 'DELETE',
      })
    },

    // User feedback
    successMessage: m.supplier_archived_success({ name: item.name || '' }),
    errorMessage: m.supplier_archive_error(),

    // Update UI
    onSuccess: () => {
      data = data.filter(d => d.id !== itemId)
    },
  })
}
```

### Required Translations

Add these i18n keys for each archivable entity:

```json
// messages/en.json
{
  "archive_<entity>_confirmation": "Are you sure you want to archive \"{name}\"? This action cannot be undone.",
  "<entity>_archived_success": "<Entity> \"{name}\" archived successfully",
  "<entity>_archive_error": "Failed to archive <entity>"
}

// messages/it.json
{
  "archive_<entity>_confirmation": "Sei sicuro di voler archiviare \"{name}\"? Questa azione non può essere annullata.",
  "<entity>_archived_success": "<Entity> \"{name}\" archiviato con successo",
  "<entity>_archive_error": "Impossibile archiviare <entity>"
}
```

### Integration with DataTable

When using with DataTable, add an archive action column:

```typescript
import ArchiveButton from '$lib/components/features/supply/ArchiveButton.svelte'

const columns: ColumnDef<YourEntity>[] = [
  // ... other columns
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return renderComponent(ArchiveButton, {
        onclick: () => handleArchiveClick(row.original.id!),
        class: 'p-0 h-8 w-8',
      })
    },
    meta: {
      cellClassName: 'p-0 w-12',
    },
  },
]
```

### Best Practices

- ✅ Always use `confirmArchive` for delete/archive operations (never manage dialog state manually)
- ✅ Include the entity name in success messages for clarity
- ✅ Update the data array in `onSuccess` callback to reflect the change immediately
- ✅ Use consistent translation key naming: `archive_<entity>_*`
- ✅ Handle API errors gracefully (the utility shows error toast automatically)
- ❌ Don't create custom archive dialogs - use the standard utility
- ❌ Don't forget to add all required translation keys

### Example: Real Implementation

See `src/lib/components/features/supply/SuppliersTable/default/SuppliersTable.svelte` for a complete working example.

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
