<!--
  @component EditableListField
  @description Base component for editable list fields with card layout.
  Alternative to EditableTableField for cases where horizontal space is limited.
  Each item renders as a card with free-form layout via snippets.
  Provides add/remove management, form context autowiring, and debounced updates.
  @keywords editable, list, card, form, array, line-items
  @uses ActionButton
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import ActionButton from '$components/core/ActionButton.svelte'
  import Button from '$components/ui/button/button.svelte'
  import Label from '$components/ui/label/label.svelte'
  import * as m from '$lib/paraglide/messages'
  import { ArrowUp, Plus, X } from '@lucide/svelte'
  import type { Snippet } from 'svelte'
  import { EditableListFieldClass } from './form'
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
    /** Item snippet - receives item, index, and handlers */
    item: Snippet<
      [
        {
          item: T
          index: number
          updateItem: (index: number, updates: Partial<T>) => void
          removeItem: (index: number) => void
        },
      ]
    >
    /** Optional header snippet rendered between label and list (inside cleared form context) */
    header?: Snippet
    /** Optional custom add button snippet */
    addButton?: Snippet<[{ addItem: (options?: Partial<T>) => void; disabled: boolean }]>
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
    item: itemSnippet,
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
  function handleAdd(options?: Partial<T>) {
    if (items.length > 0 && items.some(item => !isCompleteItem(item))) {
      return
    }
    const newItem = options ? { ...createEmptyItem(), ...options } : createEmptyItem()
    items = [...items, newItem]
  }

  /**
   * Schedule a debounced form update
   */
  function scheduleFormUpdate() {
    if (updateTimer) clearTimeout(updateTimer)

    updateTimer = setTimeout(() => {
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
    {@render header()}
  {/if}

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
        })}
      </div>
    {/each}

    {#if items.length === 0 && empty}
      {@render empty()}
    {/if}

    {#if !isDisabled}
      {#if addButton}
        {@render addButton({ addItem: handleAdd, disabled: isDisabled })}
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

  {#if error}
    <div id="error-{id}" class="mt-1 flex items-center gap-1 text-xs font-semibold text-destructive">
      <ArrowUp class="size-3" />
      {error}
    </div>
  {/if}
</div>
