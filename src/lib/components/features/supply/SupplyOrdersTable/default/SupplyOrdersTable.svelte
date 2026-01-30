<!--
  @component SupplyOrdersTable
  @description Displays a paginated table of supply orders with load more functionality.
  Shows order name, supplier, status, expected delivery, and total.
  Consumes filter state from page context to filter displayed data.
  @keywords supply, orders, table, list, pagination, load-more, filters
  @uses DataTable, Badge
  @api GET /order (supply-api) -> orderSummary[]
  @route: order-detail
-->
<script lang="ts" module>
  export { SupplyOrdersTableContract as contract } from './SupplyOrdersTable.contract.js'
</script>

<script lang="ts">
  import { DataTable } from '$lib/components/core/DataTable'
  import { Badge } from '$lib/components/ui/badge'
  import { renderComponent, renderSnippet } from '$lib/components/ui/data-table'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { SupplyOrderSummary } from '$lib/types/api-types'
  import { getSupplyStatusLabel, getSupplyStatusVariant } from '$lib/utils/enum-labels'
  import { createQueryRequestObject, DEFAULT_ITEMS_LIMIT, type FilterQuery } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import { createRoute } from '$utils/route-builder.js'
  import type { ColumnDef } from '@tanstack/table-core'
  import { createRawSnippet } from 'svelte'
  import { SupplyOrdersTableContract } from './SupplyOrdersTable.contract.js'

  // Get filter state from page context
  const filtersHandle = useConsumes(SupplyOrdersTableContract, 'filters')

  // Derive current filters (reactive)
  const filters = $derived(filtersHandle.get())

  // Column definitions
  const columns: ColumnDef<SupplyOrderSummary>[] = $derived([
    {
      accessorKey: 'internal_id',
      header: m.id(),
      cell: ({ row }) => {
        const displayId = row.original.internal_id ?? row.original.id ?? '-'
        const orderId = row.original.id

        if (!orderId || displayId === '-') {
          return displayId
        }

        const url = createRoute({ $id: 'order-details', params: { uuid: orderId } })
        const snippet = createRawSnippet(() => ({
          render: () => `<a href="${url}" class="text-primary hover:underline">${displayId}</a>`,
        }))
        return renderSnippet(snippet)
      },
    },
    {
      accessorKey: 'supplier_attr',
      header: m.supplier(),
      cell: ({ row }) => row.original.supplier_attr?.name ?? '-',
    },
    {
      accessorKey: 'status',
      header: m.status(),
      cell: ({ row }) => {
        const status = row.original.status
        const variant = getSupplyStatusVariant(status)
        const label = getSupplyStatusLabel(status)
        const children = createRawSnippet(() => ({
          render: () => `<span>${label}</span>`,
        }))
        return renderComponent(Badge, { variant, children })
      },
    },
    {
      accessorKey: 'expected_delivery_time',
      header: m.expected_delivery(),
      cell: ({ row }) => {
        const date = row.original.expected_delivery_time
        if (!date) return '-'
        return new Date(date).toLocaleDateString()
      },
    },
    {
      accessorKey: 'total_vat_incl',
      header: m.total(),
      cell: ({ row }) => {
        const currency = row.original.default_currency ?? 'EUR'
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
        })
        return formatter.format(row.original.total_vat_incl)
      },
    },
  ])

  // State
  let data = $state<SupplyOrderSummary[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let hasMore = $state(true)

  // Fetch function with filter support
  async function fetchOrders(offset: number = 0, filterParams?: FilterQuery): Promise<SupplyOrderSummary[]> {
    const response = await apiRequest<SupplyOrderSummary[]>({
      url: 'supply/order',
      queryParams: createQueryRequestObject({
        limit: DEFAULT_ITEMS_LIMIT,
        offset,
        search: filterParams?.search,
        query: filterParams?.query,
      }),
    })
    return response ?? []
  }

  // Initial load with current filters
  async function loadInitial() {
    loading = true
    try {
      const items = await fetchOrders(0, filters)
      data = items
      hasMore = items.length >= DEFAULT_ITEMS_LIMIT
    } catch (err) {
      console.error('Failed to load orders:', err)
      data = []
      hasMore = false
    } finally {
      loading = false
    }
  }

  // Load more handler
  async function handleLoadMore() {
    loadingMore = true
    try {
      const items = await fetchOrders(data.length, filters)
      data = [...data, ...items]
      hasMore = items.length >= DEFAULT_ITEMS_LIMIT
    } catch (err) {
      console.error('Failed to load more orders:', err)
    } finally {
      loadingMore = false
    }
  }

  // Load on mount and when filters change
  $effect(() => {
    // Access filters to create dependency
    const _ = filters
    loadInitial()
  })
</script>

<DataTable {data} {columns} {loading} {loadingMore} {hasMore} onLoadMore={handleLoadMore} class="mt-4" />
