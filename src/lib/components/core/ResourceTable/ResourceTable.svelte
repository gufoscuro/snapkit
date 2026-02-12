<script lang="ts" generics="T extends Record<string, any>">
	import { DataTable } from '$lib/components/core/DataTable'
	import { useConsumes } from '$lib/contexts/page-state/bindings.svelte'
	import { DEFAULT_ITEMS_LIMIT, type FilterQuery } from '$lib/utils/filters'
	import { resolveColumns } from './utils/column-resolver'
	import type { ResourceTableProps } from './types'

	let {
		fetchFunction,
		columns,
		filtersContract,
		class: className,
		emptyState,
		loadMoreLabel,
		stickyHeader = true
	}: ResourceTableProps<T> = $props()

	// --- State Management ---
	let data = $state<T[]>([])
	let loading = $state(true)
	let loadingMore = $state(false)
	let hasMore = $state(true)

	// --- Filter Integration (optional) ---
	// Note: Binding name is fixed to 'filters' for now
	const filtersHandle = filtersContract ? useConsumes(filtersContract, 'filters') : null
	const filters = $derived(filtersHandle?.get() as FilterQuery | undefined)

	// --- Fetch Logic ---
	async function loadInitial() {
		loading = true
		try {
			const items = await fetchFunction(0, filters)
			data = items
			hasMore = items.length >= DEFAULT_ITEMS_LIMIT
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
			const items = await fetchFunction(data.length, filters)
			data = [...data, ...items]
			hasMore = items.length >= DEFAULT_ITEMS_LIMIT
		} catch (err) {
			console.error('ResourceTable: Failed to load more:', err)
		} finally {
			loadingMore = false
		}
	}

	// --- Action Helpers ---
	const actionHelpers = {
		removeRow: (id: string) => {
			data = data.filter((row) => (row as any).id !== id)
		},
		updateRow: (id: string, updates: Partial<T>) => {
			data = data.map((row) => ((row as any).id === id ? { ...row, ...updates } : row))
		},
		refresh: loadInitial
	}

	// --- Column Resolution ---
	// Converts ColumnConfig[] to ColumnDef[] (TanStack Table format)
	const resolvedColumns = $derived(resolveColumns(columns, actionHelpers))

	// --- Reactive Reload on Filter Change ---
	$effect(() => {
		const _ = filters // Create dependency
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
	class={className}
/>
