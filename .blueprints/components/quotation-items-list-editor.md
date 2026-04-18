# Quotation Items List Editor

The **QuotationItemsListEditor** is a feature-level form component for editing quotation/sales order line items as vertical cards. It is the production editor used by both `QuotationDetails` and (via `SalesOrderItemsListEditor` wrapper) `SalesOrderDetails`.

It builds on top of `EditableListField` (core) and adds quotation-specific business logic: item types, VAT codes, discount toggles (% vs amount), bulk delivery date, drag-and-drop reordering, and rich descriptions.

## When to Use

Use `QuotationItemsListEditor` when you need to edit a list of quotation/sales order items in a detail form. Two variants:

- **For quotations**: import directly
- **For sales orders**: use the [`SalesOrderItemsListEditor`](#salesorderitemslisteditor-thin-wrapper) wrapper which adds the import-from-quotation feature

For other domains (e.g., supplier orders), create a thin wrapper following the same pattern.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  FormUtil (DetailForm context)                                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  QuotationItemsListEditor                                      │  │
│  │  - Reads form context (auto-wires via getFormContextOptional)  │  │
│  │  - Internal state: InternalLineItem[] (API + UI-only fields)   │  │
│  │  - mapFromApi / transformOutput convert between API and UI     │  │
│  │  - Bulk delivery date (cascades to all "item" type rows)       │  │
│  │  - exposes addItems() for external imports                     │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  EditableListField                                       │  │  │
│  │  │  - Manages add/remove + drag-and-drop                    │  │  │
│  │  │  - Calls handleItemsChange on internal mutations         │  │  │
│  │  │                                                          │  │  │
│  │  │  ┌────────────────────────────────────────────────────┐  │  │  │
│  │  │  │  Item card (item snippet)                          │  │  │  │
│  │  │  │  - "item" type: ItemSelector, qty, price, VAT...   │  │  │  │
│  │  │  │  - "descriptive" type: RichEditorField (full row)  │  │  │  │
│  │  │  └────────────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Core Files

| File | Purpose |
|------|---------|
| `$components/features/form/QuotationItemsListEditor.svelte` | Main editor (card-based) |
| `$components/features/form/QuotationItemsEditor.svelte` | Type definitions (`QuotationLineItem`, `QuotationItemType`), validators, and table-based variant (currently unused) |
| `$components/features/form/SalesOrderItemsListEditor.svelte` | Thin wrapper for sales orders (adds ImportMenu + maps `confirmed_delivery_date`) |

## Type System

### QuotationLineItem

Defined in `QuotationItemsEditor.svelte`. **Superset type** that covers fields from both Quotation and Sales Order item APIs:

```typescript
export type QuotationLineItem = {
  id?: string
  type: 'item' | 'descriptive'
  item_id?: string
  item_snapshot?: Record<string, unknown>
  description?: string
  quantity?: number
  uom?: string
  unit_price?: number
  discount_percent?: number
  discount_amount?: number
  net_value?: number
  vat_code_id?: string
  vat_code_snapshot?: Record<string, unknown>
  tax_amount?: number
  requested_delivery_date?: string
  delivery_date?: string                    // Quotation-specific
  sort_order?: number
  rejection_reason?: string                 // Quotation-specific
  rejected_at?: string                      // Quotation-specific
  rejected_by?: string                      // Quotation-specific
  ordered_quantity?: number                 // Quotation-specific
  conversion_status?: 'none' | 'partial' | 'full'  // Quotation-specific
  version?: number
  // Sales order specific fields
  quotation_item_id?: string                // Links sales order item to source quotation item
  confirmed_delivery_date?: string          // Sales order's confirmed delivery
  is_editable?: boolean
}
```

**Why a superset?** The two API schemas differ slightly. Rather than maintaining two parallel types and duplicating the editor, we keep one editor and map the field names at the boundaries. See [Field name mapping](#field-name-mapping-deliverydatekey).

### Validators

Two reusable validators exported from `QuotationItemsEditor.svelte`:

```typescript
import { quotationItemsRequired, quotationItemsValid } from '$components/features/form/QuotationItemsEditor.svelte'

const validation = {
  items: [
    quotationItemsRequired(m.validation_items_required()),
    quotationItemsValid(m.validation_items_invalid()),
  ],
}
```

| Validator | Checks |
|-----------|--------|
| `quotationItemsRequired` | At least one item exists |
| `quotationItemsValid` | All `type: 'item'` rows have `item_id`, `quantity > 0`, `unit_price`, `vat_code_id` |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `'items'` | Form field name for autowiring |
| `label` | `string` | `m.quotation_items()` | Field label |
| `showLabel` | `boolean` | `true` | Show visible label |
| `value` | `QuotationLineItem[]` | `[]` | Initial value (used when no form context) |
| `currency` | `string` | `DEFAULT_CURRENCY_CODE` | Currency for price/discount fields |
| `showDeliveryDates` | `boolean` | `false` | Show requested + delivery date fields per item, plus bulk date in header |
| `required` | `boolean` | `false` | Mark field as required |
| `disabled` | `boolean` | `false` | Disable all editing |
| `onChange` | `(items: QuotationLineItem[]) => void` | — | Callback when items change |
| `refreshKey` | `unknown` | — | When changed, re-hydrates items from form context (e.g. after save) |
| `defaultVatCode` | `VatCodeSummary` | — | Auto-applied to items with empty `vat_code_id` (from customer commercial terms) |
| `headerActions` | `Snippet` | — | Extra actions rendered in the header (e.g. ImportMenu) |
| `deliveryDateKey` | `'delivery_date' \| 'confirmed_delivery_date'` | `'delivery_date'` | API field name for delivery date — see below |
| `class` | `string` | `''` | Additional CSS classes |

## Public Methods

The editor exports a method that wrappers can call via `bind:this={editorRef}`:

```typescript
editorRef.addItems(newItems: QuotationLineItem[]): void
```

**Behavior**:
- Maps API items to internal format (`mapFromApi`)
- Removes trailing empty/incomplete rows from current state
- Appends new items
- Notifies the form context via `notifyFormUpdate()` (since external mutations to `bind:items` aren't auto-detected by `EditableListField`)

## Field Name Mapping (`deliveryDateKey`)

The API uses different field names for delivery date depending on the document type:

| Document | API field |
|----------|-----------|
| Quotation | `delivery_date` |
| Sales Order | `confirmed_delivery_date` |

The editor handles this transparently:

- **Internally**, items always carry `delivery_date` (single source of truth)
- **`mapFromApi`** reads from either `item.delivery_date ?? item.confirmed_delivery_date`
- **`transformOutput`** maps the internal `delivery_date` to the configured `deliveryDateKey` in output

```svelte
<!-- For quotations (default) -->
<QuotationItemsListEditor name="items" />

<!-- For sales orders -->
<QuotationItemsListEditor name="items" deliveryDateKey="confirmed_delivery_date" />
```

## Date Handling

**Important**: Dates are formatted with `toLocalISOString()` (not `Date.toISOString()`). The native `toISOString()` converts to UTC, causing timezone shifts (e.g., `Apr 30 CET → Apr 29 22:00 UTC`). The local format keeps the wall-clock date stable.

Format used: `YYYY-MM-DDTHH:mm:ss.sss` (no `Z` suffix).

## Notifying the Form Context

`EditableListField` only commits to the form context when its **internal** mutation handlers run (`handleUpdate`, `handleRemove`, add row). When the parent mutates `items` directly via `bind:items`, the form must be notified manually.

This is centralized in `notifyFormUpdate()`:

```typescript
function notifyFormUpdate() {
  const output = transformOutput(items.filter(isCompleteItem))
  onChange?.(output)
  if (form) form.updateField(name, output as never)
}
```

Called by:
- `addItems()` — external imports
- `applyBulkDeliveryDate()` — bulk date update on all rows

If you add new external mutation methods, **always** call `notifyFormUpdate()` after mutating `items`.

## Item Types

### `type: 'item'` (product line)

Multi-row grid layout per card:
- **Row 1**: ItemSelector (product picker), Code (read-only), Quantity
- **Row 2**: Unit Price, Discount (toggle: % vs amount), VAT Code
- **Row 3** (when `showDeliveryDates`): Requested Delivery Date, Delivery Date
- **Footer**: StackedAmountValues showing net + tax

Fields are disabled until an item is selected (`!item.item_id`).

### `type: 'descriptive'` (free-text line)

Full-width `RichEditorField` for arbitrary text. No prices, quantities, or VAT.

## Add Buttons

Two distinct add buttons in the footer:
- **Add item line** — `addItem({ type: 'item' })`
- **Add description line** — `addItem({ type: 'descriptive' })`

## Bulk Delivery Date

When `showDeliveryDates={true}`, a `DateField` in the header lets the user set one date for all `type: 'item'` rows in one click. Triggers `notifyFormUpdate()` after applying.

## Discount Toggle (% vs Amount)

Each item card has a clickable label toggle between:
- **Discount %**: `discount_percent`, `discount_amount` cleared
- **Discount amount**: `discount_amount`, `discount_percent` cleared

Tracked via the UI-only `useDiscountAmount` flag (stripped in `transformOutput`).

## Drag and Drop Reordering

Toggleable reordering mode via the "Reorder items" button in the header. When active:
- Cards collapse into draggable handles
- The bulk delivery date input is disabled
- Click "Done reordering" to exit

## Usage Examples

### In QuotationDetails (default)

```svelte
<QuotationItemsListEditor
  name="items"
  showLabel={false}
  currency={formAPI?.values?.currency ?? DEFAULT_CURRENCY_CODE}
  required={!record}
  refreshKey={record?.version}
  showDeliveryDates
  defaultVatCode={commercialTermsVatCode} />
```

### In SalesOrderDetails (via wrapper)

```svelte
<SalesOrderItemsListEditor
  name="items"
  showLabel={false}
  legalEntityId={legalEntityId}
  customerId={formAPI?.values?.customer_id}
  currency={formAPI?.values?.currency ?? DEFAULT_CURRENCY_CODE}
  required={!record}
  refreshKey={record?.version}
  showDeliveryDates
  defaultVatCode={commercialTermsVatCode} />
```

## SalesOrderItemsListEditor (Thin Wrapper)

**File**: `$components/features/form/SalesOrderItemsListEditor.svelte`

A thin wrapper around `QuotationItemsListEditor` that:

1. Sets `deliveryDateKey="confirmed_delivery_date"`
2. Adds an `ImportMenu` (in `headerActions`) for importing items from approved quotations
3. Filters quotations by `customer_id` (only same-customer quotations can be imported, per backend rule)
4. Maps imported `QuotationItem` → `QuotationLineItem` and sets `quotation_item_id` (required by the sales order API)

### Backend Business Rules (validated server-side)

When passing `quotation_item_id`:
- The quotation must be in **approved** status
- The quotation must belong to the **same customer** as the sales order
- The quotation must belong to the **same legal entity**
- The quotation item must reference the **same item** as the sales order item
- All referenced quotations must have the **same incoterm**

The wrapper enforces the customer + state filters at the API call (`?state=approved&customer_id=...`).

### Import Flow

```
User clicks Import → ImportMenu opens
  → fetchApprovedQuotations(search?) → GET /quotations?state=approved&customer_id=X
  → User selects N quotations + clicks Import
  → handleImport extracts items from each quotation
  → Sets quotation_item_id, copies item fields
  → editorRef.addItems(newItems) → appends + notifies form
```

### Preview Card

The wrapper provides a `previewSnippet` to the ImportMenu showing per-quotation:
- Document number + date
- Item count + net value
- First N items (name + quantity)
- "+M items..." indicator if truncated

## Adding a New Document Type

To use this editor for a new document type (e.g., supplier orders):

1. **Check field differences** with the existing types (especially delivery date naming)
2. **Extend `QuotationLineItem`** in `QuotationItemsEditor.svelte` with any new optional fields
3. **Create a thin wrapper** (e.g., `SupplierOrderItemsListEditor.svelte`) that:
   - Sets the correct `deliveryDateKey` if applicable
   - Adds domain-specific `headerActions` (import menus, transition buttons, etc.)
   - Wraps `QuotationItemsListEditor` with `bind:this={editorRef}` if you need `addItems()`
4. **Do not modify `QuotationItemsListEditor`** for domain-specific logic — keep it generic

## Related

- [`editable-list-field.md`](./editable-list-field.md) — The underlying core component
- [`detail-record-form.md`](./detail-record-form.md) — Form context this editor wires into
- [`import-menu.md`](./import-menu.md) — The ImportMenu used by `SalesOrderItemsListEditor`
