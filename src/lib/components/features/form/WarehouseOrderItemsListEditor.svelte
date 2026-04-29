<!--
  @component WarehouseOrderItemsListEditor
  @description Card-based editor for warehouse order line items.
  Each item is either linked to a sales order item (description/UoM/item_id are
  derived server-side from the snapshot) or a free entry. Pricing/VAT are not
  part of the warehouse order item model.
  Supports importing items from confirmed sales orders for the same customer.
  @keywords warehouse-order, items, editor, line-items, picking, import, sales-order
  @uses EditableListField, ItemSelector, ImportMenu
-->
<script lang="ts" module>
  export type WarehouseOrderLineItem = {
    /** Persisted UUID — present only on existing items */
    id?: string
    /** Linked sales order item UUID — when set, item_id/description/uom are derived server-side */
    sales_order_item_id?: string
    /** Item UUID — required when sales_order_item_id is not provided */
    item_id?: string
    /** Cached item snapshot for display */
    item_snapshot?: Record<string, unknown>
    /** Description — required when sales_order_item_id is not provided */
    description?: string
    /** Requested quantity */
    quantity_requested: number
    /** Picked quantity — read-only here, mutated via the pick-items endpoint */
    quantity_picked?: number
    /** Unit of measure — required when sales_order_item_id is not provided */
    uom?: string
  }
</script>

