<!--
  @component TransportDocumentItemsListEditor
  @description Card-based editor for transport document line items with pricing/VAT/weights.
  Each item is either linked to a sales order item, a warehouse order item, or a free entry.
  The import-from-orders flow lives at the form level (TransportDocumentDetails) which
  exposes two separate ImportMenu (SO and WO); this component exposes `addItems` /
  `getItems` for those flows to drive imports.
  @keywords transport-document, ddt, items, editor, line-items
  @uses EditableListField, ItemSelector, VatCodeSelector
-->
<script lang="ts" module>
  export type TransportDocumentLineItem = {
    /** Line type: `item` carries quantity/UOM/pricing, `descriptive` is a free-text annotation. */
    type: 'item' | 'descriptive'
    /** Persisted UUID — present only on existing items */
    id?: string
    /** Linked sales order item UUID — on `item` lines drives derivation; on `descriptive` it is an FK to a source SO line for chain traceability. */
    sales_order_item_id?: string
    /** Linked warehouse order item UUID — alternative origin to sales_order_item_id */
    warehouse_order_item_id?: string
    /** Item UUID — required for `item` lines when no link is present */
    item_id?: string
    /** Cached item snapshot for display */
    item_snapshot?: Record<string, unknown>
    /** Description — required for both `item` (when not linked) and `descriptive` lines */
    description?: string
    /** Transported quantity. Required on `item` lines, omitted on `descriptive`. */
    quantity?: number
    /** Unit of measure (`item` lines only when not linked) */
    uom?: string
    /** Unit price (`item` lines only) */
    unit_price?: number
    /** Net value (computed server-side, `item` lines only) */
    net_value?: number
    /** VAT code id (`item` lines only) */
    vat_code_id?: string
    /** VAT code snapshot (`item` lines only) */
    vat_code_snapshot?: Record<string, unknown>
    /** Per-line gross weight (`item` lines only) */
    weight_gross?: number
    /** Per-line net weight (`item` lines only) */
    weight_net?: number
  }
</script>

<script lang="ts">
  import EditableListField from '$components/core/form/EditableListField.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import PriceField from '$components/core/form/PriceField.svelte'
  import QuantityField from '$components/core/form/QuantityField.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
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
  import { generateId } from '$lib/utils/id'
  import { DEFAULT_CURRENCY_CODE, renderPrice } from '$utils/prices'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Plus from '@lucide/svelte/icons/plus'

  type InternalLineItem = TransportDocumentLineItem & {
    /** Cached item entity for the selector */
    itemAttr?: Item
    /** Cached VAT code entity for the selector */
    vatCodeAttr?: VatCodeSummary
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
      type: 'item',
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
    if (item.type === 'descriptive') {
      return !!item.description
    }
    const qty = item.quantity ?? 0
    if (isLinkedItem(item)) {
      return qty > 0
    }
    return !!item.item_id && !!item.uom && !!item.description && qty > 0
  }

  function transformOutput(internalItems: InternalLineItem[]): TransportDocumentLineItem[] {
    return internalItems.map(item => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { itemAttr, vatCodeAttr, _groupId, ...rest } = item
      if (rest.type === 'descriptive') {
        return {
          type: 'descriptive',
          description: rest.description ?? '',
          ...(rest.id ? { id: rest.id } : {}),
          ...(rest.sales_order_item_id ? { sales_order_item_id: rest.sales_order_item_id } : {}),
          ...(rest.warehouse_order_item_id ? { warehouse_order_item_id: rest.warehouse_order_item_id } : {}),
        }
      }
      // Strip null/empty link ids so the API only receives the relevant origin
      if (rest.sales_order_item_id) {
        return {
          type: 'item',
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
          type: 'item',
          warehouse_order_item_id: rest.warehouse_order_item_id,
          quantity: rest.quantity,
          unit_price: rest.unit_price,
          vat_code_id: rest.vat_code_id,
          weight_gross: rest.weight_gross,
          weight_net: rest.weight_net,
          ...(rest.id ? { id: rest.id } : {}),
        }
      }
      return { ...rest, type: 'item' }
    })
  }

  function mapFromApi(apiItems: TransportDocumentLineItem[]): InternalLineItem[] {
    return apiItems.map(item => {
      const itemSnapshot = item.item_snapshot as Record<string, unknown> | undefined
      const vatSnapshot = item.vat_code_snapshot as Record<string, unknown> | undefined
      return {
        ...item,
        type: item.type ?? 'item',
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
   * Drives the import-from-orders flow that lives in TransportDocumentDetails.
   */
  export function addItems(newItems: TransportDocumentLineItem[], options?: { groupId?: string }) {
    editorRef?.addItems(mapFromApi(newItems), {
      groupId: options?.groupId ?? generateId(),
    })
  }

  /**
   * Returns the current line items in API shape — used by TransportDocumentDetails
   * to dedupe imports against rows already in the editor.
   */
  export function getItems(): TransportDocumentLineItem[] {
    return (editorRef?.getItems() ?? []) as TransportDocumentLineItem[]
  }
</script>

<!-- Compact-row label for item lines: the (editable) description wins over the
     catalog name, and the catalog code is surfaced as a leading chip. -->
{#snippet itemLabel(item: InternalLineItem)}
  {#if item.item_snapshot?.code}
    <span class="shrink-0 rounded bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
      {item.item_snapshot.code}
    </span>
  {/if}
  <span class="min-w-0 flex-1 truncate text-sm">
    {item.description || item.item_snapshot?.name || item.item_snapshot?.code || m.item()}
  </span>
{/snippet}

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
      {#if item.type === 'descriptive'}
        <span class="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {item.description || m.description()}
        </span>
      {:else}
        {@render itemLabel(item)}
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
      {:else}
        {@render itemLabel(item)}
        {#if isLinkedItem(item)}
          <Badge variant="outline" class="shrink-0 text-[10px] font-normal">
            {item.sales_order_item_id ? m.import_source_sales_order() : m.import_source_warehouse_order()}
          </Badge>
        {/if}
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
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet item({ item, index, updateItem })}
    {#if item.type === 'descriptive'}
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
    {:else}
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
        disabled
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
    {/if}
  {/snippet}

  {#snippet addButton({ addItem, disabled: addDisabled, options: opts })}
    {#if !opts.dragAndDropActive}
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
</EditableListField>
