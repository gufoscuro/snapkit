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

## Record Actions

Record actions are operations that can be performed on a specific record (e.g. suspend customer, cease supplier, confirm order). The system is built on three layers:

| Layer | File | Purpose |
|---|---|---|
| **Types & execution** | `src/lib/utils/record-actions.ts` | `RecordAction` type, `executeRecordAction()`, `createFlagToggleAction()` factory |
| **Confirmation dialog** | `src/lib/components/ui/confirm-action-dialog/` | Generic singleton dialog (like `confirmArchive` but for any action) |
| **Menu component** | `src/lib/components/ui/record-action-menu/` | `RecordActionMenu` — DropdownMenu that renders a list of actions |

### Core types

```typescript
import { type RecordAction, type RecordActionRequestOptions, executeRecordAction } from '$lib/utils/record-actions'

// Base options — extend for domain-specific needs
type RecordActionRequestOptions = { targetId: string }

// Action definition — pure data, no UI coupling
type RecordAction<T extends RecordActionRequestOptions> = {
  id: string
  label: string | ((options: T) => string)
  icon?: Component                                     // static icon
  resolveIcon?: (options: T) => Component | undefined  // dynamic icon (e.g. toggle)
  confirmation?: boolean
  confirmationText?: string | ((options: T) => string)
  confirmationTitle?: string | ((options: T) => string)
  confirmationVariant?: ButtonVariant | ((options: T) => ButtonVariant)
  successMessage?: string | ((options: T) => string)
  errorMessage?: string | ((options: T) => string)
  onAction: (options: T) => Promise<void>
  visible?: (options: T) => boolean
  disabled?: (options: T) => boolean
}
```

### RecordActionMenu component

Renders a dropdown menu (3-dots trigger by default) with a list of actions.

```svelte
<RecordActionMenu
  actions={myActions}
  actionOptions={{ targetId: record.id, name: record.name }}
  align="end"
  buttonVariant="ghost"
/>
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `actions` | `RecordAction<T>[]` | required | Actions to display |
| `actionOptions` | `T` | required | Options passed to each action callback |
| `align` | `'start' \| 'end'` | `'end'` | Dropdown alignment |
| `size` | `'sm' \| 'default' \| 'lg' \| 'icon'` | `'icon'` | Trigger button size |
| `buttonVariant` | `ButtonVariant` | `'ghost'` | Trigger button variant |
| `triggerIcon` | `Snippet` | `EllipsisVertical` | Custom trigger icon |
| `class` | `string` | — | CSS class for trigger button |

The menu only renders if at least one action is visible.

### Standalone usage (without the menu)

Actions are pure functions — use `executeRecordAction` from a button, keyboard handler, etc.:

```typescript
import { executeRecordAction } from '$lib/utils/record-actions'

await executeRecordAction(suspendAction, { targetId: customer.id, name: customer.name })
```

### Flag toggle actions

For boolean flags toggled via a `/flags` endpoint (e.g. `suspended`, `ceased`), use the `createFlagToggleAction` factory. It handles label/icon/confirmation switching based on the current flag state.

```typescript
import { createFlagToggleAction, type RecordAction, type RecordActionRequestOptions } from '$lib/utils/record-actions'
import * as m from '$lib/paraglide/messages.js'

type CustomerFlagOptions = RecordActionRequestOptions & {
  name: string
  version: number
  suspendedAt: string | null
  ceasedAt: string | null
}

const toggleSuspend = createFlagToggleAction<CustomerFlagOptions>({
  id: 'toggle-suspend',
  flag: 'suspended',                                           // API body key
  isActive: (opts) => !!opts.suspendedAt,                      // current state
  apiUrl: (opts) => `/legal-entities/${leId}/customers/${opts.targetId}/flags`,
  getVersion: (opts) => opts.version,                          // optimistic concurrency
  label: {
    set: m.suspend_customer(),                                 // shown when flag is OFF
    unset: m.unsuspend_customer(),                             // shown when flag is ON
  },
  confirmation: {
    set: (opts) => m.suspend_customer_confirmation({ name: opts.name }),
    unset: (opts) => m.unsuspend_customer_confirmation({ name: opts.name }),
  },
  confirmationVariant: { set: 'destructive' },
  successMessage: {
    set: (opts) => m.customer_suspended_success({ name: opts.name }),
    unset: (opts) => m.customer_unsuspended_success({ name: opts.name }),
  },
  errorMessage: m.flag_action_error(),
  onSuccess: () => detail.refetch(),                           // re-fetch record after toggle
})
```

**`FlagToggleConfig` fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique action id |
| `flag` | `string` | yes | API body key (`'suspended'`, `'ceased'`, etc.) |
| `isActive` | `(opts) => boolean` | yes | Returns true when flag is currently ON |
| `apiUrl` | `(opts) => string` | yes | Builds the flags endpoint URL |
| `getVersion` | `(opts) => number` | yes | Extracts version for optimistic concurrency |
| `label` | `{ set, unset }` | yes | Labels for each direction (string or function) |
| `icon` | `{ set?, unset? }` | no | Icons for each direction |
| `confirmation` | `{ set?, unset? }` | no | Confirmation texts (enables dialog if provided) |
| `confirmationVariant` | `{ set?, unset? }` | no | Button variant per direction |
| `successMessage` | `{ set?, unset? }` | no | Toast messages per direction |
| `errorMessage` | `string \| function` | no | Shared error message |
| `onSuccess` | `() => void \| Promise<void>` | no | Callback after successful toggle (e.g. refetch) |
| `visible` | `(opts) => boolean` | no | Conditionally show/hide |
| `disabled` | `(opts) => boolean` | no | Conditionally disable |

### Creating action definitions for an entity

Group action definitions in a dedicated file per entity:

**File:** `src/lib/components/features/<domain>/<entity>-actions.ts`

```typescript
type CreateEntityFlagActionsOptions = {
  legalEntityId: string
  onSuccess?: () => void | Promise<void>
}

