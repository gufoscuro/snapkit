# Editable Table Field Pattern

The **EditableTableField** is a core form component for editing arrays of structured data as table rows. It provides add/remove row management, form context autowiring, and debounced updates to the parent form.

## When to Use

Use this pattern when a form field represents an **array of structured objects** — e.g., line items, addresses, phone numbers, pricing tiers, due dates. Each row has multiple sub-fields displayed as table columns.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FormUtil (parent form context)                                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  EditableTableField                                       │  │
│  │  - Reads form context for its `name` field               │  │
│  │  - Clears form context for children (clearFormContext)    │  │
│  │  - Manages internal `items: T[]` state                    │  │
│  │  - Syncs completed items back to parent form              │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  Row snippet (per item)                              │ │  │
│  │  │  - TextField, Select.Root, PriceField, etc.          │ │  │
│  │  │  - NO form context (cleared) → manual value binding  │ │  │
│  │  │  - Uses updateItem(index, { field: value })          │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight:** `EditableTableField` calls `clearFormContext()`. This means child components inside the row snippet **cannot** autowire to the parent form. They must use the `updateItem` callback and explicit `value` props instead.

## Core Component

**File:** `$components/core/form/EditableTableField.svelte`

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Field name for parent form binding |
| `label` | `string` | No | Label displayed above the table |
| `showLabel` | `boolean` | No | Show/hide the label (default: `true`) |
| `items` | `T[]` | Yes | Bindable array of row items |
| `createEmptyItem` | `() => T` | Yes | Factory for new empty rows |
| `isEmptyItem` | `(item: T) => boolean` | Yes | Check if a row is empty (for auto-management) |
| `isCompleteItem` | `(item: T) => boolean` | Yes | Check if a row is valid for output |
| `transformOutput` | `(items: T[]) => unknown[]` | No | Transform completed items before syncing to form |
| `disabled` | `boolean` | No | Disable all interactions |
| `required` | `boolean` | No | Show required indicator on label |
| `minWidth` | `string` | No | Min table width for scroll (default: `'600px'`) |
| `onItemsChange` | `(items: T[]) => void` | No | Callback when completed items change |
| `header` | `Snippet` | Yes | Table header cells snippet |
| `row` | `Snippet<[{ item, index, updateItem, onFocus, onBlur }]>` | Yes | Row cells snippet |

### Row Snippet API

The `row` snippet receives:

- **`item: T`** — current row data
- **`index: number`** — row index
- **`updateItem(index, updates)`** — partial update function
- **`onFocus()`** — call when a field is focused (ensures empty row exists)
- **`onBlur()`** — call when a field is blurred (trims extra empty rows)

### Behavior

1. **Auto empty row:** Always maintains one empty row at the end for adding new items
2. **Debounced sync:** Updates to the parent form are debounced (300ms)
3. **Filtered output:** Only `isCompleteItem` items are synced to the form
4. **Context isolation:** Children cannot autowire to the parent form

## Creating an Editor Component

### Step 1: Define the internal item type

Use string values for inputs (parsed to numbers in `transformOutput`):

```typescript
type InternalItem = {
  days: string      // string for <input type="number">
  percentage: string
  payment_method: string  // enum value
}
```

### Step 2: Implement the required functions

```typescript
function createEmptyItem(): InternalItem {
  return { days: '', percentage: '', payment_method: 'MP05' }
}

function isEmptyItem(item: InternalItem): boolean {
  return !item.days && !item.percentage
}

function isCompleteItem(item: InternalItem): boolean {
  const days = parseInt(item.days)
  const pct = parseFloat(item.percentage)
  return !isNaN(days) && days >= 0 && !isNaN(pct) && pct > 0 && !!item.payment_method
}

function transformOutput(items: InternalItem[]): ApiDueDate[] {
  return items.map(item => ({
    days: parseInt(item.days),
    percentage: parseFloat(item.percentage),
    payment_method: item.payment_method,
  }))
}
```

### Step 3: Load initial values

Use an `$effect` to hydrate internal state from the `value` prop:

```typescript
$effect(() => {
  if (value && items.length === 0) {
    items = value.map(apiItem => ({
      days: apiItem.days.toString(),
      percentage: apiItem.percentage.toString(),
      payment_method: apiItem.payment_method,
    }))
  }
})
```

### Step 4: Build the template

