<script lang="ts">
  import { browser } from '$app/environment'
  import { getFormContextOptional } from './form-context'
  import { SelectorFieldDefaults, type SelectorFieldProps } from './form'
  import FormFieldMessages from './FormFieldMessages.svelte'
  import FormFieldSkeleton from './FormFieldSkeleton.svelte'
  import * as Select from '$components/ui/select'
  import Label from '$components/ui/label/label.svelte'
  import { joinClassnames } from '$utils/classnames'
  import { getUserMessagingClasses } from '$utils/form'
  import type { BasicOption } from '$utils/generics'
  import { X } from 'lucide-svelte'

  type Props = SelectorFieldProps & {
    items?: Array<BasicOption>
    value?: string | null
    fetchOnOpen?: boolean
    fetchFunction?: () => Promise<Array<BasicOption>>
    onChange?: (value: string | null) => void
  }

  let {
    name,
    label = SelectorFieldDefaults.label,
    placeholder = SelectorFieldDefaults.placeholder,
    id = name,
    items = [],
    value: valueProp = $bindable<string | null>(null),
    error: errorProp = undefined,
    warning = undefined,
    errorPosition = SelectorFieldDefaults.errorPosition,
    warningPosition = SelectorFieldDefaults.warningPosition,
    showLabel = SelectorFieldDefaults.showLabel,
    showErrorMessage = SelectorFieldDefaults.showErrorMessage,
    allowClear = SelectorFieldDefaults.allowClear,
    disabled = SelectorFieldDefaults.disabled,
    width = SelectorFieldDefaults.width,
    contentWidth = SelectorFieldDefaults.contentWidth,
    align = SelectorFieldDefaults.align,
    fetchOnOpen = false,
    fetchFunction = undefined,
    onChange,
    class: className = '',
  }: Props = $props()

  // Autowire to form context
  const form = getFormContextOptional()

  // Internal state for items (fetched or from props)
  let internalItems = $state<Array<BasicOption>>([...items])
  let fetching = $state(false)

  // Single source of truth: form context OR bindable prop
  const value = $derived(form ? (form.values[name] as string | null) : valueProp)
  const error = $derived(errorProp ?? (form?.errors[name] as string | undefined))
  const locked = $derived(form?.locked ?? false)
  const isDisabled = $derived(disabled || locked)

  // Derive trigger content
  const selectedLabel = $derived(internalItems.find((item) => item.value === value)?.label ?? placeholder ?? label)

  const classes = $derived(
    joinClassnames(className, width, getUserMessagingClasses(error, warning))
  )

  // Sync items when prop changes
  $effect(() => {
    if (!fetchFunction) {
      internalItems = [...items]
    }
  })

  // Initial fetch if not fetchOnOpen
  $effect(() => {
    if (browser && fetchFunction && !fetchOnOpen) {
      fetchItems()
    }
  })

  async function fetchItems() {
    if (!fetchFunction) return

    fetching = true
    try {
      internalItems = await fetchFunction()
    } finally {
      fetching = false
    }
  }

  function handleOpenChange(open: boolean) {
    if (open && fetchOnOpen && fetchFunction) {
      fetchItems()
    }
  }

  function handleValueChange(newValue: string) {
    if (form) {
      form.updateField(name, newValue)
      form.touchField(name)
    } else {
      valueProp = newValue
    }
    onChange?.(newValue)
  }

  function handleClear(e: MouseEvent) {
    e.stopPropagation()
    if (form) {
      form.updateField(name, null)
      form.touchField(name)
    } else {
      valueProp = null
    }
    onChange?.(null)
  }
</script>

{#if browser && !fetching}
  <div>
    <Label for={name} id="label-{id}" class={showLabel ? '' : 'sr-only'}>{label}</Label>
    <FormFieldMessages {id} {error} {warning} {showErrorMessage} {errorPosition} {warningPosition}>
      {#snippet children({ aria })}
        <Select.Root
          type="single"
          name={name}
          value={value ?? undefined}
          disabled={isDisabled}
          onValueChange={handleValueChange}
          onOpenChange={handleOpenChange}
        >
          <div class="relative">
            <Select.Trigger
              {id}
              class="{classes} {allowClear && value ? 'pr-8' : ''}"
              {...aria}
            >
              <span class="truncate">{selectedLabel}</span>
            </Select.Trigger>

            {#if allowClear && value}
              <button
                type="button"
                class="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onclick={handleClear}
              >
                <X class="h-3.5 w-3.5" />
              </button>
            {/if}
          </div>

          <Select.Content class={contentWidth} {align}>
            {#each internalItems as item (item.value)}
              <Select.Item value={item.value} label={item.label}>
                {item.label}
              </Select.Item>
            {:else}
              <div class="px-2 py-1.5 text-sm text-muted-foreground">No options</div>
            {/each}
          </Select.Content>
        </Select.Root>
      {/snippet}
    </FormFieldMessages>
  </div>
{:else}
  <FormFieldSkeleton {showLabel} {width} />
{/if}
