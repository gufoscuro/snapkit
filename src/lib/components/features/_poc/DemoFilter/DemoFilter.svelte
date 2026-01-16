<!--
  @component DemoFilter
  @description POC component that provides filter state (search + status)
  @keywords poc, filter, search, demo
  @provides filters
  @uses Input, Label, ToggleGroup
-->
<script lang="ts" module>
  // Export contract for SnippetResolver to use
  export { DemoFilterContract as contract } from './DemoFilter.contract.js'
</script>

<script lang="ts">
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import * as ToggleGroup from '$lib/components/ui/toggle-group'
  import { useProvides } from '$lib/contexts/page-state'
  import { DemoFilterContract } from './DemoFilter.contract.js'

  // Get typed handle for the filters we provide
  const filtersHandle = useProvides(DemoFilterContract, 'filters')

  // Local state for the form
  let searchValue = $state('')
  let selectedStatuses = $state<string[]>([])

  const availableStatuses = ['pending', 'shipped', 'delivered', 'cancelled']

  // Update the shared state whenever local state changes
  $effect(() => {
    filtersHandle.set({
      search: searchValue,
      status: selectedStatuses,
    })
  })
</script>

<div class="sticky top-0 z-10 flex h-14 w-full items-center justify-between gap-4 bg-background">
  <div class="flex items-center gap-3">
    <Label for="search" class="min-w-14">Search:</Label>
    <Input id="search" type="text" bind:value={searchValue} placeholder="Search..." class="max-w-xs" />
  </div>

  <div class="flex items-center gap-3">
    <span class="min-w-14 text-sm font-medium">Status:</span>
    <ToggleGroup.Root type="multiple" bind:value={selectedStatuses} variant="outline" size="sm">
      {#each availableStatuses as status (status)}
        <ToggleGroup.Item value={status} class="capitalize">
          {status}
        </ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
  </div>
</div>
