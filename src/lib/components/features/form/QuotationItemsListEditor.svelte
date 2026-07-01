<!--
  @component QuotationItemsListEditor
  @description Card-based editor for quotation line items.
  Alternative to QuotationItemsEditor with vertical card layout for better
  space utilization when there are many fields per item.
  Supports two item types: "item" (product line) and "descriptive" (free-text).
  @keywords quotation, items, editor, line-items, sales, pricing, card
  @uses EditableListField, ItemSelector, VatCodeSelector
-->
<script lang="ts" module>
  /* eslint-disable no-import-assign */
  export {
    quotationItemsRequired,
    quotationItemsValid,
    type QuotationItemType,
    type QuotationLineItem,
  } from './QuotationItemsEditor.svelte'
</script>

<script lang="ts">
  import ActionButton from '$components/core/ActionButton.svelte'
  import StackedAmountValues from '$components/core/StackedAmountValues.svelte'
  import DateField from '$components/core/form/DateField.svelte'
  import EditableListField from '$components/core/form/EditableListField.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import PriceField from '$components/core/form/PriceField.svelte'
  import QuantityField from '$components/core/form/QuantityField.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { FormFieldClass } from '$components/core/form/form'
  import { getFormContextOptional } from '$components/core/form/form-context'
  import ItemSelector from '$components/features/form/ItemSelector.svelte'
  import VatCodeSelector, { type VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import Button from '$components/ui/button/button.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import * as Tooltip from '$components/ui/tooltip'
  import { UnitOfMeasures } from '$lib/config/uoms'
  import * as m from '$lib/paraglide/messages'
  import type { Item } from '$lib/types/api-types'
  import { toLocalISOString } from '$lib/utils/date'
  import { generateId } from '$lib/utils/id'
  import { DEFAULT_CURRENCY_CODE, floatToPriceString, getCurrencySymbol, renderPrice } from '$utils/prices'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Plus from '@lucide/svelte/icons/plus'
  import X from '@lucide/svelte/icons/x'
  import { untrack, type Snippet } from 'svelte'
  import type { QuotationLineItem } from './QuotationItemsEditor.svelte'

  /**
   * Internal line item = API shape + UI-only fields
   */
  type InternalLineItem = QuotationLineItem & {
    /** UI toggle: discount as fixed amount vs percentage */
    useDiscountAmount: boolean
    /** Cached item entity for the selector */
    itemAttr?: Item
    /** Cached VAT code entity for the selector */
    vatCodeAttr?: VatCodeSummary
    /** Item base price from catalog (shown as suggestion, not auto-filled) */
    itemBasePrice?: number
    /** UI-only: identifies a batch of items imported together (used for color coding). Stripped in transformOutput. */
    _groupId?: string
  }

  type Props = {
    /** Field name for form binding */
    name?: string
    /** Label for the field */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** Initial value (for loading existing data) */
    value?: QuotationLineItem[]
    /** Default currency for price fields */
    currency?: string
    /** Show delivery date fields */
    showDeliveryDates?: boolean
    /** Require at least one item */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when line items change */
    onChange?: (items: QuotationLineItem[]) => void
    /** When this value changes, items are re-hydrated from the form context */
    refreshKey?: unknown
    /** Default VAT code from customer commercial terms (overrides global is_default) */
    defaultVatCode?: import('$components/features/form/VatCodeSelector.svelte').VatCodeSummary
    /**
     * Default discount percentage from customer commercial terms (`trade_discount`).
     * Applied to item rows whose discount still follows the previous default; a
     * user-set percent or a switch to fixed-amount mode is preserved.
     */
    defaultDiscountPercent?: number
    /** Additional actions snippet rendered in the header (e.g. ImportMenu) */
    headerActions?: Snippet
    /** API field name for the delivery date. Quotations use 'delivery_date', sales orders use 'confirmed_delivery_date'. */
    deliveryDateKey?: 'delivery_date' | 'confirmed_delivery_date'
    /** Default for requested_delivery_date on newly added items. Does not mutate existing items. */
    defaultDeliveryDate?: Date | string
    /** Allow negative prices in PriceField inputs */
    allowNegativePrices?: boolean
    /**
     * When true, the list is treated as structurally rigid:
     * - the "Add item line" / "Add description line" buttons are hidden
     * - `type === 'charge'` rows cannot be removed (no remove icon rendered)
     * Used by the invoices form to enforce the backend-authoritative shape of
     * prefilled / saved invoices. Per-row editability is unaffected — only the
     * shape of the list and the immutability of charge rows.
     */
    lockStructure?: boolean
    /**
     * Optional predicate that flags individual `type === 'item'` rows as
     * locked. Locked items render with the same restricted shape as charges
     * (only description editable, no remove button) — used by the invoices
     * form to freeze item lines that came from an upstream transport document.
     */
    isItemLocked?: (item: QuotationLineItem) => boolean
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'items',
    label = m.quotation_items(),
    showLabel = true,
    value = [],
    currency = DEFAULT_CURRENCY_CODE,
    showDeliveryDates = false,
    required = false,
    disabled = false,
    onChange,
    refreshKey = undefined,
    defaultVatCode = undefined,
    defaultDiscountPercent = undefined,
    headerActions,
    allowNegativePrices = true,
    deliveryDateKey = 'delivery_date',
    defaultDeliveryDate = undefined,
    lockStructure = false,
    isItemLocked = () => false,
    class: className = '',
  }: Props = $props()

  /** True for `item` rows the caller marked as locked (e.g. linked to a DDT). */
  function itemIsLocked(item: { type?: string }): boolean {
    if (item.type !== 'item') return false
    return isItemLocked(item as QuotationLineItem)
  }

  // Autowire to form context
  const form = getFormContextOptional()
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)
  const currencyCode = $derived(currency)

  // EditableListField clears the form context for its children, so sub-fields
  // can't auto-resolve their error from `form.errors[name]`. We resolve it here
  // (where the parent form context is still in scope) and pass it down explicitly.
  function getFieldError(idx: number, field: string): string | undefined {
    return form?.errors[`${name}.${idx}.${field}` as never] as string | undefined
  }

  function normalizeDateInput(value: Date | string | undefined): string {
    if (!value) return ''
    if (value instanceof Date) return toLocalISOString(value)
    return value
  }

  // Compact ISO-date rendering for collapsed/drag rows (YYYY-MM-DD).
  function formatDateShort(value: string | undefined): string {
    return value ? value.slice(0, 10) : ''
  }

  // Internal items state
  let items = $state<InternalLineItem[]>([])
  let editableListFieldRef: EditableListField<InternalLineItem> | undefined = $state()

  function createEmptyItem(): InternalLineItem {
    return {
      type: 'item',
      item_id: '',
      description: '',
      quantity: 0,
      uom: UnitOfMeasures.Default,
      unit_price: 0,
      discount_percent: defaultDiscountPercent || undefined,
      discount_amount: undefined,
      vat_code_id: defaultVatCode?.id ?? '',
      vat_code_snapshot: defaultVatCode ? (defaultVatCode as unknown as Record<string, unknown>) : undefined,
      requested_delivery_date: normalizeDateInput(defaultDeliveryDate),
      delivery_date: normalizeDateInput(defaultDeliveryDate),
      useDiscountAmount: false,
      itemAttr: undefined,
      vatCodeAttr: defaultVatCode ?? undefined,
    }
  }

  // When defaultVatCode arrives (async from commercial terms), apply to items with empty vat_code_id.
  // Uses untrack on items to avoid read→write loop. Flushes via the editor ref so items that
  // become complete are pushed to the form field (EditableListField only commits on its own internal mutations).
  $effect(() => {
    const vatCode = defaultVatCode
    if (!vatCode) return
    const current = untrack(() => items)
    const needsUpdate = current.some(item => item.type === 'item' && !item.vat_code_id)
    if (!needsUpdate) return
    items = current.map(item => {
      if (item.type !== 'item' || item.vat_code_id) return item

      return {
        ...item,
        vat_code_id: vatCode.id,
        vat_code_snapshot: vatCode as unknown as Record<string, unknown>,
        vatCodeAttr: vatCode,
      }
    })
    editableListFieldRef?.flush()
  })

  // When defaultDiscountPercent arrives/changes (async from commercial terms),
  // apply it to item rows whose discount still follows the previous default
  // (unset, or equal to the last applied value). A user-entered percent, or a
  // switch to fixed-amount mode, is treated as user-set and preserved.
  let lastAppliedDefaultDiscount: number | undefined = undefined
  $effect(() => {
    const discount = defaultDiscountPercent
    if (discount == null || discount === lastAppliedDefaultDiscount) return
    const prevDefault = lastAppliedDefaultDiscount
    lastAppliedDefaultDiscount = discount
    const current = untrack(() => items)
    const followsDefault = (item: InternalLineItem) =>
      !item.useDiscountAmount &&
      !item.discount_amount &&
      (!item.discount_percent || item.discount_percent === prevDefault)
    const needsUpdate = current.some(item => item.type === 'item' && followsDefault(item))
    if (!needsUpdate) return
    items = current.map(item =>
      item.type === 'item' && followsDefault(item) ? { ...item, discount_percent: discount, discount_amount: 0 } : item,
    )
    editableListFieldRef?.flush()
  })

  // When defaultDeliveryDate changes, propagate it to empty items (no item_id yet) whose
  // current date is either unset or still matches the previously applied default. A date
  // that differs from the previous default is treated as user-set and preserved.
  let lastAppliedDefaultDate: string | undefined = undefined
  $effect(() => {
    const normalized = normalizeDateInput(defaultDeliveryDate)
    if (!normalized || normalized === lastAppliedDefaultDate) return
    const prevDefault = lastAppliedDefaultDate
    lastAppliedDefaultDate = normalized
    const current = untrack(() => items)
    const followsDefault = (value: string | undefined) => !value || value === prevDefault
    const needsUpdate = current.some(
      item => item.type === 'item' && !item.item_id && followsDefault(item.requested_delivery_date),
    )
    if (!needsUpdate) return
    items = current.map(item => {
      if (item.type !== 'item' || item.item_id) return item
      if (!followsDefault(item.requested_delivery_date)) return item
      return {
        ...item,
        requested_delivery_date: normalized,
        delivery_date: followsDefault(item.delivery_date) ? normalized : item.delivery_date,
      }
    })
    editableListFieldRef?.flush()
  })

  function isCompleteItem(item: InternalLineItem): boolean {
    if (item.type === 'descriptive') {
      return !!item.description
    }
    if (item.type === 'charge') {
      // Charges have no product id (they're backend-computed fees); the API
      // requires description, quantity, unit_price and a VAT code instead.
      return (
        !!item.description &&
        !!item.quantity &&
        item.quantity > 0 &&
        item.unit_price !== undefined &&
        !!item.vat_code_id
      )
    }
    return !!item.item_id && !!item.quantity && item.quantity > 0 && !!item.vat_code_id
  }

  function transformOutput(internalItems: InternalLineItem[]): QuotationLineItem[] {
    return internalItems.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ useDiscountAmount, itemAttr, vatCodeAttr, itemBasePrice, _groupId, delivery_date, ...rest }, index) => {
        if (rest.type === 'descriptive')
          return {
            type: 'descriptive',
            description: rest.description,
          }

        if (rest.type === 'charge') {
          // Strip product-line-only fields (no item_id, no UOM, no delivery
          // date, no discount); keep traceability ids so the chain back to the
          // source document is preserved.
          return {
            type: 'charge',
            description: rest.description,
            quantity: rest.quantity,
            unit_price: rest.unit_price,
            vat_code_id: rest.vat_code_id,
            sales_order_item_id: rest.sales_order_item_id,
            transport_document_item_id: rest.transport_document_item_id,
          }
        }

        return { ...rest, [deliveryDateKey]: delivery_date }
      },
    )
  }

  /**
   * Map API line items to internal format (add UI-only fields)
   */
  function mapFromApi(apiItems: QuotationLineItem[]): InternalLineItem[] {
    return apiItems.map(item => {
      const itemSnapshot = item.item_snapshot as Record<string, unknown> | undefined
      // Normalize: internally always use `delivery_date`, read from the correct API field
      const deliveryDateValue = item.delivery_date ?? item.confirmed_delivery_date ?? ''
      return {
        ...item,
        delivery_date: deliveryDateValue,
        useDiscountAmount: !!(item.discount_amount && !item.discount_percent),
        itemAttr: itemSnapshot ? ({ id: item.item_id, ...itemSnapshot } as Item) : undefined,
        vatCodeAttr:
          item.vat_code_snapshot && item.vat_code_id
            ? { ...(item.vat_code_snapshot as VatCodeSummary), id: item.vat_code_id }
            : undefined,
        itemBasePrice: (itemSnapshot?.standard_cost as number) ?? undefined,
      }
    })
  }

  // Load initial value from form context
  $effect(() => {
    const initialValue = (form?.values[name] as QuotationLineItem[] | undefined) ?? value
    if (initialValue && initialValue.length > 0 && (items.length === 0 || items.every(i => !isCompleteItem(i)))) {
      items = mapFromApi(initialValue)
    }
  })

  // Re-hydrate when refreshKey changes (e.g., backend version bumped after save)
  let lastRefreshKey: unknown = undefined
  $effect(() => {
    if (refreshKey === lastRefreshKey) return
    lastRefreshKey = refreshKey

    const formValue = form?.values[name] as QuotationLineItem[] | undefined
    if (formValue && formValue.length > 0) {
      setTimeout(() => {
        items = mapFromApi(form?.values[name] as QuotationLineItem[])
      }, 100)
    }
  })

  /**
   * Handle item (product) selection
   */
  function handleItemSelect(
    index: number,
    selectedItem: Item,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    updateItem(index, {
      item_id: selectedItem.id,
      item_snapshot: selectedItem as unknown as Record<string, unknown>,
      description: selectedItem.name ?? '',
      uom: selectedItem.primary_uom || UnitOfMeasures.Default,
      quantity: 1,
      itemBasePrice: selectedItem.standard_cost ?? undefined,
      itemAttr: selectedItem,
    })
  }

  /**
   * Handle item clear
   */
  function handleItemClear(index: number, updateItem: (index: number, updates: Partial<InternalLineItem>) => void) {
    updateItem(index, {
      item_id: '',
      item_snapshot: undefined,
      description: '',
      uom: UnitOfMeasures.Default,
      quantity: 0,
      unit_price: 0,
      discount_percent: 0,
      discount_amount: 0,
      itemAttr: undefined,
      itemBasePrice: undefined,
    })
  }

  /**
   * Handle VAT code selection
   */
  function handleVatCodeSelect(
    index: number,
    vatCode: VatCodeSummary,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    updateItem(index, {
      vat_code_id: vatCode.id,
      vat_code_snapshot: vatCode as unknown as Record<string, unknown>,
      vatCodeAttr: vatCode,
    })
  }

  /**
   * Handle items change callback from EditableListField. Clears stale server-side
   * errors keyed under `{name}.{index}.*` since indices may have shifted after
   * an add/remove/reorder, or the user may have just corrected the field.
   */
  function handleItemsChange(completedItems: InternalLineItem[]) {
    const output = transformOutput(completedItems)
    onChange?.(output)
    form?.clearErrorsAtPrefix(`${name}.`)
  }

  /**
   * Append imported line items, tagged with a shared `_groupId` for color coding.
   * Callers should invoke once per source record (e.g. once per quotation) so each
   * source gets its own color. If `groupId` is omitted, a fresh one is generated.
   */
  export function addItems(newItems: QuotationLineItem[], options?: { groupId?: string }) {
    editableListFieldRef?.addItems(mapFromApi(newItems), {
      groupId: options?.groupId ?? generateId(),
    })
  }

  /**
   * Returns the current line items in API shape — used by wrapper components
   * (e.g. SalesOrderItemsListEditor) to dedupe imports against existing rows.
   */
  export function getItems(): QuotationLineItem[] {
    return (editableListFieldRef?.getItems() ?? []) as QuotationLineItem[]
  }

  /**
   * Drops every line item and commits the empty list to the form. Bypasses
   * the per-row remove-button gating (so locked types like `charge` are also
   * cleared). Used by parent flows that reset the entire prefill.
   */
  export function clearItems() {
    editableListFieldRef?.clearItems()
  }
