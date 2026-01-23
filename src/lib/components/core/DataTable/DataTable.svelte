<!--
  @component DataTable
  @description Generic data table component with TanStack Table, supporting load more,
  custom cell renderers via snippets/components, skeleton loading, and i18n empty states.
  @keywords table, data, grid, list, pagination, load-more, tanstack
  @uses Table, Button, Skeleton, TanStack Table
-->
<script lang="ts" generics="T">
  import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core'
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table'
  import * as Table from '$lib/components/ui/table'
  import { Button } from '$lib/components/ui/button'
  import * as m from '$lib/paraglide/messages.js'
  import type { Snippet } from 'svelte'
  import DataTableSkeleton from './DataTableSkeleton.svelte'
  import LoaderCircle from '@lucide/svelte/icons/loader-circle'

  type DataTableProps = {
    /** Array of data items to display */
    data: T[]
    /** TanStack Table column definitions */
    columns: ColumnDef<T, unknown>[]
    /** Whether more data is available to load */
    hasMore?: boolean
    /** Whether currently loading more data */
    loadingMore?: boolean
    /** Callback when "Load More" button is clicked */
    onLoadMore?: () => void | Promise<void>
    /** Whether initial data is loading (shows skeleton) */
    loading?: boolean
    /** Custom empty state snippet (overrides default i18n message) */
    emptyState?: Snippet
    /** Custom label for load more button (overrides i18n default) */
    loadMoreLabel?: string
    /** Whether the header should stick to top when scrolling (default: true) */
    stickyHeader?: boolean
    /** Additional CSS classes for the container */
    class?: string
  }

  let {
    data,
    columns,
    hasMore = false,
    loadingMore = false,
    onLoadMore,
    loading = false,
    emptyState,
    loadMoreLabel,
    stickyHeader = true,
    class: className
  }: DataTableProps = $props()

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel()
  })
</script>

{#if loading}
  <DataTableSkeleton columns={columns.length} class={className} />
{:else}
  <div class="space-y-4">
    <div class="data-table-wrapper border {className}">
      <Table.Root>
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row>
              {#each headerGroup.headers as header (header.id)}
                <Table.Head colspan={header.colSpan} class={stickyHeader ? 'sticky top-0 z-10 bg-background border-b border-border' : ''}>
                  {#if !header.isPlaceholder}
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  {/if}
                </Table.Head>
              {/each}
            </Table.Row>
          {/each}
        </Table.Header>
        <Table.Body>
          {#each table.getRowModel().rows as row (row.id)}
            <Table.Row>
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell>
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="h-24 text-center">
                {#if emptyState}
                  {@render emptyState()}
                {:else}
                  <span class="text-muted-foreground">{m.datatable_no_data()}</span>
                {/if}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>

    {#if hasMore && onLoadMore}
      <div class="flex justify-center">
        <Button
          variant="outline"
          onclick={onLoadMore}
          disabled={loadingMore}
        >
          {#if loadingMore}
            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
          {/if}
          {loadMoreLabel ?? m.datatable_load_more()}
        </Button>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Override table container to allow sticky header */
  .data-table-wrapper :global([data-slot="table-container"]) {
    overflow: visible;
  }
</style>
