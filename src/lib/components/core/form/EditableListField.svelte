<!--
  @component EditableListField
  @description Base component for editable list fields with card layout.
  Alternative to EditableTableField for cases where horizontal space is limited.
  Each item renders as a card with free-form layout via snippets.
  Provides add/remove management, form context autowiring, debounced updates,
  and optional drag-and-drop reordering via svelte-dnd-action.
  @keywords editable, list, card, form, array, line-items, drag-and-drop
  @uses ActionButton
-->
<script lang="ts" module>
  export type ListFieldOptions = {
    /** Whether drag-and-drop reordering is currently active */
    dragAndDropActive: boolean
    /** Toggle drag-and-drop mode on/off */
    toggleDragAndDrop: () => void
  }
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import ActionButton from '$components/core/ActionButton.svelte'
  import Button from '$components/ui/button/button.svelte'
  import Label from '$components/ui/label/label.svelte'
  import * as m from '$lib/paraglide/messages'
  import { ArrowUp, Plus, X } from '@lucide/svelte'
  import type { Snippet } from 'svelte'
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action'
  import { flip } from 'svelte/animate'
  import { EditableListFieldClass } from './form'
  import { clearFormContext, getFormContextOptional } from './form-context'

  type DndItem = T & { _dndId: string }

  type Props = {
    /** Field name for form binding */
    name: string
    /** Label for the field */
    label?: string
    /** Show visible label */
    showLabel?: boolean
    /** HTML id (defaults to name) */
    id?: string
    /** Array of items to edit */
    items: T[]
    /** Function to create an empty item */
    createEmptyItem: () => T
    /** Function to check if an item is complete (valid for output) */
    isCompleteItem: (item: T) => boolean
    /** Transform items to form output format */
    transformOutput?: (items: T[]) => unknown[]
    /** Whether the field is disabled */
    disabled?: boolean
    /** External error message */
    error?: string
    /** Show required indicator (*) on label */
    required?: boolean
    /** Callback when items change */
    onItemsChange?: (items: T[]) => void
    /** Whether to sync items from form context (disable when parent manages initialization) */
    syncFromForm?: boolean
    /** Enable drag-and-drop reordering support */
    allowReorder?: boolean
    /** Item snippet - receives item, index, handlers, and options */
    item: Snippet<
      [
        {
          item: T
          index: number
          updateItem: (index: number, updates: Partial<T>) => void
          removeItem: (index: number) => void
          options: ListFieldOptions
        },
      ]
    >
    /** Optional snippet for simplified item rendering during drag-and-drop */
    dragItem?: Snippet<[{ item: T; index: number }]>
    /** Optional header snippet rendered between label and list (inside cleared form context) */
    header?: Snippet<[{ options: ListFieldOptions }]>
    /** Optional custom add button snippet */
    addButton?: Snippet<[{ addItem: (options?: Partial<T>) => void; disabled: boolean; options: ListFieldOptions }]>
    /** Optional custom remove button snippet */
    removeButton?: Snippet<[{ removeItem: () => void; index: number; disabled: boolean }]>
    /** Optional empty state snippet */
    empty?: Snippet
    /** Additional CSS classes */
    class?: string
    /** CSS class applied to each card */
    itemClass?: string
  }

  let {
    name,
    label = '',
    showLabel = true,
    id = name,
    items = $bindable<T[]>([]),
    createEmptyItem,
    isCompleteItem,
    transformOutput,
    disabled = false,
    error: errorProp = undefined,
    required = false,
    onItemsChange,
    syncFromForm = true,
    allowReorder = false,
    item: itemSnippet,
    dragItem,
    header,
    addButton,
    removeButton,
    empty,
    class: className = '',
    itemClass = '',
  }: Props = $props()

  // Autowire to form context (for this component only)
  const form = getFormContextOptional()

  // Clear context for children - they should not autowire to the parent form
  clearFormContext()

  // Derived state
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))

  // Drag-and-drop state
  let dragAndDropActive = $state(false)
  const FLIP_DURATION_MS = 200

  overrideItemIdKeyNameBeforeInitialisingDndZones('_dndId')

  let dndIdCounter = 0

  function buildDndItems(): DndItem[] {
    return items.map(item => ({
      ...item,
      _dndId: `dnd-${++dndIdCounter}`,
    }))
  }

  function toggleDragAndDrop() {
    if (!dragAndDropActive) {
      // Entering d&d: snapshot items once
      dndItems = buildDndItems()
    } else {
      // Exiting d&d: apply final order to items and flush immediately
      // (must flush before setting dragAndDropActive=false to prevent
      // re-mounted form fields from overwriting the reordered state)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      items = dndItems.map(({ _dndId, ...rest }) => rest as unknown as T)
      flushFormUpdate()
    }
    dragAndDropActive = !dragAndDropActive
  }

  const options: ListFieldOptions = {
    get dragAndDropActive() {
      return dragAndDropActive
    },
    toggleDragAndDrop,
  }

  // DnD items: managed exclusively by consider/finalize during d&d
  let dndItems = $state<DndItem[]>([])

  function handleDndConsider(e: CustomEvent<{ items: DndItem[] }>) {
    dndItems = e.detail.items
  }

  function handleDndFinalize(e: CustomEvent<{ items: DndItem[] }>) {
    dndItems = e.detail.items
  }

  // Debounce timer for form updates
  let updateTimer: ReturnType<typeof setTimeout> | null = null
  const DEBOUNCE_MS = 300

  /**
   * Update a single item at index
   */
  function handleUpdate(index: number, updates: Partial<T>) {
    if (index < 0 || index >= items.length) return
    items[index] = { ...items[index], ...updates }
    scheduleFormUpdate()
  }

  /**
   * Remove an item at index
   */
  function handleRemove(index: number) {
    if (index < 0 || index >= items.length) return
    items = items.filter((_, i) => i !== index)
    scheduleFormUpdate()
  }

  /**
   * Add a new empty item — only if all existing items are complete
   */
  function handleAdd(addOptions?: Partial<T>) {
    if (items.length > 0 && items.some(item => !isCompleteItem(item))) {
      return
    }
    const newItem = addOptions ? { ...createEmptyItem(), ...addOptions } : createEmptyItem()
    items = [...items, newItem]
  }

  /**
   * Flush the current items to the form context immediately
   */
  function flushFormUpdate() {
    if (updateTimer) clearTimeout(updateTimer)
    commitToForm()
  }

  /**
   * Write current items to form context and notify consumers
   */
  function commitToForm() {
    const completedItems = items.filter(isCompleteItem)
    const output = transformOutput ? transformOutput(completedItems) : completedItems

    onItemsChange?.(completedItems)

    if (form) {
      // Update lastSyncedJson BEFORE writing to the form so the
      // sync-from-form $effect recognises this as a self-write and skips it.
      lastSyncedJson = JSON.stringify(output)
      form.updateField(name, output)

      if (error) form.validateField(name)
    }
  }

  /**
   * Schedule a debounced form update
   */
  function scheduleFormUpdate() {
    if (updateTimer) clearTimeout(updateTimer)

    updateTimer = setTimeout(() => {
      commitToForm()
    }, DEBOUNCE_MS)
  }

  // Track last synced value to prevent infinite loops
  let lastSyncedJson = $state('')

  // Sync items from form context when values change
  $effect(() => {
    if (!syncFromForm || !form) return

    const formValue = form.values[name] as T[] | undefined
    const formValueJson = JSON.stringify(formValue || [])

    // Only sync if the form value has actually changed since last sync
    if (formValueJson !== lastSyncedJson && formValue && formValue.length > 0) {
      lastSyncedJson = formValueJson
      items = [...(formValue as T[])]
    }
  })

  // Initialize with one empty row if items are empty (runs once on mount)
  $effect.pre(() => {
    if (items.length === 0) {
      items = [createEmptyItem()]
    }
  })
