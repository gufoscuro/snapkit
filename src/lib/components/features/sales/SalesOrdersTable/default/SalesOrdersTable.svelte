<!--
  @component SalesOrdersTable
  @description Displays a paginated table of sales orders with load more functionality.
  Shows order ID, customer, status, expected shipping time, and total.
  @keywords sales, orders, table, list, pagination, load-more
  @uses DataTable, Badge
  @api GET /order (sales-api) -> orderSummary[]
-->
<script lang="ts">
  import { DataTable } from '$lib/components/core/DataTable'
  import { Badge } from '$lib/components/ui/badge'
  import { renderComponent, renderSnippet } from '$lib/components/ui/data-table'
  import type { SalesOrderSummary } from '$lib/types/api-types'
  import { createQueryRequestObject, DEFAULT_ITEMS_LIMIT } from '$lib/utils/filters'
  import { apiRequest } from '$lib/utils/request'
  import { createRoute } from '$lib/utils/route-builder'
  import type { ColumnDef } from '@tanstack/table-core'
  import { createRawSnippet } from 'svelte'

  // Status badge variants
  const statusVariants: Record<SalesOrderSummary['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    sent: 'outline',
    accepted: 'default',
  }

  // Shipped status badge variants
  const shippedVariants: Record<NonNullable<SalesOrderSummary['shipped']>, 'default' | 'secondary' | 'outline'> = {
    completed: 'default',
    partial: 'outline',
    'not shipped': 'secondary',
  }

  // Column definitions
  const columns: ColumnDef<SalesOrderSummary>[] = [
    {
      accessorKey: 'internal_id',
      header: 'ID',
      cell: ({ row }) => {
        const displayId = row.original.internal_id ?? row.original.id ?? '-'
        const orderId = row.original.id

        if (!orderId || displayId === '-') {
          return displayId
        }

        const url = createRoute({ $id: 'sales-order-detail', params: { uuid: orderId } })
        const snippet = createRawSnippet(() => ({
          render: () => `<a href="${url}" class="text-primary hover:underline">${displayId}</a>`,
        }))
        return renderSnippet(snippet)
      },
    },
    {
      accessorKey: 'customer_attr',
      header: 'Customer',
      cell: ({ row }) => row.original.customer_attr?.name ?? '-',
    },
    {
      accessorKey: 'sales_channel_attr',
      header: 'Sales Channel',
      cell: ({ row }) => row.original.sales_channel_attr?.name ?? '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = statusVariants[status]
        const children = createRawSnippet(() => ({
          render: () => status,
        }))
        return renderComponent(Badge, { variant, children })
      },
    },
    {
      accessorKey: 'shipped',
      header: 'Shipping',
      cell: ({ row }) => {
        const shipped = row.original.shipped
        if (!shipped) return '-'
        const variant = shippedVariants[shipped]
        const children = createRawSnippet(() => ({
          render: () => shipped,
        }))
        return renderComponent(Badge, { variant, children })
      },
    },
    {
      accessorKey: 'expected_shipping_time',
      header: 'Expected Shipping',
      cell: ({ row }) => {
        const date = row.original.expected_shipping_time
        if (!date) return '-'
        return new Date(date).toLocaleDateString()
      },
    },
    {
      accessorKey: 'total_vat_incl',
      header: 'Total',
      cell: ({ row }) => {
        const currency = row.original.default_currency ?? 'EUR'
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
        })
        return formatter.format(row.original.total_vat_incl)
      },
    },
  ]

  // State
  let data = $state<SalesOrderSummary[]>([])
  let loading = $state(true)
  let loadingMore = $state(false)
  let hasMore = $state(true)

  // Fetch function
  async function fetchOrders(offset: number = 0): Promise<SalesOrderSummary[]> {
    const response = await apiRequest<SalesOrderSummary[]>({
      url: 'sales/order',
      queryParams: createQueryRequestObject({
        limit: DEFAULT_ITEMS_LIMIT,
        offset,
      }),
    })
    return response ?? []
  }

  // Initial load
  async function loadInitial() {
    loading = true
    try {
      const items = await fetchOrders(0)
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
      const items = await fetchOrders(data.length)
      data = [...data, ...items]
      hasMore = items.length >= DEFAULT_ITEMS_LIMIT
    } catch (err) {
      console.error('Failed to load more orders:', err)
    } finally {
      loadingMore = false
    }
  }

  // Load on mount
  $effect(() => {
    loadInitial()
  })
</script>

<DataTable {data} {columns} {loading} {loadingMore} {hasMore} onLoadMore={handleLoadMore} class="mt-4" />
