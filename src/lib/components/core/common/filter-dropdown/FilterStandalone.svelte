<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import type { FilterConfigEntry } from '$lib/utils/filters'
  import { isFilterActive, type FilterInternalState } from '$lib/utils/filters'
  import type { DateValue } from '@internationalized/date'
  import CircleIcon from '@lucide/svelte/icons/circle'
  import FilterDate from './FilterDate.svelte'
  import FilterEnum from './FilterEnum.svelte'
  import FilterTags from './FilterTags.svelte'

  interface Props {
    filterKey: string
    entry: FilterConfigEntry
    state: FilterInternalState
    onchange: (key: string, value: string | string[] | DateValue | undefined) => void
  }

  const { filterKey, entry, state, onchange }: Props = $props()

  const active = $derived(isFilterActive(state, filterKey))
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" class="gap-2">
        {entry.label}
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
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
