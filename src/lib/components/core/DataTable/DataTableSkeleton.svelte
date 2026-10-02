<!--
  @component DataTableSkeleton
  @description Skeleton loading state for DataTable. Shows animated placeholder rows
  while data is being fetched.
  @keywords skeleton, loading, table, placeholder, animation
  @uses Skeleton, Table
-->
<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton'
  import * as Table from '$lib/components/ui/table'

  type DataTableSkeletonProps = {
    /** Number of columns to render */
    columns: number
    /** Number of skeleton rows to show */
    rows?: number
    /** Same as DataTable's `variant` */
    variant?: 'card' | 'plain'
    /** Additional CSS classes */
    class?: string
  }

  let { columns, rows = 5, variant = 'card', class: className }: DataTableSkeletonProps = $props()

  // Generate random widths for realistic look (50-90%)
  function getRandomWidth(): string {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }

  // Pre-generate widths for consistent rendering (using $derived to react to prop changes)
  const rowWidths = $derived(
    Array.from({ length: rows }, () => Array.from({ length: columns }, () => getRandomWidth())),
  )

  // Mirrors DataTable's own cell padding so the real rows don't shift once loaded.
  const cellPadding = $derived(variant === 'card' ? 'px-4' : '')
</script>

<div class="{variant === 'card' ? 'rounded-xl border bg-card shadow-card' : 'border-y'} {className}">
  <Table.Root>
    <Table.Header>
      <Table.Row>
        {#each Array(columns) as _, i (i)}
          <Table.Head class="h-10 {cellPadding}">
            <Skeleton class="h-4 w-24" />
          </Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each rowWidths as rowWidth, rowIndex (rowIndex)}
        <Table.Row>
          {#each rowWidth as width, colIndex (colIndex)}
            <Table.Cell class="h-10 {cellPadding}">
              <Skeleton class="h-4" style="width: {width};" />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
