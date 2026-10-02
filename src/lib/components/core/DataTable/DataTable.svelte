<!--
  @component DataTable
  @description Generic data table component with TanStack Table, supporting load more,
  custom cell renderers via snippets/components, skeleton loading, i18n empty states and
  optional row grouping under full-width group header rows. `card` / `plain` variants
  control whether the table frames itself as a standalone surface.
  @keywords table, data, grid, list, pagination, load-more, tanstack, group, grouping, card, variant
  @uses Table, Button, Skeleton, TanStack Table
-->
<script lang="ts" generics="T">
  import { Button } from '$lib/components/ui/button'
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table'
  import * as Table from '$lib/components/ui/table'
  import * as m from '$lib/paraglide/messages.js'
  import { formatNumber } from '$lib/utils/numbers'
  import LoaderCircle from '@lucide/svelte/icons/loader-circle'
  import { type ColumnDef, getCoreRowModel } from '@tanstack/table-core'
  import type { Snippet } from 'svelte'
  import DataTableSkeleton from './DataTableSkeleton.svelte'

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
    /**
     * How many rows the source still holds beyond the ones loaded, shown next to the
     * "load more" label. A plain number on purpose: this component knows nothing about
     * how pagination is shaped, only how to render the count. Omit it (or pass 0) and
     * the button renders exactly as it did before.
     */
    remaining?: number
    /** Whether the header should stick to top when scrolling (default: true) */
    stickyHeader?: boolean
    /**
     * Groups consecutive rows sharing this key under a full-width header row.
     * Rows are reordered so that same-key rows become contiguous: groups follow the
     * order of their FIRST occurrence in `data`, and rows keep their original order
     * within a group. This preserves whatever ordering the API applied (e.g. by due
     * date) while making the grouping readable, without requiring server-side sorting.
     */
    getGroupKey?: (row: T) => string
    /** Content of the full-width group header row. Receives every loaded row of the group. */
    groupHeader?: Snippet<[T[]]>
    /**
     * `card` frames the table as a standalone surface; `plain` keeps only top and bottom
     * rules, for tables that already sit inside a card, sheet or panel.
     */
    variant?: 'card' | 'plain'
    /** Additional CSS classes for the container */
    class?: string
    /**
     * Extra classes for a single body row, derived from its item.
     *
     * Column `meta.cellClassName` styles one cell across every row; this styles
     * every cell of one row. Needed whenever a row's *state* — not its content —
     * changes how it reads, such as dimming a record another one overrides.
     */
    rowClassName?: (item: T) => string
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
    remaining,
    stickyHeader = true,
    getGroupKey,
    groupHeader,
    variant = 'card',
    class: className,
    rowClassName,
  }: DataTableProps = $props()

  // Map insertion order == first-occurrence order, so groups keep the API's ordering.
  const groups = $derived.by(() => {
    if (!getGroupKey) return null
    // Plain Map, not SvelteMap: it is rebuilt from scratch on every `data` change and
    // never mutated afterwards, so reactivity already comes from this $derived.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const map = new Map<string, T[]>()
    for (const row of data) {
      const key = getGroupKey(row)
      const existing = map.get(key)
      if (existing) existing.push(row)
      else map.set(key, [row])
    }
    return map
  })

  const orderedData = $derived(groups ? [...groups.values()].flat() : data)

  const table = createSvelteTable({
    get data() {
      return orderedData
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = $derived(table.getRowModel().rows)

  // A card keeps its own fill under the sticky header, so the header separates with an
  // inset rule rather than a border, which would otherwise break the rounded corners.
  const STICKY_HEADER_CLASSES = $derived(
    variant === 'card'
      ? 'sticky top-14 z-10 bg-card shadow-[inset_0_-1px_0_var(--border)]'
      : 'sticky top-14 z-10 border-b border-border bg-background',
  )
  const VARIANT_CLASSES = {
    card: {
      wrapper: 'rounded-xl border bg-card shadow-card',
      head: 'h-10 px-4 text-xs text-muted-foreground first:rounded-tl-xl last:rounded-tr-xl',
      body: '[&_tr:last-child>td:first-child]:rounded-bl-xl [&_tr:last-child>td:last-child]:rounded-br-xl',
      cell: 'px-4 py-2.5',
      // Keeps the group band's horizontal rhythm aligned with the data cells.
      groupCell: 'px-4 py-2.5',
    },
    plain: { wrapper: 'border-y', head: '', body: '', cell: '', groupCell: 'py-2' },
  }
  const styles = $derived(VARIANT_CLASSES[variant])

  // A count is worth showing only when it is a usable number: a backend that omits it,
  // or one that drifts negative because rows vanished between pages, gets no badge
  // rather than a wrong one.
  const remainingLabel = $derived(
    typeof remaining === 'number' && Number.isFinite(remaining) && remaining > 0
      ? m.datatable_load_more_remaining({ count: formatNumber(remaining, { decimals: 0 }) })
      : null,
  )
</script>

{#if loading}
  <DataTableSkeleton columns={columns.length} {variant} class={className} />
{:else}
  <div class="space-y-4">
    <div class="data-table-wrapper {styles.wrapper} {className}">
      <Table.Root>
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row>
              {#each headerGroup.headers as header (header.id)}
                <Table.Head
                  colspan={header.colSpan}
                  class="{styles.head} {stickyHeader ? STICKY_HEADER_CLASSES : ''} {header.column.columnDef.meta
                    ?.headerClassName || ''}">
                  {#if !header.isPlaceholder}
                    <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                  {/if}
                </Table.Head>
              {/each}
            </Table.Row>
          {/each}
        </Table.Header>
        <Table.Body class={styles.body}>
          {#each rows as row, index (row.id)}
            {#if getGroupKey && groups}
              {@const groupKey = getGroupKey(row.original)}
              {#if index === 0 || getGroupKey(rows[index - 1].original) !== groupKey}
                <Table.Row class="hover:bg-transparent">
                  <Table.Cell colspan={columns.length} class="{styles.groupCell} bg-muted/50">
                    {@render groupHeader?.(groups.get(groupKey) ?? [])}
                  </Table.Cell>
                </Table.Row>
              {/if}
            {/if}
            <Table.Row class={rowClassName?.(row.original) ?? ''}>
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell class="{styles.cell} {cell.column.columnDef.meta?.cellClassName || ''}">
                  <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
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
        <Button variant="outline" onclick={onLoadMore} disabled={loadingMore}>
          {#if loadingMore}
            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
          {/if}
          {loadMoreLabel ?? m.datatable_load_more()}
          {#if remainingLabel}
            <span class="text-muted-foreground">({remainingLabel})</span>
          {/if}
        </Button>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Override table container to allow sticky header */
  .data-table-wrapper :global([data-slot='table-container']) {
    overflow: visible;
  }
</style>
