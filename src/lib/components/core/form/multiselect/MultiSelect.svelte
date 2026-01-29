<script lang="ts" module>
  import type { MinimalFilterQuery } from '$utils/filters'
  import type { ExtendedOption } from '$utils/generics'

  export type MultiselectFetchFunction = (
    query: Partial<MinimalFilterQuery>
  ) => Promise<Array<ExtendedOption>>
</script>

<script lang="ts">
  import { browser } from '$app/environment'
  import DefaultMultiRenderer from './DefaultMultiRenderer.svelte'
  import DefaultSingleRenderer from './DefaultSingleRenderer.svelte'
  import { Button } from '$components/ui/button'
  import * as Command from '$components/ui/command'
  import * as Popover from '$components/ui/popover/'
  import { IconSize } from '$components/ui/sizes'
  import { cn } from '$components/ui/utils'
  import { joinClassnames } from '$utils/classnames'
  import { createQueryRequestObject } from '$utils/filters'
  import { getUserMessagingClasses } from '$utils/form'
  import { Plus, X } from 'lucide-svelte'
  import Check from 'lucide-svelte/icons/check'
  import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
  import { tick, untrack } from 'svelte'
  import type { Component } from 'svelte'

  type Props = {
    options?: Array<ExtendedOption>
    placeholder?: string
    multiselection?: boolean
    multiselectionColored?: boolean
    allowCreate?: boolean
    allowClear?: boolean
    allowNewRecord?: boolean
    value?: Array<ExtendedOption>
    triggerAutoWidth?: boolean
    width?: string
    contentWidth?: string
    align?: 'start' | 'end' | 'center'
    addItemText?: string
    addItemInvalidText?: string
    emptyText?: string
    newRecordText?: string
    shouldFilter?: boolean
    disabled?: boolean
    error?: string
    warning?: string
    itemRendererComponent?: Component<{ option: ExtendedOption }>
    selectedItemRendererComponent?: Component<{ items: Array<ExtendedOption>; placeholder: string }>
    showSelectedOptionLabel?: boolean
    onCreateNew?: () => void
    fetchFunction?: MultiselectFetchFunction
    validateAddItem?: (value: string) => boolean
    onChange?: (value: Array<ExtendedOption>) => void
    class?: string
  }

  let {
    options = $bindable([]),
    placeholder = 'Search Placeholder',
    multiselection = true,
    multiselectionColored = true,
    allowCreate = false,
    allowClear = false,
    allowNewRecord = false,
    value = $bindable([]),
    triggerAutoWidth = false,
    width = 'w-[200px]',
    contentWidth = width,
    align = 'end',
    addItemText = 'Add Item',
    addItemInvalidText = 'Cannot Add Item',
    emptyText = 'No Results Found',
    newRecordText = 'Create New Placeholder',
    shouldFilter = true,
    disabled = false,
    error = undefined,
    warning = undefined,
    itemRendererComponent = undefined,
    selectedItemRendererComponent = undefined,
    showSelectedOptionLabel = true,
    onCreateNew = () => {},
    fetchFunction = undefined,
    validateAddItem = () => true,
    onChange = () => {},
    class: className = '',
  }: Props = $props()

  let open = $state(false)
  let inputValue = $state('')
  // Timer is NOT reactive - we don't want effects to re-run when it changes
  let timer: NodeJS.Timeout | undefined = undefined
  let fetching = $state(false)
  let triggerRef: HTMLButtonElement | null = $state(null)

  const TIME_THRESHOLD = 300

  // Derived values - use value directly, no internal copy needed
  const selectedValues = $derived(value.map((item) => item.value))
  const availableOptions = $derived(
    shouldFilter ? options.filter((option) => !selectedValues.includes(option.value)) : options
  )
  const filteredResults = $derived(
    shouldFilter
      ? availableOptions.filter((option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
      : availableOptions
  )
  const hasPerfectMatch = $derived(
    !!filteredResults.find((option) => option.label?.toLowerCase() === inputValue?.toLowerCase())
  )
  const validInput = $derived(inputValue?.length && validateAddItem(inputValue))
  const classes = $derived(
    joinClassnames(
      className,
      width,
      getUserMessagingClasses(error, warning),
      triggerAutoWidth ? '!w-full' : ''
    )
  )

  // Fetch options when popover opens
  $effect(() => {
    if (open) {
      fetchOptions()
    }
  })

  // Debounced search when not filtering locally
  // Only track shouldFilter and inputValue, not the timer manipulation
  $effect(() => {
    if (!shouldFilter && inputValue !== undefined) {
      untrack(() => {
        if (timer) clearTimeout(timer)
      })
      timer = setTimeout(() => fetchOptions(inputValue), TIME_THRESHOLD)
    }
  })

  function closeAndFocusTrigger() {
    open = false
    tick().then(() => {
      triggerRef?.focus()
    })
  }

  function onCreateNewRecord() {
    onCreateNew()
    closeAndFocusTrigger()
  }

  function addItem(nextValue: ExtendedOption) {
    if (value.find((option) => option.value === nextValue.value)) return

    value = [...value, nextValue]
    onChange(value)
  }

  function setItem(nextValue: ExtendedOption) {
    value = [nextValue]
    onChange(value)
  }

  function removeItem(nextValue: ExtendedOption, event: MouseEvent) {
    event.stopPropagation()
    event.preventDefault()
    value = value.filter((item) => item.value !== nextValue.value)
    onChange(value)
  }

  function onClear() {
    value = []
    onChange(value)
    closeAndFocusTrigger()
  }

  async function onItemSelect(nextValue: string, isCreateAction: boolean = false) {
    const option = isCreateAction
      ? { label: nextValue, value: nextValue }
      : options.find((opt) => opt.value === nextValue)
    if (!validateAddItem(nextValue)) return
    if (!option) return

    if (multiselection) addItem(option)
    else setItem(option)

    await tick()
    inputValue = ''

    if (!multiselection) closeAndFocusTrigger()
  }

  async function fetchOptions(search?: string) {
    if (!fetchFunction) return

    fetching = true
    options = await fetchFunction(
      createQueryRequestObject({
        limit: 100,
        search,
      })
    )
    fetching = false
  }
</script>

{#if browser}
  <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
      {#snippet child({ props })}
        <Button
          {disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={placeholder}
          {...props}
          class="h-auto min-h-9 justify-between py-1.5 {classes}"
        >
          {#if selectedItemRendererComponent}
            <svelte:component
              this={selectedItemRendererComponent}
              items={value}
              {placeholder}
            />
          {:else if multiselection}
            <DefaultMultiRenderer
              items={value}
              colored={multiselectionColored}
              {removeItem}
              {placeholder}
            />
          {:else}
            <DefaultSingleRenderer items={value} {removeItem} {placeholder} />
          {/if}
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      {/snippet}
    </Popover.Trigger>

    <Popover.Content class="{contentWidth} relative p-0" {align}>
      <Command.Root shouldFilter={false}>
        <Command.Input {placeholder} bind:value={inputValue} />

        {#if allowClear && value.length && inputValue?.trim().length === 0}
          <Command.Group>
            <Command.Item
              class="aria-selected:bg-destructive/20 flex-col items-start"
              onSelect={() => onClear()}
            >
              <div class="flex items-center justify-start">
                <X class="{IconSize.Small} mr-2" />
                Rimuovi selezione
              </div>

              {#if showSelectedOptionLabel}
                <div
                  class="text-muted-foreground text-sm"
                  class:text-xs={(value?.[0]?.label || '').length > 30}
                >
                  {value?.[0]?.label || ''}
                </div>
              {/if}
            </Command.Item>
          </Command.Group>
        {/if}

        {#if allowNewRecord && inputValue?.trim().length === 0}
          <Command.Group>
            <Command.Item
              class="aria-selected:bg-info/30 flex-col items-start"
              onSelect={() => onCreateNewRecord()}
            >
              <div class="flex items-center justify-start">
                <Plus class="{IconSize.Small} mr-2" />
                {newRecordText}
              </div>
            </Command.Item>
          </Command.Group>
          <Command.Separator />
        {/if}

        {#if filteredResults.length === 0 && fetching}
          <Command.Group class="max-h-64 overflow-y-auto">
            <div class="flex animate-pulse flex-col gap-1">
              <div class="bg-muted h-8 rounded-md"></div>
              <div class="bg-muted h-8 w-3/4 rounded-md"></div>
              <div class="bg-muted h-8 w-2/4 rounded-md"></div>
              <div class="bg-muted h-8 rounded-md"></div>
              <div class="bg-muted h-8 w-3/4 rounded-md"></div>
              <div class="bg-muted h-8 rounded-md"></div>
              <div class="bg-muted h-8 w-3/4 rounded-md"></div>
              <div class="bg-muted h-8 w-2/4 rounded-md"></div>
            </div>
          </Command.Group>
        {:else}
          <Command.Empty>
            <div class="px-2">{emptyText}</div>
          </Command.Empty>
        {/if}

        <Command.Group class="max-h-64 overflow-y-auto">
          {#each filteredResults as option}
            <Command.Item value={option.value} onSelect={() => onItemSelect(option.value)}>
              {#if itemRendererComponent}
                <svelte:component this={itemRendererComponent} {option} />
              {:else}
                <Check
                  class={cn(
                    'mr-2 h-4 w-4',
                    option.value !== value[0]?.value && 'text-transparent'
                  )}
                />
                {option.label}
              {/if}
            </Command.Item>
          {/each}
        </Command.Group>

        {#if allowCreate && !hasPerfectMatch && inputValue?.trim().length > 0}
          <Command.Group
            heading={validInput ? addItemText : addItemInvalidText}
            class={validInput ? '' : '[&_[data-cmdk-group-heading]]:text-destructive'}
          >
            <Command.Item
              value={inputValue}
              aria-invalid={!validInput}
              class={validInput ? '' : 'bg-destructive/20 text-destructive'}
              onSelect={() => onItemSelect(inputValue, true)}
            >
              {#if validInput}
                <Plus class="{IconSize.Small} mr-2" />
              {:else}
                <X class="{IconSize.Small} mr-2" />
              {/if}
              {inputValue}
            </Command.Item>
          </Command.Group>
        {/if}
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
{:else}
  <div class="flex">
    <div class="mt-1 h-9 {width} flex-wrap rounded-md bg-secondary"></div>
  </div>
{/if}
