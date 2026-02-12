<!--
  @component EditableTableField
  @description Base component for editable table fields with add/remove row pattern.
  Provides structure for multi-line editors (e.g., order line items).
  Uses snippets for header and row customization.
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import Label from '$components/ui/label/label.svelte'
  import * as Table from '$components/ui/table'
  import { ArrowUp } from '@lucide/svelte'
  import type { Snippet } from 'svelte'
  import { EditableTableFieldClass } from './form'
  import { clearFormContext, getFormContextOptional } from './form-context'

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
    /** Function to check if an item is empty */
    isEmptyItem: (item: T) => boolean
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
    /** Minimum table width for horizontal scroll (e.g., '800px') */
    minWidth?: string
    /** Callback when items change */
    onItemsChange?: (items: T[]) => void
    /** Header snippet */
    header: Snippet
    /** Row snippet - receives item, index, and handlers */
    row: Snippet<
      [
        {
          item: T
          index: number
          updateItem: (index: number, updates: Partial<T>) => void
          onFocus: () => void
          onBlur: () => void
        },
      ]
    >
    /** Additional CSS classes */
    class?: string
  }

  let {
    name,
    label = '',
    showLabel = true,
    id = name,
    items = $bindable<T[]>([]),
    createEmptyItem,
    isEmptyItem,
    isCompleteItem,
    transformOutput,
    disabled = false,
    error: errorProp = undefined,
    required = false,
    minWidth = '600px',
    onItemsChange,
    header,
    row,
    class: className = '',
  }: Props = $props()

  // Autowire to form context (for this component only)
  const form = getFormContextOptional()

  // Clear context for children - they should not autowire to the parent form
  // The EditableTableField manages its own internal state and communicates
  // with the parent form via transformOutput
  clearFormContext()

  // Derived state
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))

  // Debounce timer for form updates
  let updateTimer: ReturnType<typeof setTimeout> | null = null
  const DEBOUNCE_MS = 300

  /**
   * Get completed items for output
   */
  function getCompletedItems(): T[] {
    return items.filter(isCompleteItem)
  }

  /**
   * Get empty items
   */
  function getEmptyItems(): T[] {
    return items.filter(isEmptyItem)
  }

  /**
   * Ensure there's always one empty row at the end when editing
   */
  function ensureEmptyRow() {
    if (isDisabled) return

    const emptyItems = getEmptyItems()
    if (emptyItems.length < 1) {
      items = [...items, createEmptyItem()]
    }
  }

  /**
   * Remove extra empty rows (keep only one)
   */
  function trimEmptyRows() {
    const emptyItems = getEmptyItems()
    if (emptyItems.length > 1) {
      // Remove last item if it's empty and there are multiple empty rows
      const lastItem = items[items.length - 1]
      if (isEmptyItem(lastItem)) {
        items = items.slice(0, -1)
      }
    }
  }

  /**
   * Update a single item at index
   */
  function updateItem(index: number, updates: Partial<T>) {
    if (index < 0 || index >= items.length) return

    items[index] = { ...items[index], ...updates }
    scheduleFormUpdate()
  }

  /**
   * Handle focus on any field - ensure empty row exists
   */
  function handleFocus() {
    ensureEmptyRow()
  }

  /**
   * Handle blur on any field - trim extra empty rows
   */
  function handleBlur() {
    trimEmptyRows()
  }

  /**
   * Schedule a debounced form update
   */
  function scheduleFormUpdate() {
    if (updateTimer) clearTimeout(updateTimer)

    updateTimer = setTimeout(() => {
      const completedItems = getCompletedItems()
      const output = transformOutput ? transformOutput(completedItems) : completedItems

      onItemsChange?.(completedItems)

      if (form) {
        form.updateField(name, output)
        if (error) form.validateField(name)
      }
    }, DEBOUNCE_MS)
  }

  // Track last synced value to prevent infinite loops
  let lastSyncedJson = $state('')

  // Sync items from form context when values change
  $effect(() => {
    if (!form) return

    const formValue = form.values[name] as T[] | undefined
    const formValueJson = JSON.stringify(formValue || [])

    // Only sync if the form value has actually changed since last sync
    if (formValueJson !== lastSyncedJson && formValue && formValue.length > 0) {
      lastSyncedJson = formValueJson
      items = [...(formValue as T[]), createEmptyItem()]
    }
  })

  // Initialize with empty row if needed (runs once on mount)
  $effect.pre(() => {
    if (items.length === 0) {
      items = [createEmptyItem()]
    }
  })

  // Auto-manage empty rows: add when needed, remove extras
  $effect(() => {
    if (isDisabled) return

    // Check if there are any empty rows
    const emptyItems = getEmptyItems()

    // If no empty rows exist and we have at least one item, add a new empty row
    if (emptyItems.length === 0 && items.length > 0) {
      items = [...items, createEmptyItem()]
    }
    // If there are multiple empty rows, keep only the last one
    else if (emptyItems.length > 1) {
      // Find indices of empty items
      const emptyIndices = items.map((item, idx) => (isEmptyItem(item) ? idx : -1)).filter((idx) => idx !== -1)

      // Keep all non-empty items and only the last empty item
      const lastEmptyIndex = emptyIndices[emptyIndices.length - 1]
      items = items.filter((item, idx) => !isEmptyItem(item) || idx === lastEmptyIndex)
    }
  })
</script>

<div class="w-full {className}">
  <Label for={name} id="label-{id}" class="mb-1.5 block {showLabel ? '' : 'sr-only'}">
    {label}{#if required}<span class="text-destructive"> *</span>{/if}
  </Label>

  <div class="w-full overflow-x-auto">
    <Table.Root class="min-w-[{minWidth}]">
      <Table.Header>
        <Table.Row class={EditableTableFieldClass.TableHeadCell}>
          {@render header()}
        </Table.Row>
      </Table.Header>
      <Table.Body class={EditableTableFieldClass.Body}>
        {#each items as item, index (index)}
          <Table.Row class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent">
            {@render row({
              item,
              index,
              updateItem,
              onFocus: handleFocus,
              onBlur: handleBlur,
            })}
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  {#if error}
    <div id="error-{id}" class="mt-1 flex items-center gap-1 text-xs font-semibold text-destructive">
      <ArrowUp class="size-3" />
      {error}
    </div>
  {/if}
</div>
