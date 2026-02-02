<!--
  @component ProductsEditor
  @description Multi-line editor for products in sales orders/quotes.
  Supports product selection, quantity, lot, price with deals and customer price lists.
  @keywords sales, order, quote, products, editor, line-items
  @uses EditableTableField, ProductSelector, ProductLotSelector
-->
<script lang="ts" module>
  import type { FieldValidator } from '$components/core/form/validation'
  import * as m from '$lib/paraglide/messages'

  /**
   * Output line item type (matches sales-api order/quote schema)
   */
  export type ProductLineItem = {
    id?: string
    name: string
    extra_id: string
    quantity: number
    uom: string
    lot?: string
    external_lot?: string
    item_id?: string
    order_id?: string
    prices?: {
      currency: 'EUR' | 'USD' | 'GBP'
      unit: number
      base_price?: number
      vat?: number
      discount_percent?: number
      deals?: Array<{ min_quantity: number; unit: number; category?: string }>
    }
    meta?: {
      offer_id?: string
      offer_internal_id?: string
    }
  }

  /**
   * Validator: requires at least one product item.
   * Use with v.schema(): products: [productsRequired()]
   */
  export function productsRequired<T>(message?: string): FieldValidator<T> {
    return value => {
      const items = value as ProductLineItem[] | undefined
      if (!items || items.length === 0) {
        return message ?? m.validation_required_generic()
      }
      return undefined
    }
  }

  /**
   * Validator: ensures all items have quantity > 0.
   * Use with v.schema(): products: [productsValidQuantity()]
   */
  export function productsValidQuantity<T>(message?: string): FieldValidator<T> {
    return value => {
      const items = value as ProductLineItem[] | undefined
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
  import ProductLotSelector from '$components/features/form/ProductLotSelector.svelte'
  import ProductSelector from '$components/features/form/ProductSelector.svelte'
  import { Button } from '$components/ui/button'
  import * as Table from '$components/ui/table'
  import * as Tooltip from '$components/ui/tooltip'
  import { UnitOfMeasures } from '$lib/config/uoms'
  import type { CalculatePriceResult, ProductInventoryItemSummary, ProductSummary } from '$lib/types/api-types'
  import { DEFAULT_CURRENCY_CODE, renderPrice } from '$utils/prices'
  import { apiRequest } from '$utils/request'
  import { createRoute } from '$utils/route-builder.js'
  import { getUOMMinQuantity } from '$utils/uom'
  import { BadgeEuro, LoaderCircle } from '@lucide/svelte'

  /**
   * Internal line item type for editing
   */
  type InternalLineItem = {
    id: string
    name: string
    extraId: string
    quantity: number
    uom: string
    lot: string
    externalLot: string
    itemId: string
    orderId: string
    currency: string
    basePrice: number
    unitPrice: number
    customPrice?: number
    vat: number
    discount: number
    deals: Array<{ min_quantity: number; unit: number; category?: string }>
    productAttr?: ProductSummary
    lotAttr?: ProductInventoryItemSummary
    lotMaxQuantity?: number
    offerId?: string
    offerInternalId?: string
    margin?: number
    busy?: boolean
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
    value?: ProductLineItem[]
    /** Customer ID for price list lookup */
    customerId?: string
    /** Use customer-specific price list */
    useCustomerPriceList?: boolean
    /** Warehouse ID to filter lots */
    warehouseId?: string
    /** Show lot column */
    showLot?: boolean
    /** Show price columns */
    showPrice?: boolean
    /** Show discount column */
    showDiscount?: boolean
    /** Show quantity column */
    showQuantity?: boolean
    /** Allow price editing */
    editablePrice?: boolean
    /** Require at least one item (adds asterisk to label) */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when line items change */
    onChange?: (items: ProductLineItem[]) => void
    /** Additional CSS classes */
    class?: string
  }

  let {
    name = 'products',
    label = m.products(),
    showLabel = true,
    value = [],
    customerId = undefined,
    useCustomerPriceList = false,
    warehouseId = undefined,
    showLot = false,
    showPrice = false,
    showDiscount = false,
    showQuantity = true,
    editablePrice = true,
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

  // Debounce timers for price calculation
  let priceTimers = $state<Record<number, ReturnType<typeof setTimeout> | undefined>>({})
  const PRICE_DEBOUNCE_MS = 400

  // Create empty item
  function createEmptyItem(): InternalLineItem {
    return {
      id: '',
      name: '',
      extraId: '',
      quantity: 0,
      uom: UnitOfMeasures.Default,
      lot: '',
      externalLot: '',
      itemId: '',
      orderId: '',
      currency: DEFAULT_CURRENCY_CODE,
      basePrice: 0,
      unitPrice: 0,
      customPrice: undefined,
      vat: 0,
      discount: 0,
      deals: [],
      productAttr: undefined,
      lotAttr: undefined,
      lotMaxQuantity: undefined,
      offerId: undefined,
      offerInternalId: undefined,
      margin: undefined,
      busy: false,
      warning: undefined,
    }
  }

  // Check if item is empty
  function isEmptyItem(item: InternalLineItem): boolean {
    return !item.id || !item.name
  }

  // Check if item is complete (valid for output)
  function isCompleteItem(item: InternalLineItem): boolean {
    const baseComplete = !!item.id && !!item.name && item.quantity > 0
    if (showLot) {
      // When showing lots, require lot selection
      return baseComplete && (!!item.lot || !!item.externalLot)
    }
    return baseComplete
  }

  // Transform internal items to API output format
  function transformOutput(internalItems: InternalLineItem[]): ProductLineItem[] {
    return internalItems.map(item => ({
      id: item.id || undefined,
      name: item.name,
      extra_id: item.extraId,
      quantity: item.quantity,
      uom: item.uom,
      lot: item.lot || undefined,
      external_lot: item.externalLot || undefined,
      item_id: item.itemId || undefined,
      order_id: item.orderId || undefined,
      prices: {
        currency: item.currency as 'EUR' | 'USD' | 'GBP',
        unit: item.unitPrice,
        base_price: item.basePrice,
        vat: item.vat,
        discount_percent: item.discount,
        deals: item.deals,
      },
      meta:
        item.offerId || item.offerInternalId
          ? {
              offer_id: item.offerId,
              offer_internal_id: item.offerInternalId,
            }
          : undefined,
    }))
  }

  // Load initial value
  $effect(() => {
    const initialValue = (form?.values[name] as ProductLineItem[] | undefined) ?? value
    if (initialValue && initialValue.length > 0 && items.length === 0) {
      items = initialValue.map(item => ({
        id: item.id ?? '',
        name: item.name,
        extraId: item.extra_id,
        quantity: item.quantity,
        uom: item.uom || UnitOfMeasures.Default,
        lot: item.lot || '',
        externalLot: item.external_lot || '',
        itemId: item.item_id || '',
        orderId: item.order_id || '',
        currency: item.prices?.currency || DEFAULT_CURRENCY_CODE,
        basePrice: item.prices?.base_price || item.prices?.unit || 0,
        unitPrice: item.prices?.unit || 0,
        customPrice: undefined,
        vat: item.prices?.vat || 0,
        discount: item.prices?.discount_percent || 0,
        deals: item.prices?.deals || [],
        productAttr: undefined,
        lotAttr: undefined,
        lotMaxQuantity: undefined,
        offerId: item.meta?.offer_id,
        offerInternalId: item.meta?.offer_internal_id,
        margin: undefined,
        busy: false,
        warning: undefined,
      }))
    }
  })

  /**
   * Handle product selection
   */
  function handleProductSelect(
    index: number,
    product: ProductSummary,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    const deals = product.prices?.deals || []
    const smallestQtyDeal = [...deals].sort((a, b) => a.min_quantity - b.min_quantity)[0]
    const initialQuantity = smallestQtyDeal?.min_quantity ?? getUOMMinQuantity(product.uom || UnitOfMeasures.Default)

    updateItem(index, {
      id: product.id ?? '',
      name: product.name,
      extraId: product.internal_id || '',
      uom: product.uom || UnitOfMeasures.Default,
      quantity: initialQuantity,
      currency: product.prices?.currency || DEFAULT_CURRENCY_CODE,
      basePrice: product.prices?.unit || 0,
      unitPrice: product.prices?.unit || 0,
      vat: product.prices?.vat || 0,
      discount: 0,
      deals: deals,
      productAttr: product,
      // Clear lot when product changes
      lot: '',
      externalLot: '',
      itemId: '',
      orderId: '',
      lotAttr: undefined,
      lotMaxQuantity: undefined,
    })

    // Calculate price after selection
    resolveFinalPrice(index, true)
  }

  /**
   * Handle product clear
   */
  function handleProductClear(index: number, updateItem: (index: number, updates: Partial<InternalLineItem>) => void) {
    updateItem(index, createEmptyItem())
    warnings[index] = undefined
  }

  /**
   * Handle lot selection
   */
  function handleLotSelect(
    index: number,
    lot: ProductInventoryItemSummary,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    updateItem(index, {
      lot: lot.lot || '',
      externalLot: lot.external_lot || '',
      itemId: lot.id || '',
      orderId: lot.order_id || '',
      lotAttr: lot,
      lotMaxQuantity: lot.buckets?.available || 0,
    })

    // Check lot quantity warning
    checkLotWarning(index)
  }

  /**
   * Handle lot clear
   */
  function handleLotClear(index: number, updateItem: (index: number, updates: Partial<InternalLineItem>) => void) {
    updateItem(index, {
      lot: '',
      externalLot: '',
      itemId: '',
      orderId: '',
      lotAttr: undefined,
      lotMaxQuantity: undefined,
    })
    warnings[index] = undefined
  }

  /**
   * Resolve final price (from deals or customer price list)
   */
  async function resolveFinalPrice(index: number, immediate: boolean = false) {
    const item = items[index]
    if (!item.id) return

    // Clear existing timer
    if (priceTimers[index]) {
      clearTimeout(priceTimers[index])
      priceTimers[index] = undefined
    }

    const calculate = async () => {
      // Apply deals-based pricing first
      if (item.deals.length > 0 && !item.customPrice) {
        const sortedDeals = [...item.deals].sort((a, b) => b.min_quantity - a.min_quantity)
        const applicableDeal = sortedDeals.find(d => d.min_quantity <= item.quantity)
        if (applicableDeal) {
          items[index] = { ...items[index], basePrice: applicableDeal.unit, unitPrice: applicableDeal.unit }
        }
      }

      // Use customer price list if enabled
      if (useCustomerPriceList && customerId && item.quantity > 0) {
        try {
          items[index] = { ...items[index], busy: true, margin: undefined }

          const result = await apiRequest<CalculatePriceResult>({
            method: 'POST',
            url: `sales/customer/${customerId}/products/${item.id}/_calculate-price`,
            data: {
              applicable_price: item.customPrice,
              discount_percent: item.discount || 0,
              quantity: item.quantity,
            },
          })

          items[index] = {
            ...items[index],
            unitPrice: result.final_price,
            margin: result.margin_percent,
            offerId: result.applied_offer?.offer_id,
            offerInternalId: result.applied_offer?.offer_internal_id,
            busy: false,
          }

          if (!item.customPrice) {
            items[index] = { ...items[index], basePrice: result.applicable_price }
          }
        } catch {
          items[index] = { ...items[index], busy: false }
        }
      }
    }

    if (immediate) {
      await calculate()
    } else {
      priceTimers[index] = setTimeout(calculate, PRICE_DEBOUNCE_MS)
    }
  }

  /**
   * Handle quantity change
   */
  function handleQuantityChange(index: number, quantity: number) {
    items[index] = { ...items[index], quantity }
    resolveFinalPrice(index)

    if (showLot) {
      checkLotWarning(index)
    }
  }

  /**
   * Handle base price change
   */
  function handlePriceChange(index: number, price: number) {
    items[index] = { ...items[index], basePrice: price, customPrice: price, unitPrice: price }
    resolveFinalPrice(index)
  }

  /**
   * Handle discount change
   */
  function handleDiscountChange(index: number, discount: number) {
    if (items[index].discount === discount) return
    items[index] = { ...items[index], discount }
    resolveFinalPrice(index)
  }

  /**
   * Check lot quantity warning
   */
  async function checkLotWarning(index: number) {
    const item = items[index]
    if (!item.itemId) {
      warnings[index] = undefined
      return
    }

    // Fetch lot details if we don't have them
    let maxQuantity = item.lotMaxQuantity
    if (maxQuantity === undefined && !isDisabled) {
      try {
        const detail = await apiRequest<{ buckets?: { available?: number } }>({
          url: `product/inventory/product/${item.itemId}`,
        })
        maxQuantity = detail.buckets?.available || 0
        items[index] = { ...items[index], lotMaxQuantity: maxQuantity }
      } catch {
        maxQuantity = 0
      }
    }

    if (maxQuantity !== undefined && item.quantity > maxQuantity) {
      warnings[index] = m.quantity_exceeds_available()
    } else {
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
  minWidth="900px"
  onItemsChange={handleItemsChange}
  class={className}>
  {#snippet header()}
    <Table.Head class="min-w-48">{m.product()}</Table.Head>
    <Table.Head class="min-w-32">{m.product_id()}</Table.Head>
    {#if showLot}
      <Table.Head class="min-w-32">{m.lot()}</Table.Head>
    {/if}
    {#if showQuantity}
      <Table.Head class="w-36">{m.quantity()}</Table.Head>
    {/if}
    {#if showPrice}
      <Table.Head class="w-36">{m.price()}</Table.Head>
      <Table.Head class="w-24">{m.vat()}</Table.Head>
    {/if}
    {#if showDiscount && showPrice}
      <Table.Head class="w-24">{m.discount()}</Table.Head>
      <Table.Head class="w-32"></Table.Head>
    {/if}
  {/snippet}

  {#snippet row({ item, index, updateItem, onFocus, onBlur })}
    <!-- Product Selector -->
    <Table.Cell class="p-0">
      <ProductSelector
        name="product-{index}"
        attr={item.id ? ({ id: item.id, name: item.name, internal_id: item.extraId } as ProductSummary) : undefined}
        class={FormFieldClass.TableCell}
        showLabel={false}
        showErrorMessage={false}
        width={FormFieldClass.SelectorTableCellWidth}
        contentWidth={FormFieldClass.SelectorContentTableCellWidth}
        readonly={isDisabled}
        onChoose={product => handleProductSelect(index, product, updateItem)}
        onClear={() => handleProductClear(index, updateItem)} />
    </Table.Cell>

    <!-- Product ID (link) -->
    <Table.Cell>
      <div class="flex items-center justify-between gap-2">
        {#if item.extraId}
          <a
            tabindex="-1"
            class="truncate text-sm text-primary hover:underline"
            href={createRoute({ $id: 'product-details', params: { uuid: item.id } })}
            target="_blank">
            {item.extraId}
          </a>
        {:else}
          <span class="text-muted-foreground">-</span>
        {/if}

        {#if item.offerId}
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button {...props} size="icon" variant="link" tabindex={-1}>
                  <BadgeEuro class="size-4 rounded-full text-muted-foreground" />
                </Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content class="max-w-52">
              <p>{m.product_offer_tooltip({ offer: item.offerInternalId || '' })}</p>
            </Tooltip.Content>
          </Tooltip.Root>
        {/if}
      </div>
    </Table.Cell>

    <!-- Lot Selector -->
    {#if showLot}
      <Table.Cell class="p-0">
        <ProductLotSelector
          name="lot-{index}"
          productId={item.id}
          {warehouseId}
          attr={item.itemId
            ? ({
                id: item.itemId,
                name: item.name,
                lot: item.lot,
                external_lot: item.externalLot,
              } as ProductInventoryItemSummary)
            : undefined}
          class={FormFieldClass.TableCell}
          showLabel={false}
          showErrorMessage={false}
          width={FormFieldClass.SelectorTableCellWidth}
          contentWidth={FormFieldClass.SelectorContentTableCellWidth}
          disabled={!item.id || isDisabled}
          onChoose={lot => handleLotSelect(index, lot, updateItem)}
          onClear={() => handleLotClear(index, updateItem)} />
      </Table.Cell>
    {/if}

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

    <!-- Price -->
    {#if showPrice}
      <Table.Cell class="p-0">
        <PriceField
          name="price-{index}"
          value={item.basePrice}
          currency={item.currency}
          showLabel={false}
          showErrorMessage={false}
          disabled={!editablePrice || isDisabled}
          width="w-full"
          onChange={price => handlePriceChange(index, price)}
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

    <!-- Discount + Final Price -->
    {#if showDiscount && showPrice}
      <Table.Cell class="p-0">
        <TextField
          name="discount-{index}"
          value={item.discount.toString()}
          rightLabel="%"
          showLabel={false}
          showErrorMessage={false}
          disabled={!editablePrice || isDisabled}
          width="w-full"
          oninput={e => {
            const val = parseFloat(e.currentTarget.value) || 0
            handleDiscountChange(index, Math.min(100, Math.max(0, val)))
          }}
          onfocus={onFocus}
          onblur={onBlur}
          class={FormFieldClass.TableCell} />
      </Table.Cell>

      <Table.Cell class="relative">
        <div class="text-right text-xs font-semibold">
          {m.final_price()}: {renderPrice(item.unitPrice, item.currency)}
        </div>
        {#if item.margin !== undefined}
          <div class="text-right text-xs text-muted-foreground">
            {m.margin()}: {item.margin.toFixed(2)}%
          </div>
        {/if}

        {#if item.busy}
          <div class="absolute inset-0 flex items-center bg-background/80 px-2">
            <LoaderCircle class="size-4 animate-spin" />
          </div>
        {/if}
      </Table.Cell>
    {/if}
  {/snippet}
</EditableTableField>
