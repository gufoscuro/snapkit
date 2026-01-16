<!--
  @component DemoTable
  @description POC component that consumes filter state and provides selection state
  @keywords poc, table, list, demo
  @consumes filters
  @provides selection
  @uses Table, Checkbox
-->
<script lang="ts" module>
  // Export contract for SnippetResolver to use
  export { DemoTableContract as contract } from './DemoTable.contract.js'
</script>

<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox'
  import * as Table from '$lib/components/ui/table'
  import { useConsumes, useProvides } from '$lib/contexts/page-state'
  import { DemoTableContract } from './DemoTable.contract.js'

  // Get typed handle for filters we consume
  const filtersHandle = useConsumes(DemoTableContract, 'filters')

  // Get typed handle for selection we provide
  const selectionHandle = useProvides(DemoTableContract, 'selection')

  // Initialize selection state
  selectionHandle.set({ rows: [] })

  // Mock data
  const allItems = [
    { id: '1', name: 'Order #001', status: 'pending' },
    { id: '2', name: 'Order #002', status: 'shipped' },
    { id: '3', name: 'Order #003', status: 'delivered' },
    { id: '4', name: 'Order #004', status: 'cancelled' },
    { id: '5', name: 'Order #005', status: 'pending' },
    { id: '6', name: 'Laptop Pro', status: 'shipped' },
    { id: '7', name: 'Wireless Mouse', status: 'delivered' },
    { id: '8', name: 'USB Cable', status: 'pending' },
  ]

  // Reactive filtered items based on consumed filters
  const filteredItems = $derived.by(() => {
    const filters = filtersHandle.get()

    if (!filters) return allItems

    return allItems.filter(item => {
      // Filter by search
      if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Filter by status
      if (filters.status.length > 0 && !filters.status.includes(item.status)) {
        return false
      }

      return true
    })
  })

  // Get current selection
  const selectedRows = $derived(selectionHandle.get()?.rows ?? [])

  // Computed states for header checkbox
  const allSelected = $derived(selectedRows.length === filteredItems.length && filteredItems.length > 0)
  const someSelected = $derived(selectedRows.length > 0 && selectedRows.length < filteredItems.length)

  function toggleSelection(id: string) {
    const current = selectionHandle.get()?.rows ?? []
    const newSelection = current.includes(id) ? current.filter(r => r !== id) : [...current, id]

    selectionHandle.set({ rows: newSelection })
  }

  function toggleAll() {
    const allIds = filteredItems.map(item => item.id)

    if (allSelected) {
      selectionHandle.set({ rows: [] })
    } else {
      selectionHandle.set({ rows: allIds })
    }
  }

  // Status badge variant mapping
  const statusVariants: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
</script>

<div class="rounded-md border">
  <div class="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
    <span class="text-sm font-medium">{filteredItems.length} items</span>
    {#if selectedRows.length > 0}
      <span class="text-sm text-primary">({selectedRows.length} selected)</span>
    {/if}
  </div>

  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head class="w-10">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={toggleAll}
            aria-label="Select all" />
        </Table.Head>
        <Table.Head>Name</Table.Head>
        <Table.Head>Status</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each filteredItems as item (item.id)}
        {@const isSelected = selectedRows.includes(item.id)}
        <Table.Row data-state={isSelected ? 'selected' : undefined}>
          <Table.Cell>
            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(item.id)} aria-label="Select row" />
          </Table.Cell>
          <Table.Cell class="font-medium">{item.name}</Table.Cell>
          <Table.Cell>
            <span
              class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium uppercase {statusVariants[
                item.status
              ]}">
              {item.status}
            </span>
          </Table.Cell>
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={3} class="h-24 text-center text-muted-foreground">
            No items match your filters
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
