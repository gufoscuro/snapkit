<!--
  @component TransportDocumentItemsListEditor
  @description Card-based editor for transport document line items with pricing/VAT/weights.
  Each item is either linked to a sales order item, a warehouse order item, or a free entry.
  Supports a unified import flow that lets the user pick approved sales orders or
  warehouse orders for the same customer in one dropdown.
  @keywords transport-document, ddt, items, editor, line-items, import, sales-order, warehouse-order
  @uses EditableListField, ItemSelector, VatCodeSelector, ImportMenu
-->
<script lang="ts" module>
  export type TransportDocumentLineItem = {
    /** Persisted UUID — present only on existing items */
    id?: string
    /** Linked sales order item UUID — when set, item_id/description/uom are derived server-side */
    sales_order_item_id?: string
    /** Linked warehouse order item UUID — alternative origin to sales_order_item_id */
    warehouse_order_item_id?: string
    /** Item UUID — required when no link is present */
    item_id?: string
    /** Cached item snapshot for display */
    item_snapshot?: Record<string, unknown>
    /** Description — required when no link is present */
    description?: string
    /** Transported quantity */
    quantity: number
    /** Unit of measure — required when no link is present */
    uom?: string
    /** Unit price */
    unit_price?: number
    /** Net value (computed server-side) */
    net_value?: number
    /** VAT code id */
    vat_code_id?: string
    /** VAT code snapshot */
    vat_code_snapshot?: Record<string, unknown>
    /** Per-line gross weight */
    weight_gross?: number
    /** Per-line net weight */
    weight_net?: number
  }
</script>