</script>

<div class="w-full {className}">
  <Label for={name} id="label-{id}" class="mb-1.5 block {showLabel ? '' : 'sr-only'}">
    {label}{#if required}<span class="text-destructive"> *</span>{/if}
  </Label>

  {#if header}
    {@render header({ options })}
  {/if}

  {#if dragAndDropActive && allowReorder}
    <!-- Drag-and-drop reorder mode -->
    <div
      class="{EditableListFieldClass.List} w-full"
      use:dndzone={{ items: dndItems, flipDurationMs: FLIP_DURATION_MS, type: name, dropTargetStyle: {} }}
      onconsider={handleDndConsider}
      onfinalize={handleDndFinalize}>
      {#each dndItems as dndItem, index (dndItem._dndId)}
        <div class={itemClass} animate:flip={{ duration: FLIP_DURATION_MS }}>
          {#if dragItem}
            {@render dragItem({ item: dndItem, index })}
          {:else}
            <div class="flex cursor-grab items-center gap-2 text-sm">
              <span class="font-semibold text-primary"><span class="opacity-60">#</span>{index + 1}</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <!-- Normal edit mode -->
    <div class={EditableListFieldClass.List}>
      {#each items as currentItem, index (index)}
        <div class="border-b pb-8 {itemClass} relative pr-6">
          {#if !isDisabled}
            {#if removeButton}
              {@render removeButton({
                removeItem: () => handleRemove(index),
                index,
                disabled: isDisabled,
              })}
            {:else}
              <ActionButton
                variant="ghost"
                size="icon"
                class="{EditableListFieldClass.RemoveButton} h-8 w-8 text-muted-foreground hover:text-destructive"
                tooltip={m.remove_table_resource_line()}
                disabled={isDisabled}
                onclick={() => handleRemove(index)}>
                <X class="size-4" />
              </ActionButton>
            {/if}
          {/if}

          {@render itemSnippet({
            item: currentItem,
            index,
            updateItem: handleUpdate,
            removeItem: handleRemove,
            options,
          })}
        </div>
      {/each}

      {#if items.length === 0 && empty}
        {@render empty()}
      {/if}

      {#if !isDisabled}
        {#if addButton}
          {@render addButton({ addItem: handleAdd, disabled: isDisabled, options })}
        {:else}
          <Button
            variant="outline"
            size="sm"
            class={EditableListFieldClass.AddButton}
            disabled={isDisabled}
            onclick={() => handleAdd()}>
            <Plus class="mr-1 size-4" />
            {m.add_line()}
          </Button>
        {/if}
      {/if}
    </div>
  {/if}

  {#if error}
    <div id="error-{id}" class="mt-1 flex items-center gap-1 text-xs font-semibold text-destructive">
      <ArrowUp class="size-3" />
      {error}
    </div>
  {/if}
</div>
