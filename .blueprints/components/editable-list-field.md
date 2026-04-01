# Editable List Field Pattern

The **EditableListField** is a core form component for editing arrays of structured data as vertical cards. It is the card-based alternative to `EditableTableField`, designed for cases where each item has too many fields to fit comfortably in a horizontal table row.

## When to Use

Use `EditableListField` instead of `EditableTableField` when:

- Each item has **many fields** (5+) that would make a table too wide
- Fields need **multi-row layout** within each item (e.g., a grid)
- Items have **different layouts** depending on their type (e.g., "item" vs "descriptive")
- You want fields to have **visible labels** (table headers don't suffice)
- Items contain **rich content** (rich text editors, complex selectors)

Use `EditableTableField` when items have few, uniform columns and a compact table layout is preferred.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  FormUtil (parent form context)                                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  EditableListField                                        │  │
│  │  - Reads form context for its `name` field               │  │
│  │  - Clears form context for children (clearFormContext)    │  │
│  │  - Manages internal `items: T[]` state                    │  │
│  │  - Syncs completed items back to parent form              │  │
│  │  - Explicit add/remove (no auto-empty-row)               │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  Card (per item)                               [X]  │ │  │
│  │  │  - Free-form layout via `item` snippet               │ │  │
│  │  │  - NO form context → manual value binding            │ │  │
│  │  │  - Uses updateItem(index, { field: value })          │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  [ + Add line ]  (or custom addButton snippet)            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key differences from EditableTableField:**

| | EditableTableField | EditableListField |
|---|---|---|
| Layout | Horizontal table rows | Vertical card stack |
| Empty row management | Auto (always one empty row at bottom) | Explicit (add button) |
| Snippets | `header` + `row` | `item` + optional `addButton`, `removeButton`, `empty` |
| `isEmptyItem` | Required | Not needed |
| Add item | Implicit (focus on empty row) | Explicit (button click) |
| Add validation | None | Blocks add if existing items are incomplete |
| Initial state | Starts with one empty row | Starts with one empty row |

## Core Component

**File:** `$components/core/form/EditableListField.svelte`

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Field name for parent form binding |
| `label` | `string` | No | Label displayed above the list |
| `showLabel` | `boolean` | No | Show/hide the label (default: `true`) |
| `items` | `T[]` | Yes | Bindable array of items |
| `createEmptyItem` | `() => T` | Yes | Factory for new empty items |
| `isCompleteItem` | `(item: T) => boolean` | Yes | Check if an item is valid for output |
| `transformOutput` | `(items: T[]) => unknown[]` | No | Transform completed items before syncing to form |
| `disabled` | `boolean` | No | Disable all interactions |
| `required` | `boolean` | No | Show required indicator on label |
| `error` | `string` | No | External error message |
| `onItemsChange` | `(items: T[]) => void` | No | Callback when completed items change |
| `syncFromForm` | `boolean` | No | Sync items from form context (default: `true`) |
| `class` | `string` | No | Additional CSS classes on wrapper |
| `itemClass` | `string` | No | CSS class applied to each card |

### Snippets

| Snippet | Parameters | Required | Description |
|---|---|---|---|
| `item` | `{ item, index, updateItem, removeItem }` | Yes | Card content |
| `addButton` | `{ addItem, disabled }` | No | Custom add button(s) |
| `removeButton` | `{ removeItem, index, disabled }` | No | Custom remove button |
| `empty` | — | No | Empty state content |

### Item Snippet API

The `item` snippet receives:

- **`item: T`** — current item data
- **`index: number`** — item index
- **`updateItem(index, updates)`** — partial update function (triggers debounced form sync)
- **`removeItem(index)`** — remove this item

### Add Button API

The `addButton` snippet receives:

- **`addItem(options?)`** — add a new item. Accepts optional `Partial<T>` to merge onto the empty item. **Blocks if any existing item is incomplete** (`isCompleteItem` returns false).
- **`disabled: boolean`** — whether the field is disabled

### Behavior

1. **Explicit add/remove:** No auto-empty-row. Users click a button to add items.
2. **Add validation:** `addItem()` is blocked if any existing item fails `isCompleteItem`.
3. **Options on add:** `addItem({ type: 'descriptive' })` merges options onto the new empty item — useful for multi-type lists.
4. **Auto first row:** If `items.length === 0` on mount, one empty row is added automatically.
5. **Debounced sync:** Updates to the parent form are debounced (300ms).
6. **Filtered output:** Only `isCompleteItem` items are synced to the form.
7. **Context isolation:** Children cannot autowire to the parent form (`clearFormContext`).

## Creating an Editor Component

### Step 1: Define the internal item type

```typescript
type InternalLineItem = {
  type: 'item' | 'descriptive'
  itemId: string
  itemName: string
  description: string
  quantity: number
  unitPrice: number
  // ... more fields
}
```

### Step 2: Implement the required functions

```typescript
function createEmptyItem(): InternalLineItem {
  return {
    type: 'item',
    itemId: '',
    itemName: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
  }
}

// isEmptyItem is NOT needed (no auto-row management)

function isCompleteItem(item: InternalLineItem): boolean {
  if (item.type === 'descriptive') return !!item.description
  return !!item.itemId && item.quantity > 0
}

function transformOutput(items: InternalLineItem[]): ApiLineItem[] {
  return items.map(item => ({
    type: item.type,
    item_id: item.itemId || undefined,
    description: item.description || undefined,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }))
}
```

### Step 3: Load initial values

Use an `$effect` to hydrate internal state from the form context or `value` prop:

```typescript
$effect(() => {
  const initialValue = (form?.values[name] as ApiLineItem[] | undefined) ?? value
  if (initialValue && initialValue.length > 0 && (items.length === 0 || items.every(i => !isCompleteItem(i)))) {
    items = initialValue.map(apiItem => ({
      type: apiItem.type || 'item',
      itemId: apiItem.item_id ?? '',
      // ... map API fields to internal fields
    }))
  }
})
```

### Step 4: Build the template

```svelte
<EditableListField
  {name}
  {label}
  bind:items
  {createEmptyItem}
  {isCompleteItem}
  {transformOutput}
  disabled={isDisabled}
  syncFromForm={false}
  onItemsChange={handleItemsChange}>

  {#snippet item({ item, index, updateItem, removeItem })}
    <div class="grid grid-cols-1 gap-x-4 gap-y-3 pr-8 sm:grid-cols-2 lg:grid-cols-3">
      <ItemSelector
        name="item-{index}"
        label={m.item()}
        value={item.itemId}
        showLabel
        width="w-full"
        onChoose={selected => updateItem(index, { itemId: selected.id })} />

      <QuantityField
        name="qty-{index}"
        label={m.quantity()}
        value={item.quantity}
        showLabel
        width="w-full"
        onChange={qty => updateItem(index, { quantity: qty })} />

      <PriceField
        name="price-{index}"
        label={m.unit_price()}
        value={item.unitPrice}
        showLabel
        width="w-full"
        onChange={price => updateItem(index, { unitPrice: price })} />
    </div>
  {/snippet}
</EditableListField>
```

### Multi-type lists with custom add buttons

When items have different types (e.g., "item" vs "descriptive"), use the `addButton` snippet to offer multiple add actions:

```svelte
<EditableListField ...>
  {#snippet item({ item, index, updateItem })}
    {#if item.type === 'descriptive'}
      <!-- Descriptive layout -->
    {:else}
      <!-- Item layout -->
    {/if}
  {/snippet}

  {#snippet addButton({ addItem, disabled })}
    <div class="mt-1 flex gap-2">
      <Button variant="outline" size="sm" {disabled}
        onclick={() => addItem({ type: 'item' })}>
        <Plus class="mr-1 size-4" /> Add item
      </Button>
      <Button variant="ghost" size="sm" {disabled}
        onclick={() => addItem({ type: 'descriptive' })}>
        <Plus class="mr-1 size-4" /> Add description
      </Button>
    </div>
  {/snippet}
</EditableListField>
```

The `addItem(options)` call merges the options onto `createEmptyItem()`, so `{ type: 'descriptive' }` overrides the default type.

## Card Layout Guidelines

Since there is no table header, each field needs its own visible label (`showLabel` or a manual `<span>`). Use responsive grids:

```svelte
<div class="grid grid-cols-1 gap-x-4 gap-y-3 pr-8 sm:grid-cols-2 lg:grid-cols-3">
  <!-- Fields flow into the grid automatically -->
</div>
```

- **`pr-8`** — leaves space for the absolute-positioned remove button (X) in the card's top-right corner
- **Responsive breakpoints** — `grid-cols-1` on mobile, `sm:grid-cols-2` on tablet, `lg:grid-cols-3` on desktop
- **Read-only values** (e.g., computed net value, item code) can use a manual label + value div instead of a form field

### Read-only display field pattern

```svelte
<div class="flex flex-col justify-end">
  <span class="block text-sm leading-6 font-medium">{m.net_value()}</span>
  <div class="flex h-10 items-center text-sm font-medium tabular-nums">
    {computedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
  </div>
</div>
```

## Rich Text in Cards

Cards can contain `RichEditorField` for free-form text. Since `EditableListField` clears form context, use the `onChange` callback to propagate changes through `updateItem`:

```svelte
<RichEditorField
  name="description-{index}"
  label={m.description()}
  value={item.description}
  width="w-full"
  minHeight="min-h-20 max-h-60 overflow-y-auto bg-input/10 dark:bg-input/30"
  onChange={md => updateItem(index, { description: md })} />
```

**Do not** use `bind:value` on `RichEditorField` inside cards — it bypasses `updateItem` and the debounced form sync will never fire.

## Styling Constants

| Constant | Class | Usage |
|---|---|---|
| `EditableListFieldClass.List` | `flex flex-col gap-3` | Card stack wrapper |
| `EditableListFieldClass.Card` | `relative rounded-lg border bg-card p-4` | Individual card |
| `EditableListFieldClass.RemoveButton` | `absolute top-2 right-2` | Remove button position |
| `EditableListFieldClass.AddButton` | `mt-1` | Add button spacing |

## Existing Editors

| Component | Layout | Location |
|---|---|---|
| `QuotationItemsListEditor` | Card (3-col grid, multi-type) | `features/form/QuotationItemsListEditor.svelte` |

## Checklist

When creating a new list editor:

- [ ] Define `InternalItem` type
- [ ] Implement `createEmptyItem`, `isCompleteItem`, `transformOutput`
- [ ] Use `$effect` to hydrate from `value` prop or form context
- [ ] Use `updateItem(index, updates)` for all field changes (including `RichEditorField` via `onChange`)
- [ ] Set `showLabel` on all fields (no table header to provide labels)
- [ ] Set `showErrorMessage={false}` on row inputs
- [ ] Use `pr-8` on the grid to leave room for the remove button
- [ ] Use responsive grid classes (`sm:grid-cols-2 lg:grid-cols-3`)
- [ ] Use `addButton` snippet for multi-type lists with different add actions
- [ ] Export custom validators if the field has required validation
- [ ] Add component metadata comment (`@component`, `@uses EditableListField`)