export function createEntityFlagActions({ legalEntityId, onSuccess }: CreateEntityFlagActionsOptions): RecordAction<EntityFlagOptions>[] {
  return [
    createFlagToggleAction<EntityFlagOptions>({ /* suspend config */ }),
    createFlagToggleAction<EntityFlagOptions>({ /* cease config */ }),
  ]
}
```

### Integrating in a detail form

In the detail component, create actions with `detail.refetch` as the `onSuccess` callback and render the menu next to the save button:

```svelte
<script lang="ts">
  import { RecordActionMenu } from '$lib/components/ui/record-action-menu'
  import { createEntityFlagActions } from './entity-actions'

  const detail = useDetailRecord<Entity>({ /* ... */ })
  const record = $derived(detail.record)

  const flagActions = $derived(legalEntityId
    ? createEntityFlagActions({ legalEntityId, onSuccess: detail.refetch })
    : []
  )

  const actionOptions = $derived.by(() => {
    if (!record) return null
    return {
      targetId: record.id,
      name: record.name,
      version: record.version,
      suspendedAt: record.suspended_at || null,
      ceasedAt: record.ceased_at || null,
    }
  })
</script>

{#snippet bottom()}
  <div class="fixed right-0 bottom-0 flex h-14 w-full items-center justify-end gap-2 px-4">
    {#if actionOptions}
      <RecordActionMenu actions={flagActions} {actionOptions} />
    {/if}
    <BusyButton type="submit">{m.save_changes()}</BusyButton>
  </div>
{/snippet}
```

The menu only appears in edit mode (when `record` exists, not on create).

### Required translations for flag toggle actions

For each entity + flag combination, add these keys:

```json
// messages/en.json
{
  "suspend_<entity>": "Suspend <entity>",
  "unsuspend_<entity>": "Remove suspension",
  "suspend_<entity>_confirmation": "Are you sure you want to suspend \"{name}\"?",
  "unsuspend_<entity>_confirmation": "Are you sure you want to remove the suspension for \"{name}\"?",
  "<entity>_suspended_success": "<Entity> \"{name}\" suspended",
  "<entity>_unsuspended_success": "Suspension removed for \"{name}\"",
  "flag_action_error": "Operation failed. Please try again."
}
```

### RecordActionButton component

For cases where an action should appear as a standalone button (not inside the dropdown menu), use `RecordActionButton`. It uses the same `RecordAction` type and `executeRecordAction()` for confirmation/toast handling.

**File:** `src/lib/components/ui/record-action-button/`

```svelte
<RecordActionButton action={approveAction} {actionOptions} variant="default" />
<RecordActionButton action={rejectAction} {actionOptions} variant="outline" />
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `action` | `RecordAction<T>` | required | The action to execute |
| `actionOptions` | `T` | required | Options passed to the action callbacks |
| `variant` | `ButtonVariant` | `'default'` | Button variant |
| `size` | `'sm' \| 'default' \| 'lg' \| 'icon'` | `'default'` | Button size |
| `class` | `string` | — | Additional CSS class |
| `children` | `Snippet` | — | Custom button content (overrides action label) |

The button respects `visible()` and `disabled()` from the action definition — it won't render if the action is not visible.

**Common pattern:** Use both `RecordActionMenu` (dropdown for all actions) and `RecordActionButton` (prominent buttons for key actions) together in the bottom bar:

```svelte
{#if actionOptions}
  <RecordActionMenu buttonVariant="outline" actions={allActions} {actionOptions} />
{/if}

{#if rejectAction && actionOptions}
  <RecordActionButton action={rejectAction} {actionOptions} variant="outline" />
{/if}
{#if approveAction && actionOptions}
  <RecordActionButton action={approveAction} {actionOptions} />
{/if}
```

### Custom (non-flag) actions

Not all actions are flag toggles. For state transitions, API calls with different methods, or non-boolean operations, define a plain `RecordAction` object:

```typescript
const approveAction: RecordAction<MyOptions> = {
  id: 'approve',
  label: m.approve(),
  confirmation: true,
  confirmationText: (opts) => m.approve_confirmation({ name: opts.name }),
  successMessage: (opts) => m.approved_success({ name: opts.name }),
  errorMessage: m.flag_action_error(),
  visible: (opts) => opts.availableTransitions.includes('approve'),
  onAction: async (opts) => {
    await api.post(`/endpoint/${opts.targetId}/transition`, {
      data: { transition: 'approve' },
    })
    await onSuccess?.()
  },
}
```

These can be mixed with `createFlagToggleAction` results in the same actions array.

### Backend-driven transition visibility

When a resource exposes a state machine via a `/transition` endpoint, the backend is the source of truth for which transitions are currently allowed. Its response includes an `available_transitions: string[]` field listing the valid transitions for the record in its current state (e.g. `['approve', 'reject']` while open, `['reopen']` once approved, `[]` when terminal).

**Rule of thumb:**

- **State transitions** (approve/reject/reopen/...) → gate via `availableTransitions.includes('<id>')`. Do NOT infer visibility from `record.state` — let the backend decide.
- **Non-transition actions** (flag toggles like `/flags` endpoints, downloads, etc.) → still gate locally based on `record.state` or other fields, since they aren't part of the state machine.

**Implementation steps:**

1. Add the field to the API type (if not already generated):

    ```typescript
    export type Quotation = {
      // ... existing fields
      available_transitions?: string[]
    }
    ```

2. Extend the action options type:

    ```typescript
    export type QuotationActionOptions = RecordActionRequestOptions & {
      documentNumber: string
      version: number
      state: QuotationStatus
      sentAt: string | null
      availableTransitions: string[]
    }
    ```

3. Make each transition action's `visible` predicate consult `availableTransitions`. Use the **same string** as the backend transition name — it's the same identifier you POST to `/transition`, so keep the action `id`, the POST payload, and the `includes()` check aligned:

    ```typescript
    {
      id: 'approve',
      visible: (opts) => opts.availableTransitions.includes('approve'),
      onAction: async (opts) => {
        await api.post(`/legal-entities/${leId}/quotations/${opts.targetId}/transition`, {
          data: { transition: 'approve' },
        })
      },
    }
    ```

4. Pass `record.available_transitions ?? []` when building `actionOptions` in the detail component:

    ```typescript
    const actionOptions = $derived.by((): QuotationActionOptions | null => {
      if (!record) return null
      return {
        targetId: record.id,
        documentNumber: record.document_number,
        version: record.version,
        state: record.state,
        sentAt: record.sent_at || null,
        availableTransitions: record.available_transitions ?? [],
      }
    })
    ```

5. **Do not duplicate the gate in the BottomBar.** The `visible()` predicate is already honoured by both `RecordActionMenu` and `RecordActionButton`, so a transition button will simply not render when the backend excludes it. Avoid wrappers like `{:else if record.state === 'open'}` around transition buttons — they add a second, potentially divergent source of truth:

    ```svelte
    <!-- ❌ Don't: duplicates the gate and hides the button even when backend would allow it -->
    {#if record.state === 'open'}
      <RecordActionButton action={approveAction} {actionOptions} />
    {/if}

    <!-- ✅ Do: let the action's visible() predicate decide -->
    <RecordActionButton action={approveAction} {actionOptions} />
    ```

    Reserve outer `{#if}` gates for things that genuinely aren't transitions — e.g. the Save button, which is tied to form editability, not to a backend-allowed operation.

6. Adding a new transition later (e.g. `reopen`) requires no UI restructuring: just define another `RecordAction` with `id: 'reopen'` and `visible: (opts) => opts.availableTransitions.includes('reopen')`. When the backend starts returning it, it will show up automatically in the menu.

**Why this matters:** frontend guards like `state === 'open'` are brittle duplicates of backend logic and go stale whenever the state machine changes. Trusting `available_transitions` keeps the UI in lock-step with the backend without coordinated releases.

### Existing implementations

| Entity | Actions file | Detail component |
|---|---|---|
| Customer | `src/lib/components/features/customers/customer-actions.ts` | `CustomerDetails.svelte` |
| Supplier | `src/lib/components/features/suppliers/supplier-actions.ts` | `SupplierDetails.svelte` |
| Quotation | `src/lib/components/features/quotations/quotation-actions.ts` | `QuotationDetails.svelte` |
| Sales Order | `src/lib/components/features/sales-orders/sales-order-actions.ts` | `SalesOrderDetails.svelte` |

### Best practices

- Actions are pure functions — define them outside of components for testability
- Use `createFlagToggleAction` for any boolean flag toggled via a `/flags` endpoint
- Always pass `detail.refetch` as `onSuccess` to keep the UI in sync after a mutation
- Group all actions for an entity in a single `<entity>-actions.ts` file
- The menu only renders when there are visible actions — no need for manual `{#if}` around it (but guard `actionOptions` to avoid passing null)
- Labels, confirmation texts, and success messages must use Paraglide (`m.xxx()`)
- For destructive operations (suspend, cease), use `confirmationVariant: { set: 'destructive' }`

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
