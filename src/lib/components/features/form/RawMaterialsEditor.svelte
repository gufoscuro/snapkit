<!--
  @component RawMaterialsEditor
  @description Multi-line editor for raw materials in purchase orders.
  Supports material selection, quantity, lot, price with deals-based pricing.
  @keywords supply, purchase-order, raw-materials, editor, line-items
  @uses EditableTableField, MaterialSelector
-->
<script lang="ts" module>
  import type { FieldValidator } from '$components/core/form/validation'
  import * as m from '$lib/paraglide/messages'

  /**
   * Output line item type (matches API schema)
   */
  export type RawMaterialLineItem = {
    id?: string
    name: string
    extra_id: string
    quantity: number
    uom: string
    external_lot?: string
    prices?: {
      currency: 'EUR' | 'USD' | 'GBP'
      unit: number
      vat?: number
      deals?: Array<{ min_quantity: number; unit: number; category?: string }>
    }
  }

  /**
   * Validator: requires at least one raw material item.
   * Use with v.schema(): rawMaterials: [rawMaterialsRequired()]
   */
  export function rawMaterialsRequired<T>(message?: string): FieldValidator<T> {
    return value => {
      const items = value as RawMaterialLineItem[] | undefined
      if (!items || items.length === 0) {
        return message ?? m.validation_required_generic()
      }
      return undefined
    }
  }

  /**
   * Validator: ensures all items have quantity > 0.
   * Use with v.schema(): rawMaterials: [rawMaterialsValidQuantity()]
   */
  export function rawMaterialsValidQuantity<T>(message?: string): FieldValidator<T> {
    return value => {
      const items = value as RawMaterialLineItem[] | undefined
      if (!items || items.length === 0) return undefined
      const hasInvalidQty = items.some(item => item.quantity <= 0)
      if (hasInvalidQty) {
        return message ?? m.validation_min({ field: m.quantity(), min: '1' })
      }
      return undefined
    }
  }
</script>

