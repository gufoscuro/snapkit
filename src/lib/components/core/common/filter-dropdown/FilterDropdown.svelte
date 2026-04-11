<script lang="ts">
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as m from '$lib/paraglide/messages'
  import {
    countActiveFilters,
    deserializeFilters,
    type FilterConfig,
    type FilterInternalState,
    serializeFilters,
    type QueryObject,
  } from '$lib/utils/filters'
  import type { DateValue } from '@internationalized/date'
  import ListFilterIcon from '@lucide/svelte/icons/list-filter'
  import { untrack } from 'svelte'
  import FilterDate from './FilterDate.svelte'
  import FilterEnum from './FilterEnum.svelte'
  import FilterStandalone from './FilterStandalone.svelte'
  import FilterTags from './FilterTags.svelte'

  interface Props {
    config: FilterConfig
    query: QueryObject | undefined
    onchange: (query: QueryObject | undefined) => void
  }

  const { config, query, onchange }: Props = $props()

  let internalState = $state<FilterInternalState>(
    untrack(() => deserializeFilters(config, query ?? {})),
  )

  const groupedFilters = $derived.by(() => {
    return Object.fromEntries(Object.entries(config).filter(([, e]) => !e.standalone))
  })

  const standaloneFilters = $derived.by(() => {
    return Object.fromEntries(Object.entries(config).filter(([, e]) => e.standalone))
  })

  const activeGroupedCount = $derived(countActiveFilters(groupedFilters, internalState))

  function updateFilter(key: string, value: string | string[] | DateValue | undefined) {
    internalState = { ...internalState, [key]: value }
  }

  function clearAll() {
    internalState = {}
  }

  $effect(() => {
    const serialized = serializeFilters(config, internalState)
    const hasAny = Object.keys(serialized).length > 0
    untrack(() => onchange(hasAny ? serialized : undefined))
  })
</script>

<div class="flex items-center gap-1">
  {#if Object.keys(groupedFilters).length > 0}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline" class="gap-2">
            <ListFilterIcon class="size-4" />
            {m.filters_label()}
            {#if activeGroupedCount > 0}
              <Badge variant="secondary">{activeGroupedCount}</Badge>
            {/if}
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" class="min-w-44">
        <DropdownMenu.Label class="pb-3 text-sm font-semibold">
          {m.filter_by()}
        </DropdownMenu.Label>

        <DropdownMenu.Item disabled={activeGroupedCount === 0} onclick={clearAll} class="text-xs">
          {m.filters_remove_all()}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />

        {#each Object.entries(groupedFilters) as [key, entry] (key)}
          {#if entry.type === 'enum'}
            <FilterEnum {entry} value={internalState[key] as string | undefined} onchange={v => updateFilter(key, v)} />
          {:else if entry.type === 'tags'}
            <FilterTags {entry} value={(internalState[key] as string[]) ?? []} onchange={v => updateFilter(key, v)} />
          {:else if entry.type === 'date'}
            <FilterDate
              {entry}
              value={internalState[key] as DateValue | undefined}
              onchange={v => updateFilter(key, v)} />
          {/if}
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {/if}

  {#each Object.entries(standaloneFilters) as [key, entry] (key)}
    <FilterStandalone filterKey={key} {entry} state={internalState} onchange={updateFilter} />
  {/each}
</div>