```svelte
<EditableTableField
  {name}
  {label}
  bind:items
  {createEmptyItem}
  {isEmptyItem}
  {isCompleteItem}
  {transformOutput}
  minWidth="800px"
  onItemsChange={handleItemsChange}>

  {#snippet header()}
    <Table.Head class="w-28">Days</Table.Head>
    <Table.Head class="w-28">Percentage</Table.Head>
    <Table.Head class="min-w-48">Payment Method</Table.Head>
  {/snippet}

  {#snippet row({ item, index, updateItem, onFocus, onBlur })}
    <Table.Cell class={EditableTableFieldClass.TableCell}>
      <TextField
        name="days-{index}"
        type="number"
        value={item.days}
        class={FormFieldClass.TableCell}
        showLabel={false}
        showErrorMessage={false}
        width="w-full"
        oninput={(e) => updateItem(index, { days: e.currentTarget.value })}
        onfocus={onFocus}
        onblur={onBlur} />
    </Table.Cell>
    <!-- more cells... -->
  {/snippet}
</EditableTableField>
```

## Using Selects Inside Rows

Since form context is cleared, **do not use `SelectField`** (it autowires). Instead, use raw `Select.Root` from shadcn:

```svelte
<Table.Cell class={EditableTableFieldClass.TableCell}>
  <Select.Root
    type="single"
    value={item.payment_method}
    onValueChange={(v) => updateItem(index, { payment_method: v })}>
    <Select.Trigger class="{FormFieldClass.TableCell} w-full">
      <span class="truncate">{getLabel(item.payment_method)}</span>
    </Select.Trigger>
    <Select.Content class="max-h-60 w-80">
      {#each options as opt (opt.value)}
        <Select.Item value={opt.value} label={opt.label}>
          {opt.label}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
</Table.Cell>
```

**Exception:** `SelectField` can be used **outside** the `EditableTableField` (e.g., a companion field above the table) because it is not inside the cleared context.

## Form Integration

### As a standalone field in a form

The editor syncs its output to the parent form's `name` field automatically. Use a custom validator if needed:

```typescript
import { termsRequired } from '$components/features/form/PaymentTermDueDatesEditor.svelte'

const validate = v.schema<Partial<PaymentTerm>>({
  terms: [termsRequired()],
}).build()
```

### Composite output

If the editor manages a complex nested structure (e.g., `{ reference_date, due_dates[] }`), handle the top-level form field update via `onItemsChange`:

```typescript
function handleItemsChange(completedItems: InternalItem[]) {
  const terms = {
    reference_date: referenceDate,
    due_dates: transformOutput(completedItems),
  }
  // The editor's onChange callback propagates to the parent
  onChange?.(terms)
}
```

## Styling Constants

| Constant | Class | Usage |
|---|---|---|
| `EditableTableFieldClass.Body` | `group` | Table body wrapper |
| `EditableTableFieldClass.TableHeadCell` | `*:bg-muted/50 border-t` | Header row |
| `EditableTableFieldClass.TableCell` | `p-0 group-last:border-b border-r border-l...` | Data cells |
| `FormFieldClass.TableCell` | `h-10 w-full rounded-none border-transparent...` | Input inside cell |

## Existing Editors

| Component | Domain | Location |
|---|---|---|
| `AddressesEditor` | Customer/supplier addresses | `features/form/AddressesEditor.svelte` |
| `PhonesEditor` | Phone numbers | `features/form/PhonesEditor.svelte` |
| `EmailsEditor` | Email addresses (inline) | `features/form/EmailsEditor.svelte` |
| `PricesEditor` | Volume pricing / deals | `features/form/PricesEditor.svelte` |
| `ProductsEditor` | Order line items | `features/form/ProductsEditor.svelte` |
| `RawMaterialsEditor` | BOM raw materials | `features/form/RawMaterialsEditor.svelte` |
| `AttributesEditor` | Item attributes | `features/form/AttributesEditor.svelte` |
| `PaymentTermDueDatesEditor` | Payment due dates | `features/form/PaymentTermDueDatesEditor.svelte` |

## Checklist

When creating a new editor:

- [ ] Define `InternalItem` type with string values for numeric inputs
- [ ] Implement `createEmptyItem`, `isEmptyItem`, `isCompleteItem`, `transformOutput`
- [ ] Use `$effect` to hydrate from `value` prop
- [ ] Use `EditableTableFieldClass.TableCell` on `<Table.Cell>`
- [ ] Use `FormFieldClass.TableCell` on inputs
- [ ] Set `showLabel={false}` and `showErrorMessage={false}` on row inputs
- [ ] Pass `onfocus={onFocus}` and `onblur={onBlur}` to row inputs
- [ ] Use raw `Select.Root` for selects inside rows (not `SelectField`)
- [ ] Export a custom validator if the field has required validation
- [ ] Add component metadata comment (`@component`, `@uses EditableTableField`)
