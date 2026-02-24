<!--
  @component GenericFilters
  @description A search filter component that provides filter state to sibling components.
  Positioned on the right side with a search input field.
  Provides filter state consumable by SalesOrdersTable or SupplyOrdersTable.
  @keywords filter, search, orders, common
  @uses Input
  @provides filters
-->
<script lang="ts" module>
  export { GenericFiltersContract as contract } from './GenericFilters.contract.js'
</script>

<script lang="ts">
  import { Input } from '$lib/components/ui/input'
  import { useProvides } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { SnippetProps } from '$utils/runtime.js'
  import { Search } from '@lucide/svelte'
  import type { Snippet } from 'svelte'
  import { GenericFiltersContract } from './GenericFilters.contract.js'

  const { children }: SnippetProps & { children?: Snippet } = $props()

  // Get handle to provide filter state
  const filtersHandle = useProvides(GenericFiltersContract, 'filters')

  // Local state for the search input
  let searchValue = $state('')

  // Debounce timeout reference
  let debounceTimeout: ReturnType<typeof setTimeout> | undefined

  // Update the shared state with debouncing
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    searchValue = target.value

    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    // Debounce the state update
    debounceTimeout = setTimeout(() => {
      filtersHandle.set({
        search: searchValue || undefined,
        query: undefined,
      })
    }, 300)
  }

  // Initialize state on mount
  $effect(() => {
    // Set initial empty state
    filtersHandle.set({
      search: undefined,
      query: undefined,
    })

    // Cleanup on unmount
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  })
</script>

<div class="flex w-full items-center justify-end gap-4">
  <div class="relative w-64">
    <Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input type="search" placeholder={m.common_search()} value={searchValue} oninput={handleInput} class="pl-9" />
  </div>

  {@render children?.()}
</div>
