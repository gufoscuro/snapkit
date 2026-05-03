<!--
  @component EditableListField
  @description Base component for editable list fields with card layout.
  Alternative to EditableTableField for cases where horizontal space is limited.
  Each item renders as a card with free-form layout via snippets.
  Provides add/remove management, form context autowiring, debounced updates,
  and optional drag-and-drop reordering via svelte-dnd-action.
  Optional collapsible mode renders items in a synthetic view by default and
  expands them on click; incomplete items and items with validation errors are
  always shown expanded.
  @keywords editable, list, card, form, array, line-items, drag-and-drop, collapsible
  @uses ActionButton
-->
<script lang="ts" module>
  export type ListFieldOptions = {
    /** Whether drag-and-drop reordering is currently active */
    dragAndDropActive: boolean
    /** Toggle drag-and-drop mode on/off */
    toggleDragAndDrop: () => void
  }

  /**
   * Palette used to color-code groups of items (see the `_groupId` UI-only field).
   * Listed verbatim so Tailwind's JIT picks up every class.
   */
  const GROUP_COLORS: Array<{ text: string; border: string }> = [
    { text: 'text-blue-500', border: 'border-l-blue-500' },
    { text: 'text-emerald-500', border: 'border-l-emerald-500' },
    { text: 'text-amber-500', border: 'border-l-amber-500' },
    { text: 'text-rose-500', border: 'border-l-rose-500' },
    { text: 'text-violet-500', border: 'border-l-violet-500' },
    { text: 'text-cyan-500', border: 'border-l-cyan-500' },
    { text: 'text-orange-500', border: 'border-l-orange-500' },
    { text: 'text-pink-500', border: 'border-l-pink-500' },
  ]
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import ActionButton from '$components/core/ActionButton.svelte'
  import Button from '$components/ui/button/button.svelte'
  import Label from '$components/ui/label/label.svelte'
  import * as m from '$lib/paraglide/messages'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ChevronUp from '@lucide/svelte/icons/chevron-up'
  import Plus from '@lucide/svelte/icons/plus'
  import X from '@lucide/svelte/icons/x'
  import type { Snippet } from 'svelte'
  import { dndzone } from 'svelte-dnd-action'
  import { flip } from 'svelte/animate'
  import { SvelteSet } from 'svelte/reactivity'
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
    /**
     * Render items collapsed by default; click a row to expand it for editing.
     * Incomplete items and items with validation errors are always shown expanded.
     * Newly added items via the add button are auto-expanded; items added externally
     * (e.g. via parent-managed `items` mutation) start collapsed.
     */
    collapsible?: boolean
    /** Item snippet - receives item, index, handlers, and options */
    item: Snippet<
      [
        {
          item: T
          index: number
          updateItem: (index: number, updates: Partial<T>) => void
          removeItem: (index: number) => void
          toggleExpanded: () => void
          /** When the item carries a `_groupId`, the corresponding text color class (e.g. `text-blue-500`); otherwise undefined. */
          groupColorClass: string | undefined
          options: ListFieldOptions
        },
      ]
    >
    /** Optional snippet for simplified item rendering during drag-and-drop */
    dragItem?: Snippet<[{ item: T; index: number }]>
    /**
     * Snippet rendered when an item is collapsed (only when `collapsible`).
     * Wrapped in a clickable container that toggles expansion; consumers should
     * not set their own cursor in the snippet. `toggleExpanded` is provided for
     * custom triggers nested inside the snippet.
     */
    collapsedItem?: Snippet<
      [{ item: T; index: number; toggleExpanded: () => void; groupColorClass: string | undefined }]
    >
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
    collapsible = false,
    item: itemSnippet,
    dragItem,
    collapsedItem,
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

  // Collapsible state — tracks indices the user has explicitly expanded.
  // The "expanded" predicate also OR-folds in incomplete items and items with
  // validation errors (computed from `errorIndices` below) so the user always
  // sees what needs attention.
  const expandedIndices = new SvelteSet<number>()

  // Indices that have a server-side validation error keyed under
  // `${name}.${index}.${field}`. Recomputed when the form errors object changes.
  const errorIndices = $derived.by(() => {
    const result = new SvelteSet<number>()
    if (!form) return result
    const prefix = `${name}.`
    for (const key of Object.keys(form.errors)) {
      if (!key.startsWith(prefix)) continue
      const tail = key.slice(prefix.length)
      const dot = tail.indexOf('.')
      const idxStr = dot === -1 ? tail : tail.slice(0, dot)
      const idx = parseInt(idxStr, 10)
      if (!Number.isNaN(idx)) result.add(idx)
    }
    return result
  })

  function isItemExpanded(index: number, currentItem: T): boolean {
    if (!collapsible) return true
    if (expandedIndices.has(index)) return true
    if (errorIndices.has(index)) return true
    if (!isCompleteItem(currentItem)) return true
    return false
  }

  function toggleExpanded(index: number) {
    if (expandedIndices.has(index)) expandedIndices.delete(index)
    else expandedIndices.add(index)
  }

  // Group color assignment — items carrying `_groupId` (UI-only field set by
  // import handlers) are color-coded so the user can see at a glance which
  // rows came in together. First-seen groupId gets the first palette entry.
  const groupColorMap = new Map<string, number>()

  function getGroupColors(currentItem: T): { text: string; border: string } | undefined {
    const raw = (currentItem as Record<string, unknown>)._groupId
    if (typeof raw !== 'string' || !raw) return undefined
    let idx = groupColorMap.get(raw)
    if (idx === undefined) {
      idx = groupColorMap.size % GROUP_COLORS.length
      groupColorMap.set(raw, idx)
    }
    return GROUP_COLORS[idx]
  }

  /** Strip the UI-only `_groupId` field before items leave the component. */
  function stripGroupId(item: T): T {
    if (!(item as Record<string, unknown>)._groupId) return item
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _groupId, ...rest } = item as T & { _groupId?: string }
    return rest as T
  }

  // Drop user-expanded indices that are no longer valid (items removed externally
  // or replaced via parent-managed mutations).
  $effect(() => {
    const len = items.length
    for (const i of [...expandedIndices]) {
      if (i >= len) expandedIndices.delete(i)
    }
  })

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
      // Indices have been reordered — drop user-expand state to avoid stale mappings.
      expandedIndices.clear()
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
    // Shift expanded indices to track the removal
    const oldIndices = [...expandedIndices]
    expandedIndices.clear()
    for (const i of oldIndices) {
      if (i < index) expandedIndices.add(i)
      else if (i > index) expandedIndices.add(i - 1)
    }
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
    if (collapsible) expandedIndices.add(items.length - 1)
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
    const completedItems = items.filter(isCompleteItem).map(stripGroupId)
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
        {@const expanded = isItemExpanded(index, currentItem)}
        {@const showCollapseAction =
          collapsible && expanded && expandedIndices.has(index) && isCompleteItem(currentItem)}
        {@const groupColors = getGroupColors(currentItem)}
        {@const headerMode = collapsible && expanded}
        <div class="{expanded ? 'border-b pb-8' : ''} {itemClass} relative">
          {#if !isDisabled && !headerMode}
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
                class="{EditableListFieldClass.RemoveButton} z-10 h-8 w-8 text-muted-foreground hover:text-destructive"
                tooltip={m.remove_table_resource_line()}
                disabled={isDisabled}
                onclick={() => handleRemove(index)}>
                <X class="size-4" />
              </ActionButton>
            {/if}
          {/if}

          {#if expanded}
            <div onfocusin={collapsible ? () => expandedIndices.add(index) : undefined}>
              {#if headerMode}
                <div class="mb-3 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold {groupColors?.text ?? 'text-primary'}"
                      ><span class="opacity-60">#</span>{index + 1}</span>
                    {#if showCollapseAction}
                      <Button variant="ghost" size="sm" onclick={() => toggleExpanded(index)}>
                        <ChevronUp class="mr-1 size-4" />
                        {m.collapse_item()}
                      </Button>
                    {/if}
                  </div>
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
                        class="h-8 w-8 text-muted-foreground hover:text-destructive"
                        tooltip={m.remove_table_resource_line()}
                        disabled={isDisabled}
                        onclick={() => handleRemove(index)}>
                        <X class="size-4" />
                      </ActionButton>
                    {/if}
                  {/if}
                </div>
              {/if}
              {@render itemSnippet({
                item: currentItem,
                index,
                updateItem: handleUpdate,
                removeItem: handleRemove,
                toggleExpanded: () => toggleExpanded(index),
                groupColorClass: groupColors?.text,
                options,
              })}
            </div>
          {:else}
            <div
              role="button"
              tabindex="0"
              class="cursor-pointer"
              onclick={() => toggleExpanded(index)}
              onkeydown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleExpanded(index)
                }
              }}>
              {#if collapsedItem}
                {@render collapsedItem({
                  item: currentItem,
                  index,
                  toggleExpanded: () => toggleExpanded(index),
                  groupColorClass: groupColors?.text,
                })}
              {:else if dragItem}
                {@render dragItem({ item: currentItem, index })}
              {:else}
                <div class="flex items-center gap-2 text-sm">
                  <span class="font-semibold text-primary"><span class="opacity-60">#</span>{index + 1}</span>
                </div>
              {/if}
            </div>
          {/if}
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
