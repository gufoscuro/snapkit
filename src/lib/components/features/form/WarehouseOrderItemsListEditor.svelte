<!--
  @component WarehouseOrderItemsListEditor
  @description Card-based editor for warehouse order line items.
  Each item is either linked to a sales order item (description/UoM/item_id are
  derived server-side from the snapshot) or a free entry. Pricing/VAT are not
  part of the warehouse order item model.
  The import-from-sales-orders flow lives at the form level (WarehouseOrderDetails);
  this component exposes `addItems` / `getItems` for that flow to drive imports.
  @keywords warehouse-order, items, editor, line-items, picking
  @uses EditableListField, ItemSelector
-->
<script lang="ts" module>
  export type WarehouseOrderLineItem = {
    /** Line type: `item` carries quantity/UOM, `descriptive` is a free-text annotation. */
    type: 'item' | 'descriptive'
    /** Persisted UUID — present only on existing items */
    id?: string
    /** Linked sales order item UUID — when set on an `item` line, item_id/description/uom
     * are derived server-side. On a `descriptive` line it is an FK back to a source SO line
     * for chain traceability. */
    sales_order_item_id?: string
    /** Item UUID — required for `item` lines when sales_order_item_id is not provided */
    item_id?: string
    /** Cached item snapshot for display */
    item_snapshot?: Record<string, unknown>
    /** Description — required for both `item` (when not linked) and `descriptive` lines */
    description?: string
    /** Requested quantity. Required on `item` lines, omitted on `descriptive`. */
    quantity_requested?: number
    /** Picked quantity — read-only here, mutated via the pick-items endpoint */
    quantity_picked?: number
    /** Unit of measure (`item` lines only when not linked) */
    uom?: string
  }
</script>

<script lang="ts">
  import EditableListField from '$components/core/form/EditableListField.svelte'
  import NumberField from '$components/core/form/NumberField.svelte'
  import RichEditorField from '$components/core/form/RichEditorField.svelte'
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
  import { generateId } from '$lib/utils/id'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Plus from '@lucide/svelte/icons/plus'

  type InternalLineItem = WarehouseOrderLineItem & {
    /** Cached item entity for the selector */
    itemAttr?: Item
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
      item_id: '',
      description: '',
      quantity_requested: 0,
      quantity_picked: 0,
      uom: UnitOfMeasures.Default,
      itemAttr: undefined,
    }
  }

  function isCompleteItem(item: InternalLineItem): boolean {
    if (item.type === 'descriptive') {
      return !!item.description
    }
    const qty = item.quantity_requested ?? 0
    if (item.sales_order_item_id) {
      return qty > 0
    }
    return !!item.item_id && !!item.uom && !!item.description && qty > 0
  }

  function transformOutput(internalItems: InternalLineItem[]): WarehouseOrderLineItem[] {
    return internalItems.map(item => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { itemAttr, _groupId, quantity_picked, ...rest } = item
      if (rest.type === 'descriptive') {
        return {
          type: 'descriptive',
          description: rest.description ?? '',
          ...(rest.id ? { id: rest.id } : {}),
          ...(rest.sales_order_item_id ? { sales_order_item_id: rest.sales_order_item_id } : {}),
        }
      }
      if (rest.sales_order_item_id) {
        return {
          type: 'item',
          sales_order_item_id: rest.sales_order_item_id,
          quantity_requested: rest.quantity_requested,
          ...(rest.id ? { id: rest.id } : {}),
        }
      }
      return { ...rest, type: 'item' }
    })
  }

  function mapFromApi(apiItems: WarehouseOrderLineItem[]): InternalLineItem[] {
    return apiItems.map(item => {
      const snapshot = item.item_snapshot as Record<string, unknown> | undefined
      return {
        ...item,
        type: item.type ?? 'item',
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
   * Drives the import-from-sales-orders flow that lives in WarehouseOrderDetails.
   */
  export function addItems(newItems: WarehouseOrderLineItem[], options?: { groupId?: string }) {
    editorRef?.addItems(mapFromApi(newItems), {
      groupId: options?.groupId ?? generateId(),
    })
  }

  /**
   * Returns the current line items in API shape — used by WarehouseOrderDetails
   * to dedupe imports against rows already in the editor.
   */
  export function getItems(): WarehouseOrderLineItem[] {
    return (editorRef?.getItems() ?? []) as WarehouseOrderLineItem[]
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
        <span class="min-w-0 flex-1 truncate text-sm">
          {item.item_snapshot?.name || item.item_snapshot?.code || m.item()}
        </span>
        {#if item.quantity_requested}
          <span class="shrink-0 text-xs whitespace-nowrap">{item.quantity_requested} {item.uom}</span>
        {/if}
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
        <span class="min-w-0 flex-1 truncate text-sm">
          {item.item_snapshot?.name || item.item_snapshot?.code || m.item()}
        </span>
        {#if item.quantity_requested}
          <span class="shrink-0 text-xs whitespace-nowrap">{item.quantity_requested} {item.uom}</span>
        {/if}
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
      {@const isLinked = !!item.sales_order_item_id}
      <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
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