<script lang="ts">
  import { ImportMenu } from '$components/core/common/import-menu'
  import EditableListField from '$components/core/form/EditableListField.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { FormFieldClass } from '$components/core/form/form'
  import { getFormContextOptional } from '$components/core/form/form-context'
  import ItemSelector from '$components/features/form/ItemSelector.svelte'
  import Button from '$components/ui/button/button.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import * as Tooltip from '$components/ui/tooltip'
  import { UnitOfMeasures } from '$lib/config/uoms'
  import * as m from '$lib/paraglide/messages'
  import type { Item, UnitOfMeasure } from '$lib/types/api-types'
  import { toSelectItems, unitOfMeasureLabels } from '$lib/utils/enum-labels'
  import type { BasicOption } from '$lib/utils/generics'
  import { apiRequest } from '$utils/request'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import Plus from '@lucide/svelte/icons/plus'

  type InternalLineItem = WarehouseOrderLineItem & {
    /** Cached item entity for the selector */
    itemAttr?: Item
  }

  type SalesOrderWithItems = {
    id: string
    document_number: string
    document_date: string
    customer_id: string
    sales_transaction_type?: string
    incoterm?: string
    items?: SalesOrderItemSnapshot[]
  }

  type SalesOrderItemSnapshot = {
    id: string
    type: 'item' | 'descriptive'
    item_id: string
    item_snapshot: Record<string, unknown>
    description: string
    quantity: number
    uom: string
  }

  const MAX_PREVIEW_ITEMS = 10

  type Props = {
    /** Legal entity ID for API calls */
    legalEntityId: string | undefined
    /** Customer ID — gates the import action and filters available sales orders */
    customerId: string | undefined
    /** Sales transaction type — passed as filter to the import menu */
    salesTransactionType?: string
    /** Incoterm — passed as filter to the import menu */
    incoterm?: string
    /** Field name for form binding */
    name?: string
    /** Label for the field */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** Initial value (when not bound through form context) */
    value?: WarehouseOrderLineItem[]
    /** Require at least one item */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when line items change */
    onChange?: (items: WarehouseOrderLineItem[]) => void
    /** When this value changes, items are re-hydrated from the form context */
    refreshKey?: unknown
    /** Additional CSS classes */
    class?: string
  }

  let {
    legalEntityId,
    customerId,
    salesTransactionType,
    incoterm,
    name = 'items',
    label = m.warehouse_order_line_items(),
    showLabel = true,
    value = [],
    required = false,
    disabled = false,
    onChange,
    refreshKey = undefined,
    class: className = '',
  }: Props = $props()

  const form = getFormContextOptional()
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)
  const uomItems = toSelectItems(unitOfMeasureLabels)
  const canImport = $derived(!!legalEntityId && !!customerId && !isDisabled)

  // EditableListField clears the form context for its children, so sub-fields
  // can't auto-resolve their error from `form.errors[name]`. We resolve it here
  // (where the parent form context is still in scope) and pass it down explicitly.
  function getFieldError(idx: number, field: string): string | undefined {
    return form?.errors[`${name}.${idx}.${field}` as never] as string | undefined
  }

  let items = $state<InternalLineItem[]>([])
  let editorRef: EditableListField<InternalLineItem> | undefined = $state()

  function createEmptyItem(): InternalLineItem {
    return {
      sales_order_item_id: undefined,
      item_id: '',
      description: '',
      quantity_requested: 0,
      quantity_picked: 0,
      uom: UnitOfMeasures.Default,
      itemAttr: undefined,
    }
  }

  function isCompleteItem(item: InternalLineItem): boolean {
    if (item.sales_order_item_id) {
      return item.quantity_requested > 0
    }
    return !!item.item_id && !!item.uom && !!item.description && item.quantity_requested > 0
  }

  function transformOutput(internalItems: InternalLineItem[]): WarehouseOrderLineItem[] {
    return internalItems.map(item => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { itemAttr, quantity_picked, ...rest } = item
      if (rest.sales_order_item_id) {
        return {
          sales_order_item_id: rest.sales_order_item_id,
          quantity_requested: rest.quantity_requested,
          ...(rest.id ? { id: rest.id } : {}),
        }
      }
      return rest
    })
  }

  function mapFromApi(apiItems: WarehouseOrderLineItem[]): InternalLineItem[] {
    return apiItems.map(item => {
      const snapshot = item.item_snapshot as Record<string, unknown> | undefined
      return {
        ...item,
        itemAttr: snapshot ? ({ id: item.item_id, ...snapshot } as Item) : undefined,
      }
    })
  }

  $effect(() => {
    const initialValue = (form?.values[name] as WarehouseOrderLineItem[] | undefined) ?? value
    if (initialValue && initialValue.length > 0 && (items.length === 0 || items.every(i => !isCompleteItem(i)))) {
      items = mapFromApi(initialValue)
    }
  })

  let lastRefreshKey: unknown = undefined
  $effect(() => {
    if (refreshKey === lastRefreshKey) return
    lastRefreshKey = refreshKey

    const formValue = form?.values[name] as WarehouseOrderLineItem[] | undefined
    if (formValue && formValue.length > 0) {
      setTimeout(() => {
        items = mapFromApi(form?.values[name] as WarehouseOrderLineItem[])
      }, 100)
    }
  })

  function handleItemSelect(
    index: number,
    selectedItem: Item,
    updateItem: (index: number, updates: Partial<InternalLineItem>) => void,
  ) {
    updateItem(index, {
      item_id: selectedItem.id,
      item_snapshot: selectedItem as unknown as Record<string, unknown>,
      description: selectedItem.name ?? '',
      uom: (selectedItem.primary_uom as UnitOfMeasure | undefined) || UnitOfMeasures.Default,
      quantity_requested: 1,
      itemAttr: selectedItem,
    })
  }

  function handleItemClear(index: number, updateItem: (index: number, updates: Partial<InternalLineItem>) => void) {
    updateItem(index, {
      item_id: '',
      item_snapshot: undefined,
      description: '',
      uom: UnitOfMeasures.Default,
      quantity_requested: 0,
      itemAttr: undefined,
    })
  }

  function notifyFormUpdate() {
    const output = transformOutput(items.filter(isCompleteItem))
    onChange?.(output)
    if (form) {
      form.updateField(name, output as never)
      // Stale server-side errors (keyed by `{name}.{index}.{field}`) reference
      // indices that may have shifted after add/remove/reorder, or values that
      // the user just corrected. Drop them all on every items mutation.
      form.clearErrorsAtPrefix(`${name}.`)
    }
  }

  function handleItemsChange(completedItems: InternalLineItem[]) {
    const output = transformOutput(completedItems)
    onChange?.(output)
    form?.clearErrorsAtPrefix(`${name}.`)
  }

  async function fetchAvailableSalesOrders(search?: string): Promise<SalesOrderWithItems[]> {
    if (!legalEntityId || !customerId) return []
    const response = await apiRequest<{ data: SalesOrderWithItems[] }>({
      url: `/legal-entities/${legalEntityId}/sales-orders`,
      method: 'GET',
      queryParams: {
        state: 'approved',
        customer_id: customerId,
        ...(search ? { search } : {}),
      },
    })
    const data = response.data ?? []
    return data.filter(order => {
      if (salesTransactionType && order.sales_transaction_type && order.sales_transaction_type !== salesTransactionType)
        return false
      if (incoterm && order.incoterm && order.incoterm !== incoterm) return false
      return true
    })
  }

  function mapSalesOrderToOption(order: SalesOrderWithItems): BasicOption {
    return { label: order.document_number, value: order.id }
  }

  function handleImport(orders: SalesOrderWithItems[]) {
    const imported: InternalLineItem[] = orders.flatMap(order =>
      (order.items ?? [])
        .filter(item => item.type === 'item')
        .map(item => ({
          sales_order_item_id: item.id,
          item_id: item.item_id,
          item_snapshot: item.item_snapshot,
          description: item.description,
          quantity_requested: item.quantity,
          uom: item.uom,
          itemAttr: item.item_snapshot ? ({ id: item.item_id, ...item.item_snapshot } as Item) : undefined,
        })),
    )
    if (imported.length === 0) return
    const nonEmpty = items.filter(i => isCompleteItem(i))
    items = [...nonEmpty, ...imported]
    notifyFormUpdate()
  }
