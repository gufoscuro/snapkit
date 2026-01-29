<!--
  @component SalesOrdersTable
  @description Displays a paginated table of sales orders with load more functionality.
  Shows order ID, customer, status, expected shipping time, and total.
  Consumes filter state from page context to filter displayed data.
  @keywords sales, orders, table, list, pagination, load-more, filters
  @uses DataTable, Badge
  @api GET /order (sales-api) -> orderSummary[]
-->
<script lang="ts" module>
  export { SalesOrdersTableContract as contract } from './SalesOrdersTable.contract.js'
</script>

<script lang="ts">
  import { DataTable } from '$lib/components/core/DataTable'
  import { Badge } from '$lib/components/ui/badge'
  import { renderComponent, renderSnippet } from '$lib/components/ui/data-table'
  import { useConsumes } from '$lib/contexts/page-state'
  import * as m from '$lib/paraglide/messages.js'
  import type { SalesOrderSummary } from '$lib/types/api-types'
  import {
    getSalesShippedLabel,
    getSalesShippedVariant,
    getSalesStatusLabel,
    getSalesStatusVariant,
  } from '$lib/utils/enum-labels'
  import { createQueryRequestObject, DEFAULT_ITEMS_LIMIT, type FilterQuery } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import type { ColumnDef } from '@tanstack/table-core'
  import { createRawSnippet } from 'svelte'
  import { SalesOrdersTableContract } from './SalesOrdersTable.contract.js'

  // Get filter state from page context
  const filtersHandle = useConsumes(SalesOrdersTableContract, 'filters')

  // Derive current filters (reactive)
  const filters = $derived(filtersHandle.get())

  // Column definitions
  const columns: ColumnDef<SalesOrderSummary>[] = $derived([
    {
      accessorKey: 'internal_id',
      header: m.id(),
      cell: ({ row }) => {
        const displayId = row.original.internal_id ?? row.original.id ?? '-'
        const orderId = row.original.id

        if (!orderId || displayId === '-') {
          return displayId
        }

        // const url = createRoute({ $id: 'sales-order-detail', params: { uuid: orderId } })
        // const snippet = createRawSnippet(() => ({
        //   render: () => `<a href="${url}" class="text-primary hover:underline">${displayId}</a>`,
        // }))
        const snippet = createRawSnippet(() => ({
          render: () => `<span>${displayId}</span>`,
        }))
        return renderSnippet(snippet)
      },
    },
    {
      accessorKey: 'customer_attr',
      header: m.customer(),
      cell: ({ row }) => row.original.customer_attr?.name ?? '-',
    },
    {
      accessorKey: 'sales_channel_attr',
      header: m.sales_channel(),
      cell: ({ row }) => row.original.sales_channel_attr?.name ?? '-',
    },
    {
      accessorKey: 'status',
      header: m.status(),
      cell: ({ row }) => {
        const status = row.original.status
        const variant = getSalesStatusVariant(status)
        const label = getSalesStatusLabel(status)
        const children = createRawSnippet(() => ({
          render: () => `<span>${label}</span>`,
        }))
        return renderComponent(Badge, { variant, children })
      },
    },
    {
      accessorKey: 'shipped',
      header: m.shipping(),
      cell: ({ row }) => {
        const shipped = row.original.shipped
        if (!shipped) return '-'
        const variant = getSalesShippedVariant(shipped)
        const label = getSalesShippedLabel(shipped)
        const children = createRawSnippet(() => ({
          render: () => `<span>${label}</span>`,
        }))
        return renderComponent(Badge, { variant, children })
      },
    },
    {
      accessorKey: 'expected_shipping_time',
      header: m.expected_shipping(),
      cell: ({ row }) => {
        const date = row.original.expected_shipping_time
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
  let data = $state<SalesOrderSummary[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let hasMore = $state(true)

  // Fetch function with filter support
  async function fetchOrders(offset: number = 0, filterParams?: FilterQuery): Promise<SalesOrderSummary[]> {
    const response = await apiRequest<SalesOrderSummary[]>({
      url: 'sales/order',
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