<script lang="ts">
  import { ImportMenu } from '$components/core/common/import-menu'
  import EditableListField from '$components/core/form/EditableListField.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import PriceField from '$components/core/form/PriceField.svelte'
  import QuantityField from '$components/core/form/QuantityField.svelte'
  import SelectField from '$components/core/form/SelectField.svelte'
  import TextField from '$components/core/form/TextField.svelte'
  import { FormFieldClass } from '$components/core/form/form'
  import { getFormContextOptional } from '$components/core/form/form-context'
  import ItemSelector from '$components/features/form/ItemSelector.svelte'
  import VatCodeSelector, { type VatCodeSummary } from '$components/features/form/VatCodeSelector.svelte'
  import Badge from '$components/ui/badge/badge.svelte'
  import Button from '$components/ui/button/button.svelte'
  import Separator from '$components/ui/separator/separator.svelte'
  import * as Tooltip from '$components/ui/tooltip'
  import { UnitOfMeasures } from '$lib/config/uoms'
  import * as m from '$lib/paraglide/messages'
  import type { Item, UnitOfMeasure } from '$lib/types/api-types'
  import { toSelectItems, unitOfMeasureLabels } from '$lib/utils/enum-labels'
  import type { BasicOption } from '$lib/utils/generics'
  import { generateId } from '$lib/utils/id'
  import { DEFAULT_CURRENCY_CODE } from '$utils/prices'
  import { apiRequest } from '$utils/request'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Plus from '@lucide/svelte/icons/plus'
  import { toast } from 'svelte-sonner'
  import { SvelteSet } from 'svelte/reactivity'

  type InternalLineItem = TransportDocumentLineItem & {
    /** Cached item entity for the selector */
    itemAttr?: Item
    /** Cached VAT code entity for the selector */
    vatCodeAttr?: VatCodeSummary
    /** UI-only: identifies a batch of items imported together (used for color coding). Stripped in transformOutput. */
    _groupId?: string
  }

  type SourceOrigin = 'sales-order' | 'warehouse-order'

  type SourceOrderItem = {
    id: string
    type?: 'item' | 'descriptive'
    item_id: string
    item_snapshot: Record<string, unknown>
    description: string
    /** Sales order: `quantity`. Warehouse order: `quantity_requested`. Normalized below. */
    quantity?: number
    quantity_requested?: number
    uom: string
    unit_price?: number
    vat_code_id?: string
    vat_code_snapshot?: Record<string, unknown>
  }

  type SourceOrderRecord = {
    /** Discriminator added client-side for the unified import dropdown */
    source: SourceOrigin
    id: string
    document_number: string
    document_date: string
    customer_id: string
    sales_transaction_type?: string
    incoterm?: string
    items?: SourceOrderItem[]
  }

  const MAX_PREVIEW_ITEMS = 10

  type Props = {
    /** Legal entity ID for API calls */
    legalEntityId: string | undefined
    /** Customer ID — gates the import action and filters available source orders */
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
    value?: TransportDocumentLineItem[]
    /** Currency for price fields */
    currency?: string
    /** Default VAT code from customer commercial terms */
    defaultVatCode?: VatCodeSummary
    /** Require at least one item */
    required?: boolean
    /** Disabled state */
    disabled?: boolean
    /** Callback when line items change */
    onChange?: (items: TransportDocumentLineItem[]) => void
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
    label = m.transport_document_line_items(),
    showLabel = true,
    value = [],
    currency = DEFAULT_CURRENCY_CODE,
    defaultVatCode = undefined,
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
      warehouse_order_item_id: undefined,
      item_id: '',
      description: '',
      quantity: 0,
      uom: UnitOfMeasures.Default,
      unit_price: 0,
      vat_code_id: defaultVatCode?.id ?? '',
      vat_code_snapshot: defaultVatCode ? (defaultVatCode as unknown as Record<string, unknown>) : undefined,
      weight_gross: 0,
      weight_net: 0,
      itemAttr: undefined,
      vatCodeAttr: defaultVatCode ?? undefined,
    }
  }

  function isLinkedItem(item: InternalLineItem): boolean {
    return !!item.sales_order_item_id || !!item.warehouse_order_item_id
  }

  function isCompleteItem(item: InternalLineItem): boolean {
    if (isLinkedItem(item)) {
      return item.quantity > 0
    }
    return !!item.item_id && !!item.uom && !!item.description && item.quantity > 0
  }

  function transformOutput(internalItems: InternalLineItem[]): TransportDocumentLineItem[] {
    return internalItems.map(item => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { itemAttr, vatCodeAttr, _groupId, ...rest } = item
      // Strip null/empty link ids so the API only receives the relevant origin
      if (rest.sales_order_item_id) {
        return {
          sales_order_item_id: rest.sales_order_item_id,
          quantity: rest.quantity,
          unit_price: rest.unit_price,
          vat_code_id: rest.vat_code_id,
          weight_gross: rest.weight_gross,
          weight_net: rest.weight_net,
          ...(rest.id ? { id: rest.id } : {}),
        }
      }
      if (rest.warehouse_order_item_id) {
        return {
          warehouse_order_item_id: rest.warehouse_order_item_id,
          quantity: rest.quantity,
          unit_price: rest.unit_price,
          vat_code_id: rest.vat_code_id,
          weight_gross: rest.weight_gross,
          weight_net: rest.weight_net,
          ...(rest.id ? { id: rest.id } : {}),
        }
      }
      return rest
    })
  }

  function mapFromApi(apiItems: TransportDocumentLineItem[]): InternalLineItem[] {
    return apiItems.map(item => {
      const itemSnapshot = item.item_snapshot as Record<string, unknown> | undefined
      const vatSnapshot = item.vat_code_snapshot as Record<string, unknown> | undefined
      return {
        ...item,
        itemAttr: itemSnapshot ? ({ id: item.item_id, ...itemSnapshot } as Item) : undefined,
        vatCodeAttr:
          vatSnapshot && item.vat_code_id ? { ...(vatSnapshot as VatCodeSummary), id: item.vat_code_id } : undefined,
      }
    })
  }

  $effect(() => {
    const initialValue = (form?.values[name] as TransportDocumentLineItem[] | undefined) ?? value
    if (initialValue && initialValue.length > 0 && (items.length === 0 || items.every(i => !isCompleteItem(i)))) {
      items = mapFromApi(initialValue)
    }
  })

  let lastRefreshKey: unknown = undefined
  $effect(() => {
    if (refreshKey === lastRefreshKey) return
    lastRefreshKey = refreshKey

    const formValue = form?.values[name] as TransportDocumentLineItem[] | undefined
    if (formValue && formValue.length > 0) {
      setTimeout(() => {
        items = mapFromApi(form?.values[name] as TransportDocumentLineItem[])
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
      quantity: 1,
      itemAttr: selectedItem,
    })
  }

  function handleItemClear(index: number, updateItem: (index: number, updates: Partial<InternalLineItem>) => void) {
    updateItem(index, {
      item_id: '',
      item_snapshot: undefined,
      description: '',
      uom: UnitOfMeasures.Default,
      quantity: 0,
      unit_price: 0,
      itemAttr: undefined,
    })
  }

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

  function notifyFormUpdate() {
    const output = transformOutput(items.filter(isCompleteItem))
    onChange?.(output)
    if (form) {
      form.updateField(name, output as never)
      form.clearErrorsAtPrefix(`${name}.`)
    }
  }

  function handleItemsChange(completedItems: InternalLineItem[]) {
    const output = transformOutput(completedItems)
    onChange?.(output)
    form?.clearErrorsAtPrefix(`${name}.`)
  }

  /** Filter source records by sales_transaction_type / incoterm if the form already has them set. */
  function filterByCurrentDocument(records: SourceOrderRecord[]): SourceOrderRecord[] {
    return records.filter(r => {
      if (salesTransactionType && r.sales_transaction_type && r.sales_transaction_type !== salesTransactionType)
        return false
      if (incoterm && r.incoterm && r.incoterm !== incoterm) return false
      return true
    })
  }

  /**
   * Unified fetch: in parallel grab approved sales orders and warehouse orders
   * for the current customer, tag each with its origin, and return a merged list.
   */
  async function fetchAvailableSources(search?: string): Promise<SourceOrderRecord[]> {
    if (!legalEntityId || !customerId) return []
    const baseParams = {
      customer_id: customerId,
      ...(search ? { search } : {}),
    }
    const [salesOrdersResp, warehouseOrdersResp] = await Promise.all([
      apiRequest<{ data: Omit<SourceOrderRecord, 'source'>[] }>({
        url: `/legal-entities/${legalEntityId}/sales-orders`,
        method: 'GET',
        queryParams: { ...baseParams, state: 'approved' },
      }),
      apiRequest<{ data: Omit<SourceOrderRecord, 'source'>[] }>({
        url: `/legal-entities/${legalEntityId}/warehouse-orders`,
        method: 'GET',
        queryParams: baseParams,
      }),
    ])

    const sales: SourceOrderRecord[] = (salesOrdersResp.data ?? []).map(o => ({ ...o, source: 'sales-order' }))
    const warehouses: SourceOrderRecord[] = (warehouseOrdersResp.data ?? []).map(o => ({
      ...o,
      source: 'warehouse-order',
    }))

    return filterByCurrentDocument([...sales, ...warehouses])
  }

  function sourceLabel(record: SourceOrderRecord): string {
    return record.source === 'sales-order' ? m.import_source_sales_order() : m.import_source_warehouse_order()
  }

  function mapSourceToOption(record: SourceOrderRecord): BasicOption {
    return {
      label: `${record.document_number} · ${sourceLabel(record)}`,
      // Prefix the value with the source so SO+WO ids never collide
      value: `${record.source}:${record.id}`,
    }
  }

  function handleImport(records: SourceOrderRecord[]) {
    const existingSoIds = new SvelteSet(
      items.filter(i => i.sales_order_item_id).map(i => i.sales_order_item_id as string),
    )
    const existingWoIds = new SvelteSet(
      items.filter(i => i.warehouse_order_item_id).map(i => i.warehouse_order_item_id as string),
    )
    let skipped = 0
    const imported: InternalLineItem[] = []
    // One groupId per source record so each SO/WO gets its own color.
    for (const record of records) {
      const groupId = generateId()
      const productItems = (record.items ?? []).filter(it => (it.type ?? 'item') === 'item')
      for (const it of productItems) {
        const existingSet = record.source === 'sales-order' ? existingSoIds : existingWoIds
        if (existingSet.has(it.id)) {
          skipped++
          continue
        }
        existingSet.add(it.id)
        const qty = it.quantity ?? it.quantity_requested ?? 0
        const base: InternalLineItem = {
          item_id: it.item_id,
          item_snapshot: it.item_snapshot,
          description: it.description,
          quantity: qty,
          uom: it.uom,
          unit_price: it.unit_price ?? 0,
          vat_code_id: it.vat_code_id,
          vat_code_snapshot: it.vat_code_snapshot,
          weight_gross: 0,
          weight_net: 0,
          itemAttr: it.item_snapshot ? ({ id: it.item_id, ...it.item_snapshot } as Item) : undefined,
          vatCodeAttr:
            it.vat_code_snapshot && it.vat_code_id
              ? { ...(it.vat_code_snapshot as VatCodeSummary), id: it.vat_code_id }
              : (defaultVatCode ?? undefined),
          _groupId: groupId,
        }
        if (record.source === 'sales-order') base.sales_order_item_id = it.id
        else base.warehouse_order_item_id = it.id
        imported.push(base)
      }
    }
    if (skipped > 0) toast.info(m.import_skipped_duplicates({ count: skipped }))
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
  collapsible
  class={className}>
  {#snippet header({ options })}
    {#if !isDisabled}
      <div class="flex w-full items-center justify-end gap-2">
        {#if canImport}
          <ImportMenu
            fetchFunction={fetchAvailableSources}
            optionMappingFunction={mapSourceToOption}
            onimport={handleImport}
            label={m.import_from_orders()}>
            {#snippet previewSnippet(record)}
              {@const productItems = (record.items ?? []).filter(it => (it.type ?? 'item') === 'item')}
              <div class="space-y-2">
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold">{record.document_number}</p>
                    <Badge variant="outline" class="text-[10px] font-normal">{sourceLabel(record)}</Badge>
                  </div>
                  <p class="text-xs text-muted-foreground">{new Date(record.document_date).toLocaleDateString()}</p>
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
                        <span class="shrink-0 text-muted-foreground">x{item.quantity ?? item.quantity_requested}</span>
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
      <span class="truncate text-sm">
        {item.item_snapshot?.name || item.item_snapshot?.code || m.item()}
      </span>
      {#if item.quantity}
        <span class="text-xs text-muted-foreground">x{item.quantity}</span>
      {/if}
    </div>
  {/snippet}

  {#snippet collapsedItem({ item, index, groupColorClass })}
    <div class="flex w-full items-center gap-3 rounded border bg-muted/50 px-3 py-2 hover:bg-muted">
      <span class="font-semibold {groupColorClass ?? 'text-primary'}"
        ><span class="opacity-60">#</span>{index + 1}</span>
      <span class="truncate text-sm">
        {item.item_snapshot?.name || item.item_snapshot?.code || m.item()}
      </span>
      {#if item.quantity}
        <span class="text-xs text-muted-foreground">x{item.quantity}</span>
      {/if}
      {#if isLinkedItem(item)}
        <Badge variant="outline" class="text-[10px] font-normal">
          {item.sales_order_item_id ? m.import_source_sales_order() : m.import_source_warehouse_order()}
        </Badge>
      {/if}
    </div>
  {/snippet}

  {#snippet item({ item, index, updateItem })}
    {@const linked = isLinkedItem(item)}
    {@const linkedFromSO = !!item.sales_order_item_id}
    <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {#if linked}
        <div class="sm:col-span-2 lg:col-span-2">
          <span class="block text-sm leading-6 font-medium">{m.item()}</span>
          <div class="flex h-9 items-center gap-2 text-sm">
            <span class="max-w-64 truncate text-muted-foreground">
              {item.item_snapshot?.name ?? item.item_snapshot?.code ?? '-'}
            </span>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Badge variant="outline" class="text-[10px] font-normal">
                  {linkedFromSO ? m.import_source_sales_order() : m.import_source_warehouse_order()}
                </Badge>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {linkedFromSO ? m.linked_to_sales_order_item() : m.linked_to_warehouse_order_item()}
              </Tooltip.Content>
            </Tooltip.Root>
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

      <QuantityField
        name="{name}.{index}.quantity"
        label={m.quantity()}
        value={item.quantity ?? 0}
        uom={item.uom}
        error={getFieldError(index, 'quantity')}
        errorPosition="floating-bottom"
        disabled={(!linked && !item.item_id) || isDisabled}
        width="w-full"
        onChange={qty => updateItem(index, { quantity: qty })} />

      <div class="sm:col-span-2 lg:col-span-3">
        <TextField
          name="{name}.{index}.description"
          label={m.description()}
          value={item.description ?? ''}
          error={getFieldError(index, 'description')}
          errorPosition="floating-bottom"
          disabled={linked || !item.item_id || isDisabled}
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
        disabled={linked || !item.item_id || isDisabled}
        width="w-full"
        onChange={uom => updateItem(index, { uom: uom ?? undefined })} />

      <PriceField
        name="{name}.{index}.unit_price"
        label={m.unit_price()}
        value={item.unit_price ?? 0}
        {currency}
        error={getFieldError(index, 'unit_price')}
        errorPosition="floating-bottom"
        disabled={(!linked && !item.item_id) || isDisabled}
        width="w-full"
        onChange={price => updateItem(index, { unit_price: price })} />

      <VatCodeSelector
        name="{name}.{index}.vat_code_id"
        label={m.vat_code()}
        attr={item.vatCodeAttr || defaultVatCode}
        direction="vendita"
        width="w-full"
        contentWidth={FormFieldClass.SelectorContentDefaultWidth}
        readonly={(!linked && !item.item_id) || isDisabled}
        onChoose={vatCode => handleVatCodeSelect(index, vatCode, updateItem)}
        onClear={() => updateItem(index, { vat_code_id: '', vat_code_snapshot: undefined, vatCodeAttr: undefined })} />

      <NumberField
        name="{name}.{index}.weight_gross"
        label={m.weight_gross()}
        value={item.weight_gross ?? 0}
        error={getFieldError(index, 'weight_gross')}
        errorPosition="floating-bottom"
        disabled={(!linked && !item.item_id) || isDisabled}
        width="w-full"
        oninput={e => updateItem(index, { weight_gross: parseFloat(e.currentTarget.value) || 0 })} />

      <NumberField
        name="{name}.{index}.weight_net"
        label={m.weight_net()}
        value={item.weight_net ?? 0}
        error={getFieldError(index, 'weight_net')}
        errorPosition="floating-bottom"
        disabled={(!linked && !item.item_id) || isDisabled}
        width="w-full"
        oninput={e => updateItem(index, { weight_net: parseFloat(e.currentTarget.value) || 0 })} />
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