<script lang="ts">
  import EditableTableField from '$components/core/form/EditableTableField.svelte'
  import PriceField from '$components/core/form/PriceField.svelte'
  import QuantityField from '$components/core/form/QuantityField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { FormFieldClass } from '$components/core/form/form'
  import { getFormContextOptional } from '$components/core/form/form-context'
  import MaterialSelector from '$components/features/form/MaterialSelector.svelte'
  import * as Table from '$components/ui/table'
  import { UnitOfMeasures } from '$lib/config/uoms'
  import type { RawMaterialSummary } from '$lib/types/api-types'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices'
  import { apiRequest } from '$utils/request'
  import { createRoute } from '$utils/route-builder.js'
  import { getUOMMinQuantity } from '$utils/uom'

  /**
   * Internal line item type for editing
   */
  type InternalLineItem = {
    id: string
    name: string
    extraId: string
    quantity: number
    uom: string
    externalLot: string
    currency: string
    unitPrice: number
    vat: number
    deals: Array<{ min_quantity: number; unit: number; category?: string }>
    rawMaterialAttr?: RawMaterialSummary
    warning?: string
  }

  type Props = {
    /** Field name for form binding */
    name?: string
    /** Label for the field */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** Initial value (for loading existing data) */
    value?: RawMaterialLineItem[]
    /** Supplier ID to filter materials */
    supplierId?: string
    /** Allow materials from multiple suppliers */
    multipleSuppliers?: boolean
    /** Show lot column */
    showLot?: boolean
    /** Show price columns */
    showPrice?: boolean
    /** Show quantity column */
    showQuantity?: boolean
    /** Allow price editing */
    editablePrice?: boolean
    /** Check inventory for warnings */
    checkInventory?: boolean
    /** Require at least one item (adds asterisk to label) */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when line items change */
    onChange?: (items: RawMaterialLineItem[]) => void
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'rawMaterials',
    label = m.materials(),
    showLabel = true,
    value = [],
    supplierId = undefined,
    multipleSuppliers = false,
    showLot = false,
    showPrice = false,
    showQuantity = true,
    editablePrice = true,
    checkInventory = false,
    required = false,
    disabled = false,
    onChange,
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // Internal items state
  let items = $state<InternalLineItem[]>([])

  // Warnings per row index
  let warnings = $state<Record<number, string | undefined>>({})

  // Create empty item
  function createEmptyItem(): InternalLineItem {
    return {
      id: '',
      name: '',
      extraId: '',
      quantity: 0,
      uom: UnitOfMeasures.Default,
      externalLot: '',
      currency: DEFAULT_CURRENCY_CODE,
      unitPrice: 0,
      vat: 0,
      deals: [],
      rawMaterialAttr: undefined,
      warning: undefined,
    }
  }

  // Check if item is empty
  function isEmptyItem(item: InternalLineItem): boolean {
    return !item.id || !item.name
  }

  // Check if item is complete (valid for output)
  function isCompleteItem(item: InternalLineItem): boolean {
    return !!item.id && !!item.name && item.quantity > 0
  }

  // Transform internal items to API output format
  function transformOutput(internalItems: InternalLineItem[]): RawMaterialLineItem[] {
    return internalItems.map(item => ({
      id: item.id || undefined,
      name: item.name,
      extra_id: item.extraId,
      quantity: item.quantity,
      uom: item.uom,
      external_lot: item.externalLot || undefined,
      prices: {
        currency: item.currency as 'EUR' | 'USD' | 'GBP',
        unit: item.unitPrice,
        vat: item.vat,
        deals: item.deals,
      },
    }))
  }

  // Load initial value
  $effect(() => {
    const initialValue = (form?.values[name] as RawMaterialLineItem[] | undefined) ?? value
    if (initialValue && initialValue.length > 0 && items.length === 0) {
      items = initialValue.map(item => ({
        id: item.id ?? '',
        name: item.name,
        extraId: item.extra_id,
        quantity: item.quantity,
        uom: item.uom || UnitOfMeasures.Default,
        externalLot: item.external_lot || '',
        currency: item.prices?.currency || DEFAULT_CURRENCY_CODE,
        unitPrice: item.prices?.unit || 0,
        vat: item.prices?.vat || 0,
        deals: item.prices?.deals || [],
        rawMaterialAttr: undefined,
        warning: undefined,
      }))
    }
  })

  /**
   * Handle material selection
   */
  function handleMaterialSelect(
    index: number,
    material: RawMaterialSummary,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    const deals = material.prices?.deals || []
    const smallestQtyDeal = deals.sort((a, b) => a.min_quantity - b.min_quantity)[0]

    const initialQuantity = smallestQtyDeal?.min_quantity ?? getUOMMinQuantity(material.uom || UnitOfMeasures.Default)

    updateItem(index, {
      id: material.id ?? '',
      name: material.name,
      extraId: material.external_id,
      uom: material.uom || UnitOfMeasures.Default,
      quantity: initialQuantity,
      currency: material.prices?.currency || DEFAULT_CURRENCY_CODE,
      unitPrice: material.prices?.unit || 0,
      vat: material.prices?.vat || 0,
      deals: deals,
      rawMaterialAttr: material,
    })

    // Recalculate price based on deals
    updatePriceByQuantity(index)

    // Check inventory if enabled
    if (checkInventory) {
      checkInventoryWarning(index)
    }
  }

  /**
   * Handle material clear
   */
  function handleMaterialClear(index: number, updateItem: (index: number, updates: Partial<InternalLineItem>) => void) {
    updateItem(index, createEmptyItem())
    warnings[index] = undefined
  }

  /**
   * Update price based on quantity and deals
   */
  function updatePriceByQuantity(index: number) {
    const item = items[index]
    if (!item.id || item.deals.length === 0) return

    // Find the best deal for the current quantity (deals sorted descending by min_quantity)
    const sortedDeals = [...item.deals].sort((a, b) => b.min_quantity - a.min_quantity)
    const applicableDeal = sortedDeals.find(d => d.min_quantity <= item.quantity)

    if (applicableDeal) {
      items[index] = { ...items[index], unitPrice: applicableDeal.unit }
    }
  }

  /**
   * Handle quantity change
   */
  function handleQuantityChange(index: number, quantity: number) {
    items[index] = { ...items[index], quantity }
    updatePriceByQuantity(index)

    if (checkInventory) {
      checkInventoryWarning(index)
    }
  }

  /**
   * Check inventory and set warning
   */
  async function checkInventoryWarning(index: number) {
    const item = items[index]
    if (!item.id) return

    try {
      const inventoryItems = await apiRequest<Array<{ id: string; rawMaterialId: string }>>({
        url: `supply/inventory/raw-material/${item.id}/items`,
      })

      const inventoryItem = inventoryItems.find(i => i.rawMaterialId === item.id)
      if (!inventoryItem) {
        warnings[index] = m.raw_material_not_in_stock()
        return
      }

      const detail = await apiRequest<{ buckets?: { in_stock?: number } }>({
        url: `supply/inventory/raw-material/item/${inventoryItem.id}`,
      })

      if (item.quantity > (detail.buckets?.in_stock || 0)) {
        warnings[index] = m.quantity_exceeds_available()
      } else {
        warnings[index] = undefined
      }
    } catch {
      // Silently fail - inventory check is optional
      warnings[index] = undefined
    }
  }

  /**
   * Handle items change callback
   */
  function handleItemsChange(completedItems: InternalLineItem[]) {
    const output = transformOutput(completedItems)
    onChange?.(output)
  }
</script>

<EditableTableField
  {name}
  {label}
  {showLabel}
  {required}
  bind:items
  {createEmptyItem}
  {isEmptyItem}
  {isCompleteItem}
  {transformOutput}
  disabled={isDisabled}
  minWidth="800px"
  onItemsChange={handleItemsChange}
  class={className}>
  {#snippet header()}
    <Table.Head class="min-w-48">{m.material()}</Table.Head>
    <Table.Head class="min-w-32">{m.material_id()}</Table.Head>
    {#if showQuantity}
      <Table.Head class="w-36">{m.quantity()}</Table.Head>
    {/if}
    {#if showLot}
      <Table.Head class="w-36">{m.lot()}</Table.Head>
    {/if}
    {#if showPrice}
      <Table.Head class="w-36">{m.price()}</Table.Head>
      <Table.Head class="w-20">{m.vat()}</Table.Head>
    {/if}
  {/snippet}

  {#snippet row({ item, index, updateItem, onFocus, onBlur })}
    <!-- Material Selector -->
    <Table.Cell class="p-0">
      <MaterialSelector
        name="material-{index}"
        attr={item.id ? ({ id: item.id, name: item.name, external_id: item.extraId } as RawMaterialSummary) : undefined}
        class={FormFieldClass.TableCell}
        showLabel={false}
        showErrorMessage={false}
        width={FormFieldClass.SelectorTableCellWidth}
        contentWidth={FormFieldClass.SelectorContentTableCellWidth}
        readonly={isDisabled || (!supplierId && !multipleSuppliers)}
        onChoose={material => handleMaterialSelect(index, material, updateItem)}
        onClear={() => handleMaterialClear(index, updateItem)} />
    </Table.Cell>

    <!-- Material ID (link) -->
    <Table.Cell>
      {#if item.extraId}
        <a
          tabindex="-1"
          class="text-sm text-primary hover:underline"
          href={createRoute({ $id: 'material-details', params: { uuid: item.id } })}
          target="_blank">
          {item.extraId}
        </a>
      {:else}
        <span class="text-muted-foreground">-</span>
      {/if}
    </Table.Cell>

    <!-- Quantity -->
    {#if showQuantity}
      <Table.Cell class="p-0">
        <QuantityField
          name="quantity-{index}"
          value={item.quantity}
          uom={item.uom}
          showLabel={false}
          showErrorMessage={false}
          disabled={!item.id || isDisabled}
          error={warnings[index]}
          errorPosition="floating-bottom"
          width="w-full"
          onChange={qty => handleQuantityChange(index, qty)}
          onfocus={onFocus}
          onblur={onBlur}
          class={FormFieldClass.TableCell} />
      </Table.Cell>
    {/if}

    <!-- Lot -->
    {#if showLot}
      <Table.Cell class="p-0">
        <TextField
          name="lot-{index}"
          value={item.externalLot}
          showLabel={false}
          showErrorMessage={false}
          disabled={isDisabled}
          width="w-full"
          placeholder={m.lot()}
          oninput={e => updateItem(index, { externalLot: e.currentTarget.value })}
          onfocus={onFocus}
          onblur={onBlur}
          class={FormFieldClass.TableCell} />
      </Table.Cell>
    {/if}

    <!-- Price -->
    {#if showPrice}
      <Table.Cell class="p-0">
        <PriceField
          name="price-{index}"
          value={item.unitPrice}
          currency={item.currency}
          showLabel={false}
          showErrorMessage={false}
          disabled={!editablePrice || isDisabled}
          width="w-full"
          onChange={price => updateItem(index, { unitPrice: price })}
          onfocus={onFocus}
          onblur={onBlur}
          class={FormFieldClass.TableCell} />
      </Table.Cell>

      <!-- VAT -->
      <Table.Cell class="p-0">
        <TextField
          name="vat-{index}"
          value={item.vat.toString()}
          rightLabel="%"
          showLabel={false}
          showErrorMessage={false}
          disabled
          width="w-full"
          class={FormFieldClass.TableCell} />
      </Table.Cell>
    {/if}
  {/snippet}
</EditableTableField>