</script>

<EditableListField
  bind:this={editableListFieldRef}
  {name}
  {label}
  {showLabel}
  {required}
  bind:items
  {createEmptyItem}
  {isCompleteItem}
  {transformOutput}
  disabled={isDisabled}
  syncFromForm={false}
  onItemsChange={handleItemsChange}
  allowReorder
  collapsible
  class={className}>
  {#snippet header({ options })}
    {#if !isDisabled}
      <div class="flex w-full items-center justify-end gap-2">
        {#if headerActions}
          {@render headerActions()}
        {/if}
        <Button
          variant={options.dragAndDropActive ? 'outline' : 'outline'}
          size="sm"
          onclick={options.toggleDragAndDrop}>
          {#if options.dragAndDropActive}
            <Pencil class="mr-1 size-4" />
            {m.edit_items()}
          {:else}
            <ArrowUpDown class="mr-1 size-4" />
            {m.reorder_items()}
          {/if}
        </Button>
      </div>
      <div class="my-8">
        <Separator />
      </div>
    {/if}
  {/snippet}

  {#snippet dragItem({ item, index })}
    <div class="flex w-full cursor-grab items-center gap-3 rounded border bg-muted/50 px-3 py-2">
      <GripVertical class="size-4 text-muted-foreground" />
      <span class="font-semibold text-primary"><span class="opacity-60">#</span>{index + 1}</span>
      {#if item.type === 'descriptive'}
        <span class="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {item.description || m.description()}
        </span>
      {:else if item.type === 'charge'}
        <span class="min-w-0 flex-1 truncate text-sm">
          {item.description || m.charge()}
        </span>
        <div class="flex shrink-0 items-center gap-3 text-xs tabular-nums">
          <span class="w-24 text-right whitespace-nowrap text-muted-foreground">
            {#if item.unit_price !== undefined}{renderPrice(item.unit_price, currency)}{/if}
          </span>
        </div>
      {:else}
        <span class="min-w-0 flex-1 truncate text-sm">
          {item.item_snapshot?.name || item.description || item.item_snapshot?.code || m.item()}
        </span>
        <div class="flex shrink-0 items-center gap-3 text-xs tabular-nums">
          <span class="w-20 text-right whitespace-nowrap">
            {#if item.quantity}{item.quantity} {item.uom}{/if}
          </span>
          <span class="hidden w-24 text-right whitespace-nowrap text-muted-foreground sm:inline-block">
            {#if item.unit_price && item.unit_price > 0}{renderPrice(item.unit_price, currency)}{/if}
          </span>
          <span class="hidden w-32 text-right whitespace-nowrap text-muted-foreground sm:inline-block">
            {#if item.net_value && item.net_value > 0}Tot. {renderPrice(item.net_value, currency)}{/if}
          </span>
          {#if showDeliveryDates}
            <span class="hidden w-28 text-right whitespace-nowrap text-muted-foreground sm:inline-block">
              {#if item.delivery_date}{formatDateShort(item.delivery_date)}{/if}
            </span>
          {/if}
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet collapsedItem({ item, index, groupColorClass })}
    <div class="flex w-full items-center gap-3 rounded border bg-muted/50 py-2 pr-12 pl-3 hover:bg-muted">
      <span class="font-semibold {groupColorClass ?? 'text-primary'}"
        ><span class="opacity-60">#</span>{index + 1}</span>
      {#if item.type === 'descriptive'}
        <span class="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {item.description || m.description()}
        </span>
      {:else if item.type === 'charge'}
        <span class="min-w-0 flex-1 truncate text-sm">
          {item.description || m.charge()}
        </span>
        <div class="flex shrink-0 items-center gap-3 text-xs tabular-nums">
          <span class="w-24 text-right whitespace-nowrap text-muted-foreground">
            {#if item.unit_price !== undefined}{renderPrice(item.unit_price, currency)}{/if}
          </span>
          <span class="hidden w-16 text-right whitespace-nowrap text-muted-foreground sm:inline-block">
            {#if item.vat_code_snapshot?.code}{item.vat_code_snapshot.code}{/if}
          </span>
        </div>
      {:else}
        <span class="min-w-0 flex-1 truncate text-sm">
          {item.item_snapshot?.name || item.description || item.item_snapshot?.code || m.item()}
        </span>
        <div class="flex shrink-0 items-center gap-3 text-xs tabular-nums">
          <span class="w-20 text-right whitespace-nowrap">
            {#if item.quantity}{item.quantity} {item.uom}{/if}
          </span>
          <span class="hidden w-24 text-right whitespace-nowrap text-muted-foreground sm:inline-block">
            {#if item.unit_price && item.unit_price > 0}{renderPrice(item.unit_price, currency)}{/if}
          </span>
          <span class="hidden w-32 text-right whitespace-nowrap text-muted-foreground sm:inline-block">
            {#if item.net_value && item.net_value > 0}Tot. {renderPrice(item.net_value, currency)}{/if}
          </span>
          {#if showDeliveryDates}
            <span class="hidden w-28 text-right whitespace-nowrap text-muted-foreground sm:inline-block">
              {#if item.delivery_date}{formatDateShort(item.delivery_date)}{/if}
            </span>
          {/if}
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet item({ item, index, updateItem })}
    {#if item.type === 'descriptive'}
      <!-- Descriptive: full-width rich editor -->
      <div>
        <RichEditorField
          name="{name}.{index}.description"
          label={m.description()}
          value={item.description}
          error={getFieldError(index, 'description')}
          errorPosition="floating-bottom"
          disabled={isDisabled}
          width="w-full"
          minHeight="min-h-20 max-h-60 overflow-y-auto bg-input/10 dark:bg-input/30"
          onChange={md => updateItem(index, { description: md })} />
      </div>
    {:else if item.type === 'charge'}
      <!-- Charge: backend-computed. Only description is editable; unit_price and
           vat_code are shown read-only. Quantity is preserved on the line data
           but hidden from the UI. -->
      <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <div class="sm:col-span-2 lg:col-span-3">
          <TextField
            name="{name}.{index}.description"
            label={m.description()}
            value={item.description ?? ''}
            error={getFieldError(index, 'description')}
            errorPosition="floating-bottom"
            disabled={isDisabled}
            width="w-full"
            oninput={e => updateItem(index, { description: e.currentTarget.value })} />
        </div>

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">{m.unit_price()}</span>
          <div class="flex h-9 items-center text-sm text-muted-foreground tabular-nums">
            {#if item.unit_price !== undefined}{renderPrice(item.unit_price, currency)}{:else}-{/if}
          </div>
        </div>

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">{m.vat_code()}</span>
          <div class="flex h-9 items-center text-sm text-muted-foreground">
            {item.vat_code_snapshot?.code ?? item.vat_code_snapshot?.description ?? '-'}
          </div>
        </div>
      </div>
    {:else if itemIsLocked(item)}
      <!-- Locked item (e.g. linked to a transport document line). Only the
           description is editable; code, quantity, unit_price, discount and VAT
           code are shown read-only. The code falls back to "—" when the line
           carries no item snapshot (some prefilled lines). The row cannot be
           removed (handled by `removeButton`). -->
      <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <div class="sm:col-span-2 lg:col-span-3">
          <TextField
            name="{name}.{index}.description"
            label={m.description()}
            value={item.description ?? ''}
            error={getFieldError(index, 'description')}
            errorPosition="floating-bottom"
            disabled={isDisabled}
            width="w-full"
            oninput={e => updateItem(index, { description: e.currentTarget.value })} />
        </div>

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">{m.code()}</span>
          <div class="flex h-9 items-center">
            {#if item.item_snapshot?.code}
              <Tooltip.Root>
                <Tooltip.Trigger class="max-w-64 cursor-default truncate text-sm text-muted-foreground">
                  {item.item_snapshot.code}
                </Tooltip.Trigger>
                <Tooltip.Content>{item.item_snapshot.code}</Tooltip.Content>
              </Tooltip.Root>
            {:else}
              <span class="text-muted-foreground">-</span>
            {/if}
          </div>
        </div>

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">{m.quantity()}</span>
          <div class="flex h-9 items-center text-sm text-muted-foreground tabular-nums">
            {#if item.quantity !== undefined}{item.quantity} {item.uom ?? ''}{:else}-{/if}
          </div>
        </div>

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">{m.unit_price()}</span>
          <div class="flex h-9 items-center text-sm text-muted-foreground tabular-nums">
            {#if item.unit_price !== undefined}{renderPrice(item.unit_price, currency)}{:else}-{/if}
          </div>
        </div>

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">
            {item.useDiscountAmount ? m.discount_amount() : m.discount_percent()}
          </span>
          <div class="flex h-9 items-center text-sm text-muted-foreground tabular-nums">
            {#if item.useDiscountAmount && item.discount_amount}
              {renderPrice(item.discount_amount, currency)}
            {:else}
              {item.discount_percent ?? 0}%
            {/if}
          </div>
        </div>

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">{m.vat_code()}</span>
          <div class="flex h-9 items-center text-sm text-muted-foreground">
            {item.vat_code_snapshot?.code ?? item.vat_code_snapshot?.description ?? '-'}
          </div>
        </div>
      </div>
    {:else}
      <!-- Item type: multi-row grid layout -->
      <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Row 1: Item Selector, Code, Quantity -->
        <ItemSelector
          name="{name}.{index}.item_id"
          label={m.item()}
          mode="sellable"
          attr={item.itemAttr}
          width="w-full"
          contentWidth={FormFieldClass.SelectorContentDefaultWidth}
          readonly={isDisabled}
          onChoose={selectedItem => handleItemSelect(index, selectedItem, updateItem)}
          onClear={() => handleItemClear(index, updateItem)}
          allowNewRecord
          allowOpenRecord />

        <div class="flex flex-col justify-end">
          <span class="block text-sm leading-6 font-medium">{m.code()}</span>
          <div class="flex h-9 items-center">
            {#if item.item_snapshot?.code}
              <Tooltip.Root>
                <Tooltip.Trigger class="max-w-64 cursor-default truncate text-sm text-muted-foreground">
                  {item.item_snapshot.code}
                </Tooltip.Trigger>
                <Tooltip.Content>{item.item_snapshot.code}</Tooltip.Content>
              </Tooltip.Root>
            {:else}
              <span class="text-muted-foreground">-</span>
            {/if}
          </div>
        </div>

        <QuantityField
          name="{name}.{index}.quantity"
          label={m.quantity()}
          value={item.quantity ?? 0}
          uom={item.uom}
          error={getFieldError(index, 'quantity')}
          errorPosition="floating-bottom"
          disabled={!item.item_id || isDisabled}
          width="w-full"
          onChange={qty => updateItem(index, { quantity: qty })} />

        <!-- Description (customizable, defaults to item name) -->
        <div class="sm:col-span-2 lg:col-span-3">
          <TextField
            name="{name}.{index}.description"
            label={m.description()}
            value={item.description ?? ''}
            error={getFieldError(index, 'description')}
            errorPosition="floating-bottom"
            disabled={!item.item_id || isDisabled}
            width="w-full"
            oninput={e => updateItem(index, { description: e.currentTarget.value })} />
        </div>

        <!-- Row 2: Unit Price, Discount (with toggle), VAT -->
        <div class="flex flex-col">
          <div class="flex items-baseline justify-between gap-2">
            <span class="block text-sm leading-6 font-medium">{m.unit_price()}</span>
            {#if item.itemBasePrice != null && item.itemBasePrice > 0}
              <span class="text-xs text-muted-foreground">
                {m.item_cost()}: {floatToPriceString(item.itemBasePrice, currency, 4)}{getCurrencySymbol(currency)}
              </span>
            {/if}
          </div>
          <PriceField
            name="{name}.{index}.unit_price"
            value={item.unit_price ?? 0}
            {currency}
            allowNegative={allowNegativePrices}
            showLabel={false}
            error={getFieldError(index, 'unit_price')}
            errorPosition="floating-bottom"
            disabled={!item.item_id || isDisabled}
            width="w-full"
            onChange={price => updateItem(index, { unit_price: price })} />
        </div>

        <div class="flex flex-col">
          <div class="flex items-baseline justify-between gap-2">
            <span class="block text-sm leading-6 font-medium">
              {item.useDiscountAmount ? m.discount_amount() : m.discount_percent()}
            </span>
            {#if !isDisabled && item.item_id}
              <button
                type="button"
                class="text-xs text-primary hover:underline"
                onclick={() =>
                  updateItem(index, {
                    useDiscountAmount: !item.useDiscountAmount,
                    discount_percent: !item.useDiscountAmount ? 0 : item.discount_percent,
                    discount_amount: !item.useDiscountAmount ? item.discount_amount : 0,
                  })}>
                {item.useDiscountAmount ? m.switch_to_discount_percent() : m.switch_to_discount_amount()}
              </button>
            {/if}
          </div>
          {#if item.useDiscountAmount}
            <PriceField
              name="{name}.{index}.discount_amount"
              value={item.discount_amount ?? 0}
              {currency}
              allowNegative={allowNegativePrices}
              showLabel={false}
              error={getFieldError(index, 'discount_amount')}
              errorPosition="floating-bottom"
              disabled={!item.item_id || isDisabled}
              width="w-full"
              onChange={amount => updateItem(index, { discount_amount: amount, discount_percent: 0 })} />
          {:else}
            <NumberField
              name="{name}.{index}.discount_percent"
              value={item.discount_percent}
              showLabel={false}
              error={getFieldError(index, 'discount_percent')}
              errorPosition="floating-bottom"
              disabled={!item.item_id || isDisabled}
              width="w-full"
              oninput={e =>
                updateItem(index, { discount_percent: parseFloat(e.currentTarget.value) || 0, discount_amount: 0 })} />
          {/if}
        </div>

        <VatCodeSelector
          name="{name}.{index}.vat_code_id"
          label={m.vat_code()}
          attr={item.vatCodeAttr || defaultVatCode}
          direction="vendita"
          width="w-full"
          contentWidth={FormFieldClass.SelectorContentDefaultWidth}
          readonly={!item.item_id || isDisabled}
          onChoose={vatCode => handleVatCodeSelect(index, vatCode, updateItem)}
          onClear={() =>
            updateItem(index, { vat_code_id: '', vat_code_snapshot: undefined, vatCodeAttr: undefined })} />

        <!-- Row 3: Delivery dates (conditional) -->
        {#if showDeliveryDates}
          <DateField
            name="{name}.{index}.requested_delivery_date"
            label={m.requested_delivery_date()}
            value={item.requested_delivery_date}
            error={getFieldError(index, 'requested_delivery_date')}
            errorPosition="floating-bottom"
            disabled={!item.item_id || isDisabled}
            width="w-full"
            onChange={date => {
              const iso = date ? toLocalISOString(date) : ''
              const updates: Partial<InternalLineItem> = { requested_delivery_date: iso }
              if (iso && !item.delivery_date) updates.delivery_date = iso
              updateItem(index, updates)
            }}
            allowClear />

          <DateField
            name="{name}.{index}.{deliveryDateKey}"
            label={m.delivery_date()}
            value={item.delivery_date}
            error={getFieldError(index, deliveryDateKey)}
            errorPosition="floating-bottom"
            disabled={!item.item_id || isDisabled}
            width="w-full"
            onChange={date => updateItem(index, { delivery_date: date ? toLocalISOString(date) : '' })}
            allowClear />
        {/if}

        <StackedAmountValues
          rows={[
            { label: m.net_value(), value: item.net_value, currencyCode },
            { label: m.tax_value(), value: item.tax_amount, currencyCode },
          ]} />
      </div>
    {/if}
  {/snippet}

  {#snippet addButton({ addItem, disabled: addDisabled, options: opts })}
    {#if !opts.dragAndDropActive && !lockStructure}
      <div class="mt-1 gap-2 md:flex">
        <Button variant="outline" size="sm" disabled={addDisabled} onclick={() => addItem({ type: 'item' })}>
          <Plus class="mr-1 size-4" />
          {m.add_item_line()}
        </Button>

        <Button variant="ghost" size="sm" disabled={addDisabled} onclick={() => addItem({ type: 'descriptive' })}>
          <Plus class="mr-1 size-4" />
          {m.add_description_line()}
        </Button>
      </div>
    {/if}
  {/snippet}

  {#snippet removeButton({ removeItem, index, disabled: removeDisabled })}
    {@const current = items[index]}
    {#if current?.type !== 'charge' && !itemIsLocked(current ?? {})}
      <ActionButton
        variant="ghost"
        size="icon"
        class="absolute top-2 right-2 z-10 h-8 w-8 text-muted-foreground hover:text-destructive"
        tooltip={m.remove_table_resource_line()}
        disabled={removeDisabled}
        onclick={removeItem}>
        <X class="size-4" />
      </ActionButton>
    {/if}
  {/snippet}
</EditableListField>