</script>

<EditableListField
  bind:this={editorRef}
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
  class={className}>
  {#snippet header({ options })}
    {#if !isDisabled}
      <div class="flex w-full items-center justify-end gap-2">
        {#if canImport}
          <ImportMenu
            fetchFunction={fetchAvailableSalesOrders}
            optionMappingFunction={mapSalesOrderToOption}
            onimport={handleImport}
            label={m.import_from_sales_orders()}>
            {#snippet previewSnippet(order)}
              {@const productItems = (order.items ?? []).filter(i => i.type === 'item')}
              <div class="space-y-2">
                <div>
                  <p class="text-sm font-semibold">{order.document_number}</p>
                  <p class="text-xs text-muted-foreground">{new Date(order.document_date).toLocaleDateString()}</p>
                </div>
                <div class="text-xs text-muted-foreground">
                  {productItems.length}
                  {m.items()}
                </div>
                {#if productItems.length > 0}
                  <div class="space-y-1 border-t pt-2">
                    {#each productItems.slice(0, MAX_PREVIEW_ITEMS) as item, idx (item.id + idx)}
                      <div class="flex items-baseline justify-between gap-2 text-xs">
                        <span class="truncate">{item.item_snapshot?.name ?? item.item_snapshot?.code ?? '-'}</span>
                        <span class="shrink-0 text-muted-foreground">x{item.quantity}</span>
                      </div>
                    {/each}
                    {#if productItems.length > MAX_PREVIEW_ITEMS}
                      <p class="text-xs text-muted-foreground">
                        +{productItems.length - MAX_PREVIEW_ITEMS}
                        {m.items()}…
                      </p>
                    {/if}
                  </div>
                {/if}
              </div>
            {/snippet}
          </ImportMenu>
        {/if}
        <Button variant="outline" size="sm" onclick={options.toggleDragAndDrop}>
          <ArrowUpDown class="mr-1 size-4" />
          {options.dragAndDropActive ? m.done_reordering() : m.reorder_items()}
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
      <span class="truncate text-sm">
        {item.item_snapshot?.name || item.item_snapshot?.code || m.item()}
      </span>
      {#if item.quantity_requested}
        <span class="text-xs text-muted-foreground">x{item.quantity_requested}</span>
      {/if}
    </div>
  {/snippet}

  {#snippet item({ item, index, updateItem })}
    {@const isLinked = !!item.sales_order_item_id}
    <div class="absolute -left-8 hidden h-6 text-sm leading-6 font-semibold text-primary md:block">
      <span class="opacity-60">#</span>{index + 1}
    </div>

    <div class="grid grid-cols-1 gap-x-4 gap-y-3 pr-8 sm:grid-cols-2 lg:grid-cols-4">
      {#if isLinked}
        <div class="sm:col-span-2 lg:col-span-2">
          <span class="block text-sm leading-6 font-medium">{m.item()}</span>
          <div class="flex h-9 items-center gap-2 text-sm">
            <span class="max-w-64 truncate text-muted-foreground">
              {item.item_snapshot?.name ?? item.item_snapshot?.code ?? '-'}
            </span>

            <!-- <Tooltip.Root>
              <Tooltip.Trigger class="flex items-center gap-1 text-muted-foreground">
                <Link2 class="size-3.5" />
                <span class="max-w-64 truncate">
                  {item.item_snapshot?.name ?? item.item_snapshot?.code ?? '-'}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>{m.linked_to_sales_order_item()}</Tooltip.Content>
            </Tooltip.Root> -->
          </div>
        </div>
      {:else}
        <div class="sm:col-span-2 lg:col-span-2">
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
            allowOpenRecord />
        </div>
      {/if}

      <div class="flex flex-col">
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

      <NumberField
        name="{name}.{index}.quantity_requested"
        label={m.quantity_requested()}
        value={item.quantity_requested ?? 0}
        error={getFieldError(index, 'quantity_requested')}
        errorPosition="floating-bottom"
        disabled={(!isLinked && !item.item_id) || isDisabled}
        width="w-full"
        oninput={e => updateItem(index, { quantity_requested: parseFloat(e.currentTarget.value) || 0 })} />

      <div class="sm:col-span-2 lg:col-span-3">
        <TextField
          name="{name}.{index}.description"
          label={m.description()}
          value={item.description ?? ''}
          error={getFieldError(index, 'description')}
          errorPosition="floating-bottom"
          disabled={isLinked || !item.item_id || isDisabled}
          width="w-full"
          oninput={e => updateItem(index, { description: e.currentTarget.value })} />
      </div>

      <SelectField
        name="{name}.{index}.uom"
        label={m.uom()}
        items={uomItems}
        value={item.uom}
        error={getFieldError(index, 'uom')}
        errorPosition="floating-bottom"
        disabled={isLinked || !item.item_id || isDisabled}
        width="w-full"
        onChange={uom => updateItem(index, { uom: uom ?? undefined })} />

      <!-- Quantity Picked - hidden for the time being, until we have the pick functionality -->
      <!-- {#if item.id}
        <div class="flex flex-col">
          <span class="block text-sm leading-6 font-medium">{m.quantity_picked()}</span>
          <div class="flex h-9 items-center text-sm text-muted-foreground">
            {item.quantity_picked ?? 0}
          </div>
        </div>
      {/if} -->
    </div>
  {/snippet}

  {#snippet addButton({ addItem, disabled: addDisabled, options: opts })}
    {#if !opts.dragAndDropActive}
      <div class="mt-1 gap-2 md:flex">
        <Button variant="outline" size="sm" disabled={addDisabled} onclick={() => addItem()}>
          <Plus class="mr-1 size-4" />
          {m.add_item_line()}
        </Button>
      </div>
    {/if}
  {/snippet}
</EditableListField>
