<script lang="ts" generics="T extends Record<string, any>">
  import { DataTable } from '$lib/components/core/DataTable'
  import type { ResourceTableProps } from './types'
  import { resolveColumns } from './utils/column-resolver'

  let {
    fetchFunction,
    columns,
    filters,
    class: className,
    emptyState,
    loadMoreLabel,
    stickyHeader = true,
  }: ResourceTableProps<T> = $props()

  // --- State Management ---
  let data = $state<T[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let hasMore = $state(true)
  let currentPage = $state(1)

  // --- Fetch Logic ---
  async function loadInitial() {
    loading = true
    try {
      const response = await fetchFunction(1, filters)
      data = response.data
      currentPage = 1
      hasMore = !!response.links.next
    } catch (err) {
      console.error('ResourceTable: Failed to load data:', err)
      data = []
      hasMore = false
    } finally {
      loading = false
    }
  }

  async function handleLoadMore() {
    if (loadingMore) return

    loadingMore = true
    try {
      const response = await fetchFunction(currentPage + 1, filters)
      data = [...data, ...response.data]
      currentPage = response.meta.current_page
      hasMore = !!response.links.next
    } catch (err) {
      console.error('ResourceTable: Failed to load more:', err)
    } finally {
      loadingMore = false
    }
  }

  // --- Action Helpers ---
  const actionHelpers = {
    removeRow: (id: string) => {
      data = data.filter(row => (row as any).id !== id)
    },
    updateRow: (id: string, updates: Partial<T>) => {
      data = data.map(row => ((row as any).id === id ? { ...row, ...updates } : row))
    },
    refresh: loadInitial,
  }

  // --- Column Resolution ---
  // Converts ColumnConfig[] to ColumnDef[] (TanStack Table format)
  const resolvedColumns = $derived(resolveColumns(columns, actionHelpers))

  // --- Reactive Reload on Filter Change ---
  $effect(() => {
    const _ = filters // Create dependency on prop
    loadInitial()
  })
</script>

<DataTable
  {data}
  columns={resolvedColumns}
  {loading}
  {loadingMore}
  {hasMore}
  onLoadMore={handleLoadMore}
  {emptyState}
  {loadMoreLabel}
  {stickyHeader}
  class={className} />
