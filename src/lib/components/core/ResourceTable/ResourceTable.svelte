<script lang="ts" generics="T extends Record<string, any>">
  import { browser } from '$app/environment'
  import { DataTable } from '$lib/components/core/DataTable'
  import * as StorageUtil from '$lib/utils/storage'
  import type { ResourceTableProps } from './types'
  import { resolveColumns } from './utils/column-resolver'
  import { applyPreferences, type ColumnPreference } from './utils/column-preferences'
  import { renderComponent } from '$lib/components/ui/data-table/render-helpers'
  import ColumnCustomizer from './ColumnCustomizer.svelte'
  import ColumnSettingsHeader from './ColumnSettingsHeader.svelte'

  let {
    fetchFunction,
    columns,
    filters,
    class: className,
    emptyState,
    loadMoreLabel,
    stickyHeader = true,
    columnsStorageId,
  }: ResourceTableProps<T> = $props()

  // --- State Management ---
  let data = $state<T[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let hasMore = $state(true)
  let currentPage = $state(1)

  // --- Column Customization ---
  let columnPreferences = $state<ColumnPreference[] | null>(null)
  let customizerOpen = $state(false)

  // Load saved preferences on mount
  $effect(() => {
    if (browser && columnsStorageId) {
      columnPreferences = StorageUtil.getByUser<ColumnPreference[]>(`columns:${columnsStorageId}`)
    }
  })

  function handlePreferencesApply(preferences: ColumnPreference[] | null) {
    columnPreferences = preferences
  }

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
  const effectiveColumns = $derived(
    columnsStorageId ? applyPreferences(columns, columnPreferences) : columns
  )
  const resolvedColumns = $derived.by(() => {
    const resolved = resolveColumns(effectiveColumns, actionHelpers)
    // Inject settings icon into the last column header when customization is enabled
    if (columnsStorageId && resolved.length > 0) {
      const last = resolved[resolved.length - 1]
      const originalHeader = last.header
      resolved[resolved.length - 1] = {
        ...last,
        header: () => renderComponent(ColumnSettingsHeader, {
          originalHeader: typeof originalHeader === 'string' ? originalHeader : '',
          onclick: () => { customizerOpen = true },
        }),
      } as (typeof resolved)[number]
    }
    return resolved
  })

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

{#if columnsStorageId}
  <ColumnCustomizer
    {columns}
    storageId={columnsStorageId}
    open={customizerOpen}
    onApply={handlePreferencesApply}
    onOpenChange={(v) => { customizerOpen = v }} />
{/if}
