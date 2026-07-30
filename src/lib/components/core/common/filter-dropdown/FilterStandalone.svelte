<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import type { AmountFilterValue, FilterConfigEntry } from '$lib/utils/filters'
  import { isFilterActive, type FilterInternalState } from '$lib/utils/filters'
  import type { DateValue } from '@internationalized/date'
  import CircleIcon from '@lucide/svelte/icons/circle'
  import FilterAmount from './FilterAmount.svelte'
  import FilterCustomer from './FilterCustomer.svelte'
  import FilterDate from './FilterDate.svelte'
  import FilterEnum from './FilterEnum.svelte'
  import FilterTags from './FilterTags.svelte'

  interface Props {
    filterKey: string
    entry: FilterConfigEntry
    state: FilterInternalState
    onchange: (
      key: string,
      value: string | string[] | DateValue | AmountFilterValue | undefined,
    ) => void
  }

  const { filterKey, entry, state, onchange }: Props = $props()

  const active = $derived(isFilterActive(state, filterKey))

  // For an enum with known options, the trigger reads "Label: Selected" rather
  // than a bare "Label" plus a dot — on a filter that scopes what the whole page
  // is showing, the value matters more than the fact that something is set.
  // Falls back to `defaultValue` so a filter the consumer defaults to still
  // announces what you're looking at while formally unset. Only static options
  // can be resolved here; async ones keep the plain label.
  const selectedLabel = $derived.by(() => {
    if (entry.type !== 'enum' || !entry.options) return undefined
    const value = (state[filterKey] as string | undefined) ?? entry.defaultValue
    return entry.options.find(option => option.value === value)?.label
  })
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" class="gap-2">
        {#if selectedLabel}
          <span class="text-muted-foreground">{entry.label}:</span>
          <span>{selectedLabel}</span>
        {:else}
          {entry.label}
        {/if}
        {#if active}
          <CircleIcon class="size-2 fill-current" />
        {/if}
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="start" class={entry.type === 'date' ? 'p-0' : ''}>
    {#if entry.type === 'enum'}
      <FilterEnum
        {entry}
        value={state[filterKey] as string | undefined}
        onchange={v => onchange(filterKey, v)}
        standalone />
    {:else if entry.type === 'tags'}
      <FilterTags
        {entry}
        value={(state[filterKey] as string[]) ?? []}
        onchange={v => onchange(filterKey, v)}
        standalone />
    {:else if entry.type === 'date'}
      <FilterDate
        {entry}
        value={state[filterKey] as DateValue | undefined}
        onchange={v => onchange(filterKey, v)}
        standalone />
    {:else if entry.type === 'customer'}
      <FilterCustomer
        {entry}
        value={state[filterKey] as string | undefined}
        onchange={v => onchange(filterKey, v)}
        standalone />
    {:else if entry.type === 'amount'}
      <FilterAmount
        {entry}
        value={state[filterKey] as AmountFilterValue | undefined}
        onchange={v => onchange(filterKey, v)}
        standalone />
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
